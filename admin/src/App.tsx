import { useState, useEffect, useRef } from 'react';

interface Client {
  client_id: string;
  client_type: string;
  connected_at: string;
}

interface CrawlLog {
  id: number;
  client_id: string;
  log_message: string;
  timestamp: number;
}

export default function App() {
  const [wsStatus, setWsStatus] = useState<'CONNECTED' | 'DISCONNECTED'>('DISCONNECTED');
  const [clients, setClients] = useState<Client[]>([]);
  const [logs, setLogs] = useState<CrawlLog[]>([]);
  const [targetId, setTargetId] = useState<string>('ALL');
  const [action, setAction] = useState<string>('CRAWL_START');
  const [payload, setPayload] = useState<string>('{"targetUrl": "https://example.com", "depth": 2}');

  const wsRef = useRef<WebSocket | null>(null);

  // 데이터베이스 REST API 중계 서버 기기와 수집 로그 호출
  const fetchClients = async () => {
    try {
      const res = await fetch('/api/db/clients');
      const json = await res.json();
      if (json.success) setClients(json.data);
    } catch {
      // API 오프라인 예외 스킵
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/db/logs');
      const json = await res.json();
      if (json.success) setLogs(json.data);
    } catch {
      // API 오프라인 예외 스킵
    }
  };

  // REST API: 로그 일괄 소거 단행
  const clearLogsOnDb = async () => {
    if (!confirm('데이터베이스 내의 모든 크롤링 수집 로그를 완전 소거하시겠습니까?')) return;
    try {
      const res = await fetch('/api/db/logs', { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        fetchLogs();
      }
    } catch {
      alert('서버 API가 오프라인 상태입니다.');
    }
  };

  // REST API: 특정 기기 세션 강제 추방 및 연쇄(Cascade) 삭제 단행
  const purgeClientSession = async (clientId: string) => {
    if (!confirm(`대상 클라이언트 [${clientId}]를 강제 정화 격리하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/db/clients/${clientId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        fetchClients();
        fetchLogs();
      }
    } catch {
      alert('서버 API가 오프라인 상태입니다.');
    }
  };

  // 웹소켓 실시간 바인딩 가동
  useEffect(() => {
    const wsUrl = `ws://localhost:9600?clientId=admin-main&clientType=admin`;
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      setWsStatus('CONNECTED');
      fetchClients();
      fetchLogs();
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        // 수집가 기기가 CRAWL_LOG 패킷을 중계 송출 시, 로그 상태 배열 선두에 고속 실시간 주입
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
  }, []);

  // 웹소켓을 통한 1:1 및 ALL 타겟 조준 명령 전송 트래픽 송출
  const dispatchControlCommand = () => {
    if (!wsRef.current || wsStatus === 'DISCONNECTED') {
      alert('통신 채널이 오프라인 상태입니다.');
      return;
    }
    try {
      const parsedPayload = JSON.parse(payload);
      const packet = {
        senderId: 'admin-main',
        targetId: targetId,
        action: action,
        payload: parsedPayload
      };
      wsRef.current.send(JSON.stringify(packet));
      alert(`명령 송출 완료 [대상: ${targetId}] [지시: ${action}]`);
    } catch {
      alert('페이로드 데이터가 올바른 JSON 포맷이 아닙니다.');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-950 flex flex-col gap-6">
      {/* 상단 컨트롤 바 */}
      <div className="flex justify-between items-center bg-gray-900 p-4 rounded-lg shadow-md">
        <div>
          <h1 className="text-xl font-bold tracking-tight">통합 컨트롤 대시보드</h1>
          <p className="text-xs text-gray-400">WebCrawlServer 분산 수집 클라이언트 실시간 통제 시스템</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { fetchClients(); fetchLogs(); }} className="bg-blue-600 hover:bg-blue-700 text-sm px-3 py-1.5 rounded transition">수동 갱신</button>
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded text-sm">
            <span className={`h-3 w-3 rounded-full ${wsStatus === 'CONNECTED' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span>{wsStatus === 'CONNECTED' ? '연결 통제 상태' : '통신 차단 상태'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측 패널: 클라이언트 기기 목록 관리 */}
        <div className="bg-gray-900 p-4 rounded-lg shadow-md flex flex-col gap-4">
          <h2 className="text-lg font-bold border-b border-gray-800 pb-2 text-blue-400">원격 수집 기기 세션 관리</h2>
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px]">
            {clients.map((c) => (
              <div key={c.client_id} className="bg-gray-900 p-4 rounded-lg shadow-md flex flex-col gap-4">
                <div className="text-xs text-gray-400 font-mono select-text truncate">기기ID: {c.client_id}</div>
                <div className="flex justify-between text-xs">
                  <span>유형: {c.client_type}</span>
                  <span>접속: {new Date(parseInt(c.connected_at) || Date.now()).toLocaleTimeString()}</span>
                </div>
                <div className="flex gap-2 justify-end mt-1">
                  <button onClick={() => setTargetId(c.client_id)} className="bg-gray-700 hover:bg-gray-600 text-xs px-2 py-1 rounded transition">타겟 지정</button>
                  <button onClick={() => purgeClientSession(c.client_id)} className="bg-red-600 hover:bg-red-700 text-xs px-2 py-1 rounded transition">강제 추방</button>
                </div>
              </div>
            ))}
            {clients.length === 0 && <p className="text-center text-gray-500 text-sm py-10">활성화된 수집 장치가 없습니다.</p>}
          </div>
        </div>

        {/* 우측 패널: 명령 타겟 송출 및 실시간 수집 로그 뷰어 */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* 명령 제어 송출기 */}
          <div className="bg-gray-900 p-4 rounded-lg shadow-md flex flex-col gap-4">
            <h3 className="text-lg font-bold text-green-400 border-b border-gray-800 pb-2">원격 수집 지시 콘솔</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">타겟 기기 ID (ALL 기입 시 전체 수집기 릴레이)</label>
                <input value={targetId} onChange={(e) => setTargetId(e.target.value)} className="bg-gray-800 border border-gray-700 rounded p-2 text-sm w-full text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">지시 작업 식별 단어 (Action)</label>
                <select value={action} onChange={(e) => setAction(e.target.value)} className="bg-gray-800 border border-gray-700 rounded p-2 text-sm w-full text-white">
                  <option value="CRAWL_START">CRAWL_START (수집 개시)</option>
                  <option value="CRAWL_STOP">CRAWL_STOP (수집 중단)</option>
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={dispatchControlCommand} className="bg-green-600 hover:bg-green-700 font-bold text-sm p-2 w-full rounded transition h-[38px]">제어 명령 릴레이 송출</button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">명령 매개변수 바디 페이로드 (JSON 규격 보존)</label>
              <textarea value={payload} onChange={(e) => setPayload(e.target.value)} rows={2} className="bg-gray-800 border border-gray-700 rounded p-2 text-sm w-full font-mono text-white"></textarea>
            </div>
          </div>

          {/* 실시간 뷰어 */}
          <div className="bg-gray-900 p-4 rounded-lg shadow-md flex flex-col gap-4 flex-1">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <h3 className="text-lg font-bold text-yellow-400">실시간 데이터 수집 수신 로그</h3>
              <button onClick={clearLogsOnDb} className="bg-red-900/50 hover:bg-red-800 border border-red-700 text-xs px-2.5 py-1 rounded transition text-red-200">데이터베이스 로그 일괄 비우기</button>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] font-mono text-xs select-text">
              {logs.map((log) => (
                <div key={log.id} className="bg-gray-800 p-2 rounded flex flex-col gap-1 border-l-4 border-yellow-500">
                  <div className="flex justify-between text-gray-400 text-[10px]">
                    <span className="truncate max-w-[150px]">출처: {log.client_id}</span>
                    <span>시각: {new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-yellow-100 break-all select-text">{log.log_message}</div>
                </div>
              ))}
              {logs.length === 0 && <p className="text-center text-gray-500 py-10">실시간 수집 패킷 대기 중...</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}