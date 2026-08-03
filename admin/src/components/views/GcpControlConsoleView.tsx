import { useState } from 'react';

interface GcpControlConsoleViewProps {
  targetId: string;
  setTargetId: (id: string) => void;
  onDispatch: (targetId: string, action: string, payloadStr: string) => void;
}

export function GcpControlConsoleView({
  targetId,
  setTargetId,
  onDispatch
}: GcpControlConsoleViewProps) {
  const [action, setAction] = useState('CRAWL_START');
  const [payload, setPayload] = useState('{"targetUrl": "https://example.com", "depth": 2}');

  return (
    <div className="bg-[#202124] p-5 rounded border border-gray-800 flex flex-col gap-5 max-w-4xl shadow-sm">
      <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-2">
        <h2 className="text-lg font-bold text-green-400">
          Remote Control Console
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wide">
            대상 클라이언트
          </label>
          <input
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            placeholder="client ID 또는 ALL 입력"
            className="w-full p-3 bg-[#111827] border border-slate-700 rounded text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wide">
            지시 액션
          </label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full p-3 bg-[#111827] border border-slate-700 rounded text-sm text-slate-100 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition"
          >
            <option value="CRAWL_START">CRAWL_START - 수집 시작</option>
            <option value="CRAWL_STOP">CRAWL_STOP - 수집 중지</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => onDispatch(targetId, action, payload)}
            className="w-full bg-[#1A73E8] hover:bg-[#185abc] text-white font-semibold text-sm p-3 rounded transition shadow-sm h-[54px]"
          >
            명령 전송
          </button>
        </div>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wide">
          JSON 페이로드
        </label>
        <textarea
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          rows={6}
          placeholder='{"targetUrl": "https://example.com", "depth": 2}'
          className="w-full p-3 bg-[#111827] border border-slate-700 rounded text-sm text-slate-100 font-mono outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition"
        ></textarea>
      </div>
    </div>
  );
}
