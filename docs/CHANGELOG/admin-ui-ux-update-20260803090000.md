# 변경 이력: 관리자 UI/UX 업데이트

- `admin/src/index.css`: Google Cloud Console 스타일 기준 글로벌 폰트 및 베이스 배경 색상 추가.
- `admin/src/components/layout/GcpMainLayout.tsx`: 전체 레이아웃 배경을 흰색/연회색 기반으로 변경하고 메인 컨텐츠 패딩 조정.
- `admin/src/components/layout/Navbar/TopBar.tsx`: 상단 바 색상과 아이콘, 텍스트를 GCP 스타일로 정리.
- `admin/src/components/layout/Sidebar/Sidebar.tsx`: 사이드바 스타일을 밝은 카드형 UI로 변경하고 Material Symbols 아이콘 적용.
- `admin/src/components/layout/Breadcrumb/BreadcrumbBar.tsx`: 브레드크럼 바 UI를 GCP 스타일로 변경하고 버튼 텍스트를 한글화.
- `admin/src/components/layout/Navbar/ProjectSelector.tsx`: 프로젝트 선택 UI를 한글화하고 스타일 개선.
- `admin/src/components/layout/Navbar/GlobalSearchBar.tsx`: 검색 입력 UI를 GCP 스타일로 개선.
- `admin/src/components/layout/Navbar/HeaderTools.tsx`: 연결 상태 표시와 새로고침 버튼 스타일 개선.
- `admin/src/components/tables/GcpClientsTable.tsx`: 클라이언트 테이블 헤더/상태 텍스트를 한글화하고 스타일 조정.
- `admin/src/components/views/GcpControlConsoleView.tsx`: 원격 제어 콘솔 입력 UI를 GCP 스타일로 재정비하고 한글 텍스트 적용.
- `admin/src/components/views/GcpCrawlLogsView.tsx`: 로그 카드 UI를 밝은 카드형 디자인으로 변경하고 한글 텍스트 적용.

## 검증

- `npm run build` 명령을 통해 `admin` 패키지 빌드가 정상 완료됨.
