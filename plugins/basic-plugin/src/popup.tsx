import { useState, useEffect } from 'react';

export default function Popup() {
  const [localId, setLocalId] = useState<string>('조회 대기 중...');

  useEffect(() => {
    chrome.storage.local.get(['clientId'], (result) => {
      if (result && result.clientId) {
        setLocalId(result.clientId);
      }
    });
  }, []);

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
      <div className="text-[9px] text-gray-500 text-center select-none">본 장치는 백그라운드 소켓 영속 감시 모드로 동작합니다.</div>
    </div>
  );
}