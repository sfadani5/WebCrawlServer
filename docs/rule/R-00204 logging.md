# R-00204 docs/rule/R-00204 logging.md

`WebCrawlServer`는 로컬 로그 파일 기반의 운영 기록을 사용합니다. 본 문서는 로그 분류, 저장 위치, 기록 규칙을 정의합니다.

## 로그 분류

- `logs/server_system.log`: 서버 상태, 예외, 포트 바인딩, WebSocket 연결 상태 기록
- `logs/admin_activity.log`: 관리자 명령 송출, 블랙리스트 처리, 관리 작업 기록
- `logs/plugins_comm.log`: 플러그인 통신 이벤트, 수집 패킷 송수신 기록

## 기록 규칙

- 로그는 동기식 `appendFileSync` 방식으로 기록합니다.
- 로그 파일이 존재하지 않으면 자동으로 생성해야 합니다.
- 로그 라인은 타임스탬프, 레벨, 식별자, 메시지를 포함해야 합니다.

## 운영 지침

- 오류와 예외는 `server_system.log`에 기록합니다.
- 관리자 작업은 `admin_activity.log`에 기록합니다.
- 플러그인 통신은 `plugins_comm.log`에 기록합니다.
- 로그 파일은 `logs/` 폴더에 위치해야 합니다.



