# 실행 계획 체크리스트 (docs/todo.md)

> **프로젝트**: WebCrawlServer 모노레포 구조 개선  
> **상태**: 진행 중 (Phase 1 ~ Phase 6)  
> **최종 수정일**: 2026-08-05  

---

## Phase 1. 문서화 및 규정 체계 정립 (Documentation & ADRs)

- [x] **[Step 1-1] `AGENTS.md` 갱신**: 신규 규칙 문서(`R-00206~00208`, `R-00303~00304`, `R-00470~00490`) 추가 및 버전(0.7.0) 최신화.
- [x] **[Step 1-2] `R-00000` 갱신**: 규칙 문서 인덱스 및 레지스트리 번호 체계 동기화.
- [x] **[Step 2-1] `ADR-001` 작성**: 사이드바 단일 UI 통합 및 오프스크린 24시간 단일 소켓 아키텍처 채택 기록.
- [x] **[Step 2-2] `ADR-002` 작성**: 확장형 웹소켓 통신 패킷 봉투(`WebSocketPacket<T>`) 프로토콜 규격 채택 기록.
- [x] **[Step 2-3] `ADR-003` 작성**: 백그라운드 `fetch()` 인출 및 깃허브 토큰 동기화 패턴 채택 기록.
- [x] **[Step 2-4] `ADR-004` 작성**: 동적 워커 빌더, 멀티 DB, 대용량 파일 분리 저장소 및 노드 별칭/환경설정 매니저 채택 기록.
- [x] **[Step 3-1 ~ 3-5] 신규 세부 기술 규칙 제정**:
  - [x] `R-00206`: 백엔드 노드 세션, 별칭(Alias) 및 라우팅 규격
  - [x] `R-00207`: 동적 서버 워커 엔진 및 멀티 DB 관리 규격
  - [x] `R-00208`: 대용량 HTML/바이너리 물리 파일 분리 저장소 지침
  - [x] `R-00303`: 관리자 대시보드 노드 배지 및 노드 환경설정 모달 지침
  - [x] `R-00304`: 관리자 대시보드 워커 빌더 & DB 매니저 UI 개발 지침
  - [x] `R-00470`: 사이드바 통합 UI & 오프스크린 무중단 아키텍처 지침
  - [x] `R-00480`: 백그라운드 경량 수집 및 다중 포스팅 지침
  - [x] `R-00490`: 깃허브 REST API 연동 및 토큰 동기화 지침
- [x] **[Step 4-1 ~ 4-7] 기존 플러그인 규칙 개정**:
  - [x] `R-00400` ~ `R-00460` 전 문서를 신규 아키텍처 패러다임에 맞춰 개정 작성 완료.
- [x] **[Step 5-1] `docs/ask.md` 작성**: 종합 요구사항 명세 완료.

---

## Phase 2. 백엔드 서버 엔진 고도화 (`server/`)

- [ ] **[데이터베이스] `server/src/database.ts` 스키마 확장**:
  - [ ] `clients` 테이블에 `alias`, `assigned_worker_id`, `custom_storage_path` 칼럼 추가.
  - [ ] `workers` 테이블 신설 (동적 워커 정보, `databases/workers/` DB 경로, `schema_json` 보관).
  - [ ] `createDynamicWorker()` 함수 구현 (타깃 DB 및 동적 테이블 DDL 구문 자동 실행, DDL 예약어 충돌 정화).
- [ ] **[파일 저장소 서비스] `server/src/services/fileStorageService.ts` 작성**:
  - [ ] `saveCrawledContentToFile()` 구현 (경로 우선순위: 노드 전용 > 워커 전용 > 글로벌 기본).
  - [ ] 도메인 특수문자 정화(`sanitizeFolderName`) 및 `STORAGE_ROOT_PATH\<safeDomain>\<db_id>\index.html` 디렉터리 자동 생성/쓰기.
- [ ] **[워커 파이프라인] `server/src/services/workerEngineService.ts` 작성**:
  - [ ] `executeWorkerPipeline()` 구현 (워커 스키마 및 타깃 DB로 데이터 동적 INSERT).
- [ ] **[REST API & 웹소켓] `server/src/index.ts` 개선**:
  - [ ] `GET /api/db/clients?onlineOnly=true` 파라미터 필터 구현.
  - [ ] `PUT /api/db/clients/:clientId/config` (노드 환경설정 저장 API) 구현.
  - [ ] `POST /api/admin/workers` (신규 동적 워커 생성 API) 구현.
  - [ ] `CLIENT_STATUS_UPDATE` (사이드바 열림/닫힘 알림) 수신기 구현.
  - [ ] `broadcastUpdatedToken` (토큰 원격 푸시 브로드캐스트) 함수 구현.

---

## Phase 3. 관리자 대시보드 UI 고도화 (`admin/`)

- [ ] **[타입 & API 서비스] `admin/src/types/index.ts` & `apiService.ts` 개선**:
  - [ ] `Client` 인터페이스에 `alias`, `assigned_worker_id`, `custom_storage_path`, `is_sidebar_open` 추가.
  - [ ] `WorkerRecord`, `CustomFieldDef`, `NodeStatusFilter` 타입 추가.
  - [ ] `fetchClientsApi(onlineOnly)`, `updateClientConfigApi`, `createWorkerApi` 추가.
- [ ] **[노드 환경설정 모달] `admin/src/components/modals/NodeConfigModal.tsx` 작성**:
  - [ ] 노드 별칭(`alias`), 담당 워커(`assignedWorkerId`), 노드 전용 저장 경로(`customStoragePath`) 수정 폼.
- [ ] **[수집 노드 테이블] `admin/src/components/tables/GcpClientsTable.tsx` 개선**:
  - [ ] 노드 ID 옆 한글 별칭 및 `[환경설정 ⚙️]` 버튼 배치.
  - [ ] 3대 노드 상태 배지 표출:
    - `● 온라인 (사이드바 활성 🖥️)`
    - `● 온라인 (백그라운드 가동 🌙)`
    - `○ 연결 끊김 (과거 이력)`
- [ ] **[수집 노드 뷰] `admin/src/components/views/GcpClientsView.tsx` 개선**:
  - [ ] `온라인만 보기 (기본값)` / `전체 보기` / `오프라인만` 필터 토글 스위치 구현.
  - [ ] `오프라인 노드 이력 일괄 정리 (Purge Offline)` 버튼 구현.
- [ ] **[워커 빌더 뷰] `admin/src/components/views/WorkerManagerView.tsx` 작성**:
  - [ ] 신규 워커 생성, 타깃 DB 파일명, 테이블명, 워커 저장 경로, 커스텀 필드 스키마 빌더 UI 구현.

---

## Phase 4. 플러그인 아키텍처 및 사이드바 단일 UI 이관 (`plugins/basic-plugin/`)

- [ ] **[매니페스트] `public/manifest.json` 갱신**:
  - [ ] 36종 풀 권한 구성 (`"offscreen"`, `"sidePanel"`, `"management"` 포함).
  - [ ] `"side_panel": { "default_path": "sidepanel.html" }` 선언.
  - [ ] `"action"`의 `"default_popup"` 완전히 제거.
- [ ] **[Vite 빌드 설정] `vite.config.ts` 갱신**:
  - [ ] `rollupOptions.input`에 `sidepanel`, `offscreen`, `background`, `content` 다중 엔트리 지정.
- [ ] **[오프스크린 엔진] `src/offscreen.ts` & `public/offscreen.html` 작성**:
  - [ ] 백엔드 포트(9600) 단일 웹소켓 24시간 무중단 연결 및 3초 주기 자동 재연결.
  - [ ] `WebSocketPacket<T>` 패킷 봉투 처리 및 `UPDATE_AUTH_TOKEN` 토큰 푸시 수신기 구현.
  - [ ] 크롬 포트 감지(`chrome.runtime.onConnect`) 기반 사이드바 열림/닫힘 100% 감지.
  - [ ] `sendMessage().catch()` 예외 가드 적용.
- [ ] **[서비스 워커] `src/background.ts` 개선**:
  - [ ] `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })` 지정.
  - [ ] `ensureOffscreenDocument()`로 브라우저 기동 시 오프스크린 자동 생성/유지.
- [ ] **[사이드바 UI] `src/sidepanel.tsx` & `public/sidepanel.html` 작성**:
  - [ ] 메인 단일 UI 대시보드로 마운트.
  - [ ] `chrome.runtime.connect({ name: "sidepanel-port" })` 연결로 생명주기 통지.
  - [ ] 탭 스위칭: `기본`, `정보`, `디버깅`, `포스팅`, `깃허브`.

---

## Phase 5. 수집 엔진, 포스팅 자동화 및 깃허브 연동 (`plugins/basic-plugin/`)

- [ ] **[깃허브 서비스] `src/services/githubService.ts` 작성**:
  - [ ] `commitFileToGithub` 함수 구현 (`PUT /repos/{owner}/{repo}/contents/{path}`).
  - [ ] `triggerGithubWorkflow` 함수 구현 (`workflow_dispatch`).
- [ ] **[백그라운드 수집] `src/services/backgroundScraper.ts` 작성**:
  - [ ] `fetch()` + `DOMParser` 기반 비가시 백그라운드 초고속 HTML 인출.
- [ ] **[콘텐츠 스크립트] `src/content.ts` 개선**:
  - [ ] `runPaginationCrawlEngine` 구현 (페이지 버튼 자동 클릭 & 인간 모사 랜덤 지연 시간).
  - [ ] 다중 SNS 자동 포스팅 지원 DOM 입력 엔진.

---

## Phase 6. 검증 및 다중 프로필 시스템 통합 테스트

- [ ] `npm run build --workspace=basic-plugin` 단행 후 `dist/`에 4개 엔트리 JS 정상 생성 확인.
- [ ] 오페라/크롬 다중 프로필에서 확장 프로그램 로드 후 독립된 36종 권한 가동 확인.
- [ ] 플러그인 아이콘 클릭 시 사이드바 대시보드가 우측에 즉시 오픈되는지 검증.
- [ ] 사이드바를 닫아도 오프스크린의 웹소켓 연결이 24시간 절단 없이 유지되는지 검증.
- [ ] 관리자 대시보드에서 노드 한글 별칭, 노드 환경설정 모달, `사이드바 활성` / `백그라운드 가동` 배지가 실시간 동적 변환되는지 검증.
- [ ] 신규 수집 워커 생성 시 `databases/workers/`에 독립 DB가 동적 생성되는지 검증.
- [ ] 수집된 HTML 파일이 디스크 물리 경로(`E:\data\...`)로 분리 저장되는지 검증.
- [ ] `docs/todo.history.md`에 최종 구현 완료 이력 기록.
