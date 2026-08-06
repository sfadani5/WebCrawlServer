// admin/src/services/apiService.ts

import { Client, CrawlLog, WorkerRecord, CustomFieldDef } from '../types/index.js';

/**
 * 등록된 수집 클라이언트 목록을 백엔드 REST API로부터 인출합니다.
 *
 * @param onlineOnly - true 지정 시 실시간 소켓 가동 노드만 인출
 * @returns 클라이언트 데이터 배열
 */
export async function fetchClientsApi(onlineOnly: boolean = false): Promise<Client[]> {
  const url = onlineOnly ? '/api/db/clients?onlineOnly=true' : '/api/db/clients';
  const res = await fetch(url);
  const json = await res.json();
  return json.success ? json.data : [];
}

/**
 * 지정 노드의 환경설정(별칭, 담당 워커, 전용 저장 경로)을 업데이트합니다.
 *
 * @param clientId - 대상 노드 UUID
 * @param alias - 노드 한글 별칭
 * @param assignedWorkerId - 담당 워커 ID
 * @param customStoragePath - 노드 전용 물리 저장 경로
 * @returns 성공 여부
 */
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

/**
 * 전체 수집 워커 목록을 인출합니다.
 *
 * @returns 워커 레코드 배열
 */
export async function fetchWorkersApi(): Promise<WorkerRecord[]> {
  const res = await fetch('/api/admin/workers');
  const json = await res.json();
  return json.success ? json.data : [];
}

/**
 * 신규 동적 수집 워커 및 타깃 DB 스키마 빌드를 요청합니다.
 *
 * @param params - 워커 생성 옵션 객체
 * @returns 성공 여부
 */
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

/**
 * 최근 수집 로그 목록을 인출합니다.
 *
 * @returns 크롤링 로그 배열
 */
export async function fetchLogsApi(): Promise<CrawlLog[]> {
  const res = await fetch('/api/db/logs');
  const json = await res.json();
  return json.success ? json.data : [];
}

/**
 * 데이터베이스 수집 로그 일괄 소거를 요청합니다.
 *
 * @returns 성공 여부
 */
export async function clearLogsApi(): Promise<boolean> {
  const res = await fetch('/api/db/logs', { method: 'DELETE' });
  const json = await res.json();
  return json.success;
}

/**
 * 특정 클라이언트 기기를 블랙리스트 차단 추방 요청합니다.
 *
 * @param clientId - 타깃 노드 UUID
 * @returns 성공 여부
 */
export async function purgeClientApi(clientId: string): Promise<boolean> {
  const res = await fetch(`/api/db/clients/${clientId}`, { method: 'DELETE' });
  const json = await res.json();
  return json.success;
}
