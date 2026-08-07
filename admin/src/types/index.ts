// admin/src/types/index.ts

/** 수집 노드 클라이언트 데이터 구조체 */
export interface Client {
  /** 노드 고유 UUID */
  client_id: string;
  /** 클라이언트 구분 타입 */
  client_type: string;
  /** 노드 한글 별칭 (Alias) */
  alias?: string;
  /** 담당 수집 워커 ID */
  assigned_worker_id?: string;
  /** 노드 전용 물리 저장 경로 */
  custom_storage_path?: string;
  /** 최초 접속 타임스탬프 또는 ISO 문자열 */
  connected_at: string;
  /** 백엔드 실시간 소켓 가동 여부 */
  is_online?: boolean;
  /** 사이드바 UI 활성화 여부 */
  is_sidebar_open?: boolean;
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

/** 워커 데이터베이스 기록 구조체 */
export interface WorkerRecord {
  /** 워커 고유 ID */
  worker_id: string;
  /** 워커 한글 이름 */
  worker_name: string;
  /** 대상 DB 파일 상대 경로 */
  db_file_path: string;
  /** 대상 테이블 이름 */
  table_name: string;
  /** 워커 전용 저장소 루트 경로 */
  storage_root_path: string;
  /** 직렬화된 커스텀 필드 JSON 문자열 */
  schema_json: string;
  /** 디폴트 워커 여부 (1 또는 0) */
  is_default: number;
  /** 생성 시각 */
  created_at: string;
}

/** 크롤링 수집 로그 데이터 구조체 */
export interface CrawlLog {
  /** DB 레코드 PK ID */
  id: number;
  /** 수집 노드 UUID */
  client_id: string;
  /** 도메인 */
  domain?: string;
  /** 수집 액션 */
  action?: string;
  /** 파일 물리 경로 */
  file_path?: string;
  /** 파일 크기 (Bytes) */
  file_size?: number;
  /** 직렬화된 로그 메시지 바디 */
  log_message: string;
  /** 수집 시점 타임스탬프 */
  timestamp: number;
}

/** 웹소켓 메시지 규격 구조체 */
export interface WebSocketMessage<T = unknown> {
  /** 송신 노드 식별자 */
  senderId: string;
  /** 수신 타깃 식별자 (ALL, SERVER, 또는 특정 UUID) */
  targetId?: string | "ALL" | "SERVER";
  /** 지시 액션 명령 문자열 */
  action: string;
  /** 페이로드 물리 포맷 */
  payloadType?: "json" | "binary_base64" | "raw_text" | "chunk_stream";
  /** 실질 페이로드 바디 */
  payload: T;
  /** 메타데이터 객체 */
  meta?: {
    timestamp: number;
    traceId?: string;
    extraParams?: Record<string, unknown>;
  };
}

/** 웹소켓 통신 가동 상태 타입 */
export type ConnectionStatus = "CONNECTED" | "DISCONNECTED";

/** 대시보드 활성 메인 탭 타입 */
export type ActiveTab = "clients" | "workers" | "console" | "network" | "logs" | "favicon";

/** 노드 리스트 출력 필터 모드 타입 */
export type NodeStatusFilter = "ONLINE" | "ALL" | "OFFLINE";

/** 네트워크 진단 터미널 콘솔 로그 엔트리 구조체 */
export interface TerminalLogEntry {
  /** 로그 고유 ID */
  id: string;
  /** 로그 생성 타임스탬프 (ISO 문자열) */
  timestamp: string;
  /** 로그 타입 (정보, 성공, 경고, 오류, 명령어) */
  type: "info" | "success" | "warning" | "error" | "cmd";
  /** 로그 메시지 본문 */
  text: string;
}

/** 네트워크 헬스체크 응답 구조체 */
export interface NetworkHealthResponse {
  /** 서버 포트 바인딩 상태 */
  portBound: boolean;
  /** 포트 번호 */
  port: number;
  /** 서버 업타임 여부 */
  uptime: boolean;
  /** 서버 시작 시각 */
  startedAt: string;
  /** DB WAL 모드 상태 */
  walModeEnabled: boolean;
  /** 메모리 사용량 (MB) */
  memoryUsage: number;
  /** 응답 지연 시간 (ms) */
  responseTime: number;
}

/** Ping 테스트 결과 구조체 */
export interface PingTestResult {
  /** 테스트 대상 노드 ID */
  clientId: string;
  /** 왕복 지연 시간 (ms) */
  rtt: number;
  /** 테스트 성공 여부 */
  success: boolean;
  /** 테스트 타임스탬프 */
  timestamp: number;
}

/** API 응답 속도 진단 결과 구조체 */
export interface ApiSpeedTestResult {
  /** 엔드포인트 URL */
  endpoint: string;
  /** 응답 시간 (ms) */
  responseTime: number;
  /** 응답 성공 여부 */
  success: boolean;
  /** 테스트 타임스탬프 */
  timestamp: number;
}
