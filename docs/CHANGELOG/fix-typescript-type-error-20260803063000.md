# 2026-08-03 TypeScript 타입 오류 수정

## 개요

server/src/database.ts에서 발생한 TypeScript 컴파일 오류를 해결했습니다.

## 문제

`npx tsc --project server\tsconfig.json` 명령어 실행 시 다음과 같은 TypeScript 컴파일 오류가 발생했습니다:

```
server/src/database.ts:67:3 - error TS2322: Type 'unknown[]' is not assignable to type 'ClientRecord[]'.
  Type 'unknown' is not assignable to type 'ClientRecord'.

67   return db.prepare("SELECT * FROM clients ORDER BY connected_at DESC").all();
     ~~~~~~

server/src/database.ts:78:3 - error TS2322: Type 'unknown[]' is not assignable to type 'CrawlLogRecord[]'.
  Type 'unknown' is not assignable to type 'CrawlLogRecord'.

78   return db
     ~~~~~~
```

## 원인 분석

### 근본 원인
`@types/better-sqlite3` v7.6.11에서 `Statement.all()` 메서드의 반환 타입이 `unknown[]`으로 정의되어 있습니다. 

server/src/database.ts에서 정의된 두 함수:
- `getAllClients(): ClientRecord[]`
- `getCrawlLogs(limit: number, offset: number): CrawlLogRecord[]`

들은 구체적인 인터페이스 타입(`ClientRecord[]`, `CrawlLogRecord[]`)을 반환하도록 선언되어 있지만, 
`db.prepare().all()` 메서드는 TypeScript 타입 시스템에서 `unknown[]`을 반환하도록 타입 정의되어 있어 타입 호환성 오류가 발생했습니다.

### 타입 정의 문제
better-sqlite3 라이브러리는 Runtime에서 SQL query 결과를 JavaScript 객체 배열로 반환하지만, 
TypeScript 타입 정의(@types/better-sqlite3)에서는 query 결과의 구조를 알 수 없기 때문에 가장 일반적인 타입인 `unknown[]`으로 정의합니다.

### 인터페이스 정의
```typescript
// server/src/database.ts
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
```

이 인터페이스들은 데이터베이스 테이블 스키마와 정합성이 맞춰져 있지만, TypeScript 컴파일러는 이 사실을 자동으로 추론할 수 없습니다.

## 해결 방안

### 적용한 해결 방법: 타입 어서션 사용

가장 단순하고 호환성이 높은 방식으로, 반환 값에 명시적인 타입 어서션을 적용했습니다.

**수정 전 코드:**
```typescript
export function getAllClients(): ClientRecord[] {
  return db.prepare("SELECT * FROM clients ORDER BY connected_at DESC").all();
}

export function getCrawlLogs(
  limit: number = 100,
  offset: number = 0,
): CrawlLogRecord[] {
  return db
    .prepare(
      "SELECT * FROM crawl_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?",
    )
    .all(limit, offset);
}
```

**수정 후 코드:**
```typescript
export function getAllClients(): ClientRecord[] {
  return db.prepare("SELECT * FROM clients ORDER BY connected_at DESC").all() as ClientRecord[];
}

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
```

### 대안 방안 고려

**방안 2: 제네릭 타입 사용**
better-sqlite3 v7.6.11+부터는 PreparedStatement에 제네릭 타입 파라미터를 지원하는 것으로 알려졌지만, 
현재 프로젝트에서 사용중인 `@types/better-sqlite3` v7.6.11의 타입 정의는 여전히 `unknown[]`을 반환하도록 되어 있습니다.
제네릭 타입 방안은 타입 안전성을 높일 수 있지만, 현재 타입 정의 버전에서는 작동하지 않을 수 있습니다.

**방안 3: 타입 가드 함수 구현**
런타임 타입 검증을 위한 타입 가드 함수를 구현할 수 있지만, 이 경우 불필요한 런타임 오버헤드가 발생하고 코드의 복잡성이 증가합니다.

### 선택 이유
- **간결성**: 타입 어서션은 코드 변경을 최소화합니다.
- **호환성**: 모든 TypeScript 버전과 라이브러리에서 동작합니다.
- **안전성**: 데이터베이스 스키마와 인터페이스가 정합성이 맞춰져 있으므로 타입 어서션은 안전합니다.

## 변경 파일

### server/src/database.ts

**67라인 수정:**
```typescript
// 전
return db.prepare("SELECT * FROM clients ORDER BY connected_at DESC").all();

// 후
return db.prepare("SELECT * FROM clients ORDER BY connected_at DESC").all() as ClientRecord[];
```

**78-82라인 수정:**
```typescript
// 전
return db
  .prepare(
    "SELECT * FROM crawl_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?",
  )
  .all(limit, offset);

// 후
return db
  .prepare(
    "SELECT * FROM crawl_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?",
  )
  .all(limit, offset) as CrawlLogRecord[];
```

## 검증

### TypeScript 컴파일 확인
```powershell
Set-Location "E:\up\0-project\git\xtx9999\WebCrawlServer"
npx tsc --project server\tsconfig.json
```

**결과**: ✅ 컴파일 성공 (exit code 0)

### 영향 범위 분석
- 이 수정은 TypeScript 컴파일 타입 오류를 해결할 뿐만 아니라, 코드 가독성을 유지합니다.
- 런타임 동작에는 아무런 영향이 없습니다. (타입 어서션은 컴파일 시 제거됨)
- 기존 기능 보니 모든 테스트는 동일한 방식으로 동작합니다.

## 관련 문서

- AGENTS.md: ESM 기반 TypeScript 개발 규칙
- docs/rule/R-00106 coding.md: 코드 작성 규칙
- docs/rule/R-00203 database.md: DB 스키마 및 마이그레이션 지침

## 뒤늦은 고려 사항

만약 향후 better-sqlite3의 타입 정의가 개선되어 query 결과 타입을 추론할 수 있게 된다면, 
타입 어서션을 제거하고 제네릭 타입을 사용할 수 있습니다. 그러나 현재로서는 타입 어서션이 가장 현실적인 해결 방안입니다.

---

**작업자**: Mistral Vibe
**생성 일시**: 2026-08-03 06:30:00
**상태**: 완료
