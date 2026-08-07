// admin/src/App.tsx

import { useState, useCallback, useEffect } from 'react';
import { useAdminDbApi } from './hooks/useAdminDbApi.js';
import { useAdminSocket } from './hooks/useAdminSocket.js';
import { GcpMainLayout } from './components/layout/GcpMainLayout.js';
import { GcpClientsView } from './components/views/GcpClientsView.js';
import { GcpControlConsoleView } from './components/views/GcpControlConsoleView.js';
import { GcpCrawlLogsView } from './components/views/GcpCrawlLogsView.js';
import { WorkerManagerView } from './components/views/WorkerManagerView.js';
import { FaviconGeneratorView } from './components/views/FaviconGeneratorView.js';
import { NetworkMonitorView } from './components/views/NetworkMonitorView.js';
import { ActiveTab } from './types/index.js';

/**
 * 관리자 대시보드 최상위 조율 엔트리 컴포넌트입니다.
 * 탭 라우팅, 데이터 로딩, 웹소켓 연결, 워커 관리 등 전체 상태를 통합 조율합니다.
 */
export default function App() {
  /** 현재 활성화된 메인 탭 상태 */
  const [activeTab, setActiveTab] = useState<ActiveTab>('clients');
  /** 원격 지시 콘솔의 타깃 노드 ID 상태 */
  const [targetId, setTargetId] = useState<string>('ALL');

  // REST API 통신 및 데이터 상태 관리 훅
  const {
    clients,
    workers,
    logs,
    setLogs,
    loadClients,
    loadWorkers,
    loadLogs,
    executeClearLogs,
    executePurgeClient,
    executePurgeOfflineClients,
    executeUpdateClientConfig,
    executeCreateWorker
  } = useAdminDbApi();

  // 최초 진입 시 전체 데이터 일괄 로딩
  useEffect(() => {
    loadClients();
    loadWorkers();
    loadLogs();
  }, [loadClients, loadWorkers, loadLogs]);

  /**
   * 웹소켓 재연결 시 데이터 일괄 갱신 콜백
   */
  const handleConnect = useCallback(() => {
    loadClients();
    loadWorkers();
    loadLogs();
  }, [loadClients, loadWorkers, loadLogs]);

  // 관리자 웹소켓 연결 훅 (실시간 로그 수신 및 커맨드 전송)
  const { wsStatus, dispatchCommand } = useAdminSocket(setLogs, handleConnect);

  /**
   * 수집 노드를 원격 지시 콘솔의 타깃으로 선택하고 콘솔 탭으로 이동합니다.
   *
   * @param clientId - 선택할 노드 UUID
   */
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
      onRefresh={() => {
        loadClients();
        loadWorkers();
        loadLogs();
      }}
      onClearLogs={executeClearLogs}
    >
      {/* [탭 1] 수집 노드 관리 */}
      {activeTab === 'clients' && (
        <GcpClientsView
          clients={clients}
          workers={workers}
          logs={logs}
          logCount={logs.length}
          onSelectTarget={handleSelectTarget}
          onPurgeClient={executePurgeClient}
          onPurgeOfflineClients={executePurgeOfflineClients}
          onSaveNodeConfig={executeUpdateClientConfig}
        />
      )}

      {/* [탭 2] 워커 & DB 매니저 */}
      {activeTab === 'workers' && (
        <WorkerManagerView
          workers={workers}
          onCreateWorker={executeCreateWorker}
        />
      )}

      {/* [탭 3] 원격 지시 콘솔 */}
      {activeTab === 'console' && (
        <GcpControlConsoleView
          targetId={targetId}
          setTargetId={setTargetId}
          onDispatch={dispatchCommand}
        />
      )}

      {/* [탭 4] 네트워크 모니터링 */}
      {activeTab === 'network' && (
        <NetworkMonitorView onDispatch={dispatchCommand} clientCount={clients.length} />
      )}

      {/* [탭 5] 수집 로그 */}
      {activeTab === 'logs' && (
        <GcpCrawlLogsView logs={logs} onClearLogs={executeClearLogs} />
      )}

      {/* [탭 6] 파비콘 생성기 */}
      {activeTab === 'favicon' && (
        <FaviconGeneratorView />
      )}
    </GcpMainLayout>
  );
}
