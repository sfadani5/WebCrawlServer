# 작업 요청서 (docs/ask.md)

## 작업 상태 요약 (검증 완료: 2026-08-07)

- **네비게이션 & 브레드크럼 체계 일치화**: 구현 및 코드 검증 완료.
  - 관련 파일: admin/src/components/layout/Sidebar/Sidebar.tsx, admin/src/components/layout/Breadcrumb/BreadcrumbBar.tsx
  - 변경 이력: docs/CHANGELOG/20260803-001-navigation-breadcrumb-sync.md

- **네트워크 모니터링 메뉴 및 뷰**: `NetworkMonitorView` 구현 및 기본 동작 확인 완료.
  - 관련 파일: admin/src/components/views/NetworkMonitorView.tsx

- **타입 확장 및 터미널 로그 엔트리**: `ActiveTab`, `TerminalLogEntry` 등 타입 정의 적용 완료.
  - 관련 파일: admin/src/types/index.ts

- **백엔드 네트워크 헬스체크 및 Ping/Pong 처리**: `/api/admin/network/health` 엔드포인트 및 `PING_TEST`/`PONG_RESPONSE` 소켓 핸들러 구현 확인 완료.
  - 관련 파일: server/src/index.ts

- **남은 작업(권장)**: 로컬 `admin` 빌드(`npm run build --workspace=admin`) 및 통합 테스트, 사용자 피드백 반영.


# [PART 1] Admin 대시보드 종합 개선 목록 및 아키텍처 설계

## 1. 네비게이션 & 브레드크럼 체계 일치화
* **현재 문제점:** 브레드크럼(`BreadcrumbBar.tsx`)의 명칭(`WebCrawlServer › 관리자 대시보드 › 수집 로그 확인`)과 사이드바 메뉴명(`실시간 수집 로그`), 그리고 실제 탭 상태(`logs`) 간의 이름이 1:1로 매칭되지 않아 혼선을 줌.
* **개선 방식:**
  * 사이드바 메뉴명, 브레드크럼 경로, 탭 상태(`ActiveTab`) 명칭을 **1:1 완전 동기화**.
  * 브레드크럼 구조를 `WebCrawlServer › [카테고리명] › [현재 메뉴명]` 체계로 규격화.
  * **메뉴 카테고리 재구성:**
    1. **수집 노드 관리** (`clients`)
    2. **워커 & DB 매니저** (`workers`)
    3. **원격 제어 콘솔** (`console`)
    4. **네트워크 모니터링** (`network`) - *[신규]*
    5. **실시간 수집 로그** (`logs`)
    6. **유틸리티 도구** (`favicon`)

---

## 2. [신규] 네트워크 모니터링 메뉴 (`NetworkMonitorView`) 구축
* **목적:** 백엔드 서버(포트 9600), 수집 노드(플러그인) 간의 실시간 네트워크 상태 진단, 소켓 Ping/Pong 레이턴시 측정, REST API 헬스체크 및 터미널 스타일 CLI 콘솔 제공.
* **화면 레이아웃 상단 (진단 명령어 버튼 패널):**
  * `[서버 HTTP/WS 헬스체크]`: 포트 9600 바인딩 상태 및 HTTP 응답 속도(ms) 측정.
  * `[전체 노드 소켓 핑(Ping) 테스트]`: 활성화된 모든 웹소켓 노드로 `PING_TEST` 패킷을 송출하고 각 노드별 왕복 지연 시간(RTT) 측정.
  * `[REST API 응답 속도 진단]`: `/api/db/clients`, `/api/db/logs` 엔드포인트 쿼리 응답 시간 검사.
  * `[소켓 트래픽 대역폭 검사]`: 현재 수신된 패킷 량 및 초당 데이터 수송률 계산.
* **화면 레이아웃 하단 (터미널 스타일 콘솔 출력 창):**
  * 다크 터미널 디자인 (`bg-black`, `font-mono`, `text-green-400`).
  * 상단 버튼 클릭 시 실행 결과가 타임스탬프와 함께 표준 출력(stdout) 형태로 한 줄씩 출력되는 스크롤 창.
  * 직접 명령어를 입력하여 진단할 수 있는 CLI 입력 줄 (`> ping node_id`, `> health`, `> clear` 등).
  * `[콘솔 소거]`, `[로그 복사]`, `[자동 스크롤 고정]` 보조 툴바 제공.

---

## 3. 전체적 대시보드 추가 개선 사항
* **실시간 메트릭 모니터링 강화:** 상단 카드에 **네트워크 지연 시간(Latency)** 및 **초당 수신 패킷 수(PPS)** 지표 추가.
* **네트워크 진단 REST API & 소켓 핸들러 추가:** 백엔드(`server/src/index.ts`)에 `/api/admin/network/health` 엔드포인트 및 `PING_TEST` / `PONG_RESPONSE` 소켓 패킷 라우팅 단행.
* **접근성 및 선택성 완벽 보장:** 모든 신규 뷰에서 텍스트 선택이 가능한 `select-text` 기본 적용.

---

# [PART 2] AI 실행 지침 문서 (Prompt Document)


---

```markdown
# [개발 지침서] Admin 네비게이션 체계 개편 및 네트워크 모니터링 콘솔 구축

## 1. 개요 및 작업 목표
본 작업은 WebCrawlServer 관리자 대시보드(`admin/`)의 네비게이션/브레드크럼 명칭 불일치 문제를 해결하고, 백엔드 서버 및 수집 노드 간의 네트워크 진단 및 터미널 CLI 콘솔을 제공하는 **[네트워크 모니터링] 신규 메뉴**를 구축하는 것을 목표로 합니다.

---

## 2. 작업 규칙 및 원칙 (필수 준수)
1. **언어 규칙**: 답변, 코드 주석, UI 라벨은 모두 **한글로만 작성**합니다.
2. **소스 코드 헤더 필수**: 수정되거나 생성되는 모든 소스 코드(.ts, .tsx 등) 최상단 1열에는 상대 파일 경로 주석을 명시합니다. (예: `// admin/src/components/views/NetworkMonitorView.tsx`)
3. **ESM 모듈 규격**: 모든 코드는 ESM(`import`/`export`)을 사용합니다.
4. **텍스트 선택성 보장**: 뷰 컴포넌트 본문 및 터미널 콘솔 영역에 `select-text`를 적용하여 마우스 드래그 선택을 허용합니다.

---

## 3. 세부 개발 단계 및 사양

### 단계 1: 타입 및 탭 상태 확장 (`admin/src/types/index.ts`)
- `ActiveTab` 유니온 타입에 `'network'` 항목 추가:
  `export type ActiveTab = "clients" | "workers" | "console" | "network" | "logs" | "favicon";`
- 네트워크 진단 결과 및 터미널 콘솔 로그 인터페이스 정의:
  ```typescript
  export interface TerminalLogEntry {
    id: string;
    timestamp: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'cmd';
    text: string;
  }
  ```

---

### 단계 2: 네비게이션 & 브레드크럼 동기화 리팩토링
1. **`admin/src/components/layout/Sidebar/Sidebar.tsx`**:
   - 메뉴 구성 및 순서 조정:
     1) 수집 노드 관리 (`clients`)
     2) 워커 & DB 매니저 (`workers`)
     3) 원격 제어 콘솔 (`console`)
     4) 네트워크 모니터링 (`network`) - *[신규 아이콘: `cell_tower` 또는 `lan`]*
     5) 수집 로그 (`logs`)
     6) 파비콘 생성기 (`favicon`)
2. **`admin/src/components/layout/Breadcrumb/BreadcrumbBar.tsx`**:
   - `activeTab`에 따른 브레드크럼 라벨을 1:1 완전 매칭하도록 수정:
     - `clients`: `WebCrawlServer › 관리자 대시보드 › 수집 노드 관리`
     - `workers`: `WebCrawlServer › 관리자 대시보드 › 워커 & DB 매니저`
     - `console`: `WebCrawlServer › 관리자 대시보드 › 원격 제어 콘솔`
     - `network`: `WebCrawlServer › 시스템 진단 › 네트워크 모니터링`
     - `logs`: `WebCrawlServer › 데이터 관리 › 실시간 수집 로그`
     - `favicon`: `WebCrawlServer › 유틸리티 › 파비콘 생성기`

---

### 단계 3: 백엔드 네트워크 진단 기능 연동 (`server/src/index.ts`)
1. **REST API 추가**: `GET /api/admin/network/health`
   - 서버 업타임, 포트 9600 바인딩 상태, DB WAL 모드 가동 상태, 메모리 사용량 반환.
2. **WebSocket 소켓 라우팅 확장**:
   - `PING_TEST` 액션 수신 시, 타깃 클라이언트(또는 전체 노드)로 `PING_TEST`를 릴레이하고 수신 클라이언트가 `PONG_RESPONSE`를 응답하도록 라우팅.

---

### 단계 4: [신규] 네트워크 모니터링 뷰 개발 (`admin/src/components/views/NetworkMonitorView.tsx`)
1. **상단 진단 버튼 패널**:
   - `[서버 HTTP/WS 헬스체크]`: `/api/admin/network/health` 호출 및 지연시간 측정 후 콘솔에 출력.
   - `[전체 노드 핑(Ping) 테스트]`: 웹소켓을 통해 전체 노드로 `PING_TEST` 전송 및 응답 콘솔 출력.
   - `[REST API 응답 속도 검사]`: 주요 REST API 엔드포인트 호출 및 응답속도(ms) 측정 결과 출력.
   - `[소켓 세션 가동률 검사]`: 현재 연결된 활성 노드 수 및 세션 유지 상태 모니터링 출력.
2. **하단 터미널 콘솔 컴포넌트**:
   - 검은색 배경 (`bg-[#0D1117]`), 고정폭 폰트 (`font-mono text-xs`), 초록/파랑/빨강 상태별 컬러링 (`text-emerald-400`, `text-sky-400`, `text-rose-400`).
   - 콘솔 출력창 내부 텍스트 선택 가능 (`select-text`).
   - 수동 프롬프트 입력줄 지원 (`> ping <clientId>`, `> health`, `> clear`, `> help`).
   - 상단 보조 버튼: `[콘솔 소거]`, `[로그 클립보드 복사]`, `[자동 스크롤 고정 토글]`.

---

### 단계 5: 최상위 App 조율 및 빌드 검증 (`admin/src/App.tsx`)
- `App.tsx`에서 `activeTab === 'network'` 처리 구문 및 신규 `NetworkMonitorView` 마운트.
- `npm run build --workspace=admin` 실행 후 오류 없이 정상 컴파일되는지 검증.

---

## 4. 검증 체크리스트
- [ ] 사이드바 메뉴 클릭 시 브레드크럼의 라벨이 사이드바 메뉴명과 1:1로 일치하는가?
- [ ] [네트워크 모니터링] 탭 진입 시 상단 진단 버튼들이 정상 작동하고 하단 터미널 콘솔에 결과가 출력되는가?
- [ ] 터미널 프롬프트에 `help`, `clear`, `health` 등의 명령어 입력 시 콘솔이 즉시 반응하는가?
- [ ] 터미널 콘솔 내의 텍스트가 마우스 드래그로 복사(`select-text`)되는가?
```