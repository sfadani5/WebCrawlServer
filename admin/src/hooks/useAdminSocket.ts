import { useState, useEffect, useRef, useCallback, Dispatch, SetStateAction } from 'react';
import { ConnectionStatus, CrawlLog } from '../types/index.js';
import { createAdminSocket, sendSocketMessage } from '../services/socketService.js';

export function useAdminSocket(
  setLogs: Dispatch<SetStateAction<CrawlLog[]>>,
  onConnectCallback?: () => void
) {
  const [wsStatus, setWsStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = createAdminSocket();
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
        // 실시간 수집 패킷 도착 시 상태 배열 최선두에 동적 추가 주입
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

  // 원격 제어 명령 패킷 검증 및 웹소켓 송출 릴레이
  const dispatchCommand = useCallback((targetId: string, action: string, payloadStr: string) => {
    try {
      const parsedPayload = JSON.parse(payloadStr);
      const sent = sendSocketMessage(wsRef.current, targetId, action, parsedPayload);
      if (sent) {
        alert(`명령 송출 완료 [대상: ${targetId}] [지시: ${action}]`);
        return true;
      } else {
        alert('통신 채널이 오프라인 상태입니다.');
        return false;
      }
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
