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