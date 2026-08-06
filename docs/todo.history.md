# 작업 이력

---

## 2026-08-06 | Phase 2~6 전면 구현 완료

### 완료된 작업 목록

**백엔드 서버 엔진 고도화 (`server/src/`)**
- `database.ts`: `clients` 테이블 칼럼 확장(`alias`, `assigned_worker_id`, `custom_storage_path`), `workers` 테이블 신설, `createDynamicWorker`·`updateClientConfig`·`getAllWorkers`·`getWorkerById` 함수 구현
- `index.ts`: 워커 CRUD API, 노드 환경설정 저장 API, `onlineOnly` 쿼리 필터, `CLIENT_STATUS_UPDATE` 수신기, `broadcastUpdatedToken` 함수, `CRAWL_LOG` 파일저장→워커 파이프라인 연결
- `services/fileStorageService.ts` (신규): HTML 수집 데이터를 도메인/ID 구조로 물리 디스크 저장
- `services/workerEngineService.ts` (신규): 워커 스키마로 동적 DB INSERT

**관리자 대시보드 UI 고도화 (`admin/src/`)**
- `types/index.ts`: `alias`, `assigned_worker_id`, `WorkerRecord`, `CustomFieldDef`, `NodeStatusFilter`, `ActiveTab(workers)` 추가
- `services/apiService.ts`: `updateClientConfigApi`, `fetchWorkersApi`, `createWorkerApi` 추가
- `hooks/useAdminDbApi.ts`: `workers` 상태, `loadWorkers`, `executeUpdateClientConfig`, `executeCreateWorker`, `executePurgeOfflineClients` 추가
- `components/modals/NodeConfigModal.tsx` (신규): 노드 별칭·워커·저장경로 설정 모달
- `components/views/WorkerManagerView.tsx` (신규): 워커 현황 테이블 + 신규 워커 동적 빌더 폼
- `components/tables/GcpClientsTable.tsx`: 별칭 표시, ⚙️ 환경설정 버튼, 3대 상태 배지 추가
- `components/views/GcpClientsView.tsx`: 온라인/전체/오프라인 필터 스위치, `NodeConfigModal` 통합
- `components/layout/Sidebar/Sidebar.tsx`: `workers` 탭 메뉴 항목 추가
- `App.tsx`: `useEffect` 초기 로딩, `WorkerManagerView` 탭 추가

**플러그인 아키텍처 이관 (`plugins/basic-plugin/`)**
- `src/types/index.ts` (신규): `WebSocketPacket`, `PayloadType`, `BrowserInfo`, `ProcessorInfo` 등 플러그인 전용 타입
- `src/config/pluginConfig.ts`: `popup.*` 설정 복원, `server.*` 빌드 타임 주입 지원
- `src/services/githubService.ts` (신규): GitHub REST API 커밋/워크플로 연동
- `src/services/backgroundScraper.ts` (신규): 백그라운드 fetch + DOMParser 스크래핑
- `src/services/chromeService.ts`: `SEND_SOCKET_PACKET` 메시지 방식으로 전환
- `src/offscreen.ts` (신규): 24시간 무중단 단일 소켓 소유자, 크롬 포트 생명주기 감지
- `src/background.ts`: 오프스크린 문서 생성 라우터로 전면 교체, `sidePanel.setPanelBehavior` 설정
- `src/sidepanel.tsx` (신규): 사이드바 메인 UI + `chrome.runtime.connect` 포트 연결
- `src/content.ts`: 페이지네이션 크롤 엔진 + `COLLECT_FULL_DOM` 추가
- `public/manifest.json`: `sidePanel`, `offscreen` 권한 추가, 팝업 제거, 아이콘 action 구조 변경
- `public/sidepanel.html` (신규): 사이드바 HTML 엔트리
- `public/offscreen.html` (신규): 오프스크린 엔진 HTML 엔트리
- `vite.config.ts`: 다중 엔트리(sidepanel, offscreen, background, content) 빌드 설정

**환경 및 검증**
- Python3 Nix 시스템 의존성 설치 (`better-sqlite3` 빌드 환경 해결)
- `@types/chrome` 패키지 설치 (플러그인 타입 안전성 확보)
- `tsconfig.json` 수정: `"types": ["chrome"]` 추가
- `server`, `admin`, `plugins/basic-plugin` 전체 `tsc --noEmit` 오류 없음 확인
- Git 커밋 및 원격 저장소 푸시 완료
