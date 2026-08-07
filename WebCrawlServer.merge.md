## AGENTS.md

# WebCrawlServer - AI 에이전트 통합 지침 (AGENTS.md)

> 버전: 0.7.0
> 작성자: 사용자 & AI
> 수정일: 2026-08-05
> 검토일: 2026-08-05
> 수정 이유:
>   1) 사이드바 단일 UI 통합 및 24시간 오프스크린 무중단 소켓 아키텍처 반영 (크롬 포트 연결 기반 사이드바 열림/닫힘 상태 추적)
>   2) 동적 워커 빌더, `databases/workers/` 멀티 DB, 대용량 물리 파일 분리 저장소 및 노드 별칭/환경설정 매니저 반영
>   3) 크롬 메시징 예외 가드(`sendMessage().catch()`) 및 DDL 예약어 충돌 검증 규칙 반영
>   4) 신규 규칙 레지스트리(`R-00206`~`R-00208`, `R-00303`~`R-00304`, `R-00470`~`R-00490`) 전체 반영
> 관련 문서: docs/rule/R-00000 instructions.md(R-00000), docs/rule/ 하위 전체 문서
> 영향 범위: 프로젝트 루트, docs/rule/ 전체, 백엔드, 관리자 UI, 브라우저 플러그인
> Breaking Change 여부: 있음 (사이드바+오프스크린 통합, 워커/멀티 DB 확장 및 물리 파일 분리 저장소)
> 프로젝트: WebCrawlServer (브라우저 플러그인 + 로컬 WebSocket/REST 서버 + 관리자 대시보드 모노레포)

> **보류(Deferred)**: 문서 내 Git/GitHub 자동화 및 통합 관련 항목은 현재 우선순위에서 제외됩니다. 깃허브 연동은 백로그로 관리되며, 즉시 구현 권고나 자동화 제안에서 제외해 주십시오.

---

## 0. 문서 참조 구조

### 0.1 문서 계층 및 역할

각 문서는 아래와 같은 역할과 우선순위를 가진다. 위쪽이 상위 문서이며, 하위 문서는 상위 문서의 범위를 벗어나는 내용을 임의로 정의할 수 없다.

```
AGENTS.md                    Root Rule   — 최상위 절대 규칙 (언어, 문서 위치, 우선순위, 소스 헤더/주석 규칙 등)
        ↓
docs/rule/*.md               실무 규칙   — 개발/운영 세부 지침 (아키텍처, 워커 빌더, 멀티 DB, 관리자 UI, 사이드바 등)
        ↓
docs/ask.md                  요청사항    — 사용자가 남긴 작업 요청 원문
        ↓
docs/todo.md                 현재 작업   — 요청을 바탕으로 AI가 세운 실행 계획
        ↓
README.md                    프로젝트 설명 — 외부/신규 참여자를 위한 개요
```

- `AGENTS.md`는 다른 모든 문서보다 우선하는 최상위 지시서다.
- `docs/rule/` 하위 문서(`R-00000`, `R-00100`~`R-00490`)는 `AGENTS.md`가 위임한 실무 세부 규칙 문서다. `instructions.md`(R-00000)는 인덱스 역할을 수행한다.
- `docs/ask.md`/`docs/todo.md`는 특정 작업 단위의 요청·계획을 담는 문서이며, 규칙 문서의 내용을 무시하는 근거로 사용할 수 없다.
- `README.md`, `AGENTS.md`, `replit.md`는 규칙 문서가 아니며 프로젝트 루트에 위치해야 한다. `docs/rule/AGENTS.md` 같은 복제본은 금지한다.

### 0.2 Rule Registry

작업 주제에 맞는 문서만 골라 읽는다. 신규 지침 문서는 `AGENTS.md`와 `R-00000 instructions.md`에 동시에 등록한다.

| Rule ID | 문서 경로 | 범위 및 담당 내용 |
|---|---|---|
| R-00000 | docs/rule/R-00000 instructions.md | 규칙 문서 인덱스 (본 표의 원본, 상세 안내) |
| R-00100 | docs/rule/R-00100 architecture.md | 프로젝트 개요, 시스템 구성, 개발 범위 |
| R-00101 | docs/rule/R-00101 tech-stack.md | 기술 스택 및 버전 호환성 규격 |
| R-00102 | docs/rule/R-00102 structure.md | 폴더 구조, 명명 규칙, 모듈 생성/구조 |
| R-00103 | docs/rule/R-00103 workflow-management.md | ask/todo 운영 절차, 이력 관리, ADR |
| R-00104 | docs/rule/R-00104 versioning.md | Git, 버전 관리, 문서 버전 형식 |
| R-00105 | docs/rule/R-00105 communication.md | 커뮤니케이션 가이드, 응답 구조 |
| R-00106 | docs/rule/R-00106 coding.md | 코드 작성 규칙, 소스 헤더 및 주석 표준 |
| R-00107 | docs/rule/R-00107 security.md | 예외 처리 및 일반 보안 정책 |
| R-00108 | docs/rule/R-00108 testing.md | 단위/통합 테스트 도구, 환경, 작성 규칙 및 가이드 |
| R-00200 | docs/rule/R-00200 mcp.md | MCP 프로토콜, 워크플로우 스텝 타입 |
| R-00201 | docs/rule/R-00201 scheduler.md | 스케줄러, 작업 상태, 동시 실행 정책 |
| R-00202 | docs/rule/R-00202 monitoring.md | 모니터링, 리소스 사용량 수집 |
| R-00203 | docs/rule/R-00203 database.md | DB 스키마, 마이그레이션, 백업, 관리자 UI API |
| R-00204 | docs/rule/R-00204 logging.md | 로그 기록 정책, 로그 분류 |
| R-00205 | docs/rule/R-00205 auth.md | 페이지 인증, Basic Auth, bcryptjs, 자격증명 변경 API |
| R-00206 | docs/rule/R-00206 server-node-session-management.md | 백엔드 세션 상태 메타, 별칭(Alias) 및 통신 라우팅 규격 |
| R-00207 | docs/rule/R-00207 server-worker-engine-and-multi-db.md | 동적 서버 워커 엔진, 멀티 DB 동적 생성 및 매핑 규격 |
| R-00208 | docs/rule/R-00208 local-file-storage-system.md | 대용량 HTML/바이너리 물리 파일 분리 저장소 지침 |
| R-00300 | docs/rule/R-00300 admin-guidelines.md | 관리자 제어 기능 및 운영 UI 지침 |
| R-00301 | docs/rule/R-00301 admin-development-guidelines.md | 관리자 UI 개발 및 모듈화 아키텍처 지침 |
| R-00302 | docs/rule/R-00302 admin-ui-ux-guidelines.md | 관리자 UI/UX 디자인 및 시각적 일관성 가이드 |
| R-00303 | docs/rule/R-00303 admin-node-monitoring.md | 관리자 대시보드 노드 배지 및 노드 환경설정 모달 지침 |
| R-00304 | docs/rule/R-00304 admin-worker-and-db-manager.md | 관리자 대시보드 워커 빌더 & DB 매니저 UI 개발 지침 |
| R-00400 | docs/rule/R-00400 plugin-guidelines.md | 플러그인 통합 지침, 전체 맥락 및 하위 문서 인덱스 |
| R-00410 | docs/rule/R-00410 plugin-architecture.md | 플러그인 모듈화 아키텍처, 계층 구조 및 파일 분리 지침 |
| R-00420 | docs/rule/R-00420 plugin-communication.md | WebSocket 연동, 무중단 재연결 및 크롬 메시징 가드 지침 |
| R-00430 | docs/rule/R-00430 plugin-crawling.md | DOM 크롤링, 콘텐츠 스크립트(`content.ts`) 및 메타 수집 지침 |
| R-00440 | docs/rule/R-00440 plugin-ui-ux.md | 사이드바 대시보드 UI/UX 디자인 및 레이아웃 지침 |
| R-00450 | docs/rule/R-00450 plugin-build-env.md | Vite define 기반 빌드 타임 상수 주입 및 다중 엔트리 지침 |
| R-00460 | docs/rule/R-00460 plugin-manifest-permissions.md | Manifest V3, 권한 관리 및 JSON 주석 금지 지침 |
| R-00470 | docs/rule/R-00470 plugin-sidepanel-offscreen.md | 사이드바 통합 UI & 오프스크린 무중단 아키텍처 지침 |
| R-00480 | docs/rule/R-00480 plugin-automation-crawling.md | 백그라운드 경량 수집 및 다중 포스팅 지침 |
| R-00490 | docs/rule/R-00490 plugin-github-integration.md | 깃허브 REST API 연동 및 토큰 동기화 지침 |

---

## 1. 에이전트 핵심 우선순위 지침 (최상위 규칙)

아래 항목은 다른 모든 규칙보다 우선 적용되며, 예외 없이 준수한다.

### 1.1 언어 및 소스 코드 작성 규칙 (예외 없음)
- **한글 사용 규칙**: 모든 답변, 코드 주석, 커밋 메시지, 문서 설명은 **한글로만 작성**한다. 변수명·함수명·클래스명 등 코드 식별자는 영문을 사용하되 주석과 서술문은 한글이어야 한다.
- **소스 코드 헤더 명시**: 모든 소스 코드(.ts, .tsx, .js, .css 등) 및 문서 출력물 최상단 1열에는 **상대 파일 경로와 파일 이름**을 반드시 주석으로 표기한다. (예: `// plugins/basic-plugin/src/sidepanel.tsx`)
- **코드 문서화 주석 표준**: 소스 코드 내의 주요 기능, 함수(JSDoc 매개변수/반환값), 클래스, 메서드, 주요 변수 및 상수에 대해 상세한 한글 주석을 필수 작성한다.
- **ESM 모듈 규격**: 모든 코드는 ESM(ECMAScript Modules) 규격(`import`/`export`)을 기준으로 개발한다. CommonJS(`require`/`module.exports`) 방식은 사용하지 않는다.

### 1.2 소통 및 문서화 위치 규칙
- 모든 마크다운(.md) 문서는 프로젝트 루트가 아닌 **`docs/` 디렉토리 하위의 관련 폴더**에 생성한다. (`AGENTS.md`, `README.md`는 프로젝트 루트에 위치)
- 마케팅성/주관적 수식어 사용을 금지하며 기술적 사실과 수치, 파일 경로 기반으로 작성한다.

### 1.3 문서 간 우선순위 규칙
```
1순위  System (실행 환경 지침)
2순위  AGENTS.md
3순위  docs/rule/*.md
4순위  docs/ask.md
5순위  docs/todo.md
6순위  README.md
```

---

## 2. 작업 종료 시 최소 확인 사항

- 코드가 정상적으로 실행/컴파일되는지 확인했는가
- 소스 코드 최상단에 파일 경로 및 파일 이름 주석이 명시되었는가
- 주요 기능, 함수, 클래스, 변수/상수에 상세한 한글 주석이 작성되었는가
- `AGENTS.md` 및 관련 `docs/rule/*.md` 문서의 규칙을 위반하지 않았는가
- `docs/todo.md`의 완료 항목 정리 및 `docs/todo.history.md`에 이력을 기록했는가

---

> **주의:** 본 지침을 위반하는 코드/문서는 작성하지 않는다. 실무 세부 규칙은 0.2 Rule Registry의 각 `docs/rule/*.md` 문서를 따른다.

---

## README.md

# WebCrawlServer

> **주의(보류)**: 문서 및 코드베이스 곳곳에 깃허브(GitHub) 자동 커밋/푸시 관련 내용이 기술되어 있으나, 해당 자동화 기능은 현재 우선순위에서 제외(백로그)되어 있습니다. 즉시 구현·배포 권고에서는 제외해 주십시오.

WebCrawlServer는 브라우저 확장 플러그인, React 기반 관리자 대시보드, Express/SQLite 백엔드를 하나의 모노레포로 통합한 분산 크롤링 수집 플랫폼입니다.

플러그인은 웹 페이지 DOM 데이터를 수집하여 서버로 실시간 전송하고, 관리자는 수집 기기를 제어하며 수집 로그를 확인할 수 있습니다.

---

## 핵심 기능

- 브라우저 확장 플러그인(MV3)으로 현재 탭 DOM 데이터를 수집
- WebSocket 기반 실시간 통신으로 플러그인/관리자/서버 간 메시지 중계
- SQLite 기반 영구 저장소에 크롤링 로그와 클라이언트 연결 정보 기록
- 관리자 UI에서 클라이언트 목록 조회, 강제 추방, 로그 일괄 삭제 지원
- `PM2` 기반 백그라운드 서버 운영을 위한 명령어 제공

---

## 프로젝트 구성

### 루트

- `package.json`: 워크스페이스 설정 및 전체 실행 스크립트
- `tsconfig.base.json`, `tsconfig.json`: TypeScript 공통 설정
- `AGENTS.md`: AI 에이전트 통합 지침 최상위 문서
- `README.md`: 프로젝트 개요 및 운영 안내
- `.agents/`: 사용자 정의 스킬 및 에이전트 확장 파일
- `docs/`: 규칙, 요청, 결정, 이력 문서
- `databases/`: SQLite 데이터베이스 저장 위치
- `logs/`: 운영 로그 저장소

### 하위 워크스페이스

- `server/`: Express + WebSocket 백엔드 서버
- `admin/`: React + Vite 관리자 대시보드
- `plugins/basic-plugin/`: 브라우저 확장 플러그인 개발 샘플

---

## 시스템 아키텍처

1. 브라우저 확장 플러그인(`plugins/basic-plugin/`) 백그라운드 워커가 `ws://localhost:9600?clientId=<uuid>&clientType=plugin`로 서버에 연결합니다.
2. content script는 현재 페이지 제목과 링크 목록을 수집하고 `RAW_DOM_DATA` 메시지로 백그라운드에 전달합니다.
3. 백그라운드 워커는 `CRAWL_LOG` WebSocket 패킷을 서버로 전송합니다.
4. 서버(`server/src/index.ts`)는 `crawl_logs` 테이블에 저장하고, 플러그인 통신 로그를 `logs/plugins_comm.log`에 기록합니다.
5. 관리자 대시보드(`admin/src/App.tsx`)는 `ws://localhost:9600?clientId=admin-main&clientType=admin`로 연결하고 REST API로 클라이언트 및 로그 데이터를 조회합니다.
6. 관리자는 `CRAWL_START`, `CRAWL_STOP` 명령을 타깃 클라이언트에 전송하여 원격 제어를 수행합니다.

---

## 주요 기술 스택

- Node.js + TypeScript + ESM
- Express 5, ws, better-sqlite3
- React 19, Vite 5, Tailwind CSS 3
- Chrome/Opera 확장 프로그램 MV3
- SQLite, PM2

---

## 문서 참조

- `AGENTS.md`: AI 에이전트 통합 지침 최상위 문서 (프로젝트 루트)
- `README.md`: 프로젝트 개요 및 운영 안내 (프로젝트 루트)
- `replit.md`: Replit 환경 문서 (프로젝트 루트)
- `docs/rule/R-00000 instructions.md`: 규칙 문서 인덱스
- `docs/rule/R-00100 architecture.md` ~ `docs/rule/R-00108 testing.md`: 개별 규칙 문서
- `docs/decision/v0.02.개발 환경 셋팅 가이드.md`: 로컬 PowerShell/Node.js 개발 환경 기준
- `docs/ask.md`, `docs/todo.md`: 작업 요청 및 계획

> 주의: `AGENTS.md`, `README.md`, `replit.md`는 반드시 프로젝트 루트에 위치해야 하며 `docs/rule/` 등에 복제본을 만들면 안 됩니다.
## 정리 및 유지보수

- `.gitignore`는 빌드 산출물, 생성된 JS 소스 아티팩트, 데이터베이스 파일, 로그를 추적에서 제외하도록 관리합니다.
- 개발 중 생성된 `admin/src/*.js`, `admin/src/*.js.map`, `plugins/basic-plugin/src/*.js`, `plugins/basic-plugin/src/*.js.map` 파일은 소스 디렉토리에 남기지 않고 제거해야 합니다.
- `package-lock.json`은 워크스페이스 의존성 잠금을 위해 유지하되, 의존성 변경 시 `npm install` 후 lock 파일 상태를 정리합니다.
---

## 실행 및 개발

### 전체 환경 설치

```powershell
npm install
```

### 관리자 개발 서버

```powershell
npm run admin:dev
```

### 플러그인 개발 빌드 감시

```powershell
npm run plugin:basic:dev
```

### 백엔드 서버 운영

```powershell
npm run server:start
npm run server:status
npm run server:logs
npm run server:stop
```

### 관리자 대시보드 운영

```powershell
npm run admin:start
npm run admin:status
npm run admin:logs
npm run admin:stop
```

### 정리 및 초기화

```powershell
npm run clean-reset
```

---

## 데이터 및 로그

- 데이터베이스: `databases/data.db`
- 서버 시스템 로그: `logs/server_system.log`
- 관리자 활동 로그: `logs/admin_activity.log`
- 플러그인 통신 로그: `logs/plugins_comm.log`

---

## 개발 가이드

- 모든 코드와 문서는 ESM 기준으로 작성합니다.
- Windows 11 / PowerShell 7 환경을 기준으로 명령어를 안내합니다.
- 프로젝트 문서 우선순위는 `AGENTS.md` > `docs/rule/*.md` > `docs/ask.md` > `docs/todo.md` > `README.md`입니다.
- AI 기반 협업 시 `docs/decision/v0.02.개발 환경 셋팅 가이드.md`와 `AGENTS.md`를 함께 참조합니다.

---

## 폴더 요약

- `server/src/`: 백엔드 엔트리포인트, WebSocket 및 REST API, DB 초기화, 로그 기능
- `admin/src/`: 관리자 UI 구성, WebSocket 연결, REST API 호출, 로그/클라이언트 관리
- `plugins/basic-plugin/src/`: 브라우저 플러그인 백그라운드, content script, popup UI
- `plugins/basic-plugin/public/`: MV3 확장 매니페스트 및 정적 자산
- `docs/`: 개발 규칙, 이력, 요청 문서




---

## docs/rule/R-00000 instructions.md

본 문서는 `WebCrawlServer` 프로젝트의 규칙 문서 인덱스입니다. 각 규칙 문서의 역할과 적용 범위를 안내하며, 신규 규칙 문서 추가 시 반드시 함께 갱신해야 합니다.

---

## 1. 사용 방법

1. `AGENTS.md`를 먼저 확인합니다.
2. 본 인덱스에서 해당 작업 주제에 맞는 `R-00N` 문서를 찾습니다.
3. 해당 `R-00N` 문서에서 구체 규칙을 확인합니다.
4. 필요 시 `docs/ask.md`와 `docs/todo.md`를 참고합니다.

---

## 2. 규칙 문서 목록 (Rule Registry Index)

| Rule ID | 문서 경로 | 범위 및 담당 내용 |
|---|---|---|
| **R-00000** | `docs/rule/R-00000 instructions.md` | 규칙 문서 인덱스 (본 표의 원본, 상세 안내) |
| **R-00100** | `docs/rule/R-00100 architecture.md` | 프로젝트 개요, 시스템 구성, 개발 범위 |
| **R-00101** | `docs/rule/R-00101 tech-stack.md` | 기술 스택 및 버전 호환성 규격 |
| **R-00102** | `docs/rule/R-00102 structure.md` | 폴더 구조, 명명 규칙, 모듈 생성/구조 |
| **R-00103** | `docs/rule/R-00103 workflow-management.md` | ask/todo 운영 절차, 이력 관리, ADR |
| **R-00104** | `docs/rule/R-00104 versioning.md` | Git, 버전 관리, 문서 버전 형식 |
| **R-00105** | `docs/rule/R-00105 communication.md` | 커뮤니케이션 가이드, 응답 구조 |
| **R-00106** | `docs/rule/R-00106 coding.md` | 코드 작성 규칙, 소스 헤더 및 주석 표준 |
| **R-00107** | `docs/rule/R-00107 security.md` | 예외 처리 및 일반 보안 정책 |
| **R-00108** | `docs/rule/R-00108 testing.md` | 단위/통합 테스트 도구, 환경, 작성 규칙 및 가이드 |
| **R-00200** | `docs/rule/R-00200 mcp.md` | MCP 프로토콜, 워크플로우 스텝 타입 |
| **R-00201** | `docs/rule/R-00201 scheduler.md` | 스케줄러, 작업 상태, 동시 실행 정책 |
| **R-00202** | `docs/rule/R-00202 monitoring.md` | 모니터링, 리소스 사용량 수집 |
| **R-00203** | `docs/rule/R-00203 database.md` | DB 스키마, 마이그레이션, 백업, 관리자 UI API |
| **R-00204** | `docs/rule/R-00204 logging.md` | 로그 기록 정책, 로그 분류 |
| **R-00205** | `docs/rule/R-00205 auth.md` | 페이지 인증, Basic Auth, bcryptjs, 자격증명 변경 API |
| **R-00206** | `docs/rule/R-00206 server-node-session-management.md` | 백엔드 세션 상태 메타, 별칭(Alias) 및 통신 라우팅 규격 |
| **R-00207** | `docs/rule/R-00207 server-worker-engine-and-multi-db.md` | 동적 서버 워커 엔진, 멀티 DB 동적 생성 및 매핑 규격 |
| **R-00208** | `docs/rule/R-00208 local-file-storage-system.md` | 대용량 HTML/바이너리 물리 파일 분리 저장소 지침 |
| **R-00300** | `docs/rule/R-00300 admin-guidelines.md` | 관리자 제어 기능 및 운영 UI 지침 |
| **R-00301** | `docs/rule/R-00301 admin-development-guidelines.md` | 관리자 UI 개발 및 모듈화 아키텍처 지침 |
| **R-00302** | `docs/rule/R-00302 admin-ui-ux-guidelines.md` | 관리자 UI/UX 디자인 및 시각적 일관성 가이드 |
| **R-00303** | `docs/rule/R-00303 admin-node-monitoring.md` | 관리자 대시보드 노드 배지 및 노드 환경설정 모달 지침 |
| **R-00304** | `docs/rule/R-00304 admin-worker-and-db-manager.md` | 관리자 대시보드 워커 빌더 & DB 매니저 UI 개발 지침 |
| **R-00400** | `docs/rule/R-00400 plugin-guidelines.md` | 플러그인 통합 지침, 전체 맥락 및 하위 문서 인덱스 |
| **R-00410** | `docs/rule/R-00410 plugin-architecture.md` | 플러그인 모듈화 아키텍처, 계층 구조 및 파일 분리 지침 |
| **R-00420** | `docs/rule/R-00420 plugin-communication.md` | WebSocket 연동, 무중단 재연결 및 크롬 메시징 가드 지침 |
| **R-00430** | `docs/rule/R-00430 plugin-crawling.md` | DOM 크롤링, 콘텐츠 스크립트(`content.ts`) 및 메타 수집 지침 |
| **R-00440** | `docs/rule/R-00440 plugin-ui-ux.md` | 사이드바 대시보드 UI/UX 디자인 및 레이아웃 지침 |
| **R-00450** | `docs/rule/R-00450 plugin-build-env.md` | Vite define 기반 빌드 타임 상수 주입 및 다중 엔트리 지침 |
| **R-00460** | `docs/rule/R-00460 plugin-manifest-permissions.md` | Manifest V3, 권한 관리 및 JSON 주석 금지 지침 |
| **R-00470** | `docs/rule/R-00470 plugin-sidepanel-offscreen.md` | 사이드바 통합 UI & 오프스크린 무중단 아키텍처 지침 |
| **R-00480** | `docs/rule/R-00480 plugin-automation-crawling.md` | 백그라운드 경량 수집 및 다중 포스팅 지침 |
| **R-00490** | `docs/rule/R-00490 plugin-github-integration.md` | 깃허브 REST API 연동 및 토큰 동기화 지침 (보류) |

---

## 3. 번호 분류 및 생성 원칙

- `R-001xx`: 통합 지침 / 개발 방향
- `R-002xx`: 시스템 / 서버
- `R-003xx`: 관리자 UI
- `R-004xx`: 플러그인 (10단위 확장형)
- `R-005xx`: 기록·운영·보관

### 신규 규칙 문서 추가 지침
- 새로운 규칙 문서를 추가할 때는 반드시 본 문서와 `AGENTS.md`의 Rule Registry 표를 동시에 갱신합니다.
- 두 표가 불일치할 경우 `AGENTS.md`가 최상위 기준으로 우선 적용됩니다.
- 신규 규칙 문서는 제목과 파일명 모두에 `R-00N` 번호를 반드시 포함해야 합니다. (예: `# R-00207 docs/rule/R-00207 server-worker-engine-and-multi-db.md`)

---

## 4. 문서 관리 및 우선순위

- 본 문서에서는 규칙 문서의 위치와 역할만 정의합니다.
- 세부 규칙은 각 `docs/rule/*.md` 문서를 따릅니다.
- 프로젝트 전체 문서 우선순위는 `AGENTS.md` > `docs/rule/*.md` > `docs/ask.md` > `docs/todo.md` > `README.md`입니다.

---

## docs/rule/R-00100 architecture.md

# R-00100 docs/rule/R-00100 architecture.md

`WebCrawlServer`는 모노레포 형태로 구성된 분산 크롤링 수집 플랫폼입니다. 브라우저 확장 플러그인, 관리자 대시보드, 백엔드 서버를 하나의 저장소에서 통합 운영합니다.

## 시스템 구성

- `server/`: Express 기반 HTTP 서버 및 WebSocket 서버가 통합된 백엔드
- `admin/`: React + Vite로 구현된 관리자 UI
- `plugins/basic-plugin/`: Chrome/Opera 확장 플러그인 샘플 패키지
- `databases/`: SQLite 데이터베이스 파일 저장소
- `logs/`: 서버 및 관리 활동 로그 저장소
- `docs/`: 규칙, 요청, 결정, 이력 문서

## 데이터 흐름

1. 브라우저 확장 플러그인이 `clientId`를 생성 및 저장합니다.
2. 플러그인 백그라운드 워커가 `ws://localhost:9600?clientId=<uuid>&clientType=plugin`로 WebSocket 연결을 수립합니다.
3. 크롤링 데이터는 content script에서 수집되어 `RAW_DOM_DATA` 메시지로 백그라운드에 전달됩니다.
4. 백그라운드 워커는 `CRAWL_LOG` 패킷을 서버로 전송합니다.
5. 서버는 `crawl_logs` 테이블에 로그를 저장하고, 필요 시 관리자 UI로 브로드캐스트합니다.
6. 관리자 UI는 `ws://localhost:9600?clientId=admin-main&clientType=admin`로 연결하여 실시간 상태를 감시합니다.
7. 관리자는 `CRAWL_START`, `CRAWL_STOP` 명령을 특정 플러그인 또는 전체 클라이언트에 전송합니다.

## 주요 역할

- 백엔드: 실시간 메시지 중계, REST API, 데이터베이스 초기화 및 로그 저장
- 관리자 UI: 클라이언트 리스트 조회, 로그 확인, 원격 제어 명령 송출
- 플러그인: 브라우저 DOM 데이터 수집, 서버 연결 유지, 제어 명령 수신

## 운영 범위

- 현재 시스템은 MCP 서버가 아닌 로컬 WebSocket/REST 통신을 중심으로 동작합니다.
- 로컬 개발 환경은 Windows 11 Home, PowerShell 7.6.1, Node.js v25.9.0을 기준으로 설계되었습니다.
- ESM 기반 TypeScript 코드를 기준으로 하며, 글로벌 패키지 설치를 지양하는 로컬 격리 원칙을 따릅니다.

## 확장 포인트

- 인증/권한을 도입할 때는 `auth.md` 지침에 따라 API 및 관리자 페이지 인증을 구현합니다.
- 테스트 및 자동화는 `testing.md` 지침을 참고하여 추가합니다.
- 운영 및 모니터링 기능 확장은 `monitoring.md`와 `logging.md`를 기준으로 설계합니다.




---

## docs/rule/R-00101 tech-stack.md

# R-00101 docs/rule/R-00101 tech-stack.md

`WebCrawlServer`는 경량 로컬 개발 환경과 모노레포 통합을 기반으로 설계되었습니다. 개발자는 본 프로젝트에서 사용하는 핵심 기술과 버전 호환성을 준수해야 합니다.

## 플랫폼 및 개발 환경

- 운영체제: Windows 11 Home
- 쉘: PowerShell 7.6.1
- Node.js: v25.9.0
- TypeScript: v5.7.2
- ESLint: v10.x
- 패키지 관리자: npm
- 백그라운드 프로세스 관리: PM2

## 백엔드

- Node.js + Express 5
- WebSocket: `ws`
- SQLite: `better-sqlite3`
- TypeScript ESM 모드 (`type":"module")
- REST API, 정적 파일 서빙, WebSocket 메시지 중계

## 관리자 UI

- React 19
- Vite 5
- Tailwind CSS 3
- React DOM
- 브라우저 개발 환경: Vite dev server

## 브라우저 플러그인

- Chrome/Opera 확장 프로그램 MV3
- `manifest.json` 기반 권한 설정
- `chrome.storage.local`을 통한 UUID 저장
- 백그라운드 서비스 워커, content script, popup UI 구성

## 린트 및 빌드

- `eslint.config.mts` 기반 Flat Config
- `typescript-eslint` 플러그인
- `npm run lint`: 코드 정적 분석
- `npm run admin:dev`, `npm run plugin:basic:dev`, `npm run server:start` 등의 전용 스크립트

## 개발 원칙

- ESM 표준을 우선합니다.
- 글로벌 설치 대신 로컬 node_modules 설치를 지향합니다.
- Docker, 가상 머신, 컨테이너 환경 대신 로컬 PowerShell 기반 작업을 우선합니다.
- `docs/decision/v0.02.개발 환경 셋팅 가이드.md`의 로컬 격리 환경, 경량 컴퓨터 보호, PM2 백그라운드 운영 원칙을 참고합니다.




---

## docs/rule/R-00102 structure.md

# R-00102 docs/rule/R-00102 structure.md

`WebCrawlServer` 프로젝트는 명확한 폴더 경계와 문서 위치 규칙을 준수합니다. 모든 코드 및 문서는 프로젝트 루트가 아닌 지정된 위치에 보관합니다.

## 폴더 구조

- `server/`: 백엔드 서버 소스 코드
  - `src/`: 엔트리포인트, 데이터베이스, 로깅 등 서버 구현
  - `package.json`: 서버 전용 의존성
  - `tsconfig.json`: 서버 TypeScript 설정
- `admin/`: 관리자 대시보드 소스 코드
  - `src/`: React 컴포넌트 및 클라이언트 코드
  - `package.json`: 관리자 UI 전용 의존성
  - `tsconfig.json`: 관리자 TypeScript 설정
  - `vite.config.ts`: Vite 번들러 설정
- `plugins/basic-plugin/`: 브라우저 확장 플러그인
  - `src/`: TypeScript 소스 (background, content, popup)
  - `public/`: MV3 manifest 및 정적 파일
  - `package.json`: 플러그인 전용 의존성
  - `tsconfig.json`: 플러그인 TypeScript 설정
- `databases/`: SQLite 데이터베이스 파일 저장소
- `logs/`: 운영 로그 저장소
- `docs/`: 프로젝트 문서
  - `rule/`: 규칙 문서
  - `decision/`: 설계 결정 및 ADR
  - `askLogs/`: 요청 및 처리 이력
  - `CHANGELOG.md`: 변경 이력
  - `todo.md`, `todo.history.md`: 작업 계획 및 기록

## 파일 네이밍 규칙

- TypeScript 파일: `.ts`, `.tsx`
- 구성 파일: `.json`, `.md`, `.mts`
- 브라우저 확장 매니페스트: `manifest.json`
- 문서 파일: `docs/` 하위에 배치
- 부가 문서: `README.md`, `AGENTS.md`는 루트에 허용

## 모듈 구조 기준

- 서버는 `server/src/index.ts`, `server/src/database.ts`, `server/src/logger.ts`로 주요 책임을 분리합니다.
- 관리자 UI는 `admin/src/App.tsx`, `admin/src/main.tsx` 중심으로 구성됩니다.
- 플러그인은 `plugins/basic-plugin/src/background.ts`, `plugins/basic-plugin/src/content.ts`, `plugins/basic-plugin/src/popup.tsx`로 기능을 분리합니다.

## 문서 위치 규칙

- 규칙 문서는 `docs/rule/` 하위에 둡니다.
- ADR 및 설계 결정은 `docs/decision/`에 둡니다.
- `docs/decision/`은 컨텍스트 로딩 예외로 취급하므로 새 작업 시작 시 전체 스캔하지 않습니다.
- 사용자 요청과 계획은 각각 `docs/ask.md`, `docs/todo.md`에서 관리합니다.

## 프로젝트 파일 추가 원칙

- 새 기능 관련 문서는 `docs/rule/` 또는 `docs/decision/`에 추가합니다.
- 코드 단위 변경은 기존 모듈 구조를 확장하는 방식으로 진행합니다.
- 새로운 상위 문서를 추가할 때는 `AGENTS.md`와 `docs/rule/R-00000 instructions.md`를 동시에 갱신합니다.




---

## docs/rule/R-00103 workflow-management.md

# R-00103 docs/rule/R-00103 workflow-management.md

`WebCrawlServer`의 ask/todo 운영 절차, 이력 관리, ADR 기준을 정의합니다.

## 작업 흐름

1. `docs/ask.md`에 요청 내용을 기록합니다.
2. `docs/ask.md`는 신규 작업 요청 문서입니다. 작업을 시작할 때 반드시 확인하고, `docs/ask.md`에 기록된 요청은 `docs/askLogs/`에도 함께 남깁니다.
3. ask 요청은 `docs/ask.md` 본문만 확인하고 지시대로 처리합니다. `docs/askLogs/`, `docs/CHANGELOG/`, `docs/decision/`, `docs/tips/` 등은 쓰기 전용 기록 공간이며 읽거나 판단용으로 열람하지 않습니다.
4. `docs/todo.md`에 작업 계획과 상태를 체크박스 형태로 정리합니다.
4. 개선 요청은 `docs/todo.md`에 반영하고, 작업 완료 후에는 `docs/todo.history.md`에 이력과 결과를 기록합니다.
5. 중요한 설계 결정은 `docs/decision/`에 ADR로 저장합니다.

## 이력 관리

- `docs/todo.history.md`에는 작업 완료 일시, 변경 내용, 변경 이유를 기록합니다.
- `docs/askLogs/`에는 모든 질의와 응답 데이터를 `YYYYMMDDHHMMSS.md` 형식으로 기록합니다.
- `docs/askLogs/` 파일에는 요청 원문, 처리 단계, 변경된 파일 목록, 검증 결과를 모두 포함해야 합니다.
- `docs/CHANGELOG.md`는 주요 릴리스 로그를 기록하며 항상 최신 상태로 유지합니다.
- `docs/CHANGELOG/` 상세 변경 이력 파일명은 영어 작업 이름과 `YYYYMMDDHHMMSS` 타임스탬프를 사용하여 생성합니다.
- `docs/askLogs/`, `docs/tips/`, `docs/decision/`은 과거 이력성 데이터로 취급합니다. 새로운 작업을 시작할 때는 이들 폴더의 기존 문서를 자동으로 읽지 않으며, 사용자가 특정 파일을 명시적으로 지정할 때만 그 파일 하나를 열어 확인합니다.

## ADR 기준

- 설계 변경이 프로젝트 구조, 아키텍처, 기술 스택, 인증, 보안 등 주요 사항에 영향을 줄 경우 ADR을 작성합니다.
- ADR은 `docs/decision/`에 저장합니다.
- ADR에는 관련 문서 목록(`AGENTS.md`, `docs/rule/*.md`)을 포함합니다.

## 검토 기준

- 작업 전에 `AGENTS.md`와 관련 규칙 문서를 확인합니다.
- 작업 후 변경 사항이 규칙을 위반하지 않는지 검증합니다.
- 작업 결과를 사용자에게 보고하기 전에 문서화 상태를 점검합니다.




---

## docs/rule/R-00104 versioning.md

# R-00104 docs/rule/R-00104 versioning.md

> **보류(Deferred)**: Git/GitHub 기반 자동화 및 통합은 현재 우선순위에서 제외됩니다.
>
> 본 문서는 역사적으로 버전 관리 정책을 설명하나, 현재 플러그인-서버 통신 안정화 및 `admin`/플러그인 기능 구현이 최우선입니다. Git 관련 자동화(커밋/푸시/CI 구성)는 백로그 항목으로 이동되었으니 즉시 구현 권고나 우선순위 제안에서 제외해 주십시오.

`WebCrawlServer`는 Git 기반 버전 관리와 문서형 이력 관리를 병행합니다. 본 문서는 버전 정책과 문서화 기준을 정의합니다.

## Git 정책

- 로컬 개발 시 `git add`, `git commit`, `git push`를 사용합니다.
- 커밋 메시지는 변경 내용과 이유를 명확히 간결하게 작성합니다.
- 브랜치 전략은 프로젝트 운영 정책에 따라 별도 정의할 수 있습니다.

## 문서 버전 형식

- 문서 상단에 `버전`, `수정일`, `작성자`, `검토일` 등의 정보를 포함할 수 있습니다.
- `docs/decision/`에 ADR을 저장할 때도 관련 문서 및 버전 정보를 함께 기록합니다.

## 변경 이력

- 주요 변경 사항은 `docs/CHANGELOG.md`에 기록합니다.
- 문서나 규칙 변경 시 `docs/todo.history.md`에 작업 결과와 이유를 기록합니다.




---

## docs/rule/R-00105 communication.md

# R-00105 docs/rule/R-00105 communication.md

`WebCrawlServer` 프로젝트의 커뮤니케이션 가이드와 응답 구조를 정의합니다. AI 응답과 문서 보고는 명확하고 단정적인 표현을 사용해야 합니다.

## 기본 원칙

- 감성적 표현, 마케팅성 수식어, 과도한 찬사는 사용하지 않습니다.
- 기술적 사실과 변경 내용을 중심으로 설명합니다.
- 사용자 요청에 대한 답변은 구조적으로 정리합니다.

## 응답 구조

1. 작업 요약
2. 변경 내역
3. 변경 이유
4. 검증 방법

## 언어 규칙

- 모든 설명 문장과 문서 내용은 한국어로 작성합니다.
- 코드 식별자, 파일명, 프로토콜명 등 고유 명사는 영어로 유지할 수 있습니다.




---

## docs/rule/R-00106 coding.md

# R-00106 docs/rule/R-00106 coding.md

본 문서는 `WebCrawlServer` 프로젝트의 코드 작성 규칙, 소스 파일 헤더 표기 규정 및 코드 문서화(JSDoc/주석) 표준 지침입니다.

---

## 1. 기본 코드 표준

1.1 **TypeScript 사용**: 모든 코드는 JavaScript 대신 TypeScript 사용을 원칙으로 합니다.  
1.2 **ESM 규격 준수**: 모듈 시스템은 ESM(`import` / `export`)을 사용하며, CommonJS(`require`, `module.exports`) 사용은 금지합니다.  
1.3 **타입 엄격성**: 타입을 명시적으로 정의하며, `any` 타입 사용을 금지합니다. (외부 라이브러리 반환값 등 불가피한 경우 `unknown`과 타입 어서션을 활용)  
1.4 **비동기 처리**: Promise 연산 및 비동기 함수는 `async/await` 패턴으로 작성합니다.  

---

## 2. 소스 파일 헤더 표기 규정 (필수)

모든 소스 코드(.ts, .tsx, .js, .css 등) 및 문서 출력물의 최상단 첫 번째 라인에는 **상대 파일 경로와 파일 이름**을 주석 형태로 반드시 표기해야 합니다.

```typescript
// plugins/basic-plugin/src/popup.tsx
```

---

## 3. 기능 및 식별자 상세 주석 표준

코드 가독성과 유지보수성을 제고하기 위해 주요 기능, 함수, 클래스, 메서드, 변수 및 상상에 대해 상세한 한글 주석을 반드시 작성해야 합니다.

### 3.1 함수 및 클래스 주석 표준 (JSDoc)
모든 함수, 메서드, 클래스 상단에는 수행 기능, 매개변수(`@param`), 반환값(`@returns`) 및 예외 사항을 설명하는 JSDoc 형태의 한글 주석을 작성합니다.

```typescript
/**
 * 지정된 타깃 클라이언트에 원격 수집 지시 제어 명령 패킷을 웹소켓으로 송출합니다.
 *
 * @param socket - 활성화된 웹소켓 인스턴스 참조
 * @param targetId - 수신 타깃 기기 ID (ALL 입력 시 전체 브로드캐스트)
 * @param action - 지시 액션 식별자 (예: 'CRAWL_START', 'CRAWL_STOP')
 * @param payload - 바디 페이로드 객체
 * @returns 메시지 송출 성공 여부 (true / false)
 */
export function sendSocketMessage(
  socket: WebSocket | null,
  targetId: string,
  action: string,
  payload: unknown
): boolean {
  // ... 구현 코드
}
```

### 3.2 변수 및 상수 주석 표준
모든 전역 상수, 빌드 주입 환경변수, 주요 상태 변수 선언부에는 변수의 역할, 단위, 기본값 및 지정 가능한 값의 범위를 상세 주석으로 명시합니다.

```typescript
/** 팝업 창의 초기 기본 가로 너비 (단위: px, 기본값: 360, 범위: 320~600) */
export const POPUP_WIDTH: number = 360;

/** 백엔드 통합 웹소켓 및 REST API 서비스 포트 번호 (기본값: 9600) */
export const SERVER_PORT: number = 9600;
```

---

## 4. 예외 처리 및 로그 가드

4.1 **상세 에러 기록**: 예외 발생 시 단순 무시(`catch {}`)를 금지하며, 발생 원인과 메시지를 로그로 남겨야 합니다.  
4.2 **방어적 프로그래밍**: 외부 입력값 및 API 응답 데이터에 대한 검증 구문을 작성하여 앱 크래리를 방지합니다.

---

## 5. CSS 및 Tailwind 규칙

### 5.1 Tailwind CSS 클래스 사용 가이드

#### 5.1.1 텍스트 선택 관련 클래스
- **`select-none`**: 엄격히 제한되어 사용됩니다. **텍스트가 포함된 요소에는 절대 사용하지 않습니다.**
  - R-00302 3.4절의 접근성 가이드라인을 준수해야 합니다.
  - 사용 시에는 반드시 주석으로 사용 이유를 명시해야 합니다.
- **`select-auto`**: 기본 텍스트 선택 동작을 명시적으로 복원해야 하는 경우에만 사용합니다.
- **`select-text`**: 유효하지 않은 Tailwind 클래스이므로 **절대 사용하지 않습니다**. (2026-08-03 이전에 사용된 적이 있지만, 이는 Tailwind CSS에 존재하지 않는 클래스입니다)

#### 5.1.2 클래스 유효성 검증
- 사용하기 전에 Tailwind CSS 공식 문서([tailwindcss.com](https://tailwindcss.com))를 확인하여 클래스가 유효한지 검증합니다.
- 유효하지 않은 클래스는 **절대 사용하지 않습니다**.
- 의문이 있을 경우에는 `npx tailwindcss -i input.css -o output.css --minify`로 빌드 테스트를 수행하여 클래스가 적용되는지 확인합니다.  

---

## docs/rule/R-00107 security.md

# R-00107 docs/rule/R-00107 security.md

`WebCrawlServer`는 로컬 개발 환경에서 기본적인 예외 처리와 보안 정책을 지켜야 합니다.

## 예외 처리

- 입력 값은 가능한 범위에서 검증합니다.
- WebSocket 메시지 파싱 에러는 서버에서 예외로 처리하고 서비스 중단을 방지해야 합니다.
- 관리자 API는 예외 발생 시 적절한 HTTP 상태 코드를 반환해야 합니다.

## 보안 정책

- 로컬 개발 환경에서는 민감 정보를 코드에 하드코딩하지 않습니다.
- 확장 프로그램 매니페스트 권한은 최소한으로 제한합니다.
- 향후 인증이 필요한 경우 `auth.md`와 연계하여 구현합니다.




---

## docs/rule/R-00108 testing.md

# R-00108 docs/rule/R-00108 testing.md

`WebCrawlServer` 프로젝트는 로컬 개발 환경에서 단위 테스트와 통합 테스트를 확장할 여지를 둡니다. 본 문서는 테스트 도구와 작성 원칙을 정의합니다.

## 테스트 도구

- 현재는 테스트 도구가 직접 구성되어 있지 않습니다.
- 향후 TypeScript 기반 테스트 프레임워크(Jest, Vitest 등)를 도입할 수 있습니다.

## 작성 원칙

- 테스트는 가능한 최소 단위로 작성합니다.
- 비즈니스 로직과 I/O를 분리하여 테스트 대상 범위를 명확히 합니다.
- 테스트는 로컬 환경에서 빠르게 실행되는 것을 우선으로 합니다.

## 권장 흐름

1. 신규 기능을 추가할 때 관련 단위 테스트를 작성합니다.
2. 통합 시나리오가 필요한 경우 관리자 UI와 백엔드 통합 테스트를 고려합니다.
3. 테스트는 `docs/rule/R-00102 structure.md`의 모듈 구조를 준수하여 배치합니다.

## 향후 테스트 도구 도입 계획

- 현재는 테스트 도구가 직접 구성되어 있지 않으므로, `Vitest` 또는 `Jest` 중 하나를 우선 검토하여 도입 계획을 수립합니다.
- 우선순위는 서버 비즈니스 로직, 데이터베이스 접근, 관리자 UI 컴포넌트 단위 테스트 순입니다.
- 테스트 가능성을 높이기 위해 비즈니스 로직과 I/O를 분리하고, 의존성 주입을 검토합니다.




---

## docs/rule/R-00200 mcp.md

# R-00200 docs/rule/R-00200 mcp.md

`WebCrawlServer`는 현재 로컬 WebSocket 및 REST API 기반 통신 구조를 사용합니다. 본 문서는 MCP 프로토콜이 도입될 경우를 대비한 원칙과 워크플로우 타입 지침을 제공합니다.

## 현재 통신 모델

- 백엔드 서버는 `server/src/index.ts`에서 WebSocket과 Express HTTP를 동시에 운영합니다.
- 플러그인과 관리자 UI는 `ws://localhost:9600` 접속을 기반으로 실시간 메시지를 주고받습니다.
- 현재 프로젝트는 별도의 MCP 서버 연동이 구현되어 있지 않습니다.

## MCP 통합 원칙

- MCP가 도입될 때는 기존 WebSocket/REST 구조와 혼용하지 말고 역할을 분명히 정의합니다.
- MCP 워크플로우는 `server/src/`의 경로 또는 신규 모듈로 분리합니다.
- MCP 프로토콜 정의는 문서화하고 `docs/decision/`에 ADR로 기록합니다.

## 워크플로우 스텝 타입

1. 요청 수신: 외부 시스템에서 명령을 수신합니다.
2. 변환/매핑: 수신 데이터를 내부 메시지 모델로 변환합니다.
3. 라우팅: 적절한 대상 플러그인 또는 관리자에 전달합니다.
4. 응답 처리: 성공/실패 결과를 호출자에게 전달합니다.

## 설계 지침

- 모든 외부 데이터는 검증 후 처리합니다.
- 상태 전이는 `ClientType`과 같은 명확한 타입으로 관리합니다.
- MCP가 필요한 경우, `docs/rule/R-00205 auth.md`와 보안 정책을 동시에 검토합니다.




---

## docs/rule/R-00201 scheduler.md

# R-00201 docs/rule/R-00201 scheduler.md

`WebCrawlServer`는 현재 로컬 개발 환경에서 백그라운드 프로세스 제어와 작업 상태 관리를 중심으로 설계되었습니다. 현재 스케줄러 자체는 구현되어 있지 않으나, 작업 상태 및 동시 실행 정책을 정의합니다.

## 작업 상태 모델

- `PENDING`: 작업 대기 상태
- `RUNNING`: 현재 실행 중인 상태
- `COMPLETED`: 완료 상태
- `FAILED`: 실패 상태

## 동시 실행 정책

- 같은 `clientId`에 대한 중복 세션은 허용하지 않습니다.
- `activeClients` 맵에서 동일 `clientId`가 이미 연결된 경우 기존 세션을 종료하고 신규 세션을 등록합니다.
- `CRAWL_START` 명령은 대상 플러그인 또는 모든 클라이언트에 중복 전송 가능하지만, 개별 플러그인은 자체적으로 중복 처리 로직을 구현해야 합니다.

## 설계 지침

- 백엔드에서 동시에 여러 WebSocket 메시지를 수신할 수 있어야 합니다.
- 작업 상태는 메모리 기반 맵 또는 DB 상태 필드로 확장할 수 있습니다.
- 향후 스케줄러 도입 시에는 `docs/rule/R-00202 monitoring.md`와 함께 작업 상태 모니터링을 설계합니다.




---

## docs/rule/R-00202 monitoring.md

# R-00202 docs/rule/R-00202 monitoring.md

`WebCrawlServer`는 로컬 개발 환경을 기준으로 서버 및 클라이언트 상태 모니터링을 지원해야 합니다. 본 문서는 핵심 관찰 지표와 수집 방법을 정의합니다.

## 모니터링 대상

- WebSocket 연결 상태
- 활성 클라이언트 수
- 수집 로그 저장 상태
- 백엔드 서버 예외 로그
- 관리자 UI와 플러그인 간 통신 상태

## 수집 방식

- 실시간 WebSocket 이벤트를 통해 연결/종료 상태를 감시합니다.
- 로그 파일(`logs/server_system.log`, `logs/admin_activity.log`, `logs/plugins_comm.log`)을 통해 에러 및 활동을 추적합니다.
- 관리자 UI에서는 REST API로 `clients`와 `crawl_logs` 데이터를 조회합니다.

## 권장 지침

- 서버는 `activeClients` 맵을 통해 클라이언트 수를 실시간으로 추적합니다.
- WebSocket 연결 실패나 파싱 오류는 `server_system.log`에 기록합니다.
- 플러그인 통신 로그는 `plugins_comm.log`로 저장되어야 합니다.
- 관리자 UI는 통신 상태를 시각적으로 표시해야 합니다.




---

## docs/rule/R-00203 database.md

# R-00203 docs/rule/R-00203 database.md

`WebCrawlServer`는 SQLite 기반 로컬 데이터베이스를 사용합니다. 본 문서는 데이터베이스 설계, 마이그레이션, 백업 및 관리자 UI API 관점을 다룹니다.

## 스키마

- `clients` 테이블
  - `client_id` TEXT PRIMARY KEY
  - `client_type` TEXT NOT NULL
  - `connected_at` TEXT NOT NULL
- `crawl_logs` 테이블
  - `id` INTEGER PRIMARY KEY AUTOINCREMENT
  - `client_id` TEXT NOT NULL
  - `log_message` TEXT NOT NULL
  - `timestamp` INTEGER NOT NULL
  - FOREIGN KEY (`client_id`) REFERENCES `clients`(`client_id`) ON DELETE CASCADE

## 마이그레이션

- 현재는 서버 기동 시 `initializeDatabase()`에서 자동으로 테이블을 생성합니다.
- 향후 스키마 변경 시에는 별도 마이그레이션 스크립트를 도입해야 합니다.

## 백업

- 데이터 파일은 `databases/data.db`에 저장됩니다.
- 정기 백업은 파일 복사 수준에서 관리해야 합니다.
- `data.db-wal` 파일이 존재하면 정상적인 WAL 모드 트랜잭션 처리 중임을 의미합니다.

## 관리자 UI API

- `/api/db/clients`: 등록된 클라이언트 목록 조회
- `/api/db/logs`: 최근 수집 로그 조회
- `DELETE /api/db/logs`: 전체 수집 로그 삭제
- `DELETE /api/db/clients/:clientId`: 특정 클라이언트 및 관련 로그 삭제

## 설계 지침

- 외래 키 무결성을 위해 `foreign_keys = ON`을 사용합니다.
- WAL 모드(`journal_mode = WAL`)를 통해 동시 읽기/쓰기 성능을 개선합니다.
- DB 파일 경로는 `import.meta.url` 기반 절대 경로로 계산합니다.




---

## docs/rule/R-00204 logging.md

# R-00204 docs/rule/R-00204 logging.md

`WebCrawlServer`는 로컬 로그 파일 기반의 운영 기록을 사용합니다. 본 문서는 로그 분류, 저장 위치, 기록 규칙을 정의합니다.

## 로그 분류

- `logs/server_system.log`: 서버 상태, 예외, 포트 바인딩, WebSocket 연결 상태 기록
- `logs/admin_activity.log`: 관리자 명령 송출, 블랙리스트 처리, 관리 작업 기록
- `logs/plugins_comm.log`: 플러그인 통신 이벤트, 수집 패킷 송수신 기록

## 기록 규칙

- 로그는 동기식 `appendFileSync` 방식으로 기록합니다.
- 로그 파일이 존재하지 않으면 자동으로 생성해야 합니다.
- 로그 라인은 타임스탬프, 레벨, 식별자, 메시지를 포함해야 합니다.

## 운영 지침

- 오류와 예외는 `server_system.log`에 기록합니다.
- 관리자 작업은 `admin_activity.log`에 기록합니다.
- 플러그인 통신은 `plugins_comm.log`에 기록합니다.
- 로그 파일은 `logs/` 폴더에 위치해야 합니다.




---

## docs/rule/R-00205 auth.md

# R-00205 docs/rule/R-00205 auth.md

`WebCrawlServer`는 현재 로컬 관리 환경에서 인증 기능이 최소화되어 있습니다. 본 문서는 페이지 인증 및 자격증명 변경 API를 설계할 때 참고해야 할 원칙을 정의합니다.

## 인증 원칙

- 관리자 UI 접근 제어가 필요한 경우 인증을 추가합니다.
- 기본 auth는 HTTP Basic Auth 또는 토큰 기반 인증을 사용할 수 있습니다.
- 인증 정보는 서버 측에서 안전하게 관리해야 합니다.

## 자격증명 변경 API

- 자격증명 변경 기능은 관리자 권한이 필요한 엔드포인트로 구현해야 합니다.
- 비밀번호 저장 시에는 평문 저장을 피하고 안전한 해싱 방식을 사용합니다.
- 현재는 bcryptjs가 설치되어 있지 않으므로 도입 시 `package.json`과 타입 정의를 함께 추가해야 합니다.




---

## docs/rule/R-00206 server-node-session-management.md

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

---

## docs/rule/R-00207 server-worker-engine-and-multi-db.md

본 문서는 `WebCrawlServer` 백엔드 서버의 **동적 수집 워커(Worker) 엔진**, **멀티 SQLite DB 동적 생성(`databases/workers/`)**, 및 **동적 테이블 스키마 매핑 규격**을 정의하는 기술 지침서입니다.

---

## 1. 개요 및 워커 아키텍처 원칙

1.1 **개요**: 서버 포트(9600)로 유입되는 소켓 수집 패킷을 수신하여, 지정된 수집 워커(Server Worker)가 패킷을 해석하고 전담 DB 및 커스텀 테이블 스키마에 동적 적재합니다.  
1.2 **3대 워커 아키텍처 원칙**:
   - **디폴트 워커 기동**: 서버 초기 구동 시 `default_worker`가 자동으로 할당되며, 기본 소켓 통신 파라미터를 기본 수용함.
   - **멀티 DB 동적 분리 생성**: 신규 워커 생성 시 `databases/workers/worker_<name>.db` 독립 DB 파일이 자동 동적 생성됨.
   - **스키마 상속 및 충돌 검증**: 신규 워커는 기본 파라미터(`client_id`, `domain`, `url`, `title`, `file_path`, `file_size`, `timestamp`)를 자동 상속받으며, DDL 조합 시 기본 칼럼과 동일한 커스텀 필드명은 자동 정화 검증을 단행함.

---

## 2. `workers` 테이블 명세 (`databases/data.db`)

워커 정의 및 DB/스키마 매핑 정보를 보관하는 메인 시스템 DB의 `workers` 테이블 스키마입니다.

```sql
CREATE TABLE IF NOT EXISTS workers (
  worker_id TEXT PRIMARY KEY,           -- 워커 고유 ID (예: "worker_facebook")
  worker_name TEXT NOT NULL,            -- 워커 한글 이름 (예: "페이스북 전담 수집 워커")
  db_file_path TEXT NOT NULL,           -- 대상 DB 경로 (예: "databases/workers/worker_facebook.db")
  table_name TEXT NOT NULL,             -- 대상 테이블명 (예: "facebook_posts")
  storage_root_path TEXT NOT NULL,      -- 워커 디폴트 저장소 루트 (예: "E:\data\facebook_worker")
  schema_json TEXT NOT NULL,            -- 커스텀 필드 정의 JSON 배열
  is_default INTEGER DEFAULT 0,         -- 디폴트 워커 여부 (1 또는 0)
  created_at TEXT NOT NULL
);
```

### 2.1 `schema_json` 구조 예시:
```json
[
  { "name": "post_count", "type": "INTEGER", "required": false },
  { "name": "author_id", "type": "TEXT", "required": true },
  { "name": "likes_count", "type": "INTEGER", "required": false }
]
```

---

## 3. 동적 워커 및 멀티 DB 생성 REST API 규정 (`POST /api/admin/workers`)

Admin UI에서 신규 워커 생성 시 호출되는 API로, 타깃 DB 파일 생성 및 SQLite `CREATE TABLE IF NOT EXISTS` 구문을 동적 실행합니다. 기본 상속 필드와의 칼럼 중복 충돌을 방지하는 검증 로직이 포함됩니다.

```typescript
// server/src/database.ts

export interface CustomFieldDef {
  name: string;
  type: "TEXT" | "INTEGER" | "REAL" | "BLOB";
  required?: boolean;
}

export interface CreateWorkerParams {
  workerId: string;
  workerName: string;
  dbFileName: string;       // 예: "worker_facebook.db" 또는 "data.db"
  tableName: string;        // 예: "facebook_posts"
  storageRootPath: string;  // 예: "E:\\data\\facebook_worker"
  customFields: CustomFieldDef[];
  isDefault?: boolean;
}

/**
 * 신규 수집 워커를 생성하고, 해당 워커 전용 DB 파일 및 스키마 테이블을 동적 빌드합니다.
 */
export function createDynamicWorker(params: CreateWorkerParams): void {
  const isMainDb = params.dbFileName === "data.db";
  const targetDbPath = isMainDb
    ? mainDbPath
    : resolve(workersDbDir, params.dbFileName);

  const targetDb = new Database(targetDbPath);
  targetDb.pragma("journal_mode = WAL");

  // DDL 기본 상속 칼럼 예약어 세트
  const reservedColumns = new Set([
    "id",
    "client_id",
    "domain",
    "url",
    "title",
    "file_path",
    "file_size",
    "timestamp",
  ]);

  let ddl = `
    CREATE TABLE IF NOT EXISTS ${params.tableName} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id TEXT NOT NULL,
      domain TEXT,
      url TEXT,
      title TEXT,
      file_path TEXT,
      file_size INTEGER DEFAULT 0,
      timestamp INTEGER NOT NULL
  `;

  // 예약어와 중복되지 않는 커스텀 필드만 DDL에 연결 (SQL 중복 칼럼 에러 차단)
  for (const field of params.customFields) {
    if (!reservedColumns.has(field.name.toLowerCase())) {
      ddl += `, ${field.name} ${field.type} ${field.required ? "NOT NULL" : ""}`;
    }
  }
  ddl += `);`;

  targetDb.prepare(ddl).run();

  const dbRelPath = isMainDb
    ? "databases/data.db"
    : `databases/workers/${params.dbFileName}`;

  db.prepare(
    `
    INSERT INTO workers (worker_id, worker_name, db_file_path, table_name, storage_root_path, schema_json, is_default, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    params.workerId,
    params.workerName,
    dbRelPath,
    params.tableName,
    params.storageRootPath,
    JSON.stringify(params.customFields),
    params.isDefault ? 1 : 0,
    new Date().toISOString()
  );
}
```

---

## 4. 파이프라인 워커 실행 엔진 규정 (`executeWorkerPipeline`)

수집 패킷 유입 시 지정된 워커가 동적으로 실행되어 해당 DB 및 파일 저장소에 데이터를 파싱·적재합니다.

```typescript
// server/src/services/workerEngineService.ts

/**
 * 유입 패킷을 담당 워커 스키마에 맞춰 인서트합니다.
 */
export function executeWorkerPipeline(
  workerConfig: WorkerRecord,
  clientId: string,
  domain: string,
  filePath: string,
  fileSize: number,
  packetPayload: Record<string, unknown>
): void {
  const targetDbPath = resolve(__dirname, "..", "..", workerConfig.db_file_path);
  const targetDb = new Database(targetDbPath);

  const customFields: CustomFieldDef[] = JSON.parse(workerConfig.schema_json || "[]");

  let cols = "client_id, domain, url, title, file_path, file_size, timestamp";
  let vals = "?, ?, ?, ?, ?, ?, ?";
  const paramValues: unknown[] = [
    clientId,
    domain,
    packetPayload.url || "",
    packetPayload.title || "",
    filePath,
    fileSize,
    Date.now(),
  ];

  for (const field of customFields) {
    cols += `, ${field.name}`;
    vals += `, ?`;
    paramValues.push(packetPayload[field.name] ?? null);
  }

  const query = `INSERT INTO ${workerConfig.table_name} (${cols}) VALUES (${vals})`;
  targetDb.prepare(query).run(...paramValues);
}
```

---

## 5. 검증 체크리스트

- [ ] Admin UI에서 신규 워커 생성 시 `databases/workers/`에 지정한 `.db` 파일 및 테이블이 자동 동적 생성되는가?
- [ ] 신규 워커에 정의한 커스텀 필드 중 기본 상속 칼럼과 중복되는 필드명이 에러 없이 안전하게 정화되는가?
- [ ] 패킷 유입 시 워커에 지정된 독립 DB 파일 및 테이블로 데이터가 정상 INSERT되는가?

---

## docs/rule/R-00208 local-file-storage-system.md

본 문서는 `WebCrawlServer` 백엔드 서버에서 크롤링 수집된 무거운 HTML 원본 소스(`outerHTML`), 이미지, PDF 등의 대용량 데이터를 SQLite DB에 직접 적재하지 않고, **물리 디렉터리 분리 저장소(Local File Storage System)**로 격리 보관하기 위한 기술 지침서입니다.

---

## 1. 개요 및 저장소 분리 원칙

1.1 **개요**: DB 용량 폭증과 쿼리 성능 저하를 방지하기 위해 무거운 파일 자원은 물리 디스크에 보관하고, SQLite DB에는 해당 파일의 물리적 경로(`file_path`) 및 메타데이터만 경량 적재합니다.  
1.2 **3대 물리 저장소 원칙**:
   - **경로 결정 우선순위**: 노드 전용 경로(`custom_storage_path`) > 워커 전용 경로(`storage_root_path`) > 글로벌 기본 경로 (`STORAGE_ROOT_PATH`).
   - **도메인/DB_ID 하위 분류 & 특수문자 정화**: `STORAGE_ROOT_PATH\<safeDomain>\<db_id>\index.html` 체계로 자동 폴더를 생성하며, 윈도우/리눅스 디렉터리 금지 특수문자(`:`, `?`, `*`, `<`, `>`, `|`)는 안전하게 치환 정화함.
   - **디스크 용량 모니터링**: 물리 저장소 디스크의 남은 용량 및 총 저장 용량을 REST API로 모니터링.

---

## 2. 물리 파일 저장소 디렉터리 구조 명세

```
STORAGE_ROOT_PATH/ (예: E:\data\)
└── <safeDomain>/                  # 특수문자 정화된 도메인 폴더 (예: aaa_com/, facebook_com/)
    └── <db_log_id>/               # DB 인덱스 번호별 독립 폴더 (예: 1042/)
        ├── index.html             # 수집된 HTML 원본 소스
        ├── metadata.json          # 수집 헤더, 쿠키, 타임스탬프 정보
        ├── images/                # 파싱되어 다운로드된 이미지 폴더 (추후 확장)
        └── videos/                # 파싱되어 다운로드된 동영상 폴더 (추후 확장)
```

---

## 3. 파일 저장소 서비스 모듈 규정 (`server/src/services/fileStorageService.ts`)

수집된 HTML 또는 바이너리 데이터를 결정된 물리 경로에 안전하게 저장하고 경로 정보를 반환합니다.

```typescript
// server/src/services/fileStorageService.ts

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export interface SaveContentOptions {
  customNodePath?: string;     // 노드 전용 지정 경로
  workerStoragePath?: string;  // 워커 전용 지정 경로
  globalDefaultPath?: string;  // 글로벌 기본 경로 (기본값: "./storage")
  domain: string;              // 도메인 (예: "aaa.com")
  dbLogId: number | string;    // DB 인덱스 ID (예: 1042)
  htmlContent: string;         // HTML 원본 소스
}

export interface SaveContentResult {
  savedFilePath: string;
  fileSize: number;
}

/** 윈도우/리눅스 디렉터리 경로 금지 특수문자를 이스케이프 정화합니다. */
function sanitizeFolderName(name: string): string {
  return (name || "common").replace(/[^a-zA-Z0-9_.-]/g, "_");
}

/**
 * 우선순위에 따라 물리 저장 경로를 결정하고, HTML 파일 및 메타데이터를 디스크에 보관합니다.
 */
export function saveCrawledContentToFile(
  options: SaveContentOptions
): SaveContentResult {
  // 1. 저장소 최상위 루트 경로 결정 (우선순위: 노드 지정 > 워커 지정 > 글로벌 기본)
  const rootPath =
    options.customNodePath && options.customNodePath.trim().length > 0
      ? options.customNodePath
      : options.workerStoragePath && options.workerStoragePath.trim().length > 0
      ? options.workerStoragePath
      : options.globalDefaultPath || "./storage";

  // 2. 도메인 특수문자 정화 및 디렉터리 세부 경로 생성 (예: E:\data\aaa_com\1042\)
  const safeDomain = sanitizeFolderName(options.domain);
  const targetDir = resolve(
    rootPath,
    safeDomain,
    String(options.dbLogId)
  );

  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  // 3. index.html 파일 쓰기 단행
  const targetFilePath = resolve(targetDir, "index.html");
  const buffer = Buffer.from(options.htmlContent, "utf-8");

  writeFileSync(targetFilePath, buffer);

  return {
    savedFilePath: targetFilePath,
    fileSize: buffer.length,
  };
}
```

---

## 4. 디스크 용량 모니터링 REST API 규정 (`GET /api/admin/storage/status`)

관리자 대시보드에서 스토리지 디스크의 용량을 실시간 모니터링할 수 있도록 정보를 제공합니다.

```typescript
// server/src/index.ts

app.get("/api/admin/storage/status", (_req, res) => {
  try {
    const storagePath = process.env.STORAGE_ROOT_PATH || "./storage";
    
    res.json({
      success: true,
      data: {
        storageRootPath: resolve(storagePath),
        status: "NORMAL",
      },
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: "디스크 상태 조회 실패" });
  }
});
```

---

## 5. 검증 체크리스트

- [ ] 무거운 HTML 소스가 SQLite DB 칼럼 대신 디스크 파일(`index.html`)로 분리 저장되는가?
- [ ] 파일 저장 경로 우선순위(노드 전용 > 워커 전용 > 글로벌 기본)가 정상 적용되는가?
- [ ] 도메인 특수문자가 정화되어 `STORAGE_ROOT_PATH\<safeDomain>\<db_id>\` 디렉터리가 에러 없이 자동 생성되는가?
- [ ] SQLite DB에는 경량 텍스트 경로(`file_path`) 및 파일 크기(`file_size`)만 정확히 기입되는가?

---

## docs/rule/R-00300 admin-guidelines.md

# R-00300 docs/rule/R-00300 admin-guidelines.md

`WebCrawlServer` 관리자 기능과 운영 UI에 대한 지침 문서입니다. 본 문서는 관리자 대시보드가 수행해야 할 기능, WebSocket/REST 통신 계약, 관리자 제어 흐름, 예외 처리 및 운영 로그 작성 원칙을 정의합니다.

## 적용 범위

- `admin/src/` 기반 관리자 대시보드 UI 및 기능
- 관리자 명령 송출 흐름과 REST API 호출
- 관리자 세션 식별, 제어 대상 기기 선택, 로그 조회 및 로그 정리 기능
- 관리자 활동 기록 및 예외 처리 지침

## 주요 지침

### 1. 관리자 기능 정의

1.1 관리자 대시보드는 `CRAWL_START`, `CRAWL_STOP` 등 원격 제어 명령을 플러그인으로 송출해야 합니다.
1.2 관리자 대시보드는 `ws://localhost:9600?clientId=admin-main&clientType=admin` 형식으로 서버에 WebSocket을 연결해야 합니다.
1.3 관리자 대시보드는 `GET /api/db/clients`, `GET /api/db/logs`, `DELETE /api/db/logs`, `DELETE /api/db/clients/:clientId` 등의 REST API를 이용해야 합니다.

### 2. 통신 계약

2.1 관리자와 서버 간 WebSocket 메시지는 `senderId`, `targetId`, `action`, `payload`를 포함해야 합니다.
2.2 관리자 명령 패킷은 `targetId`를 특정 클라이언트 ID 또는 `ALL`로 설정하여 전달합니다.
2.3 REST API 응답은 `{ success: true|false, data?, message? }` 형태를 유지해야 합니다.

### 3. 관리자 UI 원칙

3.1 UI는 단순 제어와 상태 확인에 집중해야 합니다.
3.2 관리자 명령 실행 전 사용자 확인(예: 로그 삭제, 클라이언트 추방)을 반드시 요구합니다.
3.3 소켓 연결 상태와 API 상태를 시각적으로 명확하게 표시해야 합니다.
3.4 관리자 UI/UX 디자인은 `docs/rule/R-00302 admin-ui-ux-guidelines.md`를 준수해야 합니다.
3.5 버튼, 배지, 테이블, 카드 등의 시각 요소는 일관된 색상과 타이포그래피를 유지해야 합니다.

### 4. 예외 처리 및 운영 로그

4.1 관리자 명령 송출 실패 시 사용자에게 명확한 오류 메시지를 표시해야 합니다.
4.2 관리자 활동 로그는 서버의 `logs/admin_activity.log`와 연계되어야 합니다.
4.3 관리자 UI는 서버 오프라인, API 실패, 소켓 연결 끊김 상황을 분리하여 처리해야 합니다.

### 5. 접근성 원칙

5.1 모든 UI 요소는 기본적으로 텍스트 선택을 허용해야 합니다.
5.2 `select-none`의 사용은 R-00302 3.4절을 엄격히 준수해야 합니다.

---

## docs/rule/R-00301 admin-development-guidelines.md

# R-00301 docs/rule/R-00301 admin-development-guidelines.md

`WebCrawlServer` 관리자 UI 개발에 대한 종합적인 AI 지침 문서입니다. 본 문서는 Google Cloud Console 스타일을 기반으로 한 모듈화 아키텍처, 타입 시스템, 서비스 계층, 비즈니스 로직 훅, 레이아웃 컴포넌트, 뷰 컴포넌트 등 admin 개발의 모든 측면을 정의합니다.

## 적용 범위

- `admin/src/` 기반 관리자 대시보드 UI 및 기능 개발
- React + TypeScript + Vite 기반 admin 패키지
- Google Cloud Console 스타일 디자인 시스템 적용
- 모듈화 아키텍처 구현
- AI 기반 코드 생성 및 리팩토링 가이드

## 1. 관리자 UI 개발 원칙

### 1.1 코드 품질 우선 원칙
- **단일 책임 원칙**: 각 컴포넌트와 함수는 하나의 책임만 가져야 합니다.
- **매Serializable**: 모든 비즈니스 로직은 UI 컴포넌트에서 분리되어야 합니다.
- **타입 안전성**: TypeScript 타입 시스템을 완전히 활용하여 런타임 오류를 방지합니다.
- **ESM 표준**: 모든 코드는 ECMAScript Modules(import/export) 기반으로 작성합니다.

### 1.2 구조적 복잡성 관리
- 단일 파일에 모든 로직이 집중되는 것을 방지합니다.
- 200라인 이상인 파일은 반듯이 분할해야 합니다.
- 컴포넌트 재사용성을 최우선으로 고려합니다.

### 1.3 AI 기반 개발 가이드
- AI는 docs/decision/ 문서의 가이드를 엄격히 따라야 합니다.
- 기존 코드베이스의 패턴과 스타일을 유지해야 합니다.
- 새로운 아키텍처 변경은 반드시 ADR(Architecture Decision Record)으로 문서화해야 합니다.
- 관리자 UI/UX 디자인은 `docs/rule/R-00302 admin-ui-ux-guidelines.md`를 참고하여 구현합니다.

## 2. 아키텍처 가이드

### 2.1 계층화 구조

```
admin/src/
├── types/              # 전역 타입 정의 계층
├── services/           # 순수 통신 서비스 계층
├── hooks/              # 비즈니스 로직 훅 계층
├── components/        # UI 컴포넌트 계층
│   ├── layout/         # 레이아웃 컴포넌트
│   ├── metrics/        # 메트릭 컴포넌트
│   ├── tables/         # 데이터 테이블 컴포넌트
│   └── views/          # 비즈니스 뷰 컴포넌트
└── App.tsx            # 최상위 조율 엔트리
```

### 2.2 계층별 책임

| 계층 | 책임 | AI 개발 가이드 |
|------|------|----------------|
| types/ | 전역 타입, 인터페이스, 유니온 타입 정의 | 기존 타입 시스템 분석 후 확장 |
| services/ | REST API, WebSocket 통신 (순수 함수) | fetch, WebSocket만 사용, React 독립 |
| hooks/ | 비즈니스 로직, 상태 관리, 수명 주기 | useCallback, useMemo 적극 사용 |
| components/ | UI 렌더링, 사용자 상호작용 | props 기반으로만 동작 |
| App.tsx | 계층 통합, 데이터 흐름 조율 | 최소한의 로직만 포함 |

### 2.3 데이터 흐름

```
User Interaction → View Components → Hooks (Business Logic) → Services (API/WebSocket) → Server
                                             ↓
                                    State Management (useState, useReducer)
```

## 3. 타입 시스템

### 3.1 전역 타입 정의

`admin/src/types/index.ts`에 모든 전역 타입을 중앙 집중 관리합니다.

```typescript
// DTO (Data Transfer Objects)
export interface Client {
  client_id: string;
  client_type: string;
  connected_at: string;
}

export interface CrawlLog {
  id: number;
  client_id: string;
  log_message: string;
  timestamp: number;
}

// Communication Types
export interface WebSocketMessage<T = unknown> {
  senderId: string;
  targetId?: string | 'ALL';
  action: string;
  payload: T;
}

// Status Types
export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED';
export type ActiveTab = 'clients' | 'console' | 'logs';
```

### 3.2 타입 안전성 원칙
- **`any` 사용 금지**: 모든 `any` 타입은 `unknown`으로 대체해야 합니다.
- **인터페이스 우선**: 타입 alias보다는 인터페이스를 우선 사용합니다.
- **제네릭 타입 활용**: 가능하면 제네릭 타입을 사용하여 유연성을 높이습니다.
- **타입 어서션**: 외부 라이브러리 반환 값에만 사용합니다.

### 3.3 AI 타입 생성 가이드
- @types/better-sqlite3 같은 라이브러리 타입 정의는 신뢰할 수 없습니다.
- 데이터베이스 query 결과는 항상 명시적인 타입 어서션을 적용합니다.
- API 응답 타입은 인터페이스로 엄격히 정의합니다.

## 4. 서비스 계층 (services/)

### 4.1 정의
순수 함수 형태로 작성된 통신 서비스 계층입니다. React 컴포넌트 수명 주기와 완전히 독립되어 있습니다.

### 4.2 apiService.ts

REST API 호출을 담당하는 순수 서비스 모듈입니다.

```typescript
// admin/src/services/apiService.ts
export async function fetchClientsApi(): Promise<Client[]> {
  const res = await fetch('/api/db/clients');
  const json = await res.json();
  return json.success ? json.data : [];
}

export async function purgeClientApi(clientId: string): Promise<boolean> {
  const res = await fetch(`/api/db/clients/${clientId}`, { method: 'DELETE' });
  const json = await res.json();
  return json.success;
}
```

### 4.3 socketService.ts

WebSocket 통신을 담당하는 순수 서비스 모듈입니다.

```typescript
// admin/src/services/socketService.ts
export function createAdminSocket(): WebSocket {
  const wsUrl = 'ws://localhost:9600?clientId=admin-main&clientType=admin';
  return new WebSocket(wsUrl);
}

export function sendSocketMessage(
  socket: WebSocket | null,
  targetId: string,
  action: string,
  payload: unknown
): boolean {
  if (!socket || socket.readyState !== WebSocket.OPEN) return false;
  
  const packet: WebSocketMessage = {
    senderId: 'admin-main',
    targetId,
    action,
    payload
  };
  socket.send(JSON.stringify(packet));
  return true;
}
```

### 4.4 AI 서비스 개발 가이드
- **React 독립**: React import를 사용하지 않아야 합니다.
- **순수 함수**: 모든 함수는 부수 효과가 없어야 합니다.
- **오류 처리**: try-catch 블록에서 오류를 상위 계층으로 전파합니다.
- **타입 추론**: 반환 타입을 명시적으로 정의합니다.

## 5. 비즈니스 로직 훅 (hooks/)

### 5.1 정의
React의 상태 및 수명 주기를 관리하는 커스텀 훅 계층입니다. 서비스 계층을 활용하여 비즈니스 로직을 구현합니다.

### 5.2 useAdminDbApi 훅

REST API 상태 관리 및 데이터베이스 액션을 담당합니다.

```typescript
// admin/src/hooks/useAdminDbApi.ts
import { fetchClientsApi, purgeClientApi } from '../services/apiService.js';

export function useAdminDbApi() {
  const [clients, setClients] = useState<Client[]>([]);
  
  const loadClients = useCallback(async () => {
    try {
      const data = await fetchClientsApi();
      setClients(data);
    } catch {
      // API 예외 처리
    }
  }, []);
  
  const executePurgeClient = useCallback(async (clientId: string) => {
    if (!confirm(`클라이언트 [${clientId}]를 강제 추방하시겠습니까?`)) return false;
    const success = await purgeClientApi(clientId);
    if (success) {
      await loadClients();
      return true;
    }
    return false;
  }, [loadClients]);
  
  return { clients, loadClients, executePurgeClient };
}
```

### 5.3 useAdminSocket 훅

WebSocket 통신 상태 및 실시간 패킷 중계를 담당합니다.

```typescript
// admin/src/hooks/useAdminSocket.ts
import { createAdminSocket, sendSocketMessage } from '../services/socketService.js';

export function useAdminSocket(setLogs: Dispatch<SetStateAction<CrawlLog[]>>) {
  const [wsStatus, setWsStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const wsRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    const socket = createAdminSocket();
    wsRef.current = socket;
    
    socket.onopen = () => setWsStatus('CONNECTED');
    socket.onclose = () => setWsStatus('DISCONNECTED');
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.action === 'CRAWL_LOG') {
        setLogs(prev => [createLogFromMessage(message), ...prev]);
      }
    };
    
    return () => socket.close();
  }, [setLogs]);
  
  const dispatchCommand = useCallback((targetId: string, action: string, payloadStr: string) => {
    try {
      const parsedPayload = JSON.parse(payloadStr);
      return sendSocketMessage(wsRef.current, targetId, action, parsedPayload);
    } catch {
      return false;
    }
  }, []);
  
  return { wsStatus, dispatchCommand };
}
```

### 5.4 AI 훅 개발 가이드
- **서비스 연동**: 항상 services/ 계층의 함수를 사용합니다.
- **useCallback 사용**: 모든 콜백 함수는 useCallback으로 memoization합니다.
- **의존성 배열**: useEffect, useCallback의 의존성 배열을 정확히 정의합니다.
- **에러 처리**: 사용자 친화적인 오류 메시지를 표시합니다.

## 6. 레이아웃 컴포넌트 (components/layout/)

### 6.1 디렉토리 구조

```
components/layout/
├── Navbar/           # 상단 네비게이션
│   ├── ProjectSelector.tsx
│   ├── GlobalSearchBar.tsx
│   ├── HeaderTools.tsx
│   └── TopBar.tsx
├── Breadcrumb/      # 브레드크럼
│   └── BreadcrumbBar.tsx
├── Sidebar/         # 사이드바
│   └── Sidebar.tsx
└── GcpMainLayout.tsx # 메인 레이아웃
```

### 6.2 TopBar 컴포넌트

GCP 스타일 상단 네비게이션 툴바입니다.

```typescript
// admin/src/components/layout/Navbar/TopBar.tsx
interface TopBarProps {
  wsStatus: ConnectionStatus;
  onToggleSidebar: () => void;
  onRefresh: () => void;
}

export function TopBar({ wsStatus, onToggleSidebar, onRefresh }: TopBarProps) {
  return (
    <header className="h-12 bg-[#1a73e8] text-white flex items-center justify-between px-3">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="p-1.5 hover:bg-blue-700 rounded">
          ☰
        </button>
        <span className="bg-white text-[#1a73e8] font-black text-xs px-1.5 py-0.5 rounded">GCP</span>
        <span>WebCrawlServer</span>
        <ProjectSelector />
      </div>
      <GlobalSearchBar />
      <HeaderTools wsStatus={wsStatus} onRefresh={onRefresh} />
    </header>
  );
}
```

### 6.3 GcpMainLayout 컴포넌트

GCP 스타일 메인 레이아웃 프레임워크입니다.

```typescript
// admin/src/components/layout/GcpMainLayout.tsx
interface GcpMainLayoutProps {
  children: ReactNode;
  wsStatus: ConnectionStatus;
  clientCount: number;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onRefresh: () => void;
  onClearLogs: () => void;
}

export function GcpMainLayout({
  children,
  wsStatus,
  clientCount,
  activeTab,
  onSelectTab,
  onRefresh,
  onClearLogs
}: GcpMainLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  return (
    <div className="min-h-screen bg-[#18191c] text-gray-100 flex flex-col">
      <TopBar wsStatus={wsStatus} onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)} />
      <BreadcrumbBar activeTab={activeTab} onRefresh={onRefresh} onClearLogs={onClearLogs} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          clientCount={clientCount}
        />
        <main className="flex-1 p-5 overflow-y-auto bg-[#18191c]">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 6.4 AI 레이아웃 개발 가이드
- **GCP 스타일**: Google Cloud Console 디자인 시스템을 준수합니다.
- **색상 체계**: 정의된 색상 코드를 엄격히 사용합니다.
- **반응형 디자인**: 모든 컴포넌트는 모바일부터 데스크탑까지 지원해야 합니다.
- **접근성**: select-none, aria-label 등 접근성 속성을 적절히 사용합니다.

## 7. 메트릭 컴포넌트 (components/metrics/)

### 7.1 MetricCardItem

단일 메트릭 카드 컴포넌트입니다.

```typescript
// admin/src/components/metrics/MetricCardItem.tsx
interface MetricCardItemProps {
  title: string;
  value: string | number;
  subValue: string;
  valueColorClass?: string;
}

export function MetricCardItem({
  title,
  value,
  subValue,
  valueColorClass = 'text-white'
}: MetricCardItemProps) {
  return (
    <div className="bg-[#202124] border border-gray-800 rounded p-3 flex flex-col justify-between">
      <div className="text-[11px] font-medium text-gray-400">{title}</div>
      <div className="flex items-baseline justify-between mt-2">
        <div className={`text-2xl font-bold font-mono ${valueColorClass}`}>{value}</div>
        <div className="text-[10px] text-gray-400">{subValue}</div>
      </div>
    </div>
  );
}
```

### 7.2 MetricCardsGroup

4개의 메트릭 카드 그리드입니다.

```typescript
// admin/src/components/metrics/MetricCardsGroup.tsx
export function MetricCardsGroup({ clientCount, logCount }: MetricCardsGroupProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <MetricCardItem
        title="ACTIVE CRAWLER NODES"
        value={clientCount}
        subValue="● Online Status"
        valueColorClass="text-green-400"
      />
      <MetricCardItem
        title="TOTAL CRAWLED LOGS"
        value={logCount}
        subValue="Rows in SQLite"
        valueColorClass="text-yellow-400"
      />
      <MetricCardItem
        title="DATABASE JOURNAL MODE"
        value="WAL Mode"
        subValue="better-sqlite3"
        valueColorClass="text-blue-400"
      />
      <MetricCardItem
        title="NETWORK PORT BINDING"
        value="Port 9600"
        subValue="HTTP/WS Shared"
        valueColorClass="text-green-400"
      />
    </div>
  );
}
```

## 8. 테이블 컴포넌트 (components/tables/)

### 8.1 GcpClientsTable

GCP 스타일 데이터 테이블 컴포넌트입니다.

```typescript
// admin/src/components/tables/GcpClientsTable.tsx
interface GcpClientsTableProps {
  clients: Client[];
  onSelectTarget: (clientId: string) => void;
  onPurgeClient: (clientId: string) => void;
}

export function GcpClientsTable({
  clients,
  onSelectTarget,
  onPurgeClient
}: GcpClientsTableProps) {
  return (
    <div className="bg-[#202124] border border-gray-800 rounded shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 bg-[#28292c]">
        <span className="font-bold text-xs text-gray-200 tracking-wide uppercase">
          Crawler Node Instances ({clients.length})
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#28292c] text-gray-400 border-b border-gray-800">
              <th className="p-3 w-10 text-center">☐</th>
              <th className="p-3">NODE ID (UUID)</th>
              <th className="p-3">CLIENT TYPE</th>
              <th className="p-3">STATUS</th>
              <th className="p-3">CONNECTED AT</th>
              <th className="p-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-gray-200">
            {clients.map((client) => (
              <tr key={client.client_id} className="hover:bg-[#2d2e31] transition">
                <td className="p-3 text-center text-gray-500">☐</td>
                <td className="p-3 font-semibold text-blue-300">{client.client_id}</td>
                <td className="p-3">
                  <span className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded">
                    {client.client_type}
                  </span>
                </td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 bg-green-950 text-green-300 text-[10px] px-2 py-0.5 rounded">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>
                    Ready / Active
                  </span>
                </td>
                <td className="p-3 text-gray-400 text-[11px]">
                  {new Date(parseInt(client.connected_at)).toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onSelectTarget(client.client_id)}>
                      Select Target
                    </button>
                    <button onClick={() => onPurgeClient(client.client_id)}>
                      Purge
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## 9. 뷰 컴포넌트 (components/views/)

### 9.1 GcpClientsView

클라이언트 관리 뷰입니다.

```typescript
// admin/src/components/views/GcpClientsView.tsx
interface GcpClientsViewProps {
  clients: Client[];
  logCount: number;
  onSelectTarget: (clientId: string) => void;
  onPurgeClient: (clientId: string) => void;
}

export function GcpClientsView({
  clients,
  logCount,
  onSelectTarget,
  onPurgeClient
}: GcpClientsViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <MetricCardsGroup clientCount={clients.length} logCount={logCount} />
      <GcpClientsTable
        clients={clients}
        onSelectTarget={onSelectTarget}
        onPurgeClient={onPurgeClient}
      />
    </div>
  );
}
```

### 9.2 AI 뷰 개발 가이드
- **비즈니스 로직 분리**: 뷰 컴포넌트는 props를 통해 데이터를 받기만 합니다.
- **상태 관리**: 가능하면 부모 컴포넌트에서 상태를 관리합니다.
- **이벤트 핸들러**: 모든 사용자 상호작용은 props로 전달받은 콜백 함수를 호출합니다.
- **스타일 일관성**: GCP 스타일 디자인 시스템을 엄격히 따릅니다.

## 10. GCP 스타일 디자인 시스템

### 10.1 색상 체계

| 이름 | 코드 | 사용처 |
|------|------|--------|
| Primary Blue | #1a73e8 | 상단 툴바 배경 |
| Dark Background | #18191c | 메인 배경 |
| Card Background | #202124 | 카드, 사이드바, 테이블 행 |
| Sub Background | #28292c | 테이블 헤더, 브레드크럼 |
| Hover Background | #2d2e31 | 테이블 행 호버 |
| Green Status | #4caf50 | 연결 상태, 성공 |
| Red Status | #f44336 | 오프라인, 오류, 삭제 |
| Yellow Status | #f4b400 | 경고, 로그 |
| Blue Status | #4285f4 | 정보 |

### 10.2 타이포그래피

- **폰트**: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **기본 크기**: 14px (root)
- **제목**: font-bold, tracking-tight
- **본문**: text-sm, text-gray-100
- **보조 텍스트**: text-xs, text-gray-400
- **코드**: font-mono, text-xs

### 10.3 간격 시스템

- **기본 패딩**: p-2, p-3, p-4, p-5
- **간격**: gap-1, gap-2. gap-3, gap-4
- **레이아웃**: min-h-screen, flex, flex-col, items-center, justify-between

## 11. App.tsx 최상위 엔트리

### 11.1 구조

```typescript
// admin/src/App.tsx
import { useState, useCallback } from 'react';
import { useAdminDbApi } from './hooks/useAdminDbApi.js';
import { useAdminSocket } from './hooks/useAdminSocket.js';
import { GcpMainLayout } from './components/layout/GcpMainLayout.js';
import { GcpClientsView } from './components/views/GcpClientsView.js';
import { GcpControlConsoleView } from './components/views/GcpControlConsoleView.js';
import { GcpCrawlLogsView } from './components/views/GcpCrawlLogsView.js';
import { ActiveTab } from './types/index.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('clients');
  const [targetId, setTargetId] = useState<string>('ALL');

  const { clients, logs, setLogs, loadClients, loadLogs, executeClearLogs, executePurgeClient } = useAdminDbApi();

  const handleConnect = useCallback(() => {
    loadClients();
    loadLogs();
  }, [loadClients, loadLogs]);

  const { wsStatus, dispatchCommand } = useAdminSocket(setLogs, handleConnect);

  const handleSelectTarget = (clientId: string) => {
    setTargetId(clientId);
    setActiveTab('console');
  };

  return (
    <GcpMainLayout
      wsStatus={wsStatus}
      clientCount={clients.length}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onRefresh={() => { loadClients(); loadLogs(); }}
      onClearLogs={executeClearLogs}
    >
      {activeTab === 'clients' && (
        <GcpClientsView
          clients={clients}
          logCount={logs.length}
          onSelectTarget={handleSelectTarget}
          onPurgeClient={executePurgeClient}
        />
      )}
      {activeTab === 'console' && (
        <GcpControlConsoleView
          targetId={targetId}
          setTargetId={setTargetId}
          onDispatch={dispatchCommand}
        />
      )}
      {activeTab === 'logs' && (
        <GcpCrawlLogsView logs={logs} onClearLogs={executeClearLogs} />
      )}
    </GcpMainLayout>
  );
}
```

### 11.2 AI App.tsx 개발 가이드
- **최소화 원칙**: App.tsx는 오직 계층을 조율하는 역할만 해야 합니다.
- **상태 관리**: 전역 상태는 훅으로 위임합니다.
- **라우팅**: tab 기반 라우팅을 사용합니다.
- **의존성 주입**: 모든 의존성은 props를 통해 주입됩니다.

## 12. 개발 워크플로우

### 12.1 새로운 기능 추가

1. **타입 정의**: types/index.ts에 필요한 인터페이스 추가
2. **서비스 계층**: services/에 순수 통신 함수 추가
3. **비즈니스 로직**: hooks/에 커스텀 훅 추가
4. **UI 컴포넌트**: components/에 컴포넌트 추가
5. **통합**: App.tsx에 조율 로직 추가

### 12.2 AI 기반 코드 리뷰 체크리스트

- [ ] ESM(import/export) 기준으로 작성됐나요?
- [ ] TypeScript 타입이 엄격히 정의됐나요?
- [ ] `any` 타입이 사용되지 않았나요?
- [ ] 계층화 구조가 준수됐나요?
- [ ] GCP 스타일 디자인 시스템이 적용됐나요?
- [ ] 컴포넌트 재사용성이 고려됐나요?
- [ ] 오류 처리가 적절히 갖고 있나요?
- [ ] 코드 주석이 한글로 작성됐나요?
- [ ] `select-none` 클래스가 텍스트가 포함된 요소에 사용되지 않았나요? (R-00302 3.4절, R-00106 5.1.1절 참고)
- [ ] 유효하지 않은 Tailwind 클래스가 사용되지 않았나요? (R-00106 5.1.2절 참고)

## 13. 테스트 가이드

### 13.1 단위 테스트

- **서비스 테스트**: apiService, socketService 함수 단위 테스트
- **훅 테스트**: useAdminDbApi, useAdminSocket 훅 테스트
- **컴포넌트 테스트**: 렌더링, 사용자 상호작용 테스트

### 13.2 통합 테스트

- **TypeScript 컴파일**: `npx tsc --project admin\tsconfig.json`
- **ESLint 검사**: `npm run lint`
- **빌드 테스트**: `npm run build --workspace=admin`

## 14. 문서화 가이드

### 14.1 CHANGELOG 기록

모든 중요한 변경사항은 `docs/CHANGELOG/`에 기록해야 합니다.

- 파일명: `YYYYMMDD-설명.md`
- 내용: 문제, 원인, 해결 방안, 변경 파일, 검증 결과
- 예시: `admin-gcp-style-full-refactoring-20260803090000.md`

### 14.2 ADR 작성

아키텍처 결정은 `docs/decision/`에 ADR로 기록해야 합니다.

- 파일명: `설명.md`
- 내용: 배경, 결정, 대안, 결과, 후속 작업
- 예시: `Admin Console google style.md`

## 15. FAQ

### Q: `any` 타입을 사용해야 할 때 어떻게 하나요?
A: `unknown`을 사용하고, 필요한 경우 타입 어서션을 적용합니다. 외부 라이브러리 반환 값에만 타입 어서션을 사용합니다.

### Q: 컴포넌트가 너무 커질 때 어떻게 하죠?
A: 단일 책임 원칙을 적용하여 작은 컴포넌트로 분할합니다. 200라인 이상은 반드시 분리해야 합니다.

### Q: AI가 생성한 코드를 리뷰할 때 어떤 점을 확인하나요?
A: 12.2절의 AI 기반 코드 리뷰 체크리스트를 참고하세요.

### Q: 새로운 라이브러리를 도입하고 싶을 때 어떻게 하죠?
A: 반드시 ADR을 작성하고, 타입 정의가 ESM 호환되는지 확인해야 합니다.

## 관련 문서

- R-00300 admin-guidelines.md: 관리자 기능 및 운영 UI 지침
- R-00100 architecture.md: 프로젝트 개요 및 시스템 구성
- R-00101 tech-stack.md: 기술 스택
- R-00102 structure.md: 폴더 구조 및 명명 규칙
- R-00106 coding.md: 코드 작성 규칙
- docs/decision/Admin Console google style.md: 6단계 리팩토링 가이드
- docs/decision/Admin Console.md: 초기 모듈화 아키텍처

## 문서 정보

- **Rule ID**: R-00301
- **분류**: 관리자 UI (R-003xx)
- **우선순위**: R-00300 다음
- **작성자**: Mistral Vibe
- **작성일**: 2026-08-03
- **버전**: 1.0.0
- **상태**: 활성

---

## docs/rule/R-00302 admin-ui-ux-guidelines.md

# R-00302 docs/rule/R-00302 admin-ui-ux-guidelines.md

`WebCrawlServer` 관리자 UI/UX 디자인 가이드라인 문서입니다. 본 문서는 관리자 대시보드 화면 구성, 색상 체계, 타이포그래피, 아이콘, 상태 피드백, 접근성, 반응형 레이아웃 등 UI/UX 품질 기준을 정의합니다.

## 적용 범위

- `admin/src/` 기반 관리자 대시보드 UI 구성 요소
- 관리자 대시보드의 레이아웃, 시각적 스타일, 상호작용 패턴
- UI 상태 표시와 오류/성공 피드백 체계
- 관리자 대시보드 개발 시 AI가 준수해야 할 디자인 표준

## 1. 디자인 시스템

### 1.1 색상 체계
- 기본 테마: `dark`
- 기본 배경: `#141A23`
- 메인 서피스: `#161C27`
- 카드 및 패널 배경: `#1E293B`, `#202124`
- 강조 서피스: `#111827`
- 기본 텍스트: `#E8EAED`
- 세컨더리 텍스트: `#94A3B8`
- 보조 텍스트: `#CBD5E1`
- 주요 강조: `#1A73E8`
- 성공 상태: `#34A853`
- 경고 상태: `#FBBC05`
- 오류 상태: `#EA4335`
- 경계선: `#334155`, `#475569`
- 입력/버튼 강조: `#1A73E8`, `#185ABC`

#### 1.1.1 테마 변형
- 기본 관리자 UI는 다크 테마 스타일을 우선 사용한다.
- 라이트 테마가 필요한 경우에는 기존 라이트 토큰(`#F8F9FA`, `#FFFFFF`, `#0F172A`)을 사용하되, 문서에 별도 명시해야 한다.
- 다크 테마는 `console.cloud.google.com` 다크 모드의 색상 대비와 시각적 밀도를 참고한다.
- 가능한 경우 테마를 명시적으로 분리하고, 색상 토큰을 재사용하여 일관성을 유지한다.

#### 1.1.2 다크 테마 컬러 토큰 예시
- `--bg-primary`: `#141A23`
- `--bg-surface`: `#161C27`
- `--bg-card`: `#1E293B`
- `--bg-panel`: `#202124`
- `--bg-secondary`: `#111827`
- `--text-primary`: `#E8EAED`
- `--text-secondary`: `#94A3B8`
- `--text-muted`: `#CBD5E1`
- `--border`: `#334155`
- `--border-strong`: `#475569`
- `--accent-primary`: `#1A73E8`
- `--accent-primary-hover`: `#185ABC`
- `--success`: `#34A853`
- `--warning`: `#FBBC05`
- `--danger`: `#EA4335`

### 1.2 타이포그래피
- 기본 본문: `Noto Sans KR`, `Pretendard` 또는 sans-serif
- 코드/로그: `JetBrains Mono`, `Fira Code`, monospace
- 제목 및 버튼: 명확한 정보 계층을 위해 굵기 500~700 사용
- 주석/부가 정보: 12px~13px, 본문 텍스트는 14px~16px 수준

### 1.3 아이콘
- 기본 아이콘 시스템은 `Material Symbols Outlined` 또는 `Material Symbols Rounded` 사용
- 아이콘 크기는 24px 기준으로 일관성 유지
- 시각적 통일성을 위해 선형 아이콘을 우선 사용

### 1.4 간격과 카드
- 기본 여백 단위: 8px, 12px, 16px, 24px
- 카드 및 컨테이너는 `border-radius: 8px` 수준의 둥근 모서리
- 카드 배경은 다크 테마일 경우 `#1E293B`, `#202124`, `#111827`을 사용
- 그림자는 얇고 연한 `shadow-sm` 형태로 사용

## 2. 레이아웃 및 네비게이션

### 2.1 기본 구조
- 관리자 화면은 상단 툴바, 사이드바, 메인 컨텐츠 영역으로 구성
- 사이드바는 축소/확장 토글을 제공
- 메인 컨텐츠는 스크롤 가능한 단일 영역으로 구성
- 상태 요약, 요약 카드, 테이블, 로그 뷰를 직관적으로 분리

### 2.2 탭 및 상태 전환
- 주요 탭은 분명한 라벨과 상태 강조를 제공
- 선택된 탭은 색상으로 구분하고, 활성 탭 정보는 상단에 표시
- 데이터 새로고침 버튼, 로그 삭제 버튼 등 주요 액션은 명확히 분리
- 다크 테마에서는 버튼과 탭 강조에 `#1A73E8` 또는 `#34A853`을 사용하고, 배경 대비가 충분한지 검증한다

### 2.3 반응형 지원
- 모바일/태블릿 뷰에서는 사이드바가 오버레이 또는 축소 모드로 전환
- 입력 폼과 버튼은 최소 44px 이상의 클릭 영역 확보
- 테이블은 가로 스크롤을 지원하되, 가능한 경우 행과 셀을 재배열하여 가독성 유지
- 다크 모드에서 텍스트 대비가 낮아지지 않도록 라벨과 데이터 간 충분한 시각적 구분을 유지한다

## 3. 상호작용 및 상태 피드백

### 3.1 상태 표시
- WebSocket 연결 상태, API 상태, 로그 상태를 별도 배지로 표시
- 연결 상태는 `CONNECTED`, `DISCONNECTED`로 구분하고 색상/아이콘으로 시각화
- 실패, 경고, 성공 상태는 색상과 메시지로 즉시 피드백

### 3.2 제어 액션
- 로그 삭제, 클라이언트 추방과 같이 파괴적인 액션은 반드시 사용자 확인을 요구
- 명령 송출 시 성공/실패 안내 메시지를 표시
- 실패 시 재시도 안내 또는 추가 조치 방향을 제시

### 3.3 메시지 타입
- 일반 상태 메시지: `info`
- 확인이 필요한 경고: `warning`
- 실패 또는 오류: `error`
- 성공: `success`

### 3.4 접근성
- 버튼, 입력 필드, 링크에 `aria-label` 또는 적절한 라벨 사용
- 색상 대비는 WCAG AA 기준을 준수하도록 설계
- 텍스트 크기와 클릭 영역은 충분히 확보
- **텍스트 선택 허용 원칙**: 기본적으로 모든 텍스트 요소는 사용자가 마우스로 드래그하여 선택할 수 있도록 해야 합니다.
- **`select-none` 사용 제한**: `select-none` 클래스는 **오로지 텍스트가 포함되지 않은 순수 UI 인터랙션 요소**(예: 아이콘만 있는 버튼)에만 제한적으로 사용할 수 있습니다.
  - ✅ 사용 가능: 아이콘만 있는 버튼 (`<button className="p-2"><span className="material-symbols-outlined">menu</span></button>`)
  - ❌ 사용 금지: 텍스트가 포함된 모든 요소(헤더, 사이드바, 테이블 셀, 모달 본문, 메트릭 카드 등)
- **예외 경우 문서화**: `select-none`을 사용해야 하는 경우, 반드시 인라인 주석에 사용 이유를 명시해야 합니다.

## 4. 개발자 가이드

### 4.1 코드 스타일
- UI 컴포넌트는 재사용 가능한 작은 단위로 분리
- 스타일은 Tailwind 유틸리티와 클래스 조합을 우선 사용
- 인라인 스타일 대신 공통 클래스 및 CSS 변수를 활용

### 4.2 디자인 가이드 준수
- AI는 `docs/decision/admin UIUX.md`와 본 문서를 참고하여 UI/UX를 구현
- 이미 존재하는 UI 컴포넌트 스타일을 최대한 재사용
- 신규 UI 추가 시 동일한 디자인 토큰과 색상 규칙을 따름

### 4.3 문서화
- 관리자 UI/UX 관련 규칙은 `docs/rule/R-00302 admin-ui-ux-guidelines.md`에 명시
- UI/UX 변경이 발생하면 `docs/CHANGELOG/`에 상세 변경 이력을 작성
- 주요 UI/UX 결정은 필요 시 ADR 또는 `docs/decision/` 문서로 기록

---

## docs/rule/R-00303 admin-node-monitoring.md

본 문서는 `WebCrawlServer` 관리자 대시보드(`admin/`)의 **[수집 노드 관리]** 화면에서 수집 노드들의 실시간 상태(`사이드바 활성` / `백그라운드 가동` / `오프라인`)를 시각적으로 세분화하여 표현하고, **노드 별칭(Alias) 설정 및 노드별 환경설정 모달(`NodeConfigModal`)**을 구현하기 위한 UI/UX 지침서입니다.

---

## 1. 개요 및 표현 목표

1.1 **개요**: 수집 노드별로 난해한 UUID 대신 직관적인 한글 별칭(`alias`)을 부여하고, 노드 옆의 **`[환경설정 ⚙️]`** 버튼을 통해 노드 전용 물리 저장 경로 및 담당 워커를 개별 설정할 수 있게 합니다.  
1.2 **표현 및 설정 목표**:
   - **노드 식별성 확보**: 노드 ID 옆에 한글 별칭(예: `오페라-개인-수집기-1`) 및 `[환경설정 ⚙️]` 버튼을 배치.
   - **노드 환경설정 모달 (`NodeConfigModal.tsx`)**:
     1. **노드 별칭 (Alias)** 수정.
     2. **노드 전용 물리 저장 경로 (`customStoragePath`)** 설정 (예: `E:\data\opera_node_1`).
     3. **담당 워커 (`assignedWorkerId`)** 지정 (`기본 수집 워커`, `페이스북 워커` 등).
   - **3대 노드 상태 배지 구분**:
     - `● 온라인 (사이드바 활성 🖥️)`: 실시간 소켓 가동 + 유저가 사이드바 UI를 사용 중인 상태.
     - `● 온라인 (백그라운드 가동 🌙)`: 실시간 소켓 가동 + 유저가 사이드바를 닫았으나 오프스크린 수집 엔진이 24시간 가동 중인 상태.
     - `○ 연결 끊김 (과거 이력)`: 오프라인 과거 DB 이력.

---

## 2. 노드 환경설정 모달 명세 (`NodeConfigModal.tsx`)

노드 ID 별로 한글 별칭, 전용 저장 경로, 담당 워커를 개별 설정하는 모달 컴포넌트 규정입니다.

```tsx
// admin/src/components/modals/NodeConfigModal.tsx

import { useState, useEffect } from 'react';
import { Client, WorkerRecord } from '../../types/index.js';

interface NodeConfigModalProps {
  isOpen: boolean;
  client: Client | null;
  workers: WorkerRecord[];
  onClose: () => void;
  onSave: (clientId: string, alias: string, assignedWorkerId: string, customStoragePath: string) => Promise<boolean>;
}

export function NodeConfigModal({ isOpen, client, workers, onClose, onSave }: NodeConfigModalProps) {
  if (!isOpen || !client) return null;

  const [alias, setAlias] = useState(client.alias || '');
  const [assignedWorkerId, setAssignedWorkerId] = useState(client.assigned_worker_id || 'default_worker');
  const [customStoragePath, setCustomStoragePath] = useState(client.custom_storage_path || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setAlias(client.alias || '');
    setAssignedWorkerId(client.assigned_worker_id || 'default_worker');
    setCustomStoragePath(client.custom_storage_path || '');
  }, [client]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(client.client_id, alias, assignedWorkerId, customStoragePath);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 bg-[#111827] border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400">settings</span>
            노드 환경설정 [{client.client_id.slice(0, 8)}]
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4 text-xs font-sans">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">노드 한글 별칭 (Alias)</label>
            <input
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="예: 오페라-개인-수집기-1"
              className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded text-slate-100 outline-none focus:border-[#1A73E8]"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">담당 수집 워커 (Worker)</label>
            <select
              value={assignedWorkerId}
              onChange={(e) => setAssignedWorkerId(e.target.value)}
              className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded text-slate-100 outline-none focus:border-[#1A73E8]"
            >
              <option value="default_worker">기본 수집 워커 (Default Worker)</option>
              {workers.map((w) => (
                <option key={w.worker_id} value={w.worker_id}>
                  {w.worker_name} [{w.worker_id}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">노드 전용 물리 저장 경로 (선택)</label>
            <input
              value={customStoragePath}
              onChange={(e) => setCustomStoragePath(e.target.value)}
              placeholder="미입력 시 워커/기본 저장 경로 적용 (예: E:\data\opera_node_1)"
              className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded text-slate-100 outline-none focus:border-[#1A73E8] font-mono text-[11px]"
            />
          </div>
        </div>

        <div className="px-6 py-3 bg-[#111827] border-t border-slate-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-200">
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-[#1A73E8] hover:bg-[#185abc] text-white rounded font-semibold"
          >
            {isSaving ? "저장 중..." : "설정 저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 3. 노드 별칭 및 `[환경설정 ⚙️]` 버튼 테이블 레이아웃 (`GcpClientsTable.tsx`)

```tsx
// admin/src/components/tables/GcpClientsTable.tsx 일부

<td className="p-3">
  <div className="flex items-center gap-2">
    <div className="flex flex-col">
      <span className="font-semibold text-slate-100 font-sans text-xs">
        {client.alias || "별칭 미지정 노드"}
      </span>
      <span className="text-slate-500 font-mono text-[10px] break-all">
        {client.client_id}
      </span>
    </div>
    <button
      onClick={() => onOpenConfigModal(client)}
      className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
      title="노드 환경설정"
    >
      <span className="material-symbols-outlined text-xs">settings</span>
    </button>
  </div>
</td>
```

---

## 4. 검증 체크리스트

- [ ] 노드 ID 표출 칸 옆에 한글 별칭과 `[환경설정 ⚙️]` 버튼이 깔끔하게 표시되는가?
- [ ] `[환경설정 ⚙️]` 클릭 시 모달이 정상 팝업되며 별칭, 담당 워커, 전용 저장 경로가 수정 저장되는가?
- [ ] 노드별 실시간 상태 배지(`사이드바 활성`, `백그라운드 가동`, `연결 끊김`)가 정상 표출되는가?

---

## docs/rule/R-00304 admin-worker-and-db-manager.md

본 문서는 `WebCrawlServer` 관리자 대시보드(`admin/`)의 **수집 워커 빌더(Worker Builder)** 및 **멀티 DB / 스토리지 매니저 UI** 개발 지침서입니다. 관리자가 UI 상에서 코딩 없이 신규 워커를 생성하고, 커스텀 DB 스키마 및 저장 디렉터리를 동적 구성할 수 있도록 지원합니다.

---

## 1. 개요 및 화면 목적

1.1 **개요**: 서버에 가동될 수집 워커를 Admin UI에서 빌드하여, 커스텀 데이터 스키마와 전용 DB 파일(`databases/workers/worker_<name>.db`)을 동적 수립합니다.  
1.2 **화면 목적**:
   - **워커 빌더 UI (`WorkerManagerView.tsx`)**:
     - 신규 워커 생성 및 기본 파라미터 상속.
     - 대상 DB 지정 (기존 DB 선택 또는 신규 DB 동적 생성).
     - 커스텀 필드(스키마 JSON) 동적 추가/삭제.
     - 워커 전용 저장소 루트 경로 지정.
   - **DB / 스토리지 매니저 UI**:
     - `databases/` 및 `databases/workers/` 내의 모든 `.db` 파일 목록 조회 및 테이블 인스펙터.
     - 물리 파일 저장 디스크 용량 모니터링.

---

## 2. 수집 워커 빌더 UI 규정 (`WorkerManagerView.tsx`)

신규 워커를 빌드하고 커스텀 스키마 필드를 동적으로 추가하는 UI 컴포넌트 명세입니다.

```tsx
// admin/src/components/views/WorkerManagerView.tsx

import { useState } from 'react';
import { CustomFieldDef, WorkerRecord } from '../../types/index.js';

interface WorkerManagerViewProps {
  workers: WorkerRecord[];
  onCreateWorker: (params: {
    workerId: string;
    workerName: string;
    dbFileName: string;
    tableName: string;
    storageRootPath: string;
    customFields: CustomFieldDef[];
  }) => Promise<boolean>;
}

export function WorkerManagerView({ workers, onCreateWorker }: WorkerManagerViewProps) {
  const [workerId, setWorkerId] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [dbFileName, setDbFileName] = useState('worker_custom.db');
  const [tableName, setTableName] = useState('custom_logs');
  const [storageRootPath, setStorageRootPath] = useState('E:\\data\\custom_worker');
  const [customFields, setCustomFields] = useState<CustomFieldDef[]>([]);

  // 커스텀 스키마 필드 동적 추가
  const handleAddField = () => {
    setCustomFields([
      ...customFields,
      { name: `field_${customFields.length + 1}`, type: 'TEXT', required: false }
    ]);
  };

  const handleFieldChange = (index: number, key: keyof CustomFieldDef, value: any) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [key]: value };
    setCustomFields(updated);
  };

  const handleRemoveField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!workerId || !workerName) {
      alert('워커 ID와 이름을 입력해주세요.');
      return;
    }

    const success = await onCreateWorker({
      workerId,
      workerName,
      dbFileName,
      tableName,
      storageRootPath,
      customFields
    });

    if (success) {
      setWorkerId('');
      setWorkerName('');
      setCustomFields([]);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none font-sans">
      {/* 1. 가동 중인 워커 현황 테이블 */}
      <div className="bg-[#202124] border border-gray-800 rounded shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 bg-[#28292c] flex justify-between items-center">
          <span className="font-bold text-xs text-gray-200 tracking-wide uppercase">
            Active Worker Instances ({workers.length})
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#111827] text-slate-300 border-b border-slate-800 text-[11px] font-semibold">
                <th className="p-3">워커 ID</th>
                <th className="p-3">워커 이름</th>
                <th className="p-3">바인딩 DB 파일</th>
                <th className="p-3">테이블명</th>
                <th className="p-3">저장소 루트</th>
                <th className="p-3">기본 워커 여부</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-200 font-mono">
              {workers.map((w) => (
                <tr key={w.worker_id} className="hover:bg-[#2d2e31] transition">
                  <td className="p-3 font-semibold text-blue-300">{w.worker_id}</td>
                  <td className="p-3 font-sans font-medium text-slate-100">{w.worker_name}</td>
                  <td className="p-3 text-slate-300">{w.db_file_path}</td>
                  <td className="p-3 text-yellow-300">{w.table_name}</td>
                  <td className="p-3 text-slate-400 text-[11px] break-all">{w.storage_root_path}</td>
                  <td className="p-3 font-sans">
                    {w.is_default ? (
                      <span className="bg-blue-900/40 text-blue-300 text-[10px] px-2 py-0.5 rounded border border-blue-700/40 font-semibold">
                        Default Worker
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded">
                        Custom Worker
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. 신규 워커 빌더 폼 */}
      <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 flex flex-col gap-6 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100">신규 수집 워커 동적 빌더</h2>
            <p className="text-xs text-slate-400">새로운 워커와 전용 DB 스키마 테이블을 동적으로 생성합니다.</p>
          </div>
          <button
            onClick={handleSubmit}
            className="bg-[#1A73E8] hover:bg-[#185abc] text-white text-xs font-semibold px-4 py-2 rounded transition shadow-sm"
          >
            워커 및 DB 빌드 단행
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">워커 ID (영어 식별자)</label>
            <input
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              placeholder="예: worker_facebook"
              className="w-full p-3 bg-[#1E293B] border border-slate-700 rounded text-slate-100 outline-none focus:border-[#1A73E8] font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">워커 한글 이름</label>
            <input
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              placeholder="예: 페이스북 전담 수집 워커"
              className="w-full p-3 bg-[#1E293B] border border-slate-700 rounded text-slate-100 outline-none focus:border-[#1A73E8]"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">대상 DB 파일명 (databases/workers/)</label>
            <input
              value={dbFileName}
              onChange={(e) => setDbFileName(e.target.value)}
              placeholder="예: worker_facebook.db"
              className="w-full p-3 bg-[#1E293B] border border-slate-700 rounded text-slate-100 font-mono outline-none focus:border-[#1A73E8]"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">대상 테이블 이름</label>
            <input
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="예: facebook_posts"
              className="w-full p-3 bg-[#1E293B] border border-slate-700 rounded text-slate-100 font-mono outline-none focus:border-[#1A73E8]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-400 mb-1 font-semibold">워커 전용 파일 저장소 루트 경로</label>
            <input
              value={storageRootPath}
              onChange={(e) => setStorageRootPath(e.target.value)}
              placeholder="예: E:\data\facebook_worker"
              className="w-full p-3 bg-[#1E293B] border border-slate-700 rounded text-slate-100 font-mono outline-none focus:border-[#1A73E8]"
            />
          </div>
        </div>

        {/* 커스텀 스키마 필드 구성 */}
        <div className="bg-[#1E293B] p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-xs text-slate-200">
              커스텀 스키마 필드 정의 (기본 파라미터는 자동 상속)
            </span>
            <button
              onClick={handleAddField}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded transition border border-slate-700"
            >
              <span className="material-symbols-outlined text-xs">add</span>
              <span>필드 추가</span>
            </button>
          </div>

          {customFields.map((field, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-[#0F172A] p-2.5 rounded border border-slate-800 text-xs">
              <input
                value={field.name}
                onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                placeholder="필드명 (예: author_id)"
                className="flex-1 p-2 bg-[#1E293B] border border-slate-700 rounded text-slate-100 font-mono"
              />
              <select
                value={field.type}
                onChange={(e) => handleFieldChange(idx, 'type', e.target.value as any)}
                className="p-2 bg-[#1E293B] border border-slate-700 rounded text-slate-100 font-mono"
              >
                <option value="TEXT">TEXT (문자열)</option>
                <option value="INTEGER">INTEGER (정수)</option>
                <option value="REAL">REAL (실수)</option>
                <option value="BLOB">BLOB (바이너리)</option>
              </select>
              <button
                onClick={() => handleRemoveField(idx)}
                className="p-1.5 bg-red-900/40 hover:bg-red-800 text-red-200 rounded transition"
              >
                <span className="material-symbols-outlined text-xs">delete</span>
              </button>
            </div>
          ))}
          {customFields.length === 0 && (
            <div className="text-center text-slate-500 text-xs py-4">
              추가 커스텀 필드가 없습니다. [필드 추가] 버튼으로 스키마를 확장할 수 있습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 3. 검증 체크리스트

- [ ] [워커 빌더] 화면에서 신규 워커 생성 시 서버의 `databases/workers/`에 독립 DB가 동적 생성되는가?
- [ ] 커스텀 스키마 필드 추가 및 삭제가 UI 상에서 정상 동작하는가?
- [ ] 생성된 워커 목록 및 매핑 정보가 관리자 대시보드에 시각화되는가?

---

## docs/rule/R-00400 plugin-guidelines.md

본 문서는 `WebCrawlServer` 프로젝트의 브라우저 확장 플러그인 개발 및 운영을 위한 최상위 통합 지침 문서입니다. **사이드바 통합 UI(`sidepanel.tsx`)** 및 **24시간 무중단 백그라운드 소켓 엔진(`offscreen.ts`)** 패러다임을 반영한 전체 시스템 아키텍처 개요, 운영 원칙 및 하위 세부 규칙 문서(`R-00410` ~ `R-00490`)로 연결되는 통합 목차(Index) 역할을 담당합니다.

---

## 1. 개요 및 적용 범위

1.1 **적용 대상**: `plugins/basic-plugin/` 패키지 및 본 프로젝트에 포함된 브라우저 확장 프로그램  
1.2 **표준 규격**: Chrome Extension Manifest V3 (MV3) 표준 규격 준수  
1.3 **기술 스택**: Node.js, TypeScript, ESM(`import`/`export`), React 19, Vite, Tailwind CSS  
1.4 **운영 목적**:
   - 오프스크린(`offscreen.ts`)을 통한 24시간 무중단 백그라운드 웹소켓 통신 유지 및 수집 패킷 적재.
        - 상시 고정형 사이드바(`sidepanel.tsx`) 대시보드를 통한 실시간 수집 감시, 멀티 SNS 자동 포스팅.
        - (참고) `깃허브(GitHub)` 연동/자동 커밋은 현재 보류 항목입니다. 즉시 구현 대상이 아님을 명시합니다.

---

## 2. 플러그인 전체 시스템 아키텍처 (System Context)

```
[ WebCrawlServer (Express/SQLite - 포트 9600) ]
       ▲
       │ (1) 24시간 무중단 단일 웹소켓 통신 (Single WebSocket Owner: clientId: UUID)
       ▼
┌──────────────────────────────────────────────────────────┐
│ offscreen.ts (Offscreen Document - 백그라운드 수집 엔진)   │
│ - 화면에 보이지 않는 24시간 헤드리스 DOM 환경             │
│ - 웹소켓 통신 소유 및 패킷 릴레이 / 백그라운드 fetch() 인출 │
└────────────────────────────▲─────────────────────────────┘
                             │ (2) chrome.runtime 내부 메시징 파이프라인
                             ▼
┌──────────────────────────────────────────────────────────┐
│ background.ts (Service Worker - 이벤트 조율자)          │
│ - 아이콘 클릭 시 사이드바 실행 (openPanelOnActionClick)  │
│ - 오프스크린 문서 자동 생성/유지 (ensureOffscreenDocument)│
└───────▲────────────────────▲─────────────────────▲───────┘
        │                    │                     │
        ▼                    ▼                     ▼
[ sidepanel.tsx ]     [ githubService.ts ]   [ content.ts ]
(사이드바 통합 UI)     (깃허브 커밋/푸시)     (선언형 페이징 수집 엔진)
```

### 2.1 주요 실행 주체 및 역할
- **`offscreen.ts` (오프스크린 엔진)**: 24시간 무중단 웹소켓 단독 소유, 백그라운드 `fetch()` + `DOMParser` 경량 인출, 패킷 인코딩/디코딩.
- **`background.ts` (서비스 워커)**: 오프스크린 생성/유지 관리, 아이콘 클릭 시 사이드바 즉시 열림 지정, 크롬 내부 메시지 라우팅.
- **`sidepanel.tsx` (사이드바 단일 메인 UI)**: 기존 팝업을 완전히 대체하는 상시 대시보드 UI. 노드 상태, 실시간 로그, 다중 포스팅 작성, 깃허브 설정 일괄 처리 (깃허브 기능은 보류).
- **`content.ts` (콘텐츠 스크립트)**: 타깃 웹페이지에 주입되어 선언형 페이징 순차 이동 수집 및 다중 SNS 자동 포스팅 DOM 입력 수행.
-- **깃허브 통합 주석**: `githubService.ts` 연동은 백로그로 이동되었으며, 현재 문서의 우선 구현 항목에는 포함되지 않습니다.

---

## 3. R-004xx 플러그인 세부 지침 인덱스 (Rule Registry)

| Rule ID | 문서 경로 | 대분류 및 담당 범위 | 비고 |
|---|---|---|---|
| **R-00400** | `docs/rule/R-00400 plugin-guidelines.md` | **통합 기본 지침**: 본 문서. 전체 맥락 및 하위 지침 통합 인덱스 | 개정 |
| **R-00410** | `docs/rule/R-00410 plugin-architecture.md` | **모듈화 아키텍처**: 계층화 구조, `sidepanel.tsx` 엔트리 소형화 규칙 | 개정 |
| **R-00420** | `docs/rule/R-00420 plugin-communication.md` | **통신 및 메시징**: `offscreen.ts` 단일 소켓 연동, 메시지 라우팅 가드 | 개정 |
| **R-00430** | `docs/rule/R-00430 plugin-crawling.md` | **DOM 크롤링**: 백그라운드 `fetch()` 인출, 선언형 페이징 수집 엔진 | 개정 |
| **R-00440** | `docs/rule/R-00440 plugin-ui-ux.md` | **UI/UX 디자인**: 상시 사이드바 대시보드 UI/UX 레이아웃 규격 | 개정 |
| **R-00450** | `docs/rule/R-00450 plugin-build-env.md` | **빌드 및 환경변수**: Vite define 주입 및 다중 번들링 엔트리 규정 | 개정 |
| **R-00460** | `docs/rule/R-00460 plugin-manifest-permissions.md` | **매니페스트 및 권한**: MV3 `"sidePanel"`, `"offscreen"` 권한 및 `default_popup` 제거 | 개정 |
| **R-00470** | `docs/rule/R-00470 plugin-sidepanel-offscreen.md` | **사이드바/오프스크린 지침**: 오프스크린 24시간 소켓 & 사이드바 통합 지침 | **신규** |
| **R-00480** | `docs/rule/R-00480 plugin-automation-crawling.md` | **백그라운드 수집/포스팅 지침**: 경량 수집, 다중 SNS 자동 포스팅 지침 | **신규** |
| **R-00490** | `docs/rule/R-00490 plugin-github-integration.md` | **깃허브 연동 지침**: 깃허브 REST API 커밋/푸시 및 토큰 동기화 지침 | **보류(백로그)** |

---

## 4. 플러그인 개발 핵심 운영 원칙 요약

4.1 **단일 소켓 독점**: 프로필당 단 1개의 웹소켓 소켓만 생성하며, 오프스크린(`offscreen.ts`)이 24시간 단독 소유합니다.  
4.2 **사이드바 단일 UI 통합**: 기존 팝업 UI(`popup.tsx`)는 완전히 제거하며, 아이콘 클릭 시 사이드바(`sidepanel.tsx`)가 대시보드로 즉시 실행됩니다.  
4.3 **경량 백그라운드 인출**: 웹페이지 수집 시 유저의 활성 탭을 이동시키지 않고 백그라운드 `fetch()` + `DOMParser`로 순수 HTML만 고속 수집합니다.  
4.4 **선언형 포스팅 & 수집**: 서버에서 전달받은 JSON 행동 양식에 따라 페이징 자동 이동 및 다중 SNS 자동 포스팅을 단행합니다.  
4.5 **깃허브 실시간 동기화 (보류)**: 깃허브 기반 자동 커밋/푸시 및 파이프라인 트리거 기능은 현재 우선순위에서 제외됩니다. 토큰 동기화 설계는 유지하되, 깃허브 API를 통한 자동 커밋/푸시 구현은 백로그로 관리합니다.  

---

## docs/rule/R-00410 plugin-architecture.md

본 문서는 `WebCrawlServer` 브라우저 확장 플러그인의 모듈화 아키텍처 개정 지침입니다. 기존 팝업 중심의 파일 구조에서 **사이드바 단일 UI(`sidepanel.tsx`)** 및 **오프스크린 24시간 소켓 엔진(`offscreen.ts`)** 패러다임으로 이관됨에 따라 향상된 계층화 디렉터리 구조와 모듈 분리 규정을 재정의합니다.

---

## 1. 모듈화 아키텍처 개요 및 목적

1.1 **단일 책임 원칙 (SRP)**: 각 소스 파일, 함수, 컴포넌트는 오직 하나의 명확한 책임만 가집니다.  
1.2 **200라인 제한 규정**: 단일 소스 파일이 200라인을 초과할 경우 반드시 기능별 모듈 파일로 분할해야 합니다.  
1.3 **계층 분리 체계**: I/O 소켓 통신 계층(`offscreen.ts`), 이벤트 조율 계층(`background.ts`), 프레젠테이션 UI 계층(`sidepanel.tsx`), 외부 API 서비스 계층(`services/`)을 엄격히 분리합니다.  

---

## 2. 표준 계층 및 디렉터리 구조

`plugins/basic-plugin/src/` 내부 소스 코드는 아래의 표준 계층 구조를 준수해야 합니다.

```
plugins/basic-plugin/src/
├── config/                  # 빌드 타임 주입 상수 및 소켓 URL 모듈
│   └── pluginConfig.ts
├── types/                   # 전역 타입 및 확장 패킷 봉투 정의 계층
│   ├── env.d.ts             # Vite define 전역 상수 타입 선언
│   └── index.ts             # WebSocketPacket<T> 및 파일/메타 타입 명세
├── services/                # 순수 통신 및 크롬/외부 API I/O 계층
│   ├── chromeService.ts     # 크롬 API 및 오프스크린 상태 질의
│   ├── githubService.ts     # 깃허브 REST API 커밋/푸시 서비스 (보류: 백로그 항목)
│   └── backgroundScraper.ts # 백그라운드 fetch() + DOMParser 인출 모듈
├── hooks/                   # 비즈니스 로직 및 React 상태 관리 훅 계층
│   └── usePopupState.ts     # 사이드바 UI용 상태 및 비즈니스 콜백 캡슐화
├── components/              # UI 프레젠테이션 컴포넌트 계층
│   ├── Header.tsx           # 상단 타이틀 툴바
│   ├── TabBar.tsx           # 탭 네비게이션
│   ├── Footer.tsx           # 하단 노드 ID 및 소켓 포트 표출 UI
│   └── tabs/                # 탭별 프레젠테이션 뷰 컴포넌트
│       ├── BasicTab.tsx     # 기본 수집 탭
│       ├── InfoTab.tsx      # 브라우저/프로세서 정보 탭
│       └── DebugTab.tsx     # 디버깅 및 커스텀 패킷 테스트 탭
├── background.ts            # 오프스크린 생성 및 메시지 라우터
├── content.ts               # DOM 수집 및 선언형 페이징 순차 수집 엔진
├── sidepanel.tsx            # 단일 메인 사이드바 UI 엔트리 (30라인 이하)
└── offscreen.ts             # 24시간 무중단 단일 웹소켓 전담 엔진
```

---

## 3. 계층별 역할 및 표준 가이드

### 3.1 `offscreen.ts` (소켓 통신 계층)
- **역할**: 백엔드 포트(9600)와의 단일 웹소켓을 24시간 단독 소유하며, 패킷 수신 시 크롬 내부 메시징으로 전달.
- **규칙**: UI 렌더링 코드를 일절 포함하지 않으며 오직 통신 및 스토리지 최신화만 수행.

### 3.2 `background.ts` (이벤트 라우팅 계층)
- **역할**: 아이콘 클릭 시 사이드바 즉시 실행 지정 및 오프스크린 문서 자동 생성/유지 관리.
- **규칙**: 직접 웹소켓을 연결하지 않고 내부 메시지 중계 라우팅만 수행.

### 3.3 `services/` (외부 I/O 서비스 계층)
- **역할**: `chrome.*` API, GitHub REST API (`githubService.ts`), 백그라운드 HTML 인출(`backgroundScraper.ts`) 수행.
- **규칙**: React 라이브러리(`useState`, `useEffect`)와 완전히 독립된 순수 비동기 함수 형태로 작성.

### 3.4 `hooks/` (비즈니스 로직 계층)
- **역할**: 서비스 계층의 함수를 호출하고 React 상태 및 액션 콜백을 포장.
- **규칙**: JSX HTML 렌더링 코드를 포함하지 않고 UI 컴포넌트에 전달할 상태와 핸들러만 반환.

### 3.5 `sidepanel.tsx` 및 `components/` (UI 프레젠테이션 계층)
- **역할**: 유저 상호작용 및 단일 대시보드 UI/UX 렌더링.
- **규칙**: 최상위 `sidepanel.tsx` 엔트리는 `usePopupState` 훅을 호출하여 레이아웃을 마운트하는 **30라인 이하의 소형화 상태**를 유지해야 함.

---

## 4. 데이터 단방향 흐름 규칙 (Single-Direction Data Flow)

```
[ User Action ] ──► [ SidePanel Component ] (BasicTab, DebugTab 등)
                             │
                             ▼ (Trigger Callback)
                     [ Custom Hook ] (usePopupState)
                             │
                             ▼ (Call Service / Send Message)
                     [ Pure Service Module / Offscreen ]
                             │
                             ▼ (WebSocket)
                     [ WebCrawlServer (Port 9600) ]
```

---

## 5. 리팩토링 체크리스트

- [ ] 메인 UI 진입점인 `sidepanel.tsx` 파일이 30라인 이하로 소형화되었는가?
- [ ] 단일 소스 파일 중 200라인을 초과하는 거대 파일이 존재하지 않는가?
- [ ] `offscreen.ts`가 웹소켓 연결을 단독 소유하고 있는가?
- [ ] `services/` 모듈들이 React 라이브러리와 독립된 순수 함수로 작성되었는가?

---

## docs/rule/R-00420 plugin-communication.md

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

---

## docs/rule/R-00430 plugin-crawling.md

본 문서는 `WebCrawlServer` 브라우저 확장 플러그인의 DOM 크롤링 및 수집 개정 지침입니다. 기존 콘텐츠 스크립트 기반 수집 방식에 더해 **백그라운드 초고속 `fetch()` + `DOMParser` 인출 기술**과 **선언형 자동 페이징 루프 엔진**에 대한 규정을 정의합니다.

---

## 1. 수집 모드 개요 및 범위

플러그인은 수집 타깃 사이트의 특성 및 과부하 방지 목적에 맞춰 3가지 수집 모드를 지원해야 합니다.

1. **백그라운드 `fetch()` 인출 모드 (가장 추천)**: 유저 탭 이동 없이 `fetch()`와 `DOMParser`로 순수 HTML만 백그라운드에서 0.1초 만에 인출하여 수집 (CPU/RAM 사용량 0% 급).
2. **콘텐츠 스크립트 메타/전체 DOM 수집 모드**: 현재 탭의 `content.ts`가 DOM 전체(`outerHTML`) 또는 주요 이미지/하이퍼링크 메타 추출.
3. **선언형 페이징 수집 모드**: 서버가 보낸 JSON 행동 양식에 맞춰 `content.ts`가 다음 페이지 버튼을 자동 순차 클릭하며 연속 수집.

---

## 2. 백그라운드 `fetch()` + `DOMParser` 수집 규정

유저가 웹서핑하는 화면과 탭을 전혀 방해하지 않고, 오프스크린/사이드바 백그라운드에서 고속으로 데이터를 인출하는 표준 지침입니다.

```typescript
// plugins/basic-plugin/src/services/backgroundScraper.ts

export async function fetchAndParseInBackground(
  targetUrl: string,
  selector: string
): Promise<{ title: string; items: string[]; timestamp: number }> {
  // 1. 유저의 로그인 쿠키가 자동 포함되는 백그라운드 fetch
  const response = await fetch(targetUrl, {
    method: "GET",
    credentials: "include", // 저장된 세션 쿠키 자동 인출 동봉
  });

  if (!response.ok) {
    throw new Error(`HTTP 요청 에러: ${response.status}`);
  }

  const htmlText = await response.text();

  // 2. 가상 DOMParser 생성 (화면 렌더링 무발생)
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");

  // 3. CSS 셀렉터 기반 데이터 정제
  const items = Array.from(doc.querySelectorAll(selector))
    .map((el) => el.textContent?.trim() || "")
    .filter((text) => text.length > 0);

  return {
    title: doc.title || "제목 없음",
    items,
    timestamp: Date.now(),
  };
}
```

---

## 3. 선언형 페이징 순차 수집 엔진 규정 (`content.ts`)

서버에서 원격 수신한 행동 양식 패킷(`START_PAGINATION_CRAWL`)에 맞춰 1페이지부터 N페이지까지 자동 순차 클릭 및 수집을 단행합니다.

```typescript
// plugins/basic-plugin/src/content.ts

export interface PaginationCrawlPayload {
  nextPageSelector: string; // 다음 페이지 버튼 셀렉터
  contentSelector: string;  // 수집할 데이터 영역 셀렉터
  maxPages: number;         // 수집할 총 페이지 수
  delayMs: number;          // 페이지 이동 간 지연 시간
}

async function runPaginationCrawlEngine(payload: PaginationCrawlPayload): Promise<void> {
  let currentPage = 1;

  while (currentPage <= payload.maxPages) {
    // 1. 현재 페이지 수집
    const items = Array.from(document.querySelectorAll(payload.contentSelector))
      .map((el) => el.textContent?.trim() || "")
      .filter((text) => text.length > 0);

    // 2. 오프스크린 소켓으로 데이터 포워딩
    chrome.runtime.sendMessage({
      type: "RAW_DOM_DATA",
      data: {
        page: currentPage,
        url: window.location.href,
        title: document.title,
        items,
        timestamp: Date.now(),
      },
    });

    if (currentPage >= payload.maxPages) break;

    // 3. 다음 페이지 클릭
    const nextBtn = document.querySelector(payload.nextPageSelector) as HTMLElement | null;
    if (!nextBtn) break;

    nextBtn.click();
    currentPage++;

    // 4. 차단 방지를 위한 인간 모사 지연 시간 (Human-like Delay + Random Jitter)
    const jitter = Math.floor(Math.random() * 1000);
    await new Promise((resolve) => setTimeout(resolve, payload.delayMs + jitter));
  }
}
```

---

## 4. 안전성 및 차단 방지 가드

4.1 **특수 URL 침투 차단**: `chrome://`, `chrome-extension://`, `about:blank` 등 브라우저 내부 페이지에서는 스크립트 실행을 거부해야 합니다.  
4.2 **봇 차단 우회 및 랜덤 딜레이**: 페이징 수집 시 일정한 시간 간격이 아닌 무작위 지연 시간(Jitter Delay)을 추가하여 Cloudflare 등의 스팸 봇 감지를 무력화합니다.  
4.3 **동기식 응답 가드**: `content.ts` 내 `chrome.runtime.onMessage` 처리 후 동기 응답 완료 시 `return false;`를 반환하여 메시지 채널 오류를 차단합니다.  

---

## 5. 검증 체크리스트

- [ ] `fetch()` 백그라운드 수집 시 유저 활성 탭이 전환되지 않고 0.1초 만에 인출되는가?
- [ ] `DOMParser`를 통한 가상 DOM 파싱 시 메모리 누수가 발생하지 않는가?
- [ ] 페이징 자동 이동 수집 시 지연 시간(Delay)이 정상 적용되는가?
- [ ] 특수 페이지(`chrome://`)에서 수집 스크립트가 안전하게 예외 처리되는가?

---

## docs/rule/R-00440 plugin-ui-ux.md

본 문서는 `WebCrawlServer` 브라우저 확장 플러그인의 UI/UX 디자인 개정 지침입니다. 기존 팝업 UI 규격에서 **브라우저 세로 전체를 사용하는 상시 고정형 사이드바 대시보드(`sidepanel.tsx`)** 디자인 시스템으로 개정됨에 따라, 화면 레이아웃, 다중 포스팅 작성 폼, 깃허브 연동 폼 및 상태 피드백 표준을 정의합니다.

---

## 1. 디자인 기본 원칙 및 테마

1.1 **테마 규격**: 다크 투톤 스타일 적용 (기본 배경: `#0d131f`, 카드 배경: `#162032`, 주요 강조색: `#1d4ed8` / `#38bdf8`)  
1.2 **타이포그래피**: 기본 본문 `Noto Sans KR`, 폰트 및 노드 ID/로그 표현용 `JetBrains Mono` / `monospace`  
1.3 **아이콘 시스템**: Google Material Symbols Outlined 사용 (`sidepanel.html` CDN 로드)  

---

## 2. 사이드바 대시보드 레이아웃 구조 (`sidepanel.tsx`)

사이드바 UI는 상단 헤더, 탭 네비게이션 바, 메인 콘텐츠 영역, 하단 푸터로 명확히 구조화되어야 합니다.

```
+------------------------------------------+
| [icon] WebCrawlServer 대시보드          | <- Header
+------------------------------------------+
| [ 기본 ] | [ 정보 ] | [ 포스팅 ] | [ 깃허브 ] (보류) | <- TabBar
+------------------------------------------+
|                                          |
| ( 탭별 메인 뷰 컨테이너: flex: 1 )       | <- Main Content Area (overflow-y: auto)
|                                          |
+------------------------------------------+
| 노드 ID: f47ac10b-58cc...                | <- Footer
| 서버 포트: 9600 [온라인/백그라운드]     |
+------------------------------------------+
```

### 2.1 주요 탭별 구성 요소
- **`기본` 탭**:
  - 오프스크린 웹소켓 실시간 연결 상태 배지 (`● 온라인` / `○ 오프라인`)
  - 현재 활성 탭 URL 및 전체 DOM 수집/전송 버튼
  - 최근 수신된 크롤링 가공 결과 요약 카드
- **`정보` 탭**:
  - 브라우저 환경 정보 (플랫폼, 언어, User-Agent) 및 프로세서 정보 (CPU 코어 수, 디바이스 메모리)
-- **`포스팅` 탭**:
  - 다중 SNS (페이스북, 트위터, 핀터레스트, 블로그) 선택 체크박스
  - 본문 텍스트에리어 및 첨부 이미지 URL 설정
  - 원스톱 [동시 발행] 실행 버튼
- **`깃허브` 탭 (보류)**:
  - GitHub Personal Access Token (PAT) 및 저장소/계정명 입력 폼 (현재 보류 — 우선 구현 대상 아님)
  - [저장소로 자동 커밋/푸시] 테스트 실행 버튼 (보류)

---

## 3. 사이드바 반응형 레이아웃 및 텍스트 선택 규정

3.1 **수직 유연성 (Flexbox)**: 사이드바 높이가 조절될 때 헤더, 탭바, 푸터는 고정(`flex-shrink: 0`)되고, 중앙 콘텐츠 영역만 수직 확장(`flex: 1`, `overflow-y: auto`)되어 스크롤바를 제공합니다.  
3.2 **텍스트 드래그 선택 복사 지원 (`user-select: text`)**: 노드 ID, URL, 수집된 로그 텍스트, 깃허브 SHA 값 등은 마우스 드래그 선택 및 복사(`user-select: text`)가 보장되어야 합니다.  

---

## 4. 시각적 상태 피드백 및 모달 표출

4.1 **소켓 가동 배지**:
   - `● 온라인 (사이드바 활성 🖥️)`: 파란색 애니메이션 펄스 배지
   - `● 온라인 (백그라운드 가동 🌙)`: 초록색 애니메이션 펄스 배지
4.2 **버튼 처리 상태**:
   - 전송 중일 때 버튼 비활성화(`disabled`) 및 동기화 아이콘 회전 애니메이션(`animate-spin`) 적용.
4.3 **원격 긴급 모달**:
   - 서버에서 `SHOW_ALERT_MODAL` 패킷 수신 시 사이드바 중앙에 경고 모달 창 즉시 팝업.

---

## 5. 검증 체크리스트

- [ ] 사이드바 UI가 브라우저 우측에 세로 전체로 깔끔하게 렌더링되는가?
- [ ] 탭 스위칭(`기본`, `정보`, `포스팅`, `깃허브`) 시 화면 전환이 부드럽게 이루어지는가?
- [ ] 주요 노드 ID, 로그, URL 문자가 마우스 드래그로 복사되는가?
- [ ] 서버 패킷 수신 시 상태 배지 및 모달 창이 실시간으로 반응하는가?

---

## docs/rule/R-00450 plugin-build-env.md

본 문서는 `WebCrawlServer` 브라우저 확장 플러그인의 Vite 빌드 및 다중 엔트리 번들링 개정 지침입니다. **사이드바(`sidepanel.html`)** 및 **오프스크린(`offscreen.html`)** 엔트리가 추가됨에 따라, Vite 빌드 시 다중 번들링 설정 및 `define` 매크로 상수를 자바스크립트 산출물(`dist/`)로 직접 주입하는 절차를 정의합니다.

---

## 1. 개요 및 목적

1.1 **빌드 타임 리터럴 치환**: `npm run build` 실행 시점에 Node.js 환경변수값을 자바스크립트 산출물 내의 **숫자/문자열 리터럴 상수값으로 직접 치환 주입**합니다.  
1.2 **다중 엔트리 번들링 지원**: 단일 팝업 엔트리 빌드 방식에서 탈피하여 오프스크린 엔진, 사이드바 UI, 백그라운드 워커, 콘텐츠 스크립트를 독립 산출물 파일로 각각 컴파일합니다.  

---

## 2. Vite 다중 엔트리 번들링 규정 (`vite.config.ts`)

`vite.config.ts` 파일의 `rollupOptions.input` 옵션에 4대 핵심 엔트리 파일을 지정하도록 개정 작성합니다.

```typescript
// plugins/basic-plugin/vite.config.ts

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  // 빌드 시 전역 상수를 자바스크립트 리터럴로 직접 치환 주입
  define: {
    __SERVER_HOST__: JSON.stringify(process.env.SERVER_HOST || "localhost"),
    __SERVER_PORT__: Number(process.env.SERVER_PORT || 9600),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // 다중 번들링 엔트리 지정
        sidepanel: resolve(__dirname, "public/sidepanel.html"),
        offscreen: resolve(__dirname, "public/offscreen.html"),
        background: resolve(__dirname, "src/background.ts"),
        content: resolve(__dirname, "src/content.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
});
```

---

## 3. 전역 타입 선언 및 설정 모듈 규정

3.1 **전역 타입 선언 (`src/types/env.d.ts`)**:
   - `declare const __SERVER_HOST__: string;`
   - `declare const __SERVER_PORT__: number;`
   - 빌드 주입 상수의 출처, 단위 및 역할을 한글 상세 주석으로 명시합니다.
3.2 **중앙 설정 모듈 (`src/config/pluginConfig.ts`)**:
   - 주입된 상수를 `PLUGIN_CONFIG` 객체로 내보내고 `getWebSocketUrl(clientId)` 헬퍼 함수를 제공합니다.

---

## 4. 빌드 및 개발 스크립트 실행 절차

### 4.1 개발 모드 (Vite Watch)
소스 코드 수정 시 `dist/` 폴더로 실시간 자동 번들링됩니다.
```powershell
npm run plugin:basic:dev
```

### 4.2 프로덕션 빌드 실행
```powershell
npm run build --workspace=basic-plugin
```

### 4.3 산출물 검증
빌드 완료 후 `dist/` 폴더 내에 다음 4개 핵심 자바스크립트 파일이 생성되었는지 검증합니다:
- `dist/sidepanel.js` (사이드바 대시보드 UI 산출물)
- `dist/offscreen.js` (24시간 무중단 웹소켓 엔진 산출물)
- `dist/background.js` (백그라운드 이벤트 라우터 산출물)
- `dist/content.js` (DOM 수집 및 자동 포스팅 엔진 산출물)

---

## 5. 검증 체크리스트

- [ ] `vite.config.ts`에 `sidepanel`, `offscreen`, `background`, `content` 4개 엔트리가 정상 등록되었는가?
- [ ] `npm run build` 실행 시 `dist/` 폴더에 각 엔트리별 자바스크립트 파일이 개별 생성되는가?
- [ ] `__SERVER_PORT__` 등 전역 매크로 상수가 지정된 숫자/문자열 리터럴로 치환되어 출력되는가?

---

## docs/rule/R-00460 plugin-manifest-permissions.md

본 문서는 `WebCrawlServer` 브라우저 확장 플러그인의 매니페스트 및 권한 관리 개정 지침입니다. **사이드바(`sidePanel`)** 및 **오프스크린(`offscreen`)** 아키텍처 도입에 따른 매니페스트 V3 필수 권한 선언 규정, 36종 풀 권한(Permissions) 구성, `default_popup` 제거 규정, 및 `manifest.json` 내 주석 작성 금지 규칙을 정의합니다.

---

## 1. 개요 및 Manifest V3 기본 원칙

1.1 **버전 규격**: 모든 확장 프로그램 매니페스트는 `"manifest_version": 3` 표준 규격을 준수해야 합니다.  
1.2 **백그라운드 가동**: 백그라운드 스크립트는 MV3 서비스 워커 표준(`"background": { "service_worker": "background.js", "type": "module" }`)으로 등록되어야 합니다.  
1.3 **내부 운영용 풀 권한 세팅**: 스토어 미배포(개발자 모드 direct 로드) 내부 운영 방식이므로, 크롬 웹스토어의 권한 심사 제약 없이 확장 프로그램이 제공하는 36종 전 권한(Permissions)을 활성화하여 수집, 포스팅, 모니터링을 지원합니다. (참고) 깃허브 연동 기능은 현재 보류 항목이며, 별도 보안/운용 검토 후 권한 요구 여부를 확정합니다.

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

---

## docs/rule/R-00470 plugin-sidepanel-offscreen.md

본 문서는 `WebCrawlServer` 프로젝트의 브라우저 확장 플러그인에 **사이드바 통합 UI(Side Panel)**와 **24시간 무중단 웹소켓 엔진(Offscreen Document)**을 구축하고, 크롬 포트 연결 기반으로 사이드바 생명주기를 정밀 추적하기 위한 기술 지침서입니다.

---

## 1. 개요 및 구현 목적

1.1 **개요**: Chrome MV3 서비스 워커의 30초 비활성화(Sleep) 제약을 극복하고, 유저 UI 조작 환경을 다변화하기 위해 오프스크린 문서와 사이드 패널을 기존 `plugins/basic-plugin/` 모듈에 통합 구축합니다.  
1.2 **구현 목적**:
   - **무중단 수집 엔진 (Offscreen)**: 브라우저 가동 중 24시간 끊기지 않는 영속적 단일 웹소켓 소유.
   - **상시 유저 대시보드 (Side Panel)**: 탭을 이동해도 닫히지 않는 우측 상시 노출형 제어 대시보드 제공 (기존 팝업 UI 대체).
   - **크롬 포트 연결 기반 생명주기 추적**: 사이드바 창 닫힘 시 패킷 유실을 방지하도록 `chrome.runtime.connect` 포트를 통한 정밀 감시 구현.

---

## 2. 시스템 아키텍처 및 역할 분담 (Architecture)

```
[ WebCrawlServer (포트 9600) ]
            ▲
            │ (1) 24시간 영속적 단일 웹소켓 통신 (WebSocket Owner)
            ▼
┌──────────────────────────────────────────────────────────┐
│  offscreen.ts (Offscreen Document)                       │
│  - 화면에 안 보이는 백그라운드 헤드리스 DOM               │
│  - WebSocket 소켓 객체를 독점 소유 및 수신 패킷 릴레이   │
└────────────────────────────▲─────────────────────────────┘
                             │ (2) chrome.runtime.connect 포트 생명주기 추적
                             ▼
┌──────────────────────────────────────────────────────────┐
│  background.ts (Service Worker)                          │
│  - 브라우저 기동 시 오프스크린 문서 자동 생성/유지 관리  │
│  - offscreen, sidepanel, popup, content 간 패킷 라우팅  │
└───────▲────────────────────▲─────────────────────▲───────┘
        │                    │                     │
        ▼                    ▼                     ▼
[ sidepanel.tsx ]     [ popup.tsx ]         [ content.ts ]
(사이드바 UI 대시보드)   (삭제/대체됨)        (타깃 페이지 DOM 수집)
```

---

## 3. 디렉터리 및 파일 구조 명세 (Directory Structure)

기존 모듈화 아키텍처(`R-00410`)를 확장하여 소스 파일을 다음과 같이 배치합니다.

```
plugins/basic-plugin/
├── public/
│   ├── manifest.json            # permissions ("offscreen", "sidePanel", "management") 및 side_panel 설정
│   ├── sidepanel.html           # 사이드바 메인 HTML 엔트리
│   └── offscreen.html           # 오프스크린 백그라운드 HTML 엔트리
├── src/
│   ├── config/
│   │   └── pluginConfig.ts      # 빌드 타임 주입 상수 및 소켓 URL 생성 모듈
│   ├── types/
│   │   └── index.ts             # 확장형 패킷 봉투(WebSocketPacket<T>) 타입 정의
│   ├── services/
│   │   ├── chromeService.ts     # 크롬 API 및 오프스크린 상태 질의 모듈
│   │   ├── githubService.ts     # 깃허브 REST API 커밋/푸시 모듈 (보류: 백로그 항목)
│   │   └── backgroundScraper.ts # 백그라운드 fetch() + DOMParser 인출 모듈
│   ├── hooks/
│   │   └── usePopupState.ts     # 사이드바 UI용 공통 비즈니스 로직 훅
│   ├── components/              # Header, TabBar, Footer, Tabs 프레젠테이션 컴포넌트
│   ├── background.ts            # 오프스크린 생성 관리 및 패킷 라우팅 모듈
│   ├── content.ts               # DOM 수집 및 선언형 페이징 순차 수집 엔진
│   ├── sidepanel.tsx            # 단일 메인 사이드바 대시보드 UI 엔트리
│   └── offscreen.ts             # 24시간 무중단 단일 웹소켓 전담 엔진 엔트리
└── vite.config.ts               # Rollup input에 sidepanel, offscreen 엔트리 지정
```

---

## 4. 매니페스트 설정 규정 (`public/manifest.json`)

4.1 **권한 선언**: `"permissions"` 배열에 `"offscreen"`, `"sidePanel"`, `"management"`를 필수 등록합니다.  
4.2 **사이드 패널 및 팝업 제거**: `"side_panel"` 경로를 선언하고, 아이콘 클릭 시 사이드바가 바로 켜지도록 `"action"`의 `"default_popup"`을 제거합니다.  

```json
{
  "manifest_version": 3,
  "name": "WebCrawlServer 통합 수집기",
  "version": "1.0.0",
  "permissions": [
    "offscreen",
    "sidePanel",
    "management",
    "storage",
    "activeTab",
    "scripting",
    "tabs"
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
  }
}
```

---

## 5. 백그라운드 서비스 워커 지침 (`src/background.ts`)

`background.ts`는 직접 웹소켓을 연결하지 않고, 오프스크린 문서의 생성 및 메시지 중계 라우팅만 담당합니다.

```typescript
// plugins/basic-plugin/src/background.ts

/**
 * 크롬 백그라운드에 오프스크린 문서가 미생성 상태일 경우 동적으로 자동 생성합니다.
 */
async function ensureOffscreenDocument(): Promise<void> {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
  });

  if (existingContexts.length > 0) return;

  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: [chrome.offscreen.Reason.BLOB],
    justification: "WebCrawlServer 분산 크롤링 24시간 무중단 웹소켓 유지",
  });
}

chrome.runtime.onInstalled.addListener(() => {
  // 아이콘 클릭 시 팝업 대신 사이드바가 즉시 열리도록 크롬 설정
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  ensureOffscreenDocument();
});

chrome.runtime.onStartup.addListener(() => {
  ensureOffscreenDocument();
});
```

---

## 6. 오프스크린 24시간 소켓 전담 엔진 지침 (`src/offscreen.ts`)

`offscreen.ts`는 웹소켓의 **단독 소유자(Single Owner)**로 동작하며, 크롬 포트 연결로 사이드바 생명주기를 감시합니다.

```typescript
// plugins/basic-plugin/src/offscreen.ts

import { PLUGIN_CONFIG, getWebSocketUrl } from "./config/pluginConfig.js";
import { WebSocketPacket } from "./types/index.js";

let socket: WebSocket | null = null;

async function getOrCreateClientId(): Promise<string> {
  const result = await chrome.storage.local.get(["clientId"]);
  if (result && typeof result.clientId === "string") return result.clientId;
  const generatedId = crypto.randomUUID();
  await chrome.storage.local.set({ clientId: generatedId });
  return generatedId;
}

async function sendSidebarStatusToServer(isOpen: boolean): Promise<void> {
  const clientId = await getOrCreateClientId();
  const statusPacket: WebSocketPacket = {
    senderId: clientId,
    targetId: "SERVER",
    action: "CLIENT_STATUS_UPDATE",
    payloadType: "json",
    payload: { isSidebarOpen: isOpen },
    meta: { timestamp: Date.now() },
  };

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(statusPacket));
  }
}

async function connectOffscreenSocket(): Promise<void> {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;

  const clientId = await getOrCreateClientId();
  const wsUrl = getWebSocketUrl(clientId);
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    const helloPacket: WebSocketPacket = {
      senderId: clientId,
      targetId: "SERVER",
      action: "CRAWL_LOG",
      payloadType: "json",
      payload: { system: "오프스크린 24시간 무중단 수집 엔진 정상 가동" },
      meta: { timestamp: Date.now() },
    };
    socket?.send(JSON.stringify(helloPacket));
  };

  socket.onmessage = async (event) => {
    try {
      const packet: WebSocketPacket = JSON.parse(event.data);

      if (packet.action === "UPDATE_AUTH_TOKEN" && packet.payload) {
        const { tokenType, token } = packet.payload as { tokenType: string; token: string };
        await chrome.storage.local.set({ [tokenType]: token });
      }

      // 사이드바 미오픈 시의 메시징 예외 차단 가드
      chrome.runtime.sendMessage({ type: "SOCKET_PACKET_RECEIVED", packet }).catch(() => {
        // 사이드바 닫혀있을 때 수신자 부재 예외 흡수
      });
    } catch {
      // 가드
    }
  };

  socket.onclose = () => {
    socket = null;
    setTimeout(connectOffscreenSocket, 3000);
  };
}

// 크롬 포트 연결로 사이드바 닫힘을 100% 확실하게 추적 감시
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "sidepanel-port") {
    sendSidebarStatusToServer(true);

    port.onDisconnect.addListener(() => {
      sendSidebarStatusToServer(false);
    });
  }
});

connectOffscreenSocket();
```

---

## 7. 사이드바 메인 UI 대시보드 지침 (`src/sidepanel.tsx`)

사이드바는 마운트 시 크롬 전용 포트를 연결하여 생명주기를 오프스크린으로 알립니다.

```tsx
// plugins/basic-plugin/src/sidepanel.tsx

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './popup.css';

import { usePopupState } from './hooks/usePopupState';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { Footer } from './components/Footer';
import { BasicTab } from './components/tabs/BasicTab';
import { InfoTab } from './components/tabs/InfoTab';
import { DebugTab } from './components/tabs/DebugTab';

export default function SidePanel() {
  const state = usePopupState();

  useEffect(() => {
    // 포트 연결을 통해 사이드바 오픈 생명주기 연결
    const port = chrome.runtime.connect({ name: "sidepanel-port" });

    return () => {
      port.disconnect();
    };
  }, []);

  return (
    <div className="w-full h-screen bg-[#0d131f] text-slate-100 flex flex-col p-4 box-border overflow-hidden select-text">
      <Header />
      <div className="my-2">
        <TabBar activeTab={state.activeTab} onSelectTab={state.setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto my-2 pr-1">
        {state.activeTab === 'basic' && (
          <BasicTab
            isServerOnline={state.isServerOnline}
            currentUrl={state.currentUrl}
            isSending={state.isSending}
            statusMessage={state.statusMessage}
            onSendFullDom={state.handleSendFullDom}
          />
        )}
        {state.activeTab === 'info' && (
          <InfoTab browserInfo={state.browserInfo} processorInfo={state.processorInfo} />
        )}
        {state.activeTab === 'debug' && (
          <DebugTab
            debugMessage={state.debugMessage}
            debugStatus={state.debugStatus}
            onChangeDebugMessage={state.setDebugMessage}
            onSendDebugMessage={state.handleSendDebugMessage}
          />
        )}
      </div>

      <Footer clientId={state.clientId} />
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) ReactDOM.createRoot(rootElement).render(<SidePanel />);
```

---

## 8. 검증 체크리스트

- [ ] `offscreen.ts`가 백그라운드에서 24시간 소켓을 단독 소유하는가?
- [ ] 사이드바 창을 닫았을 때 `chrome.runtime.connect` 포트 `onDisconnect`를 통해 `isSidebarOpen: false` 상태가 유실 없이 전송되는가?
- [ ] 사이드바가 닫혀있을 때 `sendMessage().catch()` 가드가 작동하여 콘솔 예외가 방지되는가?

---

## docs/rule/R-00480 plugin-automation-crawling.md

본 문서는 `WebCrawlServer` 프로젝트의 브라우저 확장 플러그인에서 **백그라운드 초고속 경량 수집(`fetch()` + `DOMParser`)**, **선언형 자동 페이징 루프**, 및 **다중 SNS 원스톱 자동 포스팅**을 구현하기 위한 표준 기술 지침서입니다.

---

## 1. 개요 및 수집 원칙

1.1 **개요**: 유저가 보고 있는 탭을 강제로 이동시켜 발생하는 브라우저 과부하 및 유저 방해를 없애고, 백그라운드에서 사람 형태의 탐색 알고리즘으로 데이터를 고속 수집 및 멀티 포스팅합니다.  
1.2 **3대 핵심 원칙**:
   - **경량성 (Lightweight)**: 무거운 이미지/CSS/폰트를 로드하지 않고 순수 HTML만 백그라운드 인출하여 CPU/RAM 사용량 0% 급 유지.
   - **세션 보안 우회 (Anti-Bot Bypass)**: 파이썬 헤드리스와 달리 실제 사용자 브라우저의 리얼 TLS 핑거프린트와 로그인 인증 쿠키(`credentials: "include"`) 및 주거지 IP(Residential IP)를 활용하여 Cloudflare 봇 차단벽을 100% 우회.
   - **인간 모사 지연 (Human-like Delays)**: 자동 페이징 및 포스팅 시 사람과 유사한 3초~5초 랜덤 딜레이를 주어 계정 일시 정지 및 캡차 발생 원천 차단.

---

## 2. 백그라운드 `fetch()` + `DOMParser` 초고속 경량 수집 규정

유저가 웹서핑하는 화면과 탭을 전혀 방해하지 않고, 오프스크린/사이드바 백그라운드에서 순수 HTML 텍스트만 0.1초 만에 인출하여 가상 DOM으로 파싱하는 표준 가이드라인입니다.

```typescript
// plugins/basic-plugin/src/services/backgroundScraper.ts

export interface ScrapedPageResult {
  url: string;
  title: string;
  items: string[];
  timestamp: number;
}

/**
 * 유저 탭 이동 없이 백그라운드에서 순수 HTML만 인출하여 DOMParser로 파싱합니다.
 * @param targetUrl - 수집 타깃 URL
 * @param selector - 수집할 요소를 지정하는 CSS 셀렉터
 */
export async function scrapePageInBackground(
  targetUrl: string,
  selector: string
): Promise<ScrapedPageResult> {
  // 1. 유저의 로그인 쿠키가 자동 포함되는 비동기 fetch 호출
  const response = await fetch(targetUrl, {
    method: "GET",
    credentials: "include", // 저장된 세션 쿠키 자동 전송
    headers: {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP 에러 발생: status ${response.status}`);
  }

  const htmlText = await response.text();

  // 2. 가상 DOMParser 생성 (화면 렌더링 무발생)
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");

  // 3. CSS 셀렉터 기반 데이터 정제
  const items = Array.from(doc.querySelectorAll(selector)).map(
    (el) => el.textContent?.trim() || ""
  ).filter((text) => text.length > 0);

  return {
    url: targetUrl,
    title: doc.title || "제목 없음",
    items,
    timestamp: Date.now(),
  };
}
```

---

## 3. 선언형 페이징 순차 이동 수집 엔진 규정 (`content.ts`)

서버에서 전달받은 JSON 행동 양식에 따라 1페이지부터 N페이지까지 `nextPageSelector` 버튼을 자동 클릭하고 지연 시간을 가지며 수집을 진행하는 규칙입니다.

```typescript
// plugins/basic-plugin/src/content.ts

export interface PaginationRule {
  nextPageSelector: string; // 다음 페이지 버튼 셀렉터 (예: ".pagination .next_page")
  contentSelector: string;  // 수집할 데이터 셀렉터 (예: ".board-list .item")
  maxPages: number;         // 수집할 최대 페이지 수
  delayMs: number;          // 페이지 이동 간 지연 시간 (기본값: 3000ms)
}

/**
 * 타깃 웹페이지에 주입되어 페이징 자동 클릭 및 연속 수집을 단행합니다.
 */
export async function runPaginationCrawlEngine(rule: PaginationRule): Promise<void> {
  let currentPage = 1;

  while (currentPage <= rule.maxPages) {
    // 1. 현재 페이지의 DOM 데이터 수집
    const pageItems = Array.from(document.querySelectorAll(rule.contentSelector))
      .map((el) => el.textContent?.trim() || "")
      .filter((text) => text.length > 0);

    // 2. 수집 데이터를 오프스크린 소켓으로 포워딩
    chrome.runtime.sendMessage({
      type: "RAW_DOM_DATA",
      data: {
        page: currentPage,
        url: window.location.href,
        title: document.title,
        items: pageItems,
        timestamp: Date.now(),
      },
    });

    if (currentPage >= rule.maxPages) break;

    // 3. 다음 페이지 버튼 검색 및 클릭
    const nextButton = document.querySelector(rule.nextPageSelector) as HTMLElement | null;
    if (!nextButton) {
      console.log("[수집 엔진] 다음 페이지 버튼을 찾을 수 없어 수집을 마칩니다.");
      break;
    }

    nextButton.click();
    currentPage++;

    // 4. 인간 모사 지연 시간 적용 (Human-like Random Jitter Delay)
    const jitter = Math.floor(Math.random() * 1000); // 0~1초 랜덤 추가 지연
    await new Promise((resolve) => setTimeout(resolve, rule.delayMs + jitter));
  }
}

// 서버 원격 지시 메시지 수신기
chrome.runtime.onMessage.addListener((message) => {
  if (message.command === "START_PAGINATION_CRAWL") {
    runPaginationCrawlEngine(message.payload);
  }
});
```

---

## 4. 다중 SNS 원스톱 자동 포스팅 규정 (Multi-Posting)

사이드바 단일 UI에서 작성된 글을 페이스북, 트위터(X), 핀터레스트, 네이버/티스토리 블로그로 동시 포스팅하기 위한 표준 가이드라인입니다.

4.1 **포스팅 방식 선택**:
   - **DOM 입력 자동화 방식 (권장)**: 백그라운드 비활성 탭(`active: false`)으로 포스팅 페이지를 연 뒤 `content.ts`가 글 상자에 입력 및 발행 버튼 클릭.
   - **직접 내부 API 송신 방식**: 사용자의 Session Cookie를 인출하여 각 플랫폼의 내부 작성 REST/GraphQL API로 직접 `POST` 송출.
4.2 **차단 방지 필수 규칙**:
   - 포스팅 연쇄 실행 시 무작위 5초~10초 지연 시간을 두어 스팸 봇 감지를 무력화해야 합니다.

---

## 5. 검증 체크리스트

- [ ] `fetch()` 인출 시 `credentials: "include"` 옵션이 지정되어 유저 로그인 쿠키가 정상 동봉되는가?
- [ ] 이미지/CSS가 미로드된 상태에서 `DOMParser`를 통해 가상 DOM 데이터가 정확히 인출되는가?
- [ ] 페이징 수집 엔진에서 페이지 클릭 후 `delayMs` 기반 랜덤 지연 시간이 정상 작동하는가?
- [ ] 유저의 활성 탭 화면이 전환되거나 버벅이는 현상이 완전히 차단되었는가?

---

## docs/rule/R-00490 plugin-github-integration.md

> **보류(Deferred)**: `깃허브(GitHub)` 연동 관련 기능은 현재 우선순위에서 제외되어 있습니다.
>
> 이유: 현재 단계에서는 `admin` UI, 서버-플러그인 실시간 통신, 네트워크 모니터링 등 기능의 안정화가 최우선입니다. 깃허브 통합은 별도의 백로그 항목으로 관리되며, 당분간 개발/배포 지침의 상단 우선순위에서 제거되어야 합니다.

본 문서는 `WebCrawlServer` 프로젝트의 브라우저 확장 플러그인에서 **깃허브(GitHub) REST API 연동**, 수집 데이터의 **자동 커밋(Commit) 및 푸시(Push)**, 그리고 **서버-클라이언트 실시간 토큰 동기화(Push Sync)**를 구현하기 위한 표준 기술 지침서입니다.

---

## 1. 개요 및 구현 목적

1.1 **개요**: 사이드바에서 수집/가공된 웹 데이터(HTML, JSON, 마크다운 문서)를 내 깃허브 저장소로 직접 커밋/푸시하고, 깃허브의 다양한 기능(이슈 생성, GitHub Actions 원격 가동)을 사이드바에서 통합 통제합니다.  
1.2 **구현 목적**:
   - **자동 커밋/푸시**: Git CLI 설치 없이 깃허브 REST API로 수집 데이터를 지정 저장소로 푸시.
   - **실시간 토큰 이중 동기화 (Dual-Sync)**: 사이드바 로컬 스토리지(`chrome.storage.local`)의 PAT로 고속 직접 커밋하되, 변경 시 서버 푸시(`UPDATE_AUTH_TOKEN`)로 모든 프로필의 토큰을 일괄 자동 최신화.
   - **파이프라인 원격 트리거**: 사이드바에서 깃허브 파이프라인(`workflow_dispatch`)을 즉시 가동.

---

## 2. 깃허브 REST API 커밋/푸시 모듈 규정 (`src/services/githubService.ts`)

`PUT /repos/{owner}/{repo}/contents/{path}` API를 사용하여 자바스크립트로 파일 자동 커밋 및 푸시를 단행합니다.

```typescript
// plugins/basic-plugin/src/services/githubService.ts

export interface CommitFileOptions {
  token: string;          // GitHub Personal Access Token (PAT)
  owner: string;          // GitHub 계정/조직명
  repo: string;           // 타깃 저장소 이름
  filePath: string;       // 저장소 내 파일 상대 경로 (예: "crawled/2026-08-05-data.json")
  content: string;        // 저장할 텍스트 또는 JSON 원문
  commitMessage: string;  // 커밋 메시지
}

export interface CommitFileResult {
  success: boolean;
  commitSha?: string;
  contentUrl?: string;
  errorMessage?: string;
}

/**
 * 수집된 데이터를 GitHub REST API를 통해 지정 저장소로 자동 커밋/푸시합니다.
 */
export async function commitFileToGithub({
  token,
  owner,
  repo,
  filePath,
  content,
  commitMessage,
}: CommitFileOptions): Promise<CommitFileResult> {
  try {
    // 1. 유니코드 텍스트의 Base64 인코딩 (GitHub API 필수 규격)
    const base64Content = btoa(unescape(encodeURIComponent(content)));
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    // 2. 기존 파일 존재 여부 확인 (기존 파일 수정 시 sha 필요)
    let existingSha: string | undefined = undefined;
    try {
      const getRes = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      if (getRes.ok) {
        const getJson = await getRes.json();
        existingSha = getJson.sha;
      }
    } catch {
      // 신규 파일일 경우 sha 생략
    }

    // 3. 파일 생성 또는 업데이트 단행
    const bodyPayload: Record<string, unknown> = {
      message: commitMessage,
      content: base64Content,
    };
    if (existingSha) {
      bodyPayload.sha = existingSha;
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify(bodyPayload),
    });

    const json = await response.json();

    if (response.ok) {
      return {
        success: true,
        commitSha: json.commit.sha,
        contentUrl: json.content.html_url,
      };
    } else {
      return {
        success: false,
        errorMessage: json.message || "알 수 없는 GitHub API 오류",
      };
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "네트워크 오류";
    return { success: false, errorMessage: msg };
  }
}
```

---

## 3. 실시간 토큰 푸시 동기화 규정 (Token Push Sync)

3.1 **로컬 우선 사용**: 사이드바 및 오프스크린은 `chrome.storage.local`에 저장된 `githubToken`을 우선 인출하여 고속 커밋을 단행합니다.  
3.2 **서버 푸시 최신화 수용**: 서버(`WebCrawlServer`)에서 웹소켓 패킷(`action: "UPDATE_AUTH_TOKEN"`)이 들어오면 `offscreen.ts`가 이를 수신하여 로컬 스토리지의 토큰을 최신화합니다.  

```typescript
// plugins/basic-plugin/src/offscreen.ts 내 토큰 푸시 수신기

if (packet.action === "UPDATE_AUTH_TOKEN") {
  const { tokenType, token } = packet.payload as { tokenType: string; token: string };
  
  // 로컬 스토리지 자동 최신화
  await chrome.storage.local.set({ [tokenType]: token });
  
  // 사이드바 UI로 토큰 갱신 알림 중계
  chrome.runtime.sendMessage({
    type: "TOKEN_REFRESHED",
    tokenType,
  });
}
```

---

## 4. GitHub Actions 원격 트리거 규정 (`workflow_dispatch`)

사이드바 버튼 클릭 한 번으로 깃허브의 CI/CD 파이프라인이나 백엔드 파이썬 크롤러를 원격 가동시킬 수 있습니다.

```typescript
/**
 * GitHub Actions 워크플로를 원격 실행시킵니다.
 */
export async function triggerGithubWorkflow(
  token: string,
  owner: string,
  repo: string,
  workflowId: string,
  ref: string = "main"
): Promise<boolean> {
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.v3+json",
    },
    body: JSON.stringify({ ref }),
  });

  return response.ok;
}
```

---

## 5. 검증 체크리스트

- [ ] GitHub PAT 토큰을 이용해 텍스트/JSON 데이터가 지정 저장소 경로로 정상 커밋/푸시되는가?
- [ ] 텍스트 유니코드 데이터가 Base64로 안전하게 인코딩되어 깨짐 없이 푸시되는가?
- [ ] 서버에서 `UPDATE_AUTH_TOKEN` 패킷을 전송했을 때 모든 프로필 플러그인의 로컬 토큰이 자동으로 최신화되는가?
- [ ] 깃허브 API 호출 실패 시 명확한 오류 문구가 사이드바 UI에 피드백되는가?

---

## docs/decision/admin UIUX.md


**admin UI/UX 지침서**
---

# [디자인 & UI/UX AI 가이드 지침서]

## 1. 디자인 시스템 및 레이아웃 구조

* **레이아웃 기본 골격:**
* 화면 전체는 **3단 구조**로 설계합니다. 좌측에는 축소 및 확장이 가능한 네비게이션 사이드바, 상단에는 글로벌 툴바(검색, 알림, 유저 프로필), 중앙에는 핵심 컨텐츠 및 대시보드를 배치합니다.
* 데이터와 컴포넌트가 밀집되어 한눈에 많은 정보를 파악할 수 있는 **고밀도(High-density) UI**를 적용하여 개발자 도구 및 관리자 페이지에 최적화된 레이아웃을 구성합니다.


* **컬러 및 시각적 피드백:**
* 배경색은 깔끔하고 시인성이 높은 화이트 및 연한 회색 계열(`Background: #F8F9FA` 또는 `#FFFFFF`)을 기본으로 사용합니다.
* 주요 인터랙션(버튼, 링크, 활성화 상태)에는 구글 고유의 블루 포인트 컬러(`Primary: #1A73E8`)를 적용합니다.
* 상태 표시는 직관적인 시각 피드백을 위해 성공(Green), 경고(Yellow/Orange), 에러(Red) 색상을 명확히 구분하여 사용합니다.


* **카드 및 컴포넌트 스타일:**
* 각 구역과 컨테이너는 날카로운 모서리 대신 미세한 라운드 처리(`Border-radius: 4px` ~ `8px`)를 적용합니다.
* 입체적인 그림자 대신 연한 테두리 또는 은은한 깊이감(Elevation)을 주어 정돈된 느낌을 유지합니다.



## 2. 아이콘 시스템

* **아이콘 종류 및 스타일:**
* UI 전반의 메뉴와 액션 버튼에는 **Material Symbols** 또는 **Material Icons**의 **Outlined(선 스타일)** 및 **Rounded** 스타일을 전면 사용합니다.
* 24px 기준의 그리드 정렬에 맞추어 선의 두께가 균일한 아이콘을 배치하여 시각적 통일성을 부여합니다.


* **특수 아이콘:**
* 서비스 식별이나 특정 리소스를 나타내는 아이콘은 구글 클라우드 스타일의 **플랫 및 멀티컬러 아이콘 규격**을 참고하여 직관성을 높입니다.



## 3. 타이포그래피 및 한글 폰트 가이드

* **인터페이스 본문 및 타이틀 폰트:**
* 구글 제품군과 가장 잘 어울리며 가독성이 뛰어난 **Noto Sans KR (본고딕)** 또는 트렌디한 웹 환경에 적합한 Pretendard(프리텐다드)를 기본 폰트로 채택합니다.
* 다양한 폰트 굵기(Weight)를 활용하여 타이틀과 본문의 정보 위계(Hierarchy)를 명확히 표현합니다.


* **코드 및 식별자(Monospace) 폰트:**
* 소스 코드 스니펫, 로그 영역, 리소스 ID 등이 표시되는 영역에는 개발자 가독성이 극대화된 **JetBrains Mono** 또는 **Fira Code**를 고정폭 폰트로 조합합니다.


* **CSS 적용 기준 예시:**
```css
body {
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  letter-spacing: -0.01em;
}
code, pre, .identifier {
  font-family: 'JetBrains Mono', monospace;
}

```

---

## docs/decision/ADR-001-plugin-sidepanel-offscreen-architecture.md

# ADR-001: 사이드바 단일 UI 통합 및 오프스크린 24시간 단일 소켓 아키텍처 채택

> **상태**: 승인됨 (Accepted)  
> **날짜**: 2026-08-05  
> **결정자**: 시스템 아키텍트 & 개발 팀  
> **관련 문서**: AGENTS.md, R-00400, R-00410, R-00420, R-00470  

---

## 1. 배경 및 문제 정의 (Context & Problem Statement)

기존 `WebCrawlServer` 브라우저 확장 플러그인(`plugins/basic-plugin/`)은 360px × 480px 규격의 팝업 창(`popup.tsx`)과 백그라운드 서비스 워커(`background.ts`) 중심으로 구성되어 있었습니다. 그러나 실무 가동 환경에서 다음과 같은 치명적인 한계점이 발견되었습니다.

1. **팝업 UI의 공간적·생명주기적 한계**:
   - 유저가 웹서핑 중 브라우저 타깃 화면을 클릭하면 팝업 창이 즉시 비활성화되어 닫히는(Destroy) 문제 발생.
   - 수집 로그, 노드 상태, 자동 포스팅 폼 등을 표출하기에 360px 공간이 협소함.
2. **Chrome MV3 서비스 워커의 30초 Sleep 타이머 문제**:
   - Chrome MV3 서비스 워커는 30초 동안 활동이 없으면 브라우저에 의해 강제 종료(Kill)됨.
   - 서비스 워커가 종료되면 가동 중이던 WebSocket 객체도 함께 파괴되어 백엔드 서버(`WebCrawlServer`)와의 실시간 통신이 절단됨.
3. **사이드바 창 닫힘 비동기 유실 문제**:
   - 사이드바 창을 닫을 때 `useEffect` cleanup의 메시지가 창 소멸 속도보다 늦어 오프라인 상태 패킷이 유실되는 문제.

---

## 2. 고려된 대안들 (Considered Options)

### 대안 1: 팝업 UI + 백그라운드 알람(`chrome.alarms`) 방식 (기존 방식)
- **장점**: 구현이 간단함.
- **단점**: 팝업이 닫히면 유저 피드백이 불가하며, 알람만으로는 웹소켓의 24시간 무중단 연결을 완벽히 보장할 수 없음.

### 대안 2: 사이드 패널 단독 소켓 소유 방식
- **장점**: 넓은 화면 UI 제공.
- **단점**: 유저가 사이드바(`X` 버튼)를 닫아버리면 사이드바 내부의 웹소켓 연결도 함께 파괴되어 유저가 화면을 닫았을 때 백그라운드 수집이 정지됨.

### 대안 3: 오프스크린 24시간 단일 소켓 + 사이드 패널 단일 UI 통합 방식 (선택안)
- **장점**:
  - **오프스크린(`offscreen.ts`)**: 화면에 안 보이는 백그라운드 DOM으로서 24시간 영속적인 단일 웹소켓 소유 유지 (유저가 사이드바를 닫아도 소켓 유지).
  - **사이드 패널(`sidepanel.tsx`)**: 브라우저 옆에 상시 고정되는 넉넉한 단일 대시보드 UI 제공.
  - **크롬 전용 포트 연결 (`chrome.runtime.connect`)**: 사이드바와 오프스크린 간 포트를 연결하여, 사이드바 창이 닫히는 순간 `onDisconnect` 이벤트로 닫힘 상태를 100% 보장 감지.
- **단점**: 오프스크린-백그라운드-사이드바 간 내부 크롬 메시징 파이프라인 추가 작성 필요.

---

## 3. 아키텍처 결정 사항 (Decision)

**대안 3 (오프스크린 24시간 단일 소켓 + 크롬 포트 감지 + 사이드 패널 단일 UI)을 최종 아키텍처로 채택합니다.**

### 상세 결정 규정:
1. **기존 팝업 UI(`popup.tsx`) 완전 제거/대체**:
   - `manifest.json`에서 `"default_popup"` 선언을 제거합니다.
   - `background.ts`에 `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })`를 선언하여 툴바 아이콘 클릭 시 사이드바가 즉시 열리도록 단일화합니다.
2. **단일 웹소켓 소유권 이관 (`offscreen.ts`)**:
   - 하나의 브라우저 프로필당 단 1개의 웹소켓 소켓만 생성하며, 그 소유권을 24시간 상주하는 `offscreen.ts`에 부여합니다.
   - 사이드바(`sidepanel.tsx`)는 소켓을 별도로 만들지 않고 크롬 내부 메시징으로 오프스크린 소켓을 공유합니다.
3. **크롬 포트 연결 기반 사이드바 생명주기 감지**:
   - 사이드바가 열릴 때 `chrome.runtime.connect({ name: "sidepanel-port" })`를 수립하고, 포트 연결 해제(`onDisconnect`)를 통해 사이드바가 닫혔음을 유실 없이 감지하여 서버로 `CLIENT_STATUS_UPDATE` 패킷을 전송합니다.

---

## 4. 파급 효과 및 이점 (Consequences)

### 긍정적 이점:
- **24시간 무중단 통신 달성**: 유저가 사이드바를 열고 닫는 여부와 상관없이 백엔드 포트(9600)와의 소켓 통신이 100% 지속됨.
- **사이드바 열림/닫힘 상태 100% 정밀 추적**: 크롬 포트 감지 기법으로 유저가 사이드바 화면을 보고 있는지, 백그라운드 모드로 돌리고 있는지 완벽 구분.
- **서버 세션 충돌 차단**: 프로필당 단 1개의 소켓만 연결되므로 `WebCrawlServer` 백엔드의 `clientId` 중복 충돌 예외 원천 차단.

### 후속 조치 사항:
- `manifest.json` 권한(`"offscreen"`, `"sidePanel"`, `"side_panel"`) 선언 및 `vite.config.ts` 다중 입력 엔트리 갱신.
- `R-00470` 규칙 문서를 통해 세부 구현 가이드라인 제정.

---

## docs/decision/ADR-002-extensible-packet-envelope-protocol.md

# ADR-002: 확장형 웹소켓 통신 패킷 봉투(Packet Envelope) 프로토콜 규격 채택

> **상태**: 승인됨 (Accepted)  
> **날짜**: 2026-08-05  
> **결정자**: 시스템 아키텍트 & 개발 팀  
> **관련 문서**: AGENTS.md, R-00206, R-00420, R-00470  

---

## 1. 배경 및 문제 정의 (Context & Problem Statement)

기존 `WebCrawlServer`와 플러그인 간 웹소켓 메시지는 비정형화된 JSON 객체를 주고받아 다음과 같은 확장성 및 타입 안전성 문제를 안고 있었습니다.

1. **메시지 타입 미비 및 예외 위험**:
   - `senderId`, `targetId`, `action` 외에 수신 패킷이 단순 텍스트인지, JSON인지, 바이너리 이미지인지 명확히 구별하는 표준 필드가 부재함.
2. **바이너리/파일 송수신 한계**:
   - 크롤링 중 캡처한 이미지, PDF, 파비콘 등의 파일 자원을 전송할 때 파일명, MIME 타입, 파일 크기 등의 메타데이터를 담을 표준 규격이 없음.
3. **추적성 및 동적 매개변수 확장성 부족**:
   - 단일 패킷 단위의 고유 추적 ID(`traceId`)가 없어 요청-응답 매칭이 어려우며, 신규 기능 추가 시 패킷 최상위 필드가 계속 오염되는 현상 발생.

---

## 2. 고려된 대안들 (Considered Options)

### 대안 1: 비정형 JSON 사용 및 기능별 속성 추가 (기존 방식)
- **장점**: 개발 초기 신속한 작성 가능.
- **단점**: 패킷 구조가 누더기처럼 오염되며 타입 안전성이 파괴되고 바이너리 수송 불가.

### 대안 2: 표준 패킷 봉투(Packet Envelope) 프로토콜 채택 (선택안)
- **장점**:
  - `senderId`, `targetId`, `action`, `payloadType`, `payload`, `meta` 6대 통일 필드 구조 정립.
  - `payloadType`을 통해 `json`, `binary_base64`, `raw_text`, `chunk_stream`을 명확히 구분.
  - `meta.extraParams`를 통한 동적 Key-Value 파라미터 무한 확장 지원.
- **단점**: 패킷 인코딩/디코딩 시 래핑 오버헤드가 약간 존재함.

---

## 3. 아키텍처 결정 사항 (Decision)

**대안 2 (표준 패킷 봉투 프로토콜 규격)를 전체 시스템 통신 표준으로 채택합니다.**

### 패킷 봉투 표준 명세 (`WebSocketPacket<T>`):
```typescript
export type PayloadType = "json" | "binary_base64" | "raw_text" | "chunk_stream";

export interface FileMetadata {
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  chunkIndex?: number;
  totalChunks?: number;
}

export interface PacketMetadata {
  timestamp: number;
  traceId?: string;
  fileMeta?: FileMetadata;
  extraParams?: Record<string, unknown>;
}

export interface WebSocketPacket<T = unknown> {
  senderId: string;                     // 송신 노드 ID (clientId)
  targetId?: string | "ALL" | "SERVER"; // 수신 대상
  action: string;                       // 수행지시 액션 식별자
  payloadType: PayloadType;             // "json" | "binary_base64" | "raw_text" | "chunk_stream"
  payload: T;                           // 데이터 바디
  meta: PacketMetadata;                 // 타임스탬프, 추적 ID, 파일 메타, 동적 파라미터
}
```

---

## 4. 파급 효과 및 이점 (Consequences)

### 긍정적 이점:
- **타입 엄격성 및 신뢰성 확보**: TypeScript 제네릭(`WebSocketPacket<T>`)을 활용하여 백엔드, 오프스크린, 사이드바 간 송수신 데이터의 컴파일 타임 타입 검증 완비.
- **바이너리 파일 수송 완전 지원**: 이미지, 캡처 파일, ZIP 데이터 등을 Base64 또는 스트림 덩어리로 안전하게 전송.
- **유연한 미래 확장성**: `meta.extraParams` 객체를 통해 기존 통신 규격을 깨뜨리지 않고 어떠한 매개변수도 동적으로 추가 가능.

### 적용 위치:
- `plugins/basic-plugin/src/types/index.ts`
- `plugins/basic-plugin/src/offscreen.ts`
- `server/src/index.ts`

---

## docs/decision/ADR-003-background-fetch-scraping-and-github-sync.md

# ADR-003: 백그라운드 fetch() 초고속 수집 및 깃허브 실시간 토큰 동기화 패턴 채택

> **주의(깃허브 통합 보류)**: 본 ADR에서 언급된 `깃허브(GitHub)` 관련 자동 커밋/푸시 및 일부 연동 시나리오는 현재 우선순위에서 제외됩니다. 토큰 동기화(인증 정보 갱신) 자체는 시스템의 인증 관리 관점에서 논의하되, 깃허브 API를 통한 자동 커밋/퍼시스트(Commit/Push) 기능 구현은 백로그로 이동합니다.

> **상태**: 승인됨 (Accepted)  
> **날짜**: 2026-08-05  
> **결정자**: 시스템 아키텍트 & 개발 팀  
> **관련 문서**: AGENTS.md, R-00430, R-00480, R-00490  

---

## 1. 배경 및 문제 정의 (Context & Problem Statement)

기존 웹 수집 및 외부 서비스(깃허브, SNS) 연동 시 다음과 같은 과부하 및 보안/운용성 문제가 존재했습니다.

1. **활성 탭 직접 이동 방식의 과부하**:
   - 수집 시마다 사용자가 보고 있는 브라우저 탭을 해당 URL로 계속 이동시킬 경우 무거운 이미지, CSS, 폰트, 자바스크립트가 매번 로드되어 브라우저 렌더링 과부하 및 유저 작업 방해 발생.
2. **파이썬 헤드리스(Selenium)의 봇 차단 예외**:
   - 파이썬 헤드리스는 `navigator.webdriver = true` 및 데이터센터 IP 사용으로 인해 Cloudflare, Akamai 등의 봇 방어벽에 즉시 403 차단당함.
3. **토큰 관리 및 동기화의 번거로움**:
   - 깃허브 PAT이나 SNS 연동 토큰이 변경되었을 때, 다중 프로필 환경에서 각 프로필의 사이드바 설정을 일일이 수정해야 하는 불편함 존재.

---

## 2. 고려된 대안들 (Considered Options)

### 대안 1: 파이썬 셀레니움 헤드리스 중앙 수집 방식
- **장점**: 브라우저와 독립적으로 가동 가능.
- **단점**: Cloudflare 봇 차단율 90% 이상, 로그인 세션 유지 불가.

### 대안 2: 확장 프로그램 활성 탭 지속 이동 수집 방식
- **장점**: 눈으로 수집 과정을 볼 수 있음.
- **단점**: 화면 번쩍임, 메모리/CPU 점유율 폭증, 유저 웹서핑 방해.

### 대안 3: 백그라운드 `fetch()` + `DOMParser` 인출 및 토큰 실시간 동기화 패턴 (선택안)
- **장점**:
  - **`fetch()` + `DOMParser`**: 화면 렌더링 없이 순수 HTML만 0.1초 만에 인출하여 파싱 (CPU/RAM 사용량 0% 급).
  - **로그인 쿠키 자동 활용**: `credentials: "include"`를 통해 유저가 이미 로그인해둔 진짜 인증 세션 쿠키 활용 -> 봇 차단 100% 우회.
  - **토큰 실시간 동기화(Push Sync)**: 토큰은 사이드바 로컬 스토리지(`chrome.storage.local`)에서 고속 사용하고, 변경 시 백엔드 서버에서 웹소켓(`UPDATE_AUTH_TOKEN`)으로 푸시하여 일괄 최신화.
- **단점**: 동적 자바스크립트(SPA) 렌더링 필수 사이트의 경우 비활성 백그라운드 탭(`active: false`) 보완 필요.

---

## 3. 아키텍처 결정 사항 (Decision)

**대안 3 (백그라운드 `fetch()` 경량 인출 및 토큰 실시간 동기화 패턴)을 핵심 수집 및 토큰 관리 아키텍처로 채택합니다.**

### 상세 결정 규정:
1. **백그라운드 경량 수집 엔진 구축**:
   - 오프스크린/사이드바에서 `fetch(url, { credentials: "include" })`를 호출하여 이미지/CSS가 배제된 순수 HTML을 고속 인출.
   - `new DOMParser().parseFromString(htmlText, "text/html")`을 통해 가상 DOM을 생성하여 데이터만 정제 후 서버로 전송.
2. **토큰 실시간 이중 동기화(Dual-Sync) 패턴**:
   - **사이드바 로컬 사용**: `chrome.storage.local`에 보관된 토큰을 우선 사용하여 서비스 API 호출(예: SNS 인증 토큰 활용)하도록 권장합니다. **깃허브 REST API를 통한 자동 커밋/푸시는 현재 보류**되어 있으며, 자동 커밋/푸시를 전제로 한 설계는 지양합니다.
   - **서버 푸시 동기화**: 백엔드에서 토큰 변경 발생 시 웹소켓 브로드캐스트(`UPDATE_AUTH_TOKEN`)를 송출하여 모든 프로필 노드의 로컬 스토리지 토큰을 자동으로 갱신.

---

## 4. 파급 효과 및 이점 (Consequences)

### 긍정적 이점:
- **수집 속도 10배 증가 & 리소스 절감**: 화면 전환이나 리소스 로딩이 전혀 없으므로 브라우저 버벅임이 0%에 수렴.
- **봇 방어벽 완벽 우회**: 실제 사용자 브라우저의 네트워크 엔진과 주거지 IP(Residential IP), 진짜 로그인 쿠키를 사용하여 봇 차단 솔루션 우회.
- **다중 프로필 토큰 일괄 관리**: 깃허브 토큰 변경 시 서버에서 푸시 한 번으로 모든 프로필 사이드바의 토큰이 자동 최신화.

### 적용 위치:
- `plugins/basic-plugin/src/offscreen.ts`
- `plugins/basic-plugin/src/content.ts`

> 참고: `plugins/basic-plugin/src/services/githubService.ts`는 깃허브 자동 커밋/푸시용 모듈로 문서화되어 있으나 **현재 보류(백로그)** 상태입니다. 구현 재개 시 별도 ADR/이슈에서 재검토하여 우선순위를 재조정하십시오.

---

## docs/decision/ADR-004-dynamic-worker-multi-db-and-node-config.md

# ADR-004: 동적 수집 워커 빌더, 멀티 DB 및 노드 환경설정 매니저 채택

> **상태**: 승인됨 (Accepted)  
> **날짜**: 2026-08-05  
> **결정자**: 시스템 아키텍트 & 개발 팀  
> **관련 문서**: AGENTS.md, R-00206, R-00207, R-00208, R-00303, R-00304  

---

## 1. 배경 및 문제 정의 (Context & Problem Statement)

크롤링 분산 수집 노드가 늘어나고 수집 대상 도메인이 다양해짐에 따라 기존 시스템에 다음과 같은 아키텍처 한계가 발생했습니다.

1. **DB 폭증 및 성능 저하 (SQLite Bloat)**:
   - 무거운 HTML 소스 원본(`outerHTML`)이나 이미지/동영상 바이너리를 SQLite DB 칼럼에 직접 인서트할 경우 DB 파일 용량이 수십 GB로 폭증하고 WAL 잠금 및 쿼리 속도 저하 발생.
2. **수집 노드 식별성 부족 (Node Identification)**:
   - 난해한 UUID 형태의 노드 ID만 표시되어 어느 브라우저 프로필/기기에서 들어온 데이터인지 관리자가 식별하기 어려움.
3. **다양한 수집 스키마 및 저장소 분리 요구**:
   - 페이스북, 트위터, 쇼핑몰 등 도메인마다 수집하는 데이터 필드와 적재할 DB/디렉터리 경로가 다르나, 이를 동적으로 정의하고 분리 보관할 체계가 부재함.

---

## 2. 고려된 대안들 (Considered Options)

### 대안 1: 단일 DB 및 단일 데이터 저장 구조 (기존 방식)
- **장점**: 백엔드 구현이 단순함.
- **단점**: DB 용량 폭증, 쿼리 저하, 노드 식별 불가, 도메인별 저장소 분리 불가.

### 대안 2: 물리 파일 분리 저장 + 멀티 SQLite DB + 노드 환경설정 매니저 채택 (선택안)
- **장점**:
  - **대용량 파일 분리 저장**: 무거운 HTML/바이너리는 디스크 지정 경로(`STORAGE_ROOT_PATH\<domain>\<db_id>\index.html`)에 저장하고 DB에는 경로(`file_path`)만 기록하여 DB 경량화.
  - **노드 별칭 및 환경설정 매니저**: 노드 옆에 한글 별칭(예: `오페라-개인-수집기-1`)과 `[환경설정 ⚙️]` 모달을 추가하여 노드별 저장 경로 및 전담 워커 지정.
  - **동적 워커 빌더 & 멀티 DB (`databases/workers/`)**: Admin UI에서 워커 생성 시 대상 DB(`worker_<name>.db`), 스키마 필드, 워커 전용 저장소 루트를 자유롭게 구성.
- **단점**: 백엔드 워커 매핑 엔진 및 관리자 UI 모달 추가 구현 필요.

---

## 3. 아키텍처 결정 사항 (Decision)

**대안 2 (물리 파일 분리 저장 + 멀티 DB + 노드 환경설정 매니저)를 백엔드 및 관리자 UI 핵심 아키텍처로 채택합니다.**

### 상세 결정 규정:
1. **노드 환경설정 매니저 (`clients` 테이블 확장)**:
   - 노드 ID 표출 칸 옆에 `[환경설정 ⚙️]` 모달을 제공하여 노드 별칭(`alias`), 노드 전용 물리 저장 경로(`custom_storage_path`), 담당 워커(`assigned_worker_id`)를 지정합니다.
2. **동적 워커 빌더 & 멀티 DB (`workers` 테이블 신설)**:
   - Admin UI에서 워커를 동적 생성하며, 기본 통신 파라미터를 상속받고 커스텀 필드(스키마 JSON)를 추가할 수 있게 합니다.
   - 워커 생성 시 `databases/workers/worker_<name>.db` 파일이 자동 동적 생성되며, 지정한 테이블로 데이터가 적재됩니다.
3. **저장소 경로 적용 우선순위**:
   - 패킷 유입 시 저장 경로: **노드 전용 경로 (`custom_storage_path`) > 워커 전용 경로 (`storage_root_path`) > 시스템 기본 경로 (`STORAGE_ROOT_PATH`)** 순으로 적용됩니다.

---

## 4. 파급 효과 및 이점 (Consequences)

### 긍정적 이점:
- **DB 속도 및 용량 최적화**: 무거운 파일은 물리 디스크에 저장되고 DB에는 텍스트 경로만 보관되어 SQLite가 항상 초경량 상태 유지.
- **운영 편의성 극대화**: 노드 ID를 한글 별칭으로 즉시 식별하고, 특정 노드의 수집 파일만 별도 디렉터리(`E:\data\...`)로 격리 보관 가능.
- **유연한 수집 확장성**: 소스 코드 수정 없이 Admin UI에서 수집 워커와 DB 스키마를 무한히 생성 및 운영 가능.

### 적용 위치:
- `server/src/database.ts`, `server/src/services/fileStorageService.ts`, `server/src/index.ts`
- `admin/src/components/tables/GcpClientsTable.tsx`, `admin/src/components/modals/NodeConfigModal.tsx`
- `admin/src/components/views/WorkerManagerView.tsx`

