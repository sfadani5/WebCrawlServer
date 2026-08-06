본 문서는 `WebCrawlServer` 프로젝트의 규칙 문서 인덱스입니다. 각 규칙 문서의 역할과 적용 범위를 안내하며, 신규 규칙 문서 추가 시 반드시 함께 갱신해야 합니다.

## 사용 방법

1. `AGENTS.md`를 먼저 확인합니다.
2. 본 인덱스에서 해당 작업 주제에 맞는 `R-00N` 문서를 찾습니다.
3. 해당 `R-00N` 문서에서 구체 규칙을 확인합니다.
4. 필요 시 `docs/ask.md`와 `docs/todo.md`를 참고합니다.

## 규칙 문서 목록

| Rule ID | 문서 | 범위 |
|---|---|---|
| R-00000 | docs/rule/R-00000 instructions.md | 규칙 문서 인덱스 (본 표의 원본, 상세 안내) |
| R-00100 | docs/rule/R-00100 architecture.md | 프로젝트 개요, 시스템 구성, 개발 범위 |
| R-00101 | docs/rule/R-00101 tech-stack.md | 기술 스택 |
| R-00102 | docs/rule/R-00102 structure.md | 폴더 구조, 명명 규칙, 모듈 생성/구조 |
| R-00103 | docs/rule/R-00103 workflow-management.md | ask/todo 운영 절차, 이력 관리, ADR |
| R-00104 | docs/rule/R-00104 versioning.md | Git, 버전 관리, 문서 버전 형식 |
| R-00105 | docs/rule/R-00105 communication.md | 커뮤니케이션 가이드, 응답 구조 |
| R-00106 | docs/rule/R-00106 coding.md | 코드 작성 규칙 |
| R-00107 | docs/rule/R-00107 security.md | 예외 처리 및 일반 보안 정책 |
| R-00108 | docs/rule/R-00108 testing.md | 단위/통합 테스트 도구, 환경, 작성 규칙 및 가이드 |
| R-00200 | docs/rule/R-00200 mcp.md | MCP 프로토콜, 워크플로우 스텝 타입 |
| R-00201 | docs/rule/R-00201 scheduler.md | 스케줄러, 작업 상태, 동시 실행 정책 |
| R-00202 | docs/rule/R-00202 monitoring.md | 모니터링, 리소스 사용량 수집 |
| R-00203 | docs/rule/R-00203 database.md | DB 스키마, 마이그레이션, 백업, 관리자 UI API |
| R-00204 | docs/rule/R-00204 logging.md | 로그 기록 정책, 로그 분류 |
| R-00205 | docs/rule/R-00205 auth.md | 페이지 인증, Basic Auth, bcryptjs, 자격증명 변경 API |
| R-00300 | docs/rule/R-00300 admin-guidelines.md | 관리자 제어 기능 및 운영 UI 지침 |
| R-00301 | docs/rule/R-00301 admin-development-guidelines.md | 관리자 UI 개발 및 모듈화 아키텍처 지침 |
| R-00302 | docs/rule/R-00302 admin-ui-ux-guidelines.md | 관리자 UI/UX 디자인 및 시각적 일관성 가이드 |
| R-00400 | docs/rule/R-00400 plugin-guidelines.md | 플러그인 통합 지침, 전체 맥락 및 하위 문서 인덱스 |
| R-00410 | docs/rule/R-00410 plugin-architecture.md | 플러그인 모듈화 아키텍처, 계층 구조 및 파일 분리 지침 |
| R-00420 | docs/rule/R-00420 plugin-communication.md | WebSocket 연동, 무중단 재연결 및 크롬 메시징 가드 지침 |
| R-00430 | docs/rule/R-00430 plugin-crawling.md | DOM 크롤링, 콘텐츠 스크립트(`content.ts`) 및 메타 수집 지침 |
| R-00440 | docs/rule/R-00440 plugin-ui-ux.md | 팝업 UI/UX 디자인, 탭 네비게이션 및 마우스 드래그 크기 조절 지침 |
| R-00450 | docs/rule/R-00450 plugin-build-env.md | Vite define 기반 빌드 타임 상수 주입 및 설정 지침 |
| R-00460 | docs/rule/R-00460 plugin-manifest-permissions.md | Manifest V3, 권한 관리 및 JSON 주석 금지 지침 |

## 번호 분류

- R-001xx: 통합 지침 / 개발 방향
- R-002xx: 시스템 / 서버
- R-003xx: 관리자 UI
- R-004xx: 플러그인 (10단위 확장형)
- R-005xx: 기록·운영·보관

## 신규 규칙 문서 추가

- 새로운 규칙 문서를 추가할 때는 반드시 본 문서와 `AGENTS.md`의 Rule Registry 표를 동시에 갱신합니다.
- 두 표가 불일치할 경우 `AGENTS.md`가 우선합니다.
- 신규 문서 번호는 분류 블록에 따라 부여합니다. 예: 관리자 UI는 `R-00300`대, 플러그인은 `R-00400`대(10단위 간격), 기록·운영·보관은 `R-00500`대를 사용합니다.

## AI 지침 문서 번호 부여 원칙

- AI 지침 문서는 `docs/rule/` 하위에 `R-00N` 번호를 부여하여 생성해야 합니다.
- 번호는 아래 분류 체계에 따라 결정합니다.
  - `R-001xx`: 통합 지침 / 개발 방향
  - `R-002xx`: 시스템 / 서버
  - `R-003xx`: 관리자 UI
  - `R-004xx`: 플러그인 (10단위 확장형)
  - `R-005xx`: 기록·운영·보관
- AI 지침 문서 번호는 중복되지 않도록 기존 Rule Registry를 확인한 후, 블록 내 다음 사용 가능한 번호를 선택합니다.
- 문서 생성 시 제목과 파일명 모두에 `R-00N` 번호를 포함해야 합니다. 예: `# R-00400 docs/rule/R-00400 plugin-guidelines.md`.
- AI 지침 문서가 새로 추가되면 `AGENTS.md`와 `R-00000 instructions.md` 모두에 동일한 등록 항목을 반드시 추가하고, 번호 체계가 올바른지 검증합니다.

## 문서 기준

- 본 문서에서는 규칙 문서의 위치와 역할만 정의합니다.
- 세부 규칙은 각 `docs/rule/*.md` 문서를 따릅니다.
- 프로젝트 전체 문서 우선순위는 `AGENTS.md` > `docs/rule/*.md` > `docs/ask.md` > `docs/todo.md` > `README.md`입니다.