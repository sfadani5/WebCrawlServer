`server/src/index.ts` 개정 엔트리포인트와 관리자 대시보드(`admin/`)의 타입, 서비스, 훅 소스 코드를 단행합니다.

모든 소스 파일 최상단에 상대 파일 경로 주석 헤더 및 JSDoc 한글 상세 주석이 기재되어 있습니다.

---

### [1/4] `server/src/index.ts` (서버 통합 엔트리포인트)

```typescript
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

/** 확장형 표준 웹소켓 메시지 봉투 구조체 (WebSocketMessage<T>) */
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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

/** 실시간 활성 클라이언트 세션 관리 맵 */
export const activeClients = new Map<string, ClientSession>();

/**
 * [REST API 1] 등록된 클라이언트 목록 조회
 * Query Parameter: ?onlineOnly=true 지정 시 실시간 소켓 가동 노드만 필터링 반환
 */
app.get("/api/db/clients", (req, res) => {
  try {
    const onlineOnly = req.query.onlineOnly === "true";
    const clients = getAllClients();

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
 */
app.put("/api/db/clients/:clientId/config", (req, res) => {
  try {
    const { clientId } = req.params;
    const { alias, assignedWorkerId, customStoragePath } = req.body;

    updateClientConfig(clientId, alias, assignedWorkerId, customStoragePath);

    const session = activeClients.get(clientId);
    if (session) {
      session.alias = alias;
      session.assignedWorkerId = assignedWorkerId;
      session.customStoragePath = customStoragePath;
    }

    logAdminActivity(
      "SUPER_ADMIN",
      "UPDATE_NODE_CONFIG",
      `노드 환경설정 변경 완료 [ID: ${clientId}] [별칭: ${alias}]`
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
      `신규 수집 워커 생성 완료 [ID: ${params.workerId}] [이름: ${params.workerName}]`
    );

    res.json({ success: true, message: "수집 워커가 성공적으로 생성되었습니다." });
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
 * [REST API 6] 최근 수집 로그 인출
 */
app.get("/api/db/logs", (_req, res) => {
  try {
    const logs = getCrawlLogs(100, 0);
    res.json({ success: true, data: logs });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
});

/**
 * [REST API 7] 전체 수집 로그 일괄 소거
 */
app.delete("/api/db/logs", (_req, res) => {
  try {
    clearAllCrawlLogs();
    logAdminActivity("SUPER_ADMIN", "DELETE_ALL_LOGS", "전체 수집 로그 일괄 소거");
    res.json({ success: true, message: "모든 수집 로그가 소거되었습니다." });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
});

/**
 * [REST API 8] 특정 클라이언트 차단 추방 (Purge)
 */
app.delete("/api/db/clients/:clientId", (req, res) => {
  try {
    const targetId = req.params.clientId;
    purgeClient(targetId);

    if (activeClients.has(targetId)) {
      const session = activeClients.get(targetId);
      if (session && session.socket.readyState === WebSocket.OPEN) {
        session.socket.close(4002, "관리자에 의한 영구 차단 추방");
      }
      activeClients.delete(targetId);
    }

    logAdminActivity("SUPER_ADMIN", "PURGE_CLIENT", `클라이언트 영구 추방: ${targetId}`);
    res.json({ success: true, message: "클라이언트가 차단 정화되었습니다." });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
});

/**
 * 연결된 모든 수집 노드(플러그인)로 최신 인증 토큰을 실시간 웹소켓 푸시합니다.
 *
 * @param tokenType - 토큰 구분 식별자 (예: "githubToken")
 * @param newToken - 최신 인증 토큰 값
 */
export function broadcastUpdatedToken(tokenType: string, newToken: string): void {
  const tokenPacket: WebSocketMessage = {
    senderId: "server",
    targetId: "ALL",
    action: "UPDATE_AUTH_TOKEN",
    payloadType: "json",
    payload: { tokenType, token: newToken },
    meta: { timestamp: Date.now() },
  };

  activeClients.forEach((client) => {
    if (client.clientType === "plugin" && client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify(tokenPacket));
    }
  });
}

const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
  const host = req.headers.host || "localhost:9600";
  const url = new URL(req.url || "", `http://${host}`);

  const clientId = url.searchParams.get("clientId");
  const clientType = url.searchParams.get("clientType") as ClientType;

  if (!clientId || (clientType !== "plugin" && clientType !== "admin")) {
    ws.close(4000, "식별 정보 누락으로 연결 거부");
    return;
  }

  // 중복 세션 가드 정화 (프로필당 단 1개 소켓만 보장)
  if (activeClients.has(clientId)) {
    const existing = activeClients.get(clientId);
    if (existing && existing.socket.readyState === WebSocket.OPEN) {
      existing.socket.close(4001, "중복 세션 정화");
    }
    activeClients.delete(clientId);
  }

  activeClients.set(clientId, {
    socket: ws,
    clientId,
    clientType,
    connectedAt: new Date(),
    isSidebarOpen: false,
    lastSeen: Date.now(),
  });

  logServerSystem("INFO", `세션 마운트 성공: [ID: ${clientId}] [TYPE: ${clientType}]`);

  ws.on("message", (rawData: string) => {
    try {
      const message: WebSocketMessage = JSON.parse(rawData);
      message.senderId = clientId;

      const session = activeClients.get(clientId);
      if (session) session.lastSeen = Date.now();

      // 1. 수집 노드의 사이드바 열림/닫힘 알림 패킷 수신 처리
      if (message.action === "CLIENT_STATUS_UPDATE" && session) {
        const payload = message.payload as { isSidebarOpen?: boolean };
        session.isSidebarOpen = !!payload.isSidebarOpen;
        logPluginComm(
          clientId,
          "CLIENT_STATUS_UPDATE",
          `사이드바 상태: ${session.isSidebarOpen ? "OPEN(활성)" : "CLOSED(비활성)"}`
        );
        return;
      }

      logPluginComm(clientId, message.action, `수신 패킷 처리: ${rawData}`);

      // 2. CRAWL_LOG 유입 시 파일 분리 저장소 보관 및 동적 워커 파이프라인 단행
      if (message.action === "CRAWL_LOG") {
        const payloadObj = (typeof message.payload === "object" && message.payload !== null
          ? message.payload
          : { raw: message.payload }) as Record<string, unknown>;

        const targetUrl = String(payloadObj.url || "");
        let domain = "common";
        try {
          if (targetUrl) domain = new URL(targetUrl).hostname;
        } catch {
          // 기본값 유지
        }

        // DB 기본 로그 적재
        const logId = insertCrawlLog(
          clientId,
          JSON.stringify(payloadObj),
          Date.now(),
          domain
        );

        // HTML 원본 소스가 존재할 경우 물리 파일 분리 저장소 적재
        const fullDomHtml = String(payloadObj.fullDom || "");
        let savedPath = "";
        let savedSize = 0;

        if (fullDomHtml) {
          const clientRec = getAllClients().find((c) => c.client_id === clientId);
          const assignedWorker = getWorkerById(clientRec?.assigned_worker_id || "default_worker");

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

        // 지정된 동적 수집 워커 파이프라인 단행
        const clientRec = getAllClients().find((c) => c.client_id === clientId);
        const assignedWorker = getWorkerById(clientRec?.assigned_worker_id || "default_worker");
        if (assignedWorker) {
          executeWorkerPipeline(
            assignedWorker,
            clientId,
            domain,
            savedPath,
            savedSize,
            payloadObj
          );
        }
      }

      // 3. 브로드캐스트 패킷 라우팅
      if (message.targetId === "ALL") {
        activeClients.forEach((client) => {
          if (client.clientId !== clientId && client.socket.readyState === WebSocket.OPEN) {
            client.socket.send(JSON.stringify(message));
          }
        });
        return;
      }

      // 4. 단일 타깃 릴레이 라우팅
      if (message.targetId && activeClients.has(message.targetId)) {
        const targetSession = activeClients.get(message.targetId);
        if (targetSession && targetSession.socket.readyState === WebSocket.OPEN) {
          targetSession.socket.send(JSON.stringify(message));
        }
      }
    } catch {
      // 가드
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

server.listen(9600, () => {
  logServerSystem("INFO", "통합 백엔드 포트 9600 정상 가동 완료");
  console.log("[시스템] 통합 백엔드 API 및 데이터베이스 서비스 포트 9600 구동 중");
});
```

---

### [2/4] `admin/src/types/index.ts` (관리자 대시보드 전역 타입 명세)

```typescript
// admin/src/types/index.ts

/** 수집 노드 클라이언트 데이터 구조체 */
export interface Client {
  /** 노드 고유 UUID */
  client_id: string;
  /** 클라이언트 구분 타입 */
  client_type: string;
  /** 노드 한글 별칭 (Alias) */
  alias?: string;
  /** 담당 수집 워커 ID */
  assigned_worker_id?: string;
  /** 노드 전용 물리 저장 경로 */
  custom_storage_path?: string;
  /** 최초 접속 타임스탬프 또는 ISO 문자열 */
  connected_at: string;
  /** 백엔드 실시간 소켓 가동 여부 */
  is_online?: boolean;
  /** 사이드바 UI 활성화 여부 */
  is_sidebar_open?: boolean;
}

/** 커스텀 스키마 필드 정의 구조체 */
export interface CustomFieldDef {
  /** 필드 영문 식별자 */
  name: string;
  /** SQLite 필드 데이터 타입 */
  type: "TEXT" | "INTEGER" | "REAL" | "BLOB";
  /** 필수 필드 여부 */
  required?: boolean;
}

/** 워커 데이터베이스 기록 구조체 */
export interface WorkerRecord {
  /** 워커 고유 ID */
  worker_id: string;
  /** 워커 한글 이름 */
  worker_name: string;
  /** 대상 DB 파일 상대 경로 */
  db_file_path: string;
  /** 대상 테이블 이름 */
  table_name: string;
  /** 워커 전용 저장소 루트 경로 */
  storage_root_path: string;
  /** 직렬화된 커스텀 필드 JSON 문자열 */
  schema_json: string;
  /** 디폴트 워커 여부 (1 또는 0) */
  is_default: number;
  /** 생성 시각 */
  created_at: string;
}

/** 크롤링 수집 로그 데이터 구조체 */
export interface CrawlLog {
  /** DB 레코드 PK ID */
  id: number;
  /** 수집 노드 UUID */
  client_id: string;
  /** 도메인 */
  domain?: string;
  /** 수집 액션 */
  action?: string;
  /** 파일 물리 경로 */
  file_path?: string;
  /** 파일 크기 (Bytes) */
  file_size?: number;
  /** 직렬화된 로그 메세지 바디 */
  log_message: string;
  /** 수집 시점 타임스탬프 */
  timestamp: number;
}

/** 웹소켓 메시지 규격 구조체 */
export interface WebSocketMessage<T = unknown> {
  senderId: string;
  targetId?: string | "ALL" | "SERVER";
  action: string;
  payloadType?: "json" | "binary_base64" | "raw_text" | "chunk_stream";
  payload: T;
  meta?: {
    timestamp: number;
    traceId?: string;
    extraParams?: Record<string, unknown>;
  };
}

/** 웹소켓 통신 가동 상태 타입 */
export type ConnectionStatus = "CONNECTED" | "DISCONNECTED";

/** 대시보드 활성 메인 탭 타입 */
export type ActiveTab = "clients" | "console" | "logs" | "favicon" | "workers";

/** 노드 리스트 출력 필터 모드 타입 */
export type NodeStatusFilter = "ONLINE" | "ALL" | "OFFLINE";
```

---

### [3/4] `admin/src/services/apiService.ts` (관리자 REST API 서비스)

```typescript
// admin/src/services/apiService.ts

import { Client, CrawlLog, WorkerRecord, CustomFieldDef } from '../types/index.js';

/**
 * 등록된 수집 클라이언트 목록을 백엔드 REST API로부터 인출합니다.
 *
 * @param onlineOnly - true 지정 시 실제 소켓 가동 노드만 인출
 * @returns 클라이언트 데이터 배열
 */
export async function fetchClientsApi(onlineOnly: boolean = false): Promise<Client[]> {
  const url = onlineOnly ? '/api/db/clients?onlineOnly=true' : '/api/db/clients';
  const res = await fetch(url);
  const json = await res.json();
  return json.success ? json.data : [];
}

/**
 * 지정 노드의 환경설정(별칭, 담당 워커, 전용 저장 경로)을 업데이트합니다.
 *
 * @param clientId - 대상 노드 UUID
 * @param alias - 노드 한글 별칭
 * @param assignedWorkerId - 담당 워커 ID
 * @param customStoragePath - 노드 전용 물리 저장 경로
 * @returns 성공 여부
 */
export async function updateClientConfigApi(
  clientId: string,
  alias: string,
  assignedWorkerId: string,
  customStoragePath: string
): Promise<boolean> {
  const res = await fetch(`/api/db/clients/${clientId}/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alias, assignedWorkerId, customStoragePath }),
  });
  const json = await res.json();
  return json.success;
}

/**
 * 전체 수집 워커 목록을 인출합니다.
 *
 * @returns 워커 레코드 배열
 */
export async function fetchWorkersApi(): Promise<WorkerRecord[]> {
  const res = await fetch('/api/admin/workers');
  const json = await res.json();
  return json.success ? json.data : [];
}

/**
 * 신규 동적 수집 워커 및 타깃 DB 스키마 빌드를 요청합니다.
 *
 * @param params - 워커 생성 옵션
 * @returns 성공 여부
 */
export async function createWorkerApi(params: {
  workerId: string;
  workerName: string;
  dbFileName: string;
  tableName: string;
  storageRootPath: string;
  customFields: CustomFieldDef[];
  isDefault?: boolean;
}): Promise<boolean> {
  const res = await fetch('/api/admin/workers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  return json.success;
}

/**
 * 최근 수집 로그 목록을 인출합니다.
 *
 * @returns 크롤링 로그 배열
 */
export async function fetchLogsApi(): Promise<CrawlLog[]> {
  const res = await fetch('/api/db/logs');
  const json = await res.json();
  return json.success ? json.data : [];
}

/**
 * 데이터베이스 수집 로그 일괄 소거를 요청합니다.
 *
 * @returns 성공 여부
 */
export async function clearLogsApi(): Promise<boolean> {
  const res = await fetch('/api/db/logs', { method: 'DELETE' });
  const json = await res.json();
  return json.success;
}

/**
 * 특정 클라이언트 기기를 블랙리스트 차단 추방 요청합니다.
 *
 * @param clientId - 타깃 노드 UUID
 * @returns 성공 여부
 */
export async function purgeClientApi(clientId: string): Promise<boolean> {
  const res = await fetch(`/api/db/clients/${clientId}`, { method: 'DELETE' });
  const json = await res.json();
  return json.success;
}
```

---

### [4/4] `admin/src/hooks/useAdminDbApi.ts` (관리자 비즈니스 로직 훅)

```typescript
// admin/src/hooks/useAdminDbApi.ts

import { useState, useCallback } from 'react';
import { Client, CrawlLog, WorkerRecord, CustomFieldDef } from '../types/index.js';
import { 
  fetchClientsApi, 
  updateClientConfigApi,
  fetchWorkersApi,
  createWorkerApi,
  fetchLogsApi, 
  clearLogsApi, 
  purgeClientApi 
} from '../services/apiService.js';

/**
 * 관리자 대시보드의 REST API 통신 및 상태 관리 비즈니스 로직 훅입니다.
 */
export function useAdminDbApi() {
  const [clients, setClients] = useState<Client[]>([]);
  const [workers, setWorkers] = useState<WorkerRecord[]>([]);
  const [logs, setLogs] = useState<CrawlLog[]>([]);

  /** 클라이언트 목록 인출 */
  const loadClients = useCallback(async (onlineOnly: boolean = false) => {
    try {
      const data = await fetchClientsApi(onlineOnly);
      setClients(data);
    } catch {
      // 예외 스킵
    }
  }, []);

  /** 워커 목록 인출 */
  const loadWorkers = useCallback(async () => {
    try {
      const data = await fetchWorkersApi();
      setWorkers(data);
    } catch {
      // 예외 스킵
    }
  }, []);

  /** 수집 로그 목록 인출 */
  const loadLogs = useCallback(async () => {
    try {
      const data = await fetchLogsApi();
      setLogs(data);
    } catch {
      // 예외 스킵
    }
  }, []);

  /** 노드 환경설정 저장 처리 */
  const executeUpdateClientConfig = useCallback(async (
    clientId: string,
    alias: string,
    assignedWorkerId: string,
    customStoragePath: string
  ) => {
    const success = await updateClientConfigApi(clientId, alias, assignedWorkerId, customStoragePath);
    if (success) {
      await loadClients();
      return true;
    }
    return false;
  }, [loadClients]);

  /** 신규 수집 워커 생성 처리 */
  const executeCreateWorker = useCallback(async (params: {
    workerId: string;
    workerName: string;
    dbFileName: string;
    tableName: string;
    storageRootPath: string;
    customFields: CustomFieldDef[];
  }) => {
    const success = await createWorkerApi(params);
    if (success) {
      alert('신규 수집 워커 및 타깃 DB 스키마가 성공적으로 빌드되었습니다.');
      await loadWorkers();
      return true;
    }
    return false;
  }, [loadWorkers]);

  /** 전체 수집 로그 일괄 소거 단행 */
  const executeClearLogs = useCallback(async () => {
    if (!confirm('데이터베이스 내의 모든 크롤링 수집 로그를 완전 소거하시겠습니까?')) {
      return false;
    }
    const success = await clearLogsApi();
    if (success) {
      alert('데이터베이스의 모든 수집 로그가 일괄 소거되었습니다.');
      await loadLogs();
      return true;
    }
    return false;
  }, [loadLogs]);

  /** 클라이언트 차단 추방 단행 */
  const executePurgeClient = useCallback(async (clientId: string) => {
    if (!confirm(`대상 클라이언트 [${clientId}]를 강제 정화 격리하시겠습니까?`)) {
      return false;
    }
    const success = await purgeClientApi(clientId);
    if (success) {
      alert('지정된 클라이언트 기기가 완전히 차단 제거되었습니다.');
      await loadClients();
      await loadLogs();
      return true;
    }
    return false;
  }, [loadClients, loadLogs]);

  /** 오프라인 노드 이력 일괄 정화 단행 */
  const executePurgeOfflineClients = useCallback(async () => {
    const offlineClients = clients.filter((c) => !c.is_online);
    if (offlineClients.length === 0) {
      alert('정리할 오프라인 노드 이력이 없습니다.');
      return false;
    }

    if (!confirm(`연결 끊긴 오프라인 노드 ${offlineClients.length}개를 일괄 정화하시겠습니까?`)) {
      return false;
    }

    for (const client of offlineClients) {
      await purgeClientApi(client.client_id);
    }

    alert('모든 오프라인 노드 이력이 정화되었습니다.');
    await loadClients();
    await loadLogs();
    return true;
  }, [clients, loadClients, loadLogs]);

  return {
    clients,
    workers,
    logs,
    setLogs,
    loadClients,
    loadWorkers,
    loadLogs,
    executeUpdateClientConfig,
    executeCreateWorker,
    executeClearLogs,
    executePurgeClient,
    executePurgeOfflineClients
  };
}
```

---

다음 순서인 관리자 대시보드 UI 컴포넌트(`NodeConfigModal.tsx`, `WorkerManagerView.tsx`, `GcpClientsTable.tsx`, `GcpClientsView.tsx`, `Sidebar.tsx`, `App.tsx`) 소스 코드를 출력할까요?