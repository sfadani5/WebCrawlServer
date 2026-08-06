// server/src/database.ts

import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { existsSync, mkdirSync } from "node:fs";

/** 클라이언트 DB 기록 구조체 */
export interface ClientRecord {
  /** 클라이언트 고유 UUID */
  client_id: string;
  /** 클라이언트 구분 타입 (plugin | admin) */
  client_type: string;
  /** 노드 한글 별칭 */
  alias?: string;
  /** 담당 수집 워커 ID */
  assigned_worker_id?: string;
  /** 노드 전용 물리 저장 경로 */
  custom_storage_path?: string;
  /** 최초 연결 시각 (ISO 문자열) */
  connected_at: string;
}

/** 크롤링 수집 로그 DB 기록 구조체 */
export interface CrawlLogRecord {
  /** 레코드 PK ID */
  id: number;
  /** 수집 노드 UUID */
  client_id: string;
  /** 수집 도메인 */
  domain?: string;
  /** 액션 구분 */
  action?: string;
  /** 담당 워커명 */
  worker_name?: string;
  /** 수집 URL */
  url?: string;
  /** 페이지 타이틀 */
  title?: string;
  /** 물리 파일 저장 경로 */
  file_path?: string;
  /** 파일 크기 (Bytes) */
  file_size?: number;
  /** 직렬화된 로그 메시지 바디 */
  log_message: string;
  /** 수집 시점 타임스탬프 */
  timestamp: number;
}

/** 커스텀 스키마 필드 정의 구조체 */
export interface CustomFieldDef {
  /** 필드 영문 식별자 */
  name: string;
  /** SQLite 필드 데이터 타입 */
  type: "TEXT" | "INTEGER" | "REAL" | "BLOB";
  /** 필수 필드 여부 */
  required?: boolean;
}

/** 워커 DB 기록 구조체 */
export interface WorkerRecord {
  /** 워커 고유 ID */
  worker_id: string;
  /** 워커 한글 이름 */
  worker_name: string;
  /** 대상 DB 파일 상대 경로 */
  db_file_path: string;
  /** 대상 테이블 이름 */
  table_name: string;
  /** 워커 전용 파일 저장소 루트 경로 */
  storage_root_path: string;
  /** 직렬화된 커스텀 스키마 JSON 문자열 */
  schema_json: string;
  /** 기본 워커 여부 (1 또는 0) */
  is_default: number;
  /** 워커 생성 시각 */
  created_at: string;
}

/** 워커 생성 파라미터 구조체 */
export interface CreateWorkerParams {
  /** 워커 고유 ID (영문 식별자) */
  workerId: string;
  /** 워커 한글 이름 */
  workerName: string;
  /** 바인딩 DB 파일명 */
  dbFileName: string;
  /** 타깃 테이블명 */
  tableName: string;
  /** 파일 저장소 루트 경로 */
  storageRootPath: string;
  /** 커스텀 스키마 필드 정의 배열 */
  customFields: CustomFieldDef[];
  /** 기본 워커 지정 여부 */
  isDefault?: boolean;
}

// ESM 환경에서 __dirname 대체 경로 계산
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 최상위 databases 및 databases/workers 경로 계산
const databasesDir = resolve(__dirname, "..", "..", "databases");
const workersDbDir = resolve(databasesDir, "workers");

// workers 서브 디렉터리 없을 경우 자동 생성
if (!existsSync(workersDbDir)) {
  mkdirSync(workersDbDir, { recursive: true });
}

// 메인 DB 경로 및 인스턴스 초기화
const mainDbPath = resolve(databasesDir, "data.db");
const db = new Database(mainDbPath);

// SQLite 고성능 및 무결성 PRAGMA 설정
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

/**
 * 프로젝트 구동에 필수적인 메인 시스템 DB 스키마 및 디폴트 워커를 초기 구성합니다.
 * 백엔드 진입 시 즉시 1회 자동 호출됩니다.
 */
export function initializeDatabase(): void {
  // 1. clients 테이블 확장 생성 (별칭, 담당 워커, 전용 저장 경로 컬럼 포함)
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS clients (
      client_id TEXT PRIMARY KEY,
      client_type TEXT NOT NULL,
      alias TEXT,
      assigned_worker_id TEXT DEFAULT 'default_worker',
      custom_storage_path TEXT,
      connected_at TEXT NOT NULL
    )
  `
  ).run();

  // 2. crawl_logs 기본 로그 테이블 생성 (도메인, URL, 물리 파일 경로 포함)
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS crawl_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id TEXT NOT NULL,
      domain TEXT,
      action TEXT,
      worker_name TEXT,
      url TEXT,
      title TEXT,
      file_path TEXT,
      file_size INTEGER DEFAULT 0,
      log_message TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (client_id) REFERENCES clients (client_id) ON DELETE CASCADE
    )
  `
  ).run();

  // 3. workers 테이블 신설 (동적 수집 워커 레지스트리)
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS workers (
      worker_id TEXT PRIMARY KEY,
      worker_name TEXT NOT NULL,
      db_file_path TEXT NOT NULL,
      table_name TEXT NOT NULL,
      storage_root_path TEXT NOT NULL,
      schema_json TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `
  ).run();

  // 4. 디폴트 워커 자동 가등록 (없을 경우에만)
  const defaultWorkerExist = db
    .prepare("SELECT * FROM workers WHERE worker_id = 'default_worker'")
    .get();

  if (!defaultWorkerExist) {
    db.prepare(
      `
      INSERT INTO workers (worker_id, worker_name, db_file_path, table_name, storage_root_path, schema_json, is_default, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      "default_worker",
      "기본 수집 워커",
      "databases/data.db",
      "crawl_logs",
      "./storage",
      JSON.stringify([]),
      1,
      new Date().toISOString()
    );
  }
}

/**
 * 데이터베이스에 기록된 모든 수집 클라이언트 목록을 조회합니다.
 *
 * @returns 클라이언트 레코드 배열
 */
export function getAllClients(): ClientRecord[] {
  return db
    .prepare("SELECT * FROM clients ORDER BY connected_at DESC")
    .all() as ClientRecord[];
}

/**
 * 특정 클라이언트 노드의 환경설정(별칭, 담당 워커, 전용 저장 경로)을 업데이트합니다.
 *
 * @param clientId - 대상 클라이언트 UUID
 * @param alias - 노드 한글 별칭
 * @param assignedWorkerId - 담당 수집 워커 ID
 * @param customStoragePath - 노드 전용 물리 저장 경로
 */
export function updateClientConfig(
  clientId: string,
  alias?: string,
  assignedWorkerId?: string,
  customStoragePath?: string
): void {
  db.prepare(
    `
    UPDATE clients 
    SET alias = ?, assigned_worker_id = ?, custom_storage_path = ?
    WHERE client_id = ?
  `
  ).run(
    alias || null,
    assignedWorkerId || "default_worker",
    customStoragePath || null,
    clientId
  );
}

/**
 * 전체 수집 워커 목록을 조회합니다. 디폴트 워커가 상단에 정렬됩니다.
 *
 * @returns 워커 레코드 배열
 */
export function getAllWorkers(): WorkerRecord[] {
  return db
    .prepare("SELECT * FROM workers ORDER BY is_default DESC, created_at ASC")
    .all() as WorkerRecord[];
}

/**
 * 특정 워커 ID로 워커 정보를 조회합니다.
 *
 * @param workerId - 조회할 워커 ID
 * @returns 워커 레코드 또는 undefined
 */
export function getWorkerById(workerId: string): WorkerRecord | undefined {
  return db
    .prepare("SELECT * FROM workers WHERE worker_id = ?")
    .get(workerId) as WorkerRecord | undefined;
}

/**
 * 신규 수집 워커를 생성하고, 해당 워커 전용 DB 파일 및 스키마 테이블을 동적으로 빌드합니다.
 * DDL 예약어와 중복되는 커스텀 필드는 자동 필터링됩니다.
 *
 * @param params - 워커 생성 파라미터 객체
 */
export function createDynamicWorker(params: CreateWorkerParams): void {
  // 메인 DB와 신규 전용 DB 경로를 구분 처리
  const isMainDb = params.dbFileName === "data.db";
  const targetDbPath = isMainDb
    ? mainDbPath
    : resolve(workersDbDir, params.dbFileName);

  // 타깃 DB 인스턴스 열기 (신규 생성 포함)
  const targetDb = new Database(targetDbPath);
  targetDb.pragma("journal_mode = WAL");

  // DDL 기본 상속 예약어 컬럼 세트 (중복 방지용 가드 집합)
  const reservedColumns = new Set([
    "id",
    "client_id",
    "domain",
    "url",
    "title",
    "file_path",
    "file_size",
    "timestamp",
  ]);

  // 기본 컬럼 DDL 구성
  let ddl = `
    CREATE TABLE IF NOT EXISTS ${params.tableName} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id TEXT NOT NULL,
      domain TEXT,
      url TEXT,
      title TEXT,
      file_path TEXT,
      file_size INTEGER DEFAULT 0,
      timestamp INTEGER NOT NULL
  `;

  // 예약어와 중복되지 않는 커스텀 필드만 DDL에 연결 (SQL 오류 방지)
  for (const field of params.customFields) {
    if (!reservedColumns.has(field.name.toLowerCase())) {
      ddl += `, ${field.name} ${field.type} ${field.required ? "NOT NULL" : ""}`;
    }
  }
  ddl += `);`;

  // 타깃 DB에 동적 테이블 생성
  targetDb.prepare(ddl).run();

  // 메인 DB workers 레지스트리에 워커 정보 등록
  const dbRelPath = isMainDb
    ? "databases/data.db"
    : `databases/workers/${params.dbFileName}`;

  db.prepare(
    `
    INSERT INTO workers (worker_id, worker_name, db_file_path, table_name, storage_root_path, schema_json, is_default, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    params.workerId,
    params.workerName,
    dbRelPath,
    params.tableName,
    params.storageRootPath,
    JSON.stringify(params.customFields),
    params.isDefault ? 1 : 0,
    new Date().toISOString()
  );
}

/**
 * 최근 수집 로그를 페이지네이션 방식으로 조회합니다.
 *
 * @param limit - 조회 건수 제한 (기본값: 100)
 * @param offset - 조회 시작 오프셋 (기본값: 0)
 * @returns 크롤링 로그 레코드 배열
 */
export function getCrawlLogs(
  limit: number = 100,
  offset: number = 0
): CrawlLogRecord[] {
  return db
    .prepare(
      "SELECT * FROM crawl_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?"
    )
    .all(limit, offset) as CrawlLogRecord[];
}

/**
 * 데이터베이스의 모든 수집 로그를 일괄 소거합니다.
 */
export function clearAllCrawlLogs(): void {
  db.prepare("DELETE FROM crawl_logs").run();
}

/**
 * 특정 클라이언트를 데이터베이스에서 영구 삭제(정화 추방)합니다.
 * 연쇄 삭제(CASCADE)로 관련 로그도 함께 제거됩니다.
 *
 * @param clientId - 삭제할 클라이언트 UUID
 */
export function purgeClient(clientId: string): void {
  db.prepare("DELETE FROM clients WHERE client_id = ?").run(clientId);
}

/**
 * 수집 노드로부터 수신된 로그를 데이터베이스에 삽입합니다.
 * 클라이언트 미등록 시 자동으로 INSERT OR IGNORE 처리합니다.
 *
 * @param clientId - 수집 노드 UUID
 * @param logMessage - 직렬화된 로그 메시지 바디
 * @param timestamp - 수집 시점 타임스탬프
 * @param domain - 수집 도메인 (기본값: "common")
 * @param filePath - 물리 파일 저장 경로 (기본값: "")
 * @param fileSize - 파일 크기 Bytes (기본값: 0)
 * @returns 삽입된 레코드의 ID
 */
export function insertCrawlLog(
  clientId: string,
  logMessage: string,
  timestamp: number,
  domain: string = "common",
  filePath: string = "",
  fileSize: number = 0
): number {
  // 미등록 클라이언트인 경우 자동 등록 (플러그인 최초 수신 처리)
  db.prepare(
    "INSERT OR IGNORE INTO clients (client_id, client_type, connected_at) VALUES (?, ?, ?)"
  ).run(clientId, "plugin", new Date().toISOString());

  // 수집 로그 레코드 적재
  const info = db
    .prepare(
      "INSERT INTO crawl_logs (client_id, domain, action, file_path, file_size, log_message, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .run(clientId, domain, "CRAWL_LOG", filePath, fileSize, logMessage, timestamp);

  return Number(info.lastInsertRowid);
}

/** 메인 DB 인스턴스 기본 내보내기 */
export default db;
