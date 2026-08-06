// plugins/basic-plugin/src/types/index.ts

/** 패킷 페이로드 물리 데이터 포맷 구별자 */
export type PayloadType = "json" | "binary_base64" | "raw_text" | "chunk_stream";

/** 파일 및 바이너리 자원 송수신 메타데이터 인터페이스 */
export interface FileMetadata {
  /** 원본 파일명 */
  fileName?: string;
  /** 파일 MIME 타입 */
  mimeType?: string;
  /** 파일 크기 (Bytes) */
  fileSize?: number;
  /** 대용량 파일 분할 조각 인덱스 */
  chunkIndex?: number;
  /** 전체 분할 조각 수 */
  totalChunks?: number;
}

/** 패킷 확장 메타데이터 인터페이스 */
export interface PacketMetadata {
  /** 패킷 생성 시점 타임스탬프 */
  timestamp: number;
  /** 요청 추적 고유 ID */
  traceId?: string;
  /** 첨부 파일 메타데이터 */
  fileMeta?: FileMetadata;
  /** 동적 확장 파라미터 맵 */
  extraParams?: Record<string, unknown>;
}

/**
 * 표준 확장형 웹소켓 통신 패킷 봉투 규격 (ADR-002)
 * senderId, targetId, action, payloadType, payload, meta 구조를 준수합니다.
 */
export interface WebSocketPacket<T = unknown> {
  /** 송신 수집 노드 고유 UUID (clientId) */
  senderId: string;
  /** 수신 타깃 식별자 (ALL, SERVER, 또는 특정 UUID) */
  targetId?: string | "ALL" | "SERVER";
  /** 지시 액션 명령 문자열 */
  action: string;
  /** 페이로드 물리 포맷 */
  payloadType: PayloadType;
  /** 실질 데이터 바디 */
  payload: T;
  /** 확장 메타데이터 객체 */
  meta: PacketMetadata;
}

/** 사이드바 대시보드 탭 구분 타입 */
export type TabType = "basic" | "info" | "debug";

/** 웹소켓 연결 상태 응답 객체 */
export interface SocketStatusResponse {
  /** 소켓 연결 여부 */
  connected: boolean;
  /** 클라이언트 고유 UUID */
  clientId?: string;
  /** 서버 포트 번호 */
  port?: number;
}

/** 브라우저 스펙 정보 객체 */
export interface BrowserInfo {
  /** 유저 에이전트 문자열 */
  userAgent: string;
  /** 브라우저 언어 설정 */
  language: string;
  /** 운영체제 플랫폼 */
  platform: string;
  /** 브라우저 벤더 */
  vendor: string;
  /** 쿠키 활성화 여부 */
  cookieEnabled: boolean;
  /** 네트워크 연결 상태 */
  onlineStatus: boolean;
}

/** 브라우저 프로세서 성능 정보 객체 */
export interface ProcessorInfo {
  /** CPU 논리 코어 수 */
  hardwareConcurrency: number;
  /** 디바이스 메모리 (GB, 선택) */
  deviceMemory?: number;
  /** 최대 터치 포인트 수 */
  maxTouchPoints: number;
}
