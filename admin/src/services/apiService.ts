import { Client, CrawlLog } from '../types/index.js';

/**
 * 등록된 수집 클라이언트 기기 목록을 백엔드 REST API로부터 인출합니다.
 */
export async function fetchClientsApi(): Promise<Client[]> {
  const res = await fetch('/api/db/clients');
  const json = await res.json();
  return json.success ? json.data : [];
}

/**
 * 영구 적재된 수집 데이터 로그 목록을 백엔드 REST API로부터 인출합니다.
 */
export async function fetchLogsApi(): Promise<CrawlLog[]> {
  const res = await fetch('/api/db/logs');
  const json = await res.json();
  return json.success ? json.data : [];
}

/**
 * 데이터베이스의 모든 수집 데이터 로그를 일괄 소거 청소 요청합니다.
 */
export async function clearLogsApi(): Promise<boolean> {
  const res = await fetch('/api/db/logs', { method: 'DELETE' });
  const json = await res.json();
  return json.success;
}

/**
 * 특정 수집 클라이언트 기기를 블랙리스트 처리하여 영구 추방 및 연쇄 삭제 요청합니다.
 */
export async function purgeClientApi(clientId: string): Promise<boolean> {
  const res = await fetch(`/api/db/clients/${clientId}`, { method: 'DELETE' });
  const json = await res.json();
  return json.success;
}
