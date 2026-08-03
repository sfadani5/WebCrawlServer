import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

export interface ClientRecord {
  client_id: string;
  client_type: string;
  connected_at: string;
}

export interface CrawlLogRecord {
  id: number;
  client_id: string;
  log_message: string;
  timestamp: number;
}

// ESM 빌드 환경에서도 정확히 루트 폴더 하위 databases 디렉토리를 식별하게 경로 연산 수행
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 실행 위치가 src/ 또는 dist/ 인지와 무관하게 항상 최상위 루트 디렉토리 내 databases\data.db를 향하도록 경로 역계산
const dbPath = resolve(__dirname, "..", "..", "databases", "data.db");

// 계산된 절대 경로를 할당하여 SQLite 데이터베이스 인스턴스 초기화
const db = new Database(dbPath);

// SQLite 내부 고성능 연산 및 제약 PRAGMA 매개변수 적용
db.pragma("foreign_keys = ON"); // 관계형 데이터 무결성 제약 조건 활성화
db.pragma("journal_mode = WAL"); // 쓰기 지연과 잠금 방지를 위한 WAL 기법 기동

/**
 * 프로젝트 구동에 필수적인 관계형 테이블 스키마를 초기 구성합니다.
 * 백엔드 초기 구동 엔트리포인트 진입 시 즉시 1회 자동 트리거됩니다.
 */
export function initializeDatabase(): void {
  // 1단계: 연결 이력이 수립된 클라이언트(플러그인 및 어드민)의 기기 고정 스토리지 정보 관리 테이블 생성
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS clients (
      client_id TEXT PRIMARY KEY,
      client_type TEXT NOT NULL,
      connected_at TEXT NOT NULL
    )
  `,
  ).run();

  // 2단계: 각 브라우저 플러그인이 실시간으로 수집하고 중계하여 적재한 수집 데이터 원천 로그 기록 테이블 생성
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS crawl_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id TEXT NOT NULL,
      log_message TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (client_id) REFERENCES clients (client_id) ON DELETE CASCADE
    )
  `,
  ).run();
}

/**
 * 데이터베이스에 기록된 모든 수집 클라이언트 목록을 조회합니다.
 * 관리자 기기 관리 화면 매핑용으로 사용됩니다.
 */
export function getAllClients(): ClientRecord[] {
  return db.prepare("SELECT * FROM clients ORDER BY connected_at DESC").all() as ClientRecord[];
}

/**
 * 저장된 크롤링 수집 로그 목록을 최신순 페이지네이션 사양으로 인출합니다.
 * 관리자 대시보드 실시간 로그 뷰어 매핑용으로 사용됩니다.
 */
export function getCrawlLogs(
  limit: number = 100,
  offset: number = 0,
): CrawlLogRecord[] {
  return db
    .prepare(
      "SELECT * FROM crawl_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?",
    )
    .all(limit, offset) as CrawlLogRecord[];
}

/**
 * 수집 로그 테이블의 전체 데이터를 일괄 정화하여 비웁니다.
 * 관리자 디스크 용량 정리 액션에 대응합니다.
 */
export function clearAllCrawlLogs(): void {
  db.prepare("DELETE FROM crawl_logs").run();
}

/**
 * 특정 수집 클라이언트 및 그 클라이언트가 남긴 수집 데이터를 연쇄 삭제(Cascade)합니다.
 * 관리자의 블랙리스트 기기 영구 추방 기능에 대응합니다.
 */
export function purgeClient(clientId: string): void {
  db.prepare("DELETE FROM clients WHERE client_id = ?").run(clientId);
}

/**
 * 수집기 장치가 송출한 실시간 크롤링 결과물 패킷 데이터를 SQLite crawl_logs 테이블에 동기 적재합니다.
 * 외래 키(foreign key) 제약 위반으로 인한 크래시를 방지하기 위해, 기기가 미등록 상태일 시 자동 가가입 시킨 후 로그를 저장합니다.
 *
 * @param clientId - 수집 장치 UUID
 * @param logMessage - 직렬화된 크롤링 가공 텍스트 바디
 * @param timestamp - 수집 시점 타임스탬프
 */
export function insertCrawlLog(
  clientId: string,
  logMessage: string,
  timestamp: number,
): void {
  // 외래 키 위반 방지를 위해 clients 테이블에 해당 기기가 부재 시 조용히 가등록 처리
  db.prepare(
    "INSERT OR IGNORE INTO clients (client_id, client_type, connected_at) VALUES (?, ?, ?)",
  ).run(clientId, "plugin", new Date().toISOString());

  // 실물 수집 데이터 로그 영구 기록 단행
  db.prepare(
    "INSERT INTO crawl_logs (client_id, log_message, timestamp) VALUES (?, ?, ?)",
  ).run(clientId, logMessage, timestamp);
}

export default db;
