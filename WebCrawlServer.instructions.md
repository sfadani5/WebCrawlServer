## AGENTS.md

# WebCrawlServer - AI 에이전트 통합 지침 (AGENTS.md)

> 버전: 0.2.0
> 작성자: 사용자
> 수정일: 2026-08-03
> 검토일: 2026-08-03
> 수정 이유:
>   1) `docs/rule/` 하위 규칙 문서 R-00000, R-00100~R-00205, R-00300, R-00400를 완성하고 `AGENTS.md`의 Rule Registry를 갱신했습니다.
>   2) `docs/decision/v0.02.개발 환경 셋팅 가이드.md`의 로컬 개발 환경 기준과 PowerShell 7 기반 운영 원칙을 `tech-stack.md` 및 `architecture.md`에 반영했습니다.
>   3) `AGENTS.md` 상단 메타와 문서 우선순위 규칙을 최신 문서 목록과 정합시켰습니다.
> 관련 문서: docs/rule/R-00000 instructions.md(R-00000), docs/rule/ 하위 전체 문서(R-00000, R-00100~R-00205, R-00300, R-00400)
> 영향 범위: 본 문서 전체, docs/rule/ 문서 구조 및 README.md 연동
> Breaking Change 여부: 없음
> 프로젝트: WebCrawlServer (브라우저 플러그인 + 로컬 WebSocket/REST 서버 + 관리자 페이지 모노레포)

---

## 0. 문서 참조 구조

### 0.1 문서 계층 및 역할

각 문서는 아래와 같은 역할과 우선순위를 가진다. 위쪽이 상위 문서이며, 하위 문서는 상위 문서의 범위를 벗어나는 내용을 임의로 정의할 수 없다.

```
AGENTS.md                    Root Rule   — 최상위 절대 규칙 (언어, 문서 위치, 우선순위, Rule Registry 등)
        ↓
docs/rule/*.md (R-00000, R-00100~R-00205, R-00300, R-00400) 실무 규칙   — 개발/운영 세부 지침 (아키텍처, MCP, DB, Git, 관리자 UI, 플러그인 등, 주제별 분리)
        ↓
docs/ask.md                  요청사항    — 사용자가 남긴 작업 요청 원문
        ↓
docs/todo.md                 현재 작업   — 요청을 바탕으로 AI가 세운 실행 계획
        ↓
README.md                    프로젝트 설명 — 외부/신규 참여자를 위한 개요
```

- `AGENTS.md`는 다른 모든 문서보다 우선하는 최상위 지시서다.
- `docs/rule/` 하위 문서(R-00000, R-00100~R-00205, R-00300, R-00400)는 `AGENTS.md`가 위임한 실무 세부 규칙 문서다. `instructions.md`(R-00000)는 그 자체가 규칙을 담기보다 나머지 문서로 가는 인덱스 역할을 한다.
- `docs/ask.md`/`docs/todo.md`는 특정 작업 단위의 요청·계획을 담는 문서이며, 규칙 문서(`AGENTS.md`, `docs/rule/*.md`)의 내용을 변경하거나 무시하는 근거로 사용할 수 없다.
- `README.md`, `AGENTS.md`, `replit.md`는 규칙 문서가 아니며 프로젝트 루트에 있어야 한다. `docs/rule/AGENTS.md`, `docs/rule/README.md`, `docs/rule/replit.md` 같은 복제본은 금지한다.

작업 시작 전 아래 세부 규칙 문서를 반드시 확인한다. 본 파일(`AGENTS.md`)은 최상위 지시서(Root Rules)이며, 시스템 아키텍처·기술 스택·폴더 구조·MCP 프로토콜·모듈 개발·DB·로그·Git·커뮤니케이션 등 프로젝트 전반의 세부 규칙은 아래 Rule Registry의 각 문서에 위임한다.

### 0.2 Rule Registry

작업 주제에 맞는 문서만 골라 읽는다. 전체를 다 읽을 필요는 없다.

- AI 지침 문서는 `docs/rule/` 하위에 `R-00N` 번호를 부여하여 생성해야 하며, 번호는 아래 분류 체계를 따른다.
  - `R-001xx`: 통합 지침 / 개발 방향
  - `R-002xx`: 시스템 / 서버
  - `R-003xx`: 관리자 UI
  - `R-004xx`: 플러그인
  - `R-005xx`: 기록·운영·보관
- 신규 AI 지침 문서는 문서 제목과 파일명 모두에 번호를 포함하고, `AGENTS.md` Rule Registry와 `docs/rule/R-00000 instructions.md` 인덱스를 동시에 갱신해야 한다.

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
| R-00400 | docs/rule/R-00400 plugin-guidelines.md | 브라우저 플러그인 수집·통신 지침 |

- 새 규칙 문서가 필요해지면 이 표와 `docs/rule/R-00000 instructions.md`의 표를 함께 갱신합니다.
- 신규 문서 번호는 분류 블록에 따라 부여합니다. 예: 관리자 UI는 `R-00300`대, 플러그인은 `R-00400`대, 기록·운영·보관은 `R-00500`대를 사용합니다.
- 두 표가 어긋나면 `AGENTS.md`가 우선합니다.
- 코드 작성 전 항상 관련 Rule ID의 문서를 먼저 확인합니다.
- 어느 문서에 해당하는지 애매하면 `docs/rule/R-00000 instructions.md`(R-00000)의 안내를 먼저 확인합니다.

---

## 1. 에이전트 핵심 우선순위 지침 (최상위 규칙)

아래 항목은 다른 모든 규칙보다 우선 적용되며, 예외 없이 준수한다.

### 1.1 언어 규칙 (예외 없음)
- 모든 답변, 코드 주석, 커밋 메시지, 문서 설명은 **한글로만 작성**한다.
- 변수명·함수명·클래스명 등 코드 식별자는 관례상 영문을 사용할 수 있으나, 그 외 모든 설명 텍스트는 한글이어야 한다.
- 답변 도중 특정 표현이 영문으로만 자연스럽다고 판단되더라도 임의로 영어 문장을 섞지 않는다. 고유명사(라이브러리명, 프로토콜명, 파일 경로 등)는 예외로 하되, 그 외 서술은 한글로 고정한다.
- 답변 생성 후 제출 전, 영문 문장이 섞여 있는지 스스로 점검한다. 발견 시 한글로 재작성 후 제출한다.
- 이 규칙은 짧은 답변, 코드 설명, 에러 메시지 해설을 포함한 모든 응답 유형에 동일하게 적용된다.
- **모든 코드는 ESM(ECMAScript Modules) 규격(import/export)을 기준으로 개발한다. CommonJS(require/module.exports) 방식은 특별한 사유 없이는 사용하지 않으며, 기존 CommonJS 코드는 ESM으로 전환한다.**
- **라이브러리 참조 시에도 ESM 호환 경로를 우선하며, CommonJS 전용 라이브러리 사용 시에는 ESM 환경에서 정상 작동하는지 검증하고 필요시 해당 라이브러리의 ESM 버전 또는 ESM 래퍼를 사용한다.**

### 1.2 설명 방식 (최소 원칙)
- 감성적 표현, 과장된 수식어를 배제하고 개발자 관점에서 사실적/기술적으로 설명한다.
- 세부 톤, 금지 표현 목록, 응답 구조(작업 요약 → 변경 내역 → 변경 이유 → 검증 방법 → ...)는 `docs/rule/R-00105 communication.md`(R-00105)를 따른다. 본 문서에서는 이 원칙을 최상위로 고정하는 역할만 하며, 세부 규정을 중복 기술하지 않는다.

### 1.3 문서 작성 위치 규칙
- 모든 마크다운(.md) 문서는 프로젝트 루트가 아닌 **`docs/` 디렉토리 하위의 관련 폴더**에 생성한다.
  - 예: 규칙 문서 → `docs/rule/`, 변경 이력 → `docs/CHANGELOG/`, 작업 요청/이력 → `docs/askLogs/`, 설계 결정 기록(ADR) → `docs/decision/`
- `AGENTS.md`, `README.md`는 프로젝트 루트에 위치하는 것을 예외로 허용한다.
- 문서 생성 위치가 애매한 경우, 임의로 루트에 생성하지 말고 가장 근접한 `docs/` 하위 폴더를 판단하여 생성한 뒤 사용자에게 위치를 보고한다.
- ADR 작성 대상 여부와 형식은 `docs/rule/R-00103 workflow-management.md`(R-00103) 5장을 따른다.

### 1.4 소통 원칙 (최소 원칙)
- '프리미엄', '와우', '놀라운', '완벽한', '최고 품질의' 등 마케팅성/주관적 수식어 사용을 금지한다.
- 모든 보고는 변경된 파일 경로, 함수명, 수치, 로그 결과 등 데이터/코드 기반으로 작성한다.
- 금지 표현의 전체 목록과 응답 구조 세부 규정은 `docs/rule/R-00105 communication.md`(R-00105)를 따른다.

### 1.5 문서 간 우선순위 규칙 (충돌 시 적용)

문서 간 내용이 서로 다르거나 충돌하는 경우, 아래 순서를 기준으로 우선순위가 높은 문서를 따른다.

```
1순위  System (실행 환경이 부여한 시스템 지침)
2순위  AGENTS.md
3순위  docs/rule/*.md (R-00000, R-00100~R-00205, 서로 동일 우선순위. 내부 충돌 시 사용자에게 보고)
4순위  docs/ask.md
5순위  docs/todo.md
6순위  README.md
```

- 상위 문서와 하위 문서의 내용이 충돌하면 상위 문서를 따르고, 하위 문서는 상위 문서에 맞춰 갱신할 대상으로 취급한다.
- `docs/rule/*.md` 문서끼리(예: mcp.md와 scheduler.md) 서로 다른 내용을 규정하고 있다면 어느 한쪽이 우선하는 것이 아니라, 임의로 판단하지 않고 사용자에게 보고한 뒤 처리 방향을 확인한다.
- `docs/ask.md`/`docs/todo.md`는 특정 작업의 요청·계획이므로 `docs/rule/*.md`의 규칙 자체를 변경하는 근거가 될 수 없다. 규칙 변경이 필요하면 먼저 해당 규칙 문서를 갱신한 뒤 작업을 진행한다.
- `docs/tips/`, `docs/askLogs/`, `docs/CHANGELOG/`(하위 폴더), `docs/decision/` 등은 이 우선순위 목록에 넣지 않는다. 2장 컨텍스트 로딩 예외 규칙에 따라 쓰기 전용 기록 문서이므로, 규칙 충돌 판단이나 새 작업 시작 시 참조 대상이 아니다. 사용자가 특정 파일을 명시적으로 지정한 경우에만 그 파일 하나를 열람하며, 이때도 규칙 판단의 근거가 아니라 참고 자료로만 사용한다.
- 충돌이 발견되면 임의로 판단하지 않고 사용자에게 보고한 뒤 처리 방향을 확인한다.

### 1.6 작업 시작 시 파일 확인 순서

새 작업을 시작할 때는 아래 순서로 문서를 확인한다. 순서를 건너뛰지 않는다.

```
1. AGENTS.md                       — 최상위 규칙 확인 (0.2 Rule Registry 포함)
2. docs/rule/R-00000 instructions.md(R-00000) — 이번 작업 주제에 해당하는 세부 규칙 문서를 찾음
3. (2에서 찾은) 해당 R-00N 문서     — 관련 실무 규칙 확인
4. docs/ask.md                     — 이번 작업의 요청 내용 확인
5. docs/todo.md                    — 기존에 등록된 작업 계획/진행 상태 확인
```

- 2, 3단계는 이번 작업과 무관한 R-00N 문서까지 모두 읽으라는 뜻이 아니다. 주제에 맞는 문서만 선택적으로 읽는다.
- `docs/ask.md`는 신규 작업 요청 문서입니다. 작업을 시작할 때 반드시 확인하며, `docs/ask.md`에 기록된 요청은 `docs/askLogs/`에도 함께 남깁니다.
- `docs/todo.md`는 작업 완료 및 미완료 항목을 체크박스 형태로 기록하는 문서입니다. 개선 요청은 `docs/todo.md`에 반영하고, 작업 완료 후에는 `docs/todo.history.md`에 이력과 결과를 기록합니다.
- 중요한 설계 결정은 `docs/decision/`에 ADR로 저장합니다.
- 변경 이력은 항상 최신으로 유지하기 위해 `docs/CHANGELOG.md`에 기록합니다.
- `docs/CHANGELOG/`, `docs/askLogs/`, `docs/tips/`, `docs/decision/`는 2장의 컨텍스트 로딩 예외 규칙에 따라 이 순서에 포함하지 않는다.
- `docs/todo.md`를 확인하지 않고 작업을 시작하지 않는다. 기존 계획과 중복되거나 충돌하는 작업을 새로 만들지 않기 위함이다.

### 1.7 불확실 사항에 대한 추측 금지 원칙

- 요구사항, API 스펙, DB 스키마, 폴더 구조, 프로토콜 필드 등 코드/문서에 근거가 없는 사항은 추측으로 생성하지 않는다.
- 다음 항목은 특히 추측을 금지하고 반드시 사용자에게 확인한다.
  - 존재하지 않는 API·DB 테이블·컬럼이 있다고 가정하고 코드를 작성하는 행위
  - 명시되지 않은 MCP 프로토콜 필드·명령어를 임의로 추가하는 행위
  - 문서에 없는 폴더/파일 구조를 임의로 신설하는 행위
- 확인이 필요한 사항이 여러 개인 경우 한 번에 정리해 질문하고, 임의의 기본값으로 진행하지 않는다.
- 다만 1.3의 문서 위치 판단처럼 이미 규칙에 판단 기준이 명시된 경우는 예외로 하며, 이 경우 판단 근거를 보고에 남긴다.

---

## 2. 컨텍스트 로딩 예외 규칙 (토큰 절약)

아래 폴더는 **작업 컨텍스트 로딩 시 참조하지 않는다.** 과거 이력성 데이터로, 매 작업마다 읽으면 불필요한 토큰 낭비가 발생하기 때문이다.

- `docs/CHANGELOG/` (버전별 상세 변경 이력)
- `docs/askLogs/` (모든 질의와 응답 데이터를 `YYYYMMDDHHMMSS.md` 형식으로 기록하는 이력 저장소)
- `docs/tips/` (개발 팁, 트러블슈팅 기록)
- `docs/decision/` (ADR, 설계 결정 기록. 형식은 `docs/rule/R-00103 workflow-management.md` R-00103 5장 참조)

**적용 방식:**
- 위 폴더들은 **기록 저장용**으로 취급하며, 새로운 작업을 시작할 때 이 폴더의 기존 파일들을 훑어보거나 컨텍스트로 불러오지 않는다.
- 에이전트는 작업 완료 후 이력을 기록하기 위해 파일을 생성/추가할 수 있지만, 신규 작업에서는 폴더 전체를 자동으로 스캔하지 않는다.
- 사용자가 특정 이력 파일을 명시적으로 지정하며 "이 로그 참고해서 진행해줘"라고 요청한 경우에만 해당 파일 하나를 열어 확인한다.
- 예외: 규칙 문서(`docs/rule/*.md`)를 변경하는 작업에서는 `docs/decision/`에 관련 주제의 기존 ADR이 있는지 **파일명 목록만** 확인한다. 목록에서 관련성이 있어 보이는 파일이 있으면 그 파일 하나만 열람하고, 폴더 전체 내용을 훑지 않는다.
- `docs/CHANGELOG.md` (루트의 메인 인덱스 파일, 폴더가 아닌 단일 파일)는 이 예외에서 제외한다. 최신 버전 확인이 필요할 때는 이 파일만 참조한다.
- 코드 검색, grep, 파일 목록 조회 등 자동화된 전체 스캔 작업 시에도 위 4개 폴더는 기본적으로 제외 대상에 포함한다.

---

## 3. 작업 종료 시 최소 확인 사항

작업을 마무리하기 전 아래 항목을 확인한다. 상세 체크리스트와 절차는 `docs/rule/R-00103 workflow-management.md`(R-00103) 4장(작업 종료 체크리스트)을 따른다.

- 코드가 정상적으로 실행/컴파일되는지 확인했는가
- `AGENTS.md` 및 관련 `docs/rule/*.md` 문서의 규칙을 위반하지 않았는가
- `docs/todo.md`의 완료 항목을 정리했는가
- `docs/todo.history.md`, `docs/askLogs/`에 이력을 기록했는가 (변경 내용뿐 아니라 변경 이유 포함)
- 설계 결정이 있었던 작업이면 `docs/rule/R-00103 workflow-management.md`(R-00103) 5장 기준으로 ADR 작성 여부를 확인했는가

이 중 하나라도 확인하지 못한 상태로 작업을 완료 보고하지 않는다.

---

> **주의:** 본 지침을 위반하는 코드/문서는 작성하지 않는다. 시스템 아키텍처, 기술 스택, 폴더 구조, MCP 프로토콜, DB, 로그, Git, 코드 작성, 커뮤니케이션, 보안 등 실무 세부 규칙은 0.2 Rule Registry의 각 `docs/rule/*.md` 문서를 따른다.




---

## README.md

# WebCrawlServer

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

# R-00000 docs/rule/R-00000 instructions.md

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
| R-00400 | docs/rule/R-00400 plugin-guidelines.md | 브라우저 플러그인 수집·통신 지침 |

## 번호 분류

- R-001xx: 통합 지침 / 개발 방향
- R-002xx: 시스템 / 서버
- R-003xx: 관리자 UI
- R-004xx: 플러그인
- R-005xx: 기록·운영·보관

## 신규 규칙 문서 추가

- 새로운 규칙 문서를 추가할 때는 반드시 본 문서와 `AGENTS.md`의 Rule Registry 표를 동시에 갱신합니다.
- 두 표가 불일치할 경우 `AGENTS.md`가 우선합니다.
- 신규 문서 번호는 분류 블록에 따라 부여합니다. 예: 관리자 UI는 `R-00300`대, 플러그인은 `R-00400`대, 기록·운영·보관은 `R-00500`대를 사용합니다.

## AI 지침 문서 번호 부여 원칙

- AI 지침 문서는 `docs/rule/` 하위에 `R-00N` 번호를 부여하여 생성해야 합니다.
- 번호는 아래 분류 체계에 따라 결정합니다.
  - `R-001xx`: 통합 지침 / 개발 방향
  - `R-002xx`: 시스템 / 서버
  - `R-003xx`: 관리자 UI
  - `R-004xx`: 플러그인
  - `R-005xx`: 기록·운영·보관
- AI 지침 문서 번호는 중복되지 않도록 기존 Rule Registry를 확인한 후, 블록 내 다음 사용 가능한 번호를 선택합니다.
- 문서 생성 시 제목과 파일명 모두에 `R-00N` 번호를 포함해야 합니다. 예: `# R-00300 docs/rule/R-00300 admin-guidelines.md`.
- AI 지침 문서가 새로 추가되면 `AGENTS.md`와 `R-00000 instructions.md` 모두에 동일한 등록 항목을 반드시 추가하고, 번호 체계가 올바른지 검증합니다.

## 문서 기준

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

`WebCrawlServer`는 ESM 기반 TypeScript 코드를 기본으로 합니다. 본 문서는 코드 작성 규칙과 스타일 가이드를 정의합니다.

## 코드 규칙

- JavaScript 대신 TypeScript를 사용합니다.
- 모듈 시스템은 ESM(`import` / `export`)을 사용합니다.
- CommonJS(`require`, `module.exports`)는 사용하지 않습니다.
- 타입을 명시적으로 정의하고, 가능한 경우 `any` 사용을 최소화합니다.
- Promise와 비동기 함수는 `async/await`로 명확히 처리합니다.

## 파일 작성

- 서버 코드: `.ts`
- React 컴포넌트: `.tsx`
- 설정 파일: `.mts`, `.json`
- 문서 파일: `.md`

## 예외 처리

- 오류 처리는 상세 메시지와 함께 로그를 남겨야 합니다.
- 불필요한 에러 무시는 피합니다.
- 입력 검증이 필요한 경우 적절한 방어 코드를 작성합니다.




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
- 선택 불가 텍스트(`select-none`)는 인터랙티브 요소가 아닌 경우에만 사용

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

## docs/rule/R-00400 plugin-guidelines.md

# R-00400 docs/rule/R-00400 plugin-guidelines.md

`WebCrawlServer` 브라우저 플러그인 수집 및 통신 지침 문서입니다. 본 문서는 플러그인의 식별, 서버 WebSocket 연결, 콘텐츠 수집 이벤트 전달, 재연결 루프, 메시지 수신 처리 원칙을 정의합니다.

## 적용 범위

- `plugins/basic-plugin/src/` 기반 브라우저 확장 기능
- `background.ts`, `content.ts`, `popup.tsx` 등 플러그인 구성 요소
- 플러그인 식별자 생성 및 저장, 서버 재연결, 수집 데이터 송신

## 주요 지침

### 1. 플러그인 식별

1.1 플러그인은 `chrome.storage.local`에 `clientId`를 저장하고 재사용해야 합니다.
1.2 `clientId`가 없을 경우 `crypto.randomUUID()`를 생성하여 저장해야 합니다.
1.3 `clientType`은 `plugin`으로 고정해야 합니다.

### 2. 서버 통신

2.1 플러그인은 `ws://localhost:9600?clientId=<clientId>&clientType=plugin` 형태로 서버에 WebSocket을 연결해야 합니다.
2.2 연결이 끊기면 3초 후 재연결 시도를 반복해야 합니다.
2.3 최초 연결 성공 시 `CRAWL_LOG` 또는 `HELLO` 성격의 기본 패킷을 서버로 전송하여 상태를 알립니다.

### 3. 수집 데이터 전달

3.1 수집 결과는 `action: "CRAWL_LOG"` 형태로 전송해야 합니다.
3.2 `payload`는 수집 데이터 원본을 포함하고, 필요 시 JSON 문자열화하여 로그로 전송합니다.
3.3 서버로 전송된 수집 로그는 서버의 `crawl_logs` 테이블에 동기적으로 적재되어야 합니다.

### 4. 메시지 수신 처리

4.1 플러그인은 관리자 명령 `CRAWL_START` 수신 시 `chrome.tabs.query` 및 `chrome.tabs.sendMessage`로 content script에 전달해야 합니다.
4.2 명령 파이프는 수신 오류가 발생해도 플러그인 자체가 종료되지 않도록 가드해야 합니다.
4.3 플러그인은 서버나 관리자 명령이 없는 경우에도 `background` 서비스 워커를 유지하며 재연결을 계속 시도해야 합니다.

