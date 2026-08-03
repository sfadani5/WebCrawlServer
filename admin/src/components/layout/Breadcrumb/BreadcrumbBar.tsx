import { ActiveTab } from '../../../types/index.js';

interface BreadcrumbBarProps {
  activeTab: ActiveTab;
  onRefresh: () => void;
  onClearLogs: () => void;
}

export function BreadcrumbBar({ activeTab, onRefresh, onClearLogs }: BreadcrumbBarProps) {
  const getTabLabel = () => {
    if (activeTab === 'clients') return '수집 노드 관리';
    if (activeTab === 'console') return '원격 지시 콘솔';
    return '수집 로그 확인';
  };

  return (
    <div className="h-12 bg-[#161C27] border-b border-slate-800 px-5 flex items-center justify-between text-sm text-slate-200 select-none shadow-sm">
      <div className="flex items-center gap-2 font-medium">
        <span className="text-slate-500">WebCrawlServer</span>
        <span className="text-slate-300">›</span>
        <span className="text-slate-500">관리자 대시보드</span>
        <span className="text-slate-300">›</span>
        <span className="text-[#1A73E8] font-semibold">{getTabLabel()}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-100 transition"
        >
          <span className="material-symbols-outlined">refresh</span>
          <span>새로고침</span>
        </button>
        {activeTab === 'logs' && (
          <button
            onClick={onClearLogs}
            className="flex items-center gap-2 px-3 py-2 bg-red-700/20 hover:bg-red-700/30 rounded text-red-200 transition border border-red-700/30"
          >
            <span className="material-symbols-outlined">delete</span>
            <span>로그 삭제</span>
          </button>
        )}
      </div>
    </div>
  );
}
