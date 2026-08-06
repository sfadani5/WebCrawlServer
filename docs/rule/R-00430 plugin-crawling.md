# R-00430 docs/rule/R-00430 plugin-crawling.md

본 문서는 `WebCrawlServer` 프로젝트의 브라우저 확장 플러그인 DOM 크롤링 및 콘텐츠 스크립트 지침입니다. 콘텐츠 스크립트(`content.ts`)의 주입, 페이지 메타데이터 추출, 전체 DOM 수집, 원격 크롤링 지시 명령 연동 및 크롤링 실행 가드를 정의합니다.

---

## 1. 개요 및 주입 범위

1.1 **역할**: 콘텐츠 스크립트(`content.ts`)는 활성화된 웹 페이지 DOM 에이전트로 주입되어, 브라우저에서 실행 중인 타깃 페이지의 DOM 데이터를 수집하고 이를 백그라운드로 전달합니다.  
1.2 **주입 범위**: `manifest.json` 내 `content_scripts`에 `"matches": ["<all_urls>"]`로 지정되어 일반 웹 HTTP/HTTPS 페이지에 자동 주입됩니다.  
1.3 **실행 격리**: DOM 탐색 연산은 브라우저 탭 격리 컨텍스트에서 수행되며, 메인 웹 페이지의 전역 JavaScript 변수 오염을 방지해야 합니다.  

---

## 2. 수집 모드 및 패킷 규격

콘텐츠 스크립트는 2가지 수집 명령 모드를 수용하도록 작성되어야 합니다.

### 2.1 요약 메타데이터 수집 모드 (`START_DOM_CRAWL`)
- **수집 대상**:
  - 현재 페이지 URL (`window.location.href`)
  - 페이지 제목 (`document.title`)
  - 상위 하이퍼링크 목록 (`document.querySelectorAll("a")` 탐색 후 최대 15개 유효 `href` 추출)
  - 수집 타임스탬프 (`Date.now()`)
- **패킷 송출**: 수집 완료 즉시 `chrome.runtime.sendMessage`를 통해 `RAW_DOM_DATA` 타입으로 백그라운드로 전송합니다.

### 2.2 전체 DOM 원본 수집 모드 (`COLLECT_FULL_DOM`)
- **수집 대상**:
  - 현재 페이지 URL 및 제목
  - 페이지 전체 HTML 원본 소스 (`document.documentElement.outerHTML`)
  - 수집 타임스탬프
- **응답 처리**: 백그라운드/팝업으로 `RAW_DOM_DATA` 전송과 동시에 동기식 `sendResponse({ success: true, data: domData })`를 응답해야 합니다.

---

## 3. 원격 크롤링 제어 연동 (`CRAWL_START` / `CRAWL_STOP`)

3.1 백엔드 서버나 관리자 대시보드로부터 `CRAWL_START` 명령이 백그라운드로 유입되면, 백그라운드는 현재 활성화된 탭(`chrome.tabs.query`)의 콘텐츠 스크립트로 `START_DOM_CRAWL` 지시를 침투 주입합니다.  
3.2 수집 매개변수(탐색 깊이 `depth`, 대상 URL 패턴 등)가 존재하는 경우 페이로드에 포함하여 크롤링 동작을 제어해야 합니다.  

---

## 4. 크롤링 안전성 및 성능 가드

4.1 **특수 URL 침투 금지 가드**:
   - `chrome://`, `chrome-extension://`, `about:blank` 등 크롬 내부 특수 페이지에서는 콘텐츠 스크립트 메시징 수신 시 예외를 발생시키지 않고 조용히 수신을 거부해야 합니다.
4.2 **메모리 및 DOM 폭탄 방지**:
   - 지나치게 거대한 DOM(예: 10MB 이상의 무한 스크롤 페이지) 인출 시 브라우저 메인 쓰레드가 멈추지 않도록 필요 시 직렬화 크기를 가드합니다.
4.3 **메시지 리스너 리턴 가드**:
   - `content.ts` 내 `chrome.runtime.onMessage.addListener`는 동기 처리 완료 후 `sendResponse()`를 동기식으로 호출하고 `return false;`를 반환하여 크롬 비동기 채널 에러를 원천 차단해야 합니다.
