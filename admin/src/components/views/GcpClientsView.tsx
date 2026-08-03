import { useState } from 'react';
import { Client, CrawlLog } from '../../types/index.js';
import { MetricCardsGroup } from '../metrics/MetricCardsGroup.js';
import { GcpClientsTable } from '../tables/GcpClientsTable.js';
import { DomDataModal } from '../modals/DomDataModal.js';

interface GcpClientsViewProps {
  clients: Client[];
  logs: CrawlLog[];
  logCount: number;
  onSelectTarget: (clientId: string) => void;
  onPurgeClient: (clientId: string) => void;
}

export function GcpClientsView({
  clients,
  logs,
  logCount,
  onSelectTarget,
  onPurgeClient
}: GcpClientsViewProps) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    clientId: string;
    log: CrawlLog | null;
  }>({
    isOpen: false,
    clientId: '',
    log: null
  });

  const handleOpenDomModal = (clientId: string, log: CrawlLog) => {
    setModalState({
      isOpen: true,
      clientId,
      log
    });
  };

  const handleCloseDomModal = () => {
    setModalState({
      isOpen: false,
      clientId: '',
      log: null
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <MetricCardsGroup clientCount={clients.length} logCount={logCount} />
      <GcpClientsTable
        clients={clients}
        logs={logs}
        onSelectTarget={onSelectTarget}
        onPurgeClient={onPurgeClient}
        onOpenDomModal={handleOpenDomModal}
      />
      <DomDataModal
        isOpen={modalState.isOpen}
        clientId={modalState.clientId}
        log={modalState.log}
        onClose={handleCloseDomModal}
      />
    </div>
  );
}
