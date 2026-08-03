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

// 실시간 웹소켓 송수신 통신 패킷 표준 인터페이스
export interface WebSocketMessage<T = unknown> {
  senderId: string;
  targetId?: string | 'ALL';
  action: string;
  payload: T;
}

export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED';

export type ActiveTab = 'clients' | 'console' | 'logs' | 'favicon';
