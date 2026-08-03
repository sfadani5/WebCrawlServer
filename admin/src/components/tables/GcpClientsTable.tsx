import { Client } from '../../types/index.js';

interface GcpClientsTableProps {
  clients: Client[];
  onSelectTarget: (clientId: string) => void;
  onPurgeClient: (clientId: string) => void;
}

export function GcpClientsTable({
  clients,
  onSelectTarget,
  onPurgeClient
}: GcpClientsTableProps) {
  return (
    <div className="bg-[#202124] border border-gray-800 rounded shadow-sm overflow-hidden select-text">
      <div className="px-4 py-3 border-b border-gray-800 flex justify-between items-center bg-[#28292c]">
        <span className="font-bold text-xs text-gray-200 tracking-wide uppercase">
          Crawler Node Instances ({clients.length})
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#111827] text-slate-300 border-b border-slate-800 text-[11px] font-semibold">
              <th className="p-3 w-10 text-center">#</th>
              <th className="p-3">노드 ID</th>
              <th className="p-3">클라이언트 타입</th>
              <th className="p-3">상태</th>
              <th className="p-3">연결 시간</th>
              <th className="p-3 text-right">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-gray-200 font-mono">
            {clients.map((client) => (
              <tr key={client.client_id} className="hover:bg-[#2d2e31] transition">
                <td className="p-3 text-center text-slate-400">{client.client_id.slice(0, 4)}</td>
                <td className="p-3 font-semibold text-slate-100 select-text break-all">
                  {client.client_id}
                </td>
                <td className="p-3">
                  <span className="bg-slate-800 text-slate-200 text-[10px] px-2 py-0.5 rounded border border-slate-700">
                    {client.client_type}
                  </span>
                </td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-2 bg-emerald-900/40 text-emerald-300 text-[11px] px-2 py-1 rounded border border-emerald-700/40">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                    연결됨
                  </span>
                </td>
                <td className="p-3 text-slate-500 text-[12px]">
                  {new Date(parseInt(client.connected_at) || Date.now()).toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onSelectTarget(client.client_id)}
                      className="bg-gray-800 hover:bg-gray-700 text-xs px-2.5 py-0.5 rounded text-gray-200 transition border border-gray-700"
                    >
                      Select Target
                    </button>
                    <button
                      onClick={() => onPurgeClient(client.client_id)}
                      className="bg-red-900/60 hover:bg-red-800 text-xs px-2.5 py-0.5 rounded text-red-200 transition border border-red-800"
                    >
                      Purge
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">
            No active crawler nodes found
          </div>
        )}
      </div>
    </div>
  );
}
