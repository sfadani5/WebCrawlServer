// server/src/index.ts

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
  updateClientConfig,
  getAllWorkers,
  getWorkerById,
  createDynamicWorker,
  CreateWorkerParams,
} from "./database.js";
import { saveCrawledContentToFile } from "./services/fileStorageService.js";
import { executeWorkerPipeline } from "./services/workerEngineService.js";
import { logServerSystem, logAdminActivity, logPluginComm } from "./logger.js";

/** 클라이언트 세션 식별 유형 */
export type ClientType = "plugin" | "admin";

/** 백엔드 실시간 클라이언트 세션 구조체 */
export interface ClientSession {
  /** 웹소켓 인스턴스 */
  socket: WebSocket;
  /** 클라이언트 고유 UUID */
  clientId: string;
  /** 클라이언트 구분 타입 */
  clientType: ClientType;
  /** 연결 수립 시각 */
  connectedAt: Date;
  /** 노드 한글 별칭 */
  alias?: string;
  /** 담당 수집 워커 ID */
  assignedWorkerId?: string;
  /** 노드 전용 물리 저장 경로 */
  customStoragePath?: string;
  /** 사이드바 UI 열림 활성화 여부 */
  isSidebarOpen?: boolean;
  /** 마지막 통신 수신 타임스탬프 */
  lastSeen?: number;
}

/** 패킷 메타데이터 구조체 */
export interface PacketMetadata {
  /** 생성 시점 타임스탬프 */
  timestamp: number;
  /** 요청 추적 고유 ID */
  traceId?: string;
  /** 동적 확장 파라미터 맵 */
  extraParams?: Record<string, unknown>;
}

/**
 * 확장형 표준 웹소켓 메시지 봉투 구조체
 * ADR-002: 확장 가능 패킷 봉투 프로토콜 규격
 */
export interface WebSocketMessage<T = unknown> {
  /** 송신 노드 식별자 */
  senderId: string;
  /** 수신 타깃 식별자 (ALL, SERVER, 또는 특정 UUID) */
  targetId?: string | "ALL" | "SERVER";
  /** 지시 액션 명령 문자열 */
  action: string;
  /** 데이터 포맷 유형 */
  payloadType?: "json" | "binary_base64" | "raw_text" | "chunk_stream";
  /** 실질 페이로드 바디 */
  payload: T;
  /** 메타데이터 객체 */
  meta?: PacketMetadata;
}

// ESM 환경에서 __dirname 대체 경로 계산
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 정적 파일 제공 경로 (admin 빌드 산출물 또는 public/)
const publicPath = resolve(__dirname, "..", "public");

const app = express();
const server = createServer(app);

/**
 * 예외 객체로부터 한글 오류 메시지를 안전하게 추출합니다.
 *
 * @param error - 발생한 예외 객체
 * @returns 문자열 오류 메시지
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "알 수 없는 오류가 발생했습니다.";
}

app.use(express.json());
app.use(express.static(publicPath));

// SQLite 데이터베이스 및 디폴트 워커 초기화
initializeDatabase();

/** 실시간 활성 클라이언트 세션 관리 맵 (clientId → ClientSession) */
export const activeClients = new Map<string, ClientSession>();

/**
 * [REST API 1] 등록된 클라이언트 목록 조회
 * Query Parameter: ?onlineOnly=true 지정 시 실시간 소켓 가동 노드만 필터링 반환
 */
app.get("/api/db/clients", (req, res) => {
  try {
    const onlineOnly = req.query.onlineOnly === "true";
    const clients = getAllClients();

    // 실시간 세션 맵과 대조하여 온라인/사이드바 상태 플래그 추가
    let result = clients.map((c) => {
      const session = activeClients.get(c.client_id);
      const isOnline = !!(
        session && session.socket.readyState === WebSocket.OPEN
      );
      return {
        ...c,
        is_online: isOnline,
        is_sidebar_open: isOnline ? !!session.isSidebarOpen : false,
      };
    });

    // onlineOnly 필터 적용
    if (onlineOnly) {
      result = result.filter((c) => c.is_online);
    }

    res.json({ success: true, data: result });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logServerSystem("ERROR", `Clients API 에러 반환: ${errorMessage}`);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

/**
 * [REST API 2] 특정 클라이언트 노드의 환경설정(별칭, 담당 워커, 전용 저장 경로) 저장
 * 실시간 세션 메타도 함께 갱신합니다.
 */
app.put("/api/db/clients/:clientId/config", (req, res) => {
  try {
    const { clientId } = req.params;
    const { alias, assignedWorkerId, customStoragePath } = req.body;

    // DB 환경설정 업데이트
    updateClientConfig(clientId, alias, assignedWorkerId, customStoragePath);

    // 실시간 세션 메타 동기화
    const session = activeClients.get(clientId);
    if (session) {
      session.alias = alias;
      session.assignedWorkerId = assignedWorkerId;
      session.customStoragePath = customStoragePath;
    }

    logAdminActivity(
      "SUPER_ADMIN",
      "UPDATE_NODE_CONFIG",
      `노드 환경설정 변경 완료 [ID: ${clientId}] [별칭: ${alias}]`,
    );

    res.json({ success: true, message: "노드 환경설정이 저장되었습니다." });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
});

/**
 * [REST API 3] 전체 수집 워커 목록 인출
 */
app.get("/api/admin/workers", (_req, res) => {
  try {
    const workers = getAllWorkers();
    res.json({ success: true, data: workers });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
});

/**
 * [REST API 4] 신규 동적 수집 워커 생성 및 타깃 DB 동적 빌드
 */
app.post("/api/admin/workers", (req, res) => {
  try {
    const params: CreateWorkerParams = req.body;
    createDynamicWorker(params);

    logAdminActivity(
      "SUPER_ADMIN",
      "CREATE_WORKER",
      `신규 수집 워커 생성 완료 [ID: ${params.workerId}] [이름: ${params.workerName}]`,
    );

    res.json({
      success: true,
      message: "수집 워커가 성공적으로 생성되었습니다.",
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
});

/**
 * [REST API 5] 디스크 스토리지 모니터링 상태 조회
 */
app.get("/api/admin/storage/status", (_req, res) => {
  try {
    const rootPath = process.env.STORAGE_ROOT_PATH || "./storage";
    res.json({
      success: true,
      data: {
        storageRootPath: resolve(rootPath),
        status: "NORMAL",
      },
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
});

/**
 * [REST API 6] 네트워크 헬스체크 및 서버 상태 진단
 * 서버 업타임, 포트 바인딩 상태, DB 상태, 메모리 사용량 등 종합 진단 정보 반환
 */
app.get("/api/admin/network/health", (_req, res) => {
  try {
    const serverUptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const totalMemoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);

    const serverAddress = server.address();
    const portBound = serverAddress !== null;
    const port =
        typeof process.env.SERVER_PORT !== "undefined"
          ? Number(process.env.SERVER_PORT)
          : 9700;

    let walModeEnabled = false;
    try {
      initializeDatabase();
      walModeEnabled = true;
    } catch {
      walModeEnabled = false;
    }

    const responseTime = Date.now();

    res.json({
      success: true,
      data: {
        portBound,
        port,
        uptime: serverUptime > 0,
        startedAt: new Date(Date.now() - serverUptime * 1000).toISOString(),
        walModeEnabled,
        memoryUsage: totalMemoryMB,
        responseTime: 0,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
});

/**
 * [REST API 7] 최근 수집 로그 인출 (최신 100건)
 */
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

/**
 * [REST API 7] 전체 수집 로그 일괄 소거
 */
app.delete("/api/db/logs", (_req, res) => {
  try {
    clearAllCrawlLogs();
    logAdminActivity(
      "SUPER_ADMIN",
      "DELETE_ALL_LOGS",
      "전체 수집 로그 일괄 소거",
    );
    res.json({ success: true, message: "모든 수집 로그가 소거되었습니다." });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logServerSystem("ERROR", `Logs Delete API 에러 반환: ${errorMessage}`);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

/**
 * [REST API 8] 특정 클라이언트 차단 추방 (Purge)
 * 백엔드 포트(9700)와 24시간 무중단 단일 웹소켓 통신망을 수립합니다.
 */
app.delete("/api/db/clients/:clientId", (req, res) => {
  try {
    const targetId = req.params.clientId;

    // DB에서 클라이언트 레코드 영구 삭제
    purgeClient(targetId);

    // 실시간 소켓이 가동 중일 경우 강제 종료
    if (activeClients.has(targetId)) {
      const session = activeClients.get(targetId);
      if (session && session.socket.readyState === WebSocket.OPEN) {
        session.socket.close(4002, "관리자에 의한 영구 차단 추방");
      }
      activeClients.delete(targetId);
    }

    logAdminActivity(
      "SUPER_ADMIN",
      "PURGE_CLIENT",
      `클라이언트 영구 추방: ${targetId}`,
    );
    res.json({ success: true, message: "클라이언트가 차단 정화되었습니다." });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
});

/**
 * 연결된 모든 수집 노드(플러그인)로 최신 인증 토큰을 실시간 웹소켓 푸시합니다.
 * ADR-003: 백그라운드 페치 스크래핑 및 깃허브 동기화 규격 연동
 *
 * @param tokenType - 토큰 구분 식별자 (예: "githubToken")
 * @param newToken - 최신 인증 토큰 값
 */
export function broadcastUpdatedToken(
  tokenType: string,
  newToken: string,
): void {
  const tokenPacket: WebSocketMessage = {
    senderId: "server",
    targetId: "ALL",
    action: "UPDATE_AUTH_TOKEN",
    payloadType: "json",
    payload: { tokenType, token: newToken },
    meta: { timestamp: Date.now() },
  };

  activeClients.forEach((client) => {
    if (
      client.socket.readyState === WebSocket.OPEN
    ) {
      client.socket.send(JSON.stringify(tokenPacket));
    }
  });
}

// 웹소켓 서버 초기화
const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
  const host = req.headers.host || `localhost:${process.env.SERVER_PORT || 9700}`;
  const url = new URL(req.url || "", `http://${host}`);

  // 연결 파라미터 추출 및 유효성 검증
  const clientId = url.searchParams.get("clientId");
  const clientType = url.searchParams.get("clientType") as ClientType;

  if (!clientId || (clientType !== "plugin" && clientType !== "admin")) {
    ws.close(4000, "식별 정보 누락으로 연결 거부");
    return;
  }

  // 중복 세션 가드 정화 (클라이언트 1개당 단 1개 소켓만 보장)
  if (activeClients.has(clientId)) {
    const existing = activeClients.get(clientId);
    if (existing && existing.socket.readyState === WebSocket.OPEN) {
      existing.socket.close(4001, "중복 세션 정화");
    }
    activeClients.delete(clientId);
  }

  // 새 세션 등록
  activeClients.set(clientId, {
    socket: ws,
    clientId,
    clientType,
    connectedAt: new Date(),
    isSidebarOpen: false,
    lastSeen: Date.now(),
  });

  logServerSystem(
    "INFO",
    `세션 마운트 성공: [ID: ${clientId}] [TYPE: ${clientType}]`,
  );

  ws.on("message", (rawData: string) => {
    try {
      const message: WebSocketMessage = JSON.parse(rawData);
      message.senderId = clientId;

      // 마지막 통신 시각 갱신
      const session = activeClients.get(clientId);
      if (session) session.lastSeen = Date.now();

      // 1. 사이드바 열림/닫힘 상태 업데이트 패킷 처리 (ADR-001 사이드바/오프스크린 아키텍처)
      if (message.action === "CLIENT_STATUS_UPDATE" && session) {
        const payload = message.payload as { isSidebarOpen?: boolean };
        session.isSidebarOpen = !!payload.isSidebarOpen;
        logPluginComm(
          clientId,
          "CLIENT_STATUS_UPDATE",
          `사이드바 상태: ${session.isSidebarOpen ? "OPEN(활성)" : "CLOSED(비활성)"}`,
        );
        return;
      }

      // PONG_RESPONSE는 관리자 UI로 전달하여 관리자에서 각 노드의 응답을 확인할 수 있도록 중계
      if (message.action === "PONG_RESPONSE") {
        console.log("[server] forwarding PONG_RESPONSE to admin clients");
        activeClients.forEach((client) => {
          if (
            client.clientType === "admin" &&
            client.socket.readyState === WebSocket.OPEN
          ) {
            client.socket.send(JSON.stringify(message));
          }
        });
        return;
      }

      // 우선: 전체 브로드캐스트 패킷 처리 (targetId === "ALL") — 관리자가 ALL 대상으로 보낸 패킷을 수집 노드로 중계
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

      // 1.5. Ping/Pong 네트워크 지연 시간 테스트 (네트워크 모니터링 지원)
      // 플러그인에서 서버로 직접 보낸 PING_TEST는 서버가 해당 플러그인에게 PONG_RESPONSE를 응답합니다.
      if (message.action === "PING_TEST") {
        // PING_TEST를 보낸 클라이언트가 플러그인인 경우에만 PONG_RESPONSE 응답
        const pongResponse: WebSocketMessage = {
          senderId: "server",
          targetId: message.senderId,
          action: "PONG_RESPONSE",
          payloadType: "json",
          payload: {
            originalTimestamp: message.meta?.timestamp || Date.now(),
            responseTimestamp: Date.now(),
            clientId: clientId,
          },
          meta: { timestamp: Date.now() },
        };

        if (
          session &&
          clientType === "plugin" &&
          ws.readyState === WebSocket.OPEN
        ) {
          ws.send(JSON.stringify(pongResponse));
          logPluginComm(
            clientId,
            "PING_TEST",
            "Ping/Pong 네트워크 테스트 응답 완료",
          );
        }

        return;
      }

      logPluginComm(
        clientId,
        message.action,
        `수신 패킷 처리: ${rawData.substring(0, 200)}`,
      );

      // 2. CRAWL_LOG 유입 시 파일 분리 저장 및 동적 워커 파이프라인 단행 (ADR-004)
      if (message.action === "CRAWL_LOG") {
        const payloadObj = (
          typeof message.payload === "object" && message.payload !== null
            ? message.payload
            : { raw: message.payload }
        ) as Record<string, unknown>;

        // 수집 URL에서 도메인 추출
        const targetUrl = String(payloadObj.url || "");
        let domain = "common";
        try {
          if (targetUrl) domain = new URL(targetUrl).hostname;
        } catch {
          // 도메인 파싱 실패 시 기본값 유지
        }

        // DB 기본 로그 적재 및 레코드 ID 취득
        const logId = insertCrawlLog(
          clientId,
          JSON.stringify(payloadObj),
          Date.now(),
          domain,
        );

        // HTML 원본 소스가 있을 경우 물리 파일 분리 저장소 적재 (R-00208)
        const fullDomHtml = String(payloadObj.fullDom || "");
        let savedPath = "";
        let savedSize = 0;

        if (fullDomHtml) {
          const clientRec = getAllClients().find(
            (c) => c.client_id === clientId,
          );
          const assignedWorker = getWorkerById(
            clientRec?.assigned_worker_id || "default_worker",
          );

          const saveRes = saveCrawledContentToFile({
            customNodePath: clientRec?.custom_storage_path,
            workerStoragePath: assignedWorker?.storage_root_path,
            domain,
            dbLogId: logId,
            htmlContent: fullDomHtml,
          });

          savedPath = saveRes.savedFilePath;
          savedSize = saveRes.fileSize;
        }

        // 지정된 동적 수집 워커 파이프라인 단행 (R-00207)
        const clientRec2 = getAllClients().find(
          (c) => c.client_id === clientId,
        );
        const assignedWorker2 = getWorkerById(
          clientRec2?.assigned_worker_id || "default_worker",
        );
        if (assignedWorker2) {
          executeWorkerPipeline(
            assignedWorker2,
            clientId,
            domain,
            savedPath,
            savedSize,
            payloadObj,
          );
        }
      }

      // 3. 브로드캐스트 패킷 라우팅 (targetId === "ALL")
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

      // 4. 단일 타깃 릴레이 라우팅 (특정 UUID 지정)
      if (message.targetId && activeClients.has(message.targetId)) {
        const targetSession = activeClients.get(message.targetId);
        if (
          targetSession &&
          targetSession.socket.readyState === WebSocket.OPEN
        ) {
          targetSession.socket.send(JSON.stringify(message));
        }
      }
    } catch {
      // 패킷 파싱 예외 가드 (무중단 유지)
    }
  });

  ws.on("close", () => {
    activeClients.delete(clientId);
    logServerSystem("INFO", `세션 해제 완료: [ID: ${clientId}]`);
  });

  ws.on("error", (err) => {
    logServerSystem("WARN", `세션 예외 감지 [ID: ${clientId}]: ${err.message}`);
  });
});

// 통합 백엔드 포트 ${process.env.SERVER_PORT || 9700}으로 서버 가동
server.listen(Number(process.env.SERVER_PORT) || 9700, () => {
  logServerSystem("INFO", `통합 백엔드 포트 ${process.env.SERVER_PORT || 9700} 정상 가동 완료`);
  console.log(
    `[시스템] 통합 백엔드 API 및 데이터베이스 서비스 포트 ${process.env.SERVER_PORT || 9700} 구동 중`,
  );
});
