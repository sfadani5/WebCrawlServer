export interface Client {
  client_id: string;
  client_type: string;
  connected_at: string;
  is_online?: boolean; // 백엔드 실시간 소켓 가용 플래그
}

export interface CrawlLog {
  id: number;
  client_id: string;
  log_message: string;
  timestamp: number;
}

export interface WebSocketMessage<T = unknown> {
  senderId: string;
  targetId?: string | "ALL";
  action: string;
  payload: T;
}

export type ConnectionStatus = "CONNECTED" | "DISCONNECTED";

export type ActiveTab = "clients" | "console" | "logs" | "favicon";
