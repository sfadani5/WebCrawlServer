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
