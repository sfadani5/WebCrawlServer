본 문서는 `WebCrawlServer` 브라우저 확장 플러그인의 네트워크 통신 및 크롬 내부 메시징 개정 지침입니다. 백엔드 웹소켓 통신 소유권이 **`offscreen.ts`로 단독 이관**되고 **크롬 포트 연결 기법**이 도입됨에 따라, 오프스크린-백그라운드-사이드바 간 메시지 라우팅 규격, 포트 기반 생명주기 감지, 비동기 응답 채널 가드 및 실시간 토큰 동기화 처리 지침을 재정의합니다.

---

## 1. 개정 통신 아키텍처 개요

플러그인은 외부 소켓 관로와 내부 메시징 관로를 철저히 분리하여 운영합니다.

```
[ WebCrawlServer (포트 9600) ]
            ▲
            │ (1) External WebSocket (ws://localhost:9600?clientId=<UUID>&clientType=plugin)
            │     *오프스크린(offscreen.ts)이 24시간 단독 소유*
            ▼
[ offscreen.ts (Offscreen Engine) ]
            ▲
            │ (2) Internal Runtime Messaging (chrome.runtime)
            │     + 크롬 전용 포트 연결 (chrome.runtime.connect) -> 사이드바 열림/닫힘 감지
            ▼
[ background.ts (Service Worker) ]
    ▲                      ▲
    │ (Internal Messaging) │ (3) Tab Messaging (chrome.tabs)
    ▼                      ▼
[ sidepanel.tsx ]   [ content.ts ]
```

---

## 2. 백엔드 WebSocket 단독 소유 지침 (`offscreen.ts`)

2.1 **단일 소유권 원칙**: 백엔드 포트(9600)와의 외부 웹소켓 연결은 **오직 `offscreen.ts`에서만 단독 생성 및 유지**합니다. `background.ts`나 `sidepanel.tsx`가 직접 웹소켓을 연결하는 것을 금지합니다.  
2.2 **접속 URL 규격**: `ws://<host>:<port>?clientId=<UUID>&clientType=plugin` 규격을 준수합니다.  
2.3 **무중단 재연결 루프**: 소켓 절단(`onclose`) 감지 시 `socket = null` 초기화 후 3초 주기로 재귀 재연결을 단행합니다.  
2.4 **초기 안착 패킷**: 소켓 연결 성공(`onopen`) 즉시 `CRAWL_LOG` 액션의 안착 알림 패킷을 서버로 송출합니다.  

---

## 3. 크롬 내부 메시지 라우팅 및 예외 가드 규정

### 3.1 패킷 전달 파이프라인
- **사이드바 -> 서버**: `sidepanel.tsx`가 `chrome.runtime.sendMessage({ type: "SEND_SOCKET_PACKET", packet })` 호출 시, `offscreen.ts`가 이를 수신하여 자신의 웹소켓으로 송출합니다.
- **서버 -> 사이드바**: `offscreen.ts`가 서버 패킷 수신 시 `chrome.runtime.sendMessage({ type: "SOCKET_PACKET_RECEIVED", packet })`를 전송하여 사이드바 UI를 동적 최신화합니다.

### 3.2 수신자 부재 예외 차단 가드 (`catch()`)
- 사이드바 UI가 닫혀있을 때 `offscreen.ts`에서 `chrome.runtime.sendMessage`를 호출하면 발생할 수 있는 `Could not establish connection. Receiving end does not exist` 런타임 예외를 방지하기 위해 다음과 같이 `.catch(() => {})` 가드를 필수로 적용합니다.

```typescript
// plugins/basic-plugin/src/offscreen.ts 예외 가드 구문

socket.onmessage = async (event) => {
  const packet: WebSocketPacket = JSON.parse(event.data);
  
  // catch() 추가로 사이드바 미오픈 시의 콘솔 예외 방어
  chrome.runtime.sendMessage({ type: "SOCKET_PACKET_RECEIVED", packet }).catch(() => {
    // 수신자 부재 예외 조용히 무시
  });
};
```

### 3.3 포트 연결 기반 사이드바 생명주기 감지 (`chrome.runtime.connect`)
- 사이드바가 열릴 때 `chrome.runtime.connect({ name: "sidepanel-port" })`를 연결하고, 포트 연결 해제(`onDisconnect`)를 통해 유저가 사이드바 창을 닫았음을 유실 없이 100% 감지하여 서버로 `CLIENT_STATUS_UPDATE` 패킷을 전송합니다.

```typescript
// plugins/basic-plugin/src/offscreen.ts 포트 감지 수신기

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "sidepanel-port") {
    // 사이드바 열림 상태 알림
    sendSidebarStatusToServer(true);

    // 사이드바 창 닫힘 시 100% 확실하게 해제 이벤트 발생
    port.onDisconnect.addListener(() => {
      sendSidebarStatusToServer(false);
    });
  }
});
```

---

## 4. 특수 메시지 패킷 규정

4.1 **사이드바 상태 알림 (`CLIENT_STATUS_UPDATE`)**:
   - 크롬 포트 감지를 통해 `isSidebarOpen: true/false` 정보를 오프스크린 소켓을 거쳐 서버로 송출합니다.
4.2 **실시간 토큰 동기화 (`UPDATE_AUTH_TOKEN`)**:
   - 서버로부터 `UPDATE_AUTH_TOKEN` 패킷 수신 시 `offscreen.ts`가 `chrome.storage.local`의 토큰을 즉시 최신화합니다.

---

## 5. 검증 체크리스트

- [ ] 웹소켓 연결이 `offscreen.ts` 단 하나에서만 단독 생성되는가?
- [ ] 사이드바 닫힘 시 크롬 포트 `onDisconnect`를 통해 `isSidebarOpen: false` 상태가 유실 없이 감지되는가?
- [ ] 사이드바 미오픈 시 `sendMessage().catch()` 가드가 작동하여 콘솔 예외가 무력화되는가?
- [ ] 서버에서 푸시된 `UPDATE_AUTH_TOKEN` 패킷이 로컬 스토리지로 정상 동기화되는가?
