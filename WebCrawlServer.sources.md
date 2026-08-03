## eslint.config.mts

```mts
import { Linter } from "eslint";
import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";

// 모노레포 전체 워크스페이스에 통합 적용할 Flat Config 정의 선언
const config: Linter.Config[] = [
  {
    // 정적 스타일 규칙 검사 대상에서 제외할 빌드 부산물 디렉토리 목록 명시
    ignores: ["**/dist/**", "**/node_modules/**", "**/public/**"],
  },
  {
    // 분석 대상 소스코드 포맷 범위 지정 (TypeScript 전체 범위 적용)
    files: ["**/*.ts", "**/*.tsx", "**/*.mts"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        // 루트의 타입 분석 명세를 연계 상속하여 분석 신뢰도 유지
        project: "./tsconfig.base.json",
      },
    },
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "@typescript-eslint": typescriptPlugin as any,
    },
    rules: {
      // any 변수 선언 시 에러를 유발하여 unknown 전환 유도
      "@typescript-eslint/no-explicit-any": "error",
      // 컴파일 에러를 사전에 차단하기 위해 사용되지 않는 변수 감지 시 경고 활성화
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      // 일관된 정적 코드 가독성 제고를 위해 세미콜론 사용 필수화
      semi: ["error", "always"],
    },
  },
];

export default config;
```

---

## package.json

```json
{
  "name": "WebCrawlServer",
  "private": true,
  "workspaces": [
    "server",
    "admin",
    "plugins/basic-plugin"
  ],
  "scripts": {
    "admin:dev": "npm run dev --workspace=admin",
    "admin:start": "npx pm2 start admin/start.js --name WebCrawlAdmin",
    "admin:status": "npx pm2 show WebCrawlAdmin",
    "admin:logs": "npx pm2 logs WebCrawlAdmin --lines 100",
    "admin:stop": "npx pm2 delete WebCrawlAdmin",
    "plugin:basic:dev": "npm run dev --workspace=basic-plugin",
    "server:start": "npx pm2 start server/dist/index.js --name WebCrawlServer",
    "server:status": "npx pm2 show WebCrawlServer",
    "server:logs": "npx pm2 logs WebCrawlServer --lines 100",
    "server:stop": "npx pm2 delete WebCrawlServer",
    "lint": "eslint .",
    "clean-reset": "npx pm2 kill; Stop-Process -Name \"node\" -Force -ErrorAction SilentlyContinue; Get-ChildItem -Path . -Filter \"dist\" -Recurse -Directory | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue; Get-ChildItem -Path . -Filter \"node_modules\" -Recurse -Directory | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue; Remove-Item -Path .\\package-lock.json -Force -ErrorAction SilentlyContinue; npm install"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.11",
    "@types/express": "^5.0.0",
    "@types/node": "^22.13.1",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "@types/ws": "^8.5.14",
    "@typescript-eslint/eslint-plugin": "^8.22.0",
    "@typescript-eslint/parser": "^8.22.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^10.8.0",
    "jiti": "^2.4.2",
    "postcss": "^8.5.1",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.2",
    "typescript-eslint": "^8.22.0",
    "vite": "^5.4.14",
    "@vitejs/plugin-react": "^4.3.4"
  }
}
```

---

## tsconfig.base.json

```json
{
  "compilerOptions": {
	"target": "ESNext",
	"module": "NodeNext",
	"moduleResolution": "NodeNext",
	"strict": true,
	"sourceMap": true,
	"esModuleInterop": true,
	"forceConsistentCasingInFileNames": true,
	"skipLibCheck": true
  }
}
```

---

## tsconfig.json

```json
{
  "extends": "./tsconfig.base.json",
  "include": [
    "server/src/**/*",
    "admin/src/**/*",
    "plugins/basic-plugin/src/**/*"
  ]
}
```

---

## admin/index.html

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WebCrawlServer 관리자 대시보드</title>
  </head>
  <body class="bg-gray-900 text-white font-sans select-none">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## admin/package.json

```json
{
  "name": "admin",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  }
}
```

---

## admin/postcss.config.js

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

## admin/start.js

```javascript
import { spawn } from "node:child_process";

// 가상 파이프 스트림(stdout/stderr)에 명시적 리스너를 바인딩하여 부모 프로세스 이벤트 루프를 강제 유지
const child = spawn("npm", ["run", "dev"], {
  shell: true,
  cwd: "admin",
  windowsHide: true, // 윈도우의 가상 콘솔창 번쩍임 깜빡임 원천 제거
  stdio: "pipe", // 가상 입출력 파이프 스트림 장착
});

// 자식 프로세스의 출력 데이터를 부모 콘솔 스트림으로 중계 전달하여 이벤트 루프 생존 확립
child.stdout.on("data", (data) => {
  process.stdout.write(data);
});

child.stderr.on("data", (data) => {
  process.stderr.write(data);
});

// 자식 프로세스가 최종 소멸 시 부모도 함께 종료 처리
child.on("exit", (code) => {
  process.exit(code || 0);
});
```

---

## admin/tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

---

## admin/tsconfig.json

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
	"jsx": "react-jsx",
	"lib": ["DOM", "DOM.Iterable", "ESNext"],
	"outDir": "../server/public",
	"rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

---

## admin/vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // 빌드 최종 출력물 적재 폴더를 백엔드의 정적 리소스 서빙 영역인 server/public 폴더로 강제 우회
    outDir: "../server/public",
    // 컴파일 시점에 기존 퍼블릭 서빙 영역에 존재하던 구형 찌꺼기 파일 전량 강제 소거 일괄 정제
    emptyOutDir: true,
  },
});
```

---

## server/package.json

```json
{"name":"server","version":"1.0.0","private":true,"type":"module","dependencies":{"better-sqlite3":"^13.0.2","express":"^5.2.1","ws":"^8.21.1"}}
```

---

## server/tsconfig.json

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
	"outDir": "./dist",
	"rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

---

## admin/public/icon16.jpg

[BINARY FILE SKIPPED]

---

## admin/src/App.tsx

```tsx
import { useState, useCallback } from 'react';
import { useAdminDbApi } from './hooks/useAdminDbApi.js';
import { useAdminSocket } from './hooks/useAdminSocket.js';
import { GcpMainLayout } from './components/layout/GcpMainLayout.js';
import { GcpClientsView } from './components/views/GcpClientsView.js';
import { GcpControlConsoleView } from './components/views/GcpControlConsoleView.js';
import { GcpCrawlLogsView } from './components/views/GcpCrawlLogsView.js';
import { ActiveTab } from './types/index.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('clients');
  const [targetId, setTargetId] = useState<string>('ALL');

  const {
    clients,
    logs,
    setLogs,
    loadClients,
    loadLogs,
    executeClearLogs,
    executePurgeClient
  } = useAdminDbApi();

  const handleConnect = useCallback(() => {
    loadClients();
    loadLogs();
  }, [loadClients, loadLogs]);

  const { wsStatus, dispatchCommand } = useAdminSocket(setLogs, handleConnect);

  const handleSelectTarget = (clientId: string) => {
    setTargetId(clientId);
    setActiveTab('console');
  };

  return (
    <GcpMainLayout
      wsStatus={wsStatus}
      clientCount={clients.length}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onRefresh={() => {
        loadClients();
        loadLogs();
      }}
      onClearLogs={executeClearLogs}
    >
      {activeTab === 'clients' && (
        <GcpClientsView
          clients={clients}
          logCount={logs.length}
          onSelectTarget={handleSelectTarget}
          onPurgeClient={executePurgeClient}
        />
      )}
      {activeTab === 'console' && (
        <GcpControlConsoleView
          targetId={targetId}
          setTargetId={setTargetId}
          onDispatch={dispatchCommand}
        />
      )}
      {activeTab === 'logs' && (
        <GcpCrawlLogsView logs={logs} onClearLogs={executeClearLogs} />
      )}
    </GcpMainLayout>
  );
}
```

---

## admin/src/index.css

```css
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

html {
  font-family: 'Noto Sans KR', sans-serif;
  background-color: #141A23;
}

body {
  margin: 0;
  min-height: 100vh;
  background-color: #141A23;
  color: #E8EAED;
}

* {
  box-sizing: border-box;
}

* {
  box-sizing: border-box;
}
```

---

## admin/src/main.tsx

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## plugins/basic-plugin/package.json

```json
{
  "name": "basic-plugin",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build"
  }
}
```

---

## plugins/basic-plugin/popup.html

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>수집기 제어판</title>
  </head>
  <body class="bg-gray-900 text-white w-[300px] p-4 font-sans select-none">
    <div id="root"></div>
    <script type="module" src="/src/popup.tsx"></script>
  </body>
</html>
```

---

## plugins/basic-plugin/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
	"jsx": "react-jsx",
	"lib": ["DOM", "DOM.Iterable", "ESNext"],
	"outDir": "./dist",
	"rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

---

## plugins/basic-plugin/vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      // 플러그인을 구성하는 3대 영역을 개별 진입 엔트리포인트로 동시 빌드
      input: {
        popup: resolve(__dirname, "popup.html"),
        background: resolve(__dirname, "src/background.ts"),
        content: resolve(__dirname, "src/content.ts"),
      },
      output: {
        // 브라우저가 정적 경로를 완벽히 인지하도록 해시값 없는 플평한 파일 구조 배출 강제
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
});
```

---

## server/dist/database.js

```javascript
import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
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
export function initializeDatabase() {
    // 1단계: 연결 이력이 수립된 클라이언트(플러그인 및 어드민)의 기기 고정 스토리지 정보 관리 테이블 생성
    db.prepare(`
    CREATE TABLE IF NOT EXISTS clients (
      client_id TEXT PRIMARY KEY,
      client_type TEXT NOT NULL,
      connected_at TEXT NOT NULL
    )
  `).run();
    // 2단계: 각 브라우저 플러그인이 실시간으로 수집하고 중계하여 적재한 수집 데이터 원천 로그 기록 테이블 생성
    db.prepare(`
    CREATE TABLE IF NOT EXISTS crawl_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id TEXT NOT NULL,
      log_message TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (client_id) REFERENCES clients (client_id) ON DELETE CASCADE
    )
  `).run();
}
/**
 * 데이터베이스에 기록된 모든 수집 클라이언트 목록을 조회합니다.
 * 관리자 기기 관리 화면 매핑용으로 사용됩니다.
 */
export function getAllClients() {
    return db.prepare("SELECT * FROM clients ORDER BY connected_at DESC").all();
}
/**
 * 저장된 크롤링 수집 로그 목록을 최신순 페이지네이션 사양으로 인출합니다.
 * 관리자 대시보드 실시간 로그 뷰어 매핑용으로 사용됩니다.
 */
export function getCrawlLogs(limit = 100, offset = 0) {
    return db
        .prepare("SELECT * FROM crawl_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?")
        .all(limit, offset);
}
/**
 * 수집 로그 테이블의 전체 데이터를 일괄 정화하여 비웁니다.
 * 관리자 디스크 용량 정리 액션에 대응합니다.
 */
export function clearAllCrawlLogs() {
    db.prepare("DELETE FROM crawl_logs").run();
}
/**
 * 특정 수집 클라이언트 및 그 클라이언트가 남긴 수집 데이터를 연쇄 삭제(Cascade)합니다.
 * 관리자의 블랙리스트 기기 영구 추방 기능에 대응합니다.
 */
export function purgeClient(clientId) {
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
export function insertCrawlLog(clientId, logMessage, timestamp) {
    // 외래 키 위반 방지를 위해 clients 테이블에 해당 기기가 부재 시 조용히 가등록 처리
    db.prepare("INSERT OR IGNORE INTO clients (client_id, client_type, connected_at) VALUES (?, ?, ?)").run(clientId, "plugin", new Date().toISOString());
    // 실물 수집 데이터 로그 영구 기록 단행
    db.prepare("INSERT INTO crawl_logs (client_id, log_message, timestamp) VALUES (?, ?, ?)").run(clientId, logMessage, timestamp);
}
export default db;
//# sourceMappingURL=database.js.map
```

---

## server/dist/database.js.map

```map
{"version":3,"file":"database.js","sourceRoot":"","sources":["../src/database.ts"],"names":[],"mappings":"AAAA,OAAO,QAAQ,MAAM,gBAAgB,CAAC;AACtC,OAAO,EAAE,aAAa,EAAE,MAAM,UAAU,CAAC;AACzC,OAAO,EAAE,OAAO,EAAE,OAAO,EAAE,MAAM,WAAW,CAAC;AAe7C,0DAA0D;AAC1D,MAAM,UAAU,GAAG,aAAa,CAAC,MAAM,CAAC,IAAI,CAAC,GAAG,CAAC,CAAC;AAClD,MAAM,SAAS,GAAG,OAAO,CAAC,UAAU,CAAC,CAAC;AAEtC,gFAAgF;AAChF,MAAM,MAAM,GAAG,OAAO,CAAC,SAAS,EAAE,IAAI,EAAE,IAAI,EAAE,WAAW,EAAE,SAAS,CAAC,CAAC;AAEtE,yCAAyC;AACzC,MAAM,EAAE,GAAG,IAAI,QAAQ,CAAC,MAAM,CAAC,CAAC;AAEhC,uCAAuC;AACvC,EAAE,CAAC,MAAM,CAAC,mBAAmB,CAAC,CAAC,CAAC,wBAAwB;AACxD,EAAE,CAAC,MAAM,CAAC,oBAAoB,CAAC,CAAC,CAAC,6BAA6B;AAE9D;;;GAGG;AACH,MAAM,UAAU,kBAAkB;IAChC,6DAA6D;IAC7D,EAAE,CAAC,OAAO,CACR;;;;;;GAMD,CACA,CAAC,GAAG,EAAE,CAAC;IAER,+DAA+D;IAC/D,EAAE,CAAC,OAAO,CACR;;;;;;;;GAQD,CACA,CAAC,GAAG,EAAE,CAAC;AACV,CAAC;AAED;;;GAGG;AACH,MAAM,UAAU,aAAa;IAC3B,OAAO,EAAE,CAAC,OAAO,CAAC,kDAAkD,CAAC,CAAC,GAAG,EAAoB,CAAC;AAChG,CAAC;AAED;;;GAGG;AACH,MAAM,UAAU,YAAY,CAC1B,QAAgB,GAAG,EACnB,SAAiB,CAAC;IAElB,OAAO,EAAE;SACN,OAAO,CACN,mEAAmE,CACpE;SACA,GAAG,CAAC,KAAK,EAAE,MAAM,CAAqB,CAAC;AAC5C,CAAC;AAED;;;GAGG;AACH,MAAM,UAAU,iBAAiB;IAC/B,EAAE,CAAC,OAAO,CAAC,wBAAwB,CAAC,CAAC,GAAG,EAAE,CAAC;AAC7C,CAAC;AAED;;;GAGG;AACH,MAAM,UAAU,WAAW,CAAC,QAAgB;IAC1C,EAAE,CAAC,OAAO,CAAC,yCAAyC,CAAC,CAAC,GAAG,CAAC,QAAQ,CAAC,CAAC;AACtE,CAAC;AAED;;;;;;;GAOG;AACH,MAAM,UAAU,cAAc,CAC5B,QAAgB,EAChB,UAAkB,EAClB,SAAiB;IAEjB,qDAAqD;IACrD,EAAE,CAAC,OAAO,CACR,uFAAuF,CACxF,CAAC,GAAG,CAAC,QAAQ,EAAE,QAAQ,EAAE,IAAI,IAAI,EAAE,CAAC,WAAW,EAAE,CAAC,CAAC;IAEpD,wBAAwB;IACxB,EAAE,CAAC,OAAO,CACR,6EAA6E,CAC9E,CAAC,GAAG,CAAC,QAAQ,EAAE,UAAU,EAAE,SAAS,CAAC,CAAC;AACzC,CAAC;AAED,eAAe,EAAE,CAAC"}
```

---

## server/dist/index.js

```javascript
import express from "express";
import { createServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { initializeDatabase, getAllClients, getCrawlLogs, clearAllCrawlLogs, purgeClient, insertCrawlLog, // 데이터베이스 동기 적재 함수 가져오기
 } from "./database.js";
import { logServerSystem, logAdminActivity, logPluginComm } from "./logger.js";
// 가동 기점에 관계 없이 물리 서빙 리소스 폴더인 server/public 폴더를 실시간 절대 추적 연산
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicPath = resolve(__dirname, "..", "public");
const app = express();
const server = createServer(app);
function getErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    if (typeof error === "string")
        return error;
    return "알 수 없는 오류";
}
app.use(express.json());
// 절대경로 매핑을 적용하여 server/public 폴더 내부의 HTML/JS 정적 배포본을 안전 서빙
app.use(express.static(publicPath));
// 통합 데이터베이스 초기 마운트 기동 및 테이블 스키마 자동 구축
initializeDatabase();
// 활성 상태의 전체 연결 세션을 인메모리 영역에서 선별 통제하는 전역 맵 선언
export const activeClients = new Map();
// 관리자 전용 데이터베이스 REST API 중계 라우터 수립
// [REST API 1] 등록된 모든 수집 클라이언트 장비 데이터 목록 조회
app.get("/api/db/clients", (req, res) => {
    try {
        const clients = getAllClients();
        res.json({ success: true, data: clients });
    }
    catch (error) {
        const errorMessage = getErrorMessage(error);
        logServerSystem("ERROR", `Clients API 에러 반환: ${errorMessage}`);
        res.status(500).json({ success: false, message: errorMessage });
    }
});
// [REST API 2] 영구 적재된 수집 데이터 로그 조회 (최근 100개 한정)
app.get("/api/db/logs", (req, res) => {
    try {
        const logs = getCrawlLogs(100, 0);
        res.json({ success: true, data: logs });
    }
    catch (error) {
        const errorMessage = getErrorMessage(error);
        logServerSystem("ERROR", `Logs API 에러 반환: ${errorMessage}`);
        res.status(500).json({ success: false, message: errorMessage });
    }
});
// [REST API 3] 데이터베이스 저장 로그 일괄 소거 (용량 정화)
app.delete("/api/db/logs", (req, res) => {
    try {
        clearAllCrawlLogs();
        logAdminActivity("SUPER_ADMIN", "DELETE_ALL_LOGS", "데이터베이스 전체 로그 소거 단행");
        res.json({
            success: true,
            message: "데이터베이스의 모든 수집 로그가 일괄 소거되었습니다.",
        });
    }
    catch (error) {
        const errorMessage = getErrorMessage(error);
        logServerSystem("ERROR", `Logs Delete API 에러 반환: ${errorMessage}`);
        res.status(500).json({ success: false, message: errorMessage });
    }
});
// [REST API 4] 특정 기기를 블랙리스트 처리하여 영구 추방 및 관련 데이터 Cascade 강제 연쇄 삭제
app.delete("/api/db/clients/:clientId", (req, res) => {
    try {
        const targetId = req.params.clientId;
        purgeClient(targetId);
        logAdminActivity("SUPER_ADMIN", "PURGE_CLIENT_SESSION", `클라이언트 영구 추방 격리: ${targetId}`);
        res.json({
            success: true,
            message: "지정된 클라이언트 기기가 완전히 차단 제거되었습니다.",
        });
    }
    catch (error) {
        const errorMessage = getErrorMessage(error);
        logServerSystem("ERROR", `Client Purge API 에러 반환: ${errorMessage}`);
        res.status(500).json({ success: false, message: errorMessage });
    }
});
// HTTP 서버 객체를 공유하는 통합 웹소켓 서버 선언
const wss = new WebSocketServer({ server });
// 웹소켓 연결이 포트 9600에 들어올 시 실행될 라우팅 제어부
wss.on("connection", (ws, req) => {
    const host = req.headers.host || "localhost:9600";
    const url = new URL(req.url || "", `http://${host}`);
    const clientId = url.searchParams.get("clientId");
    const clientType = url.searchParams.get("clientType");
    if (!clientId || (clientType !== "plugin" && clientType !== "admin")) {
        ws.close(4000, "식별 정보가 누락되어 커넥션 수립을 거부합니다.");
        return;
    }
    if (activeClients.has(clientId)) {
        const existing = activeClients.get(clientId);
        if (existing && existing.socket.readyState === WebSocket.OPEN) {
            existing.socket.close(4001, "동일한 식별자로 새로운 세션이 진입하여 기존 소켓을 정화합니다.");
        }
        activeClients.delete(clientId);
    }
    activeClients.set(clientId, {
        socket: ws,
        clientId,
        clientType,
        connectedAt: new Date(),
    });
    logServerSystem("INFO", `세션 마운트 성공: [ID: ${clientId}] [TYPE: ${clientType}]`);
    ws.on("message", (rawData) => {
        try {
            const message = JSON.parse(rawData);
            message.senderId = clientId;
            logPluginComm(clientId, message.action, `수신 패킷 수집 중계 처리: ${rawData}`);
            // 실시간 수집 로그 패킷 데이터(CRAWL_LOG) 유입 시, SQLite 데이터베이스 테이블에 실시간 동기 영구 축적
            if (message.action === "CRAWL_LOG") {
                insertCrawlLog(clientId, JSON.stringify(message.payload), Date.now());
            }
            if (message.targetId === "ALL") {
                activeClients.forEach((client) => {
                    if (client.clientId !== clientId &&
                        client.socket.readyState === WebSocket.OPEN) {
                        client.socket.send(JSON.stringify(message));
                    }
                });
                return;
            }
            if (message.targetId && activeClients.has(message.targetId)) {
                const targetSession = activeClients.get(message.targetId);
                if (targetSession &&
                    targetSession.socket.readyState === WebSocket.OPEN) {
                    targetSession.socket.send(JSON.stringify(message));
                }
            }
            else {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        senderId: "server",
                        targetId: clientId,
                        action: "ERROR",
                        payload: {
                            detail: "릴레이 대상 기기가 오프라인 상태이거나 세션이 만료되었습니다.",
                        },
                    }));
                }
            }
        }
        catch {
            // 가드
        }
    });
    ws.on("close", () => {
        activeClients.delete(clientId);
        logServerSystem("INFO", `세션 소멸 해제 완료: [ID: ${clientId}]`);
    });
    ws.on("error", (err) => {
        logServerSystem("WARN", `세션 소켓 예외 에러 감지 [ID: ${clientId}]: ${err.message}`);
    });
});
server.listen(9600, () => {
    logServerSystem("INFO", "통합 백엔드 API 및 WebSocket 서비스 포트 9600에서 정상 바인딩 가동 완료");
    console.log("[시스템] 통합 백엔드 API 및 데이터베이스 서비스 포트 9600에서 정상 구동 중");
});
//# sourceMappingURL=index.js.map
```

---

## server/dist/index.js.map

```map
{"version":3,"file":"index.js","sourceRoot":"","sources":["../src/index.ts"],"names":[],"mappings":"AAAA,OAAO,OAAO,MAAM,SAAS,CAAC;AAC9B,OAAO,EAAE,YAAY,EAAE,MAAM,WAAW,CAAC;AACzC,OAAO,EAAE,eAAe,EAAE,SAAS,EAAE,MAAM,IAAI,CAAC;AAEhD,OAAO,EAAE,aAAa,EAAE,MAAM,UAAU,CAAC;AACzC,OAAO,EAAE,OAAO,EAAE,OAAO,EAAE,MAAM,WAAW,CAAC;AAC7C,OAAO,EACL,kBAAkB,EAClB,aAAa,EACb,YAAY,EACZ,iBAAiB,EACjB,WAAW,EACX,cAAc,EAAE,uBAAuB;EACxC,MAAM,eAAe,CAAC;AACvB,OAAO,EAAE,eAAe,EAAE,gBAAgB,EAAE,aAAa,EAAE,MAAM,aAAa,CAAC;AAmB/E,4DAA4D;AAC5D,MAAM,UAAU,GAAG,aAAa,CAAC,MAAM,CAAC,IAAI,CAAC,GAAG,CAAC,CAAC;AAClD,MAAM,SAAS,GAAG,OAAO,CAAC,UAAU,CAAC,CAAC;AACtC,MAAM,UAAU,GAAG,OAAO,CAAC,SAAS,EAAE,IAAI,EAAE,QAAQ,CAAC,CAAC;AAEtD,MAAM,GAAG,GAAG,OAAO,EAAE,CAAC;AACtB,MAAM,MAAM,GAAG,YAAY,CAAC,GAAG,CAAC,CAAC;AAEjC,SAAS,eAAe,CAAC,KAAc;IACrC,IAAI,KAAK,YAAY,KAAK;QAAE,OAAO,KAAK,CAAC,OAAO,CAAC;IACjD,IAAI,OAAO,KAAK,KAAK,QAAQ;QAAE,OAAO,KAAK,CAAC;IAC5C,OAAO,WAAW,CAAC;AACrB,CAAC;AAED,GAAG,CAAC,GAAG,CAAC,OAAO,CAAC,IAAI,EAAE,CAAC,CAAC;AACxB,2DAA2D;AAC3D,GAAG,CAAC,GAAG,CAAC,OAAO,CAAC,MAAM,CAAC,UAAU,CAAC,CAAC,CAAC;AAEpC,sCAAsC;AACtC,kBAAkB,EAAE,CAAC;AAErB,6CAA6C;AAC7C,MAAM,CAAC,MAAM,aAAa,GAAG,IAAI,GAAG,EAAyB,CAAC;AAE9D,mCAAmC;AACnC,4CAA4C;AAC5C,GAAG,CAAC,GAAG,CAAC,iBAAiB,EAAE,CAAC,GAAG,EAAE,GAAG,EAAE,EAAE;IACtC,IAAI,CAAC;QACH,MAAM,OAAO,GAAG,aAAa,EAAE,CAAC;QAChC,GAAG,CAAC,IAAI,CAAC,EAAE,OAAO,EAAE,IAAI,EAAE,IAAI,EAAE,OAAO,EAAE,CAAC,CAAC;IAC7C,CAAC;IAAC,OAAO,KAAc,EAAE,CAAC;QACxB,MAAM,YAAY,GAAG,eAAe,CAAC,KAAK,CAAC,CAAC;QAC5C,eAAe,CAAC,OAAO,EAAE,sBAAsB,YAAY,EAAE,CAAC,CAAC;QAC/D,GAAG,CAAC,MAAM,CAAC,GAAG,CAAC,CAAC,IAAI,CAAC,EAAE,OAAO,EAAE,KAAK,EAAE,OAAO,EAAE,YAAY,EAAE,CAAC,CAAC;IAClE,CAAC;AACH,CAAC,CAAC,CAAC;AAEH,gDAAgD;AAChD,GAAG,CAAC,GAAG,CAAC,cAAc,EAAE,CAAC,GAAG,EAAE,GAAG,EAAE,EAAE;IACnC,IAAI,CAAC;QACH,MAAM,IAAI,GAAG,YAAY,CAAC,GAAG,EAAE,CAAC,CAAC,CAAC;QAClC,GAAG,CAAC,IAAI,CAAC,EAAE,OAAO,EAAE,IAAI,EAAE,IAAI,EAAE,IAAI,EAAE,CAAC,CAAC;IAC1C,CAAC;IAAC,OAAO,KAAc,EAAE,CAAC;QACxB,MAAM,YAAY,GAAG,eAAe,CAAC,KAAK,CAAC,CAAC;QAC5C,eAAe,CAAC,OAAO,EAAE,mBAAmB,YAAY,EAAE,CAAC,CAAC;QAC5D,GAAG,CAAC,MAAM,CAAC,GAAG,CAAC,CAAC,IAAI,CAAC,EAAE,OAAO,EAAE,KAAK,EAAE,OAAO,EAAE,YAAY,EAAE,CAAC,CAAC;IAClE,CAAC;AACH,CAAC,CAAC,CAAC;AAEH,0CAA0C;AAC1C,GAAG,CAAC,MAAM,CAAC,cAAc,EAAE,CAAC,GAAG,EAAE,GAAG,EAAE,EAAE;IACtC,IAAI,CAAC;QACH,iBAAiB,EAAE,CAAC;QACpB,gBAAgB,CACd,aAAa,EACb,iBAAiB,EACjB,oBAAoB,CACrB,CAAC;QACF,GAAG,CAAC,IAAI,CAAC;YACP,OAAO,EAAE,IAAI;YACb,OAAO,EAAE,+BAA+B;SACzC,CAAC,CAAC;IACL,CAAC;IAAC,OAAO,KAAc,EAAE,CAAC;QACxB,MAAM,YAAY,GAAG,eAAe,CAAC,KAAK,CAAC,CAAC;QAC5C,eAAe,CAAC,OAAO,EAAE,0BAA0B,YAAY,EAAE,CAAC,CAAC;QACnE,GAAG,CAAC,MAAM,CAAC,GAAG,CAAC,CAAC,IAAI,CAAC,EAAE,OAAO,EAAE,KAAK,EAAE,OAAO,EAAE,YAAY,EAAE,CAAC,CAAC;IAClE,CAAC;AACH,CAAC,CAAC,CAAC;AAEH,iEAAiE;AACjE,GAAG,CAAC,MAAM,CAAC,2BAA2B,EAAE,CAAC,GAAG,EAAE,GAAG,EAAE,EAAE;IACnD,IAAI,CAAC;QACH,MAAM,QAAQ,GAAG,GAAG,CAAC,MAAM,CAAC,QAAQ,CAAC;QACrC,WAAW,CAAC,QAAQ,CAAC,CAAC;QACtB,gBAAgB,CACd,aAAa,EACb,sBAAsB,EACtB,mBAAmB,QAAQ,EAAE,CAC9B,CAAC;QACF,GAAG,CAAC,IAAI,CAAC;YACP,OAAO,EAAE,IAAI;YACb,OAAO,EAAE,+BAA+B;SACzC,CAAC,CAAC;IACL,CAAC;IAAC,OAAO,KAAc,EAAE,CAAC;QACxB,MAAM,YAAY,GAAG,eAAe,CAAC,KAAK,CAAC,CAAC;QAC5C,eAAe,CAAC,OAAO,EAAE,2BAA2B,YAAY,EAAE,CAAC,CAAC;QACpE,GAAG,CAAC,MAAM,CAAC,GAAG,CAAC,CAAC,IAAI,CAAC,EAAE,OAAO,EAAE,KAAK,EAAE,OAAO,EAAE,YAAY,EAAE,CAAC,CAAC;IAClE,CAAC;AACH,CAAC,CAAC,CAAC;AAEH,gCAAgC;AAChC,MAAM,GAAG,GAAG,IAAI,eAAe,CAAC,EAAE,MAAM,EAAE,CAAC,CAAC;AAE5C,qCAAqC;AACrC,GAAG,CAAC,EAAE,CAAC,YAAY,EAAE,CAAC,EAAa,EAAE,GAAoB,EAAE,EAAE;IAC3D,MAAM,IAAI,GAAG,GAAG,CAAC,OAAO,CAAC,IAAI,IAAI,gBAAgB,CAAC;IAClD,MAAM,GAAG,GAAG,IAAI,GAAG,CAAC,GAAG,CAAC,GAAG,IAAI,EAAE,EAAE,UAAU,IAAI,EAAE,CAAC,CAAC;IAErD,MAAM,QAAQ,GAAG,GAAG,CAAC,YAAY,CAAC,GAAG,CAAC,UAAU,CAAC,CAAC;IAClD,MAAM,UAAU,GAAG,GAAG,CAAC,YAAY,CAAC,GAAG,CAAC,YAAY,CAAe,CAAC;IAEpE,IAAI,CAAC,QAAQ,IAAI,CAAC,UAAU,KAAK,QAAQ,IAAI,UAAU,KAAK,OAAO,CAAC,EAAE,CAAC;QACrE,EAAE,CAAC,KAAK,CAAC,IAAI,EAAE,4BAA4B,CAAC,CAAC;QAC7C,OAAO;IACT,CAAC;IAED,IAAI,aAAa,CAAC,GAAG,CAAC,QAAQ,CAAC,EAAE,CAAC;QAChC,MAAM,QAAQ,GAAG,aAAa,CAAC,GAAG,CAAC,QAAQ,CAAC,CAAC;QAC7C,IAAI,QAAQ,IAAI,QAAQ,CAAC,MAAM,CAAC,UAAU,KAAK,SAAS,CAAC,IAAI,EAAE,CAAC;YAC9D,QAAQ,CAAC,MAAM,CAAC,KAAK,CACnB,IAAI,EACJ,qCAAqC,CACtC,CAAC;QACJ,CAAC;QACD,aAAa,CAAC,MAAM,CAAC,QAAQ,CAAC,CAAC;IACjC,CAAC;IAED,aAAa,CAAC,GAAG,CAAC,QAAQ,EAAE;QAC1B,MAAM,EAAE,EAAE;QACV,QAAQ;QACR,UAAU;QACV,WAAW,EAAE,IAAI,IAAI,EAAE;KACxB,CAAC,CAAC;IAEH,eAAe,CACb,MAAM,EACN,mBAAmB,QAAQ,YAAY,UAAU,GAAG,CACrD,CAAC;IAEF,EAAE,CAAC,EAAE,CAAC,SAAS,EAAE,CAAC,OAAe,EAAE,EAAE;QACnC,IAAI,CAAC;YACH,MAAM,OAAO,GAAqB,IAAI,CAAC,KAAK,CAAC,OAAO,CAAC,CAAC;YACtD,OAAO,CAAC,QAAQ,GAAG,QAAQ,CAAC;YAE5B,aAAa,CACX,QAAQ,EACR,OAAO,CAAC,MAAM,EACd,mBAAmB,OAAO,EAAE,CAC7B,CAAC;YAEF,oEAAoE;YACpE,IAAI,OAAO,CAAC,MAAM,KAAK,WAAW,EAAE,CAAC;gBACnC,cAAc,CAAC,QAAQ,EAAE,IAAI,CAAC,SAAS,CAAC,OAAO,CAAC,OAAO,CAAC,EAAE,IAAI,CAAC,GAAG,EAAE,CAAC,CAAC;YACxE,CAAC;YAED,IAAI,OAAO,CAAC,QAAQ,KAAK,KAAK,EAAE,CAAC;gBAC/B,aAAa,CAAC,OAAO,CAAC,CAAC,MAAM,EAAE,EAAE;oBAC/B,IACE,MAAM,CAAC,QAAQ,KAAK,QAAQ;wBAC5B,MAAM,CAAC,MAAM,CAAC,UAAU,KAAK,SAAS,CAAC,IAAI,EAC3C,CAAC;wBACD,MAAM,CAAC,MAAM,CAAC,IAAI,CAAC,IAAI,CAAC,SAAS,CAAC,OAAO,CAAC,CAAC,CAAC;oBAC9C,CAAC;gBACH,CAAC,CAAC,CAAC;gBACH,OAAO;YACT,CAAC;YAED,IAAI,OAAO,CAAC,QAAQ,IAAI,aAAa,CAAC,GAAG,CAAC,OAAO,CAAC,QAAQ,CAAC,EAAE,CAAC;gBAC5D,MAAM,aAAa,GAAG,aAAa,CAAC,GAAG,CAAC,OAAO,CAAC,QAAQ,CAAC,CAAC;gBAC1D,IACE,aAAa;oBACb,aAAa,CAAC,MAAM,CAAC,UAAU,KAAK,SAAS,CAAC,IAAI,EAClD,CAAC;oBACD,aAAa,CAAC,MAAM,CAAC,IAAI,CAAC,IAAI,CAAC,SAAS,CAAC,OAAO,CAAC,CAAC,CAAC;gBACrD,CAAC;YACH,CAAC;iBAAM,CAAC;gBACN,IAAI,EAAE,CAAC,UAAU,KAAK,SAAS,CAAC,IAAI,EAAE,CAAC;oBACrC,EAAE,CAAC,IAAI,CACL,IAAI,CAAC,SAAS,CAAC;wBACb,QAAQ,EAAE,QAAQ;wBAClB,QAAQ,EAAE,QAAQ;wBAClB,MAAM,EAAE,OAAO;wBACf,OAAO,EAAE;4BACP,MAAM,EACJ,oCAAoC;yBACvC;qBACF,CAAC,CACH,CAAC;gBACJ,CAAC;YACH,CAAC;QACH,CAAC;QAAC,MAAM,CAAC;YACP,KAAK;QACP,CAAC;IACH,CAAC,CAAC,CAAC;IAEH,EAAE,CAAC,EAAE,CAAC,OAAO,EAAE,GAAG,EAAE;QAClB,aAAa,CAAC,MAAM,CAAC,QAAQ,CAAC,CAAC;QAC/B,eAAe,CAAC,MAAM,EAAE,qBAAqB,QAAQ,GAAG,CAAC,CAAC;IAC5D,CAAC,CAAC,CAAC;IAEH,EAAE,CAAC,EAAE,CAAC,OAAO,EAAE,CAAC,GAAG,EAAE,EAAE;QACrB,eAAe,CACb,MAAM,EACN,uBAAuB,QAAQ,MAAM,GAAG,CAAC,OAAO,EAAE,CACnD,CAAC;IACJ,CAAC,CAAC,CAAC;AACL,CAAC,CAAC,CAAC;AAEH,MAAM,CAAC,MAAM,CAAC,IAAI,EAAE,GAAG,EAAE;IACvB,eAAe,CACb,MAAM,EACN,mDAAmD,CACpD,CAAC;IACF,OAAO,CAAC,GAAG,CACT,iDAAiD,CAClD,CAAC;AACJ,CAAC,CAAC,CAAC"}
```

---

## server/dist/logger.js

```javascript
import { existsSync, mkdirSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
// ESM 빌드 환경에서도 정확히 루트 폴더 하위 logs 디렉토리를 식별하게 경로 연산 수행
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// 실행 물리 위치에 무관하게 항상 최상위 루트 디렉토리 내부 logs 폴더 탐색 및 정합
const logsDir = resolve(__dirname, "..", "..", "logs");
// 기동 시점에 해당 로그 전용 물리 폴더 부재 시 자동 감지하여 일괄 동적 생성 처리 (크래시 중단 방지)
if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true });
}
/**
 * 로그 라인 선두에 기입할 표준 ISO 8601 형식의 현재 시각 문자열을 취득합니다.
 */
function getTimestamp() {
    return new Date().toISOString();
}
/**
 * 1. 브라우저 플러그인과 백엔드 소켓 간 수신 데이터 및 세션 소멸 정보를 로그 파일로 기록합니다.
 * 타깃 경로: logs\plugins_comm.log
 *
 * @param clientId - 수집 장비 UUID 고유 키값
 * @param action - 수행 명령 유형 (예: "CRAWL_START")
 * @param message - 전달 유실 탐지 정보 및 패킷 원시 문자열
 */
export function logPluginComm(clientId, action, message) {
    const filePath = resolve(logsDir, "plugins_comm.log");
    const logLine = `[${getTimestamp()}] [CLIENT: ${clientId}] [ACTION: ${action}] - ${message}\n`;
    appendFileSync(filePath, logLine, "utf-8");
}
/**
 * 2. Express 및 웹소켓 네트워크 구동, DB 연결상태 및 무중단 예외 로그를 기록합니다.
 * 타깃 경로: logs\server_system.log
 *
 * @param level - 로그 위험 단계 수준 지정 ('INFO' | 'WARN' | 'ERROR')
 * @param message - 상세 예외 출력 문구
 */
export function logServerSystem(level, message) {
    const filePath = resolve(logsDir, "server_system.log");
    const logLine = `[${getTimestamp()}] [${level}] - ${message}\n`;
    appendFileSync(filePath, logLine, "utf-8");
}
/**
 * 3. 관리자 제어 대시보드가 단행한 통제 동작 및 전체 릴레이 요청 내역을 기록합니다.
 * 타깃 경로: logs\admin_activity.log
 *
 * @param adminId - 관리자 세션 UUID 키값
 * @param actionType - 명령 식별 유형
 * @param detail - 수신 타깃 정보 및 세부 실행 정보
 */
export function logAdminActivity(adminId, actionType, detail) {
    const filePath = resolve(logsDir, "admin_activity.log");
    const logLine = `[${getTimestamp()}] [ADMIN: ${adminId}] [ACTION: ${actionType}] - ${detail}\n`;
    appendFileSync(filePath, logLine, "utf-8");
}
//# sourceMappingURL=logger.js.map
```

---

## server/dist/logger.js.map

```map
{"version":3,"file":"logger.js","sourceRoot":"","sources":["../src/logger.ts"],"names":[],"mappings":"AAAA,OAAO,EAAE,UAAU,EAAE,SAAS,EAAE,cAAc,EAAE,MAAM,SAAS,CAAC;AAChE,OAAO,EAAE,aAAa,EAAE,MAAM,UAAU,CAAC;AACzC,OAAO,EAAE,OAAO,EAAE,OAAO,EAAE,MAAM,WAAW,CAAC;AAE7C,qDAAqD;AACrD,MAAM,UAAU,GAAG,aAAa,CAAC,MAAM,CAAC,IAAI,CAAC,GAAG,CAAC,CAAC;AAClD,MAAM,SAAS,GAAG,OAAO,CAAC,UAAU,CAAC,CAAC;AAEtC,mDAAmD;AACnD,MAAM,OAAO,GAAG,OAAO,CAAC,SAAS,EAAE,IAAI,EAAE,IAAI,EAAE,MAAM,CAAC,CAAC;AAEvD,6DAA6D;AAC7D,IAAI,CAAC,UAAU,CAAC,OAAO,CAAC,EAAE,CAAC;IACzB,SAAS,CAAC,OAAO,EAAE,EAAE,SAAS,EAAE,IAAI,EAAE,CAAC,CAAC;AAC1C,CAAC;AAED;;GAEG;AACH,SAAS,YAAY;IACnB,OAAO,IAAI,IAAI,EAAE,CAAC,WAAW,EAAE,CAAC;AAClC,CAAC;AAED;;;;;;;GAOG;AACH,MAAM,UAAU,aAAa,CAC3B,QAAgB,EAChB,MAAc,EACd,OAAe;IAEf,MAAM,QAAQ,GAAG,OAAO,CAAC,OAAO,EAAE,kBAAkB,CAAC,CAAC;IACtD,MAAM,OAAO,GAAG,IAAI,YAAY,EAAE,cAAc,QAAQ,cAAc,MAAM,OAAO,OAAO,IAAI,CAAC;IAC/F,cAAc,CAAC,QAAQ,EAAE,OAAO,EAAE,OAAO,CAAC,CAAC;AAC7C,CAAC;AAED;;;;;;GAMG;AACH,MAAM,UAAU,eAAe,CAC7B,KAAgC,EAChC,OAAe;IAEf,MAAM,QAAQ,GAAG,OAAO,CAAC,OAAO,EAAE,mBAAmB,CAAC,CAAC;IACvD,MAAM,OAAO,GAAG,IAAI,YAAY,EAAE,MAAM,KAAK,OAAO,OAAO,IAAI,CAAC;IAChE,cAAc,CAAC,QAAQ,EAAE,OAAO,EAAE,OAAO,CAAC,CAAC;AAC7C,CAAC;AAED;;;;;;;GAOG;AACH,MAAM,UAAU,gBAAgB,CAC9B,OAAe,EACf,UAAkB,EAClB,MAAc;IAEd,MAAM,QAAQ,GAAG,OAAO,CAAC,OAAO,EAAE,oBAAoB,CAAC,CAAC;IACxD,MAAM,OAAO,GAAG,IAAI,YAAY,EAAE,aAAa,OAAO,cAAc,UAAU,OAAO,MAAM,IAAI,CAAC;IAChG,cAAc,CAAC,QAAQ,EAAE,OAAO,EAAE,OAAO,CAAC,CAAC;AAC7C,CAAC"}
```

---

## server/public/icon16.jpg

[BINARY FILE SKIPPED]

---

## server/public/index.html

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WebCrawlServer 관리자 대시보드</title>
    <script type="module" crossorigin src="/assets/index-0CDWvoqm.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-CS2UwwFL.css">
  </head>
  <body class="bg-gray-900 text-white font-sans select-none">
    <div id="root"></div>
  </body>
</html>
```

---

## server/src/database.ts

```typescript
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
```

---

## server/src/index.ts

```typescript
import express from "express";
import { createServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  initializeDatabase,
  getAllClients,
  getCrawlLogs,
  clearAllCrawlLogs,
  purgeClient,
  insertCrawlLog, // 데이터베이스 동기 적재 함수 가져오기
} from "./database.js";
import { logServerSystem, logAdminActivity, logPluginComm } from "./logger.js";

// 컴파일러가 식별할 수 있도록 3대 핵심 소켓 제어 인터페이스 타입 선언
export type ClientType = "plugin" | "admin";

export interface ClientSession {
  socket: WebSocket; // 연결된 실시간 웹소켓 인스턴스
  clientId: string; // UUID 고유 발급 식별자
  clientType: ClientType; // 플러그인 또는 관리자 대시보드 구별자
  connectedAt: Date; // 최초 소켓 핸드셰이크 통과 및 적재 시간
}

export interface WebSocketMessage<T = unknown> {
  senderId: string; // 패킷을 최초 전송한 세션의 고유 식별자 (서버인 경우 'server')
  targetId?: string | "ALL"; // 수신 대상의 UUID 또는 전체 플러그인 브로드캐스팅 시 'ALL' 지정
  action: string; // 작업 실행 식별용 명령 문자열 (예: "CRAWL_START")
  payload: T; // 각 명령별로 전달하는 상세 구조화 바디 데이터
}

// 가동 기점에 관계 없이 물리 서빙 리소스 폴더인 server/public 폴더를 실시간 절대 추적 연산
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicPath = resolve(__dirname, "..", "public");

const app = express();
const server = createServer(app);

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "알 수 없는 오류";
}

app.use(express.json());
// 절대경로 매핑을 적용하여 server/public 폴더 내부의 HTML/JS 정적 배포본을 안전 서빙
app.use(express.static(publicPath));

// 통합 데이터베이스 초기 마운트 기동 및 테이블 스키마 자동 구축
initializeDatabase();

// 활성 상태의 전체 연결 세션을 인메모리 영역에서 선별 통제하는 전역 맵 선언
export const activeClients = new Map<string, ClientSession>();

// 관리자 전용 데이터베이스 REST API 중계 라우터 수립
// [REST API 1] 등록된 모든 수집 클라이언트 장비 데이터 목록 조회
app.get("/api/db/clients", (req, res) => {
  try {
    const clients = getAllClients();
    res.json({ success: true, data: clients });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logServerSystem("ERROR", `Clients API 에러 반환: ${errorMessage}`);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

// [REST API 2] 영구 적재된 수집 데이터 로그 조회 (최근 100개 한정)
app.get("/api/db/logs", (req, res) => {
  try {
    const logs = getCrawlLogs(100, 0);
    res.json({ success: true, data: logs });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logServerSystem("ERROR", `Logs API 에러 반환: ${errorMessage}`);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

// [REST API 3] 데이터베이스 저장 로그 일괄 소거 (용량 정화)
app.delete("/api/db/logs", (req, res) => {
  try {
    clearAllCrawlLogs();
    logAdminActivity(
      "SUPER_ADMIN",
      "DELETE_ALL_LOGS",
      "데이터베이스 전체 로그 소거 단행",
    );
    res.json({
      success: true,
      message: "데이터베이스의 모든 수집 로그가 일괄 소거되었습니다.",
    });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logServerSystem("ERROR", `Logs Delete API 에러 반환: ${errorMessage}`);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

// [REST API 4] 특정 기기를 블랙리스트 처리하여 영구 추방 및 관련 데이터 Cascade 강제 연쇄 삭제
app.delete("/api/db/clients/:clientId", (req, res) => {
  try {
    const targetId = req.params.clientId;
    purgeClient(targetId);
    logAdminActivity(
      "SUPER_ADMIN",
      "PURGE_CLIENT_SESSION",
      `클라이언트 영구 추방 격리: ${targetId}`,
    );
    res.json({
      success: true,
      message: "지정된 클라이언트 기기가 완전히 차단 제거되었습니다.",
    });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logServerSystem("ERROR", `Client Purge API 에러 반환: ${errorMessage}`);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

// HTTP 서버 객체를 공유하는 통합 웹소켓 서버 선언
const wss = new WebSocketServer({ server });

// 웹소켓 연결이 포트 9600에 들어올 시 실행될 라우팅 제어부
wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
  const host = req.headers.host || "localhost:9600";
  const url = new URL(req.url || "", `http://${host}`);

  const clientId = url.searchParams.get("clientId");
  const clientType = url.searchParams.get("clientType") as ClientType;

  if (!clientId || (clientType !== "plugin" && clientType !== "admin")) {
    ws.close(4000, "식별 정보가 누락되어 커넥션 수립을 거부합니다.");
    return;
  }

  if (activeClients.has(clientId)) {
    const existing = activeClients.get(clientId);
    if (existing && existing.socket.readyState === WebSocket.OPEN) {
      existing.socket.close(
        4001,
        "동일한 식별자로 새로운 세션이 진입하여 기존 소켓을 정화합니다.",
      );
    }
    activeClients.delete(clientId);
  }

  activeClients.set(clientId, {
    socket: ws,
    clientId,
    clientType,
    connectedAt: new Date(),
  });

  logServerSystem(
    "INFO",
    `세션 마운트 성공: [ID: ${clientId}] [TYPE: ${clientType}]`,
  );

  ws.on("message", (rawData: string) => {
    try {
      const message: WebSocketMessage = JSON.parse(rawData);
      message.senderId = clientId;

      logPluginComm(
        clientId,
        message.action,
        `수신 패킷 수집 중계 처리: ${rawData}`,
      );

      // 실시간 수집 로그 패킷 데이터(CRAWL_LOG) 유입 시, SQLite 데이터베이스 테이블에 실시간 동기 영구 축적
      if (message.action === "CRAWL_LOG") {
        insertCrawlLog(clientId, JSON.stringify(message.payload), Date.now());
      }

      if (message.targetId === "ALL") {
        activeClients.forEach((client) => {
          if (
            client.clientId !== clientId &&
            client.socket.readyState === WebSocket.OPEN
          ) {
            client.socket.send(JSON.stringify(message));
          }
        });
        return;
      }

      if (message.targetId && activeClients.has(message.targetId)) {
        const targetSession = activeClients.get(message.targetId);
        if (
          targetSession &&
          targetSession.socket.readyState === WebSocket.OPEN
        ) {
          targetSession.socket.send(JSON.stringify(message));
        }
      } else {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              senderId: "server",
              targetId: clientId,
              action: "ERROR",
              payload: {
                detail:
                  "릴레이 대상 기기가 오프라인 상태이거나 세션이 만료되었습니다.",
              },
            }),
          );
        }
      }
    } catch {
      // 가드
    }
  });

  ws.on("close", () => {
    activeClients.delete(clientId);
    logServerSystem("INFO", `세션 소멸 해제 완료: [ID: ${clientId}]`);
  });

  ws.on("error", (err) => {
    logServerSystem(
      "WARN",
      `세션 소켓 예외 에러 감지 [ID: ${clientId}]: ${err.message}`,
    );
  });
});

server.listen(9600, () => {
  logServerSystem(
    "INFO",
    "통합 백엔드 API 및 WebSocket 서비스 포트 9600에서 정상 바인딩 가동 완료",
  );
  console.log(
    "[시스템] 통합 백엔드 API 및 데이터베이스 서비스 포트 9600에서 정상 구동 중",
  );
});
```

---

## server/src/logger.ts

```typescript
import { existsSync, mkdirSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// ESM 빌드 환경에서도 정확히 루트 폴더 하위 logs 디렉토리를 식별하게 경로 연산 수행
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 실행 물리 위치에 무관하게 항상 최상위 루트 디렉토리 내부 logs 폴더 탐색 및 정합
const logsDir = resolve(__dirname, "..", "..", "logs");

// 기동 시점에 해당 로그 전용 물리 폴더 부재 시 자동 감지하여 일괄 동적 생성 처리 (크래시 중단 방지)
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

/**
 * 로그 라인 선두에 기입할 표준 ISO 8601 형식의 현재 시각 문자열을 취득합니다.
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * 1. 브라우저 플러그인과 백엔드 소켓 간 수신 데이터 및 세션 소멸 정보를 로그 파일로 기록합니다.
 * 타깃 경로: logs\plugins_comm.log
 *
 * @param clientId - 수집 장비 UUID 고유 키값
 * @param action - 수행 명령 유형 (예: "CRAWL_START")
 * @param message - 전달 유실 탐지 정보 및 패킷 원시 문자열
 */
export function logPluginComm(
  clientId: string,
  action: string,
  message: string,
): void {
  const filePath = resolve(logsDir, "plugins_comm.log");
  const logLine = `[${getTimestamp()}] [CLIENT: ${clientId}] [ACTION: ${action}] - ${message}\n`;
  appendFileSync(filePath, logLine, "utf-8");
}

/**
 * 2. Express 및 웹소켓 네트워크 구동, DB 연결상태 및 무중단 예외 로그를 기록합니다.
 * 타깃 경로: logs\server_system.log
 *
 * @param level - 로그 위험 단계 수준 지정 ('INFO' | 'WARN' | 'ERROR')
 * @param message - 상세 예외 출력 문구
 */
export function logServerSystem(
  level: "INFO" | "WARN" | "ERROR",
  message: string,
): void {
  const filePath = resolve(logsDir, "server_system.log");
  const logLine = `[${getTimestamp()}] [${level}] - ${message}\n`;
  appendFileSync(filePath, logLine, "utf-8");
}

/**
 * 3. 관리자 제어 대시보드가 단행한 통제 동작 및 전체 릴레이 요청 내역을 기록합니다.
 * 타깃 경로: logs\admin_activity.log
 *
 * @param adminId - 관리자 세션 UUID 키값
 * @param actionType - 명령 식별 유형
 * @param detail - 수신 타깃 정보 및 세부 실행 정보
 */
export function logAdminActivity(
  adminId: string,
  actionType: string,
  detail: string,
): void {
  const filePath = resolve(logsDir, "admin_activity.log");
  const logLine = `[${getTimestamp()}] [ADMIN: ${adminId}] [ACTION: ${actionType}] - ${detail}\n`;
  appendFileSync(filePath, logLine, "utf-8");
}
```

---

## admin/src/hooks/useAdminDbApi.ts

```typescript
import { useState, useCallback } from 'react';
import { Client, CrawlLog } from '../types/index.js';
import { 
  fetchClientsApi, 
  fetchLogsApi, 
  clearLogsApi, 
  purgeClientApi 
} from '../services/apiService.js';

export function useAdminDbApi() {
  const [clients, setClients] = useState<Client[]>([]);
  const [logs, setLogs] = useState<CrawlLog[]>([]);

  // 백엔드 데이터베이스로부터 전체 클라이언트 목록 인출 및 상태 갱신
  const loadClients = useCallback(async () => {
    try {
      const data = await fetchClientsApi();
      setClients(data);
    } catch {
      // API 예외 스킵
    }
  }, []);

  // 백엔드 데이터베이스로부터 최신 수집 로그 목록 인출 및 상태 갱신
  const loadLogs = useCallback(async () => {
    try {
      const data = await fetchLogsApi();
      setLogs(data);
    } catch {
      // API 예외 스킵
    }
  }, []);

  // 데이터베이스 크롤링 로그 일괄 삭제 단행
  const executeClearLogs = useCallback(async () => {
    if (!confirm('데이터베이스 내의 모든 크롤링 수집 로그를 완전 소거하시겠습니까?')) {
      return false;
    }
    const success = await clearLogsApi();
    if (success) {
      alert('데이터베이스의 모든 수집 로그가 일괄 소거되었습니다.');
      await loadLogs();
      return true;
    }
    return false;
  }, [loadLogs]);

  // 지정 클라이언트 기기 강제 추방 및 데이터 Cascade 연쇄 삭제 단행
  const executePurgeClient = useCallback(async (clientId: string) => {
    if (!confirm(`대상 클라이언트 [${clientId}]를 강제 정화 격리하시겠습니까?`)) {
      return false;
    }
    const success = await purgeClientApi(clientId);
    if (success) {
      alert('지정된 클라이언트 기기가 완전히 차단 제거되었습니다.');
      await loadClients();
      await loadLogs();
      return true;
    }
    return false;
  }, [loadClients, loadLogs]);

  return {
    clients,
    logs,
    setLogs,
    loadClients,
    loadLogs,
    executeClearLogs,
    executePurgeClient
  };
}
```

---

## admin/src/hooks/useAdminSocket.ts

```typescript
import { useState, useEffect, useRef, useCallback, Dispatch, SetStateAction } from 'react';
import { ConnectionStatus, CrawlLog } from '../types/index.js';
import { createAdminSocket, sendSocketMessage } from '../services/socketService.js';

export function useAdminSocket(
  setLogs: Dispatch<SetStateAction<CrawlLog[]>>,
  onConnectCallback?: () => void
) {
  const [wsStatus, setWsStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = createAdminSocket();
    wsRef.current = socket;

    socket.onopen = () => {
      setWsStatus('CONNECTED');
      if (onConnectCallback) {
        onConnectCallback();
      }
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        // 실시간 수집 패킷 도착 시 상태 배열 최선두에 동적 추가 주입
        if (message.action === 'CRAWL_LOG') {
          setLogs((prev) => [
            {
              id: Date.now(),
              client_id: message.senderId,
              log_message: JSON.stringify(message.payload),
              timestamp: Date.now()
            },
            ...prev
          ]);
        }
      } catch {
        // 더티 패킷 무시
      }
    };

    socket.onclose = () => {
      setWsStatus('DISCONNECTED');
    };

    return () => {
      socket.close();
    };
  }, [setLogs, onConnectCallback]);

  // 원격 제어 명령 패킷 검증 및 웹소켓 송출 릴레이
  const dispatchCommand = useCallback((targetId: string, action: string, payloadStr: string) => {
    try {
      const parsedPayload = JSON.parse(payloadStr);
      const sent = sendSocketMessage(wsRef.current, targetId, action, parsedPayload);
      if (sent) {
        alert(`명령 송출 완료 [대상: ${targetId}] [지시: ${action}]`);
        return true;
      } else {
        alert('통신 채널이 오프라인 상태입니다.');
        return false;
      }
    } catch {
      alert('페이로드 데이터가 올바른 JSON 포맷이 아닙니다.');
      return false;
    }
  }, []);

  return {
    wsStatus,
    dispatchCommand
  };
}
```

---

## admin/src/services/apiService.ts

```typescript
import { Client, CrawlLog } from '../types/index.js';

/**
 * 등록된 수집 클라이언트 기기 목록을 백엔드 REST API로부터 인출합니다.
 */
export async function fetchClientsApi(): Promise<Client[]> {
  const res = await fetch('/api/db/clients');
  const json = await res.json();
  return json.success ? json.data : [];
}

/**
 * 영구 적재된 수집 데이터 로그 목록을 백엔드 REST API로부터 인출합니다.
 */
export async function fetchLogsApi(): Promise<CrawlLog[]> {
  const res = await fetch('/api/db/logs');
  const json = await res.json();
  return json.success ? json.data : [];
}

/**
 * 데이터베이스의 모든 수집 데이터 로그를 일괄 소거 청소 요청합니다.
 */
export async function clearLogsApi(): Promise<boolean> {
  const res = await fetch('/api/db/logs', { method: 'DELETE' });
  const json = await res.json();
  return json.success;
}

/**
 * 특정 수집 클라이언트 기기를 블랙리스트 처리하여 영구 추방 및 연쇄 삭제 요청합니다.
 */
export async function purgeClientApi(clientId: string): Promise<boolean> {
  const res = await fetch(`/api/db/clients/${clientId}`, { method: 'DELETE' });
  const json = await res.json();
  return json.success;
}
```

---

## admin/src/services/socketService.ts

```typescript
import { WebSocketMessage } from '../types/index.js';

/**
 * 포트 9600번 관로로 바인딩되는 어드민 전용 웹소켓 클라이언트 인스턴스를 생성 및 반환합니다.
 */
export function createAdminSocket(): WebSocket {
  const wsUrl = 'ws://localhost:9600?clientId=admin-main&clientType=admin';
  return new WebSocket(wsUrl);
}

/**
 * 지정된 타겟 ID, 지시 액션, 바디 페이로드를 규격화된 패킷 텍스트로 인코딩하여 웹소켓 채널로 송출합니다.
 */
export function sendSocketMessage(
  socket: WebSocket | null,
  targetId: string,
  action: string,
  payload: unknown
): boolean {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return false;
  }
  const packet: WebSocketMessage = {
    senderId: 'admin-main',
    targetId,
    action,
    payload
  };
  socket.send(JSON.stringify(packet));
  return true;
}
```

---

## admin/src/types/index.ts

```typescript
export interface Client {
  client_id: string;
  client_type: string;
  connected_at: string;
}

export interface CrawlLog {
  id: number;
  client_id: string;
  log_message: string;
  timestamp: number;
}

// 실시간 웹소켓 송수신 통신 패킷 표준 인터페이스
export interface WebSocketMessage<T = unknown> {
  senderId: string;
  targetId?: string | 'ALL';
  action: string;
  payload: T;
}

export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED';

export type ActiveTab = 'clients' | 'console' | 'logs';
```

---

## plugins/basic-plugin/dist/background.js

```javascript
async function d(){return new Promise(t=>{chrome.storage.local.get(["clientId"],a=>{if(a&&typeof a.clientId=="string")t(a.clientId);else{const n=crypto.randomUUID();chrome.storage.local.set({clientId:n},()=>{t(n)})}})})}let e=null,o=null;async function c(){if(e&&e.readyState===WebSocket.OPEN)return;const t=await d(),a=`ws://localhost:9600?clientId=${t}&clientType=plugin`;e=new WebSocket(a),e.onopen=()=>{o&&(clearTimeout(o),o=null);const n={senderId:t,targetId:"ALL",action:"CRAWL_LOG",payload:{system:"수집기 소켓 통신망 정상 안착 완료"}};e==null||e.send(JSON.stringify(n))},e.onmessage=n=>{try{const i=JSON.parse(n.data);i.action==="CRAWL_START"&&chrome.tabs.query({active:!0,currentWindow:!0},l=>{const r=l[0];r&&r.id&&chrome.tabs.sendMessage(r.id,{command:"START_DOM_CRAWL",depth:i.payload.depth})})}catch{}},e.onclose=()=>{e=null,o||(o=setTimeout(()=>{c()},3e3))},e.onerror=()=>{e=null}}chrome.runtime.onInstalled.addListener(()=>{c()});chrome.runtime.onStartup.addListener(()=>{c()});chrome.runtime.onMessage.addListener(t=>{t.type==="RAW_DOM_DATA"&&e&&e.readyState===WebSocket.OPEN&&d().then(a=>{const n={senderId:a,targetId:"ALL",action:"CRAWL_LOG",payload:t.data};e==null||e.send(JSON.stringify(n))})});
```

---

## plugins/basic-plugin/dist/content.js

```javascript
chrome.runtime.onMessage.addListener(e=>{if(r(e)){const o=document.title,t=[];document.querySelectorAll("a").forEach((n,s)=>{s<15&&n.href&&t.push(n.href)}),chrome.runtime.sendMessage({type:"RAW_DOM_DATA",data:{url:window.location.href,title:o,links:t,timestamp:Date.now()}})}});function r(e){return e&&e.command==="START_DOM_CRAWL"}
```

---

## plugins/basic-plugin/dist/manifest.json

```json
{
  "manifest_version": 3,
  "name": "기본 검증용 수집 플러그인",
  "version": "1.0.0",
  "description": "WebCrawlServer 분산 크롤링 실시간 연동 확장 프로그램",
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ],
  "action": {
    "default_popup": "popup.html"
  }
}
```

---

## plugins/basic-plugin/dist/popup.html

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>수집기 제어판</title>
    <script type="module" crossorigin src="/popup.js"></script>
  </head>
  <body class="bg-gray-900 text-white w-[300px] p-4 font-sans select-none">
    <div id="root"></div>
  </body>
</html>
```

---

## plugins/basic-plugin/dist/popup.js

```javascript
(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))u(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&u(i)}).observe(document,{childList:!0,subtree:!0});function r(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function u(n){if(n.ep)return;n.ep=!0;const s=r(n);fetch(n.href,s)}})();var v={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var L=Symbol.for("react.transitional.element"),M=Symbol.for("react.fragment");function O(t,e,r){var u=null;if(r!==void 0&&(u=""+r),e.key!==void 0&&(u=""+e.key),"key"in e){r={};for(var n in e)n!=="key"&&(r[n]=e[n])}else r=e;return e=r.ref,{$$typeof:L,type:t,key:u,ref:e!==void 0?e:null,props:r}}v.Fragment=M;v.jsx=O;v.jsxs=O;var o={};/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var T=Symbol.for("react.transitional.element"),I=Symbol.for("react.portal"),k=Symbol.for("react.fragment"),x=Symbol.for("react.strict_mode"),U=Symbol.for("react.profiler"),D=Symbol.for("react.consumer"),b=Symbol.for("react.context"),q=Symbol.for("react.forward_ref"),z=Symbol.for("react.suspense"),G=Symbol.for("react.memo"),g=Symbol.for("react.lazy"),B=Symbol.for("react.activity"),A=Symbol.iterator;function W(t){return t===null||typeof t!="object"?null:(t=A&&t[A]||t["@@iterator"],typeof t=="function"?t:null)}var w={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},j=Object.assign,H={};function a(t,e,r){this.props=t,this.context=e,this.refs=H,this.updater=r||w}a.prototype.isReactComponent={};a.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};a.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function $(){}$.prototype=a.prototype;function d(t,e,r){this.props=t,this.context=e,this.refs=H,this.updater=r||w}var m=d.prototype=new $;m.constructor=d;j(m,a.prototype);m.isPureReactComponent=!0;var S=Array.isArray;function y(){}var f={H:null,A:null,T:null,S:null},N=Object.prototype.hasOwnProperty;function R(t,e,r){var u=r.ref;return{$$typeof:T,type:t,key:e,ref:u!==void 0?u:null,props:r}}function J(t,e){return R(t.type,e,t.props)}function C(t){return typeof t=="object"&&t!==null&&t.$$typeof===T}function Q(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(r){return e[r]})}var h=/\/+/g;function E(t,e){return typeof t=="object"&&t!==null&&t.key!=null?Q(""+t.key):e.toString(36)}function X(t){switch(t.status){case"fulfilled":return t.value;case"rejected":throw t.reason;default:switch(typeof t.status=="string"?t.then(y,y):(t.status="pending",t.then(function(e){t.status==="pending"&&(t.status="fulfilled",t.value=e)},function(e){t.status==="pending"&&(t.status="rejected",t.reason=e)})),t.status){case"fulfilled":return t.value;case"rejected":throw t.reason}}throw t}function l(t,e,r,u,n){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var i=!1;if(t===null)i=!0;else switch(s){case"bigint":case"string":case"number":i=!0;break;case"object":switch(t.$$typeof){case T:case I:i=!0;break;case g:return i=t._init,l(i(t._payload),e,r,u,n)}}if(i)return n=n(t),i=u===""?"."+E(t,0):u,S(n)?(r="",i!=null&&(r=i.replace(h,"$&/")+"/"),l(n,e,r,"",function(Y){return Y})):n!=null&&(C(n)&&(n=J(n,r+(n.key==null||t&&t.key===n.key?"":(""+n.key).replace(h,"$&/")+"/")+i)),e.push(n)),1;i=0;var p=u===""?".":u+":";if(S(t))for(var c=0;c<t.length;c++)u=t[c],s=p+E(u,c),i+=l(u,e,r,s,n);else if(c=W(t),typeof c=="function")for(t=c.call(t),c=0;!(u=t.next()).done;)u=u.value,s=p+E(u,c++),i+=l(u,e,r,s,n);else if(s==="object"){if(typeof t.then=="function")return l(X(t),e,r,u,n);throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.")}return i}function _(t,e,r){if(t==null)return t;var u=[],n=0;return l(t,u,"","",function(s){return e.call(r,s,n++)}),u}function Z(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(r){(t._status===0||t._status===-1)&&(t._status=1,t._result=r)},function(r){(t._status===0||t._status===-1)&&(t._status=2,t._result=r)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var P=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},K={map:_,forEach:function(t,e,r){_(t,function(){e.apply(this,arguments)},r)},count:function(t){var e=0;return _(t,function(){e++}),e},toArray:function(t){return _(t,function(e){return e})||[]},only:function(t){if(!C(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};o.Activity=B;o.Children=K;o.Component=a;o.Fragment=k;o.Profiler=U;o.PureComponent=d;o.StrictMode=x;o.Suspense=z;o.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=f;o.__COMPILER_RUNTIME={__proto__:null,c:function(t){return f.H.useMemoCache(t)}};o.cache=function(t){return function(){return t.apply(null,arguments)}};o.cacheSignal=function(){return null};o.cloneElement=function(t,e,r){if(t==null)throw Error("The argument must be a React element, but you passed "+t+".");var u=j({},t.props),n=t.key;if(e!=null)for(s in e.key!==void 0&&(n=""+e.key),e)!N.call(e,s)||s==="key"||s==="__self"||s==="__source"||s==="ref"&&e.ref===void 0||(u[s]=e[s]);var s=arguments.length-2;if(s===1)u.children=r;else if(1<s){for(var i=Array(s),p=0;p<s;p++)i[p]=arguments[p+2];u.children=i}return R(t.type,n,u)};o.createContext=function(t){return t={$$typeof:b,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null},t.Provider=t,t.Consumer={$$typeof:D,_context:t},t};o.createElement=function(t,e,r){var u,n={},s=null;if(e!=null)for(u in e.key!==void 0&&(s=""+e.key),e)N.call(e,u)&&u!=="key"&&u!=="__self"&&u!=="__source"&&(n[u]=e[u]);var i=arguments.length-2;if(i===1)n.children=r;else if(1<i){for(var p=Array(i),c=0;c<i;c++)p[c]=arguments[c+2];n.children=p}if(t&&t.defaultProps)for(u in i=t.defaultProps,i)n[u]===void 0&&(n[u]=i[u]);return R(t,s,n)};o.createRef=function(){return{current:null}};o.forwardRef=function(t){return{$$typeof:q,render:t}};o.isValidElement=C;o.lazy=function(t){return{$$typeof:g,_payload:{_status:-1,_result:t},_init:Z}};o.memo=function(t,e){return{$$typeof:G,type:t,compare:e===void 0?null:e}};o.startTransition=function(t){var e=f.T,r={};f.T=r;try{var u=t(),n=f.S;n!==null&&n(r,u),typeof u=="object"&&u!==null&&typeof u.then=="function"&&u.then(y,P)}catch(s){P(s)}finally{e!==null&&r.types!==null&&(e.types=r.types),f.T=e}};o.unstable_useCacheRefresh=function(){return f.H.useCacheRefresh()};o.use=function(t){return f.H.use(t)};o.useActionState=function(t,e,r){return f.H.useActionState(t,e,r)};o.useCallback=function(t,e){return f.H.useCallback(t,e)};o.useContext=function(t){return f.H.useContext(t)};o.useDebugValue=function(){};o.useDeferredValue=function(t,e){return f.H.useDeferredValue(t,e)};o.useEffect=function(t,e){return f.H.useEffect(t,e)};o.useEffectEvent=function(t){return f.H.useEffectEvent(t)};o.useId=function(){return f.H.useId()};o.useImperativeHandle=function(t,e,r){return f.H.useImperativeHandle(t,e,r)};o.useInsertionEffect=function(t,e){return f.H.useInsertionEffect(t,e)};o.useLayoutEffect=function(t,e){return f.H.useLayoutEffect(t,e)};o.useMemo=function(t,e){return f.H.useMemo(t,e)};o.useOptimistic=function(t,e){return f.H.useOptimistic(t,e)};o.useReducer=function(t,e,r){return f.H.useReducer(t,e,r)};o.useRef=function(t){return f.H.useRef(t)};o.useState=function(t){return f.H.useState(t)};o.useSyncExternalStore=function(t,e,r){return f.H.useSyncExternalStore(t,e,r)};o.useTransition=function(){return f.H.useTransition()};o.version="19.2.8";
```

---

## plugins/basic-plugin/public/manifest.json

```json
{
  "manifest_version": 3,
  "name": "기본 검증용 수집 플러그인",
  "version": "1.0.0",
  "description": "WebCrawlServer 분산 크롤링 실시간 연동 확장 프로그램",
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ],
  "action": {
    "default_popup": "popup.html"
  }
}
```

---

## plugins/basic-plugin/src/background.ts

```typescript
// 브라우저 로컬 영구 적재 영역에서 UUID를 검출하거나 신규 자동 발급 보존하는 함수
async function getOrCreateClientId(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["clientId"], (result) => {
      if (result && typeof result.clientId === "string") {
        resolve(result.clientId);
      } else {
        const generatedId = crypto.randomUUID();
        chrome.storage.local.set({ clientId: generatedId }, () => {
          resolve(generatedId);
        });
      }
    });
  });
}

let socket: WebSocket | null = null;
let reconnectTimer: number | null = null;

// 백엔드 API 서버(포트 9600)와 영속성 실시간 통신망을 수립하는 주 가동 함수
async function connectToServer() {
  if (socket && socket.readyState === WebSocket.OPEN) return;

  const clientId = await getOrCreateClientId();
  const wsUrl = `ws://localhost:9600?clientId=${clientId}&clientType=plugin`;

  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    // 연결 이벤트 발생 시 서버로 정형 헬로 패킷 발송
    const helloPacket = {
      senderId: clientId,
      targetId: "ALL",
      action: "CRAWL_LOG",
      payload: { system: "수집기 소켓 통신망 정상 안착 완료" },
    };
    socket?.send(JSON.stringify(helloPacket));
  };

  // 관리자 대시보드 웹으로부터 서버를 거쳐 유입되는 중계 원격 수집 지시 제어 수용
  socket.onmessage = (event) => {
    try {
      const packet = JSON.parse(event.data);

      // 관리자의 원격 수집 개시 지시가 도달할 시 수행할 로직
      if (packet.action === "CRAWL_START") {
        // activeTab에 강제 수집기 침투 주입 개시
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          if (activeTab && activeTab.id) {
            chrome.tabs.sendMessage(activeTab.id, {
              command: "START_DOM_CRAWL",
              depth: packet.payload.depth,
            });
          }
        });
      }
    } catch {
      // 오류 패킷 무시
    }
  };

  // 소켓 끊김 감지 시 3초의 유휴 주기를 두고 재귀 호출을 단행하여 소켓 수명을 영구 결속 복구
  socket.onclose = () => {
    socket = null;
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        connectToServer();
      }, 3000) as unknown as number;
    }
  };

  socket.onerror = () => {
    socket = null;
  };
}

// 크롬 브라우저가 확장 프로그램을 가동 및 로드할 때 백그라운드 서비스 워커 즉각 활성화 가동
chrome.runtime.onInstalled.addListener(() => {
  connectToServer();
});

chrome.runtime.onStartup.addListener(() => {
  connectToServer();
});

// 침투 주입된 content.ts 수집기로부터 획득한 수집 결과물 데이터를 소켓 채널로 백엔드 전달 중계
chrome.runtime.onMessage.addListener((message) => {
  if (
    message.type === "RAW_DOM_DATA" &&
    socket &&
    socket.readyState === WebSocket.OPEN
  ) {
    getOrCreateClientId().then((clientId) => {
      const logPacket = {
        senderId: clientId,
        targetId: "ALL", // 대시보드 웹이 즉각 인출하도록 전체 브로드캐스트 전송
        action: "CRAWL_LOG",
        payload: message.data,
      };
      socket?.send(JSON.stringify(logPacket));
    });
  }
});
```

---

## plugins/basic-plugin/src/content.ts

```typescript
// 백그라운드 워커의 지시를 수신하여 현재 로드된 타깃 웹페이지의 제목과 하이퍼링크 리스트를 긁어 전달
chrome.runtime.onMessage.addListener((request) => {
  if (messageCommandIsStart(request)) {
    const pageTitle = document.title;
    const hyperlinks: string[] = [];

    const anchors = document.querySelectorAll("a");
    anchors.forEach((a, idx) => {
      if (idx < 15 && a.href) hyperlinks.push(a.href); // 경량 노트북 연산 부하 방지를 위해 15개 제한 검사
    });

    // 획득한 원천 데이터를 백그라운드 브릿지 파이프라인으로 릴레이 이송
    chrome.runtime.sendMessage({
      type: "RAW_DOM_DATA",
      data: {
        url: window.location.href,
        title: pageTitle,
        links: hyperlinks,
        timestamp: Date.now(),
      },
    });
  }
});

type ContentMessage = {
  command?: string;
};

function isContentMessage(value: unknown): value is ContentMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    "command" in value &&
    typeof (value as { command?: unknown }).command === "string"
  );
}

function messageCommandIsStart(req: unknown): boolean {
  return isContentMessage(req) && req.command === "START_DOM_CRAWL";
}
```

---

## plugins/basic-plugin/src/popup.tsx

```tsx
import { useState, useEffect } from 'react';

export default function Popup() {
  const [localId, setLocalId] = useState<string>('조회 대기 중...');

  useEffect(() => {
    chrome.storage.local.get(['clientId'], (result) => {
      if (result && result.clientId) {
        setLocalId(result.clientId);
      }
    });
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="border-b border-gray-800 pb-1.5">
        <h1 className="text-sm font-bold text-blue-400">분산 수집 노드 제어기</h1>
        <p className="text-[10px] text-gray-400">WebCrawlServer 연동 플러그인</p>
      </div>
      <div className="bg-gray-800 p-2.5 rounded flex flex-col gap-1 text-[10px]">
        <div className="text-gray-400 font-bold">배정된 고유 기기 ID (UUID)</div>
        <div className="font-mono text-blue-200 select-text break-all">{localId}</div>
      </div>
      <div className="text-[9px] text-gray-500 text-center select-none">본 장치는 백그라운드 소켓 영속 감시 모드로 동작합니다.</div>
    </div>
  );
}
```

---

## server/public/assets/index-0CDWvoqm.js

```javascript
(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const u of document.querySelectorAll('link[rel="modulepreload"]'))e(u);new MutationObserver(u=>{for(const n of u)if(n.type==="childList")for(const c of n.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&e(c)}).observe(document,{childList:!0,subtree:!0});function a(u){const n={};return u.integrity&&(n.integrity=u.integrity),u.referrerPolicy&&(n.referrerPolicy=u.referrerPolicy),u.crossOrigin==="use-credentials"?n.credentials="include":u.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function e(u){if(u.ep)return;u.ep=!0;const n=a(u);fetch(u.href,n)}})();function $s(l){return l&&l.__esModule&&Object.prototype.hasOwnProperty.call(l,"default")?l.default:l}var Ws={exports:{}},gn={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Po=Symbol.for("react.transitional.element"),lm=Symbol.for("react.fragment");function ks(l,t,a){var e=null;if(a!==void 0&&(e=""+a),t.key!==void 0&&(e=""+t.key),"key"in t){a={};for(var u in t)u!=="key"&&(a[u]=t[u])}else a=t;return t=a.ref,{$$typeof:Po,type:l,key:e,ref:t!==void 0?t:null,props:a}}gn.Fragment=lm;gn.jsx=ks;gn.jsxs=ks;Ws.exports=gn;var v=Ws.exports,Fs={exports:{}},N={};/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var bf=Symbol.for("react.transitional.element"),tm=Symbol.for("react.portal"),am=Symbol.for("react.fragment"),em=Symbol.for("react.strict_mode"),um=Symbol.for("react.profiler"),nm=Symbol.for("react.consumer"),cm=Symbol.for("react.context"),fm=Symbol.for("react.forward_ref"),im=Symbol.for("react.suspense"),sm=Symbol.for("react.memo"),Is=Symbol.for("react.lazy"),dm=Symbol.for("react.activity"),Ei=Symbol.iterator;function om(l){return l===null||typeof l!="object"?null:(l=Ei&&l[Ei]||l["@@iterator"],typeof l=="function"?l:null)}var Ps={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},l0=Object.assign,t0={};function le(l,t,a){this.props=l,this.context=t,this.refs=t0,this.updater=a||Ps}le.prototype.isReactComponent={};le.prototype.setState=function(l,t){if(typeof l!="object"&&typeof l!="function"&&l!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,l,t,"setState")};le.prototype.forceUpdate=function(l){this.updater.enqueueForceUpdate(this,l,"forceUpdate")};function a0(){}a0.prototype=le.prototype;function Sf(l,t,a){this.props=l,this.context=t,this.refs=t0,this.updater=a||Ps}var Ef=Sf.prototype=new a0;Ef.constructor=Sf;l0(Ef,le.prototype);Ef.isPureReactComponent=!0;var zi=Array.isArray;function zc(){}var W={H:null,A:null,T:null,S:null},e0=Object.prototype.hasOwnProperty;function zf(l,t,a){var e=a.ref;return{$$typeof:bf,type:l,key:t,ref:e!==void 0?e:null,props:a}}function mm(l,t){return zf(l.type,t,l.props)}function xf(l){return typeof l=="object"&&l!==null&&l.$$typeof===bf}function ym(l){var t={"=":"=0",":":"=2"};return"$"+l.replace(/[=:]/g,function(a){return t[a]})}var xi=/\/+/g;function qn(l,t){return typeof l=="object"&&l!==null&&l.key!=null?ym(""+l.key):t.toString(36)}function vm(l){switch(l.status){case"fulfilled":return l.value;case"rejected":throw l.reason;default:switch(typeof l.status=="string"?l.then(zc,zc):(l.status="pending",l.then(function(t){l.status==="pending"&&(l.status="fulfilled",l.value=t)},function(t){l.status==="pending"&&(l.status="rejected",l.reason=t)})),l.status){case"fulfilled":return l.value;case"rejected":throw l.reason}}throw l}function za(l,t,a,e,u){var n=typeof l;(n==="undefined"||n==="boolean")&&(l=null);var c=!1;if(l===null)c=!0;else switch(n){case"bigint":case"string":case"number":c=!0;break;case"object":switch(l.$$typeof){case bf:case tm:c=!0;break;case Is:return c=l._init,za(c(l._payload),t,a,e,u)}}if(c)return u=u(l),c=e===""?"."+qn(l,0):e,zi(u)?(a="",c!=null&&(a=c.replace(xi,"$&/")+"/"),za(u,t,a,"",function(d){return d})):u!=null&&(xf(u)&&(u=mm(u,a+(u.key==null||l&&l.key===u.key?"":(""+u.key).replace(xi,"$&/")+"/")+c)),t.push(u)),1;c=0;var f=e===""?".":e+":";if(zi(l))for(var i=0;i<l.length;i++)e=l[i],n=f+qn(e,i),c+=za(e,t,a,n,u);else if(i=om(l),typeof i=="function")for(l=i.call(l),i=0;!(e=l.next()).done;)e=e.value,n=f+qn(e,i++),c+=za(e,t,a,n,u);else if(n==="object"){if(typeof l.then=="function")return za(vm(l),t,a,e,u);throw t=String(l),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(l).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return c}function su(l,t,a){if(l==null)return l;var e=[],u=0;return za(l,e,"","",function(n){return t.call(a,n,u++)}),e}function hm(l){if(l._status===-1){var t=l._result;t=t(),t.then(function(a){(l._status===0||l._status===-1)&&(l._status=1,l._result=a)},function(a){(l._status===0||l._status===-1)&&(l._status=2,l._result=a)}),l._status===-1&&(l._status=0,l._result=t)}if(l._status===1)return l._result.default;throw l._result}var Ti=typeof reportError=="function"?reportError:function(l){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof l=="object"&&l!==null&&typeof l.message=="string"?String(l.message):String(l),error:l});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",l);return}console.error(l)},rm={map:su,forEach:function(l,t,a){su(l,function(){t.apply(this,arguments)},a)},count:function(l){var t=0;return su(l,function(){t++}),t},toArray:function(l){return su(l,function(t){return t})||[]},only:function(l){if(!xf(l))throw Error("React.Children.only expected to receive a single React element child.");return l}};N.Activity=dm;N.Children=rm;N.Component=le;N.Fragment=am;N.Profiler=um;N.PureComponent=Sf;N.StrictMode=em;N.Suspense=im;N.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=W;N.__COMPILER_RUNTIME={__proto__:null,c:function(l){return W.H.useMemoCache(l)}};N.cache=function(l){return function(){return l.apply(null,arguments)}};N.cacheSignal=function(){return null};N.cloneElement=function(l,t,a){if(l==null)throw Error("The argument must be a React element, but you passed "+l+".");var e=l0({},l.props),u=l.key;if(t!=null)for(n in t.key!==void 0&&(u=""+t.key),t)!e0.call(t,n)||n==="key"||n==="__self"||n==="__source"||n==="ref"&&t.ref===void 0||(e[n]=t[n]);var n=arguments.length-2;if(n===1)e.children=a;else if(1<n){for(var c=Array(n),f=0;f<n;f++)c[f]=arguments[f+2];e.children=c}return zf(l.type,u,e)};N.createContext=function(l){return l={$$typeof:cm,_currentValue:l,_currentValue2:l,_threadCount:0,Provider:null,Consumer:null},l.Provider=l,l.Consumer={$$typeof:nm,_context:l},l};N.createElement=function(l,t,a){var e,u={},n=null;if(t!=null)for(e in t.key!==void 0&&(n=""+t.key),t)e0.call(t,e)&&e!=="key"&&e!=="__self"&&e!=="__source"&&(u[e]=t[e]);var c=arguments.length-2;if(c===1)u.children=a;else if(1<c){for(var f=Array(c),i=0;i<c;i++)f[i]=arguments[i+2];u.children=f}if(l&&l.defaultProps)for(e in c=l.defaultProps,c)u[e]===void 0&&(u[e]=c[e]);return zf(l,n,u)};N.createRef=function(){return{current:null}};N.forwardRef=function(l){return{$$typeof:fm,render:l}};N.isValidElement=xf;N.lazy=function(l){return{$$typeof:Is,_payload:{_status:-1,_result:l},_init:hm}};N.memo=function(l,t){return{$$typeof:sm,type:l,compare:t===void 0?null:t}};N.startTransition=function(l){var t=W.T,a={};W.T=a;try{var e=l(),u=W.S;u!==null&&u(a,e),typeof e=="object"&&e!==null&&typeof e.then=="function"&&e.then(zc,Ti)}catch(n){Ti(n)}finally{t!==null&&a.types!==null&&(t.types=a.types),W.T=t}};N.unstable_useCacheRefresh=function(){return W.H.useCacheRefresh()};N.use=function(l){return W.H.use(l)};N.useActionState=function(l,t,a){return W.H.useActionState(l,t,a)};N.useCallback=function(l,t){return W.H.useCallback(l,t)};N.useContext=function(l){return W.H.useContext(l)};N.useDebugValue=function(){};N.useDeferredValue=function(l,t){return W.H.useDeferredValue(l,t)};N.useEffect=function(l,t){return W.H.useEffect(l,t)};N.useEffectEvent=function(l){return W.H.useEffectEvent(l)};N.useId=function(){return W.H.useId()};N.useImperativeHandle=function(l,t,a){return W.H.useImperativeHandle(l,t,a)};N.useInsertionEffect=function(l,t){return W.H.useInsertionEffect(l,t)};N.useLayoutEffect=function(l,t){return W.H.useLayoutEffect(l,t)};N.useMemo=function(l,t){return W.H.useMemo(l,t)};N.useOptimistic=function(l,t){return W.H.useOptimistic(l,t)};N.useReducer=function(l,t,a){return W.H.useReducer(l,t,a)};N.useRef=function(l){return W.H.useRef(l)};N.useState=function(l){return W.H.useState(l)};N.useSyncExternalStore=function(l,t,a){return W.H.useSyncExternalStore(l,t,a)};N.useTransition=function(){return W.H.useTransition()};N.version="19.2.8";Fs.exports=N;var tl=Fs.exports;const gm=$s(tl);var u0={exports:{}},bn={},n0={exports:{}},c0={};/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(l){function t(x,U){var j=x.length;x.push(U);l:for(;0<j;){var ll=j-1>>>1,dl=x[ll];if(0<u(dl,U))x[ll]=U,x[j]=dl,j=ll;else break l}}function a(x){return x.length===0?null:x[0]}function e(x){if(x.length===0)return null;var U=x[0],j=x.pop();if(j!==U){x[0]=j;l:for(var ll=0,dl=x.length,cu=dl>>>1;ll<cu;){var fu=2*(ll+1)-1,Yn=x[fu],It=fu+1,iu=x[It];if(0>u(Yn,j))It<dl&&0>u(iu,Yn)?(x[ll]=iu,x[It]=j,ll=It):(x[ll]=Yn,x[fu]=j,ll=fu);else if(It<dl&&0>u(iu,j))x[ll]=iu,x[It]=j,ll=It;else break l}}return U}function u(x,U){var j=x.sortIndex-U.sortIndex;return j!==0?j:x.id-U.id}if(l.unstable_now=void 0,typeof performance=="object"&&typeof performance.now=="function"){var n=performance;l.unstable_now=function(){return n.now()}}else{var c=Date,f=c.now();l.unstable_now=function(){return c.now()-f}}var i=[],d=[],r=1,g=null,m=3,h=!1,E=!1,T=!1,q=!1,o=typeof setTimeout=="function"?setTimeout:null,s=typeof clearTimeout=="function"?clearTimeout:null,y=typeof setImmediate<"u"?setImmediate:null;function b(x){for(var U=a(d);U!==null;){if(U.callback===null)e(d);else if(U.startTime<=x)e(d),U.sortIndex=U.expirationTime,t(i,U);else break;U=a(d)}}function A(x){if(T=!1,b(x),!E)if(a(i)!==null)E=!0,M||(M=!0,At());else{var U=a(d);U!==null&&Bn(A,U.startTime-x)}}var M=!1,z=-1,_=5,D=-1;function B(){return q?!0:!(l.unstable_now()-D<_)}function Gl(){if(q=!1,M){var x=l.unstable_now();D=x;var U=!0;try{l:{E=!1,T&&(T=!1,s(z),z=-1),h=!0;var j=m;try{t:{for(b(x),g=a(i);g!==null&&!(g.expirationTime>x&&B());){var ll=g.callback;if(typeof ll=="function"){g.callback=null,m=g.priorityLevel;var dl=ll(g.expirationTime<=x);if(x=l.unstable_now(),typeof dl=="function"){g.callback=dl,b(x),U=!0;break t}g===a(i)&&e(i),b(x)}else e(i);g=a(i)}if(g!==null)U=!0;else{var cu=a(d);cu!==null&&Bn(A,cu.startTime-x),U=!1}}break l}finally{g=null,m=j,h=!1}U=void 0}}finally{U?At():M=!1}}}var At;if(typeof y=="function")At=function(){y(Gl)};else if(typeof MessageChannel<"u"){var Si=new MessageChannel,Io=Si.port2;Si.port1.onmessage=Gl,At=function(){Io.postMessage(null)}}else At=function(){o(Gl,0)};function Bn(x,U){z=o(function(){x(l.unstable_now())},U)}l.unstable_IdlePriority=5,l.unstable_ImmediatePriority=1,l.unstable_LowPriority=4,l.unstable_NormalPriority=3,l.unstable_Profiling=null,l.unstable_UserBlockingPriority=2,l.unstable_cancelCallback=function(x){x.callback=null},l.unstable_forceFrameRate=function(x){0>x||125<x?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):_=0<x?Math.floor(1e3/x):5},l.unstable_getCurrentPriorityLevel=function(){return m},l.unstable_next=function(x){switch(m){case 1:case 2:case 3:var U=3;break;default:U=m}var j=m;m=U;try{return x()}finally{m=j}},l.unstable_requestPaint=function(){q=!0},l.unstable_runWithPriority=function(x,U){switch(x){case 1:case 2:case 3:case 4:case 5:break;default:x=3}var j=m;m=x;try{return U()}finally{m=j}},l.unstable_scheduleCallback=function(x,U,j){var ll=l.unstable_now();switch(typeof j=="object"&&j!==null?(j=j.delay,j=typeof j=="number"&&0<j?ll+j:ll):j=ll,x){case 1:var dl=-1;break;case 2:dl=250;break;case 5:dl=1073741823;break;case 4:dl=1e4;break;default:dl=5e3}return dl=j+dl,x={id:r++,callback:U,priorityLevel:x,startTime:j,expirationTime:dl,sortIndex:-1},j>ll?(x.sortIndex=j,t(d,x),a(i)===null&&x===a(d)&&(T?(s(z),z=-1):T=!0,Bn(A,j-ll))):(x.sortIndex=dl,t(i,x),E||h||(E=!0,M||(M=!0,At()))),x},l.unstable_shouldYield=B,l.unstable_wrapCallback=function(x){var U=m;return function(){var j=m;m=U;try{return x.apply(this,arguments)}finally{m=j}}}})(c0);n0.exports=c0;var bm=n0.exports,f0={exports:{}},zl={};/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Sm=tl;function i0(l){var t="https://react.dev/errors/"+l;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+l+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function pt(){}var El={d:{f:pt,r:function(){throw Error(i0(522))},D:pt,C:pt,L:pt,m:pt,X:pt,S:pt,M:pt},p:0,findDOMNode:null},Em=Symbol.for("react.portal");function zm(l,t,a){var e=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Em,key:e==null?null:""+e,children:l,containerInfo:t,implementation:a}}var Ee=Sm.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Sn(l,t){if(l==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}zl.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=El;zl.createPortal=function(l,t){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(i0(299));return zm(l,t,null,a)};zl.flushSync=function(l){var t=Ee.T,a=El.p;try{if(Ee.T=null,El.p=2,l)return l()}finally{Ee.T=t,El.p=a,El.d.f()}};zl.preconnect=function(l,t){typeof l=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,El.d.C(l,t))};zl.prefetchDNS=function(l){typeof l=="string"&&El.d.D(l)};zl.preinit=function(l,t){if(typeof l=="string"&&t&&typeof t.as=="string"){var a=t.as,e=Sn(a,t.crossOrigin),u=typeof t.integrity=="string"?t.integrity:void 0,n=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;a==="style"?El.d.S(l,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:e,integrity:u,fetchPriority:n}):a==="script"&&El.d.X(l,{crossOrigin:e,integrity:u,fetchPriority:n,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};zl.preinitModule=function(l,t){if(typeof l=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var a=Sn(t.as,t.crossOrigin);El.d.M(l,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0})}}else t==null&&El.d.M(l)};zl.preload=function(l,t){if(typeof l=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var a=t.as,e=Sn(a,t.crossOrigin);El.d.L(l,a,{crossOrigin:e,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};zl.preloadModule=function(l,t){if(typeof l=="string")if(t){var a=Sn(t.as,t.crossOrigin);El.d.m(l,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0})}else El.d.m(l)};zl.requestFormReset=function(l){El.d.r(l)};zl.unstable_batchedUpdates=function(l,t){return l(t)};zl.useFormState=function(l,t,a){return Ee.H.useFormState(l,t,a)};zl.useFormStatus=function(){return Ee.H.useHostTransitionStatus()};zl.version="19.2.8";function s0(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(s0)}catch(l){console.error(l)}}s0(),f0.exports=zl;var xm=f0.exports;/**
 * @license React
 * react-dom-client.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var sl=bm,d0=tl,Tm=xm;function S(l){var t="https://react.dev/errors/"+l;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+l+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function o0(l){return!(!l||l.nodeType!==1&&l.nodeType!==9&&l.nodeType!==11)}function $e(l){var t=l,a=l;if(l.alternate)for(;t.return;)t=t.return;else{l=t;do t=l,t.flags&4098&&(a=t.return),l=t.return;while(l)}return t.tag===3?a:null}function m0(l){if(l.tag===13){var t=l.memoizedState;if(t===null&&(l=l.alternate,l!==null&&(t=l.memoizedState)),t!==null)return t.dehydrated}return null}function y0(l){if(l.tag===31){var t=l.memoizedState;if(t===null&&(l=l.alternate,l!==null&&(t=l.memoizedState)),t!==null)return t.dehydrated}return null}function Ai(l){if($e(l)!==l)throw Error(S(188))}function Am(l){var t=l.alternate;if(!t){if(t=$e(l),t===null)throw Error(S(188));return t!==l?null:l}for(var a=l,e=t;;){var u=a.return;if(u===null)break;var n=u.alternate;if(n===null){if(e=u.return,e!==null){a=e;continue}break}if(u.child===n.child){for(n=u.child;n;){if(n===a)return Ai(u),l;if(n===e)return Ai(u),t;n=n.sibling}throw Error(S(188))}if(a.return!==e.return)a=u,e=n;else{for(var c=!1,f=u.child;f;){if(f===a){c=!0,a=u,e=n;break}if(f===e){c=!0,e=u,a=n;break}f=f.sibling}if(!c){for(f=n.child;f;){if(f===a){c=!0,a=n,e=u;break}if(f===e){c=!0,e=n,a=u;break}f=f.sibling}if(!c)throw Error(S(189))}}if(a.alternate!==e)throw Error(S(190))}if(a.tag!==3)throw Error(S(188));return a.stateNode.current===a?l:t}function v0(l){var t=l.tag;if(t===5||t===26||t===27||t===6)return l;for(l=l.child;l!==null;){if(t=v0(l),t!==null)return t;l=l.sibling}return null}var k=Object.assign,pm=Symbol.for("react.element"),du=Symbol.for("react.transitional.element"),he=Symbol.for("react.portal"),Aa=Symbol.for("react.fragment"),h0=Symbol.for("react.strict_mode"),xc=Symbol.for("react.profiler"),r0=Symbol.for("react.consumer"),mt=Symbol.for("react.context"),Tf=Symbol.for("react.forward_ref"),Tc=Symbol.for("react.suspense"),Ac=Symbol.for("react.suspense_list"),Af=Symbol.for("react.memo"),_t=Symbol.for("react.lazy"),pc=Symbol.for("react.activity"),_m=Symbol.for("react.memo_cache_sentinel"),pi=Symbol.iterator;function ie(l){return l===null||typeof l!="object"?null:(l=pi&&l[pi]||l["@@iterator"],typeof l=="function"?l:null)}var Nm=Symbol.for("react.client.reference");function _c(l){if(l==null)return null;if(typeof l=="function")return l.$$typeof===Nm?null:l.displayName||l.name||null;if(typeof l=="string")return l;switch(l){case Aa:return"Fragment";case xc:return"Profiler";case h0:return"StrictMode";case Tc:return"Suspense";case Ac:return"SuspenseList";case pc:return"Activity"}if(typeof l=="object")switch(l.$$typeof){case he:return"Portal";case mt:return l.displayName||"Context";case r0:return(l._context.displayName||"Context")+".Consumer";case Tf:var t=l.render;return l=l.displayName,l||(l=t.displayName||t.name||"",l=l!==""?"ForwardRef("+l+")":"ForwardRef"),l;case Af:return t=l.displayName||null,t!==null?t:_c(l.type)||"Memo";case _t:t=l._payload,l=l._init;try{return _c(l(t))}catch{}}return null}var re=Array.isArray,p=d0.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Q=Tm.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ua={pending:!1,data:null,method:null,action:null},Nc=[],pa=-1;function et(l){return{current:l}}function yl(l){0>pa||(l.current=Nc[pa],Nc[pa]=null,pa--)}function J(l,t){pa++,Nc[pa]=l.current,l.current=t}var at=et(null),He=et(null),Yt=et(null),Xu=et(null);function Zu(l,t){switch(J(Yt,t),J(He,l),J(at,null),t.nodeType){case 9:case 11:l=(l=t.documentElement)&&(l=l.namespaceURI)?js(l):0;break;default:if(l=t.tagName,t=t.namespaceURI)t=js(t),l=Yo(t,l);else switch(l){case"svg":l=1;break;case"math":l=2;break;default:l=0}}yl(at),J(at,l)}function La(){yl(at),yl(He),yl(Yt)}function Oc(l){l.memoizedState!==null&&J(Xu,l);var t=at.current,a=Yo(t,l.type);t!==a&&(J(He,l),J(at,a))}function Lu(l){He.current===l&&(yl(at),yl(He)),Xu.current===l&&(yl(Xu),Ke._currentValue=ua)}var Gn,_i;function la(l){if(Gn===void 0)try{throw Error()}catch(a){var t=a.stack.trim().match(/\n( *(at )?)/);Gn=t&&t[1]||"",_i=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Gn+l+_i}var Qn=!1;function Xn(l,t){if(!l||Qn)return"";Qn=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var e={DetermineComponentFrameRoot:function(){try{if(t){var g=function(){throw Error()};if(Object.defineProperty(g.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(g,[])}catch(h){var m=h}Reflect.construct(l,[],g)}else{try{g.call()}catch(h){m=h}l.call(g.prototype)}}else{try{throw Error()}catch(h){m=h}(g=l())&&typeof g.catch=="function"&&g.catch(function(){})}}catch(h){if(h&&m&&typeof h.stack=="string")return[h.stack,m.stack]}return[null,null]}};e.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var u=Object.getOwnPropertyDescriptor(e.DetermineComponentFrameRoot,"name");u&&u.configurable&&Object.defineProperty(e.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var n=e.DetermineComponentFrameRoot(),c=n[0],f=n[1];if(c&&f){var i=c.split(`
`),d=f.split(`
`);for(u=e=0;e<i.length&&!i[e].includes("DetermineComponentFrameRoot");)e++;for(;u<d.length&&!d[u].includes("DetermineComponentFrameRoot");)u++;if(e===i.length||u===d.length)for(e=i.length-1,u=d.length-1;1<=e&&0<=u&&i[e]!==d[u];)u--;for(;1<=e&&0<=u;e--,u--)if(i[e]!==d[u]){if(e!==1||u!==1)do if(e--,u--,0>u||i[e]!==d[u]){var r=`
`+i[e].replace(" at new "," at ");return l.displayName&&r.includes("<anonymous>")&&(r=r.replace("<anonymous>",l.displayName)),r}while(1<=e&&0<=u);break}}}finally{Qn=!1,Error.prepareStackTrace=a}return(a=l?l.displayName||l.name:"")?la(a):""}function Om(l,t){switch(l.tag){case 26:case 27:case 5:return la(l.type);case 16:return la("Lazy");case 13:return l.child!==t&&t!==null?la("Suspense Fallback"):la("Suspense");case 19:return la("SuspenseList");case 0:case 15:return Xn(l.type,!1);case 11:return Xn(l.type.render,!1);case 1:return Xn(l.type,!0);case 31:return la("Activity");default:return""}}function Ni(l){try{var t="",a=null;do t+=Om(l,a),a=l,l=l.return;while(l);return t}catch(e){return`
Error generating stack: `+e.message+`
`+e.stack}}var Mc=Object.prototype.hasOwnProperty,pf=sl.unstable_scheduleCallback,Zn=sl.unstable_cancelCallback,Mm=sl.unstable_shouldYield,Dm=sl.unstable_requestPaint,Cl=sl.unstable_now,jm=sl.unstable_getCurrentPriorityLevel,g0=sl.unstable_ImmediatePriority,b0=sl.unstable_UserBlockingPriority,Vu=sl.unstable_NormalPriority,Um=sl.unstable_LowPriority,S0=sl.unstable_IdlePriority,Cm=sl.log,Hm=sl.unstable_setDisableYieldValue,We=null,Hl=null;function Ut(l){if(typeof Cm=="function"&&Hm(l),Hl&&typeof Hl.setStrictMode=="function")try{Hl.setStrictMode(We,l)}catch{}}var Rl=Math.clz32?Math.clz32:Ym,Rm=Math.log,Bm=Math.LN2;function Ym(l){return l>>>=0,l===0?32:31-(Rm(l)/Bm|0)|0}var ou=256,mu=262144,yu=4194304;function ta(l){var t=l&42;if(t!==0)return t;switch(l&-l){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return l&261888;case 262144:case 524288:case 1048576:case 2097152:return l&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return l&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return l}}function En(l,t,a){var e=l.pendingLanes;if(e===0)return 0;var u=0,n=l.suspendedLanes,c=l.pingedLanes;l=l.warmLanes;var f=e&134217727;return f!==0?(e=f&~n,e!==0?u=ta(e):(c&=f,c!==0?u=ta(c):a||(a=f&~l,a!==0&&(u=ta(a))))):(f=e&~n,f!==0?u=ta(f):c!==0?u=ta(c):a||(a=e&~l,a!==0&&(u=ta(a)))),u===0?0:t!==0&&t!==u&&!(t&n)&&(n=u&-u,a=t&-t,n>=a||n===32&&(a&4194048)!==0)?t:u}function ke(l,t){return(l.pendingLanes&~(l.suspendedLanes&~l.pingedLanes)&t)===0}function qm(l,t){switch(l){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function E0(){var l=yu;return yu<<=1,!(yu&62914560)&&(yu=4194304),l}function Ln(l){for(var t=[],a=0;31>a;a++)t.push(l);return t}function Fe(l,t){l.pendingLanes|=t,t!==268435456&&(l.suspendedLanes=0,l.pingedLanes=0,l.warmLanes=0)}function Gm(l,t,a,e,u,n){var c=l.pendingLanes;l.pendingLanes=a,l.suspendedLanes=0,l.pingedLanes=0,l.warmLanes=0,l.expiredLanes&=a,l.entangledLanes&=a,l.errorRecoveryDisabledLanes&=a,l.shellSuspendCounter=0;var f=l.entanglements,i=l.expirationTimes,d=l.hiddenUpdates;for(a=c&~a;0<a;){var r=31-Rl(a),g=1<<r;f[r]=0,i[r]=-1;var m=d[r];if(m!==null)for(d[r]=null,r=0;r<m.length;r++){var h=m[r];h!==null&&(h.lane&=-536870913)}a&=~g}e!==0&&z0(l,e,0),n!==0&&u===0&&l.tag!==0&&(l.suspendedLanes|=n&~(c&~t))}function z0(l,t,a){l.pendingLanes|=t,l.suspendedLanes&=~t;var e=31-Rl(t);l.entangledLanes|=t,l.entanglements[e]=l.entanglements[e]|1073741824|a&261930}function x0(l,t){var a=l.entangledLanes|=t;for(l=l.entanglements;a;){var e=31-Rl(a),u=1<<e;u&t|l[e]&t&&(l[e]|=t),a&=~u}}function T0(l,t){var a=t&-t;return a=a&42?1:_f(a),a&(l.suspendedLanes|t)?0:a}function _f(l){switch(l){case 2:l=1;break;case 8:l=4;break;case 32:l=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:l=128;break;case 268435456:l=134217728;break;default:l=0}return l}function Nf(l){return l&=-l,2<l?8<l?l&134217727?32:268435456:8:2}function A0(){var l=Q.p;return l!==0?l:(l=window.event,l===void 0?32:$o(l.type))}function Oi(l,t){var a=Q.p;try{return Q.p=l,t()}finally{Q.p=a}}var kt=Math.random().toString(36).slice(2),hl="__reactFiber$"+kt,Nl="__reactProps$"+kt,te="__reactContainer$"+kt,Dc="__reactEvents$"+kt,Qm="__reactListeners$"+kt,Xm="__reactHandles$"+kt,Mi="__reactResources$"+kt,Ie="__reactMarker$"+kt;function Of(l){delete l[hl],delete l[Nl],delete l[Dc],delete l[Qm],delete l[Xm]}function _a(l){var t=l[hl];if(t)return t;for(var a=l.parentNode;a;){if(t=a[te]||a[hl]){if(a=t.alternate,t.child!==null||a!==null&&a.child!==null)for(l=Bs(l);l!==null;){if(a=l[hl])return a;l=Bs(l)}return t}l=a,a=l.parentNode}return null}function ae(l){if(l=l[hl]||l[te]){var t=l.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return l}return null}function ge(l){var t=l.tag;if(t===5||t===26||t===27||t===6)return l.stateNode;throw Error(S(33))}function Ba(l){var t=l[Mi];return t||(t=l[Mi]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function ml(l){l[Ie]=!0}var p0=new Set,_0={};function va(l,t){Va(l,t),Va(l+"Capture",t)}function Va(l,t){for(_0[l]=t,l=0;l<t.length;l++)p0.add(t[l])}var Zm=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),Di={},ji={};function Lm(l){return Mc.call(ji,l)?!0:Mc.call(Di,l)?!1:Zm.test(l)?ji[l]=!0:(Di[l]=!0,!1)}function _u(l,t,a){if(Lm(t))if(a===null)l.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":l.removeAttribute(t);return;case"boolean":var e=t.toLowerCase().slice(0,5);if(e!=="data-"&&e!=="aria-"){l.removeAttribute(t);return}}l.setAttribute(t,""+a)}}function vu(l,t,a){if(a===null)l.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":l.removeAttribute(t);return}l.setAttribute(t,""+a)}}function nt(l,t,a,e){if(e===null)l.removeAttribute(a);else{switch(typeof e){case"undefined":case"function":case"symbol":case"boolean":l.removeAttribute(a);return}l.setAttributeNS(t,a,""+e)}}function Xl(l){switch(typeof l){case"bigint":case"boolean":case"number":case"string":case"undefined":return l;case"object":return l;default:return""}}function N0(l){var t=l.type;return(l=l.nodeName)&&l.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function Vm(l,t,a){var e=Object.getOwnPropertyDescriptor(l.constructor.prototype,t);if(!l.hasOwnProperty(t)&&typeof e<"u"&&typeof e.get=="function"&&typeof e.set=="function"){var u=e.get,n=e.set;return Object.defineProperty(l,t,{configurable:!0,get:function(){return u.call(this)},set:function(c){a=""+c,n.call(this,c)}}),Object.defineProperty(l,t,{enumerable:e.enumerable}),{getValue:function(){return a},setValue:function(c){a=""+c},stopTracking:function(){l._valueTracker=null,delete l[t]}}}}function jc(l){if(!l._valueTracker){var t=N0(l)?"checked":"value";l._valueTracker=Vm(l,t,""+l[t])}}function O0(l){if(!l)return!1;var t=l._valueTracker;if(!t)return!0;var a=t.getValue(),e="";return l&&(e=N0(l)?l.checked?"true":"false":l.value),l=e,l!==a?(t.setValue(l),!0):!1}function Ku(l){if(l=l||(typeof document<"u"?document:void 0),typeof l>"u")return null;try{return l.activeElement||l.body}catch{return l.body}}var Km=/[\n"\\]/g;function Vl(l){return l.replace(Km,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function Uc(l,t,a,e,u,n,c,f){l.name="",c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"?l.type=c:l.removeAttribute("type"),t!=null?c==="number"?(t===0&&l.value===""||l.value!=t)&&(l.value=""+Xl(t)):l.value!==""+Xl(t)&&(l.value=""+Xl(t)):c!=="submit"&&c!=="reset"||l.removeAttribute("value"),t!=null?Cc(l,c,Xl(t)):a!=null?Cc(l,c,Xl(a)):e!=null&&l.removeAttribute("value"),u==null&&n!=null&&(l.defaultChecked=!!n),u!=null&&(l.checked=u&&typeof u!="function"&&typeof u!="symbol"),f!=null&&typeof f!="function"&&typeof f!="symbol"&&typeof f!="boolean"?l.name=""+Xl(f):l.removeAttribute("name")}function M0(l,t,a,e,u,n,c,f){if(n!=null&&typeof n!="function"&&typeof n!="symbol"&&typeof n!="boolean"&&(l.type=n),t!=null||a!=null){if(!(n!=="submit"&&n!=="reset"||t!=null)){jc(l);return}a=a!=null?""+Xl(a):"",t=t!=null?""+Xl(t):a,f||t===l.value||(l.value=t),l.defaultValue=t}e=e??u,e=typeof e!="function"&&typeof e!="symbol"&&!!e,l.checked=f?l.checked:!!e,l.defaultChecked=!!e,c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"&&(l.name=c),jc(l)}function Cc(l,t,a){t==="number"&&Ku(l.ownerDocument)===l||l.defaultValue===""+a||(l.defaultValue=""+a)}function Ya(l,t,a,e){if(l=l.options,t){t={};for(var u=0;u<a.length;u++)t["$"+a[u]]=!0;for(a=0;a<l.length;a++)u=t.hasOwnProperty("$"+l[a].value),l[a].selected!==u&&(l[a].selected=u),u&&e&&(l[a].defaultSelected=!0)}else{for(a=""+Xl(a),t=null,u=0;u<l.length;u++){if(l[u].value===a){l[u].selected=!0,e&&(l[u].defaultSelected=!0);return}t!==null||l[u].disabled||(t=l[u])}t!==null&&(t.selected=!0)}}function D0(l,t,a){if(t!=null&&(t=""+Xl(t),t!==l.value&&(l.value=t),a==null)){l.defaultValue!==t&&(l.defaultValue=t);return}l.defaultValue=a!=null?""+Xl(a):""}function j0(l,t,a,e){if(t==null){if(e!=null){if(a!=null)throw Error(S(92));if(re(e)){if(1<e.length)throw Error(S(93));e=e[0]}a=e}a==null&&(a=""),t=a}a=Xl(t),l.defaultValue=a,e=l.textContent,e===a&&e!==""&&e!==null&&(l.value=e),jc(l)}function Ka(l,t){if(t){var a=l.firstChild;if(a&&a===l.lastChild&&a.nodeType===3){a.nodeValue=t;return}}l.textContent=t}var Jm=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function Ui(l,t,a){var e=t.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?e?l.setProperty(t,""):t==="float"?l.cssFloat="":l[t]="":e?l.setProperty(t,a):typeof a!="number"||a===0||Jm.has(t)?t==="float"?l.cssFloat=a:l[t]=(""+a).trim():l[t]=a+"px"}function U0(l,t,a){if(t!=null&&typeof t!="object")throw Error(S(62));if(l=l.style,a!=null){for(var e in a)!a.hasOwnProperty(e)||t!=null&&t.hasOwnProperty(e)||(e.indexOf("--")===0?l.setProperty(e,""):e==="float"?l.cssFloat="":l[e]="");for(var u in t)e=t[u],t.hasOwnProperty(u)&&a[u]!==e&&Ui(l,u,e)}else for(var n in t)t.hasOwnProperty(n)&&Ui(l,n,t[n])}function Mf(l){if(l.indexOf("-")===-1)return!1;switch(l){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var wm=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),$m=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Nu(l){return $m.test(""+l)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":l}function yt(){}var Hc=null;function Df(l){return l=l.target||l.srcElement||window,l.correspondingUseElement&&(l=l.correspondingUseElement),l.nodeType===3?l.parentNode:l}var Na=null,qa=null;function Ci(l){var t=ae(l);if(t&&(l=t.stateNode)){var a=l[Nl]||null;l:switch(l=t.stateNode,t.type){case"input":if(Uc(l,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),t=a.name,a.type==="radio"&&t!=null){for(a=l;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+Vl(""+t)+'"][type="radio"]'),t=0;t<a.length;t++){var e=a[t];if(e!==l&&e.form===l.form){var u=e[Nl]||null;if(!u)throw Error(S(90));Uc(e,u.value,u.defaultValue,u.defaultValue,u.checked,u.defaultChecked,u.type,u.name)}}for(t=0;t<a.length;t++)e=a[t],e.form===l.form&&O0(e)}break l;case"textarea":D0(l,a.value,a.defaultValue);break l;case"select":t=a.value,t!=null&&Ya(l,!!a.multiple,t,!1)}}}var Vn=!1;function C0(l,t,a){if(Vn)return l(t,a);Vn=!0;try{var e=l(t);return e}finally{if(Vn=!1,(Na!==null||qa!==null)&&(Un(),Na&&(t=Na,l=qa,qa=Na=null,Ci(t),l)))for(t=0;t<l.length;t++)Ci(l[t])}}function Re(l,t){var a=l.stateNode;if(a===null)return null;var e=a[Nl]||null;if(e===null)return null;a=e[t];l:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(e=!e.disabled)||(l=l.type,e=!(l==="button"||l==="input"||l==="select"||l==="textarea")),l=!e;break l;default:l=!1}if(l)return null;if(a&&typeof a!="function")throw Error(S(231,t,typeof a));return a}var bt=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Rc=!1;if(bt)try{var se={};Object.defineProperty(se,"passive",{get:function(){Rc=!0}}),window.addEventListener("test",se,se),window.removeEventListener("test",se,se)}catch{Rc=!1}var Ct=null,jf=null,Ou=null;function H0(){if(Ou)return Ou;var l,t=jf,a=t.length,e,u="value"in Ct?Ct.value:Ct.textContent,n=u.length;for(l=0;l<a&&t[l]===u[l];l++);var c=a-l;for(e=1;e<=c&&t[a-e]===u[n-e];e++);return Ou=u.slice(l,1<e?1-e:void 0)}function Mu(l){var t=l.keyCode;return"charCode"in l?(l=l.charCode,l===0&&t===13&&(l=13)):l=t,l===10&&(l=13),32<=l||l===13?l:0}function hu(){return!0}function Hi(){return!1}function Ol(l){function t(a,e,u,n,c){this._reactName=a,this._targetInst=u,this.type=e,this.nativeEvent=n,this.target=c,this.currentTarget=null;for(var f in l)l.hasOwnProperty(f)&&(a=l[f],this[f]=a?a(n):n[f]);return this.isDefaultPrevented=(n.defaultPrevented!=null?n.defaultPrevented:n.returnValue===!1)?hu:Hi,this.isPropagationStopped=Hi,this}return k(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=hu)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=hu)},persist:function(){},isPersistent:hu}),t}var ha={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(l){return l.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},zn=Ol(ha),Pe=k({},ha,{view:0,detail:0}),Wm=Ol(Pe),Kn,Jn,de,xn=k({},Pe,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Uf,button:0,buttons:0,relatedTarget:function(l){return l.relatedTarget===void 0?l.fromElement===l.srcElement?l.toElement:l.fromElement:l.relatedTarget},movementX:function(l){return"movementX"in l?l.movementX:(l!==de&&(de&&l.type==="mousemove"?(Kn=l.screenX-de.screenX,Jn=l.screenY-de.screenY):Jn=Kn=0,de=l),Kn)},movementY:function(l){return"movementY"in l?l.movementY:Jn}}),Ri=Ol(xn),km=k({},xn,{dataTransfer:0}),Fm=Ol(km),Im=k({},Pe,{relatedTarget:0}),wn=Ol(Im),Pm=k({},ha,{animationName:0,elapsedTime:0,pseudoElement:0}),ly=Ol(Pm),ty=k({},ha,{clipboardData:function(l){return"clipboardData"in l?l.clipboardData:window.clipboardData}}),ay=Ol(ty),ey=k({},ha,{data:0}),Bi=Ol(ey),uy={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},ny={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},cy={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function fy(l){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(l):(l=cy[l])?!!t[l]:!1}function Uf(){return fy}var iy=k({},Pe,{key:function(l){if(l.key){var t=uy[l.key]||l.key;if(t!=="Unidentified")return t}return l.type==="keypress"?(l=Mu(l),l===13?"Enter":String.fromCharCode(l)):l.type==="keydown"||l.type==="keyup"?ny[l.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Uf,charCode:function(l){return l.type==="keypress"?Mu(l):0},keyCode:function(l){return l.type==="keydown"||l.type==="keyup"?l.keyCode:0},which:function(l){return l.type==="keypress"?Mu(l):l.type==="keydown"||l.type==="keyup"?l.keyCode:0}}),sy=Ol(iy),dy=k({},xn,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Yi=Ol(dy),oy=k({},Pe,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Uf}),my=Ol(oy),yy=k({},ha,{propertyName:0,elapsedTime:0,pseudoElement:0}),vy=Ol(yy),hy=k({},xn,{deltaX:function(l){return"deltaX"in l?l.deltaX:"wheelDeltaX"in l?-l.wheelDeltaX:0},deltaY:function(l){return"deltaY"in l?l.deltaY:"wheelDeltaY"in l?-l.wheelDeltaY:"wheelDelta"in l?-l.wheelDelta:0},deltaZ:0,deltaMode:0}),ry=Ol(hy),gy=k({},ha,{newState:0,oldState:0}),by=Ol(gy),Sy=[9,13,27,32],Cf=bt&&"CompositionEvent"in window,ze=null;bt&&"documentMode"in document&&(ze=document.documentMode);var Ey=bt&&"TextEvent"in window&&!ze,R0=bt&&(!Cf||ze&&8<ze&&11>=ze),qi=" ",Gi=!1;function B0(l,t){switch(l){case"keyup":return Sy.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Y0(l){return l=l.detail,typeof l=="object"&&"data"in l?l.data:null}var Oa=!1;function zy(l,t){switch(l){case"compositionend":return Y0(t);case"keypress":return t.which!==32?null:(Gi=!0,qi);case"textInput":return l=t.data,l===qi&&Gi?null:l;default:return null}}function xy(l,t){if(Oa)return l==="compositionend"||!Cf&&B0(l,t)?(l=H0(),Ou=jf=Ct=null,Oa=!1,l):null;switch(l){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return R0&&t.locale!=="ko"?null:t.data;default:return null}}var Ty={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Qi(l){var t=l&&l.nodeName&&l.nodeName.toLowerCase();return t==="input"?!!Ty[l.type]:t==="textarea"}function q0(l,t,a,e){Na?qa?qa.push(e):qa=[e]:Na=e,t=dn(t,"onChange"),0<t.length&&(a=new zn("onChange","change",null,a,e),l.push({event:a,listeners:t}))}var xe=null,Be=null;function Ay(l){Ho(l,0)}function Tn(l){var t=ge(l);if(O0(t))return l}function Xi(l,t){if(l==="change")return t}var G0=!1;if(bt){var $n;if(bt){var Wn="oninput"in document;if(!Wn){var Zi=document.createElement("div");Zi.setAttribute("oninput","return;"),Wn=typeof Zi.oninput=="function"}$n=Wn}else $n=!1;G0=$n&&(!document.documentMode||9<document.documentMode)}function Li(){xe&&(xe.detachEvent("onpropertychange",Q0),Be=xe=null)}function Q0(l){if(l.propertyName==="value"&&Tn(Be)){var t=[];q0(t,Be,l,Df(l)),C0(Ay,t)}}function py(l,t,a){l==="focusin"?(Li(),xe=t,Be=a,xe.attachEvent("onpropertychange",Q0)):l==="focusout"&&Li()}function _y(l){if(l==="selectionchange"||l==="keyup"||l==="keydown")return Tn(Be)}function Ny(l,t){if(l==="click")return Tn(t)}function Oy(l,t){if(l==="input"||l==="change")return Tn(t)}function My(l,t){return l===t&&(l!==0||1/l===1/t)||l!==l&&t!==t}var Yl=typeof Object.is=="function"?Object.is:My;function Ye(l,t){if(Yl(l,t))return!0;if(typeof l!="object"||l===null||typeof t!="object"||t===null)return!1;var a=Object.keys(l),e=Object.keys(t);if(a.length!==e.length)return!1;for(e=0;e<a.length;e++){var u=a[e];if(!Mc.call(t,u)||!Yl(l[u],t[u]))return!1}return!0}function Vi(l){for(;l&&l.firstChild;)l=l.firstChild;return l}function Ki(l,t){var a=Vi(l);l=0;for(var e;a;){if(a.nodeType===3){if(e=l+a.textContent.length,l<=t&&e>=t)return{node:a,offset:t-l};l=e}l:{for(;a;){if(a.nextSibling){a=a.nextSibling;break l}a=a.parentNode}a=void 0}a=Vi(a)}}function X0(l,t){return l&&t?l===t?!0:l&&l.nodeType===3?!1:t&&t.nodeType===3?X0(l,t.parentNode):"contains"in l?l.contains(t):l.compareDocumentPosition?!!(l.compareDocumentPosition(t)&16):!1:!1}function Z0(l){l=l!=null&&l.ownerDocument!=null&&l.ownerDocument.defaultView!=null?l.ownerDocument.defaultView:window;for(var t=Ku(l.document);t instanceof l.HTMLIFrameElement;){try{var a=typeof t.contentWindow.location.href=="string"}catch{a=!1}if(a)l=t.contentWindow;else break;t=Ku(l.document)}return t}function Hf(l){var t=l&&l.nodeName&&l.nodeName.toLowerCase();return t&&(t==="input"&&(l.type==="text"||l.type==="search"||l.type==="tel"||l.type==="url"||l.type==="password")||t==="textarea"||l.contentEditable==="true")}var Dy=bt&&"documentMode"in document&&11>=document.documentMode,Ma=null,Bc=null,Te=null,Yc=!1;function Ji(l,t,a){var e=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;Yc||Ma==null||Ma!==Ku(e)||(e=Ma,"selectionStart"in e&&Hf(e)?e={start:e.selectionStart,end:e.selectionEnd}:(e=(e.ownerDocument&&e.ownerDocument.defaultView||window).getSelection(),e={anchorNode:e.anchorNode,anchorOffset:e.anchorOffset,focusNode:e.focusNode,focusOffset:e.focusOffset}),Te&&Ye(Te,e)||(Te=e,e=dn(Bc,"onSelect"),0<e.length&&(t=new zn("onSelect","select",null,t,a),l.push({event:t,listeners:e}),t.target=Ma)))}function Pt(l,t){var a={};return a[l.toLowerCase()]=t.toLowerCase(),a["Webkit"+l]="webkit"+t,a["Moz"+l]="moz"+t,a}var Da={animationend:Pt("Animation","AnimationEnd"),animationiteration:Pt("Animation","AnimationIteration"),animationstart:Pt("Animation","AnimationStart"),transitionrun:Pt("Transition","TransitionRun"),transitionstart:Pt("Transition","TransitionStart"),transitioncancel:Pt("Transition","TransitionCancel"),transitionend:Pt("Transition","TransitionEnd")},kn={},L0={};bt&&(L0=document.createElement("div").style,"AnimationEvent"in window||(delete Da.animationend.animation,delete Da.animationiteration.animation,delete Da.animationstart.animation),"TransitionEvent"in window||delete Da.transitionend.transition);function ra(l){if(kn[l])return kn[l];if(!Da[l])return l;var t=Da[l],a;for(a in t)if(t.hasOwnProperty(a)&&a in L0)return kn[l]=t[a];return l}var V0=ra("animationend"),K0=ra("animationiteration"),J0=ra("animationstart"),jy=ra("transitionrun"),Uy=ra("transitionstart"),Cy=ra("transitioncancel"),w0=ra("transitionend"),$0=new Map,qc="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");qc.push("scrollEnd");function Il(l,t){$0.set(l,t),va(t,[l])}var Ju=typeof reportError=="function"?reportError:function(l){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof l=="object"&&l!==null&&typeof l.message=="string"?String(l.message):String(l),error:l});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",l);return}console.error(l)},Ql=[],ja=0,Rf=0;function An(){for(var l=ja,t=Rf=ja=0;t<l;){var a=Ql[t];Ql[t++]=null;var e=Ql[t];Ql[t++]=null;var u=Ql[t];Ql[t++]=null;var n=Ql[t];if(Ql[t++]=null,e!==null&&u!==null){var c=e.pending;c===null?u.next=u:(u.next=c.next,c.next=u),e.pending=u}n!==0&&W0(a,u,n)}}function pn(l,t,a,e){Ql[ja++]=l,Ql[ja++]=t,Ql[ja++]=a,Ql[ja++]=e,Rf|=e,l.lanes|=e,l=l.alternate,l!==null&&(l.lanes|=e)}function Bf(l,t,a,e){return pn(l,t,a,e),wu(l)}function ga(l,t){return pn(l,null,null,t),wu(l)}function W0(l,t,a){l.lanes|=a;var e=l.alternate;e!==null&&(e.lanes|=a);for(var u=!1,n=l.return;n!==null;)n.childLanes|=a,e=n.alternate,e!==null&&(e.childLanes|=a),n.tag===22&&(l=n.stateNode,l===null||l._visibility&1||(u=!0)),l=n,n=n.return;return l.tag===3?(n=l.stateNode,u&&t!==null&&(u=31-Rl(a),l=n.hiddenUpdates,e=l[u],e===null?l[u]=[t]:e.push(t),t.lane=a|536870912),n):null}function wu(l){if(50<Ue)throw Ue=0,nf=null,Error(S(185));for(var t=l.return;t!==null;)l=t,t=l.return;return l.tag===3?l.stateNode:null}var Ua={};function Hy(l,t,a,e){this.tag=l,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=e,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function jl(l,t,a,e){return new Hy(l,t,a,e)}function Yf(l){return l=l.prototype,!(!l||!l.isReactComponent)}function ht(l,t){var a=l.alternate;return a===null?(a=jl(l.tag,t,l.key,l.mode),a.elementType=l.elementType,a.type=l.type,a.stateNode=l.stateNode,a.alternate=l,l.alternate=a):(a.pendingProps=t,a.type=l.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=l.flags&65011712,a.childLanes=l.childLanes,a.lanes=l.lanes,a.child=l.child,a.memoizedProps=l.memoizedProps,a.memoizedState=l.memoizedState,a.updateQueue=l.updateQueue,t=l.dependencies,a.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},a.sibling=l.sibling,a.index=l.index,a.ref=l.ref,a.refCleanup=l.refCleanup,a}function k0(l,t){l.flags&=65011714;var a=l.alternate;return a===null?(l.childLanes=0,l.lanes=t,l.child=null,l.subtreeFlags=0,l.memoizedProps=null,l.memoizedState=null,l.updateQueue=null,l.dependencies=null,l.stateNode=null):(l.childLanes=a.childLanes,l.lanes=a.lanes,l.child=a.child,l.subtreeFlags=0,l.deletions=null,l.memoizedProps=a.memoizedProps,l.memoizedState=a.memoizedState,l.updateQueue=a.updateQueue,l.type=a.type,t=a.dependencies,l.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),l}function Du(l,t,a,e,u,n){var c=0;if(e=l,typeof l=="function")Yf(l)&&(c=1);else if(typeof l=="string")c=Gv(l,a,at.current)?26:l==="html"||l==="head"||l==="body"?27:5;else l:switch(l){case pc:return l=jl(31,a,t,u),l.elementType=pc,l.lanes=n,l;case Aa:return na(a.children,u,n,t);case h0:c=8,u|=24;break;case xc:return l=jl(12,a,t,u|2),l.elementType=xc,l.lanes=n,l;case Tc:return l=jl(13,a,t,u),l.elementType=Tc,l.lanes=n,l;case Ac:return l=jl(19,a,t,u),l.elementType=Ac,l.lanes=n,l;default:if(typeof l=="object"&&l!==null)switch(l.$$typeof){case mt:c=10;break l;case r0:c=9;break l;case Tf:c=11;break l;case Af:c=14;break l;case _t:c=16,e=null;break l}c=29,a=Error(S(130,l===null?"null":typeof l,"")),e=null}return t=jl(c,a,t,u),t.elementType=l,t.type=e,t.lanes=n,t}function na(l,t,a,e){return l=jl(7,l,e,t),l.lanes=a,l}function Fn(l,t,a){return l=jl(6,l,null,t),l.lanes=a,l}function F0(l){var t=jl(18,null,null,0);return t.stateNode=l,t}function In(l,t,a){return t=jl(4,l.children!==null?l.children:[],l.key,t),t.lanes=a,t.stateNode={containerInfo:l.containerInfo,pendingChildren:null,implementation:l.implementation},t}var wi=new WeakMap;function Kl(l,t){if(typeof l=="object"&&l!==null){var a=wi.get(l);return a!==void 0?a:(t={value:l,source:t,stack:Ni(t)},wi.set(l,t),t)}return{value:l,source:t,stack:Ni(t)}}var Ca=[],Ha=0,$u=null,qe=0,Zl=[],Ll=0,Jt=null,Pl=1,lt="";function dt(l,t){Ca[Ha++]=qe,Ca[Ha++]=$u,$u=l,qe=t}function I0(l,t,a){Zl[Ll++]=Pl,Zl[Ll++]=lt,Zl[Ll++]=Jt,Jt=l;var e=Pl;l=lt;var u=32-Rl(e)-1;e&=~(1<<u),a+=1;var n=32-Rl(t)+u;if(30<n){var c=u-u%5;n=(e&(1<<c)-1).toString(32),e>>=c,u-=c,Pl=1<<32-Rl(t)+u|a<<u|e,lt=n+l}else Pl=1<<n|a<<u|e,lt=l}function qf(l){l.return!==null&&(dt(l,1),I0(l,1,0))}function Gf(l){for(;l===$u;)$u=Ca[--Ha],Ca[Ha]=null,qe=Ca[--Ha],Ca[Ha]=null;for(;l===Jt;)Jt=Zl[--Ll],Zl[Ll]=null,lt=Zl[--Ll],Zl[Ll]=null,Pl=Zl[--Ll],Zl[Ll]=null}function P0(l,t){Zl[Ll++]=Pl,Zl[Ll++]=lt,Zl[Ll++]=Jt,Pl=t.id,lt=t.overflow,Jt=l}var rl=null,$=null,Y=!1,qt=null,Jl=!1,Gc=Error(S(519));function wt(l){var t=Error(S(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Ge(Kl(t,l)),Gc}function $i(l){var t=l.stateNode,a=l.type,e=l.memoizedProps;switch(t[hl]=l,t[Nl]=e,a){case"dialog":C("cancel",t),C("close",t);break;case"iframe":case"object":case"embed":C("load",t);break;case"video":case"audio":for(a=0;a<Le.length;a++)C(Le[a],t);break;case"source":C("error",t);break;case"img":case"image":case"link":C("error",t),C("load",t);break;case"details":C("toggle",t);break;case"input":C("invalid",t),M0(t,e.value,e.defaultValue,e.checked,e.defaultChecked,e.type,e.name,!0);break;case"select":C("invalid",t);break;case"textarea":C("invalid",t),j0(t,e.value,e.defaultValue,e.children)}a=e.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||t.textContent===""+a||e.suppressHydrationWarning===!0||Bo(t.textContent,a)?(e.popover!=null&&(C("beforetoggle",t),C("toggle",t)),e.onScroll!=null&&C("scroll",t),e.onScrollEnd!=null&&C("scrollend",t),e.onClick!=null&&(t.onclick=yt),t=!0):t=!1,t||wt(l,!0)}function Wi(l){for(rl=l.return;rl;)switch(rl.tag){case 5:case 31:case 13:Jl=!1;return;case 27:case 3:Jl=!0;return;default:rl=rl.return}}function Sa(l){if(l!==rl)return!1;if(!Y)return Wi(l),Y=!0,!1;var t=l.tag,a;if((a=t!==3&&t!==27)&&((a=t===5)&&(a=l.type,a=!(a!=="form"&&a!=="button")||of(l.type,l.memoizedProps)),a=!a),a&&$&&wt(l),Wi(l),t===13){if(l=l.memoizedState,l=l!==null?l.dehydrated:null,!l)throw Error(S(317));$=Rs(l)}else if(t===31){if(l=l.memoizedState,l=l!==null?l.dehydrated:null,!l)throw Error(S(317));$=Rs(l)}else t===27?(t=$,Ft(l.type)?(l=hf,hf=null,$=l):$=t):$=rl?$l(l.stateNode.nextSibling):null;return!0}function sa(){$=rl=null,Y=!1}function Pn(){var l=qt;return l!==null&&(pl===null?pl=l:pl.push.apply(pl,l),qt=null),l}function Ge(l){qt===null?qt=[l]:qt.push(l)}var Qc=et(null),ba=null,vt=null;function Ot(l,t,a){J(Qc,t._currentValue),t._currentValue=a}function rt(l){l._currentValue=Qc.current,yl(Qc)}function Xc(l,t,a){for(;l!==null;){var e=l.alternate;if((l.childLanes&t)!==t?(l.childLanes|=t,e!==null&&(e.childLanes|=t)):e!==null&&(e.childLanes&t)!==t&&(e.childLanes|=t),l===a)break;l=l.return}}function Zc(l,t,a,e){var u=l.child;for(u!==null&&(u.return=l);u!==null;){var n=u.dependencies;if(n!==null){var c=u.child;n=n.firstContext;l:for(;n!==null;){var f=n;n=u;for(var i=0;i<t.length;i++)if(f.context===t[i]){n.lanes|=a,f=n.alternate,f!==null&&(f.lanes|=a),Xc(n.return,a,l),e||(c=null);break l}n=f.next}}else if(u.tag===18){if(c=u.return,c===null)throw Error(S(341));c.lanes|=a,n=c.alternate,n!==null&&(n.lanes|=a),Xc(c,a,l),c=null}else c=u.child;if(c!==null)c.return=u;else for(c=u;c!==null;){if(c===l){c=null;break}if(u=c.sibling,u!==null){u.return=c.return,c=u;break}c=c.return}u=c}}function ee(l,t,a,e){l=null;for(var u=t,n=!1;u!==null;){if(!n){if(u.flags&524288)n=!0;else if(u.flags&262144)break}if(u.tag===10){var c=u.alternate;if(c===null)throw Error(S(387));if(c=c.memoizedProps,c!==null){var f=u.type;Yl(u.pendingProps.value,c.value)||(l!==null?l.push(f):l=[f])}}else if(u===Xu.current){if(c=u.alternate,c===null)throw Error(S(387));c.memoizedState.memoizedState!==u.memoizedState.memoizedState&&(l!==null?l.push(Ke):l=[Ke])}u=u.return}l!==null&&Zc(t,l,a,e),t.flags|=262144}function Wu(l){for(l=l.firstContext;l!==null;){if(!Yl(l.context._currentValue,l.memoizedValue))return!0;l=l.next}return!1}function da(l){ba=l,vt=null,l=l.dependencies,l!==null&&(l.firstContext=null)}function gl(l){return ld(ba,l)}function ru(l,t){return ba===null&&da(l),ld(l,t)}function ld(l,t){var a=t._currentValue;if(t={context:t,memoizedValue:a,next:null},vt===null){if(l===null)throw Error(S(308));vt=t,l.dependencies={lanes:0,firstContext:t},l.flags|=524288}else vt=vt.next=t;return a}var Ry=typeof AbortController<"u"?AbortController:function(){var l=[],t=this.signal={aborted:!1,addEventListener:function(a,e){l.push(e)}};this.abort=function(){t.aborted=!0,l.forEach(function(a){return a()})}},By=sl.unstable_scheduleCallback,Yy=sl.unstable_NormalPriority,cl={$$typeof:mt,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Qf(){return{controller:new Ry,data:new Map,refCount:0}}function lu(l){l.refCount--,l.refCount===0&&By(Yy,function(){l.controller.abort()})}var Ae=null,Lc=0,Ja=0,Ga=null;function qy(l,t){if(Ae===null){var a=Ae=[];Lc=0,Ja=oi(),Ga={status:"pending",value:void 0,then:function(e){a.push(e)}}}return Lc++,t.then(ki,ki),t}function ki(){if(--Lc===0&&Ae!==null){Ga!==null&&(Ga.status="fulfilled");var l=Ae;Ae=null,Ja=0,Ga=null;for(var t=0;t<l.length;t++)(0,l[t])()}}function Gy(l,t){var a=[],e={status:"pending",value:null,reason:null,then:function(u){a.push(u)}};return l.then(function(){e.status="fulfilled",e.value=t;for(var u=0;u<a.length;u++)(0,a[u])(t)},function(u){for(e.status="rejected",e.reason=u,u=0;u<a.length;u++)(0,a[u])(void 0)}),e}var Fi=p.S;p.S=function(l,t){ho=Cl(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&qy(l,t),Fi!==null&&Fi(l,t)};var ca=et(null);function Xf(){var l=ca.current;return l!==null?l:K.pooledCache}function ju(l,t){t===null?J(ca,ca.current):J(ca,t.pool)}function td(){var l=Xf();return l===null?null:{parent:cl._currentValue,pool:l}}var ue=Error(S(460)),Zf=Error(S(474)),_n=Error(S(542)),ku={then:function(){}};function Ii(l){return l=l.status,l==="fulfilled"||l==="rejected"}function ad(l,t,a){switch(a=l[a],a===void 0?l.push(t):a!==t&&(t.then(yt,yt),t=a),t.status){case"fulfilled":return t.value;case"rejected":throw l=t.reason,ls(l),l;default:if(typeof t.status=="string")t.then(yt,yt);else{if(l=K,l!==null&&100<l.shellSuspendCounter)throw Error(S(482));l=t,l.status="pending",l.then(function(e){if(t.status==="pending"){var u=t;u.status="fulfilled",u.value=e}},function(e){if(t.status==="pending"){var u=t;u.status="rejected",u.reason=e}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw l=t.reason,ls(l),l}throw fa=t,ue}}function aa(l){try{var t=l._init;return t(l._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(fa=a,ue):a}}var fa=null;function Pi(){if(fa===null)throw Error(S(459));var l=fa;return fa=null,l}function ls(l){if(l===ue||l===_n)throw Error(S(483))}var Qa=null,Qe=0;function gu(l){var t=Qe;return Qe+=1,Qa===null&&(Qa=[]),ad(Qa,l,t)}function oe(l,t){t=t.props.ref,l.ref=t!==void 0?t:null}function bu(l,t){throw t.$$typeof===pm?Error(S(525)):(l=Object.prototype.toString.call(t),Error(S(31,l==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":l)))}function ed(l){function t(o,s){if(l){var y=o.deletions;y===null?(o.deletions=[s],o.flags|=16):y.push(s)}}function a(o,s){if(!l)return null;for(;s!==null;)t(o,s),s=s.sibling;return null}function e(o){for(var s=new Map;o!==null;)o.key!==null?s.set(o.key,o):s.set(o.index,o),o=o.sibling;return s}function u(o,s){return o=ht(o,s),o.index=0,o.sibling=null,o}function n(o,s,y){return o.index=y,l?(y=o.alternate,y!==null?(y=y.index,y<s?(o.flags|=67108866,s):y):(o.flags|=67108866,s)):(o.flags|=1048576,s)}function c(o){return l&&o.alternate===null&&(o.flags|=67108866),o}function f(o,s,y,b){return s===null||s.tag!==6?(s=Fn(y,o.mode,b),s.return=o,s):(s=u(s,y),s.return=o,s)}function i(o,s,y,b){var A=y.type;return A===Aa?r(o,s,y.props.children,b,y.key):s!==null&&(s.elementType===A||typeof A=="object"&&A!==null&&A.$$typeof===_t&&aa(A)===s.type)?(s=u(s,y.props),oe(s,y),s.return=o,s):(s=Du(y.type,y.key,y.props,null,o.mode,b),oe(s,y),s.return=o,s)}function d(o,s,y,b){return s===null||s.tag!==4||s.stateNode.containerInfo!==y.containerInfo||s.stateNode.implementation!==y.implementation?(s=In(y,o.mode,b),s.return=o,s):(s=u(s,y.children||[]),s.return=o,s)}function r(o,s,y,b,A){return s===null||s.tag!==7?(s=na(y,o.mode,b,A),s.return=o,s):(s=u(s,y),s.return=o,s)}function g(o,s,y){if(typeof s=="string"&&s!==""||typeof s=="number"||typeof s=="bigint")return s=Fn(""+s,o.mode,y),s.return=o,s;if(typeof s=="object"&&s!==null){switch(s.$$typeof){case du:return y=Du(s.type,s.key,s.props,null,o.mode,y),oe(y,s),y.return=o,y;case he:return s=In(s,o.mode,y),s.return=o,s;case _t:return s=aa(s),g(o,s,y)}if(re(s)||ie(s))return s=na(s,o.mode,y,null),s.return=o,s;if(typeof s.then=="function")return g(o,gu(s),y);if(s.$$typeof===mt)return g(o,ru(o,s),y);bu(o,s)}return null}function m(o,s,y,b){var A=s!==null?s.key:null;if(typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint")return A!==null?null:f(o,s,""+y,b);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case du:return y.key===A?i(o,s,y,b):null;case he:return y.key===A?d(o,s,y,b):null;case _t:return y=aa(y),m(o,s,y,b)}if(re(y)||ie(y))return A!==null?null:r(o,s,y,b,null);if(typeof y.then=="function")return m(o,s,gu(y),b);if(y.$$typeof===mt)return m(o,s,ru(o,y),b);bu(o,y)}return null}function h(o,s,y,b,A){if(typeof b=="string"&&b!==""||typeof b=="number"||typeof b=="bigint")return o=o.get(y)||null,f(s,o,""+b,A);if(typeof b=="object"&&b!==null){switch(b.$$typeof){case du:return o=o.get(b.key===null?y:b.key)||null,i(s,o,b,A);case he:return o=o.get(b.key===null?y:b.key)||null,d(s,o,b,A);case _t:return b=aa(b),h(o,s,y,b,A)}if(re(b)||ie(b))return o=o.get(y)||null,r(s,o,b,A,null);if(typeof b.then=="function")return h(o,s,y,gu(b),A);if(b.$$typeof===mt)return h(o,s,y,ru(s,b),A);bu(s,b)}return null}function E(o,s,y,b){for(var A=null,M=null,z=s,_=s=0,D=null;z!==null&&_<y.length;_++){z.index>_?(D=z,z=null):D=z.sibling;var B=m(o,z,y[_],b);if(B===null){z===null&&(z=D);break}l&&z&&B.alternate===null&&t(o,z),s=n(B,s,_),M===null?A=B:M.sibling=B,M=B,z=D}if(_===y.length)return a(o,z),Y&&dt(o,_),A;if(z===null){for(;_<y.length;_++)z=g(o,y[_],b),z!==null&&(s=n(z,s,_),M===null?A=z:M.sibling=z,M=z);return Y&&dt(o,_),A}for(z=e(z);_<y.length;_++)D=h(z,o,_,y[_],b),D!==null&&(l&&D.alternate!==null&&z.delete(D.key===null?_:D.key),s=n(D,s,_),M===null?A=D:M.sibling=D,M=D);return l&&z.forEach(function(Gl){return t(o,Gl)}),Y&&dt(o,_),A}function T(o,s,y,b){if(y==null)throw Error(S(151));for(var A=null,M=null,z=s,_=s=0,D=null,B=y.next();z!==null&&!B.done;_++,B=y.next()){z.index>_?(D=z,z=null):D=z.sibling;var Gl=m(o,z,B.value,b);if(Gl===null){z===null&&(z=D);break}l&&z&&Gl.alternate===null&&t(o,z),s=n(Gl,s,_),M===null?A=Gl:M.sibling=Gl,M=Gl,z=D}if(B.done)return a(o,z),Y&&dt(o,_),A;if(z===null){for(;!B.done;_++,B=y.next())B=g(o,B.value,b),B!==null&&(s=n(B,s,_),M===null?A=B:M.sibling=B,M=B);return Y&&dt(o,_),A}for(z=e(z);!B.done;_++,B=y.next())B=h(z,o,_,B.value,b),B!==null&&(l&&B.alternate!==null&&z.delete(B.key===null?_:B.key),s=n(B,s,_),M===null?A=B:M.sibling=B,M=B);return l&&z.forEach(function(At){return t(o,At)}),Y&&dt(o,_),A}function q(o,s,y,b){if(typeof y=="object"&&y!==null&&y.type===Aa&&y.key===null&&(y=y.props.children),typeof y=="object"&&y!==null){switch(y.$$typeof){case du:l:{for(var A=y.key;s!==null;){if(s.key===A){if(A=y.type,A===Aa){if(s.tag===7){a(o,s.sibling),b=u(s,y.props.children),b.return=o,o=b;break l}}else if(s.elementType===A||typeof A=="object"&&A!==null&&A.$$typeof===_t&&aa(A)===s.type){a(o,s.sibling),b=u(s,y.props),oe(b,y),b.return=o,o=b;break l}a(o,s);break}else t(o,s);s=s.sibling}y.type===Aa?(b=na(y.props.children,o.mode,b,y.key),b.return=o,o=b):(b=Du(y.type,y.key,y.props,null,o.mode,b),oe(b,y),b.return=o,o=b)}return c(o);case he:l:{for(A=y.key;s!==null;){if(s.key===A)if(s.tag===4&&s.stateNode.containerInfo===y.containerInfo&&s.stateNode.implementation===y.implementation){a(o,s.sibling),b=u(s,y.children||[]),b.return=o,o=b;break l}else{a(o,s);break}else t(o,s);s=s.sibling}b=In(y,o.mode,b),b.return=o,o=b}return c(o);case _t:return y=aa(y),q(o,s,y,b)}if(re(y))return E(o,s,y,b);if(ie(y)){if(A=ie(y),typeof A!="function")throw Error(S(150));return y=A.call(y),T(o,s,y,b)}if(typeof y.then=="function")return q(o,s,gu(y),b);if(y.$$typeof===mt)return q(o,s,ru(o,y),b);bu(o,y)}return typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint"?(y=""+y,s!==null&&s.tag===6?(a(o,s.sibling),b=u(s,y),b.return=o,o=b):(a(o,s),b=Fn(y,o.mode,b),b.return=o,o=b),c(o)):a(o,s)}return function(o,s,y,b){try{Qe=0;var A=q(o,s,y,b);return Qa=null,A}catch(z){if(z===ue||z===_n)throw z;var M=jl(29,z,null,o.mode);return M.lanes=b,M.return=o,M}finally{}}}var oa=ed(!0),ud=ed(!1),Nt=!1;function Lf(l){l.updateQueue={baseState:l.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Vc(l,t){l=l.updateQueue,t.updateQueue===l&&(t.updateQueue={baseState:l.baseState,firstBaseUpdate:l.firstBaseUpdate,lastBaseUpdate:l.lastBaseUpdate,shared:l.shared,callbacks:null})}function Gt(l){return{lane:l,tag:0,payload:null,callback:null,next:null}}function Qt(l,t,a){var e=l.updateQueue;if(e===null)return null;if(e=e.shared,G&2){var u=e.pending;return u===null?t.next=t:(t.next=u.next,u.next=t),e.pending=t,t=wu(l),W0(l,null,a),t}return pn(l,e,t,a),wu(l)}function pe(l,t,a){if(t=t.updateQueue,t!==null&&(t=t.shared,(a&4194048)!==0)){var e=t.lanes;e&=l.pendingLanes,a|=e,t.lanes=a,x0(l,a)}}function lc(l,t){var a=l.updateQueue,e=l.alternate;if(e!==null&&(e=e.updateQueue,a===e)){var u=null,n=null;if(a=a.firstBaseUpdate,a!==null){do{var c={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};n===null?u=n=c:n=n.next=c,a=a.next}while(a!==null);n===null?u=n=t:n=n.next=t}else u=n=t;a={baseState:e.baseState,firstBaseUpdate:u,lastBaseUpdate:n,shared:e.shared,callbacks:e.callbacks},l.updateQueue=a;return}l=a.lastBaseUpdate,l===null?a.firstBaseUpdate=t:l.next=t,a.lastBaseUpdate=t}var Kc=!1;function _e(){if(Kc){var l=Ga;if(l!==null)throw l}}function Ne(l,t,a,e){Kc=!1;var u=l.updateQueue;Nt=!1;var n=u.firstBaseUpdate,c=u.lastBaseUpdate,f=u.shared.pending;if(f!==null){u.shared.pending=null;var i=f,d=i.next;i.next=null,c===null?n=d:c.next=d,c=i;var r=l.alternate;r!==null&&(r=r.updateQueue,f=r.lastBaseUpdate,f!==c&&(f===null?r.firstBaseUpdate=d:f.next=d,r.lastBaseUpdate=i))}if(n!==null){var g=u.baseState;c=0,r=d=i=null,f=n;do{var m=f.lane&-536870913,h=m!==f.lane;if(h?(R&m)===m:(e&m)===m){m!==0&&m===Ja&&(Kc=!0),r!==null&&(r=r.next={lane:0,tag:f.tag,payload:f.payload,callback:null,next:null});l:{var E=l,T=f;m=t;var q=a;switch(T.tag){case 1:if(E=T.payload,typeof E=="function"){g=E.call(q,g,m);break l}g=E;break l;case 3:E.flags=E.flags&-65537|128;case 0:if(E=T.payload,m=typeof E=="function"?E.call(q,g,m):E,m==null)break l;g=k({},g,m);break l;case 2:Nt=!0}}m=f.callback,m!==null&&(l.flags|=64,h&&(l.flags|=8192),h=u.callbacks,h===null?u.callbacks=[m]:h.push(m))}else h={lane:m,tag:f.tag,payload:f.payload,callback:f.callback,next:null},r===null?(d=r=h,i=g):r=r.next=h,c|=m;if(f=f.next,f===null){if(f=u.shared.pending,f===null)break;h=f,f=h.next,h.next=null,u.lastBaseUpdate=h,u.shared.pending=null}}while(!0);r===null&&(i=g),u.baseState=i,u.firstBaseUpdate=d,u.lastBaseUpdate=r,n===null&&(u.shared.lanes=0),Wt|=c,l.lanes=c,l.memoizedState=g}}function nd(l,t){if(typeof l!="function")throw Error(S(191,l));l.call(t)}function cd(l,t){var a=l.callbacks;if(a!==null)for(l.callbacks=null,l=0;l<a.length;l++)nd(a[l],t)}var wa=et(null),Fu=et(0);function ts(l,t){l=xt,J(Fu,l),J(wa,t),xt=l|t.baseLanes}function Jc(){J(Fu,xt),J(wa,wa.current)}function Vf(){xt=Fu.current,yl(wa),yl(Fu)}var ql=et(null),wl=null;function Mt(l){var t=l.alternate;J(al,al.current&1),J(ql,l),wl===null&&(t===null||wa.current!==null||t.memoizedState!==null)&&(wl=l)}function wc(l){J(al,al.current),J(ql,l),wl===null&&(wl=l)}function fd(l){l.tag===22?(J(al,al.current),J(ql,l),wl===null&&(wl=l)):Dt()}function Dt(){J(al,al.current),J(ql,ql.current)}function Dl(l){yl(ql),wl===l&&(wl=null),yl(al)}var al=et(0);function Iu(l){for(var t=l;t!==null;){if(t.tag===13){var a=t.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||yf(a)||vf(a)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder==="forwards"||t.memoizedProps.revealOrder==="backwards"||t.memoizedProps.revealOrder==="unstable_legacy-backwards"||t.memoizedProps.revealOrder==="together")){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===l)break;for(;t.sibling===null;){if(t.return===null||t.return===l)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var St=0,O=null,V=null,ul=null,Pu=!1,Xa=!1,ma=!1,ln=0,Xe=0,Za=null,Qy=0;function I(){throw Error(S(321))}function Kf(l,t){if(t===null)return!1;for(var a=0;a<t.length&&a<l.length;a++)if(!Yl(l[a],t[a]))return!1;return!0}function Jf(l,t,a,e,u,n){return St=n,O=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,p.H=l===null||l.memoizedState===null?qd:ei,ma=!1,n=a(e,u),ma=!1,Xa&&(n=sd(t,a,e,u)),id(l),n}function id(l){p.H=Ze;var t=V!==null&&V.next!==null;if(St=0,ul=V=O=null,Pu=!1,Xe=0,Za=null,t)throw Error(S(300));l===null||fl||(l=l.dependencies,l!==null&&Wu(l)&&(fl=!0))}function sd(l,t,a,e){O=l;var u=0;do{if(Xa&&(Za=null),Xe=0,Xa=!1,25<=u)throw Error(S(301));if(u+=1,ul=V=null,l.updateQueue!=null){var n=l.updateQueue;n.lastEffect=null,n.events=null,n.stores=null,n.memoCache!=null&&(n.memoCache.index=0)}p.H=Gd,n=t(a,e)}while(Xa);return n}function Xy(){var l=p.H,t=l.useState()[0];return t=typeof t.then=="function"?tu(t):t,l=l.useState()[0],(V!==null?V.memoizedState:null)!==l&&(O.flags|=1024),t}function wf(){var l=ln!==0;return ln=0,l}function $f(l,t,a){t.updateQueue=l.updateQueue,t.flags&=-2053,l.lanes&=~a}function Wf(l){if(Pu){for(l=l.memoizedState;l!==null;){var t=l.queue;t!==null&&(t.pending=null),l=l.next}Pu=!1}St=0,ul=V=O=null,Xa=!1,Xe=ln=0,Za=null}function Sl(){var l={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return ul===null?O.memoizedState=ul=l:ul=ul.next=l,ul}function el(){if(V===null){var l=O.alternate;l=l!==null?l.memoizedState:null}else l=V.next;var t=ul===null?O.memoizedState:ul.next;if(t!==null)ul=t,V=l;else{if(l===null)throw O.alternate===null?Error(S(467)):Error(S(310));V=l,l={memoizedState:V.memoizedState,baseState:V.baseState,baseQueue:V.baseQueue,queue:V.queue,next:null},ul===null?O.memoizedState=ul=l:ul=ul.next=l}return ul}function Nn(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function tu(l){var t=Xe;return Xe+=1,Za===null&&(Za=[]),l=ad(Za,l,t),t=O,(ul===null?t.memoizedState:ul.next)===null&&(t=t.alternate,p.H=t===null||t.memoizedState===null?qd:ei),l}function On(l){if(l!==null&&typeof l=="object"){if(typeof l.then=="function")return tu(l);if(l.$$typeof===mt)return gl(l)}throw Error(S(438,String(l)))}function kf(l){var t=null,a=O.updateQueue;if(a!==null&&(t=a.memoCache),t==null){var e=O.alternate;e!==null&&(e=e.updateQueue,e!==null&&(e=e.memoCache,e!=null&&(t={data:e.data.map(function(u){return u.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),a===null&&(a=Nn(),O.updateQueue=a),a.memoCache=t,a=t.data[t.index],a===void 0)for(a=t.data[t.index]=Array(l),e=0;e<l;e++)a[e]=_m;return t.index++,a}function Et(l,t){return typeof t=="function"?t(l):t}function Uu(l){var t=el();return Ff(t,V,l)}function Ff(l,t,a){var e=l.queue;if(e===null)throw Error(S(311));e.lastRenderedReducer=a;var u=l.baseQueue,n=e.pending;if(n!==null){if(u!==null){var c=u.next;u.next=n.next,n.next=c}t.baseQueue=u=n,e.pending=null}if(n=l.baseState,u===null)l.memoizedState=n;else{t=u.next;var f=c=null,i=null,d=t,r=!1;do{var g=d.lane&-536870913;if(g!==d.lane?(R&g)===g:(St&g)===g){var m=d.revertLane;if(m===0)i!==null&&(i=i.next={lane:0,revertLane:0,gesture:null,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null}),g===Ja&&(r=!0);else if((St&m)===m){d=d.next,m===Ja&&(r=!0);continue}else g={lane:0,revertLane:d.revertLane,gesture:null,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null},i===null?(f=i=g,c=n):i=i.next=g,O.lanes|=m,Wt|=m;g=d.action,ma&&a(n,g),n=d.hasEagerState?d.eagerState:a(n,g)}else m={lane:g,revertLane:d.revertLane,gesture:d.gesture,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null},i===null?(f=i=m,c=n):i=i.next=m,O.lanes|=g,Wt|=g;d=d.next}while(d!==null&&d!==t);if(i===null?c=n:i.next=f,!Yl(n,l.memoizedState)&&(fl=!0,r&&(a=Ga,a!==null)))throw a;l.memoizedState=n,l.baseState=c,l.baseQueue=i,e.lastRenderedState=n}return u===null&&(e.lanes=0),[l.memoizedState,e.dispatch]}function tc(l){var t=el(),a=t.queue;if(a===null)throw Error(S(311));a.lastRenderedReducer=l;var e=a.dispatch,u=a.pending,n=t.memoizedState;if(u!==null){a.pending=null;var c=u=u.next;do n=l(n,c.action),c=c.next;while(c!==u);Yl(n,t.memoizedState)||(fl=!0),t.memoizedState=n,t.baseQueue===null&&(t.baseState=n),a.lastRenderedState=n}return[n,e]}function dd(l,t,a){var e=O,u=el(),n=Y;if(n){if(a===void 0)throw Error(S(407));a=a()}else a=t();var c=!Yl((V||u).memoizedState,a);if(c&&(u.memoizedState=a,fl=!0),u=u.queue,If(yd.bind(null,e,u,l),[l]),u.getSnapshot!==t||c||ul!==null&&ul.memoizedState.tag&1){if(e.flags|=2048,$a(9,{destroy:void 0},md.bind(null,e,u,a,t),null),K===null)throw Error(S(349));n||St&127||od(e,t,a)}return a}function od(l,t,a){l.flags|=16384,l={getSnapshot:t,value:a},t=O.updateQueue,t===null?(t=Nn(),O.updateQueue=t,t.stores=[l]):(a=t.stores,a===null?t.stores=[l]:a.push(l))}function md(l,t,a,e){t.value=a,t.getSnapshot=e,vd(t)&&hd(l)}function yd(l,t,a){return a(function(){vd(t)&&hd(l)})}function vd(l){var t=l.getSnapshot;l=l.value;try{var a=t();return!Yl(l,a)}catch{return!0}}function hd(l){var t=ga(l,2);t!==null&&_l(t,l,2)}function $c(l){var t=Sl();if(typeof l=="function"){var a=l;if(l=a(),ma){Ut(!0);try{a()}finally{Ut(!1)}}}return t.memoizedState=t.baseState=l,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Et,lastRenderedState:l},t}function rd(l,t,a,e){return l.baseState=a,Ff(l,V,typeof e=="function"?e:Et)}function Zy(l,t,a,e,u){if(Dn(l))throw Error(S(485));if(l=t.action,l!==null){var n={payload:u,action:l,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(c){n.listeners.push(c)}};p.T!==null?a(!0):n.isTransition=!1,e(n),a=t.pending,a===null?(n.next=t.pending=n,gd(t,n)):(n.next=a.next,t.pending=a.next=n)}}function gd(l,t){var a=t.action,e=t.payload,u=l.state;if(t.isTransition){var n=p.T,c={};p.T=c;try{var f=a(u,e),i=p.S;i!==null&&i(c,f),as(l,t,f)}catch(d){Wc(l,t,d)}finally{n!==null&&c.types!==null&&(n.types=c.types),p.T=n}}else try{n=a(u,e),as(l,t,n)}catch(d){Wc(l,t,d)}}function as(l,t,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(e){es(l,t,e)},function(e){return Wc(l,t,e)}):es(l,t,a)}function es(l,t,a){t.status="fulfilled",t.value=a,bd(t),l.state=a,t=l.pending,t!==null&&(a=t.next,a===t?l.pending=null:(a=a.next,t.next=a,gd(l,a)))}function Wc(l,t,a){var e=l.pending;if(l.pending=null,e!==null){e=e.next;do t.status="rejected",t.reason=a,bd(t),t=t.next;while(t!==e)}l.action=null}function bd(l){l=l.listeners;for(var t=0;t<l.length;t++)(0,l[t])()}function Sd(l,t){return t}function us(l,t){if(Y){var a=K.formState;if(a!==null){l:{var e=O;if(Y){if($){t:{for(var u=$,n=Jl;u.nodeType!==8;){if(!n){u=null;break t}if(u=$l(u.nextSibling),u===null){u=null;break t}}n=u.data,u=n==="F!"||n==="F"?u:null}if(u){$=$l(u.nextSibling),e=u.data==="F!";break l}}wt(e)}e=!1}e&&(t=a[0])}}return a=Sl(),a.memoizedState=a.baseState=t,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Sd,lastRenderedState:t},a.queue=e,a=Rd.bind(null,O,e),e.dispatch=a,e=$c(!1),n=ai.bind(null,O,!1,e.queue),e=Sl(),u={state:t,dispatch:null,action:l,pending:null},e.queue=u,a=Zy.bind(null,O,u,n,a),u.dispatch=a,e.memoizedState=l,[t,a,!1]}function ns(l){var t=el();return Ed(t,V,l)}function Ed(l,t,a){if(t=Ff(l,t,Sd)[0],l=Uu(Et)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var e=tu(t)}catch(c){throw c===ue?_n:c}else e=t;t=el();var u=t.queue,n=u.dispatch;return a!==t.memoizedState&&(O.flags|=2048,$a(9,{destroy:void 0},Ly.bind(null,u,a),null)),[e,n,l]}function Ly(l,t){l.action=t}function cs(l){var t=el(),a=V;if(a!==null)return Ed(t,a,l);el(),t=t.memoizedState,a=el();var e=a.queue.dispatch;return a.memoizedState=l,[t,e,!1]}function $a(l,t,a,e){return l={tag:l,create:a,deps:e,inst:t,next:null},t=O.updateQueue,t===null&&(t=Nn(),O.updateQueue=t),a=t.lastEffect,a===null?t.lastEffect=l.next=l:(e=a.next,a.next=l,l.next=e,t.lastEffect=l),l}function zd(){return el().memoizedState}function Cu(l,t,a,e){var u=Sl();O.flags|=l,u.memoizedState=$a(1|t,{destroy:void 0},a,e===void 0?null:e)}function Mn(l,t,a,e){var u=el();e=e===void 0?null:e;var n=u.memoizedState.inst;V!==null&&e!==null&&Kf(e,V.memoizedState.deps)?u.memoizedState=$a(t,n,a,e):(O.flags|=l,u.memoizedState=$a(1|t,n,a,e))}function fs(l,t){Cu(8390656,8,l,t)}function If(l,t){Mn(2048,8,l,t)}function Vy(l){O.flags|=4;var t=O.updateQueue;if(t===null)t=Nn(),O.updateQueue=t,t.events=[l];else{var a=t.events;a===null?t.events=[l]:a.push(l)}}function xd(l){var t=el().memoizedState;return Vy({ref:t,nextImpl:l}),function(){if(G&2)throw Error(S(440));return t.impl.apply(void 0,arguments)}}function Td(l,t){return Mn(4,2,l,t)}function Ad(l,t){return Mn(4,4,l,t)}function pd(l,t){if(typeof t=="function"){l=l();var a=t(l);return function(){typeof a=="function"?a():t(null)}}if(t!=null)return l=l(),t.current=l,function(){t.current=null}}function _d(l,t,a){a=a!=null?a.concat([l]):null,Mn(4,4,pd.bind(null,t,l),a)}function Pf(){}function Nd(l,t){var a=el();t=t===void 0?null:t;var e=a.memoizedState;return t!==null&&Kf(t,e[1])?e[0]:(a.memoizedState=[l,t],l)}function Od(l,t){var a=el();t=t===void 0?null:t;var e=a.memoizedState;if(t!==null&&Kf(t,e[1]))return e[0];if(e=l(),ma){Ut(!0);try{l()}finally{Ut(!1)}}return a.memoizedState=[e,t],e}function li(l,t,a){return a===void 0||St&1073741824&&!(R&261930)?l.memoizedState=t:(l.memoizedState=a,l=go(),O.lanes|=l,Wt|=l,a)}function Md(l,t,a,e){return Yl(a,t)?a:wa.current!==null?(l=li(l,a,e),Yl(l,t)||(fl=!0),l):!(St&42)||St&1073741824&&!(R&261930)?(fl=!0,l.memoizedState=a):(l=go(),O.lanes|=l,Wt|=l,t)}function Dd(l,t,a,e,u){var n=Q.p;Q.p=n!==0&&8>n?n:8;var c=p.T,f={};p.T=f,ai(l,!1,t,a);try{var i=u(),d=p.S;if(d!==null&&d(f,i),i!==null&&typeof i=="object"&&typeof i.then=="function"){var r=Gy(i,e);Oe(l,t,r,Bl(l))}else Oe(l,t,e,Bl(l))}catch(g){Oe(l,t,{then:function(){},status:"rejected",reason:g},Bl())}finally{Q.p=n,c!==null&&f.types!==null&&(c.types=f.types),p.T=c}}function Ky(){}function kc(l,t,a,e){if(l.tag!==5)throw Error(S(476));var u=jd(l).queue;Dd(l,u,t,ua,a===null?Ky:function(){return Ud(l),a(e)})}function jd(l){var t=l.memoizedState;if(t!==null)return t;t={memoizedState:ua,baseState:ua,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Et,lastRenderedState:ua},next:null};var a={};return t.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Et,lastRenderedState:a},next:null},l.memoizedState=t,l=l.alternate,l!==null&&(l.memoizedState=t),t}function Ud(l){var t=jd(l);t.next===null&&(t=l.alternate.memoizedState),Oe(l,t.next.queue,{},Bl())}function ti(){return gl(Ke)}function Cd(){return el().memoizedState}function Hd(){return el().memoizedState}function Jy(l){for(var t=l.return;t!==null;){switch(t.tag){case 24:case 3:var a=Bl();l=Gt(a);var e=Qt(t,l,a);e!==null&&(_l(e,t,a),pe(e,t,a)),t={cache:Qf()},l.payload=t;return}t=t.return}}function wy(l,t,a){var e=Bl();a={lane:e,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},Dn(l)?Bd(t,a):(a=Bf(l,t,a,e),a!==null&&(_l(a,l,e),Yd(a,t,e)))}function Rd(l,t,a){var e=Bl();Oe(l,t,a,e)}function Oe(l,t,a,e){var u={lane:e,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(Dn(l))Bd(t,u);else{var n=l.alternate;if(l.lanes===0&&(n===null||n.lanes===0)&&(n=t.lastRenderedReducer,n!==null))try{var c=t.lastRenderedState,f=n(c,a);if(u.hasEagerState=!0,u.eagerState=f,Yl(f,c))return pn(l,t,u,0),K===null&&An(),!1}catch{}finally{}if(a=Bf(l,t,u,e),a!==null)return _l(a,l,e),Yd(a,t,e),!0}return!1}function ai(l,t,a,e){if(e={lane:2,revertLane:oi(),gesture:null,action:e,hasEagerState:!1,eagerState:null,next:null},Dn(l)){if(t)throw Error(S(479))}else t=Bf(l,a,e,2),t!==null&&_l(t,l,2)}function Dn(l){var t=l.alternate;return l===O||t!==null&&t===O}function Bd(l,t){Xa=Pu=!0;var a=l.pending;a===null?t.next=t:(t.next=a.next,a.next=t),l.pending=t}function Yd(l,t,a){if(a&4194048){var e=t.lanes;e&=l.pendingLanes,a|=e,t.lanes=a,x0(l,a)}}var Ze={readContext:gl,use:On,useCallback:I,useContext:I,useEffect:I,useImperativeHandle:I,useLayoutEffect:I,useInsertionEffect:I,useMemo:I,useReducer:I,useRef:I,useState:I,useDebugValue:I,useDeferredValue:I,useTransition:I,useSyncExternalStore:I,useId:I,useHostTransitionStatus:I,useFormState:I,useActionState:I,useOptimistic:I,useMemoCache:I,useCacheRefresh:I};Ze.useEffectEvent=I;var qd={readContext:gl,use:On,useCallback:function(l,t){return Sl().memoizedState=[l,t===void 0?null:t],l},useContext:gl,useEffect:fs,useImperativeHandle:function(l,t,a){a=a!=null?a.concat([l]):null,Cu(4194308,4,pd.bind(null,t,l),a)},useLayoutEffect:function(l,t){return Cu(4194308,4,l,t)},useInsertionEffect:function(l,t){Cu(4,2,l,t)},useMemo:function(l,t){var a=Sl();t=t===void 0?null:t;var e=l();if(ma){Ut(!0);try{l()}finally{Ut(!1)}}return a.memoizedState=[e,t],e},useReducer:function(l,t,a){var e=Sl();if(a!==void 0){var u=a(t);if(ma){Ut(!0);try{a(t)}finally{Ut(!1)}}}else u=t;return e.memoizedState=e.baseState=u,l={pending:null,lanes:0,dispatch:null,lastRenderedReducer:l,lastRenderedState:u},e.queue=l,l=l.dispatch=wy.bind(null,O,l),[e.memoizedState,l]},useRef:function(l){var t=Sl();return l={current:l},t.memoizedState=l},useState:function(l){l=$c(l);var t=l.queue,a=Rd.bind(null,O,t);return t.dispatch=a,[l.memoizedState,a]},useDebugValue:Pf,useDeferredValue:function(l,t){var a=Sl();return li(a,l,t)},useTransition:function(){var l=$c(!1);return l=Dd.bind(null,O,l.queue,!0,!1),Sl().memoizedState=l,[!1,l]},useSyncExternalStore:function(l,t,a){var e=O,u=Sl();if(Y){if(a===void 0)throw Error(S(407));a=a()}else{if(a=t(),K===null)throw Error(S(349));R&127||od(e,t,a)}u.memoizedState=a;var n={value:a,getSnapshot:t};return u.queue=n,fs(yd.bind(null,e,n,l),[l]),e.flags|=2048,$a(9,{destroy:void 0},md.bind(null,e,n,a,t),null),a},useId:function(){var l=Sl(),t=K.identifierPrefix;if(Y){var a=lt,e=Pl;a=(e&~(1<<32-Rl(e)-1)).toString(32)+a,t="_"+t+"R_"+a,a=ln++,0<a&&(t+="H"+a.toString(32)),t+="_"}else a=Qy++,t="_"+t+"r_"+a.toString(32)+"_";return l.memoizedState=t},useHostTransitionStatus:ti,useFormState:us,useActionState:us,useOptimistic:function(l){var t=Sl();t.memoizedState=t.baseState=l;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=a,t=ai.bind(null,O,!0,a),a.dispatch=t,[l,t]},useMemoCache:kf,useCacheRefresh:function(){return Sl().memoizedState=Jy.bind(null,O)},useEffectEvent:function(l){var t=Sl(),a={impl:l};return t.memoizedState=a,function(){if(G&2)throw Error(S(440));return a.impl.apply(void 0,arguments)}}},ei={readContext:gl,use:On,useCallback:Nd,useContext:gl,useEffect:If,useImperativeHandle:_d,useInsertionEffect:Td,useLayoutEffect:Ad,useMemo:Od,useReducer:Uu,useRef:zd,useState:function(){return Uu(Et)},useDebugValue:Pf,useDeferredValue:function(l,t){var a=el();return Md(a,V.memoizedState,l,t)},useTransition:function(){var l=Uu(Et)[0],t=el().memoizedState;return[typeof l=="boolean"?l:tu(l),t]},useSyncExternalStore:dd,useId:Cd,useHostTransitionStatus:ti,useFormState:ns,useActionState:ns,useOptimistic:function(l,t){var a=el();return rd(a,V,l,t)},useMemoCache:kf,useCacheRefresh:Hd};ei.useEffectEvent=xd;var Gd={readContext:gl,use:On,useCallback:Nd,useContext:gl,useEffect:If,useImperativeHandle:_d,useInsertionEffect:Td,useLayoutEffect:Ad,useMemo:Od,useReducer:tc,useRef:zd,useState:function(){return tc(Et)},useDebugValue:Pf,useDeferredValue:function(l,t){var a=el();return V===null?li(a,l,t):Md(a,V.memoizedState,l,t)},useTransition:function(){var l=tc(Et)[0],t=el().memoizedState;return[typeof l=="boolean"?l:tu(l),t]},useSyncExternalStore:dd,useId:Cd,useHostTransitionStatus:ti,useFormState:cs,useActionState:cs,useOptimistic:function(l,t){var a=el();return V!==null?rd(a,V,l,t):(a.baseState=l,[l,a.queue.dispatch])},useMemoCache:kf,useCacheRefresh:Hd};Gd.useEffectEvent=xd;function ac(l,t,a,e){t=l.memoizedState,a=a(e,t),a=a==null?t:k({},t,a),l.memoizedState=a,l.lanes===0&&(l.updateQueue.baseState=a)}var Fc={enqueueSetState:function(l,t,a){l=l._reactInternals;var e=Bl(),u=Gt(e);u.payload=t,a!=null&&(u.callback=a),t=Qt(l,u,e),t!==null&&(_l(t,l,e),pe(t,l,e))},enqueueReplaceState:function(l,t,a){l=l._reactInternals;var e=Bl(),u=Gt(e);u.tag=1,u.payload=t,a!=null&&(u.callback=a),t=Qt(l,u,e),t!==null&&(_l(t,l,e),pe(t,l,e))},enqueueForceUpdate:function(l,t){l=l._reactInternals;var a=Bl(),e=Gt(a);e.tag=2,t!=null&&(e.callback=t),t=Qt(l,e,a),t!==null&&(_l(t,l,a),pe(t,l,a))}};function is(l,t,a,e,u,n,c){return l=l.stateNode,typeof l.shouldComponentUpdate=="function"?l.shouldComponentUpdate(e,n,c):t.prototype&&t.prototype.isPureReactComponent?!Ye(a,e)||!Ye(u,n):!0}function ss(l,t,a,e){l=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(a,e),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(a,e),t.state!==l&&Fc.enqueueReplaceState(t,t.state,null)}function ya(l,t){var a=t;if("ref"in t){a={};for(var e in t)e!=="ref"&&(a[e]=t[e])}if(l=l.defaultProps){a===t&&(a=k({},a));for(var u in l)a[u]===void 0&&(a[u]=l[u])}return a}function Qd(l){Ju(l)}function Xd(l){console.error(l)}function Zd(l){Ju(l)}function tn(l,t){try{var a=l.onUncaughtError;a(t.value,{componentStack:t.stack})}catch(e){setTimeout(function(){throw e})}}function ds(l,t,a){try{var e=l.onCaughtError;e(a.value,{componentStack:a.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(u){setTimeout(function(){throw u})}}function Ic(l,t,a){return a=Gt(a),a.tag=3,a.payload={element:null},a.callback=function(){tn(l,t)},a}function Ld(l){return l=Gt(l),l.tag=3,l}function Vd(l,t,a,e){var u=a.type.getDerivedStateFromError;if(typeof u=="function"){var n=e.value;l.payload=function(){return u(n)},l.callback=function(){ds(t,a,e)}}var c=a.stateNode;c!==null&&typeof c.componentDidCatch=="function"&&(l.callback=function(){ds(t,a,e),typeof u!="function"&&(Xt===null?Xt=new Set([this]):Xt.add(this));var f=e.stack;this.componentDidCatch(e.value,{componentStack:f!==null?f:""})})}function $y(l,t,a,e,u){if(a.flags|=32768,e!==null&&typeof e=="object"&&typeof e.then=="function"){if(t=a.alternate,t!==null&&ee(t,a,u,!0),a=ql.current,a!==null){switch(a.tag){case 31:case 13:return wl===null?cn():a.alternate===null&&P===0&&(P=3),a.flags&=-257,a.flags|=65536,a.lanes=u,e===ku?a.flags|=16384:(t=a.updateQueue,t===null?a.updateQueue=new Set([e]):t.add(e),yc(l,e,u)),!1;case 22:return a.flags|=65536,e===ku?a.flags|=16384:(t=a.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([e])},a.updateQueue=t):(a=t.retryQueue,a===null?t.retryQueue=new Set([e]):a.add(e)),yc(l,e,u)),!1}throw Error(S(435,a.tag))}return yc(l,e,u),cn(),!1}if(Y)return t=ql.current,t!==null?(!(t.flags&65536)&&(t.flags|=256),t.flags|=65536,t.lanes=u,e!==Gc&&(l=Error(S(422),{cause:e}),Ge(Kl(l,a)))):(e!==Gc&&(t=Error(S(423),{cause:e}),Ge(Kl(t,a))),l=l.current.alternate,l.flags|=65536,u&=-u,l.lanes|=u,e=Kl(e,a),u=Ic(l.stateNode,e,u),lc(l,u),P!==4&&(P=2)),!1;var n=Error(S(520),{cause:e});if(n=Kl(n,a),je===null?je=[n]:je.push(n),P!==4&&(P=2),t===null)return!0;e=Kl(e,a),a=t;do{switch(a.tag){case 3:return a.flags|=65536,l=u&-u,a.lanes|=l,l=Ic(a.stateNode,e,l),lc(a,l),!1;case 1:if(t=a.type,n=a.stateNode,(a.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||n!==null&&typeof n.componentDidCatch=="function"&&(Xt===null||!Xt.has(n))))return a.flags|=65536,u&=-u,a.lanes|=u,u=Ld(u),Vd(u,l,a,e),lc(a,u),!1}a=a.return}while(a!==null);return!1}var ui=Error(S(461)),fl=!1;function vl(l,t,a,e){t.child=l===null?ud(t,null,a,e):oa(t,l.child,a,e)}function os(l,t,a,e,u){a=a.render;var n=t.ref;if("ref"in e){var c={};for(var f in e)f!=="ref"&&(c[f]=e[f])}else c=e;return da(t),e=Jf(l,t,a,c,n,u),f=wf(),l!==null&&!fl?($f(l,t,u),zt(l,t,u)):(Y&&f&&qf(t),t.flags|=1,vl(l,t,e,u),t.child)}function ms(l,t,a,e,u){if(l===null){var n=a.type;return typeof n=="function"&&!Yf(n)&&n.defaultProps===void 0&&a.compare===null?(t.tag=15,t.type=n,Kd(l,t,n,e,u)):(l=Du(a.type,null,e,t,t.mode,u),l.ref=t.ref,l.return=t,t.child=l)}if(n=l.child,!ni(l,u)){var c=n.memoizedProps;if(a=a.compare,a=a!==null?a:Ye,a(c,e)&&l.ref===t.ref)return zt(l,t,u)}return t.flags|=1,l=ht(n,e),l.ref=t.ref,l.return=t,t.child=l}function Kd(l,t,a,e,u){if(l!==null){var n=l.memoizedProps;if(Ye(n,e)&&l.ref===t.ref)if(fl=!1,t.pendingProps=e=n,ni(l,u))l.flags&131072&&(fl=!0);else return t.lanes=l.lanes,zt(l,t,u)}return Pc(l,t,a,e,u)}function Jd(l,t,a,e){var u=e.children,n=l!==null?l.memoizedState:null;if(l===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),e.mode==="hidden"){if(t.flags&128){if(n=n!==null?n.baseLanes|a:a,l!==null){for(e=t.child=l.child,u=0;e!==null;)u=u|e.lanes|e.childLanes,e=e.sibling;e=u&~n}else e=0,t.child=null;return ys(l,t,n,a,e)}if(a&536870912)t.memoizedState={baseLanes:0,cachePool:null},l!==null&&ju(t,n!==null?n.cachePool:null),n!==null?ts(t,n):Jc(),fd(t);else return e=t.lanes=536870912,ys(l,t,n!==null?n.baseLanes|a:a,a,e)}else n!==null?(ju(t,n.cachePool),ts(t,n),Dt(),t.memoizedState=null):(l!==null&&ju(t,null),Jc(),Dt());return vl(l,t,u,a),t.child}function be(l,t){return l!==null&&l.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function ys(l,t,a,e,u){var n=Xf();return n=n===null?null:{parent:cl._currentValue,pool:n},t.memoizedState={baseLanes:a,cachePool:n},l!==null&&ju(t,null),Jc(),fd(t),l!==null&&ee(l,t,e,!0),t.childLanes=u,null}function Hu(l,t){return t=an({mode:t.mode,children:t.children},l.mode),t.ref=l.ref,l.child=t,t.return=l,t}function vs(l,t,a){return oa(t,l.child,null,a),l=Hu(t,t.pendingProps),l.flags|=2,Dl(t),t.memoizedState=null,l}function Wy(l,t,a){var e=t.pendingProps,u=(t.flags&128)!==0;if(t.flags&=-129,l===null){if(Y){if(e.mode==="hidden")return l=Hu(t,e),t.lanes=536870912,be(null,l);if(wc(t),(l=$)?(l=Go(l,Jl),l=l!==null&&l.data==="&"?l:null,l!==null&&(t.memoizedState={dehydrated:l,treeContext:Jt!==null?{id:Pl,overflow:lt}:null,retryLane:536870912,hydrationErrors:null},a=F0(l),a.return=t,t.child=a,rl=t,$=null)):l=null,l===null)throw wt(t);return t.lanes=536870912,null}return Hu(t,e)}var n=l.memoizedState;if(n!==null){var c=n.dehydrated;if(wc(t),u)if(t.flags&256)t.flags&=-257,t=vs(l,t,a);else if(t.memoizedState!==null)t.child=l.child,t.flags|=128,t=null;else throw Error(S(558));else if(fl||ee(l,t,a,!1),u=(a&l.childLanes)!==0,fl||u){if(e=K,e!==null&&(c=T0(e,a),c!==0&&c!==n.retryLane))throw n.retryLane=c,ga(l,c),_l(e,l,c),ui;cn(),t=vs(l,t,a)}else l=n.treeContext,$=$l(c.nextSibling),rl=t,Y=!0,qt=null,Jl=!1,l!==null&&P0(t,l),t=Hu(t,e),t.flags|=4096;return t}return l=ht(l.child,{mode:e.mode,children:e.children}),l.ref=t.ref,t.child=l,l.return=t,l}function Ru(l,t){var a=t.ref;if(a===null)l!==null&&l.ref!==null&&(t.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(S(284));(l===null||l.ref!==a)&&(t.flags|=4194816)}}function Pc(l,t,a,e,u){return da(t),a=Jf(l,t,a,e,void 0,u),e=wf(),l!==null&&!fl?($f(l,t,u),zt(l,t,u)):(Y&&e&&qf(t),t.flags|=1,vl(l,t,a,u),t.child)}function hs(l,t,a,e,u,n){return da(t),t.updateQueue=null,a=sd(t,e,a,u),id(l),e=wf(),l!==null&&!fl?($f(l,t,n),zt(l,t,n)):(Y&&e&&qf(t),t.flags|=1,vl(l,t,a,n),t.child)}function rs(l,t,a,e,u){if(da(t),t.stateNode===null){var n=Ua,c=a.contextType;typeof c=="object"&&c!==null&&(n=gl(c)),n=new a(e,n),t.memoizedState=n.state!==null&&n.state!==void 0?n.state:null,n.updater=Fc,t.stateNode=n,n._reactInternals=t,n=t.stateNode,n.props=e,n.state=t.memoizedState,n.refs={},Lf(t),c=a.contextType,n.context=typeof c=="object"&&c!==null?gl(c):Ua,n.state=t.memoizedState,c=a.getDerivedStateFromProps,typeof c=="function"&&(ac(t,a,c,e),n.state=t.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof n.getSnapshotBeforeUpdate=="function"||typeof n.UNSAFE_componentWillMount!="function"&&typeof n.componentWillMount!="function"||(c=n.state,typeof n.componentWillMount=="function"&&n.componentWillMount(),typeof n.UNSAFE_componentWillMount=="function"&&n.UNSAFE_componentWillMount(),c!==n.state&&Fc.enqueueReplaceState(n,n.state,null),Ne(t,e,n,u),_e(),n.state=t.memoizedState),typeof n.componentDidMount=="function"&&(t.flags|=4194308),e=!0}else if(l===null){n=t.stateNode;var f=t.memoizedProps,i=ya(a,f);n.props=i;var d=n.context,r=a.contextType;c=Ua,typeof r=="object"&&r!==null&&(c=gl(r));var g=a.getDerivedStateFromProps;r=typeof g=="function"||typeof n.getSnapshotBeforeUpdate=="function",f=t.pendingProps!==f,r||typeof n.UNSAFE_componentWillReceiveProps!="function"&&typeof n.componentWillReceiveProps!="function"||(f||d!==c)&&ss(t,n,e,c),Nt=!1;var m=t.memoizedState;n.state=m,Ne(t,e,n,u),_e(),d=t.memoizedState,f||m!==d||Nt?(typeof g=="function"&&(ac(t,a,g,e),d=t.memoizedState),(i=Nt||is(t,a,i,e,m,d,c))?(r||typeof n.UNSAFE_componentWillMount!="function"&&typeof n.componentWillMount!="function"||(typeof n.componentWillMount=="function"&&n.componentWillMount(),typeof n.UNSAFE_componentWillMount=="function"&&n.UNSAFE_componentWillMount()),typeof n.componentDidMount=="function"&&(t.flags|=4194308)):(typeof n.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=e,t.memoizedState=d),n.props=e,n.state=d,n.context=c,e=i):(typeof n.componentDidMount=="function"&&(t.flags|=4194308),e=!1)}else{n=t.stateNode,Vc(l,t),c=t.memoizedProps,r=ya(a,c),n.props=r,g=t.pendingProps,m=n.context,d=a.contextType,i=Ua,typeof d=="object"&&d!==null&&(i=gl(d)),f=a.getDerivedStateFromProps,(d=typeof f=="function"||typeof n.getSnapshotBeforeUpdate=="function")||typeof n.UNSAFE_componentWillReceiveProps!="function"&&typeof n.componentWillReceiveProps!="function"||(c!==g||m!==i)&&ss(t,n,e,i),Nt=!1,m=t.memoizedState,n.state=m,Ne(t,e,n,u),_e();var h=t.memoizedState;c!==g||m!==h||Nt||l!==null&&l.dependencies!==null&&Wu(l.dependencies)?(typeof f=="function"&&(ac(t,a,f,e),h=t.memoizedState),(r=Nt||is(t,a,r,e,m,h,i)||l!==null&&l.dependencies!==null&&Wu(l.dependencies))?(d||typeof n.UNSAFE_componentWillUpdate!="function"&&typeof n.componentWillUpdate!="function"||(typeof n.componentWillUpdate=="function"&&n.componentWillUpdate(e,h,i),typeof n.UNSAFE_componentWillUpdate=="function"&&n.UNSAFE_componentWillUpdate(e,h,i)),typeof n.componentDidUpdate=="function"&&(t.flags|=4),typeof n.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof n.componentDidUpdate!="function"||c===l.memoizedProps&&m===l.memoizedState||(t.flags|=4),typeof n.getSnapshotBeforeUpdate!="function"||c===l.memoizedProps&&m===l.memoizedState||(t.flags|=1024),t.memoizedProps=e,t.memoizedState=h),n.props=e,n.state=h,n.context=i,e=r):(typeof n.componentDidUpdate!="function"||c===l.memoizedProps&&m===l.memoizedState||(t.flags|=4),typeof n.getSnapshotBeforeUpdate!="function"||c===l.memoizedProps&&m===l.memoizedState||(t.flags|=1024),e=!1)}return n=e,Ru(l,t),e=(t.flags&128)!==0,n||e?(n=t.stateNode,a=e&&typeof a.getDerivedStateFromError!="function"?null:n.render(),t.flags|=1,l!==null&&e?(t.child=oa(t,l.child,null,u),t.child=oa(t,null,a,u)):vl(l,t,a,u),t.memoizedState=n.state,l=t.child):l=zt(l,t,u),l}function gs(l,t,a,e){return sa(),t.flags|=256,vl(l,t,a,e),t.child}var ec={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function uc(l){return{baseLanes:l,cachePool:td()}}function nc(l,t,a){return l=l!==null?l.childLanes&~a:0,t&&(l|=Ul),l}function wd(l,t,a){var e=t.pendingProps,u=!1,n=(t.flags&128)!==0,c;if((c=n)||(c=l!==null&&l.memoizedState===null?!1:(al.current&2)!==0),c&&(u=!0,t.flags&=-129),c=(t.flags&32)!==0,t.flags&=-33,l===null){if(Y){if(u?Mt(t):Dt(),(l=$)?(l=Go(l,Jl),l=l!==null&&l.data!=="&"?l:null,l!==null&&(t.memoizedState={dehydrated:l,treeContext:Jt!==null?{id:Pl,overflow:lt}:null,retryLane:536870912,hydrationErrors:null},a=F0(l),a.return=t,t.child=a,rl=t,$=null)):l=null,l===null)throw wt(t);return vf(l)?t.lanes=32:t.lanes=536870912,null}var f=e.children;return e=e.fallback,u?(Dt(),u=t.mode,f=an({mode:"hidden",children:f},u),e=na(e,u,a,null),f.return=t,e.return=t,f.sibling=e,t.child=f,e=t.child,e.memoizedState=uc(a),e.childLanes=nc(l,c,a),t.memoizedState=ec,be(null,e)):(Mt(t),lf(t,f))}var i=l.memoizedState;if(i!==null&&(f=i.dehydrated,f!==null)){if(n)t.flags&256?(Mt(t),t.flags&=-257,t=cc(l,t,a)):t.memoizedState!==null?(Dt(),t.child=l.child,t.flags|=128,t=null):(Dt(),f=e.fallback,u=t.mode,e=an({mode:"visible",children:e.children},u),f=na(f,u,a,null),f.flags|=2,e.return=t,f.return=t,e.sibling=f,t.child=e,oa(t,l.child,null,a),e=t.child,e.memoizedState=uc(a),e.childLanes=nc(l,c,a),t.memoizedState=ec,t=be(null,e));else if(Mt(t),vf(f)){if(c=f.nextSibling&&f.nextSibling.dataset,c)var d=c.dgst;c=d,e=Error(S(419)),e.stack="",e.digest=c,Ge({value:e,source:null,stack:null}),t=cc(l,t,a)}else if(fl||ee(l,t,a,!1),c=(a&l.childLanes)!==0,fl||c){if(c=K,c!==null&&(e=T0(c,a),e!==0&&e!==i.retryLane))throw i.retryLane=e,ga(l,e),_l(c,l,e),ui;yf(f)||cn(),t=cc(l,t,a)}else yf(f)?(t.flags|=192,t.child=l.child,t=null):(l=i.treeContext,$=$l(f.nextSibling),rl=t,Y=!0,qt=null,Jl=!1,l!==null&&P0(t,l),t=lf(t,e.children),t.flags|=4096);return t}return u?(Dt(),f=e.fallback,u=t.mode,i=l.child,d=i.sibling,e=ht(i,{mode:"hidden",children:e.children}),e.subtreeFlags=i.subtreeFlags&65011712,d!==null?f=ht(d,f):(f=na(f,u,a,null),f.flags|=2),f.return=t,e.return=t,e.sibling=f,t.child=e,be(null,e),e=t.child,f=l.child.memoizedState,f===null?f=uc(a):(u=f.cachePool,u!==null?(i=cl._currentValue,u=u.parent!==i?{parent:i,pool:i}:u):u=td(),f={baseLanes:f.baseLanes|a,cachePool:u}),e.memoizedState=f,e.childLanes=nc(l,c,a),t.memoizedState=ec,be(l.child,e)):(Mt(t),a=l.child,l=a.sibling,a=ht(a,{mode:"visible",children:e.children}),a.return=t,a.sibling=null,l!==null&&(c=t.deletions,c===null?(t.deletions=[l],t.flags|=16):c.push(l)),t.child=a,t.memoizedState=null,a)}function lf(l,t){return t=an({mode:"visible",children:t},l.mode),t.return=l,l.child=t}function an(l,t){return l=jl(22,l,null,t),l.lanes=0,l}function cc(l,t,a){return oa(t,l.child,null,a),l=lf(t,t.pendingProps.children),l.flags|=2,t.memoizedState=null,l}function bs(l,t,a){l.lanes|=t;var e=l.alternate;e!==null&&(e.lanes|=t),Xc(l.return,t,a)}function fc(l,t,a,e,u,n){var c=l.memoizedState;c===null?l.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:e,tail:a,tailMode:u,treeForkCount:n}:(c.isBackwards=t,c.rendering=null,c.renderingStartTime=0,c.last=e,c.tail=a,c.tailMode=u,c.treeForkCount=n)}function $d(l,t,a){var e=t.pendingProps,u=e.revealOrder,n=e.tail;e=e.children;var c=al.current,f=(c&2)!==0;if(f?(c=c&1|2,t.flags|=128):c&=1,J(al,c),vl(l,t,e,a),e=Y?qe:0,!f&&l!==null&&l.flags&128)l:for(l=t.child;l!==null;){if(l.tag===13)l.memoizedState!==null&&bs(l,a,t);else if(l.tag===19)bs(l,a,t);else if(l.child!==null){l.child.return=l,l=l.child;continue}if(l===t)break l;for(;l.sibling===null;){if(l.return===null||l.return===t)break l;l=l.return}l.sibling.return=l.return,l=l.sibling}switch(u){case"forwards":for(a=t.child,u=null;a!==null;)l=a.alternate,l!==null&&Iu(l)===null&&(u=a),a=a.sibling;a=u,a===null?(u=t.child,t.child=null):(u=a.sibling,a.sibling=null),fc(t,!1,u,a,n,e);break;case"backwards":case"unstable_legacy-backwards":for(a=null,u=t.child,t.child=null;u!==null;){if(l=u.alternate,l!==null&&Iu(l)===null){t.child=u;break}l=u.sibling,u.sibling=a,a=u,u=l}fc(t,!0,a,null,n,e);break;case"together":fc(t,!1,null,null,void 0,e);break;default:t.memoizedState=null}return t.child}function zt(l,t,a){if(l!==null&&(t.dependencies=l.dependencies),Wt|=t.lanes,!(a&t.childLanes))if(l!==null){if(ee(l,t,a,!1),(a&t.childLanes)===0)return null}else return null;if(l!==null&&t.child!==l.child)throw Error(S(153));if(t.child!==null){for(l=t.child,a=ht(l,l.pendingProps),t.child=a,a.return=t;l.sibling!==null;)l=l.sibling,a=a.sibling=ht(l,l.pendingProps),a.return=t;a.sibling=null}return t.child}function ni(l,t){return l.lanes&t?!0:(l=l.dependencies,!!(l!==null&&Wu(l)))}function ky(l,t,a){switch(t.tag){case 3:Zu(t,t.stateNode.containerInfo),Ot(t,cl,l.memoizedState.cache),sa();break;case 27:case 5:Oc(t);break;case 4:Zu(t,t.stateNode.containerInfo);break;case 10:Ot(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,wc(t),null;break;case 13:var e=t.memoizedState;if(e!==null)return e.dehydrated!==null?(Mt(t),t.flags|=128,null):a&t.child.childLanes?wd(l,t,a):(Mt(t),l=zt(l,t,a),l!==null?l.sibling:null);Mt(t);break;case 19:var u=(l.flags&128)!==0;if(e=(a&t.childLanes)!==0,e||(ee(l,t,a,!1),e=(a&t.childLanes)!==0),u){if(e)return $d(l,t,a);t.flags|=128}if(u=t.memoizedState,u!==null&&(u.rendering=null,u.tail=null,u.lastEffect=null),J(al,al.current),e)break;return null;case 22:return t.lanes=0,Jd(l,t,a,t.pendingProps);case 24:Ot(t,cl,l.memoizedState.cache)}return zt(l,t,a)}function Wd(l,t,a){if(l!==null)if(l.memoizedProps!==t.pendingProps)fl=!0;else{if(!ni(l,a)&&!(t.flags&128))return fl=!1,ky(l,t,a);fl=!!(l.flags&131072)}else fl=!1,Y&&t.flags&1048576&&I0(t,qe,t.index);switch(t.lanes=0,t.tag){case 16:l:{var e=t.pendingProps;if(l=aa(t.elementType),t.type=l,typeof l=="function")Yf(l)?(e=ya(l,e),t.tag=1,t=rs(null,t,l,e,a)):(t.tag=0,t=Pc(null,t,l,e,a));else{if(l!=null){var u=l.$$typeof;if(u===Tf){t.tag=11,t=os(null,t,l,e,a);break l}else if(u===Af){t.tag=14,t=ms(null,t,l,e,a);break l}}throw t=_c(l)||l,Error(S(306,t,""))}}return t;case 0:return Pc(l,t,t.type,t.pendingProps,a);case 1:return e=t.type,u=ya(e,t.pendingProps),rs(l,t,e,u,a);case 3:l:{if(Zu(t,t.stateNode.containerInfo),l===null)throw Error(S(387));e=t.pendingProps;var n=t.memoizedState;u=n.element,Vc(l,t),Ne(t,e,null,a);var c=t.memoizedState;if(e=c.cache,Ot(t,cl,e),e!==n.cache&&Zc(t,[cl],a,!0),_e(),e=c.element,n.isDehydrated)if(n={element:e,isDehydrated:!1,cache:c.cache},t.updateQueue.baseState=n,t.memoizedState=n,t.flags&256){t=gs(l,t,e,a);break l}else if(e!==u){u=Kl(Error(S(424)),t),Ge(u),t=gs(l,t,e,a);break l}else{switch(l=t.stateNode.containerInfo,l.nodeType){case 9:l=l.body;break;default:l=l.nodeName==="HTML"?l.ownerDocument.body:l}for($=$l(l.firstChild),rl=t,Y=!0,qt=null,Jl=!0,a=ud(t,null,e,a),t.child=a;a;)a.flags=a.flags&-3|4096,a=a.sibling}else{if(sa(),e===u){t=zt(l,t,a);break l}vl(l,t,e,a)}t=t.child}return t;case 26:return Ru(l,t),l===null?(a=qs(t.type,null,t.pendingProps,null))?t.memoizedState=a:Y||(a=t.type,l=t.pendingProps,e=on(Yt.current).createElement(a),e[hl]=t,e[Nl]=l,bl(e,a,l),ml(e),t.stateNode=e):t.memoizedState=qs(t.type,l.memoizedProps,t.pendingProps,l.memoizedState),null;case 27:return Oc(t),l===null&&Y&&(e=t.stateNode=Qo(t.type,t.pendingProps,Yt.current),rl=t,Jl=!0,u=$,Ft(t.type)?(hf=u,$=$l(e.firstChild)):$=u),vl(l,t,t.pendingProps.children,a),Ru(l,t),l===null&&(t.flags|=4194304),t.child;case 5:return l===null&&Y&&((u=e=$)&&(e=_v(e,t.type,t.pendingProps,Jl),e!==null?(t.stateNode=e,rl=t,$=$l(e.firstChild),Jl=!1,u=!0):u=!1),u||wt(t)),Oc(t),u=t.type,n=t.pendingProps,c=l!==null?l.memoizedProps:null,e=n.children,of(u,n)?e=null:c!==null&&of(u,c)&&(t.flags|=32),t.memoizedState!==null&&(u=Jf(l,t,Xy,null,null,a),Ke._currentValue=u),Ru(l,t),vl(l,t,e,a),t.child;case 6:return l===null&&Y&&((l=a=$)&&(a=Nv(a,t.pendingProps,Jl),a!==null?(t.stateNode=a,rl=t,$=null,l=!0):l=!1),l||wt(t)),null;case 13:return wd(l,t,a);case 4:return Zu(t,t.stateNode.containerInfo),e=t.pendingProps,l===null?t.child=oa(t,null,e,a):vl(l,t,e,a),t.child;case 11:return os(l,t,t.type,t.pendingProps,a);case 7:return vl(l,t,t.pendingProps,a),t.child;case 8:return vl(l,t,t.pendingProps.children,a),t.child;case 12:return vl(l,t,t.pendingProps.children,a),t.child;case 10:return e=t.pendingProps,Ot(t,t.type,e.value),vl(l,t,e.children,a),t.child;case 9:return u=t.type._context,e=t.pendingProps.children,da(t),u=gl(u),e=e(u),t.flags|=1,vl(l,t,e,a),t.child;case 14:return ms(l,t,t.type,t.pendingProps,a);case 15:return Kd(l,t,t.type,t.pendingProps,a);case 19:return $d(l,t,a);case 31:return Wy(l,t,a);case 22:return Jd(l,t,a,t.pendingProps);case 24:return da(t),e=gl(cl),l===null?(u=Xf(),u===null&&(u=K,n=Qf(),u.pooledCache=n,n.refCount++,n!==null&&(u.pooledCacheLanes|=a),u=n),t.memoizedState={parent:e,cache:u},Lf(t),Ot(t,cl,u)):(l.lanes&a&&(Vc(l,t),Ne(t,null,null,a),_e()),u=l.memoizedState,n=t.memoizedState,u.parent!==e?(u={parent:e,cache:e},t.memoizedState=u,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=u),Ot(t,cl,e)):(e=n.cache,Ot(t,cl,e),e!==u.cache&&Zc(t,[cl],a,!0))),vl(l,t,t.pendingProps.children,a),t.child;case 29:throw t.pendingProps}throw Error(S(156,t.tag))}function ct(l){l.flags|=4}function ic(l,t,a,e,u){if((t=(l.mode&32)!==0)&&(t=!1),t){if(l.flags|=16777216,(u&335544128)===u)if(l.stateNode.complete)l.flags|=8192;else if(Eo())l.flags|=8192;else throw fa=ku,Zf}else l.flags&=-16777217}function Ss(l,t){if(t.type!=="stylesheet"||t.state.loading&4)l.flags&=-16777217;else if(l.flags|=16777216,!Lo(t))if(Eo())l.flags|=8192;else throw fa=ku,Zf}function Su(l,t){t!==null&&(l.flags|=4),l.flags&16384&&(t=l.tag!==22?E0():536870912,l.lanes|=t,Wa|=t)}function me(l,t){if(!Y)switch(l.tailMode){case"hidden":t=l.tail;for(var a=null;t!==null;)t.alternate!==null&&(a=t),t=t.sibling;a===null?l.tail=null:a.sibling=null;break;case"collapsed":a=l.tail;for(var e=null;a!==null;)a.alternate!==null&&(e=a),a=a.sibling;e===null?t||l.tail===null?l.tail=null:l.tail.sibling=null:e.sibling=null}}function w(l){var t=l.alternate!==null&&l.alternate.child===l.child,a=0,e=0;if(t)for(var u=l.child;u!==null;)a|=u.lanes|u.childLanes,e|=u.subtreeFlags&65011712,e|=u.flags&65011712,u.return=l,u=u.sibling;else for(u=l.child;u!==null;)a|=u.lanes|u.childLanes,e|=u.subtreeFlags,e|=u.flags,u.return=l,u=u.sibling;return l.subtreeFlags|=e,l.childLanes=a,t}function Fy(l,t,a){var e=t.pendingProps;switch(Gf(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return w(t),null;case 1:return w(t),null;case 3:return a=t.stateNode,e=null,l!==null&&(e=l.memoizedState.cache),t.memoizedState.cache!==e&&(t.flags|=2048),rt(cl),La(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(l===null||l.child===null)&&(Sa(t)?ct(t):l===null||l.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,Pn())),w(t),null;case 26:var u=t.type,n=t.memoizedState;return l===null?(ct(t),n!==null?(w(t),Ss(t,n)):(w(t),ic(t,u,null,e,a))):n?n!==l.memoizedState?(ct(t),w(t),Ss(t,n)):(w(t),t.flags&=-16777217):(l=l.memoizedProps,l!==e&&ct(t),w(t),ic(t,u,l,e,a)),null;case 27:if(Lu(t),a=Yt.current,u=t.type,l!==null&&t.stateNode!=null)l.memoizedProps!==e&&ct(t);else{if(!e){if(t.stateNode===null)throw Error(S(166));return w(t),null}l=at.current,Sa(t)?$i(t):(l=Qo(u,e,a),t.stateNode=l,ct(t))}return w(t),null;case 5:if(Lu(t),u=t.type,l!==null&&t.stateNode!=null)l.memoizedProps!==e&&ct(t);else{if(!e){if(t.stateNode===null)throw Error(S(166));return w(t),null}if(n=at.current,Sa(t))$i(t);else{var c=on(Yt.current);switch(n){case 1:n=c.createElementNS("http://www.w3.org/2000/svg",u);break;case 2:n=c.createElementNS("http://www.w3.org/1998/Math/MathML",u);break;default:switch(u){case"svg":n=c.createElementNS("http://www.w3.org/2000/svg",u);break;case"math":n=c.createElementNS("http://www.w3.org/1998/Math/MathML",u);break;case"script":n=c.createElement("div"),n.innerHTML="<script><\/script>",n=n.removeChild(n.firstChild);break;case"select":n=typeof e.is=="string"?c.createElement("select",{is:e.is}):c.createElement("select"),e.multiple?n.multiple=!0:e.size&&(n.size=e.size);break;default:n=typeof e.is=="string"?c.createElement(u,{is:e.is}):c.createElement(u)}}n[hl]=t,n[Nl]=e;l:for(c=t.child;c!==null;){if(c.tag===5||c.tag===6)n.appendChild(c.stateNode);else if(c.tag!==4&&c.tag!==27&&c.child!==null){c.child.return=c,c=c.child;continue}if(c===t)break l;for(;c.sibling===null;){if(c.return===null||c.return===t)break l;c=c.return}c.sibling.return=c.return,c=c.sibling}t.stateNode=n;l:switch(bl(n,u,e),u){case"button":case"input":case"select":case"textarea":e=!!e.autoFocus;break l;case"img":e=!0;break l;default:e=!1}e&&ct(t)}}return w(t),ic(t,t.type,l===null?null:l.memoizedProps,t.pendingProps,a),null;case 6:if(l&&t.stateNode!=null)l.memoizedProps!==e&&ct(t);else{if(typeof e!="string"&&t.stateNode===null)throw Error(S(166));if(l=Yt.current,Sa(t)){if(l=t.stateNode,a=t.memoizedProps,e=null,u=rl,u!==null)switch(u.tag){case 27:case 5:e=u.memoizedProps}l[hl]=t,l=!!(l.nodeValue===a||e!==null&&e.suppressHydrationWarning===!0||Bo(l.nodeValue,a)),l||wt(t,!0)}else l=on(l).createTextNode(e),l[hl]=t,t.stateNode=l}return w(t),null;case 31:if(a=t.memoizedState,l===null||l.memoizedState!==null){if(e=Sa(t),a!==null){if(l===null){if(!e)throw Error(S(318));if(l=t.memoizedState,l=l!==null?l.dehydrated:null,!l)throw Error(S(557));l[hl]=t}else sa(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;w(t),l=!1}else a=Pn(),l!==null&&l.memoizedState!==null&&(l.memoizedState.hydrationErrors=a),l=!0;if(!l)return t.flags&256?(Dl(t),t):(Dl(t),null);if(t.flags&128)throw Error(S(558))}return w(t),null;case 13:if(e=t.memoizedState,l===null||l.memoizedState!==null&&l.memoizedState.dehydrated!==null){if(u=Sa(t),e!==null&&e.dehydrated!==null){if(l===null){if(!u)throw Error(S(318));if(u=t.memoizedState,u=u!==null?u.dehydrated:null,!u)throw Error(S(317));u[hl]=t}else sa(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;w(t),u=!1}else u=Pn(),l!==null&&l.memoizedState!==null&&(l.memoizedState.hydrationErrors=u),u=!0;if(!u)return t.flags&256?(Dl(t),t):(Dl(t),null)}return Dl(t),t.flags&128?(t.lanes=a,t):(a=e!==null,l=l!==null&&l.memoizedState!==null,a&&(e=t.child,u=null,e.alternate!==null&&e.alternate.memoizedState!==null&&e.alternate.memoizedState.cachePool!==null&&(u=e.alternate.memoizedState.cachePool.pool),n=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),n!==u&&(e.flags|=2048)),a!==l&&a&&(t.child.flags|=8192),Su(t,t.updateQueue),w(t),null);case 4:return La(),l===null&&mi(t.stateNode.containerInfo),w(t),null;case 10:return rt(t.type),w(t),null;case 19:if(yl(al),e=t.memoizedState,e===null)return w(t),null;if(u=(t.flags&128)!==0,n=e.rendering,n===null)if(u)me(e,!1);else{if(P!==0||l!==null&&l.flags&128)for(l=t.child;l!==null;){if(n=Iu(l),n!==null){for(t.flags|=128,me(e,!1),l=n.updateQueue,t.updateQueue=l,Su(t,l),t.subtreeFlags=0,l=a,a=t.child;a!==null;)k0(a,l),a=a.sibling;return J(al,al.current&1|2),Y&&dt(t,e.treeForkCount),t.child}l=l.sibling}e.tail!==null&&Cl()>un&&(t.flags|=128,u=!0,me(e,!1),t.lanes=4194304)}else{if(!u)if(l=Iu(n),l!==null){if(t.flags|=128,u=!0,l=l.updateQueue,t.updateQueue=l,Su(t,l),me(e,!0),e.tail===null&&e.tailMode==="hidden"&&!n.alternate&&!Y)return w(t),null}else 2*Cl()-e.renderingStartTime>un&&a!==536870912&&(t.flags|=128,u=!0,me(e,!1),t.lanes=4194304);e.isBackwards?(n.sibling=t.child,t.child=n):(l=e.last,l!==null?l.sibling=n:t.child=n,e.last=n)}return e.tail!==null?(l=e.tail,e.rendering=l,e.tail=l.sibling,e.renderingStartTime=Cl(),l.sibling=null,a=al.current,J(al,u?a&1|2:a&1),Y&&dt(t,e.treeForkCount),l):(w(t),null);case 22:case 23:return Dl(t),Vf(),e=t.memoizedState!==null,l!==null?l.memoizedState!==null!==e&&(t.flags|=8192):e&&(t.flags|=8192),e?a&536870912&&!(t.flags&128)&&(w(t),t.subtreeFlags&6&&(t.flags|=8192)):w(t),a=t.updateQueue,a!==null&&Su(t,a.retryQueue),a=null,l!==null&&l.memoizedState!==null&&l.memoizedState.cachePool!==null&&(a=l.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==a&&(t.flags|=2048),l!==null&&yl(ca),null;case 24:return a=null,l!==null&&(a=l.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),rt(cl),w(t),null;case 25:return null;case 30:return null}throw Error(S(156,t.tag))}function Iy(l,t){switch(Gf(t),t.tag){case 1:return l=t.flags,l&65536?(t.flags=l&-65537|128,t):null;case 3:return rt(cl),La(),l=t.flags,l&65536&&!(l&128)?(t.flags=l&-65537|128,t):null;case 26:case 27:case 5:return Lu(t),null;case 31:if(t.memoizedState!==null){if(Dl(t),t.alternate===null)throw Error(S(340));sa()}return l=t.flags,l&65536?(t.flags=l&-65537|128,t):null;case 13:if(Dl(t),l=t.memoizedState,l!==null&&l.dehydrated!==null){if(t.alternate===null)throw Error(S(340));sa()}return l=t.flags,l&65536?(t.flags=l&-65537|128,t):null;case 19:return yl(al),null;case 4:return La(),null;case 10:return rt(t.type),null;case 22:case 23:return Dl(t),Vf(),l!==null&&yl(ca),l=t.flags,l&65536?(t.flags=l&-65537|128,t):null;case 24:return rt(cl),null;case 25:return null;default:return null}}function kd(l,t){switch(Gf(t),t.tag){case 3:rt(cl),La();break;case 26:case 27:case 5:Lu(t);break;case 4:La();break;case 31:t.memoizedState!==null&&Dl(t);break;case 13:Dl(t);break;case 19:yl(al);break;case 10:rt(t.type);break;case 22:case 23:Dl(t),Vf(),l!==null&&yl(ca);break;case 24:rt(cl)}}function au(l,t){try{var a=t.updateQueue,e=a!==null?a.lastEffect:null;if(e!==null){var u=e.next;a=u;do{if((a.tag&l)===l){e=void 0;var n=a.create,c=a.inst;e=n(),c.destroy=e}a=a.next}while(a!==u)}}catch(f){Z(t,t.return,f)}}function $t(l,t,a){try{var e=t.updateQueue,u=e!==null?e.lastEffect:null;if(u!==null){var n=u.next;e=n;do{if((e.tag&l)===l){var c=e.inst,f=c.destroy;if(f!==void 0){c.destroy=void 0,u=t;var i=a,d=f;try{d()}catch(r){Z(u,i,r)}}}e=e.next}while(e!==n)}}catch(r){Z(t,t.return,r)}}function Fd(l){var t=l.updateQueue;if(t!==null){var a=l.stateNode;try{cd(t,a)}catch(e){Z(l,l.return,e)}}}function Id(l,t,a){a.props=ya(l.type,l.memoizedProps),a.state=l.memoizedState;try{a.componentWillUnmount()}catch(e){Z(l,t,e)}}function Me(l,t){try{var a=l.ref;if(a!==null){switch(l.tag){case 26:case 27:case 5:var e=l.stateNode;break;case 30:e=l.stateNode;break;default:e=l.stateNode}typeof a=="function"?l.refCleanup=a(e):a.current=e}}catch(u){Z(l,t,u)}}function tt(l,t){var a=l.ref,e=l.refCleanup;if(a!==null)if(typeof e=="function")try{e()}catch(u){Z(l,t,u)}finally{l.refCleanup=null,l=l.alternate,l!=null&&(l.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(u){Z(l,t,u)}else a.current=null}function Pd(l){var t=l.type,a=l.memoizedProps,e=l.stateNode;try{l:switch(t){case"button":case"input":case"select":case"textarea":a.autoFocus&&e.focus();break l;case"img":a.src?e.src=a.src:a.srcSet&&(e.srcset=a.srcSet)}}catch(u){Z(l,l.return,u)}}function sc(l,t,a){try{var e=l.stateNode;Ev(e,l.type,a,t),e[Nl]=t}catch(u){Z(l,l.return,u)}}function lo(l){return l.tag===5||l.tag===3||l.tag===26||l.tag===27&&Ft(l.type)||l.tag===4}function dc(l){l:for(;;){for(;l.sibling===null;){if(l.return===null||lo(l.return))return null;l=l.return}for(l.sibling.return=l.return,l=l.sibling;l.tag!==5&&l.tag!==6&&l.tag!==18;){if(l.tag===27&&Ft(l.type)||l.flags&2||l.child===null||l.tag===4)continue l;l.child.return=l,l=l.child}if(!(l.flags&2))return l.stateNode}}function tf(l,t,a){var e=l.tag;if(e===5||e===6)l=l.stateNode,t?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(l,t):(t=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,t.appendChild(l),a=a._reactRootContainer,a!=null||t.onclick!==null||(t.onclick=yt));else if(e!==4&&(e===27&&Ft(l.type)&&(a=l.stateNode,t=null),l=l.child,l!==null))for(tf(l,t,a),l=l.sibling;l!==null;)tf(l,t,a),l=l.sibling}function en(l,t,a){var e=l.tag;if(e===5||e===6)l=l.stateNode,t?a.insertBefore(l,t):a.appendChild(l);else if(e!==4&&(e===27&&Ft(l.type)&&(a=l.stateNode),l=l.child,l!==null))for(en(l,t,a),l=l.sibling;l!==null;)en(l,t,a),l=l.sibling}function to(l){var t=l.stateNode,a=l.memoizedProps;try{for(var e=l.type,u=t.attributes;u.length;)t.removeAttributeNode(u[0]);bl(t,e,a),t[hl]=l,t[Nl]=a}catch(n){Z(l,l.return,n)}}var ot=!1,nl=!1,oc=!1,Es=typeof WeakSet=="function"?WeakSet:Set,ol=null;function Py(l,t){if(l=l.containerInfo,sf=hn,l=Z0(l),Hf(l)){if("selectionStart"in l)var a={start:l.selectionStart,end:l.selectionEnd};else l:{a=(a=l.ownerDocument)&&a.defaultView||window;var e=a.getSelection&&a.getSelection();if(e&&e.rangeCount!==0){a=e.anchorNode;var u=e.anchorOffset,n=e.focusNode;e=e.focusOffset;try{a.nodeType,n.nodeType}catch{a=null;break l}var c=0,f=-1,i=-1,d=0,r=0,g=l,m=null;t:for(;;){for(var h;g!==a||u!==0&&g.nodeType!==3||(f=c+u),g!==n||e!==0&&g.nodeType!==3||(i=c+e),g.nodeType===3&&(c+=g.nodeValue.length),(h=g.firstChild)!==null;)m=g,g=h;for(;;){if(g===l)break t;if(m===a&&++d===u&&(f=c),m===n&&++r===e&&(i=c),(h=g.nextSibling)!==null)break;g=m,m=g.parentNode}g=h}a=f===-1||i===-1?null:{start:f,end:i}}else a=null}a=a||{start:0,end:0}}else a=null;for(df={focusedElem:l,selectionRange:a},hn=!1,ol=t;ol!==null;)if(t=ol,l=t.child,(t.subtreeFlags&1028)!==0&&l!==null)l.return=t,ol=l;else for(;ol!==null;){switch(t=ol,n=t.alternate,l=t.flags,t.tag){case 0:if(l&4&&(l=t.updateQueue,l=l!==null?l.events:null,l!==null))for(a=0;a<l.length;a++)u=l[a],u.ref.impl=u.nextImpl;break;case 11:case 15:break;case 1:if(l&1024&&n!==null){l=void 0,a=t,u=n.memoizedProps,n=n.memoizedState,e=a.stateNode;try{var E=ya(a.type,u);l=e.getSnapshotBeforeUpdate(E,n),e.__reactInternalSnapshotBeforeUpdate=l}catch(T){Z(a,a.return,T)}}break;case 3:if(l&1024){if(l=t.stateNode.containerInfo,a=l.nodeType,a===9)mf(l);else if(a===1)switch(l.nodeName){case"HEAD":case"HTML":case"BODY":mf(l);break;default:l.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(l&1024)throw Error(S(163))}if(l=t.sibling,l!==null){l.return=t.return,ol=l;break}ol=t.return}}function ao(l,t,a){var e=a.flags;switch(a.tag){case 0:case 11:case 15:it(l,a),e&4&&au(5,a);break;case 1:if(it(l,a),e&4)if(l=a.stateNode,t===null)try{l.componentDidMount()}catch(c){Z(a,a.return,c)}else{var u=ya(a.type,t.memoizedProps);t=t.memoizedState;try{l.componentDidUpdate(u,t,l.__reactInternalSnapshotBeforeUpdate)}catch(c){Z(a,a.return,c)}}e&64&&Fd(a),e&512&&Me(a,a.return);break;case 3:if(it(l,a),e&64&&(l=a.updateQueue,l!==null)){if(t=null,a.child!==null)switch(a.child.tag){case 27:case 5:t=a.child.stateNode;break;case 1:t=a.child.stateNode}try{cd(l,t)}catch(c){Z(a,a.return,c)}}break;case 27:t===null&&e&4&&to(a);case 26:case 5:it(l,a),t===null&&e&4&&Pd(a),e&512&&Me(a,a.return);break;case 12:it(l,a);break;case 31:it(l,a),e&4&&no(l,a);break;case 13:it(l,a),e&4&&co(l,a),e&64&&(l=a.memoizedState,l!==null&&(l=l.dehydrated,l!==null&&(a=iv.bind(null,a),Ov(l,a))));break;case 22:if(e=a.memoizedState!==null||ot,!e){t=t!==null&&t.memoizedState!==null||nl,u=ot;var n=nl;ot=e,(nl=t)&&!n?st(l,a,(a.subtreeFlags&8772)!==0):it(l,a),ot=u,nl=n}break;case 30:break;default:it(l,a)}}function eo(l){var t=l.alternate;t!==null&&(l.alternate=null,eo(t)),l.child=null,l.deletions=null,l.sibling=null,l.tag===5&&(t=l.stateNode,t!==null&&Of(t)),l.stateNode=null,l.return=null,l.dependencies=null,l.memoizedProps=null,l.memoizedState=null,l.pendingProps=null,l.stateNode=null,l.updateQueue=null}var F=null,Al=!1;function ft(l,t,a){for(a=a.child;a!==null;)uo(l,t,a),a=a.sibling}function uo(l,t,a){if(Hl&&typeof Hl.onCommitFiberUnmount=="function")try{Hl.onCommitFiberUnmount(We,a)}catch{}switch(a.tag){case 26:nl||tt(a,t),ft(l,t,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:nl||tt(a,t);var e=F,u=Al;Ft(a.type)&&(F=a.stateNode,Al=!1),ft(l,t,a),Ce(a.stateNode),F=e,Al=u;break;case 5:nl||tt(a,t);case 6:if(e=F,u=Al,F=null,ft(l,t,a),F=e,Al=u,F!==null)if(Al)try{(F.nodeType===9?F.body:F.nodeName==="HTML"?F.ownerDocument.body:F).removeChild(a.stateNode)}catch(n){Z(a,t,n)}else try{F.removeChild(a.stateNode)}catch(n){Z(a,t,n)}break;case 18:F!==null&&(Al?(l=F,Cs(l.nodeType===9?l.body:l.nodeName==="HTML"?l.ownerDocument.body:l,a.stateNode),Pa(l)):Cs(F,a.stateNode));break;case 4:e=F,u=Al,F=a.stateNode.containerInfo,Al=!0,ft(l,t,a),F=e,Al=u;break;case 0:case 11:case 14:case 15:$t(2,a,t),nl||$t(4,a,t),ft(l,t,a);break;case 1:nl||(tt(a,t),e=a.stateNode,typeof e.componentWillUnmount=="function"&&Id(a,t,e)),ft(l,t,a);break;case 21:ft(l,t,a);break;case 22:nl=(e=nl)||a.memoizedState!==null,ft(l,t,a),nl=e;break;default:ft(l,t,a)}}function no(l,t){if(t.memoizedState===null&&(l=t.alternate,l!==null&&(l=l.memoizedState,l!==null))){l=l.dehydrated;try{Pa(l)}catch(a){Z(t,t.return,a)}}}function co(l,t){if(t.memoizedState===null&&(l=t.alternate,l!==null&&(l=l.memoizedState,l!==null&&(l=l.dehydrated,l!==null))))try{Pa(l)}catch(a){Z(t,t.return,a)}}function lv(l){switch(l.tag){case 31:case 13:case 19:var t=l.stateNode;return t===null&&(t=l.stateNode=new Es),t;case 22:return l=l.stateNode,t=l._retryCache,t===null&&(t=l._retryCache=new Es),t;default:throw Error(S(435,l.tag))}}function Eu(l,t){var a=lv(l);t.forEach(function(e){if(!a.has(e)){a.add(e);var u=sv.bind(null,l,e);e.then(u,u)}})}function xl(l,t){var a=t.deletions;if(a!==null)for(var e=0;e<a.length;e++){var u=a[e],n=l,c=t,f=c;l:for(;f!==null;){switch(f.tag){case 27:if(Ft(f.type)){F=f.stateNode,Al=!1;break l}break;case 5:F=f.stateNode,Al=!1;break l;case 3:case 4:F=f.stateNode.containerInfo,Al=!0;break l}f=f.return}if(F===null)throw Error(S(160));uo(n,c,u),F=null,Al=!1,n=u.alternate,n!==null&&(n.return=null),u.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)fo(t,l),t=t.sibling}var Fl=null;function fo(l,t){var a=l.alternate,e=l.flags;switch(l.tag){case 0:case 11:case 14:case 15:xl(t,l),Tl(l),e&4&&($t(3,l,l.return),au(3,l),$t(5,l,l.return));break;case 1:xl(t,l),Tl(l),e&512&&(nl||a===null||tt(a,a.return)),e&64&&ot&&(l=l.updateQueue,l!==null&&(e=l.callbacks,e!==null&&(a=l.shared.hiddenCallbacks,l.shared.hiddenCallbacks=a===null?e:a.concat(e))));break;case 26:var u=Fl;if(xl(t,l),Tl(l),e&512&&(nl||a===null||tt(a,a.return)),e&4){var n=a!==null?a.memoizedState:null;if(e=l.memoizedState,a===null)if(e===null)if(l.stateNode===null){l:{e=l.type,a=l.memoizedProps,u=u.ownerDocument||u;t:switch(e){case"title":n=u.getElementsByTagName("title")[0],(!n||n[Ie]||n[hl]||n.namespaceURI==="http://www.w3.org/2000/svg"||n.hasAttribute("itemprop"))&&(n=u.createElement(e),u.head.insertBefore(n,u.querySelector("head > title"))),bl(n,e,a),n[hl]=l,ml(n),e=n;break l;case"link":var c=Qs("link","href",u).get(e+(a.href||""));if(c){for(var f=0;f<c.length;f++)if(n=c[f],n.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&n.getAttribute("rel")===(a.rel==null?null:a.rel)&&n.getAttribute("title")===(a.title==null?null:a.title)&&n.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){c.splice(f,1);break t}}n=u.createElement(e),bl(n,e,a),u.head.appendChild(n);break;case"meta":if(c=Qs("meta","content",u).get(e+(a.content||""))){for(f=0;f<c.length;f++)if(n=c[f],n.getAttribute("content")===(a.content==null?null:""+a.content)&&n.getAttribute("name")===(a.name==null?null:a.name)&&n.getAttribute("property")===(a.property==null?null:a.property)&&n.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&n.getAttribute("charset")===(a.charSet==null?null:a.charSet)){c.splice(f,1);break t}}n=u.createElement(e),bl(n,e,a),u.head.appendChild(n);break;default:throw Error(S(468,e))}n[hl]=l,ml(n),e=n}l.stateNode=e}else Xs(u,l.type,l.stateNode);else l.stateNode=Gs(u,e,l.memoizedProps);else n!==e?(n===null?a.stateNode!==null&&(a=a.stateNode,a.parentNode.removeChild(a)):n.count--,e===null?Xs(u,l.type,l.stateNode):Gs(u,e,l.memoizedProps)):e===null&&l.stateNode!==null&&sc(l,l.memoizedProps,a.memoizedProps)}break;case 27:xl(t,l),Tl(l),e&512&&(nl||a===null||tt(a,a.return)),a!==null&&e&4&&sc(l,l.memoizedProps,a.memoizedProps);break;case 5:if(xl(t,l),Tl(l),e&512&&(nl||a===null||tt(a,a.return)),l.flags&32){u=l.stateNode;try{Ka(u,"")}catch(E){Z(l,l.return,E)}}e&4&&l.stateNode!=null&&(u=l.memoizedProps,sc(l,u,a!==null?a.memoizedProps:u)),e&1024&&(oc=!0);break;case 6:if(xl(t,l),Tl(l),e&4){if(l.stateNode===null)throw Error(S(162));e=l.memoizedProps,a=l.stateNode;try{a.nodeValue=e}catch(E){Z(l,l.return,E)}}break;case 3:if(qu=null,u=Fl,Fl=mn(t.containerInfo),xl(t,l),Fl=u,Tl(l),e&4&&a!==null&&a.memoizedState.isDehydrated)try{Pa(t.containerInfo)}catch(E){Z(l,l.return,E)}oc&&(oc=!1,io(l));break;case 4:e=Fl,Fl=mn(l.stateNode.containerInfo),xl(t,l),Tl(l),Fl=e;break;case 12:xl(t,l),Tl(l);break;case 31:xl(t,l),Tl(l),e&4&&(e=l.updateQueue,e!==null&&(l.updateQueue=null,Eu(l,e)));break;case 13:xl(t,l),Tl(l),l.child.flags&8192&&l.memoizedState!==null!=(a!==null&&a.memoizedState!==null)&&(jn=Cl()),e&4&&(e=l.updateQueue,e!==null&&(l.updateQueue=null,Eu(l,e)));break;case 22:u=l.memoizedState!==null;var i=a!==null&&a.memoizedState!==null,d=ot,r=nl;if(ot=d||u,nl=r||i,xl(t,l),nl=r,ot=d,Tl(l),e&8192)l:for(t=l.stateNode,t._visibility=u?t._visibility&-2:t._visibility|1,u&&(a===null||i||ot||nl||ea(l)),a=null,t=l;;){if(t.tag===5||t.tag===26){if(a===null){i=a=t;try{if(n=i.stateNode,u)c=n.style,typeof c.setProperty=="function"?c.setProperty("display","none","important"):c.display="none";else{f=i.stateNode;var g=i.memoizedProps.style,m=g!=null&&g.hasOwnProperty("display")?g.display:null;f.style.display=m==null||typeof m=="boolean"?"":(""+m).trim()}}catch(E){Z(i,i.return,E)}}}else if(t.tag===6){if(a===null){i=t;try{i.stateNode.nodeValue=u?"":i.memoizedProps}catch(E){Z(i,i.return,E)}}}else if(t.tag===18){if(a===null){i=t;try{var h=i.stateNode;u?Hs(h,!0):Hs(i.stateNode,!1)}catch(E){Z(i,i.return,E)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===l)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===l)break l;for(;t.sibling===null;){if(t.return===null||t.return===l)break l;a===t&&(a=null),t=t.return}a===t&&(a=null),t.sibling.return=t.return,t=t.sibling}e&4&&(e=l.updateQueue,e!==null&&(a=e.retryQueue,a!==null&&(e.retryQueue=null,Eu(l,a))));break;case 19:xl(t,l),Tl(l),e&4&&(e=l.updateQueue,e!==null&&(l.updateQueue=null,Eu(l,e)));break;case 30:break;case 21:break;default:xl(t,l),Tl(l)}}function Tl(l){var t=l.flags;if(t&2){try{for(var a,e=l.return;e!==null;){if(lo(e)){a=e;break}e=e.return}if(a==null)throw Error(S(160));switch(a.tag){case 27:var u=a.stateNode,n=dc(l);en(l,n,u);break;case 5:var c=a.stateNode;a.flags&32&&(Ka(c,""),a.flags&=-33);var f=dc(l);en(l,f,c);break;case 3:case 4:var i=a.stateNode.containerInfo,d=dc(l);tf(l,d,i);break;default:throw Error(S(161))}}catch(r){Z(l,l.return,r)}l.flags&=-3}t&4096&&(l.flags&=-4097)}function io(l){if(l.subtreeFlags&1024)for(l=l.child;l!==null;){var t=l;io(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),l=l.sibling}}function it(l,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)ao(l,t.alternate,t),t=t.sibling}function ea(l){for(l=l.child;l!==null;){var t=l;switch(t.tag){case 0:case 11:case 14:case 15:$t(4,t,t.return),ea(t);break;case 1:tt(t,t.return);var a=t.stateNode;typeof a.componentWillUnmount=="function"&&Id(t,t.return,a),ea(t);break;case 27:Ce(t.stateNode);case 26:case 5:tt(t,t.return),ea(t);break;case 22:t.memoizedState===null&&ea(t);break;case 30:ea(t);break;default:ea(t)}l=l.sibling}}function st(l,t,a){for(a=a&&(t.subtreeFlags&8772)!==0,t=t.child;t!==null;){var e=t.alternate,u=l,n=t,c=n.flags;switch(n.tag){case 0:case 11:case 15:st(u,n,a),au(4,n);break;case 1:if(st(u,n,a),e=n,u=e.stateNode,typeof u.componentDidMount=="function")try{u.componentDidMount()}catch(d){Z(e,e.return,d)}if(e=n,u=e.updateQueue,u!==null){var f=e.stateNode;try{var i=u.shared.hiddenCallbacks;if(i!==null)for(u.shared.hiddenCallbacks=null,u=0;u<i.length;u++)nd(i[u],f)}catch(d){Z(e,e.return,d)}}a&&c&64&&Fd(n),Me(n,n.return);break;case 27:to(n);case 26:case 5:st(u,n,a),a&&e===null&&c&4&&Pd(n),Me(n,n.return);break;case 12:st(u,n,a);break;case 31:st(u,n,a),a&&c&4&&no(u,n);break;case 13:st(u,n,a),a&&c&4&&co(u,n);break;case 22:n.memoizedState===null&&st(u,n,a),Me(n,n.return);break;case 30:break;default:st(u,n,a)}t=t.sibling}}function ci(l,t){var a=null;l!==null&&l.memoizedState!==null&&l.memoizedState.cachePool!==null&&(a=l.memoizedState.cachePool.pool),l=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(l=t.memoizedState.cachePool.pool),l!==a&&(l!=null&&l.refCount++,a!=null&&lu(a))}function fi(l,t){l=null,t.alternate!==null&&(l=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==l&&(t.refCount++,l!=null&&lu(l))}function kl(l,t,a,e){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)so(l,t,a,e),t=t.sibling}function so(l,t,a,e){var u=t.flags;switch(t.tag){case 0:case 11:case 15:kl(l,t,a,e),u&2048&&au(9,t);break;case 1:kl(l,t,a,e);break;case 3:kl(l,t,a,e),u&2048&&(l=null,t.alternate!==null&&(l=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==l&&(t.refCount++,l!=null&&lu(l)));break;case 12:if(u&2048){kl(l,t,a,e),l=t.stateNode;try{var n=t.memoizedProps,c=n.id,f=n.onPostCommit;typeof f=="function"&&f(c,t.alternate===null?"mount":"update",l.passiveEffectDuration,-0)}catch(i){Z(t,t.return,i)}}else kl(l,t,a,e);break;case 31:kl(l,t,a,e);break;case 13:kl(l,t,a,e);break;case 23:break;case 22:n=t.stateNode,c=t.alternate,t.memoizedState!==null?n._visibility&2?kl(l,t,a,e):De(l,t):n._visibility&2?kl(l,t,a,e):(n._visibility|=2,xa(l,t,a,e,(t.subtreeFlags&10256)!==0||!1)),u&2048&&ci(c,t);break;case 24:kl(l,t,a,e),u&2048&&fi(t.alternate,t);break;default:kl(l,t,a,e)}}function xa(l,t,a,e,u){for(u=u&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var n=l,c=t,f=a,i=e,d=c.flags;switch(c.tag){case 0:case 11:case 15:xa(n,c,f,i,u),au(8,c);break;case 23:break;case 22:var r=c.stateNode;c.memoizedState!==null?r._visibility&2?xa(n,c,f,i,u):De(n,c):(r._visibility|=2,xa(n,c,f,i,u)),u&&d&2048&&ci(c.alternate,c);break;case 24:xa(n,c,f,i,u),u&&d&2048&&fi(c.alternate,c);break;default:xa(n,c,f,i,u)}t=t.sibling}}function De(l,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var a=l,e=t,u=e.flags;switch(e.tag){case 22:De(a,e),u&2048&&ci(e.alternate,e);break;case 24:De(a,e),u&2048&&fi(e.alternate,e);break;default:De(a,e)}t=t.sibling}}var Se=8192;function Ea(l,t,a){if(l.subtreeFlags&Se)for(l=l.child;l!==null;)oo(l,t,a),l=l.sibling}function oo(l,t,a){switch(l.tag){case 26:Ea(l,t,a),l.flags&Se&&l.memoizedState!==null&&Qv(a,Fl,l.memoizedState,l.memoizedProps);break;case 5:Ea(l,t,a);break;case 3:case 4:var e=Fl;Fl=mn(l.stateNode.containerInfo),Ea(l,t,a),Fl=e;break;case 22:l.memoizedState===null&&(e=l.alternate,e!==null&&e.memoizedState!==null?(e=Se,Se=16777216,Ea(l,t,a),Se=e):Ea(l,t,a));break;default:Ea(l,t,a)}}function mo(l){var t=l.alternate;if(t!==null&&(l=t.child,l!==null)){t.child=null;do t=l.sibling,l.sibling=null,l=t;while(l!==null)}}function ye(l){var t=l.deletions;if(l.flags&16){if(t!==null)for(var a=0;a<t.length;a++){var e=t[a];ol=e,vo(e,l)}mo(l)}if(l.subtreeFlags&10256)for(l=l.child;l!==null;)yo(l),l=l.sibling}function yo(l){switch(l.tag){case 0:case 11:case 15:ye(l),l.flags&2048&&$t(9,l,l.return);break;case 3:ye(l);break;case 12:ye(l);break;case 22:var t=l.stateNode;l.memoizedState!==null&&t._visibility&2&&(l.return===null||l.return.tag!==13)?(t._visibility&=-3,Bu(l)):ye(l);break;default:ye(l)}}function Bu(l){var t=l.deletions;if(l.flags&16){if(t!==null)for(var a=0;a<t.length;a++){var e=t[a];ol=e,vo(e,l)}mo(l)}for(l=l.child;l!==null;){switch(t=l,t.tag){case 0:case 11:case 15:$t(8,t,t.return),Bu(t);break;case 22:a=t.stateNode,a._visibility&2&&(a._visibility&=-3,Bu(t));break;default:Bu(t)}l=l.sibling}}function vo(l,t){for(;ol!==null;){var a=ol;switch(a.tag){case 0:case 11:case 15:$t(8,a,t);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var e=a.memoizedState.cachePool.pool;e!=null&&e.refCount++}break;case 24:lu(a.memoizedState.cache)}if(e=a.child,e!==null)e.return=a,ol=e;else l:for(a=l;ol!==null;){e=ol;var u=e.sibling,n=e.return;if(eo(e),e===a){ol=null;break l}if(u!==null){u.return=n,ol=u;break l}ol=n}}}var tv={getCacheForType:function(l){var t=gl(cl),a=t.data.get(l);return a===void 0&&(a=l(),t.data.set(l,a)),a},cacheSignal:function(){return gl(cl).controller.signal}},av=typeof WeakMap=="function"?WeakMap:Map,G=0,K=null,H=null,R=0,X=0,Ml=null,Ht=!1,ne=!1,ii=!1,xt=0,P=0,Wt=0,ia=0,si=0,Ul=0,Wa=0,je=null,pl=null,af=!1,jn=0,ho=0,un=1/0,nn=null,Xt=null,il=0,Zt=null,ka=null,gt=0,ef=0,uf=null,ro=null,Ue=0,nf=null;function Bl(){return G&2&&R!==0?R&-R:p.T!==null?oi():A0()}function go(){if(Ul===0)if(!(R&536870912)||Y){var l=mu;mu<<=1,!(mu&3932160)&&(mu=262144),Ul=l}else Ul=536870912;return l=ql.current,l!==null&&(l.flags|=32),Ul}function _l(l,t,a){(l===K&&(X===2||X===9)||l.cancelPendingCommit!==null)&&(Fa(l,0),Rt(l,R,Ul,!1)),Fe(l,a),(!(G&2)||l!==K)&&(l===K&&(!(G&2)&&(ia|=a),P===4&&Rt(l,R,Ul,!1)),ut(l))}function bo(l,t,a){if(G&6)throw Error(S(327));var e=!a&&(t&127)===0&&(t&l.expiredLanes)===0||ke(l,t),u=e?nv(l,t):mc(l,t,!0),n=e;do{if(u===0){ne&&!e&&Rt(l,t,0,!1);break}else{if(a=l.current.alternate,n&&!ev(a)){u=mc(l,t,!1),n=!1;continue}if(u===2){if(n=t,l.errorRecoveryDisabledLanes&n)var c=0;else c=l.pendingLanes&-536870913,c=c!==0?c:c&536870912?536870912:0;if(c!==0){t=c;l:{var f=l;u=je;var i=f.current.memoizedState.isDehydrated;if(i&&(Fa(f,c).flags|=256),c=mc(f,c,!1),c!==2){if(ii&&!i){f.errorRecoveryDisabledLanes|=n,ia|=n,u=4;break l}n=pl,pl=u,n!==null&&(pl===null?pl=n:pl.push.apply(pl,n))}u=c}if(n=!1,u!==2)continue}}if(u===1){Fa(l,0),Rt(l,t,0,!0);break}l:{switch(e=l,n=u,n){case 0:case 1:throw Error(S(345));case 4:if((t&4194048)!==t)break;case 6:Rt(e,t,Ul,!Ht);break l;case 2:pl=null;break;case 3:case 5:break;default:throw Error(S(329))}if((t&62914560)===t&&(u=jn+300-Cl(),10<u)){if(Rt(e,t,Ul,!Ht),En(e,0,!0)!==0)break l;gt=t,e.timeoutHandle=qo(zs.bind(null,e,a,pl,nn,af,t,Ul,ia,Wa,Ht,n,"Throttled",-0,0),u);break l}zs(e,a,pl,nn,af,t,Ul,ia,Wa,Ht,n,null,-0,0)}}break}while(!0);ut(l)}function zs(l,t,a,e,u,n,c,f,i,d,r,g,m,h){if(l.timeoutHandle=-1,g=t.subtreeFlags,g&8192||(g&16785408)===16785408){g={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:yt},oo(t,n,g);var E=(n&62914560)===n?jn-Cl():(n&4194048)===n?ho-Cl():0;if(E=Xv(g,E),E!==null){gt=n,l.cancelPendingCommit=E(Ts.bind(null,l,t,n,a,e,u,c,f,i,r,g,null,m,h)),Rt(l,n,c,!d);return}}Ts(l,t,n,a,e,u,c,f,i)}function ev(l){for(var t=l;;){var a=t.tag;if((a===0||a===11||a===15)&&t.flags&16384&&(a=t.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var e=0;e<a.length;e++){var u=a[e],n=u.getSnapshot;u=u.value;try{if(!Yl(n(),u))return!1}catch{return!1}}if(a=t.child,t.subtreeFlags&16384&&a!==null)a.return=t,t=a;else{if(t===l)break;for(;t.sibling===null;){if(t.return===null||t.return===l)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Rt(l,t,a,e){t&=~si,t&=~ia,l.suspendedLanes|=t,l.pingedLanes&=~t,e&&(l.warmLanes|=t),e=l.expirationTimes;for(var u=t;0<u;){var n=31-Rl(u),c=1<<n;e[n]=-1,u&=~c}a!==0&&z0(l,a,t)}function Un(){return G&6?!0:(eu(0),!1)}function di(){if(H!==null){if(X===0)var l=H.return;else l=H,vt=ba=null,Wf(l),Qa=null,Qe=0,l=H;for(;l!==null;)kd(l.alternate,l),l=l.return;H=null}}function Fa(l,t){var a=l.timeoutHandle;a!==-1&&(l.timeoutHandle=-1,Tv(a)),a=l.cancelPendingCommit,a!==null&&(l.cancelPendingCommit=null,a()),gt=0,di(),K=l,H=a=ht(l.current,null),R=t,X=0,Ml=null,Ht=!1,ne=ke(l,t),ii=!1,Wa=Ul=si=ia=Wt=P=0,pl=je=null,af=!1,t&8&&(t|=t&32);var e=l.entangledLanes;if(e!==0)for(l=l.entanglements,e&=t;0<e;){var u=31-Rl(e),n=1<<u;t|=l[u],e&=~n}return xt=t,An(),a}function So(l,t){O=null,p.H=Ze,t===ue||t===_n?(t=Pi(),X=3):t===Zf?(t=Pi(),X=4):X=t===ui?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,Ml=t,H===null&&(P=1,tn(l,Kl(t,l.current)))}function Eo(){var l=ql.current;return l===null?!0:(R&4194048)===R?wl===null:(R&62914560)===R||R&536870912?l===wl:!1}function zo(){var l=p.H;return p.H=Ze,l===null?Ze:l}function xo(){var l=p.A;return p.A=tv,l}function cn(){P=4,Ht||(R&4194048)!==R&&ql.current!==null||(ne=!0),!(Wt&134217727)&&!(ia&134217727)||K===null||Rt(K,R,Ul,!1)}function mc(l,t,a){var e=G;G|=2;var u=zo(),n=xo();(K!==l||R!==t)&&(nn=null,Fa(l,t)),t=!1;var c=P;l:do try{if(X!==0&&H!==null){var f=H,i=Ml;switch(X){case 8:di(),c=6;break l;case 3:case 2:case 9:case 6:ql.current===null&&(t=!0);var d=X;if(X=0,Ml=null,Ra(l,f,i,d),a&&ne){c=0;break l}break;default:d=X,X=0,Ml=null,Ra(l,f,i,d)}}uv(),c=P;break}catch(r){So(l,r)}while(!0);return t&&l.shellSuspendCounter++,vt=ba=null,G=e,p.H=u,p.A=n,H===null&&(K=null,R=0,An()),c}function uv(){for(;H!==null;)To(H)}function nv(l,t){var a=G;G|=2;var e=zo(),u=xo();K!==l||R!==t?(nn=null,un=Cl()+500,Fa(l,t)):ne=ke(l,t);l:do try{if(X!==0&&H!==null){t=H;var n=Ml;t:switch(X){case 1:X=0,Ml=null,Ra(l,t,n,1);break;case 2:case 9:if(Ii(n)){X=0,Ml=null,xs(t);break}t=function(){X!==2&&X!==9||K!==l||(X=7),ut(l)},n.then(t,t);break l;case 3:X=7;break l;case 4:X=5;break l;case 7:Ii(n)?(X=0,Ml=null,xs(t)):(X=0,Ml=null,Ra(l,t,n,7));break;case 5:var c=null;switch(H.tag){case 26:c=H.memoizedState;case 5:case 27:var f=H;if(c?Lo(c):f.stateNode.complete){X=0,Ml=null;var i=f.sibling;if(i!==null)H=i;else{var d=f.return;d!==null?(H=d,Cn(d)):H=null}break t}}X=0,Ml=null,Ra(l,t,n,5);break;case 6:X=0,Ml=null,Ra(l,t,n,6);break;case 8:di(),P=6;break l;default:throw Error(S(462))}}cv();break}catch(r){So(l,r)}while(!0);return vt=ba=null,p.H=e,p.A=u,G=a,H!==null?0:(K=null,R=0,An(),P)}function cv(){for(;H!==null&&!Mm();)To(H)}function To(l){var t=Wd(l.alternate,l,xt);l.memoizedProps=l.pendingProps,t===null?Cn(l):H=t}function xs(l){var t=l,a=t.alternate;switch(t.tag){case 15:case 0:t=hs(a,t,t.pendingProps,t.type,void 0,R);break;case 11:t=hs(a,t,t.pendingProps,t.type.render,t.ref,R);break;case 5:Wf(t);default:kd(a,t),t=H=k0(t,xt),t=Wd(a,t,xt)}l.memoizedProps=l.pendingProps,t===null?Cn(l):H=t}function Ra(l,t,a,e){vt=ba=null,Wf(t),Qa=null,Qe=0;var u=t.return;try{if($y(l,u,t,a,R)){P=1,tn(l,Kl(a,l.current)),H=null;return}}catch(n){if(u!==null)throw H=u,n;P=1,tn(l,Kl(a,l.current)),H=null;return}t.flags&32768?(Y||e===1?l=!0:ne||R&536870912?l=!1:(Ht=l=!0,(e===2||e===9||e===3||e===6)&&(e=ql.current,e!==null&&e.tag===13&&(e.flags|=16384))),Ao(t,l)):Cn(t)}function Cn(l){var t=l;do{if(t.flags&32768){Ao(t,Ht);return}l=t.return;var a=Fy(t.alternate,t,xt);if(a!==null){H=a;return}if(t=t.sibling,t!==null){H=t;return}H=t=l}while(t!==null);P===0&&(P=5)}function Ao(l,t){do{var a=Iy(l.alternate,l);if(a!==null){a.flags&=32767,H=a;return}if(a=l.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!t&&(l=l.sibling,l!==null)){H=l;return}H=l=a}while(l!==null);P=6,H=null}function Ts(l,t,a,e,u,n,c,f,i){l.cancelPendingCommit=null;do Hn();while(il!==0);if(G&6)throw Error(S(327));if(t!==null){if(t===l.current)throw Error(S(177));if(n=t.lanes|t.childLanes,n|=Rf,Gm(l,a,n,c,f,i),l===K&&(H=K=null,R=0),ka=t,Zt=l,gt=a,ef=n,uf=u,ro=e,t.subtreeFlags&10256||t.flags&10256?(l.callbackNode=null,l.callbackPriority=0,dv(Vu,function(){return Mo(),null})):(l.callbackNode=null,l.callbackPriority=0),e=(t.flags&13878)!==0,t.subtreeFlags&13878||e){e=p.T,p.T=null,u=Q.p,Q.p=2,c=G,G|=4;try{Py(l,t,a)}finally{G=c,Q.p=u,p.T=e}}il=1,po(),_o(),No()}}function po(){if(il===1){il=0;var l=Zt,t=ka,a=(t.flags&13878)!==0;if(t.subtreeFlags&13878||a){a=p.T,p.T=null;var e=Q.p;Q.p=2;var u=G;G|=4;try{fo(t,l);var n=df,c=Z0(l.containerInfo),f=n.focusedElem,i=n.selectionRange;if(c!==f&&f&&f.ownerDocument&&X0(f.ownerDocument.documentElement,f)){if(i!==null&&Hf(f)){var d=i.start,r=i.end;if(r===void 0&&(r=d),"selectionStart"in f)f.selectionStart=d,f.selectionEnd=Math.min(r,f.value.length);else{var g=f.ownerDocument||document,m=g&&g.defaultView||window;if(m.getSelection){var h=m.getSelection(),E=f.textContent.length,T=Math.min(i.start,E),q=i.end===void 0?T:Math.min(i.end,E);!h.extend&&T>q&&(c=q,q=T,T=c);var o=Ki(f,T),s=Ki(f,q);if(o&&s&&(h.rangeCount!==1||h.anchorNode!==o.node||h.anchorOffset!==o.offset||h.focusNode!==s.node||h.focusOffset!==s.offset)){var y=g.createRange();y.setStart(o.node,o.offset),h.removeAllRanges(),T>q?(h.addRange(y),h.extend(s.node,s.offset)):(y.setEnd(s.node,s.offset),h.addRange(y))}}}}for(g=[],h=f;h=h.parentNode;)h.nodeType===1&&g.push({element:h,left:h.scrollLeft,top:h.scrollTop});for(typeof f.focus=="function"&&f.focus(),f=0;f<g.length;f++){var b=g[f];b.element.scrollLeft=b.left,b.element.scrollTop=b.top}}hn=!!sf,df=sf=null}finally{G=u,Q.p=e,p.T=a}}l.current=t,il=2}}function _o(){if(il===2){il=0;var l=Zt,t=ka,a=(t.flags&8772)!==0;if(t.subtreeFlags&8772||a){a=p.T,p.T=null;var e=Q.p;Q.p=2;var u=G;G|=4;try{ao(l,t.alternate,t)}finally{G=u,Q.p=e,p.T=a}}il=3}}function No(){if(il===4||il===3){il=0,Dm();var l=Zt,t=ka,a=gt,e=ro;t.subtreeFlags&10256||t.flags&10256?il=5:(il=0,ka=Zt=null,Oo(l,l.pendingLanes));var u=l.pendingLanes;if(u===0&&(Xt=null),Nf(a),t=t.stateNode,Hl&&typeof Hl.onCommitFiberRoot=="function")try{Hl.onCommitFiberRoot(We,t,void 0,(t.current.flags&128)===128)}catch{}if(e!==null){t=p.T,u=Q.p,Q.p=2,p.T=null;try{for(var n=l.onRecoverableError,c=0;c<e.length;c++){var f=e[c];n(f.value,{componentStack:f.stack})}}finally{p.T=t,Q.p=u}}gt&3&&Hn(),ut(l),u=l.pendingLanes,a&261930&&u&42?l===nf?Ue++:(Ue=0,nf=l):Ue=0,eu(0)}}function Oo(l,t){(l.pooledCacheLanes&=t)===0&&(t=l.pooledCache,t!=null&&(l.pooledCache=null,lu(t)))}function Hn(){return po(),_o(),No(),Mo()}function Mo(){if(il!==5)return!1;var l=Zt,t=ef;ef=0;var a=Nf(gt),e=p.T,u=Q.p;try{Q.p=32>a?32:a,p.T=null,a=uf,uf=null;var n=Zt,c=gt;if(il=0,ka=Zt=null,gt=0,G&6)throw Error(S(331));var f=G;if(G|=4,yo(n.current),so(n,n.current,c,a),G=f,eu(0,!1),Hl&&typeof Hl.onPostCommitFiberRoot=="function")try{Hl.onPostCommitFiberRoot(We,n)}catch{}return!0}finally{Q.p=u,p.T=e,Oo(l,t)}}function As(l,t,a){t=Kl(a,t),t=Ic(l.stateNode,t,2),l=Qt(l,t,2),l!==null&&(Fe(l,2),ut(l))}function Z(l,t,a){if(l.tag===3)As(l,l,a);else for(;t!==null;){if(t.tag===3){As(t,l,a);break}else if(t.tag===1){var e=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof e.componentDidCatch=="function"&&(Xt===null||!Xt.has(e))){l=Kl(a,l),a=Ld(2),e=Qt(t,a,2),e!==null&&(Vd(a,e,t,l),Fe(e,2),ut(e));break}}t=t.return}}function yc(l,t,a){var e=l.pingCache;if(e===null){e=l.pingCache=new av;var u=new Set;e.set(t,u)}else u=e.get(t),u===void 0&&(u=new Set,e.set(t,u));u.has(a)||(ii=!0,u.add(a),l=fv.bind(null,l,t,a),t.then(l,l))}function fv(l,t,a){var e=l.pingCache;e!==null&&e.delete(t),l.pingedLanes|=l.suspendedLanes&a,l.warmLanes&=~a,K===l&&(R&a)===a&&(P===4||P===3&&(R&62914560)===R&&300>Cl()-jn?!(G&2)&&Fa(l,0):si|=a,Wa===R&&(Wa=0)),ut(l)}function Do(l,t){t===0&&(t=E0()),l=ga(l,t),l!==null&&(Fe(l,t),ut(l))}function iv(l){var t=l.memoizedState,a=0;t!==null&&(a=t.retryLane),Do(l,a)}function sv(l,t){var a=0;switch(l.tag){case 31:case 13:var e=l.stateNode,u=l.memoizedState;u!==null&&(a=u.retryLane);break;case 19:e=l.stateNode;break;case 22:e=l.stateNode._retryCache;break;default:throw Error(S(314))}e!==null&&e.delete(t),Do(l,a)}function dv(l,t){return pf(l,t)}var fn=null,Ta=null,cf=!1,sn=!1,vc=!1,Bt=0;function ut(l){l!==Ta&&l.next===null&&(Ta===null?fn=Ta=l:Ta=Ta.next=l),sn=!0,cf||(cf=!0,mv())}function eu(l,t){if(!vc&&sn){vc=!0;do for(var a=!1,e=fn;e!==null;){if(l!==0){var u=e.pendingLanes;if(u===0)var n=0;else{var c=e.suspendedLanes,f=e.pingedLanes;n=(1<<31-Rl(42|l)+1)-1,n&=u&~(c&~f),n=n&201326741?n&201326741|1:n?n|2:0}n!==0&&(a=!0,ps(e,n))}else n=R,n=En(e,e===K?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),!(n&3)||ke(e,n)||(a=!0,ps(e,n));e=e.next}while(a);vc=!1}}function ov(){jo()}function jo(){sn=cf=!1;var l=0;Bt!==0&&xv()&&(l=Bt);for(var t=Cl(),a=null,e=fn;e!==null;){var u=e.next,n=Uo(e,t);n===0?(e.next=null,a===null?fn=u:a.next=u,u===null&&(Ta=a)):(a=e,(l!==0||n&3)&&(sn=!0)),e=u}il!==0&&il!==5||eu(l),Bt!==0&&(Bt=0)}function Uo(l,t){for(var a=l.suspendedLanes,e=l.pingedLanes,u=l.expirationTimes,n=l.pendingLanes&-62914561;0<n;){var c=31-Rl(n),f=1<<c,i=u[c];i===-1?(!(f&a)||f&e)&&(u[c]=qm(f,t)):i<=t&&(l.expiredLanes|=f),n&=~f}if(t=K,a=R,a=En(l,l===t?a:0,l.cancelPendingCommit!==null||l.timeoutHandle!==-1),e=l.callbackNode,a===0||l===t&&(X===2||X===9)||l.cancelPendingCommit!==null)return e!==null&&e!==null&&Zn(e),l.callbackNode=null,l.callbackPriority=0;if(!(a&3)||ke(l,a)){if(t=a&-a,t===l.callbackPriority)return t;switch(e!==null&&Zn(e),Nf(a)){case 2:case 8:a=b0;break;case 32:a=Vu;break;case 268435456:a=S0;break;default:a=Vu}return e=Co.bind(null,l),a=pf(a,e),l.callbackPriority=t,l.callbackNode=a,t}return e!==null&&e!==null&&Zn(e),l.callbackPriority=2,l.callbackNode=null,2}function Co(l,t){if(il!==0&&il!==5)return l.callbackNode=null,l.callbackPriority=0,null;var a=l.callbackNode;if(Hn()&&l.callbackNode!==a)return null;var e=R;return e=En(l,l===K?e:0,l.cancelPendingCommit!==null||l.timeoutHandle!==-1),e===0?null:(bo(l,e,t),Uo(l,Cl()),l.callbackNode!=null&&l.callbackNode===a?Co.bind(null,l):null)}function ps(l,t){if(Hn())return null;bo(l,t,!0)}function mv(){Av(function(){G&6?pf(g0,ov):jo()})}function oi(){if(Bt===0){var l=Ja;l===0&&(l=ou,ou<<=1,!(ou&261888)&&(ou=256)),Bt=l}return Bt}function _s(l){return l==null||typeof l=="symbol"||typeof l=="boolean"?null:typeof l=="function"?l:Nu(""+l)}function Ns(l,t){var a=t.ownerDocument.createElement("input");return a.name=t.name,a.value=t.value,l.id&&a.setAttribute("form",l.id),t.parentNode.insertBefore(a,t),l=new FormData(l),a.parentNode.removeChild(a),l}function yv(l,t,a,e,u){if(t==="submit"&&a&&a.stateNode===u){var n=_s((u[Nl]||null).action),c=e.submitter;c&&(t=(t=c[Nl]||null)?_s(t.formAction):c.getAttribute("formAction"),t!==null&&(n=t,c=null));var f=new zn("action","action",null,e,u);l.push({event:f,listeners:[{instance:null,listener:function(){if(e.defaultPrevented){if(Bt!==0){var i=c?Ns(u,c):new FormData(u);kc(a,{pending:!0,data:i,method:u.method,action:n},null,i)}}else typeof n=="function"&&(f.preventDefault(),i=c?Ns(u,c):new FormData(u),kc(a,{pending:!0,data:i,method:u.method,action:n},n,i))},currentTarget:u}]})}}for(var hc=0;hc<qc.length;hc++){var rc=qc[hc],vv=rc.toLowerCase(),hv=rc[0].toUpperCase()+rc.slice(1);Il(vv,"on"+hv)}Il(V0,"onAnimationEnd");Il(K0,"onAnimationIteration");Il(J0,"onAnimationStart");Il("dblclick","onDoubleClick");Il("focusin","onFocus");Il("focusout","onBlur");Il(jy,"onTransitionRun");Il(Uy,"onTransitionStart");Il(Cy,"onTransitionCancel");Il(w0,"onTransitionEnd");Va("onMouseEnter",["mouseout","mouseover"]);Va("onMouseLeave",["mouseout","mouseover"]);Va("onPointerEnter",["pointerout","pointerover"]);Va("onPointerLeave",["pointerout","pointerover"]);va("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));va("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));va("onBeforeInput",["compositionend","keypress","textInput","paste"]);va("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));va("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));va("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Le="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),rv=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Le));function Ho(l,t){t=(t&4)!==0;for(var a=0;a<l.length;a++){var e=l[a],u=e.event;e=e.listeners;l:{var n=void 0;if(t)for(var c=e.length-1;0<=c;c--){var f=e[c],i=f.instance,d=f.currentTarget;if(f=f.listener,i!==n&&u.isPropagationStopped())break l;n=f,u.currentTarget=d;try{n(u)}catch(r){Ju(r)}u.currentTarget=null,n=i}else for(c=0;c<e.length;c++){if(f=e[c],i=f.instance,d=f.currentTarget,f=f.listener,i!==n&&u.isPropagationStopped())break l;n=f,u.currentTarget=d;try{n(u)}catch(r){Ju(r)}u.currentTarget=null,n=i}}}}function C(l,t){var a=t[Dc];a===void 0&&(a=t[Dc]=new Set);var e=l+"__bubble";a.has(e)||(Ro(t,l,2,!1),a.add(e))}function gc(l,t,a){var e=0;t&&(e|=4),Ro(a,l,e,t)}var zu="_reactListening"+Math.random().toString(36).slice(2);function mi(l){if(!l[zu]){l[zu]=!0,p0.forEach(function(a){a!=="selectionchange"&&(rv.has(a)||gc(a,!1,l),gc(a,!0,l))});var t=l.nodeType===9?l:l.ownerDocument;t===null||t[zu]||(t[zu]=!0,gc("selectionchange",!1,t))}}function Ro(l,t,a,e){switch($o(t)){case 2:var u=Vv;break;case 8:u=Kv;break;default:u=ri}a=u.bind(null,t,a,l),u=void 0,!Rc||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(u=!0),e?u!==void 0?l.addEventListener(t,a,{capture:!0,passive:u}):l.addEventListener(t,a,!0):u!==void 0?l.addEventListener(t,a,{passive:u}):l.addEventListener(t,a,!1)}function bc(l,t,a,e,u){var n=e;if(!(t&1)&&!(t&2)&&e!==null)l:for(;;){if(e===null)return;var c=e.tag;if(c===3||c===4){var f=e.stateNode.containerInfo;if(f===u)break;if(c===4)for(c=e.return;c!==null;){var i=c.tag;if((i===3||i===4)&&c.stateNode.containerInfo===u)return;c=c.return}for(;f!==null;){if(c=_a(f),c===null)return;if(i=c.tag,i===5||i===6||i===26||i===27){e=n=c;continue l}f=f.parentNode}}e=e.return}C0(function(){var d=n,r=Df(a),g=[];l:{var m=$0.get(l);if(m!==void 0){var h=zn,E=l;switch(l){case"keypress":if(Mu(a)===0)break l;case"keydown":case"keyup":h=sy;break;case"focusin":E="focus",h=wn;break;case"focusout":E="blur",h=wn;break;case"beforeblur":case"afterblur":h=wn;break;case"click":if(a.button===2)break l;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":h=Ri;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":h=Fm;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":h=my;break;case V0:case K0:case J0:h=ly;break;case w0:h=vy;break;case"scroll":case"scrollend":h=Wm;break;case"wheel":h=ry;break;case"copy":case"cut":case"paste":h=ay;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":h=Yi;break;case"toggle":case"beforetoggle":h=by}var T=(t&4)!==0,q=!T&&(l==="scroll"||l==="scrollend"),o=T?m!==null?m+"Capture":null:m;T=[];for(var s=d,y;s!==null;){var b=s;if(y=b.stateNode,b=b.tag,b!==5&&b!==26&&b!==27||y===null||o===null||(b=Re(s,o),b!=null&&T.push(Ve(s,b,y))),q)break;s=s.return}0<T.length&&(m=new h(m,E,null,a,r),g.push({event:m,listeners:T}))}}if(!(t&7)){l:{if(m=l==="mouseover"||l==="pointerover",h=l==="mouseout"||l==="pointerout",m&&a!==Hc&&(E=a.relatedTarget||a.fromElement)&&(_a(E)||E[te]))break l;if((h||m)&&(m=r.window===r?r:(m=r.ownerDocument)?m.defaultView||m.parentWindow:window,h?(E=a.relatedTarget||a.toElement,h=d,E=E?_a(E):null,E!==null&&(q=$e(E),T=E.tag,E!==q||T!==5&&T!==27&&T!==6)&&(E=null)):(h=null,E=d),h!==E)){if(T=Ri,b="onMouseLeave",o="onMouseEnter",s="mouse",(l==="pointerout"||l==="pointerover")&&(T=Yi,b="onPointerLeave",o="onPointerEnter",s="pointer"),q=h==null?m:ge(h),y=E==null?m:ge(E),m=new T(b,s+"leave",h,a,r),m.target=q,m.relatedTarget=y,b=null,_a(r)===d&&(T=new T(o,s+"enter",E,a,r),T.target=y,T.relatedTarget=q,b=T),q=b,h&&E)t:{for(T=gv,o=h,s=E,y=0,b=o;b;b=T(b))y++;b=0;for(var A=s;A;A=T(A))b++;for(;0<y-b;)o=T(o),y--;for(;0<b-y;)s=T(s),b--;for(;y--;){if(o===s||s!==null&&o===s.alternate){T=o;break t}o=T(o),s=T(s)}T=null}else T=null;h!==null&&Os(g,m,h,T,!1),E!==null&&q!==null&&Os(g,q,E,T,!0)}}l:{if(m=d?ge(d):window,h=m.nodeName&&m.nodeName.toLowerCase(),h==="select"||h==="input"&&m.type==="file")var M=Xi;else if(Qi(m))if(G0)M=Oy;else{M=_y;var z=py}else h=m.nodeName,!h||h.toLowerCase()!=="input"||m.type!=="checkbox"&&m.type!=="radio"?d&&Mf(d.elementType)&&(M=Xi):M=Ny;if(M&&(M=M(l,d))){q0(g,M,a,r);break l}z&&z(l,m,d),l==="focusout"&&d&&m.type==="number"&&d.memoizedProps.value!=null&&Cc(m,"number",m.value)}switch(z=d?ge(d):window,l){case"focusin":(Qi(z)||z.contentEditable==="true")&&(Ma=z,Bc=d,Te=null);break;case"focusout":Te=Bc=Ma=null;break;case"mousedown":Yc=!0;break;case"contextmenu":case"mouseup":case"dragend":Yc=!1,Ji(g,a,r);break;case"selectionchange":if(Dy)break;case"keydown":case"keyup":Ji(g,a,r)}var _;if(Cf)l:{switch(l){case"compositionstart":var D="onCompositionStart";break l;case"compositionend":D="onCompositionEnd";break l;case"compositionupdate":D="onCompositionUpdate";break l}D=void 0}else Oa?B0(l,a)&&(D="onCompositionEnd"):l==="keydown"&&a.keyCode===229&&(D="onCompositionStart");D&&(R0&&a.locale!=="ko"&&(Oa||D!=="onCompositionStart"?D==="onCompositionEnd"&&Oa&&(_=H0()):(Ct=r,jf="value"in Ct?Ct.value:Ct.textContent,Oa=!0)),z=dn(d,D),0<z.length&&(D=new Bi(D,l,null,a,r),g.push({event:D,listeners:z}),_?D.data=_:(_=Y0(a),_!==null&&(D.data=_)))),(_=Ey?zy(l,a):xy(l,a))&&(D=dn(d,"onBeforeInput"),0<D.length&&(z=new Bi("onBeforeInput","beforeinput",null,a,r),g.push({event:z,listeners:D}),z.data=_)),yv(g,l,d,a,r)}Ho(g,t)})}function Ve(l,t,a){return{instance:l,listener:t,currentTarget:a}}function dn(l,t){for(var a=t+"Capture",e=[];l!==null;){var u=l,n=u.stateNode;if(u=u.tag,u!==5&&u!==26&&u!==27||n===null||(u=Re(l,a),u!=null&&e.unshift(Ve(l,u,n)),u=Re(l,t),u!=null&&e.push(Ve(l,u,n))),l.tag===3)return e;l=l.return}return[]}function gv(l){if(l===null)return null;do l=l.return;while(l&&l.tag!==5&&l.tag!==27);return l||null}function Os(l,t,a,e,u){for(var n=t._reactName,c=[];a!==null&&a!==e;){var f=a,i=f.alternate,d=f.stateNode;if(f=f.tag,i!==null&&i===e)break;f!==5&&f!==26&&f!==27||d===null||(i=d,u?(d=Re(a,n),d!=null&&c.unshift(Ve(a,d,i))):u||(d=Re(a,n),d!=null&&c.push(Ve(a,d,i)))),a=a.return}c.length!==0&&l.push({event:t,listeners:c})}var bv=/\r\n?/g,Sv=/\u0000|\uFFFD/g;function Ms(l){return(typeof l=="string"?l:""+l).replace(bv,`
`).replace(Sv,"")}function Bo(l,t){return t=Ms(t),Ms(l)===t}function L(l,t,a,e,u,n){switch(a){case"children":typeof e=="string"?t==="body"||t==="textarea"&&e===""||Ka(l,e):(typeof e=="number"||typeof e=="bigint")&&t!=="body"&&Ka(l,""+e);break;case"className":vu(l,"class",e);break;case"tabIndex":vu(l,"tabindex",e);break;case"dir":case"role":case"viewBox":case"width":case"height":vu(l,a,e);break;case"style":U0(l,e,n);break;case"data":if(t!=="object"){vu(l,"data",e);break}case"src":case"href":if(e===""&&(t!=="a"||a!=="href")){l.removeAttribute(a);break}if(e==null||typeof e=="function"||typeof e=="symbol"||typeof e=="boolean"){l.removeAttribute(a);break}e=Nu(""+e),l.setAttribute(a,e);break;case"action":case"formAction":if(typeof e=="function"){l.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof n=="function"&&(a==="formAction"?(t!=="input"&&L(l,t,"name",u.name,u,null),L(l,t,"formEncType",u.formEncType,u,null),L(l,t,"formMethod",u.formMethod,u,null),L(l,t,"formTarget",u.formTarget,u,null)):(L(l,t,"encType",u.encType,u,null),L(l,t,"method",u.method,u,null),L(l,t,"target",u.target,u,null)));if(e==null||typeof e=="symbol"||typeof e=="boolean"){l.removeAttribute(a);break}e=Nu(""+e),l.setAttribute(a,e);break;case"onClick":e!=null&&(l.onclick=yt);break;case"onScroll":e!=null&&C("scroll",l);break;case"onScrollEnd":e!=null&&C("scrollend",l);break;case"dangerouslySetInnerHTML":if(e!=null){if(typeof e!="object"||!("__html"in e))throw Error(S(61));if(a=e.__html,a!=null){if(u.children!=null)throw Error(S(60));l.innerHTML=a}}break;case"multiple":l.multiple=e&&typeof e!="function"&&typeof e!="symbol";break;case"muted":l.muted=e&&typeof e!="function"&&typeof e!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(e==null||typeof e=="function"||typeof e=="boolean"||typeof e=="symbol"){l.removeAttribute("xlink:href");break}a=Nu(""+e),l.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":e!=null&&typeof e!="function"&&typeof e!="symbol"?l.setAttribute(a,""+e):l.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":e&&typeof e!="function"&&typeof e!="symbol"?l.setAttribute(a,""):l.removeAttribute(a);break;case"capture":case"download":e===!0?l.setAttribute(a,""):e!==!1&&e!=null&&typeof e!="function"&&typeof e!="symbol"?l.setAttribute(a,e):l.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":e!=null&&typeof e!="function"&&typeof e!="symbol"&&!isNaN(e)&&1<=e?l.setAttribute(a,e):l.removeAttribute(a);break;case"rowSpan":case"start":e==null||typeof e=="function"||typeof e=="symbol"||isNaN(e)?l.removeAttribute(a):l.setAttribute(a,e);break;case"popover":C("beforetoggle",l),C("toggle",l),_u(l,"popover",e);break;case"xlinkActuate":nt(l,"http://www.w3.org/1999/xlink","xlink:actuate",e);break;case"xlinkArcrole":nt(l,"http://www.w3.org/1999/xlink","xlink:arcrole",e);break;case"xlinkRole":nt(l,"http://www.w3.org/1999/xlink","xlink:role",e);break;case"xlinkShow":nt(l,"http://www.w3.org/1999/xlink","xlink:show",e);break;case"xlinkTitle":nt(l,"http://www.w3.org/1999/xlink","xlink:title",e);break;case"xlinkType":nt(l,"http://www.w3.org/1999/xlink","xlink:type",e);break;case"xmlBase":nt(l,"http://www.w3.org/XML/1998/namespace","xml:base",e);break;case"xmlLang":nt(l,"http://www.w3.org/XML/1998/namespace","xml:lang",e);break;case"xmlSpace":nt(l,"http://www.w3.org/XML/1998/namespace","xml:space",e);break;case"is":_u(l,"is",e);break;case"innerText":case"textContent":break;default:(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")&&(a=wm.get(a)||a,_u(l,a,e))}}function ff(l,t,a,e,u,n){switch(a){case"style":U0(l,e,n);break;case"dangerouslySetInnerHTML":if(e!=null){if(typeof e!="object"||!("__html"in e))throw Error(S(61));if(a=e.__html,a!=null){if(u.children!=null)throw Error(S(60));l.innerHTML=a}}break;case"children":typeof e=="string"?Ka(l,e):(typeof e=="number"||typeof e=="bigint")&&Ka(l,""+e);break;case"onScroll":e!=null&&C("scroll",l);break;case"onScrollEnd":e!=null&&C("scrollend",l);break;case"onClick":e!=null&&(l.onclick=yt);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!_0.hasOwnProperty(a))l:{if(a[0]==="o"&&a[1]==="n"&&(u=a.endsWith("Capture"),t=a.slice(2,u?a.length-7:void 0),n=l[Nl]||null,n=n!=null?n[a]:null,typeof n=="function"&&l.removeEventListener(t,n,u),typeof e=="function")){typeof n!="function"&&n!==null&&(a in l?l[a]=null:l.hasAttribute(a)&&l.removeAttribute(a)),l.addEventListener(t,e,u);break l}a in l?l[a]=e:e===!0?l.setAttribute(a,""):_u(l,a,e)}}}function bl(l,t,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":C("error",l),C("load",l);var e=!1,u=!1,n;for(n in a)if(a.hasOwnProperty(n)){var c=a[n];if(c!=null)switch(n){case"src":e=!0;break;case"srcSet":u=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(S(137,t));default:L(l,t,n,c,a,null)}}u&&L(l,t,"srcSet",a.srcSet,a,null),e&&L(l,t,"src",a.src,a,null);return;case"input":C("invalid",l);var f=n=c=u=null,i=null,d=null;for(e in a)if(a.hasOwnProperty(e)){var r=a[e];if(r!=null)switch(e){case"name":u=r;break;case"type":c=r;break;case"checked":i=r;break;case"defaultChecked":d=r;break;case"value":n=r;break;case"defaultValue":f=r;break;case"children":case"dangerouslySetInnerHTML":if(r!=null)throw Error(S(137,t));break;default:L(l,t,e,r,a,null)}}M0(l,n,f,i,d,c,u,!1);return;case"select":C("invalid",l),e=c=n=null;for(u in a)if(a.hasOwnProperty(u)&&(f=a[u],f!=null))switch(u){case"value":n=f;break;case"defaultValue":c=f;break;case"multiple":e=f;default:L(l,t,u,f,a,null)}t=n,a=c,l.multiple=!!e,t!=null?Ya(l,!!e,t,!1):a!=null&&Ya(l,!!e,a,!0);return;case"textarea":C("invalid",l),n=u=e=null;for(c in a)if(a.hasOwnProperty(c)&&(f=a[c],f!=null))switch(c){case"value":e=f;break;case"defaultValue":u=f;break;case"children":n=f;break;case"dangerouslySetInnerHTML":if(f!=null)throw Error(S(91));break;default:L(l,t,c,f,a,null)}j0(l,e,u,n);return;case"option":for(i in a)if(a.hasOwnProperty(i)&&(e=a[i],e!=null))switch(i){case"selected":l.selected=e&&typeof e!="function"&&typeof e!="symbol";break;default:L(l,t,i,e,a,null)}return;case"dialog":C("beforetoggle",l),C("toggle",l),C("cancel",l),C("close",l);break;case"iframe":case"object":C("load",l);break;case"video":case"audio":for(e=0;e<Le.length;e++)C(Le[e],l);break;case"image":C("error",l),C("load",l);break;case"details":C("toggle",l);break;case"embed":case"source":case"link":C("error",l),C("load",l);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(d in a)if(a.hasOwnProperty(d)&&(e=a[d],e!=null))switch(d){case"children":case"dangerouslySetInnerHTML":throw Error(S(137,t));default:L(l,t,d,e,a,null)}return;default:if(Mf(t)){for(r in a)a.hasOwnProperty(r)&&(e=a[r],e!==void 0&&ff(l,t,r,e,a,void 0));return}}for(f in a)a.hasOwnProperty(f)&&(e=a[f],e!=null&&L(l,t,f,e,a,null))}function Ev(l,t,a,e){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var u=null,n=null,c=null,f=null,i=null,d=null,r=null;for(h in a){var g=a[h];if(a.hasOwnProperty(h)&&g!=null)switch(h){case"checked":break;case"value":break;case"defaultValue":i=g;default:e.hasOwnProperty(h)||L(l,t,h,null,e,g)}}for(var m in e){var h=e[m];if(g=a[m],e.hasOwnProperty(m)&&(h!=null||g!=null))switch(m){case"type":n=h;break;case"name":u=h;break;case"checked":d=h;break;case"defaultChecked":r=h;break;case"value":c=h;break;case"defaultValue":f=h;break;case"children":case"dangerouslySetInnerHTML":if(h!=null)throw Error(S(137,t));break;default:h!==g&&L(l,t,m,h,e,g)}}Uc(l,c,f,i,d,r,n,u);return;case"select":h=c=f=m=null;for(n in a)if(i=a[n],a.hasOwnProperty(n)&&i!=null)switch(n){case"value":break;case"multiple":h=i;default:e.hasOwnProperty(n)||L(l,t,n,null,e,i)}for(u in e)if(n=e[u],i=a[u],e.hasOwnProperty(u)&&(n!=null||i!=null))switch(u){case"value":m=n;break;case"defaultValue":f=n;break;case"multiple":c=n;default:n!==i&&L(l,t,u,n,e,i)}t=f,a=c,e=h,m!=null?Ya(l,!!a,m,!1):!!e!=!!a&&(t!=null?Ya(l,!!a,t,!0):Ya(l,!!a,a?[]:"",!1));return;case"textarea":h=m=null;for(f in a)if(u=a[f],a.hasOwnProperty(f)&&u!=null&&!e.hasOwnProperty(f))switch(f){case"value":break;case"children":break;default:L(l,t,f,null,e,u)}for(c in e)if(u=e[c],n=a[c],e.hasOwnProperty(c)&&(u!=null||n!=null))switch(c){case"value":m=u;break;case"defaultValue":h=u;break;case"children":break;case"dangerouslySetInnerHTML":if(u!=null)throw Error(S(91));break;default:u!==n&&L(l,t,c,u,e,n)}D0(l,m,h);return;case"option":for(var E in a)if(m=a[E],a.hasOwnProperty(E)&&m!=null&&!e.hasOwnProperty(E))switch(E){case"selected":l.selected=!1;break;default:L(l,t,E,null,e,m)}for(i in e)if(m=e[i],h=a[i],e.hasOwnProperty(i)&&m!==h&&(m!=null||h!=null))switch(i){case"selected":l.selected=m&&typeof m!="function"&&typeof m!="symbol";break;default:L(l,t,i,m,e,h)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var T in a)m=a[T],a.hasOwnProperty(T)&&m!=null&&!e.hasOwnProperty(T)&&L(l,t,T,null,e,m);for(d in e)if(m=e[d],h=a[d],e.hasOwnProperty(d)&&m!==h&&(m!=null||h!=null))switch(d){case"children":case"dangerouslySetInnerHTML":if(m!=null)throw Error(S(137,t));break;default:L(l,t,d,m,e,h)}return;default:if(Mf(t)){for(var q in a)m=a[q],a.hasOwnProperty(q)&&m!==void 0&&!e.hasOwnProperty(q)&&ff(l,t,q,void 0,e,m);for(r in e)m=e[r],h=a[r],!e.hasOwnProperty(r)||m===h||m===void 0&&h===void 0||ff(l,t,r,m,e,h);return}}for(var o in a)m=a[o],a.hasOwnProperty(o)&&m!=null&&!e.hasOwnProperty(o)&&L(l,t,o,null,e,m);for(g in e)m=e[g],h=a[g],!e.hasOwnProperty(g)||m===h||m==null&&h==null||L(l,t,g,m,e,h)}function Ds(l){switch(l){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function zv(){if(typeof performance.getEntriesByType=="function"){for(var l=0,t=0,a=performance.getEntriesByType("resource"),e=0;e<a.length;e++){var u=a[e],n=u.transferSize,c=u.initiatorType,f=u.duration;if(n&&f&&Ds(c)){for(c=0,f=u.responseEnd,e+=1;e<a.length;e++){var i=a[e],d=i.startTime;if(d>f)break;var r=i.transferSize,g=i.initiatorType;r&&Ds(g)&&(i=i.responseEnd,c+=r*(i<f?1:(f-d)/(i-d)))}if(--e,t+=8*(n+c)/(u.duration/1e3),l++,10<l)break}}if(0<l)return t/l/1e6}return navigator.connection&&(l=navigator.connection.downlink,typeof l=="number")?l:5}var sf=null,df=null;function on(l){return l.nodeType===9?l:l.ownerDocument}function js(l){switch(l){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function Yo(l,t){if(l===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return l===1&&t==="foreignObject"?0:l}function of(l,t){return l==="textarea"||l==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Sc=null;function xv(){var l=window.event;return l&&l.type==="popstate"?l===Sc?!1:(Sc=l,!0):(Sc=null,!1)}var qo=typeof setTimeout=="function"?setTimeout:void 0,Tv=typeof clearTimeout=="function"?clearTimeout:void 0,Us=typeof Promise=="function"?Promise:void 0,Av=typeof queueMicrotask=="function"?queueMicrotask:typeof Us<"u"?function(l){return Us.resolve(null).then(l).catch(pv)}:qo;function pv(l){setTimeout(function(){throw l})}function Ft(l){return l==="head"}function Cs(l,t){var a=t,e=0;do{var u=a.nextSibling;if(l.removeChild(a),u&&u.nodeType===8)if(a=u.data,a==="/$"||a==="/&"){if(e===0){l.removeChild(u),Pa(t);return}e--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")e++;else if(a==="html")Ce(l.ownerDocument.documentElement);else if(a==="head"){a=l.ownerDocument.head,Ce(a);for(var n=a.firstChild;n;){var c=n.nextSibling,f=n.nodeName;n[Ie]||f==="SCRIPT"||f==="STYLE"||f==="LINK"&&n.rel.toLowerCase()==="stylesheet"||a.removeChild(n),n=c}}else a==="body"&&Ce(l.ownerDocument.body);a=u}while(a);Pa(t)}function Hs(l,t){var a=l;l=0;do{var e=a.nextSibling;if(a.nodeType===1?t?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(t?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),e&&e.nodeType===8)if(a=e.data,a==="/$"){if(l===0)break;l--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||l++;a=e}while(a)}function mf(l){var t=l.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var a=t;switch(t=t.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":mf(a),Of(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}l.removeChild(a)}}function _v(l,t,a,e){for(;l.nodeType===1;){var u=a;if(l.nodeName.toLowerCase()!==t.toLowerCase()){if(!e&&(l.nodeName!=="INPUT"||l.type!=="hidden"))break}else if(e){if(!l[Ie])switch(t){case"meta":if(!l.hasAttribute("itemprop"))break;return l;case"link":if(n=l.getAttribute("rel"),n==="stylesheet"&&l.hasAttribute("data-precedence"))break;if(n!==u.rel||l.getAttribute("href")!==(u.href==null||u.href===""?null:u.href)||l.getAttribute("crossorigin")!==(u.crossOrigin==null?null:u.crossOrigin)||l.getAttribute("title")!==(u.title==null?null:u.title))break;return l;case"style":if(l.hasAttribute("data-precedence"))break;return l;case"script":if(n=l.getAttribute("src"),(n!==(u.src==null?null:u.src)||l.getAttribute("type")!==(u.type==null?null:u.type)||l.getAttribute("crossorigin")!==(u.crossOrigin==null?null:u.crossOrigin))&&n&&l.hasAttribute("async")&&!l.hasAttribute("itemprop"))break;return l;default:return l}}else if(t==="input"&&l.type==="hidden"){var n=u.name==null?null:""+u.name;if(u.type==="hidden"&&l.getAttribute("name")===n)return l}else return l;if(l=$l(l.nextSibling),l===null)break}return null}function Nv(l,t,a){if(t==="")return null;for(;l.nodeType!==3;)if((l.nodeType!==1||l.nodeName!=="INPUT"||l.type!=="hidden")&&!a||(l=$l(l.nextSibling),l===null))return null;return l}function Go(l,t){for(;l.nodeType!==8;)if((l.nodeType!==1||l.nodeName!=="INPUT"||l.type!=="hidden")&&!t||(l=$l(l.nextSibling),l===null))return null;return l}function yf(l){return l.data==="$?"||l.data==="$~"}function vf(l){return l.data==="$!"||l.data==="$?"&&l.ownerDocument.readyState!=="loading"}function Ov(l,t){var a=l.ownerDocument;if(l.data==="$~")l._reactRetry=t;else if(l.data!=="$?"||a.readyState!=="loading")t();else{var e=function(){t(),a.removeEventListener("DOMContentLoaded",e)};a.addEventListener("DOMContentLoaded",e),l._reactRetry=e}}function $l(l){for(;l!=null;l=l.nextSibling){var t=l.nodeType;if(t===1||t===3)break;if(t===8){if(t=l.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return l}var hf=null;function Rs(l){l=l.nextSibling;for(var t=0;l;){if(l.nodeType===8){var a=l.data;if(a==="/$"||a==="/&"){if(t===0)return $l(l.nextSibling);t--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||t++}l=l.nextSibling}return null}function Bs(l){l=l.previousSibling;for(var t=0;l;){if(l.nodeType===8){var a=l.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(t===0)return l;t--}else a!=="/$"&&a!=="/&"||t++}l=l.previousSibling}return null}function Qo(l,t,a){switch(t=on(a),l){case"html":if(l=t.documentElement,!l)throw Error(S(452));return l;case"head":if(l=t.head,!l)throw Error(S(453));return l;case"body":if(l=t.body,!l)throw Error(S(454));return l;default:throw Error(S(451))}}function Ce(l){for(var t=l.attributes;t.length;)l.removeAttributeNode(t[0]);Of(l)}var Wl=new Map,Ys=new Set;function mn(l){return typeof l.getRootNode=="function"?l.getRootNode():l.nodeType===9?l:l.ownerDocument}var Tt=Q.d;Q.d={f:Mv,r:Dv,D:jv,C:Uv,L:Cv,m:Hv,X:Bv,S:Rv,M:Yv};function Mv(){var l=Tt.f(),t=Un();return l||t}function Dv(l){var t=ae(l);t!==null&&t.tag===5&&t.type==="form"?Ud(t):Tt.r(l)}var ce=typeof document>"u"?null:document;function Xo(l,t,a){var e=ce;if(e&&typeof t=="string"&&t){var u=Vl(t);u='link[rel="'+l+'"][href="'+u+'"]',typeof a=="string"&&(u+='[crossorigin="'+a+'"]'),Ys.has(u)||(Ys.add(u),l={rel:l,crossOrigin:a,href:t},e.querySelector(u)===null&&(t=e.createElement("link"),bl(t,"link",l),ml(t),e.head.appendChild(t)))}}function jv(l){Tt.D(l),Xo("dns-prefetch",l,null)}function Uv(l,t){Tt.C(l,t),Xo("preconnect",l,t)}function Cv(l,t,a){Tt.L(l,t,a);var e=ce;if(e&&l&&t){var u='link[rel="preload"][as="'+Vl(t)+'"]';t==="image"&&a&&a.imageSrcSet?(u+='[imagesrcset="'+Vl(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(u+='[imagesizes="'+Vl(a.imageSizes)+'"]')):u+='[href="'+Vl(l)+'"]';var n=u;switch(t){case"style":n=Ia(l);break;case"script":n=fe(l)}Wl.has(n)||(l=k({rel:"preload",href:t==="image"&&a&&a.imageSrcSet?void 0:l,as:t},a),Wl.set(n,l),e.querySelector(u)!==null||t==="style"&&e.querySelector(uu(n))||t==="script"&&e.querySelector(nu(n))||(t=e.createElement("link"),bl(t,"link",l),ml(t),e.head.appendChild(t)))}}function Hv(l,t){Tt.m(l,t);var a=ce;if(a&&l){var e=t&&typeof t.as=="string"?t.as:"script",u='link[rel="modulepreload"][as="'+Vl(e)+'"][href="'+Vl(l)+'"]',n=u;switch(e){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":n=fe(l)}if(!Wl.has(n)&&(l=k({rel:"modulepreload",href:l},t),Wl.set(n,l),a.querySelector(u)===null)){switch(e){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(nu(n)))return}e=a.createElement("link"),bl(e,"link",l),ml(e),a.head.appendChild(e)}}}function Rv(l,t,a){Tt.S(l,t,a);var e=ce;if(e&&l){var u=Ba(e).hoistableStyles,n=Ia(l);t=t||"default";var c=u.get(n);if(!c){var f={loading:0,preload:null};if(c=e.querySelector(uu(n)))f.loading=5;else{l=k({rel:"stylesheet",href:l,"data-precedence":t},a),(a=Wl.get(n))&&yi(l,a);var i=c=e.createElement("link");ml(i),bl(i,"link",l),i._p=new Promise(function(d,r){i.onload=d,i.onerror=r}),i.addEventListener("load",function(){f.loading|=1}),i.addEventListener("error",function(){f.loading|=2}),f.loading|=4,Yu(c,t,e)}c={type:"stylesheet",instance:c,count:1,state:f},u.set(n,c)}}}function Bv(l,t){Tt.X(l,t);var a=ce;if(a&&l){var e=Ba(a).hoistableScripts,u=fe(l),n=e.get(u);n||(n=a.querySelector(nu(u)),n||(l=k({src:l,async:!0},t),(t=Wl.get(u))&&vi(l,t),n=a.createElement("script"),ml(n),bl(n,"link",l),a.head.appendChild(n)),n={type:"script",instance:n,count:1,state:null},e.set(u,n))}}function Yv(l,t){Tt.M(l,t);var a=ce;if(a&&l){var e=Ba(a).hoistableScripts,u=fe(l),n=e.get(u);n||(n=a.querySelector(nu(u)),n||(l=k({src:l,async:!0,type:"module"},t),(t=Wl.get(u))&&vi(l,t),n=a.createElement("script"),ml(n),bl(n,"link",l),a.head.appendChild(n)),n={type:"script",instance:n,count:1,state:null},e.set(u,n))}}function qs(l,t,a,e){var u=(u=Yt.current)?mn(u):null;if(!u)throw Error(S(446));switch(l){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(t=Ia(a.href),a=Ba(u).hoistableStyles,e=a.get(t),e||(e={type:"style",instance:null,count:0,state:null},a.set(t,e)),e):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){l=Ia(a.href);var n=Ba(u).hoistableStyles,c=n.get(l);if(c||(u=u.ownerDocument||u,c={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},n.set(l,c),(n=u.querySelector(uu(l)))&&!n._p&&(c.instance=n,c.state.loading=5),Wl.has(l)||(a={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},Wl.set(l,a),n||qv(u,l,a,c.state))),t&&e===null)throw Error(S(528,""));return c}if(t&&e!==null)throw Error(S(529,""));return null;case"script":return t=a.async,a=a.src,typeof a=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(t=fe(a),a=Ba(u).hoistableScripts,e=a.get(t),e||(e={type:"script",instance:null,count:0,state:null},a.set(t,e)),e):{type:"void",instance:null,count:0,state:null};default:throw Error(S(444,l))}}function Ia(l){return'href="'+Vl(l)+'"'}function uu(l){return'link[rel="stylesheet"]['+l+"]"}function Zo(l){return k({},l,{"data-precedence":l.precedence,precedence:null})}function qv(l,t,a,e){l.querySelector('link[rel="preload"][as="style"]['+t+"]")?e.loading=1:(t=l.createElement("link"),e.preload=t,t.addEventListener("load",function(){return e.loading|=1}),t.addEventListener("error",function(){return e.loading|=2}),bl(t,"link",a),ml(t),l.head.appendChild(t))}function fe(l){return'[src="'+Vl(l)+'"]'}function nu(l){return"script[async]"+l}function Gs(l,t,a){if(t.count++,t.instance===null)switch(t.type){case"style":var e=l.querySelector('style[data-href~="'+Vl(a.href)+'"]');if(e)return t.instance=e,ml(e),e;var u=k({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return e=(l.ownerDocument||l).createElement("style"),ml(e),bl(e,"style",u),Yu(e,a.precedence,l),t.instance=e;case"stylesheet":u=Ia(a.href);var n=l.querySelector(uu(u));if(n)return t.state.loading|=4,t.instance=n,ml(n),n;e=Zo(a),(u=Wl.get(u))&&yi(e,u),n=(l.ownerDocument||l).createElement("link"),ml(n);var c=n;return c._p=new Promise(function(f,i){c.onload=f,c.onerror=i}),bl(n,"link",e),t.state.loading|=4,Yu(n,a.precedence,l),t.instance=n;case"script":return n=fe(a.src),(u=l.querySelector(nu(n)))?(t.instance=u,ml(u),u):(e=a,(u=Wl.get(n))&&(e=k({},a),vi(e,u)),l=l.ownerDocument||l,u=l.createElement("script"),ml(u),bl(u,"link",e),l.head.appendChild(u),t.instance=u);case"void":return null;default:throw Error(S(443,t.type))}else t.type==="stylesheet"&&!(t.state.loading&4)&&(e=t.instance,t.state.loading|=4,Yu(e,a.precedence,l));return t.instance}function Yu(l,t,a){for(var e=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),u=e.length?e[e.length-1]:null,n=u,c=0;c<e.length;c++){var f=e[c];if(f.dataset.precedence===t)n=f;else if(n!==u)break}n?n.parentNode.insertBefore(l,n.nextSibling):(t=a.nodeType===9?a.head:a,t.insertBefore(l,t.firstChild))}function yi(l,t){l.crossOrigin==null&&(l.crossOrigin=t.crossOrigin),l.referrerPolicy==null&&(l.referrerPolicy=t.referrerPolicy),l.title==null&&(l.title=t.title)}function vi(l,t){l.crossOrigin==null&&(l.crossOrigin=t.crossOrigin),l.referrerPolicy==null&&(l.referrerPolicy=t.referrerPolicy),l.integrity==null&&(l.integrity=t.integrity)}var qu=null;function Qs(l,t,a){if(qu===null){var e=new Map,u=qu=new Map;u.set(a,e)}else u=qu,e=u.get(a),e||(e=new Map,u.set(a,e));if(e.has(l))return e;for(e.set(l,null),a=a.getElementsByTagName(l),u=0;u<a.length;u++){var n=a[u];if(!(n[Ie]||n[hl]||l==="link"&&n.getAttribute("rel")==="stylesheet")&&n.namespaceURI!=="http://www.w3.org/2000/svg"){var c=n.getAttribute(t)||"";c=l+c;var f=e.get(c);f?f.push(n):e.set(c,[n])}}return e}function Xs(l,t,a){l=l.ownerDocument||l,l.head.insertBefore(a,t==="title"?l.querySelector("head > title"):null)}function Gv(l,t,a){if(a===1||t.itemProp!=null)return!1;switch(l){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;switch(t.rel){case"stylesheet":return l=t.disabled,typeof t.precedence=="string"&&l==null;default:return!0}case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function Lo(l){return!(l.type==="stylesheet"&&!(l.state.loading&3))}function Qv(l,t,a,e){if(a.type==="stylesheet"&&(typeof e.media!="string"||matchMedia(e.media).matches!==!1)&&!(a.state.loading&4)){if(a.instance===null){var u=Ia(e.href),n=t.querySelector(uu(u));if(n){t=n._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(l.count++,l=yn.bind(l),t.then(l,l)),a.state.loading|=4,a.instance=n,ml(n);return}n=t.ownerDocument||t,e=Zo(e),(u=Wl.get(u))&&yi(e,u),n=n.createElement("link"),ml(n);var c=n;c._p=new Promise(function(f,i){c.onload=f,c.onerror=i}),bl(n,"link",e),a.instance=n}l.stylesheets===null&&(l.stylesheets=new Map),l.stylesheets.set(a,t),(t=a.state.preload)&&!(a.state.loading&3)&&(l.count++,a=yn.bind(l),t.addEventListener("load",a),t.addEventListener("error",a))}}var Ec=0;function Xv(l,t){return l.stylesheets&&l.count===0&&Gu(l,l.stylesheets),0<l.count||0<l.imgCount?function(a){var e=setTimeout(function(){if(l.stylesheets&&Gu(l,l.stylesheets),l.unsuspend){var n=l.unsuspend;l.unsuspend=null,n()}},6e4+t);0<l.imgBytes&&Ec===0&&(Ec=62500*zv());var u=setTimeout(function(){if(l.waitingForImages=!1,l.count===0&&(l.stylesheets&&Gu(l,l.stylesheets),l.unsuspend)){var n=l.unsuspend;l.unsuspend=null,n()}},(l.imgBytes>Ec?50:800)+t);return l.unsuspend=a,function(){l.unsuspend=null,clearTimeout(e),clearTimeout(u)}}:null}function yn(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Gu(this,this.stylesheets);else if(this.unsuspend){var l=this.unsuspend;this.unsuspend=null,l()}}}var vn=null;function Gu(l,t){l.stylesheets=null,l.unsuspend!==null&&(l.count++,vn=new Map,t.forEach(Zv,l),vn=null,yn.call(l))}function Zv(l,t){if(!(t.state.loading&4)){var a=vn.get(l);if(a)var e=a.get(null);else{a=new Map,vn.set(l,a);for(var u=l.querySelectorAll("link[data-precedence],style[data-precedence]"),n=0;n<u.length;n++){var c=u[n];(c.nodeName==="LINK"||c.getAttribute("media")!=="not all")&&(a.set(c.dataset.precedence,c),e=c)}e&&a.set(null,e)}u=t.instance,c=u.getAttribute("data-precedence"),n=a.get(c)||e,n===e&&a.set(null,u),a.set(c,u),this.count++,e=yn.bind(this),u.addEventListener("load",e),u.addEventListener("error",e),n?n.parentNode.insertBefore(u,n.nextSibling):(l=l.nodeType===9?l.head:l,l.insertBefore(u,l.firstChild)),t.state.loading|=4}}var Ke={$$typeof:mt,Provider:null,Consumer:null,_currentValue:ua,_currentValue2:ua,_threadCount:0};function Lv(l,t,a,e,u,n,c,f,i){this.tag=1,this.containerInfo=l,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Ln(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Ln(0),this.hiddenUpdates=Ln(null),this.identifierPrefix=e,this.onUncaughtError=u,this.onCaughtError=n,this.onRecoverableError=c,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=i,this.incompleteTransitions=new Map}function Vo(l,t,a,e,u,n,c,f,i,d,r,g){return l=new Lv(l,t,a,c,i,d,r,g,f),t=1,n===!0&&(t|=24),n=jl(3,null,null,t),l.current=n,n.stateNode=l,t=Qf(),t.refCount++,l.pooledCache=t,t.refCount++,n.memoizedState={element:e,isDehydrated:a,cache:t},Lf(n),l}function Ko(l){return l?(l=Ua,l):Ua}function Jo(l,t,a,e,u,n){u=Ko(u),e.context===null?e.context=u:e.pendingContext=u,e=Gt(t),e.payload={element:a},n=n===void 0?null:n,n!==null&&(e.callback=n),a=Qt(l,e,t),a!==null&&(_l(a,l,t),pe(a,l,t))}function Zs(l,t){if(l=l.memoizedState,l!==null&&l.dehydrated!==null){var a=l.retryLane;l.retryLane=a!==0&&a<t?a:t}}function hi(l,t){Zs(l,t),(l=l.alternate)&&Zs(l,t)}function wo(l){if(l.tag===13||l.tag===31){var t=ga(l,67108864);t!==null&&_l(t,l,67108864),hi(l,67108864)}}function Ls(l){if(l.tag===13||l.tag===31){var t=Bl();t=_f(t);var a=ga(l,t);a!==null&&_l(a,l,t),hi(l,t)}}var hn=!0;function Vv(l,t,a,e){var u=p.T;p.T=null;var n=Q.p;try{Q.p=2,ri(l,t,a,e)}finally{Q.p=n,p.T=u}}function Kv(l,t,a,e){var u=p.T;p.T=null;var n=Q.p;try{Q.p=8,ri(l,t,a,e)}finally{Q.p=n,p.T=u}}function ri(l,t,a,e){if(hn){var u=rf(e);if(u===null)bc(l,t,e,rn,a),Vs(l,e);else if(wv(u,l,t,a,e))e.stopPropagation();else if(Vs(l,e),t&4&&-1<Jv.indexOf(l)){for(;u!==null;){var n=ae(u);if(n!==null)switch(n.tag){case 3:if(n=n.stateNode,n.current.memoizedState.isDehydrated){var c=ta(n.pendingLanes);if(c!==0){var f=n;for(f.pendingLanes|=2,f.entangledLanes|=2;c;){var i=1<<31-Rl(c);f.entanglements[1]|=i,c&=~i}ut(n),!(G&6)&&(un=Cl()+500,eu(0))}}break;case 31:case 13:f=ga(n,2),f!==null&&_l(f,n,2),Un(),hi(n,2)}if(n=rf(e),n===null&&bc(l,t,e,rn,a),n===u)break;u=n}u!==null&&e.stopPropagation()}else bc(l,t,e,null,a)}}function rf(l){return l=Df(l),gi(l)}var rn=null;function gi(l){if(rn=null,l=_a(l),l!==null){var t=$e(l);if(t===null)l=null;else{var a=t.tag;if(a===13){if(l=m0(t),l!==null)return l;l=null}else if(a===31){if(l=y0(t),l!==null)return l;l=null}else if(a===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;l=null}else t!==l&&(l=null)}}return rn=l,null}function $o(l){switch(l){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(jm()){case g0:return 2;case b0:return 8;case Vu:case Um:return 32;case S0:return 268435456;default:return 32}default:return 32}}var gf=!1,Lt=null,Vt=null,Kt=null,Je=new Map,we=new Map,jt=[],Jv="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function Vs(l,t){switch(l){case"focusin":case"focusout":Lt=null;break;case"dragenter":case"dragleave":Vt=null;break;case"mouseover":case"mouseout":Kt=null;break;case"pointerover":case"pointerout":Je.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":we.delete(t.pointerId)}}function ve(l,t,a,e,u,n){return l===null||l.nativeEvent!==n?(l={blockedOn:t,domEventName:a,eventSystemFlags:e,nativeEvent:n,targetContainers:[u]},t!==null&&(t=ae(t),t!==null&&wo(t)),l):(l.eventSystemFlags|=e,t=l.targetContainers,u!==null&&t.indexOf(u)===-1&&t.push(u),l)}function wv(l,t,a,e,u){switch(t){case"focusin":return Lt=ve(Lt,l,t,a,e,u),!0;case"dragenter":return Vt=ve(Vt,l,t,a,e,u),!0;case"mouseover":return Kt=ve(Kt,l,t,a,e,u),!0;case"pointerover":var n=u.pointerId;return Je.set(n,ve(Je.get(n)||null,l,t,a,e,u)),!0;case"gotpointercapture":return n=u.pointerId,we.set(n,ve(we.get(n)||null,l,t,a,e,u)),!0}return!1}function Wo(l){var t=_a(l.target);if(t!==null){var a=$e(t);if(a!==null){if(t=a.tag,t===13){if(t=m0(a),t!==null){l.blockedOn=t,Oi(l.priority,function(){Ls(a)});return}}else if(t===31){if(t=y0(a),t!==null){l.blockedOn=t,Oi(l.priority,function(){Ls(a)});return}}else if(t===3&&a.stateNode.current.memoizedState.isDehydrated){l.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}l.blockedOn=null}function Qu(l){if(l.blockedOn!==null)return!1;for(var t=l.targetContainers;0<t.length;){var a=rf(l.nativeEvent);if(a===null){a=l.nativeEvent;var e=new a.constructor(a.type,a);Hc=e,a.target.dispatchEvent(e),Hc=null}else return t=ae(a),t!==null&&wo(t),l.blockedOn=a,!1;t.shift()}return!0}function Ks(l,t,a){Qu(l)&&a.delete(t)}function $v(){gf=!1,Lt!==null&&Qu(Lt)&&(Lt=null),Vt!==null&&Qu(Vt)&&(Vt=null),Kt!==null&&Qu(Kt)&&(Kt=null),Je.forEach(Ks),we.forEach(Ks)}function xu(l,t){l.blockedOn===t&&(l.blockedOn=null,gf||(gf=!0,sl.unstable_scheduleCallback(sl.unstable_NormalPriority,$v)))}var Tu=null;function Js(l){Tu!==l&&(Tu=l,sl.unstable_scheduleCallback(sl.unstable_NormalPriority,function(){Tu===l&&(Tu=null);for(var t=0;t<l.length;t+=3){var a=l[t],e=l[t+1],u=l[t+2];if(typeof e!="function"){if(gi(e||a)===null)continue;break}var n=ae(a);n!==null&&(l.splice(t,3),t-=3,kc(n,{pending:!0,data:u,method:a.method,action:e},e,u))}}))}function Pa(l){function t(i){return xu(i,l)}Lt!==null&&xu(Lt,l),Vt!==null&&xu(Vt,l),Kt!==null&&xu(Kt,l),Je.forEach(t),we.forEach(t);for(var a=0;a<jt.length;a++){var e=jt[a];e.blockedOn===l&&(e.blockedOn=null)}for(;0<jt.length&&(a=jt[0],a.blockedOn===null);)Wo(a),a.blockedOn===null&&jt.shift();if(a=(l.ownerDocument||l).$$reactFormReplay,a!=null)for(e=0;e<a.length;e+=3){var u=a[e],n=a[e+1],c=u[Nl]||null;if(typeof n=="function")c||Js(a);else if(c){var f=null;if(n&&n.hasAttribute("formAction")){if(u=n,c=n[Nl]||null)f=c.formAction;else if(gi(u)!==null)continue}else f=c.action;typeof f=="function"?a[e+1]=f:(a.splice(e,3),e-=3),Js(a)}}}function ko(){function l(n){n.canIntercept&&n.info==="react-transition"&&n.intercept({handler:function(){return new Promise(function(c){return u=c})},focusReset:"manual",scroll:"manual"})}function t(){u!==null&&(u(),u=null),e||setTimeout(a,20)}function a(){if(!e&&!navigation.transition){var n=navigation.currentEntry;n&&n.url!=null&&navigation.navigate(n.url,{state:n.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var e=!1,u=null;return navigation.addEventListener("navigate",l),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(a,100),function(){e=!0,navigation.removeEventListener("navigate",l),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),u!==null&&(u(),u=null)}}}function bi(l){this._internalRoot=l}Rn.prototype.render=bi.prototype.render=function(l){var t=this._internalRoot;if(t===null)throw Error(S(409));var a=t.current,e=Bl();Jo(a,e,l,t,null,null)};Rn.prototype.unmount=bi.prototype.unmount=function(){var l=this._internalRoot;if(l!==null){this._internalRoot=null;var t=l.containerInfo;Jo(l.current,2,null,l,null,null),Un(),t[te]=null}};function Rn(l){this._internalRoot=l}Rn.prototype.unstable_scheduleHydration=function(l){if(l){var t=A0();l={blockedOn:null,target:l,priority:t};for(var a=0;a<jt.length&&t!==0&&t<jt[a].priority;a++);jt.splice(a,0,l),a===0&&Wo(l)}};var ws=d0.version;if(ws!=="19.2.8")throw Error(S(527,ws,"19.2.8"));Q.findDOMNode=function(l){var t=l._reactInternals;if(t===void 0)throw typeof l.render=="function"?Error(S(188)):(l=Object.keys(l).join(","),Error(S(268,l)));return l=Am(t),l=l!==null?v0(l):null,l=l===null?null:l.stateNode,l};var Wv={bundleType:0,version:"19.2.8",rendererPackageName:"react-dom",currentDispatcherRef:p,reconcilerVersion:"19.2.8"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Au=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Au.isDisabled&&Au.supportsFiber)try{We=Au.inject(Wv),Hl=Au}catch{}}bn.createRoot=function(l,t){if(!o0(l))throw Error(S(299));var a=!1,e="",u=Qd,n=Xd,c=Zd;return t!=null&&(t.unstable_strictMode===!0&&(a=!0),t.identifierPrefix!==void 0&&(e=t.identifierPrefix),t.onUncaughtError!==void 0&&(u=t.onUncaughtError),t.onCaughtError!==void 0&&(n=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=Vo(l,1,!1,null,null,a,e,null,u,n,c,ko),l[te]=t.current,mi(l),new bi(t)};bn.hydrateRoot=function(l,t,a){if(!o0(l))throw Error(S(299));var e=!1,u="",n=Qd,c=Xd,f=Zd,i=null;return a!=null&&(a.unstable_strictMode===!0&&(e=!0),a.identifierPrefix!==void 0&&(u=a.identifierPrefix),a.onUncaughtError!==void 0&&(n=a.onUncaughtError),a.onCaughtError!==void 0&&(c=a.onCaughtError),a.onRecoverableError!==void 0&&(f=a.onRecoverableError),a.formState!==void 0&&(i=a.formState)),t=Vo(l,1,!0,t,a??null,e,u,i,n,c,f,ko),t.context=Ko(null),a=t.current,e=Bl(),e=_f(e),u=Gt(e),u.callback=null,Qt(a,u,e),a=e,t.current.lanes=a,Fe(t,a),ut(t),l[te]=t.current,mi(l),new Rn(t)};bn.version="19.2.8";function Fo(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Fo)}catch(l){console.error(l)}}Fo(),u0.exports=bn;var kv=u0.exports;const Fv=$s(kv);async function Iv(){const t=await(await fetch("/api/db/clients")).json();return t.success?t.data:[]}async function Pv(){const t=await(await fetch("/api/db/logs")).json();return t.success?t.data:[]}async function lh(){return(await(await fetch("/api/db/logs",{method:"DELETE"})).json()).success}async function th(l){return(await(await fetch(`/api/db/clients/${l}`,{method:"DELETE"})).json()).success}function ah(){const[l,t]=tl.useState([]),[a,e]=tl.useState([]),u=tl.useCallback(async()=>{try{const i=await Iv();t(i)}catch{}},[]),n=tl.useCallback(async()=>{try{const i=await Pv();e(i)}catch{}},[]),c=tl.useCallback(async()=>confirm("데이터베이스 내의 모든 크롤링 수집 로그를 완전 소거하시겠습니까?")&&await lh()?(alert("데이터베이스의 모든 수집 로그가 일괄 소거되었습니다."),await n(),!0):!1,[n]),f=tl.useCallback(async i=>confirm(`대상 클라이언트 [${i}]를 강제 정화 격리하시겠습니까?`)&&await th(i)?(alert("지정된 클라이언트 기기가 완전히 차단 제거되었습니다."),await u(),await n(),!0):!1,[u,n]);return{clients:l,logs:a,setLogs:e,loadClients:u,loadLogs:n,executeClearLogs:c,executePurgeClient:f}}function eh(){const l="ws://localhost:9600?clientId=admin-main&clientType=admin";return new WebSocket(l)}function uh(l,t,a,e){if(!l||l.readyState!==WebSocket.OPEN)return!1;const u={senderId:"admin-main",targetId:t,action:a,payload:e};return l.send(JSON.stringify(u)),!0}function nh(l,t){const[a,e]=tl.useState("DISCONNECTED"),u=tl.useRef(null);tl.useEffect(()=>{const c=eh();return u.current=c,c.onopen=()=>{e("CONNECTED"),t&&t()},c.onmessage=f=>{try{const i=JSON.parse(f.data);i.action==="CRAWL_LOG"&&l(d=>[{id:Date.now(),client_id:i.senderId,log_message:JSON.stringify(i.payload),timestamp:Date.now()},...d])}catch{}},c.onclose=()=>{e("DISCONNECTED")},()=>{c.close()}},[l,t]);const n=tl.useCallback((c,f,i)=>{try{const d=JSON.parse(i);return uh(u.current,c,f,d)?(alert(`명령 송출 완료 [대상: ${c}] [지시: ${f}]`),!0):(alert("통신 채널이 오프라인 상태입니다."),!1)}catch{return alert("페이로드 데이터가 올바른 JSON 포맷이 아닙니다."),!1}},[]);return{wsStatus:a,dispatchCommand:n}}function ch(){const[l,t]=tl.useState(!1),[a,e]=tl.useState("Default-Crawler-Cluster");return v.jsxs("div",{className:"relative select-none",children:[v.jsxs("button",{onClick:()=>t(u=>!u),className:"flex items-center gap-2 bg-slate-900/70 hover:bg-slate-800 px-3 py-1 rounded text-xs text-white border border-slate-700 transition",children:[v.jsx("span",{className:"material-symbols-outlined text-sm",children:"workspace_premium"}),v.jsx("span",{className:"font-semibold",children:a}),v.jsx("span",{className:"material-symbols-outlined text-[10px]",children:"expand_more"})]}),l&&v.jsxs("div",{className:"absolute top-full left-0 mt-1 w-64 bg-[#111827] shadow-lg border border-slate-700 rounded text-xs text-slate-100 z-50",children:[v.jsx("div",{className:"px-3 py-2 text-[10px] font-bold text-slate-500 uppercase",children:"프로젝트 선택"}),v.jsxs("button",{onClick:()=>{e("Default-Crawler-Cluster"),t(!1)},className:"w-full text-left px-3 py-2 hover:bg-slate-800 flex justify-between items-center",children:[v.jsx("span",{children:"Default-Crawler-Cluster"}),a==="Default-Crawler-Cluster"&&v.jsx("span",{className:"text-[#1A73E8] text-[10px]",children:"✓ 선택됨"})]}),v.jsxs("button",{onClick:()=>{e("Staging-Crawler-Cluster"),t(!1)},className:"w-full text-left px-3 py-2 hover:bg-slate-800 flex justify-between items-center text-slate-300",children:[v.jsx("span",{children:"Staging-Crawler-Cluster"}),a==="Staging-Crawler-Cluster"&&v.jsx("span",{className:"text-[#1A73E8] text-[10px]",children:"✓ 선택됨"})]})]})]})}function fh(){return v.jsx("div",{className:"hidden md:flex items-center flex-1 max-w-md mx-4 select-none",children:v.jsxs("div",{className:"relative w-full",children:[v.jsx("span",{className:"absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-sm",children:v.jsx("span",{className:"material-symbols-outlined",children:"search"})}),v.jsx("input",{type:"text",placeholder:"노드, 로그, 액션을 검색하세요",className:"w-full pl-11 pr-3 py-2 bg-[#1E293B] border border-slate-700 rounded shadow-sm text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition"})]})})}function ih({wsStatus:l,onRefresh:t}){return v.jsxs("div",{className:"flex items-center gap-2 select-none",children:[v.jsxs("div",{className:"flex items-center gap-2 bg-slate-900/70 px-3 py-2 rounded border border-slate-700 text-sm text-white",children:[v.jsx("span",{className:`h-2.5 w-2.5 rounded-full ${l==="CONNECTED"?"bg-emerald-300 animate-pulse":"bg-rose-300"}`}),v.jsx("span",{children:l==="CONNECTED"?"연결됨":"연결 끊김"})]}),v.jsx("button",{onClick:t,className:"p-2 bg-slate-900/70 hover:bg-slate-800 rounded transition text-white",title:"데이터 새로고침",children:v.jsx("span",{className:"material-symbols-outlined",children:"refresh"})}),v.jsx("div",{className:"w-8 h-8 rounded-full bg-slate-900/70 border border-slate-700 flex items-center justify-center font-semibold text-sm text-white ml-1",children:"A"})]})}function sh({wsStatus:l,onToggleSidebar:t,onRefresh:a}){return v.jsxs("header",{className:"h-14 bg-[#0F172A] text-white flex items-center justify-between px-4 select-none shadow-sm z-50",children:[v.jsxs("div",{className:"flex items-center gap-3",children:[v.jsx("button",{onClick:t,className:"p-2 hover:bg-blue-600/90 rounded transition text-white",title:"네비게이션 메뉴",children:v.jsx("span",{className:"material-symbols-outlined text-lg",children:"menu"})}),v.jsxs("div",{className:"flex items-center gap-2 font-medium text-sm tracking-tight pr-3 border-r border-blue-300/20",children:[v.jsx("span",{className:"bg-slate-900/70 text-[#1A73E8] font-black text-xs px-2 py-1 rounded",children:"GCP"}),v.jsx("span",{children:"WebCrawlServer 관리자"})]}),v.jsx(ch,{})]}),v.jsx(fh,{}),v.jsx(ih,{wsStatus:l,onRefresh:a})]})}function dh({activeTab:l,onRefresh:t,onClearLogs:a}){const e=()=>l==="clients"?"수집 노드 관리":l==="console"?"원격 지시 콘솔":"수집 로그 확인";return v.jsxs("div",{className:"h-12 bg-[#161C27] border-b border-slate-800 px-5 flex items-center justify-between text-sm text-slate-200 select-none shadow-sm",children:[v.jsxs("div",{className:"flex items-center gap-2 font-medium",children:[v.jsx("span",{className:"text-slate-500",children:"WebCrawlServer"}),v.jsx("span",{className:"text-slate-300",children:"›"}),v.jsx("span",{className:"text-slate-500",children:"관리자 대시보드"}),v.jsx("span",{className:"text-slate-300",children:"›"}),v.jsx("span",{className:"text-[#1A73E8] font-semibold",children:e()})]}),v.jsxs("div",{className:"flex items-center gap-2",children:[v.jsxs("button",{onClick:t,className:"flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-100 transition",children:[v.jsx("span",{className:"material-symbols-outlined",children:"refresh"}),v.jsx("span",{children:"새로고침"})]}),l==="logs"&&v.jsxs("button",{onClick:a,className:"flex items-center gap-2 px-3 py-2 bg-red-700/20 hover:bg-red-700/30 rounded text-red-200 transition border border-red-700/30",children:[v.jsx("span",{className:"material-symbols-outlined",children:"delete"}),v.jsx("span",{children:"로그 삭제"})]})]})]})}function oh({isCollapsed:l,onToggleCollapse:t,activeTab:a,onSelectTab:e,clientCount:u}){return v.jsxs("aside",{className:`bg-[#111827] border-r border-slate-800 flex flex-col justify-between transition-all duration-200 select-none shadow-sm ${l?"w-20":"w-64"}`,children:[v.jsxs("div",{className:"flex flex-col py-4",children:[v.jsxs("button",{onClick:()=>e("clients"),className:`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${a==="clients"?"bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]":"text-slate-300 hover:bg-slate-900"}`,children:[v.jsx("span",{className:"material-symbols-outlined",children:"dashboard"}),!l&&v.jsxs("div",{className:"flex justify-between items-center w-full",children:[v.jsx("span",{children:"수집 노드 관리"}),v.jsx("span",{className:"bg-slate-900/70 text-slate-300 text-[10px] px-2 py-0.5 rounded-full border border-slate-800",children:u})]})]}),v.jsxs("button",{onClick:()=>e("console"),className:`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${a==="console"?"bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]":"text-slate-300 hover:bg-slate-900"}`,children:[v.jsx("span",{className:"material-symbols-outlined",children:"send_to_mobile"}),!l&&v.jsx("span",{children:"원격 지시 콘솔"})]}),v.jsxs("button",{onClick:()=>e("logs"),className:`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${a==="logs"?"bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]":"text-slate-300 hover:bg-slate-900"}`,children:[v.jsx("span",{className:"material-symbols-outlined",children:"article"}),!l&&v.jsx("span",{children:"수집 로그"})]})]}),v.jsx("div",{className:"border-t border-slate-800 p-3",children:v.jsxs("button",{onClick:t,className:"w-full flex items-center justify-center gap-2 p-2 text-slate-300 hover:bg-slate-900 rounded text-sm transition",children:[v.jsx("span",{className:"material-symbols-outlined text-base",children:l?"chevron_right":"chevron_left"}),!l&&"사이드바 접기"]})})]})}function mh({children:l,wsStatus:t,clientCount:a,activeTab:e,onSelectTab:u,onRefresh:n,onClearLogs:c}){const[f,i]=tl.useState(!1);return v.jsxs("div",{className:"min-h-screen bg-[#141A23] text-slate-100 flex flex-col font-sans select-none",children:[v.jsx(sh,{wsStatus:t,onToggleSidebar:()=>i(d=>!d),onRefresh:n}),v.jsx(dh,{activeTab:e,onRefresh:n,onClearLogs:c}),v.jsxs("div",{className:"flex-1 flex overflow-hidden",children:[v.jsx(oh,{isCollapsed:f,onToggleCollapse:()=>i(d=>!d),activeTab:e,onSelectTab:u,clientCount:a}),v.jsx("main",{className:"flex-1 p-6 overflow-y-auto bg-[#161C27]",children:l})]})]})}function pu({title:l,value:t,subValue:a,valueColorClass:e="text-white"}){return v.jsxs("div",{className:"bg-[#202124] border border-gray-800 rounded p-3 flex flex-col justify-between shadow-sm",children:[v.jsx("div",{className:"text-[11px] font-medium text-gray-400",children:l}),v.jsxs("div",{className:"flex items-baseline justify-between mt-2",children:[v.jsx("div",{className:`text-2xl font-bold font-mono ${e}`,children:t}),v.jsx("div",{className:"text-[10px] text-gray-400",children:a})]})]})}function yh({clientCount:l,logCount:t}){return v.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 select-none",children:[v.jsx(pu,{title:"ACTIVE CRAWLER NODES",value:l,subValue:"● Online Status",valueColorClass:"text-green-400"}),v.jsx(pu,{title:"TOTAL CRAWLED LOGS",value:t,subValue:"Rows in SQLite",valueColorClass:"text-yellow-400"}),v.jsx(pu,{title:"DATABASE JOURNAL MODE",value:"WAL Mode",subValue:"better-sqlite3",valueColorClass:"text-blue-400"}),v.jsx(pu,{title:"NETWORK PORT BINDING",value:"Port 9600",subValue:"HTTP/WS Shared",valueColorClass:"text-green-400"})]})}function vh({clients:l,onSelectTarget:t,onPurgeClient:a}){return v.jsxs("div",{className:"bg-[#202124] border border-gray-800 rounded shadow-sm overflow-hidden select-text",children:[v.jsx("div",{className:"px-4 py-3 border-b border-gray-800 flex justify-between items-center bg-[#28292c]",children:v.jsxs("span",{className:"font-bold text-xs text-gray-200 tracking-wide uppercase",children:["Crawler Node Instances (",l.length,")"]})}),v.jsxs("div",{className:"overflow-x-auto",children:[v.jsxs("table",{className:"w-full text-left border-collapse text-xs",children:[v.jsx("thead",{children:v.jsxs("tr",{className:"bg-[#111827] text-slate-300 border-b border-slate-800 text-[11px] font-semibold",children:[v.jsx("th",{className:"p-3 w-10 text-center",children:"#"}),v.jsx("th",{className:"p-3",children:"노드 ID"}),v.jsx("th",{className:"p-3",children:"클라이언트 타입"}),v.jsx("th",{className:"p-3",children:"상태"}),v.jsx("th",{className:"p-3",children:"연결 시간"}),v.jsx("th",{className:"p-3 text-right",children:"작업"})]})}),v.jsx("tbody",{className:"divide-y divide-gray-800 text-gray-200 font-mono",children:l.map(e=>v.jsxs("tr",{className:"hover:bg-[#2d2e31] transition",children:[v.jsx("td",{className:"p-3 text-center text-slate-400",children:e.client_id.slice(0,4)}),v.jsx("td",{className:"p-3 font-semibold text-slate-100 select-text break-all",children:e.client_id}),v.jsx("td",{className:"p-3",children:v.jsx("span",{className:"bg-slate-800 text-slate-200 text-[10px] px-2 py-0.5 rounded border border-slate-700",children:e.client_type})}),v.jsx("td",{className:"p-3",children:v.jsxs("span",{className:"inline-flex items-center gap-2 bg-emerald-900/40 text-emerald-300 text-[11px] px-2 py-1 rounded border border-emerald-700/40",children:[v.jsx("span",{className:"h-2.5 w-2.5 rounded-full bg-emerald-400"}),"연결됨"]})}),v.jsx("td",{className:"p-3 text-slate-500 text-[12px]",children:new Date(parseInt(e.connected_at)||Date.now()).toLocaleString()}),v.jsx("td",{className:"p-3 text-right",children:v.jsxs("div",{className:"flex justify-end gap-2",children:[v.jsx("button",{onClick:()=>t(e.client_id),className:"bg-gray-800 hover:bg-gray-700 text-xs px-2.5 py-0.5 rounded text-gray-200 transition border border-gray-700",children:"Select Target"}),v.jsx("button",{onClick:()=>a(e.client_id),className:"bg-red-900/60 hover:bg-red-800 text-xs px-2.5 py-0.5 rounded text-red-200 transition border border-red-800",children:"Purge"})]})})]},e.client_id))})]}),l.length===0&&v.jsx("div",{className:"p-8 text-center text-gray-500 text-sm",children:"No active crawler nodes found"})]})]})}function hh({clients:l,logCount:t,onSelectTarget:a,onPurgeClient:e}){return v.jsxs("div",{className:"flex flex-col gap-4",children:[v.jsx(yh,{clientCount:l.length,logCount:t}),v.jsx(vh,{clients:l,onSelectTarget:a,onPurgeClient:e})]})}function rh({targetId:l,setTargetId:t,onDispatch:a}){const[e,u]=tl.useState("CRAWL_START"),[n,c]=tl.useState('{"targetUrl": "https://example.com", "depth": 2}');return v.jsxs("div",{className:"bg-[#202124] p-5 rounded border border-gray-800 flex flex-col gap-5 max-w-4xl shadow-sm",children:[v.jsx("div",{className:"flex justify-between items-center border-b border-gray-800 pb-2 mb-2",children:v.jsx("h2",{className:"text-lg font-bold text-green-400",children:"Remote Control Console"})}),v.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[v.jsxs("div",{children:[v.jsx("label",{className:"block text-xs text-slate-500 mb-1 uppercase tracking-wide",children:"대상 클라이언트"}),v.jsx("input",{value:l,onChange:f=>t(f.target.value),placeholder:"client ID 또는 ALL 입력",className:"w-full p-3 bg-[#111827] border border-slate-700 rounded text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition"})]}),v.jsxs("div",{children:[v.jsx("label",{className:"block text-xs text-slate-500 mb-1 uppercase tracking-wide",children:"지시 액션"}),v.jsxs("select",{value:e,onChange:f=>u(f.target.value),className:"w-full p-3 bg-[#111827] border border-slate-700 rounded text-sm text-slate-100 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition",children:[v.jsx("option",{value:"CRAWL_START",children:"CRAWL_START - 수집 시작"}),v.jsx("option",{value:"CRAWL_STOP",children:"CRAWL_STOP - 수집 중지"})]})]}),v.jsx("div",{className:"flex items-end",children:v.jsx("button",{onClick:()=>a(l,e,n),className:"w-full bg-[#1A73E8] hover:bg-[#185abc] text-white font-semibold text-sm p-3 rounded transition shadow-sm h-[54px]",children:"명령 전송"})})]}),v.jsxs("div",{children:[v.jsx("label",{className:"block text-xs text-slate-500 mb-1 uppercase tracking-wide",children:"JSON 페이로드"}),v.jsx("textarea",{value:n,onChange:f=>c(f.target.value),rows:6,placeholder:'{"targetUrl": "https://example.com", "depth": 2}',className:"w-full p-3 bg-[#111827] border border-slate-700 rounded text-sm text-slate-100 font-mono outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition"})]})]})}function gh({logs:l,onClearLogs:t}){return v.jsxs("div",{className:"bg-[#111827] p-6 rounded-2xl border border-slate-800 flex flex-col gap-5 shadow-sm",children:[v.jsxs("div",{className:"flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",children:[v.jsxs("div",{children:[v.jsx("h2",{className:"text-xl font-semibold text-slate-100",children:"수집 로그"}),v.jsx("p",{className:"text-sm text-slate-400",children:"실시간으로 수집된 패킷 로그를 확인합니다."})]}),v.jsxs("button",{onClick:t,className:"inline-flex items-center gap-2 px-4 py-2 bg-red-700/20 hover:bg-red-700/30 text-red-200 rounded-lg transition border border-red-700/30 text-sm",children:[v.jsx("span",{className:"material-symbols-outlined",children:"delete"}),"전체 로그 삭제"]})]}),v.jsx("div",{className:"flex flex-col gap-3 overflow-y-auto max-h-[640px] font-mono text-sm text-slate-200 select-text",children:l.length===0?v.jsx("div",{className:"text-center text-slate-500 py-20",children:"수집 로그가 없습니다."}):l.map(a=>v.jsxs("div",{className:"bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-sm",children:[v.jsxs("div",{className:"flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 text-slate-500 text-xs",children:[v.jsxs("span",{className:"truncate max-w-full",children:["출처: ",a.client_id]}),v.jsxs("span",{children:["수신 시간: ",new Date(a.timestamp).toLocaleTimeString()]})]}),v.jsx("div",{className:"mt-3 text-slate-200 break-words whitespace-pre-wrap",children:a.log_message})]},a.id))})]})}function bh(){const[l,t]=tl.useState("clients"),[a,e]=tl.useState("ALL"),{clients:u,logs:n,setLogs:c,loadClients:f,loadLogs:i,executeClearLogs:d,executePurgeClient:r}=ah(),g=tl.useCallback(()=>{f(),i()},[f,i]),{wsStatus:m,dispatchCommand:h}=nh(c,g),E=T=>{e(T),t("console")};return v.jsxs(mh,{wsStatus:m,clientCount:u.length,activeTab:l,onSelectTab:t,onRefresh:()=>{f(),i()},onClearLogs:d,children:[l==="clients"&&v.jsx(hh,{clients:u,logCount:n.length,onSelectTarget:E,onPurgeClient:r}),l==="console"&&v.jsx(rh,{targetId:a,setTargetId:e,onDispatch:h}),l==="logs"&&v.jsx(gh,{logs:n,onClearLogs:d})]})}Fv.createRoot(document.getElementById("root")).render(v.jsx(gm.StrictMode,{children:v.jsx(bh,{})}));
```

---

## server/public/assets/index-CS2UwwFL.css

```css
@import"https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0";@import"https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap";*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.absolute{position:absolute}.relative{position:relative}.inset-y-0{top:0;bottom:0}.left-0{left:0}.top-full{top:100%}.z-50{z-index:50}.col-span-full{grid-column:1 / -1}.mx-4{margin-left:1rem;margin-right:1rem}.mb-1{margin-bottom:.25rem}.mb-2{margin-bottom:.5rem}.mb-4{margin-bottom:1rem}.ml-1{margin-left:.25rem}.mt-1{margin-top:.25rem}.mt-2{margin-top:.5rem}.mt-3{margin-top:.75rem}.block{display:block}.flex{display:flex}.inline-flex{display:inline-flex}.table{display:table}.grid{display:grid}.hidden{display:none}.h-12{height:3rem}.h-14{height:3.5rem}.h-2\.5{height:.625rem}.h-8{height:2rem}.h-\[38px\]{height:38px}.h-\[54px\]{height:54px}.max-h-\[600px\]{max-height:600px}.max-h-\[640px\]{max-height:640px}.min-h-screen{min-height:100vh}.w-10{width:2.5rem}.w-16{width:4rem}.w-2\.5{width:.625rem}.w-20{width:5rem}.w-60{width:15rem}.w-64{width:16rem}.w-8{width:2rem}.w-full{width:100%}.max-w-4xl{max-width:56rem}.max-w-\[300px\]{max-width:300px}.max-w-full{max-width:100%}.max-w-md{max-width:28rem}.flex-1{flex:1 1 0%}.border-collapse{border-collapse:collapse}@keyframes pulse{50%{opacity:.5}}.animate-pulse{animation:pulse 2s cubic-bezier(.4,0,.6,1) infinite}.select-none{-webkit-user-select:none;-moz-user-select:none;user-select:none}.select-text{-webkit-user-select:text;-moz-user-select:text;user-select:text}.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.flex-col{flex-direction:column}.items-end{align-items:flex-end}.items-center{align-items:center}.items-baseline{align-items:baseline}.justify-end{justify-content:flex-end}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.gap-1{gap:.25rem}.gap-2{gap:.5rem}.gap-3{gap:.75rem}.gap-4{gap:1rem}.gap-5{gap:1.25rem}.gap-6{gap:1.5rem}.divide-y>:not([hidden])~:not([hidden]){--tw-divide-y-reverse: 0;border-top-width:calc(1px * calc(1 - var(--tw-divide-y-reverse)));border-bottom-width:calc(1px * var(--tw-divide-y-reverse))}.divide-gray-800>:not([hidden])~:not([hidden]){--tw-divide-opacity: 1;border-color:rgb(31 41 55 / var(--tw-divide-opacity, 1))}.overflow-hidden{overflow:hidden}.overflow-x-auto{overflow-x:auto}.overflow-y-auto{overflow-y:auto}.truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.whitespace-pre-wrap{white-space:pre-wrap}.break-words{overflow-wrap:break-word}.break-all{word-break:break-all}.rounded{border-radius:.25rem}.rounded-2xl{border-radius:1rem}.rounded-full{border-radius:9999px}.rounded-lg{border-radius:.5rem}.border{border-width:1px}.border-b{border-bottom-width:1px}.border-l-4{border-left-width:4px}.border-r{border-right-width:1px}.border-t{border-top-width:1px}.border-\[\#1A73E8\]{--tw-border-opacity: 1;border-color:rgb(26 115 232 / var(--tw-border-opacity, 1))}.border-blue-300\/20{border-color:#93c5fd33}.border-blue-500{--tw-border-opacity: 1;border-color:rgb(59 130 246 / var(--tw-border-opacity, 1))}.border-emerald-700\/40{border-color:#04785766}.border-gray-700{--tw-border-opacity: 1;border-color:rgb(55 65 81 / var(--tw-border-opacity, 1))}.border-gray-800{--tw-border-opacity: 1;border-color:rgb(31 41 55 / var(--tw-border-opacity, 1))}.border-red-700{--tw-border-opacity: 1;border-color:rgb(185 28 28 / var(--tw-border-opacity, 1))}.border-red-700\/30{border-color:#b91c1c4d}.border-red-800{--tw-border-opacity: 1;border-color:rgb(153 27 27 / var(--tw-border-opacity, 1))}.border-slate-700{--tw-border-opacity: 1;border-color:rgb(51 65 85 / var(--tw-border-opacity, 1))}.border-slate-800{--tw-border-opacity: 1;border-color:rgb(30 41 59 / var(--tw-border-opacity, 1))}.border-yellow-500{--tw-border-opacity: 1;border-color:rgb(234 179 8 / var(--tw-border-opacity, 1))}.bg-\[\#0F172A\]{--tw-bg-opacity: 1;background-color:rgb(15 23 42 / var(--tw-bg-opacity, 1))}.bg-\[\#111827\]{--tw-bg-opacity: 1;background-color:rgb(17 24 39 / var(--tw-bg-opacity, 1))}.bg-\[\#141A23\]{--tw-bg-opacity: 1;background-color:rgb(20 26 35 / var(--tw-bg-opacity, 1))}.bg-\[\#161C27\]{--tw-bg-opacity: 1;background-color:rgb(22 28 39 / var(--tw-bg-opacity, 1))}.bg-\[\#1A73E8\]{--tw-bg-opacity: 1;background-color:rgb(26 115 232 / var(--tw-bg-opacity, 1))}.bg-\[\#1E293B\]{--tw-bg-opacity: 1;background-color:rgb(30 41 59 / var(--tw-bg-opacity, 1))}.bg-\[\#202124\]{--tw-bg-opacity: 1;background-color:rgb(32 33 36 / var(--tw-bg-opacity, 1))}.bg-\[\#28292c\]{--tw-bg-opacity: 1;background-color:rgb(40 41 44 / var(--tw-bg-opacity, 1))}.bg-blue-600{--tw-bg-opacity: 1;background-color:rgb(37 99 235 / var(--tw-bg-opacity, 1))}.bg-blue-950{--tw-bg-opacity: 1;background-color:rgb(23 37 84 / var(--tw-bg-opacity, 1))}.bg-emerald-300{--tw-bg-opacity: 1;background-color:rgb(110 231 183 / var(--tw-bg-opacity, 1))}.bg-emerald-400{--tw-bg-opacity: 1;background-color:rgb(52 211 153 / var(--tw-bg-opacity, 1))}.bg-emerald-900\/40{background-color:#064e3b66}.bg-gray-800{--tw-bg-opacity: 1;background-color:rgb(31 41 55 / var(--tw-bg-opacity, 1))}.bg-gray-900{--tw-bg-opacity: 1;background-color:rgb(17 24 39 / var(--tw-bg-opacity, 1))}.bg-gray-950{--tw-bg-opacity: 1;background-color:rgb(3 7 18 / var(--tw-bg-opacity, 1))}.bg-green-500{--tw-bg-opacity: 1;background-color:rgb(34 197 94 / var(--tw-bg-opacity, 1))}.bg-green-600{--tw-bg-opacity: 1;background-color:rgb(22 163 74 / var(--tw-bg-opacity, 1))}.bg-red-500{--tw-bg-opacity: 1;background-color:rgb(239 68 68 / var(--tw-bg-opacity, 1))}.bg-red-700\/20{background-color:#b91c1c33}.bg-red-900\/50{background-color:#7f1d1d80}.bg-red-900\/60{background-color:#7f1d1d99}.bg-rose-300{--tw-bg-opacity: 1;background-color:rgb(253 164 175 / var(--tw-bg-opacity, 1))}.bg-slate-800{--tw-bg-opacity: 1;background-color:rgb(30 41 59 / var(--tw-bg-opacity, 1))}.bg-slate-900\/70{background-color:#0f172ab3}.bg-slate-900\/80{background-color:#0f172acc}.p-2{padding:.5rem}.p-3{padding:.75rem}.p-4{padding:1rem}.p-5{padding:1.25rem}.p-6{padding:1.5rem}.p-8{padding:2rem}.px-1\.5{padding-left:.375rem;padding-right:.375rem}.px-2{padding-left:.5rem;padding-right:.5rem}.px-2\.5{padding-left:.625rem;padding-right:.625rem}.px-3{padding-left:.75rem;padding-right:.75rem}.px-4{padding-left:1rem;padding-right:1rem}.px-5{padding-left:1.25rem;padding-right:1.25rem}.py-0\.5{padding-top:.125rem;padding-bottom:.125rem}.py-1{padding-top:.25rem;padding-bottom:.25rem}.py-1\.5{padding-top:.375rem;padding-bottom:.375rem}.py-2{padding-top:.5rem;padding-bottom:.5rem}.py-20{padding-top:5rem;padding-bottom:5rem}.py-3{padding-top:.75rem;padding-bottom:.75rem}.py-4{padding-top:1rem;padding-bottom:1rem}.pb-2{padding-bottom:.5rem}.pl-11{padding-left:2.75rem}.pl-3{padding-left:.75rem}.pr-3{padding-right:.75rem}.text-left{text-align:left}.text-center{text-align:center}.text-right{text-align:right}.font-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace}.font-sans{font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji"}.text-2xl{font-size:1.5rem;line-height:2rem}.text-\[10px\]{font-size:10px}.text-\[11px\]{font-size:11px}.text-\[12px\]{font-size:12px}.text-base{font-size:1rem;line-height:1.5rem}.text-lg{font-size:1.125rem;line-height:1.75rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-xs{font-size:.75rem;line-height:1rem}.font-black{font-weight:900}.font-bold{font-weight:700}.font-medium{font-weight:500}.font-semibold{font-weight:600}.uppercase{text-transform:uppercase}.tracking-tight{letter-spacing:-.025em}.tracking-wide{letter-spacing:.025em}.tracking-wider{letter-spacing:.05em}.text-\[\#1A73E8\]{--tw-text-opacity: 1;color:rgb(26 115 232 / var(--tw-text-opacity, 1))}.text-blue-400{--tw-text-opacity: 1;color:rgb(96 165 250 / var(--tw-text-opacity, 1))}.text-emerald-300{--tw-text-opacity: 1;color:rgb(110 231 183 / var(--tw-text-opacity, 1))}.text-gray-100{--tw-text-opacity: 1;color:rgb(243 244 246 / var(--tw-text-opacity, 1))}.text-gray-200{--tw-text-opacity: 1;color:rgb(229 231 235 / var(--tw-text-opacity, 1))}.text-gray-300{--tw-text-opacity: 1;color:rgb(209 213 219 / var(--tw-text-opacity, 1))}.text-gray-400{--tw-text-opacity: 1;color:rgb(156 163 175 / var(--tw-text-opacity, 1))}.text-gray-500{--tw-text-opacity: 1;color:rgb(107 114 128 / var(--tw-text-opacity, 1))}.text-green-400{--tw-text-opacity: 1;color:rgb(74 222 128 / var(--tw-text-opacity, 1))}.text-red-200{--tw-text-opacity: 1;color:rgb(254 202 202 / var(--tw-text-opacity, 1))}.text-slate-100{--tw-text-opacity: 1;color:rgb(241 245 249 / var(--tw-text-opacity, 1))}.text-slate-200{--tw-text-opacity: 1;color:rgb(226 232 240 / var(--tw-text-opacity, 1))}.text-slate-300{--tw-text-opacity: 1;color:rgb(203 213 225 / var(--tw-text-opacity, 1))}.text-slate-400{--tw-text-opacity: 1;color:rgb(148 163 184 / var(--tw-text-opacity, 1))}.text-slate-500{--tw-text-opacity: 1;color:rgb(100 116 139 / var(--tw-text-opacity, 1))}.text-white{--tw-text-opacity: 1;color:rgb(255 255 255 / var(--tw-text-opacity, 1))}.text-yellow-100{--tw-text-opacity: 1;color:rgb(254 249 195 / var(--tw-text-opacity, 1))}.text-yellow-400{--tw-text-opacity: 1;color:rgb(250 204 21 / var(--tw-text-opacity, 1))}.placeholder-slate-500::-moz-placeholder{--tw-placeholder-opacity: 1;color:rgb(100 116 139 / var(--tw-placeholder-opacity, 1))}.placeholder-slate-500::placeholder{--tw-placeholder-opacity: 1;color:rgb(100 116 139 / var(--tw-placeholder-opacity, 1))}.shadow-lg{--tw-shadow: 0 10px 15px -3px rgb(0 0 0 / .1), 0 4px 6px -4px rgb(0 0 0 / .1);--tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.shadow-sm{--tw-shadow: 0 1px 2px 0 rgb(0 0 0 / .05);--tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.outline-none{outline:2px solid transparent;outline-offset:2px}.transition{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-all{transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.duration-200{transition-duration:.2s}:root{color-scheme:dark}html{font-family:Noto Sans KR,sans-serif;background-color:#141a23}body{margin:0;min-height:100vh;background-color:#141a23;color:#e8eaed}*{box-sizing:border-box}.hover\:bg-\[\#185abc\]:hover{--tw-bg-opacity: 1;background-color:rgb(24 90 188 / var(--tw-bg-opacity, 1))}.hover\:bg-\[\#2d2e31\]:hover{--tw-bg-opacity: 1;background-color:rgb(45 46 49 / var(--tw-bg-opacity, 1))}.hover\:bg-blue-600\/90:hover{background-color:#2563ebe6}.hover\:bg-gray-700:hover{--tw-bg-opacity: 1;background-color:rgb(55 65 81 / var(--tw-bg-opacity, 1))}.hover\:bg-gray-800:hover{--tw-bg-opacity: 1;background-color:rgb(31 41 55 / var(--tw-bg-opacity, 1))}.hover\:bg-green-700:hover{--tw-bg-opacity: 1;background-color:rgb(21 128 61 / var(--tw-bg-opacity, 1))}.hover\:bg-red-700\/30:hover{background-color:#b91c1c4d}.hover\:bg-red-800:hover{--tw-bg-opacity: 1;background-color:rgb(153 27 27 / var(--tw-bg-opacity, 1))}.hover\:bg-slate-700:hover{--tw-bg-opacity: 1;background-color:rgb(51 65 85 / var(--tw-bg-opacity, 1))}.hover\:bg-slate-800:hover{--tw-bg-opacity: 1;background-color:rgb(30 41 59 / var(--tw-bg-opacity, 1))}.hover\:bg-slate-900:hover{--tw-bg-opacity: 1;background-color:rgb(15 23 42 / var(--tw-bg-opacity, 1))}.hover\:text-gray-200:hover{--tw-text-opacity: 1;color:rgb(229 231 235 / var(--tw-text-opacity, 1))}.focus\:border-\[\#1A73E8\]:focus{--tw-border-opacity: 1;border-color:rgb(26 115 232 / var(--tw-border-opacity, 1))}.focus\:ring-2:focus{--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)}.focus\:ring-\[\#1A73E8\]\/20:focus{--tw-ring-color: rgb(26 115 232 / .2)}@media (min-width: 640px){.sm\:flex-row{flex-direction:row}.sm\:items-start{align-items:flex-start}.sm\:items-center{align-items:center}.sm\:justify-between{justify-content:space-between}}@media (min-width: 768px){.md\:flex{display:flex}.md\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.md\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}}@media (min-width: 1024px){.lg\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.lg\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}}
```

---

## admin/src/components/layout/Footer.tsx

```tsx
interface FooterProps {
  clientCount: number;
}

export function Footer({ clientCount }: FooterProps) {
  return (
    <footer className="h-8 bg-gray-950 border-t border-gray-800 px-4 flex items-center justify-between text-[11px] text-gray-500 select-none">
      <div>WebCrawlServer Management Console v1.0.0</div>
      <div>활성 노드 세션: {clientCount} 개 기기</div>
    </footer>
  );
}
```

---

## admin/src/components/layout/GcpMainLayout.tsx

```tsx
import { ReactNode, useState } from 'react';
import { TopBar } from './Navbar/TopBar.js';
import { BreadcrumbBar } from './Breadcrumb/BreadcrumbBar.js';
import { Sidebar } from './Sidebar/Sidebar.js';
import { ConnectionStatus, ActiveTab } from '../../types/index.js';

interface GcpMainLayoutProps {
  children: ReactNode;
  wsStatus: ConnectionStatus;
  clientCount: number;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onRefresh: () => void;
  onClearLogs: () => void;
}

export function GcpMainLayout({
  children,
  wsStatus,
  clientCount,
  activeTab,
  onSelectTab,
  onRefresh,
  onClearLogs
}: GcpMainLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#141A23] text-slate-100 flex flex-col font-sans select-none">
      <TopBar
        wsStatus={wsStatus}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        onRefresh={onRefresh}
      />
      <BreadcrumbBar
        activeTab={activeTab}
        onRefresh={onRefresh}
        onClearLogs={onClearLogs}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          clientCount={clientCount}
        />
        <main className="flex-1 p-6 overflow-y-auto bg-[#161C27]">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## admin/src/components/layout/Header.tsx

```tsx
import { ConnectionStatus } from '../../types/index.js';

interface HeaderProps {
  wsStatus: ConnectionStatus;
  onRefresh: () => void;
}

export function Header({ wsStatus, onRefresh }: HeaderProps) {
  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 px-4 flex items-center justify-between select-none">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 text-white font-black text-xs px-2 py-1 rounded tracking-wider">
          GCP STYLE
        </div>
        <span className="font-bold text-sm text-gray-100 tracking-tight">
          WebCrawlServer Console
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onRefresh}
          className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs px-3 py-1.5 rounded transition border border-gray-700"
        >
          수동 갱신
        </button>
        <div className="flex items-center gap-2 bg-gray-950 px-3 py-1.5 rounded border border-gray-800 text-xs">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              wsStatus === 'CONNECTED' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}
          ></span>
          <span className="text-gray-300">
            {wsStatus === 'CONNECTED' ? '통신 연결됨' : '통신 단절됨'}
          </span>
        </div>
      </div>
    </header>
  );
}
```

---

## admin/src/components/layout/MainLayout.tsx

```tsx
import { ReactNode, useState } from 'react';
import { Header } from './Header.js';
import { Sidebar } from './Sidebar.js';
import { Footer } from './Footer.js';
import { ConnectionStatus, ActiveTab } from '../../types/index.js';

interface MainLayoutProps {
  children: ReactNode;
  wsStatus: ConnectionStatus;
  clientCount: number;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onRefresh: () => void;
}

export function MainLayout({
  children,
  wsStatus,
  clientCount,
  activeTab,
  onSelectTab,
  onRefresh
}: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans">
      <Header wsStatus={wsStatus} onRefresh={onRefresh} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          clientCount={clientCount}
        />
        <main className="flex-1 p-6 overflow-y-auto bg-gray-950">
          {children}
        </main>
      </div>
      <Footer clientCount={clientCount} />
    </div>
  );
}
```

---

## admin/src/components/layout/Sidebar.tsx

```tsx
import { ActiveTab } from '../../types/index.js';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  clientCount: number;
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  activeTab,
  onSelectTab,
  clientCount
}: SidebarProps) {
  return (
    <aside
      className={`bg-gray-900 border-r border-gray-800 flex flex-col justify-between transition-all duration-200 select-none ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="flex flex-col py-3">
        <button
          onClick={() => onSelectTab('clients')}
          className={`flex items-center gap-3 px-4 py-3 text-xs font-medium transition ${
            activeTab === 'clients'
              ? 'bg-blue-950 text-blue-400 border-l-4 border-blue-500'
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <span className="text-base">🖥️</span>
          {!isCollapsed && (
            <div className="flex justify-between items-center w-full">
              <span>수집 노드 관리</span>
              <span className="bg-gray-800 text-gray-300 text-[10px] px-1.5 py-0.5 rounded-full">
                {clientCount}
              </span>
            </div>
          )}
        </button>

        <button
          onClick={() => onSelectTab('console')}
          className={`flex items-center gap-3 px-4 py-3 text-xs font-medium transition ${
            activeTab === 'console'
              ? 'bg-blue-950 text-blue-400 border-l-4 border-blue-500'
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <span className="text-base">📡</span>
          {!isCollapsed && <span>원격 지시 콘솔</span>}
        </button>

        <button
          onClick={() => onSelectTab('logs')}
          className={`flex items-center gap-3 px-4 py-3 text-xs font-medium transition ${
            activeTab === 'logs'
              ? 'bg-blue-950 text-blue-400 border-l-4 border-blue-500'
              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
          }`}
        >
          <span className="text-base">📜</span>
          {!isCollapsed && <span>실시간 수집 로그</span>}
        </button>
      </div>

      <div className="border-t border-gray-800 p-2">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 text-gray-400 hover:bg-gray-800 rounded text-xs transition"
        >
          {isCollapsed ? '▶' : '◀ 패널 접기'}
        </button>
      </div>
    </aside>
  );
}
```

---

## admin/src/components/metrics/MetricCardItem.tsx

```tsx
interface MetricCardItemProps {
  title: string;
  value: string | number;
  subValue: string;
  valueColorClass?: string;
}

export function MetricCardItem({
  title,
  value,
  subValue,
  valueColorClass = 'text-white'
}: MetricCardItemProps) {
  return (
    <div className="bg-[#202124] border border-gray-800 rounded p-3 flex flex-col justify-between shadow-sm">
      <div className="text-[11px] font-medium text-gray-400">{title}</div>
      <div className="flex items-baseline justify-between mt-2">
        <div className={`text-2xl font-bold font-mono ${valueColorClass}`}>{value}</div>
        <div className="text-[10px] text-gray-400">{subValue}</div>
      </div>
    </div>
  );
}
```

---

## admin/src/components/metrics/MetricCardsGroup.tsx

```tsx
import { MetricCardItem } from './MetricCardItem.js';

interface MetricCardsGroupProps {
  clientCount: number;
  logCount: number;
}

export function MetricCardsGroup({ clientCount, logCount }: MetricCardsGroupProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 select-none">
      <MetricCardItem
        title="ACTIVE CRAWLER NODES"
        value={clientCount}
        subValue="● Online Status"
        valueColorClass="text-green-400"
      />
      <MetricCardItem
        title="TOTAL CRAWLED LOGS"
        value={logCount}
        subValue="Rows in SQLite"
        valueColorClass="text-yellow-400"
      />
      <MetricCardItem
        title="DATABASE JOURNAL MODE"
        value="WAL Mode"
        subValue="better-sqlite3"
        valueColorClass="text-blue-400"
      />
      <MetricCardItem
        title="NETWORK PORT BINDING"
        value="Port 9600"
        subValue="HTTP/WS Shared"
        valueColorClass="text-green-400"
      />
    </div>
  );
}
```

---

## admin/src/components/tables/GcpClientsTable.tsx

```tsx
import { Client } from '../../types/index.js';

interface GcpClientsTableProps {
  clients: Client[];
  onSelectTarget: (clientId: string) => void;
  onPurgeClient: (clientId: string) => void;
}

export function GcpClientsTable({
  clients,
  onSelectTarget,
  onPurgeClient
}: GcpClientsTableProps) {
  return (
    <div className="bg-[#202124] border border-gray-800 rounded shadow-sm overflow-hidden select-text">
      <div className="px-4 py-3 border-b border-gray-800 flex justify-between items-center bg-[#28292c]">
        <span className="font-bold text-xs text-gray-200 tracking-wide uppercase">
          Crawler Node Instances ({clients.length})
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#111827] text-slate-300 border-b border-slate-800 text-[11px] font-semibold">
              <th className="p-3 w-10 text-center">#</th>
              <th className="p-3">노드 ID</th>
              <th className="p-3">클라이언트 타입</th>
              <th className="p-3">상태</th>
              <th className="p-3">연결 시간</th>
              <th className="p-3 text-right">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-gray-200 font-mono">
            {clients.map((client) => (
              <tr key={client.client_id} className="hover:bg-[#2d2e31] transition">
                <td className="p-3 text-center text-slate-400">{client.client_id.slice(0, 4)}</td>
                <td className="p-3 font-semibold text-slate-100 select-text break-all">
                  {client.client_id}
                </td>
                <td className="p-3">
                  <span className="bg-slate-800 text-slate-200 text-[10px] px-2 py-0.5 rounded border border-slate-700">
                    {client.client_type}
                  </span>
                </td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-2 bg-emerald-900/40 text-emerald-300 text-[11px] px-2 py-1 rounded border border-emerald-700/40">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                    연결됨
                  </span>
                </td>
                <td className="p-3 text-slate-500 text-[12px]">
                  {new Date(parseInt(client.connected_at) || Date.now()).toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onSelectTarget(client.client_id)}
                      className="bg-gray-800 hover:bg-gray-700 text-xs px-2.5 py-0.5 rounded text-gray-200 transition border border-gray-700"
                    >
                      Select Target
                    </button>
                    <button
                      onClick={() => onPurgeClient(client.client_id)}
                      className="bg-red-900/60 hover:bg-red-800 text-xs px-2.5 py-0.5 rounded text-red-200 transition border border-red-800"
                    >
                      Purge
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">
            No active crawler nodes found
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## admin/src/components/views/ClientsView.tsx

```tsx
import { Client } from '../../types/index.js';

interface ClientsViewProps {
  clients: Client[];
  onSelectTarget: (clientId: string) => void;
  onPurgeClient: (clientId: string) => void;
}

export function ClientsView({ clients, onSelectTarget, onPurgeClient }: ClientsViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-blue-400 border-b border-gray-800 pb-2">
        원격 수집 노드 세션 목록
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((c) => (
          <div key={c.client_id} className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex flex-col gap-3">
            <div className="text-xs text-gray-400 font-mono truncate select-text">
              ID: {c.client_id}
            </div>
            <div className="flex justify-between text-xs text-gray-300">
              <span>유형: {c.client_type}</span>
              <span>접속: {new Date(parseInt(c.connected_at) || Date.now()).toLocaleTimeString()}</span>
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <button
                onClick={() => onSelectTarget(c.client_id)}
                className="bg-gray-800 hover:bg-gray-700 text-xs px-2.5 py-1 rounded text-gray-200 transition"
              >
                콘솔 타겟 지정
              </button>
              <button
                onClick={() => onPurgeClient(c.client_id)}
                className="bg-red-900/60 hover:bg-red-800 text-xs px-2.5 py-1 rounded text-red-200 transition border border-red-800"
              >
                강제 추방
              </button>
            </div>
          </div>
        ))}
        {clients.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-20 text-sm">
            현재 활성화된 수집 노드가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## admin/src/components/views/ControlConsoleView.tsx

```tsx
import { useState } from 'react';

interface ControlConsoleViewProps {
  targetId: string;
  setTargetId: (id: string) => void;
  onDispatch: (targetId: string, action: string, payloadStr: string) => void;
}

export function ControlConsoleView({
  targetId,
  setTargetId,
  onDispatch
}: ControlConsoleViewProps) {
  const [action, setAction] = useState('CRAWL_START');
  const [payload, setPayload] = useState('{"targetUrl": "https://example.com", "depth": 2}');

  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 flex flex-col gap-6 max-w-4xl">
      <h2 className="text-lg font-bold text-green-400 border-b border-gray-800 pb-2">
        원격 수집 제어 지시 콘솔
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            타겟 기기 ID (ALL 입력 시 전체 브로드캐스트)
          </label>
          <input
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded p-2 text-sm w-full text-white font-mono"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            지시 작업 식별자 (Action)
          </label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded p-2 text-sm w-full text-white"
          >
            <option value="CRAWL_START">CRAWL_START (수집 개시)</option>
            <option value="CRAWL_STOP">CRAWL_STOP (수집 중단)</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => onDispatch(targetId, action, payload)}
            className="bg-green-600 hover:bg-green-700 font-bold text-sm p-2 w-full rounded transition h-[38px] text-white"
          >
            명령 릴레이 송출
          </button>
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">
          매개변수 페이로드 바디 (JSON 포맷)
        </label>
        <textarea
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          rows={4}
          className="bg-gray-800 border border-gray-700 rounded p-2 text-sm w-full font-mono text-white"
        ></textarea>
      </div>
    </div>
  );
}
```

---

## admin/src/components/views/CrawlLogsView.tsx

```tsx
import { CrawlLog } from '../../types/index.js';

interface CrawlLogsViewProps {
  logs: CrawlLog[];
  onClearLogs: () => void;
}

export function CrawlLogsView({ logs, onClearLogs }: CrawlLogsViewProps) {
  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-gray-800 pb-2">
        <h2 className="text-lg font-bold text-yellow-400">
          실시간 데이터 수집 패킷 로그
        </h2>
        <button
          onClick={onClearLogs}
          className="bg-red-900/50 hover:bg-red-800 border border-red-700 text-xs px-3 py-1.5 rounded transition text-red-200"
        >
          데이터베이스 로그 일괄 소거
        </button>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[600px] font-mono text-xs select-text">
        {logs.map((log) => (
          <div
            key={log.id}
            className="bg-gray-800 p-3 rounded flex flex-col gap-1 border-l-4 border-yellow-500"
          >
            <div className="flex justify-between text-gray-400 text-[10px]">
              <span className="truncate max-w-[300px]">출처: {log.client_id}</span>
              <span>시각: {new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="text-yellow-100 break-all select-text mt-1">
              {log.log_message}
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-center text-gray-500 py-20">
            수신된 실시간 수집 패킷이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## admin/src/components/views/GcpClientsView.tsx

```tsx
import { Client } from '../../types/index.js';
import { MetricCardsGroup } from '../metrics/MetricCardsGroup.js';
import { GcpClientsTable } from '../tables/GcpClientsTable.js';

interface GcpClientsViewProps {
  clients: Client[];
  logCount: number;
  onSelectTarget: (clientId: string) => void;
  onPurgeClient: (clientId: string) => void;
}

export function GcpClientsView({
  clients,
  logCount,
  onSelectTarget,
  onPurgeClient
}: GcpClientsViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <MetricCardsGroup clientCount={clients.length} logCount={logCount} />
      <GcpClientsTable
        clients={clients}
        onSelectTarget={onSelectTarget}
        onPurgeClient={onPurgeClient}
      />
    </div>
  );
}
```

---

## admin/src/components/views/GcpControlConsoleView.tsx

```tsx
import { useState } from 'react';

interface GcpControlConsoleViewProps {
  targetId: string;
  setTargetId: (id: string) => void;
  onDispatch: (targetId: string, action: string, payloadStr: string) => void;
}

export function GcpControlConsoleView({
  targetId,
  setTargetId,
  onDispatch
}: GcpControlConsoleViewProps) {
  const [action, setAction] = useState('CRAWL_START');
  const [payload, setPayload] = useState('{"targetUrl": "https://example.com", "depth": 2}');

  return (
    <div className="bg-[#202124] p-5 rounded border border-gray-800 flex flex-col gap-5 max-w-4xl shadow-sm">
      <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-2">
        <h2 className="text-lg font-bold text-green-400">
          Remote Control Console
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wide">
            대상 클라이언트
          </label>
          <input
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            placeholder="client ID 또는 ALL 입력"
            className="w-full p-3 bg-[#111827] border border-slate-700 rounded text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wide">
            지시 액션
          </label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full p-3 bg-[#111827] border border-slate-700 rounded text-sm text-slate-100 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition"
          >
            <option value="CRAWL_START">CRAWL_START - 수집 시작</option>
            <option value="CRAWL_STOP">CRAWL_STOP - 수집 중지</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => onDispatch(targetId, action, payload)}
            className="w-full bg-[#1A73E8] hover:bg-[#185abc] text-white font-semibold text-sm p-3 rounded transition shadow-sm h-[54px]"
          >
            명령 전송
          </button>
        </div>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wide">
          JSON 페이로드
        </label>
        <textarea
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          rows={6}
          placeholder='{"targetUrl": "https://example.com", "depth": 2}'
          className="w-full p-3 bg-[#111827] border border-slate-700 rounded text-sm text-slate-100 font-mono outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition"
        ></textarea>
      </div>
    </div>
  );
}
```

---

## admin/src/components/views/GcpCrawlLogsView.tsx

```tsx
import { CrawlLog } from '../../types/index.js';

interface GcpCrawlLogsViewProps {
  logs: CrawlLog[];
  onClearLogs: () => void;
}

export function GcpCrawlLogsView({ logs, onClearLogs }: GcpCrawlLogsViewProps) {
  return (
    <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 flex flex-col gap-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">수집 로그</h2>
          <p className="text-sm text-slate-400">실시간으로 수집된 패킷 로그를 확인합니다.</p>
        </div>
        <button
          onClick={onClearLogs}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-700/20 hover:bg-red-700/30 text-red-200 rounded-lg transition border border-red-700/30 text-sm"
        >
          <span className="material-symbols-outlined">delete</span>
          전체 로그 삭제
        </button>
      </div>
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[640px] font-mono text-sm text-slate-200 select-text">
        {logs.length === 0 ? (
          <div className="text-center text-slate-500 py-20">
            수집 로그가 없습니다.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 text-slate-500 text-xs">
                <span className="truncate max-w-full">출처: {log.client_id}</span>
                <span>수신 시간: {new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="mt-3 text-slate-200 break-words whitespace-pre-wrap">
                {log.log_message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

---

## admin/src/components/layout/Breadcrumb/BreadcrumbBar.tsx

```tsx
import { ActiveTab } from '../../../types/index.js';

interface BreadcrumbBarProps {
  activeTab: ActiveTab;
  onRefresh: () => void;
  onClearLogs: () => void;
}

export function BreadcrumbBar({ activeTab, onRefresh, onClearLogs }: BreadcrumbBarProps) {
  const getTabLabel = () => {
    if (activeTab === 'clients') return '수집 노드 관리';
    if (activeTab === 'console') return '원격 지시 콘솔';
    return '수집 로그 확인';
  };

  return (
    <div className="h-12 bg-[#161C27] border-b border-slate-800 px-5 flex items-center justify-between text-sm text-slate-200 select-none shadow-sm">
      <div className="flex items-center gap-2 font-medium">
        <span className="text-slate-500">WebCrawlServer</span>
        <span className="text-slate-300">›</span>
        <span className="text-slate-500">관리자 대시보드</span>
        <span className="text-slate-300">›</span>
        <span className="text-[#1A73E8] font-semibold">{getTabLabel()}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-100 transition"
        >
          <span className="material-symbols-outlined">refresh</span>
          <span>새로고침</span>
        </button>
        {activeTab === 'logs' && (
          <button
            onClick={onClearLogs}
            className="flex items-center gap-2 px-3 py-2 bg-red-700/20 hover:bg-red-700/30 rounded text-red-200 transition border border-red-700/30"
          >
            <span className="material-symbols-outlined">delete</span>
            <span>로그 삭제</span>
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## admin/src/components/layout/Navbar/GlobalSearchBar.tsx

```tsx
export function GlobalSearchBar() {
  return (
    <div className="hidden md:flex items-center flex-1 max-w-md mx-4 select-none">
      <div className="relative w-full">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-sm">
          <span className="material-symbols-outlined">search</span>
        </span>
        <input
          type="text"
          placeholder="노드, 로그, 액션을 검색하세요"
          className="w-full pl-11 pr-3 py-2 bg-[#1E293B] border border-slate-700 rounded shadow-sm text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition"
        />
      </div>
    </div>
  );
}
```

---

## admin/src/components/layout/Navbar/HeaderTools.tsx

```tsx
import { ConnectionStatus } from '../../../types/index.js';

interface HeaderToolsProps {
  wsStatus: ConnectionStatus;
  onRefresh: () => void;
}

export function HeaderTools({ wsStatus, onRefresh }: HeaderToolsProps) {
  return (
    <div className="flex items-center gap-2 select-none">
      <div className="flex items-center gap-2 bg-slate-900/70 px-3 py-2 rounded border border-slate-700 text-sm text-white">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            wsStatus === 'CONNECTED' ? 'bg-emerald-300 animate-pulse' : 'bg-rose-300'
          }`}
        ></span>
        <span>{wsStatus === 'CONNECTED' ? '연결됨' : '연결 끊김'}</span>
      </div>
      <button
        onClick={onRefresh}
        className="p-2 bg-slate-900/70 hover:bg-slate-800 rounded transition text-white"
        title="데이터 새로고침"
      >
        <span className="material-symbols-outlined">refresh</span>
      </button>
      <div className="w-8 h-8 rounded-full bg-slate-900/70 border border-slate-700 flex items-center justify-center font-semibold text-sm text-white ml-1">
        A
      </div>
    </div>
  );
}
```

---

## admin/src/components/layout/Navbar/ProjectSelector.tsx

```tsx
import { useState } from 'react';

export function ProjectSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState('Default-Crawler-Cluster');

  return (
    <div className="relative select-none">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 bg-slate-900/70 hover:bg-slate-800 px-3 py-1 rounded text-xs text-white border border-slate-700 transition"
      >
        <span className="material-symbols-outlined text-sm">workspace_premium</span>
        <span className="font-semibold">{selectedProject}</span>
        <span className="material-symbols-outlined text-[10px]">expand_more</span>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-[#111827] shadow-lg border border-slate-700 rounded text-xs text-slate-100 z-50">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">
            프로젝트 선택
          </div>
          <button
            onClick={() => {
              setSelectedProject('Default-Crawler-Cluster');
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 hover:bg-slate-800 flex justify-between items-center"
          >
            <span>Default-Crawler-Cluster</span>
            {selectedProject === 'Default-Crawler-Cluster' && (
              <span className="text-[#1A73E8] text-[10px]">✓ 선택됨</span>
            )}
          </button>
          <button
            onClick={() => {
              setSelectedProject('Staging-Crawler-Cluster');
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 hover:bg-slate-800 flex justify-between items-center text-slate-300"
          >
            <span>Staging-Crawler-Cluster</span>
            {selectedProject === 'Staging-Crawler-Cluster' && (
              <span className="text-[#1A73E8] text-[10px]">✓ 선택됨</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## admin/src/components/layout/Navbar/TopBar.tsx

```tsx
import { ProjectSelector } from './ProjectSelector.js';
import { GlobalSearchBar } from './GlobalSearchBar.js';
import { HeaderTools } from './HeaderTools.js';
import { ConnectionStatus } from '../../../types/index.js';

interface TopBarProps {
  wsStatus: ConnectionStatus;
  onToggleSidebar: () => void;
  onRefresh: () => void;
}

export function TopBar({ wsStatus, onToggleSidebar, onRefresh }: TopBarProps) {
  return (
    <header className="h-14 bg-[#0F172A] text-white flex items-center justify-between px-4 select-none shadow-sm z-50">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-blue-600/90 rounded transition text-white"
          title="네비게이션 메뉴"
        >
          <span className="material-symbols-outlined text-lg">menu</span>
        </button>
        <div className="flex items-center gap-2 font-medium text-sm tracking-tight pr-3 border-r border-blue-300/20">
          <span className="bg-slate-900/70 text-[#1A73E8] font-black text-xs px-2 py-1 rounded">
            GCP
          </span>
          <span>WebCrawlServer 관리자</span>
        </div>
        <ProjectSelector />
      </div>
      <GlobalSearchBar />
      <HeaderTools wsStatus={wsStatus} onRefresh={onRefresh} />
    </header>
  );
}
```

---

## admin/src/components/layout/Sidebar/Sidebar.tsx

```tsx
import { ActiveTab } from '../../../types/index.js';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  clientCount: number;
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  activeTab,
  onSelectTab,
  clientCount
}: SidebarProps) {
  return (
    <aside
      className={`bg-[#111827] border-r border-slate-800 flex flex-col justify-between transition-all duration-200 select-none shadow-sm ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col py-4">
        <button
          onClick={() => onSelectTab('clients')}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${
            activeTab === 'clients'
              ? 'bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]'
              : 'text-slate-300 hover:bg-slate-900'
          }`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          {!isCollapsed && (
            <div className="flex justify-between items-center w-full">
              <span>수집 노드 관리</span>
              <span className="bg-slate-900/70 text-slate-300 text-[10px] px-2 py-0.5 rounded-full border border-slate-800">
                {clientCount}
              </span>
            </div>
          )}
        </button>

        <button
          onClick={() => onSelectTab('console')}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${
            activeTab === 'console'
              ? 'bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]'
              : 'text-slate-300 hover:bg-slate-900'
          }`}
        >
          <span className="material-symbols-outlined">send_to_mobile</span>
          {!isCollapsed && <span>원격 지시 콘솔</span>}
        </button>

        <button
          onClick={() => onSelectTab('logs')}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${
            activeTab === 'logs'
              ? 'bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]'
              : 'text-slate-300 hover:bg-slate-900'
          }`}
        >
          <span className="material-symbols-outlined">article</span>
          {!isCollapsed && <span>수집 로그</span>}
        </button>
      </div>

      <div className="border-t border-slate-800 p-3">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 p-2 text-slate-300 hover:bg-slate-900 rounded text-sm transition"
        >
          <span className="material-symbols-outlined text-base">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
          {!isCollapsed && '사이드바 접기'}
        </button>
      </div>
    </aside>
  );
}
```

