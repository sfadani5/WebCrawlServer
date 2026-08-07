// plugins/basic-plugin/src/components/tabs/DebugTab.tsx

interface DebugTabProps {
  debugMessage: string;
  debugStatus: string;
  onChangeDebugMessage: (val: string) => void;
  onSendDebugMessage: () => void;
}

/**
 * 디버그 탭 UI 컴포넌트. 서버에 디버그 메시지를 전송하고 결과를 표시합니다.
 * @param debugMessage - 서버에 보낼 JSON 문자열
 * @param debugStatus - 전송 결과 상태 메시지
 * @param onChangeDebugMessage - 입력 변경 콜백
 * @param onSendDebugMessage - 전송 실행 콜백
 */
export function DebugTab({
  debugMessage,
  debugStatus,
  onChangeDebugMessage,
  onSendDebugMessage
}: DebugTabProps) {
  return (
    <div className="tab-content">
      <div className="debug-card">
        <span className="debug-label">서버에 보낼 메시지 (JSON 포맷)</span>
        <textarea
          value={debugMessage}
          onChange={(e) => onChangeDebugMessage(e.target.value)}
          rows={6}
          className="debug-textarea font-mono"
          placeholder="서버로 전달할 JSON 객체를 입력하세요"
        />
        <button onClick={onSendDebugMessage} className="send-button mt-1">
          <span className="material-symbols-outlined text-base">send</span>
          <span>보내기</span>
        </button>
        {debugStatus && (
          <div className="text-[11px] text-sky-300 bg-[#0d131f] p-2 rounded border border-slate-700 break-all">
            {debugStatus}
          </div>
        )}
      </div>
    </div>
  );
}