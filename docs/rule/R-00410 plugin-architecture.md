# R-00410 docs/rule/R-00410 plugin-architecture.md

본 문서는 `WebCrawlServer` 프로젝트의 브라우저 확장 플러그인 모듈화 아키텍처 지침입니다. 단일 소스 파일에 상태 관리, 크롬 API 통신, 비즈니스 로직, UI 컴포넌트가 집중되는 현상을 방지하고 계층화된 모듈 구조를 유지하기 위한 개발 규정을 정의합니다.

---

## 1. 모듈화 아키텍처 개요 및 목적

1.1 **단일 책임 원칙 (SRP)**: 각 파일, 함수, 컴포넌트는 오직 하나의 명확한 책임만 가집니다.  
1.2 **구조적 복잡도 관리**: 200라인 이상의 거대한 단일 소스 파일 생성을 엄격히 금지합니다.  
1.3 **가독성 및 유지보수성**: I/O 통신, 비즈니스 로직, UI 프레젠테이션 계층을 분리하여 코드의 독립적인 테스트와 수정이 가능하도록 합니다.  

---

## 2. 표준 디렉터리 및 계층 구조

플러그인 패키지(`plugins/basic-plugin/src/`) 내부 소스 코드는 아래의 표준 계층 구조를 엄격히 준수해야 합니다.

```
plugins/basic-plugin/src/
├── config/                  # 빌드 타임 상수 및 환경 설정 모듈
│   └── pluginConfig.ts
├── types/                   # 전역 타입 및 인터페이스 관리 계층
│   ├── env.d.ts             # Vite define 전역 상수 타입 선언
│   └── index.ts             # 플러그인 내부 전역 타입 정의
├── services/                # 순수 통신 및 크롬 API I/O 서비스 계층
│   └── chromeService.ts
├── hooks/                   # 비즈니스 로직 및 React 상태 관리 훅 계층
│   └── usePopupState.ts
├── components/              # UI 프레젠테이션 컴포넌트 계층
│   ├── Header.tsx           # 상단 타이틀 툴바 UI
│   ├── TabBar.tsx           # 탭 스위칭 네비게이션 UI
│   ├── Footer.tsx           # 하단 노드 정보 및 포트 표출 UI
│   └── tabs/                # 탭별 독립 뷰 컴포넌트
│       ├── BasicTab.tsx     # 기본 탭 뷰 (상태, URL, DOM 수집 버튼)
│       ├── InfoTab.tsx      # 정보 탭 뷰 (브라우저/CPU/메모리 스펙)
│       └── DebugTab.tsx     # 디버깅 탭 뷰 (JSON 작성 및 서버 송신)
├── background.ts            # 백그라운드 서비스 워커 엔트리
├── content.ts               # DOM 수집 콘텐츠 스크립트 엔트리
└── popup.tsx                # 팝업 UI 최상위 조율 엔트리 (30라인 이하 소형화)
```

---

## 3. 계층별 역할 및 개발 가이드

### 3.1 `config/` (환경 설정 계층)
- **역할**: Vite `define`으로 주입되는 빌드 타임 상수(`__POPUP_WIDTH__`, `__SERVER_PORT__` 등)를 중앙 집계 및 정제
- **규칙**: React 컴포넌트나 비즈니스 로직을 포함하지 않고 오직 순수 설정 객체(`PLUGIN_CONFIG`) 및 URL 생성 헬퍼만 제공

### 3.2 `types/` (타입 시스템 계층)
- **역할**: 전역 인터페이스, 유니온 타입, DTO, 스토리지 구조 정의
- **규칙**: `any` 타입 사용을 금지하며 모든 인터페이스는 명시적으로 선언

### 3.3 `services/` (통신 및 I/O 계층)
- **역할**: `chrome.runtime`, `chrome.tabs`, `navigator` 등 브라우저/크롬 API와의 직접적인 순수 통신 수행
- **규칙**: React 수명 주기(`useState`, `useEffect`)와 완전히 독립적인 순수 비동기 함수 형태로 작성

### 3.4 `hooks/` (비즈니스 로직 계층)
- **역할**: 서비스 계층의 통신 함수를 호출하고, React 상태(`useState`) 및 이벤트 핸들러를 캡슐화
- **규칙**: UI 컴포넌트에 전달할 상태값과 핸들러 콜백만 반환하며, 직접적인 JSX HTML 렌더링 코드를 포함하지 않음

### 3.5 `components/` (UI 프레젠테이션 계층)
- **역할**: 전달받은 props 데이터를 바탕으로 순수 JSX UI만 렌더링
- **규칙**: 크롬 API를 직접 호출하지 않으며 모든 이벤트 처리는 props로 전달받은 콜백을 호출

---

## 4. 소스 파일 제한 및 엔트리 소형화 규정

4.1 **200라인 제약**: 단일 소스 파일이 200라인을 초과할 경우 반드시 기능별 파일로 분할해야 합니다.  
4.2 **`popup.tsx` 엔트리 규정**: 최상위 팝업 엔트리 파일(`popup.tsx`)은 직접적인 UI/비즈니스 로직 구현을 하지 않으며, 오직 `usePopupState` 훅을 호출하고 레이아웃 컴포넌트들을 마운트/조율하는 역할만 담당하여 **30라인 이하의 소형화 상태**를 유지해야 합니다.  

---

## 5. 데이터 흐름 규칙 (Single-Direction Data Flow)

```
[ User Action ] ──► [ Presentational Component ] (BasicTab, DebugTab 등)
                            │
                            ▼ (Trigger Callback)
                    [ Custom Hook ] (usePopupState)
                            │
                            ▼ (Call I/O API)
                    [ Pure Service Module ] (chromeService)
                            │
                            ▼ (chrome.runtime / WebSocket)
                    [ Chrome Background / Server ]
```

- 모든 데이터 흐름은 **상위 계층에서 하위 계층으로의 단방향 흐름**을 유지합니다.
- UI 컴포넌트는 상위 훅으로부터 수신한 props 데이터에만 의존해야 합니다.

---

## 6. 개발 및 리팩토링 체크리스트

- [ ] `popup.tsx` 엔트리 파일이 30라인 이하로 소형화되었는가?
- [ ] 단일 소스 파일 중 200라인을 초과하는 파일이 존재하지 않는가?
- [ ] `chrome.*` API 직접 호출 코드가 `services/` 모듈 내부로 정갈하게 격리되었는가?
- [ ] UI 컴포넌트(`components/`)가 순수 props 기반으로 동작하는가?
- [ ] 모듈 간 임포트 시 ESM 규격 및 TSX/TS 파일 확장자 해소에 결함이 없는가?
