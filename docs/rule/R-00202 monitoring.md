# R-00202 docs/rule/R-00202 monitoring.md

`WebCrawlServer`는 로컬 개발 환경을 기준으로 서버 및 클라이언트 상태 모니터링을 지원해야 합니다. 본 문서는 핵심 관찰 지표와 수집 방법을 정의합니다.

## 모니터링 대상

- WebSocket 연결 상태
- 활성 클라이언트 수
- 수집 로그 저장 상태
- 백엔드 서버 예외 로그
- 관리자 UI와 플러그인 간 통신 상태

## 수집 방식

- 실시간 WebSocket 이벤트를 통해 연결/종료 상태를 감시합니다.
- 로그 파일(`logs/server_system.log`, `logs/admin_activity.log`, `logs/plugins_comm.log`)을 통해 에러 및 활동을 추적합니다.
- 관리자 UI에서는 REST API로 `clients`와 `crawl_logs` 데이터를 조회합니다.

## 권장 지침

- 서버는 `activeClients` 맵을 통해 클라이언트 수를 실시간으로 추적합니다.
- WebSocket 연결 실패나 파싱 오류는 `server_system.log`에 기록합니다.
- 플러그인 통신 로그는 `plugins_comm.log`로 저장되어야 합니다.
- 관리자 UI는 통신 상태를 시각적으로 표시해야 합니다.



