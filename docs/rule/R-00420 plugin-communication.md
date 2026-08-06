# R-00420 docs/rule/R-00420 plugin-communication.md

본 문서는 `WebCrawlServer` 프로젝트의 브라우저 확장 플러그인 통신 및 메시징 지침입니다. 백엔드 WebSocket 네트워크 연동, 무중단 자동 재연결 제어, 크롬 내부 메시징 파이프라인 및 메시지 채널 닫힘 에러 방지를 위한 개발 규정을 정의합니다.

---

## 1. 통신 아키텍처 개요

플러그인은 2가지 통신 관로를 사양에 맞게 분리하여 운영해야 합니다.

```
[ WebCrawlServer (port 9600) ]
            ▲
            │ (1) External WebSocket (ws://localhost:9600?clientId=<UUID>&clientType=plugin)
            ▼
[ background.ts (Service Worker) ]
    ▲                      ▲
    │                      │ (3) Internal Messaging (chrome.tabs)
    │ (2) Internal Messaging
    │     (chrome.runtime)  ▼
[ popup.tsx ]       [ content.ts ]
```

1. **외부 통신 (External WebSocket)**: `background.ts` 서비스 워커가 백엔드 서버(포트 9600)와 영속성 실시간 통신 수립
2. **내부 통신 (Internal Runtime Messaging)**: `popup.tsx`가 백그라운드 서비스 워커에 소켓 상태(`GET_SOCKET_STATUS`) 및 수집 지시 질의
3. **콘텐츠 통신 (Internal Tab Messaging)**: `background.ts` 및 `popup.tsx`가 현재 활성 탭의 `content.ts`로 DOM 수집 명령(`COLLECT_FULL_DOM`) 전달

---

## 2. 백엔드 WebSocket 통신 지침

2.1 **접속 URL 규격**: WebSocket 접속 엔드포인트는 `ws://<host>:<port>?clientId=<UUID>&clientType=plugin` 규격을 준수해야 합니다.  
2.2 **연결 주체**: 외부 소켓 연결은 오직 `background.ts` 서비스 워커에서만 단행하며, `popup.tsx`가 직접 백엔드 소켓을 연결해서는 안 됩니다.  
2.3 **무중단 재연결 루프**:
   - 소켓 절단(`onclose`) 또는 예외(`onerror`) 감지 시 `socket = null`로 초기화 후 3초 유휴 주기를 두고 재귀 재연결을 단행해야 합니다.
   - 이미 소켓이 연결 상태(`OPEN`)이거나 연결 중(`CONNECTING`)일 경우 중복 연결 생성을 방지해야 합니다.
2.4 **초기 안착 패킷 (Hello Packet)**: 소켓 연결 성공(`onopen`) 즉시 서버로 `CRAWL_LOG` 액션 기반의 안착 알림 패킷을 송출해야 합니다.

---

## 3. 내부 크롬 메시징 지침 (`chrome.runtime` & `chrome.tabs`)

### 3.1 팝업-백그라운드 간 상태 동기화 (`GET_SOCKET_STATUS`)
- `popup.tsx` 마운트 시 `chrome.runtime.sendMessage({ type: 'GET_SOCKET_STATUS' })`를 호출하여 백그라운드의 실제 소켓 연결 여부(`socket.readyState === WebSocket.OPEN`)를 질의해야 합니다.
- `background.ts`는 질의 수신 시 현재 소켓 연결 여부 및 스토리지의 `clientId`를 즉시 응답해야 합니다.

### 3.2 수집 데이터 전달 파이프라인 (`RAW_DOM_DATA`)
- `content.ts` 또는 `popup.tsx`에서 수집된 DOM 데이터는 `RAW_DOM_DATA` 메시지 타입으로 `background.ts`에 전송되어야 합니다.
- `background.ts`는 해당 데이터를 검증한 후 백엔드 WebSocket으로 릴레이 수송합니다.

---

## 4. 메시지 채널 유실 방지 및 `return true;` 사용 가드

`chrome.runtime.onMessage.addListener`에서 발생하는 `Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed...` 에러를 방지하기 위해 아래 규칙을 엄격히 적용합니다.

4.1 **선택적 `return true;` 반환**:
   - `return true;`는 메시지 리스너 함수 최하단에서 무조건 반환해서는 안 됩니다.
   - 오직 **비동기 작업(Promise, 스토리지 조회 등) 완료 후 `sendResponse()`를 반드시 호출하는 특정 메시지 처리 분기 블록 내부에서만 선택적으로 `return true;`를 반환**해야 합니다.
4.2 **동기 처리 시 `return false;` 반환**:
   - `sendResponse()`를 즉시 동기식으로 호출하거나 비동기 응답이 필요 없는 메시지 타입 분기에서는 `return false;` 또는 명시적 리턴을 생략해야 합니다.
4.3 **`try-catch` 가드 연동**:
   - 메시지 송신 측 팝업 창이 닫혀 수신 채널이 이미 소멸된 상태에서 `sendResponse()` 호출 시 발생할 수 있는 런타임 예외를 방지하기 위해 `try-catch` 구문으로 가드해야 합니다.

---

## 5. 통신 에러 구분 및 예외 처리 지침

5.1 **콘텐츠 스크립트 에러 vs 서버 오프라인 분리**:
   - `chrome.tabs.sendMessage` 실행 시 `chrome.runtime.lastError`가 발생한 것은 해당 탭에 `content.ts`가 미주입 상태(예: `chrome://` 페이지 또는 새로고침이 필요한 탭)임을 의미합니다.
   - 이때 팝업의 서버 연동 상태(`isServerOnline`)를 오프라인으로 전환해서는 안 되며, "페이지 스크립트 미연결 (페이지 새로고침 후 재시도)" 상태 메시지만 표시해야 합니다.
5.2 **서비스 워커 종결(Termination) 대응**:
   - Chrome MV3 서비스 워커 비활성화 후 재기동 시, 팝업 요청이 유입되면 `connectToServer()`를 즉시 호출하여 소켓 재연결을 단행해야 합니다.
