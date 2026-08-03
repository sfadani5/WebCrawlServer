# R-00106 docs/rule/R-00106 coding.md

`WebCrawlServer`는 ESM 기반 TypeScript 코드를 기본으로 합니다. 본 문서는 코드 작성 규칙과 스타일 가이드를 정의합니다.

## 코드 규칙

- JavaScript 대신 TypeScript를 사용합니다.
- 모듈 시스템은 ESM(`import` / `export`)을 사용합니다.
- CommonJS(`require`, `module.exports`)는 사용하지 않습니다.
- 타입을 명시적으로 정의하고, 가능한 경우 `any` 사용을 최소화합니다.
- Promise와 비동기 함수는 `async/await`로 명확히 처리합니다.

## 파일 작성

- 서버 코드: `.ts`
- React 컴포넌트: `.tsx`
- 설정 파일: `.mts`, `.json`
- 문서 파일: `.md`

## 예외 처리

- 오류 처리는 상세 메시지와 함께 로그를 남겨야 합니다.
- 불필요한 에러 무시는 피합니다.
- 입력 검증이 필요한 경우 적절한 방어 코드를 작성합니다.



