import { useState, useCallback } from 'react';
import { Client, CrawlLog } from '../types/index.js';
import { 
  fetchClientsApi, 
  fetchLogsApi, 
  clearLogsApi, 
  purgeClientApi 
} from '../services/apiService.js';

export function useAdminDbApi() {
  const [clients, setClients] = useState<Client[]>([]);
  const [logs, setLogs] = useState<CrawlLog[]>([]);

  // 백엔드 데이터베이스로부터 전체 클라이언트 목록 인출 및 상태 갱신
  const loadClients = useCallback(async () => {
    try {
      const data = await fetchClientsApi();
      setClients(data);
    } catch {
      // API 예외 스킵
    }
  }, []);

  // 백엔드 데이터베이스로부터 최신 수집 로그 목록 인출 및 상태 갱신
  const loadLogs = useCallback(async () => {
    try {
      const data = await fetchLogsApi();
      setLogs(data);
    } catch {
      // API 예외 스킵
    }
  }, []);

  // 데이터베이스 크롤링 로그 일괄 삭제 단행
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

  // 지정 클라이언트 기기 강제 추방 및 데이터 Cascade 연쇄 삭제 단행
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

  return {
    clients,
    logs,
    setLogs,
    loadClients,
    loadLogs,
    executeClearLogs,
    executePurgeClient
  };
}
