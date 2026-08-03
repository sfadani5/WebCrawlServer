# R-00400 docs/rule/R-00400 plugin-guidelines.md

`WebCrawlServer` 브라우저 플러그인 수집 및 통신 지침 문서입니다. 본 문서는 플러그인의 식별, 서버 WebSocket 연결, 콘텐츠 수집 이벤트 전달, 재연결 루프, 메시지 수신 처리 원칙을 정의합니다.

## 적용 범위

- `plugins/basic-plugin/src/` 기반 브라우저 확장 기능
- `background.ts`, `content.ts`, `popup.tsx` 등 플러그인 구성 요소
- 플러그인 식별자 생성 및 저장, 서버 재연결, 수집 데이터 송신

## 주요 지침

### 1. 플러그인 식별

1.1 플러그인은 `chrome.storage.local`에 `clientId`를 저장하고 재사용해야 합니다.
1.2 `clientId`가 없을 경우 `crypto.randomUUID()`를 생성하여 저장해야 합니다.
1.3 `clientType`은 `plugin`으로 고정해야 합니다.

### 2. 서버 통신

2.1 플러그인은 `ws://localhost:9600?clientId=<clientId>&clientType=plugin` 형태로 서버에 WebSocket을 연결해야 합니다.
2.2 연결이 끊기면 3초 후 재연결 시도를 반복해야 합니다.
2.3 최초 연결 성공 시 `CRAWL_LOG` 또는 `HELLO` 성격의 기본 패킷을 서버로 전송하여 상태를 알립니다.

### 3. 수집 데이터 전달

3.1 수집 결과는 `action: "CRAWL_LOG"` 형태로 전송해야 합니다.
3.2 `payload`는 수집 데이터 원본을 포함하고, 필요 시 JSON 문자열화하여 로그로 전송합니다.
3.3 서버로 전송된 수집 로그는 서버의 `crawl_logs` 테이블에 동기적으로 적재되어야 합니다.

### 4. 메시지 수신 처리

4.1 플러그인은 관리자 명령 `CRAWL_START` 수신 시 `chrome.tabs.query` 및 `chrome.tabs.sendMessage`로 content script에 전달해야 합니다.
4.2 명령 파이프는 수신 오류가 발생해도 플러그인 자체가 종료되지 않도록 가드해야 합니다.
4.3 플러그인은 서버나 관리자 명령이 없는 경우에도 `background` 서비스 워커를 유지하며 재연결을 계속 시도해야 합니다.
