# 작업 요청 (ask.md)

npx tsc --project server\tsconfig.json
server/src/database.ts:67:3 - error TS2322: Type 'unknown[]' is not assignable to type 'ClientRecord[]'.
  Type 'unknown' is not assignable to type 'ClientRecord'.

67   return db.prepare("SELECT * FROM clients ORDER BY connected_at DESC").all();
     ~~~~~~

server/src/database.ts:78:3 - error TS2322: Type 'unknown[]' is not assignable to type 'CrawlLogRecord[]'.
  Type 'unknown' is not assignable to type 'CrawlLogRecord'.

78   return db
     ~~~~~~


Found 2 errors in the same file, starting at: server/src/database.ts:67

원인을 분석 하고 해결해 
원인과 해결 방안 자세한 사항을 docs\CHANGELOG\에 기록 해줘 