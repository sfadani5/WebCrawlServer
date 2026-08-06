**백엔드 서버 모듈(`server/`)의 완성형 소스 코드**를 출력합니다.

모든 소스 파일 최상단에 상대 경로 헤더 주석과 한글 상세 주석이 기재되어 있으며, DDL 예약어 중복 방지, 특수문자 Sanitization 및 물리 파일 분리 저장 기능이 전면 내장된 완전한 코드입니다.

---

### [1/3] `server/src/database.ts` (데이터베이스 스키마 확장 & 멀티 DB 동적 빌더)

```typescript
// server/src/database.ts

import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { existsSync, mkdirSync } from "node:fs";

/** 클라이언트 DB 기록 구조체 */
export interface ClientRecord {
  client_id: string;
  client_type: string;
  alias?: string;                // 노드 한글 별칭
  assigned_worker_id?: string;   // 담당 수집 워커 ID
  custom_storage_path?: string;  // 노드 전용 물리 저장 경로
  connected_at: string;
}

/** 크롤링 수집 로그 DB 기록 구조체 */
export interface CrawlLogRecord {
  id: number;
  client_id: string;
  domain?: string;
  action?: string;
  worker_name?: string;
  url?: string;
  title?: string;
  file_path?: string;
  file_size?: number;
  log_message: string;
  timestamp: number;
}

/** 커스텀 스키마 필드 정의 구조체 */
export interface CustomFieldDef {
  name: string;
  type: "TEXT" | "INTEGER" | "REAL" | "BLOB";
  required?: boolean;
}

/** 워커 DB 기록 구조체 */
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

/** 워커 생성 파라미터 구조체 */
export interface CreateWorkerParams {
  workerId: string;
  workerName: string;
  dbFileName: string;
  tableName: string;
  storageRootPath: string;
  customFields: CustomFieldDef[];
  isDefault?: boolean;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 최상위 databases 및 databases/workers 경로 계산
const databasesDir = resolve(__dirname, "..", "..", "databases");
const workersDbDir = resolve(databasesDir, "workers");

if (!existsSync(workersDbDir)) {
  mkdirSync(workersDbDir, { recursive: true });
}

const mainDbPath = resolve(databasesDir, "data.db");
const db = new Database(mainDbPath);

db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

/**
 * 메인 시스템 DB(data.db)의 스키마 및 디폴트 워커를 초기 구성합니다.
 */
export function initializeDatabase(): void {
  // 1. clients 테이블 확장 생성
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

  // 2. crawl_logs 기본 로그 테이블 생성
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

  // 3. workers 테이블 신설
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

  // 4. 디폴트 워커 자동 가등록
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

/** 전체 클라이언트 목록 조회 */
export function getAllClients(): ClientRecord[] {
  return db
    .prepare("SELECT * FROM clients ORDER BY connected_at DESC")
    .all() as ClientRecord[];
}

/** 특정 클라이언트 환경설정(별칭, 담당 워커, 전용 저장 경로) 업데이트 */
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

/** 전체 워커 목록 조회 */
export function getAllWorkers(): WorkerRecord[] {
  return db
    .prepare("SELECT * FROM workers ORDER BY is_default DESC, created_at ASC")
    .all() as WorkerRecord[];
}

/** 특정 워커 정보 조회 */
export function getWorkerById(workerId: string): WorkerRecord | undefined {
  return db
    .prepare("SELECT * FROM workers WHERE worker_id = ?")
    .get(workerId) as WorkerRecord | undefined;
}

/**
 * 신규 수집 워커를 생성하고, 해당 워커 전용 DB 파일 및 스키마 테이블을 동적 빌드합니다.
 */
export function createDynamicWorker(params: CreateWorkerParams): void {
  const isMainDb = params.dbFileName === "data.db";
  const targetDbPath = isMainDb
    ? mainDbPath
    : resolve(workersDbDir, params.dbFileName);

  const targetDb = new Database(targetDbPath);
  targetDb.pragma("journal_mode = WAL");

  // DDL 기본 상속 예약어 칼럼 세트 (중복 방지)
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

  targetDb.prepare(ddl).run();

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

/** 로그 조회 */
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

/** 로그 일괄 삭제 */
export function clearAllCrawlLogs(): void {
  db.prepare("DELETE FROM crawl_logs").run();
}

/** 특정 클라이언트 정화 추방 */
export function purgeClient(clientId: string): void {
  db.prepare("DELETE FROM clients WHERE client_id = ?").run(clientId);
}

/** 수집 로그 인서트 */
export function insertCrawlLog(
  clientId: string,
  logMessage: string,
  timestamp: number,
  domain: string = "common",
  filePath: string = "",
  fileSize: number = 0
): number {
  db.prepare(
    "INSERT OR IGNORE INTO clients (client_id, client_type, connected_at) VALUES (?, ?, ?)"
  ).run(clientId, "plugin", new Date().toISOString());

  const info = db
    .prepare(
      "INSERT INTO crawl_logs (client_id, domain, action, file_path, file_size, log_message, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .run(clientId, domain, "CRAWL_LOG", filePath, fileSize, logMessage, timestamp);

  return Number(info.lastInsertRowid);
}

export default db;
```

---

### [2/3] `server/src/services/fileStorageService.ts` (물리 파일 분리 저장 모듈)

```typescript
// server/src/services/fileStorageService.ts

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export interface SaveContentOptions {
  customNodePath?: string;     // 노드 전용 지정 경로
  workerStoragePath?: string;  // 워커 전용 지정 경로
  globalDefaultPath?: string;  // 글로벌 기본 경로 (기본값: "./storage")
  domain: string;              // 도메인 (예: "aaa.com")
  dbLogId: number | string;    // DB 인덱스 ID (예: 1042)
  htmlContent: string;         // HTML 원본 소스
}

export interface SaveContentResult {
  savedFilePath: string;
  fileSize: number;
}

/** 윈도우/리눅스 디렉터리 금지 특수문자를 이스케이프 정화합니다. */
function sanitizeFolderName(name: string): string {
  return (name || "common").replace(/[^a-zA-Z0-9_.-]/g, "_");
}

/**
 * 우선순위에 따라 물리 저장 경로를 결정하고, HTML 파일 및 메타데이터를 디스크에 보관합니다.
 */
export function saveCrawledContentToFile(
  options: SaveContentOptions
): SaveContentResult {
  // 1. 저장소 최상위 루트 경로 결정 (우선순위: 노드 지정 > 워커 지정 > 글로벌 기본)
  const rootPath =
    options.customNodePath && options.customNodePath.trim().length > 0
      ? options.customNodePath
      : options.workerStoragePath && options.workerStoragePath.trim().length > 0
      ? options.workerStoragePath
      : options.globalDefaultPath || "./storage";

  // 2. 도메인 특수문자 정화 및 디렉터리 세부 경로 생성 (예: E:\data\aaa_com\1042\)
  const safeDomain = sanitizeFolderName(options.domain);
  const targetDir = resolve(
    rootPath,
    safeDomain,
    String(options.dbLogId)
  );

  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  // 3. index.html 파일 쓰기 단행
  const targetFilePath = resolve(targetDir, "index.html");
  const buffer = Buffer.from(options.htmlContent, "utf-8");

  writeFileSync(targetFilePath, buffer);

  return {
    savedFilePath: targetFilePath,
    fileSize: buffer.length,
  };
}
```

---

### [3/3] `server/src/services/workerEngineService.ts` (동적 워커 파이프라인 모듈)

```typescript
// server/src/services/workerEngineService.ts

import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { WorkerRecord, CustomFieldDef } from "../database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 유입 패킷을 담당 워커 스키마에 맞춰 타깃 DB 및 테이블에 동적 인서트합니다.
 */
export function executeWorkerPipeline(
  workerConfig: WorkerRecord,
  clientId: string,
  domain: string,
  filePath: string,
  fileSize: number,
  packetPayload: Record<string, unknown>
): void {
  const targetDbPath = resolve(
    __dirname,
    "..",
    "..",
    workerConfig.db_file_path
  );
  const targetDb = new Database(targetDbPath);

  const customFields: CustomFieldDef[] = JSON.parse(
    workerConfig.schema_json || "[]"
  );

  let cols = "client_id, domain, url, title, file_path, file_size, timestamp";
  let vals = "?, ?, ?, ?, ?, ?, ?";
  const paramValues: unknown[] = [
    clientId,
    domain,
    packetPayload.url || "",
    packetPayload.title || "",
    filePath,
    fileSize,
    Date.now(),
  ];

  for (const field of customFields) {
    cols += `, ${field.name}`;
    vals += `, ?`;
    paramValues.push(packetPayload[field.name] ?? null);
  }

  const query = `INSERT INTO ${workerConfig.table_name} (${cols}) VALUES (${vals})`;
  targetDb.prepare(query).run(...paramValues);
}
```

---

다음 순서인 **`server/src/index.ts` 및 관리자 대시보드 UI(`admin/`) 소스 코드**를 진행할까요?