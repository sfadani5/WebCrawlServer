# R-00400 docs/rule/R-00400 plugin-guidelines.md

본 문서는 `WebCrawlServer` 프로젝트의 브라우저 확장 플러그인 개발 및 운영을 위한 최상위 통합 지침 문서입니다. 플러그인 시스템의 전체적인 맥락, 시스템 아키텍처 개요, 개발 원칙 및 하위 세부 규칙 문서(`R-00410` ~ `R-00460`)로 연결되는 통합 목차(Index) 역할을 담당합니다.

---

## 1. 개요 및 적용 범위

1.1 **적용 대상**: `plugins/basic-plugin/` 패키지 및 향후 본 프로젝트에 추가되는 모든 브라우저 확장 프로그램  
1.2 **표준 규격**: Chrome Extension Manifest V3 (MV3) 표준 규격 준수  
1.3 **기술 스택**: Node.js, TypeScript, ESM(`import`/`export`), React 19, Vite, Tailwind CSS  
1.4 **운영 목적**: 웹 페이지 DOM 데이터 및 시스템 메타데이터를 실시간으로 수집하여 로컬 백엔드 서버(포트 9600)로 영속적으로 중계 적재 및 원격 제어 수용  

---

## 2. 플러그인 전체 시스템 맥락

```
[ 웹 페이지 (Tab) ]
       │  ▲
       │  │ (COLLECT_FULL_DOM / START_DOM_CRAWL)
       ▼  │
[ content.ts (콘텐츠 스크립트) ]
       │  ▲
       │  │ (chrome.runtime.sendMessage)
       ▼  │
[ background.ts (서비스 워커) ] ◄── (상태 질의) ── [ popup.tsx (UI) ]
       │  ▲
       │  │ (WebSocket : ws://localhost:9600?clientId=<UUID>&clientType=plugin)
       ▼  │
[ WebCrawlServer (Express/SQLite) ] ── (실시간 브로드캐스트) ──► [ Admin Dashboard ]
```

### 2.1 주요 실행 주체 및 역할
- **`background.ts` (서비스 워커)**: 백엔드 서버와 무중단 WebSocket 통신 수립, 3초 주기 자동 재연결, 노드 ID(`clientId`) 발급 및 보존, 메시지 중계
- **`content.ts` (콘텐츠 스크립트)**: 웹 페이지 DOM에 직접 주입되어 메타데이터(URL, 제목, 하이퍼링크) 및 전체 DOM(`outerHTML`) 추출
- **`popup.tsx` (사용자 UI)**: 노드 상태 확인, 탭 스위칭(`기본` \| `정보` \| `디버깅`), 마우스 드래그 크기 조절, 커스텀 디버그 메시지 전송
- **`manifest.json` (매니페스트)**: MV3 권한 선언 및 확장 프로그램 진입점 명시

---

## 3. R-004xx 플러그인 세부 지침 인덱스 (Rule Registry)

플러그인 관련 작업 수행 시 아래의 10단위 대분류 세부 규칙 문서를 참조하여 개발을 단행합니다.

| Rule ID | 문서 경로 | 대분류 및 담당 범위 |
|---|---|---|
| **R-00400** | `docs/rule/R-00400 plugin-guidelines.md` | **통합 기본 지침**: 본 문서. 플러그인 전체 맥락, 개발 개요 및 하위 지침 목차 |
| **R-00410** | `docs/rule/R-00410 plugin-architecture.md` | **모듈화 아키텍처**: 계층화 구조(`types`, `services`, `hooks`, `components`), 소스 파일 분리 기준 |
| **R-00420** | `docs/rule/R-00420 plugin-communication.md` | **통신 및 메시징**: WebSocket 연동, 무중단 재연결 루프, `chrome.runtime` 비동기 채널 가드 |
| **R-00430** | `docs/rule/R-00430 plugin-crawling.md` | **DOM 크롤링**: 콘텐츠 스크립트(`content.ts`), 메타데이터 인출, 전체 DOM(`outerHTML`) 수집 지침 |
| **R-00440** | `docs/rule/R-00440 plugin-ui-ux.md` | **UI/UX 디자인**: 팝업 탭 네비게이션, 마우스 드래그 크기 조절(`resize`), 텍스트 선택 허용 |
| **R-00450** | `docs/rule/R-00450 plugin-build-env.md` | **빌드 및 환경변수**: Vite `define` 기반 빌드 타임 상수(`POPUP_WIDTH`, `SERVER_PORT`) 주입 및 설정 |
| **R-00460** | `docs/rule/R-00460 plugin-manifest-permissions.md` | **매니페스트 및 권한**: Manifest V3 규격, 35종 권한(`permissions`) 관리, JSON 주석 금지 규칙 |

---

## 4. 플러그인 개발 핵심 운영 원칙 요약

4.1 **단일 책임 및 파일 분리**: 200라인을 초과하는 소스 파일은 `R-00410`에 따라 타입, 서비스, 훅, 컴포넌트로 분리해야 합니다.  
4.2 **비동기 채널 안전성**: `chrome.runtime.onMessage.addListener`에서 `return true;` 반환은 `R-00420`에 따라 비동기 `sendResponse` 호출 분기로만 제한하여 채널 닫힘 에러를 방지합니다.  
4.3 **빌드 상수 자동 주입**: 팝업 크기, 서버 포트/호스트 등 모든 초기 설정값은 `R-00450`에 따라 Vite 빌드 시점에 상수로 치환 주입되어 산출물 JS에 반영되어야 합니다.  
4.4 **드래그 조절 및 선택 지원**: 팝업 UI는 `R-00440`에 따라 마우스 드래그 크기 조절(`resize: both`)과 마우스 텍스트 선택(`user-select: text`)을 보장해야 합니다.  
4.5 **매니페스트 주석 금지**: `manifest.json` 내부에는 주석 작성이 금지되며, 권한 설명은 `R-00460`에 따라 별도 마크다운 문서(`manifest.json.md`)에 분리 기록합니다.  

---

## 5. 규칙 변경 및 관리 절차

- 본 가이드라인 및 하위 세부 지침 문서를 변경할 경우 `AGENTS.md` 및 `docs/rule/R-00000 instructions.md` 인덱스를 동시 갱신해야 합니다.
- 새로운 대분류 문서가 필요한 경우 `10단위` 간격(`R-00470`, `R-00480` 등)으로 신설하며, 세부 하위 규정은 `1단위` 번호(`R-00411`, `R-00412` 등)를 부여합니다.
