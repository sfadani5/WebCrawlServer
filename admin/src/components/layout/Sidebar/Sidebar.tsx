import { useState } from 'react';
import { ActiveTab } from '../../../types/index.js';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  clientCount: number;
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  activeTab,
  onSelectTab,
  clientCount
}: SidebarProps) {
  const [isUtilsExpanded, setIsUtilsExpanded] = useState(false);

  return (
    <aside
      className={`bg-[#111827] border-r border-slate-800 flex flex-col justify-between transition-all duration-200 select-none shadow-sm ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col py-4">
        <button
          onClick={() => onSelectTab('clients')}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${
            activeTab === 'clients'
              ? 'bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]'
              : 'text-slate-300 hover:bg-slate-900'
          }`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          {!isCollapsed && (
            <div className="flex justify-between items-center w-full">
              <span>수집 노드 관리</span>
              <span className="bg-slate-900/70 text-slate-300 text-[10px] px-2 py-0.5 rounded-full border border-slate-800">
                {clientCount}
              </span>
            </div>
          )}
        </button>

        <button
          onClick={() => onSelectTab('console')}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${
            activeTab === 'console'
              ? 'bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]'
              : 'text-slate-300 hover:bg-slate-900'
          }`}
        >
          <span className="material-symbols-outlined">send_to_mobile</span>
          {!isCollapsed && <span>원격 지시 콘솔</span>}
        </button>

        <button
          onClick={() => onSelectTab('logs')}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${
            activeTab === 'logs'
              ? 'bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]'
              : 'text-slate-300 hover:bg-slate-900'
          }`}
        >
          <span className="material-symbols-outlined">article</span>
          {!isCollapsed && <span>수집 로그</span>}
        </button>

        <div className="mt-2">
          <button
            onClick={() => setIsUtilsExpanded(!isUtilsExpanded)}
            className={`flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition w-full ${
              activeTab === 'favicon'
                ? 'bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">build</span>
              {!isCollapsed && <span>Utils</span>}
            </div>
            {!isCollapsed && (
              <span className={`material-symbols-outlined transition-transform ${
                isUtilsExpanded ? 'rotate-90' : ''
              }`}>
                chevron_right
              </span>
            )}
          </button>

          {isUtilsExpanded && !isCollapsed && (
            <div className="pl-8">
              <button
                onClick={() => onSelectTab('favicon')}
                className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition w-full ${
                  activeTab === 'favicon'
                    ? 'bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]'
                    : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-lg">image</span>
                <span>파비콘 만들기</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-800 p-3">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 p-2 text-slate-300 hover:bg-slate-900 rounded text-sm transition"
        >
          <span className="material-symbols-outlined text-base">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
          {!isCollapsed && '사이드바 접기'}
        </button>
      </div>
    </aside>
  );
}
