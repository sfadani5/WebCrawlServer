본 문서는 `WebCrawlServer` 브라우저 확장 플러그인의 매니페스트 및 권한 관리 개정 지침입니다. **사이드바(`sidePanel`)** 및 **오프스크린(`offscreen`)** 아키텍처 도입에 따른 매니페스트 V3 필수 권한 선언 규정, 36종 풀 권한(Permissions) 구성, `default_popup` 제거 규정, 및 `manifest.json` 내 주석 작성 금지 규칙을 정의합니다.

---

## 1. 개요 및 Manifest V3 기본 원칙

1.1 **버전 규격**: 모든 확장 프로그램 매니페스트는 `"manifest_version": 3` 표준 규격을 준수해야 합니다.  
1.2 **백그라운드 가동**: 백그라운드 스크립트는 MV3 서비스 워커 표준(`"background": { "service_worker": "background.js", "type": "module" }`)으로 등록되어야 합니다.  
1.3 **내부 운영용 풀 권한 세팅**: 스토어 미배포(개발자 모드 direct 로드) 내부 운영 방식이므로, 크롬 웹스토어의 권한 심사 제약 없이 확장 프로그램이 제공하는 36종 전 권한(Permissions)을 활성화하여 수집, 포스팅, 모니터링, 깃허브 연동 기능을 100% 가동합니다.

---

## 2. 매니페스트 주석 금지 및 분리 기록 규칙 (절대 규칙)

2.1 **`manifest.json` 주석 작성 엄격 금지**:
   - Chrome 확장 프로그램 매니페스트 파서(`JSON.parse`)는 주석을 허용하지 않으며, `//` 또는 `/* */` 주석 포함 시 **확장 프로그램 로드가 정지(Syntax Error)**됩니다.
2.2 **`manifest.json.md` 분리 설명 문서 작성 필수**:
   - 선언된 36종 권한의 활용 목적 및 보안 영향도는 동일 디렉터리의 **`manifest.json.md`** 마크다운 문서에 상세 기록하여 주석을 대체합니다.

---

## 3. 개정 표준 매니페스트 명세 (`plugins/basic-plugin/public/manifest.json`)

사이드바(`sidePanel`) 권한 및 전 권한이 반영된 36종 풀 권한 매니페스트 전문입니다.

```json
{
  "manifest_version": 3,
  "name": "기본 검증용 수집 플러그인",
  "version": "1.0.0",
  "description": "WebCrawlServer 분산 크롤링, 사이드바 및 오프스크린 무중단 연동 확장 프로그램",
  "permissions": [
    "sidePanel",
    "offscreen",
    "management",
    "activeTab",
    "alarms",
    "bookmarks",
    "browsingData",
    "clipboardRead",
    "clipboardWrite",
    "contextMenus",
    "cookies",
    "declarativeNetRequest",
    "downloads",
    "gcm",
    "geolocation",
    "history",
    "idle",
    "notifications",
    "pageCapture",
    "power",
    "printerProvider",
    "privacy",
    "proxy",
    "scripting",
    "sessions",
    "storage",
    "system.cpu",
    "system.memory",
    "system.storage",
    "tabCapture",
    "tabs",
    "topSites",
    "tts",
    "ttsEngine",
    "webNavigation",
    "webRequest"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  "action": {
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": [
        "<all_urls>"
      ],
      "js": [
        "content.js"
      ]
    }
  ]
}
```

---

## 4. 매니페스트 주요 구성 요소 가이드

4.1 **`sidePanel` & `side_panel`**:
   - 우측 상시 사이드바 대시보드를 사용하기 위해 필수 선언하며, 기본 진입 HTML을 `"sidepanel.html"`로 지정합니다.
4.2 **`offscreen`**:
   - 24시간 무중단 백그라운드 웹소켓 연결 및 `fetch()` 경량 인출 엔진을 유지하기 위해 필수 선언합니다.
4.3 **`management`**:
   - 설치된 타 확장 프로그램 감지 및 제어를 위해 선언합니다.
4.4 **`action` 항목의 `default_popup` 제거**:
   - 툴바 아이콘 클릭 시 팝업 대신 사이드바가 즉시 열리도록 `default_popup` 속성을 완전히 삭제합니다.
4.5 **`host_permissions` (`<all_urls>`)**:
   - 모든 웹사이트의 DOM 데이터 수집, 세션 쿠키 활용, 백그라운드 `fetch()` 고속 인출을 위해 전체 도메인 허용을 유지합니다.

---

## 5. 검증 절차

- `manifest.json` 수정 후 빌드 명령(`npm run build --workspace=basic-plugin`)을 단행합니다.
- 크롬 확장 프로그램 관리 페이지(`chrome://extensions/`)에서 [새로고침]을 클릭하여 구문 에러 없이 정상 로드되는지 검증합니다.
- `manifest.json` 내부에 어떠한 주석 구문(`//` 또는 `/* */`)도 포함되지 않았는지 확인합니다.
