관리자 대시보드 UI(`admin/`)의 **개정 소스 코드**를 단행합니다.

노드 별칭(Alias), 노드 환경설정 모달(`NodeConfigModal`), 수집 워커 빌더 뷰(`WorkerManagerView`), 온라인 필터 스위치 및 3대 노드 상태 배지가 모두 내장된 완성형 코드입니다.

---

### 1. `admin/src/types/index.ts` (전역 타입 정의 확장)

```typescript
// admin/src/types/index.ts

export interface Client {
  client_id: string;
  client_type: string;
  alias?: string;                // 노드 한글 별칭
  assigned_worker_id?: string;   // 담당 워커 ID
  custom_storage_path?: string;  // 노드 전용 물리 저장 경로
  connected_at: string;
  is_online?: boolean;           // 실시간 웹소켓 연결 여부
  is_sidebar_open?: boolean;     // 수집 노드의 사이드바 활성화 여부
}

export interface CustomFieldDef {
  name: string;
  type: "TEXT" | "INTEGER" | "REAL" | "BLOB";
  required?: boolean;
}

export interface WorkerRecord {
  worker_id: string;
  worker_name: string;
  db_file_path: string;
  table_name: string;
  storage_root_path: string;
  schema_json: string;
  is_default: number;
  created_at: string;
}

export interface CrawlLog {
  id: number;
  client_id: string;
  domain?: string;
  action?: string;
  file_path?: string;
  file_size?: number;
  log_message: string;
  timestamp: number;
}

export interface WebSocketMessage<T = unknown> {
  senderId: string;
  targetId?: string | "ALL" | "SERVER";
  action: string;
  payloadType?: "json" | "binary_base64" | "raw_text" | "chunk_stream";
  payload: T;
  meta?: {
    timestamp: number;
    traceId?: string;
    extraParams?: Record<string, unknown>;
  };
}

export type ConnectionStatus = "CONNECTED" | "DISCONNECTED";

export type ActiveTab = "clients" | "console" | "logs" | "favicon" | "workers";

export type NodeStatusFilter = "ONLINE" | "ALL" | "OFFLINE";
```

---

### 2. `admin/src/services/apiService.ts` (REST API 서비스 확장)

```typescript
// admin/src/services/apiService.ts

import { Client, CrawlLog, WorkerRecord, CustomFieldDef } from '../types/index.js';

/** 클라이언트 목록 조회 (?onlineOnly=true 필터 연동) */
export async function fetchClientsApi(onlineOnly: boolean = false): Promise<Client[]> {
  const url = onlineOnly ? '/api/db/clients?onlineOnly=true' : '/api/db/clients';
  const res = await fetch(url);
  const json = await res.json();
  return json.success ? json.data : [];
}

/** 노드 환경설정 (별칭, 담당 워커, 전용 저장 경로) 업데이트 */
export async function updateClientConfigApi(
  clientId: string,
  alias: string,
  assignedWorkerId: string,
  customStoragePath: string
): Promise<boolean> {
  const res = await fetch(`/api/db/clients/${clientId}/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alias, assignedWorkerId, customStoragePath }),
  });
  const json = await res.json();
  return json.success;
}

/** 전체 워커 목록 인출 */
export async function fetchWorkersApi(): Promise<WorkerRecord[]> {
  const res = await fetch('/api/admin/workers');
  const json = await res.json();
  return json.success ? json.data : [];
}

/** 신규 동적 수집 워커 생성 요청 */
export async function createWorkerApi(params: {
  workerId: string;
  workerName: string;
  dbFileName: string;
  tableName: string;
  storageRootPath: string;
  customFields: CustomFieldDef[];
  isDefault?: boolean;
}): Promise<boolean> {
  const res = await fetch('/api/admin/workers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  return json.success;
}

/** 수집 로그 목록 인출 */
export async function fetchLogsApi(): Promise<CrawlLog[]> {
  const res = await fetch('/api/db/logs');
  const json = await res.json();
  return json.success ? json.data : [];
}

/** 수집 로그 일괄 소거 */
export async function clearLogsApi(): Promise<boolean> {
  const res = await fetch('/api/db/logs', { method: 'DELETE' });
  const json = await res.json();
  return json.success;
}

/** 클라이언트 차단 추방 */
export async function purgeClientApi(clientId: string): Promise<boolean> {
  const res = await fetch(`/api/db/clients/${clientId}`, { method: 'DELETE' });
  const json = await res.json();
  return json.success;
}
```

---

### 3. `admin/src/hooks/useAdminDbApi.ts` (비즈니스 로직 훅 확장)

```typescript
// admin/src/hooks/useAdminDbApi.ts

import { useState, useCallback } from 'react';
import { Client, CrawlLog, WorkerRecord, CustomFieldDef } from '../types/index.js';
import { 
  fetchClientsApi, 
  updateClientConfigApi,
  fetchWorkersApi,
  createWorkerApi,
  fetchLogsApi, 
  clearLogsApi, 
  purgeClientApi 
} from '../services/apiService.js';

export function useAdminDbApi() {
  const [clients, setClients] = useState<Client[]>([]);
  const [workers, setWorkers] = useState<WorkerRecord[]>([]);
  const [logs, setLogs] = useState<CrawlLog[]>([]);

  const loadClients = useCallback(async (onlineOnly: boolean = false) => {
    try {
      const data = await fetchClientsApi(onlineOnly);
      setClients(data);
    } catch {
      // 예외 스킵
    }
  }, []);

  const loadWorkers = useCallback(async () => {
    try {
      const data = await fetchWorkersApi();
      setWorkers(data);
    } catch {
      // 예외 스킵
    }
  }, []);

  const loadLogs = useCallback(async () => {
    try {
      const data = await fetchLogsApi();
      setLogs(data);
    } catch {
      // 예외 스킵
    }
  }, []);

  // 노드 환경설정 업데이트
  const executeUpdateClientConfig = useCallback(async (
    clientId: string,
    alias: string,
    assignedWorkerId: string,
    customStoragePath: string
  ) => {
    const success = await updateClientConfigApi(clientId, alias, assignedWorkerId, customStoragePath);
    if (success) {
      await loadClients();
      return true;
    }
    return false;
  }, [loadClients]);

  // 신규 수집 워커 생성
  const executeCreateWorker = useCallback(async (params: {
    workerId: string;
    workerName: string;
    dbFileName: string;
    tableName: string;
    storageRootPath: string;
    customFields: CustomFieldDef[];
  }) => {
    const success = await createWorkerApi(params);
    if (success) {
      alert('신규 수집 워커 및 타깃 DB 스키마가 성공적으로 빌드되었습니다.');
      await loadWorkers();
      return true;
    }
    return false;
  }, [loadWorkers]);

  // 수집 로그 일괄 소거
  const executeClearLogs = useCallback(async () => {
    if (!confirm('데이터베이스 내의 모든 크롤링 수집 로그를 완전 소거하시겠습니까?')) {
      return false;
    }
    const success = await clearLogsApi();
    if (success) {
      alert('데이터베이스의 모든 수집 로그가 일괄 소거되었습니다.');
      await loadLogs();
      return true;
    }
    return false;
  }, [loadLogs]);

  // 클라이언트 정화 추방
  const executePurgeClient = useCallback(async (clientId: string) => {
    if (!confirm(`대상 클라이언트 [${clientId}]를 강제 정화 격리하시겠습니까?`)) {
      return false;
    }
    const success = await purgeClientApi(clientId);
    if (success) {
      alert('지정된 클라이언트 기기가 완전히 차단 제거되었습니다.');
      await loadClients();
      await loadLogs();
      return true;
    }
    return false;
  }, [loadClients, loadLogs]);

  // 오프라인 노드 일괄 정화
  const executePurgeOfflineClients = useCallback(async () => {
    const offlineClients = clients.filter((c) => !c.is_online);
    if (offlineClients.length === 0) {
      alert('정리할 오프라인 노드 이력이 없습니다.');
      return false;
    }

    if (!confirm(`연결 끊긴 오프라인 노드 ${offlineClients.length}개를 일괄 정화하시겠습니까?`)) {
      return false;
    }

    for (const client of offlineClients) {
      await purgeClientApi(client.client_id);
    }

    alert('모든 오프라인 노드 이력이 정화되었습니다.');
    await loadClients();
    await loadLogs();
    return true;
  }, [clients, loadClients, loadLogs]);

  return {
    clients,
    workers,
    logs,
    setLogs,
    loadClients,
    loadWorkers,
    loadLogs,
    executeUpdateClientConfig,
    executeCreateWorker,
    executeClearLogs,
    executePurgeClient,
    executePurgeOfflineClients
  };
}
```

---

#### ④ `admin/src/components/modals/NodeConfigModal.tsx` (노드 환경설정 모달)

```tsx
// admin/src/components/modals/NodeConfigModal.tsx

import { useState, useEffect } from 'react';
import { Client, WorkerRecord } from '../../types/index.js';

interface NodeConfigModalProps {
  isOpen: boolean;
  client: Client | null;
  workers: WorkerRecord[];
  onClose: () => void;
  onSave: (clientId: string, alias: string, assignedWorkerId: string, customStoragePath: string) => Promise<boolean>;
}

export function NodeConfigModal({ isOpen, client, workers, onClose, onSave }: NodeConfigModalProps) {
  if (!isOpen || !client) return null;

  const [alias, setAlias] = useState(client.alias || '');
  const [assignedWorkerId, setAssignedWorkerId] = useState(client.assigned_worker_id || 'default_worker');
  const [customStoragePath, setCustomStoragePath] = useState(client.custom_storage_path || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setAlias(client.alias || '');
    setAssignedWorkerId(client.assigned_worker_id || 'default_worker');
    setCustomStoragePath(client.custom_storage_path || '');
  }, [client]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(client.client_id, alias, assignedWorkerId, customStoragePath);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 bg-[#111827] border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400">settings</span>
            노드 환경설정 [{client.client_id.slice(0, 8)}]
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4 text-xs font-sans">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">노드 한글 별칭 (Alias)</label>
            <input
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="예: 오페라-개인-수집기-1"
              className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded text-slate-100 outline-none focus:border-[#1A73E8]"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">담당 수집 워커 (Worker)</label>
            <select
              value={assignedWorkerId}
              onChange={(e) => setAssignedWorkerId(e.target.value)}
              className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded text-slate-100 outline-none focus:border-[#1A73E8]"
            >
              <option value="default_worker">기본 수집 워커 (Default Worker)</option>
              {workers.map((w) => (
                <option key={w.worker_id} value={w.worker_id}>
                  {w.worker_name} [{w.worker_id}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">노드 전용 물리 저장 경로 (선택)</label>
            <input
              value={customStoragePath}
              onChange={(e) => setCustomStoragePath(e.target.value)}
              placeholder="미입력 시 워커 기본 경로 적용 (예: E:\data\opera_node_1)"
              className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded text-slate-100 outline-none focus:border-[#1A73E8] font-mono text-[11px]"
            />
          </div>
        </div>

        <div className="px-6 py-3 bg-[#111827] border-t border-slate-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-200">
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-[#1A73E8] hover:bg-[#185abc] text-white rounded font-semibold"
          >
            {isSaving ? '저장 중...' : '설정 저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

#### ⑤ `admin/src/components/views/WorkerManagerView.tsx` (워커 빌더 뷰)

```tsx
// admin/src/components/views/WorkerManagerView.tsx

import { useState } from 'react';
import { WorkerRecord, CustomFieldDef } from '../../types/index.js';

interface WorkerManagerViewProps {
  workers: WorkerRecord[];
  onCreateWorker: (params: {
    workerId: string;
    workerName: string;
    dbFileName: string;
    tableName: string;
    storageRootPath: string;
    customFields: CustomFieldDef[];
  }) => Promise<boolean>;
}

export function WorkerManagerView({ workers, onCreateWorker }: WorkerManagerViewProps) {
  const [workerId, setWorkerId] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [dbFileName, setDbFileName] = useState('worker_custom.db');
  const [tableName, setTableName] = useState('custom_logs');
  const [storageRootPath, setStorageRootPath] = useState('E:\\data\\custom_worker');
  const [customFields, setCustomFields] = useState<CustomFieldDef[]>([]);

  const handleAddField = () => {
    setCustomFields([
      ...customFields,
      { name: `field_${customFields.length + 1}`, type: 'TEXT', required: false }
    ]);
  };

  const handleFieldChange = (index: number, key: keyof CustomFieldDef, value: any) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [key]: value };
    setCustomFields(updated);
  };

  const handleRemoveField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!workerId || !workerName) {
      alert('워커 ID와 이름을 입력해주세요.');
      return;
    }

    const success = await onCreateWorker({
      workerId,
      workerName,
      dbFileName,
      tableName,
      storageRootPath,
      customFields
    });

    if (success) {
      setWorkerId('');
      setWorkerName('');
      setCustomFields([]);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none font-sans">
      {/* 1. 가동 중인 워커 현황 테이블 */}
      <div className="bg-[#202124] border border-gray-800 rounded shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 bg-[#28292c] flex justify-between items-center">
          <span className="font-bold text-xs text-gray-200 tracking-wide uppercase">
            Active Worker Instances ({workers.length})
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#111827] text-slate-300 border-b border-slate-800 text-[11px] font-semibold">
                <th className="p-3">워커 ID</th>
                <th className="p-3">워커 이름</th>
                <th className="p-3">바인딩 DB 파일</th>
                <th className="p-3">테이블명</th>
                <th className="p-3">저장소 루트</th>
                <th className="p-3">기본 워커 여부</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-200 font-mono">
              {workers.map((w) => (
                <tr key={w.worker_id} className="hover:bg-[#2d2e31] transition">
                  <td className="p-3 font-semibold text-blue-300">{w.worker_id}</td>
                  <td className="p-3 font-sans font-medium text-slate-100">{w.worker_name}</td>
                  <td className="p-3 text-slate-300">{w.db_file_path}</td>
                  <td className="p-3 text-yellow-300">{w.table_name}</td>
                  <td className="p-3 text-slate-400 text-[11px] break-all">{w.storage_root_path}</td>
                  <td className="p-3 font-sans">
                    {w.is_default ? (
                      <span className="bg-blue-900/40 text-blue-300 text-[10px] px-2 py-0.5 rounded border border-blue-700/40 font-semibold">
                        Default Worker
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded">
                        Custom Worker
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. 신규 워커 빌더 폼 */}
      <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 flex flex-col gap-6 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100">신규 수집 워커 동적 빌더</h2>
            <p className="text-xs text-slate-400">새로운 워커와 전용 DB 스키마 테이블을 동적으로 생성합니다.</p>
          </div>
          <button
            onClick={handleSubmit}
            className="bg-[#1A73E8] hover:bg-[#185abc] text-white text-xs font-semibold px-4 py-2 rounded transition shadow-sm"
          >
            워커 및 DB 빌드 단행
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">워커 ID (영어 식별자)</label>
            <input
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              placeholder="예: worker_facebook"
              className="w-full p-3 bg-[#1E293B] border border-slate-700 rounded text-slate-100 outline-none focus:border-[#1A73E8] font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">워커 한글 이름</label>
            <input
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              placeholder="예: 페이스북 전담 수집 워커"
              className="w-full p-3 bg-[#1E293B] border border-slate-700 rounded text-slate-100 outline-none focus:border-[#1A73E8]"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">대상 DB 파일명 (databases/workers/)</label>
            <input
              value={dbFileName}
              onChange={(e) => setDbFileName(e.target.value)}
              placeholder="예: worker_facebook.db"
              className="w-full p-3 bg-[#1E293B] border border-slate-700 rounded text-slate-100 font-mono outline-none focus:border-[#1A73E8]"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">대상 테이블 이름</label>
            <input
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="예: facebook_posts"
              className="w-full p-3 bg-[#1E293B] border border-slate-700 rounded text-slate-100 font-mono outline-none focus:border-[#1A73E8]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-400 mb-1 font-semibold">워커 전용 파일 저장소 루트 경로</label>
            <input
              value={storageRootPath}
              onChange={(e) => setStorageRootPath(e.target.value)}
              placeholder="예: E:\data\facebook_worker"
              className="w-full p-3 bg-[#1E293B] border border-slate-700 rounded text-slate-100 font-mono outline-none focus:border-[#1A73E8]"
            />
          </div>
        </div>

        {/* 커스텀 스키마 필드 구성 */}
        <div className="bg-[#1E293B] p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-xs text-slate-200">
              커스텀 스키마 필드 정의 (기본 파라미터는 자동 상속)
            </span>
            <button
              onClick={handleAddField}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded transition border border-slate-700"
            >
              <span className="material-symbols-outlined text-xs">add</span>
              <span>필드 추가</span>
            </button>
          </div>

          {customFields.map((field, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-[#0F172A] p-2.5 rounded border border-slate-800 text-xs">
              <input
                value={field.name}
                onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                placeholder="필드명 (예: author_id)"
                className="flex-1 p-2 bg-[#1E293B] border border-slate-700 rounded text-slate-100 font-mono"
              />
              <select
                value={field.type}
                onChange={(e) => handleFieldChange(idx, 'type', e.target.value as any)}
                className="p-2 bg-[#1E293B] border border-slate-700 rounded text-slate-100 font-mono"
              >
                <option value="TEXT">TEXT (문자열)</option>
                <option value="INTEGER">INTEGER (정수)</option>
                <option value="REAL">REAL (실수)</option>
                <option value="BLOB">BLOB (바이너리)</option>
              </select>
              <button
                onClick={() => handleRemoveField(idx)}
                className="p-1.5 bg-red-900/40 hover:bg-red-800 text-red-200 rounded transition"
              >
                <span className="material-symbols-outlined text-xs">delete</span>
              </button>
            </div>
          ))}
          {customFields.length === 0 && (
            <div className="text-center text-slate-500 text-xs py-4">
              추가 커스텀 필드가 없습니다. [필드 추가] 버튼으로 스키마를 확장할 수 있습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

#### ⑥ `admin/src/components/tables/GcpClientsTable.tsx` (별칭 및 `[환경설정 ⚙️]` 모달 연동)

```tsx
// admin/src/components/tables/GcpClientsTable.tsx

import { Client, CrawlLog } from '../../types/index.js';

interface GcpClientsTableProps {
  clients: Client[];
  logs: CrawlLog[];
  onSelectTarget: (clientId: string) => void;
  onPurgeClient: (clientId: string) => void;
  onOpenDomModal: (clientId: string, log: CrawlLog) => void;
  onOpenConfigModal: (client: Client) => void;
}

export function GcpClientsTable({
  clients,
  logs,
  onSelectTarget,
  onPurgeClient,
  onOpenDomModal,
  onOpenConfigModal
}: GcpClientsTableProps) {
  const getLatestLogForClient = (clientId: string): CrawlLog | undefined => {
    return logs.find((l) => l.client_id === clientId);
  };

  const formatConnectedDate = (dateStr: string): string => {
    if (!dateStr) return 'N/A';
    const parsedNum = Number(dateStr);
    const date = isNaN(parsedNum) ? new Date(dateStr) : new Date(parsedNum);
    return isNaN(date.getTime()) ? '알 수 없는 시각' : date.toLocaleString();
  };

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
              <th className="p-3">노드 별칭 / 고유 ID</th>
              <th className="p-3">클라이언트 타입</th>
              <th className="p-3">상태</th>
              <th className="p-3">수신 데이터 알림</th>
              <th className="p-3">최초 등록/연결 시간</th>
              <th className="p-3 text-right">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-gray-200 font-mono">
            {clients.map((client) => {
              const latestLog = getLatestLogForClient(client.client_id);
              const isOnline = !!client.is_online;
              const isSidebarOpen = !!client.is_sidebar_open;

              return (
                <tr key={client.client_id} className="hover:bg-[#2d2e31] transition">
                  <td className="p-3 text-center text-slate-400">{client.client_id.slice(0, 4)}</td>
                  
                  {/* 노드 한글 별칭 및 ID + [환경설정 ⚙️] 버튼 */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-100 font-sans text-xs">
                          {client.alias || '별칭 미지정 노드'}
                        </span>
                        <span className="text-slate-500 font-mono text-[10px] break-all">
                          {client.client_id}
                        </span>
                      </div>
                      <button
                        onClick={() => onOpenConfigModal(client)}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
                        title="노드 환경설정"
                      >
                        <span className="material-symbols-outlined text-xs">settings</span>
                      </button>
                    </div>
                  </td>

                  <td className="p-3">
                    <span className="bg-slate-800 text-slate-200 text-[10px] px-2 py-0.5 rounded border border-slate-700">
                      {client.client_type}
                    </span>
                  </td>

                  {/* 3대 실시간 노드 상태 배지 */}
                  <td className="p-3 font-sans select-none">
                    {isOnline ? (
                      isSidebarOpen ? (
                        <span className="inline-flex items-center gap-1.5 bg-blue-900/40 text-blue-300 text-[11px] px-2.5 py-1 rounded border border-blue-700/40 font-semibold shadow-sm">
                          <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
                          온라인 (사이드바 활성 🖥️)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-900/40 text-emerald-300 text-[11px] px-2.5 py-1 rounded border border-emerald-700/40 font-semibold shadow-sm">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          온라인 (백그라운드 가동 🌙)
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-400 text-[11px] px-2.5 py-1 rounded border border-slate-700 font-medium">
                        <span className="h-2 w-2 rounded-full bg-slate-500"></span>
                        연결 끊김 (과거 이력)
                      </span>
                    )}
                  </td>

                  {/* 수신받은 데이터 알림 버튼 */}
                  <td className="p-3 font-sans">
                    {latestLog ? (
                      <button
                        onClick={() => onOpenDomModal(client.client_id, latestLog)}
                        className="inline-flex items-center gap-1.5 bg-[#1A73E8] hover:bg-[#185abc] text-white text-[11px] font-semibold px-2.5 py-1 rounded transition shadow-sm cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">notifications_active</span>
                        수신받은 데이터 보기
                      </button>
                    ) : (
                      <span className="text-slate-500 text-[11px]">수신 데이터 없음</span>
                    )}
                  </td>

                  <td className="p-3 text-slate-400 text-[12px]">
                    {formatConnectedDate(client.connected_at)}
                  </td>

                  <td className="p-3 text-right font-sans">
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
                        title="DB에서 삭제 및 영구 추방"
                      >
                        Purge
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {clients.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm font-sans">
            출력 조건에 부합하는 수집 노드 인스턴스가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
```

---

#### ⑦ `admin/src/components/views/GcpClientsView.tsx` (모달 연동 및 뷰 개정)

```tsx
// admin/src/components/views/GcpClientsView.tsx

import { useState } from 'react';
import { Client, CrawlLog, WorkerRecord, NodeStatusFilter } from '../../types/index.js';
import { MetricCardsGroup } from '../metrics/MetricCardsGroup.js';
import { GcpClientsTable } from '../tables/GcpClientsTable.js';
import { DomDataModal } from '../modals/DomDataModal.js';
import { NodeConfigModal } from '../modals/NodeConfigModal.js';

interface GcpClientsViewProps {
  clients: Client[];
  workers: WorkerRecord[];
  logs: CrawlLog[];
  logCount: number;
  onSelectTarget: (clientId: string) => void;
  onPurgeClient: (clientId: string) => void;
  onPurgeOfflineClients: () => void;
  onSaveNodeConfig: (clientId: string, alias: string, assignedWorkerId: string, customStoragePath: string) => Promise<boolean>;
}

export function GcpClientsView({
  clients,
  workers,
  logs,
  logCount,
  onSelectTarget,
  onPurgeClient,
  onPurgeOfflineClients,
  onSaveNodeConfig
}: GcpClientsViewProps) {
  const [filterMode, setFilterMode] = useState<NodeStatusFilter>('ONLINE');

  const [domModalState, setDomModalState] = useState<{
    isOpen: boolean;
    clientId: string;
    log: CrawlLog | null;
  }>({
    isOpen: false,
    clientId: '',
    log: null
  });

  const [configModalState, setConfigModalState] = useState<{
    isOpen: boolean;
    client: Client | null;
  }>({
    isOpen: false,
    client: null
  });

  const filteredClients = clients.filter((client) => {
    if (filterMode === 'ONLINE') return client.is_online;
    if (filterMode === 'OFFLINE') return !client.is_online;
    return true;
  });

  const onlineCount = clients.filter((c) => c.is_online).length;
  const offlineCount = clients.filter((c) => !c.is_online).length;

  return (
    <div className="flex flex-col gap-4">
      <MetricCardsGroup clientCount={onlineCount} logCount={logCount} />

      {/* 필터 스위치 툴바 */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-[#202124] p-3 rounded border border-gray-800 gap-3 shadow-sm select-none">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            노드 출력 필터:
          </span>
          <div className="inline-flex bg-[#111827] p-1 rounded border border-slate-700 gap-1 text-xs">
            <button
              onClick={() => setFilterMode('ONLINE')}
              className={`px-3 py-1 rounded font-semibold transition ${
                filterMode === 'ONLINE'
                  ? 'bg-[#1A73E8] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              온라인 노드만 보기 ({onlineCount})
            </button>
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1 rounded font-semibold transition ${
                filterMode === 'ALL'
                  ? 'bg-[#1A73E8] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              전체 보기 ({clients.length})
            </button>
            <button
              onClick={() => setFilterMode('OFFLINE')}
              className={`px-3 py-1 rounded font-semibold transition ${
                filterMode === 'OFFLINE'
                  ? 'bg-[#1A73E8] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              오프라인 이력만 ({offlineCount})
            </button>
          </div>
        </div>

        {offlineCount > 0 && (
          <button
            onClick={onPurgeOfflineClients}
            className="flex items-center gap-1.5 bg-red-900/40 hover:bg-red-800 text-red-200 text-xs px-3 py-1.5 rounded transition border border-red-700/50 font-medium"
          >
            <span className="material-symbols-outlined text-xs">cleaning_services</span>
            <span>오프라인 노드 이력 정리 ({offlineCount})</span>
          </button>
        )}
      </div>

      <GcpClientsTable
        clients={filteredClients}
        logs={logs}
        onSelectTarget={onSelectTarget}
        onPurgeClient={onPurgeClient}
        onOpenDomModal={(clientId, log) => setDomModalState({ isOpen: true, clientId, log })}
        onOpenConfigModal={(client) => setConfigModalState({ isOpen: true, client })}
      />

      <DomDataModal
        isOpen={domModalState.isOpen}
        clientId={domModalState.clientId}
        log={domModalState.log}
        onClose={() => setDomModalState({ isOpen: false, clientId: '', log: null })}
      />

      <NodeConfigModal
        isOpen={configModalState.isOpen}
        client={configModalState.client}
        workers={workers}
        onClose={() => setConfigModalState({ isOpen: false, client: null })}
        onSave={onSaveNodeConfig}
      />
    </div>
  );
}
```

---

#### ⑧ `admin/src/components/layout/Sidebar/Sidebar.tsx` (워커 매니저 메뉴 추가)

```tsx
// admin/src/components/layout/Sidebar/Sidebar.tsx

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
          onClick={() => onSelectTab('workers')}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${
            activeTab === 'workers'
              ? 'bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]'
              : 'text-slate-300 hover:bg-slate-900'
          }`}
        >
          <span className="material-symbols-outlined">precision_manufacturing</span>
          {!isCollapsed && <span>워커 & DB 매니저</span>}
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
```

---

#### ⑨ `admin/src/App.tsx` (전체 탭 통합)

```tsx
// admin/src/App.tsx

import { useState, useCallback, useEffect } from 'react';
import { useAdminDbApi } from './hooks/useAdminDbApi.js';
import { useAdminSocket } from './hooks/useAdminSocket.js';
import { GcpMainLayout } from './components/layout/GcpMainLayout.js';
import { GcpClientsView } from './components/views/GcpClientsView.js';
import { GcpControlConsoleView } from './components/views/GcpControlConsoleView.js';
import { GcpCrawlLogsView } from './components/views/GcpCrawlLogsView.js';
import { WorkerManagerView } from './components/views/WorkerManagerView.js';
import { FaviconGeneratorView } from './components/views/FaviconGeneratorView.js';
import { ActiveTab } from './types/index.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('clients');
  const [targetId, setTargetId] = useState<string>('ALL');

  const {
    clients,
    workers,
    logs,
    setLogs,
    loadClients,
    loadWorkers,
    loadLogs,
    executeClearLogs,
    executePurgeClient,
    executePurgeOfflineClients,
    executeUpdateClientConfig,
    executeCreateWorker
  } = useAdminDbApi();

  useEffect(() => {
    loadClients();
    loadWorkers();
    loadLogs();
  }, [loadClients, loadWorkers, loadLogs]);

  const handleConnect = useCallback(() => {
    loadClients();
    loadWorkers();
    loadLogs();
  }, [loadClients, loadWorkers, loadLogs]);

  const { wsStatus, dispatchCommand } = useAdminSocket(setLogs, handleConnect);

  const handleSelectTarget = (clientId: string) => {
    setTargetId(clientId);
    setActiveTab('console');
  };

  return (
    <GcpMainLayout
      wsStatus={wsStatus}
      clientCount={clients.length}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onRefresh={() => {
        loadClients();
        loadWorkers();
        loadLogs();
      }}
      onClearLogs={executeClearLogs}
    >
      {activeTab === 'clients' && (
        <GcpClientsView
          clients={clients}
          workers={workers}
          logs={logs}
          logCount={logs.length}
          onSelectTarget={handleSelectTarget}
          onPurgeClient={executePurgeClient}
          onPurgeOfflineClients={executePurgeOfflineClients}
          onSaveNodeConfig={executeUpdateClientConfig}
        />
      )}
      {activeTab === 'workers' && (
        <WorkerManagerView
          workers={workers}
          onCreateWorker={executeCreateWorker}
        />
      )}
      {activeTab === 'console' && (
        <GcpControlConsoleView
          targetId={targetId}
          setTargetId={setTargetId}
          onDispatch={dispatchCommand}
        />
      )}
      {activeTab === 'logs' && (
        <GcpCrawlLogsView logs={logs} onClearLogs={executeClearLogs} />
      )}
      {activeTab === 'favicon' && (
        <FaviconGeneratorView />
      )}
    </GcpMainLayout>
  );
}
```

---

