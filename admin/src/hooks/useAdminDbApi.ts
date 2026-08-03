import { useState, useCallback } from 'react';
import { Client, CrawlLog } from '../types/index.js';

export function useAdminDbApi() {
  const [clients, setClients] = useState<Client[]>([]);
  const [logs, setLogs] = useState<CrawlLog[]>([]);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/db/clients');
      const json = await res.json();
      if (json.success) {
        setClients(json.data);
      }
    } catch {
      // API 오프라인 예외 처리
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/db/logs');
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
      }
    } catch {
      // API 오프라인 예외 처리
    }
  }, []);

  const clearAllLogs = useCallback(async () => {
    if (!confirm('데이터베이스 내의 모든 크롤링 수집 로그를 완전 소거하시겠습니까?')) {
      return false;
    }
    try {
      const res = await fetch('/api/db/logs', { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        await fetchLogs();
        return true;
      }
    } catch {
      alert('서버 API가 오프라인 상태입니다.');
    }
    return false;
  }, [fetchLogs]);

  const purgeClientSession = useCallback(async (clientId: string) => {
    if (!confirm(`대상 클라이언트 [${clientId}]를 강제 정화 격리하시겠습니까?`)) {
      return false;
    }
    try {
      const res = await fetch(`/api/db/clients/${clientId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        await fetchClients();
        await fetchLogs();
        return true;
      }
    } catch {
      alert('서버 API가 오프라인 상태입니다.');
    }
    return false;
  }, [fetchClients, fetchLogs]);

  return {
    clients,
    logs,
    setLogs,
    fetchClients,
    fetchLogs,
    clearAllLogs,
    purgeClientSession
  };
}
