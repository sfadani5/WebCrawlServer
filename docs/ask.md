# 작업 요청서 (docs/ask.md)

> **요청일**: 2026-08-05  
> **요청자**: 사용자  
> **대상 프로젝트**: WebCrawlServer 모노레포 (백엔드, 관리자 UI, 브라우저 플러그인)  

---

## 1. 개요 및 요구사항 배경

현재 `WebCrawlServer` 프로젝트 운영 및 테스트 중 다음과 같은 문제점이 발견되었으며, 시스템을 엔터프라이즈급 크롤링 오케스트레이터로 고도화하기 위한 대규모 아키텍처 개정이 필요합니다.

1. **관리자 UI의 과거 오프라인 노드 누적 표출 및 노드 식별 문제**:
   - 오페라 브라우저 플러그인 1개만 설치하여 사용 중임에도 과거 연결 이력들이 오프라인 상태로 목록에 계속 누적되어 시각적 혼란을 야기함.
   - 실제 서버와 실시간 통신 중인 노드만 깔끔하게 필터링하여 보고, 난해한 UUID 대신 한글 별칭(`alias`)과 노드별 환경설정 모달(`[환경설정 ⚙️]`)을 제공해야 함.
2. **동적 수집 워커(Worker) 빌더 & 멀티 DB 구조 도입**:
   - Admin UI에서 수집 워커를 코딩 없이 동적 빌드하고, 워커 전용 독립 DB(`databases/workers/worker_<name>.db`) 및 스키마 테이블, 디폴트 물리 저장 경로를 설정할 수 있어야 함.
3. **대용량 HTML/바이너리 물리 파일 분리 저장소**:
   - 무거운 HTML 원본 소스(`outerHTML`)나 바이너리 파일을 SQLite DB 칼럼에 적재 시 DB 폭증 및 쿼리 저하가 발생하므로, 물리 디스크(`STORAGE_ROOT_PATH\<domain>\<db_id>\index.html`)로 분리 저장하고 DB에는 경로만 보관.
4. **팝업 UI의 한계 및 사이드바(Side Panel) 단일 UI 전환**:
   - 기존 360x480 팝업 UI는 웹사이트를 클릭하면 바로 닫혀버리는 문제가 있음.
   - 아이콘 클릭 시 브라우저 옆에 상시 고정되는 사이드바 대시보드가 열리도록 통합하여 수집 모니터링, 다중 포스팅, 깃허브 연동을 한곳에서 처리하고 싶음.
5. **Chrome MV3 30초 Sleep 제약 극복 (24시간 무중단 연결)**:
   - 서비스 워커가 30초 후 재워지는 문제를 해결하기 위해 오프스크린 문서(`offscreen.ts`)를 도입하여 24시간 끊기지 않는 단일 웹소켓 통신망 구축 필요.
6. **고속 백그라운드 수집 및 다중 포스팅 자동화**:
   - 유저 활성 탭을 직접 이동시키면 브라우저가 과부하되므로, 탭 전환 없이 백그라운드 `fetch()` + `DOMParser` 인출 및 선언형 페이징 순차 이동 수집 구현.
   - 사이드바 하나에서 페이스북, 트위터, 핀터레스트, 블로그로 글을 자동 작성/포스팅하는 멀티 채널 포스팅 구현.
7. **깃허브(GitHub) 자동 커밋/푸시 및 토큰 동기화**:
   - 수집된 데이터를 내 깃허브 저장소로 자동 커밋/푸시하고, 서버에서 토큰 변경 시 웹소켓 푸시로 모든 프로필 플러그인의 토큰을 동기화.

---

## 2. 세부 통합 요구사항 목록

### ① 백엔드 서버 (`server/`)
- [x] `clients` 테이블 스키마 확장 (`alias`, `assigned_worker_id`, `custom_storage_path`).
- [x] `workers` 테이블 신설 (동적 워커 정의, `databases/workers/` DB 매핑, `schema_json`).
- [x] `fileStorageService.ts` 분리 저장소 구현 (`STORAGE_ROOT_PATH\<domain>\<db_id>\index.html`).
- [x] `GET /api/db/clients?onlineOnly=true` 및 `PUT /api/db/clients/:clientId/config` API 구현.
- [x] `POST /api/admin/workers` (동적 워커 & 타깃 DB 동적 생성 API) 구현.
- [x] `CLIENT_STATUS_UPDATE` 수용 및 `UPDATE_AUTH_TOKEN` 브로드캐스트 구현.

### ② 관리자 대시보드 (`admin/`)
- [x] [수집 노드 관리] 테이블 상단에 `온라인만 보기(기본값)` / `전체 보기` / `오프라인만` 필터 토글 스위치 추가.
- [x] 노드 ID 옆 한글 별칭 표출 및 `[환경설정 ⚙️]` 모달 팝업 구현.
- [x] 노드 상태 배지 세분화: `● 온라인 (사이드바 활성 🖥️)`, `● 온라인 (백그라운드 가동 🌙)`, `○ 연결 끊김 (과거 이력)`.
- [x] 오프라인 노드 일괄 정화(Purge Offline) 조치 버튼 제공.
- [x] [수집 워커 빌더 & 멀티 DB 매니저] (`WorkerManagerView.tsx`) 뷰 신설.

### ③ 브라우저 확장 플러그인 (`plugins/basic-plugin/`)
- [x] `manifest.json`: 36종 풀 권한 유지 + `"sidePanel"`, `"offscreen"`, `"management"` 추가, `"side_panel"` 경로 지정, `"default_popup"` 완전히 제거.
- [x] `background.ts`: `openPanelOnActionClick: true` 지정으로 아이콘 클릭 시 사이드바 즉시 실행, `ensureOffscreenDocument()`로 오프스크린 자동 생성/유지.
- [x] `offscreen.ts`: 프로필당 단 1개의 웹소켓(9600 포트) 단독 소유 및 24시간 무중단 연결, 확장형 패킷 봉투(`WebSocketPacket<T>`) 처리.
- [x] `sidepanel.tsx`: 기존 팝업 컴포넌트 100% 흡수 통합, 사이드바 열림/닫힘 상태 오프스크린으로 송출, 탭 스위칭(`기본`, `정보`, `디버깅`, `포스팅`, `깃허브`).
- [x] `content.ts`: 선언형 페이징 순차 이동 수집 엔진(`runPaginationCrawlEngine`) 및 자동 포스팅 지원.
- [x] `services/githubService.ts`: 깃허브 REST API `PUT /repos/{owner}/{repo}/contents/{path}` 파일 자동 커밋/푸시.
- [x] `vite.config.ts`: `sidepanel`, `offscreen`, `background`, `content` 다중 엔트리 번들링 설정.
