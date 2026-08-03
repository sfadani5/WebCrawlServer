# R-00203 docs/rule/R-00203 database.md

`WebCrawlServer`는 SQLite 기반 로컬 데이터베이스를 사용합니다. 본 문서는 데이터베이스 설계, 마이그레이션, 백업 및 관리자 UI API 관점을 다룹니다.

## 스키마

- `clients` 테이블
  - `client_id` TEXT PRIMARY KEY
  - `client_type` TEXT NOT NULL
  - `connected_at` TEXT NOT NULL
- `crawl_logs` 테이블
  - `id` INTEGER PRIMARY KEY AUTOINCREMENT
  - `client_id` TEXT NOT NULL
  - `log_message` TEXT NOT NULL
  - `timestamp` INTEGER NOT NULL
  - FOREIGN KEY (`client_id`) REFERENCES `clients`(`client_id`) ON DELETE CASCADE

## 마이그레이션

- 현재는 서버 기동 시 `initializeDatabase()`에서 자동으로 테이블을 생성합니다.
- 향후 스키마 변경 시에는 별도 마이그레이션 스크립트를 도입해야 합니다.

## 백업

- 데이터 파일은 `databases/data.db`에 저장됩니다.
- 정기 백업은 파일 복사 수준에서 관리해야 합니다.
- `data.db-wal` 파일이 존재하면 정상적인 WAL 모드 트랜잭션 처리 중임을 의미합니다.

## 관리자 UI API

- `/api/db/clients`: 등록된 클라이언트 목록 조회
- `/api/db/logs`: 최근 수집 로그 조회
- `DELETE /api/db/logs`: 전체 수집 로그 삭제
- `DELETE /api/db/clients/:clientId`: 특정 클라이언트 및 관련 로그 삭제

## 설계 지침

- 외래 키 무결성을 위해 `foreign_keys = ON`을 사용합니다.
- WAL 모드(`journal_mode = WAL`)를 통해 동시 읽기/쓰기 성능을 개선합니다.
- DB 파일 경로는 `import.meta.url` 기반 절대 경로로 계산합니다.



