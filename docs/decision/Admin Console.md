Google Cloud Console 모듈형 레이아웃 구조를 기반으로 `admin` 패키지의 비즈니스 로직과 UI 컴포넌트를 정밀하게 분리하는 모듈화 아키텍처 및 구현 가이드를 제공합니다.

단일 `App.tsx` 파일에 비즈니스 로직, 통신 바인딩, DOM 레이아웃이 혼재되어 소스코드가 비대해지는 문제를 해결하기 위해, 커스텀 훅(Custom Hooks) 계층으로 통신 및 상태 로직을 완전히 격리하고, 레이아웃 프레임워크(Header, Sidebar, Footer, Layout)와 비즈니스 뷰 컴포넌트(Views)로 분할 설계합니다.

---

### 1. Google Cloud Console 스타일 텍스트 다이어그램 레이아웃 구조

```text
====================================================================================================
[ Header Component ] WebCrawlServer Admin Console                 [Status: CONNECTED] [Manual Refresh]
====================================================================================================
[ Sidebar ] | [ Main Area ]
            | --------------------------------------------------------------------------------------
 (Collapsible| [ View Navigation Tabs ] ( 수집 노드 관리 | 원격 수집 지시 콘솔 | 실시간 로그 뷰어 )
  Panel)    | --------------------------------------------------------------------------------------
            | [ Active Content View ]
 [Menu 1]   | 
  수집 노드 |   +----------------------------------------------------------------------------------+
  관리      |   | Selected View Component (ClientsView / ControlConsoleView / CrawlLogsView)       |
            |   |                                                                                  |
 [Menu 2]   |   |                                                                                  |
  원격 지시 |   +----------------------------------------------------------------------------------+
  콘솔      | 
            | 
 [Menu 3]   | 
  실시간    | 
  로그      | 
            | 
 [< Collapse| 
  Toggle ]  | 
====================================================================================================
[ Footer Component ] WebCrawlServer Node Management Console v1.0.0 | Active Sessions: 3
====================================================================================================
```

---

### 2. admin 워크스페이스 모듈화 디렉토리 구조 명세

단일 파일 집중 현상을 해소하고 유지보수성을 극대화하기 위해 `admin\src\` 하위를 다음과 같이 정밀 분할 구축합니다.

1. `admin\src\types\index.ts`: 전역 타입 및 통신 패킷 인터페이스 정의
2. `admin\src\hooks\useAdminDbApi.ts`: REST API 데이터 인출 및 데이터베이스 삭제 요청 처리 비즈니스 로직 훅
3. `admin\src\hooks\useAdminSocket.ts`: WebSocket 실시간 바인딩, 재연결 및 메시지 송수신 비즈니스 로직 훅
4. `admin\src\components\layout\Header.tsx`: 상단 브랜드 및 시스템 통신 상태 표시 헤더
5. `admin\src\components\layout\Sidebar.tsx`: Google Cloud Console 스타일 접기/펼치기 반응형 좌측 내비게이션
6. `admin\src\components\layout\Footer.tsx`: 하단 시스템 세션 카운터 및 버전 표시 푸터
7. `admin\src\components\layout\MainLayout.tsx`: 헤더, 사이드바, 푸터를 결합하는 프레임워크 컴포넌트
8. `admin\src\components\views\ClientsView.tsx`: 원격 수집기 노드 목록 관리 및 강제 추방 전용 UI
9. `admin\src\components\views\ControlConsoleView.tsx`: 1:1 및 전체 브로드캐스트 원격 지시 전용 UI
10. `admin\src\components\views\CrawlLogsView.tsx`: 실시간 수집 패킷 모니터링 및 DB 로그 정화 UI
11. `admin\src\App.tsx`: 비즈니스 로직 훅과 MainLayout을 결합하는 최상위 엔트리 컴포넌트

---

### 3. 분리 구축 소스코드 구현 명세

#### 3.1 전역 인터페이스 타입 수립 (`admin\src\types\index.ts`)

```typescript
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

export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED';

export type ActiveTab = 'clients' | 'console' | 'logs';
```

---

#### 3.2 REST API 비즈니스 로직 훅 (`admin\src\hooks\useAdminDbApi.ts`)

```typescript
import { useState, useCallback } from 'react';
import { Client, CrawlLog } from '../types/index.js';

export function useAdminDbApi() {
  const [clients, setClients] = useState<Client[]>([]);
  const [logs, setLogs] = useState<CrawlLog[]>([]);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/db/clients');
      const json = await res.json();
      if (json.success) {
        setClients(json.data);
      }
    } catch {
      // API 오프라인 예외 처리
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/db/logs');
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
      }
    } catch {
      // API 오프라인 예외 처리
    }
  }, []);

  const clearAllLogs = useCallback(async () => {
    if (!confirm('데이터베이스 내의 모든 크롤링 수집 로그를 완전 소거하시겠습니까?')) {
      return false;
    }
    try {
      const res = await fetch('/api/db/logs', { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        await fetchLogs();
        return true;
      }
    } catch {
      alert('서버 API가 오프라인 상태입니다.');
    }
    return false;
  }, [fetchLogs]);

  const purgeClientSession = useCallback(async (clientId: string) => {
    if (!confirm(`대상 클라이언트 [${clientId}]를 강제 정화 격리하시겠습니까?`)) {
      return false;
    }
    try {
      const res = await fetch(`/api/db/clients/${clientId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        await fetchClients();
        await fetchLogs();
        return true;
      }
    } catch {
      alert('서버 API가 오프라인 상태입니다.');
    }
    return false;
  }, [fetchClients, fetchLogs]);

  return {
    clients,
    logs,
    setLogs,
    fetchClients,
    fetchLogs,
    clearAllLogs,
    purgeClientSession
  };
}
```

---

#### 3.3 WebSocket 통신 비즈니스 로직 훅 (`admin\src\hooks\useAdminSocket.ts`)

```typescript
import { useState, useEffect, useRef, useCallback, Dispatch, SetStateAction } from 'react';
import { ConnectionStatus, CrawlLog } from '../types/index.js';

export function useAdminSocket(
  setLogs: Dispatch<SetStateAction<CrawlLog[]>>,
  onConnectCallback?: () => void
) {
  const [wsStatus, setWsStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = 'ws://localhost:9600?clientId=admin-main&clientType=admin';
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      setWsStatus('CONNECTED');
      if (onConnectCallback) {
        onConnectCallback();
      }
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.action === 'CRAWL_LOG') {
          setLogs((prev) => [
            {
              id: Date.now(),
              client_id: message.senderId,
              log_message: JSON.stringify(message.payload),
              timestamp: Date.now()
            },
            ...prev
          ]);
        }
      } catch {
        // 더티 패킷 무시
      }
    };

    socket.onclose = () => {
      setWsStatus('DISCONNECTED');
    };

    return () => {
      socket.close();
    };
  }, [setLogs, onConnectCallback]);

  const dispatchCommand = useCallback((targetId: string, action: string, payloadStr: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert('통신 채널이 오프라인 상태입니다.');
      return false;
    }
    try {
      const parsedPayload = JSON.parse(payloadStr);
      const packet = {
        senderId: 'admin-main',
        targetId: targetId,
        action: action,
        payload: parsedPayload
      };
      wsRef.current.send(JSON.stringify(packet));
      alert(`명령 송출 완료 [대상: ${targetId}] [지시: ${action}]`);
      return true;
    } catch {
      alert('페이로드 데이터가 올바른 JSON 포맷이 아닙니다.');
      return false;
    }
  }, []);

  return {
    wsStatus,
    dispatchCommand
  };
}
```

---

#### 3.4 Google Cloud Console 스타일 상단 헤더 (`admin\src\components\layout\Header.tsx`)

```typescript
import { ConnectionStatus } from '../../types/index.js';

interface HeaderProps {
  wsStatus: ConnectionStatus;
  onRefresh: () => void;
}

export function Header({ wsStatus, onRefresh }: HeaderProps) {
  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 px-4 flex items-center justify-between select-none">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 text-white font-black text-xs px-2 py-1 rounded tracking-wider">
          GCP STYLE
        </div>
        <span className="font-bold text-sm text-gray-100 tracking-tight">
          WebCrawlServer Console
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onRefresh}
          className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs px-3 py-1.5 rounded transition border border-gray-700"
        >
          수동 갱신
        </button>
        <div className="flex items-center gap-2 bg-gray-950 px-3 py-1.5 rounded border border-gray-800 text-xs">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              wsStatus === 'CONNECTED' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}
          ></span>
          <span className="text-gray-300">
            {wsStatus === 'CONNECTED' ? '통신 연결됨' : '통신 단절됨'}
          </span>
        </div>
      </div>
    </header>
  );
}
```

---

#### 3.5 Google Cloud Console 스타일 좌측 내비게이션 패널 (`admin\src\components\layout\Sidebar.tsx`)

```typescript
import { ActiveTab } from '../../types/index.js';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  clientCount: number;
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  activeTab,
  onSelectTab,
  clientCount
}: SidebarProps) {
  return (
    <aside
      className={`bg-gray-900 border-r border-gray-800 flex flex-col justify-between transition-all duration-200 select-none ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="flex flex-col py-3">
        <button
          onClick={() => onSelectTab('clients')}
          className={`flex items-center gap-3 px-4 py-3 text-xs font-medium transition ${
            activeTab === 'clients'
              ? 'bg-blue-950 text-blue-400 border-l-4 border-blue-500'
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <span className="text-base">🖥️</span>
          {!isCollapsed && (
            <div className="flex justify-between items-center w-full">
              <span>수집 노드 관리</span>
              <span className="bg-gray-800 text-gray-300 text-[10px] px-1.5 py-0.5 rounded-full">
                {clientCount}
              </span>
            </div>
          )}
        </button>

        <button
          onClick={() => onSelectTab('console')}
          className={`flex items-center gap-3 px-4 py-3 text-xs font-medium transition ${
            activeTab === 'console'
              ? 'bg-blue-950 text-blue-400 border-l-4 border-blue-500'
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <span className="text-base">📡</span>
          {!isCollapsed && <span>원격 지시 콘솔</span>}
        </button>

        <button
          onClick={() => onSelectTab('logs')}
          className={`flex items-center gap-3 px-4 py-3 text-xs font-medium transition ${
            activeTab === 'logs'
              ? 'bg-blue-950 text-blue-400 border-l-4 border-blue-500'
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <span className="text-base">📜</span>
          {!isCollapsed && <span>실시간 수집 로그</span>}
        </button>
      </div>

      <div className="border-t border-gray-800 p-2">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 text-gray-400 hover:bg-gray-800 rounded text-xs transition"
        >
          {isCollapsed ? '▶' : '◀ 패널 접기'}
        </button>
      </div>
    </aside>
  );
}
```

---

#### 3.6 하단 푸터 (`admin\src\components\layout\Footer.tsx`)

```typescript
interface FooterProps {
  clientCount: number;
}

export function Footer({ clientCount }: FooterProps) {
  return (
    <footer className="h-8 bg-gray-950 border-t border-gray-800 px-4 flex items-center justify-between text-[11px] text-gray-500 select-none">
      <div>WebCrawlServer Management Console v1.0.0</div>
      <div>활성 노드 세션: {clientCount} 개 기기</div>
    </footer>
  );
}
```

---

#### 3.7 메인 프레임워크 결속 레이아웃 (`admin\src\components\layout\MainLayout.tsx`)

```typescript
import { ReactNode, useState } from 'react';
import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';
import { Footer } from './Footer.js';
import { ConnectionStatus, ActiveTab } from '../../types/index.js';

interface MainLayoutProps {
  children: ReactNode;
  wsStatus: ConnectionStatus;
  clientCount: number;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onRefresh: () => void;
}

export function MainLayout({
  children,
  wsStatus,
  clientCount,
  activeTab,
  onSelectTab,
  onRefresh
}: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans">
      <Header wsStatus={wsStatus} onRefresh={onRefresh} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          clientCount={clientCount}
        />
        <main className="flex-1 p-6 overflow-y-auto bg-gray-950">
          {children}
        </main>
      </div>
      <Footer clientCount={clientCount} />
    </div>
  );
}
```

---

#### 3.8 수집 노드 관리 뷰 (`admin\src\components\views\ClientsView.tsx`)

```typescript
import { Client } from '../../types/index.js';

interface ClientsViewProps {
  clients: Client[];
  onSelectTarget: (clientId: string) => void;
  onPurgeClient: (clientId: string) => void;
}

export function ClientsView({ clients, onSelectTarget, onPurgeClient }: ClientsViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-blue-400 border-b border-gray-800 pb-2">
        원격 수집 노드 세션 목록
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((c) => (
          <div key={c.client_id} className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex flex-col gap-3">
            <div className="text-xs text-gray-400 font-mono truncate select-text">
              ID: {c.client_id}
            </div>
            <div className="flex justify-between text-xs text-gray-300">
              <span>유형: {c.client_type}</span>
              <span>접속: {new Date(parseInt(c.connected_at) || Date.now()).toLocaleTimeString()}</span>
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <button
                onClick={() => onSelectTarget(c.client_id)}
                className="bg-gray-800 hover:bg-gray-700 text-xs px-2.5 py-1 rounded text-gray-200 transition"
              >
                콘솔 타겟 지정
              </button>
              <button
                onClick={() => onPurgeClient(c.client_id)}
                className="bg-red-900/60 hover:bg-red-800 text-xs px-2.5 py-1 rounded text-red-200 transition border border-red-800"
              >
                강제 추방
              </button>
            </div>
          </div>
        ))}
        {clients.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-20 text-sm">
            현재 활성화된 수집 노드가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
```

---

#### 3.9 원격 지시 콘솔 뷰 (`admin\src\components\views\ControlConsoleView.tsx`)

```typescript
import { useState } from 'react';

interface ControlConsoleViewProps {
  targetId: string;
  setTargetId: (id: string) => void;
  onDispatch: (targetId: string, action: string, payloadStr: string) => void;
}

export function ControlConsoleView({
  targetId,
  setTargetId,
  onDispatch
}: ControlConsoleViewProps) {
  const [action, setAction] = useState('CRAWL_START');
  const [payload, setPayload] = useState('{"targetUrl": "https://example.com", "depth": 2}');

  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 flex flex-col gap-6 max-w-4xl">
      <h2 className="text-lg font-bold text-green-400 border-b border-gray-800 pb-2">
        원격 수집 제어 지시 콘솔
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            타겟 기기 ID (ALL 입력 시 전체 브로드캐스트)
          </label>
          <input
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded p-2 text-sm w-full text-white font-mono"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            지시 작업 식별자 (Action)
          </label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded p-2 text-sm w-full text-white"
          >
            <option value="CRAWL_START">CRAWL_START (수집 개시)</option>
            <option value="CRAWL_STOP">CRAWL_STOP (수집 중단)</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => onDispatch(targetId, action, payload)}
            className="bg-green-600 hover:bg-green-700 font-bold text-sm p-2 w-full rounded transition h-[38px] text-white"
          >
            명령 릴레이 송출
          </button>
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">
          매개변수 페이로드 바디 (JSON 포맷)
        </label>
        <textarea
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          rows={4}
          className="bg-gray-800 border border-gray-700 rounded p-2 text-sm w-full font-mono text-white"
        ></textarea>
      </div>
    </div>
  );
}
```

---

#### 3.10 실시간 수집 로그 뷰어 (`admin\src\components\views\CrawlLogsView.tsx`)

```typescript
import { CrawlLog } from '../../types/index.js';

interface CrawlLogsViewProps {
  logs: CrawlLog[];
  onClearLogs: () => void;
}

export function CrawlLogsView({ logs, onClearLogs }: CrawlLogsViewProps) {
  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-gray-800 pb-2">
        <h2 className="text-lg font-bold text-yellow-400">
          실시간 데이터 수집 패킷 로그
        </h2>
        <button
          onClick={onClearLogs}
          className="bg-red-900/50 hover:bg-red-800 border border-red-700 text-xs px-3 py-1.5 rounded transition text-red-200"
        >
          데이터베이스 로그 일괄 소거
        </button>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[600px] font-mono text-xs select-text">
        {logs.map((log) => (
          <div
            key={log.id}
            className="bg-gray-800 p-3 rounded flex flex-col gap-1 border-l-4 border-yellow-500"
          >
            <div className="flex justify-between text-gray-400 text-[10px]">
              <span className="truncate max-w-[300px]">출처: {log.client_id}</span>
              <span>시각: {new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="text-yellow-100 break-all select-text mt-1">
              {log.log_message}
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-center text-gray-500 py-20">
            수신된 실시간 수집 패킷이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
```

---

#### 3.11 최상위 조율 엔트리 (`admin\src\App.tsx`)

```typescript
import { useState, useCallback } from 'react';
import { useAdminDbApi } from './hooks/useAdminDbApi.js';
import { useAdminSocket } from './hooks/useAdminSocket.js';
import { MainLayout } from './components/layout/MainLayout.js';
import { ClientsView } from './components/views/ClientsView.js';
import { ControlConsoleView } from './components/views/ControlConsoleView.js';
import { CrawlLogsView } from './components/views/CrawlLogsView.js';
import { ActiveTab } from './types/index.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('clients');
  const [targetId, setTargetId] = useState<string>('ALL');

  const {
    clients,
    logs,
    setLogs,
    fetchClients,
    fetchLogs,
    clearAllLogs,
    purgeClientSession
  } = useAdminDbApi();

  const handleConnect = useCallback(() => {
    fetchClients();
    fetchLogs();
  }, [fetchClients, fetchLogs]);

  const { wsStatus, dispatchCommand } = useAdminSocket(setLogs, handleConnect);

  const handleSelectTarget = (clientId: string) => {
    setTargetId(clientId);
    setActiveTab('console');
  };

  return (
    <MainLayout
      wsStatus={wsStatus}
      clientCount={clients.length}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onRefresh={() => {
        fetchClients();
        fetchLogs();
      }}
    >
      {activeTab === 'clients' && (
        <ClientsView
          clients={clients}
          onSelectTarget={handleSelectTarget}
          onPurgeClient={purgeClientSession}
        />
      )}
      {activeTab === 'console' && (
        <ControlConsoleView
          targetId={targetId}
          setTargetId={setTargetId}
          onDispatch={dispatchCommand}
        />
      )}
      {activeTab === 'logs' && (
        <CrawlLogsView logs={logs} onClearLogs={clearAllLogs} />
      )}
    </MainLayout>
  );
}
```

---

### 4. 모듈 분리 후 정적 검구 및 빌드 검증 시퀀스

구조 분리 작업 완료 후 모노레포 규칙에 맞춰 최상위 디렉토리 기점 터미널 상에서 컴파일 및 정적 분석을 수행합니다.

1단계: 최상위 전역 정적 린터 검사 가동 (PowerShell 7.6.1 - 루트 기점)
```powershell
npm run lint
```

2단계: admin 패키지 타겟 컴파일 검증 (PowerShell 7.6.1 - 루트 기점)
```powershell
npx tsc --project admin\tsconfig.json
```

3단계: 백엔드 정적 서빙 폴더(`server\public\`) 대상 번들링 빌드 가동 (PowerShell 7.6.1 - 루트 기점)
```powershell
npm run build --workspace=admin
```

이 구조 분리를 단행하면, 단일 파일의 비대화가 전격 해소되고 Google Cloud Console 과 동일한 고정 헤더, 좌측 토글 패킹 사이드바, 푸터 및 모듈화된 비즈니스 뷰 체계가 확립됩니다.