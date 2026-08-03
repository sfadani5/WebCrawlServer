import { WebSocketMessage } from '../types/index.js';

/**
 * 포트 9600번 관로로 바인딩되는 어드민 전용 웹소켓 클라이언트 인스턴스를 생성 및 반환합니다.
 */
export function createAdminSocket(): WebSocket {
  const wsUrl = 'ws://localhost:9600?clientId=admin-main&clientType=admin';
  return new WebSocket(wsUrl);
}

/**
 * 지정된 타겟 ID, 지시 액션, 바디 페이로드를 규격화된 패킷 텍스트로 인코딩하여 웹소켓 채널로 송출합니다.
 */
export function sendSocketMessage(
  socket: WebSocket | null,
  targetId: string,
  action: string,
  payload: unknown
): boolean {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return false;
  }
  const packet: WebSocketMessage = {
    senderId: 'admin-main',
    targetId,
    action,
    payload
  };
  socket.send(JSON.stringify(packet));
  return true;
}
