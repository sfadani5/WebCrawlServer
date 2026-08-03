# Fix ESLint no-explicit-any (20260803061300)

- 변경 일시: 2026-08-03 06:13:00
- 변경 대상: `plugins/basic-plugin/src/content.ts`, `server/src/database.ts`, `server/src/index.ts`
- 변경 내용:
  - `plugins/basic-plugin/src/content.ts`에서 `any`를 제거하고 `unknown` 기반 타입 가드 `isContentMessage`를 도입하여 메시지 유효성을 검증하도록 수정했습니다.
  - `server/src/database.ts`에서 `ClientRecord`, `CrawlLogRecord` 인터페이스를 도입하고 `getAllClients`, `getCrawlLogs`의 반환 타입을 `any[]`에서 구체화했습니다.
  - `server/src/index.ts`에서 `WebSocketMessage` 페이로드 타입을 `unknown`으로 변경하고 `catch` 블록을 `unknown` 기반 오류 처리로 수정했습니다.
- 변경 이유:
  - `@typescript-eslint/no-explicit-any` 룰의 lint 오류를 제거하고 타입 안전성을 개선하기 위해.
- 관련 문서:
  - `docs/rule/R-00103 workflow-management.md`
  - `docs/askLogs/ask-20260803054953.md`
