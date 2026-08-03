import { useState, useCallback } from 'react';
import { useAdminDbApi } from './hooks/useAdminDbApi.js';
import { useAdminSocket } from './hooks/useAdminSocket.js';
import { GcpMainLayout } from './components/layout/GcpMainLayout.js';
import { GcpClientsView } from './components/views/GcpClientsView.js';
import { GcpControlConsoleView } from './components/views/GcpControlConsoleView.js';
import { GcpCrawlLogsView } from './components/views/GcpCrawlLogsView.js';
import { FaviconGeneratorView } from './components/views/FaviconGeneratorView.js';
import { ActiveTab } from './types/index.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('clients');
  const [targetId, setTargetId] = useState<string>('ALL');

  const {
    clients,
    logs,
    setLogs,
    loadClients,
    loadLogs,
    executeClearLogs,
    executePurgeClient
  } = useAdminDbApi();

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
      onRefresh={() => {
        loadClients();
        loadLogs();
      }}
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
      {activeTab === 'favicon' && (
        <FaviconGeneratorView />
      )}
    </GcpMainLayout>
  );
}