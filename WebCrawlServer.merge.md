# Merged: WebCrawlServer

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
          logs={logs}
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WebCrawlServer basic</title>
    <!-- 구글 폰트 및 아이콘 CDN 추가로 레이아웃 깨짐 방지 -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap" />
  </head>
  <body>
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
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
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
// plugins/basic-plugin/vite.config.ts

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  // 빌드 타임에 전역 상수를 자바스크립트 문자열/숫자 리터럴로 직접 치환 주입
  define: {
    __POPUP_WIDTH__: Number(process.env.POPUP_WIDTH || 360),
    __POPUP_HEIGHT__: Number(process.env.POPUP_HEIGHT || 480),
    __POPUP_MIN_WIDTH__: Number(process.env.POPUP_MIN_WIDTH || 320),
    __POPUP_MIN_HEIGHT__: Number(process.env.POPUP_MIN_HEIGHT || 420),
    __POPUP_MAX_WIDTH__: Number(process.env.POPUP_MAX_WIDTH || 600),
    __POPUP_MAX_HEIGHT__: Number(process.env.POPUP_MAX_HEIGHT || 700),
    __SERVER_HOST__: JSON.stringify(process.env.SERVER_HOST || "localhost"),
    __SERVER_PORT__: Number(process.env.SERVER_PORT || 9600),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
        background: resolve(__dirname, "src/background.ts"),
        content: resolve(__dirname, "src/content.ts"),
      },
      output: {
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
    <script type="module" crossorigin src="/assets/index-lgslwEp3.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-JvtQOfKx.css">
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
  insertCrawlLog,
} from "./database.js";
import { logServerSystem, logAdminActivity, logPluginComm } from "./logger.js";

export type ClientType = "plugin" | "admin";

export interface ClientSession {
  socket: WebSocket;
  clientId: string;
  clientType: ClientType;
  connectedAt: Date;
}

export interface WebSocketMessage<T = unknown> {
  senderId: string;
  targetId?: string | "ALL";
  action: string;
  payload: T;
}

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
app.use(express.static(publicPath));

initializeDatabase();

export const activeClients = new Map<string, ClientSession>();

// [REST API 1] 등록된 모든 수집 클라이언트 장비 데이터 목록 및 실시간 온라인 상태 조회
app.get("/api/db/clients", (_req, res) => {
  try {
    const clients = getAllClients();
    // 실시간 인메모리 세션 맵과 대조하여 is_online 플래그 추가
    const clientsWithOnlineStatus = clients.map((c) => ({
      ...c,
      is_online:
        activeClients.has(c.client_id) &&
        activeClients.get(c.client_id)?.socket.readyState === WebSocket.OPEN,
    }));
    res.json({ success: true, data: clientsWithOnlineStatus });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logServerSystem("ERROR", `Clients API 에러 반환: ${errorMessage}`);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

// [REST API 2] 영구 적재된 수집 데이터 로그 조회 (최근 100개 한정)
app.get("/api/db/logs", (_req, res) => {
  try {
    const logs = getCrawlLogs(100, 0);
    res.json({ success: true, data: logs });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logServerSystem("ERROR", `Logs API 에러 반환: ${errorMessage}`);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

// [REST API 3] 데이터베이스 저장 로그 일괄 소거
app.delete("/api/db/logs", (_req, res) => {
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

const wss = new WebSocketServer({ server });

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
  is_online?: boolean; // 백엔드 실시간 소켓 가용 플래그
}

export interface CrawlLog {
  id: number;
  client_id: string;
  log_message: string;
  timestamp: number;
}

export interface WebSocketMessage<T = unknown> {
  senderId: string;
  targetId?: string | "ALL";
  action: string;
  payload: T;
}

export type ConnectionStatus = "CONNECTED" | "DISCONNECTED";

export type ActiveTab = "clients" | "console" | "logs" | "favicon";
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
    "activeTab",
    "alarms",
    "bookmarks",
    "browsingData",
    "clipboardRead",
    "clipboardWrite",
    "contextMenus",
    "cookies",
    "declarativeNetRequest",
    "downloads",
    "gcm",
    "geolocation",
    "history",
    "idle",
    "management",
    "notifications",
    "offscreen",
    "pageCapture",
    "power",
    "printerProvider",
    "privacy",
    "proxy",
    "scripting",
    "sessions",
    "storage",
    "system.cpu",
    "system.memory",
    "system.storage",
    "tabCapture",
    "tabs",
    "topSites",
    "tts",
    "ttsEngine",
    "webNavigation",
    "webRequest"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": [
        "<all_urls>"
      ],
      "js": [
        "content.js"
      ]
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  }
}
```

---

## plugins/basic-plugin/src/background.ts

```typescript
// plugins/basic-plugin/src/background.ts

import { PLUGIN_CONFIG, getWebSocketUrl } from "./config/pluginConfig.js";

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

// 빌드 주입 상수를 이용하여 서버 통신망 수립
async function connectToServer() {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  const clientId = await getOrCreateClientId();
  const wsUrl = getWebSocketUrl(clientId);

  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    const helloPacket = {
      senderId: clientId,
      targetId: "ALL",
      action: "CRAWL_LOG",
      payload: { system: "수집기 소켓 통신망 정상 안착 완료" },
    };
    socket?.send(JSON.stringify(helloPacket));
  };

  socket.onmessage = (event) => {
    try {
      const packet = JSON.parse(event.data);
      if (packet.action === "CRAWL_START") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          if (activeTab && activeTab.id) {
            chrome.tabs.sendMessage(activeTab.id, {
              command: "START_DOM_CRAWL",
              depth: packet.payload?.depth,
            });
          }
        });
      }
    } catch {
      // 오류 무시
    }
  };

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

chrome.runtime.onInstalled.addListener(() => {
  connectToServer();
});

chrome.runtime.onStartup.addListener(() => {
  connectToServer();
});

// 메시지 수신기: 선택적 비동기 응답 채널 제어
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // 1. 팝업에서 소켓 연결 상태 질의 시
  if (message.type === "GET_SOCKET_STATUS") {
    const isConnected = socket !== null && socket.readyState === WebSocket.OPEN;
    if (!isConnected) {
      connectToServer();
    }
    getOrCreateClientId().then((clientId) => {
      try {
        sendResponse({
          connected: isConnected,
          clientId: clientId,
          port: PLUGIN_CONFIG.server.port,
        });
      } catch {
        // 송신 측 채널이 이미 닫힌 경우 가드
      }
    });
    return true; // 이 분기에서만 비동기 응답을 위해 true 반환
  }

  // 2. DOM 수집 데이터 전송 요청 시
  if (message.type === "RAW_DOM_DATA") {
    if (socket && socket.readyState === WebSocket.OPEN) {
      getOrCreateClientId().then((clientId) => {
        const logPacket = {
          senderId: clientId,
          targetId: "ALL",
          action: "CRAWL_LOG",
          payload: message.data,
        };
        socket?.send(JSON.stringify(logPacket));
        try {
          sendResponse({ success: true });
        } catch {
          // 채널 닫힘 방어
        }
      });
    } else {
      connectToServer();
      try {
        sendResponse({ success: false, reason: "SOCKET_OFFLINE" });
      } catch {
        // 채널 닫힘 방어
      }
    }
    return true; // 이 분기에서만 비동기 응답을 위해 true 반환
  }

  // 기타 메시지는 비동기 대기하지 않고 동기 수용
  return false;
});
```

---

## plugins/basic-plugin/src/content.ts

```typescript
// plugins/basic-plugin/src/content.ts

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

// 백그라운드/팝업의 지시를 수신하여 현재 웹페이지의 DOM 및 메타데이터를 수집
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (messageCommandIsStart(request)) {
    const pageTitle = document.title;
    const hyperlinks: string[] = [];

    const anchors = document.querySelectorAll("a");
    anchors.forEach((a, idx) => {
      if (idx < 15 && a.href) hyperlinks.push(a.href);
    });

    chrome.runtime.sendMessage({
      type: "RAW_DOM_DATA",
      data: {
        url: window.location.href,
        title: pageTitle,
        links: hyperlinks,
        timestamp: Date.now(),
      },
    });
    return false; // 비동기 sendResponse가 필요 없으므로 false 반환
  }

  if (isContentMessage(request) && request.command === "COLLECT_FULL_DOM") {
    const fullDomHtml = document.documentElement.outerHTML;
    const domData = {
      url: window.location.href,
      title: document.title,
      fullDom: fullDomHtml,
      timestamp: Date.now(),
    };

    // 백그라운드로 전체 DOM 데이터 전달
    chrome.runtime.sendMessage({
      type: "RAW_DOM_DATA",
      data: domData,
    });

    // 동기식 즉시 응답 호출
    sendResponse({ success: true, data: domData });
    return false; // 동기적으로 이미 응답했으므로 false 반환
  }

  return false;
});
```

---

## plugins/basic-plugin/src/popup.css

```css
/* plugins/basic-plugin/src/popup.css */

@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

html, body {
  margin: 0;
  padding: 0;
  background-color: #0d131f;
  color: #f1f5f9;
  font-family: 'Noto Sans KR', sans-serif;
  overflow: hidden; /* 바깥 스크롤바 감추기 */
}

/* 마우스 크기 조절이 가능한 최상위 팝업 컨테이너 */
.popup-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background-color: #0d131f;
  box-sizing: border-box;

  /* 기본 동작 시 크기 지정 */
  width: 360px;
  height: 480px;

  /* 마우스 끌어서 크기 조절 가능 설정 */
  resize: both;
  overflow: auto;

  /* 최소 및 최대 크기 제한 */
  min-width: 320px;
  min-height: 420px;
  max-width: 600px;
  max-height: 700px;
}

/* 커스텀 리사이즈 핸들 커서 스타일 */
.popup-container::-webkit-resizer {
  background-color: #26334d;
  border-top-left-radius: 4px;
}

/* 1. 헤더 영역 */
.popup-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.popup-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.popup-title {
  font-size: 16px;
  font-weight: 800;
  color: #38bdf8;
  letter-spacing: -0.02em;
}

/* 2. 탭 스위칭 네비게이션 바 */
.tab-bar {
  display: flex;
  background-color: #162032;
  padding: 3px;
  border-radius: 8px;
  border: 1px solid #26334d;
  gap: 2px;
  flex-shrink: 0;
}

.tab-item {
  flex: 1;
  padding: 6px 0;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
}

.tab-item:hover {
  color: #f1f5f9;
}

.tab-item.active {
  background-color: #1d4ed8;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(29, 78, 216, 0.4);
}

/* 3. 탭 본문 컨테이너 (크기 조절 시 유연하게 확장) */
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  overflow-y: auto;
  padding-right: 2px;
}

/* 스크롤바 미세 스타일링 */
.tab-content::-webkit-scrollbar {
  width: 4px;
}

.tab-content::-webkit-scrollbar-thumb {
  background-color: #26334d;
  border-radius: 4px;
}

/* 상태 배지 카드 */
.status-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.status-card.online {
  background-color: rgba(6, 78, 59, 0.4);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
}

.status-card.offline {
  background-color: rgba(127, 29, 29, 0.3);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  flex-shrink: 0;
}

.status-dot.online {
  background-color: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.status-dot.offline {
  background-color: #ef4444;
}

/* URL 카드 */
.url-card {
  background-color: #162032;
  border: 1px solid #26334d;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.url-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}

.url-value {
  font-family: monospace;
  font-size: 11px;
  color: #e2e8f0;
  word-break: break-all;
  user-select: text;
  background-color: transparent;
  border: none;
  outline: none;
  width: 100%;
}

/* 정보 탭 전용 카드 */
.info-section {
  background-color: #162032;
  border: 1px solid #26334d;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.info-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #e2e8f0;
  border-b: 1px solid #26334d;
  padding-bottom: 6px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}

.info-key {
  color: #94a3b8;
  font-weight: 500;
}

.info-value {
  color: #f1f5f9;
  font-weight: 600;
  user-select: text;
}

.info-value-block {
  color: #cbd5e1;
  background-color: #0d131f;
  padding: 6px;
  border-radius: 6px;
  width: 100%;
  border: 1px solid #1e293b;
  user-select: text;
  box-sizing: border-box;
}

/* 디버깅 탭 카드 */
.debug-card {
  background-color: #162032;
  border: 1px solid #26334d;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.debug-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
}

.debug-textarea {
  width: 100%;
  flex: 1;
  min-height: 100px;
  background-color: #0d131f;
  border: 1px solid #26334d;
  border-radius: 8px;
  padding: 8px;
  color: #f1f5f9;
  font-size: 11px;
  outline: none;
  resize: vertical;
  user-select: text;
  box-sizing: border-box;
}

.debug-textarea:focus {
  border-color: #38bdf8;
}

/* 메인 전송 버튼 */
.send-button {
  width: 100%;
  background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  padding: 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(29, 78, 216, 0.3);
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}

.send-button:disabled {
  background: #1e293b;
  color: #64748b;
  box-shadow: none;
  cursor: not-allowed;
}

/* 4. 푸터 하단 정보 */
.popup-footer {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 10px;
  border-top: 1px solid #1e293b;
  font-size: 11px;
  flex-shrink: 0;
}

.footer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.footer-label {
  color: #64748b;
  font-weight: 600;
}

.footer-value {
  color: #38bdf8;
  font-weight: 600;
  user-select: text;
}
```

---

## plugins/basic-plugin/src/popup.tsx

```tsx
// plugins/basic-plugin/src/popup.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import './popup.css';

import { PLUGIN_CONFIG } from './config/pluginConfig';
import { usePopupState } from './hooks/usePopupState';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { Footer } from './components/Footer';
import { BasicTab } from './components/tabs/BasicTab';
import { InfoTab } from './components/tabs/InfoTab';
import { DebugTab } from './components/tabs/DebugTab';

export default function Popup() {
  const {
    activeTab,
    setActiveTab,
    clientId,
    currentUrl,
    isServerOnline,
    statusMessage,
    isSending,
    debugMessage,
    setDebugMessage,
    debugStatus,
    browserInfo,
    processorInfo,
    handleSendFullDom,
    handleSendDebugMessage
  } = usePopupState();

  const popupContainerStyle: React.CSSProperties = {
    width: `${PLUGIN_CONFIG.popup.width}px`,
    height: `${PLUGIN_CONFIG.popup.height}px`,
    minWidth: `${PLUGIN_CONFIG.popup.minWidth}px`,
    minHeight: `${PLUGIN_CONFIG.popup.minHeight}px`,
    maxWidth: `${PLUGIN_CONFIG.popup.maxWidth}px`,
    maxHeight: `${PLUGIN_CONFIG.popup.maxHeight}px`,
  };

  return (
    <div className="popup-container" style={popupContainerStyle}>
      <Header />
      <TabBar activeTab={activeTab} onSelectTab={setActiveTab} />

      {activeTab === 'basic' && (
        <BasicTab
          isServerOnline={isServerOnline}
          currentUrl={currentUrl}
          isSending={isSending}
          statusMessage={statusMessage}
          onSendFullDom={handleSendFullDom}
        />
      )}

      {activeTab === 'info' && (
        <InfoTab browserInfo={browserInfo} processorInfo={processorInfo} />
      )}

      {activeTab === 'debug' && (
        <DebugTab
          debugMessage={debugMessage}
          debugStatus={debugStatus}
          onChangeDebugMessage={setDebugMessage}
          onSendDebugMessage={handleSendDebugMessage}
        />
      )}

      <Footer clientId={clientId} />
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>
  );
}
```

---

## server/public/assets/index-JvtQOfKx.css

```css
@import"https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0";@import"https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap";*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.fixed{position:fixed}.absolute{position:absolute}.relative{position:relative}.inset-0{top:0;right:0;bottom:0;left:0}.inset-y-0{top:0;bottom:0}.left-0{left:0}.top-full{top:100%}.z-50{z-index:50}.col-span-full{grid-column:1 / -1}.mx-4{margin-left:1rem;margin-right:1rem}.mb-1{margin-bottom:.25rem}.mb-2{margin-bottom:.5rem}.mb-4{margin-bottom:1rem}.mb-6{margin-bottom:1.5rem}.ml-1{margin-left:.25rem}.mr-2{margin-right:.5rem}.mt-1{margin-top:.25rem}.mt-2{margin-top:.5rem}.mt-3{margin-top:.75rem}.block{display:block}.flex{display:flex}.inline-flex{display:inline-flex}.table{display:table}.grid{display:grid}.hidden{display:none}.h-12{height:3rem}.h-14{height:3.5rem}.h-16{height:4rem}.h-2{height:.5rem}.h-2\.5{height:.625rem}.h-20{height:5rem}.h-24{height:6rem}.h-8{height:2rem}.h-\[38px\]{height:38px}.h-\[54px\]{height:54px}.max-h-64{max-height:16rem}.max-h-\[400px\]{max-height:400px}.max-h-\[600px\]{max-height:600px}.max-h-\[640px\]{max-height:640px}.max-h-\[85vh\]{max-height:85vh}.min-h-screen{min-height:100vh}.w-10{width:2.5rem}.w-12{width:3rem}.w-16{width:4rem}.w-2{width:.5rem}.w-2\.5{width:.625rem}.w-20{width:5rem}.w-24{width:6rem}.w-60{width:15rem}.w-64{width:16rem}.w-8{width:2rem}.w-full{width:100%}.max-w-4xl{max-width:56rem}.max-w-5xl{max-width:64rem}.max-w-\[300px\]{max-width:300px}.max-w-full{max-width:100%}.max-w-md{max-width:28rem}.flex-1{flex:1 1 0%}.border-collapse{border-collapse:collapse}.rotate-90{--tw-rotate: 90deg;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}@keyframes pulse{50%{opacity:.5}}.animate-pulse{animation:pulse 2s cubic-bezier(.4,0,.6,1) infinite}@keyframes spin{to{transform:rotate(360deg)}}.animate-spin{animation:spin 1s linear infinite}.cursor-pointer{cursor:pointer}.select-none{-webkit-user-select:none;-moz-user-select:none;user-select:none}.select-text{-webkit-user-select:text;-moz-user-select:text;user-select:text}.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.flex-col{flex-direction:column}.items-end{align-items:flex-end}.items-center{align-items:center}.items-baseline{align-items:baseline}.justify-end{justify-content:flex-end}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.gap-1{gap:.25rem}.gap-1\.5{gap:.375rem}.gap-2{gap:.5rem}.gap-3{gap:.75rem}.gap-4{gap:1rem}.gap-5{gap:1.25rem}.gap-6{gap:1.5rem}.divide-y>:not([hidden])~:not([hidden]){--tw-divide-y-reverse: 0;border-top-width:calc(1px * calc(1 - var(--tw-divide-y-reverse)));border-bottom-width:calc(1px * var(--tw-divide-y-reverse))}.divide-gray-800>:not([hidden])~:not([hidden]){--tw-divide-opacity: 1;border-color:rgb(31 41 55 / var(--tw-divide-opacity, 1))}.overflow-hidden{overflow:hidden}.overflow-x-auto{overflow-x:auto}.overflow-y-auto{overflow-y:auto}.truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.whitespace-pre-wrap{white-space:pre-wrap}.break-words{overflow-wrap:break-word}.break-all{word-break:break-all}.rounded{border-radius:.25rem}.rounded-2xl{border-radius:1rem}.rounded-full{border-radius:9999px}.rounded-lg{border-radius:.5rem}.rounded-xl{border-radius:.75rem}.border{border-width:1px}.border-2{border-width:2px}.border-4{border-width:4px}.border-b{border-bottom-width:1px}.border-l-4{border-left-width:4px}.border-r{border-right-width:1px}.border-t{border-top-width:1px}.border-dashed{border-style:dashed}.border-\[\#1A73E8\]{--tw-border-opacity: 1;border-color:rgb(26 115 232 / var(--tw-border-opacity, 1))}.border-blue-300\/20{border-color:#93c5fd33}.border-blue-500{--tw-border-opacity: 1;border-color:rgb(59 130 246 / var(--tw-border-opacity, 1))}.border-emerald-700\/40{border-color:#04785766}.border-gray-700{--tw-border-opacity: 1;border-color:rgb(55 65 81 / var(--tw-border-opacity, 1))}.border-gray-800{--tw-border-opacity: 1;border-color:rgb(31 41 55 / var(--tw-border-opacity, 1))}.border-red-700{--tw-border-opacity: 1;border-color:rgb(185 28 28 / var(--tw-border-opacity, 1))}.border-red-700\/30{border-color:#b91c1c4d}.border-red-800{--tw-border-opacity: 1;border-color:rgb(153 27 27 / var(--tw-border-opacity, 1))}.border-slate-700{--tw-border-opacity: 1;border-color:rgb(51 65 85 / var(--tw-border-opacity, 1))}.border-slate-800{--tw-border-opacity: 1;border-color:rgb(30 41 59 / var(--tw-border-opacity, 1))}.border-yellow-500{--tw-border-opacity: 1;border-color:rgb(234 179 8 / var(--tw-border-opacity, 1))}.border-yellow-700{--tw-border-opacity: 1;border-color:rgb(161 98 7 / var(--tw-border-opacity, 1))}.border-t-transparent{border-top-color:transparent}.bg-\[\#0F172A\]{--tw-bg-opacity: 1;background-color:rgb(15 23 42 / var(--tw-bg-opacity, 1))}.bg-\[\#111827\]{--tw-bg-opacity: 1;background-color:rgb(17 24 39 / var(--tw-bg-opacity, 1))}.bg-\[\#141A23\]{--tw-bg-opacity: 1;background-color:rgb(20 26 35 / var(--tw-bg-opacity, 1))}.bg-\[\#161C27\]{--tw-bg-opacity: 1;background-color:rgb(22 28 39 / var(--tw-bg-opacity, 1))}.bg-\[\#1A73E8\]{--tw-bg-opacity: 1;background-color:rgb(26 115 232 / var(--tw-bg-opacity, 1))}.bg-\[\#1E293B\]{--tw-bg-opacity: 1;background-color:rgb(30 41 59 / var(--tw-bg-opacity, 1))}.bg-\[\#202124\]{--tw-bg-opacity: 1;background-color:rgb(32 33 36 / var(--tw-bg-opacity, 1))}.bg-\[\#28292c\]{--tw-bg-opacity: 1;background-color:rgb(40 41 44 / var(--tw-bg-opacity, 1))}.bg-black\/70{background-color:#000000b3}.bg-blue-600{--tw-bg-opacity: 1;background-color:rgb(37 99 235 / var(--tw-bg-opacity, 1))}.bg-blue-900\/20{background-color:#1e3a8a33}.bg-blue-950{--tw-bg-opacity: 1;background-color:rgb(23 37 84 / var(--tw-bg-opacity, 1))}.bg-emerald-300{--tw-bg-opacity: 1;background-color:rgb(110 231 183 / var(--tw-bg-opacity, 1))}.bg-emerald-400{--tw-bg-opacity: 1;background-color:rgb(52 211 153 / var(--tw-bg-opacity, 1))}.bg-emerald-900\/40{background-color:#064e3b66}.bg-gray-800{--tw-bg-opacity: 1;background-color:rgb(31 41 55 / var(--tw-bg-opacity, 1))}.bg-gray-900{--tw-bg-opacity: 1;background-color:rgb(17 24 39 / var(--tw-bg-opacity, 1))}.bg-gray-950{--tw-bg-opacity: 1;background-color:rgb(3 7 18 / var(--tw-bg-opacity, 1))}.bg-green-500{--tw-bg-opacity: 1;background-color:rgb(34 197 94 / var(--tw-bg-opacity, 1))}.bg-green-600{--tw-bg-opacity: 1;background-color:rgb(22 163 74 / var(--tw-bg-opacity, 1))}.bg-red-500{--tw-bg-opacity: 1;background-color:rgb(239 68 68 / var(--tw-bg-opacity, 1))}.bg-red-700\/20{background-color:#b91c1c33}.bg-red-900\/50{background-color:#7f1d1d80}.bg-red-900\/60{background-color:#7f1d1d99}.bg-rose-300{--tw-bg-opacity: 1;background-color:rgb(253 164 175 / var(--tw-bg-opacity, 1))}.bg-slate-500{--tw-bg-opacity: 1;background-color:rgb(100 116 139 / var(--tw-bg-opacity, 1))}.bg-slate-700{--tw-bg-opacity: 1;background-color:rgb(51 65 85 / var(--tw-bg-opacity, 1))}.bg-slate-800{--tw-bg-opacity: 1;background-color:rgb(30 41 59 / var(--tw-bg-opacity, 1))}.bg-slate-900\/70{background-color:#0f172ab3}.bg-slate-900\/80{background-color:#0f172acc}.bg-yellow-900\/30{background-color:#713f124d}.object-contain{-o-object-fit:contain;object-fit:contain}.p-1{padding:.25rem}.p-2{padding:.5rem}.p-3{padding:.75rem}.p-4{padding:1rem}.p-5{padding:1.25rem}.p-6{padding:1.5rem}.p-8{padding:2rem}.px-1\.5{padding-left:.375rem;padding-right:.375rem}.px-2{padding-left:.5rem;padding-right:.5rem}.px-2\.5{padding-left:.625rem;padding-right:.625rem}.px-3{padding-left:.75rem;padding-right:.75rem}.px-4{padding-left:1rem;padding-right:1rem}.px-5{padding-left:1.25rem;padding-right:1.25rem}.px-6{padding-left:1.5rem;padding-right:1.5rem}.py-0\.5{padding-top:.125rem;padding-bottom:.125rem}.py-1{padding-top:.25rem;padding-bottom:.25rem}.py-1\.5{padding-top:.375rem;padding-bottom:.375rem}.py-2{padding-top:.5rem;padding-bottom:.5rem}.py-20{padding-top:5rem;padding-bottom:5rem}.py-3{padding-top:.75rem;padding-bottom:.75rem}.py-4{padding-top:1rem;padding-bottom:1rem}.pb-2{padding-bottom:.5rem}.pl-11{padding-left:2.75rem}.pl-3{padding-left:.75rem}.pl-8{padding-left:2rem}.pr-3{padding-right:.75rem}.text-left{text-align:left}.text-center{text-align:center}.text-right{text-align:right}.font-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace}.font-sans{font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji"}.text-2xl{font-size:1.5rem;line-height:2rem}.text-6xl{font-size:3.75rem;line-height:1}.text-\[10px\]{font-size:10px}.text-\[11px\]{font-size:11px}.text-\[12px\]{font-size:12px}.text-base{font-size:1rem;line-height:1.5rem}.text-lg{font-size:1.125rem;line-height:1.75rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-xs{font-size:.75rem;line-height:1rem}.font-black{font-weight:900}.font-bold{font-weight:700}.font-medium{font-weight:500}.font-semibold{font-weight:600}.uppercase{text-transform:uppercase}.leading-relaxed{line-height:1.625}.tracking-tight{letter-spacing:-.025em}.tracking-wide{letter-spacing:.025em}.tracking-wider{letter-spacing:.05em}.text-\[\#1A73E8\]{--tw-text-opacity: 1;color:rgb(26 115 232 / var(--tw-text-opacity, 1))}.text-blue-300{--tw-text-opacity: 1;color:rgb(147 197 253 / var(--tw-text-opacity, 1))}.text-blue-400{--tw-text-opacity: 1;color:rgb(96 165 250 / var(--tw-text-opacity, 1))}.text-emerald-300{--tw-text-opacity: 1;color:rgb(110 231 183 / var(--tw-text-opacity, 1))}.text-emerald-400{--tw-text-opacity: 1;color:rgb(52 211 153 / var(--tw-text-opacity, 1))}.text-gray-100{--tw-text-opacity: 1;color:rgb(243 244 246 / var(--tw-text-opacity, 1))}.text-gray-200{--tw-text-opacity: 1;color:rgb(229 231 235 / var(--tw-text-opacity, 1))}.text-gray-300{--tw-text-opacity: 1;color:rgb(209 213 219 / var(--tw-text-opacity, 1))}.text-gray-400{--tw-text-opacity: 1;color:rgb(156 163 175 / var(--tw-text-opacity, 1))}.text-gray-500{--tw-text-opacity: 1;color:rgb(107 114 128 / var(--tw-text-opacity, 1))}.text-green-400{--tw-text-opacity: 1;color:rgb(74 222 128 / var(--tw-text-opacity, 1))}.text-red-200{--tw-text-opacity: 1;color:rgb(254 202 202 / var(--tw-text-opacity, 1))}.text-red-300{--tw-text-opacity: 1;color:rgb(252 165 165 / var(--tw-text-opacity, 1))}.text-red-400{--tw-text-opacity: 1;color:rgb(248 113 113 / var(--tw-text-opacity, 1))}.text-slate-100{--tw-text-opacity: 1;color:rgb(241 245 249 / var(--tw-text-opacity, 1))}.text-slate-200{--tw-text-opacity: 1;color:rgb(226 232 240 / var(--tw-text-opacity, 1))}.text-slate-300{--tw-text-opacity: 1;color:rgb(203 213 225 / var(--tw-text-opacity, 1))}.text-slate-400{--tw-text-opacity: 1;color:rgb(148 163 184 / var(--tw-text-opacity, 1))}.text-slate-500{--tw-text-opacity: 1;color:rgb(100 116 139 / var(--tw-text-opacity, 1))}.text-white{--tw-text-opacity: 1;color:rgb(255 255 255 / var(--tw-text-opacity, 1))}.text-yellow-100{--tw-text-opacity: 1;color:rgb(254 249 195 / var(--tw-text-opacity, 1))}.text-yellow-300{--tw-text-opacity: 1;color:rgb(253 224 71 / var(--tw-text-opacity, 1))}.text-yellow-400{--tw-text-opacity: 1;color:rgb(250 204 21 / var(--tw-text-opacity, 1))}.placeholder-slate-500::-moz-placeholder{--tw-placeholder-opacity: 1;color:rgb(100 116 139 / var(--tw-placeholder-opacity, 1))}.placeholder-slate-500::placeholder{--tw-placeholder-opacity: 1;color:rgb(100 116 139 / var(--tw-placeholder-opacity, 1))}.shadow-2xl{--tw-shadow: 0 25px 50px -12px rgb(0 0 0 / .25);--tw-shadow-colored: 0 25px 50px -12px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.shadow-lg{--tw-shadow: 0 10px 15px -3px rgb(0 0 0 / .1), 0 4px 6px -4px rgb(0 0 0 / .1);--tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.shadow-sm{--tw-shadow: 0 1px 2px 0 rgb(0 0 0 / .05);--tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.outline-none{outline:2px solid transparent;outline-offset:2px}.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.backdrop-blur-sm{--tw-backdrop-blur: blur(4px);-webkit-backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia)}.transition{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-all{transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-transform{transition-property:transform;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.duration-200{transition-duration:.2s}:root{color-scheme:dark}html{font-family:Noto Sans KR,sans-serif;background-color:#141a23}body{margin:0;min-height:100vh;background-color:#141a23;color:#e8eaed}*{box-sizing:border-box}.hover\:bg-\[\#185abc\]:hover{--tw-bg-opacity: 1;background-color:rgb(24 90 188 / var(--tw-bg-opacity, 1))}.hover\:bg-\[\#2d2e31\]:hover{--tw-bg-opacity: 1;background-color:rgb(45 46 49 / var(--tw-bg-opacity, 1))}.hover\:bg-blue-600\/90:hover{background-color:#2563ebe6}.hover\:bg-blue-700:hover{--tw-bg-opacity: 1;background-color:rgb(29 78 216 / var(--tw-bg-opacity, 1))}.hover\:bg-gray-700:hover{--tw-bg-opacity: 1;background-color:rgb(55 65 81 / var(--tw-bg-opacity, 1))}.hover\:bg-gray-800:hover{--tw-bg-opacity: 1;background-color:rgb(31 41 55 / var(--tw-bg-opacity, 1))}.hover\:bg-green-700:hover{--tw-bg-opacity: 1;background-color:rgb(21 128 61 / var(--tw-bg-opacity, 1))}.hover\:bg-red-700\/30:hover{background-color:#b91c1c4d}.hover\:bg-red-800:hover{--tw-bg-opacity: 1;background-color:rgb(153 27 27 / var(--tw-bg-opacity, 1))}.hover\:bg-slate-600:hover{--tw-bg-opacity: 1;background-color:rgb(71 85 105 / var(--tw-bg-opacity, 1))}.hover\:bg-slate-700:hover{--tw-bg-opacity: 1;background-color:rgb(51 65 85 / var(--tw-bg-opacity, 1))}.hover\:bg-slate-800:hover{--tw-bg-opacity: 1;background-color:rgb(30 41 59 / var(--tw-bg-opacity, 1))}.hover\:bg-slate-900:hover{--tw-bg-opacity: 1;background-color:rgb(15 23 42 / var(--tw-bg-opacity, 1))}.hover\:text-gray-200:hover{--tw-text-opacity: 1;color:rgb(229 231 235 / var(--tw-text-opacity, 1))}.hover\:text-white:hover{--tw-text-opacity: 1;color:rgb(255 255 255 / var(--tw-text-opacity, 1))}.hover\:underline:hover{text-decoration-line:underline}.focus\:border-\[\#1A73E8\]:focus{--tw-border-opacity: 1;border-color:rgb(26 115 232 / var(--tw-border-opacity, 1))}.focus\:ring-2:focus{--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)}.focus\:ring-\[\#1A73E8\]\/20:focus{--tw-ring-color: rgb(26 115 232 / .2)}@media (min-width: 640px){.sm\:flex-row{flex-direction:row}.sm\:items-start{align-items:flex-start}.sm\:items-center{align-items:center}.sm\:justify-between{justify-content:space-between}}@media (min-width: 768px){.md\:flex{display:flex}.md\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.md\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}}@media (min-width: 1024px){.lg\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.lg\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}.lg\:grid-cols-6{grid-template-columns:repeat(6,minmax(0,1fr))}}
```

---

## server/public/assets/index-lgslwEp3.js

```javascript
(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))l(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const u of i.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&l(u)}).observe(document,{childList:!0,subtree:!0});function a(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function l(n){if(n.ep)return;n.ep=!0;const i=a(n);fetch(n.href,i)}})();var Vn=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function tr(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var Uf={exports:{}},eu={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Zh=Symbol.for("react.transitional.element"),Yh=Symbol.for("react.fragment");function Mf(t,e,a){var l=null;if(a!==void 0&&(l=""+a),e.key!==void 0&&(l=""+e.key),"key"in e){a={};for(var n in e)n!=="key"&&(a[n]=e[n])}else a=e;return e=a.ref,{$$typeof:Zh,type:t,key:l,ref:e!==void 0?e:null,props:a}}eu.Fragment=Yh;eu.jsx=Mf;eu.jsxs=Mf;Uf.exports=eu;var E=Uf.exports,Rf={exports:{}},nt={};/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var er=Symbol.for("react.transitional.element"),Gh=Symbol.for("react.portal"),qh=Symbol.for("react.fragment"),Xh=Symbol.for("react.strict_mode"),Qh=Symbol.for("react.profiler"),Vh=Symbol.for("react.consumer"),Kh=Symbol.for("react.context"),Jh=Symbol.for("react.forward_ref"),Wh=Symbol.for("react.suspense"),Fh=Symbol.for("react.memo"),Bf=Symbol.for("react.lazy"),$h=Symbol.for("react.activity"),nc=Symbol.iterator;function Ih(t){return t===null||typeof t!="object"?null:(t=nc&&t[nc]||t["@@iterator"],typeof t=="function"?t:null)}var Hf={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},kf=Object.assign,Lf={};function Ml(t,e,a){this.props=t,this.context=e,this.refs=Lf,this.updater=a||Hf}Ml.prototype.isReactComponent={};Ml.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};Ml.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function Zf(){}Zf.prototype=Ml.prototype;function ar(t,e,a){this.props=t,this.context=e,this.refs=Lf,this.updater=a||Hf}var lr=ar.prototype=new Zf;lr.constructor=ar;kf(lr,Ml.prototype);lr.isPureReactComponent=!0;var ic=Array.isArray;function ns(){}var At={H:null,A:null,T:null,S:null},Yf=Object.prototype.hasOwnProperty;function nr(t,e,a){var l=a.ref;return{$$typeof:er,type:t,key:e,ref:l!==void 0?l:null,props:a}}function Ph(t,e){return nr(t.type,e,t.props)}function ir(t){return typeof t=="object"&&t!==null&&t.$$typeof===er}function tm(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(a){return e[a]})}var uc=/\/+/g;function xu(t,e){return typeof t=="object"&&t!==null&&t.key!=null?tm(""+t.key):e.toString(36)}function em(t){switch(t.status){case"fulfilled":return t.value;case"rejected":throw t.reason;default:switch(typeof t.status=="string"?t.then(ns,ns):(t.status="pending",t.then(function(e){t.status==="pending"&&(t.status="fulfilled",t.value=e)},function(e){t.status==="pending"&&(t.status="rejected",t.reason=e)})),t.status){case"fulfilled":return t.value;case"rejected":throw t.reason}}throw t}function el(t,e,a,l,n){var i=typeof t;(i==="undefined"||i==="boolean")&&(t=null);var u=!1;if(t===null)u=!0;else switch(i){case"bigint":case"string":case"number":u=!0;break;case"object":switch(t.$$typeof){case er:case Gh:u=!0;break;case Bf:return u=t._init,el(u(t._payload),e,a,l,n)}}if(u)return n=n(t),u=l===""?"."+xu(t,0):l,ic(n)?(a="",u!=null&&(a=u.replace(uc,"$&/")+"/"),el(n,e,a,"",function(h){return h})):n!=null&&(ir(n)&&(n=Ph(n,a+(n.key==null||t&&t.key===n.key?"":(""+n.key).replace(uc,"$&/")+"/")+u)),e.push(n)),1;u=0;var s=l===""?".":l+":";if(ic(t))for(var r=0;r<t.length;r++)l=t[r],i=s+xu(l,r),u+=el(l,e,a,i,n);else if(r=Ih(t),typeof r=="function")for(t=r.call(t),r=0;!(l=t.next()).done;)l=l.value,i=s+xu(l,r++),u+=el(l,e,a,i,n);else if(i==="object"){if(typeof t.then=="function")return el(em(t),e,a,l,n);throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.")}return u}function Kn(t,e,a){if(t==null)return t;var l=[],n=0;return el(t,l,"","",function(i){return e.call(a,i,n++)}),l}function am(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(a){(t._status===0||t._status===-1)&&(t._status=1,t._result=a)},function(a){(t._status===0||t._status===-1)&&(t._status=2,t._result=a)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var sc=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},lm={map:Kn,forEach:function(t,e,a){Kn(t,function(){e.apply(this,arguments)},a)},count:function(t){var e=0;return Kn(t,function(){e++}),e},toArray:function(t){return Kn(t,function(e){return e})||[]},only:function(t){if(!ir(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};nt.Activity=$h;nt.Children=lm;nt.Component=Ml;nt.Fragment=qh;nt.Profiler=Qh;nt.PureComponent=ar;nt.StrictMode=Xh;nt.Suspense=Wh;nt.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=At;nt.__COMPILER_RUNTIME={__proto__:null,c:function(t){return At.H.useMemoCache(t)}};nt.cache=function(t){return function(){return t.apply(null,arguments)}};nt.cacheSignal=function(){return null};nt.cloneElement=function(t,e,a){if(t==null)throw Error("The argument must be a React element, but you passed "+t+".");var l=kf({},t.props),n=t.key;if(e!=null)for(i in e.key!==void 0&&(n=""+e.key),e)!Yf.call(e,i)||i==="key"||i==="__self"||i==="__source"||i==="ref"&&e.ref===void 0||(l[i]=e[i]);var i=arguments.length-2;if(i===1)l.children=a;else if(1<i){for(var u=Array(i),s=0;s<i;s++)u[s]=arguments[s+2];l.children=u}return nr(t.type,n,l)};nt.createContext=function(t){return t={$$typeof:Kh,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null},t.Provider=t,t.Consumer={$$typeof:Vh,_context:t},t};nt.createElement=function(t,e,a){var l,n={},i=null;if(e!=null)for(l in e.key!==void 0&&(i=""+e.key),e)Yf.call(e,l)&&l!=="key"&&l!=="__self"&&l!=="__source"&&(n[l]=e[l]);var u=arguments.length-2;if(u===1)n.children=a;else if(1<u){for(var s=Array(u),r=0;r<u;r++)s[r]=arguments[r+2];n.children=s}if(t&&t.defaultProps)for(l in u=t.defaultProps,u)n[l]===void 0&&(n[l]=u[l]);return nr(t,i,n)};nt.createRef=function(){return{current:null}};nt.forwardRef=function(t){return{$$typeof:Jh,render:t}};nt.isValidElement=ir;nt.lazy=function(t){return{$$typeof:Bf,_payload:{_status:-1,_result:t},_init:am}};nt.memo=function(t,e){return{$$typeof:Fh,type:t,compare:e===void 0?null:e}};nt.startTransition=function(t){var e=At.T,a={};At.T=a;try{var l=t(),n=At.S;n!==null&&n(a,l),typeof l=="object"&&l!==null&&typeof l.then=="function"&&l.then(ns,sc)}catch(i){sc(i)}finally{e!==null&&a.types!==null&&(e.types=a.types),At.T=e}};nt.unstable_useCacheRefresh=function(){return At.H.useCacheRefresh()};nt.use=function(t){return At.H.use(t)};nt.useActionState=function(t,e,a){return At.H.useActionState(t,e,a)};nt.useCallback=function(t,e){return At.H.useCallback(t,e)};nt.useContext=function(t){return At.H.useContext(t)};nt.useDebugValue=function(){};nt.useDeferredValue=function(t,e){return At.H.useDeferredValue(t,e)};nt.useEffect=function(t,e){return At.H.useEffect(t,e)};nt.useEffectEvent=function(t){return At.H.useEffectEvent(t)};nt.useId=function(){return At.H.useId()};nt.useImperativeHandle=function(t,e,a){return At.H.useImperativeHandle(t,e,a)};nt.useInsertionEffect=function(t,e){return At.H.useInsertionEffect(t,e)};nt.useLayoutEffect=function(t,e){return At.H.useLayoutEffect(t,e)};nt.useMemo=function(t,e){return At.H.useMemo(t,e)};nt.useOptimistic=function(t,e){return At.H.useOptimistic(t,e)};nt.useReducer=function(t,e,a){return At.H.useReducer(t,e,a)};nt.useRef=function(t){return At.H.useRef(t)};nt.useState=function(t){return At.H.useState(t)};nt.useSyncExternalStore=function(t,e,a){return At.H.useSyncExternalStore(t,e,a)};nt.useTransition=function(){return At.H.useTransition()};nt.version="19.2.8";Rf.exports=nt;var it=Rf.exports;const nm=tr(it);var Gf={exports:{}},au={},qf={exports:{}},Xf={};/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(t){function e(Y,R){var $=Y.length;Y.push(R);t:for(;0<$;){var X=$-1>>>1,tt=Y[X];if(0<n(tt,R))Y[X]=R,Y[$]=tt,$=X;else break t}}function a(Y){return Y.length===0?null:Y[0]}function l(Y){if(Y.length===0)return null;var R=Y[0],$=Y.pop();if($!==R){Y[0]=$;t:for(var X=0,tt=Y.length,B=tt>>>1;X<B;){var U=2*(X+1)-1,et=Y[U],I=U+1,W=Y[I];if(0>n(et,$))I<tt&&0>n(W,et)?(Y[X]=W,Y[I]=$,X=I):(Y[X]=et,Y[U]=$,X=U);else if(I<tt&&0>n(W,$))Y[X]=W,Y[I]=$,X=I;else break t}}return R}function n(Y,R){var $=Y.sortIndex-R.sortIndex;return $!==0?$:Y.id-R.id}if(t.unstable_now=void 0,typeof performance=="object"&&typeof performance.now=="function"){var i=performance;t.unstable_now=function(){return i.now()}}else{var u=Date,s=u.now();t.unstable_now=function(){return u.now()-s}}var r=[],h=[],b=1,y=null,m=3,o=!1,_=!1,v=!1,x=!1,c=typeof setTimeout=="function"?setTimeout:null,d=typeof clearTimeout=="function"?clearTimeout:null,g=typeof setImmediate<"u"?setImmediate:null;function S(Y){for(var R=a(h);R!==null;){if(R.callback===null)l(h);else if(R.startTime<=Y)l(h),R.sortIndex=R.expirationTime,e(r,R);else break;R=a(h)}}function N(Y){if(v=!1,S(Y),!_)if(a(r)!==null)_=!0,M||(M=!0,T());else{var R=a(h);R!==null&&Z(N,R.startTime-Y)}}var M=!1,w=-1,j=5,O=-1;function k(){return x?!0:!(t.unstable_now()-O<j)}function F(){if(x=!1,M){var Y=t.unstable_now();O=Y;var R=!0;try{t:{_=!1,v&&(v=!1,d(w),w=-1),o=!0;var $=m;try{e:{for(S(Y),y=a(r);y!==null&&!(y.expirationTime>Y&&k());){var X=y.callback;if(typeof X=="function"){y.callback=null,m=y.priorityLevel;var tt=X(y.expirationTime<=Y);if(Y=t.unstable_now(),typeof tt=="function"){y.callback=tt,S(Y),R=!0;break e}y===a(r)&&l(r),S(Y)}else l(r);y=a(r)}if(y!==null)R=!0;else{var B=a(h);B!==null&&Z(N,B.startTime-Y),R=!1}}break t}finally{y=null,m=$,o=!1}R=void 0}}finally{R?T():M=!1}}}var T;if(typeof g=="function")T=function(){g(F)};else if(typeof MessageChannel<"u"){var L=new MessageChannel,p=L.port2;L.port1.onmessage=F,T=function(){p.postMessage(null)}}else T=function(){c(F,0)};function Z(Y,R){w=c(function(){Y(t.unstable_now())},R)}t.unstable_IdlePriority=5,t.unstable_ImmediatePriority=1,t.unstable_LowPriority=4,t.unstable_NormalPriority=3,t.unstable_Profiling=null,t.unstable_UserBlockingPriority=2,t.unstable_cancelCallback=function(Y){Y.callback=null},t.unstable_forceFrameRate=function(Y){0>Y||125<Y?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):j=0<Y?Math.floor(1e3/Y):5},t.unstable_getCurrentPriorityLevel=function(){return m},t.unstable_next=function(Y){switch(m){case 1:case 2:case 3:var R=3;break;default:R=m}var $=m;m=R;try{return Y()}finally{m=$}},t.unstable_requestPaint=function(){x=!0},t.unstable_runWithPriority=function(Y,R){switch(Y){case 1:case 2:case 3:case 4:case 5:break;default:Y=3}var $=m;m=Y;try{return R()}finally{m=$}},t.unstable_scheduleCallback=function(Y,R,$){var X=t.unstable_now();switch(typeof $=="object"&&$!==null?($=$.delay,$=typeof $=="number"&&0<$?X+$:X):$=X,Y){case 1:var tt=-1;break;case 2:tt=250;break;case 5:tt=1073741823;break;case 4:tt=1e4;break;default:tt=5e3}return tt=$+tt,Y={id:b++,callback:R,priorityLevel:Y,startTime:$,expirationTime:tt,sortIndex:-1},$>X?(Y.sortIndex=$,e(h,Y),a(r)===null&&Y===a(h)&&(v?(d(w),w=-1):v=!0,Z(N,$-X))):(Y.sortIndex=tt,e(r,Y),_||o||(_=!0,M||(M=!0,T()))),Y},t.unstable_shouldYield=k,t.unstable_wrapCallback=function(Y){var R=m;return function(){var $=m;m=R;try{return Y.apply(this,arguments)}finally{m=$}}}})(Xf);qf.exports=Xf;var im=qf.exports,Qf={exports:{}},Pt={};/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var um=it;function Vf(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)e+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function ua(){}var It={d:{f:ua,r:function(){throw Error(Vf(522))},D:ua,C:ua,L:ua,m:ua,X:ua,S:ua,M:ua},p:0,findDOMNode:null},sm=Symbol.for("react.portal");function rm(t,e,a){var l=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:sm,key:l==null?null:""+l,children:t,containerInfo:e,implementation:a}}var ln=um.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function lu(t,e){if(t==="font")return"";if(typeof e=="string")return e==="use-credentials"?e:""}Pt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=It;Pt.createPortal=function(t,e){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)throw Error(Vf(299));return rm(t,e,null,a)};Pt.flushSync=function(t){var e=ln.T,a=It.p;try{if(ln.T=null,It.p=2,t)return t()}finally{ln.T=e,It.p=a,It.d.f()}};Pt.preconnect=function(t,e){typeof t=="string"&&(e?(e=e.crossOrigin,e=typeof e=="string"?e==="use-credentials"?e:"":void 0):e=null,It.d.C(t,e))};Pt.prefetchDNS=function(t){typeof t=="string"&&It.d.D(t)};Pt.preinit=function(t,e){if(typeof t=="string"&&e&&typeof e.as=="string"){var a=e.as,l=lu(a,e.crossOrigin),n=typeof e.integrity=="string"?e.integrity:void 0,i=typeof e.fetchPriority=="string"?e.fetchPriority:void 0;a==="style"?It.d.S(t,typeof e.precedence=="string"?e.precedence:void 0,{crossOrigin:l,integrity:n,fetchPriority:i}):a==="script"&&It.d.X(t,{crossOrigin:l,integrity:n,fetchPriority:i,nonce:typeof e.nonce=="string"?e.nonce:void 0})}};Pt.preinitModule=function(t,e){if(typeof t=="string")if(typeof e=="object"&&e!==null){if(e.as==null||e.as==="script"){var a=lu(e.as,e.crossOrigin);It.d.M(t,{crossOrigin:a,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0})}}else e==null&&It.d.M(t)};Pt.preload=function(t,e){if(typeof t=="string"&&typeof e=="object"&&e!==null&&typeof e.as=="string"){var a=e.as,l=lu(a,e.crossOrigin);It.d.L(t,a,{crossOrigin:l,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0,type:typeof e.type=="string"?e.type:void 0,fetchPriority:typeof e.fetchPriority=="string"?e.fetchPriority:void 0,referrerPolicy:typeof e.referrerPolicy=="string"?e.referrerPolicy:void 0,imageSrcSet:typeof e.imageSrcSet=="string"?e.imageSrcSet:void 0,imageSizes:typeof e.imageSizes=="string"?e.imageSizes:void 0,media:typeof e.media=="string"?e.media:void 0})}};Pt.preloadModule=function(t,e){if(typeof t=="string")if(e){var a=lu(e.as,e.crossOrigin);It.d.m(t,{as:typeof e.as=="string"&&e.as!=="script"?e.as:void 0,crossOrigin:a,integrity:typeof e.integrity=="string"?e.integrity:void 0})}else It.d.m(t)};Pt.requestFormReset=function(t){It.d.r(t)};Pt.unstable_batchedUpdates=function(t,e){return t(e)};Pt.useFormState=function(t,e,a){return ln.H.useFormState(t,e,a)};Pt.useFormStatus=function(){return ln.H.useHostTransitionStatus()};Pt.version="19.2.8";function Kf(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Kf)}catch(t){console.error(t)}}Kf(),Qf.exports=Pt;var cm=Qf.exports;/**
 * @license React
 * react-dom-client.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Zt=im,Jf=it,fm=cm;function G(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)e+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Wf(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function Dn(t){var e=t,a=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(a=e.return),t=e.return;while(t)}return e.tag===3?a:null}function Ff(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function $f(t){if(t.tag===31){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function rc(t){if(Dn(t)!==t)throw Error(G(188))}function om(t){var e=t.alternate;if(!e){if(e=Dn(t),e===null)throw Error(G(188));return e!==t?null:t}for(var a=t,l=e;;){var n=a.return;if(n===null)break;var i=n.alternate;if(i===null){if(l=n.return,l!==null){a=l;continue}break}if(n.child===i.child){for(i=n.child;i;){if(i===a)return rc(n),t;if(i===l)return rc(n),e;i=i.sibling}throw Error(G(188))}if(a.return!==l.return)a=n,l=i;else{for(var u=!1,s=n.child;s;){if(s===a){u=!0,a=n,l=i;break}if(s===l){u=!0,l=n,a=i;break}s=s.sibling}if(!u){for(s=i.child;s;){if(s===a){u=!0,a=i,l=n;break}if(s===l){u=!0,l=i,a=n;break}s=s.sibling}if(!u)throw Error(G(189))}}if(a.alternate!==l)throw Error(G(190))}if(a.tag!==3)throw Error(G(188));return a.stateNode.current===a?t:e}function If(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t;for(t=t.child;t!==null;){if(e=If(t),e!==null)return e;t=t.sibling}return null}var Tt=Object.assign,dm=Symbol.for("react.element"),Jn=Symbol.for("react.transitional.element"),Il=Symbol.for("react.portal"),nl=Symbol.for("react.fragment"),Pf=Symbol.for("react.strict_mode"),is=Symbol.for("react.profiler"),to=Symbol.for("react.consumer"),Je=Symbol.for("react.context"),ur=Symbol.for("react.forward_ref"),us=Symbol.for("react.suspense"),ss=Symbol.for("react.suspense_list"),sr=Symbol.for("react.memo"),sa=Symbol.for("react.lazy"),rs=Symbol.for("react.activity"),hm=Symbol.for("react.memo_cache_sentinel"),cc=Symbol.iterator;function Ql(t){return t===null||typeof t!="object"?null:(t=cc&&t[cc]||t["@@iterator"],typeof t=="function"?t:null)}var mm=Symbol.for("react.client.reference");function cs(t){if(t==null)return null;if(typeof t=="function")return t.$$typeof===mm?null:t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case nl:return"Fragment";case is:return"Profiler";case Pf:return"StrictMode";case us:return"Suspense";case ss:return"SuspenseList";case rs:return"Activity"}if(typeof t=="object")switch(t.$$typeof){case Il:return"Portal";case Je:return t.displayName||"Context";case to:return(t._context.displayName||"Context")+".Consumer";case ur:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case sr:return e=t.displayName||null,e!==null?e:cs(t.type)||"Memo";case sa:e=t._payload,t=t._init;try{return cs(t(e))}catch{}}return null}var Pl=Array.isArray,lt=Jf.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,mt=fm.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ka={pending:!1,data:null,method:null,action:null},fs=[],il=-1;function ke(t){return{current:t}}function Xt(t){0>il||(t.current=fs[il],fs[il]=null,il--)}function St(t,e){il++,fs[il]=t.current,t.current=e}var He=ke(null),yn=ke(null),ya=ke(null),Ti=ke(null);function wi(t,e){switch(St(ya,e),St(yn,t),St(He,null),e.nodeType){case 9:case 11:t=(t=e.documentElement)&&(t=t.namespaceURI)?vf(t):0;break;default:if(t=e.tagName,e=e.namespaceURI)e=vf(e),t=xh(e,t);else switch(t){case"svg":t=1;break;case"math":t=2;break;default:t=0}}Xt(He),St(He,t)}function zl(){Xt(He),Xt(yn),Xt(ya)}function os(t){t.memoizedState!==null&&St(Ti,t);var e=He.current,a=xh(e,t.type);e!==a&&(St(yn,t),St(He,a))}function Ni(t){yn.current===t&&(Xt(He),Xt(yn)),Ti.current===t&&(Xt(Ti),On._currentValue=ka)}var Su,fc;function Ma(t){if(Su===void 0)try{throw Error()}catch(a){var e=a.stack.trim().match(/\n( *(at )?)/);Su=e&&e[1]||"",fc=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Su+t+fc}var zu=!1;function Eu(t,e){if(!t||zu)return"";zu=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var l={DetermineComponentFrameRoot:function(){try{if(e){var y=function(){throw Error()};if(Object.defineProperty(y.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(y,[])}catch(o){var m=o}Reflect.construct(t,[],y)}else{try{y.call()}catch(o){m=o}t.call(y.prototype)}}else{try{throw Error()}catch(o){m=o}(y=t())&&typeof y.catch=="function"&&y.catch(function(){})}}catch(o){if(o&&m&&typeof o.stack=="string")return[o.stack,m.stack]}return[null,null]}};l.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var n=Object.getOwnPropertyDescriptor(l.DetermineComponentFrameRoot,"name");n&&n.configurable&&Object.defineProperty(l.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var i=l.DetermineComponentFrameRoot(),u=i[0],s=i[1];if(u&&s){var r=u.split(`
`),h=s.split(`
`);for(n=l=0;l<r.length&&!r[l].includes("DetermineComponentFrameRoot");)l++;for(;n<h.length&&!h[n].includes("DetermineComponentFrameRoot");)n++;if(l===r.length||n===h.length)for(l=r.length-1,n=h.length-1;1<=l&&0<=n&&r[l]!==h[n];)n--;for(;1<=l&&0<=n;l--,n--)if(r[l]!==h[n]){if(l!==1||n!==1)do if(l--,n--,0>n||r[l]!==h[n]){var b=`
`+r[l].replace(" at new "," at ");return t.displayName&&b.includes("<anonymous>")&&(b=b.replace("<anonymous>",t.displayName)),b}while(1<=l&&0<=n);break}}}finally{zu=!1,Error.prepareStackTrace=a}return(a=t?t.displayName||t.name:"")?Ma(a):""}function pm(t,e){switch(t.tag){case 26:case 27:case 5:return Ma(t.type);case 16:return Ma("Lazy");case 13:return t.child!==e&&e!==null?Ma("Suspense Fallback"):Ma("Suspense");case 19:return Ma("SuspenseList");case 0:case 15:return Eu(t.type,!1);case 11:return Eu(t.type.render,!1);case 1:return Eu(t.type,!0);case 31:return Ma("Activity");default:return""}}function oc(t){try{var e="",a=null;do e+=pm(t,a),a=t,t=t.return;while(t);return e}catch(l){return`
Error generating stack: `+l.message+`
`+l.stack}}var ds=Object.prototype.hasOwnProperty,rr=Zt.unstable_scheduleCallback,Au=Zt.unstable_cancelCallback,vm=Zt.unstable_shouldYield,gm=Zt.unstable_requestPaint,oe=Zt.unstable_now,ym=Zt.unstable_getCurrentPriorityLevel,eo=Zt.unstable_ImmediatePriority,ao=Zt.unstable_UserBlockingPriority,Oi=Zt.unstable_NormalPriority,bm=Zt.unstable_LowPriority,lo=Zt.unstable_IdlePriority,_m=Zt.log,xm=Zt.unstable_setDisableYieldValue,Un=null,de=null;function ha(t){if(typeof _m=="function"&&xm(t),de&&typeof de.setStrictMode=="function")try{de.setStrictMode(Un,t)}catch{}}var he=Math.clz32?Math.clz32:Em,Sm=Math.log,zm=Math.LN2;function Em(t){return t>>>=0,t===0?32:31-(Sm(t)/zm|0)|0}var Wn=256,Fn=262144,$n=4194304;function Ra(t){var e=t&42;if(e!==0)return e;switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return t&261888;case 262144:case 524288:case 1048576:case 2097152:return t&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return t&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return t}}function nu(t,e,a){var l=t.pendingLanes;if(l===0)return 0;var n=0,i=t.suspendedLanes,u=t.pingedLanes;t=t.warmLanes;var s=l&134217727;return s!==0?(l=s&~i,l!==0?n=Ra(l):(u&=s,u!==0?n=Ra(u):a||(a=s&~t,a!==0&&(n=Ra(a))))):(s=l&~i,s!==0?n=Ra(s):u!==0?n=Ra(u):a||(a=l&~t,a!==0&&(n=Ra(a)))),n===0?0:e!==0&&e!==n&&!(e&i)&&(i=n&-n,a=e&-e,i>=a||i===32&&(a&4194048)!==0)?e:n}function Mn(t,e){return(t.pendingLanes&~(t.suspendedLanes&~t.pingedLanes)&e)===0}function Am(t,e){switch(t){case 1:case 2:case 4:case 8:case 64:return e+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function no(){var t=$n;return $n<<=1,!($n&62914560)&&($n=4194304),t}function Tu(t){for(var e=[],a=0;31>a;a++)e.push(t);return e}function Rn(t,e){t.pendingLanes|=e,e!==268435456&&(t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0)}function Tm(t,e,a,l,n,i){var u=t.pendingLanes;t.pendingLanes=a,t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0,t.expiredLanes&=a,t.entangledLanes&=a,t.errorRecoveryDisabledLanes&=a,t.shellSuspendCounter=0;var s=t.entanglements,r=t.expirationTimes,h=t.hiddenUpdates;for(a=u&~a;0<a;){var b=31-he(a),y=1<<b;s[b]=0,r[b]=-1;var m=h[b];if(m!==null)for(h[b]=null,b=0;b<m.length;b++){var o=m[b];o!==null&&(o.lane&=-536870913)}a&=~y}l!==0&&io(t,l,0),i!==0&&n===0&&t.tag!==0&&(t.suspendedLanes|=i&~(u&~e))}function io(t,e,a){t.pendingLanes|=e,t.suspendedLanes&=~e;var l=31-he(e);t.entangledLanes|=e,t.entanglements[l]=t.entanglements[l]|1073741824|a&261930}function uo(t,e){var a=t.entangledLanes|=e;for(t=t.entanglements;a;){var l=31-he(a),n=1<<l;n&e|t[l]&e&&(t[l]|=e),a&=~n}}function so(t,e){var a=e&-e;return a=a&42?1:cr(a),a&(t.suspendedLanes|e)?0:a}function cr(t){switch(t){case 2:t=1;break;case 8:t=4;break;case 32:t=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:t=128;break;case 268435456:t=134217728;break;default:t=0}return t}function fr(t){return t&=-t,2<t?8<t?t&134217727?32:268435456:8:2}function ro(){var t=mt.p;return t!==0?t:(t=window.event,t===void 0?32:Dh(t.type))}function dc(t,e){var a=mt.p;try{return mt.p=t,e()}finally{mt.p=a}}var ja=Math.random().toString(36).slice(2),Vt="__reactFiber$"+ja,ie="__reactProps$"+ja,Rl="__reactContainer$"+ja,hs="__reactEvents$"+ja,wm="__reactListeners$"+ja,Nm="__reactHandles$"+ja,hc="__reactResources$"+ja,Bn="__reactMarker$"+ja;function or(t){delete t[Vt],delete t[ie],delete t[hs],delete t[wm],delete t[Nm]}function ul(t){var e=t[Vt];if(e)return e;for(var a=t.parentNode;a;){if(e=a[Rl]||a[Vt]){if(a=e.alternate,e.child!==null||a!==null&&a.child!==null)for(t=xf(t);t!==null;){if(a=t[Vt])return a;t=xf(t)}return e}t=a,a=t.parentNode}return null}function Bl(t){if(t=t[Vt]||t[Rl]){var e=t.tag;if(e===5||e===6||e===13||e===31||e===26||e===27||e===3)return t}return null}function tn(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t.stateNode;throw Error(G(33))}function vl(t){var e=t[hc];return e||(e=t[hc]={hoistableStyles:new Map,hoistableScripts:new Map}),e}function qt(t){t[Bn]=!0}var co=new Set,fo={};function Ja(t,e){El(t,e),El(t+"Capture",e)}function El(t,e){for(fo[t]=e,t=0;t<e.length;t++)co.add(e[t])}var Om=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),mc={},pc={};function Cm(t){return ds.call(pc,t)?!0:ds.call(mc,t)?!1:Om.test(t)?pc[t]=!0:(mc[t]=!0,!1)}function oi(t,e,a){if(Cm(e))if(a===null)t.removeAttribute(e);else{switch(typeof a){case"undefined":case"function":case"symbol":t.removeAttribute(e);return;case"boolean":var l=e.toLowerCase().slice(0,5);if(l!=="data-"&&l!=="aria-"){t.removeAttribute(e);return}}t.setAttribute(e,""+a)}}function In(t,e,a){if(a===null)t.removeAttribute(e);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(e);return}t.setAttribute(e,""+a)}}function Ye(t,e,a,l){if(l===null)t.removeAttribute(a);else{switch(typeof l){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(a);return}t.setAttributeNS(e,a,""+l)}}function be(t){switch(typeof t){case"bigint":case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function oo(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function jm(t,e,a){var l=Object.getOwnPropertyDescriptor(t.constructor.prototype,e);if(!t.hasOwnProperty(e)&&typeof l<"u"&&typeof l.get=="function"&&typeof l.set=="function"){var n=l.get,i=l.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return n.call(this)},set:function(u){a=""+u,i.call(this,u)}}),Object.defineProperty(t,e,{enumerable:l.enumerable}),{getValue:function(){return a},setValue:function(u){a=""+u},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function ms(t){if(!t._valueTracker){var e=oo(t)?"checked":"value";t._valueTracker=jm(t,e,""+t[e])}}function ho(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var a=e.getValue(),l="";return t&&(l=oo(t)?t.checked?"true":"false":t.value),t=l,t!==a?(e.setValue(t),!0):!1}function Ci(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}var Dm=/[\n"\\]/g;function Se(t){return t.replace(Dm,function(e){return"\\"+e.charCodeAt(0).toString(16)+" "})}function ps(t,e,a,l,n,i,u,s){t.name="",u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"?t.type=u:t.removeAttribute("type"),e!=null?u==="number"?(e===0&&t.value===""||t.value!=e)&&(t.value=""+be(e)):t.value!==""+be(e)&&(t.value=""+be(e)):u!=="submit"&&u!=="reset"||t.removeAttribute("value"),e!=null?vs(t,u,be(e)):a!=null?vs(t,u,be(a)):l!=null&&t.removeAttribute("value"),n==null&&i!=null&&(t.defaultChecked=!!i),n!=null&&(t.checked=n&&typeof n!="function"&&typeof n!="symbol"),s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"?t.name=""+be(s):t.removeAttribute("name")}function mo(t,e,a,l,n,i,u,s){if(i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"&&(t.type=i),e!=null||a!=null){if(!(i!=="submit"&&i!=="reset"||e!=null)){ms(t);return}a=a!=null?""+be(a):"",e=e!=null?""+be(e):a,s||e===t.value||(t.value=e),t.defaultValue=e}l=l??n,l=typeof l!="function"&&typeof l!="symbol"&&!!l,t.checked=s?t.checked:!!l,t.defaultChecked=!!l,u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"&&(t.name=u),ms(t)}function vs(t,e,a){e==="number"&&Ci(t.ownerDocument)===t||t.defaultValue===""+a||(t.defaultValue=""+a)}function gl(t,e,a,l){if(t=t.options,e){e={};for(var n=0;n<a.length;n++)e["$"+a[n]]=!0;for(a=0;a<t.length;a++)n=e.hasOwnProperty("$"+t[a].value),t[a].selected!==n&&(t[a].selected=n),n&&l&&(t[a].defaultSelected=!0)}else{for(a=""+be(a),e=null,n=0;n<t.length;n++){if(t[n].value===a){t[n].selected=!0,l&&(t[n].defaultSelected=!0);return}e!==null||t[n].disabled||(e=t[n])}e!==null&&(e.selected=!0)}}function po(t,e,a){if(e!=null&&(e=""+be(e),e!==t.value&&(t.value=e),a==null)){t.defaultValue!==e&&(t.defaultValue=e);return}t.defaultValue=a!=null?""+be(a):""}function vo(t,e,a,l){if(e==null){if(l!=null){if(a!=null)throw Error(G(92));if(Pl(l)){if(1<l.length)throw Error(G(93));l=l[0]}a=l}a==null&&(a=""),e=a}a=be(e),t.defaultValue=a,l=t.textContent,l===a&&l!==""&&l!==null&&(t.value=l),ms(t)}function Al(t,e){if(e){var a=t.firstChild;if(a&&a===t.lastChild&&a.nodeType===3){a.nodeValue=e;return}}t.textContent=e}var Um=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function vc(t,e,a){var l=e.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?l?t.setProperty(e,""):e==="float"?t.cssFloat="":t[e]="":l?t.setProperty(e,a):typeof a!="number"||a===0||Um.has(e)?e==="float"?t.cssFloat=a:t[e]=(""+a).trim():t[e]=a+"px"}function go(t,e,a){if(e!=null&&typeof e!="object")throw Error(G(62));if(t=t.style,a!=null){for(var l in a)!a.hasOwnProperty(l)||e!=null&&e.hasOwnProperty(l)||(l.indexOf("--")===0?t.setProperty(l,""):l==="float"?t.cssFloat="":t[l]="");for(var n in e)l=e[n],e.hasOwnProperty(n)&&a[n]!==l&&vc(t,n,l)}else for(var i in e)e.hasOwnProperty(i)&&vc(t,i,e[i])}function dr(t){if(t.indexOf("-")===-1)return!1;switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Mm=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),Rm=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function di(t){return Rm.test(""+t)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":t}function We(){}var gs=null;function hr(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var sl=null,yl=null;function gc(t){var e=Bl(t);if(e&&(t=e.stateNode)){var a=t[ie]||null;t:switch(t=e.stateNode,e.type){case"input":if(ps(t,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),e=a.name,a.type==="radio"&&e!=null){for(a=t;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+Se(""+e)+'"][type="radio"]'),e=0;e<a.length;e++){var l=a[e];if(l!==t&&l.form===t.form){var n=l[ie]||null;if(!n)throw Error(G(90));ps(l,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name)}}for(e=0;e<a.length;e++)l=a[e],l.form===t.form&&ho(l)}break t;case"textarea":po(t,a.value,a.defaultValue);break t;case"select":e=a.value,e!=null&&gl(t,!!a.multiple,e,!1)}}}var wu=!1;function yo(t,e,a){if(wu)return t(e,a);wu=!0;try{var l=t(e);return l}finally{if(wu=!1,(sl!==null||yl!==null)&&(vu(),sl&&(e=sl,t=yl,yl=sl=null,gc(e),t)))for(e=0;e<t.length;e++)gc(t[e])}}function bn(t,e){var a=t.stateNode;if(a===null)return null;var l=a[ie]||null;if(l===null)return null;a=l[e];t:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(l=!l.disabled)||(t=t.type,l=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!l;break t;default:t=!1}if(t)return null;if(a&&typeof a!="function")throw Error(G(231,e,typeof a));return a}var ta=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),ys=!1;if(ta)try{var Vl={};Object.defineProperty(Vl,"passive",{get:function(){ys=!0}}),window.addEventListener("test",Vl,Vl),window.removeEventListener("test",Vl,Vl)}catch{ys=!1}var ma=null,mr=null,hi=null;function bo(){if(hi)return hi;var t,e=mr,a=e.length,l,n="value"in ma?ma.value:ma.textContent,i=n.length;for(t=0;t<a&&e[t]===n[t];t++);var u=a-t;for(l=1;l<=u&&e[a-l]===n[i-l];l++);return hi=n.slice(t,1<l?1-l:void 0)}function mi(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function Pn(){return!0}function yc(){return!1}function ue(t){function e(a,l,n,i,u){this._reactName=a,this._targetInst=n,this.type=l,this.nativeEvent=i,this.target=u,this.currentTarget=null;for(var s in t)t.hasOwnProperty(s)&&(a=t[s],this[s]=a?a(i):i[s]);return this.isDefaultPrevented=(i.defaultPrevented!=null?i.defaultPrevented:i.returnValue===!1)?Pn:yc,this.isPropagationStopped=yc,this}return Tt(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=Pn)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=Pn)},persist:function(){},isPersistent:Pn}),e}var Wa={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},iu=ue(Wa),Hn=Tt({},Wa,{view:0,detail:0}),Bm=ue(Hn),Nu,Ou,Kl,uu=Tt({},Hn,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:pr,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==Kl&&(Kl&&t.type==="mousemove"?(Nu=t.screenX-Kl.screenX,Ou=t.screenY-Kl.screenY):Ou=Nu=0,Kl=t),Nu)},movementY:function(t){return"movementY"in t?t.movementY:Ou}}),bc=ue(uu),Hm=Tt({},uu,{dataTransfer:0}),km=ue(Hm),Lm=Tt({},Hn,{relatedTarget:0}),Cu=ue(Lm),Zm=Tt({},Wa,{animationName:0,elapsedTime:0,pseudoElement:0}),Ym=ue(Zm),Gm=Tt({},Wa,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),qm=ue(Gm),Xm=Tt({},Wa,{data:0}),_c=ue(Xm),Qm={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Vm={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Km={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Jm(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=Km[t])?!!e[t]:!1}function pr(){return Jm}var Wm=Tt({},Hn,{key:function(t){if(t.key){var e=Qm[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=mi(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?Vm[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:pr,charCode:function(t){return t.type==="keypress"?mi(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?mi(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),Fm=ue(Wm),$m=Tt({},uu,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),xc=ue($m),Im=Tt({},Hn,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:pr}),Pm=ue(Im),t0=Tt({},Wa,{propertyName:0,elapsedTime:0,pseudoElement:0}),e0=ue(t0),a0=Tt({},uu,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),l0=ue(a0),n0=Tt({},Wa,{newState:0,oldState:0}),i0=ue(n0),u0=[9,13,27,32],vr=ta&&"CompositionEvent"in window,nn=null;ta&&"documentMode"in document&&(nn=document.documentMode);var s0=ta&&"TextEvent"in window&&!nn,_o=ta&&(!vr||nn&&8<nn&&11>=nn),Sc=" ",zc=!1;function xo(t,e){switch(t){case"keyup":return u0.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function So(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var rl=!1;function r0(t,e){switch(t){case"compositionend":return So(e);case"keypress":return e.which!==32?null:(zc=!0,Sc);case"textInput":return t=e.data,t===Sc&&zc?null:t;default:return null}}function c0(t,e){if(rl)return t==="compositionend"||!vr&&xo(t,e)?(t=bo(),hi=mr=ma=null,rl=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return _o&&e.locale!=="ko"?null:e.data;default:return null}}var f0={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Ec(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!f0[t.type]:e==="textarea"}function zo(t,e,a,l){sl?yl?yl.push(l):yl=[l]:sl=l,e=Ji(e,"onChange"),0<e.length&&(a=new iu("onChange","change",null,a,l),t.push({event:a,listeners:e}))}var un=null,_n=null;function o0(t){yh(t,0)}function su(t){var e=tn(t);if(ho(e))return t}function Ac(t,e){if(t==="change")return e}var Eo=!1;if(ta){var ju;if(ta){var Du="oninput"in document;if(!Du){var Tc=document.createElement("div");Tc.setAttribute("oninput","return;"),Du=typeof Tc.oninput=="function"}ju=Du}else ju=!1;Eo=ju&&(!document.documentMode||9<document.documentMode)}function wc(){un&&(un.detachEvent("onpropertychange",Ao),_n=un=null)}function Ao(t){if(t.propertyName==="value"&&su(_n)){var e=[];zo(e,_n,t,hr(t)),yo(o0,e)}}function d0(t,e,a){t==="focusin"?(wc(),un=e,_n=a,un.attachEvent("onpropertychange",Ao)):t==="focusout"&&wc()}function h0(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return su(_n)}function m0(t,e){if(t==="click")return su(e)}function p0(t,e){if(t==="input"||t==="change")return su(e)}function v0(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var pe=typeof Object.is=="function"?Object.is:v0;function xn(t,e){if(pe(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var a=Object.keys(t),l=Object.keys(e);if(a.length!==l.length)return!1;for(l=0;l<a.length;l++){var n=a[l];if(!ds.call(e,n)||!pe(t[n],e[n]))return!1}return!0}function Nc(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function Oc(t,e){var a=Nc(t);t=0;for(var l;a;){if(a.nodeType===3){if(l=t+a.textContent.length,t<=e&&l>=e)return{node:a,offset:e-t};t=l}t:{for(;a;){if(a.nextSibling){a=a.nextSibling;break t}a=a.parentNode}a=void 0}a=Nc(a)}}function To(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?To(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function wo(t){t=t!=null&&t.ownerDocument!=null&&t.ownerDocument.defaultView!=null?t.ownerDocument.defaultView:window;for(var e=Ci(t.document);e instanceof t.HTMLIFrameElement;){try{var a=typeof e.contentWindow.location.href=="string"}catch{a=!1}if(a)t=e.contentWindow;else break;e=Ci(t.document)}return e}function gr(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}var g0=ta&&"documentMode"in document&&11>=document.documentMode,cl=null,bs=null,sn=null,_s=!1;function Cc(t,e,a){var l=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;_s||cl==null||cl!==Ci(l)||(l=cl,"selectionStart"in l&&gr(l)?l={start:l.selectionStart,end:l.selectionEnd}:(l=(l.ownerDocument&&l.ownerDocument.defaultView||window).getSelection(),l={anchorNode:l.anchorNode,anchorOffset:l.anchorOffset,focusNode:l.focusNode,focusOffset:l.focusOffset}),sn&&xn(sn,l)||(sn=l,l=Ji(bs,"onSelect"),0<l.length&&(e=new iu("onSelect","select",null,e,a),t.push({event:e,listeners:l}),e.target=cl)))}function Ua(t,e){var a={};return a[t.toLowerCase()]=e.toLowerCase(),a["Webkit"+t]="webkit"+e,a["Moz"+t]="moz"+e,a}var fl={animationend:Ua("Animation","AnimationEnd"),animationiteration:Ua("Animation","AnimationIteration"),animationstart:Ua("Animation","AnimationStart"),transitionrun:Ua("Transition","TransitionRun"),transitionstart:Ua("Transition","TransitionStart"),transitioncancel:Ua("Transition","TransitionCancel"),transitionend:Ua("Transition","TransitionEnd")},Uu={},No={};ta&&(No=document.createElement("div").style,"AnimationEvent"in window||(delete fl.animationend.animation,delete fl.animationiteration.animation,delete fl.animationstart.animation),"TransitionEvent"in window||delete fl.transitionend.transition);function Fa(t){if(Uu[t])return Uu[t];if(!fl[t])return t;var e=fl[t],a;for(a in e)if(e.hasOwnProperty(a)&&a in No)return Uu[t]=e[a];return t}var Oo=Fa("animationend"),Co=Fa("animationiteration"),jo=Fa("animationstart"),y0=Fa("transitionrun"),b0=Fa("transitionstart"),_0=Fa("transitioncancel"),Do=Fa("transitionend"),Uo=new Map,xs="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");xs.push("scrollEnd");function je(t,e){Uo.set(t,e),Ja(e,[t])}var ji=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},ye=[],ol=0,yr=0;function ru(){for(var t=ol,e=yr=ol=0;e<t;){var a=ye[e];ye[e++]=null;var l=ye[e];ye[e++]=null;var n=ye[e];ye[e++]=null;var i=ye[e];if(ye[e++]=null,l!==null&&n!==null){var u=l.pending;u===null?n.next=n:(n.next=u.next,u.next=n),l.pending=n}i!==0&&Mo(a,n,i)}}function cu(t,e,a,l){ye[ol++]=t,ye[ol++]=e,ye[ol++]=a,ye[ol++]=l,yr|=l,t.lanes|=l,t=t.alternate,t!==null&&(t.lanes|=l)}function br(t,e,a,l){return cu(t,e,a,l),Di(t)}function $a(t,e){return cu(t,null,null,e),Di(t)}function Mo(t,e,a){t.lanes|=a;var l=t.alternate;l!==null&&(l.lanes|=a);for(var n=!1,i=t.return;i!==null;)i.childLanes|=a,l=i.alternate,l!==null&&(l.childLanes|=a),i.tag===22&&(t=i.stateNode,t===null||t._visibility&1||(n=!0)),t=i,i=i.return;return t.tag===3?(i=t.stateNode,n&&e!==null&&(n=31-he(a),t=i.hiddenUpdates,l=t[n],l===null?t[n]=[e]:l.push(e),e.lane=a|536870912),i):null}function Di(t){if(50<vn)throw vn=0,Gs=null,Error(G(185));for(var e=t.return;e!==null;)t=e,e=t.return;return t.tag===3?t.stateNode:null}var dl={};function x0(t,e,a,l){this.tag=t,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=l,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function ce(t,e,a,l){return new x0(t,e,a,l)}function _r(t){return t=t.prototype,!(!t||!t.isReactComponent)}function $e(t,e){var a=t.alternate;return a===null?(a=ce(t.tag,e,t.key,t.mode),a.elementType=t.elementType,a.type=t.type,a.stateNode=t.stateNode,a.alternate=t,t.alternate=a):(a.pendingProps=e,a.type=t.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=t.flags&65011712,a.childLanes=t.childLanes,a.lanes=t.lanes,a.child=t.child,a.memoizedProps=t.memoizedProps,a.memoizedState=t.memoizedState,a.updateQueue=t.updateQueue,e=t.dependencies,a.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},a.sibling=t.sibling,a.index=t.index,a.ref=t.ref,a.refCleanup=t.refCleanup,a}function Ro(t,e){t.flags&=65011714;var a=t.alternate;return a===null?(t.childLanes=0,t.lanes=e,t.child=null,t.subtreeFlags=0,t.memoizedProps=null,t.memoizedState=null,t.updateQueue=null,t.dependencies=null,t.stateNode=null):(t.childLanes=a.childLanes,t.lanes=a.lanes,t.child=a.child,t.subtreeFlags=0,t.deletions=null,t.memoizedProps=a.memoizedProps,t.memoizedState=a.memoizedState,t.updateQueue=a.updateQueue,t.type=a.type,e=a.dependencies,t.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),t}function pi(t,e,a,l,n,i){var u=0;if(l=t,typeof t=="function")_r(t)&&(u=1);else if(typeof t=="string")u=T1(t,a,He.current)?26:t==="html"||t==="head"||t==="body"?27:5;else t:switch(t){case rs:return t=ce(31,a,e,n),t.elementType=rs,t.lanes=i,t;case nl:return La(a.children,n,i,e);case Pf:u=8,n|=24;break;case is:return t=ce(12,a,e,n|2),t.elementType=is,t.lanes=i,t;case us:return t=ce(13,a,e,n),t.elementType=us,t.lanes=i,t;case ss:return t=ce(19,a,e,n),t.elementType=ss,t.lanes=i,t;default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case Je:u=10;break t;case to:u=9;break t;case ur:u=11;break t;case sr:u=14;break t;case sa:u=16,l=null;break t}u=29,a=Error(G(130,t===null?"null":typeof t,"")),l=null}return e=ce(u,a,e,n),e.elementType=t,e.type=l,e.lanes=i,e}function La(t,e,a,l){return t=ce(7,t,l,e),t.lanes=a,t}function Mu(t,e,a){return t=ce(6,t,null,e),t.lanes=a,t}function Bo(t){var e=ce(18,null,null,0);return e.stateNode=t,e}function Ru(t,e,a){return e=ce(4,t.children!==null?t.children:[],t.key,e),e.lanes=a,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}var jc=new WeakMap;function ze(t,e){if(typeof t=="object"&&t!==null){var a=jc.get(t);return a!==void 0?a:(e={value:t,source:e,stack:oc(e)},jc.set(t,e),e)}return{value:t,source:e,stack:oc(e)}}var hl=[],ml=0,Ui=null,Sn=0,_e=[],xe=0,wa=null,Me=1,Re="";function Ve(t,e){hl[ml++]=Sn,hl[ml++]=Ui,Ui=t,Sn=e}function Ho(t,e,a){_e[xe++]=Me,_e[xe++]=Re,_e[xe++]=wa,wa=t;var l=Me;t=Re;var n=32-he(l)-1;l&=~(1<<n),a+=1;var i=32-he(e)+n;if(30<i){var u=n-n%5;i=(l&(1<<u)-1).toString(32),l>>=u,n-=u,Me=1<<32-he(e)+n|a<<n|l,Re=i+t}else Me=1<<i|a<<n|l,Re=t}function xr(t){t.return!==null&&(Ve(t,1),Ho(t,1,0))}function Sr(t){for(;t===Ui;)Ui=hl[--ml],hl[ml]=null,Sn=hl[--ml],hl[ml]=null;for(;t===wa;)wa=_e[--xe],_e[xe]=null,Re=_e[--xe],_e[xe]=null,Me=_e[--xe],_e[xe]=null}function ko(t,e){_e[xe++]=Me,_e[xe++]=Re,_e[xe++]=wa,Me=e.id,Re=e.overflow,wa=t}var Kt=null,Et=null,ft=!1,ba=null,Ee=!1,Ss=Error(G(519));function Na(t){var e=Error(G(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw zn(ze(e,t)),Ss}function Dc(t){var e=t.stateNode,a=t.type,l=t.memoizedProps;switch(e[Vt]=t,e[ie]=l,a){case"dialog":st("cancel",e),st("close",e);break;case"iframe":case"object":case"embed":st("load",e);break;case"video":case"audio":for(a=0;a<wn.length;a++)st(wn[a],e);break;case"source":st("error",e);break;case"img":case"image":case"link":st("error",e),st("load",e);break;case"details":st("toggle",e);break;case"input":st("invalid",e),mo(e,l.value,l.defaultValue,l.checked,l.defaultChecked,l.type,l.name,!0);break;case"select":st("invalid",e);break;case"textarea":st("invalid",e),vo(e,l.value,l.defaultValue,l.children)}a=l.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||e.textContent===""+a||l.suppressHydrationWarning===!0||_h(e.textContent,a)?(l.popover!=null&&(st("beforetoggle",e),st("toggle",e)),l.onScroll!=null&&st("scroll",e),l.onScrollEnd!=null&&st("scrollend",e),l.onClick!=null&&(e.onclick=We),e=!0):e=!1,e||Na(t,!0)}function Uc(t){for(Kt=t.return;Kt;)switch(Kt.tag){case 5:case 31:case 13:Ee=!1;return;case 27:case 3:Ee=!0;return;default:Kt=Kt.return}}function Pa(t){if(t!==Kt)return!1;if(!ft)return Uc(t),ft=!0,!1;var e=t.tag,a;if((a=e!==3&&e!==27)&&((a=e===5)&&(a=t.type,a=!(a!=="form"&&a!=="button")||Ks(t.type,t.memoizedProps)),a=!a),a&&Et&&Na(t),Uc(t),e===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(G(317));Et=_f(t)}else if(e===31){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(G(317));Et=_f(t)}else e===27?(e=Et,Da(t.type)?(t=$s,$s=null,Et=t):Et=e):Et=Kt?Te(t.stateNode.nextSibling):null;return!0}function qa(){Et=Kt=null,ft=!1}function Bu(){var t=ba;return t!==null&&(le===null?le=t:le.push.apply(le,t),ba=null),t}function zn(t){ba===null?ba=[t]:ba.push(t)}var zs=ke(null),Ia=null,Fe=null;function ca(t,e,a){St(zs,e._currentValue),e._currentValue=a}function Ie(t){t._currentValue=zs.current,Xt(zs)}function Es(t,e,a){for(;t!==null;){var l=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,l!==null&&(l.childLanes|=e)):l!==null&&(l.childLanes&e)!==e&&(l.childLanes|=e),t===a)break;t=t.return}}function As(t,e,a,l){var n=t.child;for(n!==null&&(n.return=t);n!==null;){var i=n.dependencies;if(i!==null){var u=n.child;i=i.firstContext;t:for(;i!==null;){var s=i;i=n;for(var r=0;r<e.length;r++)if(s.context===e[r]){i.lanes|=a,s=i.alternate,s!==null&&(s.lanes|=a),Es(i.return,a,t),l||(u=null);break t}i=s.next}}else if(n.tag===18){if(u=n.return,u===null)throw Error(G(341));u.lanes|=a,i=u.alternate,i!==null&&(i.lanes|=a),Es(u,a,t),u=null}else u=n.child;if(u!==null)u.return=n;else for(u=n;u!==null;){if(u===t){u=null;break}if(n=u.sibling,n!==null){n.return=u.return,u=n;break}u=u.return}n=u}}function Hl(t,e,a,l){t=null;for(var n=e,i=!1;n!==null;){if(!i){if(n.flags&524288)i=!0;else if(n.flags&262144)break}if(n.tag===10){var u=n.alternate;if(u===null)throw Error(G(387));if(u=u.memoizedProps,u!==null){var s=n.type;pe(n.pendingProps.value,u.value)||(t!==null?t.push(s):t=[s])}}else if(n===Ti.current){if(u=n.alternate,u===null)throw Error(G(387));u.memoizedState.memoizedState!==n.memoizedState.memoizedState&&(t!==null?t.push(On):t=[On])}n=n.return}t!==null&&As(e,t,a,l),e.flags|=262144}function Mi(t){for(t=t.firstContext;t!==null;){if(!pe(t.context._currentValue,t.memoizedValue))return!0;t=t.next}return!1}function Xa(t){Ia=t,Fe=null,t=t.dependencies,t!==null&&(t.firstContext=null)}function Jt(t){return Lo(Ia,t)}function ti(t,e){return Ia===null&&Xa(t),Lo(t,e)}function Lo(t,e){var a=e._currentValue;if(e={context:e,memoizedValue:a,next:null},Fe===null){if(t===null)throw Error(G(308));Fe=e,t.dependencies={lanes:0,firstContext:e},t.flags|=524288}else Fe=Fe.next=e;return a}var S0=typeof AbortController<"u"?AbortController:function(){var t=[],e=this.signal={aborted:!1,addEventListener:function(a,l){t.push(l)}};this.abort=function(){e.aborted=!0,t.forEach(function(a){return a()})}},z0=Zt.unstable_scheduleCallback,E0=Zt.unstable_NormalPriority,Ht={$$typeof:Je,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function zr(){return{controller:new S0,data:new Map,refCount:0}}function kn(t){t.refCount--,t.refCount===0&&z0(E0,function(){t.controller.abort()})}var rn=null,Ts=0,Tl=0,bl=null;function A0(t,e){if(rn===null){var a=rn=[];Ts=0,Tl=Jr(),bl={status:"pending",value:void 0,then:function(l){a.push(l)}}}return Ts++,e.then(Mc,Mc),e}function Mc(){if(--Ts===0&&rn!==null){bl!==null&&(bl.status="fulfilled");var t=rn;rn=null,Tl=0,bl=null;for(var e=0;e<t.length;e++)(0,t[e])()}}function T0(t,e){var a=[],l={status:"pending",value:null,reason:null,then:function(n){a.push(n)}};return t.then(function(){l.status="fulfilled",l.value=e;for(var n=0;n<a.length;n++)(0,a[n])(e)},function(n){for(l.status="rejected",l.reason=n,n=0;n<a.length;n++)(0,a[n])(void 0)}),l}var Rc=lt.S;lt.S=function(t,e){Pd=oe(),typeof e=="object"&&e!==null&&typeof e.then=="function"&&A0(t,e),Rc!==null&&Rc(t,e)};var Za=ke(null);function Er(){var t=Za.current;return t!==null?t:_t.pooledCache}function vi(t,e){e===null?St(Za,Za.current):St(Za,e.pool)}function Zo(){var t=Er();return t===null?null:{parent:Ht._currentValue,pool:t}}var kl=Error(G(460)),Ar=Error(G(474)),fu=Error(G(542)),Ri={then:function(){}};function Bc(t){return t=t.status,t==="fulfilled"||t==="rejected"}function Yo(t,e,a){switch(a=t[a],a===void 0?t.push(e):a!==e&&(e.then(We,We),e=a),e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,kc(t),t;default:if(typeof e.status=="string")e.then(We,We);else{if(t=_t,t!==null&&100<t.shellSuspendCounter)throw Error(G(482));t=e,t.status="pending",t.then(function(l){if(e.status==="pending"){var n=e;n.status="fulfilled",n.value=l}},function(l){if(e.status==="pending"){var n=e;n.status="rejected",n.reason=l}})}switch(e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,kc(t),t}throw Ya=e,kl}}function Ba(t){try{var e=t._init;return e(t._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(Ya=a,kl):a}}var Ya=null;function Hc(){if(Ya===null)throw Error(G(459));var t=Ya;return Ya=null,t}function kc(t){if(t===kl||t===fu)throw Error(G(483))}var _l=null,En=0;function ei(t){var e=En;return En+=1,_l===null&&(_l=[]),Yo(_l,t,e)}function Jl(t,e){e=e.props.ref,t.ref=e!==void 0?e:null}function ai(t,e){throw e.$$typeof===dm?Error(G(525)):(t=Object.prototype.toString.call(e),Error(G(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)))}function Go(t){function e(c,d){if(t){var g=c.deletions;g===null?(c.deletions=[d],c.flags|=16):g.push(d)}}function a(c,d){if(!t)return null;for(;d!==null;)e(c,d),d=d.sibling;return null}function l(c){for(var d=new Map;c!==null;)c.key!==null?d.set(c.key,c):d.set(c.index,c),c=c.sibling;return d}function n(c,d){return c=$e(c,d),c.index=0,c.sibling=null,c}function i(c,d,g){return c.index=g,t?(g=c.alternate,g!==null?(g=g.index,g<d?(c.flags|=67108866,d):g):(c.flags|=67108866,d)):(c.flags|=1048576,d)}function u(c){return t&&c.alternate===null&&(c.flags|=67108866),c}function s(c,d,g,S){return d===null||d.tag!==6?(d=Mu(g,c.mode,S),d.return=c,d):(d=n(d,g),d.return=c,d)}function r(c,d,g,S){var N=g.type;return N===nl?b(c,d,g.props.children,S,g.key):d!==null&&(d.elementType===N||typeof N=="object"&&N!==null&&N.$$typeof===sa&&Ba(N)===d.type)?(d=n(d,g.props),Jl(d,g),d.return=c,d):(d=pi(g.type,g.key,g.props,null,c.mode,S),Jl(d,g),d.return=c,d)}function h(c,d,g,S){return d===null||d.tag!==4||d.stateNode.containerInfo!==g.containerInfo||d.stateNode.implementation!==g.implementation?(d=Ru(g,c.mode,S),d.return=c,d):(d=n(d,g.children||[]),d.return=c,d)}function b(c,d,g,S,N){return d===null||d.tag!==7?(d=La(g,c.mode,S,N),d.return=c,d):(d=n(d,g),d.return=c,d)}function y(c,d,g){if(typeof d=="string"&&d!==""||typeof d=="number"||typeof d=="bigint")return d=Mu(""+d,c.mode,g),d.return=c,d;if(typeof d=="object"&&d!==null){switch(d.$$typeof){case Jn:return g=pi(d.type,d.key,d.props,null,c.mode,g),Jl(g,d),g.return=c,g;case Il:return d=Ru(d,c.mode,g),d.return=c,d;case sa:return d=Ba(d),y(c,d,g)}if(Pl(d)||Ql(d))return d=La(d,c.mode,g,null),d.return=c,d;if(typeof d.then=="function")return y(c,ei(d),g);if(d.$$typeof===Je)return y(c,ti(c,d),g);ai(c,d)}return null}function m(c,d,g,S){var N=d!==null?d.key:null;if(typeof g=="string"&&g!==""||typeof g=="number"||typeof g=="bigint")return N!==null?null:s(c,d,""+g,S);if(typeof g=="object"&&g!==null){switch(g.$$typeof){case Jn:return g.key===N?r(c,d,g,S):null;case Il:return g.key===N?h(c,d,g,S):null;case sa:return g=Ba(g),m(c,d,g,S)}if(Pl(g)||Ql(g))return N!==null?null:b(c,d,g,S,null);if(typeof g.then=="function")return m(c,d,ei(g),S);if(g.$$typeof===Je)return m(c,d,ti(c,g),S);ai(c,g)}return null}function o(c,d,g,S,N){if(typeof S=="string"&&S!==""||typeof S=="number"||typeof S=="bigint")return c=c.get(g)||null,s(d,c,""+S,N);if(typeof S=="object"&&S!==null){switch(S.$$typeof){case Jn:return c=c.get(S.key===null?g:S.key)||null,r(d,c,S,N);case Il:return c=c.get(S.key===null?g:S.key)||null,h(d,c,S,N);case sa:return S=Ba(S),o(c,d,g,S,N)}if(Pl(S)||Ql(S))return c=c.get(g)||null,b(d,c,S,N,null);if(typeof S.then=="function")return o(c,d,g,ei(S),N);if(S.$$typeof===Je)return o(c,d,g,ti(d,S),N);ai(d,S)}return null}function _(c,d,g,S){for(var N=null,M=null,w=d,j=d=0,O=null;w!==null&&j<g.length;j++){w.index>j?(O=w,w=null):O=w.sibling;var k=m(c,w,g[j],S);if(k===null){w===null&&(w=O);break}t&&w&&k.alternate===null&&e(c,w),d=i(k,d,j),M===null?N=k:M.sibling=k,M=k,w=O}if(j===g.length)return a(c,w),ft&&Ve(c,j),N;if(w===null){for(;j<g.length;j++)w=y(c,g[j],S),w!==null&&(d=i(w,d,j),M===null?N=w:M.sibling=w,M=w);return ft&&Ve(c,j),N}for(w=l(w);j<g.length;j++)O=o(w,c,j,g[j],S),O!==null&&(t&&O.alternate!==null&&w.delete(O.key===null?j:O.key),d=i(O,d,j),M===null?N=O:M.sibling=O,M=O);return t&&w.forEach(function(F){return e(c,F)}),ft&&Ve(c,j),N}function v(c,d,g,S){if(g==null)throw Error(G(151));for(var N=null,M=null,w=d,j=d=0,O=null,k=g.next();w!==null&&!k.done;j++,k=g.next()){w.index>j?(O=w,w=null):O=w.sibling;var F=m(c,w,k.value,S);if(F===null){w===null&&(w=O);break}t&&w&&F.alternate===null&&e(c,w),d=i(F,d,j),M===null?N=F:M.sibling=F,M=F,w=O}if(k.done)return a(c,w),ft&&Ve(c,j),N;if(w===null){for(;!k.done;j++,k=g.next())k=y(c,k.value,S),k!==null&&(d=i(k,d,j),M===null?N=k:M.sibling=k,M=k);return ft&&Ve(c,j),N}for(w=l(w);!k.done;j++,k=g.next())k=o(w,c,j,k.value,S),k!==null&&(t&&k.alternate!==null&&w.delete(k.key===null?j:k.key),d=i(k,d,j),M===null?N=k:M.sibling=k,M=k);return t&&w.forEach(function(T){return e(c,T)}),ft&&Ve(c,j),N}function x(c,d,g,S){if(typeof g=="object"&&g!==null&&g.type===nl&&g.key===null&&(g=g.props.children),typeof g=="object"&&g!==null){switch(g.$$typeof){case Jn:t:{for(var N=g.key;d!==null;){if(d.key===N){if(N=g.type,N===nl){if(d.tag===7){a(c,d.sibling),S=n(d,g.props.children),S.return=c,c=S;break t}}else if(d.elementType===N||typeof N=="object"&&N!==null&&N.$$typeof===sa&&Ba(N)===d.type){a(c,d.sibling),S=n(d,g.props),Jl(S,g),S.return=c,c=S;break t}a(c,d);break}else e(c,d);d=d.sibling}g.type===nl?(S=La(g.props.children,c.mode,S,g.key),S.return=c,c=S):(S=pi(g.type,g.key,g.props,null,c.mode,S),Jl(S,g),S.return=c,c=S)}return u(c);case Il:t:{for(N=g.key;d!==null;){if(d.key===N)if(d.tag===4&&d.stateNode.containerInfo===g.containerInfo&&d.stateNode.implementation===g.implementation){a(c,d.sibling),S=n(d,g.children||[]),S.return=c,c=S;break t}else{a(c,d);break}else e(c,d);d=d.sibling}S=Ru(g,c.mode,S),S.return=c,c=S}return u(c);case sa:return g=Ba(g),x(c,d,g,S)}if(Pl(g))return _(c,d,g,S);if(Ql(g)){if(N=Ql(g),typeof N!="function")throw Error(G(150));return g=N.call(g),v(c,d,g,S)}if(typeof g.then=="function")return x(c,d,ei(g),S);if(g.$$typeof===Je)return x(c,d,ti(c,g),S);ai(c,g)}return typeof g=="string"&&g!==""||typeof g=="number"||typeof g=="bigint"?(g=""+g,d!==null&&d.tag===6?(a(c,d.sibling),S=n(d,g),S.return=c,c=S):(a(c,d),S=Mu(g,c.mode,S),S.return=c,c=S),u(c)):a(c,d)}return function(c,d,g,S){try{En=0;var N=x(c,d,g,S);return _l=null,N}catch(w){if(w===kl||w===fu)throw w;var M=ce(29,w,null,c.mode);return M.lanes=S,M.return=c,M}finally{}}}var Qa=Go(!0),qo=Go(!1),ra=!1;function Tr(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function ws(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,callbacks:null})}function _a(t){return{lane:t,tag:0,payload:null,callback:null,next:null}}function xa(t,e,a){var l=t.updateQueue;if(l===null)return null;if(l=l.shared,ht&2){var n=l.pending;return n===null?e.next=e:(e.next=n.next,n.next=e),l.pending=e,e=Di(t),Mo(t,null,a),e}return cu(t,l,e,a),Di(t)}function cn(t,e,a){if(e=e.updateQueue,e!==null&&(e=e.shared,(a&4194048)!==0)){var l=e.lanes;l&=t.pendingLanes,a|=l,e.lanes=a,uo(t,a)}}function Hu(t,e){var a=t.updateQueue,l=t.alternate;if(l!==null&&(l=l.updateQueue,a===l)){var n=null,i=null;if(a=a.firstBaseUpdate,a!==null){do{var u={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};i===null?n=i=u:i=i.next=u,a=a.next}while(a!==null);i===null?n=i=e:i=i.next=e}else n=i=e;a={baseState:l.baseState,firstBaseUpdate:n,lastBaseUpdate:i,shared:l.shared,callbacks:l.callbacks},t.updateQueue=a;return}t=a.lastBaseUpdate,t===null?a.firstBaseUpdate=e:t.next=e,a.lastBaseUpdate=e}var Ns=!1;function fn(){if(Ns){var t=bl;if(t!==null)throw t}}function on(t,e,a,l){Ns=!1;var n=t.updateQueue;ra=!1;var i=n.firstBaseUpdate,u=n.lastBaseUpdate,s=n.shared.pending;if(s!==null){n.shared.pending=null;var r=s,h=r.next;r.next=null,u===null?i=h:u.next=h,u=r;var b=t.alternate;b!==null&&(b=b.updateQueue,s=b.lastBaseUpdate,s!==u&&(s===null?b.firstBaseUpdate=h:s.next=h,b.lastBaseUpdate=r))}if(i!==null){var y=n.baseState;u=0,b=h=r=null,s=i;do{var m=s.lane&-536870913,o=m!==s.lane;if(o?(ct&m)===m:(l&m)===m){m!==0&&m===Tl&&(Ns=!0),b!==null&&(b=b.next={lane:0,tag:s.tag,payload:s.payload,callback:null,next:null});t:{var _=t,v=s;m=e;var x=a;switch(v.tag){case 1:if(_=v.payload,typeof _=="function"){y=_.call(x,y,m);break t}y=_;break t;case 3:_.flags=_.flags&-65537|128;case 0:if(_=v.payload,m=typeof _=="function"?_.call(x,y,m):_,m==null)break t;y=Tt({},y,m);break t;case 2:ra=!0}}m=s.callback,m!==null&&(t.flags|=64,o&&(t.flags|=8192),o=n.callbacks,o===null?n.callbacks=[m]:o.push(m))}else o={lane:m,tag:s.tag,payload:s.payload,callback:s.callback,next:null},b===null?(h=b=o,r=y):b=b.next=o,u|=m;if(s=s.next,s===null){if(s=n.shared.pending,s===null)break;o=s,s=o.next,o.next=null,n.lastBaseUpdate=o,n.shared.pending=null}}while(!0);b===null&&(r=y),n.baseState=r,n.firstBaseUpdate=h,n.lastBaseUpdate=b,i===null&&(n.shared.lanes=0),Ca|=u,t.lanes=u,t.memoizedState=y}}function Xo(t,e){if(typeof t!="function")throw Error(G(191,t));t.call(e)}function Qo(t,e){var a=t.callbacks;if(a!==null)for(t.callbacks=null,t=0;t<a.length;t++)Xo(a[t],e)}var wl=ke(null),Bi=ke(0);function Lc(t,e){t=na,St(Bi,t),St(wl,e),na=t|e.baseLanes}function Os(){St(Bi,na),St(wl,wl.current)}function wr(){na=Bi.current,Xt(wl),Xt(Bi)}var ve=ke(null),Ae=null;function fa(t){var e=t.alternate;St(Ut,Ut.current&1),St(ve,t),Ae===null&&(e===null||wl.current!==null||e.memoizedState!==null)&&(Ae=t)}function Cs(t){St(Ut,Ut.current),St(ve,t),Ae===null&&(Ae=t)}function Vo(t){t.tag===22?(St(Ut,Ut.current),St(ve,t),Ae===null&&(Ae=t)):oa()}function oa(){St(Ut,Ut.current),St(ve,ve.current)}function re(t){Xt(ve),Ae===t&&(Ae=null),Xt(Ut)}var Ut=ke(0);function Hi(t){for(var e=t;e!==null;){if(e.tag===13){var a=e.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||Ws(a)||Fs(a)))return e}else if(e.tag===19&&(e.memoizedProps.revealOrder==="forwards"||e.memoizedProps.revealOrder==="backwards"||e.memoizedProps.revealOrder==="unstable_legacy-backwards"||e.memoizedProps.revealOrder==="together")){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var ea=0,ut=null,bt=null,Rt=null,ki=!1,xl=!1,Va=!1,Li=0,An=0,Sl=null,w0=0;function Nt(){throw Error(G(321))}function Nr(t,e){if(e===null)return!1;for(var a=0;a<e.length&&a<t.length;a++)if(!pe(t[a],e[a]))return!1;return!0}function Or(t,e,a,l,n,i){return ea=i,ut=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,lt.H=t===null||t.memoizedState===null?zd:Zr,Va=!1,i=a(l,n),Va=!1,xl&&(i=Jo(e,a,l,n)),Ko(t),i}function Ko(t){lt.H=Tn;var e=bt!==null&&bt.next!==null;if(ea=0,Rt=bt=ut=null,ki=!1,An=0,Sl=null,e)throw Error(G(300));t===null||kt||(t=t.dependencies,t!==null&&Mi(t)&&(kt=!0))}function Jo(t,e,a,l){ut=t;var n=0;do{if(xl&&(Sl=null),An=0,xl=!1,25<=n)throw Error(G(301));if(n+=1,Rt=bt=null,t.updateQueue!=null){var i=t.updateQueue;i.lastEffect=null,i.events=null,i.stores=null,i.memoCache!=null&&(i.memoCache.index=0)}lt.H=Ed,i=e(a,l)}while(xl);return i}function N0(){var t=lt.H,e=t.useState()[0];return e=typeof e.then=="function"?Ln(e):e,t=t.useState()[0],(bt!==null?bt.memoizedState:null)!==t&&(ut.flags|=1024),e}function Cr(){var t=Li!==0;return Li=0,t}function jr(t,e,a){e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~a}function Dr(t){if(ki){for(t=t.memoizedState;t!==null;){var e=t.queue;e!==null&&(e.pending=null),t=t.next}ki=!1}ea=0,Rt=bt=ut=null,xl=!1,An=Li=0,Sl=null}function $t(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Rt===null?ut.memoizedState=Rt=t:Rt=Rt.next=t,Rt}function Mt(){if(bt===null){var t=ut.alternate;t=t!==null?t.memoizedState:null}else t=bt.next;var e=Rt===null?ut.memoizedState:Rt.next;if(e!==null)Rt=e,bt=t;else{if(t===null)throw ut.alternate===null?Error(G(467)):Error(G(310));bt=t,t={memoizedState:bt.memoizedState,baseState:bt.baseState,baseQueue:bt.baseQueue,queue:bt.queue,next:null},Rt===null?ut.memoizedState=Rt=t:Rt=Rt.next=t}return Rt}function ou(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Ln(t){var e=An;return An+=1,Sl===null&&(Sl=[]),t=Yo(Sl,t,e),e=ut,(Rt===null?e.memoizedState:Rt.next)===null&&(e=e.alternate,lt.H=e===null||e.memoizedState===null?zd:Zr),t}function du(t){if(t!==null&&typeof t=="object"){if(typeof t.then=="function")return Ln(t);if(t.$$typeof===Je)return Jt(t)}throw Error(G(438,String(t)))}function Ur(t){var e=null,a=ut.updateQueue;if(a!==null&&(e=a.memoCache),e==null){var l=ut.alternate;l!==null&&(l=l.updateQueue,l!==null&&(l=l.memoCache,l!=null&&(e={data:l.data.map(function(n){return n.slice()}),index:0})))}if(e==null&&(e={data:[],index:0}),a===null&&(a=ou(),ut.updateQueue=a),a.memoCache=e,a=e.data[e.index],a===void 0)for(a=e.data[e.index]=Array(t),l=0;l<t;l++)a[l]=hm;return e.index++,a}function aa(t,e){return typeof e=="function"?e(t):e}function gi(t){var e=Mt();return Mr(e,bt,t)}function Mr(t,e,a){var l=t.queue;if(l===null)throw Error(G(311));l.lastRenderedReducer=a;var n=t.baseQueue,i=l.pending;if(i!==null){if(n!==null){var u=n.next;n.next=i.next,i.next=u}e.baseQueue=n=i,l.pending=null}if(i=t.baseState,n===null)t.memoizedState=i;else{e=n.next;var s=u=null,r=null,h=e,b=!1;do{var y=h.lane&-536870913;if(y!==h.lane?(ct&y)===y:(ea&y)===y){var m=h.revertLane;if(m===0)r!==null&&(r=r.next={lane:0,revertLane:0,gesture:null,action:h.action,hasEagerState:h.hasEagerState,eagerState:h.eagerState,next:null}),y===Tl&&(b=!0);else if((ea&m)===m){h=h.next,m===Tl&&(b=!0);continue}else y={lane:0,revertLane:h.revertLane,gesture:null,action:h.action,hasEagerState:h.hasEagerState,eagerState:h.eagerState,next:null},r===null?(s=r=y,u=i):r=r.next=y,ut.lanes|=m,Ca|=m;y=h.action,Va&&a(i,y),i=h.hasEagerState?h.eagerState:a(i,y)}else m={lane:y,revertLane:h.revertLane,gesture:h.gesture,action:h.action,hasEagerState:h.hasEagerState,eagerState:h.eagerState,next:null},r===null?(s=r=m,u=i):r=r.next=m,ut.lanes|=y,Ca|=y;h=h.next}while(h!==null&&h!==e);if(r===null?u=i:r.next=s,!pe(i,t.memoizedState)&&(kt=!0,b&&(a=bl,a!==null)))throw a;t.memoizedState=i,t.baseState=u,t.baseQueue=r,l.lastRenderedState=i}return n===null&&(l.lanes=0),[t.memoizedState,l.dispatch]}function ku(t){var e=Mt(),a=e.queue;if(a===null)throw Error(G(311));a.lastRenderedReducer=t;var l=a.dispatch,n=a.pending,i=e.memoizedState;if(n!==null){a.pending=null;var u=n=n.next;do i=t(i,u.action),u=u.next;while(u!==n);pe(i,e.memoizedState)||(kt=!0),e.memoizedState=i,e.baseQueue===null&&(e.baseState=i),a.lastRenderedState=i}return[i,l]}function Wo(t,e,a){var l=ut,n=Mt(),i=ft;if(i){if(a===void 0)throw Error(G(407));a=a()}else a=e();var u=!pe((bt||n).memoizedState,a);if(u&&(n.memoizedState=a,kt=!0),n=n.queue,Rr(Io.bind(null,l,n,t),[t]),n.getSnapshot!==e||u||Rt!==null&&Rt.memoizedState.tag&1){if(l.flags|=2048,Nl(9,{destroy:void 0},$o.bind(null,l,n,a,e),null),_t===null)throw Error(G(349));i||ea&127||Fo(l,e,a)}return a}function Fo(t,e,a){t.flags|=16384,t={getSnapshot:e,value:a},e=ut.updateQueue,e===null?(e=ou(),ut.updateQueue=e,e.stores=[t]):(a=e.stores,a===null?e.stores=[t]:a.push(t))}function $o(t,e,a,l){e.value=a,e.getSnapshot=l,Po(e)&&td(t)}function Io(t,e,a){return a(function(){Po(e)&&td(t)})}function Po(t){var e=t.getSnapshot;t=t.value;try{var a=e();return!pe(t,a)}catch{return!0}}function td(t){var e=$a(t,2);e!==null&&ne(e,t,2)}function js(t){var e=$t();if(typeof t=="function"){var a=t;if(t=a(),Va){ha(!0);try{a()}finally{ha(!1)}}}return e.memoizedState=e.baseState=t,e.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:aa,lastRenderedState:t},e}function ed(t,e,a,l){return t.baseState=a,Mr(t,bt,typeof l=="function"?l:aa)}function O0(t,e,a,l,n){if(mu(t))throw Error(G(485));if(t=e.action,t!==null){var i={payload:n,action:t,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(u){i.listeners.push(u)}};lt.T!==null?a(!0):i.isTransition=!1,l(i),a=e.pending,a===null?(i.next=e.pending=i,ad(e,i)):(i.next=a.next,e.pending=a.next=i)}}function ad(t,e){var a=e.action,l=e.payload,n=t.state;if(e.isTransition){var i=lt.T,u={};lt.T=u;try{var s=a(n,l),r=lt.S;r!==null&&r(u,s),Zc(t,e,s)}catch(h){Ds(t,e,h)}finally{i!==null&&u.types!==null&&(i.types=u.types),lt.T=i}}else try{i=a(n,l),Zc(t,e,i)}catch(h){Ds(t,e,h)}}function Zc(t,e,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(l){Yc(t,e,l)},function(l){return Ds(t,e,l)}):Yc(t,e,a)}function Yc(t,e,a){e.status="fulfilled",e.value=a,ld(e),t.state=a,e=t.pending,e!==null&&(a=e.next,a===e?t.pending=null:(a=a.next,e.next=a,ad(t,a)))}function Ds(t,e,a){var l=t.pending;if(t.pending=null,l!==null){l=l.next;do e.status="rejected",e.reason=a,ld(e),e=e.next;while(e!==l)}t.action=null}function ld(t){t=t.listeners;for(var e=0;e<t.length;e++)(0,t[e])()}function nd(t,e){return e}function Gc(t,e){if(ft){var a=_t.formState;if(a!==null){t:{var l=ut;if(ft){if(Et){e:{for(var n=Et,i=Ee;n.nodeType!==8;){if(!i){n=null;break e}if(n=Te(n.nextSibling),n===null){n=null;break e}}i=n.data,n=i==="F!"||i==="F"?n:null}if(n){Et=Te(n.nextSibling),l=n.data==="F!";break t}}Na(l)}l=!1}l&&(e=a[0])}}return a=$t(),a.memoizedState=a.baseState=e,l={pending:null,lanes:0,dispatch:null,lastRenderedReducer:nd,lastRenderedState:e},a.queue=l,a=_d.bind(null,ut,l),l.dispatch=a,l=js(!1),i=Lr.bind(null,ut,!1,l.queue),l=$t(),n={state:e,dispatch:null,action:t,pending:null},l.queue=n,a=O0.bind(null,ut,n,i,a),n.dispatch=a,l.memoizedState=t,[e,a,!1]}function qc(t){var e=Mt();return id(e,bt,t)}function id(t,e,a){if(e=Mr(t,e,nd)[0],t=gi(aa)[0],typeof e=="object"&&e!==null&&typeof e.then=="function")try{var l=Ln(e)}catch(u){throw u===kl?fu:u}else l=e;e=Mt();var n=e.queue,i=n.dispatch;return a!==e.memoizedState&&(ut.flags|=2048,Nl(9,{destroy:void 0},C0.bind(null,n,a),null)),[l,i,t]}function C0(t,e){t.action=e}function Xc(t){var e=Mt(),a=bt;if(a!==null)return id(e,a,t);Mt(),e=e.memoizedState,a=Mt();var l=a.queue.dispatch;return a.memoizedState=t,[e,l,!1]}function Nl(t,e,a,l){return t={tag:t,create:a,deps:l,inst:e,next:null},e=ut.updateQueue,e===null&&(e=ou(),ut.updateQueue=e),a=e.lastEffect,a===null?e.lastEffect=t.next=t:(l=a.next,a.next=t,t.next=l,e.lastEffect=t),t}function ud(){return Mt().memoizedState}function yi(t,e,a,l){var n=$t();ut.flags|=t,n.memoizedState=Nl(1|e,{destroy:void 0},a,l===void 0?null:l)}function hu(t,e,a,l){var n=Mt();l=l===void 0?null:l;var i=n.memoizedState.inst;bt!==null&&l!==null&&Nr(l,bt.memoizedState.deps)?n.memoizedState=Nl(e,i,a,l):(ut.flags|=t,n.memoizedState=Nl(1|e,i,a,l))}function Qc(t,e){yi(8390656,8,t,e)}function Rr(t,e){hu(2048,8,t,e)}function j0(t){ut.flags|=4;var e=ut.updateQueue;if(e===null)e=ou(),ut.updateQueue=e,e.events=[t];else{var a=e.events;a===null?e.events=[t]:a.push(t)}}function sd(t){var e=Mt().memoizedState;return j0({ref:e,nextImpl:t}),function(){if(ht&2)throw Error(G(440));return e.impl.apply(void 0,arguments)}}function rd(t,e){return hu(4,2,t,e)}function cd(t,e){return hu(4,4,t,e)}function fd(t,e){if(typeof e=="function"){t=t();var a=e(t);return function(){typeof a=="function"?a():e(null)}}if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function od(t,e,a){a=a!=null?a.concat([t]):null,hu(4,4,fd.bind(null,e,t),a)}function Br(){}function dd(t,e){var a=Mt();e=e===void 0?null:e;var l=a.memoizedState;return e!==null&&Nr(e,l[1])?l[0]:(a.memoizedState=[t,e],t)}function hd(t,e){var a=Mt();e=e===void 0?null:e;var l=a.memoizedState;if(e!==null&&Nr(e,l[1]))return l[0];if(l=t(),Va){ha(!0);try{t()}finally{ha(!1)}}return a.memoizedState=[l,e],l}function Hr(t,e,a){return a===void 0||ea&1073741824&&!(ct&261930)?t.memoizedState=e:(t.memoizedState=a,t=eh(),ut.lanes|=t,Ca|=t,a)}function md(t,e,a,l){return pe(a,e)?a:wl.current!==null?(t=Hr(t,a,l),pe(t,e)||(kt=!0),t):!(ea&42)||ea&1073741824&&!(ct&261930)?(kt=!0,t.memoizedState=a):(t=eh(),ut.lanes|=t,Ca|=t,e)}function pd(t,e,a,l,n){var i=mt.p;mt.p=i!==0&&8>i?i:8;var u=lt.T,s={};lt.T=s,Lr(t,!1,e,a);try{var r=n(),h=lt.S;if(h!==null&&h(s,r),r!==null&&typeof r=="object"&&typeof r.then=="function"){var b=T0(r,l);dn(t,e,b,me(t))}else dn(t,e,l,me(t))}catch(y){dn(t,e,{then:function(){},status:"rejected",reason:y},me())}finally{mt.p=i,u!==null&&s.types!==null&&(u.types=s.types),lt.T=u}}function D0(){}function Us(t,e,a,l){if(t.tag!==5)throw Error(G(476));var n=vd(t).queue;pd(t,n,e,ka,a===null?D0:function(){return gd(t),a(l)})}function vd(t){var e=t.memoizedState;if(e!==null)return e;e={memoizedState:ka,baseState:ka,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:aa,lastRenderedState:ka},next:null};var a={};return e.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:aa,lastRenderedState:a},next:null},t.memoizedState=e,t=t.alternate,t!==null&&(t.memoizedState=e),e}function gd(t){var e=vd(t);e.next===null&&(e=t.alternate.memoizedState),dn(t,e.next.queue,{},me())}function kr(){return Jt(On)}function yd(){return Mt().memoizedState}function bd(){return Mt().memoizedState}function U0(t){for(var e=t.return;e!==null;){switch(e.tag){case 24:case 3:var a=me();t=_a(a);var l=xa(e,t,a);l!==null&&(ne(l,e,a),cn(l,e,a)),e={cache:zr()},t.payload=e;return}e=e.return}}function M0(t,e,a){var l=me();a={lane:l,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},mu(t)?xd(e,a):(a=br(t,e,a,l),a!==null&&(ne(a,t,l),Sd(a,e,l)))}function _d(t,e,a){var l=me();dn(t,e,a,l)}function dn(t,e,a,l){var n={lane:l,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(mu(t))xd(e,n);else{var i=t.alternate;if(t.lanes===0&&(i===null||i.lanes===0)&&(i=e.lastRenderedReducer,i!==null))try{var u=e.lastRenderedState,s=i(u,a);if(n.hasEagerState=!0,n.eagerState=s,pe(s,u))return cu(t,e,n,0),_t===null&&ru(),!1}catch{}finally{}if(a=br(t,e,n,l),a!==null)return ne(a,t,l),Sd(a,e,l),!0}return!1}function Lr(t,e,a,l){if(l={lane:2,revertLane:Jr(),gesture:null,action:l,hasEagerState:!1,eagerState:null,next:null},mu(t)){if(e)throw Error(G(479))}else e=br(t,a,l,2),e!==null&&ne(e,t,2)}function mu(t){var e=t.alternate;return t===ut||e!==null&&e===ut}function xd(t,e){xl=ki=!0;var a=t.pending;a===null?e.next=e:(e.next=a.next,a.next=e),t.pending=e}function Sd(t,e,a){if(a&4194048){var l=e.lanes;l&=t.pendingLanes,a|=l,e.lanes=a,uo(t,a)}}var Tn={readContext:Jt,use:du,useCallback:Nt,useContext:Nt,useEffect:Nt,useImperativeHandle:Nt,useLayoutEffect:Nt,useInsertionEffect:Nt,useMemo:Nt,useReducer:Nt,useRef:Nt,useState:Nt,useDebugValue:Nt,useDeferredValue:Nt,useTransition:Nt,useSyncExternalStore:Nt,useId:Nt,useHostTransitionStatus:Nt,useFormState:Nt,useActionState:Nt,useOptimistic:Nt,useMemoCache:Nt,useCacheRefresh:Nt};Tn.useEffectEvent=Nt;var zd={readContext:Jt,use:du,useCallback:function(t,e){return $t().memoizedState=[t,e===void 0?null:e],t},useContext:Jt,useEffect:Qc,useImperativeHandle:function(t,e,a){a=a!=null?a.concat([t]):null,yi(4194308,4,fd.bind(null,e,t),a)},useLayoutEffect:function(t,e){return yi(4194308,4,t,e)},useInsertionEffect:function(t,e){yi(4,2,t,e)},useMemo:function(t,e){var a=$t();e=e===void 0?null:e;var l=t();if(Va){ha(!0);try{t()}finally{ha(!1)}}return a.memoizedState=[l,e],l},useReducer:function(t,e,a){var l=$t();if(a!==void 0){var n=a(e);if(Va){ha(!0);try{a(e)}finally{ha(!1)}}}else n=e;return l.memoizedState=l.baseState=n,t={pending:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:n},l.queue=t,t=t.dispatch=M0.bind(null,ut,t),[l.memoizedState,t]},useRef:function(t){var e=$t();return t={current:t},e.memoizedState=t},useState:function(t){t=js(t);var e=t.queue,a=_d.bind(null,ut,e);return e.dispatch=a,[t.memoizedState,a]},useDebugValue:Br,useDeferredValue:function(t,e){var a=$t();return Hr(a,t,e)},useTransition:function(){var t=js(!1);return t=pd.bind(null,ut,t.queue,!0,!1),$t().memoizedState=t,[!1,t]},useSyncExternalStore:function(t,e,a){var l=ut,n=$t();if(ft){if(a===void 0)throw Error(G(407));a=a()}else{if(a=e(),_t===null)throw Error(G(349));ct&127||Fo(l,e,a)}n.memoizedState=a;var i={value:a,getSnapshot:e};return n.queue=i,Qc(Io.bind(null,l,i,t),[t]),l.flags|=2048,Nl(9,{destroy:void 0},$o.bind(null,l,i,a,e),null),a},useId:function(){var t=$t(),e=_t.identifierPrefix;if(ft){var a=Re,l=Me;a=(l&~(1<<32-he(l)-1)).toString(32)+a,e="_"+e+"R_"+a,a=Li++,0<a&&(e+="H"+a.toString(32)),e+="_"}else a=w0++,e="_"+e+"r_"+a.toString(32)+"_";return t.memoizedState=e},useHostTransitionStatus:kr,useFormState:Gc,useActionState:Gc,useOptimistic:function(t){var e=$t();e.memoizedState=e.baseState=t;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return e.queue=a,e=Lr.bind(null,ut,!0,a),a.dispatch=e,[t,e]},useMemoCache:Ur,useCacheRefresh:function(){return $t().memoizedState=U0.bind(null,ut)},useEffectEvent:function(t){var e=$t(),a={impl:t};return e.memoizedState=a,function(){if(ht&2)throw Error(G(440));return a.impl.apply(void 0,arguments)}}},Zr={readContext:Jt,use:du,useCallback:dd,useContext:Jt,useEffect:Rr,useImperativeHandle:od,useInsertionEffect:rd,useLayoutEffect:cd,useMemo:hd,useReducer:gi,useRef:ud,useState:function(){return gi(aa)},useDebugValue:Br,useDeferredValue:function(t,e){var a=Mt();return md(a,bt.memoizedState,t,e)},useTransition:function(){var t=gi(aa)[0],e=Mt().memoizedState;return[typeof t=="boolean"?t:Ln(t),e]},useSyncExternalStore:Wo,useId:yd,useHostTransitionStatus:kr,useFormState:qc,useActionState:qc,useOptimistic:function(t,e){var a=Mt();return ed(a,bt,t,e)},useMemoCache:Ur,useCacheRefresh:bd};Zr.useEffectEvent=sd;var Ed={readContext:Jt,use:du,useCallback:dd,useContext:Jt,useEffect:Rr,useImperativeHandle:od,useInsertionEffect:rd,useLayoutEffect:cd,useMemo:hd,useReducer:ku,useRef:ud,useState:function(){return ku(aa)},useDebugValue:Br,useDeferredValue:function(t,e){var a=Mt();return bt===null?Hr(a,t,e):md(a,bt.memoizedState,t,e)},useTransition:function(){var t=ku(aa)[0],e=Mt().memoizedState;return[typeof t=="boolean"?t:Ln(t),e]},useSyncExternalStore:Wo,useId:yd,useHostTransitionStatus:kr,useFormState:Xc,useActionState:Xc,useOptimistic:function(t,e){var a=Mt();return bt!==null?ed(a,bt,t,e):(a.baseState=t,[t,a.queue.dispatch])},useMemoCache:Ur,useCacheRefresh:bd};Ed.useEffectEvent=sd;function Lu(t,e,a,l){e=t.memoizedState,a=a(l,e),a=a==null?e:Tt({},e,a),t.memoizedState=a,t.lanes===0&&(t.updateQueue.baseState=a)}var Ms={enqueueSetState:function(t,e,a){t=t._reactInternals;var l=me(),n=_a(l);n.payload=e,a!=null&&(n.callback=a),e=xa(t,n,l),e!==null&&(ne(e,t,l),cn(e,t,l))},enqueueReplaceState:function(t,e,a){t=t._reactInternals;var l=me(),n=_a(l);n.tag=1,n.payload=e,a!=null&&(n.callback=a),e=xa(t,n,l),e!==null&&(ne(e,t,l),cn(e,t,l))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var a=me(),l=_a(a);l.tag=2,e!=null&&(l.callback=e),e=xa(t,l,a),e!==null&&(ne(e,t,a),cn(e,t,a))}};function Vc(t,e,a,l,n,i,u){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(l,i,u):e.prototype&&e.prototype.isPureReactComponent?!xn(a,l)||!xn(n,i):!0}function Kc(t,e,a,l){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(a,l),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(a,l),e.state!==t&&Ms.enqueueReplaceState(e,e.state,null)}function Ka(t,e){var a=e;if("ref"in e){a={};for(var l in e)l!=="ref"&&(a[l]=e[l])}if(t=t.defaultProps){a===e&&(a=Tt({},a));for(var n in t)a[n]===void 0&&(a[n]=t[n])}return a}function Ad(t){ji(t)}function Td(t){console.error(t)}function wd(t){ji(t)}function Zi(t,e){try{var a=t.onUncaughtError;a(e.value,{componentStack:e.stack})}catch(l){setTimeout(function(){throw l})}}function Jc(t,e,a){try{var l=t.onCaughtError;l(a.value,{componentStack:a.stack,errorBoundary:e.tag===1?e.stateNode:null})}catch(n){setTimeout(function(){throw n})}}function Rs(t,e,a){return a=_a(a),a.tag=3,a.payload={element:null},a.callback=function(){Zi(t,e)},a}function Nd(t){return t=_a(t),t.tag=3,t}function Od(t,e,a,l){var n=a.type.getDerivedStateFromError;if(typeof n=="function"){var i=l.value;t.payload=function(){return n(i)},t.callback=function(){Jc(e,a,l)}}var u=a.stateNode;u!==null&&typeof u.componentDidCatch=="function"&&(t.callback=function(){Jc(e,a,l),typeof n!="function"&&(Sa===null?Sa=new Set([this]):Sa.add(this));var s=l.stack;this.componentDidCatch(l.value,{componentStack:s!==null?s:""})})}function R0(t,e,a,l,n){if(a.flags|=32768,l!==null&&typeof l=="object"&&typeof l.then=="function"){if(e=a.alternate,e!==null&&Hl(e,a,n,!0),a=ve.current,a!==null){switch(a.tag){case 31:case 13:return Ae===null?Qi():a.alternate===null&&Ot===0&&(Ot=3),a.flags&=-257,a.flags|=65536,a.lanes=n,l===Ri?a.flags|=16384:(e=a.updateQueue,e===null?a.updateQueue=new Set([l]):e.add(l),Fu(t,l,n)),!1;case 22:return a.flags|=65536,l===Ri?a.flags|=16384:(e=a.updateQueue,e===null?(e={transitions:null,markerInstances:null,retryQueue:new Set([l])},a.updateQueue=e):(a=e.retryQueue,a===null?e.retryQueue=new Set([l]):a.add(l)),Fu(t,l,n)),!1}throw Error(G(435,a.tag))}return Fu(t,l,n),Qi(),!1}if(ft)return e=ve.current,e!==null?(!(e.flags&65536)&&(e.flags|=256),e.flags|=65536,e.lanes=n,l!==Ss&&(t=Error(G(422),{cause:l}),zn(ze(t,a)))):(l!==Ss&&(e=Error(G(423),{cause:l}),zn(ze(e,a))),t=t.current.alternate,t.flags|=65536,n&=-n,t.lanes|=n,l=ze(l,a),n=Rs(t.stateNode,l,n),Hu(t,n),Ot!==4&&(Ot=2)),!1;var i=Error(G(520),{cause:l});if(i=ze(i,a),pn===null?pn=[i]:pn.push(i),Ot!==4&&(Ot=2),e===null)return!0;l=ze(l,a),a=e;do{switch(a.tag){case 3:return a.flags|=65536,t=n&-n,a.lanes|=t,t=Rs(a.stateNode,l,t),Hu(a,t),!1;case 1:if(e=a.type,i=a.stateNode,(a.flags&128)===0&&(typeof e.getDerivedStateFromError=="function"||i!==null&&typeof i.componentDidCatch=="function"&&(Sa===null||!Sa.has(i))))return a.flags|=65536,n&=-n,a.lanes|=n,n=Nd(n),Od(n,t,a,l),Hu(a,n),!1}a=a.return}while(a!==null);return!1}var Yr=Error(G(461)),kt=!1;function Qt(t,e,a,l){e.child=t===null?qo(e,null,a,l):Qa(e,t.child,a,l)}function Wc(t,e,a,l,n){a=a.render;var i=e.ref;if("ref"in l){var u={};for(var s in l)s!=="ref"&&(u[s]=l[s])}else u=l;return Xa(e),l=Or(t,e,a,u,i,n),s=Cr(),t!==null&&!kt?(jr(t,e,n),la(t,e,n)):(ft&&s&&xr(e),e.flags|=1,Qt(t,e,l,n),e.child)}function Fc(t,e,a,l,n){if(t===null){var i=a.type;return typeof i=="function"&&!_r(i)&&i.defaultProps===void 0&&a.compare===null?(e.tag=15,e.type=i,Cd(t,e,i,l,n)):(t=pi(a.type,null,l,e,e.mode,n),t.ref=e.ref,t.return=e,e.child=t)}if(i=t.child,!Gr(t,n)){var u=i.memoizedProps;if(a=a.compare,a=a!==null?a:xn,a(u,l)&&t.ref===e.ref)return la(t,e,n)}return e.flags|=1,t=$e(i,l),t.ref=e.ref,t.return=e,e.child=t}function Cd(t,e,a,l,n){if(t!==null){var i=t.memoizedProps;if(xn(i,l)&&t.ref===e.ref)if(kt=!1,e.pendingProps=l=i,Gr(t,n))t.flags&131072&&(kt=!0);else return e.lanes=t.lanes,la(t,e,n)}return Bs(t,e,a,l,n)}function jd(t,e,a,l){var n=l.children,i=t!==null?t.memoizedState:null;if(t===null&&e.stateNode===null&&(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),l.mode==="hidden"){if(e.flags&128){if(i=i!==null?i.baseLanes|a:a,t!==null){for(l=e.child=t.child,n=0;l!==null;)n=n|l.lanes|l.childLanes,l=l.sibling;l=n&~i}else l=0,e.child=null;return $c(t,e,i,a,l)}if(a&536870912)e.memoizedState={baseLanes:0,cachePool:null},t!==null&&vi(e,i!==null?i.cachePool:null),i!==null?Lc(e,i):Os(),Vo(e);else return l=e.lanes=536870912,$c(t,e,i!==null?i.baseLanes|a:a,a,l)}else i!==null?(vi(e,i.cachePool),Lc(e,i),oa(),e.memoizedState=null):(t!==null&&vi(e,null),Os(),oa());return Qt(t,e,n,a),e.child}function en(t,e){return t!==null&&t.tag===22||e.stateNode!==null||(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),e.sibling}function $c(t,e,a,l,n){var i=Er();return i=i===null?null:{parent:Ht._currentValue,pool:i},e.memoizedState={baseLanes:a,cachePool:i},t!==null&&vi(e,null),Os(),Vo(e),t!==null&&Hl(t,e,l,!0),e.childLanes=n,null}function bi(t,e){return e=Yi({mode:e.mode,children:e.children},t.mode),e.ref=t.ref,t.child=e,e.return=t,e}function Ic(t,e,a){return Qa(e,t.child,null,a),t=bi(e,e.pendingProps),t.flags|=2,re(e),e.memoizedState=null,t}function B0(t,e,a){var l=e.pendingProps,n=(e.flags&128)!==0;if(e.flags&=-129,t===null){if(ft){if(l.mode==="hidden")return t=bi(e,l),e.lanes=536870912,en(null,t);if(Cs(e),(t=Et)?(t=zh(t,Ee),t=t!==null&&t.data==="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:wa!==null?{id:Me,overflow:Re}:null,retryLane:536870912,hydrationErrors:null},a=Bo(t),a.return=e,e.child=a,Kt=e,Et=null)):t=null,t===null)throw Na(e);return e.lanes=536870912,null}return bi(e,l)}var i=t.memoizedState;if(i!==null){var u=i.dehydrated;if(Cs(e),n)if(e.flags&256)e.flags&=-257,e=Ic(t,e,a);else if(e.memoizedState!==null)e.child=t.child,e.flags|=128,e=null;else throw Error(G(558));else if(kt||Hl(t,e,a,!1),n=(a&t.childLanes)!==0,kt||n){if(l=_t,l!==null&&(u=so(l,a),u!==0&&u!==i.retryLane))throw i.retryLane=u,$a(t,u),ne(l,t,u),Yr;Qi(),e=Ic(t,e,a)}else t=i.treeContext,Et=Te(u.nextSibling),Kt=e,ft=!0,ba=null,Ee=!1,t!==null&&ko(e,t),e=bi(e,l),e.flags|=4096;return e}return t=$e(t.child,{mode:l.mode,children:l.children}),t.ref=e.ref,e.child=t,t.return=e,t}function _i(t,e){var a=e.ref;if(a===null)t!==null&&t.ref!==null&&(e.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(G(284));(t===null||t.ref!==a)&&(e.flags|=4194816)}}function Bs(t,e,a,l,n){return Xa(e),a=Or(t,e,a,l,void 0,n),l=Cr(),t!==null&&!kt?(jr(t,e,n),la(t,e,n)):(ft&&l&&xr(e),e.flags|=1,Qt(t,e,a,n),e.child)}function Pc(t,e,a,l,n,i){return Xa(e),e.updateQueue=null,a=Jo(e,l,a,n),Ko(t),l=Cr(),t!==null&&!kt?(jr(t,e,i),la(t,e,i)):(ft&&l&&xr(e),e.flags|=1,Qt(t,e,a,i),e.child)}function tf(t,e,a,l,n){if(Xa(e),e.stateNode===null){var i=dl,u=a.contextType;typeof u=="object"&&u!==null&&(i=Jt(u)),i=new a(l,i),e.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,i.updater=Ms,e.stateNode=i,i._reactInternals=e,i=e.stateNode,i.props=l,i.state=e.memoizedState,i.refs={},Tr(e),u=a.contextType,i.context=typeof u=="object"&&u!==null?Jt(u):dl,i.state=e.memoizedState,u=a.getDerivedStateFromProps,typeof u=="function"&&(Lu(e,a,u,l),i.state=e.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof i.getSnapshotBeforeUpdate=="function"||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(u=i.state,typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount(),u!==i.state&&Ms.enqueueReplaceState(i,i.state,null),on(e,l,i,n),fn(),i.state=e.memoizedState),typeof i.componentDidMount=="function"&&(e.flags|=4194308),l=!0}else if(t===null){i=e.stateNode;var s=e.memoizedProps,r=Ka(a,s);i.props=r;var h=i.context,b=a.contextType;u=dl,typeof b=="object"&&b!==null&&(u=Jt(b));var y=a.getDerivedStateFromProps;b=typeof y=="function"||typeof i.getSnapshotBeforeUpdate=="function",s=e.pendingProps!==s,b||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(s||h!==u)&&Kc(e,i,l,u),ra=!1;var m=e.memoizedState;i.state=m,on(e,l,i,n),fn(),h=e.memoizedState,s||m!==h||ra?(typeof y=="function"&&(Lu(e,a,y,l),h=e.memoizedState),(r=ra||Vc(e,a,r,l,m,h,u))?(b||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount()),typeof i.componentDidMount=="function"&&(e.flags|=4194308)):(typeof i.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=l,e.memoizedState=h),i.props=l,i.state=h,i.context=u,l=r):(typeof i.componentDidMount=="function"&&(e.flags|=4194308),l=!1)}else{i=e.stateNode,ws(t,e),u=e.memoizedProps,b=Ka(a,u),i.props=b,y=e.pendingProps,m=i.context,h=a.contextType,r=dl,typeof h=="object"&&h!==null&&(r=Jt(h)),s=a.getDerivedStateFromProps,(h=typeof s=="function"||typeof i.getSnapshotBeforeUpdate=="function")||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(u!==y||m!==r)&&Kc(e,i,l,r),ra=!1,m=e.memoizedState,i.state=m,on(e,l,i,n),fn();var o=e.memoizedState;u!==y||m!==o||ra||t!==null&&t.dependencies!==null&&Mi(t.dependencies)?(typeof s=="function"&&(Lu(e,a,s,l),o=e.memoizedState),(b=ra||Vc(e,a,b,l,m,o,r)||t!==null&&t.dependencies!==null&&Mi(t.dependencies))?(h||typeof i.UNSAFE_componentWillUpdate!="function"&&typeof i.componentWillUpdate!="function"||(typeof i.componentWillUpdate=="function"&&i.componentWillUpdate(l,o,r),typeof i.UNSAFE_componentWillUpdate=="function"&&i.UNSAFE_componentWillUpdate(l,o,r)),typeof i.componentDidUpdate=="function"&&(e.flags|=4),typeof i.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof i.componentDidUpdate!="function"||u===t.memoizedProps&&m===t.memoizedState||(e.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||u===t.memoizedProps&&m===t.memoizedState||(e.flags|=1024),e.memoizedProps=l,e.memoizedState=o),i.props=l,i.state=o,i.context=r,l=b):(typeof i.componentDidUpdate!="function"||u===t.memoizedProps&&m===t.memoizedState||(e.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||u===t.memoizedProps&&m===t.memoizedState||(e.flags|=1024),l=!1)}return i=l,_i(t,e),l=(e.flags&128)!==0,i||l?(i=e.stateNode,a=l&&typeof a.getDerivedStateFromError!="function"?null:i.render(),e.flags|=1,t!==null&&l?(e.child=Qa(e,t.child,null,n),e.child=Qa(e,null,a,n)):Qt(t,e,a,n),e.memoizedState=i.state,t=e.child):t=la(t,e,n),t}function ef(t,e,a,l){return qa(),e.flags|=256,Qt(t,e,a,l),e.child}var Zu={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Yu(t){return{baseLanes:t,cachePool:Zo()}}function Gu(t,e,a){return t=t!==null?t.childLanes&~a:0,e&&(t|=fe),t}function Dd(t,e,a){var l=e.pendingProps,n=!1,i=(e.flags&128)!==0,u;if((u=i)||(u=t!==null&&t.memoizedState===null?!1:(Ut.current&2)!==0),u&&(n=!0,e.flags&=-129),u=(e.flags&32)!==0,e.flags&=-33,t===null){if(ft){if(n?fa(e):oa(),(t=Et)?(t=zh(t,Ee),t=t!==null&&t.data!=="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:wa!==null?{id:Me,overflow:Re}:null,retryLane:536870912,hydrationErrors:null},a=Bo(t),a.return=e,e.child=a,Kt=e,Et=null)):t=null,t===null)throw Na(e);return Fs(t)?e.lanes=32:e.lanes=536870912,null}var s=l.children;return l=l.fallback,n?(oa(),n=e.mode,s=Yi({mode:"hidden",children:s},n),l=La(l,n,a,null),s.return=e,l.return=e,s.sibling=l,e.child=s,l=e.child,l.memoizedState=Yu(a),l.childLanes=Gu(t,u,a),e.memoizedState=Zu,en(null,l)):(fa(e),Hs(e,s))}var r=t.memoizedState;if(r!==null&&(s=r.dehydrated,s!==null)){if(i)e.flags&256?(fa(e),e.flags&=-257,e=qu(t,e,a)):e.memoizedState!==null?(oa(),e.child=t.child,e.flags|=128,e=null):(oa(),s=l.fallback,n=e.mode,l=Yi({mode:"visible",children:l.children},n),s=La(s,n,a,null),s.flags|=2,l.return=e,s.return=e,l.sibling=s,e.child=l,Qa(e,t.child,null,a),l=e.child,l.memoizedState=Yu(a),l.childLanes=Gu(t,u,a),e.memoizedState=Zu,e=en(null,l));else if(fa(e),Fs(s)){if(u=s.nextSibling&&s.nextSibling.dataset,u)var h=u.dgst;u=h,l=Error(G(419)),l.stack="",l.digest=u,zn({value:l,source:null,stack:null}),e=qu(t,e,a)}else if(kt||Hl(t,e,a,!1),u=(a&t.childLanes)!==0,kt||u){if(u=_t,u!==null&&(l=so(u,a),l!==0&&l!==r.retryLane))throw r.retryLane=l,$a(t,l),ne(u,t,l),Yr;Ws(s)||Qi(),e=qu(t,e,a)}else Ws(s)?(e.flags|=192,e.child=t.child,e=null):(t=r.treeContext,Et=Te(s.nextSibling),Kt=e,ft=!0,ba=null,Ee=!1,t!==null&&ko(e,t),e=Hs(e,l.children),e.flags|=4096);return e}return n?(oa(),s=l.fallback,n=e.mode,r=t.child,h=r.sibling,l=$e(r,{mode:"hidden",children:l.children}),l.subtreeFlags=r.subtreeFlags&65011712,h!==null?s=$e(h,s):(s=La(s,n,a,null),s.flags|=2),s.return=e,l.return=e,l.sibling=s,e.child=l,en(null,l),l=e.child,s=t.child.memoizedState,s===null?s=Yu(a):(n=s.cachePool,n!==null?(r=Ht._currentValue,n=n.parent!==r?{parent:r,pool:r}:n):n=Zo(),s={baseLanes:s.baseLanes|a,cachePool:n}),l.memoizedState=s,l.childLanes=Gu(t,u,a),e.memoizedState=Zu,en(t.child,l)):(fa(e),a=t.child,t=a.sibling,a=$e(a,{mode:"visible",children:l.children}),a.return=e,a.sibling=null,t!==null&&(u=e.deletions,u===null?(e.deletions=[t],e.flags|=16):u.push(t)),e.child=a,e.memoizedState=null,a)}function Hs(t,e){return e=Yi({mode:"visible",children:e},t.mode),e.return=t,t.child=e}function Yi(t,e){return t=ce(22,t,null,e),t.lanes=0,t}function qu(t,e,a){return Qa(e,t.child,null,a),t=Hs(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function af(t,e,a){t.lanes|=e;var l=t.alternate;l!==null&&(l.lanes|=e),Es(t.return,e,a)}function Xu(t,e,a,l,n,i){var u=t.memoizedState;u===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:l,tail:a,tailMode:n,treeForkCount:i}:(u.isBackwards=e,u.rendering=null,u.renderingStartTime=0,u.last=l,u.tail=a,u.tailMode=n,u.treeForkCount=i)}function Ud(t,e,a){var l=e.pendingProps,n=l.revealOrder,i=l.tail;l=l.children;var u=Ut.current,s=(u&2)!==0;if(s?(u=u&1|2,e.flags|=128):u&=1,St(Ut,u),Qt(t,e,l,a),l=ft?Sn:0,!s&&t!==null&&t.flags&128)t:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&af(t,a,e);else if(t.tag===19)af(t,a,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break t;for(;t.sibling===null;){if(t.return===null||t.return===e)break t;t=t.return}t.sibling.return=t.return,t=t.sibling}switch(n){case"forwards":for(a=e.child,n=null;a!==null;)t=a.alternate,t!==null&&Hi(t)===null&&(n=a),a=a.sibling;a=n,a===null?(n=e.child,e.child=null):(n=a.sibling,a.sibling=null),Xu(e,!1,n,a,i,l);break;case"backwards":case"unstable_legacy-backwards":for(a=null,n=e.child,e.child=null;n!==null;){if(t=n.alternate,t!==null&&Hi(t)===null){e.child=n;break}t=n.sibling,n.sibling=a,a=n,n=t}Xu(e,!0,a,null,i,l);break;case"together":Xu(e,!1,null,null,void 0,l);break;default:e.memoizedState=null}return e.child}function la(t,e,a){if(t!==null&&(e.dependencies=t.dependencies),Ca|=e.lanes,!(a&e.childLanes))if(t!==null){if(Hl(t,e,a,!1),(a&e.childLanes)===0)return null}else return null;if(t!==null&&e.child!==t.child)throw Error(G(153));if(e.child!==null){for(t=e.child,a=$e(t,t.pendingProps),e.child=a,a.return=e;t.sibling!==null;)t=t.sibling,a=a.sibling=$e(t,t.pendingProps),a.return=e;a.sibling=null}return e.child}function Gr(t,e){return t.lanes&e?!0:(t=t.dependencies,!!(t!==null&&Mi(t)))}function H0(t,e,a){switch(e.tag){case 3:wi(e,e.stateNode.containerInfo),ca(e,Ht,t.memoizedState.cache),qa();break;case 27:case 5:os(e);break;case 4:wi(e,e.stateNode.containerInfo);break;case 10:ca(e,e.type,e.memoizedProps.value);break;case 31:if(e.memoizedState!==null)return e.flags|=128,Cs(e),null;break;case 13:var l=e.memoizedState;if(l!==null)return l.dehydrated!==null?(fa(e),e.flags|=128,null):a&e.child.childLanes?Dd(t,e,a):(fa(e),t=la(t,e,a),t!==null?t.sibling:null);fa(e);break;case 19:var n=(t.flags&128)!==0;if(l=(a&e.childLanes)!==0,l||(Hl(t,e,a,!1),l=(a&e.childLanes)!==0),n){if(l)return Ud(t,e,a);e.flags|=128}if(n=e.memoizedState,n!==null&&(n.rendering=null,n.tail=null,n.lastEffect=null),St(Ut,Ut.current),l)break;return null;case 22:return e.lanes=0,jd(t,e,a,e.pendingProps);case 24:ca(e,Ht,t.memoizedState.cache)}return la(t,e,a)}function Md(t,e,a){if(t!==null)if(t.memoizedProps!==e.pendingProps)kt=!0;else{if(!Gr(t,a)&&!(e.flags&128))return kt=!1,H0(t,e,a);kt=!!(t.flags&131072)}else kt=!1,ft&&e.flags&1048576&&Ho(e,Sn,e.index);switch(e.lanes=0,e.tag){case 16:t:{var l=e.pendingProps;if(t=Ba(e.elementType),e.type=t,typeof t=="function")_r(t)?(l=Ka(t,l),e.tag=1,e=tf(null,e,t,l,a)):(e.tag=0,e=Bs(null,e,t,l,a));else{if(t!=null){var n=t.$$typeof;if(n===ur){e.tag=11,e=Wc(null,e,t,l,a);break t}else if(n===sr){e.tag=14,e=Fc(null,e,t,l,a);break t}}throw e=cs(t)||t,Error(G(306,e,""))}}return e;case 0:return Bs(t,e,e.type,e.pendingProps,a);case 1:return l=e.type,n=Ka(l,e.pendingProps),tf(t,e,l,n,a);case 3:t:{if(wi(e,e.stateNode.containerInfo),t===null)throw Error(G(387));l=e.pendingProps;var i=e.memoizedState;n=i.element,ws(t,e),on(e,l,null,a);var u=e.memoizedState;if(l=u.cache,ca(e,Ht,l),l!==i.cache&&As(e,[Ht],a,!0),fn(),l=u.element,i.isDehydrated)if(i={element:l,isDehydrated:!1,cache:u.cache},e.updateQueue.baseState=i,e.memoizedState=i,e.flags&256){e=ef(t,e,l,a);break t}else if(l!==n){n=ze(Error(G(424)),e),zn(n),e=ef(t,e,l,a);break t}else{switch(t=e.stateNode.containerInfo,t.nodeType){case 9:t=t.body;break;default:t=t.nodeName==="HTML"?t.ownerDocument.body:t}for(Et=Te(t.firstChild),Kt=e,ft=!0,ba=null,Ee=!0,a=qo(e,null,l,a),e.child=a;a;)a.flags=a.flags&-3|4096,a=a.sibling}else{if(qa(),l===n){e=la(t,e,a);break t}Qt(t,e,l,a)}e=e.child}return e;case 26:return _i(t,e),t===null?(a=zf(e.type,null,e.pendingProps,null))?e.memoizedState=a:ft||(a=e.type,t=e.pendingProps,l=Wi(ya.current).createElement(a),l[Vt]=e,l[ie]=t,Wt(l,a,t),qt(l),e.stateNode=l):e.memoizedState=zf(e.type,t.memoizedProps,e.pendingProps,t.memoizedState),null;case 27:return os(e),t===null&&ft&&(l=e.stateNode=Eh(e.type,e.pendingProps,ya.current),Kt=e,Ee=!0,n=Et,Da(e.type)?($s=n,Et=Te(l.firstChild)):Et=n),Qt(t,e,e.pendingProps.children,a),_i(t,e),t===null&&(e.flags|=4194304),e.child;case 5:return t===null&&ft&&((n=l=Et)&&(l=h1(l,e.type,e.pendingProps,Ee),l!==null?(e.stateNode=l,Kt=e,Et=Te(l.firstChild),Ee=!1,n=!0):n=!1),n||Na(e)),os(e),n=e.type,i=e.pendingProps,u=t!==null?t.memoizedProps:null,l=i.children,Ks(n,i)?l=null:u!==null&&Ks(n,u)&&(e.flags|=32),e.memoizedState!==null&&(n=Or(t,e,N0,null,null,a),On._currentValue=n),_i(t,e),Qt(t,e,l,a),e.child;case 6:return t===null&&ft&&((t=a=Et)&&(a=m1(a,e.pendingProps,Ee),a!==null?(e.stateNode=a,Kt=e,Et=null,t=!0):t=!1),t||Na(e)),null;case 13:return Dd(t,e,a);case 4:return wi(e,e.stateNode.containerInfo),l=e.pendingProps,t===null?e.child=Qa(e,null,l,a):Qt(t,e,l,a),e.child;case 11:return Wc(t,e,e.type,e.pendingProps,a);case 7:return Qt(t,e,e.pendingProps,a),e.child;case 8:return Qt(t,e,e.pendingProps.children,a),e.child;case 12:return Qt(t,e,e.pendingProps.children,a),e.child;case 10:return l=e.pendingProps,ca(e,e.type,l.value),Qt(t,e,l.children,a),e.child;case 9:return n=e.type._context,l=e.pendingProps.children,Xa(e),n=Jt(n),l=l(n),e.flags|=1,Qt(t,e,l,a),e.child;case 14:return Fc(t,e,e.type,e.pendingProps,a);case 15:return Cd(t,e,e.type,e.pendingProps,a);case 19:return Ud(t,e,a);case 31:return B0(t,e,a);case 22:return jd(t,e,a,e.pendingProps);case 24:return Xa(e),l=Jt(Ht),t===null?(n=Er(),n===null&&(n=_t,i=zr(),n.pooledCache=i,i.refCount++,i!==null&&(n.pooledCacheLanes|=a),n=i),e.memoizedState={parent:l,cache:n},Tr(e),ca(e,Ht,n)):(t.lanes&a&&(ws(t,e),on(e,null,null,a),fn()),n=t.memoizedState,i=e.memoizedState,n.parent!==l?(n={parent:l,cache:l},e.memoizedState=n,e.lanes===0&&(e.memoizedState=e.updateQueue.baseState=n),ca(e,Ht,l)):(l=i.cache,ca(e,Ht,l),l!==n.cache&&As(e,[Ht],a,!0))),Qt(t,e,e.pendingProps.children,a),e.child;case 29:throw e.pendingProps}throw Error(G(156,e.tag))}function Ge(t){t.flags|=4}function Qu(t,e,a,l,n){if((e=(t.mode&32)!==0)&&(e=!1),e){if(t.flags|=16777216,(n&335544128)===n)if(t.stateNode.complete)t.flags|=8192;else if(nh())t.flags|=8192;else throw Ya=Ri,Ar}else t.flags&=-16777217}function lf(t,e){if(e.type!=="stylesheet"||e.state.loading&4)t.flags&=-16777217;else if(t.flags|=16777216,!wh(e))if(nh())t.flags|=8192;else throw Ya=Ri,Ar}function li(t,e){e!==null&&(t.flags|=4),t.flags&16384&&(e=t.tag!==22?no():536870912,t.lanes|=e,Ol|=e)}function Wl(t,e){if(!ft)switch(t.tailMode){case"hidden":e=t.tail;for(var a=null;e!==null;)e.alternate!==null&&(a=e),e=e.sibling;a===null?t.tail=null:a.sibling=null;break;case"collapsed":a=t.tail;for(var l=null;a!==null;)a.alternate!==null&&(l=a),a=a.sibling;l===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:l.sibling=null}}function zt(t){var e=t.alternate!==null&&t.alternate.child===t.child,a=0,l=0;if(e)for(var n=t.child;n!==null;)a|=n.lanes|n.childLanes,l|=n.subtreeFlags&65011712,l|=n.flags&65011712,n.return=t,n=n.sibling;else for(n=t.child;n!==null;)a|=n.lanes|n.childLanes,l|=n.subtreeFlags,l|=n.flags,n.return=t,n=n.sibling;return t.subtreeFlags|=l,t.childLanes=a,e}function k0(t,e,a){var l=e.pendingProps;switch(Sr(e),e.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return zt(e),null;case 1:return zt(e),null;case 3:return a=e.stateNode,l=null,t!==null&&(l=t.memoizedState.cache),e.memoizedState.cache!==l&&(e.flags|=2048),Ie(Ht),zl(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(t===null||t.child===null)&&(Pa(e)?Ge(e):t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,Bu())),zt(e),null;case 26:var n=e.type,i=e.memoizedState;return t===null?(Ge(e),i!==null?(zt(e),lf(e,i)):(zt(e),Qu(e,n,null,l,a))):i?i!==t.memoizedState?(Ge(e),zt(e),lf(e,i)):(zt(e),e.flags&=-16777217):(t=t.memoizedProps,t!==l&&Ge(e),zt(e),Qu(e,n,t,l,a)),null;case 27:if(Ni(e),a=ya.current,n=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==l&&Ge(e);else{if(!l){if(e.stateNode===null)throw Error(G(166));return zt(e),null}t=He.current,Pa(e)?Dc(e):(t=Eh(n,l,a),e.stateNode=t,Ge(e))}return zt(e),null;case 5:if(Ni(e),n=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==l&&Ge(e);else{if(!l){if(e.stateNode===null)throw Error(G(166));return zt(e),null}if(i=He.current,Pa(e))Dc(e);else{var u=Wi(ya.current);switch(i){case 1:i=u.createElementNS("http://www.w3.org/2000/svg",n);break;case 2:i=u.createElementNS("http://www.w3.org/1998/Math/MathML",n);break;default:switch(n){case"svg":i=u.createElementNS("http://www.w3.org/2000/svg",n);break;case"math":i=u.createElementNS("http://www.w3.org/1998/Math/MathML",n);break;case"script":i=u.createElement("div"),i.innerHTML="<script><\/script>",i=i.removeChild(i.firstChild);break;case"select":i=typeof l.is=="string"?u.createElement("select",{is:l.is}):u.createElement("select"),l.multiple?i.multiple=!0:l.size&&(i.size=l.size);break;default:i=typeof l.is=="string"?u.createElement(n,{is:l.is}):u.createElement(n)}}i[Vt]=e,i[ie]=l;t:for(u=e.child;u!==null;){if(u.tag===5||u.tag===6)i.appendChild(u.stateNode);else if(u.tag!==4&&u.tag!==27&&u.child!==null){u.child.return=u,u=u.child;continue}if(u===e)break t;for(;u.sibling===null;){if(u.return===null||u.return===e)break t;u=u.return}u.sibling.return=u.return,u=u.sibling}e.stateNode=i;t:switch(Wt(i,n,l),n){case"button":case"input":case"select":case"textarea":l=!!l.autoFocus;break t;case"img":l=!0;break t;default:l=!1}l&&Ge(e)}}return zt(e),Qu(e,e.type,t===null?null:t.memoizedProps,e.pendingProps,a),null;case 6:if(t&&e.stateNode!=null)t.memoizedProps!==l&&Ge(e);else{if(typeof l!="string"&&e.stateNode===null)throw Error(G(166));if(t=ya.current,Pa(e)){if(t=e.stateNode,a=e.memoizedProps,l=null,n=Kt,n!==null)switch(n.tag){case 27:case 5:l=n.memoizedProps}t[Vt]=e,t=!!(t.nodeValue===a||l!==null&&l.suppressHydrationWarning===!0||_h(t.nodeValue,a)),t||Na(e,!0)}else t=Wi(t).createTextNode(l),t[Vt]=e,e.stateNode=t}return zt(e),null;case 31:if(a=e.memoizedState,t===null||t.memoizedState!==null){if(l=Pa(e),a!==null){if(t===null){if(!l)throw Error(G(318));if(t=e.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(G(557));t[Vt]=e}else qa(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;zt(e),t=!1}else a=Bu(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=a),t=!0;if(!t)return e.flags&256?(re(e),e):(re(e),null);if(e.flags&128)throw Error(G(558))}return zt(e),null;case 13:if(l=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(n=Pa(e),l!==null&&l.dehydrated!==null){if(t===null){if(!n)throw Error(G(318));if(n=e.memoizedState,n=n!==null?n.dehydrated:null,!n)throw Error(G(317));n[Vt]=e}else qa(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;zt(e),n=!1}else n=Bu(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=n),n=!0;if(!n)return e.flags&256?(re(e),e):(re(e),null)}return re(e),e.flags&128?(e.lanes=a,e):(a=l!==null,t=t!==null&&t.memoizedState!==null,a&&(l=e.child,n=null,l.alternate!==null&&l.alternate.memoizedState!==null&&l.alternate.memoizedState.cachePool!==null&&(n=l.alternate.memoizedState.cachePool.pool),i=null,l.memoizedState!==null&&l.memoizedState.cachePool!==null&&(i=l.memoizedState.cachePool.pool),i!==n&&(l.flags|=2048)),a!==t&&a&&(e.child.flags|=8192),li(e,e.updateQueue),zt(e),null);case 4:return zl(),t===null&&Wr(e.stateNode.containerInfo),zt(e),null;case 10:return Ie(e.type),zt(e),null;case 19:if(Xt(Ut),l=e.memoizedState,l===null)return zt(e),null;if(n=(e.flags&128)!==0,i=l.rendering,i===null)if(n)Wl(l,!1);else{if(Ot!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(i=Hi(t),i!==null){for(e.flags|=128,Wl(l,!1),t=i.updateQueue,e.updateQueue=t,li(e,t),e.subtreeFlags=0,t=a,a=e.child;a!==null;)Ro(a,t),a=a.sibling;return St(Ut,Ut.current&1|2),ft&&Ve(e,l.treeForkCount),e.child}t=t.sibling}l.tail!==null&&oe()>qi&&(e.flags|=128,n=!0,Wl(l,!1),e.lanes=4194304)}else{if(!n)if(t=Hi(i),t!==null){if(e.flags|=128,n=!0,t=t.updateQueue,e.updateQueue=t,li(e,t),Wl(l,!0),l.tail===null&&l.tailMode==="hidden"&&!i.alternate&&!ft)return zt(e),null}else 2*oe()-l.renderingStartTime>qi&&a!==536870912&&(e.flags|=128,n=!0,Wl(l,!1),e.lanes=4194304);l.isBackwards?(i.sibling=e.child,e.child=i):(t=l.last,t!==null?t.sibling=i:e.child=i,l.last=i)}return l.tail!==null?(t=l.tail,l.rendering=t,l.tail=t.sibling,l.renderingStartTime=oe(),t.sibling=null,a=Ut.current,St(Ut,n?a&1|2:a&1),ft&&Ve(e,l.treeForkCount),t):(zt(e),null);case 22:case 23:return re(e),wr(),l=e.memoizedState!==null,t!==null?t.memoizedState!==null!==l&&(e.flags|=8192):l&&(e.flags|=8192),l?a&536870912&&!(e.flags&128)&&(zt(e),e.subtreeFlags&6&&(e.flags|=8192)):zt(e),a=e.updateQueue,a!==null&&li(e,a.retryQueue),a=null,t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(a=t.memoizedState.cachePool.pool),l=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(l=e.memoizedState.cachePool.pool),l!==a&&(e.flags|=2048),t!==null&&Xt(Za),null;case 24:return a=null,t!==null&&(a=t.memoizedState.cache),e.memoizedState.cache!==a&&(e.flags|=2048),Ie(Ht),zt(e),null;case 25:return null;case 30:return null}throw Error(G(156,e.tag))}function L0(t,e){switch(Sr(e),e.tag){case 1:return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return Ie(Ht),zl(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 26:case 27:case 5:return Ni(e),null;case 31:if(e.memoizedState!==null){if(re(e),e.alternate===null)throw Error(G(340));qa()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 13:if(re(e),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(G(340));qa()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return Xt(Ut),null;case 4:return zl(),null;case 10:return Ie(e.type),null;case 22:case 23:return re(e),wr(),t!==null&&Xt(Za),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 24:return Ie(Ht),null;case 25:return null;default:return null}}function Rd(t,e){switch(Sr(e),e.tag){case 3:Ie(Ht),zl();break;case 26:case 27:case 5:Ni(e);break;case 4:zl();break;case 31:e.memoizedState!==null&&re(e);break;case 13:re(e);break;case 19:Xt(Ut);break;case 10:Ie(e.type);break;case 22:case 23:re(e),wr(),t!==null&&Xt(Za);break;case 24:Ie(Ht)}}function Zn(t,e){try{var a=e.updateQueue,l=a!==null?a.lastEffect:null;if(l!==null){var n=l.next;a=n;do{if((a.tag&t)===t){l=void 0;var i=a.create,u=a.inst;l=i(),u.destroy=l}a=a.next}while(a!==n)}}catch(s){gt(e,e.return,s)}}function Oa(t,e,a){try{var l=e.updateQueue,n=l!==null?l.lastEffect:null;if(n!==null){var i=n.next;l=i;do{if((l.tag&t)===t){var u=l.inst,s=u.destroy;if(s!==void 0){u.destroy=void 0,n=e;var r=a,h=s;try{h()}catch(b){gt(n,r,b)}}}l=l.next}while(l!==i)}}catch(b){gt(e,e.return,b)}}function Bd(t){var e=t.updateQueue;if(e!==null){var a=t.stateNode;try{Qo(e,a)}catch(l){gt(t,t.return,l)}}}function Hd(t,e,a){a.props=Ka(t.type,t.memoizedProps),a.state=t.memoizedState;try{a.componentWillUnmount()}catch(l){gt(t,e,l)}}function hn(t,e){try{var a=t.ref;if(a!==null){switch(t.tag){case 26:case 27:case 5:var l=t.stateNode;break;case 30:l=t.stateNode;break;default:l=t.stateNode}typeof a=="function"?t.refCleanup=a(l):a.current=l}}catch(n){gt(t,e,n)}}function Be(t,e){var a=t.ref,l=t.refCleanup;if(a!==null)if(typeof l=="function")try{l()}catch(n){gt(t,e,n)}finally{t.refCleanup=null,t=t.alternate,t!=null&&(t.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(n){gt(t,e,n)}else a.current=null}function kd(t){var e=t.type,a=t.memoizedProps,l=t.stateNode;try{t:switch(e){case"button":case"input":case"select":case"textarea":a.autoFocus&&l.focus();break t;case"img":a.src?l.src=a.src:a.srcSet&&(l.srcset=a.srcSet)}}catch(n){gt(t,t.return,n)}}function Vu(t,e,a){try{var l=t.stateNode;s1(l,t.type,a,e),l[ie]=e}catch(n){gt(t,t.return,n)}}function Ld(t){return t.tag===5||t.tag===3||t.tag===26||t.tag===27&&Da(t.type)||t.tag===4}function Ku(t){t:for(;;){for(;t.sibling===null;){if(t.return===null||Ld(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.tag===27&&Da(t.type)||t.flags&2||t.child===null||t.tag===4)continue t;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function ks(t,e,a){var l=t.tag;if(l===5||l===6)t=t.stateNode,e?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(t,e):(e=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,e.appendChild(t),a=a._reactRootContainer,a!=null||e.onclick!==null||(e.onclick=We));else if(l!==4&&(l===27&&Da(t.type)&&(a=t.stateNode,e=null),t=t.child,t!==null))for(ks(t,e,a),t=t.sibling;t!==null;)ks(t,e,a),t=t.sibling}function Gi(t,e,a){var l=t.tag;if(l===5||l===6)t=t.stateNode,e?a.insertBefore(t,e):a.appendChild(t);else if(l!==4&&(l===27&&Da(t.type)&&(a=t.stateNode),t=t.child,t!==null))for(Gi(t,e,a),t=t.sibling;t!==null;)Gi(t,e,a),t=t.sibling}function Zd(t){var e=t.stateNode,a=t.memoizedProps;try{for(var l=t.type,n=e.attributes;n.length;)e.removeAttributeNode(n[0]);Wt(e,l,a),e[Vt]=t,e[ie]=a}catch(i){gt(t,t.return,i)}}var Ke=!1,Bt=!1,Ju=!1,nf=typeof WeakSet=="function"?WeakSet:Set,Gt=null;function Z0(t,e){if(t=t.containerInfo,Qs=Pi,t=wo(t),gr(t)){if("selectionStart"in t)var a={start:t.selectionStart,end:t.selectionEnd};else t:{a=(a=t.ownerDocument)&&a.defaultView||window;var l=a.getSelection&&a.getSelection();if(l&&l.rangeCount!==0){a=l.anchorNode;var n=l.anchorOffset,i=l.focusNode;l=l.focusOffset;try{a.nodeType,i.nodeType}catch{a=null;break t}var u=0,s=-1,r=-1,h=0,b=0,y=t,m=null;e:for(;;){for(var o;y!==a||n!==0&&y.nodeType!==3||(s=u+n),y!==i||l!==0&&y.nodeType!==3||(r=u+l),y.nodeType===3&&(u+=y.nodeValue.length),(o=y.firstChild)!==null;)m=y,y=o;for(;;){if(y===t)break e;if(m===a&&++h===n&&(s=u),m===i&&++b===l&&(r=u),(o=y.nextSibling)!==null)break;y=m,m=y.parentNode}y=o}a=s===-1||r===-1?null:{start:s,end:r}}else a=null}a=a||{start:0,end:0}}else a=null;for(Vs={focusedElem:t,selectionRange:a},Pi=!1,Gt=e;Gt!==null;)if(e=Gt,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,Gt=t;else for(;Gt!==null;){switch(e=Gt,i=e.alternate,t=e.flags,e.tag){case 0:if(t&4&&(t=e.updateQueue,t=t!==null?t.events:null,t!==null))for(a=0;a<t.length;a++)n=t[a],n.ref.impl=n.nextImpl;break;case 11:case 15:break;case 1:if(t&1024&&i!==null){t=void 0,a=e,n=i.memoizedProps,i=i.memoizedState,l=a.stateNode;try{var _=Ka(a.type,n);t=l.getSnapshotBeforeUpdate(_,i),l.__reactInternalSnapshotBeforeUpdate=t}catch(v){gt(a,a.return,v)}}break;case 3:if(t&1024){if(t=e.stateNode.containerInfo,a=t.nodeType,a===9)Js(t);else if(a===1)switch(t.nodeName){case"HEAD":case"HTML":case"BODY":Js(t);break;default:t.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(t&1024)throw Error(G(163))}if(t=e.sibling,t!==null){t.return=e.return,Gt=t;break}Gt=e.return}}function Yd(t,e,a){var l=a.flags;switch(a.tag){case 0:case 11:case 15:Xe(t,a),l&4&&Zn(5,a);break;case 1:if(Xe(t,a),l&4)if(t=a.stateNode,e===null)try{t.componentDidMount()}catch(u){gt(a,a.return,u)}else{var n=Ka(a.type,e.memoizedProps);e=e.memoizedState;try{t.componentDidUpdate(n,e,t.__reactInternalSnapshotBeforeUpdate)}catch(u){gt(a,a.return,u)}}l&64&&Bd(a),l&512&&hn(a,a.return);break;case 3:if(Xe(t,a),l&64&&(t=a.updateQueue,t!==null)){if(e=null,a.child!==null)switch(a.child.tag){case 27:case 5:e=a.child.stateNode;break;case 1:e=a.child.stateNode}try{Qo(t,e)}catch(u){gt(a,a.return,u)}}break;case 27:e===null&&l&4&&Zd(a);case 26:case 5:Xe(t,a),e===null&&l&4&&kd(a),l&512&&hn(a,a.return);break;case 12:Xe(t,a);break;case 31:Xe(t,a),l&4&&Xd(t,a);break;case 13:Xe(t,a),l&4&&Qd(t,a),l&64&&(t=a.memoizedState,t!==null&&(t=t.dehydrated,t!==null&&(a=W0.bind(null,a),p1(t,a))));break;case 22:if(l=a.memoizedState!==null||Ke,!l){e=e!==null&&e.memoizedState!==null||Bt,n=Ke;var i=Bt;Ke=l,(Bt=e)&&!i?Qe(t,a,(a.subtreeFlags&8772)!==0):Xe(t,a),Ke=n,Bt=i}break;case 30:break;default:Xe(t,a)}}function Gd(t){var e=t.alternate;e!==null&&(t.alternate=null,Gd(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&or(e)),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}var wt=null,ae=!1;function qe(t,e,a){for(a=a.child;a!==null;)qd(t,e,a),a=a.sibling}function qd(t,e,a){if(de&&typeof de.onCommitFiberUnmount=="function")try{de.onCommitFiberUnmount(Un,a)}catch{}switch(a.tag){case 26:Bt||Be(a,e),qe(t,e,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:Bt||Be(a,e);var l=wt,n=ae;Da(a.type)&&(wt=a.stateNode,ae=!1),qe(t,e,a),gn(a.stateNode),wt=l,ae=n;break;case 5:Bt||Be(a,e);case 6:if(l=wt,n=ae,wt=null,qe(t,e,a),wt=l,ae=n,wt!==null)if(ae)try{(wt.nodeType===9?wt.body:wt.nodeName==="HTML"?wt.ownerDocument.body:wt).removeChild(a.stateNode)}catch(i){gt(a,e,i)}else try{wt.removeChild(a.stateNode)}catch(i){gt(a,e,i)}break;case 18:wt!==null&&(ae?(t=wt,yf(t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,a.stateNode),Ul(t)):yf(wt,a.stateNode));break;case 4:l=wt,n=ae,wt=a.stateNode.containerInfo,ae=!0,qe(t,e,a),wt=l,ae=n;break;case 0:case 11:case 14:case 15:Oa(2,a,e),Bt||Oa(4,a,e),qe(t,e,a);break;case 1:Bt||(Be(a,e),l=a.stateNode,typeof l.componentWillUnmount=="function"&&Hd(a,e,l)),qe(t,e,a);break;case 21:qe(t,e,a);break;case 22:Bt=(l=Bt)||a.memoizedState!==null,qe(t,e,a),Bt=l;break;default:qe(t,e,a)}}function Xd(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null))){t=t.dehydrated;try{Ul(t)}catch(a){gt(e,e.return,a)}}}function Qd(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null&&(t=t.dehydrated,t!==null))))try{Ul(t)}catch(a){gt(e,e.return,a)}}function Y0(t){switch(t.tag){case 31:case 13:case 19:var e=t.stateNode;return e===null&&(e=t.stateNode=new nf),e;case 22:return t=t.stateNode,e=t._retryCache,e===null&&(e=t._retryCache=new nf),e;default:throw Error(G(435,t.tag))}}function ni(t,e){var a=Y0(t);e.forEach(function(l){if(!a.has(l)){a.add(l);var n=F0.bind(null,t,l);l.then(n,n)}})}function te(t,e){var a=e.deletions;if(a!==null)for(var l=0;l<a.length;l++){var n=a[l],i=t,u=e,s=u;t:for(;s!==null;){switch(s.tag){case 27:if(Da(s.type)){wt=s.stateNode,ae=!1;break t}break;case 5:wt=s.stateNode,ae=!1;break t;case 3:case 4:wt=s.stateNode.containerInfo,ae=!0;break t}s=s.return}if(wt===null)throw Error(G(160));qd(i,u,n),wt=null,ae=!1,i=n.alternate,i!==null&&(i.return=null),n.return=null}if(e.subtreeFlags&13886)for(e=e.child;e!==null;)Vd(e,t),e=e.sibling}var Ce=null;function Vd(t,e){var a=t.alternate,l=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:te(e,t),ee(t),l&4&&(Oa(3,t,t.return),Zn(3,t),Oa(5,t,t.return));break;case 1:te(e,t),ee(t),l&512&&(Bt||a===null||Be(a,a.return)),l&64&&Ke&&(t=t.updateQueue,t!==null&&(l=t.callbacks,l!==null&&(a=t.shared.hiddenCallbacks,t.shared.hiddenCallbacks=a===null?l:a.concat(l))));break;case 26:var n=Ce;if(te(e,t),ee(t),l&512&&(Bt||a===null||Be(a,a.return)),l&4){var i=a!==null?a.memoizedState:null;if(l=t.memoizedState,a===null)if(l===null)if(t.stateNode===null){t:{l=t.type,a=t.memoizedProps,n=n.ownerDocument||n;e:switch(l){case"title":i=n.getElementsByTagName("title")[0],(!i||i[Bn]||i[Vt]||i.namespaceURI==="http://www.w3.org/2000/svg"||i.hasAttribute("itemprop"))&&(i=n.createElement(l),n.head.insertBefore(i,n.querySelector("head > title"))),Wt(i,l,a),i[Vt]=t,qt(i),l=i;break t;case"link":var u=Af("link","href",n).get(l+(a.href||""));if(u){for(var s=0;s<u.length;s++)if(i=u[s],i.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&i.getAttribute("rel")===(a.rel==null?null:a.rel)&&i.getAttribute("title")===(a.title==null?null:a.title)&&i.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){u.splice(s,1);break e}}i=n.createElement(l),Wt(i,l,a),n.head.appendChild(i);break;case"meta":if(u=Af("meta","content",n).get(l+(a.content||""))){for(s=0;s<u.length;s++)if(i=u[s],i.getAttribute("content")===(a.content==null?null:""+a.content)&&i.getAttribute("name")===(a.name==null?null:a.name)&&i.getAttribute("property")===(a.property==null?null:a.property)&&i.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&i.getAttribute("charset")===(a.charSet==null?null:a.charSet)){u.splice(s,1);break e}}i=n.createElement(l),Wt(i,l,a),n.head.appendChild(i);break;default:throw Error(G(468,l))}i[Vt]=t,qt(i),l=i}t.stateNode=l}else Tf(n,t.type,t.stateNode);else t.stateNode=Ef(n,l,t.memoizedProps);else i!==l?(i===null?a.stateNode!==null&&(a=a.stateNode,a.parentNode.removeChild(a)):i.count--,l===null?Tf(n,t.type,t.stateNode):Ef(n,l,t.memoizedProps)):l===null&&t.stateNode!==null&&Vu(t,t.memoizedProps,a.memoizedProps)}break;case 27:te(e,t),ee(t),l&512&&(Bt||a===null||Be(a,a.return)),a!==null&&l&4&&Vu(t,t.memoizedProps,a.memoizedProps);break;case 5:if(te(e,t),ee(t),l&512&&(Bt||a===null||Be(a,a.return)),t.flags&32){n=t.stateNode;try{Al(n,"")}catch(_){gt(t,t.return,_)}}l&4&&t.stateNode!=null&&(n=t.memoizedProps,Vu(t,n,a!==null?a.memoizedProps:n)),l&1024&&(Ju=!0);break;case 6:if(te(e,t),ee(t),l&4){if(t.stateNode===null)throw Error(G(162));l=t.memoizedProps,a=t.stateNode;try{a.nodeValue=l}catch(_){gt(t,t.return,_)}}break;case 3:if(zi=null,n=Ce,Ce=Fi(e.containerInfo),te(e,t),Ce=n,ee(t),l&4&&a!==null&&a.memoizedState.isDehydrated)try{Ul(e.containerInfo)}catch(_){gt(t,t.return,_)}Ju&&(Ju=!1,Kd(t));break;case 4:l=Ce,Ce=Fi(t.stateNode.containerInfo),te(e,t),ee(t),Ce=l;break;case 12:te(e,t),ee(t);break;case 31:te(e,t),ee(t),l&4&&(l=t.updateQueue,l!==null&&(t.updateQueue=null,ni(t,l)));break;case 13:te(e,t),ee(t),t.child.flags&8192&&t.memoizedState!==null!=(a!==null&&a.memoizedState!==null)&&(pu=oe()),l&4&&(l=t.updateQueue,l!==null&&(t.updateQueue=null,ni(t,l)));break;case 22:n=t.memoizedState!==null;var r=a!==null&&a.memoizedState!==null,h=Ke,b=Bt;if(Ke=h||n,Bt=b||r,te(e,t),Bt=b,Ke=h,ee(t),l&8192)t:for(e=t.stateNode,e._visibility=n?e._visibility&-2:e._visibility|1,n&&(a===null||r||Ke||Bt||Ha(t)),a=null,e=t;;){if(e.tag===5||e.tag===26){if(a===null){r=a=e;try{if(i=r.stateNode,n)u=i.style,typeof u.setProperty=="function"?u.setProperty("display","none","important"):u.display="none";else{s=r.stateNode;var y=r.memoizedProps.style,m=y!=null&&y.hasOwnProperty("display")?y.display:null;s.style.display=m==null||typeof m=="boolean"?"":(""+m).trim()}}catch(_){gt(r,r.return,_)}}}else if(e.tag===6){if(a===null){r=e;try{r.stateNode.nodeValue=n?"":r.memoizedProps}catch(_){gt(r,r.return,_)}}}else if(e.tag===18){if(a===null){r=e;try{var o=r.stateNode;n?bf(o,!0):bf(r.stateNode,!1)}catch(_){gt(r,r.return,_)}}}else if((e.tag!==22&&e.tag!==23||e.memoizedState===null||e===t)&&e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break t;for(;e.sibling===null;){if(e.return===null||e.return===t)break t;a===e&&(a=null),e=e.return}a===e&&(a=null),e.sibling.return=e.return,e=e.sibling}l&4&&(l=t.updateQueue,l!==null&&(a=l.retryQueue,a!==null&&(l.retryQueue=null,ni(t,a))));break;case 19:te(e,t),ee(t),l&4&&(l=t.updateQueue,l!==null&&(t.updateQueue=null,ni(t,l)));break;case 30:break;case 21:break;default:te(e,t),ee(t)}}function ee(t){var e=t.flags;if(e&2){try{for(var a,l=t.return;l!==null;){if(Ld(l)){a=l;break}l=l.return}if(a==null)throw Error(G(160));switch(a.tag){case 27:var n=a.stateNode,i=Ku(t);Gi(t,i,n);break;case 5:var u=a.stateNode;a.flags&32&&(Al(u,""),a.flags&=-33);var s=Ku(t);Gi(t,s,u);break;case 3:case 4:var r=a.stateNode.containerInfo,h=Ku(t);ks(t,h,r);break;default:throw Error(G(161))}}catch(b){gt(t,t.return,b)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function Kd(t){if(t.subtreeFlags&1024)for(t=t.child;t!==null;){var e=t;Kd(e),e.tag===5&&e.flags&1024&&e.stateNode.reset(),t=t.sibling}}function Xe(t,e){if(e.subtreeFlags&8772)for(e=e.child;e!==null;)Yd(t,e.alternate,e),e=e.sibling}function Ha(t){for(t=t.child;t!==null;){var e=t;switch(e.tag){case 0:case 11:case 14:case 15:Oa(4,e,e.return),Ha(e);break;case 1:Be(e,e.return);var a=e.stateNode;typeof a.componentWillUnmount=="function"&&Hd(e,e.return,a),Ha(e);break;case 27:gn(e.stateNode);case 26:case 5:Be(e,e.return),Ha(e);break;case 22:e.memoizedState===null&&Ha(e);break;case 30:Ha(e);break;default:Ha(e)}t=t.sibling}}function Qe(t,e,a){for(a=a&&(e.subtreeFlags&8772)!==0,e=e.child;e!==null;){var l=e.alternate,n=t,i=e,u=i.flags;switch(i.tag){case 0:case 11:case 15:Qe(n,i,a),Zn(4,i);break;case 1:if(Qe(n,i,a),l=i,n=l.stateNode,typeof n.componentDidMount=="function")try{n.componentDidMount()}catch(h){gt(l,l.return,h)}if(l=i,n=l.updateQueue,n!==null){var s=l.stateNode;try{var r=n.shared.hiddenCallbacks;if(r!==null)for(n.shared.hiddenCallbacks=null,n=0;n<r.length;n++)Xo(r[n],s)}catch(h){gt(l,l.return,h)}}a&&u&64&&Bd(i),hn(i,i.return);break;case 27:Zd(i);case 26:case 5:Qe(n,i,a),a&&l===null&&u&4&&kd(i),hn(i,i.return);break;case 12:Qe(n,i,a);break;case 31:Qe(n,i,a),a&&u&4&&Xd(n,i);break;case 13:Qe(n,i,a),a&&u&4&&Qd(n,i);break;case 22:i.memoizedState===null&&Qe(n,i,a),hn(i,i.return);break;case 30:break;default:Qe(n,i,a)}e=e.sibling}}function qr(t,e){var a=null;t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(a=t.memoizedState.cachePool.pool),t=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(t=e.memoizedState.cachePool.pool),t!==a&&(t!=null&&t.refCount++,a!=null&&kn(a))}function Xr(t,e){t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&kn(t))}function Oe(t,e,a,l){if(e.subtreeFlags&10256)for(e=e.child;e!==null;)Jd(t,e,a,l),e=e.sibling}function Jd(t,e,a,l){var n=e.flags;switch(e.tag){case 0:case 11:case 15:Oe(t,e,a,l),n&2048&&Zn(9,e);break;case 1:Oe(t,e,a,l);break;case 3:Oe(t,e,a,l),n&2048&&(t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&kn(t)));break;case 12:if(n&2048){Oe(t,e,a,l),t=e.stateNode;try{var i=e.memoizedProps,u=i.id,s=i.onPostCommit;typeof s=="function"&&s(u,e.alternate===null?"mount":"update",t.passiveEffectDuration,-0)}catch(r){gt(e,e.return,r)}}else Oe(t,e,a,l);break;case 31:Oe(t,e,a,l);break;case 13:Oe(t,e,a,l);break;case 23:break;case 22:i=e.stateNode,u=e.alternate,e.memoizedState!==null?i._visibility&2?Oe(t,e,a,l):mn(t,e):i._visibility&2?Oe(t,e,a,l):(i._visibility|=2,al(t,e,a,l,(e.subtreeFlags&10256)!==0||!1)),n&2048&&qr(u,e);break;case 24:Oe(t,e,a,l),n&2048&&Xr(e.alternate,e);break;default:Oe(t,e,a,l)}}function al(t,e,a,l,n){for(n=n&&((e.subtreeFlags&10256)!==0||!1),e=e.child;e!==null;){var i=t,u=e,s=a,r=l,h=u.flags;switch(u.tag){case 0:case 11:case 15:al(i,u,s,r,n),Zn(8,u);break;case 23:break;case 22:var b=u.stateNode;u.memoizedState!==null?b._visibility&2?al(i,u,s,r,n):mn(i,u):(b._visibility|=2,al(i,u,s,r,n)),n&&h&2048&&qr(u.alternate,u);break;case 24:al(i,u,s,r,n),n&&h&2048&&Xr(u.alternate,u);break;default:al(i,u,s,r,n)}e=e.sibling}}function mn(t,e){if(e.subtreeFlags&10256)for(e=e.child;e!==null;){var a=t,l=e,n=l.flags;switch(l.tag){case 22:mn(a,l),n&2048&&qr(l.alternate,l);break;case 24:mn(a,l),n&2048&&Xr(l.alternate,l);break;default:mn(a,l)}e=e.sibling}}var an=8192;function tl(t,e,a){if(t.subtreeFlags&an)for(t=t.child;t!==null;)Wd(t,e,a),t=t.sibling}function Wd(t,e,a){switch(t.tag){case 26:tl(t,e,a),t.flags&an&&t.memoizedState!==null&&w1(a,Ce,t.memoizedState,t.memoizedProps);break;case 5:tl(t,e,a);break;case 3:case 4:var l=Ce;Ce=Fi(t.stateNode.containerInfo),tl(t,e,a),Ce=l;break;case 22:t.memoizedState===null&&(l=t.alternate,l!==null&&l.memoizedState!==null?(l=an,an=16777216,tl(t,e,a),an=l):tl(t,e,a));break;default:tl(t,e,a)}}function Fd(t){var e=t.alternate;if(e!==null&&(t=e.child,t!==null)){e.child=null;do e=t.sibling,t.sibling=null,t=e;while(t!==null)}}function Fl(t){var e=t.deletions;if(t.flags&16){if(e!==null)for(var a=0;a<e.length;a++){var l=e[a];Gt=l,Id(l,t)}Fd(t)}if(t.subtreeFlags&10256)for(t=t.child;t!==null;)$d(t),t=t.sibling}function $d(t){switch(t.tag){case 0:case 11:case 15:Fl(t),t.flags&2048&&Oa(9,t,t.return);break;case 3:Fl(t);break;case 12:Fl(t);break;case 22:var e=t.stateNode;t.memoizedState!==null&&e._visibility&2&&(t.return===null||t.return.tag!==13)?(e._visibility&=-3,xi(t)):Fl(t);break;default:Fl(t)}}function xi(t){var e=t.deletions;if(t.flags&16){if(e!==null)for(var a=0;a<e.length;a++){var l=e[a];Gt=l,Id(l,t)}Fd(t)}for(t=t.child;t!==null;){switch(e=t,e.tag){case 0:case 11:case 15:Oa(8,e,e.return),xi(e);break;case 22:a=e.stateNode,a._visibility&2&&(a._visibility&=-3,xi(e));break;default:xi(e)}t=t.sibling}}function Id(t,e){for(;Gt!==null;){var a=Gt;switch(a.tag){case 0:case 11:case 15:Oa(8,a,e);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var l=a.memoizedState.cachePool.pool;l!=null&&l.refCount++}break;case 24:kn(a.memoizedState.cache)}if(l=a.child,l!==null)l.return=a,Gt=l;else t:for(a=t;Gt!==null;){l=Gt;var n=l.sibling,i=l.return;if(Gd(l),l===a){Gt=null;break t}if(n!==null){n.return=i,Gt=n;break t}Gt=i}}}var G0={getCacheForType:function(t){var e=Jt(Ht),a=e.data.get(t);return a===void 0&&(a=t(),e.data.set(t,a)),a},cacheSignal:function(){return Jt(Ht).controller.signal}},q0=typeof WeakMap=="function"?WeakMap:Map,ht=0,_t=null,rt=null,ct=0,vt=0,se=null,pa=!1,Ll=!1,Qr=!1,na=0,Ot=0,Ca=0,Ga=0,Vr=0,fe=0,Ol=0,pn=null,le=null,Ls=!1,pu=0,Pd=0,qi=1/0,Xi=null,Sa=null,Lt=0,za=null,Cl=null,Pe=0,Zs=0,Ys=null,th=null,vn=0,Gs=null;function me(){return ht&2&&ct!==0?ct&-ct:lt.T!==null?Jr():ro()}function eh(){if(fe===0)if(!(ct&536870912)||ft){var t=Fn;Fn<<=1,!(Fn&3932160)&&(Fn=262144),fe=t}else fe=536870912;return t=ve.current,t!==null&&(t.flags|=32),fe}function ne(t,e,a){(t===_t&&(vt===2||vt===9)||t.cancelPendingCommit!==null)&&(jl(t,0),va(t,ct,fe,!1)),Rn(t,a),(!(ht&2)||t!==_t)&&(t===_t&&(!(ht&2)&&(Ga|=a),Ot===4&&va(t,ct,fe,!1)),Le(t))}function ah(t,e,a){if(ht&6)throw Error(G(327));var l=!a&&(e&127)===0&&(e&t.expiredLanes)===0||Mn(t,e),n=l?V0(t,e):Wu(t,e,!0),i=l;do{if(n===0){Ll&&!l&&va(t,e,0,!1);break}else{if(a=t.current.alternate,i&&!X0(a)){n=Wu(t,e,!1),i=!1;continue}if(n===2){if(i=e,t.errorRecoveryDisabledLanes&i)var u=0;else u=t.pendingLanes&-536870913,u=u!==0?u:u&536870912?536870912:0;if(u!==0){e=u;t:{var s=t;n=pn;var r=s.current.memoizedState.isDehydrated;if(r&&(jl(s,u).flags|=256),u=Wu(s,u,!1),u!==2){if(Qr&&!r){s.errorRecoveryDisabledLanes|=i,Ga|=i,n=4;break t}i=le,le=n,i!==null&&(le===null?le=i:le.push.apply(le,i))}n=u}if(i=!1,n!==2)continue}}if(n===1){jl(t,0),va(t,e,0,!0);break}t:{switch(l=t,i=n,i){case 0:case 1:throw Error(G(345));case 4:if((e&4194048)!==e)break;case 6:va(l,e,fe,!pa);break t;case 2:le=null;break;case 3:case 5:break;default:throw Error(G(329))}if((e&62914560)===e&&(n=pu+300-oe(),10<n)){if(va(l,e,fe,!pa),nu(l,0,!0)!==0)break t;Pe=e,l.timeoutHandle=Sh(uf.bind(null,l,a,le,Xi,Ls,e,fe,Ga,Ol,pa,i,"Throttled",-0,0),n);break t}uf(l,a,le,Xi,Ls,e,fe,Ga,Ol,pa,i,null,-0,0)}}break}while(!0);Le(t)}function uf(t,e,a,l,n,i,u,s,r,h,b,y,m,o){if(t.timeoutHandle=-1,y=e.subtreeFlags,y&8192||(y&16785408)===16785408){y={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:We},Wd(e,i,y);var _=(i&62914560)===i?pu-oe():(i&4194048)===i?Pd-oe():0;if(_=N1(y,_),_!==null){Pe=i,t.cancelPendingCommit=_(rf.bind(null,t,e,i,a,l,n,u,s,r,b,y,null,m,o)),va(t,i,u,!h);return}}rf(t,e,i,a,l,n,u,s,r)}function X0(t){for(var e=t;;){var a=e.tag;if((a===0||a===11||a===15)&&e.flags&16384&&(a=e.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var l=0;l<a.length;l++){var n=a[l],i=n.getSnapshot;n=n.value;try{if(!pe(i(),n))return!1}catch{return!1}}if(a=e.child,e.subtreeFlags&16384&&a!==null)a.return=e,e=a;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function va(t,e,a,l){e&=~Vr,e&=~Ga,t.suspendedLanes|=e,t.pingedLanes&=~e,l&&(t.warmLanes|=e),l=t.expirationTimes;for(var n=e;0<n;){var i=31-he(n),u=1<<i;l[i]=-1,n&=~u}a!==0&&io(t,a,e)}function vu(){return ht&6?!0:(Yn(0),!1)}function Kr(){if(rt!==null){if(vt===0)var t=rt.return;else t=rt,Fe=Ia=null,Dr(t),_l=null,En=0,t=rt;for(;t!==null;)Rd(t.alternate,t),t=t.return;rt=null}}function jl(t,e){var a=t.timeoutHandle;a!==-1&&(t.timeoutHandle=-1,f1(a)),a=t.cancelPendingCommit,a!==null&&(t.cancelPendingCommit=null,a()),Pe=0,Kr(),_t=t,rt=a=$e(t.current,null),ct=e,vt=0,se=null,pa=!1,Ll=Mn(t,e),Qr=!1,Ol=fe=Vr=Ga=Ca=Ot=0,le=pn=null,Ls=!1,e&8&&(e|=e&32);var l=t.entangledLanes;if(l!==0)for(t=t.entanglements,l&=e;0<l;){var n=31-he(l),i=1<<n;e|=t[n],l&=~i}return na=e,ru(),a}function lh(t,e){ut=null,lt.H=Tn,e===kl||e===fu?(e=Hc(),vt=3):e===Ar?(e=Hc(),vt=4):vt=e===Yr?8:e!==null&&typeof e=="object"&&typeof e.then=="function"?6:1,se=e,rt===null&&(Ot=1,Zi(t,ze(e,t.current)))}function nh(){var t=ve.current;return t===null?!0:(ct&4194048)===ct?Ae===null:(ct&62914560)===ct||ct&536870912?t===Ae:!1}function ih(){var t=lt.H;return lt.H=Tn,t===null?Tn:t}function uh(){var t=lt.A;return lt.A=G0,t}function Qi(){Ot=4,pa||(ct&4194048)!==ct&&ve.current!==null||(Ll=!0),!(Ca&134217727)&&!(Ga&134217727)||_t===null||va(_t,ct,fe,!1)}function Wu(t,e,a){var l=ht;ht|=2;var n=ih(),i=uh();(_t!==t||ct!==e)&&(Xi=null,jl(t,e)),e=!1;var u=Ot;t:do try{if(vt!==0&&rt!==null){var s=rt,r=se;switch(vt){case 8:Kr(),u=6;break t;case 3:case 2:case 9:case 6:ve.current===null&&(e=!0);var h=vt;if(vt=0,se=null,pl(t,s,r,h),a&&Ll){u=0;break t}break;default:h=vt,vt=0,se=null,pl(t,s,r,h)}}Q0(),u=Ot;break}catch(b){lh(t,b)}while(!0);return e&&t.shellSuspendCounter++,Fe=Ia=null,ht=l,lt.H=n,lt.A=i,rt===null&&(_t=null,ct=0,ru()),u}function Q0(){for(;rt!==null;)sh(rt)}function V0(t,e){var a=ht;ht|=2;var l=ih(),n=uh();_t!==t||ct!==e?(Xi=null,qi=oe()+500,jl(t,e)):Ll=Mn(t,e);t:do try{if(vt!==0&&rt!==null){e=rt;var i=se;e:switch(vt){case 1:vt=0,se=null,pl(t,e,i,1);break;case 2:case 9:if(Bc(i)){vt=0,se=null,sf(e);break}e=function(){vt!==2&&vt!==9||_t!==t||(vt=7),Le(t)},i.then(e,e);break t;case 3:vt=7;break t;case 4:vt=5;break t;case 7:Bc(i)?(vt=0,se=null,sf(e)):(vt=0,se=null,pl(t,e,i,7));break;case 5:var u=null;switch(rt.tag){case 26:u=rt.memoizedState;case 5:case 27:var s=rt;if(u?wh(u):s.stateNode.complete){vt=0,se=null;var r=s.sibling;if(r!==null)rt=r;else{var h=s.return;h!==null?(rt=h,gu(h)):rt=null}break e}}vt=0,se=null,pl(t,e,i,5);break;case 6:vt=0,se=null,pl(t,e,i,6);break;case 8:Kr(),Ot=6;break t;default:throw Error(G(462))}}K0();break}catch(b){lh(t,b)}while(!0);return Fe=Ia=null,lt.H=l,lt.A=n,ht=a,rt!==null?0:(_t=null,ct=0,ru(),Ot)}function K0(){for(;rt!==null&&!vm();)sh(rt)}function sh(t){var e=Md(t.alternate,t,na);t.memoizedProps=t.pendingProps,e===null?gu(t):rt=e}function sf(t){var e=t,a=e.alternate;switch(e.tag){case 15:case 0:e=Pc(a,e,e.pendingProps,e.type,void 0,ct);break;case 11:e=Pc(a,e,e.pendingProps,e.type.render,e.ref,ct);break;case 5:Dr(e);default:Rd(a,e),e=rt=Ro(e,na),e=Md(a,e,na)}t.memoizedProps=t.pendingProps,e===null?gu(t):rt=e}function pl(t,e,a,l){Fe=Ia=null,Dr(e),_l=null,En=0;var n=e.return;try{if(R0(t,n,e,a,ct)){Ot=1,Zi(t,ze(a,t.current)),rt=null;return}}catch(i){if(n!==null)throw rt=n,i;Ot=1,Zi(t,ze(a,t.current)),rt=null;return}e.flags&32768?(ft||l===1?t=!0:Ll||ct&536870912?t=!1:(pa=t=!0,(l===2||l===9||l===3||l===6)&&(l=ve.current,l!==null&&l.tag===13&&(l.flags|=16384))),rh(e,t)):gu(e)}function gu(t){var e=t;do{if(e.flags&32768){rh(e,pa);return}t=e.return;var a=k0(e.alternate,e,na);if(a!==null){rt=a;return}if(e=e.sibling,e!==null){rt=e;return}rt=e=t}while(e!==null);Ot===0&&(Ot=5)}function rh(t,e){do{var a=L0(t.alternate,t);if(a!==null){a.flags&=32767,rt=a;return}if(a=t.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!e&&(t=t.sibling,t!==null)){rt=t;return}rt=t=a}while(t!==null);Ot=6,rt=null}function rf(t,e,a,l,n,i,u,s,r){t.cancelPendingCommit=null;do yu();while(Lt!==0);if(ht&6)throw Error(G(327));if(e!==null){if(e===t.current)throw Error(G(177));if(i=e.lanes|e.childLanes,i|=yr,Tm(t,a,i,u,s,r),t===_t&&(rt=_t=null,ct=0),Cl=e,za=t,Pe=a,Zs=i,Ys=n,th=l,e.subtreeFlags&10256||e.flags&10256?(t.callbackNode=null,t.callbackPriority=0,$0(Oi,function(){return hh(),null})):(t.callbackNode=null,t.callbackPriority=0),l=(e.flags&13878)!==0,e.subtreeFlags&13878||l){l=lt.T,lt.T=null,n=mt.p,mt.p=2,u=ht,ht|=4;try{Z0(t,e,a)}finally{ht=u,mt.p=n,lt.T=l}}Lt=1,ch(),fh(),oh()}}function ch(){if(Lt===1){Lt=0;var t=za,e=Cl,a=(e.flags&13878)!==0;if(e.subtreeFlags&13878||a){a=lt.T,lt.T=null;var l=mt.p;mt.p=2;var n=ht;ht|=4;try{Vd(e,t);var i=Vs,u=wo(t.containerInfo),s=i.focusedElem,r=i.selectionRange;if(u!==s&&s&&s.ownerDocument&&To(s.ownerDocument.documentElement,s)){if(r!==null&&gr(s)){var h=r.start,b=r.end;if(b===void 0&&(b=h),"selectionStart"in s)s.selectionStart=h,s.selectionEnd=Math.min(b,s.value.length);else{var y=s.ownerDocument||document,m=y&&y.defaultView||window;if(m.getSelection){var o=m.getSelection(),_=s.textContent.length,v=Math.min(r.start,_),x=r.end===void 0?v:Math.min(r.end,_);!o.extend&&v>x&&(u=x,x=v,v=u);var c=Oc(s,v),d=Oc(s,x);if(c&&d&&(o.rangeCount!==1||o.anchorNode!==c.node||o.anchorOffset!==c.offset||o.focusNode!==d.node||o.focusOffset!==d.offset)){var g=y.createRange();g.setStart(c.node,c.offset),o.removeAllRanges(),v>x?(o.addRange(g),o.extend(d.node,d.offset)):(g.setEnd(d.node,d.offset),o.addRange(g))}}}}for(y=[],o=s;o=o.parentNode;)o.nodeType===1&&y.push({element:o,left:o.scrollLeft,top:o.scrollTop});for(typeof s.focus=="function"&&s.focus(),s=0;s<y.length;s++){var S=y[s];S.element.scrollLeft=S.left,S.element.scrollTop=S.top}}Pi=!!Qs,Vs=Qs=null}finally{ht=n,mt.p=l,lt.T=a}}t.current=e,Lt=2}}function fh(){if(Lt===2){Lt=0;var t=za,e=Cl,a=(e.flags&8772)!==0;if(e.subtreeFlags&8772||a){a=lt.T,lt.T=null;var l=mt.p;mt.p=2;var n=ht;ht|=4;try{Yd(t,e.alternate,e)}finally{ht=n,mt.p=l,lt.T=a}}Lt=3}}function oh(){if(Lt===4||Lt===3){Lt=0,gm();var t=za,e=Cl,a=Pe,l=th;e.subtreeFlags&10256||e.flags&10256?Lt=5:(Lt=0,Cl=za=null,dh(t,t.pendingLanes));var n=t.pendingLanes;if(n===0&&(Sa=null),fr(a),e=e.stateNode,de&&typeof de.onCommitFiberRoot=="function")try{de.onCommitFiberRoot(Un,e,void 0,(e.current.flags&128)===128)}catch{}if(l!==null){e=lt.T,n=mt.p,mt.p=2,lt.T=null;try{for(var i=t.onRecoverableError,u=0;u<l.length;u++){var s=l[u];i(s.value,{componentStack:s.stack})}}finally{lt.T=e,mt.p=n}}Pe&3&&yu(),Le(t),n=t.pendingLanes,a&261930&&n&42?t===Gs?vn++:(vn=0,Gs=t):vn=0,Yn(0)}}function dh(t,e){(t.pooledCacheLanes&=e)===0&&(e=t.pooledCache,e!=null&&(t.pooledCache=null,kn(e)))}function yu(){return ch(),fh(),oh(),hh()}function hh(){if(Lt!==5)return!1;var t=za,e=Zs;Zs=0;var a=fr(Pe),l=lt.T,n=mt.p;try{mt.p=32>a?32:a,lt.T=null,a=Ys,Ys=null;var i=za,u=Pe;if(Lt=0,Cl=za=null,Pe=0,ht&6)throw Error(G(331));var s=ht;if(ht|=4,$d(i.current),Jd(i,i.current,u,a),ht=s,Yn(0,!1),de&&typeof de.onPostCommitFiberRoot=="function")try{de.onPostCommitFiberRoot(Un,i)}catch{}return!0}finally{mt.p=n,lt.T=l,dh(t,e)}}function cf(t,e,a){e=ze(a,e),e=Rs(t.stateNode,e,2),t=xa(t,e,2),t!==null&&(Rn(t,2),Le(t))}function gt(t,e,a){if(t.tag===3)cf(t,t,a);else for(;e!==null;){if(e.tag===3){cf(e,t,a);break}else if(e.tag===1){var l=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof l.componentDidCatch=="function"&&(Sa===null||!Sa.has(l))){t=ze(a,t),a=Nd(2),l=xa(e,a,2),l!==null&&(Od(a,l,e,t),Rn(l,2),Le(l));break}}e=e.return}}function Fu(t,e,a){var l=t.pingCache;if(l===null){l=t.pingCache=new q0;var n=new Set;l.set(e,n)}else n=l.get(e),n===void 0&&(n=new Set,l.set(e,n));n.has(a)||(Qr=!0,n.add(a),t=J0.bind(null,t,e,a),e.then(t,t))}function J0(t,e,a){var l=t.pingCache;l!==null&&l.delete(e),t.pingedLanes|=t.suspendedLanes&a,t.warmLanes&=~a,_t===t&&(ct&a)===a&&(Ot===4||Ot===3&&(ct&62914560)===ct&&300>oe()-pu?!(ht&2)&&jl(t,0):Vr|=a,Ol===ct&&(Ol=0)),Le(t)}function mh(t,e){e===0&&(e=no()),t=$a(t,e),t!==null&&(Rn(t,e),Le(t))}function W0(t){var e=t.memoizedState,a=0;e!==null&&(a=e.retryLane),mh(t,a)}function F0(t,e){var a=0;switch(t.tag){case 31:case 13:var l=t.stateNode,n=t.memoizedState;n!==null&&(a=n.retryLane);break;case 19:l=t.stateNode;break;case 22:l=t.stateNode._retryCache;break;default:throw Error(G(314))}l!==null&&l.delete(e),mh(t,a)}function $0(t,e){return rr(t,e)}var Vi=null,ll=null,qs=!1,Ki=!1,$u=!1,ga=0;function Le(t){t!==ll&&t.next===null&&(ll===null?Vi=ll=t:ll=ll.next=t),Ki=!0,qs||(qs=!0,P0())}function Yn(t,e){if(!$u&&Ki){$u=!0;do for(var a=!1,l=Vi;l!==null;){if(t!==0){var n=l.pendingLanes;if(n===0)var i=0;else{var u=l.suspendedLanes,s=l.pingedLanes;i=(1<<31-he(42|t)+1)-1,i&=n&~(u&~s),i=i&201326741?i&201326741|1:i?i|2:0}i!==0&&(a=!0,ff(l,i))}else i=ct,i=nu(l,l===_t?i:0,l.cancelPendingCommit!==null||l.timeoutHandle!==-1),!(i&3)||Mn(l,i)||(a=!0,ff(l,i));l=l.next}while(a);$u=!1}}function I0(){ph()}function ph(){Ki=qs=!1;var t=0;ga!==0&&c1()&&(t=ga);for(var e=oe(),a=null,l=Vi;l!==null;){var n=l.next,i=vh(l,e);i===0?(l.next=null,a===null?Vi=n:a.next=n,n===null&&(ll=a)):(a=l,(t!==0||i&3)&&(Ki=!0)),l=n}Lt!==0&&Lt!==5||Yn(t),ga!==0&&(ga=0)}function vh(t,e){for(var a=t.suspendedLanes,l=t.pingedLanes,n=t.expirationTimes,i=t.pendingLanes&-62914561;0<i;){var u=31-he(i),s=1<<u,r=n[u];r===-1?(!(s&a)||s&l)&&(n[u]=Am(s,e)):r<=e&&(t.expiredLanes|=s),i&=~s}if(e=_t,a=ct,a=nu(t,t===e?a:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),l=t.callbackNode,a===0||t===e&&(vt===2||vt===9)||t.cancelPendingCommit!==null)return l!==null&&l!==null&&Au(l),t.callbackNode=null,t.callbackPriority=0;if(!(a&3)||Mn(t,a)){if(e=a&-a,e===t.callbackPriority)return e;switch(l!==null&&Au(l),fr(a)){case 2:case 8:a=ao;break;case 32:a=Oi;break;case 268435456:a=lo;break;default:a=Oi}return l=gh.bind(null,t),a=rr(a,l),t.callbackPriority=e,t.callbackNode=a,e}return l!==null&&l!==null&&Au(l),t.callbackPriority=2,t.callbackNode=null,2}function gh(t,e){if(Lt!==0&&Lt!==5)return t.callbackNode=null,t.callbackPriority=0,null;var a=t.callbackNode;if(yu()&&t.callbackNode!==a)return null;var l=ct;return l=nu(t,t===_t?l:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),l===0?null:(ah(t,l,e),vh(t,oe()),t.callbackNode!=null&&t.callbackNode===a?gh.bind(null,t):null)}function ff(t,e){if(yu())return null;ah(t,e,!0)}function P0(){o1(function(){ht&6?rr(eo,I0):ph()})}function Jr(){if(ga===0){var t=Tl;t===0&&(t=Wn,Wn<<=1,!(Wn&261888)&&(Wn=256)),ga=t}return ga}function of(t){return t==null||typeof t=="symbol"||typeof t=="boolean"?null:typeof t=="function"?t:di(""+t)}function df(t,e){var a=e.ownerDocument.createElement("input");return a.name=e.name,a.value=e.value,t.id&&a.setAttribute("form",t.id),e.parentNode.insertBefore(a,e),t=new FormData(t),a.parentNode.removeChild(a),t}function t1(t,e,a,l,n){if(e==="submit"&&a&&a.stateNode===n){var i=of((n[ie]||null).action),u=l.submitter;u&&(e=(e=u[ie]||null)?of(e.formAction):u.getAttribute("formAction"),e!==null&&(i=e,u=null));var s=new iu("action","action",null,l,n);t.push({event:s,listeners:[{instance:null,listener:function(){if(l.defaultPrevented){if(ga!==0){var r=u?df(n,u):new FormData(n);Us(a,{pending:!0,data:r,method:n.method,action:i},null,r)}}else typeof i=="function"&&(s.preventDefault(),r=u?df(n,u):new FormData(n),Us(a,{pending:!0,data:r,method:n.method,action:i},i,r))},currentTarget:n}]})}}for(var Iu=0;Iu<xs.length;Iu++){var Pu=xs[Iu],e1=Pu.toLowerCase(),a1=Pu[0].toUpperCase()+Pu.slice(1);je(e1,"on"+a1)}je(Oo,"onAnimationEnd");je(Co,"onAnimationIteration");je(jo,"onAnimationStart");je("dblclick","onDoubleClick");je("focusin","onFocus");je("focusout","onBlur");je(y0,"onTransitionRun");je(b0,"onTransitionStart");je(_0,"onTransitionCancel");je(Do,"onTransitionEnd");El("onMouseEnter",["mouseout","mouseover"]);El("onMouseLeave",["mouseout","mouseover"]);El("onPointerEnter",["pointerout","pointerover"]);El("onPointerLeave",["pointerout","pointerover"]);Ja("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Ja("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Ja("onBeforeInput",["compositionend","keypress","textInput","paste"]);Ja("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Ja("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Ja("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var wn="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),l1=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(wn));function yh(t,e){e=(e&4)!==0;for(var a=0;a<t.length;a++){var l=t[a],n=l.event;l=l.listeners;t:{var i=void 0;if(e)for(var u=l.length-1;0<=u;u--){var s=l[u],r=s.instance,h=s.currentTarget;if(s=s.listener,r!==i&&n.isPropagationStopped())break t;i=s,n.currentTarget=h;try{i(n)}catch(b){ji(b)}n.currentTarget=null,i=r}else for(u=0;u<l.length;u++){if(s=l[u],r=s.instance,h=s.currentTarget,s=s.listener,r!==i&&n.isPropagationStopped())break t;i=s,n.currentTarget=h;try{i(n)}catch(b){ji(b)}n.currentTarget=null,i=r}}}}function st(t,e){var a=e[hs];a===void 0&&(a=e[hs]=new Set);var l=t+"__bubble";a.has(l)||(bh(e,t,2,!1),a.add(l))}function ts(t,e,a){var l=0;e&&(l|=4),bh(a,t,l,e)}var ii="_reactListening"+Math.random().toString(36).slice(2);function Wr(t){if(!t[ii]){t[ii]=!0,co.forEach(function(a){a!=="selectionchange"&&(l1.has(a)||ts(a,!1,t),ts(a,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[ii]||(e[ii]=!0,ts("selectionchange",!1,e))}}function bh(t,e,a,l){switch(Dh(e)){case 2:var n=j1;break;case 8:n=D1;break;default:n=Pr}a=n.bind(null,e,a,t),n=void 0,!ys||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(n=!0),l?n!==void 0?t.addEventListener(e,a,{capture:!0,passive:n}):t.addEventListener(e,a,!0):n!==void 0?t.addEventListener(e,a,{passive:n}):t.addEventListener(e,a,!1)}function es(t,e,a,l,n){var i=l;if(!(e&1)&&!(e&2)&&l!==null)t:for(;;){if(l===null)return;var u=l.tag;if(u===3||u===4){var s=l.stateNode.containerInfo;if(s===n)break;if(u===4)for(u=l.return;u!==null;){var r=u.tag;if((r===3||r===4)&&u.stateNode.containerInfo===n)return;u=u.return}for(;s!==null;){if(u=ul(s),u===null)return;if(r=u.tag,r===5||r===6||r===26||r===27){l=i=u;continue t}s=s.parentNode}}l=l.return}yo(function(){var h=i,b=hr(a),y=[];t:{var m=Uo.get(t);if(m!==void 0){var o=iu,_=t;switch(t){case"keypress":if(mi(a)===0)break t;case"keydown":case"keyup":o=Fm;break;case"focusin":_="focus",o=Cu;break;case"focusout":_="blur",o=Cu;break;case"beforeblur":case"afterblur":o=Cu;break;case"click":if(a.button===2)break t;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":o=bc;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":o=km;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":o=Pm;break;case Oo:case Co:case jo:o=Ym;break;case Do:o=e0;break;case"scroll":case"scrollend":o=Bm;break;case"wheel":o=l0;break;case"copy":case"cut":case"paste":o=qm;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":o=xc;break;case"toggle":case"beforetoggle":o=i0}var v=(e&4)!==0,x=!v&&(t==="scroll"||t==="scrollend"),c=v?m!==null?m+"Capture":null:m;v=[];for(var d=h,g;d!==null;){var S=d;if(g=S.stateNode,S=S.tag,S!==5&&S!==26&&S!==27||g===null||c===null||(S=bn(d,c),S!=null&&v.push(Nn(d,S,g))),x)break;d=d.return}0<v.length&&(m=new o(m,_,null,a,b),y.push({event:m,listeners:v}))}}if(!(e&7)){t:{if(m=t==="mouseover"||t==="pointerover",o=t==="mouseout"||t==="pointerout",m&&a!==gs&&(_=a.relatedTarget||a.fromElement)&&(ul(_)||_[Rl]))break t;if((o||m)&&(m=b.window===b?b:(m=b.ownerDocument)?m.defaultView||m.parentWindow:window,o?(_=a.relatedTarget||a.toElement,o=h,_=_?ul(_):null,_!==null&&(x=Dn(_),v=_.tag,_!==x||v!==5&&v!==27&&v!==6)&&(_=null)):(o=null,_=h),o!==_)){if(v=bc,S="onMouseLeave",c="onMouseEnter",d="mouse",(t==="pointerout"||t==="pointerover")&&(v=xc,S="onPointerLeave",c="onPointerEnter",d="pointer"),x=o==null?m:tn(o),g=_==null?m:tn(_),m=new v(S,d+"leave",o,a,b),m.target=x,m.relatedTarget=g,S=null,ul(b)===h&&(v=new v(c,d+"enter",_,a,b),v.target=g,v.relatedTarget=x,S=v),x=S,o&&_)e:{for(v=n1,c=o,d=_,g=0,S=c;S;S=v(S))g++;S=0;for(var N=d;N;N=v(N))S++;for(;0<g-S;)c=v(c),g--;for(;0<S-g;)d=v(d),S--;for(;g--;){if(c===d||d!==null&&c===d.alternate){v=c;break e}c=v(c),d=v(d)}v=null}else v=null;o!==null&&hf(y,m,o,v,!1),_!==null&&x!==null&&hf(y,x,_,v,!0)}}t:{if(m=h?tn(h):window,o=m.nodeName&&m.nodeName.toLowerCase(),o==="select"||o==="input"&&m.type==="file")var M=Ac;else if(Ec(m))if(Eo)M=p0;else{M=h0;var w=d0}else o=m.nodeName,!o||o.toLowerCase()!=="input"||m.type!=="checkbox"&&m.type!=="radio"?h&&dr(h.elementType)&&(M=Ac):M=m0;if(M&&(M=M(t,h))){zo(y,M,a,b);break t}w&&w(t,m,h),t==="focusout"&&h&&m.type==="number"&&h.memoizedProps.value!=null&&vs(m,"number",m.value)}switch(w=h?tn(h):window,t){case"focusin":(Ec(w)||w.contentEditable==="true")&&(cl=w,bs=h,sn=null);break;case"focusout":sn=bs=cl=null;break;case"mousedown":_s=!0;break;case"contextmenu":case"mouseup":case"dragend":_s=!1,Cc(y,a,b);break;case"selectionchange":if(g0)break;case"keydown":case"keyup":Cc(y,a,b)}var j;if(vr)t:{switch(t){case"compositionstart":var O="onCompositionStart";break t;case"compositionend":O="onCompositionEnd";break t;case"compositionupdate":O="onCompositionUpdate";break t}O=void 0}else rl?xo(t,a)&&(O="onCompositionEnd"):t==="keydown"&&a.keyCode===229&&(O="onCompositionStart");O&&(_o&&a.locale!=="ko"&&(rl||O!=="onCompositionStart"?O==="onCompositionEnd"&&rl&&(j=bo()):(ma=b,mr="value"in ma?ma.value:ma.textContent,rl=!0)),w=Ji(h,O),0<w.length&&(O=new _c(O,t,null,a,b),y.push({event:O,listeners:w}),j?O.data=j:(j=So(a),j!==null&&(O.data=j)))),(j=s0?r0(t,a):c0(t,a))&&(O=Ji(h,"onBeforeInput"),0<O.length&&(w=new _c("onBeforeInput","beforeinput",null,a,b),y.push({event:w,listeners:O}),w.data=j)),t1(y,t,h,a,b)}yh(y,e)})}function Nn(t,e,a){return{instance:t,listener:e,currentTarget:a}}function Ji(t,e){for(var a=e+"Capture",l=[];t!==null;){var n=t,i=n.stateNode;if(n=n.tag,n!==5&&n!==26&&n!==27||i===null||(n=bn(t,a),n!=null&&l.unshift(Nn(t,n,i)),n=bn(t,e),n!=null&&l.push(Nn(t,n,i))),t.tag===3)return l;t=t.return}return[]}function n1(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5&&t.tag!==27);return t||null}function hf(t,e,a,l,n){for(var i=e._reactName,u=[];a!==null&&a!==l;){var s=a,r=s.alternate,h=s.stateNode;if(s=s.tag,r!==null&&r===l)break;s!==5&&s!==26&&s!==27||h===null||(r=h,n?(h=bn(a,i),h!=null&&u.unshift(Nn(a,h,r))):n||(h=bn(a,i),h!=null&&u.push(Nn(a,h,r)))),a=a.return}u.length!==0&&t.push({event:e,listeners:u})}var i1=/\r\n?/g,u1=/\u0000|\uFFFD/g;function mf(t){return(typeof t=="string"?t:""+t).replace(i1,`
`).replace(u1,"")}function _h(t,e){return e=mf(e),mf(t)===e}function yt(t,e,a,l,n,i){switch(a){case"children":typeof l=="string"?e==="body"||e==="textarea"&&l===""||Al(t,l):(typeof l=="number"||typeof l=="bigint")&&e!=="body"&&Al(t,""+l);break;case"className":In(t,"class",l);break;case"tabIndex":In(t,"tabindex",l);break;case"dir":case"role":case"viewBox":case"width":case"height":In(t,a,l);break;case"style":go(t,l,i);break;case"data":if(e!=="object"){In(t,"data",l);break}case"src":case"href":if(l===""&&(e!=="a"||a!=="href")){t.removeAttribute(a);break}if(l==null||typeof l=="function"||typeof l=="symbol"||typeof l=="boolean"){t.removeAttribute(a);break}l=di(""+l),t.setAttribute(a,l);break;case"action":case"formAction":if(typeof l=="function"){t.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof i=="function"&&(a==="formAction"?(e!=="input"&&yt(t,e,"name",n.name,n,null),yt(t,e,"formEncType",n.formEncType,n,null),yt(t,e,"formMethod",n.formMethod,n,null),yt(t,e,"formTarget",n.formTarget,n,null)):(yt(t,e,"encType",n.encType,n,null),yt(t,e,"method",n.method,n,null),yt(t,e,"target",n.target,n,null)));if(l==null||typeof l=="symbol"||typeof l=="boolean"){t.removeAttribute(a);break}l=di(""+l),t.setAttribute(a,l);break;case"onClick":l!=null&&(t.onclick=We);break;case"onScroll":l!=null&&st("scroll",t);break;case"onScrollEnd":l!=null&&st("scrollend",t);break;case"dangerouslySetInnerHTML":if(l!=null){if(typeof l!="object"||!("__html"in l))throw Error(G(61));if(a=l.__html,a!=null){if(n.children!=null)throw Error(G(60));t.innerHTML=a}}break;case"multiple":t.multiple=l&&typeof l!="function"&&typeof l!="symbol";break;case"muted":t.muted=l&&typeof l!="function"&&typeof l!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(l==null||typeof l=="function"||typeof l=="boolean"||typeof l=="symbol"){t.removeAttribute("xlink:href");break}a=di(""+l),t.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":l!=null&&typeof l!="function"&&typeof l!="symbol"?t.setAttribute(a,""+l):t.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":l&&typeof l!="function"&&typeof l!="symbol"?t.setAttribute(a,""):t.removeAttribute(a);break;case"capture":case"download":l===!0?t.setAttribute(a,""):l!==!1&&l!=null&&typeof l!="function"&&typeof l!="symbol"?t.setAttribute(a,l):t.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":l!=null&&typeof l!="function"&&typeof l!="symbol"&&!isNaN(l)&&1<=l?t.setAttribute(a,l):t.removeAttribute(a);break;case"rowSpan":case"start":l==null||typeof l=="function"||typeof l=="symbol"||isNaN(l)?t.removeAttribute(a):t.setAttribute(a,l);break;case"popover":st("beforetoggle",t),st("toggle",t),oi(t,"popover",l);break;case"xlinkActuate":Ye(t,"http://www.w3.org/1999/xlink","xlink:actuate",l);break;case"xlinkArcrole":Ye(t,"http://www.w3.org/1999/xlink","xlink:arcrole",l);break;case"xlinkRole":Ye(t,"http://www.w3.org/1999/xlink","xlink:role",l);break;case"xlinkShow":Ye(t,"http://www.w3.org/1999/xlink","xlink:show",l);break;case"xlinkTitle":Ye(t,"http://www.w3.org/1999/xlink","xlink:title",l);break;case"xlinkType":Ye(t,"http://www.w3.org/1999/xlink","xlink:type",l);break;case"xmlBase":Ye(t,"http://www.w3.org/XML/1998/namespace","xml:base",l);break;case"xmlLang":Ye(t,"http://www.w3.org/XML/1998/namespace","xml:lang",l);break;case"xmlSpace":Ye(t,"http://www.w3.org/XML/1998/namespace","xml:space",l);break;case"is":oi(t,"is",l);break;case"innerText":case"textContent":break;default:(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")&&(a=Mm.get(a)||a,oi(t,a,l))}}function Xs(t,e,a,l,n,i){switch(a){case"style":go(t,l,i);break;case"dangerouslySetInnerHTML":if(l!=null){if(typeof l!="object"||!("__html"in l))throw Error(G(61));if(a=l.__html,a!=null){if(n.children!=null)throw Error(G(60));t.innerHTML=a}}break;case"children":typeof l=="string"?Al(t,l):(typeof l=="number"||typeof l=="bigint")&&Al(t,""+l);break;case"onScroll":l!=null&&st("scroll",t);break;case"onScrollEnd":l!=null&&st("scrollend",t);break;case"onClick":l!=null&&(t.onclick=We);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!fo.hasOwnProperty(a))t:{if(a[0]==="o"&&a[1]==="n"&&(n=a.endsWith("Capture"),e=a.slice(2,n?a.length-7:void 0),i=t[ie]||null,i=i!=null?i[a]:null,typeof i=="function"&&t.removeEventListener(e,i,n),typeof l=="function")){typeof i!="function"&&i!==null&&(a in t?t[a]=null:t.hasAttribute(a)&&t.removeAttribute(a)),t.addEventListener(e,l,n);break t}a in t?t[a]=l:l===!0?t.setAttribute(a,""):oi(t,a,l)}}}function Wt(t,e,a){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":st("error",t),st("load",t);var l=!1,n=!1,i;for(i in a)if(a.hasOwnProperty(i)){var u=a[i];if(u!=null)switch(i){case"src":l=!0;break;case"srcSet":n=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(G(137,e));default:yt(t,e,i,u,a,null)}}n&&yt(t,e,"srcSet",a.srcSet,a,null),l&&yt(t,e,"src",a.src,a,null);return;case"input":st("invalid",t);var s=i=u=n=null,r=null,h=null;for(l in a)if(a.hasOwnProperty(l)){var b=a[l];if(b!=null)switch(l){case"name":n=b;break;case"type":u=b;break;case"checked":r=b;break;case"defaultChecked":h=b;break;case"value":i=b;break;case"defaultValue":s=b;break;case"children":case"dangerouslySetInnerHTML":if(b!=null)throw Error(G(137,e));break;default:yt(t,e,l,b,a,null)}}mo(t,i,s,r,h,u,n,!1);return;case"select":st("invalid",t),l=u=i=null;for(n in a)if(a.hasOwnProperty(n)&&(s=a[n],s!=null))switch(n){case"value":i=s;break;case"defaultValue":u=s;break;case"multiple":l=s;default:yt(t,e,n,s,a,null)}e=i,a=u,t.multiple=!!l,e!=null?gl(t,!!l,e,!1):a!=null&&gl(t,!!l,a,!0);return;case"textarea":st("invalid",t),i=n=l=null;for(u in a)if(a.hasOwnProperty(u)&&(s=a[u],s!=null))switch(u){case"value":l=s;break;case"defaultValue":n=s;break;case"children":i=s;break;case"dangerouslySetInnerHTML":if(s!=null)throw Error(G(91));break;default:yt(t,e,u,s,a,null)}vo(t,l,n,i);return;case"option":for(r in a)if(a.hasOwnProperty(r)&&(l=a[r],l!=null))switch(r){case"selected":t.selected=l&&typeof l!="function"&&typeof l!="symbol";break;default:yt(t,e,r,l,a,null)}return;case"dialog":st("beforetoggle",t),st("toggle",t),st("cancel",t),st("close",t);break;case"iframe":case"object":st("load",t);break;case"video":case"audio":for(l=0;l<wn.length;l++)st(wn[l],t);break;case"image":st("error",t),st("load",t);break;case"details":st("toggle",t);break;case"embed":case"source":case"link":st("error",t),st("load",t);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(h in a)if(a.hasOwnProperty(h)&&(l=a[h],l!=null))switch(h){case"children":case"dangerouslySetInnerHTML":throw Error(G(137,e));default:yt(t,e,h,l,a,null)}return;default:if(dr(e)){for(b in a)a.hasOwnProperty(b)&&(l=a[b],l!==void 0&&Xs(t,e,b,l,a,void 0));return}}for(s in a)a.hasOwnProperty(s)&&(l=a[s],l!=null&&yt(t,e,s,l,a,null))}function s1(t,e,a,l){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var n=null,i=null,u=null,s=null,r=null,h=null,b=null;for(o in a){var y=a[o];if(a.hasOwnProperty(o)&&y!=null)switch(o){case"checked":break;case"value":break;case"defaultValue":r=y;default:l.hasOwnProperty(o)||yt(t,e,o,null,l,y)}}for(var m in l){var o=l[m];if(y=a[m],l.hasOwnProperty(m)&&(o!=null||y!=null))switch(m){case"type":i=o;break;case"name":n=o;break;case"checked":h=o;break;case"defaultChecked":b=o;break;case"value":u=o;break;case"defaultValue":s=o;break;case"children":case"dangerouslySetInnerHTML":if(o!=null)throw Error(G(137,e));break;default:o!==y&&yt(t,e,m,o,l,y)}}ps(t,u,s,r,h,b,i,n);return;case"select":o=u=s=m=null;for(i in a)if(r=a[i],a.hasOwnProperty(i)&&r!=null)switch(i){case"value":break;case"multiple":o=r;default:l.hasOwnProperty(i)||yt(t,e,i,null,l,r)}for(n in l)if(i=l[n],r=a[n],l.hasOwnProperty(n)&&(i!=null||r!=null))switch(n){case"value":m=i;break;case"defaultValue":s=i;break;case"multiple":u=i;default:i!==r&&yt(t,e,n,i,l,r)}e=s,a=u,l=o,m!=null?gl(t,!!a,m,!1):!!l!=!!a&&(e!=null?gl(t,!!a,e,!0):gl(t,!!a,a?[]:"",!1));return;case"textarea":o=m=null;for(s in a)if(n=a[s],a.hasOwnProperty(s)&&n!=null&&!l.hasOwnProperty(s))switch(s){case"value":break;case"children":break;default:yt(t,e,s,null,l,n)}for(u in l)if(n=l[u],i=a[u],l.hasOwnProperty(u)&&(n!=null||i!=null))switch(u){case"value":m=n;break;case"defaultValue":o=n;break;case"children":break;case"dangerouslySetInnerHTML":if(n!=null)throw Error(G(91));break;default:n!==i&&yt(t,e,u,n,l,i)}po(t,m,o);return;case"option":for(var _ in a)if(m=a[_],a.hasOwnProperty(_)&&m!=null&&!l.hasOwnProperty(_))switch(_){case"selected":t.selected=!1;break;default:yt(t,e,_,null,l,m)}for(r in l)if(m=l[r],o=a[r],l.hasOwnProperty(r)&&m!==o&&(m!=null||o!=null))switch(r){case"selected":t.selected=m&&typeof m!="function"&&typeof m!="symbol";break;default:yt(t,e,r,m,l,o)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var v in a)m=a[v],a.hasOwnProperty(v)&&m!=null&&!l.hasOwnProperty(v)&&yt(t,e,v,null,l,m);for(h in l)if(m=l[h],o=a[h],l.hasOwnProperty(h)&&m!==o&&(m!=null||o!=null))switch(h){case"children":case"dangerouslySetInnerHTML":if(m!=null)throw Error(G(137,e));break;default:yt(t,e,h,m,l,o)}return;default:if(dr(e)){for(var x in a)m=a[x],a.hasOwnProperty(x)&&m!==void 0&&!l.hasOwnProperty(x)&&Xs(t,e,x,void 0,l,m);for(b in l)m=l[b],o=a[b],!l.hasOwnProperty(b)||m===o||m===void 0&&o===void 0||Xs(t,e,b,m,l,o);return}}for(var c in a)m=a[c],a.hasOwnProperty(c)&&m!=null&&!l.hasOwnProperty(c)&&yt(t,e,c,null,l,m);for(y in l)m=l[y],o=a[y],!l.hasOwnProperty(y)||m===o||m==null&&o==null||yt(t,e,y,m,l,o)}function pf(t){switch(t){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function r1(){if(typeof performance.getEntriesByType=="function"){for(var t=0,e=0,a=performance.getEntriesByType("resource"),l=0;l<a.length;l++){var n=a[l],i=n.transferSize,u=n.initiatorType,s=n.duration;if(i&&s&&pf(u)){for(u=0,s=n.responseEnd,l+=1;l<a.length;l++){var r=a[l],h=r.startTime;if(h>s)break;var b=r.transferSize,y=r.initiatorType;b&&pf(y)&&(r=r.responseEnd,u+=b*(r<s?1:(s-h)/(r-h)))}if(--l,e+=8*(i+u)/(n.duration/1e3),t++,10<t)break}}if(0<t)return e/t/1e6}return navigator.connection&&(t=navigator.connection.downlink,typeof t=="number")?t:5}var Qs=null,Vs=null;function Wi(t){return t.nodeType===9?t:t.ownerDocument}function vf(t){switch(t){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function xh(t,e){if(t===0)switch(e){case"svg":return 1;case"math":return 2;default:return 0}return t===1&&e==="foreignObject"?0:t}function Ks(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.children=="bigint"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var as=null;function c1(){var t=window.event;return t&&t.type==="popstate"?t===as?!1:(as=t,!0):(as=null,!1)}var Sh=typeof setTimeout=="function"?setTimeout:void 0,f1=typeof clearTimeout=="function"?clearTimeout:void 0,gf=typeof Promise=="function"?Promise:void 0,o1=typeof queueMicrotask=="function"?queueMicrotask:typeof gf<"u"?function(t){return gf.resolve(null).then(t).catch(d1)}:Sh;function d1(t){setTimeout(function(){throw t})}function Da(t){return t==="head"}function yf(t,e){var a=e,l=0;do{var n=a.nextSibling;if(t.removeChild(a),n&&n.nodeType===8)if(a=n.data,a==="/$"||a==="/&"){if(l===0){t.removeChild(n),Ul(e);return}l--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")l++;else if(a==="html")gn(t.ownerDocument.documentElement);else if(a==="head"){a=t.ownerDocument.head,gn(a);for(var i=a.firstChild;i;){var u=i.nextSibling,s=i.nodeName;i[Bn]||s==="SCRIPT"||s==="STYLE"||s==="LINK"&&i.rel.toLowerCase()==="stylesheet"||a.removeChild(i),i=u}}else a==="body"&&gn(t.ownerDocument.body);a=n}while(a);Ul(e)}function bf(t,e){var a=t;t=0;do{var l=a.nextSibling;if(a.nodeType===1?e?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(e?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),l&&l.nodeType===8)if(a=l.data,a==="/$"){if(t===0)break;t--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||t++;a=l}while(a)}function Js(t){var e=t.firstChild;for(e&&e.nodeType===10&&(e=e.nextSibling);e;){var a=e;switch(e=e.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":Js(a),or(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}t.removeChild(a)}}function h1(t,e,a,l){for(;t.nodeType===1;){var n=a;if(t.nodeName.toLowerCase()!==e.toLowerCase()){if(!l&&(t.nodeName!=="INPUT"||t.type!=="hidden"))break}else if(l){if(!t[Bn])switch(e){case"meta":if(!t.hasAttribute("itemprop"))break;return t;case"link":if(i=t.getAttribute("rel"),i==="stylesheet"&&t.hasAttribute("data-precedence"))break;if(i!==n.rel||t.getAttribute("href")!==(n.href==null||n.href===""?null:n.href)||t.getAttribute("crossorigin")!==(n.crossOrigin==null?null:n.crossOrigin)||t.getAttribute("title")!==(n.title==null?null:n.title))break;return t;case"style":if(t.hasAttribute("data-precedence"))break;return t;case"script":if(i=t.getAttribute("src"),(i!==(n.src==null?null:n.src)||t.getAttribute("type")!==(n.type==null?null:n.type)||t.getAttribute("crossorigin")!==(n.crossOrigin==null?null:n.crossOrigin))&&i&&t.hasAttribute("async")&&!t.hasAttribute("itemprop"))break;return t;default:return t}}else if(e==="input"&&t.type==="hidden"){var i=n.name==null?null:""+n.name;if(n.type==="hidden"&&t.getAttribute("name")===i)return t}else return t;if(t=Te(t.nextSibling),t===null)break}return null}function m1(t,e,a){if(e==="")return null;for(;t.nodeType!==3;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!a||(t=Te(t.nextSibling),t===null))return null;return t}function zh(t,e){for(;t.nodeType!==8;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!e||(t=Te(t.nextSibling),t===null))return null;return t}function Ws(t){return t.data==="$?"||t.data==="$~"}function Fs(t){return t.data==="$!"||t.data==="$?"&&t.ownerDocument.readyState!=="loading"}function p1(t,e){var a=t.ownerDocument;if(t.data==="$~")t._reactRetry=e;else if(t.data!=="$?"||a.readyState!=="loading")e();else{var l=function(){e(),a.removeEventListener("DOMContentLoaded",l)};a.addEventListener("DOMContentLoaded",l),t._reactRetry=l}}function Te(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?"||e==="$~"||e==="&"||e==="F!"||e==="F")break;if(e==="/$"||e==="/&")return null}}return t}var $s=null;function _f(t){t=t.nextSibling;for(var e=0;t;){if(t.nodeType===8){var a=t.data;if(a==="/$"||a==="/&"){if(e===0)return Te(t.nextSibling);e--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||e++}t=t.nextSibling}return null}function xf(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var a=t.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(e===0)return t;e--}else a!=="/$"&&a!=="/&"||e++}t=t.previousSibling}return null}function Eh(t,e,a){switch(e=Wi(a),t){case"html":if(t=e.documentElement,!t)throw Error(G(452));return t;case"head":if(t=e.head,!t)throw Error(G(453));return t;case"body":if(t=e.body,!t)throw Error(G(454));return t;default:throw Error(G(451))}}function gn(t){for(var e=t.attributes;e.length;)t.removeAttributeNode(e[0]);or(t)}var we=new Map,Sf=new Set;function Fi(t){return typeof t.getRootNode=="function"?t.getRootNode():t.nodeType===9?t:t.ownerDocument}var ia=mt.d;mt.d={f:v1,r:g1,D:y1,C:b1,L:_1,m:x1,X:z1,S:S1,M:E1};function v1(){var t=ia.f(),e=vu();return t||e}function g1(t){var e=Bl(t);e!==null&&e.tag===5&&e.type==="form"?gd(e):ia.r(t)}var Zl=typeof document>"u"?null:document;function Ah(t,e,a){var l=Zl;if(l&&typeof e=="string"&&e){var n=Se(e);n='link[rel="'+t+'"][href="'+n+'"]',typeof a=="string"&&(n+='[crossorigin="'+a+'"]'),Sf.has(n)||(Sf.add(n),t={rel:t,crossOrigin:a,href:e},l.querySelector(n)===null&&(e=l.createElement("link"),Wt(e,"link",t),qt(e),l.head.appendChild(e)))}}function y1(t){ia.D(t),Ah("dns-prefetch",t,null)}function b1(t,e){ia.C(t,e),Ah("preconnect",t,e)}function _1(t,e,a){ia.L(t,e,a);var l=Zl;if(l&&t&&e){var n='link[rel="preload"][as="'+Se(e)+'"]';e==="image"&&a&&a.imageSrcSet?(n+='[imagesrcset="'+Se(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(n+='[imagesizes="'+Se(a.imageSizes)+'"]')):n+='[href="'+Se(t)+'"]';var i=n;switch(e){case"style":i=Dl(t);break;case"script":i=Yl(t)}we.has(i)||(t=Tt({rel:"preload",href:e==="image"&&a&&a.imageSrcSet?void 0:t,as:e},a),we.set(i,t),l.querySelector(n)!==null||e==="style"&&l.querySelector(Gn(i))||e==="script"&&l.querySelector(qn(i))||(e=l.createElement("link"),Wt(e,"link",t),qt(e),l.head.appendChild(e)))}}function x1(t,e){ia.m(t,e);var a=Zl;if(a&&t){var l=e&&typeof e.as=="string"?e.as:"script",n='link[rel="modulepreload"][as="'+Se(l)+'"][href="'+Se(t)+'"]',i=n;switch(l){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":i=Yl(t)}if(!we.has(i)&&(t=Tt({rel:"modulepreload",href:t},e),we.set(i,t),a.querySelector(n)===null)){switch(l){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(qn(i)))return}l=a.createElement("link"),Wt(l,"link",t),qt(l),a.head.appendChild(l)}}}function S1(t,e,a){ia.S(t,e,a);var l=Zl;if(l&&t){var n=vl(l).hoistableStyles,i=Dl(t);e=e||"default";var u=n.get(i);if(!u){var s={loading:0,preload:null};if(u=l.querySelector(Gn(i)))s.loading=5;else{t=Tt({rel:"stylesheet",href:t,"data-precedence":e},a),(a=we.get(i))&&Fr(t,a);var r=u=l.createElement("link");qt(r),Wt(r,"link",t),r._p=new Promise(function(h,b){r.onload=h,r.onerror=b}),r.addEventListener("load",function(){s.loading|=1}),r.addEventListener("error",function(){s.loading|=2}),s.loading|=4,Si(u,e,l)}u={type:"stylesheet",instance:u,count:1,state:s},n.set(i,u)}}}function z1(t,e){ia.X(t,e);var a=Zl;if(a&&t){var l=vl(a).hoistableScripts,n=Yl(t),i=l.get(n);i||(i=a.querySelector(qn(n)),i||(t=Tt({src:t,async:!0},e),(e=we.get(n))&&$r(t,e),i=a.createElement("script"),qt(i),Wt(i,"link",t),a.head.appendChild(i)),i={type:"script",instance:i,count:1,state:null},l.set(n,i))}}function E1(t,e){ia.M(t,e);var a=Zl;if(a&&t){var l=vl(a).hoistableScripts,n=Yl(t),i=l.get(n);i||(i=a.querySelector(qn(n)),i||(t=Tt({src:t,async:!0,type:"module"},e),(e=we.get(n))&&$r(t,e),i=a.createElement("script"),qt(i),Wt(i,"link",t),a.head.appendChild(i)),i={type:"script",instance:i,count:1,state:null},l.set(n,i))}}function zf(t,e,a,l){var n=(n=ya.current)?Fi(n):null;if(!n)throw Error(G(446));switch(t){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(e=Dl(a.href),a=vl(n).hoistableStyles,l=a.get(e),l||(l={type:"style",instance:null,count:0,state:null},a.set(e,l)),l):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){t=Dl(a.href);var i=vl(n).hoistableStyles,u=i.get(t);if(u||(n=n.ownerDocument||n,u={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},i.set(t,u),(i=n.querySelector(Gn(t)))&&!i._p&&(u.instance=i,u.state.loading=5),we.has(t)||(a={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},we.set(t,a),i||A1(n,t,a,u.state))),e&&l===null)throw Error(G(528,""));return u}if(e&&l!==null)throw Error(G(529,""));return null;case"script":return e=a.async,a=a.src,typeof a=="string"&&e&&typeof e!="function"&&typeof e!="symbol"?(e=Yl(a),a=vl(n).hoistableScripts,l=a.get(e),l||(l={type:"script",instance:null,count:0,state:null},a.set(e,l)),l):{type:"void",instance:null,count:0,state:null};default:throw Error(G(444,t))}}function Dl(t){return'href="'+Se(t)+'"'}function Gn(t){return'link[rel="stylesheet"]['+t+"]"}function Th(t){return Tt({},t,{"data-precedence":t.precedence,precedence:null})}function A1(t,e,a,l){t.querySelector('link[rel="preload"][as="style"]['+e+"]")?l.loading=1:(e=t.createElement("link"),l.preload=e,e.addEventListener("load",function(){return l.loading|=1}),e.addEventListener("error",function(){return l.loading|=2}),Wt(e,"link",a),qt(e),t.head.appendChild(e))}function Yl(t){return'[src="'+Se(t)+'"]'}function qn(t){return"script[async]"+t}function Ef(t,e,a){if(e.count++,e.instance===null)switch(e.type){case"style":var l=t.querySelector('style[data-href~="'+Se(a.href)+'"]');if(l)return e.instance=l,qt(l),l;var n=Tt({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return l=(t.ownerDocument||t).createElement("style"),qt(l),Wt(l,"style",n),Si(l,a.precedence,t),e.instance=l;case"stylesheet":n=Dl(a.href);var i=t.querySelector(Gn(n));if(i)return e.state.loading|=4,e.instance=i,qt(i),i;l=Th(a),(n=we.get(n))&&Fr(l,n),i=(t.ownerDocument||t).createElement("link"),qt(i);var u=i;return u._p=new Promise(function(s,r){u.onload=s,u.onerror=r}),Wt(i,"link",l),e.state.loading|=4,Si(i,a.precedence,t),e.instance=i;case"script":return i=Yl(a.src),(n=t.querySelector(qn(i)))?(e.instance=n,qt(n),n):(l=a,(n=we.get(i))&&(l=Tt({},a),$r(l,n)),t=t.ownerDocument||t,n=t.createElement("script"),qt(n),Wt(n,"link",l),t.head.appendChild(n),e.instance=n);case"void":return null;default:throw Error(G(443,e.type))}else e.type==="stylesheet"&&!(e.state.loading&4)&&(l=e.instance,e.state.loading|=4,Si(l,a.precedence,t));return e.instance}function Si(t,e,a){for(var l=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),n=l.length?l[l.length-1]:null,i=n,u=0;u<l.length;u++){var s=l[u];if(s.dataset.precedence===e)i=s;else if(i!==n)break}i?i.parentNode.insertBefore(t,i.nextSibling):(e=a.nodeType===9?a.head:a,e.insertBefore(t,e.firstChild))}function Fr(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.title==null&&(t.title=e.title)}function $r(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.integrity==null&&(t.integrity=e.integrity)}var zi=null;function Af(t,e,a){if(zi===null){var l=new Map,n=zi=new Map;n.set(a,l)}else n=zi,l=n.get(a),l||(l=new Map,n.set(a,l));if(l.has(t))return l;for(l.set(t,null),a=a.getElementsByTagName(t),n=0;n<a.length;n++){var i=a[n];if(!(i[Bn]||i[Vt]||t==="link"&&i.getAttribute("rel")==="stylesheet")&&i.namespaceURI!=="http://www.w3.org/2000/svg"){var u=i.getAttribute(e)||"";u=t+u;var s=l.get(u);s?s.push(i):l.set(u,[i])}}return l}function Tf(t,e,a){t=t.ownerDocument||t,t.head.insertBefore(a,e==="title"?t.querySelector("head > title"):null)}function T1(t,e,a){if(a===1||e.itemProp!=null)return!1;switch(t){case"meta":case"title":return!0;case"style":if(typeof e.precedence!="string"||typeof e.href!="string"||e.href==="")break;return!0;case"link":if(typeof e.rel!="string"||typeof e.href!="string"||e.href===""||e.onLoad||e.onError)break;switch(e.rel){case"stylesheet":return t=e.disabled,typeof e.precedence=="string"&&t==null;default:return!0}case"script":if(e.async&&typeof e.async!="function"&&typeof e.async!="symbol"&&!e.onLoad&&!e.onError&&e.src&&typeof e.src=="string")return!0}return!1}function wh(t){return!(t.type==="stylesheet"&&!(t.state.loading&3))}function w1(t,e,a,l){if(a.type==="stylesheet"&&(typeof l.media!="string"||matchMedia(l.media).matches!==!1)&&!(a.state.loading&4)){if(a.instance===null){var n=Dl(l.href),i=e.querySelector(Gn(n));if(i){e=i._p,e!==null&&typeof e=="object"&&typeof e.then=="function"&&(t.count++,t=$i.bind(t),e.then(t,t)),a.state.loading|=4,a.instance=i,qt(i);return}i=e.ownerDocument||e,l=Th(l),(n=we.get(n))&&Fr(l,n),i=i.createElement("link"),qt(i);var u=i;u._p=new Promise(function(s,r){u.onload=s,u.onerror=r}),Wt(i,"link",l),a.instance=i}t.stylesheets===null&&(t.stylesheets=new Map),t.stylesheets.set(a,e),(e=a.state.preload)&&!(a.state.loading&3)&&(t.count++,a=$i.bind(t),e.addEventListener("load",a),e.addEventListener("error",a))}}var ls=0;function N1(t,e){return t.stylesheets&&t.count===0&&Ei(t,t.stylesheets),0<t.count||0<t.imgCount?function(a){var l=setTimeout(function(){if(t.stylesheets&&Ei(t,t.stylesheets),t.unsuspend){var i=t.unsuspend;t.unsuspend=null,i()}},6e4+e);0<t.imgBytes&&ls===0&&(ls=62500*r1());var n=setTimeout(function(){if(t.waitingForImages=!1,t.count===0&&(t.stylesheets&&Ei(t,t.stylesheets),t.unsuspend)){var i=t.unsuspend;t.unsuspend=null,i()}},(t.imgBytes>ls?50:800)+e);return t.unsuspend=a,function(){t.unsuspend=null,clearTimeout(l),clearTimeout(n)}}:null}function $i(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Ei(this,this.stylesheets);else if(this.unsuspend){var t=this.unsuspend;this.unsuspend=null,t()}}}var Ii=null;function Ei(t,e){t.stylesheets=null,t.unsuspend!==null&&(t.count++,Ii=new Map,e.forEach(O1,t),Ii=null,$i.call(t))}function O1(t,e){if(!(e.state.loading&4)){var a=Ii.get(t);if(a)var l=a.get(null);else{a=new Map,Ii.set(t,a);for(var n=t.querySelectorAll("link[data-precedence],style[data-precedence]"),i=0;i<n.length;i++){var u=n[i];(u.nodeName==="LINK"||u.getAttribute("media")!=="not all")&&(a.set(u.dataset.precedence,u),l=u)}l&&a.set(null,l)}n=e.instance,u=n.getAttribute("data-precedence"),i=a.get(u)||l,i===l&&a.set(null,n),a.set(u,n),this.count++,l=$i.bind(this),n.addEventListener("load",l),n.addEventListener("error",l),i?i.parentNode.insertBefore(n,i.nextSibling):(t=t.nodeType===9?t.head:t,t.insertBefore(n,t.firstChild)),e.state.loading|=4}}var On={$$typeof:Je,Provider:null,Consumer:null,_currentValue:ka,_currentValue2:ka,_threadCount:0};function C1(t,e,a,l,n,i,u,s,r){this.tag=1,this.containerInfo=t,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Tu(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Tu(0),this.hiddenUpdates=Tu(null),this.identifierPrefix=l,this.onUncaughtError=n,this.onCaughtError=i,this.onRecoverableError=u,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=r,this.incompleteTransitions=new Map}function Nh(t,e,a,l,n,i,u,s,r,h,b,y){return t=new C1(t,e,a,u,r,h,b,y,s),e=1,i===!0&&(e|=24),i=ce(3,null,null,e),t.current=i,i.stateNode=t,e=zr(),e.refCount++,t.pooledCache=e,e.refCount++,i.memoizedState={element:l,isDehydrated:a,cache:e},Tr(i),t}function Oh(t){return t?(t=dl,t):dl}function Ch(t,e,a,l,n,i){n=Oh(n),l.context===null?l.context=n:l.pendingContext=n,l=_a(e),l.payload={element:a},i=i===void 0?null:i,i!==null&&(l.callback=i),a=xa(t,l,e),a!==null&&(ne(a,t,e),cn(a,t,e))}function wf(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var a=t.retryLane;t.retryLane=a!==0&&a<e?a:e}}function Ir(t,e){wf(t,e),(t=t.alternate)&&wf(t,e)}function jh(t){if(t.tag===13||t.tag===31){var e=$a(t,67108864);e!==null&&ne(e,t,67108864),Ir(t,67108864)}}function Nf(t){if(t.tag===13||t.tag===31){var e=me();e=cr(e);var a=$a(t,e);a!==null&&ne(a,t,e),Ir(t,e)}}var Pi=!0;function j1(t,e,a,l){var n=lt.T;lt.T=null;var i=mt.p;try{mt.p=2,Pr(t,e,a,l)}finally{mt.p=i,lt.T=n}}function D1(t,e,a,l){var n=lt.T;lt.T=null;var i=mt.p;try{mt.p=8,Pr(t,e,a,l)}finally{mt.p=i,lt.T=n}}function Pr(t,e,a,l){if(Pi){var n=Is(l);if(n===null)es(t,e,l,tu,a),Of(t,l);else if(M1(n,t,e,a,l))l.stopPropagation();else if(Of(t,l),e&4&&-1<U1.indexOf(t)){for(;n!==null;){var i=Bl(n);if(i!==null)switch(i.tag){case 3:if(i=i.stateNode,i.current.memoizedState.isDehydrated){var u=Ra(i.pendingLanes);if(u!==0){var s=i;for(s.pendingLanes|=2,s.entangledLanes|=2;u;){var r=1<<31-he(u);s.entanglements[1]|=r,u&=~r}Le(i),!(ht&6)&&(qi=oe()+500,Yn(0))}}break;case 31:case 13:s=$a(i,2),s!==null&&ne(s,i,2),vu(),Ir(i,2)}if(i=Is(l),i===null&&es(t,e,l,tu,a),i===n)break;n=i}n!==null&&l.stopPropagation()}else es(t,e,l,null,a)}}function Is(t){return t=hr(t),tc(t)}var tu=null;function tc(t){if(tu=null,t=ul(t),t!==null){var e=Dn(t);if(e===null)t=null;else{var a=e.tag;if(a===13){if(t=Ff(e),t!==null)return t;t=null}else if(a===31){if(t=$f(e),t!==null)return t;t=null}else if(a===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null)}}return tu=t,null}function Dh(t){switch(t){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(ym()){case eo:return 2;case ao:return 8;case Oi:case bm:return 32;case lo:return 268435456;default:return 32}default:return 32}}var Ps=!1,Ea=null,Aa=null,Ta=null,Cn=new Map,jn=new Map,da=[],U1="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function Of(t,e){switch(t){case"focusin":case"focusout":Ea=null;break;case"dragenter":case"dragleave":Aa=null;break;case"mouseover":case"mouseout":Ta=null;break;case"pointerover":case"pointerout":Cn.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":jn.delete(e.pointerId)}}function $l(t,e,a,l,n,i){return t===null||t.nativeEvent!==i?(t={blockedOn:e,domEventName:a,eventSystemFlags:l,nativeEvent:i,targetContainers:[n]},e!==null&&(e=Bl(e),e!==null&&jh(e)),t):(t.eventSystemFlags|=l,e=t.targetContainers,n!==null&&e.indexOf(n)===-1&&e.push(n),t)}function M1(t,e,a,l,n){switch(e){case"focusin":return Ea=$l(Ea,t,e,a,l,n),!0;case"dragenter":return Aa=$l(Aa,t,e,a,l,n),!0;case"mouseover":return Ta=$l(Ta,t,e,a,l,n),!0;case"pointerover":var i=n.pointerId;return Cn.set(i,$l(Cn.get(i)||null,t,e,a,l,n)),!0;case"gotpointercapture":return i=n.pointerId,jn.set(i,$l(jn.get(i)||null,t,e,a,l,n)),!0}return!1}function Uh(t){var e=ul(t.target);if(e!==null){var a=Dn(e);if(a!==null){if(e=a.tag,e===13){if(e=Ff(a),e!==null){t.blockedOn=e,dc(t.priority,function(){Nf(a)});return}}else if(e===31){if(e=$f(a),e!==null){t.blockedOn=e,dc(t.priority,function(){Nf(a)});return}}else if(e===3&&a.stateNode.current.memoizedState.isDehydrated){t.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}t.blockedOn=null}function Ai(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var a=Is(t.nativeEvent);if(a===null){a=t.nativeEvent;var l=new a.constructor(a.type,a);gs=l,a.target.dispatchEvent(l),gs=null}else return e=Bl(a),e!==null&&jh(e),t.blockedOn=a,!1;e.shift()}return!0}function Cf(t,e,a){Ai(t)&&a.delete(e)}function R1(){Ps=!1,Ea!==null&&Ai(Ea)&&(Ea=null),Aa!==null&&Ai(Aa)&&(Aa=null),Ta!==null&&Ai(Ta)&&(Ta=null),Cn.forEach(Cf),jn.forEach(Cf)}function ui(t,e){t.blockedOn===e&&(t.blockedOn=null,Ps||(Ps=!0,Zt.unstable_scheduleCallback(Zt.unstable_NormalPriority,R1)))}var si=null;function jf(t){si!==t&&(si=t,Zt.unstable_scheduleCallback(Zt.unstable_NormalPriority,function(){si===t&&(si=null);for(var e=0;e<t.length;e+=3){var a=t[e],l=t[e+1],n=t[e+2];if(typeof l!="function"){if(tc(l||a)===null)continue;break}var i=Bl(a);i!==null&&(t.splice(e,3),e-=3,Us(i,{pending:!0,data:n,method:a.method,action:l},l,n))}}))}function Ul(t){function e(r){return ui(r,t)}Ea!==null&&ui(Ea,t),Aa!==null&&ui(Aa,t),Ta!==null&&ui(Ta,t),Cn.forEach(e),jn.forEach(e);for(var a=0;a<da.length;a++){var l=da[a];l.blockedOn===t&&(l.blockedOn=null)}for(;0<da.length&&(a=da[0],a.blockedOn===null);)Uh(a),a.blockedOn===null&&da.shift();if(a=(t.ownerDocument||t).$$reactFormReplay,a!=null)for(l=0;l<a.length;l+=3){var n=a[l],i=a[l+1],u=n[ie]||null;if(typeof i=="function")u||jf(a);else if(u){var s=null;if(i&&i.hasAttribute("formAction")){if(n=i,u=i[ie]||null)s=u.formAction;else if(tc(n)!==null)continue}else s=u.action;typeof s=="function"?a[l+1]=s:(a.splice(l,3),l-=3),jf(a)}}}function Mh(){function t(i){i.canIntercept&&i.info==="react-transition"&&i.intercept({handler:function(){return new Promise(function(u){return n=u})},focusReset:"manual",scroll:"manual"})}function e(){n!==null&&(n(),n=null),l||setTimeout(a,20)}function a(){if(!l&&!navigation.transition){var i=navigation.currentEntry;i&&i.url!=null&&navigation.navigate(i.url,{state:i.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var l=!1,n=null;return navigation.addEventListener("navigate",t),navigation.addEventListener("navigatesuccess",e),navigation.addEventListener("navigateerror",e),setTimeout(a,100),function(){l=!0,navigation.removeEventListener("navigate",t),navigation.removeEventListener("navigatesuccess",e),navigation.removeEventListener("navigateerror",e),n!==null&&(n(),n=null)}}}function ec(t){this._internalRoot=t}bu.prototype.render=ec.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(G(409));var a=e.current,l=me();Ch(a,l,t,e,null,null)};bu.prototype.unmount=ec.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;Ch(t.current,2,null,t,null,null),vu(),e[Rl]=null}};function bu(t){this._internalRoot=t}bu.prototype.unstable_scheduleHydration=function(t){if(t){var e=ro();t={blockedOn:null,target:t,priority:e};for(var a=0;a<da.length&&e!==0&&e<da[a].priority;a++);da.splice(a,0,t),a===0&&Uh(t)}};var Df=Jf.version;if(Df!=="19.2.8")throw Error(G(527,Df,"19.2.8"));mt.findDOMNode=function(t){var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(G(188)):(t=Object.keys(t).join(","),Error(G(268,t)));return t=om(e),t=t!==null?If(t):null,t=t===null?null:t.stateNode,t};var B1={bundleType:0,version:"19.2.8",rendererPackageName:"react-dom",currentDispatcherRef:lt,reconcilerVersion:"19.2.8"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var ri=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!ri.isDisabled&&ri.supportsFiber)try{Un=ri.inject(B1),de=ri}catch{}}au.createRoot=function(t,e){if(!Wf(t))throw Error(G(299));var a=!1,l="",n=Ad,i=Td,u=wd;return e!=null&&(e.unstable_strictMode===!0&&(a=!0),e.identifierPrefix!==void 0&&(l=e.identifierPrefix),e.onUncaughtError!==void 0&&(n=e.onUncaughtError),e.onCaughtError!==void 0&&(i=e.onCaughtError),e.onRecoverableError!==void 0&&(u=e.onRecoverableError)),e=Nh(t,1,!1,null,null,a,l,null,n,i,u,Mh),t[Rl]=e.current,Wr(t),new ec(e)};au.hydrateRoot=function(t,e,a){if(!Wf(t))throw Error(G(299));var l=!1,n="",i=Ad,u=Td,s=wd,r=null;return a!=null&&(a.unstable_strictMode===!0&&(l=!0),a.identifierPrefix!==void 0&&(n=a.identifierPrefix),a.onUncaughtError!==void 0&&(i=a.onUncaughtError),a.onCaughtError!==void 0&&(u=a.onCaughtError),a.onRecoverableError!==void 0&&(s=a.onRecoverableError),a.formState!==void 0&&(r=a.formState)),e=Nh(t,1,!0,e,a??null,l,n,r,i,u,s,Mh),e.context=Oh(null),a=e.current,l=me(),l=cr(l),n=_a(l),n.callback=null,xa(a,n,l),a=l,e.current.lanes=a,Rn(e,a),Le(e),t[Rl]=e.current,Wr(t),new bu(e)};au.version="19.2.8";function Rh(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Rh)}catch(t){console.error(t)}}Rh(),Gf.exports=au;var H1=Gf.exports;const k1=tr(H1);async function L1(){const e=await(await fetch("/api/db/clients")).json();return e.success?e.data:[]}async function Z1(){const e=await(await fetch("/api/db/logs")).json();return e.success?e.data:[]}async function Y1(){return(await(await fetch("/api/db/logs",{method:"DELETE"})).json()).success}async function G1(t){return(await(await fetch(`/api/db/clients/${t}`,{method:"DELETE"})).json()).success}function q1(){const[t,e]=it.useState([]),[a,l]=it.useState([]),n=it.useCallback(async()=>{try{const r=await L1();e(r)}catch{}},[]),i=it.useCallback(async()=>{try{const r=await Z1();l(r)}catch{}},[]),u=it.useCallback(async()=>confirm("데이터베이스 내의 모든 크롤링 수집 로그를 완전 소거하시겠습니까?")&&await Y1()?(alert("데이터베이스의 모든 수집 로그가 일괄 소거되었습니다."),await i(),!0):!1,[i]),s=it.useCallback(async r=>confirm(`대상 클라이언트 [${r}]를 강제 정화 격리하시겠습니까?`)&&await G1(r)?(alert("지정된 클라이언트 기기가 완전히 차단 제거되었습니다."),await n(),await i(),!0):!1,[n,i]);return{clients:t,logs:a,setLogs:l,loadClients:n,loadLogs:i,executeClearLogs:u,executePurgeClient:s}}function X1(){const t="ws://localhost:9600?clientId=admin-main&clientType=admin";return new WebSocket(t)}function Q1(t,e,a,l){if(!t||t.readyState!==WebSocket.OPEN)return!1;const n={senderId:"admin-main",targetId:e,action:a,payload:l};return t.send(JSON.stringify(n)),!0}function V1(t,e){const[a,l]=it.useState("DISCONNECTED"),n=it.useRef(null);it.useEffect(()=>{const u=X1();return n.current=u,u.onopen=()=>{l("CONNECTED"),e&&e()},u.onmessage=s=>{try{const r=JSON.parse(s.data);r.action==="CRAWL_LOG"&&t(h=>[{id:Date.now(),client_id:r.senderId,log_message:JSON.stringify(r.payload),timestamp:Date.now()},...h])}catch{}},u.onclose=()=>{l("DISCONNECTED")},()=>{u.close()}},[t,e]);const i=it.useCallback((u,s,r)=>{try{const h=JSON.parse(r);return Q1(n.current,u,s,h)?(alert(`명령 송출 완료 [대상: ${u}] [지시: ${s}]`),!0):(alert("통신 채널이 오프라인 상태입니다."),!1)}catch{return alert("페이로드 데이터가 올바른 JSON 포맷이 아닙니다."),!1}},[]);return{wsStatus:a,dispatchCommand:i}}function K1(){const[t,e]=it.useState(!1),[a,l]=it.useState("Default-Crawler-Cluster");return E.jsxs("div",{className:"relative select-none",children:[E.jsxs("button",{onClick:()=>e(n=>!n),className:"flex items-center gap-2 bg-slate-900/70 hover:bg-slate-800 px-3 py-1 rounded text-xs text-white border border-slate-700 transition",children:[E.jsx("span",{className:"material-symbols-outlined text-sm",children:"workspace_premium"}),E.jsx("span",{className:"font-semibold",children:a}),E.jsx("span",{className:"material-symbols-outlined text-[10px]",children:"expand_more"})]}),t&&E.jsxs("div",{className:"absolute top-full left-0 mt-1 w-64 bg-[#111827] shadow-lg border border-slate-700 rounded text-xs text-slate-100 z-50",children:[E.jsx("div",{className:"px-3 py-2 text-[10px] font-bold text-slate-500 uppercase",children:"프로젝트 선택"}),E.jsxs("button",{onClick:()=>{l("Default-Crawler-Cluster"),e(!1)},className:"w-full text-left px-3 py-2 hover:bg-slate-800 flex justify-between items-center",children:[E.jsx("span",{children:"Default-Crawler-Cluster"}),a==="Default-Crawler-Cluster"&&E.jsx("span",{className:"text-[#1A73E8] text-[10px]",children:"✓ 선택됨"})]}),E.jsxs("button",{onClick:()=>{l("Staging-Crawler-Cluster"),e(!1)},className:"w-full text-left px-3 py-2 hover:bg-slate-800 flex justify-between items-center text-slate-300",children:[E.jsx("span",{children:"Staging-Crawler-Cluster"}),a==="Staging-Crawler-Cluster"&&E.jsx("span",{className:"text-[#1A73E8] text-[10px]",children:"✓ 선택됨"})]})]})]})}function J1(){return E.jsx("div",{className:"hidden md:flex items-center flex-1 max-w-md mx-4 select-none",children:E.jsxs("div",{className:"relative w-full",children:[E.jsx("span",{className:"absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-sm",children:E.jsx("span",{className:"material-symbols-outlined",children:"search"})}),E.jsx("input",{type:"text",placeholder:"노드, 로그, 액션을 검색하세요",className:"w-full pl-11 pr-3 py-2 bg-[#1E293B] border border-slate-700 rounded shadow-sm text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition"})]})})}function W1({wsStatus:t,onRefresh:e}){return E.jsxs("div",{className:"flex items-center gap-2 select-none",children:[E.jsxs("div",{className:"flex items-center gap-2 bg-slate-900/70 px-3 py-2 rounded border border-slate-700 text-sm text-white",children:[E.jsx("span",{className:`h-2.5 w-2.5 rounded-full ${t==="CONNECTED"?"bg-emerald-300 animate-pulse":"bg-rose-300"}`}),E.jsx("span",{children:t==="CONNECTED"?"연결됨":"연결 끊김"})]}),E.jsx("button",{onClick:e,className:"p-2 bg-slate-900/70 hover:bg-slate-800 rounded transition text-white",title:"데이터 새로고침",children:E.jsx("span",{className:"material-symbols-outlined",children:"refresh"})}),E.jsx("div",{className:"w-8 h-8 rounded-full bg-slate-900/70 border border-slate-700 flex items-center justify-center font-semibold text-sm text-white ml-1",children:"A"})]})}function F1({wsStatus:t,onToggleSidebar:e,onRefresh:a}){return E.jsxs("header",{className:"h-14 bg-[#0F172A] text-white flex items-center justify-between px-4 select-none shadow-sm z-50",children:[E.jsxs("div",{className:"flex items-center gap-3",children:[E.jsx("button",{onClick:e,className:"p-2 hover:bg-blue-600/90 rounded transition text-white",title:"네비게이션 메뉴",children:E.jsx("span",{className:"material-symbols-outlined text-lg",children:"menu"})}),E.jsxs("div",{className:"flex items-center gap-2 font-medium text-sm tracking-tight pr-3 border-r border-blue-300/20",children:[E.jsx("span",{className:"bg-slate-900/70 text-[#1A73E8] font-black text-xs px-2 py-1 rounded",children:"GCP"}),E.jsx("span",{children:"WebCrawlServer 관리자"})]}),E.jsx(K1,{})]}),E.jsx(J1,{}),E.jsx(W1,{wsStatus:t,onRefresh:a})]})}function $1({activeTab:t,onRefresh:e,onClearLogs:a}){const l=()=>t==="clients"?"수집 노드 관리":t==="console"?"원격 지시 콘솔":"수집 로그 확인";return E.jsxs("div",{className:"h-12 bg-[#161C27] border-b border-slate-800 px-5 flex items-center justify-between text-sm text-slate-200 select-none shadow-sm",children:[E.jsxs("div",{className:"flex items-center gap-2 font-medium",children:[E.jsx("span",{className:"text-slate-500",children:"WebCrawlServer"}),E.jsx("span",{className:"text-slate-300",children:"›"}),E.jsx("span",{className:"text-slate-500",children:"관리자 대시보드"}),E.jsx("span",{className:"text-slate-300",children:"›"}),E.jsx("span",{className:"text-[#1A73E8] font-semibold",children:l()})]}),E.jsxs("div",{className:"flex items-center gap-2",children:[E.jsxs("button",{onClick:e,className:"flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-100 transition",children:[E.jsx("span",{className:"material-symbols-outlined",children:"refresh"}),E.jsx("span",{children:"새로고침"})]}),t==="logs"&&E.jsxs("button",{onClick:a,className:"flex items-center gap-2 px-3 py-2 bg-red-700/20 hover:bg-red-700/30 rounded text-red-200 transition border border-red-700/30",children:[E.jsx("span",{className:"material-symbols-outlined",children:"delete"}),E.jsx("span",{children:"로그 삭제"})]})]})]})}function I1({isCollapsed:t,onToggleCollapse:e,activeTab:a,onSelectTab:l,clientCount:n}){const[i,u]=it.useState(!1);return E.jsxs("aside",{className:`bg-[#111827] border-r border-slate-800 flex flex-col justify-between transition-all duration-200 select-none shadow-sm ${t?"w-20":"w-64"}`,children:[E.jsxs("div",{className:"flex flex-col py-4",children:[E.jsxs("button",{onClick:()=>l("clients"),className:`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${a==="clients"?"bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]":"text-slate-300 hover:bg-slate-900"}`,children:[E.jsx("span",{className:"material-symbols-outlined",children:"dashboard"}),!t&&E.jsxs("div",{className:"flex justify-between items-center w-full",children:[E.jsx("span",{children:"수집 노드 관리"}),E.jsx("span",{className:"bg-slate-900/70 text-slate-300 text-[10px] px-2 py-0.5 rounded-full border border-slate-800",children:n})]})]}),E.jsxs("button",{onClick:()=>l("console"),className:`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${a==="console"?"bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]":"text-slate-300 hover:bg-slate-900"}`,children:[E.jsx("span",{className:"material-symbols-outlined",children:"send_to_mobile"}),!t&&E.jsx("span",{children:"원격 지시 콘솔"})]}),E.jsxs("button",{onClick:()=>l("logs"),className:`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${a==="logs"?"bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]":"text-slate-300 hover:bg-slate-900"}`,children:[E.jsx("span",{className:"material-symbols-outlined",children:"article"}),!t&&E.jsx("span",{children:"수집 로그"})]}),E.jsxs("div",{className:"mt-2",children:[E.jsxs("button",{onClick:()=>u(!i),className:`flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition w-full ${a==="favicon"?"bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]":"text-slate-300 hover:bg-slate-900"}`,children:[E.jsxs("div",{className:"flex items-center gap-3",children:[E.jsx("span",{className:"material-symbols-outlined",children:"build"}),!t&&E.jsx("span",{children:"Utils"})]}),!t&&E.jsx("span",{className:`material-symbols-outlined transition-transform ${i?"rotate-90":""}`,children:"chevron_right"})]}),i&&!t&&E.jsx("div",{className:"pl-8",children:E.jsxs("button",{onClick:()=>l("favicon"),className:`flex items-center gap-3 px-4 py-2 text-sm font-medium transition w-full ${a==="favicon"?"bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]":"text-slate-400 hover:bg-slate-900"}`,children:[E.jsx("span",{className:"material-symbols-outlined text-lg",children:"image"}),E.jsx("span",{children:"파비콘 만들기"})]})})]})]}),E.jsx("div",{className:"border-t border-slate-800 p-3",children:E.jsxs("button",{onClick:e,className:"w-full flex items-center justify-center gap-2 p-2 text-slate-300 hover:bg-slate-900 rounded text-sm transition",children:[E.jsx("span",{className:"material-symbols-outlined text-base",children:t?"chevron_right":"chevron_left"}),!t&&"사이드바 접기"]})})]})}function P1({children:t,wsStatus:e,clientCount:a,activeTab:l,onSelectTab:n,onRefresh:i,onClearLogs:u}){const[s,r]=it.useState(!1);return E.jsxs("div",{className:"min-h-screen bg-[#141A23] text-slate-100 flex flex-col font-sans select-none",children:[E.jsx(F1,{wsStatus:e,onToggleSidebar:()=>r(h=>!h),onRefresh:i}),E.jsx($1,{activeTab:l,onRefresh:i,onClearLogs:u}),E.jsxs("div",{className:"flex-1 flex overflow-hidden",children:[E.jsx(I1,{isCollapsed:s,onToggleCollapse:()=>r(h=>!h),activeTab:l,onSelectTab:n,clientCount:a}),E.jsx("main",{className:"flex-1 p-6 overflow-y-auto bg-[#161C27]",children:t})]})]})}function ci({title:t,value:e,subValue:a,valueColorClass:l="text-white"}){return E.jsxs("div",{className:"bg-[#202124] border border-gray-800 rounded p-3 flex flex-col justify-between shadow-sm",children:[E.jsx("div",{className:"text-[11px] font-medium text-gray-400",children:t}),E.jsxs("div",{className:"flex items-baseline justify-between mt-2",children:[E.jsx("div",{className:`text-2xl font-bold font-mono ${l}`,children:e}),E.jsx("div",{className:"text-[10px] text-gray-400",children:a})]})]})}function tp({clientCount:t,logCount:e}){return E.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 select-none",children:[E.jsx(ci,{title:"ACTIVE CRAWLER NODES",value:t,subValue:"● Online Status",valueColorClass:"text-green-400"}),E.jsx(ci,{title:"TOTAL CRAWLED LOGS",value:e,subValue:"Rows in SQLite",valueColorClass:"text-yellow-400"}),E.jsx(ci,{title:"DATABASE JOURNAL MODE",value:"WAL Mode",subValue:"better-sqlite3",valueColorClass:"text-blue-400"}),E.jsx(ci,{title:"NETWORK PORT BINDING",value:"Port 9600",subValue:"HTTP/WS Shared",valueColorClass:"text-green-400"})]})}function ep({clients:t,logs:e,onSelectTarget:a,onPurgeClient:l,onOpenDomModal:n}){const i=s=>e.find(r=>r.client_id===s),u=s=>{if(!s)return"N/A";const r=Number(s),h=isNaN(r)?new Date(s):new Date(r);return isNaN(h.getTime())?"알 수 없는 시각":h.toLocaleString()};return E.jsxs("div",{className:"bg-[#202124] border border-gray-800 rounded shadow-sm overflow-hidden select-text",children:[E.jsx("div",{className:"px-4 py-3 border-b border-gray-800 flex justify-between items-center bg-[#28292c]",children:E.jsxs("span",{className:"font-bold text-xs text-gray-200 tracking-wide uppercase",children:["Crawler Node Instances (",t.length,")"]})}),E.jsxs("div",{className:"overflow-x-auto",children:[E.jsxs("table",{className:"w-full text-left border-collapse text-xs",children:[E.jsx("thead",{children:E.jsxs("tr",{className:"bg-[#111827] text-slate-300 border-b border-slate-800 text-[11px] font-semibold",children:[E.jsx("th",{className:"p-3 w-10 text-center",children:"#"}),E.jsx("th",{className:"p-3",children:"노드 ID"}),E.jsx("th",{className:"p-3",children:"클라이언트 타입"}),E.jsx("th",{className:"p-3",children:"상태"}),E.jsx("th",{className:"p-3",children:"수신 데이터 알림"}),E.jsx("th",{className:"p-3",children:"최초 등록/연결 시간"}),E.jsx("th",{className:"p-3 text-right",children:"작업"})]})}),E.jsx("tbody",{className:"divide-y divide-gray-800 text-gray-200 font-mono",children:t.map(s=>{const r=i(s.client_id),h=!!s.is_online;return E.jsxs("tr",{className:"hover:bg-[#2d2e31] transition",children:[E.jsx("td",{className:"p-3 text-center text-slate-400",children:s.client_id.slice(0,4)}),E.jsx("td",{className:"p-3 font-semibold text-slate-100 select-text break-all",children:s.client_id}),E.jsx("td",{className:"p-3",children:E.jsx("span",{className:"bg-slate-800 text-slate-200 text-[10px] px-2 py-0.5 rounded border border-slate-700",children:s.client_type})}),E.jsx("td",{className:"p-3 font-sans",children:h?E.jsxs("span",{className:"inline-flex items-center gap-1.5 bg-emerald-900/40 text-emerald-300 text-[11px] px-2 py-0.5 rounded border border-emerald-700/40 font-semibold",children:[E.jsx("span",{className:"h-2 w-2 rounded-full bg-emerald-400 animate-pulse"}),"연결됨 (온라인)"]}):E.jsxs("span",{className:"inline-flex items-center gap-1.5 bg-slate-800 text-slate-400 text-[11px] px-2 py-0.5 rounded border border-slate-700",children:[E.jsx("span",{className:"h-2 w-2 rounded-full bg-slate-500"}),"연결 끊김 (과거 기록)"]})}),E.jsx("td",{className:"p-3",children:r?E.jsxs("button",{onClick:()=>n(s.client_id,r),className:"inline-flex items-center gap-1.5 bg-[#1A73E8] hover:bg-[#185abc] text-white text-[11px] font-sans font-semibold px-2.5 py-1 rounded transition shadow-sm cursor-pointer",children:[E.jsx("span",{className:"material-symbols-outlined text-xs",children:"notifications_active"}),"수신받은 데이터 보기"]}):E.jsx("span",{className:"text-slate-500 text-[11px] font-sans",children:"수신 데이터 없음"})}),E.jsx("td",{className:"p-3 text-slate-400 text-[12px]",children:u(s.connected_at)}),E.jsx("td",{className:"p-3 text-right font-sans",children:E.jsxs("div",{className:"flex justify-end gap-2",children:[E.jsx("button",{onClick:()=>a(s.client_id),className:"bg-gray-800 hover:bg-gray-700 text-xs px-2.5 py-0.5 rounded text-gray-200 transition border border-gray-700",children:"Select Target"}),E.jsx("button",{onClick:()=>l(s.client_id),className:"bg-red-900/60 hover:bg-red-800 text-xs px-2.5 py-0.5 rounded text-red-200 transition border border-red-800",title:"DB에서 삭제 및 영구 추방",children:"Purge"})]})})]},s.client_id)})})]}),t.length===0&&E.jsx("div",{className:"p-8 text-center text-gray-500 text-sm",children:"등록된 수집 노드 인스턴스가 없습니다."})]})]})}function ap({isOpen:t,clientId:e,log:a,onClose:l}){if(!t||!a)return null;let n={};try{n=typeof a.log_message=="string"?JSON.parse(a.log_message):a.log_message}catch{n={fullDom:a.log_message}}const i=n.fullDom||JSON.stringify(n,null,2);return E.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-text",children:E.jsxs("div",{className:"bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden",children:[E.jsxs("div",{className:"px-6 py-4 bg-[#111827] border-b border-slate-800 flex justify-between items-center select-none",children:[E.jsxs("div",{className:"flex items-center gap-2",children:[E.jsx("span",{className:"material-symbols-outlined text-blue-400",children:"code_blocks"}),E.jsxs("h3",{className:"font-bold text-sm text-slate-100",children:["수신받은 DOM 데이터 내용 [",E.jsx("span",{className:"text-blue-300 font-mono",children:e}),"]"]})]}),E.jsx("button",{onClick:l,className:"text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition",children:E.jsx("span",{className:"material-symbols-outlined",children:"close"})})]}),E.jsxs("div",{className:"p-6 overflow-y-auto flex flex-col gap-4 font-sans text-xs",children:[E.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#111827] p-4 rounded-lg border border-slate-800",children:[E.jsxs("div",{children:[E.jsx("span",{className:"text-slate-500 font-semibold block mb-1",children:"페이지 제목"}),E.jsx("span",{className:"text-slate-200 font-medium",children:n.title||"제목 없음"})]}),E.jsxs("div",{children:[E.jsx("span",{className:"text-slate-500 font-semibold block mb-1",children:"수신 URL"}),E.jsx("a",{href:n.url||"#",target:"_blank",rel:"noreferrer",className:"text-blue-400 hover:underline truncate block",children:n.url||"N/A"})]}),E.jsxs("div",{children:[E.jsx("span",{className:"text-slate-500 font-semibold block mb-1",children:"수신 타임스탬프"}),E.jsx("span",{className:"text-slate-300 font-mono",children:new Date(a.timestamp).toLocaleString()})]}),E.jsxs("div",{children:[E.jsx("span",{className:"text-slate-500 font-semibold block mb-1",children:"데이터 크기"}),E.jsxs("span",{className:"text-emerald-400 font-mono",children:[(i.length/1024).toFixed(2)," KB"]})]})]}),E.jsxs("div",{children:[E.jsxs("div",{className:"flex justify-between items-center mb-2 select-none",children:[E.jsx("span",{className:"font-bold text-slate-300 text-xs",children:"페이지 전체 DOM 원본 (HTML Source)"}),E.jsxs("button",{onClick:()=>navigator.clipboard.writeText(i),className:"text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded transition border border-slate-700 flex items-center gap-1",children:[E.jsx("span",{className:"material-symbols-outlined text-xs",children:"content_copy"}),"클립보드 복사"]})]}),E.jsx("pre",{className:"bg-[#0F172A] p-4 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-[400px] whitespace-pre-wrap break-all select-text leading-relaxed",children:i})]})]}),E.jsx("div",{className:"px-6 py-3 bg-[#111827] border-t border-slate-800 flex justify-end select-none",children:E.jsx("button",{onClick:l,className:"bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-4 py-2 rounded-lg transition",children:"닫기"})})]})})}function lp({clients:t,logs:e,logCount:a,onSelectTarget:l,onPurgeClient:n}){const[i,u]=it.useState({isOpen:!1,clientId:"",log:null}),s=(h,b)=>{u({isOpen:!0,clientId:h,log:b})},r=()=>{u({isOpen:!1,clientId:"",log:null})};return E.jsxs("div",{className:"flex flex-col gap-4",children:[E.jsx(tp,{clientCount:t.length,logCount:a}),E.jsx(ep,{clients:t,logs:e,onSelectTarget:l,onPurgeClient:n,onOpenDomModal:s}),E.jsx(ap,{isOpen:i.isOpen,clientId:i.clientId,log:i.log,onClose:r})]})}function np({targetId:t,setTargetId:e,onDispatch:a}){const[l,n]=it.useState("CRAWL_START"),[i,u]=it.useState('{"targetUrl": "https://example.com", "depth": 2}');return E.jsxs("div",{className:"bg-[#202124] p-5 rounded border border-gray-800 flex flex-col gap-5 max-w-4xl shadow-sm",children:[E.jsx("div",{className:"flex justify-between items-center border-b border-gray-800 pb-2 mb-2",children:E.jsx("h2",{className:"text-lg font-bold text-green-400",children:"Remote Control Console"})}),E.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[E.jsxs("div",{children:[E.jsx("label",{className:"block text-xs text-slate-500 mb-1 uppercase tracking-wide",children:"대상 클라이언트"}),E.jsx("input",{value:t,onChange:s=>e(s.target.value),placeholder:"client ID 또는 ALL 입력",className:"w-full p-3 bg-[#111827] border border-slate-700 rounded text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition"})]}),E.jsxs("div",{children:[E.jsx("label",{className:"block text-xs text-slate-500 mb-1 uppercase tracking-wide",children:"지시 액션"}),E.jsxs("select",{value:l,onChange:s=>n(s.target.value),className:"w-full p-3 bg-[#111827] border border-slate-700 rounded text-sm text-slate-100 outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition",children:[E.jsx("option",{value:"CRAWL_START",children:"CRAWL_START - 수집 시작"}),E.jsx("option",{value:"CRAWL_STOP",children:"CRAWL_STOP - 수집 중지"})]})]}),E.jsx("div",{className:"flex items-end",children:E.jsx("button",{onClick:()=>a(t,l,i),className:"w-full bg-[#1A73E8] hover:bg-[#185abc] text-white font-semibold text-sm p-3 rounded transition shadow-sm h-[54px]",children:"명령 전송"})})]}),E.jsxs("div",{children:[E.jsx("label",{className:"block text-xs text-slate-500 mb-1 uppercase tracking-wide",children:"JSON 페이로드"}),E.jsx("textarea",{value:i,onChange:s=>u(s.target.value),rows:6,placeholder:'{"targetUrl": "https://example.com", "depth": 2}',className:"w-full p-3 bg-[#111827] border border-slate-700 rounded text-sm text-slate-100 font-mono outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition"})]})]})}function ip({logs:t,onClearLogs:e}){return E.jsxs("div",{className:"bg-[#111827] p-6 rounded-2xl border border-slate-800 flex flex-col gap-5 shadow-sm",children:[E.jsxs("div",{className:"flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",children:[E.jsxs("div",{children:[E.jsx("h2",{className:"text-xl font-semibold text-slate-100",children:"수집 로그"}),E.jsx("p",{className:"text-sm text-slate-400",children:"실시간으로 수집된 패킷 로그를 확인합니다."})]}),E.jsxs("button",{onClick:e,className:"inline-flex items-center gap-2 px-4 py-2 bg-red-700/20 hover:bg-red-700/30 text-red-200 rounded-lg transition border border-red-700/30 text-sm",children:[E.jsx("span",{className:"material-symbols-outlined",children:"delete"}),"전체 로그 삭제"]})]}),E.jsx("div",{className:"flex flex-col gap-3 overflow-y-auto max-h-[640px] font-mono text-sm text-slate-200 select-text",children:t.length===0?E.jsx("div",{className:"text-center text-slate-500 py-20",children:"수집 로그가 없습니다."}):t.map(a=>E.jsxs("div",{className:"bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-sm",children:[E.jsxs("div",{className:"flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 text-slate-500 text-xs",children:[E.jsxs("span",{className:"truncate max-w-full",children:["출처: ",a.client_id]}),E.jsxs("span",{children:["수신 시간: ",new Date(a.timestamp).toLocaleTimeString()]})]}),E.jsx("div",{className:"mt-3 text-slate-200 break-words whitespace-pre-wrap",children:a.log_message})]},a.id))})]})}function fi(t){throw new Error('Could not dynamically require "'+t+'". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.')}var Bh={exports:{}};/*!

JSZip v3.10.1 - A JavaScript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/main/LICENSE
*/(function(t,e){(function(a){t.exports=a()})(function(){return function a(l,n,i){function u(h,b){if(!n[h]){if(!l[h]){var y=typeof fi=="function"&&fi;if(!b&&y)return y(h,!0);if(s)return s(h,!0);var m=new Error("Cannot find module '"+h+"'");throw m.code="MODULE_NOT_FOUND",m}var o=n[h]={exports:{}};l[h][0].call(o.exports,function(_){var v=l[h][1][_];return u(v||_)},o,o.exports,a,l,n,i)}return n[h].exports}for(var s=typeof fi=="function"&&fi,r=0;r<i.length;r++)u(i[r]);return u}({1:[function(a,l,n){var i=a("./utils"),u=a("./support"),s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";n.encode=function(r){for(var h,b,y,m,o,_,v,x=[],c=0,d=r.length,g=d,S=i.getTypeOf(r)!=="string";c<r.length;)g=d-c,y=S?(h=r[c++],b=c<d?r[c++]:0,c<d?r[c++]:0):(h=r.charCodeAt(c++),b=c<d?r.charCodeAt(c++):0,c<d?r.charCodeAt(c++):0),m=h>>2,o=(3&h)<<4|b>>4,_=1<g?(15&b)<<2|y>>6:64,v=2<g?63&y:64,x.push(s.charAt(m)+s.charAt(o)+s.charAt(_)+s.charAt(v));return x.join("")},n.decode=function(r){var h,b,y,m,o,_,v=0,x=0,c="data:";if(r.substr(0,c.length)===c)throw new Error("Invalid base64 input, it looks like a data url.");var d,g=3*(r=r.replace(/[^A-Za-z0-9+/=]/g,"")).length/4;if(r.charAt(r.length-1)===s.charAt(64)&&g--,r.charAt(r.length-2)===s.charAt(64)&&g--,g%1!=0)throw new Error("Invalid base64 input, bad content length.");for(d=u.uint8array?new Uint8Array(0|g):new Array(0|g);v<r.length;)h=s.indexOf(r.charAt(v++))<<2|(m=s.indexOf(r.charAt(v++)))>>4,b=(15&m)<<4|(o=s.indexOf(r.charAt(v++)))>>2,y=(3&o)<<6|(_=s.indexOf(r.charAt(v++))),d[x++]=h,o!==64&&(d[x++]=b),_!==64&&(d[x++]=y);return d}},{"./support":30,"./utils":32}],2:[function(a,l,n){var i=a("./external"),u=a("./stream/DataWorker"),s=a("./stream/Crc32Probe"),r=a("./stream/DataLengthProbe");function h(b,y,m,o,_){this.compressedSize=b,this.uncompressedSize=y,this.crc32=m,this.compression=o,this.compressedContent=_}h.prototype={getContentWorker:function(){var b=new u(i.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new r("data_length")),y=this;return b.on("end",function(){if(this.streamInfo.data_length!==y.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch")}),b},getCompressedWorker:function(){return new u(i.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize",this.compressedSize).withStreamInfo("uncompressedSize",this.uncompressedSize).withStreamInfo("crc32",this.crc32).withStreamInfo("compression",this.compression)}},h.createWorkerFrom=function(b,y,m){return b.pipe(new s).pipe(new r("uncompressedSize")).pipe(y.compressWorker(m)).pipe(new r("compressedSize")).withStreamInfo("compression",y)},l.exports=h},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(a,l,n){var i=a("./stream/GenericWorker");n.STORE={magic:"\0\0",compressWorker:function(){return new i("STORE compression")},uncompressWorker:function(){return new i("STORE decompression")}},n.DEFLATE=a("./flate")},{"./flate":7,"./stream/GenericWorker":28}],4:[function(a,l,n){var i=a("./utils"),u=function(){for(var s,r=[],h=0;h<256;h++){s=h;for(var b=0;b<8;b++)s=1&s?3988292384^s>>>1:s>>>1;r[h]=s}return r}();l.exports=function(s,r){return s!==void 0&&s.length?i.getTypeOf(s)!=="string"?function(h,b,y,m){var o=u,_=m+y;h^=-1;for(var v=m;v<_;v++)h=h>>>8^o[255&(h^b[v])];return-1^h}(0|r,s,s.length,0):function(h,b,y,m){var o=u,_=m+y;h^=-1;for(var v=m;v<_;v++)h=h>>>8^o[255&(h^b.charCodeAt(v))];return-1^h}(0|r,s,s.length,0):0}},{"./utils":32}],5:[function(a,l,n){n.base64=!1,n.binary=!1,n.dir=!1,n.createFolders=!0,n.date=null,n.compression=null,n.compressionOptions=null,n.comment=null,n.unixPermissions=null,n.dosPermissions=null},{}],6:[function(a,l,n){var i=null;i=typeof Promise<"u"?Promise:a("lie"),l.exports={Promise:i}},{lie:37}],7:[function(a,l,n){var i=typeof Uint8Array<"u"&&typeof Uint16Array<"u"&&typeof Uint32Array<"u",u=a("pako"),s=a("./utils"),r=a("./stream/GenericWorker"),h=i?"uint8array":"array";function b(y,m){r.call(this,"FlateWorker/"+y),this._pako=null,this._pakoAction=y,this._pakoOptions=m,this.meta={}}n.magic="\b\0",s.inherits(b,r),b.prototype.processChunk=function(y){this.meta=y.meta,this._pako===null&&this._createPako(),this._pako.push(s.transformTo(h,y.data),!1)},b.prototype.flush=function(){r.prototype.flush.call(this),this._pako===null&&this._createPako(),this._pako.push([],!0)},b.prototype.cleanUp=function(){r.prototype.cleanUp.call(this),this._pako=null},b.prototype._createPako=function(){this._pako=new u[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var y=this;this._pako.onData=function(m){y.push({data:m,meta:y.meta})}},n.compressWorker=function(y){return new b("Deflate",y)},n.uncompressWorker=function(){return new b("Inflate",{})}},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(a,l,n){function i(o,_){var v,x="";for(v=0;v<_;v++)x+=String.fromCharCode(255&o),o>>>=8;return x}function u(o,_,v,x,c,d){var g,S,N=o.file,M=o.compression,w=d!==h.utf8encode,j=s.transformTo("string",d(N.name)),O=s.transformTo("string",h.utf8encode(N.name)),k=N.comment,F=s.transformTo("string",d(k)),T=s.transformTo("string",h.utf8encode(k)),L=O.length!==N.name.length,p=T.length!==k.length,Z="",Y="",R="",$=N.dir,X=N.date,tt={crc32:0,compressedSize:0,uncompressedSize:0};_&&!v||(tt.crc32=o.crc32,tt.compressedSize=o.compressedSize,tt.uncompressedSize=o.uncompressedSize);var B=0;_&&(B|=8),w||!L&&!p||(B|=2048);var U=0,et=0;$&&(U|=16),c==="UNIX"?(et=798,U|=function(W,Ct){var Ft=W;return W||(Ft=Ct?16893:33204),(65535&Ft)<<16}(N.unixPermissions,$)):(et=20,U|=function(W){return 63&(W||0)}(N.dosPermissions)),g=X.getUTCHours(),g<<=6,g|=X.getUTCMinutes(),g<<=5,g|=X.getUTCSeconds()/2,S=X.getUTCFullYear()-1980,S<<=4,S|=X.getUTCMonth()+1,S<<=5,S|=X.getUTCDate(),L&&(Y=i(1,1)+i(b(j),4)+O,Z+="up"+i(Y.length,2)+Y),p&&(R=i(1,1)+i(b(F),4)+T,Z+="uc"+i(R.length,2)+R);var I="";return I+=`
\0`,I+=i(B,2),I+=M.magic,I+=i(g,2),I+=i(S,2),I+=i(tt.crc32,4),I+=i(tt.compressedSize,4),I+=i(tt.uncompressedSize,4),I+=i(j.length,2),I+=i(Z.length,2),{fileRecord:y.LOCAL_FILE_HEADER+I+j+Z,dirRecord:y.CENTRAL_FILE_HEADER+i(et,2)+I+i(F.length,2)+"\0\0\0\0"+i(U,4)+i(x,4)+j+Z+F}}var s=a("../utils"),r=a("../stream/GenericWorker"),h=a("../utf8"),b=a("../crc32"),y=a("../signature");function m(o,_,v,x){r.call(this,"ZipFileWorker"),this.bytesWritten=0,this.zipComment=_,this.zipPlatform=v,this.encodeFileName=x,this.streamFiles=o,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[]}s.inherits(m,r),m.prototype.push=function(o){var _=o.meta.percent||0,v=this.entriesCount,x=this._sources.length;this.accumulate?this.contentBuffer.push(o):(this.bytesWritten+=o.data.length,r.prototype.push.call(this,{data:o.data,meta:{currentFile:this.currentFile,percent:v?(_+100*(v-x-1))/v:100}}))},m.prototype.openedSource=function(o){this.currentSourceOffset=this.bytesWritten,this.currentFile=o.file.name;var _=this.streamFiles&&!o.file.dir;if(_){var v=u(o,_,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:v.fileRecord,meta:{percent:0}})}else this.accumulate=!0},m.prototype.closedSource=function(o){this.accumulate=!1;var _=this.streamFiles&&!o.file.dir,v=u(o,_,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(v.dirRecord),_)this.push({data:function(x){return y.DATA_DESCRIPTOR+i(x.crc32,4)+i(x.compressedSize,4)+i(x.uncompressedSize,4)}(o),meta:{percent:100}});else for(this.push({data:v.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},m.prototype.flush=function(){for(var o=this.bytesWritten,_=0;_<this.dirRecords.length;_++)this.push({data:this.dirRecords[_],meta:{percent:100}});var v=this.bytesWritten-o,x=function(c,d,g,S,N){var M=s.transformTo("string",N(S));return y.CENTRAL_DIRECTORY_END+"\0\0\0\0"+i(c,2)+i(c,2)+i(d,4)+i(g,4)+i(M.length,2)+M}(this.dirRecords.length,v,o,this.zipComment,this.encodeFileName);this.push({data:x,meta:{percent:100}})},m.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},m.prototype.registerPrevious=function(o){this._sources.push(o);var _=this;return o.on("data",function(v){_.processChunk(v)}),o.on("end",function(){_.closedSource(_.previous.streamInfo),_._sources.length?_.prepareNextSource():_.end()}),o.on("error",function(v){_.error(v)}),this},m.prototype.resume=function(){return!!r.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},m.prototype.error=function(o){var _=this._sources;if(!r.prototype.error.call(this,o))return!1;for(var v=0;v<_.length;v++)try{_[v].error(o)}catch{}return!0},m.prototype.lock=function(){r.prototype.lock.call(this);for(var o=this._sources,_=0;_<o.length;_++)o[_].lock()},l.exports=m},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(a,l,n){var i=a("../compressions"),u=a("./ZipFileWorker");n.generateWorker=function(s,r,h){var b=new u(r.streamFiles,h,r.platform,r.encodeFileName),y=0;try{s.forEach(function(m,o){y++;var _=function(d,g){var S=d||g,N=i[S];if(!N)throw new Error(S+" is not a valid compression method !");return N}(o.options.compression,r.compression),v=o.options.compressionOptions||r.compressionOptions||{},x=o.dir,c=o.date;o._compressWorker(_,v).withStreamInfo("file",{name:m,dir:x,date:c,comment:o.comment||"",unixPermissions:o.unixPermissions,dosPermissions:o.dosPermissions}).pipe(b)}),b.entriesCount=y}catch(m){b.error(m)}return b}},{"../compressions":3,"./ZipFileWorker":8}],10:[function(a,l,n){function i(){if(!(this instanceof i))return new i;if(arguments.length)throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");this.files=Object.create(null),this.comment=null,this.root="",this.clone=function(){var u=new i;for(var s in this)typeof this[s]!="function"&&(u[s]=this[s]);return u}}(i.prototype=a("./object")).loadAsync=a("./load"),i.support=a("./support"),i.defaults=a("./defaults"),i.version="3.10.1",i.loadAsync=function(u,s){return new i().loadAsync(u,s)},i.external=a("./external"),l.exports=i},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(a,l,n){var i=a("./utils"),u=a("./external"),s=a("./utf8"),r=a("./zipEntries"),h=a("./stream/Crc32Probe"),b=a("./nodejsUtils");function y(m){return new u.Promise(function(o,_){var v=m.decompressed.getContentWorker().pipe(new h);v.on("error",function(x){_(x)}).on("end",function(){v.streamInfo.crc32!==m.decompressed.crc32?_(new Error("Corrupted zip : CRC32 mismatch")):o()}).resume()})}l.exports=function(m,o){var _=this;return o=i.extend(o||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:s.utf8decode}),b.isNode&&b.isStream(m)?u.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")):i.prepareContent("the loaded zip file",m,!0,o.optimizedBinaryString,o.base64).then(function(v){var x=new r(o);return x.load(v),x}).then(function(v){var x=[u.Promise.resolve(v)],c=v.files;if(o.checkCRC32)for(var d=0;d<c.length;d++)x.push(y(c[d]));return u.Promise.all(x)}).then(function(v){for(var x=v.shift(),c=x.files,d=0;d<c.length;d++){var g=c[d],S=g.fileNameStr,N=i.resolve(g.fileNameStr);_.file(N,g.decompressed,{binary:!0,optimizedBinaryString:!0,date:g.date,dir:g.dir,comment:g.fileCommentStr.length?g.fileCommentStr:null,unixPermissions:g.unixPermissions,dosPermissions:g.dosPermissions,createFolders:o.createFolders}),g.dir||(_.file(N).unsafeOriginalName=S)}return x.zipComment.length&&(_.comment=x.zipComment),_})}},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(a,l,n){var i=a("../utils"),u=a("../stream/GenericWorker");function s(r,h){u.call(this,"Nodejs stream input adapter for "+r),this._upstreamEnded=!1,this._bindStream(h)}i.inherits(s,u),s.prototype._bindStream=function(r){var h=this;(this._stream=r).pause(),r.on("data",function(b){h.push({data:b,meta:{percent:0}})}).on("error",function(b){h.isPaused?this.generatedError=b:h.error(b)}).on("end",function(){h.isPaused?h._upstreamEnded=!0:h.end()})},s.prototype.pause=function(){return!!u.prototype.pause.call(this)&&(this._stream.pause(),!0)},s.prototype.resume=function(){return!!u.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},l.exports=s},{"../stream/GenericWorker":28,"../utils":32}],13:[function(a,l,n){var i=a("readable-stream").Readable;function u(s,r,h){i.call(this,r),this._helper=s;var b=this;s.on("data",function(y,m){b.push(y)||b._helper.pause(),h&&h(m)}).on("error",function(y){b.emit("error",y)}).on("end",function(){b.push(null)})}a("../utils").inherits(u,i),u.prototype._read=function(){this._helper.resume()},l.exports=u},{"../utils":32,"readable-stream":16}],14:[function(a,l,n){l.exports={isNode:typeof Buffer<"u",newBufferFrom:function(i,u){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(i,u);if(typeof i=="number")throw new Error('The "data" argument must not be a number');return new Buffer(i,u)},allocBuffer:function(i){if(Buffer.alloc)return Buffer.alloc(i);var u=new Buffer(i);return u.fill(0),u},isBuffer:function(i){return Buffer.isBuffer(i)},isStream:function(i){return i&&typeof i.on=="function"&&typeof i.pause=="function"&&typeof i.resume=="function"}}},{}],15:[function(a,l,n){function i(N,M,w){var j,O=s.getTypeOf(M),k=s.extend(w||{},b);k.date=k.date||new Date,k.compression!==null&&(k.compression=k.compression.toUpperCase()),typeof k.unixPermissions=="string"&&(k.unixPermissions=parseInt(k.unixPermissions,8)),k.unixPermissions&&16384&k.unixPermissions&&(k.dir=!0),k.dosPermissions&&16&k.dosPermissions&&(k.dir=!0),k.dir&&(N=c(N)),k.createFolders&&(j=x(N))&&d.call(this,j,!0);var F=O==="string"&&k.binary===!1&&k.base64===!1;w&&w.binary!==void 0||(k.binary=!F),(M instanceof y&&M.uncompressedSize===0||k.dir||!M||M.length===0)&&(k.base64=!1,k.binary=!0,M="",k.compression="STORE",O="string");var T=null;T=M instanceof y||M instanceof r?M:_.isNode&&_.isStream(M)?new v(N,M):s.prepareContent(N,M,k.binary,k.optimizedBinaryString,k.base64);var L=new m(N,T,k);this.files[N]=L}var u=a("./utf8"),s=a("./utils"),r=a("./stream/GenericWorker"),h=a("./stream/StreamHelper"),b=a("./defaults"),y=a("./compressedObject"),m=a("./zipObject"),o=a("./generate"),_=a("./nodejsUtils"),v=a("./nodejs/NodejsStreamInputAdapter"),x=function(N){N.slice(-1)==="/"&&(N=N.substring(0,N.length-1));var M=N.lastIndexOf("/");return 0<M?N.substring(0,M):""},c=function(N){return N.slice(-1)!=="/"&&(N+="/"),N},d=function(N,M){return M=M!==void 0?M:b.createFolders,N=c(N),this.files[N]||i.call(this,N,null,{dir:!0,createFolders:M}),this.files[N]};function g(N){return Object.prototype.toString.call(N)==="[object RegExp]"}var S={load:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},forEach:function(N){var M,w,j;for(M in this.files)j=this.files[M],(w=M.slice(this.root.length,M.length))&&M.slice(0,this.root.length)===this.root&&N(w,j)},filter:function(N){var M=[];return this.forEach(function(w,j){N(w,j)&&M.push(j)}),M},file:function(N,M,w){if(arguments.length!==1)return N=this.root+N,i.call(this,N,M,w),this;if(g(N)){var j=N;return this.filter(function(k,F){return!F.dir&&j.test(k)})}var O=this.files[this.root+N];return O&&!O.dir?O:null},folder:function(N){if(!N)return this;if(g(N))return this.filter(function(O,k){return k.dir&&N.test(O)});var M=this.root+N,w=d.call(this,M),j=this.clone();return j.root=w.name,j},remove:function(N){N=this.root+N;var M=this.files[N];if(M||(N.slice(-1)!=="/"&&(N+="/"),M=this.files[N]),M&&!M.dir)delete this.files[N];else for(var w=this.filter(function(O,k){return k.name.slice(0,N.length)===N}),j=0;j<w.length;j++)delete this.files[w[j].name];return this},generate:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},generateInternalStream:function(N){var M,w={};try{if((w=s.extend(N||{},{streamFiles:!1,compression:"STORE",compressionOptions:null,type:"",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:u.utf8encode})).type=w.type.toLowerCase(),w.compression=w.compression.toUpperCase(),w.type==="binarystring"&&(w.type="string"),!w.type)throw new Error("No output type specified.");s.checkSupport(w.type),w.platform!=="darwin"&&w.platform!=="freebsd"&&w.platform!=="linux"&&w.platform!=="sunos"||(w.platform="UNIX"),w.platform==="win32"&&(w.platform="DOS");var j=w.comment||this.comment||"";M=o.generateWorker(this,w,j)}catch(O){(M=new r("error")).error(O)}return new h(M,w.type||"string",w.mimeType)},generateAsync:function(N,M){return this.generateInternalStream(N).accumulate(M)},generateNodeStream:function(N,M){return(N=N||{}).type||(N.type="nodebuffer"),this.generateInternalStream(N).toNodejsStream(M)}};l.exports=S},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(a,l,n){l.exports=a("stream")},{stream:void 0}],17:[function(a,l,n){var i=a("./DataReader");function u(s){i.call(this,s);for(var r=0;r<this.data.length;r++)s[r]=255&s[r]}a("../utils").inherits(u,i),u.prototype.byteAt=function(s){return this.data[this.zero+s]},u.prototype.lastIndexOfSignature=function(s){for(var r=s.charCodeAt(0),h=s.charCodeAt(1),b=s.charCodeAt(2),y=s.charCodeAt(3),m=this.length-4;0<=m;--m)if(this.data[m]===r&&this.data[m+1]===h&&this.data[m+2]===b&&this.data[m+3]===y)return m-this.zero;return-1},u.prototype.readAndCheckSignature=function(s){var r=s.charCodeAt(0),h=s.charCodeAt(1),b=s.charCodeAt(2),y=s.charCodeAt(3),m=this.readData(4);return r===m[0]&&h===m[1]&&b===m[2]&&y===m[3]},u.prototype.readData=function(s){if(this.checkOffset(s),s===0)return[];var r=this.data.slice(this.zero+this.index,this.zero+this.index+s);return this.index+=s,r},l.exports=u},{"../utils":32,"./DataReader":18}],18:[function(a,l,n){var i=a("../utils");function u(s){this.data=s,this.length=s.length,this.index=0,this.zero=0}u.prototype={checkOffset:function(s){this.checkIndex(this.index+s)},checkIndex:function(s){if(this.length<this.zero+s||s<0)throw new Error("End of data reached (data length = "+this.length+", asked index = "+s+"). Corrupted zip ?")},setIndex:function(s){this.checkIndex(s),this.index=s},skip:function(s){this.setIndex(this.index+s)},byteAt:function(){},readInt:function(s){var r,h=0;for(this.checkOffset(s),r=this.index+s-1;r>=this.index;r--)h=(h<<8)+this.byteAt(r);return this.index+=s,h},readString:function(s){return i.transformTo("string",this.readData(s))},readData:function(){},lastIndexOfSignature:function(){},readAndCheckSignature:function(){},readDate:function(){var s=this.readInt(4);return new Date(Date.UTC(1980+(s>>25&127),(s>>21&15)-1,s>>16&31,s>>11&31,s>>5&63,(31&s)<<1))}},l.exports=u},{"../utils":32}],19:[function(a,l,n){var i=a("./Uint8ArrayReader");function u(s){i.call(this,s)}a("../utils").inherits(u,i),u.prototype.readData=function(s){this.checkOffset(s);var r=this.data.slice(this.zero+this.index,this.zero+this.index+s);return this.index+=s,r},l.exports=u},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(a,l,n){var i=a("./DataReader");function u(s){i.call(this,s)}a("../utils").inherits(u,i),u.prototype.byteAt=function(s){return this.data.charCodeAt(this.zero+s)},u.prototype.lastIndexOfSignature=function(s){return this.data.lastIndexOf(s)-this.zero},u.prototype.readAndCheckSignature=function(s){return s===this.readData(4)},u.prototype.readData=function(s){this.checkOffset(s);var r=this.data.slice(this.zero+this.index,this.zero+this.index+s);return this.index+=s,r},l.exports=u},{"../utils":32,"./DataReader":18}],21:[function(a,l,n){var i=a("./ArrayReader");function u(s){i.call(this,s)}a("../utils").inherits(u,i),u.prototype.readData=function(s){if(this.checkOffset(s),s===0)return new Uint8Array(0);var r=this.data.subarray(this.zero+this.index,this.zero+this.index+s);return this.index+=s,r},l.exports=u},{"../utils":32,"./ArrayReader":17}],22:[function(a,l,n){var i=a("../utils"),u=a("../support"),s=a("./ArrayReader"),r=a("./StringReader"),h=a("./NodeBufferReader"),b=a("./Uint8ArrayReader");l.exports=function(y){var m=i.getTypeOf(y);return i.checkSupport(m),m!=="string"||u.uint8array?m==="nodebuffer"?new h(y):u.uint8array?new b(i.transformTo("uint8array",y)):new s(i.transformTo("array",y)):new r(y)}},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(a,l,n){n.LOCAL_FILE_HEADER="PK",n.CENTRAL_FILE_HEADER="PK",n.CENTRAL_DIRECTORY_END="PK",n.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK\x07",n.ZIP64_CENTRAL_DIRECTORY_END="PK",n.DATA_DESCRIPTOR="PK\x07\b"},{}],24:[function(a,l,n){var i=a("./GenericWorker"),u=a("../utils");function s(r){i.call(this,"ConvertWorker to "+r),this.destType=r}u.inherits(s,i),s.prototype.processChunk=function(r){this.push({data:u.transformTo(this.destType,r.data),meta:r.meta})},l.exports=s},{"../utils":32,"./GenericWorker":28}],25:[function(a,l,n){var i=a("./GenericWorker"),u=a("../crc32");function s(){i.call(this,"Crc32Probe"),this.withStreamInfo("crc32",0)}a("../utils").inherits(s,i),s.prototype.processChunk=function(r){this.streamInfo.crc32=u(r.data,this.streamInfo.crc32||0),this.push(r)},l.exports=s},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(a,l,n){var i=a("../utils"),u=a("./GenericWorker");function s(r){u.call(this,"DataLengthProbe for "+r),this.propName=r,this.withStreamInfo(r,0)}i.inherits(s,u),s.prototype.processChunk=function(r){if(r){var h=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=h+r.data.length}u.prototype.processChunk.call(this,r)},l.exports=s},{"../utils":32,"./GenericWorker":28}],27:[function(a,l,n){var i=a("../utils"),u=a("./GenericWorker");function s(r){u.call(this,"DataWorker");var h=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type="",this._tickScheduled=!1,r.then(function(b){h.dataIsReady=!0,h.data=b,h.max=b&&b.length||0,h.type=i.getTypeOf(b),h.isPaused||h._tickAndRepeat()},function(b){h.error(b)})}i.inherits(s,u),s.prototype.cleanUp=function(){u.prototype.cleanUp.call(this),this.data=null},s.prototype.resume=function(){return!!u.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,i.delay(this._tickAndRepeat,[],this)),!0)},s.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(i.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0))},s.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var r=null,h=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":r=this.data.substring(this.index,h);break;case"uint8array":r=this.data.subarray(this.index,h);break;case"array":case"nodebuffer":r=this.data.slice(this.index,h)}return this.index=h,this.push({data:r,meta:{percent:this.max?this.index/this.max*100:0}})},l.exports=s},{"../utils":32,"./GenericWorker":28}],28:[function(a,l,n){function i(u){this.name=u||"default",this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null}i.prototype={push:function(u){this.emit("data",u)},end:function(){if(this.isFinished)return!1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0}catch(u){this.emit("error",u)}return!0},error:function(u){return!this.isFinished&&(this.isPaused?this.generatedError=u:(this.isFinished=!0,this.emit("error",u),this.previous&&this.previous.error(u),this.cleanUp()),!0)},on:function(u,s){return this._listeners[u].push(s),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[]},emit:function(u,s){if(this._listeners[u])for(var r=0;r<this._listeners[u].length;r++)this._listeners[u][r].call(this,s)},pipe:function(u){return u.registerPrevious(this)},registerPrevious:function(u){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.streamInfo=u.streamInfo,this.mergeStreamInfo(),this.previous=u;var s=this;return u.on("data",function(r){s.processChunk(r)}),u.on("end",function(){s.end()}),u.on("error",function(r){s.error(r)}),this},pause:function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return!1;var u=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),u=!0),this.previous&&this.previous.resume(),!u},flush:function(){},processChunk:function(u){this.push(u)},withStreamInfo:function(u,s){return this.extraStreamInfo[u]=s,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var u in this.extraStreamInfo)Object.prototype.hasOwnProperty.call(this.extraStreamInfo,u)&&(this.streamInfo[u]=this.extraStreamInfo[u])},lock:function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock()},toString:function(){var u="Worker "+this.name;return this.previous?this.previous+" -> "+u:u}},l.exports=i},{}],29:[function(a,l,n){var i=a("../utils"),u=a("./ConvertWorker"),s=a("./GenericWorker"),r=a("../base64"),h=a("../support"),b=a("../external"),y=null;if(h.nodestream)try{y=a("../nodejs/NodejsStreamOutputAdapter")}catch{}function m(_,v){return new b.Promise(function(x,c){var d=[],g=_._internalType,S=_._outputType,N=_._mimeType;_.on("data",function(M,w){d.push(M),v&&v(w)}).on("error",function(M){d=[],c(M)}).on("end",function(){try{var M=function(w,j,O){switch(w){case"blob":return i.newBlob(i.transformTo("arraybuffer",j),O);case"base64":return r.encode(j);default:return i.transformTo(w,j)}}(S,function(w,j){var O,k=0,F=null,T=0;for(O=0;O<j.length;O++)T+=j[O].length;switch(w){case"string":return j.join("");case"array":return Array.prototype.concat.apply([],j);case"uint8array":for(F=new Uint8Array(T),O=0;O<j.length;O++)F.set(j[O],k),k+=j[O].length;return F;case"nodebuffer":return Buffer.concat(j);default:throw new Error("concat : unsupported type '"+w+"'")}}(g,d),N);x(M)}catch(w){c(w)}d=[]}).resume()})}function o(_,v,x){var c=v;switch(v){case"blob":case"arraybuffer":c="uint8array";break;case"base64":c="string"}try{this._internalType=c,this._outputType=v,this._mimeType=x,i.checkSupport(c),this._worker=_.pipe(new u(c)),_.lock()}catch(d){this._worker=new s("error"),this._worker.error(d)}}o.prototype={accumulate:function(_){return m(this,_)},on:function(_,v){var x=this;return _==="data"?this._worker.on(_,function(c){v.call(x,c.data,c.meta)}):this._worker.on(_,function(){i.delay(v,arguments,x)}),this},resume:function(){return i.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(_){if(i.checkSupport("nodestream"),this._outputType!=="nodebuffer")throw new Error(this._outputType+" is not supported by this method");return new y(this,{objectMode:this._outputType!=="nodebuffer"},_)}},l.exports=o},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(a,l,n){if(n.base64=!0,n.array=!0,n.string=!0,n.arraybuffer=typeof ArrayBuffer<"u"&&typeof Uint8Array<"u",n.nodebuffer=typeof Buffer<"u",n.uint8array=typeof Uint8Array<"u",typeof ArrayBuffer>"u")n.blob=!1;else{var i=new ArrayBuffer(0);try{n.blob=new Blob([i],{type:"application/zip"}).size===0}catch{try{var u=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);u.append(i),n.blob=u.getBlob("application/zip").size===0}catch{n.blob=!1}}}try{n.nodestream=!!a("readable-stream").Readable}catch{n.nodestream=!1}},{"readable-stream":16}],31:[function(a,l,n){for(var i=a("./utils"),u=a("./support"),s=a("./nodejsUtils"),r=a("./stream/GenericWorker"),h=new Array(256),b=0;b<256;b++)h[b]=252<=b?6:248<=b?5:240<=b?4:224<=b?3:192<=b?2:1;h[254]=h[254]=1;function y(){r.call(this,"utf-8 decode"),this.leftOver=null}function m(){r.call(this,"utf-8 encode")}n.utf8encode=function(o){return u.nodebuffer?s.newBufferFrom(o,"utf-8"):function(_){var v,x,c,d,g,S=_.length,N=0;for(d=0;d<S;d++)(64512&(x=_.charCodeAt(d)))==55296&&d+1<S&&(64512&(c=_.charCodeAt(d+1)))==56320&&(x=65536+(x-55296<<10)+(c-56320),d++),N+=x<128?1:x<2048?2:x<65536?3:4;for(v=u.uint8array?new Uint8Array(N):new Array(N),d=g=0;g<N;d++)(64512&(x=_.charCodeAt(d)))==55296&&d+1<S&&(64512&(c=_.charCodeAt(d+1)))==56320&&(x=65536+(x-55296<<10)+(c-56320),d++),x<128?v[g++]=x:(x<2048?v[g++]=192|x>>>6:(x<65536?v[g++]=224|x>>>12:(v[g++]=240|x>>>18,v[g++]=128|x>>>12&63),v[g++]=128|x>>>6&63),v[g++]=128|63&x);return v}(o)},n.utf8decode=function(o){return u.nodebuffer?i.transformTo("nodebuffer",o).toString("utf-8"):function(_){var v,x,c,d,g=_.length,S=new Array(2*g);for(v=x=0;v<g;)if((c=_[v++])<128)S[x++]=c;else if(4<(d=h[c]))S[x++]=65533,v+=d-1;else{for(c&=d===2?31:d===3?15:7;1<d&&v<g;)c=c<<6|63&_[v++],d--;1<d?S[x++]=65533:c<65536?S[x++]=c:(c-=65536,S[x++]=55296|c>>10&1023,S[x++]=56320|1023&c)}return S.length!==x&&(S.subarray?S=S.subarray(0,x):S.length=x),i.applyFromCharCode(S)}(o=i.transformTo(u.uint8array?"uint8array":"array",o))},i.inherits(y,r),y.prototype.processChunk=function(o){var _=i.transformTo(u.uint8array?"uint8array":"array",o.data);if(this.leftOver&&this.leftOver.length){if(u.uint8array){var v=_;(_=new Uint8Array(v.length+this.leftOver.length)).set(this.leftOver,0),_.set(v,this.leftOver.length)}else _=this.leftOver.concat(_);this.leftOver=null}var x=function(d,g){var S;for((g=g||d.length)>d.length&&(g=d.length),S=g-1;0<=S&&(192&d[S])==128;)S--;return S<0||S===0?g:S+h[d[S]]>g?S:g}(_),c=_;x!==_.length&&(u.uint8array?(c=_.subarray(0,x),this.leftOver=_.subarray(x,_.length)):(c=_.slice(0,x),this.leftOver=_.slice(x,_.length))),this.push({data:n.utf8decode(c),meta:o.meta})},y.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:n.utf8decode(this.leftOver),meta:{}}),this.leftOver=null)},n.Utf8DecodeWorker=y,i.inherits(m,r),m.prototype.processChunk=function(o){this.push({data:n.utf8encode(o.data),meta:o.meta})},n.Utf8EncodeWorker=m},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(a,l,n){var i=a("./support"),u=a("./base64"),s=a("./nodejsUtils"),r=a("./external");function h(v){return v}function b(v,x){for(var c=0;c<v.length;++c)x[c]=255&v.charCodeAt(c);return x}a("setimmediate"),n.newBlob=function(v,x){n.checkSupport("blob");try{return new Blob([v],{type:x})}catch{try{var c=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return c.append(v),c.getBlob(x)}catch{throw new Error("Bug : can't construct the Blob.")}}};var y={stringifyByChunk:function(v,x,c){var d=[],g=0,S=v.length;if(S<=c)return String.fromCharCode.apply(null,v);for(;g<S;)x==="array"||x==="nodebuffer"?d.push(String.fromCharCode.apply(null,v.slice(g,Math.min(g+c,S)))):d.push(String.fromCharCode.apply(null,v.subarray(g,Math.min(g+c,S)))),g+=c;return d.join("")},stringifyByChar:function(v){for(var x="",c=0;c<v.length;c++)x+=String.fromCharCode(v[c]);return x},applyCanBeUsed:{uint8array:function(){try{return i.uint8array&&String.fromCharCode.apply(null,new Uint8Array(1)).length===1}catch{return!1}}(),nodebuffer:function(){try{return i.nodebuffer&&String.fromCharCode.apply(null,s.allocBuffer(1)).length===1}catch{return!1}}()}};function m(v){var x=65536,c=n.getTypeOf(v),d=!0;if(c==="uint8array"?d=y.applyCanBeUsed.uint8array:c==="nodebuffer"&&(d=y.applyCanBeUsed.nodebuffer),d)for(;1<x;)try{return y.stringifyByChunk(v,c,x)}catch{x=Math.floor(x/2)}return y.stringifyByChar(v)}function o(v,x){for(var c=0;c<v.length;c++)x[c]=v[c];return x}n.applyFromCharCode=m;var _={};_.string={string:h,array:function(v){return b(v,new Array(v.length))},arraybuffer:function(v){return _.string.uint8array(v).buffer},uint8array:function(v){return b(v,new Uint8Array(v.length))},nodebuffer:function(v){return b(v,s.allocBuffer(v.length))}},_.array={string:m,array:h,arraybuffer:function(v){return new Uint8Array(v).buffer},uint8array:function(v){return new Uint8Array(v)},nodebuffer:function(v){return s.newBufferFrom(v)}},_.arraybuffer={string:function(v){return m(new Uint8Array(v))},array:function(v){return o(new Uint8Array(v),new Array(v.byteLength))},arraybuffer:h,uint8array:function(v){return new Uint8Array(v)},nodebuffer:function(v){return s.newBufferFrom(new Uint8Array(v))}},_.uint8array={string:m,array:function(v){return o(v,new Array(v.length))},arraybuffer:function(v){return v.buffer},uint8array:h,nodebuffer:function(v){return s.newBufferFrom(v)}},_.nodebuffer={string:m,array:function(v){return o(v,new Array(v.length))},arraybuffer:function(v){return _.nodebuffer.uint8array(v).buffer},uint8array:function(v){return o(v,new Uint8Array(v.length))},nodebuffer:h},n.transformTo=function(v,x){if(x=x||"",!v)return x;n.checkSupport(v);var c=n.getTypeOf(x);return _[c][v](x)},n.resolve=function(v){for(var x=v.split("/"),c=[],d=0;d<x.length;d++){var g=x[d];g==="."||g===""&&d!==0&&d!==x.length-1||(g===".."?c.pop():c.push(g))}return c.join("/")},n.getTypeOf=function(v){return typeof v=="string"?"string":Object.prototype.toString.call(v)==="[object Array]"?"array":i.nodebuffer&&s.isBuffer(v)?"nodebuffer":i.uint8array&&v instanceof Uint8Array?"uint8array":i.arraybuffer&&v instanceof ArrayBuffer?"arraybuffer":void 0},n.checkSupport=function(v){if(!i[v.toLowerCase()])throw new Error(v+" is not supported by this platform")},n.MAX_VALUE_16BITS=65535,n.MAX_VALUE_32BITS=-1,n.pretty=function(v){var x,c,d="";for(c=0;c<(v||"").length;c++)d+="\\x"+((x=v.charCodeAt(c))<16?"0":"")+x.toString(16).toUpperCase();return d},n.delay=function(v,x,c){setImmediate(function(){v.apply(c||null,x||[])})},n.inherits=function(v,x){function c(){}c.prototype=x.prototype,v.prototype=new c},n.extend=function(){var v,x,c={};for(v=0;v<arguments.length;v++)for(x in arguments[v])Object.prototype.hasOwnProperty.call(arguments[v],x)&&c[x]===void 0&&(c[x]=arguments[v][x]);return c},n.prepareContent=function(v,x,c,d,g){return r.Promise.resolve(x).then(function(S){return i.blob&&(S instanceof Blob||["[object File]","[object Blob]"].indexOf(Object.prototype.toString.call(S))!==-1)&&typeof FileReader<"u"?new r.Promise(function(N,M){var w=new FileReader;w.onload=function(j){N(j.target.result)},w.onerror=function(j){M(j.target.error)},w.readAsArrayBuffer(S)}):S}).then(function(S){var N=n.getTypeOf(S);return N?(N==="arraybuffer"?S=n.transformTo("uint8array",S):N==="string"&&(g?S=u.decode(S):c&&d!==!0&&(S=function(M){return b(M,i.uint8array?new Uint8Array(M.length):new Array(M.length))}(S))),S):r.Promise.reject(new Error("Can't read the data of '"+v+"'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"))})}},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,setimmediate:54}],33:[function(a,l,n){var i=a("./reader/readerFor"),u=a("./utils"),s=a("./signature"),r=a("./zipEntry"),h=a("./support");function b(y){this.files=[],this.loadOptions=y}b.prototype={checkSignature:function(y){if(!this.reader.readAndCheckSignature(y)){this.reader.index-=4;var m=this.reader.readString(4);throw new Error("Corrupted zip or bug: unexpected signature ("+u.pretty(m)+", expected "+u.pretty(y)+")")}},isSignature:function(y,m){var o=this.reader.index;this.reader.setIndex(y);var _=this.reader.readString(4)===m;return this.reader.setIndex(o),_},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var y=this.reader.readData(this.zipCommentLength),m=h.uint8array?"uint8array":"array",o=u.transformTo(m,y);this.zipComment=this.loadOptions.decodeFileName(o)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var y,m,o,_=this.zip64EndOfCentralSize-44;0<_;)y=this.reader.readInt(2),m=this.reader.readInt(4),o=this.reader.readData(m),this.zip64ExtensibleData[y]={id:y,length:m,value:o}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var y,m;for(y=0;y<this.files.length;y++)m=this.files[y],this.reader.setIndex(m.localHeaderOffset),this.checkSignature(s.LOCAL_FILE_HEADER),m.readLocalPart(this.reader),m.handleUTF8(),m.processAttributes()},readCentralDir:function(){var y;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER);)(y=new r({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(y);if(this.centralDirRecords!==this.files.length&&this.centralDirRecords!==0&&this.files.length===0)throw new Error("Corrupted zip or bug: expected "+this.centralDirRecords+" records in central dir, got "+this.files.length)},readEndOfCentral:function(){var y=this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);if(y<0)throw this.isSignature(0,s.LOCAL_FILE_HEADER)?new Error("Corrupted zip: can't find end of central directory"):new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");this.reader.setIndex(y);var m=y;if(this.checkSignature(s.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===u.MAX_VALUE_16BITS||this.diskWithCentralDirStart===u.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===u.MAX_VALUE_16BITS||this.centralDirRecords===u.MAX_VALUE_16BITS||this.centralDirSize===u.MAX_VALUE_32BITS||this.centralDirOffset===u.MAX_VALUE_32BITS){if(this.zip64=!0,(y=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");if(this.reader.setIndex(y),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,s.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}var o=this.centralDirOffset+this.centralDirSize;this.zip64&&(o+=20,o+=12+this.zip64EndOfCentralSize);var _=m-o;if(0<_)this.isSignature(m,s.CENTRAL_FILE_HEADER)||(this.reader.zero=_);else if(_<0)throw new Error("Corrupted zip: missing "+Math.abs(_)+" bytes.")},prepareReader:function(y){this.reader=i(y)},load:function(y){this.prepareReader(y),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},l.exports=b},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utils":32,"./zipEntry":34}],34:[function(a,l,n){var i=a("./reader/readerFor"),u=a("./utils"),s=a("./compressedObject"),r=a("./crc32"),h=a("./utf8"),b=a("./compressions"),y=a("./support");function m(o,_){this.options=o,this.loadOptions=_}m.prototype={isEncrypted:function(){return(1&this.bitFlag)==1},useUTF8:function(){return(2048&this.bitFlag)==2048},readLocalPart:function(o){var _,v;if(o.skip(22),this.fileNameLength=o.readInt(2),v=o.readInt(2),this.fileName=o.readData(this.fileNameLength),o.skip(v),this.compressedSize===-1||this.uncompressedSize===-1)throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");if((_=function(x){for(var c in b)if(Object.prototype.hasOwnProperty.call(b,c)&&b[c].magic===x)return b[c];return null}(this.compressionMethod))===null)throw new Error("Corrupted zip : compression "+u.pretty(this.compressionMethod)+" unknown (inner file : "+u.transformTo("string",this.fileName)+")");this.decompressed=new s(this.compressedSize,this.uncompressedSize,this.crc32,_,o.readData(this.compressedSize))},readCentralPart:function(o){this.versionMadeBy=o.readInt(2),o.skip(2),this.bitFlag=o.readInt(2),this.compressionMethod=o.readString(2),this.date=o.readDate(),this.crc32=o.readInt(4),this.compressedSize=o.readInt(4),this.uncompressedSize=o.readInt(4);var _=o.readInt(2);if(this.extraFieldsLength=o.readInt(2),this.fileCommentLength=o.readInt(2),this.diskNumberStart=o.readInt(2),this.internalFileAttributes=o.readInt(2),this.externalFileAttributes=o.readInt(4),this.localHeaderOffset=o.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");o.skip(_),this.readExtraFields(o),this.parseZIP64ExtraField(o),this.fileComment=o.readData(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var o=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),o==0&&(this.dosPermissions=63&this.externalFileAttributes),o==3&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||this.fileNameStr.slice(-1)!=="/"||(this.dir=!0)},parseZIP64ExtraField:function(){if(this.extraFields[1]){var o=i(this.extraFields[1].value);this.uncompressedSize===u.MAX_VALUE_32BITS&&(this.uncompressedSize=o.readInt(8)),this.compressedSize===u.MAX_VALUE_32BITS&&(this.compressedSize=o.readInt(8)),this.localHeaderOffset===u.MAX_VALUE_32BITS&&(this.localHeaderOffset=o.readInt(8)),this.diskNumberStart===u.MAX_VALUE_32BITS&&(this.diskNumberStart=o.readInt(4))}},readExtraFields:function(o){var _,v,x,c=o.index+this.extraFieldsLength;for(this.extraFields||(this.extraFields={});o.index+4<c;)_=o.readInt(2),v=o.readInt(2),x=o.readData(v),this.extraFields[_]={id:_,length:v,value:x};o.setIndex(c)},handleUTF8:function(){var o=y.uint8array?"uint8array":"array";if(this.useUTF8())this.fileNameStr=h.utf8decode(this.fileName),this.fileCommentStr=h.utf8decode(this.fileComment);else{var _=this.findExtraFieldUnicodePath();if(_!==null)this.fileNameStr=_;else{var v=u.transformTo(o,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(v)}var x=this.findExtraFieldUnicodeComment();if(x!==null)this.fileCommentStr=x;else{var c=u.transformTo(o,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(c)}}},findExtraFieldUnicodePath:function(){var o=this.extraFields[28789];if(o){var _=i(o.value);return _.readInt(1)!==1||r(this.fileName)!==_.readInt(4)?null:h.utf8decode(_.readData(o.length-5))}return null},findExtraFieldUnicodeComment:function(){var o=this.extraFields[25461];if(o){var _=i(o.value);return _.readInt(1)!==1||r(this.fileComment)!==_.readInt(4)?null:h.utf8decode(_.readData(o.length-5))}return null}},l.exports=m},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(a,l,n){function i(_,v,x){this.name=_,this.dir=x.dir,this.date=x.date,this.comment=x.comment,this.unixPermissions=x.unixPermissions,this.dosPermissions=x.dosPermissions,this._data=v,this._dataBinary=x.binary,this.options={compression:x.compression,compressionOptions:x.compressionOptions}}var u=a("./stream/StreamHelper"),s=a("./stream/DataWorker"),r=a("./utf8"),h=a("./compressedObject"),b=a("./stream/GenericWorker");i.prototype={internalStream:function(_){var v=null,x="string";try{if(!_)throw new Error("No output type specified.");var c=(x=_.toLowerCase())==="string"||x==="text";x!=="binarystring"&&x!=="text"||(x="string"),v=this._decompressWorker();var d=!this._dataBinary;d&&!c&&(v=v.pipe(new r.Utf8EncodeWorker)),!d&&c&&(v=v.pipe(new r.Utf8DecodeWorker))}catch(g){(v=new b("error")).error(g)}return new u(v,x,"")},async:function(_,v){return this.internalStream(_).accumulate(v)},nodeStream:function(_,v){return this.internalStream(_||"nodebuffer").toNodejsStream(v)},_compressWorker:function(_,v){if(this._data instanceof h&&this._data.compression.magic===_.magic)return this._data.getCompressedWorker();var x=this._decompressWorker();return this._dataBinary||(x=x.pipe(new r.Utf8EncodeWorker)),h.createWorkerFrom(x,_,v)},_decompressWorker:function(){return this._data instanceof h?this._data.getContentWorker():this._data instanceof b?this._data:new s(this._data)}};for(var y=["asText","asBinary","asNodeBuffer","asUint8Array","asArrayBuffer"],m=function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},o=0;o<y.length;o++)i.prototype[y[o]]=m;l.exports=i},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(a,l,n){(function(i){var u,s,r=i.MutationObserver||i.WebKitMutationObserver;if(r){var h=0,b=new r(_),y=i.document.createTextNode("");b.observe(y,{characterData:!0}),u=function(){y.data=h=++h%2}}else if(i.setImmediate||i.MessageChannel===void 0)u="document"in i&&"onreadystatechange"in i.document.createElement("script")?function(){var v=i.document.createElement("script");v.onreadystatechange=function(){_(),v.onreadystatechange=null,v.parentNode.removeChild(v),v=null},i.document.documentElement.appendChild(v)}:function(){setTimeout(_,0)};else{var m=new i.MessageChannel;m.port1.onmessage=_,u=function(){m.port2.postMessage(0)}}var o=[];function _(){var v,x;s=!0;for(var c=o.length;c;){for(x=o,o=[],v=-1;++v<c;)x[v]();c=o.length}s=!1}l.exports=function(v){o.push(v)!==1||s||u()}}).call(this,typeof Vn<"u"?Vn:typeof self<"u"?self:typeof window<"u"?window:{})},{}],37:[function(a,l,n){var i=a("immediate");function u(){}var s={},r=["REJECTED"],h=["FULFILLED"],b=["PENDING"];function y(c){if(typeof c!="function")throw new TypeError("resolver must be a function");this.state=b,this.queue=[],this.outcome=void 0,c!==u&&v(this,c)}function m(c,d,g){this.promise=c,typeof d=="function"&&(this.onFulfilled=d,this.callFulfilled=this.otherCallFulfilled),typeof g=="function"&&(this.onRejected=g,this.callRejected=this.otherCallRejected)}function o(c,d,g){i(function(){var S;try{S=d(g)}catch(N){return s.reject(c,N)}S===c?s.reject(c,new TypeError("Cannot resolve promise with itself")):s.resolve(c,S)})}function _(c){var d=c&&c.then;if(c&&(typeof c=="object"||typeof c=="function")&&typeof d=="function")return function(){d.apply(c,arguments)}}function v(c,d){var g=!1;function S(w){g||(g=!0,s.reject(c,w))}function N(w){g||(g=!0,s.resolve(c,w))}var M=x(function(){d(N,S)});M.status==="error"&&S(M.value)}function x(c,d){var g={};try{g.value=c(d),g.status="success"}catch(S){g.status="error",g.value=S}return g}(l.exports=y).prototype.finally=function(c){if(typeof c!="function")return this;var d=this.constructor;return this.then(function(g){return d.resolve(c()).then(function(){return g})},function(g){return d.resolve(c()).then(function(){throw g})})},y.prototype.catch=function(c){return this.then(null,c)},y.prototype.then=function(c,d){if(typeof c!="function"&&this.state===h||typeof d!="function"&&this.state===r)return this;var g=new this.constructor(u);return this.state!==b?o(g,this.state===h?c:d,this.outcome):this.queue.push(new m(g,c,d)),g},m.prototype.callFulfilled=function(c){s.resolve(this.promise,c)},m.prototype.otherCallFulfilled=function(c){o(this.promise,this.onFulfilled,c)},m.prototype.callRejected=function(c){s.reject(this.promise,c)},m.prototype.otherCallRejected=function(c){o(this.promise,this.onRejected,c)},s.resolve=function(c,d){var g=x(_,d);if(g.status==="error")return s.reject(c,g.value);var S=g.value;if(S)v(c,S);else{c.state=h,c.outcome=d;for(var N=-1,M=c.queue.length;++N<M;)c.queue[N].callFulfilled(d)}return c},s.reject=function(c,d){c.state=r,c.outcome=d;for(var g=-1,S=c.queue.length;++g<S;)c.queue[g].callRejected(d);return c},y.resolve=function(c){return c instanceof this?c:s.resolve(new this(u),c)},y.reject=function(c){var d=new this(u);return s.reject(d,c)},y.all=function(c){var d=this;if(Object.prototype.toString.call(c)!=="[object Array]")return this.reject(new TypeError("must be an array"));var g=c.length,S=!1;if(!g)return this.resolve([]);for(var N=new Array(g),M=0,w=-1,j=new this(u);++w<g;)O(c[w],w);return j;function O(k,F){d.resolve(k).then(function(T){N[F]=T,++M!==g||S||(S=!0,s.resolve(j,N))},function(T){S||(S=!0,s.reject(j,T))})}},y.race=function(c){var d=this;if(Object.prototype.toString.call(c)!=="[object Array]")return this.reject(new TypeError("must be an array"));var g=c.length,S=!1;if(!g)return this.resolve([]);for(var N=-1,M=new this(u);++N<g;)w=c[N],d.resolve(w).then(function(j){S||(S=!0,s.resolve(M,j))},function(j){S||(S=!0,s.reject(M,j))});var w;return M}},{immediate:36}],38:[function(a,l,n){var i={};(0,a("./lib/utils/common").assign)(i,a("./lib/deflate"),a("./lib/inflate"),a("./lib/zlib/constants")),l.exports=i},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(a,l,n){var i=a("./zlib/deflate"),u=a("./utils/common"),s=a("./utils/strings"),r=a("./zlib/messages"),h=a("./zlib/zstream"),b=Object.prototype.toString,y=0,m=-1,o=0,_=8;function v(c){if(!(this instanceof v))return new v(c);this.options=u.assign({level:m,method:_,chunkSize:16384,windowBits:15,memLevel:8,strategy:o,to:""},c||{});var d=this.options;d.raw&&0<d.windowBits?d.windowBits=-d.windowBits:d.gzip&&0<d.windowBits&&d.windowBits<16&&(d.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new h,this.strm.avail_out=0;var g=i.deflateInit2(this.strm,d.level,d.method,d.windowBits,d.memLevel,d.strategy);if(g!==y)throw new Error(r[g]);if(d.header&&i.deflateSetHeader(this.strm,d.header),d.dictionary){var S;if(S=typeof d.dictionary=="string"?s.string2buf(d.dictionary):b.call(d.dictionary)==="[object ArrayBuffer]"?new Uint8Array(d.dictionary):d.dictionary,(g=i.deflateSetDictionary(this.strm,S))!==y)throw new Error(r[g]);this._dict_set=!0}}function x(c,d){var g=new v(d);if(g.push(c,!0),g.err)throw g.msg||r[g.err];return g.result}v.prototype.push=function(c,d){var g,S,N=this.strm,M=this.options.chunkSize;if(this.ended)return!1;S=d===~~d?d:d===!0?4:0,typeof c=="string"?N.input=s.string2buf(c):b.call(c)==="[object ArrayBuffer]"?N.input=new Uint8Array(c):N.input=c,N.next_in=0,N.avail_in=N.input.length;do{if(N.avail_out===0&&(N.output=new u.Buf8(M),N.next_out=0,N.avail_out=M),(g=i.deflate(N,S))!==1&&g!==y)return this.onEnd(g),!(this.ended=!0);N.avail_out!==0&&(N.avail_in!==0||S!==4&&S!==2)||(this.options.to==="string"?this.onData(s.buf2binstring(u.shrinkBuf(N.output,N.next_out))):this.onData(u.shrinkBuf(N.output,N.next_out)))}while((0<N.avail_in||N.avail_out===0)&&g!==1);return S===4?(g=i.deflateEnd(this.strm),this.onEnd(g),this.ended=!0,g===y):S!==2||(this.onEnd(y),!(N.avail_out=0))},v.prototype.onData=function(c){this.chunks.push(c)},v.prototype.onEnd=function(c){c===y&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=u.flattenChunks(this.chunks)),this.chunks=[],this.err=c,this.msg=this.strm.msg},n.Deflate=v,n.deflate=x,n.deflateRaw=function(c,d){return(d=d||{}).raw=!0,x(c,d)},n.gzip=function(c,d){return(d=d||{}).gzip=!0,x(c,d)}},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(a,l,n){var i=a("./zlib/inflate"),u=a("./utils/common"),s=a("./utils/strings"),r=a("./zlib/constants"),h=a("./zlib/messages"),b=a("./zlib/zstream"),y=a("./zlib/gzheader"),m=Object.prototype.toString;function o(v){if(!(this instanceof o))return new o(v);this.options=u.assign({chunkSize:16384,windowBits:0,to:""},v||{});var x=this.options;x.raw&&0<=x.windowBits&&x.windowBits<16&&(x.windowBits=-x.windowBits,x.windowBits===0&&(x.windowBits=-15)),!(0<=x.windowBits&&x.windowBits<16)||v&&v.windowBits||(x.windowBits+=32),15<x.windowBits&&x.windowBits<48&&!(15&x.windowBits)&&(x.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new b,this.strm.avail_out=0;var c=i.inflateInit2(this.strm,x.windowBits);if(c!==r.Z_OK)throw new Error(h[c]);this.header=new y,i.inflateGetHeader(this.strm,this.header)}function _(v,x){var c=new o(x);if(c.push(v,!0),c.err)throw c.msg||h[c.err];return c.result}o.prototype.push=function(v,x){var c,d,g,S,N,M,w=this.strm,j=this.options.chunkSize,O=this.options.dictionary,k=!1;if(this.ended)return!1;d=x===~~x?x:x===!0?r.Z_FINISH:r.Z_NO_FLUSH,typeof v=="string"?w.input=s.binstring2buf(v):m.call(v)==="[object ArrayBuffer]"?w.input=new Uint8Array(v):w.input=v,w.next_in=0,w.avail_in=w.input.length;do{if(w.avail_out===0&&(w.output=new u.Buf8(j),w.next_out=0,w.avail_out=j),(c=i.inflate(w,r.Z_NO_FLUSH))===r.Z_NEED_DICT&&O&&(M=typeof O=="string"?s.string2buf(O):m.call(O)==="[object ArrayBuffer]"?new Uint8Array(O):O,c=i.inflateSetDictionary(this.strm,M)),c===r.Z_BUF_ERROR&&k===!0&&(c=r.Z_OK,k=!1),c!==r.Z_STREAM_END&&c!==r.Z_OK)return this.onEnd(c),!(this.ended=!0);w.next_out&&(w.avail_out!==0&&c!==r.Z_STREAM_END&&(w.avail_in!==0||d!==r.Z_FINISH&&d!==r.Z_SYNC_FLUSH)||(this.options.to==="string"?(g=s.utf8border(w.output,w.next_out),S=w.next_out-g,N=s.buf2string(w.output,g),w.next_out=S,w.avail_out=j-S,S&&u.arraySet(w.output,w.output,g,S,0),this.onData(N)):this.onData(u.shrinkBuf(w.output,w.next_out)))),w.avail_in===0&&w.avail_out===0&&(k=!0)}while((0<w.avail_in||w.avail_out===0)&&c!==r.Z_STREAM_END);return c===r.Z_STREAM_END&&(d=r.Z_FINISH),d===r.Z_FINISH?(c=i.inflateEnd(this.strm),this.onEnd(c),this.ended=!0,c===r.Z_OK):d!==r.Z_SYNC_FLUSH||(this.onEnd(r.Z_OK),!(w.avail_out=0))},o.prototype.onData=function(v){this.chunks.push(v)},o.prototype.onEnd=function(v){v===r.Z_OK&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=u.flattenChunks(this.chunks)),this.chunks=[],this.err=v,this.msg=this.strm.msg},n.Inflate=o,n.inflate=_,n.inflateRaw=function(v,x){return(x=x||{}).raw=!0,_(v,x)},n.ungzip=_},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(a,l,n){var i=typeof Uint8Array<"u"&&typeof Uint16Array<"u"&&typeof Int32Array<"u";n.assign=function(r){for(var h=Array.prototype.slice.call(arguments,1);h.length;){var b=h.shift();if(b){if(typeof b!="object")throw new TypeError(b+"must be non-object");for(var y in b)b.hasOwnProperty(y)&&(r[y]=b[y])}}return r},n.shrinkBuf=function(r,h){return r.length===h?r:r.subarray?r.subarray(0,h):(r.length=h,r)};var u={arraySet:function(r,h,b,y,m){if(h.subarray&&r.subarray)r.set(h.subarray(b,b+y),m);else for(var o=0;o<y;o++)r[m+o]=h[b+o]},flattenChunks:function(r){var h,b,y,m,o,_;for(h=y=0,b=r.length;h<b;h++)y+=r[h].length;for(_=new Uint8Array(y),h=m=0,b=r.length;h<b;h++)o=r[h],_.set(o,m),m+=o.length;return _}},s={arraySet:function(r,h,b,y,m){for(var o=0;o<y;o++)r[m+o]=h[b+o]},flattenChunks:function(r){return[].concat.apply([],r)}};n.setTyped=function(r){r?(n.Buf8=Uint8Array,n.Buf16=Uint16Array,n.Buf32=Int32Array,n.assign(n,u)):(n.Buf8=Array,n.Buf16=Array,n.Buf32=Array,n.assign(n,s))},n.setTyped(i)},{}],42:[function(a,l,n){var i=a("./common"),u=!0,s=!0;try{String.fromCharCode.apply(null,[0])}catch{u=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch{s=!1}for(var r=new i.Buf8(256),h=0;h<256;h++)r[h]=252<=h?6:248<=h?5:240<=h?4:224<=h?3:192<=h?2:1;function b(y,m){if(m<65537&&(y.subarray&&s||!y.subarray&&u))return String.fromCharCode.apply(null,i.shrinkBuf(y,m));for(var o="",_=0;_<m;_++)o+=String.fromCharCode(y[_]);return o}r[254]=r[254]=1,n.string2buf=function(y){var m,o,_,v,x,c=y.length,d=0;for(v=0;v<c;v++)(64512&(o=y.charCodeAt(v)))==55296&&v+1<c&&(64512&(_=y.charCodeAt(v+1)))==56320&&(o=65536+(o-55296<<10)+(_-56320),v++),d+=o<128?1:o<2048?2:o<65536?3:4;for(m=new i.Buf8(d),v=x=0;x<d;v++)(64512&(o=y.charCodeAt(v)))==55296&&v+1<c&&(64512&(_=y.charCodeAt(v+1)))==56320&&(o=65536+(o-55296<<10)+(_-56320),v++),o<128?m[x++]=o:(o<2048?m[x++]=192|o>>>6:(o<65536?m[x++]=224|o>>>12:(m[x++]=240|o>>>18,m[x++]=128|o>>>12&63),m[x++]=128|o>>>6&63),m[x++]=128|63&o);return m},n.buf2binstring=function(y){return b(y,y.length)},n.binstring2buf=function(y){for(var m=new i.Buf8(y.length),o=0,_=m.length;o<_;o++)m[o]=y.charCodeAt(o);return m},n.buf2string=function(y,m){var o,_,v,x,c=m||y.length,d=new Array(2*c);for(o=_=0;o<c;)if((v=y[o++])<128)d[_++]=v;else if(4<(x=r[v]))d[_++]=65533,o+=x-1;else{for(v&=x===2?31:x===3?15:7;1<x&&o<c;)v=v<<6|63&y[o++],x--;1<x?d[_++]=65533:v<65536?d[_++]=v:(v-=65536,d[_++]=55296|v>>10&1023,d[_++]=56320|1023&v)}return b(d,_)},n.utf8border=function(y,m){var o;for((m=m||y.length)>y.length&&(m=y.length),o=m-1;0<=o&&(192&y[o])==128;)o--;return o<0||o===0?m:o+r[y[o]]>m?o:m}},{"./common":41}],43:[function(a,l,n){l.exports=function(i,u,s,r){for(var h=65535&i|0,b=i>>>16&65535|0,y=0;s!==0;){for(s-=y=2e3<s?2e3:s;b=b+(h=h+u[r++]|0)|0,--y;);h%=65521,b%=65521}return h|b<<16|0}},{}],44:[function(a,l,n){l.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],45:[function(a,l,n){var i=function(){for(var u,s=[],r=0;r<256;r++){u=r;for(var h=0;h<8;h++)u=1&u?3988292384^u>>>1:u>>>1;s[r]=u}return s}();l.exports=function(u,s,r,h){var b=i,y=h+r;u^=-1;for(var m=h;m<y;m++)u=u>>>8^b[255&(u^s[m])];return-1^u}},{}],46:[function(a,l,n){var i,u=a("../utils/common"),s=a("./trees"),r=a("./adler32"),h=a("./crc32"),b=a("./messages"),y=0,m=4,o=0,_=-2,v=-1,x=4,c=2,d=8,g=9,S=286,N=30,M=19,w=2*S+1,j=15,O=3,k=258,F=k+O+1,T=42,L=113,p=1,Z=2,Y=3,R=4;function $(f,q){return f.msg=b[q],q}function X(f){return(f<<1)-(4<f?9:0)}function tt(f){for(var q=f.length;0<=--q;)f[q]=0}function B(f){var q=f.state,H=q.pending;H>f.avail_out&&(H=f.avail_out),H!==0&&(u.arraySet(f.output,q.pending_buf,q.pending_out,H,f.next_out),f.next_out+=H,q.pending_out+=H,f.total_out+=H,f.avail_out-=H,q.pending-=H,q.pending===0&&(q.pending_out=0))}function U(f,q){s._tr_flush_block(f,0<=f.block_start?f.block_start:-1,f.strstart-f.block_start,q),f.block_start=f.strstart,B(f.strm)}function et(f,q){f.pending_buf[f.pending++]=q}function I(f,q){f.pending_buf[f.pending++]=q>>>8&255,f.pending_buf[f.pending++]=255&q}function W(f,q){var H,A,z=f.max_chain_length,C=f.strstart,Q=f.prev_length,V=f.nice_match,D=f.strstart>f.w_size-F?f.strstart-(f.w_size-F):0,K=f.window,P=f.w_mask,J=f.prev,at=f.strstart+k,xt=K[C+Q-1],dt=K[C+Q];f.prev_length>=f.good_match&&(z>>=2),V>f.lookahead&&(V=f.lookahead);do if(K[(H=q)+Q]===dt&&K[H+Q-1]===xt&&K[H]===K[C]&&K[++H]===K[C+1]){C+=2,H++;do;while(K[++C]===K[++H]&&K[++C]===K[++H]&&K[++C]===K[++H]&&K[++C]===K[++H]&&K[++C]===K[++H]&&K[++C]===K[++H]&&K[++C]===K[++H]&&K[++C]===K[++H]&&C<at);if(A=k-(at-C),C=at-k,Q<A){if(f.match_start=q,V<=(Q=A))break;xt=K[C+Q-1],dt=K[C+Q]}}while((q=J[q&P])>D&&--z!=0);return Q<=f.lookahead?Q:f.lookahead}function Ct(f){var q,H,A,z,C,Q,V,D,K,P,J=f.w_size;do{if(z=f.window_size-f.lookahead-f.strstart,f.strstart>=J+(J-F)){for(u.arraySet(f.window,f.window,J,J,0),f.match_start-=J,f.strstart-=J,f.block_start-=J,q=H=f.hash_size;A=f.head[--q],f.head[q]=J<=A?A-J:0,--H;);for(q=H=J;A=f.prev[--q],f.prev[q]=J<=A?A-J:0,--H;);z+=J}if(f.strm.avail_in===0)break;if(Q=f.strm,V=f.window,D=f.strstart+f.lookahead,K=z,P=void 0,P=Q.avail_in,K<P&&(P=K),H=P===0?0:(Q.avail_in-=P,u.arraySet(V,Q.input,Q.next_in,P,D),Q.state.wrap===1?Q.adler=r(Q.adler,V,P,D):Q.state.wrap===2&&(Q.adler=h(Q.adler,V,P,D)),Q.next_in+=P,Q.total_in+=P,P),f.lookahead+=H,f.lookahead+f.insert>=O)for(C=f.strstart-f.insert,f.ins_h=f.window[C],f.ins_h=(f.ins_h<<f.hash_shift^f.window[C+1])&f.hash_mask;f.insert&&(f.ins_h=(f.ins_h<<f.hash_shift^f.window[C+O-1])&f.hash_mask,f.prev[C&f.w_mask]=f.head[f.ins_h],f.head[f.ins_h]=C,C++,f.insert--,!(f.lookahead+f.insert<O)););}while(f.lookahead<F&&f.strm.avail_in!==0)}function Ft(f,q){for(var H,A;;){if(f.lookahead<F){if(Ct(f),f.lookahead<F&&q===y)return p;if(f.lookahead===0)break}if(H=0,f.lookahead>=O&&(f.ins_h=(f.ins_h<<f.hash_shift^f.window[f.strstart+O-1])&f.hash_mask,H=f.prev[f.strstart&f.w_mask]=f.head[f.ins_h],f.head[f.ins_h]=f.strstart),H!==0&&f.strstart-H<=f.w_size-F&&(f.match_length=W(f,H)),f.match_length>=O)if(A=s._tr_tally(f,f.strstart-f.match_start,f.match_length-O),f.lookahead-=f.match_length,f.match_length<=f.max_lazy_match&&f.lookahead>=O){for(f.match_length--;f.strstart++,f.ins_h=(f.ins_h<<f.hash_shift^f.window[f.strstart+O-1])&f.hash_mask,H=f.prev[f.strstart&f.w_mask]=f.head[f.ins_h],f.head[f.ins_h]=f.strstart,--f.match_length!=0;);f.strstart++}else f.strstart+=f.match_length,f.match_length=0,f.ins_h=f.window[f.strstart],f.ins_h=(f.ins_h<<f.hash_shift^f.window[f.strstart+1])&f.hash_mask;else A=s._tr_tally(f,0,f.window[f.strstart]),f.lookahead--,f.strstart++;if(A&&(U(f,!1),f.strm.avail_out===0))return p}return f.insert=f.strstart<O-1?f.strstart:O-1,q===m?(U(f,!0),f.strm.avail_out===0?Y:R):f.last_lit&&(U(f,!1),f.strm.avail_out===0)?p:Z}function ot(f,q){for(var H,A,z;;){if(f.lookahead<F){if(Ct(f),f.lookahead<F&&q===y)return p;if(f.lookahead===0)break}if(H=0,f.lookahead>=O&&(f.ins_h=(f.ins_h<<f.hash_shift^f.window[f.strstart+O-1])&f.hash_mask,H=f.prev[f.strstart&f.w_mask]=f.head[f.ins_h],f.head[f.ins_h]=f.strstart),f.prev_length=f.match_length,f.prev_match=f.match_start,f.match_length=O-1,H!==0&&f.prev_length<f.max_lazy_match&&f.strstart-H<=f.w_size-F&&(f.match_length=W(f,H),f.match_length<=5&&(f.strategy===1||f.match_length===O&&4096<f.strstart-f.match_start)&&(f.match_length=O-1)),f.prev_length>=O&&f.match_length<=f.prev_length){for(z=f.strstart+f.lookahead-O,A=s._tr_tally(f,f.strstart-1-f.prev_match,f.prev_length-O),f.lookahead-=f.prev_length-1,f.prev_length-=2;++f.strstart<=z&&(f.ins_h=(f.ins_h<<f.hash_shift^f.window[f.strstart+O-1])&f.hash_mask,H=f.prev[f.strstart&f.w_mask]=f.head[f.ins_h],f.head[f.ins_h]=f.strstart),--f.prev_length!=0;);if(f.match_available=0,f.match_length=O-1,f.strstart++,A&&(U(f,!1),f.strm.avail_out===0))return p}else if(f.match_available){if((A=s._tr_tally(f,0,f.window[f.strstart-1]))&&U(f,!1),f.strstart++,f.lookahead--,f.strm.avail_out===0)return p}else f.match_available=1,f.strstart++,f.lookahead--}return f.match_available&&(A=s._tr_tally(f,0,f.window[f.strstart-1]),f.match_available=0),f.insert=f.strstart<O-1?f.strstart:O-1,q===m?(U(f,!0),f.strm.avail_out===0?Y:R):f.last_lit&&(U(f,!1),f.strm.avail_out===0)?p:Z}function pt(f,q,H,A,z){this.good_length=f,this.max_lazy=q,this.nice_length=H,this.max_chain=A,this.func=z}function Yt(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=d,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new u.Buf16(2*w),this.dyn_dtree=new u.Buf16(2*(2*N+1)),this.bl_tree=new u.Buf16(2*(2*M+1)),tt(this.dyn_ltree),tt(this.dyn_dtree),tt(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new u.Buf16(j+1),this.heap=new u.Buf16(2*S+1),tt(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new u.Buf16(2*S+1),tt(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function jt(f){var q;return f&&f.state?(f.total_in=f.total_out=0,f.data_type=c,(q=f.state).pending=0,q.pending_out=0,q.wrap<0&&(q.wrap=-q.wrap),q.status=q.wrap?T:L,f.adler=q.wrap===2?0:1,q.last_flush=y,s._tr_init(q),o):$(f,_)}function De(f){var q=jt(f);return q===o&&function(H){H.window_size=2*H.w_size,tt(H.head),H.max_lazy_match=i[H.level].max_lazy,H.good_match=i[H.level].good_length,H.nice_match=i[H.level].nice_length,H.max_chain_length=i[H.level].max_chain,H.strstart=0,H.block_start=0,H.lookahead=0,H.insert=0,H.match_length=H.prev_length=O-1,H.match_available=0,H.ins_h=0}(f.state),q}function Ne(f,q,H,A,z,C){if(!f)return _;var Q=1;if(q===v&&(q=6),A<0?(Q=0,A=-A):15<A&&(Q=2,A-=16),z<1||g<z||H!==d||A<8||15<A||q<0||9<q||C<0||x<C)return $(f,_);A===8&&(A=9);var V=new Yt;return(f.state=V).strm=f,V.wrap=Q,V.gzhead=null,V.w_bits=A,V.w_size=1<<V.w_bits,V.w_mask=V.w_size-1,V.hash_bits=z+7,V.hash_size=1<<V.hash_bits,V.hash_mask=V.hash_size-1,V.hash_shift=~~((V.hash_bits+O-1)/O),V.window=new u.Buf8(2*V.w_size),V.head=new u.Buf16(V.hash_size),V.prev=new u.Buf16(V.w_size),V.lit_bufsize=1<<z+6,V.pending_buf_size=4*V.lit_bufsize,V.pending_buf=new u.Buf8(V.pending_buf_size),V.d_buf=1*V.lit_bufsize,V.l_buf=3*V.lit_bufsize,V.level=q,V.strategy=C,V.method=H,De(f)}i=[new pt(0,0,0,0,function(f,q){var H=65535;for(H>f.pending_buf_size-5&&(H=f.pending_buf_size-5);;){if(f.lookahead<=1){if(Ct(f),f.lookahead===0&&q===y)return p;if(f.lookahead===0)break}f.strstart+=f.lookahead,f.lookahead=0;var A=f.block_start+H;if((f.strstart===0||f.strstart>=A)&&(f.lookahead=f.strstart-A,f.strstart=A,U(f,!1),f.strm.avail_out===0)||f.strstart-f.block_start>=f.w_size-F&&(U(f,!1),f.strm.avail_out===0))return p}return f.insert=0,q===m?(U(f,!0),f.strm.avail_out===0?Y:R):(f.strstart>f.block_start&&(U(f,!1),f.strm.avail_out),p)}),new pt(4,4,8,4,Ft),new pt(4,5,16,8,Ft),new pt(4,6,32,32,Ft),new pt(4,4,16,16,ot),new pt(8,16,32,32,ot),new pt(8,16,128,128,ot),new pt(8,32,128,256,ot),new pt(32,128,258,1024,ot),new pt(32,258,258,4096,ot)],n.deflateInit=function(f,q){return Ne(f,q,d,15,8,0)},n.deflateInit2=Ne,n.deflateReset=De,n.deflateResetKeep=jt,n.deflateSetHeader=function(f,q){return f&&f.state?f.state.wrap!==2?_:(f.state.gzhead=q,o):_},n.deflate=function(f,q){var H,A,z,C;if(!f||!f.state||5<q||q<0)return f?$(f,_):_;if(A=f.state,!f.output||!f.input&&f.avail_in!==0||A.status===666&&q!==m)return $(f,f.avail_out===0?-5:_);if(A.strm=f,H=A.last_flush,A.last_flush=q,A.status===T)if(A.wrap===2)f.adler=0,et(A,31),et(A,139),et(A,8),A.gzhead?(et(A,(A.gzhead.text?1:0)+(A.gzhead.hcrc?2:0)+(A.gzhead.extra?4:0)+(A.gzhead.name?8:0)+(A.gzhead.comment?16:0)),et(A,255&A.gzhead.time),et(A,A.gzhead.time>>8&255),et(A,A.gzhead.time>>16&255),et(A,A.gzhead.time>>24&255),et(A,A.level===9?2:2<=A.strategy||A.level<2?4:0),et(A,255&A.gzhead.os),A.gzhead.extra&&A.gzhead.extra.length&&(et(A,255&A.gzhead.extra.length),et(A,A.gzhead.extra.length>>8&255)),A.gzhead.hcrc&&(f.adler=h(f.adler,A.pending_buf,A.pending,0)),A.gzindex=0,A.status=69):(et(A,0),et(A,0),et(A,0),et(A,0),et(A,0),et(A,A.level===9?2:2<=A.strategy||A.level<2?4:0),et(A,3),A.status=L);else{var Q=d+(A.w_bits-8<<4)<<8;Q|=(2<=A.strategy||A.level<2?0:A.level<6?1:A.level===6?2:3)<<6,A.strstart!==0&&(Q|=32),Q+=31-Q%31,A.status=L,I(A,Q),A.strstart!==0&&(I(A,f.adler>>>16),I(A,65535&f.adler)),f.adler=1}if(A.status===69)if(A.gzhead.extra){for(z=A.pending;A.gzindex<(65535&A.gzhead.extra.length)&&(A.pending!==A.pending_buf_size||(A.gzhead.hcrc&&A.pending>z&&(f.adler=h(f.adler,A.pending_buf,A.pending-z,z)),B(f),z=A.pending,A.pending!==A.pending_buf_size));)et(A,255&A.gzhead.extra[A.gzindex]),A.gzindex++;A.gzhead.hcrc&&A.pending>z&&(f.adler=h(f.adler,A.pending_buf,A.pending-z,z)),A.gzindex===A.gzhead.extra.length&&(A.gzindex=0,A.status=73)}else A.status=73;if(A.status===73)if(A.gzhead.name){z=A.pending;do{if(A.pending===A.pending_buf_size&&(A.gzhead.hcrc&&A.pending>z&&(f.adler=h(f.adler,A.pending_buf,A.pending-z,z)),B(f),z=A.pending,A.pending===A.pending_buf_size)){C=1;break}C=A.gzindex<A.gzhead.name.length?255&A.gzhead.name.charCodeAt(A.gzindex++):0,et(A,C)}while(C!==0);A.gzhead.hcrc&&A.pending>z&&(f.adler=h(f.adler,A.pending_buf,A.pending-z,z)),C===0&&(A.gzindex=0,A.status=91)}else A.status=91;if(A.status===91)if(A.gzhead.comment){z=A.pending;do{if(A.pending===A.pending_buf_size&&(A.gzhead.hcrc&&A.pending>z&&(f.adler=h(f.adler,A.pending_buf,A.pending-z,z)),B(f),z=A.pending,A.pending===A.pending_buf_size)){C=1;break}C=A.gzindex<A.gzhead.comment.length?255&A.gzhead.comment.charCodeAt(A.gzindex++):0,et(A,C)}while(C!==0);A.gzhead.hcrc&&A.pending>z&&(f.adler=h(f.adler,A.pending_buf,A.pending-z,z)),C===0&&(A.status=103)}else A.status=103;if(A.status===103&&(A.gzhead.hcrc?(A.pending+2>A.pending_buf_size&&B(f),A.pending+2<=A.pending_buf_size&&(et(A,255&f.adler),et(A,f.adler>>8&255),f.adler=0,A.status=L)):A.status=L),A.pending!==0){if(B(f),f.avail_out===0)return A.last_flush=-1,o}else if(f.avail_in===0&&X(q)<=X(H)&&q!==m)return $(f,-5);if(A.status===666&&f.avail_in!==0)return $(f,-5);if(f.avail_in!==0||A.lookahead!==0||q!==y&&A.status!==666){var V=A.strategy===2?function(D,K){for(var P;;){if(D.lookahead===0&&(Ct(D),D.lookahead===0)){if(K===y)return p;break}if(D.match_length=0,P=s._tr_tally(D,0,D.window[D.strstart]),D.lookahead--,D.strstart++,P&&(U(D,!1),D.strm.avail_out===0))return p}return D.insert=0,K===m?(U(D,!0),D.strm.avail_out===0?Y:R):D.last_lit&&(U(D,!1),D.strm.avail_out===0)?p:Z}(A,q):A.strategy===3?function(D,K){for(var P,J,at,xt,dt=D.window;;){if(D.lookahead<=k){if(Ct(D),D.lookahead<=k&&K===y)return p;if(D.lookahead===0)break}if(D.match_length=0,D.lookahead>=O&&0<D.strstart&&(J=dt[at=D.strstart-1])===dt[++at]&&J===dt[++at]&&J===dt[++at]){xt=D.strstart+k;do;while(J===dt[++at]&&J===dt[++at]&&J===dt[++at]&&J===dt[++at]&&J===dt[++at]&&J===dt[++at]&&J===dt[++at]&&J===dt[++at]&&at<xt);D.match_length=k-(xt-at),D.match_length>D.lookahead&&(D.match_length=D.lookahead)}if(D.match_length>=O?(P=s._tr_tally(D,1,D.match_length-O),D.lookahead-=D.match_length,D.strstart+=D.match_length,D.match_length=0):(P=s._tr_tally(D,0,D.window[D.strstart]),D.lookahead--,D.strstart++),P&&(U(D,!1),D.strm.avail_out===0))return p}return D.insert=0,K===m?(U(D,!0),D.strm.avail_out===0?Y:R):D.last_lit&&(U(D,!1),D.strm.avail_out===0)?p:Z}(A,q):i[A.level].func(A,q);if(V!==Y&&V!==R||(A.status=666),V===p||V===Y)return f.avail_out===0&&(A.last_flush=-1),o;if(V===Z&&(q===1?s._tr_align(A):q!==5&&(s._tr_stored_block(A,0,0,!1),q===3&&(tt(A.head),A.lookahead===0&&(A.strstart=0,A.block_start=0,A.insert=0))),B(f),f.avail_out===0))return A.last_flush=-1,o}return q!==m?o:A.wrap<=0?1:(A.wrap===2?(et(A,255&f.adler),et(A,f.adler>>8&255),et(A,f.adler>>16&255),et(A,f.adler>>24&255),et(A,255&f.total_in),et(A,f.total_in>>8&255),et(A,f.total_in>>16&255),et(A,f.total_in>>24&255)):(I(A,f.adler>>>16),I(A,65535&f.adler)),B(f),0<A.wrap&&(A.wrap=-A.wrap),A.pending!==0?o:1)},n.deflateEnd=function(f){var q;return f&&f.state?(q=f.state.status)!==T&&q!==69&&q!==73&&q!==91&&q!==103&&q!==L&&q!==666?$(f,_):(f.state=null,q===L?$(f,-3):o):_},n.deflateSetDictionary=function(f,q){var H,A,z,C,Q,V,D,K,P=q.length;if(!f||!f.state||(C=(H=f.state).wrap)===2||C===1&&H.status!==T||H.lookahead)return _;for(C===1&&(f.adler=r(f.adler,q,P,0)),H.wrap=0,P>=H.w_size&&(C===0&&(tt(H.head),H.strstart=0,H.block_start=0,H.insert=0),K=new u.Buf8(H.w_size),u.arraySet(K,q,P-H.w_size,H.w_size,0),q=K,P=H.w_size),Q=f.avail_in,V=f.next_in,D=f.input,f.avail_in=P,f.next_in=0,f.input=q,Ct(H);H.lookahead>=O;){for(A=H.strstart,z=H.lookahead-(O-1);H.ins_h=(H.ins_h<<H.hash_shift^H.window[A+O-1])&H.hash_mask,H.prev[A&H.w_mask]=H.head[H.ins_h],H.head[H.ins_h]=A,A++,--z;);H.strstart=A,H.lookahead=O-1,Ct(H)}return H.strstart+=H.lookahead,H.block_start=H.strstart,H.insert=H.lookahead,H.lookahead=0,H.match_length=H.prev_length=O-1,H.match_available=0,f.next_in=V,f.input=D,f.avail_in=Q,H.wrap=C,o},n.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(a,l,n){l.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},{}],48:[function(a,l,n){l.exports=function(i,u){var s,r,h,b,y,m,o,_,v,x,c,d,g,S,N,M,w,j,O,k,F,T,L,p,Z;s=i.state,r=i.next_in,p=i.input,h=r+(i.avail_in-5),b=i.next_out,Z=i.output,y=b-(u-i.avail_out),m=b+(i.avail_out-257),o=s.dmax,_=s.wsize,v=s.whave,x=s.wnext,c=s.window,d=s.hold,g=s.bits,S=s.lencode,N=s.distcode,M=(1<<s.lenbits)-1,w=(1<<s.distbits)-1;t:do{g<15&&(d+=p[r++]<<g,g+=8,d+=p[r++]<<g,g+=8),j=S[d&M];e:for(;;){if(d>>>=O=j>>>24,g-=O,(O=j>>>16&255)===0)Z[b++]=65535&j;else{if(!(16&O)){if(!(64&O)){j=S[(65535&j)+(d&(1<<O)-1)];continue e}if(32&O){s.mode=12;break t}i.msg="invalid literal/length code",s.mode=30;break t}k=65535&j,(O&=15)&&(g<O&&(d+=p[r++]<<g,g+=8),k+=d&(1<<O)-1,d>>>=O,g-=O),g<15&&(d+=p[r++]<<g,g+=8,d+=p[r++]<<g,g+=8),j=N[d&w];a:for(;;){if(d>>>=O=j>>>24,g-=O,!(16&(O=j>>>16&255))){if(!(64&O)){j=N[(65535&j)+(d&(1<<O)-1)];continue a}i.msg="invalid distance code",s.mode=30;break t}if(F=65535&j,g<(O&=15)&&(d+=p[r++]<<g,(g+=8)<O&&(d+=p[r++]<<g,g+=8)),o<(F+=d&(1<<O)-1)){i.msg="invalid distance too far back",s.mode=30;break t}if(d>>>=O,g-=O,(O=b-y)<F){if(v<(O=F-O)&&s.sane){i.msg="invalid distance too far back",s.mode=30;break t}if(L=c,(T=0)===x){if(T+=_-O,O<k){for(k-=O;Z[b++]=c[T++],--O;);T=b-F,L=Z}}else if(x<O){if(T+=_+x-O,(O-=x)<k){for(k-=O;Z[b++]=c[T++],--O;);if(T=0,x<k){for(k-=O=x;Z[b++]=c[T++],--O;);T=b-F,L=Z}}}else if(T+=x-O,O<k){for(k-=O;Z[b++]=c[T++],--O;);T=b-F,L=Z}for(;2<k;)Z[b++]=L[T++],Z[b++]=L[T++],Z[b++]=L[T++],k-=3;k&&(Z[b++]=L[T++],1<k&&(Z[b++]=L[T++]))}else{for(T=b-F;Z[b++]=Z[T++],Z[b++]=Z[T++],Z[b++]=Z[T++],2<(k-=3););k&&(Z[b++]=Z[T++],1<k&&(Z[b++]=Z[T++]))}break}}break}}while(r<h&&b<m);r-=k=g>>3,d&=(1<<(g-=k<<3))-1,i.next_in=r,i.next_out=b,i.avail_in=r<h?h-r+5:5-(r-h),i.avail_out=b<m?m-b+257:257-(b-m),s.hold=d,s.bits=g}},{}],49:[function(a,l,n){var i=a("../utils/common"),u=a("./adler32"),s=a("./crc32"),r=a("./inffast"),h=a("./inftrees"),b=1,y=2,m=0,o=-2,_=1,v=852,x=592;function c(T){return(T>>>24&255)+(T>>>8&65280)+((65280&T)<<8)+((255&T)<<24)}function d(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new i.Buf16(320),this.work=new i.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function g(T){var L;return T&&T.state?(L=T.state,T.total_in=T.total_out=L.total=0,T.msg="",L.wrap&&(T.adler=1&L.wrap),L.mode=_,L.last=0,L.havedict=0,L.dmax=32768,L.head=null,L.hold=0,L.bits=0,L.lencode=L.lendyn=new i.Buf32(v),L.distcode=L.distdyn=new i.Buf32(x),L.sane=1,L.back=-1,m):o}function S(T){var L;return T&&T.state?((L=T.state).wsize=0,L.whave=0,L.wnext=0,g(T)):o}function N(T,L){var p,Z;return T&&T.state?(Z=T.state,L<0?(p=0,L=-L):(p=1+(L>>4),L<48&&(L&=15)),L&&(L<8||15<L)?o:(Z.window!==null&&Z.wbits!==L&&(Z.window=null),Z.wrap=p,Z.wbits=L,S(T))):o}function M(T,L){var p,Z;return T?(Z=new d,(T.state=Z).window=null,(p=N(T,L))!==m&&(T.state=null),p):o}var w,j,O=!0;function k(T){if(O){var L;for(w=new i.Buf32(512),j=new i.Buf32(32),L=0;L<144;)T.lens[L++]=8;for(;L<256;)T.lens[L++]=9;for(;L<280;)T.lens[L++]=7;for(;L<288;)T.lens[L++]=8;for(h(b,T.lens,0,288,w,0,T.work,{bits:9}),L=0;L<32;)T.lens[L++]=5;h(y,T.lens,0,32,j,0,T.work,{bits:5}),O=!1}T.lencode=w,T.lenbits=9,T.distcode=j,T.distbits=5}function F(T,L,p,Z){var Y,R=T.state;return R.window===null&&(R.wsize=1<<R.wbits,R.wnext=0,R.whave=0,R.window=new i.Buf8(R.wsize)),Z>=R.wsize?(i.arraySet(R.window,L,p-R.wsize,R.wsize,0),R.wnext=0,R.whave=R.wsize):(Z<(Y=R.wsize-R.wnext)&&(Y=Z),i.arraySet(R.window,L,p-Z,Y,R.wnext),(Z-=Y)?(i.arraySet(R.window,L,p-Z,Z,0),R.wnext=Z,R.whave=R.wsize):(R.wnext+=Y,R.wnext===R.wsize&&(R.wnext=0),R.whave<R.wsize&&(R.whave+=Y))),0}n.inflateReset=S,n.inflateReset2=N,n.inflateResetKeep=g,n.inflateInit=function(T){return M(T,15)},n.inflateInit2=M,n.inflate=function(T,L){var p,Z,Y,R,$,X,tt,B,U,et,I,W,Ct,Ft,ot,pt,Yt,jt,De,Ne,f,q,H,A,z=0,C=new i.Buf8(4),Q=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!T||!T.state||!T.output||!T.input&&T.avail_in!==0)return o;(p=T.state).mode===12&&(p.mode=13),$=T.next_out,Y=T.output,tt=T.avail_out,R=T.next_in,Z=T.input,X=T.avail_in,B=p.hold,U=p.bits,et=X,I=tt,q=m;t:for(;;)switch(p.mode){case _:if(p.wrap===0){p.mode=13;break}for(;U<16;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}if(2&p.wrap&&B===35615){C[p.check=0]=255&B,C[1]=B>>>8&255,p.check=s(p.check,C,2,0),U=B=0,p.mode=2;break}if(p.flags=0,p.head&&(p.head.done=!1),!(1&p.wrap)||(((255&B)<<8)+(B>>8))%31){T.msg="incorrect header check",p.mode=30;break}if((15&B)!=8){T.msg="unknown compression method",p.mode=30;break}if(U-=4,f=8+(15&(B>>>=4)),p.wbits===0)p.wbits=f;else if(f>p.wbits){T.msg="invalid window size",p.mode=30;break}p.dmax=1<<f,T.adler=p.check=1,p.mode=512&B?10:12,U=B=0;break;case 2:for(;U<16;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}if(p.flags=B,(255&p.flags)!=8){T.msg="unknown compression method",p.mode=30;break}if(57344&p.flags){T.msg="unknown header flags set",p.mode=30;break}p.head&&(p.head.text=B>>8&1),512&p.flags&&(C[0]=255&B,C[1]=B>>>8&255,p.check=s(p.check,C,2,0)),U=B=0,p.mode=3;case 3:for(;U<32;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}p.head&&(p.head.time=B),512&p.flags&&(C[0]=255&B,C[1]=B>>>8&255,C[2]=B>>>16&255,C[3]=B>>>24&255,p.check=s(p.check,C,4,0)),U=B=0,p.mode=4;case 4:for(;U<16;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}p.head&&(p.head.xflags=255&B,p.head.os=B>>8),512&p.flags&&(C[0]=255&B,C[1]=B>>>8&255,p.check=s(p.check,C,2,0)),U=B=0,p.mode=5;case 5:if(1024&p.flags){for(;U<16;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}p.length=B,p.head&&(p.head.extra_len=B),512&p.flags&&(C[0]=255&B,C[1]=B>>>8&255,p.check=s(p.check,C,2,0)),U=B=0}else p.head&&(p.head.extra=null);p.mode=6;case 6:if(1024&p.flags&&(X<(W=p.length)&&(W=X),W&&(p.head&&(f=p.head.extra_len-p.length,p.head.extra||(p.head.extra=new Array(p.head.extra_len)),i.arraySet(p.head.extra,Z,R,W,f)),512&p.flags&&(p.check=s(p.check,Z,W,R)),X-=W,R+=W,p.length-=W),p.length))break t;p.length=0,p.mode=7;case 7:if(2048&p.flags){if(X===0)break t;for(W=0;f=Z[R+W++],p.head&&f&&p.length<65536&&(p.head.name+=String.fromCharCode(f)),f&&W<X;);if(512&p.flags&&(p.check=s(p.check,Z,W,R)),X-=W,R+=W,f)break t}else p.head&&(p.head.name=null);p.length=0,p.mode=8;case 8:if(4096&p.flags){if(X===0)break t;for(W=0;f=Z[R+W++],p.head&&f&&p.length<65536&&(p.head.comment+=String.fromCharCode(f)),f&&W<X;);if(512&p.flags&&(p.check=s(p.check,Z,W,R)),X-=W,R+=W,f)break t}else p.head&&(p.head.comment=null);p.mode=9;case 9:if(512&p.flags){for(;U<16;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}if(B!==(65535&p.check)){T.msg="header crc mismatch",p.mode=30;break}U=B=0}p.head&&(p.head.hcrc=p.flags>>9&1,p.head.done=!0),T.adler=p.check=0,p.mode=12;break;case 10:for(;U<32;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}T.adler=p.check=c(B),U=B=0,p.mode=11;case 11:if(p.havedict===0)return T.next_out=$,T.avail_out=tt,T.next_in=R,T.avail_in=X,p.hold=B,p.bits=U,2;T.adler=p.check=1,p.mode=12;case 12:if(L===5||L===6)break t;case 13:if(p.last){B>>>=7&U,U-=7&U,p.mode=27;break}for(;U<3;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}switch(p.last=1&B,U-=1,3&(B>>>=1)){case 0:p.mode=14;break;case 1:if(k(p),p.mode=20,L!==6)break;B>>>=2,U-=2;break t;case 2:p.mode=17;break;case 3:T.msg="invalid block type",p.mode=30}B>>>=2,U-=2;break;case 14:for(B>>>=7&U,U-=7&U;U<32;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}if((65535&B)!=(B>>>16^65535)){T.msg="invalid stored block lengths",p.mode=30;break}if(p.length=65535&B,U=B=0,p.mode=15,L===6)break t;case 15:p.mode=16;case 16:if(W=p.length){if(X<W&&(W=X),tt<W&&(W=tt),W===0)break t;i.arraySet(Y,Z,R,W,$),X-=W,R+=W,tt-=W,$+=W,p.length-=W;break}p.mode=12;break;case 17:for(;U<14;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}if(p.nlen=257+(31&B),B>>>=5,U-=5,p.ndist=1+(31&B),B>>>=5,U-=5,p.ncode=4+(15&B),B>>>=4,U-=4,286<p.nlen||30<p.ndist){T.msg="too many length or distance symbols",p.mode=30;break}p.have=0,p.mode=18;case 18:for(;p.have<p.ncode;){for(;U<3;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}p.lens[Q[p.have++]]=7&B,B>>>=3,U-=3}for(;p.have<19;)p.lens[Q[p.have++]]=0;if(p.lencode=p.lendyn,p.lenbits=7,H={bits:p.lenbits},q=h(0,p.lens,0,19,p.lencode,0,p.work,H),p.lenbits=H.bits,q){T.msg="invalid code lengths set",p.mode=30;break}p.have=0,p.mode=19;case 19:for(;p.have<p.nlen+p.ndist;){for(;pt=(z=p.lencode[B&(1<<p.lenbits)-1])>>>16&255,Yt=65535&z,!((ot=z>>>24)<=U);){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}if(Yt<16)B>>>=ot,U-=ot,p.lens[p.have++]=Yt;else{if(Yt===16){for(A=ot+2;U<A;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}if(B>>>=ot,U-=ot,p.have===0){T.msg="invalid bit length repeat",p.mode=30;break}f=p.lens[p.have-1],W=3+(3&B),B>>>=2,U-=2}else if(Yt===17){for(A=ot+3;U<A;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}U-=ot,f=0,W=3+(7&(B>>>=ot)),B>>>=3,U-=3}else{for(A=ot+7;U<A;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}U-=ot,f=0,W=11+(127&(B>>>=ot)),B>>>=7,U-=7}if(p.have+W>p.nlen+p.ndist){T.msg="invalid bit length repeat",p.mode=30;break}for(;W--;)p.lens[p.have++]=f}}if(p.mode===30)break;if(p.lens[256]===0){T.msg="invalid code -- missing end-of-block",p.mode=30;break}if(p.lenbits=9,H={bits:p.lenbits},q=h(b,p.lens,0,p.nlen,p.lencode,0,p.work,H),p.lenbits=H.bits,q){T.msg="invalid literal/lengths set",p.mode=30;break}if(p.distbits=6,p.distcode=p.distdyn,H={bits:p.distbits},q=h(y,p.lens,p.nlen,p.ndist,p.distcode,0,p.work,H),p.distbits=H.bits,q){T.msg="invalid distances set",p.mode=30;break}if(p.mode=20,L===6)break t;case 20:p.mode=21;case 21:if(6<=X&&258<=tt){T.next_out=$,T.avail_out=tt,T.next_in=R,T.avail_in=X,p.hold=B,p.bits=U,r(T,I),$=T.next_out,Y=T.output,tt=T.avail_out,R=T.next_in,Z=T.input,X=T.avail_in,B=p.hold,U=p.bits,p.mode===12&&(p.back=-1);break}for(p.back=0;pt=(z=p.lencode[B&(1<<p.lenbits)-1])>>>16&255,Yt=65535&z,!((ot=z>>>24)<=U);){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}if(pt&&!(240&pt)){for(jt=ot,De=pt,Ne=Yt;pt=(z=p.lencode[Ne+((B&(1<<jt+De)-1)>>jt)])>>>16&255,Yt=65535&z,!(jt+(ot=z>>>24)<=U);){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}B>>>=jt,U-=jt,p.back+=jt}if(B>>>=ot,U-=ot,p.back+=ot,p.length=Yt,pt===0){p.mode=26;break}if(32&pt){p.back=-1,p.mode=12;break}if(64&pt){T.msg="invalid literal/length code",p.mode=30;break}p.extra=15&pt,p.mode=22;case 22:if(p.extra){for(A=p.extra;U<A;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}p.length+=B&(1<<p.extra)-1,B>>>=p.extra,U-=p.extra,p.back+=p.extra}p.was=p.length,p.mode=23;case 23:for(;pt=(z=p.distcode[B&(1<<p.distbits)-1])>>>16&255,Yt=65535&z,!((ot=z>>>24)<=U);){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}if(!(240&pt)){for(jt=ot,De=pt,Ne=Yt;pt=(z=p.distcode[Ne+((B&(1<<jt+De)-1)>>jt)])>>>16&255,Yt=65535&z,!(jt+(ot=z>>>24)<=U);){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}B>>>=jt,U-=jt,p.back+=jt}if(B>>>=ot,U-=ot,p.back+=ot,64&pt){T.msg="invalid distance code",p.mode=30;break}p.offset=Yt,p.extra=15&pt,p.mode=24;case 24:if(p.extra){for(A=p.extra;U<A;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}p.offset+=B&(1<<p.extra)-1,B>>>=p.extra,U-=p.extra,p.back+=p.extra}if(p.offset>p.dmax){T.msg="invalid distance too far back",p.mode=30;break}p.mode=25;case 25:if(tt===0)break t;if(W=I-tt,p.offset>W){if((W=p.offset-W)>p.whave&&p.sane){T.msg="invalid distance too far back",p.mode=30;break}Ct=W>p.wnext?(W-=p.wnext,p.wsize-W):p.wnext-W,W>p.length&&(W=p.length),Ft=p.window}else Ft=Y,Ct=$-p.offset,W=p.length;for(tt<W&&(W=tt),tt-=W,p.length-=W;Y[$++]=Ft[Ct++],--W;);p.length===0&&(p.mode=21);break;case 26:if(tt===0)break t;Y[$++]=p.length,tt--,p.mode=21;break;case 27:if(p.wrap){for(;U<32;){if(X===0)break t;X--,B|=Z[R++]<<U,U+=8}if(I-=tt,T.total_out+=I,p.total+=I,I&&(T.adler=p.check=p.flags?s(p.check,Y,I,$-I):u(p.check,Y,I,$-I)),I=tt,(p.flags?B:c(B))!==p.check){T.msg="incorrect data check",p.mode=30;break}U=B=0}p.mode=28;case 28:if(p.wrap&&p.flags){for(;U<32;){if(X===0)break t;X--,B+=Z[R++]<<U,U+=8}if(B!==(4294967295&p.total)){T.msg="incorrect length check",p.mode=30;break}U=B=0}p.mode=29;case 29:q=1;break t;case 30:q=-3;break t;case 31:return-4;case 32:default:return o}return T.next_out=$,T.avail_out=tt,T.next_in=R,T.avail_in=X,p.hold=B,p.bits=U,(p.wsize||I!==T.avail_out&&p.mode<30&&(p.mode<27||L!==4))&&F(T,T.output,T.next_out,I-T.avail_out)?(p.mode=31,-4):(et-=T.avail_in,I-=T.avail_out,T.total_in+=et,T.total_out+=I,p.total+=I,p.wrap&&I&&(T.adler=p.check=p.flags?s(p.check,Y,I,T.next_out-I):u(p.check,Y,I,T.next_out-I)),T.data_type=p.bits+(p.last?64:0)+(p.mode===12?128:0)+(p.mode===20||p.mode===15?256:0),(et==0&&I===0||L===4)&&q===m&&(q=-5),q)},n.inflateEnd=function(T){if(!T||!T.state)return o;var L=T.state;return L.window&&(L.window=null),T.state=null,m},n.inflateGetHeader=function(T,L){var p;return T&&T.state&&2&(p=T.state).wrap?((p.head=L).done=!1,m):o},n.inflateSetDictionary=function(T,L){var p,Z=L.length;return T&&T.state?(p=T.state).wrap!==0&&p.mode!==11?o:p.mode===11&&u(1,L,Z,0)!==p.check?-3:F(T,L,Z,Z)?(p.mode=31,-4):(p.havedict=1,m):o},n.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(a,l,n){var i=a("../utils/common"),u=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],s=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],r=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],h=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];l.exports=function(b,y,m,o,_,v,x,c){var d,g,S,N,M,w,j,O,k,F=c.bits,T=0,L=0,p=0,Z=0,Y=0,R=0,$=0,X=0,tt=0,B=0,U=null,et=0,I=new i.Buf16(16),W=new i.Buf16(16),Ct=null,Ft=0;for(T=0;T<=15;T++)I[T]=0;for(L=0;L<o;L++)I[y[m+L]]++;for(Y=F,Z=15;1<=Z&&I[Z]===0;Z--);if(Z<Y&&(Y=Z),Z===0)return _[v++]=20971520,_[v++]=20971520,c.bits=1,0;for(p=1;p<Z&&I[p]===0;p++);for(Y<p&&(Y=p),T=X=1;T<=15;T++)if(X<<=1,(X-=I[T])<0)return-1;if(0<X&&(b===0||Z!==1))return-1;for(W[1]=0,T=1;T<15;T++)W[T+1]=W[T]+I[T];for(L=0;L<o;L++)y[m+L]!==0&&(x[W[y[m+L]]++]=L);if(w=b===0?(U=Ct=x,19):b===1?(U=u,et-=257,Ct=s,Ft-=257,256):(U=r,Ct=h,-1),T=p,M=v,$=L=B=0,S=-1,N=(tt=1<<(R=Y))-1,b===1&&852<tt||b===2&&592<tt)return 1;for(;;){for(j=T-$,k=x[L]<w?(O=0,x[L]):x[L]>w?(O=Ct[Ft+x[L]],U[et+x[L]]):(O=96,0),d=1<<T-$,p=g=1<<R;_[M+(B>>$)+(g-=d)]=j<<24|O<<16|k|0,g!==0;);for(d=1<<T-1;B&d;)d>>=1;if(d!==0?(B&=d-1,B+=d):B=0,L++,--I[T]==0){if(T===Z)break;T=y[m+x[L]]}if(Y<T&&(B&N)!==S){for($===0&&($=Y),M+=p,X=1<<(R=T-$);R+$<Z&&!((X-=I[R+$])<=0);)R++,X<<=1;if(tt+=1<<R,b===1&&852<tt||b===2&&592<tt)return 1;_[S=B&N]=Y<<24|R<<16|M-v|0}}return B!==0&&(_[M+B]=T-$<<24|64<<16|0),c.bits=Y,0}},{"../utils/common":41}],51:[function(a,l,n){l.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],52:[function(a,l,n){var i=a("../utils/common"),u=0,s=1;function r(z){for(var C=z.length;0<=--C;)z[C]=0}var h=0,b=29,y=256,m=y+1+b,o=30,_=19,v=2*m+1,x=15,c=16,d=7,g=256,S=16,N=17,M=18,w=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],j=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],O=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],k=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],F=new Array(2*(m+2));r(F);var T=new Array(2*o);r(T);var L=new Array(512);r(L);var p=new Array(256);r(p);var Z=new Array(b);r(Z);var Y,R,$,X=new Array(o);function tt(z,C,Q,V,D){this.static_tree=z,this.extra_bits=C,this.extra_base=Q,this.elems=V,this.max_length=D,this.has_stree=z&&z.length}function B(z,C){this.dyn_tree=z,this.max_code=0,this.stat_desc=C}function U(z){return z<256?L[z]:L[256+(z>>>7)]}function et(z,C){z.pending_buf[z.pending++]=255&C,z.pending_buf[z.pending++]=C>>>8&255}function I(z,C,Q){z.bi_valid>c-Q?(z.bi_buf|=C<<z.bi_valid&65535,et(z,z.bi_buf),z.bi_buf=C>>c-z.bi_valid,z.bi_valid+=Q-c):(z.bi_buf|=C<<z.bi_valid&65535,z.bi_valid+=Q)}function W(z,C,Q){I(z,Q[2*C],Q[2*C+1])}function Ct(z,C){for(var Q=0;Q|=1&z,z>>>=1,Q<<=1,0<--C;);return Q>>>1}function Ft(z,C,Q){var V,D,K=new Array(x+1),P=0;for(V=1;V<=x;V++)K[V]=P=P+Q[V-1]<<1;for(D=0;D<=C;D++){var J=z[2*D+1];J!==0&&(z[2*D]=Ct(K[J]++,J))}}function ot(z){var C;for(C=0;C<m;C++)z.dyn_ltree[2*C]=0;for(C=0;C<o;C++)z.dyn_dtree[2*C]=0;for(C=0;C<_;C++)z.bl_tree[2*C]=0;z.dyn_ltree[2*g]=1,z.opt_len=z.static_len=0,z.last_lit=z.matches=0}function pt(z){8<z.bi_valid?et(z,z.bi_buf):0<z.bi_valid&&(z.pending_buf[z.pending++]=z.bi_buf),z.bi_buf=0,z.bi_valid=0}function Yt(z,C,Q,V){var D=2*C,K=2*Q;return z[D]<z[K]||z[D]===z[K]&&V[C]<=V[Q]}function jt(z,C,Q){for(var V=z.heap[Q],D=Q<<1;D<=z.heap_len&&(D<z.heap_len&&Yt(C,z.heap[D+1],z.heap[D],z.depth)&&D++,!Yt(C,V,z.heap[D],z.depth));)z.heap[Q]=z.heap[D],Q=D,D<<=1;z.heap[Q]=V}function De(z,C,Q){var V,D,K,P,J=0;if(z.last_lit!==0)for(;V=z.pending_buf[z.d_buf+2*J]<<8|z.pending_buf[z.d_buf+2*J+1],D=z.pending_buf[z.l_buf+J],J++,V===0?W(z,D,C):(W(z,(K=p[D])+y+1,C),(P=w[K])!==0&&I(z,D-=Z[K],P),W(z,K=U(--V),Q),(P=j[K])!==0&&I(z,V-=X[K],P)),J<z.last_lit;);W(z,g,C)}function Ne(z,C){var Q,V,D,K=C.dyn_tree,P=C.stat_desc.static_tree,J=C.stat_desc.has_stree,at=C.stat_desc.elems,xt=-1;for(z.heap_len=0,z.heap_max=v,Q=0;Q<at;Q++)K[2*Q]!==0?(z.heap[++z.heap_len]=xt=Q,z.depth[Q]=0):K[2*Q+1]=0;for(;z.heap_len<2;)K[2*(D=z.heap[++z.heap_len]=xt<2?++xt:0)]=1,z.depth[D]=0,z.opt_len--,J&&(z.static_len-=P[2*D+1]);for(C.max_code=xt,Q=z.heap_len>>1;1<=Q;Q--)jt(z,K,Q);for(D=at;Q=z.heap[1],z.heap[1]=z.heap[z.heap_len--],jt(z,K,1),V=z.heap[1],z.heap[--z.heap_max]=Q,z.heap[--z.heap_max]=V,K[2*D]=K[2*Q]+K[2*V],z.depth[D]=(z.depth[Q]>=z.depth[V]?z.depth[Q]:z.depth[V])+1,K[2*Q+1]=K[2*V+1]=D,z.heap[1]=D++,jt(z,K,1),2<=z.heap_len;);z.heap[--z.heap_max]=z.heap[1],function(dt,ge){var Gl,Ue,ql,Dt,Xn,_u,Ze=ge.dyn_tree,ac=ge.max_code,Hh=ge.stat_desc.static_tree,kh=ge.stat_desc.has_stree,Lh=ge.stat_desc.extra_bits,lc=ge.stat_desc.extra_base,Xl=ge.stat_desc.max_length,Qn=0;for(Dt=0;Dt<=x;Dt++)dt.bl_count[Dt]=0;for(Ze[2*dt.heap[dt.heap_max]+1]=0,Gl=dt.heap_max+1;Gl<v;Gl++)Xl<(Dt=Ze[2*Ze[2*(Ue=dt.heap[Gl])+1]+1]+1)&&(Dt=Xl,Qn++),Ze[2*Ue+1]=Dt,ac<Ue||(dt.bl_count[Dt]++,Xn=0,lc<=Ue&&(Xn=Lh[Ue-lc]),_u=Ze[2*Ue],dt.opt_len+=_u*(Dt+Xn),kh&&(dt.static_len+=_u*(Hh[2*Ue+1]+Xn)));if(Qn!==0){do{for(Dt=Xl-1;dt.bl_count[Dt]===0;)Dt--;dt.bl_count[Dt]--,dt.bl_count[Dt+1]+=2,dt.bl_count[Xl]--,Qn-=2}while(0<Qn);for(Dt=Xl;Dt!==0;Dt--)for(Ue=dt.bl_count[Dt];Ue!==0;)ac<(ql=dt.heap[--Gl])||(Ze[2*ql+1]!==Dt&&(dt.opt_len+=(Dt-Ze[2*ql+1])*Ze[2*ql],Ze[2*ql+1]=Dt),Ue--)}}(z,C),Ft(K,xt,z.bl_count)}function f(z,C,Q){var V,D,K=-1,P=C[1],J=0,at=7,xt=4;for(P===0&&(at=138,xt=3),C[2*(Q+1)+1]=65535,V=0;V<=Q;V++)D=P,P=C[2*(V+1)+1],++J<at&&D===P||(J<xt?z.bl_tree[2*D]+=J:D!==0?(D!==K&&z.bl_tree[2*D]++,z.bl_tree[2*S]++):J<=10?z.bl_tree[2*N]++:z.bl_tree[2*M]++,K=D,xt=(J=0)===P?(at=138,3):D===P?(at=6,3):(at=7,4))}function q(z,C,Q){var V,D,K=-1,P=C[1],J=0,at=7,xt=4;for(P===0&&(at=138,xt=3),V=0;V<=Q;V++)if(D=P,P=C[2*(V+1)+1],!(++J<at&&D===P)){if(J<xt)for(;W(z,D,z.bl_tree),--J!=0;);else D!==0?(D!==K&&(W(z,D,z.bl_tree),J--),W(z,S,z.bl_tree),I(z,J-3,2)):J<=10?(W(z,N,z.bl_tree),I(z,J-3,3)):(W(z,M,z.bl_tree),I(z,J-11,7));K=D,xt=(J=0)===P?(at=138,3):D===P?(at=6,3):(at=7,4)}}r(X);var H=!1;function A(z,C,Q,V){I(z,(h<<1)+(V?1:0),3),function(D,K,P,J){pt(D),et(D,P),et(D,~P),i.arraySet(D.pending_buf,D.window,K,P,D.pending),D.pending+=P}(z,C,Q)}n._tr_init=function(z){H||(function(){var C,Q,V,D,K,P=new Array(x+1);for(D=V=0;D<b-1;D++)for(Z[D]=V,C=0;C<1<<w[D];C++)p[V++]=D;for(p[V-1]=D,D=K=0;D<16;D++)for(X[D]=K,C=0;C<1<<j[D];C++)L[K++]=D;for(K>>=7;D<o;D++)for(X[D]=K<<7,C=0;C<1<<j[D]-7;C++)L[256+K++]=D;for(Q=0;Q<=x;Q++)P[Q]=0;for(C=0;C<=143;)F[2*C+1]=8,C++,P[8]++;for(;C<=255;)F[2*C+1]=9,C++,P[9]++;for(;C<=279;)F[2*C+1]=7,C++,P[7]++;for(;C<=287;)F[2*C+1]=8,C++,P[8]++;for(Ft(F,m+1,P),C=0;C<o;C++)T[2*C+1]=5,T[2*C]=Ct(C,5);Y=new tt(F,w,y+1,m,x),R=new tt(T,j,0,o,x),$=new tt(new Array(0),O,0,_,d)}(),H=!0),z.l_desc=new B(z.dyn_ltree,Y),z.d_desc=new B(z.dyn_dtree,R),z.bl_desc=new B(z.bl_tree,$),z.bi_buf=0,z.bi_valid=0,ot(z)},n._tr_stored_block=A,n._tr_flush_block=function(z,C,Q,V){var D,K,P=0;0<z.level?(z.strm.data_type===2&&(z.strm.data_type=function(J){var at,xt=4093624447;for(at=0;at<=31;at++,xt>>>=1)if(1&xt&&J.dyn_ltree[2*at]!==0)return u;if(J.dyn_ltree[18]!==0||J.dyn_ltree[20]!==0||J.dyn_ltree[26]!==0)return s;for(at=32;at<y;at++)if(J.dyn_ltree[2*at]!==0)return s;return u}(z)),Ne(z,z.l_desc),Ne(z,z.d_desc),P=function(J){var at;for(f(J,J.dyn_ltree,J.l_desc.max_code),f(J,J.dyn_dtree,J.d_desc.max_code),Ne(J,J.bl_desc),at=_-1;3<=at&&J.bl_tree[2*k[at]+1]===0;at--);return J.opt_len+=3*(at+1)+5+5+4,at}(z),D=z.opt_len+3+7>>>3,(K=z.static_len+3+7>>>3)<=D&&(D=K)):D=K=Q+5,Q+4<=D&&C!==-1?A(z,C,Q,V):z.strategy===4||K===D?(I(z,2+(V?1:0),3),De(z,F,T)):(I(z,4+(V?1:0),3),function(J,at,xt,dt){var ge;for(I(J,at-257,5),I(J,xt-1,5),I(J,dt-4,4),ge=0;ge<dt;ge++)I(J,J.bl_tree[2*k[ge]+1],3);q(J,J.dyn_ltree,at-1),q(J,J.dyn_dtree,xt-1)}(z,z.l_desc.max_code+1,z.d_desc.max_code+1,P+1),De(z,z.dyn_ltree,z.dyn_dtree)),ot(z),V&&pt(z)},n._tr_tally=function(z,C,Q){return z.pending_buf[z.d_buf+2*z.last_lit]=C>>>8&255,z.pending_buf[z.d_buf+2*z.last_lit+1]=255&C,z.pending_buf[z.l_buf+z.last_lit]=255&Q,z.last_lit++,C===0?z.dyn_ltree[2*Q]++:(z.matches++,C--,z.dyn_ltree[2*(p[Q]+y+1)]++,z.dyn_dtree[2*U(C)]++),z.last_lit===z.lit_bufsize-1},n._tr_align=function(z){I(z,2,3),W(z,g,F),function(C){C.bi_valid===16?(et(C,C.bi_buf),C.bi_buf=0,C.bi_valid=0):8<=C.bi_valid&&(C.pending_buf[C.pending++]=255&C.bi_buf,C.bi_buf>>=8,C.bi_valid-=8)}(z)}},{"../utils/common":41}],53:[function(a,l,n){l.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],54:[function(a,l,n){(function(i){(function(u,s){if(!u.setImmediate){var r,h,b,y,m=1,o={},_=!1,v=u.document,x=Object.getPrototypeOf&&Object.getPrototypeOf(u);x=x&&x.setTimeout?x:u,r={}.toString.call(u.process)==="[object process]"?function(S){process.nextTick(function(){d(S)})}:function(){if(u.postMessage&&!u.importScripts){var S=!0,N=u.onmessage;return u.onmessage=function(){S=!1},u.postMessage("","*"),u.onmessage=N,S}}()?(y="setImmediate$"+Math.random()+"$",u.addEventListener?u.addEventListener("message",g,!1):u.attachEvent("onmessage",g),function(S){u.postMessage(y+S,"*")}):u.MessageChannel?((b=new MessageChannel).port1.onmessage=function(S){d(S.data)},function(S){b.port2.postMessage(S)}):v&&"onreadystatechange"in v.createElement("script")?(h=v.documentElement,function(S){var N=v.createElement("script");N.onreadystatechange=function(){d(S),N.onreadystatechange=null,h.removeChild(N),N=null},h.appendChild(N)}):function(S){setTimeout(d,0,S)},x.setImmediate=function(S){typeof S!="function"&&(S=new Function(""+S));for(var N=new Array(arguments.length-1),M=0;M<N.length;M++)N[M]=arguments[M+1];var w={callback:S,args:N};return o[m]=w,r(m),m++},x.clearImmediate=c}function c(S){delete o[S]}function d(S){if(_)setTimeout(d,0,S);else{var N=o[S];if(N){_=!0;try{(function(M){var w=M.callback,j=M.args;switch(j.length){case 0:w();break;case 1:w(j[0]);break;case 2:w(j[0],j[1]);break;case 3:w(j[0],j[1],j[2]);break;default:w.apply(s,j)}})(N)}finally{c(S),_=!1}}}}function g(S){S.source===u&&typeof S.data=="string"&&S.data.indexOf(y)===0&&d(+S.data.slice(y.length))}})(typeof self>"u"?i===void 0?this:i:self)}).call(this,typeof Vn<"u"?Vn:typeof self<"u"?self:typeof window<"u"?window:{})},{}]},{},[10])(10)})})(Bh);var up=Bh.exports;const sp=tr(up);function rp(){const[t,e]=it.useState(!1),[a,l]=it.useState(null),[n,i]=it.useState({16:null,32:null,48:null,180:null,192:null,512:null}),[u,s]=it.useState(!1),[r,h]=it.useState(null),[b,y]=it.useState(!1),m=it.useRef(null);it.useRef(null);const o=it.useCallback((w,j,O)=>new Promise(k=>{const F=document.createElement("canvas");F.width=j,F.height=O;const T=F.getContext("2d");if(!T){k("");return}T.clearRect(0,0,j,O),T.imageSmoothingEnabled=!0,T.imageSmoothingQuality="high";const L=Math.min(j/w.width,O/w.height),p=w.width*L,Z=w.height*L,Y=(j-p)/2,R=(O-Z)/2;T.drawImage(w,Y,R,p,Z);const $=F.toDataURL("image/png");k($)}),[]),_=it.useCallback(async w=>{h(null),s(!0),y(!1);try{const j=new FileReader,O=new Promise((Y,R)=>{j.onload=()=>Y(j.result),j.onerror=R});j.readAsDataURL(w);const k=await O;l(k);const F=new Image;if(await new Promise((Y,R)=>{F.onload=()=>Y(),F.onerror=R}),F.width<16||F.height<16)throw new Error("이미지는 최소 16x16 픽셀 이상이어야 합니다.");const L=[{name:"16",width:16,height:16},{name:"32",width:32,height:32},{name:"48",width:48,height:48},{name:"180",width:180,height:180},{name:"192",width:192,height:192},{name:"512",width:512,height:512}].map(async({name:Y,width:R,height:$})=>{const X=await o(F,R,$);return{name:Y,dataUrl:X}}),p=await Promise.all(L),Z={16:null,32:null,48:null,180:null,192:null,512:null};p.forEach(({name:Y,dataUrl:R})=>{Z[Y]=R}),i(Z),y(!0)}catch(j){h(j instanceof Error?j.message:"이미지 처리 중 오류가 발생했습니다.")}finally{s(!1)}},[o]),v=it.useCallback(w=>{w.preventDefault(),w.stopPropagation(),e(!0)},[]),x=it.useCallback(w=>{w.preventDefault(),w.stopPropagation(),e(!1)},[]),c=it.useCallback(w=>{w.preventDefault(),w.stopPropagation()},[]),d=it.useCallback(async w=>{w.preventDefault(),w.stopPropagation(),e(!1);const j=w.dataTransfer.files;if(j.length===0)return;const O=j[0];if(!O.type.startsWith("image/")){h("이미지 파일만 업로드할 수 있습니다.");return}await _(O)},[_]),g=it.useCallback(async w=>{const j=w.target.files;if(!j||j.length===0)return;const O=j[0];if(!O.type.startsWith("image/")){h("이미지 파일만 업로드할 수 있습니다.");return}await _(O),m.current&&(m.current.value="")},[_]),S=it.useCallback(()=>{m.current&&m.current.click()},[]);it.useCallback(async()=>{const w=[{size:16,data:n[16]},{size:32,data:n[32]},{size:48,data:n[48]}].filter(j=>j.data!==null);if(w.length===0)return null;try{const j=[];for(const T of w){const Z=await(await(await fetch(T.data)).blob()).arrayBuffer();j.push(new Uint8Array(Z))}const F=await(await(await fetch(w[w.length-1].data)).blob()).arrayBuffer();return new Blob([F],{type:"image/x-icon"})}catch(j){return console.error("ICO 생성 실패:",j),null}},[n]);const N=it.useCallback(async()=>{if(b)try{const w=new sp;if(n[48]){const T=await(await fetch(n[48])).blob();w.file("favicon.ico",T,{binary:!0})}if(n[16]){const T=await(await fetch(n[16])).blob();w.file("favicon-16x16.png",T,{binary:!0})}if(n[32]){const T=await(await fetch(n[32])).blob();w.file("favicon-32x32.png",T,{binary:!0})}if(n[180]){const T=await(await fetch(n[180])).blob();w.file("apple-touch-icon.png",T,{binary:!0})}if(n[192]){const T=await(await fetch(n[192])).blob();w.file("android-chrome-192x192.png",T,{binary:!0})}if(n[512]){const T=await(await fetch(n[512])).blob();w.file("android-chrome-512x512.png",T,{binary:!0})}const j=await w.generateAsync({type:"blob"}),O=URL.createObjectURL(j),k=document.createElement("a");k.href=O,k.download=`favicon-${new Date().getTime()}.zip`,document.body.appendChild(k),k.click(),document.body.removeChild(k),URL.revokeObjectURL(O)}catch(w){h("ZIP 파일 생성 중 오류가 발생했습니다. JSZip 라이브러리가 로드되지 않았습니다."),console.error("ZIP 생성 실패:",w)}},[b,n]),M=it.useCallback(()=>{new Date().getTime(),[{name:"favicon.ico",data:n[48]||n[32]||n[16]},{name:"favicon-16x16.png",data:n[16]},{name:"favicon-32x32.png",data:n[32]},{name:"apple-touch-icon.png",data:n[180]},{name:"android-chrome-192x192.png",data:n[192]},{name:"android-chrome-512x512.png",data:n[512]}].forEach(j=>{if(j.data){const O=document.createElement("a");O.href=j.data,O.download=j.name,document.body.appendChild(O),O.click(),document.body.removeChild(O)}})},[n]);return E.jsxs("div",{className:"flex flex-col gap-6",children:[E.jsxs("div",{className:"bg-[#1E293B] border border-slate-700 rounded-lg p-6",children:[E.jsx("h2",{className:"text-xl font-bold text-slate-100 mb-2",children:"파비콘 만들기"}),E.jsxs("p",{className:"text-slate-400 text-sm",children:["이미지를 드래그 앤 드랍하거나 클릭하여 업로드하세요. ",E.jsx("br",{}),"자동으로 다양한 크기의 파비콘 이미지들이 생성됩니다."]})]}),r&&E.jsxs("div",{className:"bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-300",children:[E.jsx("span",{className:"material-symbols-outlined text-red-400 mr-2",children:"error"}),r]}),E.jsxs("div",{className:`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 transition-all ${t?"border-blue-500 bg-blue-900/20":"border-slate-700 bg-[#1E293B]"}`,onDragEnter:v,onDragLeave:x,onDragOver:c,onDrop:d,onClick:S,style:{cursor:"pointer"},children:[E.jsx("input",{type:"file",ref:m,onChange:g,accept:"image/*",className:"hidden"}),u?E.jsxs("div",{className:"flex flex-col items-center gap-4",children:[E.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"}),E.jsx("p",{className:"text-slate-300",children:"이미지 처리 중..."})]}):a?E.jsxs("div",{className:"flex flex-col items-center gap-4",children:[E.jsx("img",{src:a,alt:"Preview",className:"max-w-full max-h-64 object-contain rounded"}),E.jsx("p",{className:"text-slate-300",children:"이미지가 업로드되었습니다."})]}):E.jsxs("div",{className:"flex flex-col items-center gap-4",children:[E.jsx("span",{className:"material-symbols-outlined text-6xl text-slate-500",children:"upload"}),E.jsx("p",{className:"text-slate-400",children:"이미지를 여기에 드래그 앤 드랍하세요"}),E.jsx("p",{className:"text-slate-500 text-sm",children:"또는 클릭하여 파일 선택"})]})]}),b&&E.jsxs("div",{className:"bg-[#1E293B] border border-slate-700 rounded-lg p-6",children:[E.jsx("h3",{className:"text-lg font-semibold text-slate-100 mb-4",children:"생성된 파비콘 미리보기"}),E.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6",children:[E.jsxs("div",{className:"flex flex-col items-center gap-2",children:[E.jsx("span",{className:"text-xs text-slate-400",children:"16x16"}),n[16]&&E.jsx("img",{src:n[16],alt:"16x16",className:"w-8 h-8 object-contain bg-slate-800 rounded p-1"})]}),E.jsxs("div",{className:"flex flex-col items-center gap-2",children:[E.jsx("span",{className:"text-xs text-slate-400",children:"32x32"}),n[32]&&E.jsx("img",{src:n[32],alt:"32x32",className:"w-8 h-8 object-contain bg-slate-800 rounded p-1"})]}),E.jsxs("div",{className:"flex flex-col items-center gap-2",children:[E.jsx("span",{className:"text-xs text-slate-400",children:"48x48"}),n[48]&&E.jsx("img",{src:n[48],alt:"48x48",className:"w-12 h-12 object-contain bg-slate-800 rounded p-1"})]}),E.jsxs("div",{className:"flex flex-col items-center gap-2",children:[E.jsx("span",{className:"text-xs text-slate-400",children:"180x180"}),n[180]&&E.jsx("img",{src:n[180],alt:"180x180",className:"w-16 h-16 object-contain bg-slate-800 rounded p-1"})]}),E.jsxs("div",{className:"flex flex-col items-center gap-2",children:[E.jsx("span",{className:"text-xs text-slate-400",children:"192x192"}),n[192]&&E.jsx("img",{src:n[192],alt:"192x192",className:"w-20 h-20 object-contain bg-slate-800 rounded p-1"})]}),E.jsxs("div",{className:"flex flex-col items-center gap-2",children:[E.jsx("span",{className:"text-xs text-slate-400",children:"512x512"}),n[512]&&E.jsx("img",{src:n[512],alt:"512x512",className:"w-24 h-24 object-contain bg-slate-800 rounded p-1"})]})]}),E.jsxs("div",{className:"flex gap-3",children:[E.jsxs("button",{onClick:N,className:"flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition",children:[E.jsx("span",{className:"material-symbols-outlined",children:"download"}),E.jsx("span",{children:"모두 ZIP으로 다운로드"})]}),E.jsxs("button",{onClick:M,className:"flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition",children:[E.jsx("span",{className:"material-symbols-outlined",children:"file_download"}),E.jsx("span",{children:"개별 파일 다운로드"})]})]})]}),a&&!b&&!u&&E.jsxs("div",{className:"bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 text-yellow-300",children:[E.jsx("span",{className:"material-symbols-outlined text-yellow-400 mr-2",children:"info"}),"이미지가 업로드되었지만, 파비콘 생성이 완료되지 않았습니다."]})]})}function cp(){const[t,e]=it.useState("clients"),[a,l]=it.useState("ALL"),{clients:n,logs:i,setLogs:u,loadClients:s,loadLogs:r,executeClearLogs:h,executePurgeClient:b}=q1(),y=it.useCallback(()=>{s(),r()},[s,r]),{wsStatus:m,dispatchCommand:o}=V1(u,y),_=v=>{l(v),e("console")};return E.jsxs(P1,{wsStatus:m,clientCount:n.length,activeTab:t,onSelectTab:e,onRefresh:()=>{s(),r()},onClearLogs:h,children:[t==="clients"&&E.jsx(lp,{clients:n,logs:i,logCount:i.length,onSelectTarget:_,onPurgeClient:b}),t==="console"&&E.jsx(np,{targetId:a,setTargetId:l,onDispatch:o}),t==="logs"&&E.jsx(ip,{logs:i,onClearLogs:h}),t==="favicon"&&E.jsx(rp,{})]})}k1.createRoot(document.getElementById("root")).render(E.jsx(nm.StrictMode,{children:E.jsx(cp,{})}));
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

## admin/src/components/modals/DomDataModal.tsx

```tsx
import { CrawlLog } from '../../types/index.js';

interface DomDataModalProps {
  isOpen: boolean;
  clientId: string;
  log: CrawlLog | null;
  onClose: () => void;
}

interface ParsedDomPayload {
  url?: string;
  title?: string;
  fullDom?: string;
  links?: string[];
  timestamp?: number;
  [key: string]: unknown;
}

export function DomDataModal({ isOpen, clientId, log, onClose }: DomDataModalProps) {
  if (!isOpen || !log) return null;

  let parsedPayload: ParsedDomPayload = {};
  try {
    parsedPayload = typeof log.log_message === 'string' 
      ? JSON.parse(log.log_message) 
      : log.log_message;
  } catch {
    parsedPayload = { fullDom: log.log_message };
  }

  const fullDomText = parsedPayload.fullDom || JSON.stringify(parsedPayload, null, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-text">
      <div className="bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* 모달 헤더 */}
        <div className="px-6 py-4 bg-[#111827] border-b border-slate-800 flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400">code_blocks</span>
            <h3 className="font-bold text-sm text-slate-100">
              수신받은 DOM 데이터 내용 [<span className="text-blue-300 font-mono">{clientId}</span>]
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* 모달 본문 정보 */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4 font-sans text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#111827] p-4 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-500 font-semibold block mb-1">페이지 제목</span>
              <span className="text-slate-200 font-medium">{parsedPayload.title || '제목 없음'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block mb-1">수신 URL</span>
              <a
                href={parsedPayload.url || '#'}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline truncate block"
              >
                {parsedPayload.url || 'N/A'}
              </a>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block mb-1">수신 타임스탬프</span>
              <span className="text-slate-300 font-mono">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block mb-1">데이터 크기</span>
              <span className="text-emerald-400 font-mono">
                {(fullDomText.length / 1024).toFixed(2)} KB
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 select-none">
              <span className="font-bold text-slate-300 text-xs">페이지 전체 DOM 원본 (HTML Source)</span>
              <button
                onClick={() => navigator.clipboard.writeText(fullDomText)}
                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded transition border border-slate-700 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">content_copy</span>
                클립보드 복사
              </button>
            </div>
            <pre className="bg-[#0F172A] p-4 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-[400px] whitespace-pre-wrap break-all select-text leading-relaxed">
              {fullDomText}
            </pre>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="px-6 py-3 bg-[#111827] border-t border-slate-800 flex justify-end select-none">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-4 py-2 rounded-lg transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## admin/src/components/tables/GcpClientsTable.tsx

```tsx
import { Client, CrawlLog } from '../../types/index.js';

interface GcpClientsTableProps {
  clients: Client[];
  logs: CrawlLog[];
  onSelectTarget: (clientId: string) => void;
  onPurgeClient: (clientId: string) => void;
  onOpenDomModal: (clientId: string, log: CrawlLog) => void;
}

export function GcpClientsTable({
  clients,
  logs,
  onSelectTarget,
  onPurgeClient,
  onOpenDomModal
}: GcpClientsTableProps) {
  const getLatestLogForClient = (clientId: string): CrawlLog | undefined => {
    return logs.find((l) => l.client_id === clientId);
  };

  // 안전한 ISO 문자열 / 타침스탬프 날짜 변환 함수
  const formatConnectedDate = (dateStr: string): string => {
    if (!dateStr) return 'N/A';
    const parsedNum = Number(dateStr);
    const date = isNaN(parsedNum) ? new Date(dateStr) : new Date(parsedNum);
    return isNaN(date.getTime()) ? '알 수 없는 시각' : date.toLocaleString();
  };

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
              <th className="p-3">수신 데이터 알림</th>
              <th className="p-3">최초 등록/연결 시간</th>
              <th className="p-3 text-right">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-gray-200 font-mono">
            {clients.map((client) => {
              const latestLog = getLatestLogForClient(client.client_id);
              const isOnline = !!client.is_online;

              return (
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

                  {/* 실시간 연결 여부 상태 배지 */}
                  <td className="p-3 font-sans">
                    {isOnline ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-900/40 text-emerald-300 text-[11px] px-2 py-0.5 rounded border border-emerald-700/40 font-semibold">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        연결됨 (온라인)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-400 text-[11px] px-2 py-0.5 rounded border border-slate-700">
                        <span className="h-2 w-2 rounded-full bg-slate-500"></span>
                        연결 끊김 (과거 기록)
                      </span>
                    )}
                  </td>

                  {/* 수신받은 데이터 알림 버튼 */}
                  <td className="p-3">
                    {latestLog ? (
                      <button
                        onClick={() => onOpenDomModal(client.client_id, latestLog)}
                        className="inline-flex items-center gap-1.5 bg-[#1A73E8] hover:bg-[#185abc] text-white text-[11px] font-sans font-semibold px-2.5 py-1 rounded transition shadow-sm cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">notifications_active</span>
                        수신받은 데이터 보기
                      </button>
                    ) : (
                      <span className="text-slate-500 text-[11px] font-sans">수신 데이터 없음</span>
                    )}
                  </td>

                  {/* 수정된 정상 날짜 파싱 출력 */}
                  <td className="p-3 text-slate-400 text-[12px]">
                    {formatConnectedDate(client.connected_at)}
                  </td>

                  <td className="p-3 text-right font-sans">
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
                        title="DB에서 삭제 및 영구 추방"
                      >
                        Purge
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {clients.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">
            등록된 수집 노드 인스턴스가 없습니다.
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
import { useState } from 'react';
import { Client, CrawlLog } from '../../types/index.js';
import { MetricCardsGroup } from '../metrics/MetricCardsGroup.js';
import { GcpClientsTable } from '../tables/GcpClientsTable.js';
import { DomDataModal } from '../modals/DomDataModal.js';

interface GcpClientsViewProps {
  clients: Client[];
  logs: CrawlLog[];
  logCount: number;
  onSelectTarget: (clientId: string) => void;
  onPurgeClient: (clientId: string) => void;
}

export function GcpClientsView({
  clients,
  logs,
  logCount,
  onSelectTarget,
  onPurgeClient
}: GcpClientsViewProps) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    clientId: string;
    log: CrawlLog | null;
  }>({
    isOpen: false,
    clientId: '',
    log: null
  });

  const handleOpenDomModal = (clientId: string, log: CrawlLog) => {
    setModalState({
      isOpen: true,
      clientId,
      log
    });
  };

  const handleCloseDomModal = () => {
    setModalState({
      isOpen: false,
      clientId: '',
      log: null
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <MetricCardsGroup clientCount={clients.length} logCount={logCount} />
      <GcpClientsTable
        clients={clients}
        logs={logs}
        onSelectTarget={onSelectTarget}
        onPurgeClient={onPurgeClient}
        onOpenDomModal={handleOpenDomModal}
      />
      <DomDataModal
        isOpen={modalState.isOpen}
        clientId={modalState.clientId}
        log={modalState.log}
        onClose={handleCloseDomModal}
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

## plugins/basic-plugin/src/components/Footer.tsx

```tsx
// plugins/basic-plugin/src/components/Footer.tsx

import { PLUGIN_CONFIG } from '../config/pluginConfig';

interface FooterProps {
  clientId: string;
}

export function Footer({ clientId }: FooterProps) {
  return (
    <div className="popup-footer">
      <div className="footer-item">
        <span className="footer-label">노드 ID:</span>
        <span className="footer-value font-mono text-[10px]">{clientId}</span>
      </div>
      <div className="footer-item">
        <span className="footer-label">포트:</span>
        <span className="footer-value font-mono">{PLUGIN_CONFIG.server.port}</span>
      </div>
    </div>
  );
}
```

---

## plugins/basic-plugin/src/components/Header.tsx

```tsx
// plugins/basic-plugin/src/components/Header.tsx

export function Header() {
  return (
    <div className="popup-header">
      <div className="popup-title-row">
        <span className="material-symbols-outlined text-[#38bdf8] text-xl">
          download_for_offline
        </span>
        <span className="popup-title">WebCrawlServer basic</span>
      </div>
    </div>
  );
}
```

---

## plugins/basic-plugin/src/components/TabBar.tsx

```tsx
// plugins/basic-plugin/src/components/TabBar.tsx

import { TabType } from '../types';

interface TabBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export function TabBar({ activeTab, onSelectTab }: TabBarProps) {
  return (
    <div className="tab-bar">
      <button
        onClick={() => onSelectTab('basic')}
        className={`tab-item ${activeTab === 'basic' ? 'active' : ''}`}
      >
        기본
      </button>
      <button
        onClick={() => onSelectTab('info')}
        className={`tab-item ${activeTab === 'info' ? 'active' : ''}`}
      >
        정보
      </button>
      <button
        onClick={() => onSelectTab('debug')}
        className={`tab-item ${activeTab === 'debug' ? 'active' : ''}`}
      >
        디버깅
      </button>
    </div>
  );
}
```

---

## plugins/basic-plugin/src/config/pluginConfig.ts

```typescript
// plugins/basic-plugin/src/config/pluginConfig.ts

/**
 * 빌드 시점에 자바스크립트 리터럴로 직접 치환되는 플러그인 설정 상수 객체입니다.
 */
export const PLUGIN_CONFIG = {
  popup: {
    width: typeof __POPUP_WIDTH__ !== "undefined" ? __POPUP_WIDTH__ : 360,
    height: typeof __POPUP_HEIGHT__ !== "undefined" ? __POPUP_HEIGHT__ : 480,
    minWidth:
      typeof __POPUP_MIN_WIDTH__ !== "undefined" ? __POPUP_MIN_WIDTH__ : 320,
    minHeight:
      typeof __POPUP_MIN_HEIGHT__ !== "undefined" ? __POPUP_MIN_HEIGHT__ : 420,
    maxWidth:
      typeof __POPUP_MAX_WIDTH__ !== "undefined" ? __POPUP_MAX_WIDTH__ : 600,
    maxHeight:
      typeof __POPUP_MAX_HEIGHT__ !== "undefined" ? __POPUP_MAX_HEIGHT__ : 700,
  },
  server: {
    host:
      typeof __SERVER_HOST__ !== "undefined" ? __SERVER_HOST__ : "localhost",
    port: typeof __SERVER_PORT__ !== "undefined" ? __SERVER_PORT__ : 9600,
  },
} as const;

/**
 * 설정된 호스트와 포트로 WebSocket 접속 URL을 생성합니다.
 */
export function getWebSocketUrl(clientId: string): string {
  const { host, port } = PLUGIN_CONFIG.server;
  return `ws://${host}:${port}?clientId=${clientId}&clientType=plugin`;
}
```

---

## plugins/basic-plugin/src/hooks/usePopupState.ts

```typescript
// plugins/basic-plugin/src/hooks/usePopupState.ts

import { useState, useEffect, useCallback } from "react";
import { TabType, BrowserInfo, ProcessorInfo } from "../types";
import {
  fetchSocketStatus,
  fetchCurrentTabUrl,
  requestCollectFullDom,
  sendDebugMessage,
  extractBrowserInfo,
  extractProcessorInfo,
} from "../services/chromeService";

export function usePopupState() {
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [clientId, setClientId] = useState<string>("조회 중...");
  const [currentUrl, setCurrentUrl] = useState<string>("조회 중...");
  const [isServerOnline, setIsServerOnline] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);

  const [debugMessage, setDebugMessage] = useState<string>(
    JSON.stringify({ action: "DEBUG_TEST", payload: { test: true } }, null, 2),
  );
  const [debugStatus, setDebugStatus] = useState<string>("");

  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [processorInfo, setProcessorInfo] = useState<ProcessorInfo | null>(
    null,
  );

  const checkSocketStatus = useCallback(async () => {
    const res = await fetchSocketStatus();
    setIsServerOnline(res.connected);
    if (res.clientId) {
      setClientId(res.clientId);
    } else if (!res.connected) {
      setClientId("미발급 (서버 미연결)");
    }
  }, []);

  useEffect(() => {
    fetchCurrentTabUrl().then(setCurrentUrl);
    checkSocketStatus();
    setBrowserInfo(extractBrowserInfo());
    setProcessorInfo(extractProcessorInfo());
  }, [checkSocketStatus]);

  const handleSendFullDom = useCallback(async () => {
    setIsSending(true);
    setStatusMessage("페이지 DOM 수집 중...");

    const res = await requestCollectFullDom();
    setStatusMessage(res.message);
    setIsSending(false);

    await checkSocketStatus();
  }, [checkSocketStatus]);

  const handleSendDebugMessage = useCallback(async () => {
    try {
      const parsed = JSON.parse(debugMessage);
      setDebugStatus("메시지 전송 중...");

      const res = await sendDebugMessage(parsed);
      setDebugStatus(res.message);
      setIsServerOnline(res.success);
    } catch {
      setDebugStatus("오류: 올바른 JSON 포맷이 아닙니다.");
    }
  }, [debugMessage]);

  return {
    activeTab,
    setActiveTab,
    clientId,
    currentUrl,
    isServerOnline,
    statusMessage,
    isSending,
    debugMessage,
    setDebugMessage,
    debugStatus,
    browserInfo,
    processorInfo,
    handleSendFullDom,
    handleSendDebugMessage,
  };
}
```

---

## plugins/basic-plugin/src/services/chromeService.ts

```typescript
// plugins/basic-plugin/src/services/chromeService.ts

import { BrowserInfo, ProcessorInfo, SocketStatusResponse } from "../types";

export function fetchSocketStatus(): Promise<SocketStatusResponse> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "GET_SOCKET_STATUS" }, (response) => {
      if (chrome.runtime.lastError || !response) {
        resolve({ connected: false });
      } else {
        resolve(response);
      }
    });
  });
}

export function fetchCurrentTabUrl(): Promise<string> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab && activeTab.url) {
        resolve(activeTab.url);
      } else {
        resolve("URL 인출 불가");
      }
    });
  });
}

export function requestCollectFullDom(): Promise<{
  success: boolean;
  message: string;
}> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.id) {
        resolve({ success: false, message: "활성화된 탭을 찾을 수 없습니다." });
        return;
      }

      chrome.tabs.sendMessage(
        activeTab.id,
        { command: "COLLECT_FULL_DOM" },
        (response) => {
          if (chrome.runtime.lastError) {
            resolve({
              success: false,
              message: "페이지 스크립트 미연결 (페이지 새로고침 후 재시도)",
            });
            return;
          }

          if (response && response.success) {
            resolve({
              success: true,
              message: "페이지 DOM을 서버로 성공적으로 전송했습니다.",
            });
          } else {
            resolve({ success: true, message: "DOM 수집 처리 완료" });
          }
        },
      );
    });
  });
}

export function sendDebugMessage(
  parsedJson: unknown,
): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        type: "RAW_DOM_DATA",
        data: {
          debugMessage: parsedJson,
          timestamp: Date.now(),
        },
      },
      (res) => {
        if (chrome.runtime.lastError) {
          resolve({
            success: false,
            message: "전송 실패: 백그라운드 서비스 워커 오프라인",
          });
        } else if (res && !res.success) {
          resolve({
            success: false,
            message: "전송 실패: 서버 소켓 미연결 상태입니다.",
          });
        } else {
          resolve({
            success: true,
            message: "메시지가 성공적으로 서버로 송출되었습니다.",
          });
        }
      },
    );
  });
}

export function extractBrowserInfo(): BrowserInfo {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform || "알 수 없음",
    vendor: navigator.vendor || "알 수 없음",
    cookieEnabled: navigator.cookieEnabled,
    onlineStatus: navigator.onLine,
  };
}

export function extractProcessorInfo(): ProcessorInfo {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return {
    hardwareConcurrency: navigator.hardwareConcurrency || 1,
    deviceMemory: nav.deviceMemory,
    maxTouchPoints: navigator.maxTouchPoints || 0,
  };
}
```

---

## plugins/basic-plugin/src/types/env.d.ts

```typescript
// plugins/basic-plugin/src/types/env.d.ts

/**
 * ============================================================================
 * Vite 빌드 타임 전역 상수 선언 파일 (Type Declarations)
 * ============================================================================
 *
 * [동작 원리]
 * 본 파일에 선언된 전역 변수들은 런타임에 동적으로 변경되는 값이 아닙니다.
 * `vite.config.ts`의 `define` 설정에 의해 `npm run build` 시점에 Node.js 환경변수
 * (`process.env.POPUP_WIDTH` 등)를 읽어 자바스크립트 코드 내에 리터럴 값으로 직접 치환(Replace)됩니다.
 *
 * TypeScript 컴파일러가 이 전역 상수를 인식하고 타입 에러를 발생시키지 않도록
 * 본 선언 파일(`env.d.ts`)에서 전역 타입 식별자로 등록합니다.
 */

/**
 * 팝업 창의 초기 기본 가로 너비
 * - 타입: `number`
 * - 단위: 픽셀 (px)
 * - 빌드 주입 출처: `process.env.POPUP_WIDTH`
 * - 기본값: `360`
 * - 활용 위치: `popup.tsx` -> 팝업 컨테이너의 initial width 스타일
 */
declare const __POPUP_WIDTH__: number;

/**
 * 팝업 창의 초기 기본 세로 높이
 * - 타입: `number`
 * - 단위: 픽셀 (px)
 * - 빌드 주입 출처: `process.env.POPUP_HEIGHT`
 * - 기본값: `480`
 * - 활용 위치: `popup.tsx` -> 팝업 컨테이너의 initial height 스타일
 */
declare const __POPUP_HEIGHT__: number;

/**
 * 팝업 창을 마우스 드래그로 리사이즈할 때 축소 가능한 최소 가로 너비
 * - 타입: `number`
 * - 단위: 픽셀 (px)
 * - 빌드 주입 출처: `process.env.POPUP_MIN_WIDTH`
 * - 기본값: `320`
 * - 활용 위치: `popup.tsx` -> 팝업 컨테이너의 minWidth 스타일
 */
declare const __POPUP_MIN_WIDTH__: number;

/**
 * 팝업 창을 마우스 드래그로 리사이즈할 때 축소 가능한 최소 세로 높이
 * - 타입: `number`
 * - 단위: 픽셀 (px)
 * - 빌드 주입 출처: `process.env.POPUP_MIN_HEIGHT`
 * - 기본값: `420`
 * - 활용 위치: `popup.tsx` -> 팝업 컨테이너의 minHeight 스타일
 */
declare const __POPUP_MIN_HEIGHT__: number;

/**
 * 팝업 창을 마우스 드래그로 리사이즈할 때 확장 가능한 최대 가로 너비
 * - 타입: `number`
 * - 단위: 픽셀 (px)
 * - 빌드 주입 출처: `process.env.POPUP_MAX_WIDTH`
 * - 기본값: `600`
 * - 활용 위치: `popup.tsx` -> 팝업 컨테이너의 maxWidth 스타일
 */
declare const __POPUP_MAX_WIDTH__: number;

/**
 * 팝업 창을 마우스 드래그로 리사이즈할 때 확장 가능한 최대 세로 높이
 * - 타입: `number`
 * - 단위: 픽셀 (px)
 * - 빌드 주입 출처: `process.env.POPUP_MAX_HEIGHT`
 * - 기본값: `700`
 * - 활용 위치: `popup.tsx` -> 팝업 컨테이너의 maxHeight 스타일
 */
declare const __POPUP_MAX_HEIGHT__: number;

/**
 * 백엔드 WebCrawlServer가 가동 중인 호스트 주소 또는 IP
 * - 타입: `string`
 * - 예시: `"localhost"`, `"127.0.0.1"`, `"192.168.0.10"`
 * - 빌드 주입 출처: `process.env.SERVER_HOST`
 * - 기본값: `"localhost"`
 * - 활용 위치: `src/config/pluginConfig.ts` -> WebSocket 접속 URL 구성
 */
declare const __SERVER_HOST__: string;

/**
 * 백엔드 WebCrawlServer의 WebSocket 및 HTTP 통합 서비스 포트 번호
 * - 타입: `number`
 * - 단위: 포트 번호
 * - 빌드 주입 출처: `process.env.SERVER_PORT`
 * - 기본값: `9600`
 * - 활용 위치: `src/config/pluginConfig.ts`, `Footer.tsx` -> 하단 포트 번호 표출
 */
declare const __SERVER_PORT__: number;
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

---

## plugins/basic-plugin/src/components/tabs/BasicTab.tsx

```tsx
// plugins/basic-plugin/src/components/tabs/BasicTab.tsx

interface BasicTabProps {
  isServerOnline: boolean;
  currentUrl: string;
  isSending: boolean;
  statusMessage: string;
  onSendFullDom: () => void;
}

export function BasicTab({
  isServerOnline,
  currentUrl,
  isSending,
  statusMessage,
  onSendFullDom
}: BasicTabProps) {
  return (
    <div className="tab-content">
      {/* 서버 연동 상태 안내 카드 */}
      <div className={`status-card ${isServerOnline ? 'online' : 'offline'}`}>
        <span className={`status-dot ${isServerOnline ? 'online' : 'offline'}`}></span>
        <span>
          {isServerOnline
            ? '서버 온라인 - WebSocket 연결됨'
            : '서버 오프라인 - WebCrawlServer 실행 필요'}
        </span>
      </div>

      {/* 현재 페이지 URL 표시 카드 */}
      <div className="url-card">
        <span className="url-label">현재 페이지 URL</span>
        <div className="url-value truncate">{currentUrl}</div>
      </div>

      {/* 메인 DOM 수집 및 전송 버튼 */}
      <button
        onClick={onSendFullDom}
        disabled={isSending || !isServerOnline}
        className="send-button"
      >
        <span className={`material-symbols-outlined text-base ${isSending ? 'animate-spin' : ''}`}>
          {isSending ? 'sync' : 'upload_file'}
        </span>
        <span>{isSending ? '전송 중...' : 'WebCrawlServer로 전송'}</span>
      </button>

      {/* 처리 상태 안내 메시지 */}
      {statusMessage && (
        <div className="text-[11px] text-center text-sky-300 bg-[#162032] p-2 rounded-lg border border-slate-700/60">
          {statusMessage}
        </div>
      )}
    </div>
  );
}
```

---

## plugins/basic-plugin/src/components/tabs/DebugTab.tsx

```tsx
// plugins/basic-plugin/src/components/tabs/DebugTab.tsx

interface DebugTabProps {
  debugMessage: string;
  debugStatus: string;
  onChangeDebugMessage: (val: string) => void;
  onSendDebugMessage: () => void;
}

export function DebugTab({
  debugMessage,
  debugStatus,
  onChangeDebugMessage,
  onSendDebugMessage
}: DebugTabProps) {
  return (
    <div className="tab-content">
      <div className="debug-card">
        <span className="debug-label">서버에 보낼 메시지 (JSON 포맷)</span>
        <textarea
          value={debugMessage}
          onChange={(e) => onChangeDebugMessage(e.target.value)}
          rows={6}
          className="debug-textarea font-mono"
          placeholder="서버로 전달할 JSON 객체를 입력하세요"
        />
        <button onClick={onSendDebugMessage} className="send-button mt-1">
          <span className="material-symbols-outlined text-base">send</span>
          <span>보내기</span>
        </button>
        {debugStatus && (
          <div className="text-[11px] text-sky-300 bg-[#0d131f] p-2 rounded border border-slate-700 break-all">
            {debugStatus}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## plugins/basic-plugin/src/components/tabs/InfoTab.tsx

```tsx
// plugins/basic-plugin/src/components/tabs/InfoTab.tsx

import { BrowserInfo, ProcessorInfo } from '../../types';

interface InfoTabProps {
  browserInfo: BrowserInfo | null;
  processorInfo: ProcessorInfo | null;
}

export function InfoTab({ browserInfo, processorInfo }: InfoTabProps) {
  return (
    <div className="tab-content">
      <div className="info-section">
        <div className="info-section-title">
          <span className="material-symbols-outlined text-sm text-sky-400">browser_updated</span>
          <span>브라우저 정보</span>
        </div>
        {browserInfo ? (
          <div className="info-grid">
            <div className="info-row">
              <span className="info-key">플랫폼</span>
              <span className="info-value">{browserInfo.platform}</span>
            </div>
            <div className="info-row">
              <span className="info-key">언어</span>
              <span className="info-value">{browserInfo.language}</span>
            </div>
            <div className="info-row">
              <span className="info-key">벤더</span>
              <span className="info-value">{browserInfo.vendor}</span>
            </div>
            <div className="info-row">
              <span className="info-key">네트워크 상태</span>
              <span className="info-value">
                {browserInfo.onlineStatus ? '온라인 (Online)' : '오프라인 (Offline)'}
              </span>
            </div>
            <div className="info-row flex-col items-start gap-1">
              <span className="info-key">User-Agent</span>
              <span className="info-value-block font-mono text-[10px] break-all">
                {browserInfo.userAgent}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400">정보 인출 중...</div>
        )}
      </div>

      <div className="info-section">
        <div className="info-section-title">
          <span className="material-symbols-outlined text-sm text-emerald-400">memory</span>
          <span>브라우저 프로세서 정보</span>
        </div>
        {processorInfo ? (
          <div className="info-grid">
            <div className="info-row">
              <span className="info-key">논리 CPU 코어 수</span>
              <span className="info-value font-mono">{processorInfo.hardwareConcurrency} 코어</span>
            </div>
            {processorInfo.deviceMemory && (
              <div className="info-row">
                <span className="info-key">디바이스 메모리</span>
                <span className="info-value font-mono">약 {processorInfo.deviceMemory} GB</span>
              </div>
            )}
            <div className="info-row">
              <span className="info-key">최대 터치 포인트</span>
              <span className="info-value font-mono">{processorInfo.maxTouchPoints} 개</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400">정보 인출 중...</div>
        )}
      </div>
    </div>
  );
}
```

