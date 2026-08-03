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
    
    <!-- 파비콘 선어 -->
    <!-- 기본 파비콘 (구형 브라우저 호환) -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    
    <!-- 모던 브라우저용 다양한 크기 PNG 파비콘 -->
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    
    <!-- Apple Touch Icon (iOS Safari, iPad) -->
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    
    <!-- Android Chrome PWA 아이콘 -->
    <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
    <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
    
    <!-- Web App Manifest -->
    <link rel="manifest" href="/site.webmanifest" />
    
    <!-- 테마 색상 (PWA 및 모바일 브라우저) -->
    <meta name="theme-color" content="#141A23" />
    <meta name="msapplication-TileColor" content="#141A23" />
    
    <!-- Apple 모바일 웹 앱 설정 -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="WebCrawlServer 관리자" />
    
    <!-- 어플리케이션 이름 -->
    <meta name="application-name" content="WebCrawlServer 관리자" />
    
    <!-- 설명 -->
    <meta name="description" content="WebCrawlServer 브라우저 플러그인 관리자 대시보드" />
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
    "react-dom": "^19.2.8",
    "jszip": "^3.10.1"
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

## admin/public/site.webmanifest

```webmanifest
{
  "name": "WebCrawlServer 관리자 대시보드",
  "short_name": "WebCrawlServer",
  "description": "WebCrawlServer 브라우저 플러그인 및 크롤링 노드 관리자 대시보드",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/favicon-16x16.png",
      "sizes": "16x16",
      "type": "image/png"
    },
    {
      "src": "/favicon-32x32.png",
      "sizes": "32x32",
      "type": "image/png"
    },
    {
      "src": "/apple-touch-icon.png",
      "sizes": "180x180",
      "type": "image/png",
      "purpose": "apple touch"
    }
  ],
  "theme_color": "#141A23",
  "background_color": "#141A23",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/",
  "lang": "ko-KR",
  "dir": "ltr"
}
```

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
import { FaviconGeneratorView } from './components/views/FaviconGeneratorView.js';
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
      {activeTab === 'favicon' && (
        <FaviconGeneratorView />
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

## server/public/index.html

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WebCrawlServer 관리자 대시보드</title>
    
    <!-- 파비콘 선어 -->
    <!-- 기본 파비콘 (구형 브라우저 호환) -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    
    <!-- 모던 브라우저용 다양한 크기 PNG 파비콘 -->
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    
    <!-- Apple Touch Icon (iOS Safari, iPad) -->
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    
    <!-- Android Chrome PWA 아이콘 -->
    <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
    <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
    
    <!-- Web App Manifest -->
    <link rel="manifest" href="/site.webmanifest" />
    
    <!-- 테마 색상 (PWA 및 모바일 브라우저) -->
    <meta name="theme-color" content="#141A23" />
    <meta name="msapplication-TileColor" content="#141A23" />
    
    <!-- Apple 모바일 웹 앱 설정 -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="WebCrawlServer 관리자" />
    
    <!-- 어플리케이션 이름 -->
    <meta name="application-name" content="WebCrawlServer 관리자" />
    
    <!-- 설명 -->
    <meta name="description" content="WebCrawlServer 브라우저 플러그인 관리자 대시보드" />
    <script type="module" crossorigin src="/assets/index-qzM_SL6_.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-CW3B8vI1.css">
  </head>
  <body class="bg-gray-900 text-white font-sans select-none">
    <div id="root"></div>
  </body>
</html>
```

---

## server/public/site.webmanifest

```webmanifest
{
  "name": "WebCrawlServer 관리자 대시보드",
  "short_name": "WebCrawlServer",
  "description": "WebCrawlServer 브라우저 플러그인 및 크롤링 노드 관리자 대시보드",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/favicon-16x16.png",
      "sizes": "16x16",
      "type": "image/png"
    },
    {
      "src": "/favicon-32x32.png",
      "sizes": "32x32",
      "type": "image/png"
    },
    {
      "src": "/apple-touch-icon.png",
      "sizes": "180x180",
      "type": "image/png",
      "purpose": "apple touch"
    }
  ],
  "theme_color": "#141A23",
  "background_color": "#141A23",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/",
  "lang": "ko-KR",
  "dir": "ltr"
}
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

export type ActiveTab = 'clients' | 'console' | 'logs' | 'favicon';
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

## server/public/assets/index-CW3B8vI1.css

```css
@import"https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0";@import"https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap";*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.absolute{position:absolute}.relative{position:relative}.inset-y-0{top:0;bottom:0}.left-0{left:0}.top-full{top:100%}.z-50{z-index:50}.col-span-full{grid-column:1 / -1}.mx-4{margin-left:1rem;margin-right:1rem}.mb-1{margin-bottom:.25rem}.mb-2{margin-bottom:.5rem}.mb-4{margin-bottom:1rem}.mb-6{margin-bottom:1.5rem}.ml-1{margin-left:.25rem}.mr-2{margin-right:.5rem}.mt-1{margin-top:.25rem}.mt-2{margin-top:.5rem}.mt-3{margin-top:.75rem}.block{display:block}.flex{display:flex}.inline-flex{display:inline-flex}.table{display:table}.grid{display:grid}.hidden{display:none}.h-12{height:3rem}.h-14{height:3.5rem}.h-16{height:4rem}.h-2\.5{height:.625rem}.h-20{height:5rem}.h-24{height:6rem}.h-8{height:2rem}.h-\[38px\]{height:38px}.h-\[54px\]{height:54px}.max-h-64{max-height:16rem}.max-h-\[600px\]{max-height:600px}.max-h-\[640px\]{max-height:640px}.min-h-screen{min-height:100vh}.w-10{width:2.5rem}.w-12{width:3rem}.w-16{width:4rem}.w-2\.5{width:.625rem}.w-20{width:5rem}.w-24{width:6rem}.w-60{width:15rem}.w-64{width:16rem}.w-8{width:2rem}.w-full{width:100%}.max-w-4xl{max-width:56rem}.max-w-\[300px\]{max-width:300px}.max-w-full{max-width:100%}.max-w-md{max-width:28rem}.flex-1{flex:1 1 0%}.border-collapse{border-collapse:collapse}.rotate-90{--tw-rotate: 90deg;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}@keyframes pulse{50%{opacity:.5}}.animate-pulse{animation:pulse 2s cubic-bezier(.4,0,.6,1) infinite}@keyframes spin{to{transform:rotate(360deg)}}.animate-spin{animation:spin 1s linear infinite}.select-none{-webkit-user-select:none;-moz-user-select:none;user-select:none}.select-text{-webkit-user-select:text;-moz-user-select:text;user-select:text}.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.flex-col{flex-direction:column}.items-end{align-items:flex-end}.items-center{align-items:center}.items-baseline{align-items:baseline}.justify-end{justify-content:flex-end}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.gap-1{gap:.25rem}.gap-2{gap:.5rem}.gap-3{gap:.75rem}.gap-4{gap:1rem}.gap-5{gap:1.25rem}.gap-6{gap:1.5rem}.divide-y>:not([hidden])~:not([hidden]){--tw-divide-y-reverse: 0;border-top-width:calc(1px * calc(1 - var(--tw-divide-y-reverse)));border-bottom-width:calc(1px * var(--tw-divide-y-reverse))}.divide-gray-800>:not([hidden])~:not([hidden]){--tw-divide-opacity: 1;border-color:rgb(31 41 55 / var(--tw-divide-opacity, 1))}.overflow-hidden{overflow:hidden}.overflow-x-auto{overflow-x:auto}.overflow-y-auto{overflow-y:auto}.truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.whitespace-pre-wrap{white-space:pre-wrap}.break-words{overflow-wrap:break-word}.break-all{word-break:break-all}.rounded{border-radius:.25rem}.rounded-2xl{border-radius:1rem}.rounded-full{border-radius:9999px}.rounded-lg{border-radius:.5rem}.border{border-width:1px}.border-2{border-width:2px}.border-4{border-width:4px}.border-b{border-bottom-width:1px}.border-l-4{border-left-width:4px}.border-r{border-right-width:1px}.border-t{border-top-width:1px}.border-dashed{border-style:dashed}.border-\[\#1A73E8\]{--tw-border-opacity: 1;border-color:rgb(26 115 232 / var(--tw-border-opacity, 1))}.border-blue-300\/20{border-color:#93c5fd33}.border-blue-500{--tw-border-opacity: 1;border-color:rgb(59 130 246 / var(--tw-border-opacity, 1))}.border-emerald-700\/40{border-color:#04785766}.border-gray-700{--tw-border-opacity: 1;border-color:rgb(55 65 81 / var(--tw-border-opacity, 1))}.border-gray-800{--tw-border-opacity: 1;border-color:rgb(31 41 55 / var(--tw-border-opacity, 1))}.border-red-700{--tw-border-opacity: 1;border-color:rgb(185 28 28 / var(--tw-border-opacity, 1))}.border-red-700\/30{border-color:#b91c1c4d}.border-red-800{--tw-border-opacity: 1;border-color:rgb(153 27 27 / var(--tw-border-opacity, 1))}.border-slate-700{--tw-border-opacity: 1;border-color:rgb(51 65 85 / var(--tw-border-opacity, 1))}.border-slate-800{--tw-border-opacity: 1;border-color:rgb(30 41 59 / var(--tw-border-opacity, 1))}.border-yellow-500{--tw-border-opacity: 1;border-color:rgb(234 179 8 / var(--tw-border-opacity, 1))}.border-yellow-700{--tw-border-opacity: 1;border-color:rgb(161 98 7 / var(--tw-border-opacity, 1))}.border-t-transparent{border-top-color:transparent}.bg-\[\#0F172A\]{--tw-bg-opacity: 1;background-color:rgb(15 23 42 / var(--tw-bg-opacity, 1))}.bg-\[\#111827\]{--tw-bg-opacity: 1;background-color:rgb(17 24 39 / var(--tw-bg-opacity, 1))}.bg-\[\#141A23\]{--tw-bg-opacity: 1;background-color:rgb(20 26 35 / var(--tw-bg-opacity, 1))}.bg-\[\#161C27\]{--tw-bg-opacity: 1;background-color:rgb(22 28 39 / var(--tw-bg-opacity, 1))}.bg-\[\#1A73E8\]{--tw-bg-opacity: 1;background-color:rgb(26 115 232 / var(--tw-bg-opacity, 1))}.bg-\[\#1E293B\]{--tw-bg-opacity: 1;background-color:rgb(30 41 59 / var(--tw-bg-opacity, 1))}.bg-\[\#202124\]{--tw-bg-opacity: 1;background-color:rgb(32 33 36 / var(--tw-bg-opacity, 1))}.bg-\[\#28292c\]{--tw-bg-opacity: 1;background-color:rgb(40 41 44 / var(--tw-bg-opacity, 1))}.bg-blue-600{--tw-bg-opacity: 1;background-color:rgb(37 99 235 / var(--tw-bg-opacity, 1))}.bg-blue-900\/20{background-color:#1e3a8a33}.bg-blue-950{--tw-bg-opacity: 1;background-color:rgb(23 37 84 / var(--tw-bg-opacity, 1))}.bg-emerald-300{--tw-bg-opacity: 1;background-color:rgb(110 231 183 / var(--tw-bg-opacity, 1))}.bg-emerald-400{--tw-bg-opacity: 1;background-color:rgb(52 211 153 / var(--tw-bg-opacity, 1))}.bg-emerald-900\/40{background-color:#064e3b66}.bg-gray-800{--tw-bg-opacity: 1;background-color:rgb(31 41 55 / var(--tw-bg-opacity, 1))}.bg-gray-900{--tw-bg-opacity: 1;background-color:rgb(17 24 39 / var(--tw-bg-opacity, 1))}.bg-gray-950{--tw-bg-opacity: 1;background-color:rgb(3 7 18 / var(--tw-bg-opacity, 1))}.bg-green-500{--tw-bg-opacity: 1;background-color:rgb(34 197 94 / var(--tw-bg-opacity, 1))}.bg-green-600{--tw-bg-opacity: 1;background-color:rgb(22 163 74 / var(--tw-bg-opacity, 1))}.bg-red-500{--tw-bg-opacity: 1;background-color:rgb(239 68 68 / var(--tw-bg-opacity, 1))}.bg-red-700\/20{background-color:#b91c1c33}.bg-red-900\/50{background-color:#7f1d1d80}.bg-red-900\/60{background-color:#7f1d1d99}.bg-rose-300{--tw-bg-opacity: 1;background-color:rgb(253 164 175 / var(--tw-bg-opacity, 1))}.bg-slate-700{--tw-bg-opacity: 1;background-color:rgb(51 65 85 / var(--tw-bg-opacity, 1))}.bg-slate-800{--tw-bg-opacity: 1;background-color:rgb(30 41 59 / var(--tw-bg-opacity, 1))}.bg-slate-900\/70{background-color:#0f172ab3}.bg-slate-900\/80{background-color:#0f172acc}.bg-yellow-900\/30{background-color:#713f124d}.object-contain{-o-object-fit:contain;object-fit:contain}.p-1{padding:.25rem}.p-2{padding:.5rem}.p-3{padding:.75rem}.p-4{padding:1rem}.p-5{padding:1.25rem}.p-6{padding:1.5rem}.p-8{padding:2rem}.px-1\.5{padding-left:.375rem;padding-right:.375rem}.px-2{padding-left:.5rem;padding-right:.5rem}.px-2\.5{padding-left:.625rem;padding-right:.625rem}.px-3{padding-left:.75rem;padding-right:.75rem}.px-4{padding-left:1rem;padding-right:1rem}.px-5{padding-left:1.25rem;padding-right:1.25rem}.py-0\.5{padding-top:.125rem;padding-bottom:.125rem}.py-1{padding-top:.25rem;padding-bottom:.25rem}.py-1\.5{padding-top:.375rem;padding-bottom:.375rem}.py-2{padding-top:.5rem;padding-bottom:.5rem}.py-20{padding-top:5rem;padding-bottom:5rem}.py-3{padding-top:.75rem;padding-bottom:.75rem}.py-4{padding-top:1rem;padding-bottom:1rem}.pb-2{padding-bottom:.5rem}.pl-11{padding-left:2.75rem}.pl-3{padding-left:.75rem}.pl-8{padding-left:2rem}.pr-3{padding-right:.75rem}.text-left{text-align:left}.text-center{text-align:center}.text-right{text-align:right}.font-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace}.font-sans{font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji"}.text-2xl{font-size:1.5rem;line-height:2rem}.text-6xl{font-size:3.75rem;line-height:1}.text-\[10px\]{font-size:10px}.text-\[11px\]{font-size:11px}.text-\[12px\]{font-size:12px}.text-base{font-size:1rem;line-height:1.5rem}.text-lg{font-size:1.125rem;line-height:1.75rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-xs{font-size:.75rem;line-height:1rem}.font-black{font-weight:900}.font-bold{font-weight:700}.font-medium{font-weight:500}.font-semibold{font-weight:600}.uppercase{text-transform:uppercase}.tracking-tight{letter-spacing:-.025em}.tracking-wide{letter-spacing:.025em}.tracking-wider{letter-spacing:.05em}.text-\[\#1A73E8\]{--tw-text-opacity: 1;color:rgb(26 115 232 / var(--tw-text-opacity, 1))}.text-blue-400{--tw-text-opacity: 1;color:rgb(96 165 250 / var(--tw-text-opacity, 1))}.text-emerald-300{--tw-text-opacity: 1;color:rgb(110 231 183 / var(--tw-text-opacity, 1))}.text-gray-100{--tw-text-opacity: 1;color:rgb(243 244 246 / var(--tw-text-opacity, 1))}.text-gray-200{--tw-text-opacity: 1;color:rgb(229 231 235 / var(--tw-text-opacity, 1))}.text-gray-300{--tw-text-opacity: 1;color:rgb(209 213 219 / var(--tw-text-opacity, 1))}.text-gray-400{--tw-text-opacity: 1;color:rgb(156 163 175 / var(--tw-text-opacity, 1))}.text-gray-500{--tw-text-opacity: 1;color:rgb(107 114 128 / var(--tw-text-opacity, 1))}.text-green-400{--tw-text-opacity: 1;color:rgb(74 222 128 / var(--tw-text-opacity, 1))}.text-red-200{--tw-text-opacity: 1;color:rgb(254 202 202 / var(--tw-text-opacity, 1))}.text-red-300{--tw-text-opacity: 1;color:rgb(252 165 165 / var(--tw-text-opacity, 1))}.text-red-400{--tw-text-opacity: 1;color:rgb(248 113 113 / var(--tw-text-opacity, 1))}.text-slate-100{--tw-text-opacity: 1;color:rgb(241 245 249 / var(--tw-text-opacity, 1))}.text-slate-200{--tw-text-opacity: 1;color:rgb(226 232 240 / var(--tw-text-opacity, 1))}.text-slate-300{--tw-text-opacity: 1;color:rgb(203 213 225 / var(--tw-text-opacity, 1))}.text-slate-400{--tw-text-opacity: 1;color:rgb(148 163 184 / var(--tw-text-opacity, 1))}.text-slate-500{--tw-text-opacity: 1;color:rgb(100 116 139 / var(--tw-text-opacity, 1))}.text-white{--tw-text-opacity: 1;color:rgb(255 255 255 / var(--tw-text-opacity, 1))}.text-yellow-100{--tw-text-opacity: 1;color:rgb(254 249 195 / var(--tw-text-opacity, 1))}.text-yellow-300{--tw-text-opacity: 1;color:rgb(253 224 71 / var(--tw-text-opacity, 1))}.text-yellow-400{--tw-text-opacity: 1;color:rgb(250 204 21 / var(--tw-text-opacity, 1))}.placeholder-slate-500::-moz-placeholder{--tw-placeholder-opacity: 1;color:rgb(100 116 139 / var(--tw-placeholder-opacity, 1))}.placeholder-slate-500::placeholder{--tw-placeholder-opacity: 1;color:rgb(100 116 139 / var(--tw-placeholder-opacity, 1))}.shadow-lg{--tw-shadow: 0 10px 15px -3px rgb(0 0 0 / .1), 0 4px 6px -4px rgb(0 0 0 / .1);--tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.shadow-sm{--tw-shadow: 0 1px 2px 0 rgb(0 0 0 / .05);--tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.outline-none{outline:2px solid transparent;outline-offset:2px}.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.transition{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-all{transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-transform{transition-property:transform;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.duration-200{transition-duration:.2s}:root{color-scheme:dark}html{font-family:Noto Sans KR,sans-serif;background-color:#141a23}body{margin:0;min-height:100vh;background-color:#141a23;color:#e8eaed}*{box-sizing:border-box}.hover\:bg-\[\#185abc\]:hover{--tw-bg-opacity: 1;background-color:rgb(24 90 188 / var(--tw-bg-opacity, 1))}.hover\:bg-\[\#2d2e31\]:hover{--tw-bg-opacity: 1;background-color:rgb(45 46 49 / var(--tw-bg-opacity, 1))}.hover\:bg-blue-600\/90:hover{background-color:#2563ebe6}.hover\:bg-blue-700:hover{--tw-bg-opacity: 1;background-color:rgb(29 78 216 / var(--tw-bg-opacity, 1))}.hover\:bg-gray-700:hover{--tw-bg-opacity: 1;background-color:rgb(55 65 81 / var(--tw-bg-opacity, 1))}.hover\:bg-gray-800:hover{--tw-bg-opacity: 1;background-color:rgb(31 41 55 / var(--tw-bg-opacity, 1))}.hover\:bg-green-700:hover{--tw-bg-opacity: 1;background-color:rgb(21 128 61 / var(--tw-bg-opacity, 1))}.hover\:bg-red-700\/30:hover{background-color:#b91c1c4d}.hover\:bg-red-800:hover{--tw-bg-opacity: 1;background-color:rgb(153 27 27 / var(--tw-bg-opacity, 1))}.hover\:bg-slate-600:hover{--tw-bg-opacity: 1;background-color:rgb(71 85 105 / var(--tw-bg-opacity, 1))}.hover\:bg-slate-700:hover{--tw-bg-opacity: 1;background-color:rgb(51 65 85 / var(--tw-bg-opacity, 1))}.hover\:bg-slate-800:hover{--tw-bg-opacity: 1;background-color:rgb(30 41 59 / var(--tw-bg-opacity, 1))}.hover\:bg-slate-900:hover{--tw-bg-opacity: 1;background-color:rgb(15 23 42 / var(--tw-bg-opacity, 1))}.hover\:text-gray-200:hover{--tw-text-opacity: 1;color:rgb(229 231 235 / var(--tw-text-opacity, 1))}.focus\:border-\[\#1A73E8\]:focus{--tw-border-opacity: 1;border-color:rgb(26 115 232 / var(--tw-border-opacity, 1))}.focus\:ring-2:focus{--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)}.focus\:ring-\[\#1A73E8\]\/20:focus{--tw-ring-color: rgb(26 115 232 / .2)}@media (min-width: 640px){.sm\:flex-row{flex-direction:row}.sm\:items-start{align-items:flex-start}.sm\:items-center{align-items:center}.sm\:justify-between{justify-content:space-between}}@media (min-width: 768px){.md\:flex{display:flex}.md\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.md\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}}@media (min-width: 1024px){.lg\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.lg\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}.lg\:grid-cols-6{grid-template-columns:repeat(6,minmax(0,1fr))}}
```

---

## server/public/assets/index-qzM_SL6_.js

```javascript
(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))l(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const u of i.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&l(u)}).observe(document,{childList:!0,subtree:!0});function a(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function l(n){if(n.ep)return;n.ep=!0;const i=a(n);fetch(n.href,i)}})();var Vn=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function tr(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var Uf={exports:{}},eu={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Zh=Symbol.for("react.transitional.element"),Yh=Symbol.for("react.fragment");function Mf(t,e,a){var l=null;if(a!==void 0&&(l=""+a),e.key!==void 0&&(l=""+e.key),"key"in e){a={};for(var n in e)n!=="key"&&(a[n]=e[n])}else a=e;return e=a.ref,{$$typeof:Zh,type:t,key:l,ref:e!==void 0?e:null,props:a}}eu.Fragment=Yh;eu.jsx=Mf;eu.jsxs=Mf;Uf.exports=eu;var O=Uf.exports,Rf={exports:{}},nt={};/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var er=Symbol.for("react.transitional.element"),Gh=Symbol.for("react.portal"),qh=Symbol.for("react.fragment"),Xh=Symbol.for("react.strict_mode"),Qh=Symbol.for("react.profiler"),Vh=Symbol.for("react.consumer"),Kh=Symbol.for("react.context"),Jh=Symbol.for("react.forward_ref"),Wh=Symbol.for("react.suspense"),Fh=Symbol.for("react.memo"),Bf=Symbol.for("react.lazy"),$h=Symbol.for("react.activity"),nc=Symbol.iterator;function Ih(t){return t===null||typeof t!="object"?null:(t=nc&&t[nc]||t["@@iterator"],typeof t=="function"?t:null)}var Hf={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},kf=Object.assign,Lf={};function Ml(t,e,a){this.props=t,this.context=e,this.refs=Lf,this.updater=a||Hf}Ml.prototype.isReactComponent={};Ml.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};Ml.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function Zf(){}Zf.prototype=Ml.prototype;function ar(t,e,a){this.props=t,this.context=e,this.refs=Lf,this.updater=a||Hf}var lr=ar.prototype=new Zf;lr.constructor=ar;kf(lr,Ml.prototype);lr.isPureReactComponent=!0;var ic=Array.isArray;function ns(){}var At={H:null,A:null,T:null,S:null},Yf=Object.prototype.hasOwnProperty;function nr(t,e,a){var l=a.ref;return{$$typeof:er,type:t,key:e,ref:l!==void 0?l:null,props:a}}function Ph(t,e){return nr(t.type,e,t.props)}function ir(t){return typeof t=="object"&&t!==null&&t.$$typeof===er}function t0(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(a){return e[a]})}var uc=/\/+/g;function Su(t,e){return typeof t=="object"&&t!==null&&t.key!=null?t0(""+t.key):e.toString(36)}function e0(t){switch(t.status){case"fulfilled":return t.value;case"rejected":throw t.reason;default:switch(typeof t.status=="string"?t.then(ns,ns):(t.status="pending",t.then(function(e){t.status==="pending"&&(t.status="fulfilled",t.value=e)},function(e){t.status==="pending"&&(t.status="rejected",t.reason=e)})),t.status){case"fulfilled":return t.value;case"rejected":throw t.reason}}throw t}function el(t,e,a,l,n){var i=typeof t;(i==="undefined"||i==="boolean")&&(t=null);var u=!1;if(t===null)u=!0;else switch(i){case"bigint":case"string":case"number":u=!0;break;case"object":switch(t.$$typeof){case er:case Gh:u=!0;break;case Bf:return u=t._init,el(u(t._payload),e,a,l,n)}}if(u)return n=n(t),u=l===""?"."+Su(t,0):l,ic(n)?(a="",u!=null&&(a=u.replace(uc,"$&/")+"/"),el(n,e,a,"",function(h){return h})):n!=null&&(ir(n)&&(n=Ph(n,a+(n.key==null||t&&t.key===n.key?"":(""+n.key).replace(uc,"$&/")+"/")+u)),e.push(n)),1;u=0;var s=l===""?".":l+":";if(ic(t))for(var r=0;r<t.length;r++)l=t[r],i=s+Su(l,r),u+=el(l,e,a,i,n);else if(r=Ih(t),typeof r=="function")for(t=r.call(t),r=0;!(l=t.next()).done;)l=l.value,i=s+Su(l,r++),u+=el(l,e,a,i,n);else if(i==="object"){if(typeof t.then=="function")return el(e0(t),e,a,l,n);throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.")}return u}function Kn(t,e,a){if(t==null)return t;var l=[],n=0;return el(t,l,"","",function(i){return e.call(a,i,n++)}),l}function a0(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(a){(t._status===0||t._status===-1)&&(t._status=1,t._result=a)},function(a){(t._status===0||t._status===-1)&&(t._status=2,t._result=a)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var sc=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},l0={map:Kn,forEach:function(t,e,a){Kn(t,function(){e.apply(this,arguments)},a)},count:function(t){var e=0;return Kn(t,function(){e++}),e},toArray:function(t){return Kn(t,function(e){return e})||[]},only:function(t){if(!ir(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};nt.Activity=$h;nt.Children=l0;nt.Component=Ml;nt.Fragment=qh;nt.Profiler=Qh;nt.PureComponent=ar;nt.StrictMode=Xh;nt.Suspense=Wh;nt.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=At;nt.__COMPILER_RUNTIME={__proto__:null,c:function(t){return At.H.useMemoCache(t)}};nt.cache=function(t){return function(){return t.apply(null,arguments)}};nt.cacheSignal=function(){return null};nt.cloneElement=function(t,e,a){if(t==null)throw Error("The argument must be a React element, but you passed "+t+".");var l=kf({},t.props),n=t.key;if(e!=null)for(i in e.key!==void 0&&(n=""+e.key),e)!Yf.call(e,i)||i==="key"||i==="__self"||i==="__source"||i==="ref"&&e.ref===void 0||(l[i]=e[i]);var i=arguments.length-2;if(i===1)l.children=a;else if(1<i){for(var u=Array(i),s=0;s<i;s++)u[s]=arguments[s+2];l.children=u}return nr(t.type,n,l)};nt.createContext=function(t){return t={$$typeof:Kh,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null},t.Provider=t,t.Consumer={$$typeof:Vh,_context:t},t};nt.createElement=function(t,e,a){var l,n={},i=null;if(e!=null)for(l in e.key!==void 0&&(i=""+e.key),e)Yf.call(e,l)&&l!=="key"&&l!=="__self"&&l!=="__source"&&(n[l]=e[l]);var u=arguments.length-2;if(u===1)n.children=a;else if(1<u){for(var s=Array(u),r=0;r<u;r++)s[r]=arguments[r+2];n.children=s}if(t&&t.defaultProps)for(l in u=t.defaultProps,u)n[l]===void 0&&(n[l]=u[l]);return nr(t,i,n)};nt.createRef=function(){return{current:null}};nt.forwardRef=function(t){return{$$typeof:Jh,render:t}};nt.isValidElement=ir;nt.lazy=function(t){return{$$typeof:Bf,_payload:{_status:-1,_result:t},_init:a0}};nt.memo=function(t,e){return{$$typeof:Fh,type:t,compare:e===void 0?null:e}};nt.startTransition=function(t){var e=At.T,a={};At.T=a;try{var l=t(),n=At.S;n!==null&&n(a,l),typeof l=="object"&&l!==null&&typeof l.then=="function"&&l.then(ns,sc)}catch(i){sc(i)}finally{e!==null&&a.types!==null&&(e.types=a.types),At.T=e}};nt.unstable_useCacheRefresh=function(){return At.H.useCacheRefresh()};nt.use=function(t){return At.H.use(t)};nt.useActionState=function(t,e,a){return At.H.useActionState(t,e,a)};nt.useCallback=function(t,e){return At.H.useCallback(t,e)};nt.useContext=function(t){return At.H.useContext(t)};nt.useDebugValue=function(){};nt.useDeferredValue=function(t,e){return At.H.useDeferredValue(t,e)};nt.useEffect=function(t,e){return At.H.useEffect(t,e)};nt.useEffectEvent=function(t){return At.H.useEffectEvent(t)};nt.useId=function(){return At.H.useId()};nt.useImperativeHandle=function(t,e,a){return At.H.useImperativeHandle(t,e,a)};nt.useInsertionEffect=function(t,e){return At.H.useInsertionEffect(t,e)};nt.useLayoutEffect=function(t,e){return At.H.useLayoutEffect(t,e)};nt.useMemo=function(t,e){return At.H.useMemo(t,e)};nt.useOptimistic=function(t,e){return At.H.useOptimistic(t,e)};nt.useReducer=function(t,e,a){return At.H.useReducer(t,e,a)};nt.useRef=function(t){return At.H.useRef(t)};nt.useState=function(t){return At.H.useState(t)};nt.useSyncExternalStore=function(t,e,a){return At.H.useSyncExternalStore(t,e,a)};nt.useTransition=function(){return At.H.useTransition()};nt.version="19.2.8";Rf.exports=nt;var ut=Rf.exports;const n0=tr(ut);var Gf={exports:{}},au={},qf={exports:{}},Xf={};/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(t){function e(Y,R){var $=Y.length;Y.push(R);t:for(;0<$;){var X=$-1>>>1,tt=Y[X];if(0<n(tt,R))Y[X]=R,Y[$]=tt,$=X;else break t}}function a(Y){return Y.length===0?null:Y[0]}function l(Y){if(Y.length===0)return null;var R=Y[0],$=Y.pop();if($!==R){Y[0]=$;t:for(var X=0,tt=Y.length,B=tt>>>1;X<B;){var U=2*(X+1)-1,et=Y[U],I=U+1,W=Y[I];if(0>n(et,$))I<tt&&0>n(W,et)?(Y[X]=W,Y[I]=$,X=I):(Y[X]=et,Y[U]=$,X=U);else if(I<tt&&0>n(W,$))Y[X]=W,Y[I]=$,X=I;else break t}}return R}function n(Y,R){var $=Y.sortIndex-R.sortIndex;return $!==0?$:Y.id-R.id}if(t.unstable_now=void 0,typeof performance=="object"&&typeof performance.now=="function"){var i=performance;t.unstable_now=function(){return i.now()}}else{var u=Date,s=u.now();t.unstable_now=function(){return u.now()-s}}var r=[],h=[],b=1,g=null,m=3,o=!1,_=!1,v=!1,S=!1,c=typeof setTimeout=="function"?setTimeout:null,d=typeof clearTimeout=="function"?clearTimeout:null,y=typeof setImmediate<"u"?setImmediate:null;function x(Y){for(var R=a(h);R!==null;){if(R.callback===null)l(h);else if(R.startTime<=Y)l(h),R.sortIndex=R.expirationTime,e(r,R);else break;R=a(h)}}function w(Y){if(v=!1,x(Y),!_)if(a(r)!==null)_=!0,M||(M=!0,A());else{var R=a(h);R!==null&&Z(w,R.startTime-Y)}}var M=!1,T=-1,D=5,C=-1;function k(){return S?!0:!(t.unstable_now()-C<D)}function F(){if(S=!1,M){var Y=t.unstable_now();C=Y;var R=!0;try{t:{_=!1,v&&(v=!1,d(T),T=-1),o=!0;var $=m;try{e:{for(x(Y),g=a(r);g!==null&&!(g.expirationTime>Y&&k());){var X=g.callback;if(typeof X=="function"){g.callback=null,m=g.priorityLevel;var tt=X(g.expirationTime<=Y);if(Y=t.unstable_now(),typeof tt=="function"){g.callback=tt,x(Y),R=!0;break e}g===a(r)&&l(r),x(Y)}else l(r);g=a(r)}if(g!==null)R=!0;else{var B=a(h);B!==null&&Z(w,B.startTime-Y),R=!1}}break t}finally{g=null,m=$,o=!1}R=void 0}}finally{R?A():M=!1}}}var A;if(typeof y=="function")A=function(){y(F)};else if(typeof MessageChannel<"u"){var L=new MessageChannel,p=L.port2;L.port1.onmessage=F,A=function(){p.postMessage(null)}}else A=function(){c(F,0)};function Z(Y,R){T=c(function(){Y(t.unstable_now())},R)}t.unstable_IdlePriority=5,t.unstable_ImmediatePriority=1,t.unstable_LowPriority=4,t.unstable_NormalPriority=3,t.unstable_Profiling=null,t.unstable_UserBlockingPriority=2,t.unstable_cancelCallback=function(Y){Y.callback=null},t.unstable_forceFrameRate=function(Y){0>Y||125<Y?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):D=0<Y?Math.floor(1e3/Y):5},t.unstable_getCurrentPriorityLevel=function(){return m},t.unstable_next=function(Y){switch(m){case 1:case 2:case 3:var R=3;break;default:R=m}var $=m;m=R;try{return Y()}finally{m=$}},t.unstable_requestPaint=function(){S=!0},t.unstable_runWithPriority=function(Y,R){switch(Y){case 1:case 2:case 3:case 4:case 5:break;default:Y=3}var $=m;m=Y;try{return R()}finally{m=$}},t.unstable_scheduleCallback=function(Y,R,$){var X=t.unstable_now();switch(typeof $=="object"&&$!==null?($=$.delay,$=typeof $=="number"&&0<$?X+$:X):$=X,Y){case 1:var tt=-1;break;case 2:tt=250;break;case 5:tt=1073741823;break;case 4:tt=1e4;break;default:tt=5e3}return tt=$+tt,Y={id:b++,callback:R,priorityLevel:Y,startTime:$,expirationTime:tt,sortIndex:-1},$>X?(Y.sortIndex=$,e(h,Y),a(r)===null&&Y===a(h)&&(v?(d(T),T=-1):v=!0,Z(w,$-X))):(Y.sortIndex=tt,e(r,Y),_||o||(_=!0,M||(M=!0,A()))),Y},t.unstable_shouldYield=k,t.unstable_wrapCallback=function(Y){var R=m;return function(){var $=m;m=R;try{return Y.apply(this,arguments)}finally{m=$}}}})(Xf);qf.exports=Xf;var i0=qf.exports,Qf={exports:{}},Pt={};/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var u0=ut;function Vf(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)e+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function ua(){}var It={d:{f:ua,r:function(){throw Error(Vf(522))},D:ua,C:ua,L:ua,m:ua,X:ua,S:ua,M:ua},p:0,findDOMNode:null},s0=Symbol.for("react.portal");function r0(t,e,a){var l=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:s0,key:l==null?null:""+l,children:t,containerInfo:e,implementation:a}}var ln=u0.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function lu(t,e){if(t==="font")return"";if(typeof e=="string")return e==="use-credentials"?e:""}Pt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=It;Pt.createPortal=function(t,e){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)throw Error(Vf(299));return r0(t,e,null,a)};Pt.flushSync=function(t){var e=ln.T,a=It.p;try{if(ln.T=null,It.p=2,t)return t()}finally{ln.T=e,It.p=a,It.d.f()}};Pt.preconnect=function(t,e){typeof t=="string"&&(e?(e=e.crossOrigin,e=typeof e=="string"?e==="use-credentials"?e:"":void 0):e=null,It.d.C(t,e))};Pt.prefetchDNS=function(t){typeof t=="string"&&It.d.D(t)};Pt.preinit=function(t,e){if(typeof t=="string"&&e&&typeof e.as=="string"){var a=e.as,l=lu(a,e.crossOrigin),n=typeof e.integrity=="string"?e.integrity:void 0,i=typeof e.fetchPriority=="string"?e.fetchPriority:void 0;a==="style"?It.d.S(t,typeof e.precedence=="string"?e.precedence:void 0,{crossOrigin:l,integrity:n,fetchPriority:i}):a==="script"&&It.d.X(t,{crossOrigin:l,integrity:n,fetchPriority:i,nonce:typeof e.nonce=="string"?e.nonce:void 0})}};Pt.preinitModule=function(t,e){if(typeof t=="string")if(typeof e=="object"&&e!==null){if(e.as==null||e.as==="script"){var a=lu(e.as,e.crossOrigin);It.d.M(t,{crossOrigin:a,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0})}}else e==null&&It.d.M(t)};Pt.preload=function(t,e){if(typeof t=="string"&&typeof e=="object"&&e!==null&&typeof e.as=="string"){var a=e.as,l=lu(a,e.crossOrigin);It.d.L(t,a,{crossOrigin:l,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0,type:typeof e.type=="string"?e.type:void 0,fetchPriority:typeof e.fetchPriority=="string"?e.fetchPriority:void 0,referrerPolicy:typeof e.referrerPolicy=="string"?e.referrerPolicy:void 0,imageSrcSet:typeof e.imageSrcSet=="string"?e.imageSrcSet:void 0,imageSizes:typeof e.imageSizes=="string"?e.imageSizes:void 0,media:typeof e.media=="string"?e.media:void 0})}};Pt.preloadModule=function(t,e){if(typeof t=="string")if(e){var a=lu(e.as,e.crossOrigin);It.d.m(t,{as:typeof e.as=="string"&&e.as!=="script"?e.as:void 0,crossOrigin:a,integrity:typeof e.integrity=="string"?e.integrity:void 0})}else It.d.m(t)};Pt.requestFormReset=function(t){It.d.r(t)};Pt.unstable_batchedUpdates=function(t,e){return t(e)};Pt.useFormState=function(t,e,a){return ln.H.useFormState(t,e,a)};Pt.useFormStatus=function(){return ln.H.useHostTransitionStatus()};Pt.version="19.2.8";function Kf(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Kf)}catch(t){console.error(t)}}Kf(),Qf.exports=Pt;var c0=Qf.exports;/**
 * @license React
 * react-dom-client.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Zt=i0,Jf=ut,f0=c0;function G(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)e+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Wf(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function jn(t){var e=t,a=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(a=e.return),t=e.return;while(t)}return e.tag===3?a:null}function Ff(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function $f(t){if(t.tag===31){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function rc(t){if(jn(t)!==t)throw Error(G(188))}function o0(t){var e=t.alternate;if(!e){if(e=jn(t),e===null)throw Error(G(188));return e!==t?null:t}for(var a=t,l=e;;){var n=a.return;if(n===null)break;var i=n.alternate;if(i===null){if(l=n.return,l!==null){a=l;continue}break}if(n.child===i.child){for(i=n.child;i;){if(i===a)return rc(n),t;if(i===l)return rc(n),e;i=i.sibling}throw Error(G(188))}if(a.return!==l.return)a=n,l=i;else{for(var u=!1,s=n.child;s;){if(s===a){u=!0,a=n,l=i;break}if(s===l){u=!0,l=n,a=i;break}s=s.sibling}if(!u){for(s=i.child;s;){if(s===a){u=!0,a=i,l=n;break}if(s===l){u=!0,l=i,a=n;break}s=s.sibling}if(!u)throw Error(G(189))}}if(a.alternate!==l)throw Error(G(190))}if(a.tag!==3)throw Error(G(188));return a.stateNode.current===a?t:e}function If(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t;for(t=t.child;t!==null;){if(e=If(t),e!==null)return e;t=t.sibling}return null}var Tt=Object.assign,d0=Symbol.for("react.element"),Jn=Symbol.for("react.transitional.element"),Il=Symbol.for("react.portal"),nl=Symbol.for("react.fragment"),Pf=Symbol.for("react.strict_mode"),is=Symbol.for("react.profiler"),to=Symbol.for("react.consumer"),Je=Symbol.for("react.context"),ur=Symbol.for("react.forward_ref"),us=Symbol.for("react.suspense"),ss=Symbol.for("react.suspense_list"),sr=Symbol.for("react.memo"),sa=Symbol.for("react.lazy"),rs=Symbol.for("react.activity"),h0=Symbol.for("react.memo_cache_sentinel"),cc=Symbol.iterator;function Ql(t){return t===null||typeof t!="object"?null:(t=cc&&t[cc]||t["@@iterator"],typeof t=="function"?t:null)}var m0=Symbol.for("react.client.reference");function cs(t){if(t==null)return null;if(typeof t=="function")return t.$$typeof===m0?null:t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case nl:return"Fragment";case is:return"Profiler";case Pf:return"StrictMode";case us:return"Suspense";case ss:return"SuspenseList";case rs:return"Activity"}if(typeof t=="object")switch(t.$$typeof){case Il:return"Portal";case Je:return t.displayName||"Context";case to:return(t._context.displayName||"Context")+".Consumer";case ur:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case sr:return e=t.displayName||null,e!==null?e:cs(t.type)||"Memo";case sa:e=t._payload,t=t._init;try{return cs(t(e))}catch{}}return null}var Pl=Array.isArray,lt=Jf.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,mt=f0.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ka={pending:!1,data:null,method:null,action:null},fs=[],il=-1;function ke(t){return{current:t}}function Xt(t){0>il||(t.current=fs[il],fs[il]=null,il--)}function xt(t,e){il++,fs[il]=t.current,t.current=e}var He=ke(null),gn=ke(null),ga=ke(null),Ti=ke(null);function wi(t,e){switch(xt(ga,e),xt(gn,t),xt(He,null),e.nodeType){case 9:case 11:t=(t=e.documentElement)&&(t=t.namespaceURI)?vf(t):0;break;default:if(t=e.tagName,e=e.namespaceURI)e=vf(e),t=Sh(e,t);else switch(t){case"svg":t=1;break;case"math":t=2;break;default:t=0}}Xt(He),xt(He,t)}function zl(){Xt(He),Xt(gn),Xt(ga)}function os(t){t.memoizedState!==null&&xt(Ti,t);var e=He.current,a=Sh(e,t.type);e!==a&&(xt(gn,t),xt(He,a))}function Oi(t){gn.current===t&&(Xt(He),Xt(gn)),Ti.current===t&&(Xt(Ti),Cn._currentValue=ka)}var xu,fc;function Ma(t){if(xu===void 0)try{throw Error()}catch(a){var e=a.stack.trim().match(/\n( *(at )?)/);xu=e&&e[1]||"",fc=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+xu+t+fc}var zu=!1;function Eu(t,e){if(!t||zu)return"";zu=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var l={DetermineComponentFrameRoot:function(){try{if(e){var g=function(){throw Error()};if(Object.defineProperty(g.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(g,[])}catch(o){var m=o}Reflect.construct(t,[],g)}else{try{g.call()}catch(o){m=o}t.call(g.prototype)}}else{try{throw Error()}catch(o){m=o}(g=t())&&typeof g.catch=="function"&&g.catch(function(){})}}catch(o){if(o&&m&&typeof o.stack=="string")return[o.stack,m.stack]}return[null,null]}};l.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var n=Object.getOwnPropertyDescriptor(l.DetermineComponentFrameRoot,"name");n&&n.configurable&&Object.defineProperty(l.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var i=l.DetermineComponentFrameRoot(),u=i[0],s=i[1];if(u&&s){var r=u.split(`
`),h=s.split(`
`);for(n=l=0;l<r.length&&!r[l].includes("DetermineComponentFrameRoot");)l++;for(;n<h.length&&!h[n].includes("DetermineComponentFrameRoot");)n++;if(l===r.length||n===h.length)for(l=r.length-1,n=h.length-1;1<=l&&0<=n&&r[l]!==h[n];)n--;for(;1<=l&&0<=n;l--,n--)if(r[l]!==h[n]){if(l!==1||n!==1)do if(l--,n--,0>n||r[l]!==h[n]){var b=`
`+r[l].replace(" at new "," at ");return t.displayName&&b.includes("<anonymous>")&&(b=b.replace("<anonymous>",t.displayName)),b}while(1<=l&&0<=n);break}}}finally{zu=!1,Error.prepareStackTrace=a}return(a=t?t.displayName||t.name:"")?Ma(a):""}function p0(t,e){switch(t.tag){case 26:case 27:case 5:return Ma(t.type);case 16:return Ma("Lazy");case 13:return t.child!==e&&e!==null?Ma("Suspense Fallback"):Ma("Suspense");case 19:return Ma("SuspenseList");case 0:case 15:return Eu(t.type,!1);case 11:return Eu(t.type.render,!1);case 1:return Eu(t.type,!0);case 31:return Ma("Activity");default:return""}}function oc(t){try{var e="",a=null;do e+=p0(t,a),a=t,t=t.return;while(t);return e}catch(l){return`
Error generating stack: `+l.message+`
`+l.stack}}var ds=Object.prototype.hasOwnProperty,rr=Zt.unstable_scheduleCallback,Au=Zt.unstable_cancelCallback,v0=Zt.unstable_shouldYield,y0=Zt.unstable_requestPaint,oe=Zt.unstable_now,g0=Zt.unstable_getCurrentPriorityLevel,eo=Zt.unstable_ImmediatePriority,ao=Zt.unstable_UserBlockingPriority,Ci=Zt.unstable_NormalPriority,b0=Zt.unstable_LowPriority,lo=Zt.unstable_IdlePriority,_0=Zt.log,S0=Zt.unstable_setDisableYieldValue,Un=null,de=null;function ha(t){if(typeof _0=="function"&&S0(t),de&&typeof de.setStrictMode=="function")try{de.setStrictMode(Un,t)}catch{}}var he=Math.clz32?Math.clz32:E0,x0=Math.log,z0=Math.LN2;function E0(t){return t>>>=0,t===0?32:31-(x0(t)/z0|0)|0}var Wn=256,Fn=262144,$n=4194304;function Ra(t){var e=t&42;if(e!==0)return e;switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return t&261888;case 262144:case 524288:case 1048576:case 2097152:return t&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return t&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return t}}function nu(t,e,a){var l=t.pendingLanes;if(l===0)return 0;var n=0,i=t.suspendedLanes,u=t.pingedLanes;t=t.warmLanes;var s=l&134217727;return s!==0?(l=s&~i,l!==0?n=Ra(l):(u&=s,u!==0?n=Ra(u):a||(a=s&~t,a!==0&&(n=Ra(a))))):(s=l&~i,s!==0?n=Ra(s):u!==0?n=Ra(u):a||(a=l&~t,a!==0&&(n=Ra(a)))),n===0?0:e!==0&&e!==n&&!(e&i)&&(i=n&-n,a=e&-e,i>=a||i===32&&(a&4194048)!==0)?e:n}function Mn(t,e){return(t.pendingLanes&~(t.suspendedLanes&~t.pingedLanes)&e)===0}function A0(t,e){switch(t){case 1:case 2:case 4:case 8:case 64:return e+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function no(){var t=$n;return $n<<=1,!($n&62914560)&&($n=4194304),t}function Tu(t){for(var e=[],a=0;31>a;a++)e.push(t);return e}function Rn(t,e){t.pendingLanes|=e,e!==268435456&&(t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0)}function T0(t,e,a,l,n,i){var u=t.pendingLanes;t.pendingLanes=a,t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0,t.expiredLanes&=a,t.entangledLanes&=a,t.errorRecoveryDisabledLanes&=a,t.shellSuspendCounter=0;var s=t.entanglements,r=t.expirationTimes,h=t.hiddenUpdates;for(a=u&~a;0<a;){var b=31-he(a),g=1<<b;s[b]=0,r[b]=-1;var m=h[b];if(m!==null)for(h[b]=null,b=0;b<m.length;b++){var o=m[b];o!==null&&(o.lane&=-536870913)}a&=~g}l!==0&&io(t,l,0),i!==0&&n===0&&t.tag!==0&&(t.suspendedLanes|=i&~(u&~e))}function io(t,e,a){t.pendingLanes|=e,t.suspendedLanes&=~e;var l=31-he(e);t.entangledLanes|=e,t.entanglements[l]=t.entanglements[l]|1073741824|a&261930}function uo(t,e){var a=t.entangledLanes|=e;for(t=t.entanglements;a;){var l=31-he(a),n=1<<l;n&e|t[l]&e&&(t[l]|=e),a&=~n}}function so(t,e){var a=e&-e;return a=a&42?1:cr(a),a&(t.suspendedLanes|e)?0:a}function cr(t){switch(t){case 2:t=1;break;case 8:t=4;break;case 32:t=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:t=128;break;case 268435456:t=134217728;break;default:t=0}return t}function fr(t){return t&=-t,2<t?8<t?t&134217727?32:268435456:8:2}function ro(){var t=mt.p;return t!==0?t:(t=window.event,t===void 0?32:jh(t.type))}function dc(t,e){var a=mt.p;try{return mt.p=t,e()}finally{mt.p=a}}var Da=Math.random().toString(36).slice(2),Vt="__reactFiber$"+Da,ie="__reactProps$"+Da,Rl="__reactContainer$"+Da,hs="__reactEvents$"+Da,w0="__reactListeners$"+Da,O0="__reactHandles$"+Da,hc="__reactResources$"+Da,Bn="__reactMarker$"+Da;function or(t){delete t[Vt],delete t[ie],delete t[hs],delete t[w0],delete t[O0]}function ul(t){var e=t[Vt];if(e)return e;for(var a=t.parentNode;a;){if(e=a[Rl]||a[Vt]){if(a=e.alternate,e.child!==null||a!==null&&a.child!==null)for(t=Sf(t);t!==null;){if(a=t[Vt])return a;t=Sf(t)}return e}t=a,a=t.parentNode}return null}function Bl(t){if(t=t[Vt]||t[Rl]){var e=t.tag;if(e===5||e===6||e===13||e===31||e===26||e===27||e===3)return t}return null}function tn(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t.stateNode;throw Error(G(33))}function vl(t){var e=t[hc];return e||(e=t[hc]={hoistableStyles:new Map,hoistableScripts:new Map}),e}function qt(t){t[Bn]=!0}var co=new Set,fo={};function Ja(t,e){El(t,e),El(t+"Capture",e)}function El(t,e){for(fo[t]=e,t=0;t<e.length;t++)co.add(e[t])}var C0=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),mc={},pc={};function N0(t){return ds.call(pc,t)?!0:ds.call(mc,t)?!1:C0.test(t)?pc[t]=!0:(mc[t]=!0,!1)}function oi(t,e,a){if(N0(e))if(a===null)t.removeAttribute(e);else{switch(typeof a){case"undefined":case"function":case"symbol":t.removeAttribute(e);return;case"boolean":var l=e.toLowerCase().slice(0,5);if(l!=="data-"&&l!=="aria-"){t.removeAttribute(e);return}}t.setAttribute(e,""+a)}}function In(t,e,a){if(a===null)t.removeAttribute(e);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(e);return}t.setAttribute(e,""+a)}}function Ye(t,e,a,l){if(l===null)t.removeAttribute(a);else{switch(typeof l){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(a);return}t.setAttributeNS(e,a,""+l)}}function be(t){switch(typeof t){case"bigint":case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function oo(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function D0(t,e,a){var l=Object.getOwnPropertyDescriptor(t.constructor.prototype,e);if(!t.hasOwnProperty(e)&&typeof l<"u"&&typeof l.get=="function"&&typeof l.set=="function"){var n=l.get,i=l.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return n.call(this)},set:function(u){a=""+u,i.call(this,u)}}),Object.defineProperty(t,e,{enumerable:l.enumerable}),{getValue:function(){return a},setValue:function(u){a=""+u},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function ms(t){if(!t._valueTracker){var e=oo(t)?"checked":"value";t._valueTracker=D0(t,e,""+t[e])}}function ho(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var a=e.getValue(),l="";return t&&(l=oo(t)?t.checked?"true":"false":t.value),t=l,t!==a?(e.setValue(t),!0):!1}function Ni(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}var j0=/[\n"\\]/g;function xe(t){return t.replace(j0,function(e){return"\\"+e.charCodeAt(0).toString(16)+" "})}function ps(t,e,a,l,n,i,u,s){t.name="",u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"?t.type=u:t.removeAttribute("type"),e!=null?u==="number"?(e===0&&t.value===""||t.value!=e)&&(t.value=""+be(e)):t.value!==""+be(e)&&(t.value=""+be(e)):u!=="submit"&&u!=="reset"||t.removeAttribute("value"),e!=null?vs(t,u,be(e)):a!=null?vs(t,u,be(a)):l!=null&&t.removeAttribute("value"),n==null&&i!=null&&(t.defaultChecked=!!i),n!=null&&(t.checked=n&&typeof n!="function"&&typeof n!="symbol"),s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"?t.name=""+be(s):t.removeAttribute("name")}function mo(t,e,a,l,n,i,u,s){if(i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"&&(t.type=i),e!=null||a!=null){if(!(i!=="submit"&&i!=="reset"||e!=null)){ms(t);return}a=a!=null?""+be(a):"",e=e!=null?""+be(e):a,s||e===t.value||(t.value=e),t.defaultValue=e}l=l??n,l=typeof l!="function"&&typeof l!="symbol"&&!!l,t.checked=s?t.checked:!!l,t.defaultChecked=!!l,u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"&&(t.name=u),ms(t)}function vs(t,e,a){e==="number"&&Ni(t.ownerDocument)===t||t.defaultValue===""+a||(t.defaultValue=""+a)}function yl(t,e,a,l){if(t=t.options,e){e={};for(var n=0;n<a.length;n++)e["$"+a[n]]=!0;for(a=0;a<t.length;a++)n=e.hasOwnProperty("$"+t[a].value),t[a].selected!==n&&(t[a].selected=n),n&&l&&(t[a].defaultSelected=!0)}else{for(a=""+be(a),e=null,n=0;n<t.length;n++){if(t[n].value===a){t[n].selected=!0,l&&(t[n].defaultSelected=!0);return}e!==null||t[n].disabled||(e=t[n])}e!==null&&(e.selected=!0)}}function po(t,e,a){if(e!=null&&(e=""+be(e),e!==t.value&&(t.value=e),a==null)){t.defaultValue!==e&&(t.defaultValue=e);return}t.defaultValue=a!=null?""+be(a):""}function vo(t,e,a,l){if(e==null){if(l!=null){if(a!=null)throw Error(G(92));if(Pl(l)){if(1<l.length)throw Error(G(93));l=l[0]}a=l}a==null&&(a=""),e=a}a=be(e),t.defaultValue=a,l=t.textContent,l===a&&l!==""&&l!==null&&(t.value=l),ms(t)}function Al(t,e){if(e){var a=t.firstChild;if(a&&a===t.lastChild&&a.nodeType===3){a.nodeValue=e;return}}t.textContent=e}var U0=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function vc(t,e,a){var l=e.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?l?t.setProperty(e,""):e==="float"?t.cssFloat="":t[e]="":l?t.setProperty(e,a):typeof a!="number"||a===0||U0.has(e)?e==="float"?t.cssFloat=a:t[e]=(""+a).trim():t[e]=a+"px"}function yo(t,e,a){if(e!=null&&typeof e!="object")throw Error(G(62));if(t=t.style,a!=null){for(var l in a)!a.hasOwnProperty(l)||e!=null&&e.hasOwnProperty(l)||(l.indexOf("--")===0?t.setProperty(l,""):l==="float"?t.cssFloat="":t[l]="");for(var n in e)l=e[n],e.hasOwnProperty(n)&&a[n]!==l&&vc(t,n,l)}else for(var i in e)e.hasOwnProperty(i)&&vc(t,i,e[i])}function dr(t){if(t.indexOf("-")===-1)return!1;switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var M0=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),R0=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function di(t){return R0.test(""+t)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":t}function We(){}var ys=null;function hr(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var sl=null,gl=null;function yc(t){var e=Bl(t);if(e&&(t=e.stateNode)){var a=t[ie]||null;t:switch(t=e.stateNode,e.type){case"input":if(ps(t,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),e=a.name,a.type==="radio"&&e!=null){for(a=t;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+xe(""+e)+'"][type="radio"]'),e=0;e<a.length;e++){var l=a[e];if(l!==t&&l.form===t.form){var n=l[ie]||null;if(!n)throw Error(G(90));ps(l,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name)}}for(e=0;e<a.length;e++)l=a[e],l.form===t.form&&ho(l)}break t;case"textarea":po(t,a.value,a.defaultValue);break t;case"select":e=a.value,e!=null&&yl(t,!!a.multiple,e,!1)}}}var wu=!1;function go(t,e,a){if(wu)return t(e,a);wu=!0;try{var l=t(e);return l}finally{if(wu=!1,(sl!==null||gl!==null)&&(vu(),sl&&(e=sl,t=gl,gl=sl=null,yc(e),t)))for(e=0;e<t.length;e++)yc(t[e])}}function bn(t,e){var a=t.stateNode;if(a===null)return null;var l=a[ie]||null;if(l===null)return null;a=l[e];t:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(l=!l.disabled)||(t=t.type,l=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!l;break t;default:t=!1}if(t)return null;if(a&&typeof a!="function")throw Error(G(231,e,typeof a));return a}var ta=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),gs=!1;if(ta)try{var Vl={};Object.defineProperty(Vl,"passive",{get:function(){gs=!0}}),window.addEventListener("test",Vl,Vl),window.removeEventListener("test",Vl,Vl)}catch{gs=!1}var ma=null,mr=null,hi=null;function bo(){if(hi)return hi;var t,e=mr,a=e.length,l,n="value"in ma?ma.value:ma.textContent,i=n.length;for(t=0;t<a&&e[t]===n[t];t++);var u=a-t;for(l=1;l<=u&&e[a-l]===n[i-l];l++);return hi=n.slice(t,1<l?1-l:void 0)}function mi(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function Pn(){return!0}function gc(){return!1}function ue(t){function e(a,l,n,i,u){this._reactName=a,this._targetInst=n,this.type=l,this.nativeEvent=i,this.target=u,this.currentTarget=null;for(var s in t)t.hasOwnProperty(s)&&(a=t[s],this[s]=a?a(i):i[s]);return this.isDefaultPrevented=(i.defaultPrevented!=null?i.defaultPrevented:i.returnValue===!1)?Pn:gc,this.isPropagationStopped=gc,this}return Tt(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=Pn)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=Pn)},persist:function(){},isPersistent:Pn}),e}var Wa={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},iu=ue(Wa),Hn=Tt({},Wa,{view:0,detail:0}),B0=ue(Hn),Ou,Cu,Kl,uu=Tt({},Hn,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:pr,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==Kl&&(Kl&&t.type==="mousemove"?(Ou=t.screenX-Kl.screenX,Cu=t.screenY-Kl.screenY):Cu=Ou=0,Kl=t),Ou)},movementY:function(t){return"movementY"in t?t.movementY:Cu}}),bc=ue(uu),H0=Tt({},uu,{dataTransfer:0}),k0=ue(H0),L0=Tt({},Hn,{relatedTarget:0}),Nu=ue(L0),Z0=Tt({},Wa,{animationName:0,elapsedTime:0,pseudoElement:0}),Y0=ue(Z0),G0=Tt({},Wa,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),q0=ue(G0),X0=Tt({},Wa,{data:0}),_c=ue(X0),Q0={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},V0={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},K0={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function J0(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=K0[t])?!!e[t]:!1}function pr(){return J0}var W0=Tt({},Hn,{key:function(t){if(t.key){var e=Q0[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=mi(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?V0[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:pr,charCode:function(t){return t.type==="keypress"?mi(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?mi(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),F0=ue(W0),$0=Tt({},uu,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Sc=ue($0),I0=Tt({},Hn,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:pr}),P0=ue(I0),tm=Tt({},Wa,{propertyName:0,elapsedTime:0,pseudoElement:0}),em=ue(tm),am=Tt({},uu,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),lm=ue(am),nm=Tt({},Wa,{newState:0,oldState:0}),im=ue(nm),um=[9,13,27,32],vr=ta&&"CompositionEvent"in window,nn=null;ta&&"documentMode"in document&&(nn=document.documentMode);var sm=ta&&"TextEvent"in window&&!nn,_o=ta&&(!vr||nn&&8<nn&&11>=nn),xc=" ",zc=!1;function So(t,e){switch(t){case"keyup":return um.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function xo(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var rl=!1;function rm(t,e){switch(t){case"compositionend":return xo(e);case"keypress":return e.which!==32?null:(zc=!0,xc);case"textInput":return t=e.data,t===xc&&zc?null:t;default:return null}}function cm(t,e){if(rl)return t==="compositionend"||!vr&&So(t,e)?(t=bo(),hi=mr=ma=null,rl=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return _o&&e.locale!=="ko"?null:e.data;default:return null}}var fm={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Ec(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!fm[t.type]:e==="textarea"}function zo(t,e,a,l){sl?gl?gl.push(l):gl=[l]:sl=l,e=Ji(e,"onChange"),0<e.length&&(a=new iu("onChange","change",null,a,l),t.push({event:a,listeners:e}))}var un=null,_n=null;function om(t){gh(t,0)}function su(t){var e=tn(t);if(ho(e))return t}function Ac(t,e){if(t==="change")return e}var Eo=!1;if(ta){var Du;if(ta){var ju="oninput"in document;if(!ju){var Tc=document.createElement("div");Tc.setAttribute("oninput","return;"),ju=typeof Tc.oninput=="function"}Du=ju}else Du=!1;Eo=Du&&(!document.documentMode||9<document.documentMode)}function wc(){un&&(un.detachEvent("onpropertychange",Ao),_n=un=null)}function Ao(t){if(t.propertyName==="value"&&su(_n)){var e=[];zo(e,_n,t,hr(t)),go(om,e)}}function dm(t,e,a){t==="focusin"?(wc(),un=e,_n=a,un.attachEvent("onpropertychange",Ao)):t==="focusout"&&wc()}function hm(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return su(_n)}function mm(t,e){if(t==="click")return su(e)}function pm(t,e){if(t==="input"||t==="change")return su(e)}function vm(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var pe=typeof Object.is=="function"?Object.is:vm;function Sn(t,e){if(pe(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var a=Object.keys(t),l=Object.keys(e);if(a.length!==l.length)return!1;for(l=0;l<a.length;l++){var n=a[l];if(!ds.call(e,n)||!pe(t[n],e[n]))return!1}return!0}function Oc(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function Cc(t,e){var a=Oc(t);t=0;for(var l;a;){if(a.nodeType===3){if(l=t+a.textContent.length,t<=e&&l>=e)return{node:a,offset:e-t};t=l}t:{for(;a;){if(a.nextSibling){a=a.nextSibling;break t}a=a.parentNode}a=void 0}a=Oc(a)}}function To(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?To(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function wo(t){t=t!=null&&t.ownerDocument!=null&&t.ownerDocument.defaultView!=null?t.ownerDocument.defaultView:window;for(var e=Ni(t.document);e instanceof t.HTMLIFrameElement;){try{var a=typeof e.contentWindow.location.href=="string"}catch{a=!1}if(a)t=e.contentWindow;else break;e=Ni(t.document)}return e}function yr(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}var ym=ta&&"documentMode"in document&&11>=document.documentMode,cl=null,bs=null,sn=null,_s=!1;function Nc(t,e,a){var l=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;_s||cl==null||cl!==Ni(l)||(l=cl,"selectionStart"in l&&yr(l)?l={start:l.selectionStart,end:l.selectionEnd}:(l=(l.ownerDocument&&l.ownerDocument.defaultView||window).getSelection(),l={anchorNode:l.anchorNode,anchorOffset:l.anchorOffset,focusNode:l.focusNode,focusOffset:l.focusOffset}),sn&&Sn(sn,l)||(sn=l,l=Ji(bs,"onSelect"),0<l.length&&(e=new iu("onSelect","select",null,e,a),t.push({event:e,listeners:l}),e.target=cl)))}function Ua(t,e){var a={};return a[t.toLowerCase()]=e.toLowerCase(),a["Webkit"+t]="webkit"+e,a["Moz"+t]="moz"+e,a}var fl={animationend:Ua("Animation","AnimationEnd"),animationiteration:Ua("Animation","AnimationIteration"),animationstart:Ua("Animation","AnimationStart"),transitionrun:Ua("Transition","TransitionRun"),transitionstart:Ua("Transition","TransitionStart"),transitioncancel:Ua("Transition","TransitionCancel"),transitionend:Ua("Transition","TransitionEnd")},Uu={},Oo={};ta&&(Oo=document.createElement("div").style,"AnimationEvent"in window||(delete fl.animationend.animation,delete fl.animationiteration.animation,delete fl.animationstart.animation),"TransitionEvent"in window||delete fl.transitionend.transition);function Fa(t){if(Uu[t])return Uu[t];if(!fl[t])return t;var e=fl[t],a;for(a in e)if(e.hasOwnProperty(a)&&a in Oo)return Uu[t]=e[a];return t}var Co=Fa("animationend"),No=Fa("animationiteration"),Do=Fa("animationstart"),gm=Fa("transitionrun"),bm=Fa("transitionstart"),_m=Fa("transitioncancel"),jo=Fa("transitionend"),Uo=new Map,Ss="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Ss.push("scrollEnd");function De(t,e){Uo.set(t,e),Ja(e,[t])}var Di=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},ge=[],ol=0,gr=0;function ru(){for(var t=ol,e=gr=ol=0;e<t;){var a=ge[e];ge[e++]=null;var l=ge[e];ge[e++]=null;var n=ge[e];ge[e++]=null;var i=ge[e];if(ge[e++]=null,l!==null&&n!==null){var u=l.pending;u===null?n.next=n:(n.next=u.next,u.next=n),l.pending=n}i!==0&&Mo(a,n,i)}}function cu(t,e,a,l){ge[ol++]=t,ge[ol++]=e,ge[ol++]=a,ge[ol++]=l,gr|=l,t.lanes|=l,t=t.alternate,t!==null&&(t.lanes|=l)}function br(t,e,a,l){return cu(t,e,a,l),ji(t)}function $a(t,e){return cu(t,null,null,e),ji(t)}function Mo(t,e,a){t.lanes|=a;var l=t.alternate;l!==null&&(l.lanes|=a);for(var n=!1,i=t.return;i!==null;)i.childLanes|=a,l=i.alternate,l!==null&&(l.childLanes|=a),i.tag===22&&(t=i.stateNode,t===null||t._visibility&1||(n=!0)),t=i,i=i.return;return t.tag===3?(i=t.stateNode,n&&e!==null&&(n=31-he(a),t=i.hiddenUpdates,l=t[n],l===null?t[n]=[e]:l.push(e),e.lane=a|536870912),i):null}function ji(t){if(50<vn)throw vn=0,Gs=null,Error(G(185));for(var e=t.return;e!==null;)t=e,e=t.return;return t.tag===3?t.stateNode:null}var dl={};function Sm(t,e,a,l){this.tag=t,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=l,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function ce(t,e,a,l){return new Sm(t,e,a,l)}function _r(t){return t=t.prototype,!(!t||!t.isReactComponent)}function $e(t,e){var a=t.alternate;return a===null?(a=ce(t.tag,e,t.key,t.mode),a.elementType=t.elementType,a.type=t.type,a.stateNode=t.stateNode,a.alternate=t,t.alternate=a):(a.pendingProps=e,a.type=t.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=t.flags&65011712,a.childLanes=t.childLanes,a.lanes=t.lanes,a.child=t.child,a.memoizedProps=t.memoizedProps,a.memoizedState=t.memoizedState,a.updateQueue=t.updateQueue,e=t.dependencies,a.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},a.sibling=t.sibling,a.index=t.index,a.ref=t.ref,a.refCleanup=t.refCleanup,a}function Ro(t,e){t.flags&=65011714;var a=t.alternate;return a===null?(t.childLanes=0,t.lanes=e,t.child=null,t.subtreeFlags=0,t.memoizedProps=null,t.memoizedState=null,t.updateQueue=null,t.dependencies=null,t.stateNode=null):(t.childLanes=a.childLanes,t.lanes=a.lanes,t.child=a.child,t.subtreeFlags=0,t.deletions=null,t.memoizedProps=a.memoizedProps,t.memoizedState=a.memoizedState,t.updateQueue=a.updateQueue,t.type=a.type,e=a.dependencies,t.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),t}function pi(t,e,a,l,n,i){var u=0;if(l=t,typeof t=="function")_r(t)&&(u=1);else if(typeof t=="string")u=T1(t,a,He.current)?26:t==="html"||t==="head"||t==="body"?27:5;else t:switch(t){case rs:return t=ce(31,a,e,n),t.elementType=rs,t.lanes=i,t;case nl:return La(a.children,n,i,e);case Pf:u=8,n|=24;break;case is:return t=ce(12,a,e,n|2),t.elementType=is,t.lanes=i,t;case us:return t=ce(13,a,e,n),t.elementType=us,t.lanes=i,t;case ss:return t=ce(19,a,e,n),t.elementType=ss,t.lanes=i,t;default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case Je:u=10;break t;case to:u=9;break t;case ur:u=11;break t;case sr:u=14;break t;case sa:u=16,l=null;break t}u=29,a=Error(G(130,t===null?"null":typeof t,"")),l=null}return e=ce(u,a,e,n),e.elementType=t,e.type=l,e.lanes=i,e}function La(t,e,a,l){return t=ce(7,t,l,e),t.lanes=a,t}function Mu(t,e,a){return t=ce(6,t,null,e),t.lanes=a,t}function Bo(t){var e=ce(18,null,null,0);return e.stateNode=t,e}function Ru(t,e,a){return e=ce(4,t.children!==null?t.children:[],t.key,e),e.lanes=a,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}var Dc=new WeakMap;function ze(t,e){if(typeof t=="object"&&t!==null){var a=Dc.get(t);return a!==void 0?a:(e={value:t,source:e,stack:oc(e)},Dc.set(t,e),e)}return{value:t,source:e,stack:oc(e)}}var hl=[],ml=0,Ui=null,xn=0,_e=[],Se=0,wa=null,Me=1,Re="";function Ve(t,e){hl[ml++]=xn,hl[ml++]=Ui,Ui=t,xn=e}function Ho(t,e,a){_e[Se++]=Me,_e[Se++]=Re,_e[Se++]=wa,wa=t;var l=Me;t=Re;var n=32-he(l)-1;l&=~(1<<n),a+=1;var i=32-he(e)+n;if(30<i){var u=n-n%5;i=(l&(1<<u)-1).toString(32),l>>=u,n-=u,Me=1<<32-he(e)+n|a<<n|l,Re=i+t}else Me=1<<i|a<<n|l,Re=t}function Sr(t){t.return!==null&&(Ve(t,1),Ho(t,1,0))}function xr(t){for(;t===Ui;)Ui=hl[--ml],hl[ml]=null,xn=hl[--ml],hl[ml]=null;for(;t===wa;)wa=_e[--Se],_e[Se]=null,Re=_e[--Se],_e[Se]=null,Me=_e[--Se],_e[Se]=null}function ko(t,e){_e[Se++]=Me,_e[Se++]=Re,_e[Se++]=wa,Me=e.id,Re=e.overflow,wa=t}var Kt=null,Et=null,ft=!1,ba=null,Ee=!1,xs=Error(G(519));function Oa(t){var e=Error(G(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw zn(ze(e,t)),xs}function jc(t){var e=t.stateNode,a=t.type,l=t.memoizedProps;switch(e[Vt]=t,e[ie]=l,a){case"dialog":st("cancel",e),st("close",e);break;case"iframe":case"object":case"embed":st("load",e);break;case"video":case"audio":for(a=0;a<wn.length;a++)st(wn[a],e);break;case"source":st("error",e);break;case"img":case"image":case"link":st("error",e),st("load",e);break;case"details":st("toggle",e);break;case"input":st("invalid",e),mo(e,l.value,l.defaultValue,l.checked,l.defaultChecked,l.type,l.name,!0);break;case"select":st("invalid",e);break;case"textarea":st("invalid",e),vo(e,l.value,l.defaultValue,l.children)}a=l.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||e.textContent===""+a||l.suppressHydrationWarning===!0||_h(e.textContent,a)?(l.popover!=null&&(st("beforetoggle",e),st("toggle",e)),l.onScroll!=null&&st("scroll",e),l.onScrollEnd!=null&&st("scrollend",e),l.onClick!=null&&(e.onclick=We),e=!0):e=!1,e||Oa(t,!0)}function Uc(t){for(Kt=t.return;Kt;)switch(Kt.tag){case 5:case 31:case 13:Ee=!1;return;case 27:case 3:Ee=!0;return;default:Kt=Kt.return}}function Pa(t){if(t!==Kt)return!1;if(!ft)return Uc(t),ft=!0,!1;var e=t.tag,a;if((a=e!==3&&e!==27)&&((a=e===5)&&(a=t.type,a=!(a!=="form"&&a!=="button")||Ks(t.type,t.memoizedProps)),a=!a),a&&Et&&Oa(t),Uc(t),e===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(G(317));Et=_f(t)}else if(e===31){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(G(317));Et=_f(t)}else e===27?(e=Et,ja(t.type)?(t=$s,$s=null,Et=t):Et=e):Et=Kt?Te(t.stateNode.nextSibling):null;return!0}function qa(){Et=Kt=null,ft=!1}function Bu(){var t=ba;return t!==null&&(le===null?le=t:le.push.apply(le,t),ba=null),t}function zn(t){ba===null?ba=[t]:ba.push(t)}var zs=ke(null),Ia=null,Fe=null;function ca(t,e,a){xt(zs,e._currentValue),e._currentValue=a}function Ie(t){t._currentValue=zs.current,Xt(zs)}function Es(t,e,a){for(;t!==null;){var l=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,l!==null&&(l.childLanes|=e)):l!==null&&(l.childLanes&e)!==e&&(l.childLanes|=e),t===a)break;t=t.return}}function As(t,e,a,l){var n=t.child;for(n!==null&&(n.return=t);n!==null;){var i=n.dependencies;if(i!==null){var u=n.child;i=i.firstContext;t:for(;i!==null;){var s=i;i=n;for(var r=0;r<e.length;r++)if(s.context===e[r]){i.lanes|=a,s=i.alternate,s!==null&&(s.lanes|=a),Es(i.return,a,t),l||(u=null);break t}i=s.next}}else if(n.tag===18){if(u=n.return,u===null)throw Error(G(341));u.lanes|=a,i=u.alternate,i!==null&&(i.lanes|=a),Es(u,a,t),u=null}else u=n.child;if(u!==null)u.return=n;else for(u=n;u!==null;){if(u===t){u=null;break}if(n=u.sibling,n!==null){n.return=u.return,u=n;break}u=u.return}n=u}}function Hl(t,e,a,l){t=null;for(var n=e,i=!1;n!==null;){if(!i){if(n.flags&524288)i=!0;else if(n.flags&262144)break}if(n.tag===10){var u=n.alternate;if(u===null)throw Error(G(387));if(u=u.memoizedProps,u!==null){var s=n.type;pe(n.pendingProps.value,u.value)||(t!==null?t.push(s):t=[s])}}else if(n===Ti.current){if(u=n.alternate,u===null)throw Error(G(387));u.memoizedState.memoizedState!==n.memoizedState.memoizedState&&(t!==null?t.push(Cn):t=[Cn])}n=n.return}t!==null&&As(e,t,a,l),e.flags|=262144}function Mi(t){for(t=t.firstContext;t!==null;){if(!pe(t.context._currentValue,t.memoizedValue))return!0;t=t.next}return!1}function Xa(t){Ia=t,Fe=null,t=t.dependencies,t!==null&&(t.firstContext=null)}function Jt(t){return Lo(Ia,t)}function ti(t,e){return Ia===null&&Xa(t),Lo(t,e)}function Lo(t,e){var a=e._currentValue;if(e={context:e,memoizedValue:a,next:null},Fe===null){if(t===null)throw Error(G(308));Fe=e,t.dependencies={lanes:0,firstContext:e},t.flags|=524288}else Fe=Fe.next=e;return a}var xm=typeof AbortController<"u"?AbortController:function(){var t=[],e=this.signal={aborted:!1,addEventListener:function(a,l){t.push(l)}};this.abort=function(){e.aborted=!0,t.forEach(function(a){return a()})}},zm=Zt.unstable_scheduleCallback,Em=Zt.unstable_NormalPriority,Ht={$$typeof:Je,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function zr(){return{controller:new xm,data:new Map,refCount:0}}function kn(t){t.refCount--,t.refCount===0&&zm(Em,function(){t.controller.abort()})}var rn=null,Ts=0,Tl=0,bl=null;function Am(t,e){if(rn===null){var a=rn=[];Ts=0,Tl=Jr(),bl={status:"pending",value:void 0,then:function(l){a.push(l)}}}return Ts++,e.then(Mc,Mc),e}function Mc(){if(--Ts===0&&rn!==null){bl!==null&&(bl.status="fulfilled");var t=rn;rn=null,Tl=0,bl=null;for(var e=0;e<t.length;e++)(0,t[e])()}}function Tm(t,e){var a=[],l={status:"pending",value:null,reason:null,then:function(n){a.push(n)}};return t.then(function(){l.status="fulfilled",l.value=e;for(var n=0;n<a.length;n++)(0,a[n])(e)},function(n){for(l.status="rejected",l.reason=n,n=0;n<a.length;n++)(0,a[n])(void 0)}),l}var Rc=lt.S;lt.S=function(t,e){Pd=oe(),typeof e=="object"&&e!==null&&typeof e.then=="function"&&Am(t,e),Rc!==null&&Rc(t,e)};var Za=ke(null);function Er(){var t=Za.current;return t!==null?t:_t.pooledCache}function vi(t,e){e===null?xt(Za,Za.current):xt(Za,e.pool)}function Zo(){var t=Er();return t===null?null:{parent:Ht._currentValue,pool:t}}var kl=Error(G(460)),Ar=Error(G(474)),fu=Error(G(542)),Ri={then:function(){}};function Bc(t){return t=t.status,t==="fulfilled"||t==="rejected"}function Yo(t,e,a){switch(a=t[a],a===void 0?t.push(e):a!==e&&(e.then(We,We),e=a),e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,kc(t),t;default:if(typeof e.status=="string")e.then(We,We);else{if(t=_t,t!==null&&100<t.shellSuspendCounter)throw Error(G(482));t=e,t.status="pending",t.then(function(l){if(e.status==="pending"){var n=e;n.status="fulfilled",n.value=l}},function(l){if(e.status==="pending"){var n=e;n.status="rejected",n.reason=l}})}switch(e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,kc(t),t}throw Ya=e,kl}}function Ba(t){try{var e=t._init;return e(t._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(Ya=a,kl):a}}var Ya=null;function Hc(){if(Ya===null)throw Error(G(459));var t=Ya;return Ya=null,t}function kc(t){if(t===kl||t===fu)throw Error(G(483))}var _l=null,En=0;function ei(t){var e=En;return En+=1,_l===null&&(_l=[]),Yo(_l,t,e)}function Jl(t,e){e=e.props.ref,t.ref=e!==void 0?e:null}function ai(t,e){throw e.$$typeof===d0?Error(G(525)):(t=Object.prototype.toString.call(e),Error(G(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)))}function Go(t){function e(c,d){if(t){var y=c.deletions;y===null?(c.deletions=[d],c.flags|=16):y.push(d)}}function a(c,d){if(!t)return null;for(;d!==null;)e(c,d),d=d.sibling;return null}function l(c){for(var d=new Map;c!==null;)c.key!==null?d.set(c.key,c):d.set(c.index,c),c=c.sibling;return d}function n(c,d){return c=$e(c,d),c.index=0,c.sibling=null,c}function i(c,d,y){return c.index=y,t?(y=c.alternate,y!==null?(y=y.index,y<d?(c.flags|=67108866,d):y):(c.flags|=67108866,d)):(c.flags|=1048576,d)}function u(c){return t&&c.alternate===null&&(c.flags|=67108866),c}function s(c,d,y,x){return d===null||d.tag!==6?(d=Mu(y,c.mode,x),d.return=c,d):(d=n(d,y),d.return=c,d)}function r(c,d,y,x){var w=y.type;return w===nl?b(c,d,y.props.children,x,y.key):d!==null&&(d.elementType===w||typeof w=="object"&&w!==null&&w.$$typeof===sa&&Ba(w)===d.type)?(d=n(d,y.props),Jl(d,y),d.return=c,d):(d=pi(y.type,y.key,y.props,null,c.mode,x),Jl(d,y),d.return=c,d)}function h(c,d,y,x){return d===null||d.tag!==4||d.stateNode.containerInfo!==y.containerInfo||d.stateNode.implementation!==y.implementation?(d=Ru(y,c.mode,x),d.return=c,d):(d=n(d,y.children||[]),d.return=c,d)}function b(c,d,y,x,w){return d===null||d.tag!==7?(d=La(y,c.mode,x,w),d.return=c,d):(d=n(d,y),d.return=c,d)}function g(c,d,y){if(typeof d=="string"&&d!==""||typeof d=="number"||typeof d=="bigint")return d=Mu(""+d,c.mode,y),d.return=c,d;if(typeof d=="object"&&d!==null){switch(d.$$typeof){case Jn:return y=pi(d.type,d.key,d.props,null,c.mode,y),Jl(y,d),y.return=c,y;case Il:return d=Ru(d,c.mode,y),d.return=c,d;case sa:return d=Ba(d),g(c,d,y)}if(Pl(d)||Ql(d))return d=La(d,c.mode,y,null),d.return=c,d;if(typeof d.then=="function")return g(c,ei(d),y);if(d.$$typeof===Je)return g(c,ti(c,d),y);ai(c,d)}return null}function m(c,d,y,x){var w=d!==null?d.key:null;if(typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint")return w!==null?null:s(c,d,""+y,x);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case Jn:return y.key===w?r(c,d,y,x):null;case Il:return y.key===w?h(c,d,y,x):null;case sa:return y=Ba(y),m(c,d,y,x)}if(Pl(y)||Ql(y))return w!==null?null:b(c,d,y,x,null);if(typeof y.then=="function")return m(c,d,ei(y),x);if(y.$$typeof===Je)return m(c,d,ti(c,y),x);ai(c,y)}return null}function o(c,d,y,x,w){if(typeof x=="string"&&x!==""||typeof x=="number"||typeof x=="bigint")return c=c.get(y)||null,s(d,c,""+x,w);if(typeof x=="object"&&x!==null){switch(x.$$typeof){case Jn:return c=c.get(x.key===null?y:x.key)||null,r(d,c,x,w);case Il:return c=c.get(x.key===null?y:x.key)||null,h(d,c,x,w);case sa:return x=Ba(x),o(c,d,y,x,w)}if(Pl(x)||Ql(x))return c=c.get(y)||null,b(d,c,x,w,null);if(typeof x.then=="function")return o(c,d,y,ei(x),w);if(x.$$typeof===Je)return o(c,d,y,ti(d,x),w);ai(d,x)}return null}function _(c,d,y,x){for(var w=null,M=null,T=d,D=d=0,C=null;T!==null&&D<y.length;D++){T.index>D?(C=T,T=null):C=T.sibling;var k=m(c,T,y[D],x);if(k===null){T===null&&(T=C);break}t&&T&&k.alternate===null&&e(c,T),d=i(k,d,D),M===null?w=k:M.sibling=k,M=k,T=C}if(D===y.length)return a(c,T),ft&&Ve(c,D),w;if(T===null){for(;D<y.length;D++)T=g(c,y[D],x),T!==null&&(d=i(T,d,D),M===null?w=T:M.sibling=T,M=T);return ft&&Ve(c,D),w}for(T=l(T);D<y.length;D++)C=o(T,c,D,y[D],x),C!==null&&(t&&C.alternate!==null&&T.delete(C.key===null?D:C.key),d=i(C,d,D),M===null?w=C:M.sibling=C,M=C);return t&&T.forEach(function(F){return e(c,F)}),ft&&Ve(c,D),w}function v(c,d,y,x){if(y==null)throw Error(G(151));for(var w=null,M=null,T=d,D=d=0,C=null,k=y.next();T!==null&&!k.done;D++,k=y.next()){T.index>D?(C=T,T=null):C=T.sibling;var F=m(c,T,k.value,x);if(F===null){T===null&&(T=C);break}t&&T&&F.alternate===null&&e(c,T),d=i(F,d,D),M===null?w=F:M.sibling=F,M=F,T=C}if(k.done)return a(c,T),ft&&Ve(c,D),w;if(T===null){for(;!k.done;D++,k=y.next())k=g(c,k.value,x),k!==null&&(d=i(k,d,D),M===null?w=k:M.sibling=k,M=k);return ft&&Ve(c,D),w}for(T=l(T);!k.done;D++,k=y.next())k=o(T,c,D,k.value,x),k!==null&&(t&&k.alternate!==null&&T.delete(k.key===null?D:k.key),d=i(k,d,D),M===null?w=k:M.sibling=k,M=k);return t&&T.forEach(function(A){return e(c,A)}),ft&&Ve(c,D),w}function S(c,d,y,x){if(typeof y=="object"&&y!==null&&y.type===nl&&y.key===null&&(y=y.props.children),typeof y=="object"&&y!==null){switch(y.$$typeof){case Jn:t:{for(var w=y.key;d!==null;){if(d.key===w){if(w=y.type,w===nl){if(d.tag===7){a(c,d.sibling),x=n(d,y.props.children),x.return=c,c=x;break t}}else if(d.elementType===w||typeof w=="object"&&w!==null&&w.$$typeof===sa&&Ba(w)===d.type){a(c,d.sibling),x=n(d,y.props),Jl(x,y),x.return=c,c=x;break t}a(c,d);break}else e(c,d);d=d.sibling}y.type===nl?(x=La(y.props.children,c.mode,x,y.key),x.return=c,c=x):(x=pi(y.type,y.key,y.props,null,c.mode,x),Jl(x,y),x.return=c,c=x)}return u(c);case Il:t:{for(w=y.key;d!==null;){if(d.key===w)if(d.tag===4&&d.stateNode.containerInfo===y.containerInfo&&d.stateNode.implementation===y.implementation){a(c,d.sibling),x=n(d,y.children||[]),x.return=c,c=x;break t}else{a(c,d);break}else e(c,d);d=d.sibling}x=Ru(y,c.mode,x),x.return=c,c=x}return u(c);case sa:return y=Ba(y),S(c,d,y,x)}if(Pl(y))return _(c,d,y,x);if(Ql(y)){if(w=Ql(y),typeof w!="function")throw Error(G(150));return y=w.call(y),v(c,d,y,x)}if(typeof y.then=="function")return S(c,d,ei(y),x);if(y.$$typeof===Je)return S(c,d,ti(c,y),x);ai(c,y)}return typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint"?(y=""+y,d!==null&&d.tag===6?(a(c,d.sibling),x=n(d,y),x.return=c,c=x):(a(c,d),x=Mu(y,c.mode,x),x.return=c,c=x),u(c)):a(c,d)}return function(c,d,y,x){try{En=0;var w=S(c,d,y,x);return _l=null,w}catch(T){if(T===kl||T===fu)throw T;var M=ce(29,T,null,c.mode);return M.lanes=x,M.return=c,M}finally{}}}var Qa=Go(!0),qo=Go(!1),ra=!1;function Tr(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function ws(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,callbacks:null})}function _a(t){return{lane:t,tag:0,payload:null,callback:null,next:null}}function Sa(t,e,a){var l=t.updateQueue;if(l===null)return null;if(l=l.shared,ht&2){var n=l.pending;return n===null?e.next=e:(e.next=n.next,n.next=e),l.pending=e,e=ji(t),Mo(t,null,a),e}return cu(t,l,e,a),ji(t)}function cn(t,e,a){if(e=e.updateQueue,e!==null&&(e=e.shared,(a&4194048)!==0)){var l=e.lanes;l&=t.pendingLanes,a|=l,e.lanes=a,uo(t,a)}}function Hu(t,e){var a=t.updateQueue,l=t.alternate;if(l!==null&&(l=l.updateQueue,a===l)){var n=null,i=null;if(a=a.firstBaseUpdate,a!==null){do{var u={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};i===null?n=i=u:i=i.next=u,a=a.next}while(a!==null);i===null?n=i=e:i=i.next=e}else n=i=e;a={baseState:l.baseState,firstBaseUpdate:n,lastBaseUpdate:i,shared:l.shared,callbacks:l.callbacks},t.updateQueue=a;return}t=a.lastBaseUpdate,t===null?a.firstBaseUpdate=e:t.next=e,a.lastBaseUpdate=e}var Os=!1;function fn(){if(Os){var t=bl;if(t!==null)throw t}}function on(t,e,a,l){Os=!1;var n=t.updateQueue;ra=!1;var i=n.firstBaseUpdate,u=n.lastBaseUpdate,s=n.shared.pending;if(s!==null){n.shared.pending=null;var r=s,h=r.next;r.next=null,u===null?i=h:u.next=h,u=r;var b=t.alternate;b!==null&&(b=b.updateQueue,s=b.lastBaseUpdate,s!==u&&(s===null?b.firstBaseUpdate=h:s.next=h,b.lastBaseUpdate=r))}if(i!==null){var g=n.baseState;u=0,b=h=r=null,s=i;do{var m=s.lane&-536870913,o=m!==s.lane;if(o?(ct&m)===m:(l&m)===m){m!==0&&m===Tl&&(Os=!0),b!==null&&(b=b.next={lane:0,tag:s.tag,payload:s.payload,callback:null,next:null});t:{var _=t,v=s;m=e;var S=a;switch(v.tag){case 1:if(_=v.payload,typeof _=="function"){g=_.call(S,g,m);break t}g=_;break t;case 3:_.flags=_.flags&-65537|128;case 0:if(_=v.payload,m=typeof _=="function"?_.call(S,g,m):_,m==null)break t;g=Tt({},g,m);break t;case 2:ra=!0}}m=s.callback,m!==null&&(t.flags|=64,o&&(t.flags|=8192),o=n.callbacks,o===null?n.callbacks=[m]:o.push(m))}else o={lane:m,tag:s.tag,payload:s.payload,callback:s.callback,next:null},b===null?(h=b=o,r=g):b=b.next=o,u|=m;if(s=s.next,s===null){if(s=n.shared.pending,s===null)break;o=s,s=o.next,o.next=null,n.lastBaseUpdate=o,n.shared.pending=null}}while(!0);b===null&&(r=g),n.baseState=r,n.firstBaseUpdate=h,n.lastBaseUpdate=b,i===null&&(n.shared.lanes=0),Na|=u,t.lanes=u,t.memoizedState=g}}function Xo(t,e){if(typeof t!="function")throw Error(G(191,t));t.call(e)}function Qo(t,e){var a=t.callbacks;if(a!==null)for(t.callbacks=null,t=0;t<a.length;t++)Xo(a[t],e)}var wl=ke(null),Bi=ke(0);function Lc(t,e){t=na,xt(Bi,t),xt(wl,e),na=t|e.baseLanes}function Cs(){xt(Bi,na),xt(wl,wl.current)}function wr(){na=Bi.current,Xt(wl),Xt(Bi)}var ve=ke(null),Ae=null;function fa(t){var e=t.alternate;xt(Ut,Ut.current&1),xt(ve,t),Ae===null&&(e===null||wl.current!==null||e.memoizedState!==null)&&(Ae=t)}function Ns(t){xt(Ut,Ut.current),xt(ve,t),Ae===null&&(Ae=t)}function Vo(t){t.tag===22?(xt(Ut,Ut.current),xt(ve,t),Ae===null&&(Ae=t)):oa()}function oa(){xt(Ut,Ut.current),xt(ve,ve.current)}function re(t){Xt(ve),Ae===t&&(Ae=null),Xt(Ut)}var Ut=ke(0);function Hi(t){for(var e=t;e!==null;){if(e.tag===13){var a=e.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||Ws(a)||Fs(a)))return e}else if(e.tag===19&&(e.memoizedProps.revealOrder==="forwards"||e.memoizedProps.revealOrder==="backwards"||e.memoizedProps.revealOrder==="unstable_legacy-backwards"||e.memoizedProps.revealOrder==="together")){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var ea=0,it=null,bt=null,Rt=null,ki=!1,Sl=!1,Va=!1,Li=0,An=0,xl=null,wm=0;function Ot(){throw Error(G(321))}function Or(t,e){if(e===null)return!1;for(var a=0;a<e.length&&a<t.length;a++)if(!pe(t[a],e[a]))return!1;return!0}function Cr(t,e,a,l,n,i){return ea=i,it=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,lt.H=t===null||t.memoizedState===null?zd:Zr,Va=!1,i=a(l,n),Va=!1,Sl&&(i=Jo(e,a,l,n)),Ko(t),i}function Ko(t){lt.H=Tn;var e=bt!==null&&bt.next!==null;if(ea=0,Rt=bt=it=null,ki=!1,An=0,xl=null,e)throw Error(G(300));t===null||kt||(t=t.dependencies,t!==null&&Mi(t)&&(kt=!0))}function Jo(t,e,a,l){it=t;var n=0;do{if(Sl&&(xl=null),An=0,Sl=!1,25<=n)throw Error(G(301));if(n+=1,Rt=bt=null,t.updateQueue!=null){var i=t.updateQueue;i.lastEffect=null,i.events=null,i.stores=null,i.memoCache!=null&&(i.memoCache.index=0)}lt.H=Ed,i=e(a,l)}while(Sl);return i}function Om(){var t=lt.H,e=t.useState()[0];return e=typeof e.then=="function"?Ln(e):e,t=t.useState()[0],(bt!==null?bt.memoizedState:null)!==t&&(it.flags|=1024),e}function Nr(){var t=Li!==0;return Li=0,t}function Dr(t,e,a){e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~a}function jr(t){if(ki){for(t=t.memoizedState;t!==null;){var e=t.queue;e!==null&&(e.pending=null),t=t.next}ki=!1}ea=0,Rt=bt=it=null,Sl=!1,An=Li=0,xl=null}function $t(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Rt===null?it.memoizedState=Rt=t:Rt=Rt.next=t,Rt}function Mt(){if(bt===null){var t=it.alternate;t=t!==null?t.memoizedState:null}else t=bt.next;var e=Rt===null?it.memoizedState:Rt.next;if(e!==null)Rt=e,bt=t;else{if(t===null)throw it.alternate===null?Error(G(467)):Error(G(310));bt=t,t={memoizedState:bt.memoizedState,baseState:bt.baseState,baseQueue:bt.baseQueue,queue:bt.queue,next:null},Rt===null?it.memoizedState=Rt=t:Rt=Rt.next=t}return Rt}function ou(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Ln(t){var e=An;return An+=1,xl===null&&(xl=[]),t=Yo(xl,t,e),e=it,(Rt===null?e.memoizedState:Rt.next)===null&&(e=e.alternate,lt.H=e===null||e.memoizedState===null?zd:Zr),t}function du(t){if(t!==null&&typeof t=="object"){if(typeof t.then=="function")return Ln(t);if(t.$$typeof===Je)return Jt(t)}throw Error(G(438,String(t)))}function Ur(t){var e=null,a=it.updateQueue;if(a!==null&&(e=a.memoCache),e==null){var l=it.alternate;l!==null&&(l=l.updateQueue,l!==null&&(l=l.memoCache,l!=null&&(e={data:l.data.map(function(n){return n.slice()}),index:0})))}if(e==null&&(e={data:[],index:0}),a===null&&(a=ou(),it.updateQueue=a),a.memoCache=e,a=e.data[e.index],a===void 0)for(a=e.data[e.index]=Array(t),l=0;l<t;l++)a[l]=h0;return e.index++,a}function aa(t,e){return typeof e=="function"?e(t):e}function yi(t){var e=Mt();return Mr(e,bt,t)}function Mr(t,e,a){var l=t.queue;if(l===null)throw Error(G(311));l.lastRenderedReducer=a;var n=t.baseQueue,i=l.pending;if(i!==null){if(n!==null){var u=n.next;n.next=i.next,i.next=u}e.baseQueue=n=i,l.pending=null}if(i=t.baseState,n===null)t.memoizedState=i;else{e=n.next;var s=u=null,r=null,h=e,b=!1;do{var g=h.lane&-536870913;if(g!==h.lane?(ct&g)===g:(ea&g)===g){var m=h.revertLane;if(m===0)r!==null&&(r=r.next={lane:0,revertLane:0,gesture:null,action:h.action,hasEagerState:h.hasEagerState,eagerState:h.eagerState,next:null}),g===Tl&&(b=!0);else if((ea&m)===m){h=h.next,m===Tl&&(b=!0);continue}else g={lane:0,revertLane:h.revertLane,gesture:null,action:h.action,hasEagerState:h.hasEagerState,eagerState:h.eagerState,next:null},r===null?(s=r=g,u=i):r=r.next=g,it.lanes|=m,Na|=m;g=h.action,Va&&a(i,g),i=h.hasEagerState?h.eagerState:a(i,g)}else m={lane:g,revertLane:h.revertLane,gesture:h.gesture,action:h.action,hasEagerState:h.hasEagerState,eagerState:h.eagerState,next:null},r===null?(s=r=m,u=i):r=r.next=m,it.lanes|=g,Na|=g;h=h.next}while(h!==null&&h!==e);if(r===null?u=i:r.next=s,!pe(i,t.memoizedState)&&(kt=!0,b&&(a=bl,a!==null)))throw a;t.memoizedState=i,t.baseState=u,t.baseQueue=r,l.lastRenderedState=i}return n===null&&(l.lanes=0),[t.memoizedState,l.dispatch]}function ku(t){var e=Mt(),a=e.queue;if(a===null)throw Error(G(311));a.lastRenderedReducer=t;var l=a.dispatch,n=a.pending,i=e.memoizedState;if(n!==null){a.pending=null;var u=n=n.next;do i=t(i,u.action),u=u.next;while(u!==n);pe(i,e.memoizedState)||(kt=!0),e.memoizedState=i,e.baseQueue===null&&(e.baseState=i),a.lastRenderedState=i}return[i,l]}function Wo(t,e,a){var l=it,n=Mt(),i=ft;if(i){if(a===void 0)throw Error(G(407));a=a()}else a=e();var u=!pe((bt||n).memoizedState,a);if(u&&(n.memoizedState=a,kt=!0),n=n.queue,Rr(Io.bind(null,l,n,t),[t]),n.getSnapshot!==e||u||Rt!==null&&Rt.memoizedState.tag&1){if(l.flags|=2048,Ol(9,{destroy:void 0},$o.bind(null,l,n,a,e),null),_t===null)throw Error(G(349));i||ea&127||Fo(l,e,a)}return a}function Fo(t,e,a){t.flags|=16384,t={getSnapshot:e,value:a},e=it.updateQueue,e===null?(e=ou(),it.updateQueue=e,e.stores=[t]):(a=e.stores,a===null?e.stores=[t]:a.push(t))}function $o(t,e,a,l){e.value=a,e.getSnapshot=l,Po(e)&&td(t)}function Io(t,e,a){return a(function(){Po(e)&&td(t)})}function Po(t){var e=t.getSnapshot;t=t.value;try{var a=e();return!pe(t,a)}catch{return!0}}function td(t){var e=$a(t,2);e!==null&&ne(e,t,2)}function Ds(t){var e=$t();if(typeof t=="function"){var a=t;if(t=a(),Va){ha(!0);try{a()}finally{ha(!1)}}}return e.memoizedState=e.baseState=t,e.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:aa,lastRenderedState:t},e}function ed(t,e,a,l){return t.baseState=a,Mr(t,bt,typeof l=="function"?l:aa)}function Cm(t,e,a,l,n){if(mu(t))throw Error(G(485));if(t=e.action,t!==null){var i={payload:n,action:t,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(u){i.listeners.push(u)}};lt.T!==null?a(!0):i.isTransition=!1,l(i),a=e.pending,a===null?(i.next=e.pending=i,ad(e,i)):(i.next=a.next,e.pending=a.next=i)}}function ad(t,e){var a=e.action,l=e.payload,n=t.state;if(e.isTransition){var i=lt.T,u={};lt.T=u;try{var s=a(n,l),r=lt.S;r!==null&&r(u,s),Zc(t,e,s)}catch(h){js(t,e,h)}finally{i!==null&&u.types!==null&&(i.types=u.types),lt.T=i}}else try{i=a(n,l),Zc(t,e,i)}catch(h){js(t,e,h)}}function Zc(t,e,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(l){Yc(t,e,l)},function(l){return js(t,e,l)}):Yc(t,e,a)}function Yc(t,e,a){e.status="fulfilled",e.value=a,ld(e),t.state=a,e=t.pending,e!==null&&(a=e.next,a===e?t.pending=null:(a=a.next,e.next=a,ad(t,a)))}function js(t,e,a){var l=t.pending;if(t.pending=null,l!==null){l=l.next;do e.status="rejected",e.reason=a,ld(e),e=e.next;while(e!==l)}t.action=null}function ld(t){t=t.listeners;for(var e=0;e<t.length;e++)(0,t[e])()}function nd(t,e){return e}function Gc(t,e){if(ft){var a=_t.formState;if(a!==null){t:{var l=it;if(ft){if(Et){e:{for(var n=Et,i=Ee;n.nodeType!==8;){if(!i){n=null;break e}if(n=Te(n.nextSibling),n===null){n=null;break e}}i=n.data,n=i==="F!"||i==="F"?n:null}if(n){Et=Te(n.nextSibling),l=n.data==="F!";break t}}Oa(l)}l=!1}l&&(e=a[0])}}return a=$t(),a.memoizedState=a.baseState=e,l={pending:null,lanes:0,dispatch:null,lastRenderedReducer:nd,lastRenderedState:e},a.queue=l,a=_d.bind(null,it,l),l.dispatch=a,l=Ds(!1),i=Lr.bind(null,it,!1,l.queue),l=$t(),n={state:e,dispatch:null,action:t,pending:null},l.queue=n,a=Cm.bind(null,it,n,i,a),n.dispatch=a,l.memoizedState=t,[e,a,!1]}function qc(t){var e=Mt();return id(e,bt,t)}function id(t,e,a){if(e=Mr(t,e,nd)[0],t=yi(aa)[0],typeof e=="object"&&e!==null&&typeof e.then=="function")try{var l=Ln(e)}catch(u){throw u===kl?fu:u}else l=e;e=Mt();var n=e.queue,i=n.dispatch;return a!==e.memoizedState&&(it.flags|=2048,Ol(9,{destroy:void 0},Nm.bind(null,n,a),null)),[l,i,t]}function Nm(t,e){t.action=e}function Xc(t){var e=Mt(),a=bt;if(a!==null)return id(e,a,t);Mt(),e=e.memoizedState,a=Mt();var l=a.queue.dispatch;return a.memoizedState=t,[e,l,!1]}function Ol(t,e,a,l){return t={tag:t,create:a,deps:l,inst:e,next:null},e=it.updateQueue,e===null&&(e=ou(),it.updateQueue=e),a=e.lastEffect,a===null?e.lastEffect=t.next=t:(l=a.next,a.next=t,t.next=l,e.lastEffect=t),t}function ud(){return Mt().memoizedState}function gi(t,e,a,l){var n=$t();it.flags|=t,n.memoizedState=Ol(1|e,{destroy:void 0},a,l===void 0?null:l)}function hu(t,e,a,l){var n=Mt();l=l===void 0?null:l;var i=n.memoizedState.inst;bt!==null&&l!==null&&Or(l,bt.memoizedState.deps)?n.memoizedState=Ol(e,i,a,l):(it.flags|=t,n.memoizedState=Ol(1|e,i,a,l))}function Qc(t,e){gi(8390656,8,t,e)}function Rr(t,e){hu(2048,8,t,e)}function Dm(t){it.flags|=4;var e=it.updateQueue;if(e===null)e=ou(),it.updateQueue=e,e.events=[t];else{var a=e.events;a===null?e.events=[t]:a.push(t)}}function sd(t){var e=Mt().memoizedState;return Dm({ref:e,nextImpl:t}),function(){if(ht&2)throw Error(G(440));return e.impl.apply(void 0,arguments)}}function rd(t,e){return hu(4,2,t,e)}function cd(t,e){return hu(4,4,t,e)}function fd(t,e){if(typeof e=="function"){t=t();var a=e(t);return function(){typeof a=="function"?a():e(null)}}if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function od(t,e,a){a=a!=null?a.concat([t]):null,hu(4,4,fd.bind(null,e,t),a)}function Br(){}function dd(t,e){var a=Mt();e=e===void 0?null:e;var l=a.memoizedState;return e!==null&&Or(e,l[1])?l[0]:(a.memoizedState=[t,e],t)}function hd(t,e){var a=Mt();e=e===void 0?null:e;var l=a.memoizedState;if(e!==null&&Or(e,l[1]))return l[0];if(l=t(),Va){ha(!0);try{t()}finally{ha(!1)}}return a.memoizedState=[l,e],l}function Hr(t,e,a){return a===void 0||ea&1073741824&&!(ct&261930)?t.memoizedState=e:(t.memoizedState=a,t=eh(),it.lanes|=t,Na|=t,a)}function md(t,e,a,l){return pe(a,e)?a:wl.current!==null?(t=Hr(t,a,l),pe(t,e)||(kt=!0),t):!(ea&42)||ea&1073741824&&!(ct&261930)?(kt=!0,t.memoizedState=a):(t=eh(),it.lanes|=t,Na|=t,e)}function pd(t,e,a,l,n){var i=mt.p;mt.p=i!==0&&8>i?i:8;var u=lt.T,s={};lt.T=s,Lr(t,!1,e,a);try{var r=n(),h=lt.S;if(h!==null&&h(s,r),r!==null&&typeof r=="object"&&typeof r.then=="function"){var b=Tm(r,l);dn(t,e,b,me(t))}else dn(t,e,l,me(t))}catch(g){dn(t,e,{then:function(){},status:"rejected",reason:g},me())}finally{mt.p=i,u!==null&&s.types!==null&&(u.types=s.types),lt.T=u}}function jm(){}function Us(t,e,a,l){if(t.tag!==5)throw Error(G(476));var n=vd(t).queue;pd(t,n,e,ka,a===null?jm:function(){return yd(t),a(l)})}function vd(t){var e=t.memoizedState;if(e!==null)return e;e={memoizedState:ka,baseState:ka,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:aa,lastRenderedState:ka},next:null};var a={};return e.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:aa,lastRenderedState:a},next:null},t.memoizedState=e,t=t.alternate,t!==null&&(t.memoizedState=e),e}function yd(t){var e=vd(t);e.next===null&&(e=t.alternate.memoizedState),dn(t,e.next.queue,{},me())}function kr(){return Jt(Cn)}function gd(){return Mt().memoizedState}function bd(){return Mt().memoizedState}function Um(t){for(var e=t.return;e!==null;){switch(e.tag){case 24:case 3:var a=me();t=_a(a);var l=Sa(e,t,a);l!==null&&(ne(l,e,a),cn(l,e,a)),e={cache:zr()},t.payload=e;return}e=e.return}}function Mm(t,e,a){var l=me();a={lane:l,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},mu(t)?Sd(e,a):(a=br(t,e,a,l),a!==null&&(ne(a,t,l),xd(a,e,l)))}function _d(t,e,a){var l=me();dn(t,e,a,l)}function dn(t,e,a,l){var n={lane:l,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(mu(t))Sd(e,n);else{var i=t.alternate;if(t.lanes===0&&(i===null||i.lanes===0)&&(i=e.lastRenderedReducer,i!==null))try{var u=e.lastRenderedState,s=i(u,a);if(n.hasEagerState=!0,n.eagerState=s,pe(s,u))return cu(t,e,n,0),_t===null&&ru(),!1}catch{}finally{}if(a=br(t,e,n,l),a!==null)return ne(a,t,l),xd(a,e,l),!0}return!1}function Lr(t,e,a,l){if(l={lane:2,revertLane:Jr(),gesture:null,action:l,hasEagerState:!1,eagerState:null,next:null},mu(t)){if(e)throw Error(G(479))}else e=br(t,a,l,2),e!==null&&ne(e,t,2)}function mu(t){var e=t.alternate;return t===it||e!==null&&e===it}function Sd(t,e){Sl=ki=!0;var a=t.pending;a===null?e.next=e:(e.next=a.next,a.next=e),t.pending=e}function xd(t,e,a){if(a&4194048){var l=e.lanes;l&=t.pendingLanes,a|=l,e.lanes=a,uo(t,a)}}var Tn={readContext:Jt,use:du,useCallback:Ot,useContext:Ot,useEffect:Ot,useImperativeHandle:Ot,useLayoutEffect:Ot,useInsertionEffect:Ot,useMemo:Ot,useReducer:Ot,useRef:Ot,useState:Ot,useDebugValue:Ot,useDeferredValue:Ot,useTransition:Ot,useSyncExternalStore:Ot,useId:Ot,useHostTransitionStatus:Ot,useFormState:Ot,useActionState:Ot,useOptimistic:Ot,useMemoCache:Ot,useCacheRefresh:Ot};Tn.useEffectEvent=Ot;var zd={readContext:Jt,use:du,useCallback:function(t,e){return $t().memoizedState=[t,e===void 0?null:e],t},useContext:Jt,useEffect:Qc,useImperativeHandle:function(t,e,a){a=a!=null?a.concat([t]):null,gi(4194308,4,fd.bind(null,e,t),a)},useLayoutEffect:function(t,e){return gi(4194308,4,t,e)},useInsertionEffect:function(t,e){gi(4,2,t,e)},useMemo:function(t,e){var a=$t();e=e===void 0?null:e;var l=t();if(Va){ha(!0);try{t()}finally{ha(!1)}}return a.memoizedState=[l,e],l},useReducer:function(t,e,a){var l=$t();if(a!==void 0){var n=a(e);if(Va){ha(!0);try{a(e)}finally{ha(!1)}}}else n=e;return l.memoizedState=l.baseState=n,t={pending:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:n},l.queue=t,t=t.dispatch=Mm.bind(null,it,t),[l.memoizedState,t]},useRef:function(t){var e=$t();return t={current:t},e.memoizedState=t},useState:function(t){t=Ds(t);var e=t.queue,a=_d.bind(null,it,e);return e.dispatch=a,[t.memoizedState,a]},useDebugValue:Br,useDeferredValue:function(t,e){var a=$t();return Hr(a,t,e)},useTransition:function(){var t=Ds(!1);return t=pd.bind(null,it,t.queue,!0,!1),$t().memoizedState=t,[!1,t]},useSyncExternalStore:function(t,e,a){var l=it,n=$t();if(ft){if(a===void 0)throw Error(G(407));a=a()}else{if(a=e(),_t===null)throw Error(G(349));ct&127||Fo(l,e,a)}n.memoizedState=a;var i={value:a,getSnapshot:e};return n.queue=i,Qc(Io.bind(null,l,i,t),[t]),l.flags|=2048,Ol(9,{destroy:void 0},$o.bind(null,l,i,a,e),null),a},useId:function(){var t=$t(),e=_t.identifierPrefix;if(ft){var a=Re,l=Me;a=(l&~(1<<32-he(l)-1)).toString(32)+a,e="_"+e+"R_"+a,a=Li++,0<a&&(e+="H"+a.toString(32)),e+="_"}else a=wm++,e="_"+e+"r_"+a.toString(32)+"_";return t.memoizedState=e},useHostTransitionStatus:kr,useFormState:Gc,useActionState:Gc,useOptimistic:function(t){var e=$t();e.memoizedState=e.baseState=t;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return e.queue=a,e=Lr.bind(null,it,!0,a),a.dispatch=e,[t,e]},useMemoCache:Ur,useCacheRefresh:function(){return $t().memoizedState=Um.bind(null,it)},useEffectEvent:function(t){var e=$t(),a={impl:t};return e.memoizedState=a,function(){if(ht&2)throw Error(G(440));return a.impl.apply(void 0,arguments)}}},Zr={readContext:Jt,use:du,useCallback:dd,useContext:Jt,useEffect:Rr,useImperativeHandle:od,useInsertionEffect:rd,useLayoutEffect:cd,useMemo:hd,useReducer:yi,useRef:ud,useState:function(){return yi(aa)},useDebugValue:Br,useDeferredValue:function(t,e){var a=Mt();return md(a,bt.memoizedState,t,e)},useTransition:function(){var t=yi(aa)[0],e=Mt().memoizedState;return[typeof t=="boolean"?t:Ln(t),e]},useSyncExternalStore:Wo,useId:gd,useHostTransitionStatus:kr,useFormState:qc,useActionState:qc,useOptimistic:function(t,e){var a=Mt();return ed(a,bt,t,e)},useMemoCache:Ur,useCacheRefresh:bd};Zr.useEffectEvent=sd;var Ed={readContext:Jt,use:du,useCallback:dd,useContext:Jt,useEffect:Rr,useImperativeHandle:od,useInsertionEffect:rd,useLayoutEffect:cd,useMemo:hd,useReducer:ku,useRef:ud,useState:function(){return ku(aa)},useDebugValue:Br,useDeferredValue:function(t,e){var a=Mt();return bt===null?Hr(a,t,e):md(a,bt.memoizedState,t,e)},useTransition:function(){var t=ku(aa)[0],e=Mt().memoizedState;return[typeof t=="boolean"?t:Ln(t),e]},useSyncExternalStore:Wo,useId:gd,useHostTransitionStatus:kr,useFormState:Xc,useActionState:Xc,useOptimistic:function(t,e){var a=Mt();return bt!==null?ed(a,bt,t,e):(a.baseState=t,[t,a.queue.dispatch])},useMemoCache:Ur,useCacheRefresh:bd};Ed.useEffectEvent=sd;function Lu(t,e,a,l){e=t.memoizedState,a=a(l,e),a=a==null?e:Tt({},e,a),t.memoizedState=a,t.lanes===0&&(t.updateQueue.baseState=a)}var Ms={enqueueSetState:function(t,e,a){t=t._reactInternals;var l=me(),n=_a(l);n.payload=e,a!=null&&(n.callback=a),e=Sa(t,n,l),e!==null&&(ne(e,t,l),cn(e,t,l))},enqueueReplaceState:function(t,e,a){t=t._reactInternals;var l=me(),n=_a(l);n.tag=1,n.payload=e,a!=null&&(n.callback=a),e=Sa(t,n,l),e!==null&&(ne(e,t,l),cn(e,t,l))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var a=me(),l=_a(a);l.tag=2,e!=null&&(l.callback=e),e=Sa(t,l,a),e!==null&&(ne(e,t,a),cn(e,t,a))}};function Vc(t,e,a,l,n,i,u){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(l,i,u):e.prototype&&e.prototype.isPureReactComponent?!Sn(a,l)||!Sn(n,i):!0}function Kc(t,e,a,l){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(a,l),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(a,l),e.state!==t&&Ms.enqueueReplaceState(e,e.state,null)}function Ka(t,e){var a=e;if("ref"in e){a={};for(var l in e)l!=="ref"&&(a[l]=e[l])}if(t=t.defaultProps){a===e&&(a=Tt({},a));for(var n in t)a[n]===void 0&&(a[n]=t[n])}return a}function Ad(t){Di(t)}function Td(t){console.error(t)}function wd(t){Di(t)}function Zi(t,e){try{var a=t.onUncaughtError;a(e.value,{componentStack:e.stack})}catch(l){setTimeout(function(){throw l})}}function Jc(t,e,a){try{var l=t.onCaughtError;l(a.value,{componentStack:a.stack,errorBoundary:e.tag===1?e.stateNode:null})}catch(n){setTimeout(function(){throw n})}}function Rs(t,e,a){return a=_a(a),a.tag=3,a.payload={element:null},a.callback=function(){Zi(t,e)},a}function Od(t){return t=_a(t),t.tag=3,t}function Cd(t,e,a,l){var n=a.type.getDerivedStateFromError;if(typeof n=="function"){var i=l.value;t.payload=function(){return n(i)},t.callback=function(){Jc(e,a,l)}}var u=a.stateNode;u!==null&&typeof u.componentDidCatch=="function"&&(t.callback=function(){Jc(e,a,l),typeof n!="function"&&(xa===null?xa=new Set([this]):xa.add(this));var s=l.stack;this.componentDidCatch(l.value,{componentStack:s!==null?s:""})})}function Rm(t,e,a,l,n){if(a.flags|=32768,l!==null&&typeof l=="object"&&typeof l.then=="function"){if(e=a.alternate,e!==null&&Hl(e,a,n,!0),a=ve.current,a!==null){switch(a.tag){case 31:case 13:return Ae===null?Qi():a.alternate===null&&Ct===0&&(Ct=3),a.flags&=-257,a.flags|=65536,a.lanes=n,l===Ri?a.flags|=16384:(e=a.updateQueue,e===null?a.updateQueue=new Set([l]):e.add(l),Fu(t,l,n)),!1;case 22:return a.flags|=65536,l===Ri?a.flags|=16384:(e=a.updateQueue,e===null?(e={transitions:null,markerInstances:null,retryQueue:new Set([l])},a.updateQueue=e):(a=e.retryQueue,a===null?e.retryQueue=new Set([l]):a.add(l)),Fu(t,l,n)),!1}throw Error(G(435,a.tag))}return Fu(t,l,n),Qi(),!1}if(ft)return e=ve.current,e!==null?(!(e.flags&65536)&&(e.flags|=256),e.flags|=65536,e.lanes=n,l!==xs&&(t=Error(G(422),{cause:l}),zn(ze(t,a)))):(l!==xs&&(e=Error(G(423),{cause:l}),zn(ze(e,a))),t=t.current.alternate,t.flags|=65536,n&=-n,t.lanes|=n,l=ze(l,a),n=Rs(t.stateNode,l,n),Hu(t,n),Ct!==4&&(Ct=2)),!1;var i=Error(G(520),{cause:l});if(i=ze(i,a),pn===null?pn=[i]:pn.push(i),Ct!==4&&(Ct=2),e===null)return!0;l=ze(l,a),a=e;do{switch(a.tag){case 3:return a.flags|=65536,t=n&-n,a.lanes|=t,t=Rs(a.stateNode,l,t),Hu(a,t),!1;case 1:if(e=a.type,i=a.stateNode,(a.flags&128)===0&&(typeof e.getDerivedStateFromError=="function"||i!==null&&typeof i.componentDidCatch=="function"&&(xa===null||!xa.has(i))))return a.flags|=65536,n&=-n,a.lanes|=n,n=Od(n),Cd(n,t,a,l),Hu(a,n),!1}a=a.return}while(a!==null);return!1}var Yr=Error(G(461)),kt=!1;function Qt(t,e,a,l){e.child=t===null?qo(e,null,a,l):Qa(e,t.child,a,l)}function Wc(t,e,a,l,n){a=a.render;var i=e.ref;if("ref"in l){var u={};for(var s in l)s!=="ref"&&(u[s]=l[s])}else u=l;return Xa(e),l=Cr(t,e,a,u,i,n),s=Nr(),t!==null&&!kt?(Dr(t,e,n),la(t,e,n)):(ft&&s&&Sr(e),e.flags|=1,Qt(t,e,l,n),e.child)}function Fc(t,e,a,l,n){if(t===null){var i=a.type;return typeof i=="function"&&!_r(i)&&i.defaultProps===void 0&&a.compare===null?(e.tag=15,e.type=i,Nd(t,e,i,l,n)):(t=pi(a.type,null,l,e,e.mode,n),t.ref=e.ref,t.return=e,e.child=t)}if(i=t.child,!Gr(t,n)){var u=i.memoizedProps;if(a=a.compare,a=a!==null?a:Sn,a(u,l)&&t.ref===e.ref)return la(t,e,n)}return e.flags|=1,t=$e(i,l),t.ref=e.ref,t.return=e,e.child=t}function Nd(t,e,a,l,n){if(t!==null){var i=t.memoizedProps;if(Sn(i,l)&&t.ref===e.ref)if(kt=!1,e.pendingProps=l=i,Gr(t,n))t.flags&131072&&(kt=!0);else return e.lanes=t.lanes,la(t,e,n)}return Bs(t,e,a,l,n)}function Dd(t,e,a,l){var n=l.children,i=t!==null?t.memoizedState:null;if(t===null&&e.stateNode===null&&(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),l.mode==="hidden"){if(e.flags&128){if(i=i!==null?i.baseLanes|a:a,t!==null){for(l=e.child=t.child,n=0;l!==null;)n=n|l.lanes|l.childLanes,l=l.sibling;l=n&~i}else l=0,e.child=null;return $c(t,e,i,a,l)}if(a&536870912)e.memoizedState={baseLanes:0,cachePool:null},t!==null&&vi(e,i!==null?i.cachePool:null),i!==null?Lc(e,i):Cs(),Vo(e);else return l=e.lanes=536870912,$c(t,e,i!==null?i.baseLanes|a:a,a,l)}else i!==null?(vi(e,i.cachePool),Lc(e,i),oa(),e.memoizedState=null):(t!==null&&vi(e,null),Cs(),oa());return Qt(t,e,n,a),e.child}function en(t,e){return t!==null&&t.tag===22||e.stateNode!==null||(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),e.sibling}function $c(t,e,a,l,n){var i=Er();return i=i===null?null:{parent:Ht._currentValue,pool:i},e.memoizedState={baseLanes:a,cachePool:i},t!==null&&vi(e,null),Cs(),Vo(e),t!==null&&Hl(t,e,l,!0),e.childLanes=n,null}function bi(t,e){return e=Yi({mode:e.mode,children:e.children},t.mode),e.ref=t.ref,t.child=e,e.return=t,e}function Ic(t,e,a){return Qa(e,t.child,null,a),t=bi(e,e.pendingProps),t.flags|=2,re(e),e.memoizedState=null,t}function Bm(t,e,a){var l=e.pendingProps,n=(e.flags&128)!==0;if(e.flags&=-129,t===null){if(ft){if(l.mode==="hidden")return t=bi(e,l),e.lanes=536870912,en(null,t);if(Ns(e),(t=Et)?(t=zh(t,Ee),t=t!==null&&t.data==="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:wa!==null?{id:Me,overflow:Re}:null,retryLane:536870912,hydrationErrors:null},a=Bo(t),a.return=e,e.child=a,Kt=e,Et=null)):t=null,t===null)throw Oa(e);return e.lanes=536870912,null}return bi(e,l)}var i=t.memoizedState;if(i!==null){var u=i.dehydrated;if(Ns(e),n)if(e.flags&256)e.flags&=-257,e=Ic(t,e,a);else if(e.memoizedState!==null)e.child=t.child,e.flags|=128,e=null;else throw Error(G(558));else if(kt||Hl(t,e,a,!1),n=(a&t.childLanes)!==0,kt||n){if(l=_t,l!==null&&(u=so(l,a),u!==0&&u!==i.retryLane))throw i.retryLane=u,$a(t,u),ne(l,t,u),Yr;Qi(),e=Ic(t,e,a)}else t=i.treeContext,Et=Te(u.nextSibling),Kt=e,ft=!0,ba=null,Ee=!1,t!==null&&ko(e,t),e=bi(e,l),e.flags|=4096;return e}return t=$e(t.child,{mode:l.mode,children:l.children}),t.ref=e.ref,e.child=t,t.return=e,t}function _i(t,e){var a=e.ref;if(a===null)t!==null&&t.ref!==null&&(e.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(G(284));(t===null||t.ref!==a)&&(e.flags|=4194816)}}function Bs(t,e,a,l,n){return Xa(e),a=Cr(t,e,a,l,void 0,n),l=Nr(),t!==null&&!kt?(Dr(t,e,n),la(t,e,n)):(ft&&l&&Sr(e),e.flags|=1,Qt(t,e,a,n),e.child)}function Pc(t,e,a,l,n,i){return Xa(e),e.updateQueue=null,a=Jo(e,l,a,n),Ko(t),l=Nr(),t!==null&&!kt?(Dr(t,e,i),la(t,e,i)):(ft&&l&&Sr(e),e.flags|=1,Qt(t,e,a,i),e.child)}function tf(t,e,a,l,n){if(Xa(e),e.stateNode===null){var i=dl,u=a.contextType;typeof u=="object"&&u!==null&&(i=Jt(u)),i=new a(l,i),e.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,i.updater=Ms,e.stateNode=i,i._reactInternals=e,i=e.stateNode,i.props=l,i.state=e.memoizedState,i.refs={},Tr(e),u=a.contextType,i.context=typeof u=="object"&&u!==null?Jt(u):dl,i.state=e.memoizedState,u=a.getDerivedStateFromProps,typeof u=="function"&&(Lu(e,a,u,l),i.state=e.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof i.getSnapshotBeforeUpdate=="function"||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(u=i.state,typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount(),u!==i.state&&Ms.enqueueReplaceState(i,i.state,null),on(e,l,i,n),fn(),i.state=e.memoizedState),typeof i.componentDidMount=="function"&&(e.flags|=4194308),l=!0}else if(t===null){i=e.stateNode;var s=e.memoizedProps,r=Ka(a,s);i.props=r;var h=i.context,b=a.contextType;u=dl,typeof b=="object"&&b!==null&&(u=Jt(b));var g=a.getDerivedStateFromProps;b=typeof g=="function"||typeof i.getSnapshotBeforeUpdate=="function",s=e.pendingProps!==s,b||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(s||h!==u)&&Kc(e,i,l,u),ra=!1;var m=e.memoizedState;i.state=m,on(e,l,i,n),fn(),h=e.memoizedState,s||m!==h||ra?(typeof g=="function"&&(Lu(e,a,g,l),h=e.memoizedState),(r=ra||Vc(e,a,r,l,m,h,u))?(b||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount()),typeof i.componentDidMount=="function"&&(e.flags|=4194308)):(typeof i.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=l,e.memoizedState=h),i.props=l,i.state=h,i.context=u,l=r):(typeof i.componentDidMount=="function"&&(e.flags|=4194308),l=!1)}else{i=e.stateNode,ws(t,e),u=e.memoizedProps,b=Ka(a,u),i.props=b,g=e.pendingProps,m=i.context,h=a.contextType,r=dl,typeof h=="object"&&h!==null&&(r=Jt(h)),s=a.getDerivedStateFromProps,(h=typeof s=="function"||typeof i.getSnapshotBeforeUpdate=="function")||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(u!==g||m!==r)&&Kc(e,i,l,r),ra=!1,m=e.memoizedState,i.state=m,on(e,l,i,n),fn();var o=e.memoizedState;u!==g||m!==o||ra||t!==null&&t.dependencies!==null&&Mi(t.dependencies)?(typeof s=="function"&&(Lu(e,a,s,l),o=e.memoizedState),(b=ra||Vc(e,a,b,l,m,o,r)||t!==null&&t.dependencies!==null&&Mi(t.dependencies))?(h||typeof i.UNSAFE_componentWillUpdate!="function"&&typeof i.componentWillUpdate!="function"||(typeof i.componentWillUpdate=="function"&&i.componentWillUpdate(l,o,r),typeof i.UNSAFE_componentWillUpdate=="function"&&i.UNSAFE_componentWillUpdate(l,o,r)),typeof i.componentDidUpdate=="function"&&(e.flags|=4),typeof i.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof i.componentDidUpdate!="function"||u===t.memoizedProps&&m===t.memoizedState||(e.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||u===t.memoizedProps&&m===t.memoizedState||(e.flags|=1024),e.memoizedProps=l,e.memoizedState=o),i.props=l,i.state=o,i.context=r,l=b):(typeof i.componentDidUpdate!="function"||u===t.memoizedProps&&m===t.memoizedState||(e.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||u===t.memoizedProps&&m===t.memoizedState||(e.flags|=1024),l=!1)}return i=l,_i(t,e),l=(e.flags&128)!==0,i||l?(i=e.stateNode,a=l&&typeof a.getDerivedStateFromError!="function"?null:i.render(),e.flags|=1,t!==null&&l?(e.child=Qa(e,t.child,null,n),e.child=Qa(e,null,a,n)):Qt(t,e,a,n),e.memoizedState=i.state,t=e.child):t=la(t,e,n),t}function ef(t,e,a,l){return qa(),e.flags|=256,Qt(t,e,a,l),e.child}var Zu={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Yu(t){return{baseLanes:t,cachePool:Zo()}}function Gu(t,e,a){return t=t!==null?t.childLanes&~a:0,e&&(t|=fe),t}function jd(t,e,a){var l=e.pendingProps,n=!1,i=(e.flags&128)!==0,u;if((u=i)||(u=t!==null&&t.memoizedState===null?!1:(Ut.current&2)!==0),u&&(n=!0,e.flags&=-129),u=(e.flags&32)!==0,e.flags&=-33,t===null){if(ft){if(n?fa(e):oa(),(t=Et)?(t=zh(t,Ee),t=t!==null&&t.data!=="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:wa!==null?{id:Me,overflow:Re}:null,retryLane:536870912,hydrationErrors:null},a=Bo(t),a.return=e,e.child=a,Kt=e,Et=null)):t=null,t===null)throw Oa(e);return Fs(t)?e.lanes=32:e.lanes=536870912,null}var s=l.children;return l=l.fallback,n?(oa(),n=e.mode,s=Yi({mode:"hidden",children:s},n),l=La(l,n,a,null),s.return=e,l.return=e,s.sibling=l,e.child=s,l=e.child,l.memoizedState=Yu(a),l.childLanes=Gu(t,u,a),e.memoizedState=Zu,en(null,l)):(fa(e),Hs(e,s))}var r=t.memoizedState;if(r!==null&&(s=r.dehydrated,s!==null)){if(i)e.flags&256?(fa(e),e.flags&=-257,e=qu(t,e,a)):e.memoizedState!==null?(oa(),e.child=t.child,e.flags|=128,e=null):(oa(),s=l.fallback,n=e.mode,l=Yi({mode:"visible",children:l.children},n),s=La(s,n,a,null),s.flags|=2,l.return=e,s.return=e,l.sibling=s,e.child=l,Qa(e,t.child,null,a),l=e.child,l.memoizedState=Yu(a),l.childLanes=Gu(t,u,a),e.memoizedState=Zu,e=en(null,l));else if(fa(e),Fs(s)){if(u=s.nextSibling&&s.nextSibling.dataset,u)var h=u.dgst;u=h,l=Error(G(419)),l.stack="",l.digest=u,zn({value:l,source:null,stack:null}),e=qu(t,e,a)}else if(kt||Hl(t,e,a,!1),u=(a&t.childLanes)!==0,kt||u){if(u=_t,u!==null&&(l=so(u,a),l!==0&&l!==r.retryLane))throw r.retryLane=l,$a(t,l),ne(u,t,l),Yr;Ws(s)||Qi(),e=qu(t,e,a)}else Ws(s)?(e.flags|=192,e.child=t.child,e=null):(t=r.treeContext,Et=Te(s.nextSibling),Kt=e,ft=!0,ba=null,Ee=!1,t!==null&&ko(e,t),e=Hs(e,l.children),e.flags|=4096);return e}return n?(oa(),s=l.fallback,n=e.mode,r=t.child,h=r.sibling,l=$e(r,{mode:"hidden",children:l.children}),l.subtreeFlags=r.subtreeFlags&65011712,h!==null?s=$e(h,s):(s=La(s,n,a,null),s.flags|=2),s.return=e,l.return=e,l.sibling=s,e.child=l,en(null,l),l=e.child,s=t.child.memoizedState,s===null?s=Yu(a):(n=s.cachePool,n!==null?(r=Ht._currentValue,n=n.parent!==r?{parent:r,pool:r}:n):n=Zo(),s={baseLanes:s.baseLanes|a,cachePool:n}),l.memoizedState=s,l.childLanes=Gu(t,u,a),e.memoizedState=Zu,en(t.child,l)):(fa(e),a=t.child,t=a.sibling,a=$e(a,{mode:"visible",children:l.children}),a.return=e,a.sibling=null,t!==null&&(u=e.deletions,u===null?(e.deletions=[t],e.flags|=16):u.push(t)),e.child=a,e.memoizedState=null,a)}function Hs(t,e){return e=Yi({mode:"visible",children:e},t.mode),e.return=t,t.child=e}function Yi(t,e){return t=ce(22,t,null,e),t.lanes=0,t}function qu(t,e,a){return Qa(e,t.child,null,a),t=Hs(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function af(t,e,a){t.lanes|=e;var l=t.alternate;l!==null&&(l.lanes|=e),Es(t.return,e,a)}function Xu(t,e,a,l,n,i){var u=t.memoizedState;u===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:l,tail:a,tailMode:n,treeForkCount:i}:(u.isBackwards=e,u.rendering=null,u.renderingStartTime=0,u.last=l,u.tail=a,u.tailMode=n,u.treeForkCount=i)}function Ud(t,e,a){var l=e.pendingProps,n=l.revealOrder,i=l.tail;l=l.children;var u=Ut.current,s=(u&2)!==0;if(s?(u=u&1|2,e.flags|=128):u&=1,xt(Ut,u),Qt(t,e,l,a),l=ft?xn:0,!s&&t!==null&&t.flags&128)t:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&af(t,a,e);else if(t.tag===19)af(t,a,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break t;for(;t.sibling===null;){if(t.return===null||t.return===e)break t;t=t.return}t.sibling.return=t.return,t=t.sibling}switch(n){case"forwards":for(a=e.child,n=null;a!==null;)t=a.alternate,t!==null&&Hi(t)===null&&(n=a),a=a.sibling;a=n,a===null?(n=e.child,e.child=null):(n=a.sibling,a.sibling=null),Xu(e,!1,n,a,i,l);break;case"backwards":case"unstable_legacy-backwards":for(a=null,n=e.child,e.child=null;n!==null;){if(t=n.alternate,t!==null&&Hi(t)===null){e.child=n;break}t=n.sibling,n.sibling=a,a=n,n=t}Xu(e,!0,a,null,i,l);break;case"together":Xu(e,!1,null,null,void 0,l);break;default:e.memoizedState=null}return e.child}function la(t,e,a){if(t!==null&&(e.dependencies=t.dependencies),Na|=e.lanes,!(a&e.childLanes))if(t!==null){if(Hl(t,e,a,!1),(a&e.childLanes)===0)return null}else return null;if(t!==null&&e.child!==t.child)throw Error(G(153));if(e.child!==null){for(t=e.child,a=$e(t,t.pendingProps),e.child=a,a.return=e;t.sibling!==null;)t=t.sibling,a=a.sibling=$e(t,t.pendingProps),a.return=e;a.sibling=null}return e.child}function Gr(t,e){return t.lanes&e?!0:(t=t.dependencies,!!(t!==null&&Mi(t)))}function Hm(t,e,a){switch(e.tag){case 3:wi(e,e.stateNode.containerInfo),ca(e,Ht,t.memoizedState.cache),qa();break;case 27:case 5:os(e);break;case 4:wi(e,e.stateNode.containerInfo);break;case 10:ca(e,e.type,e.memoizedProps.value);break;case 31:if(e.memoizedState!==null)return e.flags|=128,Ns(e),null;break;case 13:var l=e.memoizedState;if(l!==null)return l.dehydrated!==null?(fa(e),e.flags|=128,null):a&e.child.childLanes?jd(t,e,a):(fa(e),t=la(t,e,a),t!==null?t.sibling:null);fa(e);break;case 19:var n=(t.flags&128)!==0;if(l=(a&e.childLanes)!==0,l||(Hl(t,e,a,!1),l=(a&e.childLanes)!==0),n){if(l)return Ud(t,e,a);e.flags|=128}if(n=e.memoizedState,n!==null&&(n.rendering=null,n.tail=null,n.lastEffect=null),xt(Ut,Ut.current),l)break;return null;case 22:return e.lanes=0,Dd(t,e,a,e.pendingProps);case 24:ca(e,Ht,t.memoizedState.cache)}return la(t,e,a)}function Md(t,e,a){if(t!==null)if(t.memoizedProps!==e.pendingProps)kt=!0;else{if(!Gr(t,a)&&!(e.flags&128))return kt=!1,Hm(t,e,a);kt=!!(t.flags&131072)}else kt=!1,ft&&e.flags&1048576&&Ho(e,xn,e.index);switch(e.lanes=0,e.tag){case 16:t:{var l=e.pendingProps;if(t=Ba(e.elementType),e.type=t,typeof t=="function")_r(t)?(l=Ka(t,l),e.tag=1,e=tf(null,e,t,l,a)):(e.tag=0,e=Bs(null,e,t,l,a));else{if(t!=null){var n=t.$$typeof;if(n===ur){e.tag=11,e=Wc(null,e,t,l,a);break t}else if(n===sr){e.tag=14,e=Fc(null,e,t,l,a);break t}}throw e=cs(t)||t,Error(G(306,e,""))}}return e;case 0:return Bs(t,e,e.type,e.pendingProps,a);case 1:return l=e.type,n=Ka(l,e.pendingProps),tf(t,e,l,n,a);case 3:t:{if(wi(e,e.stateNode.containerInfo),t===null)throw Error(G(387));l=e.pendingProps;var i=e.memoizedState;n=i.element,ws(t,e),on(e,l,null,a);var u=e.memoizedState;if(l=u.cache,ca(e,Ht,l),l!==i.cache&&As(e,[Ht],a,!0),fn(),l=u.element,i.isDehydrated)if(i={element:l,isDehydrated:!1,cache:u.cache},e.updateQueue.baseState=i,e.memoizedState=i,e.flags&256){e=ef(t,e,l,a);break t}else if(l!==n){n=ze(Error(G(424)),e),zn(n),e=ef(t,e,l,a);break t}else{switch(t=e.stateNode.containerInfo,t.nodeType){case 9:t=t.body;break;default:t=t.nodeName==="HTML"?t.ownerDocument.body:t}for(Et=Te(t.firstChild),Kt=e,ft=!0,ba=null,Ee=!0,a=qo(e,null,l,a),e.child=a;a;)a.flags=a.flags&-3|4096,a=a.sibling}else{if(qa(),l===n){e=la(t,e,a);break t}Qt(t,e,l,a)}e=e.child}return e;case 26:return _i(t,e),t===null?(a=zf(e.type,null,e.pendingProps,null))?e.memoizedState=a:ft||(a=e.type,t=e.pendingProps,l=Wi(ga.current).createElement(a),l[Vt]=e,l[ie]=t,Wt(l,a,t),qt(l),e.stateNode=l):e.memoizedState=zf(e.type,t.memoizedProps,e.pendingProps,t.memoizedState),null;case 27:return os(e),t===null&&ft&&(l=e.stateNode=Eh(e.type,e.pendingProps,ga.current),Kt=e,Ee=!0,n=Et,ja(e.type)?($s=n,Et=Te(l.firstChild)):Et=n),Qt(t,e,e.pendingProps.children,a),_i(t,e),t===null&&(e.flags|=4194304),e.child;case 5:return t===null&&ft&&((n=l=Et)&&(l=h1(l,e.type,e.pendingProps,Ee),l!==null?(e.stateNode=l,Kt=e,Et=Te(l.firstChild),Ee=!1,n=!0):n=!1),n||Oa(e)),os(e),n=e.type,i=e.pendingProps,u=t!==null?t.memoizedProps:null,l=i.children,Ks(n,i)?l=null:u!==null&&Ks(n,u)&&(e.flags|=32),e.memoizedState!==null&&(n=Cr(t,e,Om,null,null,a),Cn._currentValue=n),_i(t,e),Qt(t,e,l,a),e.child;case 6:return t===null&&ft&&((t=a=Et)&&(a=m1(a,e.pendingProps,Ee),a!==null?(e.stateNode=a,Kt=e,Et=null,t=!0):t=!1),t||Oa(e)),null;case 13:return jd(t,e,a);case 4:return wi(e,e.stateNode.containerInfo),l=e.pendingProps,t===null?e.child=Qa(e,null,l,a):Qt(t,e,l,a),e.child;case 11:return Wc(t,e,e.type,e.pendingProps,a);case 7:return Qt(t,e,e.pendingProps,a),e.child;case 8:return Qt(t,e,e.pendingProps.children,a),e.child;case 12:return Qt(t,e,e.pendingProps.children,a),e.child;case 10:return l=e.pendingProps,ca(e,e.type,l.value),Qt(t,e,l.children,a),e.child;case 9:return n=e.type._context,l=e.pendingProps.children,Xa(e),n=Jt(n),l=l(n),e.flags|=1,Qt(t,e,l,a),e.child;case 14:return Fc(t,e,e.type,e.pendingProps,a);case 15:return Nd(t,e,e.type,e.pendingProps,a);case 19:return Ud(t,e,a);case 31:return Bm(t,e,a);case 22:return Dd(t,e,a,e.pendingProps);case 24:return Xa(e),l=Jt(Ht),t===null?(n=Er(),n===null&&(n=_t,i=zr(),n.pooledCache=i,i.refCount++,i!==null&&(n.pooledCacheLanes|=a),n=i),e.memoizedState={parent:l,cache:n},Tr(e),ca(e,Ht,n)):(t.lanes&a&&(ws(t,e),on(e,null,null,a),fn()),n=t.memoizedState,i=e.memoizedState,n.parent!==l?(n={parent:l,cache:l},e.memoizedState=n,e.lanes===0&&(e.memoizedState=e.updateQueue.baseState=n),ca(e,Ht,l)):(l=i.cache,ca(e,Ht,l),l!==n.cache&&As(e,[Ht],a,!0))),Qt(t,e,e.pendingProps.children,a),e.child;case 29:throw e.pendingProps}throw Error(G(156,e.tag))}function Ge(t){t.flags|=4}function Qu(t,e,a,l,n){if((e=(t.mode&32)!==0)&&(e=!1),e){if(t.flags|=16777216,(n&335544128)===n)if(t.stateNode.complete)t.flags|=8192;else if(nh())t.flags|=8192;else throw Ya=Ri,Ar}else t.flags&=-16777217}function lf(t,e){if(e.type!=="stylesheet"||e.state.loading&4)t.flags&=-16777217;else if(t.flags|=16777216,!wh(e))if(nh())t.flags|=8192;else throw Ya=Ri,Ar}function li(t,e){e!==null&&(t.flags|=4),t.flags&16384&&(e=t.tag!==22?no():536870912,t.lanes|=e,Cl|=e)}function Wl(t,e){if(!ft)switch(t.tailMode){case"hidden":e=t.tail;for(var a=null;e!==null;)e.alternate!==null&&(a=e),e=e.sibling;a===null?t.tail=null:a.sibling=null;break;case"collapsed":a=t.tail;for(var l=null;a!==null;)a.alternate!==null&&(l=a),a=a.sibling;l===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:l.sibling=null}}function zt(t){var e=t.alternate!==null&&t.alternate.child===t.child,a=0,l=0;if(e)for(var n=t.child;n!==null;)a|=n.lanes|n.childLanes,l|=n.subtreeFlags&65011712,l|=n.flags&65011712,n.return=t,n=n.sibling;else for(n=t.child;n!==null;)a|=n.lanes|n.childLanes,l|=n.subtreeFlags,l|=n.flags,n.return=t,n=n.sibling;return t.subtreeFlags|=l,t.childLanes=a,e}function km(t,e,a){var l=e.pendingProps;switch(xr(e),e.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return zt(e),null;case 1:return zt(e),null;case 3:return a=e.stateNode,l=null,t!==null&&(l=t.memoizedState.cache),e.memoizedState.cache!==l&&(e.flags|=2048),Ie(Ht),zl(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(t===null||t.child===null)&&(Pa(e)?Ge(e):t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,Bu())),zt(e),null;case 26:var n=e.type,i=e.memoizedState;return t===null?(Ge(e),i!==null?(zt(e),lf(e,i)):(zt(e),Qu(e,n,null,l,a))):i?i!==t.memoizedState?(Ge(e),zt(e),lf(e,i)):(zt(e),e.flags&=-16777217):(t=t.memoizedProps,t!==l&&Ge(e),zt(e),Qu(e,n,t,l,a)),null;case 27:if(Oi(e),a=ga.current,n=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==l&&Ge(e);else{if(!l){if(e.stateNode===null)throw Error(G(166));return zt(e),null}t=He.current,Pa(e)?jc(e):(t=Eh(n,l,a),e.stateNode=t,Ge(e))}return zt(e),null;case 5:if(Oi(e),n=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==l&&Ge(e);else{if(!l){if(e.stateNode===null)throw Error(G(166));return zt(e),null}if(i=He.current,Pa(e))jc(e);else{var u=Wi(ga.current);switch(i){case 1:i=u.createElementNS("http://www.w3.org/2000/svg",n);break;case 2:i=u.createElementNS("http://www.w3.org/1998/Math/MathML",n);break;default:switch(n){case"svg":i=u.createElementNS("http://www.w3.org/2000/svg",n);break;case"math":i=u.createElementNS("http://www.w3.org/1998/Math/MathML",n);break;case"script":i=u.createElement("div"),i.innerHTML="<script><\/script>",i=i.removeChild(i.firstChild);break;case"select":i=typeof l.is=="string"?u.createElement("select",{is:l.is}):u.createElement("select"),l.multiple?i.multiple=!0:l.size&&(i.size=l.size);break;default:i=typeof l.is=="string"?u.createElement(n,{is:l.is}):u.createElement(n)}}i[Vt]=e,i[ie]=l;t:for(u=e.child;u!==null;){if(u.tag===5||u.tag===6)i.appendChild(u.stateNode);else if(u.tag!==4&&u.tag!==27&&u.child!==null){u.child.return=u,u=u.child;continue}if(u===e)break t;for(;u.sibling===null;){if(u.return===null||u.return===e)break t;u=u.return}u.sibling.return=u.return,u=u.sibling}e.stateNode=i;t:switch(Wt(i,n,l),n){case"button":case"input":case"select":case"textarea":l=!!l.autoFocus;break t;case"img":l=!0;break t;default:l=!1}l&&Ge(e)}}return zt(e),Qu(e,e.type,t===null?null:t.memoizedProps,e.pendingProps,a),null;case 6:if(t&&e.stateNode!=null)t.memoizedProps!==l&&Ge(e);else{if(typeof l!="string"&&e.stateNode===null)throw Error(G(166));if(t=ga.current,Pa(e)){if(t=e.stateNode,a=e.memoizedProps,l=null,n=Kt,n!==null)switch(n.tag){case 27:case 5:l=n.memoizedProps}t[Vt]=e,t=!!(t.nodeValue===a||l!==null&&l.suppressHydrationWarning===!0||_h(t.nodeValue,a)),t||Oa(e,!0)}else t=Wi(t).createTextNode(l),t[Vt]=e,e.stateNode=t}return zt(e),null;case 31:if(a=e.memoizedState,t===null||t.memoizedState!==null){if(l=Pa(e),a!==null){if(t===null){if(!l)throw Error(G(318));if(t=e.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(G(557));t[Vt]=e}else qa(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;zt(e),t=!1}else a=Bu(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=a),t=!0;if(!t)return e.flags&256?(re(e),e):(re(e),null);if(e.flags&128)throw Error(G(558))}return zt(e),null;case 13:if(l=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(n=Pa(e),l!==null&&l.dehydrated!==null){if(t===null){if(!n)throw Error(G(318));if(n=e.memoizedState,n=n!==null?n.dehydrated:null,!n)throw Error(G(317));n[Vt]=e}else qa(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;zt(e),n=!1}else n=Bu(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=n),n=!0;if(!n)return e.flags&256?(re(e),e):(re(e),null)}return re(e),e.flags&128?(e.lanes=a,e):(a=l!==null,t=t!==null&&t.memoizedState!==null,a&&(l=e.child,n=null,l.alternate!==null&&l.alternate.memoizedState!==null&&l.alternate.memoizedState.cachePool!==null&&(n=l.alternate.memoizedState.cachePool.pool),i=null,l.memoizedState!==null&&l.memoizedState.cachePool!==null&&(i=l.memoizedState.cachePool.pool),i!==n&&(l.flags|=2048)),a!==t&&a&&(e.child.flags|=8192),li(e,e.updateQueue),zt(e),null);case 4:return zl(),t===null&&Wr(e.stateNode.containerInfo),zt(e),null;case 10:return Ie(e.type),zt(e),null;case 19:if(Xt(Ut),l=e.memoizedState,l===null)return zt(e),null;if(n=(e.flags&128)!==0,i=l.rendering,i===null)if(n)Wl(l,!1);else{if(Ct!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(i=Hi(t),i!==null){for(e.flags|=128,Wl(l,!1),t=i.updateQueue,e.updateQueue=t,li(e,t),e.subtreeFlags=0,t=a,a=e.child;a!==null;)Ro(a,t),a=a.sibling;return xt(Ut,Ut.current&1|2),ft&&Ve(e,l.treeForkCount),e.child}t=t.sibling}l.tail!==null&&oe()>qi&&(e.flags|=128,n=!0,Wl(l,!1),e.lanes=4194304)}else{if(!n)if(t=Hi(i),t!==null){if(e.flags|=128,n=!0,t=t.updateQueue,e.updateQueue=t,li(e,t),Wl(l,!0),l.tail===null&&l.tailMode==="hidden"&&!i.alternate&&!ft)return zt(e),null}else 2*oe()-l.renderingStartTime>qi&&a!==536870912&&(e.flags|=128,n=!0,Wl(l,!1),e.lanes=4194304);l.isBackwards?(i.sibling=e.child,e.child=i):(t=l.last,t!==null?t.sibling=i:e.child=i,l.last=i)}return l.tail!==null?(t=l.tail,l.rendering=t,l.tail=t.sibling,l.renderingStartTime=oe(),t.sibling=null,a=Ut.current,xt(Ut,n?a&1|2:a&1),ft&&Ve(e,l.treeForkCount),t):(zt(e),null);case 22:case 23:return re(e),wr(),l=e.memoizedState!==null,t!==null?t.memoizedState!==null!==l&&(e.flags|=8192):l&&(e.flags|=8192),l?a&536870912&&!(e.flags&128)&&(zt(e),e.subtreeFlags&6&&(e.flags|=8192)):zt(e),a=e.updateQueue,a!==null&&li(e,a.retryQueue),a=null,t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(a=t.memoizedState.cachePool.pool),l=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(l=e.memoizedState.cachePool.pool),l!==a&&(e.flags|=2048),t!==null&&Xt(Za),null;case 24:return a=null,t!==null&&(a=t.memoizedState.cache),e.memoizedState.cache!==a&&(e.flags|=2048),Ie(Ht),zt(e),null;case 25:return null;case 30:return null}throw Error(G(156,e.tag))}function Lm(t,e){switch(xr(e),e.tag){case 1:return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return Ie(Ht),zl(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 26:case 27:case 5:return Oi(e),null;case 31:if(e.memoizedState!==null){if(re(e),e.alternate===null)throw Error(G(340));qa()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 13:if(re(e),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(G(340));qa()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return Xt(Ut),null;case 4:return zl(),null;case 10:return Ie(e.type),null;case 22:case 23:return re(e),wr(),t!==null&&Xt(Za),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 24:return Ie(Ht),null;case 25:return null;default:return null}}function Rd(t,e){switch(xr(e),e.tag){case 3:Ie(Ht),zl();break;case 26:case 27:case 5:Oi(e);break;case 4:zl();break;case 31:e.memoizedState!==null&&re(e);break;case 13:re(e);break;case 19:Xt(Ut);break;case 10:Ie(e.type);break;case 22:case 23:re(e),wr(),t!==null&&Xt(Za);break;case 24:Ie(Ht)}}function Zn(t,e){try{var a=e.updateQueue,l=a!==null?a.lastEffect:null;if(l!==null){var n=l.next;a=n;do{if((a.tag&t)===t){l=void 0;var i=a.create,u=a.inst;l=i(),u.destroy=l}a=a.next}while(a!==n)}}catch(s){yt(e,e.return,s)}}function Ca(t,e,a){try{var l=e.updateQueue,n=l!==null?l.lastEffect:null;if(n!==null){var i=n.next;l=i;do{if((l.tag&t)===t){var u=l.inst,s=u.destroy;if(s!==void 0){u.destroy=void 0,n=e;var r=a,h=s;try{h()}catch(b){yt(n,r,b)}}}l=l.next}while(l!==i)}}catch(b){yt(e,e.return,b)}}function Bd(t){var e=t.updateQueue;if(e!==null){var a=t.stateNode;try{Qo(e,a)}catch(l){yt(t,t.return,l)}}}function Hd(t,e,a){a.props=Ka(t.type,t.memoizedProps),a.state=t.memoizedState;try{a.componentWillUnmount()}catch(l){yt(t,e,l)}}function hn(t,e){try{var a=t.ref;if(a!==null){switch(t.tag){case 26:case 27:case 5:var l=t.stateNode;break;case 30:l=t.stateNode;break;default:l=t.stateNode}typeof a=="function"?t.refCleanup=a(l):a.current=l}}catch(n){yt(t,e,n)}}function Be(t,e){var a=t.ref,l=t.refCleanup;if(a!==null)if(typeof l=="function")try{l()}catch(n){yt(t,e,n)}finally{t.refCleanup=null,t=t.alternate,t!=null&&(t.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(n){yt(t,e,n)}else a.current=null}function kd(t){var e=t.type,a=t.memoizedProps,l=t.stateNode;try{t:switch(e){case"button":case"input":case"select":case"textarea":a.autoFocus&&l.focus();break t;case"img":a.src?l.src=a.src:a.srcSet&&(l.srcset=a.srcSet)}}catch(n){yt(t,t.return,n)}}function Vu(t,e,a){try{var l=t.stateNode;s1(l,t.type,a,e),l[ie]=e}catch(n){yt(t,t.return,n)}}function Ld(t){return t.tag===5||t.tag===3||t.tag===26||t.tag===27&&ja(t.type)||t.tag===4}function Ku(t){t:for(;;){for(;t.sibling===null;){if(t.return===null||Ld(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.tag===27&&ja(t.type)||t.flags&2||t.child===null||t.tag===4)continue t;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function ks(t,e,a){var l=t.tag;if(l===5||l===6)t=t.stateNode,e?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(t,e):(e=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,e.appendChild(t),a=a._reactRootContainer,a!=null||e.onclick!==null||(e.onclick=We));else if(l!==4&&(l===27&&ja(t.type)&&(a=t.stateNode,e=null),t=t.child,t!==null))for(ks(t,e,a),t=t.sibling;t!==null;)ks(t,e,a),t=t.sibling}function Gi(t,e,a){var l=t.tag;if(l===5||l===6)t=t.stateNode,e?a.insertBefore(t,e):a.appendChild(t);else if(l!==4&&(l===27&&ja(t.type)&&(a=t.stateNode),t=t.child,t!==null))for(Gi(t,e,a),t=t.sibling;t!==null;)Gi(t,e,a),t=t.sibling}function Zd(t){var e=t.stateNode,a=t.memoizedProps;try{for(var l=t.type,n=e.attributes;n.length;)e.removeAttributeNode(n[0]);Wt(e,l,a),e[Vt]=t,e[ie]=a}catch(i){yt(t,t.return,i)}}var Ke=!1,Bt=!1,Ju=!1,nf=typeof WeakSet=="function"?WeakSet:Set,Gt=null;function Zm(t,e){if(t=t.containerInfo,Qs=Pi,t=wo(t),yr(t)){if("selectionStart"in t)var a={start:t.selectionStart,end:t.selectionEnd};else t:{a=(a=t.ownerDocument)&&a.defaultView||window;var l=a.getSelection&&a.getSelection();if(l&&l.rangeCount!==0){a=l.anchorNode;var n=l.anchorOffset,i=l.focusNode;l=l.focusOffset;try{a.nodeType,i.nodeType}catch{a=null;break t}var u=0,s=-1,r=-1,h=0,b=0,g=t,m=null;e:for(;;){for(var o;g!==a||n!==0&&g.nodeType!==3||(s=u+n),g!==i||l!==0&&g.nodeType!==3||(r=u+l),g.nodeType===3&&(u+=g.nodeValue.length),(o=g.firstChild)!==null;)m=g,g=o;for(;;){if(g===t)break e;if(m===a&&++h===n&&(s=u),m===i&&++b===l&&(r=u),(o=g.nextSibling)!==null)break;g=m,m=g.parentNode}g=o}a=s===-1||r===-1?null:{start:s,end:r}}else a=null}a=a||{start:0,end:0}}else a=null;for(Vs={focusedElem:t,selectionRange:a},Pi=!1,Gt=e;Gt!==null;)if(e=Gt,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,Gt=t;else for(;Gt!==null;){switch(e=Gt,i=e.alternate,t=e.flags,e.tag){case 0:if(t&4&&(t=e.updateQueue,t=t!==null?t.events:null,t!==null))for(a=0;a<t.length;a++)n=t[a],n.ref.impl=n.nextImpl;break;case 11:case 15:break;case 1:if(t&1024&&i!==null){t=void 0,a=e,n=i.memoizedProps,i=i.memoizedState,l=a.stateNode;try{var _=Ka(a.type,n);t=l.getSnapshotBeforeUpdate(_,i),l.__reactInternalSnapshotBeforeUpdate=t}catch(v){yt(a,a.return,v)}}break;case 3:if(t&1024){if(t=e.stateNode.containerInfo,a=t.nodeType,a===9)Js(t);else if(a===1)switch(t.nodeName){case"HEAD":case"HTML":case"BODY":Js(t);break;default:t.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(t&1024)throw Error(G(163))}if(t=e.sibling,t!==null){t.return=e.return,Gt=t;break}Gt=e.return}}function Yd(t,e,a){var l=a.flags;switch(a.tag){case 0:case 11:case 15:Xe(t,a),l&4&&Zn(5,a);break;case 1:if(Xe(t,a),l&4)if(t=a.stateNode,e===null)try{t.componentDidMount()}catch(u){yt(a,a.return,u)}else{var n=Ka(a.type,e.memoizedProps);e=e.memoizedState;try{t.componentDidUpdate(n,e,t.__reactInternalSnapshotBeforeUpdate)}catch(u){yt(a,a.return,u)}}l&64&&Bd(a),l&512&&hn(a,a.return);break;case 3:if(Xe(t,a),l&64&&(t=a.updateQueue,t!==null)){if(e=null,a.child!==null)switch(a.child.tag){case 27:case 5:e=a.child.stateNode;break;case 1:e=a.child.stateNode}try{Qo(t,e)}catch(u){yt(a,a.return,u)}}break;case 27:e===null&&l&4&&Zd(a);case 26:case 5:Xe(t,a),e===null&&l&4&&kd(a),l&512&&hn(a,a.return);break;case 12:Xe(t,a);break;case 31:Xe(t,a),l&4&&Xd(t,a);break;case 13:Xe(t,a),l&4&&Qd(t,a),l&64&&(t=a.memoizedState,t!==null&&(t=t.dehydrated,t!==null&&(a=Wm.bind(null,a),p1(t,a))));break;case 22:if(l=a.memoizedState!==null||Ke,!l){e=e!==null&&e.memoizedState!==null||Bt,n=Ke;var i=Bt;Ke=l,(Bt=e)&&!i?Qe(t,a,(a.subtreeFlags&8772)!==0):Xe(t,a),Ke=n,Bt=i}break;case 30:break;default:Xe(t,a)}}function Gd(t){var e=t.alternate;e!==null&&(t.alternate=null,Gd(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&or(e)),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}var wt=null,ae=!1;function qe(t,e,a){for(a=a.child;a!==null;)qd(t,e,a),a=a.sibling}function qd(t,e,a){if(de&&typeof de.onCommitFiberUnmount=="function")try{de.onCommitFiberUnmount(Un,a)}catch{}switch(a.tag){case 26:Bt||Be(a,e),qe(t,e,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:Bt||Be(a,e);var l=wt,n=ae;ja(a.type)&&(wt=a.stateNode,ae=!1),qe(t,e,a),yn(a.stateNode),wt=l,ae=n;break;case 5:Bt||Be(a,e);case 6:if(l=wt,n=ae,wt=null,qe(t,e,a),wt=l,ae=n,wt!==null)if(ae)try{(wt.nodeType===9?wt.body:wt.nodeName==="HTML"?wt.ownerDocument.body:wt).removeChild(a.stateNode)}catch(i){yt(a,e,i)}else try{wt.removeChild(a.stateNode)}catch(i){yt(a,e,i)}break;case 18:wt!==null&&(ae?(t=wt,gf(t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,a.stateNode),Ul(t)):gf(wt,a.stateNode));break;case 4:l=wt,n=ae,wt=a.stateNode.containerInfo,ae=!0,qe(t,e,a),wt=l,ae=n;break;case 0:case 11:case 14:case 15:Ca(2,a,e),Bt||Ca(4,a,e),qe(t,e,a);break;case 1:Bt||(Be(a,e),l=a.stateNode,typeof l.componentWillUnmount=="function"&&Hd(a,e,l)),qe(t,e,a);break;case 21:qe(t,e,a);break;case 22:Bt=(l=Bt)||a.memoizedState!==null,qe(t,e,a),Bt=l;break;default:qe(t,e,a)}}function Xd(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null))){t=t.dehydrated;try{Ul(t)}catch(a){yt(e,e.return,a)}}}function Qd(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null&&(t=t.dehydrated,t!==null))))try{Ul(t)}catch(a){yt(e,e.return,a)}}function Ym(t){switch(t.tag){case 31:case 13:case 19:var e=t.stateNode;return e===null&&(e=t.stateNode=new nf),e;case 22:return t=t.stateNode,e=t._retryCache,e===null&&(e=t._retryCache=new nf),e;default:throw Error(G(435,t.tag))}}function ni(t,e){var a=Ym(t);e.forEach(function(l){if(!a.has(l)){a.add(l);var n=Fm.bind(null,t,l);l.then(n,n)}})}function te(t,e){var a=e.deletions;if(a!==null)for(var l=0;l<a.length;l++){var n=a[l],i=t,u=e,s=u;t:for(;s!==null;){switch(s.tag){case 27:if(ja(s.type)){wt=s.stateNode,ae=!1;break t}break;case 5:wt=s.stateNode,ae=!1;break t;case 3:case 4:wt=s.stateNode.containerInfo,ae=!0;break t}s=s.return}if(wt===null)throw Error(G(160));qd(i,u,n),wt=null,ae=!1,i=n.alternate,i!==null&&(i.return=null),n.return=null}if(e.subtreeFlags&13886)for(e=e.child;e!==null;)Vd(e,t),e=e.sibling}var Ne=null;function Vd(t,e){var a=t.alternate,l=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:te(e,t),ee(t),l&4&&(Ca(3,t,t.return),Zn(3,t),Ca(5,t,t.return));break;case 1:te(e,t),ee(t),l&512&&(Bt||a===null||Be(a,a.return)),l&64&&Ke&&(t=t.updateQueue,t!==null&&(l=t.callbacks,l!==null&&(a=t.shared.hiddenCallbacks,t.shared.hiddenCallbacks=a===null?l:a.concat(l))));break;case 26:var n=Ne;if(te(e,t),ee(t),l&512&&(Bt||a===null||Be(a,a.return)),l&4){var i=a!==null?a.memoizedState:null;if(l=t.memoizedState,a===null)if(l===null)if(t.stateNode===null){t:{l=t.type,a=t.memoizedProps,n=n.ownerDocument||n;e:switch(l){case"title":i=n.getElementsByTagName("title")[0],(!i||i[Bn]||i[Vt]||i.namespaceURI==="http://www.w3.org/2000/svg"||i.hasAttribute("itemprop"))&&(i=n.createElement(l),n.head.insertBefore(i,n.querySelector("head > title"))),Wt(i,l,a),i[Vt]=t,qt(i),l=i;break t;case"link":var u=Af("link","href",n).get(l+(a.href||""));if(u){for(var s=0;s<u.length;s++)if(i=u[s],i.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&i.getAttribute("rel")===(a.rel==null?null:a.rel)&&i.getAttribute("title")===(a.title==null?null:a.title)&&i.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){u.splice(s,1);break e}}i=n.createElement(l),Wt(i,l,a),n.head.appendChild(i);break;case"meta":if(u=Af("meta","content",n).get(l+(a.content||""))){for(s=0;s<u.length;s++)if(i=u[s],i.getAttribute("content")===(a.content==null?null:""+a.content)&&i.getAttribute("name")===(a.name==null?null:a.name)&&i.getAttribute("property")===(a.property==null?null:a.property)&&i.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&i.getAttribute("charset")===(a.charSet==null?null:a.charSet)){u.splice(s,1);break e}}i=n.createElement(l),Wt(i,l,a),n.head.appendChild(i);break;default:throw Error(G(468,l))}i[Vt]=t,qt(i),l=i}t.stateNode=l}else Tf(n,t.type,t.stateNode);else t.stateNode=Ef(n,l,t.memoizedProps);else i!==l?(i===null?a.stateNode!==null&&(a=a.stateNode,a.parentNode.removeChild(a)):i.count--,l===null?Tf(n,t.type,t.stateNode):Ef(n,l,t.memoizedProps)):l===null&&t.stateNode!==null&&Vu(t,t.memoizedProps,a.memoizedProps)}break;case 27:te(e,t),ee(t),l&512&&(Bt||a===null||Be(a,a.return)),a!==null&&l&4&&Vu(t,t.memoizedProps,a.memoizedProps);break;case 5:if(te(e,t),ee(t),l&512&&(Bt||a===null||Be(a,a.return)),t.flags&32){n=t.stateNode;try{Al(n,"")}catch(_){yt(t,t.return,_)}}l&4&&t.stateNode!=null&&(n=t.memoizedProps,Vu(t,n,a!==null?a.memoizedProps:n)),l&1024&&(Ju=!0);break;case 6:if(te(e,t),ee(t),l&4){if(t.stateNode===null)throw Error(G(162));l=t.memoizedProps,a=t.stateNode;try{a.nodeValue=l}catch(_){yt(t,t.return,_)}}break;case 3:if(zi=null,n=Ne,Ne=Fi(e.containerInfo),te(e,t),Ne=n,ee(t),l&4&&a!==null&&a.memoizedState.isDehydrated)try{Ul(e.containerInfo)}catch(_){yt(t,t.return,_)}Ju&&(Ju=!1,Kd(t));break;case 4:l=Ne,Ne=Fi(t.stateNode.containerInfo),te(e,t),ee(t),Ne=l;break;case 12:te(e,t),ee(t);break;case 31:te(e,t),ee(t),l&4&&(l=t.updateQueue,l!==null&&(t.updateQueue=null,ni(t,l)));break;case 13:te(e,t),ee(t),t.child.flags&8192&&t.memoizedState!==null!=(a!==null&&a.memoizedState!==null)&&(pu=oe()),l&4&&(l=t.updateQueue,l!==null&&(t.updateQueue=null,ni(t,l)));break;case 22:n=t.memoizedState!==null;var r=a!==null&&a.memoizedState!==null,h=Ke,b=Bt;if(Ke=h||n,Bt=b||r,te(e,t),Bt=b,Ke=h,ee(t),l&8192)t:for(e=t.stateNode,e._visibility=n?e._visibility&-2:e._visibility|1,n&&(a===null||r||Ke||Bt||Ha(t)),a=null,e=t;;){if(e.tag===5||e.tag===26){if(a===null){r=a=e;try{if(i=r.stateNode,n)u=i.style,typeof u.setProperty=="function"?u.setProperty("display","none","important"):u.display="none";else{s=r.stateNode;var g=r.memoizedProps.style,m=g!=null&&g.hasOwnProperty("display")?g.display:null;s.style.display=m==null||typeof m=="boolean"?"":(""+m).trim()}}catch(_){yt(r,r.return,_)}}}else if(e.tag===6){if(a===null){r=e;try{r.stateNode.nodeValue=n?"":r.memoizedProps}catch(_){yt(r,r.return,_)}}}else if(e.tag===18){if(a===null){r=e;try{var o=r.stateNode;n?bf(o,!0):bf(r.stateNode,!1)}catch(_){yt(r,r.return,_)}}}else if((e.tag!==22&&e.tag!==23||e.memoizedState===null||e===t)&&e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break t;for(;e.sibling===null;){if(e.return===null||e.return===t)break t;a===e&&(a=null),e=e.return}a===e&&(a=null),e.sibling.return=e.return,e=e.sibling}l&4&&(l=t.updateQueue,l!==null&&(a=l.retryQueue,a!==null&&(l.retryQueue=null,ni(t,a))));break;case 19:te(e,t),ee(t),l&4&&(l=t.updateQueue,l!==null&&(t.updateQueue=null,ni(t,l)));break;case 30:break;case 21:break;default:te(e,t),ee(t)}}function ee(t){var e=t.flags;if(e&2){try{for(var a,l=t.return;l!==null;){if(Ld(l)){a=l;break}l=l.return}if(a==null)throw Error(G(160));switch(a.tag){case 27:var n=a.stateNode,i=Ku(t);Gi(t,i,n);break;case 5:var u=a.stateNode;a.flags&32&&(Al(u,""),a.flags&=-33);var s=Ku(t);Gi(t,s,u);break;case 3:case 4:var r=a.stateNode.containerInfo,h=Ku(t);ks(t,h,r);break;default:throw Error(G(161))}}catch(b){yt(t,t.return,b)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function Kd(t){if(t.subtreeFlags&1024)for(t=t.child;t!==null;){var e=t;Kd(e),e.tag===5&&e.flags&1024&&e.stateNode.reset(),t=t.sibling}}function Xe(t,e){if(e.subtreeFlags&8772)for(e=e.child;e!==null;)Yd(t,e.alternate,e),e=e.sibling}function Ha(t){for(t=t.child;t!==null;){var e=t;switch(e.tag){case 0:case 11:case 14:case 15:Ca(4,e,e.return),Ha(e);break;case 1:Be(e,e.return);var a=e.stateNode;typeof a.componentWillUnmount=="function"&&Hd(e,e.return,a),Ha(e);break;case 27:yn(e.stateNode);case 26:case 5:Be(e,e.return),Ha(e);break;case 22:e.memoizedState===null&&Ha(e);break;case 30:Ha(e);break;default:Ha(e)}t=t.sibling}}function Qe(t,e,a){for(a=a&&(e.subtreeFlags&8772)!==0,e=e.child;e!==null;){var l=e.alternate,n=t,i=e,u=i.flags;switch(i.tag){case 0:case 11:case 15:Qe(n,i,a),Zn(4,i);break;case 1:if(Qe(n,i,a),l=i,n=l.stateNode,typeof n.componentDidMount=="function")try{n.componentDidMount()}catch(h){yt(l,l.return,h)}if(l=i,n=l.updateQueue,n!==null){var s=l.stateNode;try{var r=n.shared.hiddenCallbacks;if(r!==null)for(n.shared.hiddenCallbacks=null,n=0;n<r.length;n++)Xo(r[n],s)}catch(h){yt(l,l.return,h)}}a&&u&64&&Bd(i),hn(i,i.return);break;case 27:Zd(i);case 26:case 5:Qe(n,i,a),a&&l===null&&u&4&&kd(i),hn(i,i.return);break;case 12:Qe(n,i,a);break;case 31:Qe(n,i,a),a&&u&4&&Xd(n,i);break;case 13:Qe(n,i,a),a&&u&4&&Qd(n,i);break;case 22:i.memoizedState===null&&Qe(n,i,a),hn(i,i.return);break;case 30:break;default:Qe(n,i,a)}e=e.sibling}}function qr(t,e){var a=null;t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(a=t.memoizedState.cachePool.pool),t=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(t=e.memoizedState.cachePool.pool),t!==a&&(t!=null&&t.refCount++,a!=null&&kn(a))}function Xr(t,e){t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&kn(t))}function Ce(t,e,a,l){if(e.subtreeFlags&10256)for(e=e.child;e!==null;)Jd(t,e,a,l),e=e.sibling}function Jd(t,e,a,l){var n=e.flags;switch(e.tag){case 0:case 11:case 15:Ce(t,e,a,l),n&2048&&Zn(9,e);break;case 1:Ce(t,e,a,l);break;case 3:Ce(t,e,a,l),n&2048&&(t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&kn(t)));break;case 12:if(n&2048){Ce(t,e,a,l),t=e.stateNode;try{var i=e.memoizedProps,u=i.id,s=i.onPostCommit;typeof s=="function"&&s(u,e.alternate===null?"mount":"update",t.passiveEffectDuration,-0)}catch(r){yt(e,e.return,r)}}else Ce(t,e,a,l);break;case 31:Ce(t,e,a,l);break;case 13:Ce(t,e,a,l);break;case 23:break;case 22:i=e.stateNode,u=e.alternate,e.memoizedState!==null?i._visibility&2?Ce(t,e,a,l):mn(t,e):i._visibility&2?Ce(t,e,a,l):(i._visibility|=2,al(t,e,a,l,(e.subtreeFlags&10256)!==0||!1)),n&2048&&qr(u,e);break;case 24:Ce(t,e,a,l),n&2048&&Xr(e.alternate,e);break;default:Ce(t,e,a,l)}}function al(t,e,a,l,n){for(n=n&&((e.subtreeFlags&10256)!==0||!1),e=e.child;e!==null;){var i=t,u=e,s=a,r=l,h=u.flags;switch(u.tag){case 0:case 11:case 15:al(i,u,s,r,n),Zn(8,u);break;case 23:break;case 22:var b=u.stateNode;u.memoizedState!==null?b._visibility&2?al(i,u,s,r,n):mn(i,u):(b._visibility|=2,al(i,u,s,r,n)),n&&h&2048&&qr(u.alternate,u);break;case 24:al(i,u,s,r,n),n&&h&2048&&Xr(u.alternate,u);break;default:al(i,u,s,r,n)}e=e.sibling}}function mn(t,e){if(e.subtreeFlags&10256)for(e=e.child;e!==null;){var a=t,l=e,n=l.flags;switch(l.tag){case 22:mn(a,l),n&2048&&qr(l.alternate,l);break;case 24:mn(a,l),n&2048&&Xr(l.alternate,l);break;default:mn(a,l)}e=e.sibling}}var an=8192;function tl(t,e,a){if(t.subtreeFlags&an)for(t=t.child;t!==null;)Wd(t,e,a),t=t.sibling}function Wd(t,e,a){switch(t.tag){case 26:tl(t,e,a),t.flags&an&&t.memoizedState!==null&&w1(a,Ne,t.memoizedState,t.memoizedProps);break;case 5:tl(t,e,a);break;case 3:case 4:var l=Ne;Ne=Fi(t.stateNode.containerInfo),tl(t,e,a),Ne=l;break;case 22:t.memoizedState===null&&(l=t.alternate,l!==null&&l.memoizedState!==null?(l=an,an=16777216,tl(t,e,a),an=l):tl(t,e,a));break;default:tl(t,e,a)}}function Fd(t){var e=t.alternate;if(e!==null&&(t=e.child,t!==null)){e.child=null;do e=t.sibling,t.sibling=null,t=e;while(t!==null)}}function Fl(t){var e=t.deletions;if(t.flags&16){if(e!==null)for(var a=0;a<e.length;a++){var l=e[a];Gt=l,Id(l,t)}Fd(t)}if(t.subtreeFlags&10256)for(t=t.child;t!==null;)$d(t),t=t.sibling}function $d(t){switch(t.tag){case 0:case 11:case 15:Fl(t),t.flags&2048&&Ca(9,t,t.return);break;case 3:Fl(t);break;case 12:Fl(t);break;case 22:var e=t.stateNode;t.memoizedState!==null&&e._visibility&2&&(t.return===null||t.return.tag!==13)?(e._visibility&=-3,Si(t)):Fl(t);break;default:Fl(t)}}function Si(t){var e=t.deletions;if(t.flags&16){if(e!==null)for(var a=0;a<e.length;a++){var l=e[a];Gt=l,Id(l,t)}Fd(t)}for(t=t.child;t!==null;){switch(e=t,e.tag){case 0:case 11:case 15:Ca(8,e,e.return),Si(e);break;case 22:a=e.stateNode,a._visibility&2&&(a._visibility&=-3,Si(e));break;default:Si(e)}t=t.sibling}}function Id(t,e){for(;Gt!==null;){var a=Gt;switch(a.tag){case 0:case 11:case 15:Ca(8,a,e);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var l=a.memoizedState.cachePool.pool;l!=null&&l.refCount++}break;case 24:kn(a.memoizedState.cache)}if(l=a.child,l!==null)l.return=a,Gt=l;else t:for(a=t;Gt!==null;){l=Gt;var n=l.sibling,i=l.return;if(Gd(l),l===a){Gt=null;break t}if(n!==null){n.return=i,Gt=n;break t}Gt=i}}}var Gm={getCacheForType:function(t){var e=Jt(Ht),a=e.data.get(t);return a===void 0&&(a=t(),e.data.set(t,a)),a},cacheSignal:function(){return Jt(Ht).controller.signal}},qm=typeof WeakMap=="function"?WeakMap:Map,ht=0,_t=null,rt=null,ct=0,vt=0,se=null,pa=!1,Ll=!1,Qr=!1,na=0,Ct=0,Na=0,Ga=0,Vr=0,fe=0,Cl=0,pn=null,le=null,Ls=!1,pu=0,Pd=0,qi=1/0,Xi=null,xa=null,Lt=0,za=null,Nl=null,Pe=0,Zs=0,Ys=null,th=null,vn=0,Gs=null;function me(){return ht&2&&ct!==0?ct&-ct:lt.T!==null?Jr():ro()}function eh(){if(fe===0)if(!(ct&536870912)||ft){var t=Fn;Fn<<=1,!(Fn&3932160)&&(Fn=262144),fe=t}else fe=536870912;return t=ve.current,t!==null&&(t.flags|=32),fe}function ne(t,e,a){(t===_t&&(vt===2||vt===9)||t.cancelPendingCommit!==null)&&(Dl(t,0),va(t,ct,fe,!1)),Rn(t,a),(!(ht&2)||t!==_t)&&(t===_t&&(!(ht&2)&&(Ga|=a),Ct===4&&va(t,ct,fe,!1)),Le(t))}function ah(t,e,a){if(ht&6)throw Error(G(327));var l=!a&&(e&127)===0&&(e&t.expiredLanes)===0||Mn(t,e),n=l?Vm(t,e):Wu(t,e,!0),i=l;do{if(n===0){Ll&&!l&&va(t,e,0,!1);break}else{if(a=t.current.alternate,i&&!Xm(a)){n=Wu(t,e,!1),i=!1;continue}if(n===2){if(i=e,t.errorRecoveryDisabledLanes&i)var u=0;else u=t.pendingLanes&-536870913,u=u!==0?u:u&536870912?536870912:0;if(u!==0){e=u;t:{var s=t;n=pn;var r=s.current.memoizedState.isDehydrated;if(r&&(Dl(s,u).flags|=256),u=Wu(s,u,!1),u!==2){if(Qr&&!r){s.errorRecoveryDisabledLanes|=i,Ga|=i,n=4;break t}i=le,le=n,i!==null&&(le===null?le=i:le.push.apply(le,i))}n=u}if(i=!1,n!==2)continue}}if(n===1){Dl(t,0),va(t,e,0,!0);break}t:{switch(l=t,i=n,i){case 0:case 1:throw Error(G(345));case 4:if((e&4194048)!==e)break;case 6:va(l,e,fe,!pa);break t;case 2:le=null;break;case 3:case 5:break;default:throw Error(G(329))}if((e&62914560)===e&&(n=pu+300-oe(),10<n)){if(va(l,e,fe,!pa),nu(l,0,!0)!==0)break t;Pe=e,l.timeoutHandle=xh(uf.bind(null,l,a,le,Xi,Ls,e,fe,Ga,Cl,pa,i,"Throttled",-0,0),n);break t}uf(l,a,le,Xi,Ls,e,fe,Ga,Cl,pa,i,null,-0,0)}}break}while(!0);Le(t)}function uf(t,e,a,l,n,i,u,s,r,h,b,g,m,o){if(t.timeoutHandle=-1,g=e.subtreeFlags,g&8192||(g&16785408)===16785408){g={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:We},Wd(e,i,g);var _=(i&62914560)===i?pu-oe():(i&4194048)===i?Pd-oe():0;if(_=O1(g,_),_!==null){Pe=i,t.cancelPendingCommit=_(rf.bind(null,t,e,i,a,l,n,u,s,r,b,g,null,m,o)),va(t,i,u,!h);return}}rf(t,e,i,a,l,n,u,s,r)}function Xm(t){for(var e=t;;){var a=e.tag;if((a===0||a===11||a===15)&&e.flags&16384&&(a=e.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var l=0;l<a.length;l++){var n=a[l],i=n.getSnapshot;n=n.value;try{if(!pe(i(),n))return!1}catch{return!1}}if(a=e.child,e.subtreeFlags&16384&&a!==null)a.return=e,e=a;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function va(t,e,a,l){e&=~Vr,e&=~Ga,t.suspendedLanes|=e,t.pingedLanes&=~e,l&&(t.warmLanes|=e),l=t.expirationTimes;for(var n=e;0<n;){var i=31-he(n),u=1<<i;l[i]=-1,n&=~u}a!==0&&io(t,a,e)}function vu(){return ht&6?!0:(Yn(0),!1)}function Kr(){if(rt!==null){if(vt===0)var t=rt.return;else t=rt,Fe=Ia=null,jr(t),_l=null,En=0,t=rt;for(;t!==null;)Rd(t.alternate,t),t=t.return;rt=null}}function Dl(t,e){var a=t.timeoutHandle;a!==-1&&(t.timeoutHandle=-1,f1(a)),a=t.cancelPendingCommit,a!==null&&(t.cancelPendingCommit=null,a()),Pe=0,Kr(),_t=t,rt=a=$e(t.current,null),ct=e,vt=0,se=null,pa=!1,Ll=Mn(t,e),Qr=!1,Cl=fe=Vr=Ga=Na=Ct=0,le=pn=null,Ls=!1,e&8&&(e|=e&32);var l=t.entangledLanes;if(l!==0)for(t=t.entanglements,l&=e;0<l;){var n=31-he(l),i=1<<n;e|=t[n],l&=~i}return na=e,ru(),a}function lh(t,e){it=null,lt.H=Tn,e===kl||e===fu?(e=Hc(),vt=3):e===Ar?(e=Hc(),vt=4):vt=e===Yr?8:e!==null&&typeof e=="object"&&typeof e.then=="function"?6:1,se=e,rt===null&&(Ct=1,Zi(t,ze(e,t.current)))}function nh(){var t=ve.current;return t===null?!0:(ct&4194048)===ct?Ae===null:(ct&62914560)===ct||ct&536870912?t===Ae:!1}function ih(){var t=lt.H;return lt.H=Tn,t===null?Tn:t}function uh(){var t=lt.A;return lt.A=Gm,t}function Qi(){Ct=4,pa||(ct&4194048)!==ct&&ve.current!==null||(Ll=!0),!(Na&134217727)&&!(Ga&134217727)||_t===null||va(_t,ct,fe,!1)}function Wu(t,e,a){var l=ht;ht|=2;var n=ih(),i=uh();(_t!==t||ct!==e)&&(Xi=null,Dl(t,e)),e=!1;var u=Ct;t:do try{if(vt!==0&&rt!==null){var s=rt,r=se;switch(vt){case 8:Kr(),u=6;break t;case 3:case 2:case 9:case 6:ve.current===null&&(e=!0);var h=vt;if(vt=0,se=null,pl(t,s,r,h),a&&Ll){u=0;break t}break;default:h=vt,vt=0,se=null,pl(t,s,r,h)}}Qm(),u=Ct;break}catch(b){lh(t,b)}while(!0);return e&&t.shellSuspendCounter++,Fe=Ia=null,ht=l,lt.H=n,lt.A=i,rt===null&&(_t=null,ct=0,ru()),u}function Qm(){for(;rt!==null;)sh(rt)}function Vm(t,e){var a=ht;ht|=2;var l=ih(),n=uh();_t!==t||ct!==e?(Xi=null,qi=oe()+500,Dl(t,e)):Ll=Mn(t,e);t:do try{if(vt!==0&&rt!==null){e=rt;var i=se;e:switch(vt){case 1:vt=0,se=null,pl(t,e,i,1);break;case 2:case 9:if(Bc(i)){vt=0,se=null,sf(e);break}e=function(){vt!==2&&vt!==9||_t!==t||(vt=7),Le(t)},i.then(e,e);break t;case 3:vt=7;break t;case 4:vt=5;break t;case 7:Bc(i)?(vt=0,se=null,sf(e)):(vt=0,se=null,pl(t,e,i,7));break;case 5:var u=null;switch(rt.tag){case 26:u=rt.memoizedState;case 5:case 27:var s=rt;if(u?wh(u):s.stateNode.complete){vt=0,se=null;var r=s.sibling;if(r!==null)rt=r;else{var h=s.return;h!==null?(rt=h,yu(h)):rt=null}break e}}vt=0,se=null,pl(t,e,i,5);break;case 6:vt=0,se=null,pl(t,e,i,6);break;case 8:Kr(),Ct=6;break t;default:throw Error(G(462))}}Km();break}catch(b){lh(t,b)}while(!0);return Fe=Ia=null,lt.H=l,lt.A=n,ht=a,rt!==null?0:(_t=null,ct=0,ru(),Ct)}function Km(){for(;rt!==null&&!v0();)sh(rt)}function sh(t){var e=Md(t.alternate,t,na);t.memoizedProps=t.pendingProps,e===null?yu(t):rt=e}function sf(t){var e=t,a=e.alternate;switch(e.tag){case 15:case 0:e=Pc(a,e,e.pendingProps,e.type,void 0,ct);break;case 11:e=Pc(a,e,e.pendingProps,e.type.render,e.ref,ct);break;case 5:jr(e);default:Rd(a,e),e=rt=Ro(e,na),e=Md(a,e,na)}t.memoizedProps=t.pendingProps,e===null?yu(t):rt=e}function pl(t,e,a,l){Fe=Ia=null,jr(e),_l=null,En=0;var n=e.return;try{if(Rm(t,n,e,a,ct)){Ct=1,Zi(t,ze(a,t.current)),rt=null;return}}catch(i){if(n!==null)throw rt=n,i;Ct=1,Zi(t,ze(a,t.current)),rt=null;return}e.flags&32768?(ft||l===1?t=!0:Ll||ct&536870912?t=!1:(pa=t=!0,(l===2||l===9||l===3||l===6)&&(l=ve.current,l!==null&&l.tag===13&&(l.flags|=16384))),rh(e,t)):yu(e)}function yu(t){var e=t;do{if(e.flags&32768){rh(e,pa);return}t=e.return;var a=km(e.alternate,e,na);if(a!==null){rt=a;return}if(e=e.sibling,e!==null){rt=e;return}rt=e=t}while(e!==null);Ct===0&&(Ct=5)}function rh(t,e){do{var a=Lm(t.alternate,t);if(a!==null){a.flags&=32767,rt=a;return}if(a=t.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!e&&(t=t.sibling,t!==null)){rt=t;return}rt=t=a}while(t!==null);Ct=6,rt=null}function rf(t,e,a,l,n,i,u,s,r){t.cancelPendingCommit=null;do gu();while(Lt!==0);if(ht&6)throw Error(G(327));if(e!==null){if(e===t.current)throw Error(G(177));if(i=e.lanes|e.childLanes,i|=gr,T0(t,a,i,u,s,r),t===_t&&(rt=_t=null,ct=0),Nl=e,za=t,Pe=a,Zs=i,Ys=n,th=l,e.subtreeFlags&10256||e.flags&10256?(t.callbackNode=null,t.callbackPriority=0,$m(Ci,function(){return hh(),null})):(t.callbackNode=null,t.callbackPriority=0),l=(e.flags&13878)!==0,e.subtreeFlags&13878||l){l=lt.T,lt.T=null,n=mt.p,mt.p=2,u=ht,ht|=4;try{Zm(t,e,a)}finally{ht=u,mt.p=n,lt.T=l}}Lt=1,ch(),fh(),oh()}}function ch(){if(Lt===1){Lt=0;var t=za,e=Nl,a=(e.flags&13878)!==0;if(e.subtreeFlags&13878||a){a=lt.T,lt.T=null;var l=mt.p;mt.p=2;var n=ht;ht|=4;try{Vd(e,t);var i=Vs,u=wo(t.containerInfo),s=i.focusedElem,r=i.selectionRange;if(u!==s&&s&&s.ownerDocument&&To(s.ownerDocument.documentElement,s)){if(r!==null&&yr(s)){var h=r.start,b=r.end;if(b===void 0&&(b=h),"selectionStart"in s)s.selectionStart=h,s.selectionEnd=Math.min(b,s.value.length);else{var g=s.ownerDocument||document,m=g&&g.defaultView||window;if(m.getSelection){var o=m.getSelection(),_=s.textContent.length,v=Math.min(r.start,_),S=r.end===void 0?v:Math.min(r.end,_);!o.extend&&v>S&&(u=S,S=v,v=u);var c=Cc(s,v),d=Cc(s,S);if(c&&d&&(o.rangeCount!==1||o.anchorNode!==c.node||o.anchorOffset!==c.offset||o.focusNode!==d.node||o.focusOffset!==d.offset)){var y=g.createRange();y.setStart(c.node,c.offset),o.removeAllRanges(),v>S?(o.addRange(y),o.extend(d.node,d.offset)):(y.setEnd(d.node,d.offset),o.addRange(y))}}}}for(g=[],o=s;o=o.parentNode;)o.nodeType===1&&g.push({element:o,left:o.scrollLeft,top:o.scrollTop});for(typeof s.focus=="function"&&s.focus(),s=0;s<g.length;s++){var x=g[s];x.element.scrollLeft=x.left,x.element.scrollTop=x.top}}Pi=!!Qs,Vs=Qs=null}finally{ht=n,mt.p=l,lt.T=a}}t.current=e,Lt=2}}function fh(){if(Lt===2){Lt=0;var t=za,e=Nl,a=(e.flags&8772)!==0;if(e.subtreeFlags&8772||a){a=lt.T,lt.T=null;var l=mt.p;mt.p=2;var n=ht;ht|=4;try{Yd(t,e.alternate,e)}finally{ht=n,mt.p=l,lt.T=a}}Lt=3}}function oh(){if(Lt===4||Lt===3){Lt=0,y0();var t=za,e=Nl,a=Pe,l=th;e.subtreeFlags&10256||e.flags&10256?Lt=5:(Lt=0,Nl=za=null,dh(t,t.pendingLanes));var n=t.pendingLanes;if(n===0&&(xa=null),fr(a),e=e.stateNode,de&&typeof de.onCommitFiberRoot=="function")try{de.onCommitFiberRoot(Un,e,void 0,(e.current.flags&128)===128)}catch{}if(l!==null){e=lt.T,n=mt.p,mt.p=2,lt.T=null;try{for(var i=t.onRecoverableError,u=0;u<l.length;u++){var s=l[u];i(s.value,{componentStack:s.stack})}}finally{lt.T=e,mt.p=n}}Pe&3&&gu(),Le(t),n=t.pendingLanes,a&261930&&n&42?t===Gs?vn++:(vn=0,Gs=t):vn=0,Yn(0)}}function dh(t,e){(t.pooledCacheLanes&=e)===0&&(e=t.pooledCache,e!=null&&(t.pooledCache=null,kn(e)))}function gu(){return ch(),fh(),oh(),hh()}function hh(){if(Lt!==5)return!1;var t=za,e=Zs;Zs=0;var a=fr(Pe),l=lt.T,n=mt.p;try{mt.p=32>a?32:a,lt.T=null,a=Ys,Ys=null;var i=za,u=Pe;if(Lt=0,Nl=za=null,Pe=0,ht&6)throw Error(G(331));var s=ht;if(ht|=4,$d(i.current),Jd(i,i.current,u,a),ht=s,Yn(0,!1),de&&typeof de.onPostCommitFiberRoot=="function")try{de.onPostCommitFiberRoot(Un,i)}catch{}return!0}finally{mt.p=n,lt.T=l,dh(t,e)}}function cf(t,e,a){e=ze(a,e),e=Rs(t.stateNode,e,2),t=Sa(t,e,2),t!==null&&(Rn(t,2),Le(t))}function yt(t,e,a){if(t.tag===3)cf(t,t,a);else for(;e!==null;){if(e.tag===3){cf(e,t,a);break}else if(e.tag===1){var l=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof l.componentDidCatch=="function"&&(xa===null||!xa.has(l))){t=ze(a,t),a=Od(2),l=Sa(e,a,2),l!==null&&(Cd(a,l,e,t),Rn(l,2),Le(l));break}}e=e.return}}function Fu(t,e,a){var l=t.pingCache;if(l===null){l=t.pingCache=new qm;var n=new Set;l.set(e,n)}else n=l.get(e),n===void 0&&(n=new Set,l.set(e,n));n.has(a)||(Qr=!0,n.add(a),t=Jm.bind(null,t,e,a),e.then(t,t))}function Jm(t,e,a){var l=t.pingCache;l!==null&&l.delete(e),t.pingedLanes|=t.suspendedLanes&a,t.warmLanes&=~a,_t===t&&(ct&a)===a&&(Ct===4||Ct===3&&(ct&62914560)===ct&&300>oe()-pu?!(ht&2)&&Dl(t,0):Vr|=a,Cl===ct&&(Cl=0)),Le(t)}function mh(t,e){e===0&&(e=no()),t=$a(t,e),t!==null&&(Rn(t,e),Le(t))}function Wm(t){var e=t.memoizedState,a=0;e!==null&&(a=e.retryLane),mh(t,a)}function Fm(t,e){var a=0;switch(t.tag){case 31:case 13:var l=t.stateNode,n=t.memoizedState;n!==null&&(a=n.retryLane);break;case 19:l=t.stateNode;break;case 22:l=t.stateNode._retryCache;break;default:throw Error(G(314))}l!==null&&l.delete(e),mh(t,a)}function $m(t,e){return rr(t,e)}var Vi=null,ll=null,qs=!1,Ki=!1,$u=!1,ya=0;function Le(t){t!==ll&&t.next===null&&(ll===null?Vi=ll=t:ll=ll.next=t),Ki=!0,qs||(qs=!0,Pm())}function Yn(t,e){if(!$u&&Ki){$u=!0;do for(var a=!1,l=Vi;l!==null;){if(t!==0){var n=l.pendingLanes;if(n===0)var i=0;else{var u=l.suspendedLanes,s=l.pingedLanes;i=(1<<31-he(42|t)+1)-1,i&=n&~(u&~s),i=i&201326741?i&201326741|1:i?i|2:0}i!==0&&(a=!0,ff(l,i))}else i=ct,i=nu(l,l===_t?i:0,l.cancelPendingCommit!==null||l.timeoutHandle!==-1),!(i&3)||Mn(l,i)||(a=!0,ff(l,i));l=l.next}while(a);$u=!1}}function Im(){ph()}function ph(){Ki=qs=!1;var t=0;ya!==0&&c1()&&(t=ya);for(var e=oe(),a=null,l=Vi;l!==null;){var n=l.next,i=vh(l,e);i===0?(l.next=null,a===null?Vi=n:a.next=n,n===null&&(ll=a)):(a=l,(t!==0||i&3)&&(Ki=!0)),l=n}Lt!==0&&Lt!==5||Yn(t),ya!==0&&(ya=0)}function vh(t,e){for(var a=t.suspendedLanes,l=t.pingedLanes,n=t.expirationTimes,i=t.pendingLanes&-62914561;0<i;){var u=31-he(i),s=1<<u,r=n[u];r===-1?(!(s&a)||s&l)&&(n[u]=A0(s,e)):r<=e&&(t.expiredLanes|=s),i&=~s}if(e=_t,a=ct,a=nu(t,t===e?a:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),l=t.callbackNode,a===0||t===e&&(vt===2||vt===9)||t.cancelPendingCommit!==null)return l!==null&&l!==null&&Au(l),t.callbackNode=null,t.callbackPriority=0;if(!(a&3)||Mn(t,a)){if(e=a&-a,e===t.callbackPriority)return e;switch(l!==null&&Au(l),fr(a)){case 2:case 8:a=ao;break;case 32:a=Ci;break;case 268435456:a=lo;break;default:a=Ci}return l=yh.bind(null,t),a=rr(a,l),t.callbackPriority=e,t.callbackNode=a,e}return l!==null&&l!==null&&Au(l),t.callbackPriority=2,t.callbackNode=null,2}function yh(t,e){if(Lt!==0&&Lt!==5)return t.callbackNode=null,t.callbackPriority=0,null;var a=t.callbackNode;if(gu()&&t.callbackNode!==a)return null;var l=ct;return l=nu(t,t===_t?l:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),l===0?null:(ah(t,l,e),vh(t,oe()),t.callbackNode!=null&&t.callbackNode===a?yh.bind(null,t):null)}function ff(t,e){if(gu())return null;ah(t,e,!0)}function Pm(){o1(function(){ht&6?rr(eo,Im):ph()})}function Jr(){if(ya===0){var t=Tl;t===0&&(t=Wn,Wn<<=1,!(Wn&261888)&&(Wn=256)),ya=t}return ya}function of(t){return t==null||typeof t=="symbol"||typeof t=="boolean"?null:typeof t=="function"?t:di(""+t)}function df(t,e){var a=e.ownerDocument.createElement("input");return a.name=e.name,a.value=e.value,t.id&&a.setAttribute("form",t.id),e.parentNode.insertBefore(a,e),t=new FormData(t),a.parentNode.removeChild(a),t}function t1(t,e,a,l,n){if(e==="submit"&&a&&a.stateNode===n){var i=of((n[ie]||null).action),u=l.submitter;u&&(e=(e=u[ie]||null)?of(e.formAction):u.getAttribute("formAction"),e!==null&&(i=e,u=null));var s=new iu("action","action",null,l,n);t.push({event:s,listeners:[{instance:null,listener:function(){if(l.defaultPrevented){if(ya!==0){var r=u?df(n,u):new FormData(n);Us(a,{pending:!0,data:r,method:n.method,action:i},null,r)}}else typeof i=="function"&&(s.preventDefault(),r=u?df(n,u):new FormData(n),Us(a,{pending:!0,data:r,method:n.method,action:i},i,r))},currentTarget:n}]})}}for(var Iu=0;Iu<Ss.length;Iu++){var Pu=Ss[Iu],e1=Pu.toLowerCase(),a1=Pu[0].toUpperCase()+Pu.slice(1);De(e1,"on"+a1)}De(Co,"onAnimationEnd");De(No,"onAnimationIteration");De(Do,"onAnimationStart");De("dblclick","onDoubleClick");De("focusin","onFocus");De("focusout","onBlur");De(gm,"onTransitionRun");De(bm,"onTransitionStart");De(_m,"onTransitionCancel");De(jo,"onTransitionEnd");El("onMouseEnter",["mouseout","mouseover"]);El("onMouseLeave",["mouseout","mouseover"]);El("onPointerEnter",["pointerout","pointerover"]);El("onPointerLeave",["pointerout","pointerover"]);Ja("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Ja("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Ja("onBeforeInput",["compositionend","keypress","textInput","paste"]);Ja("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Ja("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Ja("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var wn="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),l1=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(wn));function gh(t,e){e=(e&4)!==0;for(var a=0;a<t.length;a++){var l=t[a],n=l.event;l=l.listeners;t:{var i=void 0;if(e)for(var u=l.length-1;0<=u;u--){var s=l[u],r=s.instance,h=s.currentTarget;if(s=s.listener,r!==i&&n.isPropagationStopped())break t;i=s,n.currentTarget=h;try{i(n)}catch(b){Di(b)}n.currentTarget=null,i=r}else for(u=0;u<l.length;u++){if(s=l[u],r=s.instance,h=s.currentTarget,s=s.listener,r!==i&&n.isPropagationStopped())break t;i=s,n.currentTarget=h;try{i(n)}catch(b){Di(b)}n.currentTarget=null,i=r}}}}function st(t,e){var a=e[hs];a===void 0&&(a=e[hs]=new Set);var l=t+"__bubble";a.has(l)||(bh(e,t,2,!1),a.add(l))}function ts(t,e,a){var l=0;e&&(l|=4),bh(a,t,l,e)}var ii="_reactListening"+Math.random().toString(36).slice(2);function Wr(t){if(!t[ii]){t[ii]=!0,co.forEach(function(a){a!=="selectionchange"&&(l1.has(a)||ts(a,!1,t),ts(a,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[ii]||(e[ii]=!0,ts("selectionchange",!1,e))}}function bh(t,e,a,l){switch(jh(e)){case 2:var n=D1;break;case 8:n=j1;break;default:n=Pr}a=n.bind(null,e,a,t),n=void 0,!gs||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(n=!0),l?n!==void 0?t.addEventListener(e,a,{capture:!0,passive:n}):t.addEventListener(e,a,!0):n!==void 0?t.addEventListener(e,a,{passive:n}):t.addEventListener(e,a,!1)}function es(t,e,a,l,n){var i=l;if(!(e&1)&&!(e&2)&&l!==null)t:for(;;){if(l===null)return;var u=l.tag;if(u===3||u===4){var s=l.stateNode.containerInfo;if(s===n)break;if(u===4)for(u=l.return;u!==null;){var r=u.tag;if((r===3||r===4)&&u.stateNode.containerInfo===n)return;u=u.return}for(;s!==null;){if(u=ul(s),u===null)return;if(r=u.tag,r===5||r===6||r===26||r===27){l=i=u;continue t}s=s.parentNode}}l=l.return}go(function(){var h=i,b=hr(a),g=[];t:{var m=Uo.get(t);if(m!==void 0){var o=iu,_=t;switch(t){case"keypress":if(mi(a)===0)break t;case"keydown":case"keyup":o=F0;break;case"focusin":_="focus",o=Nu;break;case"focusout":_="blur",o=Nu;break;case"beforeblur":case"afterblur":o=Nu;break;case"click":if(a.button===2)break t;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":o=bc;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":o=k0;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":o=P0;break;case Co:case No:case Do:o=Y0;break;case jo:o=em;break;case"scroll":case"scrollend":o=B0;break;case"wheel":o=lm;break;case"copy":case"cut":case"paste":o=q0;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":o=Sc;break;case"toggle":case"beforetoggle":o=im}var v=(e&4)!==0,S=!v&&(t==="scroll"||t==="scrollend"),c=v?m!==null?m+"Capture":null:m;v=[];for(var d=h,y;d!==null;){var x=d;if(y=x.stateNode,x=x.tag,x!==5&&x!==26&&x!==27||y===null||c===null||(x=bn(d,c),x!=null&&v.push(On(d,x,y))),S)break;d=d.return}0<v.length&&(m=new o(m,_,null,a,b),g.push({event:m,listeners:v}))}}if(!(e&7)){t:{if(m=t==="mouseover"||t==="pointerover",o=t==="mouseout"||t==="pointerout",m&&a!==ys&&(_=a.relatedTarget||a.fromElement)&&(ul(_)||_[Rl]))break t;if((o||m)&&(m=b.window===b?b:(m=b.ownerDocument)?m.defaultView||m.parentWindow:window,o?(_=a.relatedTarget||a.toElement,o=h,_=_?ul(_):null,_!==null&&(S=jn(_),v=_.tag,_!==S||v!==5&&v!==27&&v!==6)&&(_=null)):(o=null,_=h),o!==_)){if(v=bc,x="onMouseLeave",c="onMouseEnter",d="mouse",(t==="pointerout"||t==="pointerover")&&(v=Sc,x="onPointerLeave",c="onPointerEnter",d="pointer"),S=o==null?m:tn(o),y=_==null?m:tn(_),m=new v(x,d+"leave",o,a,b),m.target=S,m.relatedTarget=y,x=null,ul(b)===h&&(v=new v(c,d+"enter",_,a,b),v.target=y,v.relatedTarget=S,x=v),S=x,o&&_)e:{for(v=n1,c=o,d=_,y=0,x=c;x;x=v(x))y++;x=0;for(var w=d;w;w=v(w))x++;for(;0<y-x;)c=v(c),y--;for(;0<x-y;)d=v(d),x--;for(;y--;){if(c===d||d!==null&&c===d.alternate){v=c;break e}c=v(c),d=v(d)}v=null}else v=null;o!==null&&hf(g,m,o,v,!1),_!==null&&S!==null&&hf(g,S,_,v,!0)}}t:{if(m=h?tn(h):window,o=m.nodeName&&m.nodeName.toLowerCase(),o==="select"||o==="input"&&m.type==="file")var M=Ac;else if(Ec(m))if(Eo)M=pm;else{M=hm;var T=dm}else o=m.nodeName,!o||o.toLowerCase()!=="input"||m.type!=="checkbox"&&m.type!=="radio"?h&&dr(h.elementType)&&(M=Ac):M=mm;if(M&&(M=M(t,h))){zo(g,M,a,b);break t}T&&T(t,m,h),t==="focusout"&&h&&m.type==="number"&&h.memoizedProps.value!=null&&vs(m,"number",m.value)}switch(T=h?tn(h):window,t){case"focusin":(Ec(T)||T.contentEditable==="true")&&(cl=T,bs=h,sn=null);break;case"focusout":sn=bs=cl=null;break;case"mousedown":_s=!0;break;case"contextmenu":case"mouseup":case"dragend":_s=!1,Nc(g,a,b);break;case"selectionchange":if(ym)break;case"keydown":case"keyup":Nc(g,a,b)}var D;if(vr)t:{switch(t){case"compositionstart":var C="onCompositionStart";break t;case"compositionend":C="onCompositionEnd";break t;case"compositionupdate":C="onCompositionUpdate";break t}C=void 0}else rl?So(t,a)&&(C="onCompositionEnd"):t==="keydown"&&a.keyCode===229&&(C="onCompositionStart");C&&(_o&&a.locale!=="ko"&&(rl||C!=="onCompositionStart"?C==="onCompositionEnd"&&rl&&(D=bo()):(ma=b,mr="value"in ma?ma.value:ma.textContent,rl=!0)),T=Ji(h,C),0<T.length&&(C=new _c(C,t,null,a,b),g.push({event:C,listeners:T}),D?C.data=D:(D=xo(a),D!==null&&(C.data=D)))),(D=sm?rm(t,a):cm(t,a))&&(C=Ji(h,"onBeforeInput"),0<C.length&&(T=new _c("onBeforeInput","beforeinput",null,a,b),g.push({event:T,listeners:C}),T.data=D)),t1(g,t,h,a,b)}gh(g,e)})}function On(t,e,a){return{instance:t,listener:e,currentTarget:a}}function Ji(t,e){for(var a=e+"Capture",l=[];t!==null;){var n=t,i=n.stateNode;if(n=n.tag,n!==5&&n!==26&&n!==27||i===null||(n=bn(t,a),n!=null&&l.unshift(On(t,n,i)),n=bn(t,e),n!=null&&l.push(On(t,n,i))),t.tag===3)return l;t=t.return}return[]}function n1(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5&&t.tag!==27);return t||null}function hf(t,e,a,l,n){for(var i=e._reactName,u=[];a!==null&&a!==l;){var s=a,r=s.alternate,h=s.stateNode;if(s=s.tag,r!==null&&r===l)break;s!==5&&s!==26&&s!==27||h===null||(r=h,n?(h=bn(a,i),h!=null&&u.unshift(On(a,h,r))):n||(h=bn(a,i),h!=null&&u.push(On(a,h,r)))),a=a.return}u.length!==0&&t.push({event:e,listeners:u})}var i1=/\r\n?/g,u1=/\u0000|\uFFFD/g;function mf(t){return(typeof t=="string"?t:""+t).replace(i1,`
`).replace(u1,"")}function _h(t,e){return e=mf(e),mf(t)===e}function gt(t,e,a,l,n,i){switch(a){case"children":typeof l=="string"?e==="body"||e==="textarea"&&l===""||Al(t,l):(typeof l=="number"||typeof l=="bigint")&&e!=="body"&&Al(t,""+l);break;case"className":In(t,"class",l);break;case"tabIndex":In(t,"tabindex",l);break;case"dir":case"role":case"viewBox":case"width":case"height":In(t,a,l);break;case"style":yo(t,l,i);break;case"data":if(e!=="object"){In(t,"data",l);break}case"src":case"href":if(l===""&&(e!=="a"||a!=="href")){t.removeAttribute(a);break}if(l==null||typeof l=="function"||typeof l=="symbol"||typeof l=="boolean"){t.removeAttribute(a);break}l=di(""+l),t.setAttribute(a,l);break;case"action":case"formAction":if(typeof l=="function"){t.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof i=="function"&&(a==="formAction"?(e!=="input"&&gt(t,e,"name",n.name,n,null),gt(t,e,"formEncType",n.formEncType,n,null),gt(t,e,"formMethod",n.formMethod,n,null),gt(t,e,"formTarget",n.formTarget,n,null)):(gt(t,e,"encType",n.encType,n,null),gt(t,e,"method",n.method,n,null),gt(t,e,"target",n.target,n,null)));if(l==null||typeof l=="symbol"||typeof l=="boolean"){t.removeAttribute(a);break}l=di(""+l),t.setAttribute(a,l);break;case"onClick":l!=null&&(t.onclick=We);break;case"onScroll":l!=null&&st("scroll",t);break;case"onScrollEnd":l!=null&&st("scrollend",t);break;case"dangerouslySetInnerHTML":if(l!=null){if(typeof l!="object"||!("__html"in l))throw Error(G(61));if(a=l.__html,a!=null){if(n.children!=null)throw Error(G(60));t.innerHTML=a}}break;case"multiple":t.multiple=l&&typeof l!="function"&&typeof l!="symbol";break;case"muted":t.muted=l&&typeof l!="function"&&typeof l!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(l==null||typeof l=="function"||typeof l=="boolean"||typeof l=="symbol"){t.removeAttribute("xlink:href");break}a=di(""+l),t.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":l!=null&&typeof l!="function"&&typeof l!="symbol"?t.setAttribute(a,""+l):t.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":l&&typeof l!="function"&&typeof l!="symbol"?t.setAttribute(a,""):t.removeAttribute(a);break;case"capture":case"download":l===!0?t.setAttribute(a,""):l!==!1&&l!=null&&typeof l!="function"&&typeof l!="symbol"?t.setAttribute(a,l):t.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":l!=null&&typeof l!="function"&&typeof l!="symbol"&&!isNaN(l)&&1<=l?t.setAttribute(a,l):t.removeAttribute(a);break;case"rowSpan":case"start":l==null||typeof l=="function"||typeof l=="symbol"||isNaN(l)?t.removeAttribute(a):t.setAttribute(a,l);break;case"popover":st("beforetoggle",t),st("toggle",t),oi(t,"popover",l);break;case"xlinkActuate":Ye(t,"http://www.w3.org/1999/xlink","xlink:actuate",l);break;case"xlinkArcrole":Ye(t,"http://www.w3.org/1999/xlink","xlink:arcrole",l);break;case"xlinkRole":Ye(t,"http://www.w3.org/1999/xlink","xlink:role",l);break;case"xlinkShow":Ye(t,"http://www.w3.org/1999/xlink","xlink:show",l);break;case"xlinkTitle":Ye(t,"http://www.w3.org/1999/xlink","xlink:title",l);break;case"xlinkType":Ye(t,"http://www.w3.org/1999/xlink","xlink:type",l);break;case"xmlBase":Ye(t,"http://www.w3.org/XML/1998/namespace","xml:base",l);break;case"xmlLang":Ye(t,"http://www.w3.org/XML/1998/namespace","xml:lang",l);break;case"xmlSpace":Ye(t,"http://www.w3.org/XML/1998/namespace","xml:space",l);break;case"is":oi(t,"is",l);break;case"innerText":case"textContent":break;default:(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")&&(a=M0.get(a)||a,oi(t,a,l))}}function Xs(t,e,a,l,n,i){switch(a){case"style":yo(t,l,i);break;case"dangerouslySetInnerHTML":if(l!=null){if(typeof l!="object"||!("__html"in l))throw Error(G(61));if(a=l.__html,a!=null){if(n.children!=null)throw Error(G(60));t.innerHTML=a}}break;case"children":typeof l=="string"?Al(t,l):(typeof l=="number"||typeof l=="bigint")&&Al(t,""+l);break;case"onScroll":l!=null&&st("scroll",t);break;case"onScrollEnd":l!=null&&st("scrollend",t);break;case"onClick":l!=null&&(t.onclick=We);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!fo.hasOwnProperty(a))t:{if(a[0]==="o"&&a[1]==="n"&&(n=a.endsWith("Capture"),e=a.slice(2,n?a.length-7:void 0),i=t[ie]||null,i=i!=null?i[a]:null,typeof i=="function"&&t.removeEventListener(e,i,n),typeof l=="function")){typeof i!="function"&&i!==null&&(a in t?t[a]=null:t.hasAttribute(a)&&t.removeAttribute(a)),t.addEventListener(e,l,n);break t}a in t?t[a]=l:l===!0?t.setAttribute(a,""):oi(t,a,l)}}}function Wt(t,e,a){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":st("error",t),st("load",t);var l=!1,n=!1,i;for(i in a)if(a.hasOwnProperty(i)){var u=a[i];if(u!=null)switch(i){case"src":l=!0;break;case"srcSet":n=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(G(137,e));default:gt(t,e,i,u,a,null)}}n&&gt(t,e,"srcSet",a.srcSet,a,null),l&&gt(t,e,"src",a.src,a,null);return;case"input":st("invalid",t);var s=i=u=n=null,r=null,h=null;for(l in a)if(a.hasOwnProperty(l)){var b=a[l];if(b!=null)switch(l){case"name":n=b;break;case"type":u=b;break;case"checked":r=b;break;case"defaultChecked":h=b;break;case"value":i=b;break;case"defaultValue":s=b;break;case"children":case"dangerouslySetInnerHTML":if(b!=null)throw Error(G(137,e));break;default:gt(t,e,l,b,a,null)}}mo(t,i,s,r,h,u,n,!1);return;case"select":st("invalid",t),l=u=i=null;for(n in a)if(a.hasOwnProperty(n)&&(s=a[n],s!=null))switch(n){case"value":i=s;break;case"defaultValue":u=s;break;case"multiple":l=s;default:gt(t,e,n,s,a,null)}e=i,a=u,t.multiple=!!l,e!=null?yl(t,!!l,e,!1):a!=null&&yl(t,!!l,a,!0);return;case"textarea":st("invalid",t),i=n=l=null;for(u in a)if(a.hasOwnProperty(u)&&(s=a[u],s!=null))switch(u){case"value":l=s;break;case"defaultValue":n=s;break;case"children":i=s;break;case"dangerouslySetInnerHTML":if(s!=null)throw Error(G(91));break;default:gt(t,e,u,s,a,null)}vo(t,l,n,i);return;case"option":for(r in a)if(a.hasOwnProperty(r)&&(l=a[r],l!=null))switch(r){case"selected":t.selected=l&&typeof l!="function"&&typeof l!="symbol";break;default:gt(t,e,r,l,a,null)}return;case"dialog":st("beforetoggle",t),st("toggle",t),st("cancel",t),st("close",t);break;case"iframe":case"object":st("load",t);break;case"video":case"audio":for(l=0;l<wn.length;l++)st(wn[l],t);break;case"image":st("error",t),st("load",t);break;case"details":st("toggle",t);break;case"embed":case"source":case"link":st("error",t),st("load",t);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(h in a)if(a.hasOwnProperty(h)&&(l=a[h],l!=null))switch(h){case"children":case"dangerouslySetInnerHTML":throw Error(G(137,e));default:gt(t,e,h,l,a,null)}return;default:if(dr(e)){for(b in a)a.hasOwnProperty(b)&&(l=a[b],l!==void 0&&Xs(t,e,b,l,a,void 0));return}}for(s in a)a.hasOwnProperty(s)&&(l=a[s],l!=null&&gt(t,e,s,l,a,null))}function s1(t,e,a,l){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var n=null,i=null,u=null,s=null,r=null,h=null,b=null;for(o in a){var g=a[o];if(a.hasOwnProperty(o)&&g!=null)switch(o){case"checked":break;case"value":break;case"defaultValue":r=g;default:l.hasOwnProperty(o)||gt(t,e,o,null,l,g)}}for(var m in l){var o=l[m];if(g=a[m],l.hasOwnProperty(m)&&(o!=null||g!=null))switch(m){case"type":i=o;break;case"name":n=o;break;case"checked":h=o;break;case"defaultChecked":b=o;break;case"value":u=o;break;case"defaultValue":s=o;break;case"children":case"dangerouslySetInnerHTML":if(o!=null)throw Error(G(137,e));break;default:o!==g&&gt(t,e,m,o,l,g)}}ps(t,u,s,r,h,b,i,n);return;case"select":o=u=s=m=null;for(i in a)if(r=a[i],a.hasOwnProperty(i)&&r!=null)switch(i){case"value":break;case"multiple":o=r;default:l.hasOwnProperty(i)||gt(t,e,i,null,l,r)}for(n in l)if(i=l[n],r=a[n],l.hasOwnProperty(n)&&(i!=null||r!=null))switch(n){case"value":m=i;break;case"defaultValue":s=i;break;case"multiple":u=i;default:i!==r&&gt(t,e,n,i,l,r)}e=s,a=u,l=o,m!=null?yl(t,!!a,m,!1):!!l!=!!a&&(e!=null?yl(t,!!a,e,!0):yl(t,!!a,a?[]:"",!1));return;case"textarea":o=m=null;for(s in a)if(n=a[s],a.hasOwnProperty(s)&&n!=null&&!l.hasOwnProperty(s))switch(s){case"value":break;case"children":break;default:gt(t,e,s,null,l,n)}for(u in l)if(n=l[u],i=a[u],l.hasOwnProperty(u)&&(n!=null||i!=null))switch(u){case"value":m=n;break;case"defaultValue":o=n;break;case"children":break;case"dangerouslySetInnerHTML":if(n!=null)throw Error(G(91));break;default:n!==i&&gt(t,e,u,n,l,i)}po(t,m,o);return;case"option":for(var _ in a)if(m=a[_],a.hasOwnProperty(_)&&m!=null&&!l.hasOwnProperty(_))switch(_){case"selected":t.selected=!1;break;default:gt(t,e,_,null,l,m)}for(r in l)if(m=l[r],o=a[r],l.hasOwnProperty(r)&&m!==o&&(m!=null||o!=null))switch(r){case"selected":t.selected=m&&typeof m!="function"&&typeof m!="symbol";break;default:gt(t,e,r,m,l,o)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var v in a)m=a[v],a.hasOwnProperty(v)&&m!=null&&!l.hasOwnProperty(v)&&gt(t,e,v,null,l,m);for(h in l)if(m=l[h],o=a[h],l.hasOwnProperty(h)&&m!==o&&(m!=null||o!=null))switch(h){case"children":case"dangerouslySetInnerHTML":if(m!=null)throw Error(G(137,e));break;default:gt(t,e,h,m,l,o)}return;default:if(dr(e)){for(var S in a)m=a[S],a.hasOwnProperty(S)&&m!==void 0&&!l.hasOwnProperty(S)&&Xs(t,e,S,void 0,l,m);for(b in l)m=l[b],o=a[b],!l.hasOwnProperty(b)||m===o||m===void 0&&o===void 0||Xs(t,e,b,m,l,o);return}}for(var c in a)m=a[c],a.hasOwnProperty(c)&&m!=null&&!l.hasOwnProperty(c)&&gt(t,e,c,null,l,m);for(g in l)m=l[g],o=a[g],!l.hasOwnProperty(g)||m===o||m==null&&o==null||gt(t,e,g,m,l,o)}function pf(t){switch(t){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function r1(){if(typeof performance.getEntriesByType=="function"){for(var t=0,e=0,a=performance.getEntriesByType("resource"),l=0;l<a.length;l++){var n=a[l],i=n.transferSize,u=n.initiatorType,s=n.duration;if(i&&s&&pf(u)){for(u=0,s=n.responseEnd,l+=1;l<a.length;l++){var r=a[l],h=r.startTime;if(h>s)break;var b=r.transferSize,g=r.initiatorType;b&&pf(g)&&(r=r.responseEnd,u+=b*(r<s?1:(s-h)/(r-h)))}if(--l,e+=8*(i+u)/(n.duration/1e3),t++,10<t)break}}if(0<t)return e/t/1e6}return navigator.connection&&(t=navigator.connection.downlink,typeof t=="number")?t:5}var Qs=null,Vs=null;function Wi(t){return t.nodeType===9?t:t.ownerDocument}function vf(t){switch(t){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function Sh(t,e){if(t===0)switch(e){case"svg":return 1;case"math":return 2;default:return 0}return t===1&&e==="foreignObject"?0:t}function Ks(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.children=="bigint"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var as=null;function c1(){var t=window.event;return t&&t.type==="popstate"?t===as?!1:(as=t,!0):(as=null,!1)}var xh=typeof setTimeout=="function"?setTimeout:void 0,f1=typeof clearTimeout=="function"?clearTimeout:void 0,yf=typeof Promise=="function"?Promise:void 0,o1=typeof queueMicrotask=="function"?queueMicrotask:typeof yf<"u"?function(t){return yf.resolve(null).then(t).catch(d1)}:xh;function d1(t){setTimeout(function(){throw t})}function ja(t){return t==="head"}function gf(t,e){var a=e,l=0;do{var n=a.nextSibling;if(t.removeChild(a),n&&n.nodeType===8)if(a=n.data,a==="/$"||a==="/&"){if(l===0){t.removeChild(n),Ul(e);return}l--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")l++;else if(a==="html")yn(t.ownerDocument.documentElement);else if(a==="head"){a=t.ownerDocument.head,yn(a);for(var i=a.firstChild;i;){var u=i.nextSibling,s=i.nodeName;i[Bn]||s==="SCRIPT"||s==="STYLE"||s==="LINK"&&i.rel.toLowerCase()==="stylesheet"||a.removeChild(i),i=u}}else a==="body"&&yn(t.ownerDocument.body);a=n}while(a);Ul(e)}function bf(t,e){var a=t;t=0;do{var l=a.nextSibling;if(a.nodeType===1?e?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(e?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),l&&l.nodeType===8)if(a=l.data,a==="/$"){if(t===0)break;t--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||t++;a=l}while(a)}function Js(t){var e=t.firstChild;for(e&&e.nodeType===10&&(e=e.nextSibling);e;){var a=e;switch(e=e.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":Js(a),or(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}t.removeChild(a)}}function h1(t,e,a,l){for(;t.nodeType===1;){var n=a;if(t.nodeName.toLowerCase()!==e.toLowerCase()){if(!l&&(t.nodeName!=="INPUT"||t.type!=="hidden"))break}else if(l){if(!t[Bn])switch(e){case"meta":if(!t.hasAttribute("itemprop"))break;return t;case"link":if(i=t.getAttribute("rel"),i==="stylesheet"&&t.hasAttribute("data-precedence"))break;if(i!==n.rel||t.getAttribute("href")!==(n.href==null||n.href===""?null:n.href)||t.getAttribute("crossorigin")!==(n.crossOrigin==null?null:n.crossOrigin)||t.getAttribute("title")!==(n.title==null?null:n.title))break;return t;case"style":if(t.hasAttribute("data-precedence"))break;return t;case"script":if(i=t.getAttribute("src"),(i!==(n.src==null?null:n.src)||t.getAttribute("type")!==(n.type==null?null:n.type)||t.getAttribute("crossorigin")!==(n.crossOrigin==null?null:n.crossOrigin))&&i&&t.hasAttribute("async")&&!t.hasAttribute("itemprop"))break;return t;default:return t}}else if(e==="input"&&t.type==="hidden"){var i=n.name==null?null:""+n.name;if(n.type==="hidden"&&t.getAttribute("name")===i)return t}else return t;if(t=Te(t.nextSibling),t===null)break}return null}function m1(t,e,a){if(e==="")return null;for(;t.nodeType!==3;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!a||(t=Te(t.nextSibling),t===null))return null;return t}function zh(t,e){for(;t.nodeType!==8;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!e||(t=Te(t.nextSibling),t===null))return null;return t}function Ws(t){return t.data==="$?"||t.data==="$~"}function Fs(t){return t.data==="$!"||t.data==="$?"&&t.ownerDocument.readyState!=="loading"}function p1(t,e){var a=t.ownerDocument;if(t.data==="$~")t._reactRetry=e;else if(t.data!=="$?"||a.readyState!=="loading")e();else{var l=function(){e(),a.removeEventListener("DOMContentLoaded",l)};a.addEventListener("DOMContentLoaded",l),t._reactRetry=l}}function Te(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?"||e==="$~"||e==="&"||e==="F!"||e==="F")break;if(e==="/$"||e==="/&")return null}}return t}var $s=null;function _f(t){t=t.nextSibling;for(var e=0;t;){if(t.nodeType===8){var a=t.data;if(a==="/$"||a==="/&"){if(e===0)return Te(t.nextSibling);e--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||e++}t=t.nextSibling}return null}function Sf(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var a=t.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(e===0)return t;e--}else a!=="/$"&&a!=="/&"||e++}t=t.previousSibling}return null}function Eh(t,e,a){switch(e=Wi(a),t){case"html":if(t=e.documentElement,!t)throw Error(G(452));return t;case"head":if(t=e.head,!t)throw Error(G(453));return t;case"body":if(t=e.body,!t)throw Error(G(454));return t;default:throw Error(G(451))}}function yn(t){for(var e=t.attributes;e.length;)t.removeAttributeNode(e[0]);or(t)}var we=new Map,xf=new Set;function Fi(t){return typeof t.getRootNode=="function"?t.getRootNode():t.nodeType===9?t:t.ownerDocument}var ia=mt.d;mt.d={f:v1,r:y1,D:g1,C:b1,L:_1,m:S1,X:z1,S:x1,M:E1};function v1(){var t=ia.f(),e=vu();return t||e}function y1(t){var e=Bl(t);e!==null&&e.tag===5&&e.type==="form"?yd(e):ia.r(t)}var Zl=typeof document>"u"?null:document;function Ah(t,e,a){var l=Zl;if(l&&typeof e=="string"&&e){var n=xe(e);n='link[rel="'+t+'"][href="'+n+'"]',typeof a=="string"&&(n+='[crossorigin="'+a+'"]'),xf.has(n)||(xf.add(n),t={rel:t,crossOrigin:a,href:e},l.querySelector(n)===null&&(e=l.createElement("link"),Wt(e,"link",t),qt(e),l.head.appendChild(e)))}}function g1(t){ia.D(t),Ah("dns-prefetch",t,null)}function b1(t,e){ia.C(t,e),Ah("preconnect",t,e)}function _1(t,e,a){ia.L(t,e,a);var l=Zl;if(l&&t&&e){var n='link[rel="preload"][as="'+xe(e)+'"]';e==="image"&&a&&a.imageSrcSet?(n+='[imagesrcset="'+xe(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(n+='[imagesizes="'+xe(a.imageSizes)+'"]')):n+='[href="'+xe(t)+'"]';var i=n;switch(e){case"style":i=jl(t);break;case"script":i=Yl(t)}we.has(i)||(t=Tt({rel:"preload",href:e==="image"&&a&&a.imageSrcSet?void 0:t,as:e},a),we.set(i,t),l.querySelector(n)!==null||e==="style"&&l.querySelector(Gn(i))||e==="script"&&l.querySelector(qn(i))||(e=l.createElement("link"),Wt(e,"link",t),qt(e),l.head.appendChild(e)))}}function S1(t,e){ia.m(t,e);var a=Zl;if(a&&t){var l=e&&typeof e.as=="string"?e.as:"script",n='link[rel="modulepreload"][as="'+xe(l)+'"][href="'+xe(t)+'"]',i=n;switch(l){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":i=Yl(t)}if(!we.has(i)&&(t=Tt({rel:"modulepreload",href:t},e),we.set(i,t),a.querySelector(n)===null)){switch(l){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(qn(i)))return}l=a.createElement("link"),Wt(l,"link",t),qt(l),a.head.appendChild(l)}}}function x1(t,e,a){ia.S(t,e,a);var l=Zl;if(l&&t){var n=vl(l).hoistableStyles,i=jl(t);e=e||"default";var u=n.get(i);if(!u){var s={loading:0,preload:null};if(u=l.querySelector(Gn(i)))s.loading=5;else{t=Tt({rel:"stylesheet",href:t,"data-precedence":e},a),(a=we.get(i))&&Fr(t,a);var r=u=l.createElement("link");qt(r),Wt(r,"link",t),r._p=new Promise(function(h,b){r.onload=h,r.onerror=b}),r.addEventListener("load",function(){s.loading|=1}),r.addEventListener("error",function(){s.loading|=2}),s.loading|=4,xi(u,e,l)}u={type:"stylesheet",instance:u,count:1,state:s},n.set(i,u)}}}function z1(t,e){ia.X(t,e);var a=Zl;if(a&&t){var l=vl(a).hoistableScripts,n=Yl(t),i=l.get(n);i||(i=a.querySelector(qn(n)),i||(t=Tt({src:t,async:!0},e),(e=we.get(n))&&$r(t,e),i=a.createElement("script"),qt(i),Wt(i,"link",t),a.head.appendChild(i)),i={type:"script",instance:i,count:1,state:null},l.set(n,i))}}function E1(t,e){ia.M(t,e);var a=Zl;if(a&&t){var l=vl(a).hoistableScripts,n=Yl(t),i=l.get(n);i||(i=a.querySelector(qn(n)),i||(t=Tt({src:t,async:!0,type:"module"},e),(e=we.get(n))&&$r(t,e),i=a.createElement("script"),qt(i),Wt(i,"link",t),a.head.appendChild(i)),i={type:"script",instance:i,count:1,state:null},l.set(n,i))}}function zf(t,e,a,l){var n=(n=ga.current)?Fi(n):null;if(!n)throw Error(G(446));switch(t){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(e=jl(a.href),a=vl(n).hoistableStyles,l=a.get(e),l||(l={type:"style",instance:null,count:0,state:null},a.set(e,l)),l):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){t=jl(a.href);var i=vl(n).hoistableStyles,u=i.get(t);if(u||(n=n.ownerDocument||n,u={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},i.set(t,u),(i=n.querySelector(Gn(t)))&&!i._p&&(u.instance=i,u.state.loading=5),we.has(t)||(a={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},we.set(t,a),i||A1(n,t,a,u.state))),e&&l===null)throw Error(G(528,""));return u}if(e&&l!==null)throw Error(G(529,""));return null;case"script":return e=a.async,a=a.src,typeof a=="string"&&e&&typeof e!="function"&&typeof e!="symbol"?(e=Yl(a),a=vl(n).hoistableScripts,l=a.get(e),l||(l={type:"script",instance:null,count:0,state:null},a.set(e,l)),l):{type:"void",instance:null,count:0,state:null};default:throw Error(G(444,t))}}function jl(t){return'href="'+xe(t)+'"'}function Gn(t){return'link[rel="stylesheet"]['+t+"]"}function Th(t){return Tt({},t,{"data-precedence":t.precedence,precedence:null})}function A1(t,e,a,l){t.querySelector('link[rel="preload"][as="style"]['+e+"]")?l.loading=1:(e=t.createElement("link"),l.preload=e,e.addEventListener("load",function(){return l.loading|=1}),e.addEventListener("error",function(){return l.loading|=2}),Wt(e,"link",a),qt(e),t.head.appendChild(e))}function Yl(t){return'[src="'+xe(t)+'"]'}function qn(t){return"script[async]"+t}function Ef(t,e,a){if(e.count++,e.instance===null)switch(e.type){case"style":var l=t.querySelector('style[data-href~="'+xe(a.href)+'"]');if(l)return e.instance=l,qt(l),l;var n=Tt({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return l=(t.ownerDocument||t).createElement("style"),qt(l),Wt(l,"style",n),xi(l,a.precedence,t),e.instance=l;case"stylesheet":n=jl(a.href);var i=t.querySelector(Gn(n));if(i)return e.state.loading|=4,e.instance=i,qt(i),i;l=Th(a),(n=we.get(n))&&Fr(l,n),i=(t.ownerDocument||t).createElement("link"),qt(i);var u=i;return u._p=new Promise(function(s,r){u.onload=s,u.onerror=r}),Wt(i,"link",l),e.state.loading|=4,xi(i,a.precedence,t),e.instance=i;case"script":return i=Yl(a.src),(n=t.querySelector(qn(i)))?(e.instance=n,qt(n),n):(l=a,(n=we.get(i))&&(l=Tt({},a),$r(l,n)),t=t.ownerDocument||t,n=t.createElement("script"),qt(n),Wt(n,"link",l),t.head.appendChild(n),e.instance=n);case"void":return null;default:throw Error(G(443,e.type))}else e.type==="stylesheet"&&!(e.state.loading&4)&&(l=e.instance,e.state.loading|=4,xi(l,a.precedence,t));return e.instance}function xi(t,e,a){for(var l=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),n=l.length?l[l.length-1]:null,i=n,u=0;u<l.length;u++){var s=l[u];if(s.dataset.precedence===e)i=s;else if(i!==n)break}i?i.parentNode.insertBefore(t,i.nextSibling):(e=a.nodeType===9?a.head:a,e.insertBefore(t,e.firstChild))}function Fr(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.title==null&&(t.title=e.title)}function $r(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.integrity==null&&(t.integrity=e.integrity)}var zi=null;function Af(t,e,a){if(zi===null){var l=new Map,n=zi=new Map;n.set(a,l)}else n=zi,l=n.get(a),l||(l=new Map,n.set(a,l));if(l.has(t))return l;for(l.set(t,null),a=a.getElementsByTagName(t),n=0;n<a.length;n++){var i=a[n];if(!(i[Bn]||i[Vt]||t==="link"&&i.getAttribute("rel")==="stylesheet")&&i.namespaceURI!=="http://www.w3.org/2000/svg"){var u=i.getAttribute(e)||"";u=t+u;var s=l.get(u);s?s.push(i):l.set(u,[i])}}return l}function Tf(t,e,a){t=t.ownerDocument||t,t.head.insertBefore(a,e==="title"?t.querySelector("head > title"):null)}function T1(t,e,a){if(a===1||e.itemProp!=null)return!1;switch(t){case"meta":case"title":return!0;case"style":if(typeof e.precedence!="string"||typeof e.href!="string"||e.href==="")break;return!0;case"link":if(typeof e.rel!="string"||typeof e.href!="string"||e.href===""||e.onLoad||e.onError)break;switch(e.rel){case"stylesheet":return t=e.disabled,typeof e.precedence=="string"&&t==null;default:return!0}case"script":if(e.async&&typeof e.async!="function"&&typeof e.async!="symbol"&&!e.onLoad&&!e.onError&&e.src&&typeof e.src=="string")return!0}return!1}function wh(t){return!(t.type==="stylesheet"&&!(t.state.loading&3))}function w1(t,e,a,l){if(a.type==="stylesheet"&&(typeof l.media!="string"||matchMedia(l.media).matches!==!1)&&!(a.state.loading&4)){if(a.instance===null){var n=jl(l.href),i=e.querySelector(Gn(n));if(i){e=i._p,e!==null&&typeof e=="object"&&typeof e.then=="function"&&(t.count++,t=$i.bind(t),e.then(t,t)),a.state.loading|=4,a.instance=i,qt(i);return}i=e.ownerDocument||e,l=Th(l),(n=we.get(n))&&Fr(l,n),i=i.createElement("link"),qt(i);var u=i;u._p=new Promise(function(s,r){u.onload=s,u.onerror=r}),Wt(i,"link",l),a.instance=i}t.stylesheets===null&&(t.stylesheets=new Map),t.stylesheets.set(a,e),(e=a.state.preload)&&!(a.state.loading&3)&&(t.count++,a=$i.bind(t),e.addEventListener("load",a),e.addEventListener("error",a))}}var ls=0;function O1(t,e){return t.stylesheets&&t.count===0&&Ei(t,t.stylesheets),0<t.count||0<t.imgCount?function(a){var l=setTimeout(function(){if(t.stylesheets&&Ei(t,t.stylesheets),t.unsuspend){var i=t.unsuspend;t.unsuspend=null,i()}},6e4+e);0<t.imgBytes&&ls===0&&(ls=62500*r1());var n=setTimeout(function(){if(t.waitingForImages=!1,t.count===0&&(t.stylesheets&&Ei(t,t.stylesheets),t.unsuspend)){var i=t.unsuspend;t.unsuspend=null,i()}},(t.imgBytes>ls?50:800)+e);return t.unsuspend=a,function(){t.unsuspend=null,clearTimeout(l),clearTimeout(n)}}:null}function $i(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Ei(this,this.stylesheets);else if(this.unsuspend){var t=this.unsuspend;this.unsuspend=null,t()}}}var Ii=null;function Ei(t,e){t.stylesheets=null,t.unsuspend!==null&&(t.count++,Ii=new Map,e.forEach(C1,t),Ii=null,$i.call(t))}function C1(t,e){if(!(e.state.loading&4)){var a=Ii.get(t);if(a)var l=a.get(null);else{a=new Map,Ii.set(t,a);for(var n=t.querySelectorAll("link[data-precedence],style[data-precedence]"),i=0;i<n.length;i++){var u=n[i];(u.nodeName==="LINK"||u.getAttribute("media")!=="not all")&&(a.set(u.dataset.precedence,u),l=u)}l&&a.set(null,l)}n=e.instance,u=n.getAttribute("data-precedence"),i=a.get(u)||l,i===l&&a.set(null,n),a.set(u,n),this.count++,l=$i.bind(this),n.addEventListener("load",l),n.addEventListener("error",l),i?i.parentNode.insertBefore(n,i.nextSibling):(t=t.nodeType===9?t.head:t,t.insertBefore(n,t.firstChild)),e.state.loading|=4}}var Cn={$$typeof:Je,Provider:null,Consumer:null,_currentValue:ka,_currentValue2:ka,_threadCount:0};function N1(t,e,a,l,n,i,u,s,r){this.tag=1,this.containerInfo=t,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Tu(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Tu(0),this.hiddenUpdates=Tu(null),this.identifierPrefix=l,this.onUncaughtError=n,this.onCaughtError=i,this.onRecoverableError=u,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=r,this.incompleteTransitions=new Map}function Oh(t,e,a,l,n,i,u,s,r,h,b,g){return t=new N1(t,e,a,u,r,h,b,g,s),e=1,i===!0&&(e|=24),i=ce(3,null,null,e),t.current=i,i.stateNode=t,e=zr(),e.refCount++,t.pooledCache=e,e.refCount++,i.memoizedState={element:l,isDehydrated:a,cache:e},Tr(i),t}function Ch(t){return t?(t=dl,t):dl}function Nh(t,e,a,l,n,i){n=Ch(n),l.context===null?l.context=n:l.pendingContext=n,l=_a(e),l.payload={element:a},i=i===void 0?null:i,i!==null&&(l.callback=i),a=Sa(t,l,e),a!==null&&(ne(a,t,e),cn(a,t,e))}function wf(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var a=t.retryLane;t.retryLane=a!==0&&a<e?a:e}}function Ir(t,e){wf(t,e),(t=t.alternate)&&wf(t,e)}function Dh(t){if(t.tag===13||t.tag===31){var e=$a(t,67108864);e!==null&&ne(e,t,67108864),Ir(t,67108864)}}function Of(t){if(t.tag===13||t.tag===31){var e=me();e=cr(e);var a=$a(t,e);a!==null&&ne(a,t,e),Ir(t,e)}}var Pi=!0;function D1(t,e,a,l){var n=lt.T;lt.T=null;var i=mt.p;try{mt.p=2,Pr(t,e,a,l)}finally{mt.p=i,lt.T=n}}function j1(t,e,a,l){var n=lt.T;lt.T=null;var i=mt.p;try{mt.p=8,Pr(t,e,a,l)}finally{mt.p=i,lt.T=n}}function Pr(t,e,a,l){if(Pi){var n=Is(l);if(n===null)es(t,e,l,tu,a),Cf(t,l);else if(M1(n,t,e,a,l))l.stopPropagation();else if(Cf(t,l),e&4&&-1<U1.indexOf(t)){for(;n!==null;){var i=Bl(n);if(i!==null)switch(i.tag){case 3:if(i=i.stateNode,i.current.memoizedState.isDehydrated){var u=Ra(i.pendingLanes);if(u!==0){var s=i;for(s.pendingLanes|=2,s.entangledLanes|=2;u;){var r=1<<31-he(u);s.entanglements[1]|=r,u&=~r}Le(i),!(ht&6)&&(qi=oe()+500,Yn(0))}}break;case 31:case 13:s=$a(i,2),s!==null&&ne(s,i,2),vu(),Ir(i,2)}if(i=Is(l),i===null&&es(t,e,l,tu,a),i===n)break;n=i}n!==null&&l.stopPropagation()}else es(t,e,l,null,a)}}function Is(t){return t=hr(t),tc(t)}var tu=null;function tc(t){if(tu=null,t=ul(t),t!==null){var e=jn(t);if(e===null)t=null;else{var a=e.tag;if(a===13){if(t=Ff(e),t!==null)return t;t=null}else if(a===31){if(t=$f(e),t!==null)return t;t=null}else if(a===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null)}}return tu=t,null}function jh(t){switch(t){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(g0()){case eo:return 2;case ao:return 8;case Ci:case b0:return 32;case lo:return 268435456;default:return 32}default:return 32}}var Ps=!1,Ea=null,Aa=null,Ta=null,Nn=new Map,Dn=new Map,da=[],U1="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function Cf(t,e){switch(t){case"focusin":case"focusout":Ea=null;break;case"dragenter":case"dragleave":Aa=null;break;case"mouseover":case"mouseout":Ta=null;break;case"pointerover":case"pointerout":Nn.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":Dn.delete(e.pointerId)}}function $l(t,e,a,l,n,i){return t===null||t.nativeEvent!==i?(t={blockedOn:e,domEventName:a,eventSystemFlags:l,nativeEvent:i,targetContainers:[n]},e!==null&&(e=Bl(e),e!==null&&Dh(e)),t):(t.eventSystemFlags|=l,e=t.targetContainers,n!==null&&e.indexOf(n)===-1&&e.push(n),t)}function M1(t,e,a,l,n){switch(e){case"focusin":return Ea=$l(Ea,t,e,a,l,n),!0;case"dragenter":return Aa=$l(Aa,t,e,a,l,n),!0;case"mouseover":return Ta=$l(Ta,t,e,a,l,n),!0;case"pointerover":var i=n.pointerId;return Nn.set(i,$l(Nn.get(i)||null,t,e,a,l,n)),!0;case"gotpointercapture":return i=n.pointerId,Dn.set(i,$l(Dn.get(i)||null,t,e,a,l,n)),!0}return!1}function Uh(t){var e=ul(t.target);if(e!==null){var a=jn(e);if(a!==null){if(e=a.tag,e===13){if(e=Ff(a),e!==null){t.blockedOn=e,dc(t.priority,function(){Of(a)});return}}else if(e===31){if(e=$f(a),e!==null){t.blockedOn=e,dc(t.priority,function(){Of(a)});return}}else if(e===3&&a.stateNode.current.memoizedState.isDehydrated){t.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}t.blockedOn=null}function Ai(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var a=Is(t.nativeEvent);if(a===null){a=t.nativeEvent;var l=new a.constructor(a.type,a);ys=l,a.target.dispatchEvent(l),ys=null}else return e=Bl(a),e!==null&&Dh(e),t.blockedOn=a,!1;e.shift()}return!0}function Nf(t,e,a){Ai(t)&&a.delete(e)}function R1(){Ps=!1,Ea!==null&&Ai(Ea)&&(Ea=null),Aa!==null&&Ai(Aa)&&(Aa=null),Ta!==null&&Ai(Ta)&&(Ta=null),Nn.forEach(Nf),Dn.forEach(Nf)}function ui(t,e){t.blockedOn===e&&(t.blockedOn=null,Ps||(Ps=!0,Zt.unstable_scheduleCallback(Zt.unstable_NormalPriority,R1)))}var si=null;function Df(t){si!==t&&(si=t,Zt.unstable_scheduleCallback(Zt.unstable_NormalPriority,function(){si===t&&(si=null);for(var e=0;e<t.length;e+=3){var a=t[e],l=t[e+1],n=t[e+2];if(typeof l!="function"){if(tc(l||a)===null)continue;break}var i=Bl(a);i!==null&&(t.splice(e,3),e-=3,Us(i,{pending:!0,data:n,method:a.method,action:l},l,n))}}))}function Ul(t){function e(r){return ui(r,t)}Ea!==null&&ui(Ea,t),Aa!==null&&ui(Aa,t),Ta!==null&&ui(Ta,t),Nn.forEach(e),Dn.forEach(e);for(var a=0;a<da.length;a++){var l=da[a];l.blockedOn===t&&(l.blockedOn=null)}for(;0<da.length&&(a=da[0],a.blockedOn===null);)Uh(a),a.blockedOn===null&&da.shift();if(a=(t.ownerDocument||t).$$reactFormReplay,a!=null)for(l=0;l<a.length;l+=3){var n=a[l],i=a[l+1],u=n[ie]||null;if(typeof i=="function")u||Df(a);else if(u){var s=null;if(i&&i.hasAttribute("formAction")){if(n=i,u=i[ie]||null)s=u.formAction;else if(tc(n)!==null)continue}else s=u.action;typeof s=="function"?a[l+1]=s:(a.splice(l,3),l-=3),Df(a)}}}function Mh(){function t(i){i.canIntercept&&i.info==="react-transition"&&i.intercept({handler:function(){return new Promise(function(u){return n=u})},focusReset:"manual",scroll:"manual"})}function e(){n!==null&&(n(),n=null),l||setTimeout(a,20)}function a(){if(!l&&!navigation.transition){var i=navigation.currentEntry;i&&i.url!=null&&navigation.navigate(i.url,{state:i.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var l=!1,n=null;return navigation.addEventListener("navigate",t),navigation.addEventListener("navigatesuccess",e),navigation.addEventListener("navigateerror",e),setTimeout(a,100),function(){l=!0,navigation.removeEventListener("navigate",t),navigation.removeEventListener("navigatesuccess",e),navigation.removeEventListener("navigateerror",e),n!==null&&(n(),n=null)}}}function ec(t){this._internalRoot=t}bu.prototype.render=ec.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(G(409));var a=e.current,l=me();Nh(a,l,t,e,null,null)};bu.prototype.unmount=ec.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;Nh(t.current,2,null,t,null,null),vu(),e[Rl]=null}};function bu(t){this._internalRoot=t}bu.prototype.unstable_scheduleHydration=function(t){if(t){var e=ro();t={blockedOn:null,target:t,priority:e};for(var a=0;a<da.length&&e!==0&&e<da[a].priority;a++);da.splice(a,0,t),a===0&&Uh(t)}};var jf=Jf.version;if(jf!=="19.2.8")throw Error(G(527,jf,"19.2.8"));mt.findDOMNode=function(t){var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(G(188)):(t=Object.keys(t).join(","),Error(G(268,t)));return t=o0(e),t=t!==null?If(t):null,t=t===null?null:t.stateNode,t};var B1={bundleType:0,version:"19.2.8",rendererPackageName:"react-dom",currentDispatcherRef:lt,reconcilerVersion:"19.2.8"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var ri=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!ri.isDisabled&&ri.supportsFiber)try{Un=ri.inject(B1),de=ri}catch{}}au.createRoot=function(t,e){if(!Wf(t))throw Error(G(299));var a=!1,l="",n=Ad,i=Td,u=wd;return e!=null&&(e.unstable_strictMode===!0&&(a=!0),e.identifierPrefix!==void 0&&(l=e.identifierPrefix),e.onUncaughtError!==void 0&&(n=e.onUncaughtError),e.onCaughtError!==void 0&&(i=e.onCaughtError),e.onRecoverableError!==void 0&&(u=e.onRecoverableError)),e=Oh(t,1,!1,null,null,a,l,null,n,i,u,Mh),t[Rl]=e.current,Wr(t),new ec(e)};au.hydrateRoot=function(t,e,a){if(!Wf(t))throw Error(G(299));var l=!1,n="",i=Ad,u=Td,s=wd,r=null;return a!=null&&(a.unstable_strictMode===!0&&(l=!0),a.identifierPrefix!==void 0&&(n=a.identifierPrefix),a.onUncaughtError!==void 0&&(i=a.onUncaughtError),a.onCaughtError!==void 0&&(u=a.onCaughtError),a.onRecoverableError!==void 0&&(s=a.onRecoverableError),a.formState!==void 0&&(r=a.formState)),e=Oh(t,1,!0,e,a??null,l,n,r,i,u,s,Mh),e.context=Ch(null),a=e.current,l=me(),l=cr(l),n=_a(l),n.callback=null,Sa(a,n,l),a=l,e.current.lanes=a,Rn(e,a),Le(e),t[Rl]=e.current,Wr(t),new bu(e)};au.version="19.2.8";function Rh(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Rh)}catch(t){console.error(t)}}Rh(),Gf.exports=au;var H1=Gf.exports;const k1=tr(H1);async function L1(){const e=await(await fetch("/api/db/clients")).json();return e.success?e.data:[]}async function Z1(){const e=await(await fetch("/api/db/logs")).json();return e.success?e.data:[]}async function Y1(){return(await(await fetch("/api/db/logs",{method:"DELETE"})).json()).success}async function G1(t){return(await(await fetch(`/api/db/clients/${t}`,{method:"DELETE"})).json()).success}function q1(){const[t,e]=ut.useState([]),[a,l]=ut.useState([]),n=ut.useCallback(async()=>{try{const r=await L1();e(r)}catch{}},[]),i=ut.useCallback(async()=>{try{const r=await Z1();l(r)}catch{}},[]),u=ut.useCallback(async()=>confirm("데이터베이스 내의 모든 크롤링 수집 로그를 완전 소거하시겠습니까?")&&await Y1()?(alert("데이터베이스의 모든 수집 로그가 일괄 소거되었습니다."),await i(),!0):!1,[i]),s=ut.useCallback(async r=>confirm(`대상 클라이언트 [${r}]를 강제 정화 격리하시겠습니까?`)&&await G1(r)?(alert("지정된 클라이언트 기기가 완전히 차단 제거되었습니다."),await n(),await i(),!0):!1,[n,i]);return{clients:t,logs:a,setLogs:l,loadClients:n,loadLogs:i,executeClearLogs:u,executePurgeClient:s}}function X1(){const t="ws://localhost:9600?clientId=admin-main&clientType=admin";return new WebSocket(t)}function Q1(t,e,a,l){if(!t||t.readyState!==WebSocket.OPEN)return!1;const n={senderId:"admin-main",targetId:e,action:a,payload:l};return t.send(JSON.stringify(n)),!0}function V1(t,e){const[a,l]=ut.useState("DISCONNECTED"),n=ut.useRef(null);ut.useEffect(()=>{const u=X1();return n.current=u,u.onopen=()=>{l("CONNECTED"),e&&e()},u.onmessage=s=>{try{const r=JSON.parse(s.data);r.action==="CRAWL_LOG"&&t(h=>[{id:Date.now(),client_id:r.senderId,log_message:JSON.stringify(r.payload),timestamp:Date.now()},...h])}catch{}},u.onclose=()=>{l("DISCONNECTED")},()=>{u.close()}},[t,e]);const i=ut.useCallback((u,s,r)=>{try{const h=JSON.parse(r);return Q1(n.current,u,s,h)?(alert(`명령 송출 완료 [대상: ${u}] [지시: ${s}]`),!0):(alert("통신 채널이 오프라인 상태입니다."),!1)}catch{return alert("페이로드 데이터가 올바른 JSON 포맷이 아닙니다."),!1}},[]);return{wsStatus:a,dispatchCommand:i}}function K1(){const[t,e]=ut.useState(!1),[a,l]=ut.useState("Default-Crawler-Cluster");return O.jsxs("div",{className:"relative select-none",children:[O.jsxs("button",{onClick:()=>e(n=>!n),className:"flex items-center gap-2 bg-slate-900/70 hover:bg-slate-800 px-3 py-1 rounded text-xs text-white border border-slate-700 transition",children:[O.jsx("span",{className:"material-symbols-outlined text-sm",children:"workspace_premium"}),O.jsx("span",{className:"font-semibold",children:a}),O.jsx("span",{className:"material-symbols-outlined text-[10px]",children:"expand_more"})]}),t&&O.jsxs("div",{className:"absolute top-full left-0 mt-1 w-64 bg-[#111827] shadow-lg border border-slate-700 rounded text-xs text-slate-100 z-50",children:[O.jsx("div",{className:"px-3 py-2 text-[10px] font-bold text-slate-500 uppercase",children:"프로젝트 선택"}),O.jsxs("button",{onClick:()=>{l("Default-Crawler-Cluster"),e(!1)},className:"w-full text-left px-3 py-2 hover:bg-slate-800 flex justify-between items-center",children:[O.jsx("span",{children:"Default-Crawler-Cluster"}),a==="Default-Crawler-Cluster"&&O.jsx("span",{className:"text-[#1A73E8] text-[10px]",children:"✓ 선택됨"})]}),O.jsxs("button",{onClick:()=>{l("Staging-Crawler-Cluster"),e(!1)},className:"w-full text-left px-3 py-2 hover:bg-slate-800 flex justify-between items-center text-slate-300",children:[O.jsx("span",{children:"Staging-Crawler-Cluster"}),a==="Staging-Crawler-Cluster"&&O.jsx("span",{className:"text-[#1A73E8] text-[10px]",children:"✓ 선택됨"})]})]})]})}function J1(){return O.jsx("div",{className:"hidden md:flex items-center flex-1 max-w-md mx-4 select-none",children:O.jsxs("div",{className:"relative w-full",children:[O.jsx("span",{className:"absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-sm",children:O.jsx("span",{className:"material-symbols-outlined",children:"search"})}),O.jsx("input",{type:"text",placeholder:"노드, 로그, 액션을 검색하세요",className:"w-full pl-11 pr-3 py-2 bg-[#1E293B] border border-slate-700 rounded shadow-sm text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition"})]})})}function W1({wsStatus:t,onRefresh:e}){return O.jsxs("div",{className:"flex items-center gap-2 select-none",children:[O.jsxs("div",{className:"flex items-center gap-2 bg-slate-900/70 px-3 py-2 rounded border border-slate-700 text-sm text-white",children:[O.jsx("span",{className:`h-2.5 w-2.5 rounded-full ${t==="CONNECTED"?"bg-emerald-300 animate-pulse":"bg-rose-300"}`}),O.jsx("span",{children:t==="CONNECTED"?"연결됨":"연결 끊김"})]}),O.jsx("button",{onClick:e,className:"p-2 bg-slate-900/70 hover:bg-slate-800 rounded transition text-white",title:"데이터 새로고침",children:O.jsx("span",{className:"material-symbols-outlined",children:"refresh"})}),O.jsx("div",{className:"w-8 h-8 rounded-full bg-slate-900/70 border border-slate-700 flex items-center justify-center font-semibold text-sm text-white ml-1",children:"A"})]})}function F1({wsStatus:t,onToggleSidebar:e,onRefresh:a}){return O.jsxs("header",{className:"h-14 bg-[#0F172A] text-white flex items-center justify-between px-4 select-none shadow-sm z-50",children:[O.jsxs("div",{className:"flex items-center gap-3",children:[O.jsx("button",{onClick:e,className:"p-2 hover:bg-blue-600/90 rounded transition text-white",title:"네비게이션 메뉴",children:O.jsx("span",{className:"material-symbols-outlined text-lg",children:"menu"})}),O.jsxs("div",{className:"flex items-center gap-2 font-medium text-sm tracking-tight pr-3 border-r border-blue-300/20",children:[O.jsx("span",{className:"bg-slate-900/70 text-[#1A73E8] font-black text-xs px-2 py-1 rounded",children:"GCP"}),O.jsx("span",{children:"WebCrawlServer 관리자"})]}),O.jsx(K1,{})]}),O.jsx(J1,{}),O.jsx(W1,{wsStatus:t,onRefresh:a})]})}function $1({activeTab:t,onRefresh:e,onClearLogs:a}){const l=()=>t==="clients"?"수집 노드 관리":t==="console"?"원격 지시 콘솔":"수집 로그 확인";return O.jsxs("div",{className:"h-12 bg-[#161C27] border-b border-slate-800 px-5 flex items-center justify-between text-sm text-slate-200 select-none shadow-sm",children:[O.jsxs("div",{className:"flex items-center gap-2 font-medium",children:[O.jsx("span",{className:"text-slate-500",children:"WebCrawlServer"}),O.jsx("span",{className:"text-slate-300",children:"›"}),O.jsx("span",{className:"text-slate-500",children:"관리자 대시보드"}),O.jsx("span",{className:"text-slate-300",children:"›"}),O.jsx("span",{className:"text-[#1A73E8] font-semibold",children:l()})]}),O.jsxs("div",{className:"flex items-center gap-2",children:[O.jsxs("button",{onClick:e,className:"flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-100 transition",children:[O.jsx("span",{className:"material-symbols-outlined",children:"refresh"}),O.jsx("span",{children:"새로고침"})]}),t==="logs"&&O.jsxs("button",{onClick:a,className:"flex items-center gap-2 px-3 py-2 bg-red-700/20 hover:bg-red-700/30 rounded text-red-200 transition border border-red-700/30",children:[O.jsx("span",{className:"material-symbols-outlined",children:"delete"}),O.jsx("span",{children:"로그 삭제"})]})]})]})}function I1({isCollapsed:t,onToggleCollapse:e,activeTab:a,onSelectTab:l,clientCount:n}){const[i,u]=ut.useState(!1);return O.jsxs("aside",{className:`bg-[#111827] border-r border-slate-800 flex flex-col justify-between transition-all duration-200 select-none shadow-sm ${t?"w-20":"w-64"}`,children:[O.jsxs("div",{className:"flex flex-col py-4",children:[O.jsxs("button",{onClick:()=>l("clients"),className:`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${a==="clients"?"bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]":"text-slate-300 hover:bg-slate-900"}`,children:[O.jsx("span",{className:"material-symbols-outlined",children:"dashboard"}),!t&&O.jsxs("div",{className:"flex justify-between items-center w-full",children:[O.jsx("span",{children:"수집 노드 관리"}),O.jsx("span",{className:"bg-slate-900/70 text-slate-300 text-[10px] px-2 py-0.5 rounded-full border border-slate-800",children:n})]})]}),O.jsxs("button",{onClick:()=>l("console"),className:`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${a==="console"?"bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]":"text-slate-300 hover:bg-slate-900"}`,children:[O.jsx("span",{className:"material-symbols-outlined",children:"send_to_mobile"}),!t&&O.jsx("span",{children:"원격 지시 콘솔"})]}),O.jsxs("button",{onClick:()=>l("logs"),className:`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${a==="logs"?"bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]":"text-slate-300 hover:bg-slate-900"}`,children:[O.jsx("span",{className:"material-symbols-outlined",children:"article"}),!t&&O.jsx("span",{children:"수집 로그"})]}),O.jsxs("div",{className:"mt-2",children:[O.jsxs("button",{onClick:()=>u(!i),className:`flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition w-full ${a==="favicon"?"bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]":"text-slate-300 hover:bg-slate-900"}`,children:[O.jsxs("div",{className:"flex items-center gap-3",children:[O.jsx("span",{className:"material-symbols-outlined",children:"build"}),!t&&O.jsx("span",{children:"Utils"})]}),!t&&O.jsx("span",{className:`material-symbols-outlined transition-transform ${i?"rotate-90":""}`,children:"chevron_right"})]}),i&&!t&&O.jsx("div",{className:"pl-8",children:O.jsxs("button",{onClick:()=>l("favicon"),className:`flex items-center gap-3 px-4 py-2 text-sm font-medium transition w-full ${a==="favicon"?"bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]":"text-slate-400 hover:bg-slate-900"}`,children:[O.jsx("span",{className:"material-symbols-outlined text-lg",children:"image"}),O.jsx("span",{children:"파비콘 만들기"})]})})]})]}),O.jsx("div",{className:"border-t border-slate-800 p-3",children:O.jsxs("button",{onClick:e,className:"w-full flex items-center justify-center gap-2 p-2 text-slate-300 hover:bg-slate-900 rounded text-sm transition",children:[O.jsx("span",{className:"material-symbols-outlined text-base",children:t?"chevron_right":"chevron_left"}),!t&&"사이드바 접기"]})})]})}function P1({children:t,wsStatus:e,clientCount:a,activeTab:l,onSelectTab:n,onRefresh:i,onClearLogs:u}){const[s,r]=ut.useState(!1);return O.jsxs("div",{className:"min-h-screen bg-[#141A23] text-slate-100 flex flex-col font-sans select-none",children:[O.jsx(F1,{wsStatus:e,onToggleSidebar:()=>r(h=>!h),onRefresh:i}),O.jsx($1,{activeTab:l,onRefresh:i,onClearLogs:u}),O.jsxs("div",{className:"flex-1 flex overflow-hidden",children:[O.jsx(I1,{isCollapsed:s,onToggleCollapse:()=>r(h=>!h),activeTab:l,onSelectTab:n,clientCount:a}),O.jsx("main",{className:"flex-1 p-6 overflow-y-auto bg-[#161C27]",children:t})]})]})}function ci({title:t,value:e,subValue:a,valueColorClass:l="text-white"}){return O.jsxs("div",{className:"bg-[#202124] border border-gray-800 rounded p-3 flex flex-col justify-between shadow-sm",children:[O.jsx("div",{className:"text-[11px] font-medium text-gray-400",children:t}),O.jsxs("div",{className:"flex items-baseline justify-between mt-2",children:[O.jsx("div",{className:`text-2xl font-bold font-mono ${l}`,children:e}),O.jsx("div",{className:"text-[10px] text-gray-400",children:a})]})]})}function tp({clientCount:t,logCount:e}){return O.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 select-none",children:[O.jsx(ci,{title:"ACTIVE CRAWLER NODES",value:t,subValue:"● Online Status",valueColorClass:"text-green-400"}),O.jsx(ci,{title:"TOTAL CRAWLED LOGS",value:e,subValue:"Rows in SQLite",valueColorClass:"text-yellow-400"}),O.jsx(ci,{title:"DATABASE JOURNAL MODE",value:"WAL Mode",subValue:"better-sqlite3",valueColorClass:"text-blue-400"}),O.jsx(ci,{title:"NETWORK PORT BINDING",value:"Port 9600",subValue:"HTTP/WS Shared",valueColorClass:"text-green-400"})]})}function ep({clients:t,onSelectTarget:e,onPurgeClient:a}){return O.jsxs("div",{className:"bg-[#202124] border border-gray-800 rounded shadow-sm overflow-hidden select-text",children:[O.jsx("div",{className:"px-4 py-3 border-b border-gray-800 flex justify-between items-center bg-[#28292c]",children:O.jsxs("span",{className:"font-bold text-xs text-gray-200 tracking-wide uppercase",children:["Crawler Node Instances (",t.length,")"]})}),O.jsxs("div",{className:"overflow-x-auto",children:[O.jsxs("table",{className:"w-full text-left border-collapse text-xs",children:[O.jsx("thead",{children:O.jsxs("tr",{className:"bg-[#111827] text-slate-300 border-b border-slate-800 text-[11px] font-semibold",children:[O.jsx("th",{className:"p-3 w-10 text-center",children:"#"}),O.jsx("th",{className:"p-3",children:"노드 ID"}),O.jsx("th",{className:"p-3",children:"클라이언트 타입"}),O.jsx("th",{className:"p-3",children:"상태"}),O.jsx("th",{className:"p-3",children:"연결 시간"}),O.jsx("th",{className:"p-3 text-right",children:"작업"})]})}),O.jsx("tbody",{className:"divide-y divide-gray-800 text-gray-200 font-mono",children:t.map(l=>O.jsxs("tr",{className:"hover:bg-[#2d2e31] transition",children:[O.jsx("td",{className:"p-3 text-center text-slate-400",children:l.client_id.slice(0,4)}),O.jsx("td",{className:"p-3 font-semibold text-slate-100 select-text break-all",children:l.client_id}),O.jsx("td",{className:"p-3",children:O.jsx("span",{className:"bg-slate-800 text-slate-200 text-[10px] px-2 py-0.5 rounded border border-slate-700",children:l.client_type})}),O.jsx("td",{className:"p-3",children:O.jsxs("span",{className:"inline-flex items-center gap-2 bg-emerald-900/40 text-emerald-300 text-[11px] px-2 py-1 rounded border border-emerald-700/40",children:[O.jsx("span",{className:"h-2.5 w-2.5 rounded-full bg-emerald-400"}),"연결됨"]})}),O.jsx("td",{className:"p-3 text-slate-500 text-[12px]",children:new Date(parseInt(l.connected_at)||Date.now()).toLocaleString()}),O.jsx("td",{className:"p-3 text-right",children:O.jsxs("div",{className:"flex justify-end gap-2",children:[O.jsx("button",{onClick:()=>e(l.client_id),className:"bg-gray-800 hover:bg-gray-700 text-xs px-2.5 py-0.5 rounded text-gray-200 transition border border-gray-700",children:"Select Target"}),O.jsx("button",{onClick:()=>a(l.client_id),className:"bg-red-900/60 hover:bg-red-800 text-xs px-2.5 py-0.5 rounded text-red-200 transition border border-red-800",children:"Purge"})]})})]},l.client_id))})]}),t.length===0&&O.jsx("div",{className:"p-8 text-center text-gray-500 text-sm",children:"No active crawler nodes found"})]})]})}function ap({clients:t,logCount:e,onSelectTarget:a,onPurgeClient:l}){return O.jsxs("div",{className:"flex flex-col gap-4",children:[O.jsx(tp,{clientCount:t.length,logCount:e}),O.jsx(ep,{clients:t,onSelectTarget:a,onPurgeClient:l})]})}function lp({targetId:t,setTargetId:e,onDispatch:a}){const[l,n]=ut.useState("CRAWL_START"),[i,u]=ut.useState('{"targetUrl": "https://example.com", "depth": 2}');return O.jsxs("div",{className:"bg-[#202124] p-5 rounded border border-gray-800 flex flex-col gap-5 max-w-4xl shadow-sm",children:[O.jsx("div",{className:"flex justify-between items-center border-b border-gray-800 pb-2 mb-2",children:O.jsx("h2",{className:"text-lg font-bold text-green-400",children:"Remote Control Console"})}),O.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[O.jsxs("div",{children:[O.jsx("label",{className:"block text-xs text-slate-500 mb-1 uppercase tracking-wide",children:"대상 클라이언트"}),O.jsx("input",{value:t,onChange:s=>e(s.target.value),placeholder:"client ID 또는 ALL 입력",className:"w-full p-3 bg-[#111827] border border-slate-700 rounded text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition"})]}),O.jsxs("div",{children:[O.jsx("label",{className:"block text-xs text-slate-500 mb-1 uppercase tracking-wide",children:"지시 액션"}),O.jsxs("select",{value:l,onChange:s=>n(s.target.value),className:"w-full p-3 bg-[#111827] border border-slate-700 rounded text-sm text-slate-100 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition",children:[O.jsx("option",{value:"CRAWL_START",children:"CRAWL_START - 수집 시작"}),O.jsx("option",{value:"CRAWL_STOP",children:"CRAWL_STOP - 수집 중지"})]})]}),O.jsx("div",{className:"flex items-end",children:O.jsx("button",{onClick:()=>a(t,l,i),className:"w-full bg-[#1A73E8] hover:bg-[#185abc] text-white font-semibold text-sm p-3 rounded transition shadow-sm h-[54px]",children:"명령 전송"})})]}),O.jsxs("div",{children:[O.jsx("label",{className:"block text-xs text-slate-500 mb-1 uppercase tracking-wide",children:"JSON 페이로드"}),O.jsx("textarea",{value:i,onChange:s=>u(s.target.value),rows:6,placeholder:'{"targetUrl": "https://example.com", "depth": 2}',className:"w-full p-3 bg-[#111827] border border-slate-700 rounded text-sm text-slate-100 font-mono outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition"})]})]})}function np({logs:t,onClearLogs:e}){return O.jsxs("div",{className:"bg-[#111827] p-6 rounded-2xl border border-slate-800 flex flex-col gap-5 shadow-sm",children:[O.jsxs("div",{className:"flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",children:[O.jsxs("div",{children:[O.jsx("h2",{className:"text-xl font-semibold text-slate-100",children:"수집 로그"}),O.jsx("p",{className:"text-sm text-slate-400",children:"실시간으로 수집된 패킷 로그를 확인합니다."})]}),O.jsxs("button",{onClick:e,className:"inline-flex items-center gap-2 px-4 py-2 bg-red-700/20 hover:bg-red-700/30 text-red-200 rounded-lg transition border border-red-700/30 text-sm",children:[O.jsx("span",{className:"material-symbols-outlined",children:"delete"}),"전체 로그 삭제"]})]}),O.jsx("div",{className:"flex flex-col gap-3 overflow-y-auto max-h-[640px] font-mono text-sm text-slate-200 select-text",children:t.length===0?O.jsx("div",{className:"text-center text-slate-500 py-20",children:"수집 로그가 없습니다."}):t.map(a=>O.jsxs("div",{className:"bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-sm",children:[O.jsxs("div",{className:"flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 text-slate-500 text-xs",children:[O.jsxs("span",{className:"truncate max-w-full",children:["출처: ",a.client_id]}),O.jsxs("span",{children:["수신 시간: ",new Date(a.timestamp).toLocaleTimeString()]})]}),O.jsx("div",{className:"mt-3 text-slate-200 break-words whitespace-pre-wrap",children:a.log_message})]},a.id))})]})}function fi(t){throw new Error('Could not dynamically require "'+t+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var Bh={exports:{}};/*!

JSZip v3.10.1 - A JavaScript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/main/LICENSE
*/(function(t,e){(function(a){t.exports=a()})(function(){return function a(l,n,i){function u(h,b){if(!n[h]){if(!l[h]){var g=typeof fi=="function"&&fi;if(!b&&g)return g(h,!0);if(s)return s(h,!0);var m=new Error("Cannot find module '"+h+"'");throw m.code="MODULE_NOT_FOUND",m}var o=n[h]={exports:{}};l[h][0].call(o.exports,function(_){var v=l[h][1][_];return u(v||_)},o,o.exports,a,l,n,i)}return n[h].exports}for(var s=typeof fi=="function"&&fi,r=0;r<i.length;r++)u(i[r]);return u}({1:[function(a,l,n){var i=a("./utils"),u=a("./support"),s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";n.encode=function(r){for(var h,b,g,m,o,_,v,S=[],c=0,d=r.length,y=d,x=i.getTypeOf(r)!=="string";c<r.length;)y=d-c,g=x?(h=r[c++],b=c<d?r[c++]:0,c<d?r[c++]:0):(h=r.charCodeAt(c++),b=c<d?r.charCodeAt(c++):0,c<d?r.charCodeAt(c++):0),m=h>>2,o=(3&h)<<4|b>>4,_=1<y?(15&b)<<2|g>>6:64,v=2<y?63&g:64,S.push(s.charAt(m)+s.charAt(o)+s.charAt(_)+s.charAt(v));return S.join("")},n.decode=function(r){var h,b,g,m,o,_,v=0,S=0,c="data:";if(r.substr(0,c.length)===c)throw new Error("Invalid base64 input, it looks like a data url.");var d,y=3*(r=r.replace(/[^A-Za-z0-9+/=]/g,"")).length/4;if(r.charAt(r.length-1)===s.charAt(64)&&y--,r.charAt(r.length-2)===s.charAt(64)&&y--,y%1!=0)throw new Error("Invalid base64 input, bad content length.");for(d=u.uint8array?new Uint8Array(0|y):new Array(0|y);v<r.length;)h=s.indexOf(r.charAt(v++))<<2|(m=s.indexOf(r.charAt(v++)))>>4,b=(15&m)<<4|(o=s.indexOf(r.charAt(v++)))>>2,g=(3&o)<<6|(_=s.indexOf(r.charAt(v++))),d[S++]=h,o!==64&&(d[S++]=b),_!==64&&(d[S++]=g);return d}},{"./support":30,"./utils":32}],2:[function(a,l,n){var i=a("./external"),u=a("./stream/DataWorker"),s=a("./stream/Crc32Probe"),r=a("./stream/DataLengthProbe");function h(b,g,m,o,_){this.compressedSize=b,this.uncompressedSize=g,this.crc32=m,this.compression=o,this.compressedContent=_}h.prototype={getContentWorker:function(){var b=new u(i.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new r("data_length")),g=this;return b.on("end",function(){if(this.streamInfo.data_length!==g.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch")}),b},getCompressedWorker:function(){return new u(i.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize",this.compressedSize).withStreamInfo("uncompressedSize",this.uncompressedSize).withStreamInfo("crc32",this.crc32).withStreamInfo("compression",this.compression)}},h.createWorkerFrom=function(b,g,m){return b.pipe(new s).pipe(new r("uncompressedSize")).pipe(g.compressWorker(m)).pipe(new r("compressedSize")).withStreamInfo("compression",g)},l.exports=h},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(a,l,n){var i=a("./stream/GenericWorker");n.STORE={magic:"\0\0",compressWorker:function(){return new i("STORE compression")},uncompressWorker:function(){return new i("STORE decompression")}},n.DEFLATE=a("./flate")},{"./flate":7,"./stream/GenericWorker":28}],4:[function(a,l,n){var i=a("./utils"),u=function(){for(var s,r=[],h=0;h<256;h++){s=h;for(var b=0;b<8;b++)s=1&s?3988292384^s>>>1:s>>>1;r[h]=s}return r}();l.exports=function(s,r){return s!==void 0&&s.length?i.getTypeOf(s)!=="string"?function(h,b,g,m){var o=u,_=m+g;h^=-1;for(var v=m;v<_;v++)h=h>>>8^o[255&(h^b[v])];return-1^h}(0|r,s,s.length,0):function(h,b,g,m){var o=u,_=m+g;h^=-1;for(var v=m;v<_;v++)h=h>>>8^o[255&(h^b.charCodeAt(v))];return-1^h}(0|r,s,s.length,0):0}},{"./utils":32}],5:[function(a,l,n){n.base64=!1,n.binary=!1,n.dir=!1,n.createFolders=!0,n.date=null,n.compression=null,n.compressionOptions=null,n.comment=null,n.unixPermissions=null,n.dosPermissions=null},{}],6:[function(a,l,n){var i=null;i=typeof Promise<"u"?Promise:a("lie"),l.exports={Promise:i}},{lie:37}],7:[function(a,l,n){var i=typeof Uint8Array<"u"&&typeof Uint16Array<"u"&&typeof Uint32Array<"u",u=a("pako"),s=a("./utils"),r=a("./stream/GenericWorker"),h=i?"uint8array":"array";function b(g,m){r.call(this,"FlateWorker/"+g),this._pako=null,this._pakoAction=g,this._pakoOptions=m,this.meta={}}n.magic="\b\0",s.inherits(b,r),b.prototype.processChunk=function(g){this.meta=g.meta,this._pako===null&&this._createPako(),this._pako.push(s.transformTo(h,g.data),!1)},b.prototype.flush=function(){r.prototype.flush.call(this),this._pako===null&&this._createPako(),this._pako.push([],!0)},b.prototype.cleanUp=function(){r.prototype.cleanUp.call(this),this._pako=null},b.prototype._createPako=function(){this._pako=new u[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var g=this;this._pako.onData=function(m){g.push({data:m,meta:g.meta})}},n.compressWorker=function(g){return new b("Deflate",g)},n.uncompressWorker=function(){return new b("Inflate",{})}},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(a,l,n){function i(o,_){var v,S="";for(v=0;v<_;v++)S+=String.fromCharCode(255&o),o>>>=8;return S}function u(o,_,v,S,c,d){var y,x,w=o.file,M=o.compression,T=d!==h.utf8encode,D=s.transformTo("string",d(w.name)),C=s.transformTo("string",h.utf8encode(w.name)),k=w.comment,F=s.transformTo("string",d(k)),A=s.transformTo("string",h.utf8encode(k)),L=C.length!==w.name.length,p=A.length!==k.length,Z="",Y="",R="",$=w.dir,X=w.date,tt={crc32:0,compressedSize:0,uncompressedSize:0};_&&!v||(tt.crc32=o.crc32,tt.compressedSize=o.compressedSize,tt.uncompressedSize=o.uncompressedSize);var B=0;_&&(B|=8),T||!L&&!p||(B|=2048);var U=0,et=0;$&&(U|=16),c==="UNIX"?(et=798,U|=function(W,Nt){var Ft=W;return W||(Ft=Nt?16893:33204),(65535&Ft)<<16}(w.unixPermissions,$)):(et=20,U|=function(W){return 63&(W||0)}(w.dosPermissions)),y=X.getUTCHours(),y<<=6,y|=X.getUTCMinutes(),y<<=5,y|=X.getUTCSeconds()/2,x=X.getUTCFullYear()-1980,x<<=4,x|=X.getUTCMonth()+1,x<<=5,x|=X.getUTCDate(),L&&(Y=i(1,1)+i(b(D),4)+C,Z+="up"+i(Y.length,2)+Y),p&&(R=i(1,1)+i(b(F),4)+A,Z+="uc"+i(R.length,2)+R);var I="";return I+=`
\0`,I+=i(B,2),I+=M.magic,I+=i(y,2),I+=i(x,2),I+=i(tt.crc32,4),I+=i(tt.compressedSize,4),I+=i(tt.uncompressedSize,4),I+=i(D.length,2),I+=i(Z.length,2),{fileRecord:g.LOCAL_FILE_HEADER+I+D+Z,dirRecord:g.CENTRAL_FILE_HEADER+i(et,2)+I+i(F.length,2)+"\0\0\0\0"+i(U,4)+i(S,4)+D+Z+F}}var s=a("../utils"),r=a("../stream/GenericWorker"),h=a("../utf8"),b=a("../crc32"),g=a("../signature");function m(o,_,v,S){r.call(this,"ZipFileWorker"),this.bytesWritten=0,this.zipComment=_,this.zipPlatform=v,this.encodeFileName=S,this.streamFiles=o,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[]}s.inherits(m,r),m.prototype.push=function(o){var _=o.meta.percent||0,v=this.entriesCount,S=this._sources.length;this.accumulate?this.contentBuffer.push(o):(this.bytesWritten+=o.data.length,r.prototype.push.call(this,{data:o.data,meta:{currentFile:this.currentFile,percent:v?(_+100*(v-S-1))/v:100}}))},m.prototype.openedSource=function(o){this.currentSourceOffset=this.bytesWritten,this.currentFile=o.file.name;var _=this.streamFiles&&!o.file.dir;if(_){var v=u(o,_,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:v.fileRecord,meta:{percent:0}})}else this.accumulate=!0},m.prototype.closedSource=function(o){this.accumulate=!1;var _=this.streamFiles&&!o.file.dir,v=u(o,_,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(v.dirRecord),_)this.push({data:function(S){return g.DATA_DESCRIPTOR+i(S.crc32,4)+i(S.compressedSize,4)+i(S.uncompressedSize,4)}(o),meta:{percent:100}});else for(this.push({data:v.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},m.prototype.flush=function(){for(var o=this.bytesWritten,_=0;_<this.dirRecords.length;_++)this.push({data:this.dirRecords[_],meta:{percent:100}});var v=this.bytesWritten-o,S=function(c,d,y,x,w){var M=s.transformTo("string",w(x));return g.CENTRAL_DIRECTORY_END+"\0\0\0\0"+i(c,2)+i(c,2)+i(d,4)+i(y,4)+i(M.length,2)+M}(this.dirRecords.length,v,o,this.zipComment,this.encodeFileName);this.push({data:S,meta:{percent:100}})},m.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},m.prototype.registerPrevious=function(o){this._sources.push(o);var _=this;return o.on("data",function(v){_.processChunk(v)}),o.on("end",function(){_.closedSource(_.previous.streamInfo),_._sources.length?_.prepareNextSource():_.end()}),o.on("error",function(v){_.error(v)}),this},m.prototype.resume=function(){return!!r.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},m.prototype.error=function(o){var _=this._sources;if(!r.prototype.error.call(this,o))return!1;for(var v=0;v<_.length;v++)try{_[v].error(o)}catch{}return!0},m.prototype.lock=function(){r.prototype.lock.call(this);for(var o=this._sources,_=0;_<o.length;_++)o[_].lock()},l.exports=m},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(a,l,n){var i=a("../compressions"),u=a("./ZipFileWorker");n.generateWorker=function(s,r,h){var b=new u(r.streamFiles,h,r.platform,r.encodeFileName),g=0;try{s.forEach(function(m,o){g++;var _=function(d,y){var x=d||y,w=i[x];if(!w)throw new Error(x+" is not a valid compression method !");return w}(o.options.compression,r.compression),v=o.options.compressionOptions||r.compressionOptions||{},S=o.dir,c=o.date;o._compressWorker(_,v).withStreamInfo("file",{name:m,dir:S,date:c,comment:o.comment||"",unixPermissions:o.unixPermissions,dosPermissions:o.dosPermissions}).pipe(b)}),b.entriesCount=g}catch(m){b.error(m)}return b}},{"../compressions":3,"./ZipFileWorker":8}],10:[function(a,l,n){function i(){if(!(this instanceof i))return new i;if(arguments.length)throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");this.files=Object.create(null),this.comment=null,this.root="",this.clone=function(){var u=new i;for(var s in this)typeof this[s]!="function"&&(u[s]=this[s]);return u}}(i.prototype=a("./object")).loadAsync=a("./load"),i.support=a("./support"),i.defaults=a("./defaults"),i.version="3.10.1",i.loadAsync=function(u,s){return new i().loadAsync(u,s)},i.external=a("./external"),l.exports=i},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(a,l,n){var i=a("./utils"),u=a("./external"),s=a("./utf8"),r=a("./zipEntries"),h=a("./stream/Crc32Probe"),b=a("./nodejsUtils");function g(m){return new u.Promise(function(o,_){var v=m.decompressed.getContentWorker().pipe(new h);v.on("error",function(S){_(S)}).on("end",function(){v.streamInfo.crc32!==m.decompressed.crc32?_(new Error("Corrupted zip : CRC32 mismatch")):o()}).resume()})}l.exports=function(m,o){var _=this;return o=i.extend(o||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:s.utf8decode}),b.isNode&&b.isStream(m)?u.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")):i.prepareContent("the loaded zip file",m,!0,o.optimizedBinaryString,o.base64).then(function(v){var S=new r(o);return S.load(v),S}).then(function(v){var S=[u.Promise.resolve(v)],c=v.files;if(o.checkCRC32)for(var d=0;d<c.length;d++)S.push(g(c[d]));return u.Promise.all(S)}).then(function(v){for(var S=v.shift(),c=S.files,d=0;d<c.length;d++){var y=c[d],x=y.fileNameStr,w=i.resolve(y.fileNameStr);_.file(w,y.decompressed,{binary:!0,optimizedBinaryString:!0,date:y.date,dir:y.dir,comment:y.fileCommentStr.length?y.fileCommentStr:null,unixPermissions:y.unixPermissions,dosPermissions:y.dosPermissions,createFolders:o.createFolders}),y.dir||(_.file(w).unsafeOriginalName=x)}return S.zipComment.length&&(_.comment=S.zipComment),_})}},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(a,l,n){var i=a("../utils"),u=a("../stream/GenericWorker");function s(r,h){u.call(this,"Nodejs stream input adapter for "+r),this._upstreamEnded=!1,this._bindStream(h)}i.inherits(s,u),s.prototype._bindStream=function(r){var h=this;(this._stream=r).pause(),r.on("data",function(b){h.push({data:b,meta:{percent:0}})}).on("error",function(b){h.isPaused?this.generatedError=b:h.error(b)}).on("end",function(){h.isPaused?h._upstreamEnded=!0:h.end()})},s.prototype.pause=function(){return!!u.prototype.pause.call(this)&&(this._stream.pause(),!0)},s.prototype.resume=function(){return!!u.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},l.exports=s},{"../stream/GenericWorker":28,"../utils":32}],13:[function(a,l,n){var i=a("readable-stream").Readable;function u(s,r,h){i.call(this,r),this._helper=s;var b=this;s.on("data",function(g,m){b.push(g)||b._helper.pause(),h&&h(m)}).on("error",function(g){b.emit("error",g)}).on("end",function(){b.push(null)})}a("../utils").inherits(u,i),u.prototype._read=function(){this._helper.resume()},l.exports=u},{"../utils":32,"readable-stream":16}],14:[function(a,l,n){l.exports={isNode:typeof Buffer<"u",newBufferFrom:function(i,u){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(i,u);if(typeof i=="number")throw new Error('The "data" argument must not be a number');return new Buffer(i,u)},allocBuffer:function(i){if(Buffer.alloc)return Buffer.alloc(i);var u=new Buffer(i);return u.fill(0),u},isBuffer:function(i){return Buffer.isBuffer(i)},isStream:function(i){return i&&typeof i.on=="function"&&typeof i.pause=="function"&&typeof i.resume=="function"}}},{}],15:[function(a,l,n){function i(w,M,T){var D,C=s.getTypeOf(M),k=s.extend(T||{},b);k.date=k.date||new Date,k.compression!==null&&(k.compression=k.compression.toUpperCase()),typeof k.unixPermissions=="string"&&(k.unixPermissions=parseInt(k.unixPermissions,8)),k.unixPermissions&&16384&k.unixPermissions&&(k.dir=!0),k.dosPermissions&&16&k.dosPermissions&&(k.dir=!0),k.dir&&(w=c(w)),k.createFolders&&(D=S(w))&&d.call(this,D,!0);var F=C==="string"&&k.binary===!1&&k.base64===!1;T&&T.binary!==void 0||(k.binary=!F),(M instanceof g&&M.uncompressedSize===0||k.dir||!M||M.length===0)&&(k.base64=!1,k.binary=!0,M="",k.compression="STORE",C="string");var A=null;A=M instanceof g||M instanceof r?M:_.isNode&&_.isStream(M)?new v(w,M):s.prepareContent(w,M,k.binary,k.optimizedBinaryString,k.base64);var L=new m(w,A,k);this.files[w]=L}var u=a("./utf8"),s=a("./utils"),r=a("./stream/GenericWorker"),h=a("./stream/StreamHelper"),b=a("./defaults"),g=a("./compressedObject"),m=a("./zipObject"),o=a("./generate"),_=a("./nodejsUtils"),v=a("./nodejs/NodejsStreamInputAdapter"),S=function(w){w.slice(-1)==="/"&&(w=w.substring(0,w.length-1));var M=w.lastIndexOf("/");return 0<M?w.substring(0,M):""},c=function(w){return w.slice(-1)!=="/"&&(w+="/"),w},d=function(w,M){return M=M!==void 0?M:b.createFolders,w=c(w),this.files[w]||i.call(this,w,null,{dir:!0,createFolders:M}),this.files[w]};function y(w){return Object.prototype.toString.call(w)==="[object RegExp]"}var x={load:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},forEach:function(w){var M,T,D;for(M in this.files)D=this.files[M],(T=M.slice(this.root.length,M.length))&&M.slice(0,this.root.length)===this.root&&w(T,D)},filter:function(w){var M=[];return this.forEach(function(T,D){w(T,D)&&M.push(D)}),M},file:function(w,M,T){if(arguments.length!==1)return w=this.root+w,i.call(this,w,M,T),this;if(y(w)){var D=w;return this.filter(function(k,F){return!F.dir&&D.test(k)})}var C=this.files[this.root+w];return C&&!C.dir?C:null},folder:function(w){if(!w)return this;if(y(w))return this.filter(function(C,k){return k.dir&&w.test(C)});var M=this.root+w,T=d.call(this,M),D=this.clone();return D.root=T.name,D},remove:function(w){w=this.root+w;var M=this.files[w];if(M||(w.slice(-1)!=="/"&&(w+="/"),M=this.files[w]),M&&!M.dir)delete this.files[w];else for(var T=this.filter(function(C,k){return k.name.slice(0,w.length)===w}),D=0;D<T.length;D++)delete this.files[T[D].name];return this},generate:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},generateInternalStream:function(w){var M,T={};try{if((T=s.extend(w||{},{streamFiles:!1,compression:"STORE",compressionOptions:null,type:"",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:u.utf8encode})).type=T.type.toLowerCase(),T.compression=T.compression.toUpperCase(),T.type==="binarystring"&&(T.type="string"),!T.type)throw new Error("No output type specified.");s.checkSupport(T.type),T.platform!=="darwin"&&T.platform!=="freebsd"&&T.platform!=="linux"&&T.platform!=="sunos"||(T.platform="UNIX"),T.platform==="win32"&&(T.platform="DOS");var D=T.comment||this.comment||"";M=o.generateWorker(this,T,D)}catch(C){(M=new r("error")).error(C)}return new h(M,T.type||"string",T.mimeType)},generateAsync:function(w,M){return this.generateInternalStream(w).accumulate(M)},generateNodeStream:function(w,M){return(w=w||{}).type||(w.type="nodebuffer"),this.generateInternalStream(w).toNodejsStream(M)}};l.exports=x},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(a,l,n){l.exports=a("stream")},{stream:void 0}],17:[function(a,l,n){var i=a("./DataReader");function u(s){i.call(this,s);for(var r=0;r<this.data.length;r++)s[r]=255&s[r]}a("../utils").inherits(u,i),u.prototype.byteAt=function(s){return this.data[this.zero+s]},u.prototype.lastIndexOfSignature=function(s){for(var r=s.charCodeAt(0),h=s.charCodeAt(1),b=s.charCodeAt(2),g=s.charCodeAt(3),m=this.length-4;0<=m;--m)if(this.data[m]===r&&this.data[m+1]===h&&this.data[m+2]===b&&this.data[m+3]===g)return m-this.zero;return-1},u.prototype.readAndCheckSignature=function(s){var r=s.charCodeAt(0),h=s.charCodeAt(1),b=s.charCodeAt(2),g=s.charCodeAt(3),m=this.readData(4);return r===m[0]&&h===m[1]&&b===m[2]&&g===m[3]},u.prototype.readData=function(s){if(this.checkOffset(s),s===0)return[];var r=this.data.slice(this.zero+this.index,this.zero+this.index+s);return this.index+=s,r},l.exports=u},{"../utils":32,"./DataReader":18}],18:[function(a,l,n){var i=a("../utils");function u(s){this.data=s,this.length=s.length,this.index=0,this.zero=0}u.prototype={checkOffset:function(s){this.checkIndex(this.index+s)},checkIndex:function(s){if(this.length<this.zero+s||s<0)throw new Error("End of data reached (data length = "+this.length+", asked index = "+s+"). Corrupted zip ?")},setIndex:function(s){this.checkIndex(s),this.index=s},skip:function(s){this.setIndex(this.index+s)},byteAt:function(){},readInt:function(s){var r,h=0;for(this.checkOffset(s),r=this.index+s-1;r>=this.index;r--)h=(h<<8)+this.byteAt(r);return this.index+=s,h},readString:function(s){return i.transformTo("string",this.readData(s))},readData:function(){},lastIndexOfSignature:function(){},readAndCheckSignature:function(){},readDate:function(){var s=this.readInt(4);return new Date(Date.UTC(1980+(s>>25&127),(s>>21&15)-1,s>>16&31,s>>11&31,s>>5&63,(31&s)<<1))}},l.exports=u},{"../utils":32}],19:[function(a,l,n){var i=a("./Uint8ArrayReader");function u(s){i.call(this,s)}a("../utils").inherits(u,i),u.prototype.readData=function(s){this.checkOffset(s);var r=this.data.slice(this.zero+this.index,this.zero+this.index+s);return this.index+=s,r},l.exports=u},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(a,l,n){var i=a("./DataReader");function u(s){i.call(this,s)}a("../utils").inherits(u,i),u.prototype.byteAt=function(s){return this.data.charCodeAt(this.zero+s)},u.prototype.lastIndexOfSignature=function(s){return this.data.lastIndexOf(s)-this.zero},u.prototype.readAndCheckSignature=function(s){return s===this.readData(4)},u.prototype.readData=function(s){this.checkOffset(s);var r=this.data.slice(this.zero+this.index,this.zero+this.index+s);return this.index+=s,r},l.exports=u},{"../utils":32,"./DataReader":18}],21:[function(a,l,n){var i=a("./ArrayReader");function u(s){i.call(this,s)}a("../utils").inherits(u,i),u.prototype.readData=function(s){if(this.checkOffset(s),s===0)return new Uint8Array(0);var r=this.data.subarray(this.zero+this.index,this.zero+this.index+s);return this.index+=s,r},l.exports=u},{"../utils":32,"./ArrayReader":17}],22:[function(a,l,n){var i=a("../utils"),u=a("../support"),s=a("./ArrayReader"),r=a("./StringReader"),h=a("./NodeBufferReader"),b=a("./Uint8ArrayReader");l.exports=function(g){var m=i.getTypeOf(g);return i.checkSupport(m),m!=="string"||u.uint8array?m==="nodebuffer"?new h(g):u.uint8array?new b(i.transformTo("uint8array",g)):new s(i.transformTo("array",g)):new r(g)}},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(a,l,n){n.LOCAL_FILE_HEADER="PK",n.CENTRAL_FILE_HEADER="PK",n.CENTRAL_DIRECTORY_END="PK",n.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK\x07",n.ZIP64_CENTRAL_DIRECTORY_END="PK",n.DATA_DESCRIPTOR="PK\x07\b"},{}],24:[function(a,l,n){var i=a("./GenericWorker"),u=a("../utils");function s(r){i.call(this,"ConvertWorker to "+r),this.destType=r}u.inherits(s,i),s.prototype.processChunk=function(r){this.push({data:u.transformTo(this.destType,r.data),meta:r.meta})},l.exports=s},{"../utils":32,"./GenericWorker":28}],25:[function(a,l,n){var i=a("./GenericWorker"),u=a("../crc32");function s(){i.call(this,"Crc32Probe"),this.withStreamInfo("crc32",0)}a("../utils").inherits(s,i),s.prototype.processChunk=function(r){this.streamInfo.crc32=u(r.data,this.streamInfo.crc32||0),this.push(r)},l.exports=s},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(a,l,n){var i=a("../utils"),u=a("./GenericWorker");function s(r){u.call(this,"DataLengthProbe for "+r),this.propName=r,this.withStreamInfo(r,0)}i.inherits(s,u),s.prototype.processChunk=function(r){if(r){var h=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=h+r.data.length}u.prototype.processChunk.call(this,r)},l.exports=s},{"../utils":32,"./GenericWorker":28}],27:[function(a,l,n){var i=a("../utils"),u=a("./GenericWorker");function s(r){u.call(this,"DataWorker");var h=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type="",this._tickScheduled=!1,r.then(function(b){h.dataIsReady=!0,h.data=b,h.max=b&&b.length||0,h.type=i.getTypeOf(b),h.isPaused||h._tickAndRepeat()},function(b){h.error(b)})}i.inherits(s,u),s.prototype.cleanUp=function(){u.prototype.cleanUp.call(this),this.data=null},s.prototype.resume=function(){return!!u.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,i.delay(this._tickAndRepeat,[],this)),!0)},s.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(i.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0))},s.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var r=null,h=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":r=this.data.substring(this.index,h);break;case"uint8array":r=this.data.subarray(this.index,h);break;case"array":case"nodebuffer":r=this.data.slice(this.index,h)}return this.index=h,this.push({data:r,meta:{percent:this.max?this.index/this.max*100:0}})},l.exports=s},{"../utils":32,"./GenericWorker":28}],28:[function(a,l,n){function i(u){this.name=u||"default",this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null}i.prototype={push:function(u){this.emit("data",u)},end:function(){if(this.isFinished)return!1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0}catch(u){this.emit("error",u)}return!0},error:function(u){return!this.isFinished&&(this.isPaused?this.generatedError=u:(this.isFinished=!0,this.emit("error",u),this.previous&&this.previous.error(u),this.cleanUp()),!0)},on:function(u,s){return this._listeners[u].push(s),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[]},emit:function(u,s){if(this._listeners[u])for(var r=0;r<this._listeners[u].length;r++)this._listeners[u][r].call(this,s)},pipe:function(u){return u.registerPrevious(this)},registerPrevious:function(u){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.streamInfo=u.streamInfo,this.mergeStreamInfo(),this.previous=u;var s=this;return u.on("data",function(r){s.processChunk(r)}),u.on("end",function(){s.end()}),u.on("error",function(r){s.error(r)}),this},pause:function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return!1;var u=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),u=!0),this.previous&&this.previous.resume(),!u},flush:function(){},processChunk:function(u){this.push(u)},withStreamInfo:function(u,s){return this.extraStreamInfo[u]=s,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var u in this.extraStreamInfo)Object.prototype.hasOwnProperty.call(this.extraStreamInfo,u)&&(this.streamInfo[u]=this.extraStreamInfo[u])},lock:function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock()},toString:function(){var u="Worker "+this.name;return this.previous?this.previous+" -> "+u:u}},l.exports=i},{}],29:[function(a,l,n){var i=a("../utils"),u=a("./ConvertWorker"),s=a("./GenericWorker"),r=a("../base64"),h=a("../support"),b=a("../external"),g=null;if(h.nodestream)try{g=a("../nodejs/NodejsStreamOutputAdapter")}catch{}function m(_,v){return new b.Promise(function(S,c){var d=[],y=_._internalType,x=_._outputType,w=_._mimeType;_.on("data",function(M,T){d.push(M),v&&v(T)}).on("error",function(M){d=[],c(M)}).on("end",function(){try{var M=function(T,D,C){switch(T){case"blob":return i.newBlob(i.transformTo("arraybuffer",D),C);case"base64":return r.encode(D);default:return i.transformTo(T,D)}}(x,function(T,D){var C,k=0,F=null,A=0;for(C=0;C<D.length;C++)A+=D[C].length;switch(T){case"string":return D.join("");case"array":return Array.prototype.concat.apply([],D);case"uint8array":for(F=new Uint8Array(A),C=0;C<D.length;C++)F.set(D[C],k),k+=D[C].length;return F;case"nodebuffer":return Buffer.concat(D);default:throw new Error("concat : unsupported type '"+T+"'")}}(y,d),w);S(M)}catch(T){c(T)}d=[]}).resume()})}function o(_,v,S){var c=v;switch(v){case"blob":case"arraybuffer":c="uint8array";break;case"base64":c="string"}try{this._internalType=c,this._outputType=v,this._mimeType=S,i.checkSupport(c),this._worker=_.pipe(new u(c)),_.lock()}catch(d){this._worker=new s("error"),this._worker.error(d)}}o.prototype={accumulate:function(_){return m(this,_)},on:function(_,v){var S=this;return _==="data"?this._worker.on(_,function(c){v.call(S,c.data,c.meta)}):this._worker.on(_,function(){i.delay(v,arguments,S)}),this},resume:function(){return i.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(_){if(i.checkSupport("nodestream"),this._outputType!=="nodebuffer")throw new Error(this._outputType+" is not supported by this method");return new g(this,{objectMode:this._outputType!=="nodebuffer"},_)}},l.exports=o},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(a,l,n){if(n.base64=!0,n.array=!0,n.string=!0,n.arraybuffer=typeof ArrayBuffer<"u"&&typeof Uint8Array<"u",n.nodebuffer=typeof Buffer<"u",n.uint8array=typeof Uint8Array<"u",typeof ArrayBuffer>"u")n.blob=!1;else{var i=new ArrayBuffer(0);try{n.blob=new Blob([i],{type:"application/zip"}).size===0}catch{try{var u=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);u.append(i),n.blob=u.getBlob("application/zip").size===0}catch{n.blob=!1}}}try{n.nodestream=!!a("readable-stream").Readable}catch{n.nodestream=!1}},{"readable-stream":16}],31:[function(a,l,n){for(var i=a("./utils"),u=a("./support"),s=a("./nodejsUtils"),r=a("./stream/GenericWorker"),h=new Array(256),b=0;b<256;b++)h[b]=252<=b?6:248<=b?5:240<=b?4:224<=b?3:192<=b?2:1;h[254]=h[254]=1;function g(){r.call(this,"utf-8 decode"),this.leftOver=null}function m(){r.call(this,"utf-8 encode")}n.utf8encode=function(o){return u.nodebuffer?s.newBufferFrom(o,"utf-8"):function(_){var v,S,c,d,y,x=_.length,w=0;for(d=0;d<x;d++)(64512&(S=_.charCodeAt(d)))==55296&&d+1<x&&(64512&(c=_.charCodeAt(d+1)))==56320&&(S=65536+(S-55296<<10)+(c-56320),d++),w+=S<128?1:S<2048?2:S<65536?3:4;for(v=u.uint8array?new Uint8Array(w):new Array(w),d=y=0;y<w;d++)(64512&(S=_.charCodeAt(d)))==55296&&d+1<x&&(64512&(c=_.charCodeAt(d+1)))==56320&&(S=65536+(S-55296<<10)+(c-56320),d++),S<128?v[y++]=S:(S<2048?v[y++]=192|S>>>6:(S<65536?v[y++]=224|S>>>12:(v[y++]=240|S>>>18,v[y++]=128|S>>>12&63),v[y++]=128|S>>>6&63),v[y++]=128|63&S);return v}(o)},n.utf8decode=function(o){return u.nodebuffer?i.transformTo("nodebuffer",o).toString("utf-8"):function(_){var v,S,c,d,y=_.length,x=new Array(2*y);for(v=S=0;v<y;)if((c=_[v++])<128)x[S++]=c;else if(4<(d=h[c]))x[S++]=65533,v+=d-1;else{for(c&=d===2?31:d===3?15:7;1<d&&v<y;)c=c<<6|63&_[v++],d--;1<d?x[S++]=65533:c<65536?x[S++]=c:(c-=65536,x[S++]=55296|c>>10&1023,x[S++]=56320|1023&c)}return x.length!==S&&(x.subarray?x=x.subarray(0,S):x.length=S),i.applyFromCharCode(x)}(o=i.transformTo(u.uint8array?"uint8array":"array",o))},i.inherits(g,r),g.prototype.processChunk=function(o){var _=i.transformTo(u.uint8array?"uint8array":"array",o.data);if(this.leftOver&&this.leftOver.length){if(u.uint8array){var v=_;(_=new Uint8Array(v.length+this.leftOver.length)).set(this.leftOver,0),_.set(v,this.leftOver.length)}else _=this.leftOver.concat(_);this.leftOver=null}var S=function(d,y){var x;for((y=y||d.length)>d.length&&(y=d.length),x=y-1;0<=x&&(192&d[x])==128;)x--;return x<0||x===0?y:x+h[d[x]]>y?x:y}(_),c=_;S!==_.length&&(u.uint8array?(c=_.subarray(0,S),this.leftOver=_.subarray(S,_.length)):(c=_.slice(0,S),this.leftOver=_.slice(S,_.length))),this.push({data:n.utf8decode(c),meta:o.meta})},g.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:n.utf8decode(this.leftOver),meta:{}}),this.leftOver=null)},n.Utf8DecodeWorker=g,i.inherits(m,r),m.prototype.processChunk=function(o){this.push({data:n.utf8encode(o.data),meta:o.meta})},n.Utf8EncodeWorker=m},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(a,l,n){var i=a("./support"),u=a("./base64"),s=a("./nodejsUtils"),r=a("./external");function h(v){return v}function b(v,S){for(var c=0;c<v.length;++c)S[c]=255&v.charCodeAt(c);return S}a("setimmediate"),n.newBlob=function(v,S){n.checkSupport("blob");try{return new Blob([v],{type:S})}catch{try{var c=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return c.append(v),c.getBlob(S)}catch{throw new Error("Bug : can't construct the Blob.")}}};var g={stringifyByChunk:function(v,S,c){var d=[],y=0,x=v.length;if(x<=c)return String.fromCharCode.apply(null,v);for(;y<x;)S==="array"||S==="nodebuffer"?d.push(String.fromCharCode.apply(null,v.slice(y,Math.min(y+c,x)))):d.push(String.fromCharCode.apply(null,v.subarray(y,Math.min(y+c,x)))),y+=c;return d.join("")},stringifyByChar:function(v){for(var S="",c=0;c<v.length;c++)S+=String.fromCharCode(v[c]);return S},applyCanBeUsed:{uint8array:function(){try{return i.uint8array&&String.fromCharCode.apply(null,new Uint8Array(1)).length===1}catch{return!1}}(),nodebuffer:function(){try{return i.nodebuffer&&String.fromCharCode.apply(null,s.allocBuffer(1)).length===1}catch{return!1}}()}};function m(v){var S=65536,c=n.getTypeOf(v),d=!0;if(c==="uint8array"?d=g.applyCanBeUsed.uint8array:c==="nodebuffer"&&(d=g.applyCanBeUsed.nodebuffer),d)for(;1<S;)try{return g.stringifyByChunk(v,c,S)}catch{S=Math.floor(S/2)}return g.stringifyByChar(v)}function o(v,S){for(var c=0;c<v.length;c++)S[c]=v[c];return S}n.applyFromCharCode=m;var _={};_.string={string:h,array:function(v){return b(v,new Array(v.length))},arraybuffer:function(v){return _.string.uint8array(v).buffer},uint8array:function(v){return b(v,new Uint8Array(v.length))},nodebuffer:function(v){return b(v,s.allocBuffer(v.length))}},_.array={string:m,array:h,arraybuffer:function(v){return new Uint8Array(v).buffer},uint8array:function(v){return new Uint8Array(v)},nodebuffer:function(v){return s.newBufferFrom(v)}},_.arraybuffer={string:function(v){return m(new Uint8Array(v))},array:function(v){return o(new Uint8Array(v),new Array(v.byteLength))},arraybuffer:h,uint8array:function(v){return new Uint8Array(v)},nodebuffer:function(v){return s.newBufferFrom(new Uint8Array(v))}},_.uint8array={string:m,array:function(v){return o(v,new Array(v.length))},arraybuffer:function(v){return v.buffer},uint8array:h,nodebuffer:function(v){return s.newBufferFrom(v)}},_.nodebuffer={string:m,array:function(v){return o(v,new Array(v.length))},arraybuffer:function(v){return _.nodebuffer.uint8array(v).buffer},uint8array:function(v){return o(v,new Uint8Array(v.length))},nodebuffer:h},n.transformTo=function(v,S){if(S=S||"",!v)return S;n.checkSupport(v);var c=n.getTypeOf(S);return _[c][v](S)},n.resolve=function(v){for(var S=v.split("/"),c=[],d=0;d<S.length;d++){var y=S[d];y==="."||y===""&&d!==0&&d!==S.length-1||(y===".."?c.pop():c.push(y))}return c.join("/")},n.getTypeOf=function(v){return typeof v=="string"?"string":Object.prototype.toString.call(v)==="[object Array]"?"array":i.nodebuffer&&s.isBuffer(v)?"nodebuffer":i.uint8array&&v instanceof Uint8Array?"uint8array":i.arraybuffer&&v instanceof ArrayBuffer?"arraybuffer":void 0},n.checkSupport=function(v){if(!i[v.toLowerCase()])throw new Error(v+" is not supported by this platform")},n.MAX_VALUE_16BITS=65535,n.MAX_VALUE_32BITS=-1,n.pretty=function(v){var S,c,d="";for(c=0;c<(v||"").length;c++)d+="\\x"+((S=v.charCodeAt(c))<16?"0":"")+S.toString(16).toUpperCase();return d},n.delay=function(v,S,c){setImmediate(function(){v.apply(c||null,S||[])})},n.inherits=function(v,S){function c(){}c.prototype=S.prototype,v.prototype=new c},n.extend=function(){var v,S,c={};for(v=0;v<arguments.length;v++)for(S in arguments[v])Object.prototype.hasOwnProperty.call(arguments[v],S)&&c[S]===void 0&&(c[S]=arguments[v][S]);return c},n.prepareContent=function(v,S,c,d,y){return r.Promise.resolve(S).then(function(x){return i.blob&&(x instanceof Blob||["[object File]","[object Blob]"].indexOf(Object.prototype.toString.call(x))!==-1)&&typeof FileReader<"u"?new r.Promise(function(w,M){var T=new FileReader;T.onload=function(D){w(D.target.result)},T.onerror=function(D){M(D.target.error)},T.readAsArrayBuffer(x)}):x}).then(function(x){var w=n.getTypeOf(x);return w?(w==="arraybuffer"?x=n.transformTo("uint8array",x):w==="string"&&(y?x=u.decode(x):c&&d!==!0&&(x=function(M){return b(M,i.uint8array?new Uint8Array(M.length):new Array(M.length))}(x))),x):r.Promise.reject(new Error("Can't read the data of '"+v+"'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"))})}},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,setimmediate:54}],33:[function(a,l,n){var i=a("./reader/readerFor"),u=a("./utils"),s=a("./signature"),r=a("./zipEntry"),h=a("./support");function b(g){this.files=[],this.loadOptions=g}b.prototype={checkSignature:function(g){if(!this.reader.readAndCheckSignature(g)){this.reader.index-=4;var m=this.reader.readString(4);throw new Error("Corrupted zip or bug: unexpected signature ("+u.pretty(m)+", expected "+u.pretty(g)+")")}},isSignature:function(g,m){var o=this.reader.index;this.reader.setIndex(g);var _=this.reader.readString(4)===m;return this.reader.setIndex(o),_},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var g=this.reader.readData(this.zipCommentLength),m=h.uint8array?"uint8array":"array",o=u.transformTo(m,g);this.zipComment=this.loadOptions.decodeFileName(o)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var g,m,o,_=this.zip64EndOfCentralSize-44;0<_;)g=this.reader.readInt(2),m=this.reader.readInt(4),o=this.reader.readData(m),this.zip64ExtensibleData[g]={id:g,length:m,value:o}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var g,m;for(g=0;g<this.files.length;g++)m=this.files[g],this.reader.setIndex(m.localHeaderOffset),this.checkSignature(s.LOCAL_FILE_HEADER),m.readLocalPart(this.reader),m.handleUTF8(),m.processAttributes()},readCentralDir:function(){var g;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER);)(g=new r({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(g);if(this.centralDirRecords!==this.files.length&&this.centralDirRecords!==0&&this.files.length===0)throw new Error("Corrupted zip or bug: expected "+this.centralDirRecords+" records in central dir, got "+this.files.length)},readEndOfCentral:function(){var g=this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);if(g<0)throw this.isSignature(0,s.LOCAL_FILE_HEADER)?new Error("Corrupted zip: can't find end of central directory"):new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");this.reader.setIndex(g);var m=g;if(this.checkSignature(s.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===u.MAX_VALUE_16BITS||this.diskWithCentralDirStart===u.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===u.MAX_VALUE_16BITS||this.centralDirRecords===u.MAX_VALUE_16BITS||this.centralDirSize===u.MAX_VALUE_32BITS||this.centralDirOffset===u.MAX_VALUE_32BITS){if(this.zip64=!0,(g=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");if(this.reader.setIndex(g),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,s.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}var o=this.centralDirOffset+this.centralDirSize;this.zip64&&(o+=20,o+=12+this.zip64EndOfCentralSize);var _=m-o;if(0<_)this.isSignature(m,s.CENTRAL_FILE_HEADER)||(this.reader.zero=_);else if(_<0)throw new Error("Corrupted zip: missing "+Math.abs(_)+" bytes.")},prepareReader:function(g){this.reader=i(g)},load:function(g){this.prepareReader(g),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},l.exports=b},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utils":32,"./zipEntry":34}],34:[function(a,l,n){var i=a("./reader/readerFor"),u=a("./utils"),s=a("./compressedObject"),r=a("./crc32"),h=a("./utf8"),b=a("./compressions"),g=a("./support");function m(o,_){this.options=o,this.loadOptions=_}m.prototype={isEncrypted:function(){return(1&this.bitFlag)==1},useUTF8:function(){return(2048&this.bitFlag)==2048},readLocalPart:function(o){var _,v;if(o.skip(22),this.fileNameLength=o.readInt(2),v=o.readInt(2),this.fileName=o.readData(this.fileNameLength),o.skip(v),this.compressedSize===-1||this.uncompressedSize===-1)throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");if((_=function(S){for(var c in b)if(Object.prototype.hasOwnProperty.call(b,c)&&b[c].magic===S)return b[c];return null}(this.compressionMethod))===null)throw new Error("Corrupted zip : compression "+u.pretty(this.compressionMethod)+" unknown (inner file : "+u.transformTo("string",this.fileName)+")");this.decompressed=new s(this.compressedSize,this.uncompressedSize,this.crc32,_,o.readData(this.compressedSize))},readCentralPart:function(o){this.versionMadeBy=o.readInt(2),o.skip(2),this.bitFlag=o.readInt(2),this.compressionMethod=o.readString(2),this.date=o.readDate(),this.crc32=o.readInt(4),this.compressedSize=o.readInt(4),this.uncompressedSize=o.readInt(4);var _=o.readInt(2);if(this.extraFieldsLength=o.readInt(2),this.fileCommentLength=o.readInt(2),this.diskNumberStart=o.readInt(2),this.internalFileAttributes=o.readInt(2),this.externalFileAttributes=o.readInt(4),this.localHeaderOffset=o.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");o.skip(_),this.readExtraFields(o),this.parseZIP64ExtraField(o),this.fileComment=o.readData(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var o=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),o==0&&(this.dosPermissions=63&this.externalFileAttributes),o==3&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||this.fileNameStr.slice(-1)!=="/"||(this.dir=!0)},parseZIP64ExtraField:function(){if(this.extraFields[1]){var o=i(this.extraFields[1].value);this.uncompressedSize===u.MAX_VALUE_32BITS&&(this.uncompressedSize=o.readInt(8)),this.compressedSize===u.MAX_VALUE_32BITS&&(this.compressedSize=o.readInt(8)),this.localHeaderOffset===u.MAX_VALUE_32BITS&&(this.localHeaderOffset=o.readInt(8)),this.diskNumberStart===u.MAX_VALUE_32BITS&&(this.diskNumberStart=o.readInt(4))}},readExtraFields:function(o){var _,v,S,c=o.index+this.extraFieldsLength;for(this.extraFields||(this.extraFields={});o.index+4<c;)_=o.readInt(2),v=o.readInt(2),S=o.readData(v),this.extraFields[_]={id:_,length:v,value:S};o.setIndex(c)},handleUTF8:function(){var o=g.uint8array?"uint8array":"array";if(this.useUTF8())this.fileNameStr=h.utf8decode(this.fileName),this.fileCommentStr=h.utf8decode(this.fileComment);else{var _=this.findExtraFieldUnicodePath();if(_!==null)this.fileNameStr=_;else{var v=u.transformTo(o,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(v)}var S=this.findExtraFieldUnicodeComment();if(S!==null)this.fileCommentStr=S;else{var c=u.transformTo(o,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(c)}}},findExtraFieldUnicodePath:function(){var o=this.extraFields[28789];if(o){var _=i(o.value);return _.readInt(1)!==1||r(this.fileName)!==_.readInt(4)?null:h.utf8decode(_.readData(o.length-5))}return null},findExtraFieldUnicodeComment:function(){var o=this.extraFields[25461];if(o){var _=i(o.value);return _.readInt(1)!==1||r(this.fileComment)!==_.readInt(4)?null:h.utf8decode(_.readData(o.length-5))}return null}},l.exports=m},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(a,l,n){function i(_,v,S){this.name=_,this.dir=S.dir,this.date=S.date,this.comment=S.comment,this.unixPermissions=S.unixPermissions,this.dosPermissions=S.dosPermissions,this._data=v,this._dataBinary=S.binary,this.options={compression:S.compression,compressionOptions:S.compressionOptions}}var u=a("./stream/StreamHelper"),s=a("./stream/DataWorker"),r=a("./utf8"),h=a("./compressedObject"),b=a("./stream/GenericWorker");i.prototype={internalStream:function(_){var v=null,S="string";try{if(!_)throw new Error("No output type specified.");var c=(S=_.toLowerCase())==="string"||S==="text";S!=="binarystring"&&S!=="text"||(S="string"),v=this._decompressWorker();var d=!this._dataBinary;d&&!c&&(v=v.pipe(new r.Utf8EncodeWorker)),!d&&c&&(v=v.pipe(new r.Utf8DecodeWorker))}catch(y){(v=new b("error")).error(y)}return new u(v,S,"")},async:function(_,v){return this.internalStream(_).accumulate(v)},nodeStream:function(_,v){return this.internalStream(_||"nodebuffer").toNodejsStream(v)},_compressWorker:function(_,v){if(this._data instanceof h&&this._data.compression.magic===_.magic)return this._data.getCompressedWorker();var S=this._decompressWorker();return this._dataBinary||(S=S.pipe(new r.Utf8EncodeWorker)),h.createWorkerFrom(S,_,v)},_decompressWorker:function(){return this._data instanceof h?this._data.getContentWorker():this._data instanceof b?this._data:new s(this._data)}};for(var g=["asText","asBinary","asNodeBuffer","asUint8Array","asArrayBuffer"],m=function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},o=0;o<g.length;o++)i.prototype[g[o]]=m;l.exports=i},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(a,l,n){(function(i){var u,s,r=i.MutationObserver||i.WebKitMutationObserver;if(r){var h=0,b=new r(_),g=i.document.createTextNode("");b.observe(g,{characterData:!0}),u=function(){g.data=h=++h%2}}else if(i.setImmediate||i.MessageChannel===void 0)u="document"in i&&"onreadystatechange"in i.document.createElement("script")?function(){var v=i.document.createElement("script");v.onreadystatechange=function(){_(),v.onreadystatechange=null,v.parentNode.removeChild(v),v=null},i.document.documentElement.appendChild(v)}:function(){setTimeout(_,0)};else{var m=new i.MessageChannel;m.port1.onmessage=_,u=function(){m.port2.postMessage(0)}}var o=[];function _(){var v,S;s=!0;for(var c=o.length;c;){for(S=o,o=[],v=-1;++v<c;)S[v]();c=o.length}s=!1}l.exports=function(v){o.push(v)!==1||s||u()}}).call(this,typeof Vn<"u"?Vn:typeof self<"u"?self:typeof window<"u"?window:{})},{}],37:[function(a,l,n){var i=a("immediate");function u(){}var s={},r=["REJECTED"],h=["FULFILLED"],b=["PENDING"];function g(c){if(typeof c!="function")throw new TypeError("resolver must be a function");this.state=b,this.queue=[],this.outcome=void 0,c!==u&&v(this,c)}function m(c,d,y){this.promise=c,typeof d=="function"&&(this.onFulfilled=d,this.callFulfilled=this.otherCallFulfilled),typeof y=="function"&&(this.onRejected=y,this.callRejected=this.otherCallRejected)}function o(c,d,y){i(function(){var x;try{x=d(y)}catch(w){return s.reject(c,w)}x===c?s.reject(c,new TypeError("Cannot resolve promise with itself")):s.resolve(c,x)})}function _(c){var d=c&&c.then;if(c&&(typeof c=="object"||typeof c=="function")&&typeof d=="function")return function(){d.apply(c,arguments)}}function v(c,d){var y=!1;function x(T){y||(y=!0,s.reject(c,T))}function w(T){y||(y=!0,s.resolve(c,T))}var M=S(function(){d(w,x)});M.status==="error"&&x(M.value)}function S(c,d){var y={};try{y.value=c(d),y.status="success"}catch(x){y.status="error",y.value=x}return y}(l.exports=g).prototype.finally=function(c){if(typeof c!="function")return this;var d=this.constructor;return this.then(function(y){return d.resolve(c()).then(function(){return y})},function(y){return d.resolve(c()).then(function(){throw y})})},g.prototype.catch=function(c){return this.then(null,c)},g.prototype.then=function(c,d){if(typeof c!="function"&&this.state===h||typeof d!="function"&&this.state===r)return this;var y=new this.constructor(u);return this.state!==b?o(y,this.state===h?c:d,this.outcome):this.queue.push(new m(y,c,d)),y},m.prototype.callFulfilled=function(c){s.resolve(this.promise,c)},m.prototype.otherCallFulfilled=function(c){o(this.promise,this.onFulfilled,c)},m.prototype.callRejected=function(c){s.reject(this.promise,c)},m.prototype.otherCallRejected=function(c){o(this.promise,this.onRejected,c)},s.resolve=function(c,d){var y=S(_,d);if(y.status==="error")return s.reject(c,y.value);var x=y.value;if(x)v(c,x);else{c.state=h,c.outcome=d;for(var w=-1,M=c.queue.length;++w<M;)c.queue[w].callFulfilled(d)}return c},s.reject=function(c,d){c.state=r,c.outcome=d;for(var y=-1,x=c.queue.length;++y<x;)c.queue[y].callRejected(d);return c},g.resolve=function(c){return c instanceof this?c:s.resolve(new this(u),c)},g.reject=function(c){var d=new this(u);return s.reject(d,c)},g.all=function(c){var d=this;if(Object.prototype.toString.call(c)!=="[object Array]")return this.reject(new TypeError("must be an array"));var y=c.length,x=!1;if(!y)return this.resolve([]);for(var w=new Array(y),M=0,T=-1,D=new this(u);++T<y;)C(c[T],T);return D;function C(k,F){d.resolve(k).then(function(A){w[F]=A,++M!==y||x||(x=!0,s.resolve(D,w))},function(A){x||(x=!0,s.reject(D,A))})}},g.race=function(c){var d=this;if(Object.prototype.toString.call(c)!=="[object Array]")return this.reject(new TypeError("must be an array"));var y=c.length,x=!1;if(!y)return this.resolve([]);for(var w=-1,M=new this(u);++w<y;)T=c[w],d.resolve(T).then(function(D){x||(x=!0,s.resolve(M,D))},function(D){x||(x=!0,s.reject(M,D))});var T;return M}},{immediate:36}],38:[function(a,l,n){var i={};(0,a("./lib/utils/common").assign)(i,a("./lib/deflate"),a("./lib/inflate"),a("./lib/zlib/constants")),l.exports=i},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(a,l,n){var i=a("./zlib/deflate"),u=a("./utils/common"),s=a("./utils/strings"),r=a("./zlib/messages"),h=a("./zlib/zstream"),b=Object.prototype.toString,g=0,m=-1,o=0,_=8;function v(c){if(!(this instanceof v))return new v(c);this.options=u.assign({level:m,method:_,chunkSize:16384,windowBits:15,memLevel:8,strategy:o,to:""},c||{});var d=this.options;d.raw&&0<d.windowBits?d.windowBits=-d.windowBits:d.gzip&&0<d.windowBits&&d.windowBits<16&&(d.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new h,this.strm.avail_out=0;var y=i.deflateInit2(this.strm,d.level,d.method,d.windowBits,d.memLevel,d.strategy);if(y!==g)throw new Error(r[y]);if(d.header&&i.deflateSetHeader(this.strm,d.header),d.dictionary){var x;if(x=typeof d.dictionary=="string"?s.string2buf(d.dictionary):b.call(d.dictionary)==="[object ArrayBuffer]"?new Uint8Array(d.dictionary):d.dictionary,(y=i.deflateSetDictionary(this.strm,x))!==g)throw new Error(r[y]);this._dict_set=!0}}function S(c,d){var y=new v(d);if(y.push(c,!0),y.err)throw y.msg||r[y.err];return y.result}v.prototype.push=function(c,d){var y,x,w=this.strm,M=this.options.chunkSize;if(this.ended)return!1;x=d===~~d?d:d===!0?4:0,typeof c=="string"?w.input=s.string2buf(c):b.call(c)==="[object ArrayBuffer]"?w.input=new Uint8Array(c):w.input=c,w.next_in=0,w.avail_in=w.input.length;do{if(w.avail_out===0&&(w.output=new u.Buf8(M),w.next_out=0,w.avail_out=M),(y=i.deflate(w,x))!==1&&y!==g)return this.onEnd(y),!(this.ended=!0);w.avail_out!==0&&(w.avail_in!==0||x!==4&&x!==2)||(this.options.to==="string"?this.onData(s.buf2binstring(u.shrinkBuf(w.output,w.next_out))):this.onData(u.shrinkBuf(w.output,w.next_out)))}while((0<w.avail_in||w.avail_out===0)&&y!==1);return x===4?(y=i.deflateEnd(this.strm),this.onEnd(y),this.ended=!0,y===g):x!==2||(this.onEnd(g),!(w.avail_out=0))},v.prototype.onData=function(c){this.chunks.push(c)},v.prototype.onEnd=function(c){c===g&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=u.flattenChunks(this.chunks)),this.chunks=[],this.err=c,this.msg=this.strm.msg},n.Deflate=v,n.deflate=S,n.deflateRaw=function(c,d){return(d=d||{}).raw=!0,S(c,d)},n.gzip=function(c,d){return(d=d||{}).gzip=!0,S(c,d)}},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(a,l,n){var i=a("./zlib/inflate"),u=a("./utils/common"),s=a("./utils/strings"),r=a("./zlib/constants"),h=a("./zlib/messages"),b=a("./zlib/zstream"),g=a("./zlib/gzheader"),m=Object.prototype.toString;function o(v){if(!(this instanceof o))return new o(v);this.options=u.assign({chunkSize:16384,windowBits:0,to:""},v||{});var S=this.options;S.raw&&0<=S.windowBits&&S.windowBits<16&&(S.windowBits=-S.windowBits,S.windowBits===0&&(S.windowBits=-15)),!(0<=S.windowBits&&S.windowBits<16)||v&&v.windowBits||(S.windowBits+=32),15<S.windowBits&&S.windowBits<48&&!(15&S.windowBits)&&(S.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new b,this.strm.avail_out=0;var c=i.inflateInit2(this.strm,S.windowBits);if(c!==r.Z_OK)throw new Error(h[c]);this.header=new g,i.inflateGetHeader(this.strm,this.header)}function _(v,S){var c=new o(S);if(c.push(v,!0),c.err)throw c.msg||h[c.err];return c.result}o.prototype.push=function(v,S){var c,d,y,x,w,M,T=this.strm,D=this.options.chunkSize,C=this.options.dictionary,k=!1;if(this.ended)return!1;d=S===~~S?S:S===!0?r.Z_FINISH:r.Z_NO_FLUSH,typeof v=="string"?T.input=s.binstring2buf(v):m.call(v)==="[object ArrayBuffer]"?T.input=new Uint8Array(v):T.input=v,T.next_in=0,T.avail_in=T.input.length;do{if(T.avail_out===0&&(T.output=new u.Buf8(D),T.next_out=0,T.avail_out=D),(c=i.inflate(T,r.Z_NO_FLUSH))===r.Z_NEED_DICT&&C&&(M=typeof C=="string"?s.string2buf(C):m.call(C)==="[object ArrayBuffer]"?new Uint8Array(C):C,c=i.inflateSetDictionary(this.strm,M)),c===r.Z_BUF_ERROR&&k===!0&&(c=r.Z_OK,k=!1),c!==r.Z_STREAM_END&&c!==r.Z_OK)return this.onEnd(c),!(this.ended=!0);T.next_out&&(T.avail_out!==0&&c!==r.Z_STREAM_END&&(T.avail_in!==0||d!==r.Z_FINISH&&d!==r.Z_SYNC_FLUSH)||(this.options.to==="string"?(y=s.utf8border(T.output,T.next_out),x=T.next_out-y,w=s.buf2string(T.output,y),T.next_out=x,T.avail_out=D-x,x&&u.arraySet(T.output,T.output,y,x,0),this.onData(w)):this.onData(u.shrinkBuf(T.output,T.next_out)))),T.avail_in===0&&T.avail_out===0&&(k=!0)}while((0<T.avail_in||T.avail_out===0)&&c!==r.Z_STREAM_END);return c===r.Z_STREAM_END&&(d=r.Z_FINISH),d===r.Z_FINISH?(c=i.inflateEnd(this.strm),this.onEnd(c),this.ended=!0,c===r.Z_OK):d!==r.Z_SYNC_FLUSH||(this.onEnd(r.Z_OK),!(T.avail_out=0))},o.prototype.onData=function(v){this.chunks.push(v)},o.prototype.onEnd=function(v){v===r.Z_OK&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=u.flattenChunks(this.chunks)),this.chunks=[],this.err=v,this.msg=this.strm.msg},n.Inflate=o,n.inflate=_,n.inflateRaw=function(v,S){return(S=S||{}).raw=!0,_(v,S)},n.ungzip=_},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(a,l,n){var i=typeof Uint8Array<"u"&&typeof Uint16Array<"u"&&typeof Int32Array<"u";n.assign=function(r){for(var h=Array.prototype.slice.call(arguments,1);h.length;){var b=h.shift();if(b){if(typeof b!="object")throw new TypeError(b+"must be non-object");for(var g in b)b.hasOwnProperty(g)&&(r[g]=b[g])}}return r},n.shrinkBuf=function(r,h){return r.length===h?r:r.subarray?r.subarray(0,h):(r.length=h,r)};var u={arraySet:function(r,h,b,g,m){if(h.subarray&&r.subarray)r.set(h.subarray(b,b+g),m);else for(var o=0;o<g;o++)r[m+o]=h[b+o]},flattenChunks:function(r){var h,b,g,m,o,_;for(h=g=0,b=r.length;h<b;h++)g+=r[h].length;for(_=new Uint8Array(g),h=m=0,b=r.length;h<b;h++)o=r[h],_.set(o,m),m+=o.length;return _}},s={arraySet:function(r,h,b,g,m){for(var o=0;o<g;o++)r[m+o]=h[b+o]},flattenChunks:function(r){return[].concat.apply([],r)}};n.setTyped=function(r){r?(n.Buf8=Uint8Array,n.Buf16=Uint16Array,n.Buf32=Int32Array,n.assign(n,u)):(n.Buf8=Array,n.Buf16=Array,n.Buf32=Array,n.assign(n,s))},n.setTyped(i)},{}],42:[function(a,l,n){var i=a("./common"),u=!0,s=!0;try{String.fromCharCode.apply(null,[0])}catch{u=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch{s=!1}for(var r=new i.Buf8(256),h=0;h<256;h++)r[h]=252<=h?6:248<=h?5:240<=h?4:224<=h?3:192<=h?2:1;function b(g,m){if(m<65537&&(g.subarray&&s||!g.subarray&&u))return String.fromCharCode.apply(null,i.shrinkBuf(g,m));for(var o="",_=0;_<m;_++)o+=String.fromCharCode(g[_]);return o}r[254]=r[254]=1,n.string2buf=function(g){var m,o,_,v,S,c=g.length,d=0;for(v=0;v<c;v++)(64512&(o=g.charCodeAt(v)))==55296&&v+1<c&&(64512&(_=g.charCodeAt(v+1)))==56320&&(o=65536+(o-55296<<10)+(_-56320),v++),d+=o<128?1:o<2048?2:o<65536?3:4;for(m=new i.Buf8(d),v=S=0;S<d;v++)(64512&(o=g.charCodeAt(v)))==55296&&v+1<c&&(64512&(_=g.charCodeAt(v+1)))==56320&&(o=65536+(o-55296<<10)+(_-56320),v++),o<128?m[S++]=o:(o<2048?m[S++]=192|o>>>6:(o<65536?m[S++]=224|o>>>12:(m[S++]=240|o>>>18,m[S++]=128|o>>>12&63),m[S++]=128|o>>>6&63),m[S++]=128|63&o);return m},n.buf2binstring=function(g){return b(g,g.length)},n.binstring2buf=function(g){for(var m=new i.Buf8(g.length),o=0,_=m.length;o<_;o++)m[o]=g.charCodeAt(o);return m},n.buf2string=function(g,m){var o,_,v,S,c=m||g.length,d=new Array(2*c);for(o=_=0;o<c;)if((v=g[o++])<128)d[_++]=v;else if(4<(S=r[v]))d[_++]=65533,o+=S-1;else{for(v&=S===2?31:S===3?15:7;1<S&&o<c;)v=v<<6|63&g[o++],S--;1<S?d[_++]=65533:v<65536?d[_++]=v:(v-=65536,d[_++]=55296|v>>10&1023,d[_++]=56320|1023&v)}return b(d,_)},n.utf8border=function(g,m){var o;for((m=m||g.length)>g.length&&(m=g.length),o=m-1;0<=o&&(192&g[o])==128;)o--;return o<0||o===0?m:o+r[g[o]]>m?o:m}},{"./common":41}],43:[function(a,l,n){l.exports=function(i,u,s,r){for(var h=65535&i|0,b=i>>>16&65535|0,g=0;s!==0;){for(s-=g=2e3<s?2e3:s;b=b+(h=h+u[r++]|0)|0,--g;);h%=65521,b%=65521}return h|b<<16|0}},{}],44:[function(a,l,n){l.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],45:[function(a,l,n){var i=function(){for(var u,s=[],r=0;r<256;r++){u=r;for(var h=0;h<8;h++)u=1&u?3988292384^u>>>1:u>>>1;s[r]=u}return s}();l.exports=function(u,s,r,h){var b=i,g=h+r;u^=-1;for(var m=h;m<g;m++)u=u>>>8^b[255&(u^s[m])];return-1^u}},{}],46:[function(a,l,n){var i,u=a("../utils/common"),s=a("./trees"),r=a("./adler32"),h=a("./crc32"),b=a("./messages"),g=0,m=4,o=0,_=-2,v=-1,S=4,c=2,d=8,y=9,x=286,w=30,M=19,T=2*x+1,D=15,C=3,k=258,F=k+C+1,A=42,L=113,p=1,Z=2,Y=3,R=4;function $(f,q){return f.msg=b[q],q}function X(f){return(f<<1)-(4<f?9:0)}function tt(f){for(var q=f.length;0<=--q;)f[q]=0}function B(f){var q=f.state,H=q.pending;H>f.avail_out&&(H=f.avail_out),H!==0&&(u.arraySet(f.output,q.pending_buf,q.pending_out,H,f.next_out),f.next_out+=H,q.pending_out+=H,f.total_out+=H,f.avail_out-=H,q.pending-=H,q.pending===0&&(q.pending_out=0))}function U(f,q){s._tr_flush_block(f,0<=f.block_start?f.block_start:-1,f.strstart-f.block_start,q),f.block_start=f.strstart,B(f.strm)}function et(f,q){f.pending_buf[f.pending++]=q}function I(f,q){f.pending_buf[f.pending++]=q>>>8&255,f.pending_buf[f.pending++]=255&q}function W(f,q){var H,E,z=f.max_chain_length,N=f.strstart,Q=f.prev_length,V=f.nice_match,j=f.strstart>f.w_size-F?f.strstart-(f.w_size-F):0,K=f.window,P=f.w_mask,J=f.prev,at=f.strstart+k,St=K[N+Q-1],dt=K[N+Q];f.prev_length>=f.good_match&&(z>>=2),V>f.lookahead&&(V=f.lookahead);do if(K[(H=q)+Q]===dt&&K[H+Q-1]===St&&K[H]===K[N]&&K[++H]===K[N+1]){N+=2,H++;do;while(K[++N]===K[++H]&&K[++N]===K[++H]&&K[++N]===K[++H]&&K[++N]===K[++H]&&K[++N]===K[++H]&&K[++N]===K[++H]&&K[++N]===K[++H]&&K[++N]===K[++H]&&N<at);if(E=k-(at-N),N=at-k,Q<E){if(f.match_start=q,V<=(Q=E))break;St=K[N+Q-1],dt=K[N+Q]}}while((q=J[q&P])>j&&--z!=0);return Q<=f.lookahead?Q:f.lookahead}function Nt(f){var q,H,E,z,N,Q,V,j,K,P,J=f.w_size;do{if(z=f.window_size-f.lookahead-f.strstart,f.strstart>=J+(J-F)){for(u.arraySet(f.window,f.window,J,J,0),f.match_start-=J,f.strstart-=J,f.block_start-=J,q=H=f.hash_size;E=f.head[--q],f.head[q]=J<=E?E-J:0,--H;);for(q=H=J;E=f.prev[--q],f.prev[q]=J<=E?E-J:0,--H;);z+=J}if(f.strm.avail_in===0)break;if(Q=f.strm,V=f.window,j=f.strstart+f.lookahead,K=z,P=void 0,P=Q.avail_in,K<P&&(P=K),H=P===0?0:(Q.avail_in-=P,u.arraySet(V,Q.input,Q.next_in,P,j),Q.state.wrap===1?Q.adler=r(Q.adler,V,P,j):Q.state.wrap===2&&(Q.adler=h(Q.adler,V,P,j)),Q.next_in+=P,Q.total_in+=P,P),f.lookahead+=H,f.lookahead+f.insert>=C)for(N=f.strstart-f.insert,f.ins_h=f.window[N],f.ins_h=(f.ins_h<<f.hash_shift^f.window[N+1])&f.hash_mask;f.insert&&(f.ins_h=(f.ins_h<<f.hash_shift^f.window[N+C-1])&f.hash_mask,f.prev[N&f.w_mask]=f.head[f.ins_h],f.head[f.ins_h]=N,N++,f.insert--,!(f.lookahead+f.insert<C)););}while(f.lookahead<F&&f.strm.avail_in!==0)}function Ft(f,q){for(var H,E;;){if(f.lookahead<F){if(Nt(f),f.lookahead<F&&q===g)return p;if(f.lookahead===0)break}if(H=0,f.lookahead>=C&&(f.ins_h=(f.ins_h<<f.hash_shift^f.window[f.strstart+C-1])&f.hash_mask,H=f.prev[f.strstart&f.w_mask]=f.head[f.ins_h],f.head[f.ins_h]=f.strstart),H!==0&&f.strstart-H<=f.w_size-F&&(f.match_length=W(f,H)),f.match_length>=C)if(E=s._tr_tally(f,f.strstart-f.match_start,f.match_length-C),f.lookahead-=f.match_length,f.match_length<=f.max_lazy_match&&f.lookahead>=C){for(f.match_length--;f.strstart++,f.ins_h=(f.ins_h<<f.hash_shift^f.window[f.strstart+C-1])&f.hash_mask,H=f.prev[f.strstart&f.w_mask]=f.head[f.ins_h],f.head[f.ins_h]=f.strstart,--f.match_length!=0;);f.strstart++}else f.strstart+=f.match_length,f.match_length=0,f.ins_h=f.window[f.strstart],f.ins_h=(f.ins_h<<f.hash_shift^f.window[f.strstart+1])&f.hash_mask;else E=s._tr_tally(f,0,f.window[f.strstart]),f.lookahead--,f.strstart++;if(E&&(U(f,!1),f.strm.avail_out===0))return p}return f.insert=f.strstart<C-1?f.strstart:C-1,q===m?(U(f,!0),f.strm.avail_out===0?Y:R):f.last_lit&&(U(f,!1),f.strm.avail_out===0)?p:Z}function ot(f,q){for(var H,E,z;;){if(f.lookahead<F){if(Nt(f),f.lookahead<F&&q===g)return p;if(f.lookahead===0)break}if(H=0,f.lookahead>=C&&(f.ins_h=(f.ins_h<<f.hash_shift^f.window[f.strstart+C-1])&f.hash_mask,H=f.prev[f.strstart&f.w_mask]=f.head[f.ins_h],f.head[f.ins_h]=f.strstart),f.prev_length=f.match_length,f.prev_match=f.match_start,f.match_length=C-1,H!==0&&f.prev_length<f.max_lazy_match&&f.strstart-H<=f.w_size-F&&(f.match_length=W(f,H),f.match_length<=5&&(f.strategy===1||f.match_length===C&&4096<f.strstart-f.match_start)&&(f.match_length=C-1)),f.prev_length>=C&&f.match_length<=f.prev_length){for(z=f.strstart+f.lookahead-C,E=s._tr_tally(f,f.strstart-1-f.prev_match,f.prev_length-C),f.lookahead-=f.prev_length-1,f.prev_length-=2;++f.strstart<=z&&(f.ins_h=(f.ins_h<<f.hash_shift^f.window[f.strstart+C-1])&f.hash_mask,H=f.prev[f.strstart&f.w_mask]=f.head[f.ins_h],f.head[f.ins_h]=f.strstart),--f.prev_length!=0;);if(f.match_available=0,f.match_length=C-1,f.strstart++,E&&(U(f,!1),f.strm.avail_out===0))return p}else if(f.match_available){if((E=s._tr_tally(f,0,f.window[f.strstart-1]))&&U(f,!1),f.strstart++,f.lookahead--,f.strm.avail_out===0)return p}else f.match_available=1,f.strstart++,f.lookahead--}return f.match_available&&(E=s._tr_tally(f,0,f.window[f.strstart-1]),f.match_available=0),f.insert=f.strstart<C-1?f.strstart:C-1,q===m?(U(f,!0),f.strm.avail_out===0?Y:R):f.last_lit&&(U(f,!1),f.strm.avail_out===0)?p:Z}function pt(f,q,H,E,z){this.good_length=f,this.max_lazy=q,this.nice_length=H,this.max_chain=E,this.func=z}function Yt(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=d,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new u.Buf16(2*T),this.dyn_dtree=new u.Buf16(2*(2*w+1)),this.bl_tree=new u.Buf16(2*(2*M+1)),tt(this.dyn_ltree),tt(this.dyn_dtree),tt(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new u.Buf16(D+1),this.heap=new u.Buf16(2*x+1),tt(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new u.Buf16(2*x+1),tt(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function Dt(f){var q;return f&&f.state?(f.total_in=f.total_out=0,f.data_type=c,(q=f.state).pending=0,q.pending_out=0,q.wrap<0&&(q.wrap=-q.wrap),q.status=q.wrap?A:L,f.adler=q.wrap===2?0:1,q.last_flush=g,s._tr_init(q),o):$(f,_)}function je(f){var q=Dt(f);return q===o&&function(H){H.window_size=2*H.w_size,tt(H.head),H.max_lazy_match=i[H.level].max_lazy,H.good_match=i[H.level].good_length,H.nice_match=i[H.level].nice_length,H.max_chain_length=i[H.level].max_chain,H.strstart=0,H.block_start=0,H.lookahead=0,H.insert=0,H.match_length=H.prev_length=C-1,H.match_available=0,H.ins_h=0}(f.state),q}function Oe(f,q,H,E,z,N){if(!f)return _;var Q=1;if(q===v&&(q=6),E<0?(Q=0,E=-E):15<E&&(Q=2,E-=16),z<1||y<z||H!==d||E<8||15<E||q<0||9<q||N<0||S<N)return $(f,_);E===8&&(E=9);var V=new Yt;return(f.state=V).strm=f,V.wrap=Q,V.gzhead=null,V.w_bits=E,V.w_size=1<<V.w_bits,V.w_mask=V.w_size-1,V.hash_bits=z+7,V.hash_size=1<<V.hash_bits,V.hash_mask=V.hash_size-1,V.hash_shift=~~((V.hash_bits+C-1)/C),V.window=new u.Buf8(2*V.w_size),V.head=new u.Buf16(V.hash_size),V.prev=new u.Buf16(V.w_size),V.lit_bufsize=1<<z+6,V.pending_buf_size=4*V.lit_bufsize,V.pending_buf=new u.Buf8(V.pending_buf_size),V.d_buf=1*V.lit_bufsize,V.l_buf=3*V.lit_bufsize,V.level=q,V.strategy=N,V.method=H,je(f)}i=[new pt(0,0,0,0,function(f,q){var H=65535;for(H>f.pending_buf_size-5&&(H=f.pending_buf_size-5);;){if(f.lookahead<=1){if(Nt(f),f.lookahead===0&&q===g)return p;if(f.lookahead===0)break}f.strstart+=f.lookahead,f.lookahead=0;var E=f.block_start+H;if((f.strstart===0||f.strstart>=E)&&(f.lookahead=f.strstart-E,f.strstart=E,U(f,!1),f.strm.avail_out===0)||f.strstart-f.block_start>=f.w_size-F&&(U(f,!1),f.strm.avail_out===0))return p}return f.insert=0,q===m?(U(f,!0),f.strm.avail_out===0?Y:R):(f.strstart>f.block_start&&(U(f,!1),f.strm.avail_out),p)}),new pt(4,4,8,4,Ft),new pt(4,5,16,8,Ft),new pt(4,6,32,32,Ft),new pt(4,4,16,16,ot),new pt(8,16,32,32,ot),new pt(8,16,128,128,ot),new pt(8,32,128,256,ot),new pt(32,128,258,1024,ot),new pt(32,258,258,4096,ot)],n.deflateInit=function(f,q){return Oe(f,q,d,15,8,0)},n.deflateInit2=Oe,n.deflateReset=je,n.deflateResetKeep=Dt,n.deflateSetHeader=function(f,q){return f&&f.state?f.state.wrap!==2?_:(f.state.gzhead=q,o):_},n.deflate=function(f,q){var H,E,z,N;if(!f||!f.state||5<q||q<0)return f?$(f,_):_;if(E=f.state,!f.output||!f.input&&f.avail_in!==0||E.status===666&&q!==m)return $(f,f.avail_out===0?-5:_);if(E.strm=f,H=E.last_flush,E.last_flush=q,E.status===A)if(E.wrap===2)f.adler=0,et(E,31),et(E,139),et(E,8),E.gzhead?(et(E,(E.gzhead.text?1:0)+(E.gzhead.hcrc?2:0)+(E.gzhead.extra?4:0)+(E.gzhead.name?8:0)+(E.gzhead.comment?16:0)),et(E,255&E.gzhead.time),et(E,E.gzhead.time>>8&255),et(E,E.gzhead.time>>16&255),et(E,E.gzhead.time>>24&255),et(E,E.level===9?2:2<=E.strategy||E.level<2?4:0),et(E,255&E.gzhead.os),E.gzhead.extra&&E.gzhead.extra.length&&(et(E,255&E.gzhead.extra.length),et(E,E.gzhead.extra.length>>8&255)),E.gzhead.hcrc&&(f.adler=h(f.adler,E.pending_buf,E.pending,0)),E.gzindex=0,E.status=69):(et(E,0),et(E,0),et(E,0),et(E,0),et(E,0),et(E,E.level===9?2:2<=E.strategy||E.level<2?4:0),et(E,3),E.status=L);else{var Q=d+(E.w_bits-8<<4)<<8;Q|=(2<=E.strategy||E.level<2?0:E.level<6?1:E.level===6?2:3)<<6,E.strstart!==0&&(Q|=32),Q+=31-Q%31,E.status=L,I(E,Q),E.strstart!==0&&(I(E,f.adler>>>16),I(E,65535&f.adler)),f.adler=1}if(E.status===69)if(E.gzhead.extra){for(z=E.pending;E.gzindex<(65535&E.gzhead.extra.length)&&(E.pending!==E.pending_buf_size||(E.gzhead.hcrc&&E.pending>z&&(f.adler=h(f.adler,E.pending_buf,E.pending-z,z)),B(f),z=E.pending,E.pending!==E.pending_buf_size));)et(E,255&E.gzhead.extra[E.gzindex]),E.gzindex++;E.gzhead.hcrc&&E.pending>z&&(f.adler=h(f.adler,E.pending_buf,E.pending-z,z)),E.gzindex===E.gzhead.extra.length&&(E.gzindex=0,E.status=73)}else E.status=73;if(E.status===73)if(E.gzhead.name){z=E.pending;do{if(E.pending===E.pending_buf_size&&(E.gzhead.hcrc&&E.pending>z&&(f.adler=h(f.adler,E.pending_buf,E.pending-z,z)),B(f),z=E.pending,E.pending===E.pending_buf_size)){N=1;break}N=E.gzindex<E.gzhead.name.length?255&E.gzhead.name.charCodeAt(E.gzindex++):0,et(E,N)}while(N!==0);E.gzhead.hcrc&&E.pending>z&&(f.adler=h(f.adler,E.pending_buf,E.pending-z,z)),N===0&&(E.gzindex=0,E.status=91)}else E.status=91;if(E.status===91)if(E.gzhead.comment){z=E.pending;do{if(E.pending===E.pending_buf_size&&(E.gzhead.hcrc&&E.pending>z&&(f.adler=h(f.adler,E.pending_buf,E.pending-z,z)),B(f),z=E.pending,E.pending===E.pending_buf_size)){N=1;break}N=E.gzindex<E.gzhead.comment.length?255&E.gzhead.comment.charCodeAt(E.gzindex++):0,et(E,N)}while(N!==0);E.gzhead.hcrc&&E.pending>z&&(f.adler=h(f.adler,E.pending_buf,E.pending-z,z)),N===0&&(E.status=103)}else E.status=103;if(E.status===103&&(E.gzhead.hcrc?(E.pending+2>E.pending_buf_size&&B(f),E.pending+2<=E.pending_buf_size&&(et(E,255&f.adler),et(E,f.adler>>8&255),f.adler=0,E.status=L)):E.status=L),E.pending!==0){if(B(f),f.avail_out===0)return E.last_flush=-1,o}else if(f.avail_in===0&&X(q)<=X(H)&&q!==m)return $(f,-5);if(E.status===666&&f.avail_in!==0)return $(f,-5);if(f.avail_in!==0||E.lookahead!==0||q!==g&&E.status!==666){var V=E.strategy===2?function(j,K){for(var P;;){if(j.lookahead===0&&(Nt(j),j.lookahead===0)){if(K===g)return p;break}if(j.match_length=0,P=s._tr_tally(j,0,j.window[j.strstart]),j.lookahead--,j.strstart++,P&&(U(j,!1),j.strm.avail_out===0))return p}return j.insert=0,K===m?(U(j,!0),j.strm.avail_out===0?Y:R):j.last_lit&&(U(j,!1),j.strm.avail_out===0)?p:Z}(E,q):E.strategy===3?function(j,K){for(var P,J,at,St,dt=j.window;;){if(j.lookahead<=k){if(Nt(j),j.lookahead<=k&&K===g)return p;if(j.lookahead===0)break}if(j.match_length=0,j.lookahead>=C&&0<j.strstart&&(J=dt[at=j.strstart-1])===dt[++at]&&J===dt[++at]&&J===dt[++at]){St=j.strstart+k;do;while(J===dt[++at]&&J===dt[++at]&&J===dt[++at]&&J===dt[++at]&&J===dt[++at]&&J===dt[++at]&&J===dt[++at]&&J===dt[++at]&&at<St);j.match_length=k-(St-at),j.match_length>j.lookahead&&(j.match_length=j.lookahead)}if(j.match_length>=C?(P=s._tr_tally(j,1,j.match_length-C),j.lookahead-=j.match_length,j.strstart+=j.match_length,j.match_length=0):(P=s._tr_tally(j,0,j.window[j.strstart]),j.lookahead--,j.strstart++),P&&(U(j,!1),j.strm.avail_out===0))return p}return j.insert=0,K===m?(U(j,!0),j.strm.avail_out===0?Y:R):j.last_lit&&(U(j,!1),j.strm.avail_out===0)?p:Z}(E,q):i[E.level].func(E,q);if(V!==Y&&V!==R||(E.status=666),V===p||V===Y)return f.avail_out===0&&(E.last_flush=-1),o;if(V===Z&&(q===1?s._tr_align(E):q!==5&&(s._tr_stored_block(E,0,0,!1),q===3&&(tt(E.head),E.lookahead===0&&(E.strstart=0,E.block_start=0,E.insert=0))),B(f),f.avail_out===0))return E.last_flush=-1,o}return q!==m?o:E.wrap<=0?1:(E.wrap===2?(et(E,255&f.adler),et(E,f.adler>>8&255),et(E,f.adler>>16&255),et(E,f.adler>>24&255),et(E,255&f.total_in),et(E,f.total_in>>8&255),et(E,f.total_in>>16&255),et(E,f.total_in>>24&255)):(I(E,f.adler>>>16),I(E,65535&f.adler)),B(f),0<E.wrap&&(E.wrap=-E.wrap),E.pending!==0?o:1)},n.deflateEnd=function(f){var q;return f&&f.state?(q=f.state.status)!==A&&q!==69&&q!==73&&q!==91&&q!==103&&q!==L&&q!==666?$(f,_):(f.state=null,q===L?$(f,-3):o):_},n.deflateSetDictionary=function(f,q){var H,E,z,N,Q,V,j,K,P=q.length;if(!f||!f.state||(N=(H=f.state).wrap)===2||N===1&&H.status!==A||H.lookahead)return _;for(N===1&&(f.adler=r(f.adler,q,P,0)),H.wrap=0,P>=H.w_size&&(N===0&&(tt(H.head),H.strstart=0,H.block_start=0,H.insert=0),K=new u.Buf8(H.w_size),u.arraySet(K,q,P-H.w_size,H.w_size,0),q=K,P=H.w_size),Q=f.avail_in,V=f.next_in,j=f.input,f.avail_in=P,f.next_in=0,f.input=q,Nt(H);H.lookahead>=C;){for(E=H.strstart,z=H.lookahead-(C-1);H.ins_h=(H.ins_h<<H.hash_shift^H.window[E+C-1])&H.hash_mask,H.prev[E&H.w_mask]=H.head[H.ins_h],H.head[H.ins_h]=E,E++,--z;);H.strstart=E,H.lookahead=C-1,Nt(H)}return H.strstart+=H.lookahead,H.block_start=H.strstart,H.insert=H.lookahead,H.lookahead=0,H.match_length=H.prev_length=C-1,H.match_available=0,f.next_in=V,f.input=j,f.avail_in=Q,H.wrap=N,o},n.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(a,l,n){l.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},{}],48:[function(a,l,n){l.exports=function(i,u){var s,r,h,b,g,m,o,_,v,S,c,d,y,x,w,M,T,D,C,k,F,A,L,p,Z;s=i.state,r=i.next_in,p=i.input,h=r+(i.avail_in-5),b=i.next_out,Z=i.output,g=b-(u-i.avail_out),m=b+(i.avail_out-257),o=s.dmax,_=s.wsize,v=s.whave,S=s.wnext,c=s.window,d=s.hold,y=s.bits,x=s.lencode,w=s.distcode,M=(1<<s.lenbits)-1,T=(1<<s.distbits)-1;t:do{y<15&&(d+=p[r++]<<y,y+=8,d+=p[r++]<<y,y+=8),D=x[d&M];e:for(;;){if(d>>>=C=D>>>24,y-=C,(C=D>>>16&255)===0)Z[b++]=65535&D;else{if(!(16&C)){if(!(64&C)){D=x[(65535&D)+(d&(1<<C)-1)];continue e}if(32&C){s.mode=12;break t}i.msg="invalid literal/length code",s.mode=30;break t}k=65535&D,(C&=15)&&(y<C&&(d+=p[r++]<<y,y+=8),k+=d&(1<<C)-1,d>>>=C,y-=C),y<15&&(d+=p[r++]<<y,y+=8,d+=p[r++]<<y,y+=8),D=w[d&T];a:for(;;){if(d>>>=C=D>>>24,y-=C,!(16&(C=D>>>16&255))){if(!(64&C)){D=w[(65535&D)+(d&(1<<C)-1)];continue a}i.msg="invalid distance code",s.mode=30;break t}if(F=65535&D,y<(C&=15)&&(d+=p[r++]<<y,(y+=8)<C&&(d+=p[r++]<<y,y+=8)),o<(F+=d&(1<<C)-1)){i.msg="invalid distance too far back",s.mode=30;break t}if(d>>>=C,y-=C,(C=b-g)<F){if(v<(C=F-C)&&s.sane){i.msg="invalid distance too far back",s.mode=30;break t}if(L=c,(A=0)===S){if(A+=_-C,C<k){for(k-=C;Z[b++]=c[A++],--C;);A=b-F,L=Z}}else if(S<C){if(A+=_+S-C,(C-=S)<k){for(k-=C;Z[b++]=c[A++],--C;);if(A=0,S<k){for(k-=C=S;Z[b++]=c[A++],--C;);A=b-F,L=Z}}}else if(A+=S-C,C<k){for(k-=C;Z[b++]=c[A++],--C;);A=b-F,L=Z}for(;2<k;)Z[b++]=L[A++],Z[b++]=L[A++],Z[b++]=L[A++],k-=3;k&&(Z[b++]=L[A++],1<k&&(Z[b++]=L[A++]))}else{for(A=b-F;Z[b++]=Z[A++],Z[b++]=Z[A++],Z[b++]=Z[A++],2<(k-=3););k&&(Z[b++]=Z[A++],1<k&&(Z[b++]=Z[A++]))}break}}break}}while(r<h&&b<m);r-=k=y>>3,d&=(1<<(y-=k<<3))-1,i.next_in=r,i.next_out=b,i.avail_in=r<h?h-r+5:5-(r-h),i.avail_out=b<m?m-b+257:257-(b-m),s.hold=d,s.bits=y}},{}],49:[function(a,l,n){var i=a("../utils/common"),u=a("./adler32"),s=a("./crc32"),r=a("./inffast"),h=a("./inftrees"),b=1,g=2,m=0,o=-2,_=1,v=852,S=592;function c(A){return(A>>>24&255)+(A>>>8&65280)+((65280&A)<<8)+((255&A)<<24)}function d(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new i.Buf16(320),this.work=new i.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function y(A){var L;return A&&A.state?(L=A.state,A.total_in=A.total_out=L.total=0,A.msg="",L.wrap&&(A.adler=1&L.wrap),L.mode=_,L.last=0,L.havedict=0,L.dmax=32768,L.head=null,L.hold=0,L.bits=0,L.lencode=L.lendyn=new i.Buf32(v),L.distcode=L.distdyn=new i.Buf32(S),L.sane=1,L.back=-1,m):o}function x(A){var L;return A&&A.state?((L=A.state).wsize=0,L.whave=0,L.wnext=0,y(A)):o}function w(A,L){var p,Z;return A&&A.state?(Z=A.state,L<0?(p=0,L=-L):(p=1+(L>>4),L<48&&(L&=15)),L&&(L<8||15<L)?o:(Z.window!==null&&Z.wbits!==L&&(Z.window=null),Z.wrap=p,Z.wbits=L,x(A))):o}function M(A,L){var p,Z;return A?(Z=new d,(A.state=Z).window=null,(p=w(A,L))!==m&&(A.state=null),p):o}var T,D,C=!0;function k(A){if(C){var L;for(T=new i.Buf32(512),D=new i.Buf32(32),L=0;L<144;)A.lens[L++]=8;for(;L<256;)A.lens[L++]=9;for(;L<280;)A.lens[L++]=7;for(;L<288;)A.lens[L++]=8;for(h(b,A.lens,0,288,T,0,A.work,{bits:9}),L=0;L<32;)A.lens[L++]=5;h(g,A.lens,0,32,D,0,A.work,{bits:5}),C=!1}A.lencode=T,A.lenbits=9,A.distcode=D,A.distbits=5}function F(A,L,p,Z){var Y,R=A.state;return R.window===null&&(R.wsize=1<<R.wbits,R.wnext=0,R.whave=0,R.window=new i.Buf8(R.wsize)),Z>=R.wsize?(i.arraySet(R.window,L,p-R.wsize,R.wsize,0),R.wnext=0,R.whave=R.wsize):(Z<(Y=R.wsize-R.wnext)&&(Y=Z),i.arraySet(R.window,L,p-Z,Y,R.wnext),(Z-=Y)?(i.arraySet(R.window,L,p-Z,Z,0),R.wnext=Z,R.whave=R.wsize):(R.wnext+=Y,R.wnext===R.wsize&&(R.wnext=0),R.whave<R.wsize&&(R.whave+=Y))),0}n.inflateReset=x,n.inflateReset2=w,n.inflateResetKeep=y,n.inflateInit=function(A){return M(A,15)},n.inflateInit2=M,n.inflate=function(A,L){var p,Z,Y,R,$,X,tt,B,U,et,I,W,Nt,Ft,ot,pt,Yt,Dt,je,Oe,f,q,H,E,z=0,N=new i.Buf8(4),Q=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!A||!A.state||!A.output||!A.input&&A.avail_in!==0)return o;(p=A.state).mode===12&&(p.mode=13),$=A.next_out,Y=A.output,tt=A.avail_out,R=A.next_in,Z=A.input,X=A.avail_in,B=p.hold,U=p.bits,et=X,I=tt,q=m;t:for(;;)switch(p.mode){case _:if(p.wrap===0){p.mode=13;break}for(;U<16;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}if(2&p.wrap&&B===35615){N[p.check=0]=255&B,N[1]=B>>>8&255,p.check=s(p.check,N,2,0),U=B=0,p.mode=2;break}if(p.flags=0,p.head&&(p.head.done=!1),!(1&p.wrap)||(((255&B)<<8)+(B>>8))%31){A.msg="incorrect header check",p.mode=30;break}if((15&B)!=8){A.msg="unknown compression method",p.mode=30;break}if(U-=4,f=8+(15&(B>>>=4)),p.wbits===0)p.wbits=f;else if(f>p.wbits){A.msg="invalid window size",p.mode=30;break}p.dmax=1<<f,A.adler=p.check=1,p.mode=512&B?10:12,U=B=0;break;case 2:for(;U<16;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}if(p.flags=B,(255&p.flags)!=8){A.msg="unknown compression method",p.mode=30;break}if(57344&p.flags){A.msg="unknown header flags set",p.mode=30;break}p.head&&(p.head.text=B>>8&1),512&p.flags&&(N[0]=255&B,N[1]=B>>>8&255,p.check=s(p.check,N,2,0)),U=B=0,p.mode=3;case 3:for(;U<32;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}p.head&&(p.head.time=B),512&p.flags&&(N[0]=255&B,N[1]=B>>>8&255,N[2]=B>>>16&255,N[3]=B>>>24&255,p.check=s(p.check,N,4,0)),U=B=0,p.mode=4;case 4:for(;U<16;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}p.head&&(p.head.xflags=255&B,p.head.os=B>>8),512&p.flags&&(N[0]=255&B,N[1]=B>>>8&255,p.check=s(p.check,N,2,0)),U=B=0,p.mode=5;case 5:if(1024&p.flags){for(;U<16;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}p.length=B,p.head&&(p.head.extra_len=B),512&p.flags&&(N[0]=255&B,N[1]=B>>>8&255,p.check=s(p.check,N,2,0)),U=B=0}else p.head&&(p.head.extra=null);p.mode=6;case 6:if(1024&p.flags&&(X<(W=p.length)&&(W=X),W&&(p.head&&(f=p.head.extra_len-p.length,p.head.extra||(p.head.extra=new Array(p.head.extra_len)),i.arraySet(p.head.extra,Z,R,W,f)),512&p.flags&&(p.check=s(p.check,Z,W,R)),X-=W,R+=W,p.length-=W),p.length))break t;p.length=0,p.mode=7;case 7:if(2048&p.flags){if(X===0)break t;for(W=0;f=Z[R+W++],p.head&&f&&p.length<65536&&(p.head.name+=String.fromCharCode(f)),f&&W<X;);if(512&p.flags&&(p.check=s(p.check,Z,W,R)),X-=W,R+=W,f)break t}else p.head&&(p.head.name=null);p.length=0,p.mode=8;case 8:if(4096&p.flags){if(X===0)break t;for(W=0;f=Z[R+W++],p.head&&f&&p.length<65536&&(p.head.comment+=String.fromCharCode(f)),f&&W<X;);if(512&p.flags&&(p.check=s(p.check,Z,W,R)),X-=W,R+=W,f)break t}else p.head&&(p.head.comment=null);p.mode=9;case 9:if(512&p.flags){for(;U<16;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}if(B!==(65535&p.check)){A.msg="header crc mismatch",p.mode=30;break}U=B=0}p.head&&(p.head.hcrc=p.flags>>9&1,p.head.done=!0),A.adler=p.check=0,p.mode=12;break;case 10:for(;U<32;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}A.adler=p.check=c(B),U=B=0,p.mode=11;case 11:if(p.havedict===0)return A.next_out=$,A.avail_out=tt,A.next_in=R,A.avail_in=X,p.hold=B,p.bits=U,2;A.adler=p.check=1,p.mode=12;case 12:if(L===5||L===6)break t;case 13:if(p.last){B>>>=7&U,U-=7&U,p.mode=27;break}for(;U<3;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}switch(p.last=1&B,U-=1,3&(B>>>=1)){case 0:p.mode=14;break;case 1:if(k(p),p.mode=20,L!==6)break;B>>>=2,U-=2;break t;case 2:p.mode=17;break;case 3:A.msg="invalid block type",p.mode=30}B>>>=2,U-=2;break;case 14:for(B>>>=7&U,U-=7&U;U<32;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}if((65535&B)!=(B>>>16^65535)){A.msg="invalid stored block lengths",p.mode=30;break}if(p.length=65535&B,U=B=0,p.mode=15,L===6)break t;case 15:p.mode=16;case 16:if(W=p.length){if(X<W&&(W=X),tt<W&&(W=tt),W===0)break t;i.arraySet(Y,Z,R,W,$),X-=W,R+=W,tt-=W,$+=W,p.length-=W;break}p.mode=12;break;case 17:for(;U<14;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}if(p.nlen=257+(31&B),B>>>=5,U-=5,p.ndist=1+(31&B),B>>>=5,U-=5,p.ncode=4+(15&B),B>>>=4,U-=4,286<p.nlen||30<p.ndist){A.msg="too many length or distance symbols",p.mode=30;break}p.have=0,p.mode=18;case 18:for(;p.have<p.ncode;){for(;U<3;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}p.lens[Q[p.have++]]=7&B,B>>>=3,U-=3}for(;p.have<19;)p.lens[Q[p.have++]]=0;if(p.lencode=p.lendyn,p.lenbits=7,H={bits:p.lenbits},q=h(0,p.lens,0,19,p.lencode,0,p.work,H),p.lenbits=H.bits,q){A.msg="invalid code lengths set",p.mode=30;break}p.have=0,p.mode=19;case 19:for(;p.have<p.nlen+p.ndist;){for(;pt=(z=p.lencode[B&(1<<p.lenbits)-1])>>>16&255,Yt=65535&z,!((ot=z>>>24)<=U);){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}if(Yt<16)B>>>=ot,U-=ot,p.lens[p.have++]=Yt;else{if(Yt===16){for(E=ot+2;U<E;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}if(B>>>=ot,U-=ot,p.have===0){A.msg="invalid bit length repeat",p.mode=30;break}f=p.lens[p.have-1],W=3+(3&B),B>>>=2,U-=2}else if(Yt===17){for(E=ot+3;U<E;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}U-=ot,f=0,W=3+(7&(B>>>=ot)),B>>>=3,U-=3}else{for(E=ot+7;U<E;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}U-=ot,f=0,W=11+(127&(B>>>=ot)),B>>>=7,U-=7}if(p.have+W>p.nlen+p.ndist){A.msg="invalid bit length repeat",p.mode=30;break}for(;W--;)p.lens[p.have++]=f}}if(p.mode===30)break;if(p.lens[256]===0){A.msg="invalid code -- missing end-of-block",p.mode=30;break}if(p.lenbits=9,H={bits:p.lenbits},q=h(b,p.lens,0,p.nlen,p.lencode,0,p.work,H),p.lenbits=H.bits,q){A.msg="invalid literal/lengths set",p.mode=30;break}if(p.distbits=6,p.distcode=p.distdyn,H={bits:p.distbits},q=h(g,p.lens,p.nlen,p.ndist,p.distcode,0,p.work,H),p.distbits=H.bits,q){A.msg="invalid distances set",p.mode=30;break}if(p.mode=20,L===6)break t;case 20:p.mode=21;case 21:if(6<=X&&258<=tt){A.next_out=$,A.avail_out=tt,A.next_in=R,A.avail_in=X,p.hold=B,p.bits=U,r(A,I),$=A.next_out,Y=A.output,tt=A.avail_out,R=A.next_in,Z=A.input,X=A.avail_in,B=p.hold,U=p.bits,p.mode===12&&(p.back=-1);break}for(p.back=0;pt=(z=p.lencode[B&(1<<p.lenbits)-1])>>>16&255,Yt=65535&z,!((ot=z>>>24)<=U);){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}if(pt&&!(240&pt)){for(Dt=ot,je=pt,Oe=Yt;pt=(z=p.lencode[Oe+((B&(1<<Dt+je)-1)>>Dt)])>>>16&255,Yt=65535&z,!(Dt+(ot=z>>>24)<=U);){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}B>>>=Dt,U-=Dt,p.back+=Dt}if(B>>>=ot,U-=ot,p.back+=ot,p.length=Yt,pt===0){p.mode=26;break}if(32&pt){p.back=-1,p.mode=12;break}if(64&pt){A.msg="invalid literal/length code",p.mode=30;break}p.extra=15&pt,p.mode=22;case 22:if(p.extra){for(E=p.extra;U<E;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}p.length+=B&(1<<p.extra)-1,B>>>=p.extra,U-=p.extra,p.back+=p.extra}p.was=p.length,p.mode=23;case 23:for(;pt=(z=p.distcode[B&(1<<p.distbits)-1])>>>16&255,Yt=65535&z,!((ot=z>>>24)<=U);){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}if(!(240&pt)){for(Dt=ot,je=pt,Oe=Yt;pt=(z=p.distcode[Oe+((B&(1<<Dt+je)-1)>>Dt)])>>>16&255,Yt=65535&z,!(Dt+(ot=z>>>24)<=U);){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}B>>>=Dt,U-=Dt,p.back+=Dt}if(B>>>=ot,U-=ot,p.back+=ot,64&pt){A.msg="invalid distance code",p.mode=30;break}p.offset=Yt,p.extra=15&pt,p.mode=24;case 24:if(p.extra){for(E=p.extra;U<E;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}p.offset+=B&(1<<p.extra)-1,B>>>=p.extra,U-=p.extra,p.back+=p.extra}if(p.offset>p.dmax){A.msg="invalid distance too far back",p.mode=30;break}p.mode=25;case 25:if(tt===0)break t;if(W=I-tt,p.offset>W){if((W=p.offset-W)>p.whave&&p.sane){A.msg="invalid distance too far back",p.mode=30;break}Nt=W>p.wnext?(W-=p.wnext,p.wsize-W):p.wnext-W,W>p.length&&(W=p.length),Ft=p.window}else Ft=Y,Nt=$-p.offset,W=p.length;for(tt<W&&(W=tt),tt-=W,p.length-=W;Y[$++]=Ft[Nt++],--W;);p.length===0&&(p.mode=21);break;case 26:if(tt===0)break t;Y[$++]=p.length,tt--,p.mode=21;break;case 27:if(p.wrap){for(;U<32;){if(X===0)break t;X--,B|=Z[R++]<<U,U+=8}if(I-=tt,A.total_out+=I,p.total+=I,I&&(A.adler=p.check=p.flags?s(p.check,Y,I,$-I):u(p.check,Y,I,$-I)),I=tt,(p.flags?B:c(B))!==p.check){A.msg="incorrect data check",p.mode=30;break}U=B=0}p.mode=28;case 28:if(p.wrap&&p.flags){for(;U<32;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}if(B!==(4294967295&p.total)){A.msg="incorrect length check",p.mode=30;break}U=B=0}p.mode=29;case 29:q=1;break t;case 30:q=-3;break t;case 31:return-4;case 32:default:return o}return A.next_out=$,A.avail_out=tt,A.next_in=R,A.avail_in=X,p.hold=B,p.bits=U,(p.wsize||I!==A.avail_out&&p.mode<30&&(p.mode<27||L!==4))&&F(A,A.output,A.next_out,I-A.avail_out)?(p.mode=31,-4):(et-=A.avail_in,I-=A.avail_out,A.total_in+=et,A.total_out+=I,p.total+=I,p.wrap&&I&&(A.adler=p.check=p.flags?s(p.check,Y,I,A.next_out-I):u(p.check,Y,I,A.next_out-I)),A.data_type=p.bits+(p.last?64:0)+(p.mode===12?128:0)+(p.mode===20||p.mode===15?256:0),(et==0&&I===0||L===4)&&q===m&&(q=-5),q)},n.inflateEnd=function(A){if(!A||!A.state)return o;var L=A.state;return L.window&&(L.window=null),A.state=null,m},n.inflateGetHeader=function(A,L){var p;return A&&A.state&&2&(p=A.state).wrap?((p.head=L).done=!1,m):o},n.inflateSetDictionary=function(A,L){var p,Z=L.length;return A&&A.state?(p=A.state).wrap!==0&&p.mode!==11?o:p.mode===11&&u(1,L,Z,0)!==p.check?-3:F(A,L,Z,Z)?(p.mode=31,-4):(p.havedict=1,m):o},n.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(a,l,n){var i=a("../utils/common"),u=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],s=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],r=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],h=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];l.exports=function(b,g,m,o,_,v,S,c){var d,y,x,w,M,T,D,C,k,F=c.bits,A=0,L=0,p=0,Z=0,Y=0,R=0,$=0,X=0,tt=0,B=0,U=null,et=0,I=new i.Buf16(16),W=new i.Buf16(16),Nt=null,Ft=0;for(A=0;A<=15;A++)I[A]=0;for(L=0;L<o;L++)I[g[m+L]]++;for(Y=F,Z=15;1<=Z&&I[Z]===0;Z--);if(Z<Y&&(Y=Z),Z===0)return _[v++]=20971520,_[v++]=20971520,c.bits=1,0;for(p=1;p<Z&&I[p]===0;p++);for(Y<p&&(Y=p),A=X=1;A<=15;A++)if(X<<=1,(X-=I[A])<0)return-1;if(0<X&&(b===0||Z!==1))return-1;for(W[1]=0,A=1;A<15;A++)W[A+1]=W[A]+I[A];for(L=0;L<o;L++)g[m+L]!==0&&(S[W[g[m+L]]++]=L);if(T=b===0?(U=Nt=S,19):b===1?(U=u,et-=257,Nt=s,Ft-=257,256):(U=r,Nt=h,-1),A=p,M=v,$=L=B=0,x=-1,w=(tt=1<<(R=Y))-1,b===1&&852<tt||b===2&&592<tt)return 1;for(;;){for(D=A-$,k=S[L]<T?(C=0,S[L]):S[L]>T?(C=Nt[Ft+S[L]],U[et+S[L]]):(C=96,0),d=1<<A-$,p=y=1<<R;_[M+(B>>$)+(y-=d)]=D<<24|C<<16|k|0,y!==0;);for(d=1<<A-1;B&d;)d>>=1;if(d!==0?(B&=d-1,B+=d):B=0,L++,--I[A]==0){if(A===Z)break;A=g[m+S[L]]}if(Y<A&&(B&w)!==x){for($===0&&($=Y),M+=p,X=1<<(R=A-$);R+$<Z&&!((X-=I[R+$])<=0);)R++,X<<=1;if(tt+=1<<R,b===1&&852<tt||b===2&&592<tt)return 1;_[x=B&w]=Y<<24|R<<16|M-v|0}}return B!==0&&(_[M+B]=A-$<<24|64<<16|0),c.bits=Y,0}},{"../utils/common":41}],51:[function(a,l,n){l.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],52:[function(a,l,n){var i=a("../utils/common"),u=0,s=1;function r(z){for(var N=z.length;0<=--N;)z[N]=0}var h=0,b=29,g=256,m=g+1+b,o=30,_=19,v=2*m+1,S=15,c=16,d=7,y=256,x=16,w=17,M=18,T=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],D=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],C=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],k=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],F=new Array(2*(m+2));r(F);var A=new Array(2*o);r(A);var L=new Array(512);r(L);var p=new Array(256);r(p);var Z=new Array(b);r(Z);var Y,R,$,X=new Array(o);function tt(z,N,Q,V,j){this.static_tree=z,this.extra_bits=N,this.extra_base=Q,this.elems=V,this.max_length=j,this.has_stree=z&&z.length}function B(z,N){this.dyn_tree=z,this.max_code=0,this.stat_desc=N}function U(z){return z<256?L[z]:L[256+(z>>>7)]}function et(z,N){z.pending_buf[z.pending++]=255&N,z.pending_buf[z.pending++]=N>>>8&255}function I(z,N,Q){z.bi_valid>c-Q?(z.bi_buf|=N<<z.bi_valid&65535,et(z,z.bi_buf),z.bi_buf=N>>c-z.bi_valid,z.bi_valid+=Q-c):(z.bi_buf|=N<<z.bi_valid&65535,z.bi_valid+=Q)}function W(z,N,Q){I(z,Q[2*N],Q[2*N+1])}function Nt(z,N){for(var Q=0;Q|=1&z,z>>>=1,Q<<=1,0<--N;);return Q>>>1}function Ft(z,N,Q){var V,j,K=new Array(S+1),P=0;for(V=1;V<=S;V++)K[V]=P=P+Q[V-1]<<1;for(j=0;j<=N;j++){var J=z[2*j+1];J!==0&&(z[2*j]=Nt(K[J]++,J))}}function ot(z){var N;for(N=0;N<m;N++)z.dyn_ltree[2*N]=0;for(N=0;N<o;N++)z.dyn_dtree[2*N]=0;for(N=0;N<_;N++)z.bl_tree[2*N]=0;z.dyn_ltree[2*y]=1,z.opt_len=z.static_len=0,z.last_lit=z.matches=0}function pt(z){8<z.bi_valid?et(z,z.bi_buf):0<z.bi_valid&&(z.pending_buf[z.pending++]=z.bi_buf),z.bi_buf=0,z.bi_valid=0}function Yt(z,N,Q,V){var j=2*N,K=2*Q;return z[j]<z[K]||z[j]===z[K]&&V[N]<=V[Q]}function Dt(z,N,Q){for(var V=z.heap[Q],j=Q<<1;j<=z.heap_len&&(j<z.heap_len&&Yt(N,z.heap[j+1],z.heap[j],z.depth)&&j++,!Yt(N,V,z.heap[j],z.depth));)z.heap[Q]=z.heap[j],Q=j,j<<=1;z.heap[Q]=V}function je(z,N,Q){var V,j,K,P,J=0;if(z.last_lit!==0)for(;V=z.pending_buf[z.d_buf+2*J]<<8|z.pending_buf[z.d_buf+2*J+1],j=z.pending_buf[z.l_buf+J],J++,V===0?W(z,j,N):(W(z,(K=p[j])+g+1,N),(P=T[K])!==0&&I(z,j-=Z[K],P),W(z,K=U(--V),Q),(P=D[K])!==0&&I(z,V-=X[K],P)),J<z.last_lit;);W(z,y,N)}function Oe(z,N){var Q,V,j,K=N.dyn_tree,P=N.stat_desc.static_tree,J=N.stat_desc.has_stree,at=N.stat_desc.elems,St=-1;for(z.heap_len=0,z.heap_max=v,Q=0;Q<at;Q++)K[2*Q]!==0?(z.heap[++z.heap_len]=St=Q,z.depth[Q]=0):K[2*Q+1]=0;for(;z.heap_len<2;)K[2*(j=z.heap[++z.heap_len]=St<2?++St:0)]=1,z.depth[j]=0,z.opt_len--,J&&(z.static_len-=P[2*j+1]);for(N.max_code=St,Q=z.heap_len>>1;1<=Q;Q--)Dt(z,K,Q);for(j=at;Q=z.heap[1],z.heap[1]=z.heap[z.heap_len--],Dt(z,K,1),V=z.heap[1],z.heap[--z.heap_max]=Q,z.heap[--z.heap_max]=V,K[2*j]=K[2*Q]+K[2*V],z.depth[j]=(z.depth[Q]>=z.depth[V]?z.depth[Q]:z.depth[V])+1,K[2*Q+1]=K[2*V+1]=j,z.heap[1]=j++,Dt(z,K,1),2<=z.heap_len;);z.heap[--z.heap_max]=z.heap[1],function(dt,ye){var Gl,Ue,ql,jt,Xn,_u,Ze=ye.dyn_tree,ac=ye.max_code,Hh=ye.stat_desc.static_tree,kh=ye.stat_desc.has_stree,Lh=ye.stat_desc.extra_bits,lc=ye.stat_desc.extra_base,Xl=ye.stat_desc.max_length,Qn=0;for(jt=0;jt<=S;jt++)dt.bl_count[jt]=0;for(Ze[2*dt.heap[dt.heap_max]+1]=0,Gl=dt.heap_max+1;Gl<v;Gl++)Xl<(jt=Ze[2*Ze[2*(Ue=dt.heap[Gl])+1]+1]+1)&&(jt=Xl,Qn++),Ze[2*Ue+1]=jt,ac<Ue||(dt.bl_count[jt]++,Xn=0,lc<=Ue&&(Xn=Lh[Ue-lc]),_u=Ze[2*Ue],dt.opt_len+=_u*(jt+Xn),kh&&(dt.static_len+=_u*(Hh[2*Ue+1]+Xn)));if(Qn!==0){do{for(jt=Xl-1;dt.bl_count[jt]===0;)jt--;dt.bl_count[jt]--,dt.bl_count[jt+1]+=2,dt.bl_count[Xl]--,Qn-=2}while(0<Qn);for(jt=Xl;jt!==0;jt--)for(Ue=dt.bl_count[jt];Ue!==0;)ac<(ql=dt.heap[--Gl])||(Ze[2*ql+1]!==jt&&(dt.opt_len+=(jt-Ze[2*ql+1])*Ze[2*ql],Ze[2*ql+1]=jt),Ue--)}}(z,N),Ft(K,St,z.bl_count)}function f(z,N,Q){var V,j,K=-1,P=N[1],J=0,at=7,St=4;for(P===0&&(at=138,St=3),N[2*(Q+1)+1]=65535,V=0;V<=Q;V++)j=P,P=N[2*(V+1)+1],++J<at&&j===P||(J<St?z.bl_tree[2*j]+=J:j!==0?(j!==K&&z.bl_tree[2*j]++,z.bl_tree[2*x]++):J<=10?z.bl_tree[2*w]++:z.bl_tree[2*M]++,K=j,St=(J=0)===P?(at=138,3):j===P?(at=6,3):(at=7,4))}function q(z,N,Q){var V,j,K=-1,P=N[1],J=0,at=7,St=4;for(P===0&&(at=138,St=3),V=0;V<=Q;V++)if(j=P,P=N[2*(V+1)+1],!(++J<at&&j===P)){if(J<St)for(;W(z,j,z.bl_tree),--J!=0;);else j!==0?(j!==K&&(W(z,j,z.bl_tree),J--),W(z,x,z.bl_tree),I(z,J-3,2)):J<=10?(W(z,w,z.bl_tree),I(z,J-3,3)):(W(z,M,z.bl_tree),I(z,J-11,7));K=j,St=(J=0)===P?(at=138,3):j===P?(at=6,3):(at=7,4)}}r(X);var H=!1;function E(z,N,Q,V){I(z,(h<<1)+(V?1:0),3),function(j,K,P,J){pt(j),et(j,P),et(j,~P),i.arraySet(j.pending_buf,j.window,K,P,j.pending),j.pending+=P}(z,N,Q)}n._tr_init=function(z){H||(function(){var N,Q,V,j,K,P=new Array(S+1);for(j=V=0;j<b-1;j++)for(Z[j]=V,N=0;N<1<<T[j];N++)p[V++]=j;for(p[V-1]=j,j=K=0;j<16;j++)for(X[j]=K,N=0;N<1<<D[j];N++)L[K++]=j;for(K>>=7;j<o;j++)for(X[j]=K<<7,N=0;N<1<<D[j]-7;N++)L[256+K++]=j;for(Q=0;Q<=S;Q++)P[Q]=0;for(N=0;N<=143;)F[2*N+1]=8,N++,P[8]++;for(;N<=255;)F[2*N+1]=9,N++,P[9]++;for(;N<=279;)F[2*N+1]=7,N++,P[7]++;for(;N<=287;)F[2*N+1]=8,N++,P[8]++;for(Ft(F,m+1,P),N=0;N<o;N++)A[2*N+1]=5,A[2*N]=Nt(N,5);Y=new tt(F,T,g+1,m,S),R=new tt(A,D,0,o,S),$=new tt(new Array(0),C,0,_,d)}(),H=!0),z.l_desc=new B(z.dyn_ltree,Y),z.d_desc=new B(z.dyn_dtree,R),z.bl_desc=new B(z.bl_tree,$),z.bi_buf=0,z.bi_valid=0,ot(z)},n._tr_stored_block=E,n._tr_flush_block=function(z,N,Q,V){var j,K,P=0;0<z.level?(z.strm.data_type===2&&(z.strm.data_type=function(J){var at,St=4093624447;for(at=0;at<=31;at++,St>>>=1)if(1&St&&J.dyn_ltree[2*at]!==0)return u;if(J.dyn_ltree[18]!==0||J.dyn_ltree[20]!==0||J.dyn_ltree[26]!==0)return s;for(at=32;at<g;at++)if(J.dyn_ltree[2*at]!==0)return s;return u}(z)),Oe(z,z.l_desc),Oe(z,z.d_desc),P=function(J){var at;for(f(J,J.dyn_ltree,J.l_desc.max_code),f(J,J.dyn_dtree,J.d_desc.max_code),Oe(J,J.bl_desc),at=_-1;3<=at&&J.bl_tree[2*k[at]+1]===0;at--);return J.opt_len+=3*(at+1)+5+5+4,at}(z),j=z.opt_len+3+7>>>3,(K=z.static_len+3+7>>>3)<=j&&(j=K)):j=K=Q+5,Q+4<=j&&N!==-1?E(z,N,Q,V):z.strategy===4||K===j?(I(z,2+(V?1:0),3),je(z,F,A)):(I(z,4+(V?1:0),3),function(J,at,St,dt){var ye;for(I(J,at-257,5),I(J,St-1,5),I(J,dt-4,4),ye=0;ye<dt;ye++)I(J,J.bl_tree[2*k[ye]+1],3);q(J,J.dyn_ltree,at-1),q(J,J.dyn_dtree,St-1)}(z,z.l_desc.max_code+1,z.d_desc.max_code+1,P+1),je(z,z.dyn_ltree,z.dyn_dtree)),ot(z),V&&pt(z)},n._tr_tally=function(z,N,Q){return z.pending_buf[z.d_buf+2*z.last_lit]=N>>>8&255,z.pending_buf[z.d_buf+2*z.last_lit+1]=255&N,z.pending_buf[z.l_buf+z.last_lit]=255&Q,z.last_lit++,N===0?z.dyn_ltree[2*Q]++:(z.matches++,N--,z.dyn_ltree[2*(p[Q]+g+1)]++,z.dyn_dtree[2*U(N)]++),z.last_lit===z.lit_bufsize-1},n._tr_align=function(z){I(z,2,3),W(z,y,F),function(N){N.bi_valid===16?(et(N,N.bi_buf),N.bi_buf=0,N.bi_valid=0):8<=N.bi_valid&&(N.pending_buf[N.pending++]=255&N.bi_buf,N.bi_buf>>=8,N.bi_valid-=8)}(z)}},{"../utils/common":41}],53:[function(a,l,n){l.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],54:[function(a,l,n){(function(i){(function(u,s){if(!u.setImmediate){var r,h,b,g,m=1,o={},_=!1,v=u.document,S=Object.getPrototypeOf&&Object.getPrototypeOf(u);S=S&&S.setTimeout?S:u,r={}.toString.call(u.process)==="[object process]"?function(x){process.nextTick(function(){d(x)})}:function(){if(u.postMessage&&!u.importScripts){var x=!0,w=u.onmessage;return u.onmessage=function(){x=!1},u.postMessage("","*"),u.onmessage=w,x}}()?(g="setImmediate$"+Math.random()+"$",u.addEventListener?u.addEventListener("message",y,!1):u.attachEvent("onmessage",y),function(x){u.postMessage(g+x,"*")}):u.MessageChannel?((b=new MessageChannel).port1.onmessage=function(x){d(x.data)},function(x){b.port2.postMessage(x)}):v&&"onreadystatechange"in v.createElement("script")?(h=v.documentElement,function(x){var w=v.createElement("script");w.onreadystatechange=function(){d(x),w.onreadystatechange=null,h.removeChild(w),w=null},h.appendChild(w)}):function(x){setTimeout(d,0,x)},S.setImmediate=function(x){typeof x!="function"&&(x=new Function(""+x));for(var w=new Array(arguments.length-1),M=0;M<w.length;M++)w[M]=arguments[M+1];var T={callback:x,args:w};return o[m]=T,r(m),m++},S.clearImmediate=c}function c(x){delete o[x]}function d(x){if(_)setTimeout(d,0,x);else{var w=o[x];if(w){_=!0;try{(function(M){var T=M.callback,D=M.args;switch(D.length){case 0:T();break;case 1:T(D[0]);break;case 2:T(D[0],D[1]);break;case 3:T(D[0],D[1],D[2]);break;default:T.apply(s,D)}})(w)}finally{c(x),_=!1}}}}function y(x){x.source===u&&typeof x.data=="string"&&x.data.indexOf(g)===0&&d(+x.data.slice(g.length))}})(typeof self>"u"?i===void 0?this:i:self)}).call(this,typeof Vn<"u"?Vn:typeof self<"u"?self:typeof window<"u"?window:{})},{}]},{},[10])(10)})})(Bh);var ip=Bh.exports;const up=tr(ip);function sp(){const[t,e]=ut.useState(!1),[a,l]=ut.useState(null),[n,i]=ut.useState({16:null,32:null,48:null,180:null,192:null,512:null}),[u,s]=ut.useState(!1),[r,h]=ut.useState(null),[b,g]=ut.useState(!1),m=ut.useRef(null);ut.useRef(null);const o=ut.useCallback((T,D,C)=>new Promise(k=>{const F=document.createElement("canvas");F.width=D,F.height=C;const A=F.getContext("2d");if(!A){k("");return}A.clearRect(0,0,D,C),A.imageSmoothingEnabled=!0,A.imageSmoothingQuality="high";const L=Math.min(D/T.width,C/T.height),p=T.width*L,Z=T.height*L,Y=(D-p)/2,R=(C-Z)/2;A.drawImage(T,Y,R,p,Z);const $=F.toDataURL("image/png");k($)}),[]),_=ut.useCallback(async T=>{h(null),s(!0),g(!1);try{const D=new FileReader,C=new Promise((Y,R)=>{D.onload=()=>Y(D.result),D.onerror=R});D.readAsDataURL(T);const k=await C;l(k);const F=new Image;if(await new Promise((Y,R)=>{F.onload=()=>Y(),F.onerror=R}),F.width<16||F.height<16)throw new Error("이미지는 최소 16x16 픽셀 이상이어야 합니다.");const L=[{name:"16",width:16,height:16},{name:"32",width:32,height:32},{name:"48",width:48,height:48},{name:"180",width:180,height:180},{name:"192",width:192,height:192},{name:"512",width:512,height:512}].map(async({name:Y,width:R,height:$})=>{const X=await o(F,R,$);return{name:Y,dataUrl:X}}),p=await Promise.all(L),Z={16:null,32:null,48:null,180:null,192:null,512:null};p.forEach(({name:Y,dataUrl:R})=>{Z[Y]=R}),i(Z),g(!0)}catch(D){h(D instanceof Error?D.message:"이미지 처리 중 오류가 발생했습니다.")}finally{s(!1)}},[o]),v=ut.useCallback(T=>{T.preventDefault(),T.stopPropagation(),e(!0)},[]),S=ut.useCallback(T=>{T.preventDefault(),T.stopPropagation(),e(!1)},[]),c=ut.useCallback(T=>{T.preventDefault(),T.stopPropagation()},[]),d=ut.useCallback(async T=>{T.preventDefault(),T.stopPropagation(),e(!1);const D=T.dataTransfer.files;if(D.length===0)return;const C=D[0];if(!C.type.startsWith("image/")){h("이미지 파일만 업로드할 수 있습니다.");return}await _(C)},[_]),y=ut.useCallback(async T=>{const D=T.target.files;if(!D||D.length===0)return;const C=D[0];if(!C.type.startsWith("image/")){h("이미지 파일만 업로드할 수 있습니다.");return}await _(C),m.current&&(m.current.value="")},[_]),x=ut.useCallback(()=>{m.current&&m.current.click()},[]);ut.useCallback(async()=>{const T=[{size:16,data:n[16]},{size:32,data:n[32]},{size:48,data:n[48]}].filter(D=>D.data!==null);if(T.length===0)return null;try{const D=[];for(const A of T){const Z=await(await(await fetch(A.data)).blob()).arrayBuffer();D.push(new Uint8Array(Z))}const F=await(await(await fetch(T[T.length-1].data)).blob()).arrayBuffer();return new Blob([F],{type:"image/x-icon"})}catch(D){return console.error("ICO 생성 실패:",D),null}},[n]);const w=ut.useCallback(async()=>{if(b)try{const T=new up;if(n[48]){const A=await(await fetch(n[48])).blob();T.file("favicon.ico",A,{binary:!0})}if(n[16]){const A=await(await fetch(n[16])).blob();T.file("favicon-16x16.png",A,{binary:!0})}if(n[32]){const A=await(await fetch(n[32])).blob();T.file("favicon-32x32.png",A,{binary:!0})}if(n[180]){const A=await(await fetch(n[180])).blob();T.file("apple-touch-icon.png",A,{binary:!0})}if(n[192]){const A=await(await fetch(n[192])).blob();T.file("android-chrome-192x192.png",A,{binary:!0})}if(n[512]){const A=await(await fetch(n[512])).blob();T.file("android-chrome-512x512.png",A,{binary:!0})}const D=await T.generateAsync({type:"blob"}),C=URL.createObjectURL(D),k=document.createElement("a");k.href=C,k.download=`favicon-${new Date().getTime()}.zip`,document.body.appendChild(k),k.click(),document.body.removeChild(k),URL.revokeObjectURL(C)}catch(T){h("ZIP 파일 생성 중 오류가 발생했습니다. JSZip 라이브러리가 로드되지 않았습니다."),console.error("ZIP 생성 실패:",T)}},[b,n]),M=ut.useCallback(()=>{new Date().getTime(),[{name:"favicon.ico",data:n[48]||n[32]||n[16]},{name:"favicon-16x16.png",data:n[16]},{name:"favicon-32x32.png",data:n[32]},{name:"apple-touch-icon.png",data:n[180]},{name:"android-chrome-192x192.png",data:n[192]},{name:"android-chrome-512x512.png",data:n[512]}].forEach(D=>{if(D.data){const C=document.createElement("a");C.href=D.data,C.download=D.name,document.body.appendChild(C),C.click(),document.body.removeChild(C)}})},[n]);return O.jsxs("div",{className:"flex flex-col gap-6",children:[O.jsxs("div",{className:"bg-[#1E293B] border border-slate-700 rounded-lg p-6",children:[O.jsx("h2",{className:"text-xl font-bold text-slate-100 mb-2",children:"파비콘 만들기"}),O.jsxs("p",{className:"text-slate-400 text-sm",children:["이미지를 드래그 앤 드랍하거나 클릭하여 업로드하세요. ",O.jsx("br",{}),"자동으로 다양한 크기의 파비콘 이미지들이 생성됩니다."]})]}),r&&O.jsxs("div",{className:"bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-300",children:[O.jsx("span",{className:"material-symbols-outlined text-red-400 mr-2",children:"error"}),r]}),O.jsxs("div",{className:`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 transition-all ${t?"border-blue-500 bg-blue-900/20":"border-slate-700 bg-[#1E293B]"}`,onDragEnter:v,onDragLeave:S,onDragOver:c,onDrop:d,onClick:x,style:{cursor:"pointer"},children:[O.jsx("input",{type:"file",ref:m,onChange:y,accept:"image/*",className:"hidden"}),u?O.jsxs("div",{className:"flex flex-col items-center gap-4",children:[O.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"}),O.jsx("p",{className:"text-slate-300",children:"이미지 처리 중..."})]}):a?O.jsxs("div",{className:"flex flex-col items-center gap-4",children:[O.jsx("img",{src:a,alt:"Preview",className:"max-w-full max-h-64 object-contain rounded"}),O.jsx("p",{className:"text-slate-300",children:"이미지가 업로드되었습니다."})]}):O.jsxs("div",{className:"flex flex-col items-center gap-4",children:[O.jsx("span",{className:"material-symbols-outlined text-6xl text-slate-500",children:"upload"}),O.jsx("p",{className:"text-slate-400",children:"이미지를 여기에 드래그 앤 드랍하세요"}),O.jsx("p",{className:"text-slate-500 text-sm",children:"또는 클릭하여 파일 선택"})]})]}),b&&O.jsxs("div",{className:"bg-[#1E293B] border border-slate-700 rounded-lg p-6",children:[O.jsx("h3",{className:"text-lg font-semibold text-slate-100 mb-4",children:"생성된 파비콘 미리보기"}),O.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6",children:[O.jsxs("div",{className:"flex flex-col items-center gap-2",children:[O.jsx("span",{className:"text-xs text-slate-400",children:"16x16"}),n[16]&&O.jsx("img",{src:n[16],alt:"16x16",className:"w-8 h-8 object-contain bg-slate-800 rounded p-1"})]}),O.jsxs("div",{className:"flex flex-col items-center gap-2",children:[O.jsx("span",{className:"text-xs text-slate-400",children:"32x32"}),n[32]&&O.jsx("img",{src:n[32],alt:"32x32",className:"w-8 h-8 object-contain bg-slate-800 rounded p-1"})]}),O.jsxs("div",{className:"flex flex-col items-center gap-2",children:[O.jsx("span",{className:"text-xs text-slate-400",children:"48x48"}),n[48]&&O.jsx("img",{src:n[48],alt:"48x48",className:"w-12 h-12 object-contain bg-slate-800 rounded p-1"})]}),O.jsxs("div",{className:"flex flex-col items-center gap-2",children:[O.jsx("span",{className:"text-xs text-slate-400",children:"180x180"}),n[180]&&O.jsx("img",{src:n[180],alt:"180x180",className:"w-16 h-16 object-contain bg-slate-800 rounded p-1"})]}),O.jsxs("div",{className:"flex flex-col items-center gap-2",children:[O.jsx("span",{className:"text-xs text-slate-400",children:"192x192"}),n[192]&&O.jsx("img",{src:n[192],alt:"192x192",className:"w-20 h-20 object-contain bg-slate-800 rounded p-1"})]}),O.jsxs("div",{className:"flex flex-col items-center gap-2",children:[O.jsx("span",{className:"text-xs text-slate-400",children:"512x512"}),n[512]&&O.jsx("img",{src:n[512],alt:"512x512",className:"w-24 h-24 object-contain bg-slate-800 rounded p-1"})]})]}),O.jsxs("div",{className:"flex gap-3",children:[O.jsxs("button",{onClick:w,className:"flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition",children:[O.jsx("span",{className:"material-symbols-outlined",children:"download"}),O.jsx("span",{children:"모두 ZIP으로 다운로드"})]}),O.jsxs("button",{onClick:M,className:"flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition",children:[O.jsx("span",{className:"material-symbols-outlined",children:"file_download"}),O.jsx("span",{children:"개별 파일 다운로드"})]})]})]}),a&&!b&&!u&&O.jsxs("div",{className:"bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 text-yellow-300",children:[O.jsx("span",{className:"material-symbols-outlined text-yellow-400 mr-2",children:"info"}),"이미지가 업로드되었지만, 파비콘 생성이 완료되지 않았습니다."]})]})}function rp(){const[t,e]=ut.useState("clients"),[a,l]=ut.useState("ALL"),{clients:n,logs:i,setLogs:u,loadClients:s,loadLogs:r,executeClearLogs:h,executePurgeClient:b}=q1(),g=ut.useCallback(()=>{s(),r()},[s,r]),{wsStatus:m,dispatchCommand:o}=V1(u,g),_=v=>{l(v),e("console")};return O.jsxs(P1,{wsStatus:m,clientCount:n.length,activeTab:t,onSelectTab:e,onRefresh:()=>{s(),r()},onClearLogs:h,children:[t==="clients"&&O.jsx(ap,{clients:n,logCount:i.length,onSelectTarget:_,onPurgeClient:b}),t==="console"&&O.jsx(lp,{targetId:a,setTargetId:l,onDispatch:o}),t==="logs"&&O.jsx(np,{logs:i,onClearLogs:h}),t==="favicon"&&O.jsx(sp,{})]})}k1.createRoot(document.getElementById("root")).render(O.jsx(n0.StrictMode,{children:O.jsx(rp,{})}));
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

## admin/src/components/views/FaviconGeneratorView.tsx

```tsx
import { useState, useCallback, useRef } from 'react';
import JSZip from 'jszip';

interface FaviconSizes {
  16: string | null;
  32: string | null;
  48: string | null;
  180: string | null;
  192: string | null;
  512: string | null;
}

export function FaviconGeneratorView() {
  const [isDragging, setIsDragging] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resizedImages, setResizedImages] = useState<FaviconSizes>({
    16: null,
    32: null,
    48: null,
    180: null,
    192: null,
    512: null
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadReady, setDownloadReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const resizeImage = useCallback((image: HTMLImageElement, width: number, height: number): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve('');
        return;
      }

      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Enable image smoothing for better quality on downscale
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw image centered and scaled to fit
      const ratio = Math.min(width / image.width, height / image.height);
      const newWidth = image.width * ratio;
      const newHeight = image.height * ratio;
      const x = (width - newWidth) / 2;
      const y = (height - newHeight) / 2;
      
      ctx.drawImage(image, x, y, newWidth, newHeight);
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    });
  }, []);

  const processImage = useCallback(async (file: File) => {
    setError(null);
    setIsProcessing(true);
    setDownloadReady(false);

    try {
      // Read file as data URL
      const reader = new FileReader();
      const readFile = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      
      reader.readAsDataURL(file);
      const dataUrl = await readFile;
      
      // Set original image for preview
      setOriginalImage(dataUrl);

      // Create image element to get dimensions
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });
      
      // Validate image size (minimum 16x16)
      if (img.width < 16 || img.height < 16) {
        throw new Error('이미지는 최소 16x16 픽셀 이상이어야 합니다.');
      }

      // Resize to all required sizes in parallel
      const sizes = [
        { name: '16' as const, width: 16, height: 16 },
        { name: '32' as const, width: 32, height: 32 },
        { name: '48' as const, width: 48, height: 48 },
        { name: '180' as const, width: 180, height: 180 },
        { name: '192' as const, width: 192, height: 192 },
        { name: '512' as const, width: 512, height: 512 }
      ] as const;

      const resizePromises = sizes.map(async ({ name, width, height }) => {
        const resized = await resizeImage(img, width, height);
        return { name, dataUrl: resized };
      });

      const results = await Promise.all(resizePromises);
      
      // Update resized images state
      const newResized: FaviconSizes = {
        16: null,
        32: null,
        48: null,
        180: null,
        192: null,
        512: null
      };
      
      results.forEach(({ name, dataUrl }) => {
        newResized[name] = dataUrl;
      });
      
      setResizedImages(newResized);
      setDownloadReady(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  }, [resizeImage]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    await processImage(file);
  }, [processImage]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    await processImage(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processImage]);

  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const createIcoFile = useCallback(async (): Promise<Blob | null> => {
    // ICO format: header + directory entries + image data
    // We'll create a proper multi-size ICO file with 16x16, 32x32, 48x48
    // This is a simplified implementation
    
    const icoDataUrls = [
      { size: 16, data: resizedImages[16] },
      { size: 32, data: resizedImages[32] },
      { size: 48, data: resizedImages[48] }
    ].filter(item => item.data !== null) as { size: number; data: string }[];

    if (icoDataUrls.length === 0) return null;

    try {
      // Create a canvas for each size and extract as PNG bytes
      const icoBuffers: Uint8Array[] = [];
      
      for (const item of icoDataUrls) {
        const response = await fetch(item.data);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        icoBuffers.push(new Uint8Array(arrayBuffer));
      }

      // Create a simple ICO header and directory
      // For simplicity, we'll use the 48x48 image as the main favicon.ico
      // A proper ICO would need more complex encoding
      const mainResponse = await fetch(icoDataUrls[icoDataUrls.length - 1].data);
      const mainBlob = await mainResponse.blob();
      const mainArrayBuffer = await mainBlob.arrayBuffer();
      
      return new Blob([mainArrayBuffer], { type: 'image/x-icon' });
    } catch (err) {
      console.error('ICO 생성 실패:', err);
      return null;
    }
  }, [resizedImages]);

  const downloadAsZip = useCallback(async () => {
    if (!downloadReady) return;

    try {
      const zip = new JSZip();
      
      // Add favicon.ico (using 48x48 as base, rename to .ico)
      if (resizedImages[48]) {
        const response = await fetch(resizedImages[48]);
        const blob = await response.blob();
        zip.file('favicon.ico', blob, { binary: true });
      }
      
      // Add PNG files
      if (resizedImages[16]) {
        const response = await fetch(resizedImages[16]);
        const blob = await response.blob();
        zip.file('favicon-16x16.png', blob, { binary: true });
      }
      if (resizedImages[32]) {
        const response = await fetch(resizedImages[32]);
        const blob = await response.blob();
        zip.file('favicon-32x32.png', blob, { binary: true });
      }
      if (resizedImages[180]) {
        const response = await fetch(resizedImages[180]);
        const blob = await response.blob();
        zip.file('apple-touch-icon.png', blob, { binary: true });
      }
      if (resizedImages[192]) {
        const response = await fetch(resizedImages[192]);
        const blob = await response.blob();
        zip.file('android-chrome-192x192.png', blob, { binary: true });
      }
      if (resizedImages[512]) {
        const response = await fetch(resizedImages[512]);
        const blob = await response.blob();
        zip.file('android-chrome-512x512.png', blob, { binary: true });
      }

      // Generate ZIP file
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Create download link
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `favicon-${new Date().getTime()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(url);
      
    } catch (err) {
      setError('ZIP 파일 생성 중 오류가 발생했습니다. JSZip 라이브러리가 로드되지 않았습니다.');
      console.error('ZIP 생성 실패:', err);
    }
  }, [downloadReady, resizedImages]);

  const downloadAllFiles = useCallback(() => {
    const timestamp = new Date().getTime();
    
    // Download each file individually
    const downloads = [
      { name: 'favicon.ico', data: resizedImages[48] || resizedImages[32] || resizedImages[16] },
      { name: 'favicon-16x16.png', data: resizedImages[16] },
      { name: 'favicon-32x32.png', data: resizedImages[32] },
      { name: 'apple-touch-icon.png', data: resizedImages[180] },
      { name: 'android-chrome-192x192.png', data: resizedImages[192] },
      { name: 'android-chrome-512x512.png', data: resizedImages[512] }
    ];

    downloads.forEach(download => {
      if (download.data) {
        const link = document.createElement('a');
        link.href = download.data;
        link.download = download.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  }, [resizedImages]);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#1E293B] border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-slate-100 mb-2">파비콘 만들기</h2>
        <p className="text-slate-400 text-sm">
          이미지를 드래그 앤 드랍하거나 클릭하여 업로드하세요. <br />
          자동으로 다양한 크기의 파비콘 이미지들이 생성됩니다.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-300">
          <span className="material-symbols-outlined text-red-400 mr-2">error</span>
          {error}
        </div>
      )}

      <div 
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 transition-all ${
          isDragging ? 'border-blue-500 bg-blue-900/20' : 'border-slate-700 bg-[#1E293B]'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        style={{ cursor: 'pointer' }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-slate-300">이미지 처리 중...</p>
          </div>
        ) : originalImage ? (
          <div className="flex flex-col items-center gap-4">
            <img 
              src={originalImage} 
              alt="Preview"
              className="max-w-full max-h-64 object-contain rounded"
            />
            <p className="text-slate-300">이미지가 업로드되었습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-6xl text-slate-500">upload</span>
            <p className="text-slate-400">이미지를 여기에 드래그 앤 드랍하세요</p>
            <p className="text-slate-500 text-sm">또는 클릭하여 파일 선택</p>
          </div>
        )}
      </div>

      {downloadReady && (
        <div className="bg-[#1E293B] border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">생성된 파비콘 미리보기</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-slate-400">16x16</span>
              {resizedImages[16] && (
                <img src={resizedImages[16]} alt="16x16" className="w-8 h-8 object-contain bg-slate-800 rounded p-1" />
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-slate-400">32x32</span>
              {resizedImages[32] && (
                <img src={resizedImages[32]} alt="32x32" className="w-8 h-8 object-contain bg-slate-800 rounded p-1" />
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-slate-400">48x48</span>
              {resizedImages[48] && (
                <img src={resizedImages[48]} alt="48x48" className="w-12 h-12 object-contain bg-slate-800 rounded p-1" />
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-slate-400">180x180</span>
              {resizedImages[180] && (
                <img src={resizedImages[180]} alt="180x180" className="w-16 h-16 object-contain bg-slate-800 rounded p-1" />
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-slate-400">192x192</span>
              {resizedImages[192] && (
                <img src={resizedImages[192]} alt="192x192" className="w-20 h-20 object-contain bg-slate-800 rounded p-1" />
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-slate-400">512x512</span>
              {resizedImages[512] && (
                <img src={resizedImages[512]} alt="512x512" className="w-24 h-24 object-contain bg-slate-800 rounded p-1" />
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={downloadAsZip}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
            >
              <span className="material-symbols-outlined">download</span>
              <span>모두 ZIP으로 다운로드</span>
            </button>
            <button
              onClick={downloadAllFiles}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
            >
              <span className="material-symbols-outlined">file_download</span>
              <span>개별 파일 다운로드</span>
            </button>
          </div>
        </div>
      )}

      {originalImage && !downloadReady && !isProcessing && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 text-yellow-300">
          <span className="material-symbols-outlined text-yellow-400 mr-2">info</span>
          이미지가 업로드되었지만, 파비콘 생성이 완료되지 않았습니다.
        </div>
      )}
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
import { useState } from 'react';
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
  const [isUtilsExpanded, setIsUtilsExpanded] = useState(false);

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

        <div className="mt-2">
          <button
            onClick={() => setIsUtilsExpanded(!isUtilsExpanded)}
            className={`flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition w-full ${
              activeTab === 'favicon'
                ? 'bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">build</span>
              {!isCollapsed && <span>Utils</span>}
            </div>
            {!isCollapsed && (
              <span className={`material-symbols-outlined transition-transform ${
                isUtilsExpanded ? 'rotate-90' : ''
              }`}>
                chevron_right
              </span>
            )}
          </button>

          {isUtilsExpanded && !isCollapsed && (
            <div className="pl-8">
              <button
                onClick={() => onSelectTab('favicon')}
                className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition w-full ${
                  activeTab === 'favicon'
                    ? 'bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]'
                    : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-lg">image</span>
                <span>파비콘 만들기</span>
              </button>
            </div>
          )}
        </div>
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

