본 문서는 `WebCrawlServer` 백엔드 서버에서 연결된 수집 노드(플러그인 프로필)의 **노드 별칭(`alias`)**, **실시간 세션 상태(`is_online`, `isSidebarOpen`) 관리**, **노드별 환경설정 API**, 및 **온라인 전용 REST API 필터링 규격**을 정의하는 지침서입니다.

---

## 1. 개요 및 세션 관리 원칙

1.1 **개요**: 백엔드 서버(`server/src/index.ts`)는 단일 브라우저 프로필당 1개씩 연결되는 오프스크린 무중단 웹소켓을 식별하고, 각 노드의 한글 별칭(`alias`), 전담 워커(`assigned_worker_id`), 노드 전용 저장 경로(`custom_storage_path`), 및 사이드바 활성화 여부를 세부 관리합니다.  
1.2 **3대 세션 관리 원칙**:
   - **단일 세션 점유**: 동일한 `clientId`로 신규 웹소켓 접속 시 기존 세션을 정화(close code `4001`)하여 프로필당 1개 세션만 유지.
   - **노드 식별성 및 설정 보관**: 난해한 UUID 대신 직관적인 한글 별칭(`alias`) 및 노드 전용 저장 경로를 `clients` 테이블에 보관.
   - **온라인 전용 인출 지원**: REST API에서 `onlineOnly=true` 파라미터 수용 시 오프라인 DB 이력을 제외하고 현재 실제 연결된 노드만 반환.

---

## 2. `clients` 스키마 및 `ClientSession` 메타 명세

### 2.1 SQLite `clients` 테이블 개정 스키마 (`server/src/database.ts`)
```sql
CREATE TABLE IF NOT EXISTS clients (
  client_id TEXT PRIMARY KEY,           -- 노드 고유 UUID
  client_type TEXT NOT NULL,            -- "plugin" | "admin"
  alias TEXT,                           -- 노드 한글 별칭 (예: "오페라-개인-수집기-1")
  assigned_worker_id TEXT DEFAULT 'default_worker', -- 담당 워커 ID
  custom_storage_path TEXT,             -- 노드 전용 물리 저장 경로 (예: "E:\data\opera_node_1")
  connected_at TEXT NOT NULL
);
```

### 2.2 인메모리 `ClientSession` 구조체 (`server/src/index.ts`)
```typescript
// server/src/index.ts

export type ClientType = "plugin" | "admin";

export interface ClientSession {
  socket: WebSocket;
  clientId: string;
  clientType: ClientType;
  connectedAt: Date;
  alias?: string;               // 노드 한글 별칭
  assignedWorkerId?: string;    // 담당 워커 ID
  customStoragePath?: string;   // 노드 전용 저장 경로
  isSidebarOpen?: boolean;      // 사이드바 UI 활성화 여부
  lastSeen?: number;            // 마지막 패킷 통신 타임스탬프
}

export const activeClients = new Map<string, ClientSession>();
```

---

## 3. 노드 환경설정 업데이트 REST API 규정 (`PUT /api/db/clients/:clientId/config`)

관리자 대시보드 모달에서 입력된 노드 별칭(`alias`), 담당 워커(`assignedWorkerId`), 노드 전용 저장 경로(`customStoragePath`)를 업데이트합니다.

```typescript
// server/src/index.ts

app.put("/api/db/clients/:clientId/config", (req, res) => {
  try {
    const { clientId } = req.params;
    const { alias, assignedWorkerId, customStoragePath } = req.body;

    // DB 업데이트 구문 단행
    updateClientConfig(clientId, alias, assignedWorkerId, customStoragePath);

    // 인메모리 세션 최신화
    const session = activeClients.get(clientId);
    if (session) {
      session.alias = alias;
      session.assignedWorkerId = assignedWorkerId;
      session.customStoragePath = customStoragePath;
    }

    logAdminActivity(
      "SUPER_ADMIN",
      "UPDATE_NODE_CONFIG",
      `노드 환경설정 변경 완료 [ID: ${clientId}] [별칭: ${alias}] [워커: ${assignedWorkerId}]`
    );

    res.json({ success: true, message: "노드 환경설정이 저장되었습니다." });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
});
```

---

## 4. REST API 온라인 클라이언트 필터 규정 (`GET /api/db/clients`)

`onlineOnly` 쿼리 파라미터를 처리하여, 관리자 대시보드가 현재 실제 통신 중인 수집 노드만 필터링할 수 있도록 제공합니다.

```typescript
// server/src/index.ts

app.get("/api/db/clients", (req, res) => {
  try {
    const onlineOnly = req.query.onlineOnly === "true";
    const clients = getAllClients(); // SQLite DB 전체 목록 인출

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
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
});
```

---

## 5. 원격 토큰 푸시 브로드캐스트 라우팅 규정 (`UPDATE_AUTH_TOKEN`)

토큰 변경 발생 시 연결된 모든 수집 노드로 웹소켓 실시간 브로드캐스트를 송출합니다.

```typescript
export function broadcastUpdatedToken(tokenType: string, newToken: string): void {
  const tokenPacket = {
    senderId: "server",
    targetId: "ALL",
    action: "UPDATE_AUTH_TOKEN",
    payloadType: "json",
    payload: { tokenType, token: newToken },
    meta: { timestamp: Date.now() },
  };

  activeClients.forEach((client) => {
    if (
      client.clientType === "plugin" &&
      client.socket.readyState === WebSocket.OPEN
    ) {
      client.socket.send(JSON.stringify(tokenPacket));
    }
  });
}
```

---

## 6. 검증 체크리스트

- [ ] `PUT /api/db/clients/:clientId/config` 호출 시 노드 별칭 및 전용 저장 경로가 DB 및 메모리에 즉시 반영되는가?
- [ ] `GET /api/db/clients?onlineOnly=true` 요청 시 오프라인 노드가 제외되고 실제 연결 노드만 반환되는가?
- [ ] 크롬 포트 연결 해제(`onDisconnect`) 시 `isSidebarOpen: false` 상태가 유실 없이 실시간 반영되는가?
