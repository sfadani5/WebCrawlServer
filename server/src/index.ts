import express from "express";
import { createServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  initializeDatabase,
  getAllClients,
  getCrawlLogs,
  clearAllCrawlLogs,
  purgeClient,
  insertCrawlLog,
} from "./database.js";
import { logServerSystem, logAdminActivity, logPluginComm } from "./logger.js";

export type ClientType = "plugin" | "admin";

export interface ClientSession {
  socket: WebSocket;
  clientId: string;
  clientType: ClientType;
  connectedAt: Date;
}

export interface WebSocketMessage<T = unknown> {
  senderId: string;
  targetId?: string | "ALL";
  action: string;
  payload: T;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicPath = resolve(__dirname, "..", "public");

const app = express();
const server = createServer(app);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "알 수 없는 오류";
}

app.use(express.json());
app.use(express.static(publicPath));

initializeDatabase();

export const activeClients = new Map<string, ClientSession>();

// [REST API 1] 등록된 모든 수집 클라이언트 장비 데이터 목록 및 실시간 온라인 상태 조회
app.get("/api/db/clients", (_req, res) => {
  try {
    const clients = getAllClients();
    // 실시간 인메모리 세션 맵과 대조하여 is_online 플래그 추가
    const clientsWithOnlineStatus = clients.map((c) => ({
      ...c,
      is_online:
        activeClients.has(c.client_id) &&
        activeClients.get(c.client_id)?.socket.readyState === WebSocket.OPEN,
    }));
    res.json({ success: true, data: clientsWithOnlineStatus });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logServerSystem("ERROR", `Clients API 에러 반환: ${errorMessage}`);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

// [REST API 2] 영구 적재된 수집 데이터 로그 조회 (최근 100개 한정)
app.get("/api/db/logs", (_req, res) => {
  try {
    const logs = getCrawlLogs(100, 0);
    res.json({ success: true, data: logs });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logServerSystem("ERROR", `Logs API 에러 반환: ${errorMessage}`);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

// [REST API 3] 데이터베이스 저장 로그 일괄 소거
app.delete("/api/db/logs", (_req, res) => {
  try {
    clearAllCrawlLogs();
    logAdminActivity(
      "SUPER_ADMIN",
      "DELETE_ALL_LOGS",
      "데이터베이스 전체 로그 소거 단행",
    );
    res.json({
      success: true,
      message: "데이터베이스의 모든 수집 로그가 일괄 소거되었습니다.",
    });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logServerSystem("ERROR", `Logs Delete API 에러 반환: ${errorMessage}`);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

// [REST API 4] 특정 기기를 블랙리스트 처리하여 영구 추방 및 관련 데이터 Cascade 강제 연쇄 삭제
app.delete("/api/db/clients/:clientId", (req, res) => {
  try {
    const targetId = req.params.clientId;
    purgeClient(targetId);
    logAdminActivity(
      "SUPER_ADMIN",
      "PURGE_CLIENT_SESSION",
      `클라이언트 영구 추방 격리: ${targetId}`,
    );
    res.json({
      success: true,
      message: "지정된 클라이언트 기기가 완전히 차단 제거되었습니다.",
    });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logServerSystem("ERROR", `Client Purge API 에러 반환: ${errorMessage}`);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
  const host = req.headers.host || "localhost:9600";
  const url = new URL(req.url || "", `http://${host}`);

  const clientId = url.searchParams.get("clientId");
  const clientType = url.searchParams.get("clientType") as ClientType;

  if (!clientId || (clientType !== "plugin" && clientType !== "admin")) {
    ws.close(4000, "식별 정보가 누락되어 커넥션 수립을 거부합니다.");
    return;
  }

  if (activeClients.has(clientId)) {
    const existing = activeClients.get(clientId);
    if (existing && existing.socket.readyState === WebSocket.OPEN) {
      existing.socket.close(
        4001,
        "동일한 식별자로 새로운 세션이 진입하여 기존 소켓을 정화합니다.",
      );
    }
    activeClients.delete(clientId);
  }

  activeClients.set(clientId, {
    socket: ws,
    clientId,
    clientType,
    connectedAt: new Date(),
  });

  logServerSystem(
    "INFO",
    `세션 마운트 성공: [ID: ${clientId}] [TYPE: ${clientType}]`,
  );

  ws.on("message", (rawData: string) => {
    try {
      const message: WebSocketMessage = JSON.parse(rawData);
      message.senderId = clientId;

      logPluginComm(
        clientId,
        message.action,
        `수신 패킷 수집 중계 처리: ${rawData}`,
      );

      if (message.action === "CRAWL_LOG") {
        insertCrawlLog(clientId, JSON.stringify(message.payload), Date.now());
      }

      if (message.targetId === "ALL") {
        activeClients.forEach((client) => {
          if (
            client.clientId !== clientId &&
            client.socket.readyState === WebSocket.OPEN
          ) {
            client.socket.send(JSON.stringify(message));
          }
        });
        return;
      }

      if (message.targetId && activeClients.has(message.targetId)) {
        const targetSession = activeClients.get(message.targetId);
        if (
          targetSession &&
          targetSession.socket.readyState === WebSocket.OPEN
        ) {
          targetSession.socket.send(JSON.stringify(message));
        }
      } else {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              senderId: "server",
              targetId: clientId,
              action: "ERROR",
              payload: {
                detail:
                  "릴레이 대상 기기가 오프라인 상태이거나 세션이 만료되었습니다.",
              },
            }),
          );
        }
      }
    } catch {
      // 가드
    }
  });

  ws.on("close", () => {
    activeClients.delete(clientId);
    logServerSystem("INFO", `세션 소멸 해제 완료: [ID: ${clientId}]`);
  });

  ws.on("error", (err) => {
    logServerSystem(
      "WARN",
      `세션 소켓 예외 에러 감지 [ID: ${clientId}]: ${err.message}`,
    );
  });
});

server.listen(9600, () => {
  logServerSystem(
    "INFO",
    "통합 백엔드 API 및 WebSocket 서비스 포트 9600에서 정상 바인딩 가동 완료",
  );
  console.log(
    "[시스템] 통합 백엔드 API 및 데이터베이스 서비스 포트 9600에서 정상 구동 중",
  );
});
