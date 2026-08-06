# R-00460 docs/rule/R-00460 plugin-manifest-permissions.md

본 문서는 `WebCrawlServer` 프로젝트의 브라우저 확장 플러그인 매니페스트 및 권한 관리 지침입니다. Chrome Extension Manifest V3(MV3) 규격 준수, API 권한(`permissions`) 선언 원칙, `manifest.json` 내부 주석 작성 금지 및 분리 문서화 규칙을 정의합니다.

---

## 1. 개요 및 Manifest V3 규격 원칙

1.1 **버전 규격**: 모든 확장 프로그램 매니페스트는 `"manifest_version": 3` 표준을 준수해야 합니다.  
1.2 **백그라운드 가동**: 백그라운드 스크립트는 MV3 서비스 워커 표준(`"background": { "service_worker": "background.js", "type": "module" }`)으로 등록되어야 합니다.  
1.3 **최소 권한 원칙**: 플러그인 동작에 필요한 권한만 명시적으로 선언하여 보안성 및 크롬 웹스토어 심사 통과 가능성을 제고합니다.  

---

## 2. 매니페스트 주석 금지 및 분리 기록 규칙 (절대 규칙)

2.1 **`manifest.json` 주석 작성 엄격 금지**:
   - Chrome 확장 프로그램의 매니페스트 파서(`JSON.parse`)는 표준 JSON 포맷만 지원합니다.
   - `manifest.json` 내부에 `//` 주석이나 `/* */` 주석을 작성할 경우 **Chrome에서 확장 프로그램 로드가 완전 거부(Syntax Error)**됩니다.
2.2 **`manifest.json.md` 분리 설명 문서 작성 필수**:
   - 선언된 모든 권한의 역할, 활용 목적 및 보안 영향도는 `manifest.json` 파일과 동일한 위치에 **`manifest.json.md`** 마크다운 파일로 작성하여 주석 역할을 대체해야 합니다.

---

## 3. 권한(Permissions) 분류 및 선언 기준

권한은 범용 API 권한(`permissions`)과 네트워크 호스트 접근 권한(`host_permissions`)으로 명확히 구분하여 선언합니다.

### 3.1 `permissions` (API 접근 권한)
프로젝트에서 활용할 수 있는 주요 35종 권한 목록은 다음과 같습니다.
- `activeTab`, `alarms`, `bookmarks`, `browsingData`, `clipboardRead`, `clipboardWrite`, `contextMenus`, `cookies`, `declarativeNetRequest`, `downloads`, `gcm`, `geolocation`, `history`, `idle`, `management`, `notifications`, `offscreen`, `pageCapture`, `power`, `printerProvider`, `privacy`, `proxy`, `scripting`, `sessions`, `storage`, `system.cpu`, `system.memory`, `system.storage`, `tabCapture`, `tabs`, `topSites`, `tts`, `ttsEngine`, `webNavigation`, `webRequest`

### 3.2 `host_permissions` (네트워크 접근 권한)
- 웹 페이지 DOM 수집 및 로컬 백엔드 서버 통신을 위해 `"host_permissions": ["<all_urls>"]`를 지정합니다.

---

## 4. 매니페스트 핵심 구성 요소 지침

4.1 **`action`**: 팝업 페이지(`popup.html`) 및 16, 32, 48, 128 크기별 툴바 아이콘 지정  
4.2 **`content_scripts`**: 타깃 페이지 주입 조건(`"matches": ["<all_urls>"]`) 및 콘텐츠 스크립트(`content.js`) 지정  
4.3 **`icons`**: 확장 프로그램 관리 페이지 및 툴바 표시용 PNG 아이콘 자산 등록  

---

## 5. 매니페스트 변경 시 검증 절차

- `manifest.json` 수정 후 빌드 명령(`npm run build --workspace=basic-plugin`)을 실행합니다.
- Chrome 확장 프로그램 관리 페이지(`chrome://extensions/`)에서 [새로고침]을 눌러 구문 에러 없이 정상 로드되는지 검증합니다.
