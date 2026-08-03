import { useState, useEffect } from 'react';

export default function Popup() {
  const [localId, setLocalId] = useState<string>('조회 대기 중...');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  useEffect(() => {
    chrome.storage.local.get(['clientId'], (result) => {
      if (result && result.clientId) {
        setLocalId(result.clientId);
      }
    });
  }, []);

  // 현재 활성 탭의 전체 DOM을 수집하여 관리자 서버로 전송
  const handleSendFullDom = () => {
    setIsSending(true);
    setStatusMessage('페이지 DOM 수집 중...');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.id) {
        setStatusMessage('활성화된 탭을 찾을 수 없습니다.');
        setIsSending(false);
        return;
      }

      chrome.tabs.sendMessage(activeTab.id, { command: 'COLLECT_FULL_DOM' }, (response) => {
        if (chrome.runtime.lastError) {
          setStatusMessage('페이지 스크립트 연결 실패 (페이지 새로고침 필요)');
          setIsSending(false);
          return;
        }

        if (response && response.success) {
          setStatusMessage('전체 DOM 전송 완료!');
        } else {
          setStatusMessage('DOM 전송 처리 완료');
        }
        setIsSending(false);
      });
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="border-b border-gray-800 pb-1.5">
        <h1 className="text-sm font-bold text-blue-400">분산 수집 노드 제어기</h1>
        <p className="text-[10px] text-gray-400">WebCrawlServer 연동 플러그인</p>
      </div>

      <div className="bg-gray-800 p-2.5 rounded flex flex-col gap-1 text-[10px]">
        <div className="text-gray-400 font-bold">배정된 고유 기기 ID (UUID)</div>
        <div className="font-mono text-blue-200 select-text break-all">{localId}</div>
      </div>

      {/* 전체 DOM 수집 전송 버튼 */}
      <button
        onClick={handleSendFullDom}
        disabled={isSending}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-bold text-xs py-2 rounded transition flex items-center justify-center gap-1 cursor-pointer"
      >
        <span>전체 DOM 데이터 전송</span>
      </button>

      {statusMessage && (
        <div className="text-[10px] text-center text-yellow-300 bg-gray-800 p-1.5 rounded border border-gray-700">
          {statusMessage}
        </div>
      )}

      <div className="text-[9px] text-gray-500 text-center select-none">
        본 장치는 백그라운드 소켓 영속 감시 모드로 동작합니다.
      </div>
    </div>
  );
}