# 작업 요청서 (docs/ask.md)


### 1. 플러그인 디버그 콘솔: JSON 트리 뷰어 & 자주 쓰는 테스트 템플릿
- **JSON 접기/펴기 뷰어 (Collapsible JSON)**: 수신된 무거운 DOM 데이터나 복잡한 패킷 구조를 한눈에 볼 수 있도록 접고 펼칠 수 있는 구문 강조(Syntax Highlighting) 뷰어 적용.
- **테스트 패킷 템플릿 저장소 (Pre-sets)**: 디버깅 탭에서 매번 JSON을 직접 타자 치지 않고 `[핑 테스트]`, `[DOM 수집 요청]`, `[상태 알림]` 등 자주 쓰는 예시 템플릿을 원클릭으로 불러오기.

### 2. 어드민 노드 세션: 1:1 대화형 터미널 쉘 (Interactive Session Shell)
- 특정 `clientId` 수집 노드를 선택했을 때, 어드민과 해당 노드가 주고받은 명령/응답만을 1:1 대화형 타임라인 콘솔 스타일로 관찰하고 바로 명령을 송출하는 **[노드 전용 1:1 쉘]** 모드 제공.

### 3. 노드 세션 단절/재연결 타임라인 이력 (Session Event History)
- 특정 수집 노드가 언제 접속했고, 언제 사이드바를 열었으며, 네트워크 변동으로 언제 재연결되었는지를 한눈에 확인하는 **세션 생명주기 타임라인 이력** 보관.

### 4. 백엔드 세션 보호: 패킷 폭주 차단 가드 (Rate Limiting / Throttling)
- 플러그인 내부 루프 오류 등으로 인해 특정 노드가 초당 수십~수백 개의 패킷을 폭주 전송할 경우 백엔드 서버 다운을 방지하기 위한 **노드별 초당 패킷 제한(Throttling) 및 세션 격리 보호**.

### 5. 네트워크 종합 진단 리포트 익스포트 (Diagnostics Report)
- 어드민 네트워크 모니터링에서 현재 서버 OS 자원, TCP 9600 소켓 상태, 핑 테스트 결과, 수집 노드 현황을 한꺼번에 종합 진단서 형태(JSON/TEXT)로 일괄 다운로드/복사.

---

## 📋 최종 통합 개발 실행 계획 (TODO 목록)

### 📌 [Phase 1] 브라우저 플러그인 디버깅 탭 및 수신 콘솔 고도화 (`plugins/basic-plugin/`)
- [ ] **1.1 수신 패킷 수집 및 이력 상태 확장 (`usePopupState.ts`)**
  - `offscreen.ts`에서 중계되는 `SOCKET_PACKET_RECEIVED` 이벤트를 감지하여 수신 패킷을 `receivedLogs` 배열 상태에 적재.
- [ ] **1.2 [디버깅] 탭 하단 터미널 콘솔 UI 구현 (`DebugTab.tsx` & `popup.css`)**
  - 상단: 메시지 송출 폼 / 하단: 실시간 수신 데이터 터미널 콘솔창 배치.
  - 수신 패킷(타임스탬프, Action, SenderId, Payload JSON) 가독성 높인 다크 모드 터미널 렌더링.
  - 콘솔 로그 소거(Clear), 클립보드 복사, 자동 스크롤(ON/OFF) 기능.
- [ ] **1.3 (추가) 자주 쓰는 테스트 패킷 템플릿 드롭다운 제공**
  - `[핑 테스트]`, `[DOM 수집 요청]`, `[상태 알림]` 등 원클릭 템플릿 로딩 기능.

---

### 📌 [Phase 2] 백엔드 OS/PowerShell, 세션별 1:1 송수신 & 소켓 보호 API (`server/`)
- [ ] **2.1 포트 9600 TCP 소켓 진단 API (`GET /api/admin/network/tcp-9600`)**
  - PowerShell의 `Get-NetTCPConnection -LocalPort 9600` 비동기 실행 및 포트 9600의 Listen/Established 상태, Remote IP:Port, PID, 프로세스명(`node`) 반환.
- [ ] **2.2 Node 소켓 & Listen 포트 진단 API (`GET /api/admin/network/os-sockets`)**
  - 가동 중인 모든 `node.exe` 프로세스가 점유한 소켓 목록과 시스템 내 모든 Listen 대기 포트 목록 반환.
- [ ] **2.3 호스트 컴퓨터 자원 진단 API (`GET /api/admin/system/status`)**
  - CPU 코어/로드, 전체/여유 메모리, 백엔드 힙 메모리, 네트워크 카드(IP/MAC), 디스크 용량 반환.
- [ ] **2.4 (추가) 백엔드 세션 보호 패킷 Throttling 가드 구현**
  - 노드별 초당 수신 패킷 수를 감지하여 무한 루프 폭주 패킷 차단.

---

### 📌 [Phase 3] 어드민 [네트워크 모니터링] 4대 서브 탭 정돈 & 세션 1:1 통신 구현 (`admin/`)
- [ ] **3.1 서브 네비게이션 탭 바 구현 (`NetworkMonitorView.tsx`)**
  - `OS/포트 소켓`, `노드 세션 검증`, `호스트 OS 자원`, `CLI 터미널 콘솔` 4개 서브 탭 스위칭 체계 구축.
- [ ] **3.2 [서브 탭 1] OS/포트 소켓 진단 뷰 구현**
  - 포트 9600 TCP 소켓 현황, Node 프로세스 소켓, Listen 포트 목록, 2초 간격 실시간 자동 모니터링 토글.
- [ ] **3.3 [서브 탭 2] 노드 세션 검증 및 1:1 대화형 송수신 뷰 구현**
  - 현재 연결된 플러그인 세션 목록 표출 및 **개별 세션 타깃 선택기** 구현.
  - 선택된 `clientId` 세션 노드로 **1:1 전용 메시지 송출 및 1:1 대화형 응답 콘솔** 구축.
  - 전체 노드 Ping/Pong RTT 지연시간 & 유실률 전수 검증 및 연쇄 부하 테스트.
- [ ] **3.4 [서브 탭 3] 호스트 OS 시스템 자원 뷰 구현**
  - CPU/메모리/프로세스 힙 사용률 게이지, 네트워크 카드 IP/MAC 정보, 디스크 용량 표시.
- [ ] **3.5 [서브 탭 4] CLI 터미널 콘솔 뷰 및 진단 리포트 익스포트 구현**
  - 신규 명령어(`tcp9600`, `node-sockets`, `listen-ports`, `monitor`, `sys`, `ping`, `send`, `help`) 파서 연동.
  - `send <clientId> <action> <json>` 1:1 개별 메시지 송출 명령어 지원.
  - 명령어 퀵 실행 칩(Chip) 버튼, 로그 소거, 자동 스크롤.
  - **(추가) 전체 진단 결과 리포트(JSON/Text) 일괄 내보내기 버튼**.

---

### 📌 [Phase 4] 시스템 검증 및 스모크 테스트 (`tools/tests/`)
- [ ] **4.1 다중 가상 노드 소켓 세션별 개별 송수신 스모크 테스트 (`ws-smoke.mjs`)**
  - 가상 플러그인 세션 접속 후 1:1 개별 메시지 송수신 및 디버그 콘솔 수신 정상 검증.
- [ ] **4.2 TypeScript 컴파일 및 `npm run lint` 정적 분석 검증**


# [작업 요청] 네트워크 모니터링 서브 탭 정돈 및 플러그인 디버그 콘솔 / 세션별 1:1 송수신 구현

> **AI 실행 원칙 (엄격 준수)**:
> 1. 한 번에 모든 코드를 작성하지 말고, 아래 **[할 일 순서]의 Step 1부터 순차적으로 하나씩 단행**하십시오.
> 2. 각 Step 구현이 끝날 때마다 컴파일/린트 검사를 수행하고, 변경 사항과 검증 결과를 한글로 명확히 보고하십시오.
> 3. 각 단계 완료 후 `docs/todo.md`와 `docs/todo.history.md`에 진행 이력을 기록하고, 다음 Step으로 진행하십시오.
> 4. 소스 코드 수정 시 모든 파일의 최상단 첫 번째 라인에 상대 경로 주석(`// plugins/basic-plugin/src/...`)을 필수로 기입하고 한글 주석 표준을 준수하십시오.

---

## 1. 개요 및 목적

관리자 대시보드의 **[네트워크 모니터링]** 화면을 4개의 서브 탭으로 정돈하고, 백엔드 OS/PowerShell 레벨의 TCP 9600 소켓 및 컴퓨터 자원 진단 기능, 다중 브라우저 세션별 1:1 개별 송수신 기능을 구축합니다. 또한 브라우저 플러그인 **[디버깅]** 탭 하단에도 실시간 수신 데이터를 관찰할 수 있는 터미널 콘솔창을 추가합니다.

---

## 2. 단계별 할 일 순서 (Step-by-Step Task List)

### 📌 Step 1: 브라우저 플러그인 디버깅 탭 수신 데이터 터미널 콘솔 구현
- **목적**: 플러그인 사용자도 서버나 타 노드가 보낸 수신 패킷을 디버깅 탭에서 실시간으로 확인할 수 있도록 터미널 콘솔 추가.
- **수정 대상 파일**:
  - `plugins/basic-plugin/src/hooks/usePopupState.ts`
  - `plugins/basic-plugin/src/components/tabs/DebugTab.tsx`
  - `plugins/basic-plugin/src/popup.css`
- **세부 작업**:
  1. `usePopupState.ts`에 `offscreen.ts`로부터 중계되는 `SOCKET_PACKET_RECEIVED` 패킷 수신 이력 상태(`receivedLogs`) 추가.
  2. `DebugTab.tsx` 상단에 기존 커스텀 JSON 송출 폼 유지, **하단에 [실시간 수신 데이터 터미널 콘솔] 영역 추가**.
  3. 디버그 터미널에 타임스탬프, 액션(`action`), 송신자(`senderId`), 페이로드 바디(`payload`)를 다크 모드 스타일로 렌더링.
  4. 콘솔 로그 소거(Clear), 클립보드 복사, 자동 스크롤(ON/OFF) 버튼 구현.
  5. 자주 쓰는 테스트 패킷 템플릿(`핑 테스트`, `DOM 수집 요청`, `상태 알림`) 원클릭 로딩 드롭다운 추가.
- **검증**: `npm run plugin:basic:dev` 빌드가 에러 없이 완료되는지 확인.

---

### 📌 Step 2: 백엔드 OS/PowerShell 소켓 진단 & 시스템 자원 API 구축
- **목적**: Windows OS 레벨의 포트 9600 TCP 소켓 상태, Node 프로세스 소켓, Listen 포트, 컴퓨터 자원 진단 API 제공.
- **수정 대상 파일**:
  - `server/src/index.ts`
- **세부 작업**:
  1. `GET /api/admin/network/tcp-9600` API 작성: PowerShell `Get-NetTCPConnection -LocalPort 9600` 비동기 실행 및 State(`Listen`/`Established`), Remote IP:Port, PID, ProcessName(`node`) 반환.
  2. `GET /api/admin/network/os-sockets` API 작성: 모든 `node.exe` 프로세스가 점유한 소켓 목록 및 시스템 Listen 포트 목록 반환.
  3. `GET /api/admin/system/status` API 작성: OS CPU 코어/로드, 전체/여유 메모리, 백엔드 힙 메모리, 네트워크 카드(IP/MAC), 디스크 여유 공간 반환.
  4. 노드별 초당 수신 패킷 수를 감지하여 무한 루프 폭주를 차단하는 백엔드 Throttling 가드 구문 추가.
- **검증**: `npm run server:start` 후 해당 REST API들이 정상 JSON 응답을 반환하는지 검증.

---

### 📌 Step 3: 어드민 [네트워크 모니터링] 4대 서브 탭 정돈 & 세션별 1:1 송수신 UI 구현
- **목적**: 네트워크 모니터링 화면을 4개 서브 탭으로 정리하고, 선택 노드와 1:1 개별 송수신 기능을 제공.
- **수정 대상 파일**:
  - `admin/src/types/index.ts`
  - `admin/src/services/apiService.ts`
  - `admin/src/components/views/NetworkMonitorView.tsx`
- **세부 작업**:
  1. `NetworkMonitorView.tsx` 상단에 **4개 서브 탭 네비게이션 바** (`[1] OS/포트 소켓`, `[2] 노드 세션 검증`, `[3] 호스트 OS 자원`, `[4] CLI 터미널`) 구현.
  2. **[서브 탭 1] OS/포트 소켓 뷰**: 포트 9600 TCP 소켓 현황, Node 소켓, Listen 포트 테이블 및 2초 간격 실시간 모니터링 토글 구현.
  3. **[서브 탭 2] 노드 세션 검증 뷰**: 다중 접속 세션 리스트 표출, **개별 세션 타깃 선택기** 구현, 선택 노드와 **1:1 전용 메시지 송출 및 1:1 대화형 응답 콘솔** 구축, 전체 노드 Ping/Pong RTT 검증기 구현.
  4. **[서브 탭 3] 호스트 OS 자원 뷰**: CPU/메모리/프로세스 힙 사용률 게이지, 네트워크 카드 IP/MAC, 디스크 용량 표시.

---

### 📌 Step 4: CLI 터미널 콘솔 명령어 확장, 퀵 버튼 & 리포트 익스포트 구현
- **목적**: 하단 CLI 터미널 콘솔에서 파워쉘/OS 진단 명령어를 확장하고 퀵 버튼과 리포트 출력 제공.
- **수정 대상 파일**:
  - `admin/src/components/views/NetworkMonitorView.tsx`
- **세부 작업**:
  1. CLI 명령어 파서 확장: `help`, `tcp9600`, `node-sockets`, `listen-ports`, `monitor [sec]`, `sys`, `ping [all|<id>]`, `send <id> <action> <json>`, `clear`, `export`.
  2. 프롬프트 입력창 위에 `[tcp9600]`, `[node-sockets]`, `[listen-ports]`, `[monitor 2]`, `[sys]`, `[ping all]` 퀵 실행 칩(Chip) 버튼 배치.
  3. 전체 진단 결과(OS 자원, 소켓 현황, Ping 결과)를 JSON/Text 리포트 파일로 내보내는 **[진단 리포트 익스포트]** 버튼 구현.

