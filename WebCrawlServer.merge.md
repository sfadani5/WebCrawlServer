# Merged: WebCrawlServer

> **참고(보류)**: 이 병합 문서에 포함된 `Git`/`GitHub` 관련 내용은 문서 보관 목적이며, 자동화 구현 우선순위에서는 제외됩니다.

> 생성일시: 2026-08-07 14:04:13
> 원본: WebCrawlServer.tree.f.md
> 성공: 80
> 건너뜀: 0
> 오류: 0

---

---

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
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "eslint": "^10.8.0",
    "jiti": "^2.4.2",
    "postcss": "^8.5.1",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.2",
    "typescript-eslint": "^8.22.0",
    "vite": "^5.4.14"
  },
  "dependencies": {
    "@types/chrome": "^0.2.5"
  }
}
```

---

## replit.nix

```nix
{pkgs}: {
  deps = [
    pkgs.python3
  ];
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
  <body class="bg-gray-900 text-white font-sans">
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
// admin/src/App.tsx

import { useState, useCallback, useEffect } from 'react';
import { useAdminDbApi } from './hooks/useAdminDbApi.js';
import { useAdminSocket } from './hooks/useAdminSocket.js';
import { GcpMainLayout } from './components/layout/GcpMainLayout.js';
import { GcpClientsView } from './components/views/GcpClientsView.js';
import { GcpControlConsoleView } from './components/views/GcpControlConsoleView.js';
import { GcpCrawlLogsView } from './components/views/GcpCrawlLogsView.js';
import { WorkerManagerView } from './components/views/WorkerManagerView.js';
import { FaviconGeneratorView } from './components/views/FaviconGeneratorView.js';
import { ActiveTab } from './types/index.js';

/**
 * 관리자 대시보드 최상위 조율 엔트리 컴포넌트입니다.
 * 탭 라우팅, 데이터 로딩, 웹소켓 연결, 워커 관리 등 전체 상태를 통합 조율합니다.
 */
export default function App() {
  /** 현재 활성화된 메인 탭 상태 */
  const [activeTab, setActiveTab] = useState<ActiveTab>('clients');
  /** 원격 지시 콘솔의 타깃 노드 ID 상태 */
  const [targetId, setTargetId] = useState<string>('ALL');

  // REST API 통신 및 데이터 상태 관리 훅
  const {
    clients,
    workers,
    logs,
    setLogs,
    loadClients,
    loadWorkers,
    loadLogs,
    executeClearLogs,
    executePurgeClient,
    executePurgeOfflineClients,
    executeUpdateClientConfig,
    executeCreateWorker
  } = useAdminDbApi();

  // 최초 진입 시 전체 데이터 일괄 로딩
  useEffect(() => {
    loadClients();
    loadWorkers();
    loadLogs();
  }, [loadClients, loadWorkers, loadLogs]);

  /**
   * 웹소켓 재연결 시 데이터 일괄 갱신 콜백
   */
  const handleConnect = useCallback(() => {
    loadClients();
    loadWorkers();
    loadLogs();
  }, [loadClients, loadWorkers, loadLogs]);

  // 관리자 웹소켓 연결 훅 (실시간 로그 수신 및 커맨드 전송)
  const { wsStatus, dispatchCommand } = useAdminSocket(setLogs, handleConnect);

  /**
   * 수집 노드를 원격 지시 콘솔의 타깃으로 선택하고 콘솔 탭으로 이동합니다.
   *
   * @param clientId - 선택할 노드 UUID
   */
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
        loadWorkers();
        loadLogs();
      }}
      onClearLogs={executeClearLogs}
    >
      {/* [탭 1] 수집 노드 관리 */}
      {activeTab === 'clients' && (
        <GcpClientsView
          clients={clients}
          workers={workers}
          logs={logs}
          logCount={logs.length}
          onSelectTarget={handleSelectTarget}
          onPurgeClient={executePurgeClient}
          onPurgeOfflineClients={executePurgeOfflineClients}
          onSaveNodeConfig={executeUpdateClientConfig}
        />
      )}

      {/* [탭 2] 워커 & DB 매니저 */}
      {activeTab === 'workers' && (
        <WorkerManagerView
          workers={workers}
          onCreateWorker={executeCreateWorker}
        />
      )}

      {/* [탭 3] 원격 지시 콘솔 */}
      {activeTab === 'console' && (
        <GcpControlConsoleView
          targetId={targetId}
          setTargetId={setTargetId}
          onDispatch={dispatchCommand}
        />
      )}

      {/* [탭 4] 수집 로그 */}
      {activeTab === 'logs' && (
        <GcpCrawlLogsView logs={logs} onClearLogs={executeClearLogs} />
      )}

      {/* [탭 5] 파비콘 생성기 */}
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

## plugins/basic-plugin/offscreen.html

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>WebCrawlServer Offscreen Engine</title>
  </head>
  <body>
    <!-- 24시간 무중단 백그라운드 웹소켓 전담 엔진 스크립트 -->
    <script type="module" src="./src/offscreen.ts"></script>
  </body>
</html>
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

## plugins/basic-plugin/sidepanel.html

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WebCrawlServer 사이드바 대시보드</title>
    <!-- Material Symbols Outlined 아이콘 CDN -->
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0"
    />
    <!-- Noto Sans KR 한글 폰트 CDN -->
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap"
    />
  </head>
  <body>
    <div id="root"></div>
    <!-- 상대 경로로 소스 지정 (Vite가 빌드 시 sidepanel.js 로 자동 전환) -->
    <script type="module" src="./src/sidepanel.tsx"></script>
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
    "types": ["chrome"],
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

/**
 * 브라우저 확장 플러그인 Vite 번들링 설정입니다.
 * HTML 엔트리 포인트(sidepanel, offscreen)를 루트로 이관하여 Vite가 TSX/TS 파일을 JS로 정상 치환하도록 합니다.
 */
export default defineConfig({
  plugins: [react()],
  define: {
    // 서버 호스트/포트 빌드 타임 리터럴 상수 주입
    __SERVER_HOST__: JSON.stringify(process.env.SERVER_HOST || "localhost"),
    __SERVER_PORT__: Number(process.env.SERVER_PORT || 9600),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // 프로젝트 루트의 HTML 엔트리 지정 (Vite HTML 번들링 변환 단행)
        sidepanel: resolve(__dirname, "sidepanel.html"),
        offscreen: resolve(__dirname, "offscreen.html"),
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

## server/src/database.ts

```typescript
// server/src/database.ts

import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { existsSync, mkdirSync } from "node:fs";

/** 클라이언트 DB 기록 구조체 */
export interface ClientRecord {
  /** 클라이언트 고유 UUID */
  client_id: string;
  /** 클라이언트 구분 타입 (plugin | admin) */
  client_type: string;
  /** 노드 한글 별칭 */
  alias?: string;
  /** 담당 수집 워커 ID */
  assigned_worker_id?: string;
  /** 노드 전용 물리 저장 경로 */
  custom_storage_path?: string;
  /** 최초 연결 시각 (ISO 문자열) */
  connected_at: string;
}

/** 크롤링 수집 로그 DB 기록 구조체 */
export interface CrawlLogRecord {
  /** 레코드 PK ID */
  id: number;
  /** 수집 노드 UUID */
  client_id: string;
  /** 수집 도메인 */
  domain?: string;
  /** 액션 구분 */
  action?: string;
  /** 담당 워커명 */
  worker_name?: string;
  /** 수집 URL */
  url?: string;
  /** 페이지 타이틀 */
  title?: string;
  /** 물리 파일 저장 경로 */
  file_path?: string;
  /** 파일 크기 (Bytes) */
  file_size?: number;
  /** 직렬화된 로그 메시지 바디 */
  log_message: string;
  /** 수집 시점 타임스탬프 */
  timestamp: number;
}

/** 커스텀 스키마 필드 정의 구조체 */
export interface CustomFieldDef {
  /** 필드 영문 식별자 */
  name: string;
  /** SQLite 필드 데이터 타입 */
  type: "TEXT" | "INTEGER" | "REAL" | "BLOB";
  /** 필수 필드 여부 */
  required?: boolean;
}

/** 워커 DB 기록 구조체 */
export interface WorkerRecord {
  /** 워커 고유 ID */
  worker_id: string;
  /** 워커 한글 이름 */
  worker_name: string;
  /** 대상 DB 파일 상대 경로 */
  db_file_path: string;
  /** 대상 테이블 이름 */
  table_name: string;
  /** 워커 전용 파일 저장소 루트 경로 */
  storage_root_path: string;
  /** 직렬화된 커스텀 스키마 JSON 문자열 */
  schema_json: string;
  /** 기본 워커 여부 (1 또는 0) */
  is_default: number;
  /** 워커 생성 시각 */
  created_at: string;
}

/** 워커 생성 파라미터 구조체 */
export interface CreateWorkerParams {
  /** 워커 고유 ID (영문 식별자) */
  workerId: string;
  /** 워커 한글 이름 */
  workerName: string;
  /** 바인딩 DB 파일명 */
  dbFileName: string;
  /** 타깃 테이블명 */
  tableName: string;
  /** 파일 저장소 루트 경로 */
  storageRootPath: string;
  /** 커스텀 스키마 필드 정의 배열 */
  customFields: CustomFieldDef[];
  /** 기본 워커 지정 여부 */
  isDefault?: boolean;
}

// ESM 환경에서 __dirname 대체 경로 계산
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 최상위 databases 및 databases/workers 경로 계산
const databasesDir = resolve(__dirname, "..", "..", "databases");
const workersDbDir = resolve(databasesDir, "workers");

// workers 서브 디렉터리 없을 경우 자동 생성
if (!existsSync(workersDbDir)) {
  mkdirSync(workersDbDir, { recursive: true });
}

// 메인 DB 경로 및 인스턴스 초기화
const mainDbPath = resolve(databasesDir, "data.db");
const db = new Database(mainDbPath);

// SQLite 고성능 및 무결성 PRAGMA 설정
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

/**
 * 프로젝트 구동에 필수적인 메인 시스템 DB 스키마 및 디폴트 워커를 초기 구성합니다.
 * 백엔드 진입 시 즉시 1회 자동 호출됩니다.
 */
export function initializeDatabase(): void {
  // 1. clients 테이블 확장 생성 (별칭, 담당 워커, 전용 저장 경로 컬럼 포함)
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS clients (
      client_id TEXT PRIMARY KEY,
      client_type TEXT NOT NULL,
      alias TEXT,
      assigned_worker_id TEXT DEFAULT 'default_worker',
      custom_storage_path TEXT,
      connected_at TEXT NOT NULL
    )
  `
  ).run();

  // 2. crawl_logs 기본 로그 테이블 생성 (도메인, URL, 물리 파일 경로 포함)
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS crawl_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id TEXT NOT NULL,
      domain TEXT,
      action TEXT,
      worker_name TEXT,
      url TEXT,
      title TEXT,
      file_path TEXT,
      file_size INTEGER DEFAULT 0,
      log_message TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (client_id) REFERENCES clients (client_id) ON DELETE CASCADE
    )
  `
  ).run();

  // 3. workers 테이블 신설 (동적 수집 워커 레지스트리)
  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS workers (
      worker_id TEXT PRIMARY KEY,
      worker_name TEXT NOT NULL,
      db_file_path TEXT NOT NULL,
      table_name TEXT NOT NULL,
      storage_root_path TEXT NOT NULL,
      schema_json TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `
  ).run();

  // 4. 디폴트 워커 자동 가등록 (없을 경우에만)
  const defaultWorkerExist = db
    .prepare("SELECT * FROM workers WHERE worker_id = 'default_worker'")
    .get();

  if (!defaultWorkerExist) {
    db.prepare(
      `
      INSERT INTO workers (worker_id, worker_name, db_file_path, table_name, storage_root_path, schema_json, is_default, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      "default_worker",
      "기본 수집 워커",
      "databases/data.db",
      "crawl_logs",
      "./storage",
      JSON.stringify([]),
      1,
      new Date().toISOString()
    );
  }
}

/**
 * 데이터베이스에 기록된 모든 수집 클라이언트 목록을 조회합니다.
 *
 * @returns 클라이언트 레코드 배열
 */
export function getAllClients(): ClientRecord[] {
  return db
    .prepare("SELECT * FROM clients ORDER BY connected_at DESC")
    .all() as ClientRecord[];
}

/**
 * 특정 클라이언트 노드의 환경설정(별칭, 담당 워커, 전용 저장 경로)을 업데이트합니다.
 *
 * @param clientId - 대상 클라이언트 UUID
 * @param alias - 노드 한글 별칭
 * @param assignedWorkerId - 담당 수집 워커 ID
 * @param customStoragePath - 노드 전용 물리 저장 경로
 */
export function updateClientConfig(
  clientId: string,
  alias?: string,
  assignedWorkerId?: string,
  customStoragePath?: string
): void {
  db.prepare(
    `
    UPDATE clients 
    SET alias = ?, assigned_worker_id = ?, custom_storage_path = ?
    WHERE client_id = ?
  `
  ).run(
    alias || null,
    assignedWorkerId || "default_worker",
    customStoragePath || null,
    clientId
  );
}

/**
 * 전체 수집 워커 목록을 조회합니다. 디폴트 워커가 상단에 정렬됩니다.
 *
 * @returns 워커 레코드 배열
 */
export function getAllWorkers(): WorkerRecord[] {
  return db
    .prepare("SELECT * FROM workers ORDER BY is_default DESC, created_at ASC")
    .all() as WorkerRecord[];
}

/**
 * 특정 워커 ID로 워커 정보를 조회합니다.
 *
 * @param workerId - 조회할 워커 ID
 * @returns 워커 레코드 또는 undefined
 */
export function getWorkerById(workerId: string): WorkerRecord | undefined {
  return db
    .prepare("SELECT * FROM workers WHERE worker_id = ?")
    .get(workerId) as WorkerRecord | undefined;
}

/**
 * 신규 수집 워커를 생성하고, 해당 워커 전용 DB 파일 및 스키마 테이블을 동적으로 빌드합니다.
 * DDL 예약어와 중복되는 커스텀 필드는 자동 필터링됩니다.
 *
 * @param params - 워커 생성 파라미터 객체
 */
export function createDynamicWorker(params: CreateWorkerParams): void {
  // 메인 DB와 신규 전용 DB 경로를 구분 처리
  const isMainDb = params.dbFileName === "data.db";
  const targetDbPath = isMainDb
    ? mainDbPath
    : resolve(workersDbDir, params.dbFileName);

  // 타깃 DB 인스턴스 열기 (신규 생성 포함)
  const targetDb = new Database(targetDbPath);
  targetDb.pragma("journal_mode = WAL");

  // DDL 기본 상속 예약어 컬럼 세트 (중복 방지용 가드 집합)
  const reservedColumns = new Set([
    "id",
    "client_id",
    "domain",
    "url",
    "title",
    "file_path",
    "file_size",
    "timestamp",
  ]);

  // 기본 컬럼 DDL 구성
  let ddl = `
    CREATE TABLE IF NOT EXISTS ${params.tableName} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id TEXT NOT NULL,
      domain TEXT,
      url TEXT,
      title TEXT,
      file_path TEXT,
      file_size INTEGER DEFAULT 0,
      timestamp INTEGER NOT NULL
  `;

  // 예약어와 중복되지 않는 커스텀 필드만 DDL에 연결 (SQL 오류 방지)
  for (const field of params.customFields) {
    if (!reservedColumns.has(field.name.toLowerCase())) {
      ddl += `, ${field.name} ${field.type} ${field.required ? "NOT NULL" : ""}`;
    }
  }
  ddl += `);`;

  // 타깃 DB에 동적 테이블 생성
  targetDb.prepare(ddl).run();

  // 메인 DB workers 레지스트리에 워커 정보 등록
  const dbRelPath = isMainDb
    ? "databases/data.db"
    : `databases/workers/${params.dbFileName}`;

  db.prepare(
    `
    INSERT INTO workers (worker_id, worker_name, db_file_path, table_name, storage_root_path, schema_json, is_default, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    params.workerId,
    params.workerName,
    dbRelPath,
    params.tableName,
    params.storageRootPath,
    JSON.stringify(params.customFields),
    params.isDefault ? 1 : 0,
    new Date().toISOString()
  );
}

/**
 * 최근 수집 로그를 페이지네이션 방식으로 조회합니다.
 *
 * @param limit - 조회 건수 제한 (기본값: 100)
 * @param offset - 조회 시작 오프셋 (기본값: 0)
 * @returns 크롤링 로그 레코드 배열
 */
export function getCrawlLogs(
  limit: number = 100,
  offset: number = 0
): CrawlLogRecord[] {
  return db
    .prepare(
      "SELECT * FROM crawl_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?"
    )
    .all(limit, offset) as CrawlLogRecord[];
}

/**
 * 데이터베이스의 모든 수집 로그를 일괄 소거합니다.
 */
export function clearAllCrawlLogs(): void {
  db.prepare("DELETE FROM crawl_logs").run();
}

/**
 * 특정 클라이언트를 데이터베이스에서 영구 삭제(정화 추방)합니다.
 * 연쇄 삭제(CASCADE)로 관련 로그도 함께 제거됩니다.
 *
 * @param clientId - 삭제할 클라이언트 UUID
 */
export function purgeClient(clientId: string): void {
  db.prepare("DELETE FROM clients WHERE client_id = ?").run(clientId);
}

/**
 * 수집 노드로부터 수신된 로그를 데이터베이스에 삽입합니다.
 * 클라이언트 미등록 시 자동으로 INSERT OR IGNORE 처리합니다.
 *
 * @param clientId - 수집 노드 UUID
 * @param logMessage - 직렬화된 로그 메시지 바디
 * @param timestamp - 수집 시점 타임스탬프
 * @param domain - 수집 도메인 (기본값: "common")
 * @param filePath - 물리 파일 저장 경로 (기본값: "")
 * @param fileSize - 파일 크기 Bytes (기본값: 0)
 * @returns 삽입된 레코드의 ID
 */
export function insertCrawlLog(
  clientId: string,
  logMessage: string,
  timestamp: number,
  domain: string = "common",
  filePath: string = "",
  fileSize: number = 0
): number {
  // 미등록 클라이언트인 경우 자동 등록 (플러그인 최초 수신 처리)
  db.prepare(
    "INSERT OR IGNORE INTO clients (client_id, client_type, connected_at) VALUES (?, ?, ?)"
  ).run(clientId, "plugin", new Date().toISOString());

  // 수집 로그 레코드 적재
  const info = db
    .prepare(
      "INSERT INTO crawl_logs (client_id, domain, action, file_path, file_size, log_message, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .run(clientId, domain, "CRAWL_LOG", filePath, fileSize, logMessage, timestamp);

  return Number(info.lastInsertRowid);
}

/** 메인 DB 인스턴스 기본 내보내기 */
export default db;
```

---

## server/src/index.ts

```typescript
// server/src/index.ts

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
  updateClientConfig,
  getAllWorkers,
  getWorkerById,
  createDynamicWorker,
  CreateWorkerParams,
} from "./database.js";
import { saveCrawledContentToFile } from "./services/fileStorageService.js";
import { executeWorkerPipeline } from "./services/workerEngineService.js";
import { logServerSystem, logAdminActivity, logPluginComm } from "./logger.js";

/** 클라이언트 세션 식별 유형 */
export type ClientType = "plugin" | "admin";

/** 백엔드 실시간 클라이언트 세션 구조체 */
export interface ClientSession {
  /** 웹소켓 인스턴스 */
  socket: WebSocket;
  /** 클라이언트 고유 UUID */
  clientId: string;
  /** 클라이언트 구분 타입 */
  clientType: ClientType;
  /** 연결 수립 시각 */
  connectedAt: Date;
  /** 노드 한글 별칭 */
  alias?: string;
  /** 담당 수집 워커 ID */
  assignedWorkerId?: string;
  /** 노드 전용 물리 저장 경로 */
  customStoragePath?: string;
  /** 사이드바 UI 열림 활성화 여부 */
  isSidebarOpen?: boolean;
  /** 마지막 통신 수신 타임스탬프 */
  lastSeen?: number;
}

/** 패킷 메타데이터 구조체 */
export interface PacketMetadata {
  /** 생성 시점 타임스탬프 */
  timestamp: number;
  /** 요청 추적 고유 ID */
  traceId?: string;
  /** 동적 확장 파라미터 맵 */
  extraParams?: Record<string, unknown>;
}

/**
 * 확장형 표준 웹소켓 메시지 봉투 구조체
 * ADR-002: 확장 가능 패킷 봉투 프로토콜 규격
 */
export interface WebSocketMessage<T = unknown> {
  /** 송신 노드 식별자 */
  senderId: string;
  /** 수신 타깃 식별자 (ALL, SERVER, 또는 특정 UUID) */
  targetId?: string | "ALL" | "SERVER";
  /** 지시 액션 명령 문자열 */
  action: string;
  /** 데이터 포맷 유형 */
  payloadType?: "json" | "binary_base64" | "raw_text" | "chunk_stream";
  /** 실질 페이로드 바디 */
  payload: T;
  /** 메타데이터 객체 */
  meta?: PacketMetadata;
}

// ESM 환경에서 __dirname 대체 경로 계산
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 정적 파일 제공 경로 (admin 빌드 산출물 또는 public/)
const publicPath = resolve(__dirname, "..", "public");

const app = express();
const server = createServer(app);

/**
 * 예외 객체로부터 한글 오류 메시지를 안전하게 추출합니다.
 *
 * @param error - 발생한 예외 객체
 * @returns 문자열 오류 메시지
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "알 수 없는 오류가 발생했습니다.";
}

app.use(express.json());
app.use(express.static(publicPath));

// SQLite 데이터베이스 및 디폴트 워커 초기화
initializeDatabase();

/** 실시간 활성 클라이언트 세션 관리 맵 (clientId → ClientSession) */
export const activeClients = new Map<string, ClientSession>();

/**
 * [REST API 1] 등록된 클라이언트 목록 조회
 * Query Parameter: ?onlineOnly=true 지정 시 실시간 소켓 가동 노드만 필터링 반환
 */
app.get("/api/db/clients", (req, res) => {
  try {
    const onlineOnly = req.query.onlineOnly === "true";
    const clients = getAllClients();

    // 실시간 세션 맵과 대조하여 온라인/사이드바 상태 플래그 추가
    let result = clients.map((c) => {
      const session = activeClients.get(c.client_id);
      const isOnline = !!(
        session && session.socket.readyState === WebSocket.OPEN
      );
      return {
        ...c,
        is_online: isOnline,
        is_sidebar_open: isOnline ? !!session.isSidebarOpen : false,
      };
    });

    // onlineOnly 필터 적용
    if (onlineOnly) {
      result = result.filter((c) => c.is_online);
    }

    res.json({ success: true, data: result });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logServerSystem("ERROR", `Clients API 에러 반환: ${errorMessage}`);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

/**
 * [REST API 2] 특정 클라이언트 노드의 환경설정(별칭, 담당 워커, 전용 저장 경로) 저장
 * 실시간 세션 메타도 함께 갱신합니다.
 */
app.put("/api/db/clients/:clientId/config", (req, res) => {
  try {
    const { clientId } = req.params;
    const { alias, assignedWorkerId, customStoragePath } = req.body;

    // DB 환경설정 업데이트
    updateClientConfig(clientId, alias, assignedWorkerId, customStoragePath);

    // 실시간 세션 메타 동기화
    const session = activeClients.get(clientId);
    if (session) {
      session.alias = alias;
      session.assignedWorkerId = assignedWorkerId;
      session.customStoragePath = customStoragePath;
    }

    logAdminActivity(
      "SUPER_ADMIN",
      "UPDATE_NODE_CONFIG",
      `노드 환경설정 변경 완료 [ID: ${clientId}] [별칭: ${alias}]`
    );

    res.json({ success: true, message: "노드 환경설정이 저장되었습니다." });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
});

/**
 * [REST API 3] 전체 수집 워커 목록 인출
 */
app.get("/api/admin/workers", (_req, res) => {
  try {
    const workers = getAllWorkers();
    res.json({ success: true, data: workers });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
});

/**
 * [REST API 4] 신규 동적 수집 워커 생성 및 타깃 DB 동적 빌드
 */
app.post("/api/admin/workers", (req, res) => {
  try {
    const params: CreateWorkerParams = req.body;
    createDynamicWorker(params);

    logAdminActivity(
      "SUPER_ADMIN",
      "CREATE_WORKER",
      `신규 수집 워커 생성 완료 [ID: ${params.workerId}] [이름: ${params.workerName}]`
    );

    res.json({ success: true, message: "수집 워커가 성공적으로 생성되었습니다." });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
});

/**
 * [REST API 5] 디스크 스토리지 모니터링 상태 조회
 */
app.get("/api/admin/storage/status", (_req, res) => {
  try {
    const rootPath = process.env.STORAGE_ROOT_PATH || "./storage";
    res.json({
      success: true,
      data: {
        storageRootPath: resolve(rootPath),
        status: "NORMAL",
      },
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
});

/**
 * [REST API 6] 최근 수집 로그 인출 (최신 100건)
 */
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

/**
 * [REST API 7] 전체 수집 로그 일괄 소거
 */
app.delete("/api/db/logs", (_req, res) => {
  try {
    clearAllCrawlLogs();
    logAdminActivity("SUPER_ADMIN", "DELETE_ALL_LOGS", "전체 수집 로그 일괄 소거");
    res.json({ success: true, message: "모든 수집 로그가 소거되었습니다." });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    logServerSystem("ERROR", `Logs Delete API 에러 반환: ${errorMessage}`);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

/**
 * [REST API 8] 특정 클라이언트 차단 추방 (Purge)
 * DB 삭제 및 실시간 소켓 강제 종료를 동시에 단행합니다.
 */
app.delete("/api/db/clients/:clientId", (req, res) => {
  try {
    const targetId = req.params.clientId;

    // DB에서 클라이언트 레코드 영구 삭제
    purgeClient(targetId);

    // 실시간 소켓이 가동 중일 경우 강제 종료
    if (activeClients.has(targetId)) {
      const session = activeClients.get(targetId);
      if (session && session.socket.readyState === WebSocket.OPEN) {
        session.socket.close(4002, "관리자에 의한 영구 차단 추방");
      }
      activeClients.delete(targetId);
    }

    logAdminActivity("SUPER_ADMIN", "PURGE_CLIENT", `클라이언트 영구 추방: ${targetId}`);
    res.json({ success: true, message: "클라이언트가 차단 정화되었습니다." });
  } catch (error: unknown) {
    res.status(500).json({ success: false, message: getErrorMessage(error) });
  }
});

/**
 * 연결된 모든 수집 노드(플러그인)로 최신 인증 토큰을 실시간 웹소켓 푸시합니다.
 * ADR-003: 백그라운드 페치 스크래핑 및 깃허브 동기화 규격 연동
 *
 * @param tokenType - 토큰 구분 식별자 (예: "githubToken")
 * @param newToken - 최신 인증 토큰 값
 */
export function broadcastUpdatedToken(tokenType: string, newToken: string): void {
  const tokenPacket: WebSocketMessage = {
    senderId: "server",
    targetId: "ALL",
    action: "UPDATE_AUTH_TOKEN",
    payloadType: "json",
    payload: { tokenType, token: newToken },
    meta: { timestamp: Date.now() },
  };

  activeClients.forEach((client) => {
    if (client.clientType === "plugin" && client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify(tokenPacket));
    }
  });
}

// 웹소켓 서버 초기화
const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
  const host = req.headers.host || "localhost:9600";
  const url = new URL(req.url || "", `http://${host}`);

  // 연결 파라미터 추출 및 유효성 검증
  const clientId = url.searchParams.get("clientId");
  const clientType = url.searchParams.get("clientType") as ClientType;

  if (!clientId || (clientType !== "plugin" && clientType !== "admin")) {
    ws.close(4000, "식별 정보 누락으로 연결 거부");
    return;
  }

  // 중복 세션 가드 정화 (클라이언트 1개당 단 1개 소켓만 보장)
  if (activeClients.has(clientId)) {
    const existing = activeClients.get(clientId);
    if (existing && existing.socket.readyState === WebSocket.OPEN) {
      existing.socket.close(4001, "중복 세션 정화");
    }
    activeClients.delete(clientId);
  }

  // 새 세션 등록
  activeClients.set(clientId, {
    socket: ws,
    clientId,
    clientType,
    connectedAt: new Date(),
    isSidebarOpen: false,
    lastSeen: Date.now(),
  });

  logServerSystem("INFO", `세션 마운트 성공: [ID: ${clientId}] [TYPE: ${clientType}]`);

  ws.on("message", (rawData: string) => {
    try {
      const message: WebSocketMessage = JSON.parse(rawData);
      message.senderId = clientId;

      // 마지막 통신 시각 갱신
      const session = activeClients.get(clientId);
      if (session) session.lastSeen = Date.now();

      // 1. 사이드바 열림/닫힘 상태 업데이트 패킷 처리 (ADR-001 사이드바/오프스크린 아키텍처)
      if (message.action === "CLIENT_STATUS_UPDATE" && session) {
        const payload = message.payload as { isSidebarOpen?: boolean };
        session.isSidebarOpen = !!payload.isSidebarOpen;
        logPluginComm(
          clientId,
          "CLIENT_STATUS_UPDATE",
          `사이드바 상태: ${session.isSidebarOpen ? "OPEN(활성)" : "CLOSED(비활성)"}`
        );
        return;
      }

      logPluginComm(clientId, message.action, `수신 패킷 처리: ${rawData.substring(0, 200)}`);

      // 2. CRAWL_LOG 유입 시 파일 분리 저장 및 동적 워커 파이프라인 단행 (ADR-004)
      if (message.action === "CRAWL_LOG") {
        const payloadObj = (
          typeof message.payload === "object" && message.payload !== null
            ? message.payload
            : { raw: message.payload }
        ) as Record<string, unknown>;

        // 수집 URL에서 도메인 추출
        const targetUrl = String(payloadObj.url || "");
        let domain = "common";
        try {
          if (targetUrl) domain = new URL(targetUrl).hostname;
        } catch {
          // 도메인 파싱 실패 시 기본값 유지
        }

        // DB 기본 로그 적재 및 레코드 ID 취득
        const logId = insertCrawlLog(
          clientId,
          JSON.stringify(payloadObj),
          Date.now(),
          domain
        );

        // HTML 원본 소스가 있을 경우 물리 파일 분리 저장소 적재 (R-00208)
        const fullDomHtml = String(payloadObj.fullDom || "");
        let savedPath = "";
        let savedSize = 0;

        if (fullDomHtml) {
          const clientRec = getAllClients().find((c) => c.client_id === clientId);
          const assignedWorker = getWorkerById(
            clientRec?.assigned_worker_id || "default_worker"
          );

          const saveRes = saveCrawledContentToFile({
            customNodePath: clientRec?.custom_storage_path,
            workerStoragePath: assignedWorker?.storage_root_path,
            domain,
            dbLogId: logId,
            htmlContent: fullDomHtml,
          });

          savedPath = saveRes.savedFilePath;
          savedSize = saveRes.fileSize;
        }

        // 지정된 동적 수집 워커 파이프라인 단행 (R-00207)
        const clientRec2 = getAllClients().find((c) => c.client_id === clientId);
        const assignedWorker2 = getWorkerById(
          clientRec2?.assigned_worker_id || "default_worker"
        );
        if (assignedWorker2) {
          executeWorkerPipeline(
            assignedWorker2,
            clientId,
            domain,
            savedPath,
            savedSize,
            payloadObj
          );
        }
      }

      // 3. 브로드캐스트 패킷 라우팅 (targetId === "ALL")
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

      // 4. 단일 타깃 릴레이 라우팅 (특정 UUID 지정)
      if (message.targetId && activeClients.has(message.targetId)) {
        const targetSession = activeClients.get(message.targetId);
        if (targetSession && targetSession.socket.readyState === WebSocket.OPEN) {
          targetSession.socket.send(JSON.stringify(message));
        }
      }
    } catch {
      // 패킷 파싱 예외 가드 (무중단 유지)
    }
  });

  ws.on("close", () => {
    activeClients.delete(clientId);
    logServerSystem("INFO", `세션 해제 완료: [ID: ${clientId}]`);
  });

  ws.on("error", (err) => {
    logServerSystem("WARN", `세션 예외 감지 [ID: ${clientId}]: ${err.message}`);
  });
});

// 통합 백엔드 포트 9600으로 서버 가동
server.listen(9600, () => {
  logServerSystem("INFO", "통합 백엔드 포트 9600 정상 가동 완료");
  console.log("[시스템] 통합 백엔드 API 및 데이터베이스 서비스 포트 9600 구동 중");
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
// admin/src/hooks/useAdminDbApi.ts

import { useState, useCallback } from 'react';
import { Client, CrawlLog, WorkerRecord, CustomFieldDef } from '../types/index.js';
import {
  fetchClientsApi,
  updateClientConfigApi,
  fetchWorkersApi,
  createWorkerApi,
  fetchLogsApi,
  clearLogsApi,
  purgeClientApi
} from '../services/apiService.js';

/**
 * 관리자 대시보드의 REST API 통신 및 전체 상태 관리 비즈니스 로직 훅입니다.
 * 클라이언트 목록, 워커 목록, 수집 로그에 대한 CRUD 및 관리 작업을 제공합니다.
 */
export function useAdminDbApi() {
  /** 수집 노드 클라이언트 목록 상태 */
  const [clients, setClients] = useState<Client[]>([]);
  /** 수집 워커 목록 상태 */
  const [workers, setWorkers] = useState<WorkerRecord[]>([]);
  /** 크롤링 수집 로그 목록 상태 */
  const [logs, setLogs] = useState<CrawlLog[]>([]);

  /**
   * 백엔드로부터 클라이언트 목록을 인출하여 상태를 갱신합니다.
   *
   * @param onlineOnly - true 지정 시 온라인 노드만 인출 (기본값: false)
   */
  const loadClients = useCallback(async (onlineOnly: boolean = false) => {
    try {
      const data = await fetchClientsApi(onlineOnly);
      setClients(data);
    } catch {
      // API 통신 예외 스킵
    }
  }, []);

  /**
   * 백엔드로부터 수집 워커 목록을 인출하여 상태를 갱신합니다.
   */
  const loadWorkers = useCallback(async () => {
    try {
      const data = await fetchWorkersApi();
      setWorkers(data);
    } catch {
      // API 통신 예외 스킵
    }
  }, []);

  /**
   * 백엔드로부터 최근 수집 로그 목록을 인출하여 상태를 갱신합니다.
   */
  const loadLogs = useCallback(async () => {
    try {
      const data = await fetchLogsApi();
      setLogs(data);
    } catch {
      // API 통신 예외 스킵
    }
  }, []);

  /**
   * 특정 노드의 환경설정(별칭, 담당 워커, 전용 저장 경로)을 업데이트합니다.
   *
   * @param clientId - 대상 노드 UUID
   * @param alias - 노드 한글 별칭
   * @param assignedWorkerId - 담당 워커 ID
   * @param customStoragePath - 노드 전용 물리 저장 경로
   * @returns 성공 여부
   */
  const executeUpdateClientConfig = useCallback(async (
    clientId: string,
    alias: string,
    assignedWorkerId: string,
    customStoragePath: string
  ) => {
    const success = await updateClientConfigApi(clientId, alias, assignedWorkerId, customStoragePath);
    if (success) {
      await loadClients();
      return true;
    }
    return false;
  }, [loadClients]);

  /**
   * 신규 동적 수집 워커 및 타깃 DB 스키마를 빌드합니다.
   *
   * @param params - 워커 생성 파라미터 객체
   * @returns 성공 여부
   */
  const executeCreateWorker = useCallback(async (params: {
    workerId: string;
    workerName: string;
    dbFileName: string;
    tableName: string;
    storageRootPath: string;
    customFields: CustomFieldDef[];
  }) => {
    const success = await createWorkerApi(params);
    if (success) {
      alert('신규 수집 워커 및 타깃 DB 스키마가 성공적으로 빌드되었습니다.');
      await loadWorkers();
      return true;
    }
    return false;
  }, [loadWorkers]);

  /**
   * 데이터베이스의 모든 수집 로그를 일괄 소거합니다.
   * 실행 전 사용자 확인을 요구합니다.
   *
   * @returns 성공 여부
   */
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

  /**
   * 지정된 클라이언트 기기를 강제 차단 추방합니다.
   * 실행 전 사용자 확인을 요구합니다.
   *
   * @param clientId - 추방할 클라이언트 UUID
   * @returns 성공 여부
   */
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

  /**
   * 연결 끊긴 오프라인 노드 이력을 일괄 정화합니다.
   * 실행 전 사용자 확인을 요구합니다.
   *
   * @returns 성공 여부
   */
  const executePurgeOfflineClients = useCallback(async () => {
    const offlineClients = clients.filter((c) => !c.is_online);
    if (offlineClients.length === 0) {
      alert('정리할 오프라인 노드 이력이 없습니다.');
      return false;
    }

    if (!confirm(`연결 끊긴 오프라인 노드 ${offlineClients.length}개를 일괄 정화하시겠습니까?`)) {
      return false;
    }

    // 오프라인 노드 순차 정화
    for (const client of offlineClients) {
      await purgeClientApi(client.client_id);
    }

    alert('모든 오프라인 노드 이력이 정화되었습니다.');
    await loadClients();
    await loadLogs();
    return true;
  }, [clients, loadClients, loadLogs]);

  return {
    clients,
    workers,
    logs,
    setLogs,
    loadClients,
    loadWorkers,
    loadLogs,
    executeUpdateClientConfig,
    executeCreateWorker,
    executeClearLogs,
    executePurgeClient,
    executePurgeOfflineClients
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
// admin/src/services/apiService.ts

import { Client, CrawlLog, WorkerRecord, CustomFieldDef } from '../types/index.js';

/**
 * 등록된 수집 클라이언트 목록을 백엔드 REST API로부터 인출합니다.
 *
 * @param onlineOnly - true 지정 시 실시간 소켓 가동 노드만 인출
 * @returns 클라이언트 데이터 배열
 */
export async function fetchClientsApi(onlineOnly: boolean = false): Promise<Client[]> {
  const url = onlineOnly ? '/api/db/clients?onlineOnly=true' : '/api/db/clients';
  const res = await fetch(url);
  const json = await res.json();
  return json.success ? json.data : [];
}

/**
 * 지정 노드의 환경설정(별칭, 담당 워커, 전용 저장 경로)을 업데이트합니다.
 *
 * @param clientId - 대상 노드 UUID
 * @param alias - 노드 한글 별칭
 * @param assignedWorkerId - 담당 워커 ID
 * @param customStoragePath - 노드 전용 물리 저장 경로
 * @returns 성공 여부
 */
export async function updateClientConfigApi(
  clientId: string,
  alias: string,
  assignedWorkerId: string,
  customStoragePath: string
): Promise<boolean> {
  const res = await fetch(`/api/db/clients/${clientId}/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ alias, assignedWorkerId, customStoragePath }),
  });
  const json = await res.json();
  return json.success;
}

/**
 * 전체 수집 워커 목록을 인출합니다.
 *
 * @returns 워커 레코드 배열
 */
export async function fetchWorkersApi(): Promise<WorkerRecord[]> {
  const res = await fetch('/api/admin/workers');
  const json = await res.json();
  return json.success ? json.data : [];
}

/**
 * 신규 동적 수집 워커 및 타깃 DB 스키마 빌드를 요청합니다.
 *
 * @param params - 워커 생성 옵션 객체
 * @returns 성공 여부
 */
export async function createWorkerApi(params: {
  workerId: string;
  workerName: string;
  dbFileName: string;
  tableName: string;
  storageRootPath: string;
  customFields: CustomFieldDef[];
  isDefault?: boolean;
}): Promise<boolean> {
  const res = await fetch('/api/admin/workers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  return json.success;
}

/**
 * 최근 수집 로그 목록을 인출합니다.
 *
 * @returns 크롤링 로그 배열
 */
export async function fetchLogsApi(): Promise<CrawlLog[]> {
  const res = await fetch('/api/db/logs');
  const json = await res.json();
  return json.success ? json.data : [];
}

/**
 * 데이터베이스 수집 로그 일괄 소거를 요청합니다.
 *
 * @returns 성공 여부
 */
export async function clearLogsApi(): Promise<boolean> {
  const res = await fetch('/api/db/logs', { method: 'DELETE' });
  const json = await res.json();
  return json.success;
}

/**
 * 특정 클라이언트 기기를 블랙리스트 차단 추방 요청합니다.
 *
 * @param clientId - 타깃 노드 UUID
 * @returns 성공 여부
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
// admin/src/types/index.ts

/** 수집 노드 클라이언트 데이터 구조체 */
export interface Client {
  /** 노드 고유 UUID */
  client_id: string;
  /** 클라이언트 구분 타입 */
  client_type: string;
  /** 노드 한글 별칭 (Alias) */
  alias?: string;
  /** 담당 수집 워커 ID */
  assigned_worker_id?: string;
  /** 노드 전용 물리 저장 경로 */
  custom_storage_path?: string;
  /** 최초 접속 타임스탬프 또는 ISO 문자열 */
  connected_at: string;
  /** 백엔드 실시간 소켓 가동 여부 */
  is_online?: boolean;
  /** 사이드바 UI 활성화 여부 */
  is_sidebar_open?: boolean;
}

/** 커스텀 스키마 필드 정의 구조체 */
export interface CustomFieldDef {
  /** 필드 영문 식별자 */
  name: string;
  /** SQLite 필드 데이터 타입 */
  type: "TEXT" | "INTEGER" | "REAL" | "BLOB";
  /** 필수 필드 여부 */
  required?: boolean;
}

/** 워커 데이터베이스 기록 구조체 */
export interface WorkerRecord {
  /** 워커 고유 ID */
  worker_id: string;
  /** 워커 한글 이름 */
  worker_name: string;
  /** 대상 DB 파일 상대 경로 */
  db_file_path: string;
  /** 대상 테이블 이름 */
  table_name: string;
  /** 워커 전용 저장소 루트 경로 */
  storage_root_path: string;
  /** 직렬화된 커스텀 필드 JSON 문자열 */
  schema_json: string;
  /** 디폴트 워커 여부 (1 또는 0) */
  is_default: number;
  /** 생성 시각 */
  created_at: string;
}

/** 크롤링 수집 로그 데이터 구조체 */
export interface CrawlLog {
  /** DB 레코드 PK ID */
  id: number;
  /** 수집 노드 UUID */
  client_id: string;
  /** 도메인 */
  domain?: string;
  /** 수집 액션 */
  action?: string;
  /** 파일 물리 경로 */
  file_path?: string;
  /** 파일 크기 (Bytes) */
  file_size?: number;
  /** 직렬화된 로그 메시지 바디 */
  log_message: string;
  /** 수집 시점 타임스탬프 */
  timestamp: number;
}

/** 웹소켓 메시지 규격 구조체 */
export interface WebSocketMessage<T = unknown> {
  /** 송신 노드 식별자 */
  senderId: string;
  /** 수신 타깃 식별자 (ALL, SERVER, 또는 특정 UUID) */
  targetId?: string | "ALL" | "SERVER";
  /** 지시 액션 명령 문자열 */
  action: string;
  /** 페이로드 물리 포맷 */
  payloadType?: "json" | "binary_base64" | "raw_text" | "chunk_stream";
  /** 실질 페이로드 바디 */
  payload: T;
  /** 메타데이터 객체 */
  meta?: {
    timestamp: number;
    traceId?: string;
    extraParams?: Record<string, unknown>;
  };
}

/** 웹소켓 통신 가동 상태 타입 */
export type ConnectionStatus = "CONNECTED" | "DISCONNECTED";

/** 대시보드 활성 메인 탭 타입 */
export type ActiveTab = "clients" | "console" | "logs" | "favicon" | "workers";

/** 노드 리스트 출력 필터 모드 타입 */
export type NodeStatusFilter = "ONLINE" | "ALL" | "OFFLINE";
```

---

## plugins/basic-plugin/public/manifest.json

```json
{
  "manifest_version": 3,
  "name": "기본 검증용 수집 플러그인",
  "version": "1.0.0",
  "description": "WebCrawlServer 분산 크롤링, 사이드바 및 오프스크린 무중단 연동 확장 프로그램",
  "permissions": [
    "sidePanel",
    "offscreen",
    "management",
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
    "notifications",
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
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  "action": {
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
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
  ]
}
```

---

## plugins/basic-plugin/public/offscreen.html

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>WebCrawlServer Offscreen Engine</title>
  </head>
  <body>
    <!-- 24시간 무중단 백그라운드 웹소켓 전담 엔진 스크립트 (ADR-001) -->
    <script type="module" src="/src/offscreen.ts"></script>
  </body>
</html>
```

---

## plugins/basic-plugin/public/sidepanel.html

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WebCrawlServer 사이드바 대시보드</title>
    <!-- Material Symbols Outlined 아이콘 CDN -->
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0"
    />
    <!-- Noto Sans KR 한글 폰트 CDN -->
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap"
    />
  </head>
  <body>
    <div id="root"></div>
    <!-- 사이드바 UI 엔트리포인트 (Vite 번들링) -->
    <script type="module" src="/src/sidepanel.tsx"></script>
  </body>
</html>
```

---

## plugins/basic-plugin/src/background.ts

```typescript
// plugins/basic-plugin/src/background.ts

/**
 * 백그라운드 서비스 워커 모듈입니다.
 * 오프스크린 문서를 생성하여 24시간 무중단 웹소켓 소유권을 위임하고,
 * 사이드바 오픈 동작 및 내부 메시지 중계를 담당합니다.
 * ADR-001: 사이드바 단일 UI & 오프스크린 무중단 소켓 아키텍처 준수
 */

/**
 * 브라우저 백그라운드에 오프스크린 문서가 미생성 상태일 경우 자동 생성합니다.
 * 이미 생성된 경우 중복 생성을 방지합니다.
 */
async function ensureOffscreenDocument(): Promise<void> {
  // 기존 오프스크린 컨텍스트 존재 여부 확인
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
  });

  if (existingContexts.length > 0) return;

  // 오프스크린 문서 생성 (24시간 무중단 WebSocket 소유자)
  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: [chrome.offscreen.Reason.BLOBS],
    justification: "WebCrawlServer 분산 크롤링 24시간 무중단 웹소켓 유지",
  });
}

/**
 * 확장 프로그램 설치 시 초기화 작업을 수행합니다.
 * 아이콘 클릭 시 팝업 대신 사이드바가 즉시 열리도록 설정하고,
 * 오프스크린 문서를 생성하여 소켓 통신을 준비합니다.
 */
chrome.runtime.onInstalled.addListener(() => {
  // 툴바 아이콘 클릭 시 팝업 대신 사이드 패널 즉시 오픈 설정
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  ensureOffscreenDocument();
});

/**
 * 브라우저 시작 시 오프스크린 문서를 재생성합니다.
 * 서비스 워커가 종료된 후 재가동될 때도 소켓 연결이 복원됩니다.
 */
chrome.runtime.onStartup.addListener(() => {
  ensureOffscreenDocument();
});

/**
 * 크롬 내부 메시지 수신기 및 중계 라우터입니다.
 * 오프스크린에서 전달된 서버 수신 패킷을 적절한 탭/사이드바로 라우팅합니다.
 */
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  // 오프스크린에서 중계된 서버 수신 패킷 처리
  if (message.type === "SOCKET_PACKET_RECEIVED" && message.packet) {
    const packet = message.packet;

    // 원격 CRAWL_START 지시 수신 시 활성 탭 콘텐츠 스크립트로 전달
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
  }
  return false;
});
```

---

## plugins/basic-plugin/src/content.ts

```typescript
// plugins/basic-plugin/src/content.ts

/**
 * 콘텐츠 스크립트 모듈입니다.
 * 현재 페이지 DOM을 수집하거나 선언형 페이징 크롤링을 수행하며,
 * 수집된 데이터를 오프스크린 소켓을 통해 서버로 전송합니다.
 */

/** 선언형 페이징 수집 파라미터 구조체 */
export interface PaginationCrawlPayload {
  /** 다음 페이지 클릭 버튼 CSS 셀렉터 */
  nextPageSelector: string;
  /** 수집할 요소를 지정하는 CSS 셀렉터 */
  contentSelector: string;
  /** 수집할 최대 페이지 수 */
  maxPages: number;
  /** 페이지 클릭 후 대기 시간 (ms) */
  delayMs: number;
}

/**
 * 서버에서 전달받은 선언형 행동 양식에 맞춰 페이징 버튼을 순차 클릭하며
 * 연속 페이지에 걸친 데이터를 수집합니다.
 * 차단 방지를 위한 인간 모사 지연(Human-like Jitter Delay)을 내장합니다.
 *
 * @param payload - 페이징 수집 파라미터 객체
 */
async function runPaginationCrawlEngine(payload: PaginationCrawlPayload): Promise<void> {
  let currentPage = 1;

  while (currentPage <= payload.maxPages) {
    // 현재 페이지에서 지정 셀렉터로 텍스트 항목 수집
    const items = Array.from(document.querySelectorAll(payload.contentSelector))
      .map((el) => el.textContent?.trim() || "")
      .filter((text) => text.length > 0);

    // 오프스크린 소켓으로 수집 데이터 포워딩
    chrome.runtime.sendMessage({
      type: "SEND_SOCKET_PACKET",
      packet: {
        action: "CRAWL_LOG",
        payloadType: "json",
        payload: {
          page: currentPage,
          url: window.location.href,
          title: document.title,
          items,
          timestamp: Date.now(),
        },
        meta: { timestamp: Date.now() },
      },
    });

    // 마지막 페이지 도달 시 반복 종료
    if (currentPage >= payload.maxPages) break;

    // 다음 페이지 버튼 탐색 및 클릭
    const nextBtn = document.querySelector(payload.nextPageSelector) as HTMLElement | null;
    if (!nextBtn) break;

    nextBtn.click();
    currentPage++;

    // 차단 방지 인간 모사 지연 시간 (Human-like Random Jitter Delay)
    const jitter = Math.floor(Math.random() * 1000);
    await new Promise((resolve) => setTimeout(resolve, payload.delayMs + jitter));
  }
}

/**
 * 크롬 메시지 수신기: 백그라운드 및 사이드바로부터의 DOM 수집 지시를 처리합니다.
 */
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {

  // [1] 선언형 페이징 크롤링 지시
  if (request.command === "START_PAGINATION_CRAWL" && request.payload) {
    runPaginationCrawlEngine(request.payload);
    sendResponse({ success: true });
    return false;
  }

  // [2] 기본 DOM 크롤링 지시 (링크 및 타이틀 수집)
  if (request.command === "START_DOM_CRAWL") {
    const pageTitle = document.title;
    const hyperlinks: string[] = [];

    // 현재 페이지의 첫 15개 하이퍼링크 수집
    const anchors = document.querySelectorAll("a");
    anchors.forEach((a, idx) => {
      if (idx < 15 && a.href) hyperlinks.push(a.href);
    });

    // 오프스크린 소켓으로 포워딩
    chrome.runtime.sendMessage({
      type: "SEND_SOCKET_PACKET",
      packet: {
        action: "CRAWL_LOG",
        payloadType: "json",
        payload: {
          url: window.location.href,
          title: pageTitle,
          links: hyperlinks,
          timestamp: Date.now(),
        },
        meta: { timestamp: Date.now() },
      },
    });
    return false;
  }

  // [3] 전체 DOM HTML 수집 지시 (물리 파일 저장소 연동용)
  if (request.command === "COLLECT_FULL_DOM") {
    const fullDomHtml = document.documentElement.outerHTML;
    const domData = {
      url: window.location.href,
      title: document.title,
      fullDom: fullDomHtml,
      timestamp: Date.now(),
    };

    // 오프스크린 소켓으로 포워딩 (서버에서 물리 파일 분리 저장 처리)
    chrome.runtime.sendMessage({
      type: "SEND_SOCKET_PACKET",
      packet: {
        action: "CRAWL_LOG",
        payloadType: "json",
        payload: domData,
        meta: { timestamp: Date.now() },
      },
    });

    sendResponse({ success: true, data: domData });
    return false;
  }

  return false;
});
```

---

## plugins/basic-plugin/src/offscreen.ts

```typescript
// plugins/basic-plugin/src/offscreen.ts

import { PLUGIN_CONFIG, getWebSocketUrl } from "./config/pluginConfig.js";
import { WebSocketPacket } from "./types/index.js";

/**
 * 오프스크린 문서에서 단일 소켓을 영구 보유하며 24시간 무중단 웹소켓 통신을 담당합니다.
 * ADR-001: 사이드바 단일 UI & 오프스크린 무중단 소켓 아키텍처 준수
 */

/** 현재 유지 중인 웹소켓 인스턴스 */
let socket: WebSocket | null = null;

/**
 * 크롬 로컬 스토리지에서 수집 노드 고유 UUID를 인출합니다.
 * chrome.storage 미지원 환경 및 초기화 미완료 시 localStorage Fallback을 제공합니다.
 *
 * @returns 클라이언트 고유 UUID 문자열
 */
async function getOrCreateClientId(): Promise<string> {
  try {
    // 1. chrome.storage.local 존재 여부 안전 검사 (Null Guard)
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      const result = await chrome.storage.local.get(["clientId"]);
      if (result && typeof result.clientId === "string") return result.clientId;
      
      const generatedId = crypto.randomUUID();
      await chrome.storage.local.set({ clientId: generatedId });
      return generatedId;
    }
  } catch {
    // 스토리지 API 예외 발생 시 하단 Fallback으로 진행
  }

  // 2. Fallback: 브라우저 기본 localStorage 사용 (안전성 확보)
  let localId = localStorage.getItem("clientId");
  if (!localId) {
    localId = crypto.randomUUID();
    localStorage.setItem("clientId", localId);
  }
  return localId;
}

/**
 * 사이드바 열림/닫힘 상태 업데이트 패킷을 서버로 송출합니다.
 * 크롬 포트 연결 기반으로 사이드바 창 닫힘을 100% 감지합니다.
 *
 * @param isOpen - 사이드바 활성화 여부
 */
async function sendSidebarStatusToServer(isOpen: boolean): Promise<void> {
  const clientId = await getOrCreateClientId();
  const statusPacket: WebSocketPacket = {
    senderId: clientId,
    targetId: "SERVER",
    action: "CLIENT_STATUS_UPDATE",
    payloadType: "json",
    payload: { isSidebarOpen: isOpen },
    meta: { timestamp: Date.now() },
  };

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(statusPacket));
  }
}

/**
 * 백엔드 포트(9600)와 24시간 무중단 단일 웹소켓 통신망을 수립합니다.
 * 연결 끊김 시 3초 주기로 자동 재연결을 시도합니다.
 */
async function connectOffscreenSocket(): Promise<void> {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;

  const clientId = await getOrCreateClientId();
  const wsUrl = getWebSocketUrl(clientId);
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    const helloPacket: WebSocketPacket = {
      senderId: clientId,
      targetId: "SERVER",
      action: "CRAWL_LOG",
      payloadType: "json",
      payload: { system: "오프스크린 24시간 무중단 수집 엔진 정상 안착" },
      meta: { timestamp: Date.now() },
    };
    socket?.send(JSON.stringify(helloPacket));
  };

  socket.onmessage = async (event) => {
    try {
      const packet: WebSocketPacket = JSON.parse(event.data);

      // 서버 푸시 인증 토큰 갱신 수용 (방어 코드 포함)
      if (packet.action === "UPDATE_AUTH_TOKEN" && packet.payload) {
        const { tokenType, token } = packet.payload as { tokenType: string; token: string };
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          await chrome.storage.local.set({ [tokenType]: token });
        } else {
          localStorage.setItem(tokenType, token);
        }
      }

      // 수신 패킷 크롬 내부 중계 (catch() 예외 가드: 사이드바 미오픈 시 유실 방어)
      chrome.runtime.sendMessage({ type: "SOCKET_PACKET_RECEIVED", packet }).catch(() => {
        // 사이드바 미오픈 상태에서의 sendMessage 실패는 정상 동작
      });
    } catch {
      // 패킷 파싱 예외 가드
    }
  };

  socket.onclose = () => {
    socket = null;
    setTimeout(connectOffscreenSocket, 3000);
  };

  socket.onerror = () => {
    socket = null;
  };
}

/**
 * 크롬 포트 연결 기반 사이드바 창 닫힘 100% 감지 리스너
 */
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "sidepanel-port") {
    sendSidebarStatusToServer(true);

    port.onDisconnect.addListener(() => {
      sendSidebarStatusToServer(false);
    });
  }
});

/**
 * 크롬 내부 메시지 수신기
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_SOCKET_STATUS") {
    getOrCreateClientId().then((clientId) => {
      try {
        sendResponse({
          connected: socket !== null && socket.readyState === WebSocket.OPEN,
          clientId,
          port: PLUGIN_CONFIG.server.port,
        });
      } catch {
        // 채널 파괴 방어
      }
    });
    return true;
  }

  if (message.type === "SEND_SOCKET_PACKET" && message.packet) {
    getOrCreateClientId().then((clientId) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        const fullPacket: WebSocketPacket = {
          senderId: clientId,
          targetId: message.packet.targetId || "SERVER",
          action: message.packet.action || "CRAWL_LOG",
          payloadType: message.packet.payloadType || "json",
          payload: message.packet.payload,
          meta: message.packet.meta || { timestamp: Date.now() },
        };
        socket.send(JSON.stringify(fullPacket));
        try {
          sendResponse({ success: true });
        } catch {
          // 채널 파괴 방어
        }
      } else {
        connectOffscreenSocket();
        try {
          sendResponse({ success: false, reason: "SOCKET_OFFLINE" });
        } catch {
          // 채널 파괴 방어
        }
      }
    });
    return true;
  }

  return false;
});

// 오프스크린 문서 로드 즉시 소켓 연결 초기화
connectOffscreenSocket();
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

## plugins/basic-plugin/src/sidepanel.tsx

```tsx
// plugins/basic-plugin/src/sidepanel.tsx

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './popup.css';

import { usePopupState } from './hooks/usePopupState';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { Footer } from './components/Footer';
import { BasicTab } from './components/tabs/BasicTab';
import { InfoTab } from './components/tabs/InfoTab';
import { DebugTab } from './components/tabs/DebugTab';

/**
 * 브라우저 툴바 아이콘 클릭 시 즉시 켜지는 단일 메인 사이드바 대시보드 엔트리 컴포넌트입니다.
 * 크롬 포트 연결(chrome.runtime.connect)로 사이드바 창 생명주기를 오프스크린에 알립니다.
 * ADR-001: 사이드바 단일 UI & 오프스크린 무중단 소켓 아키텍처 준수
 */
export default function SidePanel() {
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

  useEffect(() => {
    // 크롬 포트 연결 기반 사이드바 창 생명주기 알림
    // 연결 즉시 오프스크린에서 isSidebarOpen: true 서버 전송
    // 창 닫힐 때 포트 끊김으로 자동으로 isSidebarOpen: false 서버 전송
    const port = chrome.runtime.connect({ name: "sidepanel-port" });

    return () => {
      port.disconnect();
    };
  }, []);

  return (
    <div className="w-full h-screen bg-[#0d131f] text-slate-100 flex flex-col p-4 box-border overflow-hidden select-text font-sans">
      {/* 사이드바 상단 헤더 */}
      <Header />

      {/* 탭 전환 바 */}
      <div className="my-2">
        <TabBar activeTab={activeTab} onSelectTab={setActiveTab} />
      </div>

      {/* 탭 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto my-2 pr-1">
        {/* 기본 수집 탭 */}
        {activeTab === 'basic' && (
          <BasicTab
            isServerOnline={isServerOnline}
            currentUrl={currentUrl}
            isSending={isSending}
            statusMessage={statusMessage}
            onSendFullDom={handleSendFullDom}
          />
        )}

        {/* 브라우저 정보 탭 */}
        {activeTab === 'info' && (
          <InfoTab browserInfo={browserInfo} processorInfo={processorInfo} />
        )}

        {/* 디버그 메시지 송출 탭 */}
        {activeTab === 'debug' && (
          <DebugTab
            debugMessage={debugMessage}
            debugStatus={debugStatus}
            onChangeDebugMessage={setDebugMessage}
            onSendDebugMessage={handleSendDebugMessage}
          />
        )}
      </div>

      {/* 사이드바 하단 푸터 (클라이언트 UUID 표시) */}
      <Footer clientId={clientId} />
    </div>
  );
}

// React 앱 루트 마운트
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <SidePanel />
    </React.StrictMode>
  );
}
```

---

## server/src/services/fileStorageService.ts

```typescript
// server/src/services/fileStorageService.ts

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

/** 파일 저장 옵션 구조체 */
export interface SaveContentOptions {
  /** 노드 전용 물리 저장 경로 (최우선 적용) */
  customNodePath?: string;
  /** 워커 전용 물리 저장 경로 (노드 미지정 시 적용) */
  workerStoragePath?: string;
  /** 글로벌 기본 저장 경로 (기본값: "./storage") */
  globalDefaultPath?: string;
  /** 수집 도메인 (예: "aaa.com") */
  domain: string;
  /** DB 레코드 인덱스 ID (예: 1042) */
  dbLogId: number | string;
  /** 저장할 HTML 원본 소스 문자열 */
  htmlContent: string;
}

/** 파일 저장 결과 구조체 */
export interface SaveContentResult {
  /** 최종 저장된 절대 파일 경로 */
  savedFilePath: string;
  /** 저장된 파일 크기 (Bytes) */
  fileSize: number;
}

/**
 * 윈도우 및 리눅스 디렉터리명에 허용되지 않는 특수문자를 언더스코어로 정화합니다.
 *
 * @param name - 정화할 원본 문자열
 * @returns 안전한 파일/폴더명 문자열
 */
function sanitizeFolderName(name: string): string {
  return (name || "common").replace(/[^a-zA-Z0-9_.-]/g, "_");
}

/**
 * 우선순위(노드 전용 > 워커 전용 > 글로벌 기본)에 따라 물리 저장 경로를 결정하고,
 * 수집된 HTML 콘텐츠를 도메인/ID 구조의 디렉터리에 index.html 파일로 디스크에 보관합니다.
 *
 * @param options - 파일 저장 옵션 객체
 * @returns 저장된 파일 경로 및 크기 정보
 */
export function saveCrawledContentToFile(
  options: SaveContentOptions
): SaveContentResult {
  // 1. 저장소 최상위 루트 경로 결정 (우선순위: 노드 지정 > 워커 지정 > 글로벌 기본)
  const rootPath =
    options.customNodePath && options.customNodePath.trim().length > 0
      ? options.customNodePath
      : options.workerStoragePath && options.workerStoragePath.trim().length > 0
      ? options.workerStoragePath
      : options.globalDefaultPath || "./storage";

  // 2. 도메인 특수문자 정화 후 세부 디렉터리 경로 구성 (예: ./storage/aaa_com/1042/)
  const safeDomain = sanitizeFolderName(options.domain);
  const targetDir = resolve(
    rootPath,
    safeDomain,
    String(options.dbLogId)
  );

  // 3. 대상 디렉터리 없을 경우 재귀적으로 자동 생성
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  // 4. index.html 파일 쓰기 단행
  const targetFilePath = resolve(targetDir, "index.html");
  const buffer = Buffer.from(options.htmlContent, "utf-8");

  writeFileSync(targetFilePath, buffer);

  return {
    savedFilePath: targetFilePath,
    fileSize: buffer.length,
  };
}
```

---

## server/src/services/workerEngineService.ts

```typescript
// server/src/services/workerEngineService.ts

import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { WorkerRecord, CustomFieldDef } from "../database.js";

// ESM 환경에서 __dirname 대체 경로 계산
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 유입 수집 패킷을 담당 워커의 스키마 정의에 맞춰 타깃 DB 및 테이블에 동적으로 인서트합니다.
 * 워커가 지정한 DB 파일을 열고, 커스텀 필드 값을 페이로드로부터 추출하여 INSERT 구문을 동적 구성합니다.
 *
 * @param workerConfig - 담당 워커 레코드 (DB 경로, 테이블명, 스키마 JSON 포함)
 * @param clientId - 수집 노드 UUID
 * @param domain - 수집 도메인
 * @param filePath - 저장된 HTML 물리 파일 경로
 * @param fileSize - 저장된 파일 크기 (Bytes)
 * @param packetPayload - 수집 패킷 페이로드 객체
 */
export function executeWorkerPipeline(
  workerConfig: WorkerRecord,
  clientId: string,
  domain: string,
  filePath: string,
  fileSize: number,
  packetPayload: Record<string, unknown>
): void {
  // 워커가 지정한 DB 파일 절대 경로 계산 (services/ 기준 2단계 위로 이동)
  const targetDbPath = resolve(
    __dirname,
    "..",
    "..",
    workerConfig.db_file_path
  );

  // 타깃 워커 DB 인스턴스 열기
  const targetDb = new Database(targetDbPath);

  // 워커 스키마 JSON에서 커스텀 필드 정의 배열 파싱
  const customFields: CustomFieldDef[] = JSON.parse(
    workerConfig.schema_json || "[]"
  );

  // 기본 컬럼 및 값 목록 초기화
  let cols = "client_id, domain, url, title, file_path, file_size, timestamp";
  let vals = "?, ?, ?, ?, ?, ?, ?";
  const paramValues: unknown[] = [
    clientId,
    domain,
    packetPayload.url || "",
    packetPayload.title || "",
    filePath,
    fileSize,
    Date.now(),
  ];

  // 커스텀 스키마 필드에 해당하는 페이로드 값 동적 추가
  for (const field of customFields) {
    cols += `, ${field.name}`;
    vals += `, ?`;
    paramValues.push(packetPayload[field.name] ?? null);
  }

  // 동적 INSERT 구문 실행
  const query = `INSERT INTO ${workerConfig.table_name} (${cols}) VALUES (${vals})`;
  targetDb.prepare(query).run(...paramValues);
}
```

---

## admin/src/components/layout/Footer.tsx

```tsx
interface FooterProps {
  clientCount: number;
}

export function Footer({ clientCount }: FooterProps) {
  return (
    <footer className="h-8 bg-gray-950 border-t border-gray-800 px-4 flex items-center justify-between text-[11px] text-gray-500">
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
    <div className="min-h-screen bg-[#141A23] text-slate-100 flex flex-col font-sans ">
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
    <header className="h-14 bg-gray-900 border-b border-gray-800 px-4 flex items-center justify-between">
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
      className={`bg-gray-900 border-r border-gray-800 flex flex-col justify-between transition-all duration-200 ${
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* 모달 헤더 */}
        <div className="px-6 py-4 bg-[#111827] border-b border-slate-800 flex justify-between items-center">
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
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-slate-300 text-xs">페이지 전체 DOM 원본 (HTML Source)</span>
              <button
                onClick={() => navigator.clipboard.writeText(fullDomText)}
                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded transition border border-slate-700 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">content_copy</span>
                클립보드 복사
              </button>
            </div>
            <pre className="bg-[#0F172A] p-4 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-[400px] whitespace-pre-wrap break-all leading-relaxed">
              {fullDomText}
            </pre>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="px-6 py-3 bg-[#111827] border-t border-slate-800 flex justify-end">
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

## admin/src/components/modals/NodeConfigModal.tsx

```tsx
// admin/src/components/modals/NodeConfigModal.tsx

import { useState, useEffect } from 'react';
import { Client, WorkerRecord } from '../../types/index.js';

/** 노드 환경설정 모달 컴포넌트 Props */
interface NodeConfigModalProps {
  /** 모달 열림 여부 */
  isOpen: boolean;
  /** 선택된 타깃 클라이언트 객체 */
  client: Client | null;
  /** 선택 가능한 워커 레코드 배열 */
  workers: WorkerRecord[];
  /** 모달 닫기 콜백 */
  onClose: () => void;
  /**
   * 환경설정 저장 콜백 함수
   * @param clientId - 대상 노드 UUID
   * @param alias - 노드 한글 별칭
   * @param assignedWorkerId - 담당 워커 ID
   * @param customStoragePath - 노드 전용 물리 저장 경로
   */
  onSave: (
    clientId: string,
    alias: string,
    assignedWorkerId: string,
    customStoragePath: string
  ) => Promise<boolean>;
}

/**
 * 특정 수집 노드(클라이언트)의 한글 별칭(Alias), 담당 워커, 노드 전용 저장 경로를
 * 개별적으로 설정하는 모달 컴포넌트입니다.
 * Material Symbols 아이콘 및 GCP 다크 테마를 준수합니다.
 */
export function NodeConfigModal({
  isOpen,
  client,
  workers,
  onClose,
  onSave
}: NodeConfigModalProps) {
  // 모달이 닫혀 있거나 타깃 클라이언트 미선택 시 렌더링 생략
  if (!isOpen || !client) return null;

  /** 노드 한글 별칭 입력 상태 */
  const [alias, setAlias] = useState(client.alias || '');
  /** 담당 수집 워커 ID 선택 상태 */
  const [assignedWorkerId, setAssignedWorkerId] = useState(
    client.assigned_worker_id || 'default_worker'
  );
  /** 노드 전용 물리 저장 경로 입력 상태 */
  const [customStoragePath, setCustomStoragePath] = useState(
    client.custom_storage_path || ''
  );
  /** 저장 진행 중 로딩 상태 */
  const [isSaving, setIsSaving] = useState(false);

  // 타깃 클라이언트 변경 시 입력 폼 초기값 동기화
  useEffect(() => {
    setAlias(client.alias || '');
    setAssignedWorkerId(client.assigned_worker_id || 'default_worker');
    setCustomStoragePath(client.custom_storage_path || '');
  }, [client]);

  /** 설정 저장 핸들러: 저장 진행 중 상태 전환 및 콜백 호출 */
  const handleSave = async () => {
    setIsSaving(true);
    await onSave(client.client_id, alias, assignedWorkerId, customStoragePath);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* 모달 헤더 */}
        <div className="px-6 py-4 bg-[#111827] border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400">settings</span>
            노드 환경설정 [{client.client_id.slice(0, 8)}]
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* 모달 입력 폼 바디 */}
        <div className="p-6 flex flex-col gap-4 text-xs font-sans">

          {/* 노드 한글 별칭 입력 */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">노드 한글 별칭 (Alias)</label>
            <input
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="예: 오페라-개인-수집기-1"
              className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded text-slate-100 outline-none focus:border-[#1A73E8]"
            />
          </div>

          {/* 담당 수집 워커 드롭다운 선택 */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">담당 수집 워커 (Worker)</label>
            <select
              value={assignedWorkerId}
              onChange={(e) => setAssignedWorkerId(e.target.value)}
              className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded text-slate-100 outline-none focus:border-[#1A73E8]"
            >
              <option value="default_worker">기본 수집 워커 (Default Worker)</option>
              {workers.map((w) => (
                <option key={w.worker_id} value={w.worker_id}>
                  {w.worker_name} [{w.worker_id}]
                </option>
              ))}
            </select>
          </div>

          {/* 노드 전용 물리 저장 경로 입력 (선택 사항) */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">노드 전용 물리 저장 경로 (선택)</label>
            <input
              value={customStoragePath}
              onChange={(e) => setCustomStoragePath(e.target.value)}
              placeholder="미입력 시 워커/기본 저장 경로 적용 (예: E:\data\opera_node_1)"
              className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded text-slate-100 outline-none focus:border-[#1A73E8] font-mono text-[11px]"
            />
          </div>
        </div>

        {/* 모달 푸터: 취소 및 저장 버튼 */}
        <div className="px-6 py-3 bg-[#111827] border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-[#1A73E8] hover:bg-[#185abc] text-white rounded font-semibold transition"
          >
            {isSaving ? '저장 중...' : '설정 저장'}
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
// admin/src/components/tables/GcpClientsTable.tsx

import { Client, CrawlLog } from '../../types/index.js';

/** GcpClientsTable 컴포넌트 Props */
interface GcpClientsTableProps {
  /** 출력할 클라이언트 데이터 배열 */
  clients: Client[];
  /** 수집 로그 배열 (노드별 최신 수신 데이터 표시용) */
  logs: CrawlLog[];
  /** 콘솔 탭에서 사용할 타깃 노드 선택 콜백 */
  onSelectTarget: (clientId: string) => void;
  /** 클라이언트 차단 추방 콜백 */
  onPurgeClient: (clientId: string) => void;
  /** DOM 데이터 모달 열기 콜백 */
  onOpenDomModal: (clientId: string, log: CrawlLog) => void;
  /** 노드 환경설정 모달 열기 콜백 */
  onOpenConfigModal: (client: Client) => void;
}

/**
 * GCP 콘솔 스타일의 수집 노드 인스턴스 테이블 컴포넌트입니다.
 * 노드 한글 별칭, [환경설정 ⚙️] 모달 연결 버튼, 3대 실시간 상태 배지를 제공합니다.
 */
export function GcpClientsTable({
  clients,
  logs,
  onSelectTarget,
  onPurgeClient,
  onOpenDomModal,
  onOpenConfigModal
}: GcpClientsTableProps) {
  /**
   * 지정 클라이언트의 가장 최근 수집 로그를 검색합니다.
   *
   * @param clientId - 조회할 클라이언트 UUID
   * @returns 최근 로그 객체 또는 undefined
   */
  const getLatestLogForClient = (clientId: string): CrawlLog | undefined => {
    return logs.find((l) => l.client_id === clientId);
  };

  /**
   * 연결 시각 문자열 또는 타임스탬프를 로케일 형식으로 변환합니다.
   *
   * @param dateStr - ISO 문자열 또는 숫자 타임스탬프 문자열
   * @returns 로케일 날짜/시간 문자열
   */
  const formatConnectedDate = (dateStr: string): string => {
    if (!dateStr) return 'N/A';
    const parsedNum = Number(dateStr);
    const date = isNaN(parsedNum) ? new Date(dateStr) : new Date(parsedNum);
    return isNaN(date.getTime()) ? '알 수 없는 시각' : date.toLocaleString();
  };

  return (
    <div className="bg-[#202124] border border-gray-800 rounded shadow-sm overflow-hidden">
      {/* 테이블 헤더 바 */}
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
              <th className="p-3">노드 별칭 / 고유 ID</th>
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
              const isSidebarOpen = !!client.is_sidebar_open;

              return (
                <tr key={client.client_id} className="hover:bg-[#2d2e31] transition">
                  {/* 노드 UUID 앞 4자리 축약 표시 */}
                  <td className="p-3 text-center text-slate-400">{client.client_id.slice(0, 4)}</td>

                  {/* 노드 한글 별칭 및 UUID + [환경설정 ⚙️] 버튼 */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        {/* 별칭 표시 (미지정 시 안내 문구) */}
                        <span className="font-bold text-slate-100 font-sans text-xs">
                          {client.alias || '별칭 미지정 노드'}
                        </span>
                        {/* UUID 전체 표시 */}
                        <span className="text-slate-500 font-mono text-[10px] break-all">
                          {client.client_id}
                        </span>
                      </div>
                      {/* 노드 환경설정 모달 열기 버튼 */}
                      <button
                        onClick={() => onOpenConfigModal(client)}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
                        title="노드 환경설정"
                      >
                        <span className="material-symbols-outlined text-xs">settings</span>
                      </button>
                    </div>
                  </td>

                  {/* 클라이언트 타입 배지 */}
                  <td className="p-3">
                    <span className="bg-slate-800 text-slate-200 text-[10px] px-2 py-0.5 rounded border border-slate-700">
                      {client.client_type}
                    </span>
                  </td>

                  {/* 3대 실시간 노드 상태 배지 (오프라인 / 백그라운드 가동 / 사이드바 활성) */}
                  <td className="p-3 font-sans">
                    {isOnline ? (
                      isSidebarOpen ? (
                        // 온라인 + 사이드바 활성 상태 (파란색 배지)
                        <span className="inline-flex items-center gap-1.5 bg-blue-900/40 text-blue-300 text-[11px] px-2.5 py-1 rounded border border-blue-700/40 font-semibold shadow-sm">
                          <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
                          온라인 (사이드바 활성 🖥️)
                        </span>
                      ) : (
                        // 온라인 + 백그라운드 가동 상태 (초록색 배지)
                        <span className="inline-flex items-center gap-1.5 bg-emerald-900/40 text-emerald-300 text-[11px] px-2.5 py-1 rounded border border-emerald-700/40 font-semibold shadow-sm">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          온라인 (백그라운드 가동 🌙)
                        </span>
                      )
                    ) : (
                      // 연결 끊김 과거 이력 상태 (회색 배지)
                      <span className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-400 text-[11px] px-2.5 py-1 rounded border border-slate-700 font-medium">
                        <span className="h-2 w-2 rounded-full bg-slate-500"></span>
                        연결 끊김 (과거 이력)
                      </span>
                    )}
                  </td>

                  {/* 수신 데이터 알림 버튼 (최신 로그 존재 시 활성화) */}
                  <td className="p-3 font-sans">
                    {latestLog ? (
                      <button
                        onClick={() => onOpenDomModal(client.client_id, latestLog)}
                        className="inline-flex items-center gap-1.5 bg-[#1A73E8] hover:bg-[#185abc] text-white text-[11px] font-semibold px-2.5 py-1 rounded transition shadow-sm cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">notifications_active</span>
                        수신받은 데이터 보기
                      </button>
                    ) : (
                      <span className="text-slate-500 text-[11px]">수신 데이터 없음</span>
                    )}
                  </td>

                  {/* 최초 등록/연결 시간 */}
                  <td className="p-3 text-slate-400 text-[12px]">
                    {formatConnectedDate(client.connected_at)}
                  </td>

                  {/* 작업 버튼 그룹 */}
                  <td className="p-3 text-right font-sans">
                    <div className="flex justify-end gap-2">
                      {/* 원격 지시 콘솔 타깃 선택 */}
                      <button
                        onClick={() => onSelectTarget(client.client_id)}
                        className="bg-gray-800 hover:bg-gray-700 text-xs px-2.5 py-0.5 rounded text-gray-200 transition border border-gray-700"
                      >
                        Select Target
                      </button>
                      {/* 영구 추방 버튼 */}
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
          <div className="p-8 text-center text-gray-500 text-sm font-sans">
            출력 조건에 부합하는 수집 노드 인스턴스가 없습니다.
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
            <div className="text-xs text-gray-400 font-mono truncate">
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
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[600px] font-mono text-xs">
        {logs.map((log) => (
          <div
            key={log.id}
            className="bg-gray-800 p-3 rounded flex flex-col gap-1 border-l-4 border-yellow-500"
          >
            <div className="flex justify-between text-gray-400 text-[10px]">
              <span className="truncate max-w-[300px]">출처: {log.client_id}</span>
              <span>시각: {new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="text-yellow-100 break-all mt-1">
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
// admin/src/components/views/GcpClientsView.tsx

import { useState } from 'react';
import { Client, CrawlLog, WorkerRecord, NodeStatusFilter } from '../../types/index.js';
import { MetricCardsGroup } from '../metrics/MetricCardsGroup.js';
import { GcpClientsTable } from '../tables/GcpClientsTable.js';
import { DomDataModal } from '../modals/DomDataModal.js';
import { NodeConfigModal } from '../modals/NodeConfigModal.js';

/** GcpClientsView 컴포넌트 Props */
interface GcpClientsViewProps {
  /** 클라이언트 데이터 배열 */
  clients: Client[];
  /** 워커 레코드 배열 (노드 환경설정 모달 선택용) */
  workers: WorkerRecord[];
  /** 수집 로그 배열 */
  logs: CrawlLog[];
  /** 전체 로그 건수 */
  logCount: number;
  /** 콘솔 타깃 선택 콜백 */
  onSelectTarget: (clientId: string) => void;
  /** 클라이언트 추방 콜백 */
  onPurgeClient: (clientId: string) => void;
  /** 오프라인 노드 일괄 정화 콜백 */
  onPurgeOfflineClients: () => void;
  /**
   * 노드 환경설정 저장 콜백
   * @param clientId - 대상 노드 UUID
   * @param alias - 노드 한글 별칭
   * @param assignedWorkerId - 담당 워커 ID
   * @param customStoragePath - 노드 전용 물리 저장 경로
   */
  onSaveNodeConfig: (
    clientId: string,
    alias: string,
    assignedWorkerId: string,
    customStoragePath: string
  ) => Promise<boolean>;
}

/**
 * 수집 노드 관리 탭의 메인 뷰 컴포넌트입니다.
 * 메트릭 카드, 노드 출력 필터 스위치, 클라이언트 테이블,
 * DOM 데이터 모달, 노드 환경설정 모달을 통합 제공합니다.
 */
export function GcpClientsView({
  clients,
  workers,
  logs,
  logCount,
  onSelectTarget,
  onPurgeClient,
  onPurgeOfflineClients,
  onSaveNodeConfig
}: GcpClientsViewProps) {
  /** 노드 출력 필터 모드 상태 (기본: 온라인 노드만) */
  const [filterMode, setFilterMode] = useState<NodeStatusFilter>('ONLINE');

  /** DOM 데이터 모달 상태 */
  const [domModalState, setDomModalState] = useState<{
    isOpen: boolean;
    clientId: string;
    log: CrawlLog | null;
  }>({
    isOpen: false,
    clientId: '',
    log: null
  });

  /** 노드 환경설정 모달 상태 */
  const [configModalState, setConfigModalState] = useState<{
    isOpen: boolean;
    client: Client | null;
  }>({
    isOpen: false,
    client: null
  });

  // 필터 모드에 따른 클라이언트 목록 필터링
  const filteredClients = clients.filter((client) => {
    if (filterMode === 'ONLINE') return client.is_online;
    if (filterMode === 'OFFLINE') return !client.is_online;
    return true;
  });

  /** 온라인 노드 수 */
  const onlineCount = clients.filter((c) => c.is_online).length;
  /** 오프라인 노드 수 */
  const offlineCount = clients.filter((c) => !c.is_online).length;

  return (
    <div className="flex flex-col gap-4">
      {/* 상단 메트릭 카드 그룹 */}
      <MetricCardsGroup clientCount={onlineCount} logCount={logCount} />

      {/* 노드 출력 필터 스위치 툴바 */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-[#202124] p-3 rounded border border-gray-800 gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            노드 출력 필터:
          </span>
          {/* 3단 필터 스위치 (온라인/전체/오프라인) */}
          <div className="inline-flex bg-[#111827] p-1 rounded border border-slate-700 gap-1 text-xs">
            <button
              onClick={() => setFilterMode('ONLINE')}
              className={`px-3 py-1 rounded font-semibold transition ${
                filterMode === 'ONLINE'
                  ? 'bg-[#1A73E8] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              온라인 노드만 보기 ({onlineCount})
            </button>
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1 rounded font-semibold transition ${
                filterMode === 'ALL'
                  ? 'bg-[#1A73E8] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              전체 보기 ({clients.length})
            </button>
            <button
              onClick={() => setFilterMode('OFFLINE')}
              className={`px-3 py-1 rounded font-semibold transition ${
                filterMode === 'OFFLINE'
                  ? 'bg-[#1A73E8] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              오프라인 이력만 ({offlineCount})
            </button>
          </div>
        </div>

        {/* 오프라인 노드가 있을 때 일괄 정화 버튼 표시 */}
        {offlineCount > 0 && (
          <button
            onClick={onPurgeOfflineClients}
            className="flex items-center gap-1.5 bg-red-900/40 hover:bg-red-800 text-red-200 text-xs px-3 py-1.5 rounded transition border border-red-700/50 font-medium"
          >
            <span className="material-symbols-outlined text-xs">cleaning_services</span>
            <span>오프라인 노드 이력 정리 ({offlineCount})</span>
          </button>
        )}
      </div>

      {/* 수집 노드 테이블 (필터 적용) */}
      <GcpClientsTable
        clients={filteredClients}
        logs={logs}
        onSelectTarget={onSelectTarget}
        onPurgeClient={onPurgeClient}
        onOpenDomModal={(clientId, log) => setDomModalState({ isOpen: true, clientId, log })}
        onOpenConfigModal={(client) => setConfigModalState({ isOpen: true, client })}
      />

      {/* DOM 데이터 확인 모달 */}
      <DomDataModal
        isOpen={domModalState.isOpen}
        clientId={domModalState.clientId}
        log={domModalState.log}
        onClose={() => setDomModalState({ isOpen: false, clientId: '', log: null })}
      />

      {/* 노드 환경설정 모달 */}
      <NodeConfigModal
        isOpen={configModalState.isOpen}
        client={configModalState.client}
        workers={workers}
        onClose={() => setConfigModalState({ isOpen: false, client: null })}
        onSave={onSaveNodeConfig}
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
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[640px] font-mono text-sm text-slate-200">
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

## admin/src/components/views/WorkerManagerView.tsx

```tsx
// admin/src/components/views/WorkerManagerView.tsx

import { useState } from 'react';
import { WorkerRecord, CustomFieldDef } from '../../types/index.js';

/** 워커 매니저 뷰 Props */
interface WorkerManagerViewProps {
  /** 현재 가동 중인 워커 목록 배열 */
  workers: WorkerRecord[];
  /**
   * 신규 동적 워커 생성 콜백 함수
   * @param params - 워커 생성 파라미터 객체
   */
  onCreateWorker: (params: {
    workerId: string;
    workerName: string;
    dbFileName: string;
    tableName: string;
    storageRootPath: string;
    customFields: CustomFieldDef[];
  }) => Promise<boolean>;
}

/**
 * 수집 워커를 코딩 없이 UI 상에서 동적으로 생성하고,
 * 전용 DB 스키마 테이블과 물리 저장 경로를 구성하는 관리자 뷰 컴포넌트입니다.
 * 기존 워커 현황 테이블과 신규 워커 빌더 입력 폼을 통합 제공합니다.
 */
export function WorkerManagerView({ workers, onCreateWorker }: WorkerManagerViewProps) {
  /** 워커 ID 입력 상태 */
  const [workerId, setWorkerId] = useState('');
  /** 워커 한글 이름 입력 상태 */
  const [workerName, setWorkerName] = useState('');
  /** 바인딩 DB 파일명 입력 상태 */
  const [dbFileName, setDbFileName] = useState('worker_custom.db');
  /** 타깃 테이블명 입력 상태 */
  const [tableName, setTableName] = useState('custom_logs');
  /** 파일 저장소 루트 경로 입력 상태 */
  const [storageRootPath, setStorageRootPath] = useState('./storage/custom_worker');
  /** 커스텀 필드 스키마 정의 배열 상태 */
  const [customFields, setCustomFields] = useState<CustomFieldDef[]>([]);

  /** 커스텀 스키마 필드 동적 추가 */
  const handleAddField = () => {
    setCustomFields([
      ...customFields,
      { name: `field_${customFields.length + 1}`, type: 'TEXT', required: false }
    ]);
  };

  /**
   * 커스텀 스키마 필드 속성 변경
   *
   * @param index - 변경할 필드 인덱스
   * @param key - 변경할 속성 키
   * @param value - 새 속성 값
   */
  const handleFieldChange = (index: number, key: keyof CustomFieldDef, value: unknown) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [key]: value };
    setCustomFields(updated);
  };

  /**
   * 커스텀 스키마 필드 제거
   *
   * @param index - 제거할 필드 인덱스
   */
  const handleRemoveField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  /** 워커 빌드 실행 제출 핸들러 */
  const handleSubmit = async () => {
    if (!workerId || !workerName) {
      alert('워커 ID와 이름을 입력해주세요.');
      return;
    }

    const success = await onCreateWorker({
      workerId,
      workerName,
      dbFileName,
      tableName,
      storageRootPath,
      customFields
    });

    if (success) {
      // 빌드 성공 시 입력 폼 초기화
      setWorkerId('');
      setWorkerName('');
      setCustomFields([]);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">

      {/* 1. 가동 중인 워커 현황 테이블 */}
      <div className="bg-[#202124] border border-gray-800 rounded shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 bg-[#28292c] flex justify-between items-center">
          <span className="font-bold text-xs text-gray-200 tracking-wide uppercase">
            Active Worker Instances ({workers.length})
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#111827] text-slate-300 border-b border-slate-800 text-[11px] font-semibold">
                <th className="p-3">워커 ID</th>
                <th className="p-3">워커 이름</th>
                <th className="p-3">바인딩 DB 파일</th>
                <th className="p-3">테이블명</th>
                <th className="p-3">저장소 루트</th>
                <th className="p-3">기본 워커 여부</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-200 font-mono">
              {workers.map((w) => (
                <tr key={w.worker_id} className="hover:bg-[#2d2e31] transition">
                  <td className="p-3 font-semibold text-blue-300">{w.worker_id}</td>
                  <td className="p-3 font-sans font-medium text-slate-100">{w.worker_name}</td>
                  <td className="p-3 text-slate-300">{w.db_file_path}</td>
                  <td className="p-3 text-yellow-300">{w.table_name}</td>
                  <td className="p-3 text-slate-400 text-[11px] break-all">{w.storage_root_path}</td>
                  <td className="p-3 font-sans">
                    {w.is_default ? (
                      <span className="bg-blue-900/40 text-blue-300 text-[10px] px-2 py-0.5 rounded border border-blue-700/40 font-semibold">
                        Default Worker
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded">
                        Custom Worker
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {workers.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm font-sans">
              등록된 수집 워커가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 2. 신규 워커 동적 빌더 입력 폼 */}
      <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 flex flex-col gap-6 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100">신규 수집 워커 동적 빌더</h2>
            <p className="text-xs text-slate-400">새로운 워커와 전용 DB 스키마 테이블을 동적으로 생성합니다.</p>
          </div>
          <button
            onClick={handleSubmit}
            className="bg-[#1A73E8] hover:bg-[#185abc] text-white text-xs font-semibold px-4 py-2 rounded transition shadow-sm"
          >
            워커 및 DB 빌드 단행
          </button>
        </div>

        {/* 기본 설정 입력 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">워커 ID (영어 식별자)</label>
            <input
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              placeholder="예: worker_facebook"
              className="w-full p-3 bg-[#1E293B] border border-slate-700 rounded text-slate-100 outline-none focus:border-[#1A73E8] font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">워커 한글 이름</label>
            <input
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              placeholder="예: 페이스북 전담 수집 워커"
              className="w-full p-3 bg-[#1E293B] border border-slate-700 rounded text-slate-100 outline-none focus:border-[#1A73E8]"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">대상 DB 파일명 (databases/workers/)</label>
            <input
              value={dbFileName}
              onChange={(e) => setDbFileName(e.target.value)}
              placeholder="예: worker_facebook.db"
              className="w-full p-3 bg-[#1E293B] border border-slate-700 rounded text-slate-100 font-mono outline-none focus:border-[#1A73E8]"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">대상 테이블 이름</label>
            <input
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="예: facebook_posts"
              className="w-full p-3 bg-[#1E293B] border border-slate-700 rounded text-slate-100 font-mono outline-none focus:border-[#1A73E8]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-400 mb-1 font-semibold">워커 전용 파일 저장소 루트 경로</label>
            <input
              value={storageRootPath}
              onChange={(e) => setStorageRootPath(e.target.value)}
              placeholder="예: ./storage/facebook_worker"
              className="w-full p-3 bg-[#1E293B] border border-slate-700 rounded text-slate-100 font-mono outline-none focus:border-[#1A73E8]"
            />
          </div>
        </div>

        {/* 커스텀 스키마 필드 동적 구성 영역 */}
        <div className="bg-[#1E293B] p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-xs text-slate-200">
              커스텀 스키마 필드 정의 (기본 파라미터는 자동 상속)
            </span>
            <button
              onClick={handleAddField}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded transition border border-slate-700"
            >
              <span className="material-symbols-outlined text-xs">add</span>
              <span>필드 추가</span>
            </button>
          </div>

          {/* 커스텀 필드 행 목록 */}
          {customFields.map((field, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 bg-[#0F172A] p-2.5 rounded border border-slate-800 text-xs"
            >
              {/* 필드명 입력 */}
              <input
                value={field.name}
                onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                placeholder="필드명 (예: author_id)"
                className="flex-1 p-2 bg-[#1E293B] border border-slate-700 rounded text-slate-100 font-mono"
              />
              {/* 타입 선택 드롭다운 */}
              <select
                value={field.type}
                onChange={(e) =>
                  handleFieldChange(idx, 'type', e.target.value as "TEXT" | "INTEGER" | "REAL" | "BLOB")
                }
                className="p-2 bg-[#1E293B] border border-slate-700 rounded text-slate-100 font-mono"
              >
                <option value="TEXT">TEXT (문자열)</option>
                <option value="INTEGER">INTEGER (정수)</option>
                <option value="REAL">REAL (실수)</option>
                <option value="BLOB">BLOB (바이너리)</option>
              </select>
              {/* 필드 제거 버튼 */}
              <button
                onClick={() => handleRemoveField(idx)}
                className="p-1.5 bg-red-900/40 hover:bg-red-800 text-red-200 rounded transition"
              >
                <span className="material-symbols-outlined text-xs">delete</span>
              </button>
            </div>
          ))}

          {customFields.length === 0 && (
            <div className="text-center text-slate-500 text-xs py-4">
              추가 커스텀 필드가 없습니다. [필드 추가] 버튼으로 스키마를 확장할 수 있습니다.
            </div>
          )}
        </div>
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
 * Vite 빌드 시점에 자바스크립트 리터럴 상수로 직접 치환 주입되는 플러그인 설정 객체입니다.
 * SERVER_HOST, SERVER_PORT 환경변수가 없으면 로컬 기본값을 사용합니다.
 */
export const PLUGIN_CONFIG = {
  server: {
    /** 백엔드 서버 호스트 (빌드 시점 주입) */
    host: typeof __SERVER_HOST__ !== "undefined" ? __SERVER_HOST__ : "localhost",
    /** 백엔드 서버 포트 번호 (빌드 시점 주입) */
    port: typeof __SERVER_PORT__ !== "undefined" ? __SERVER_PORT__ : 9600,
  },
  popup: {
    /** 팝업 기본 가로 너비 (빌드 시점 주입) */
    width: typeof __POPUP_WIDTH__ !== "undefined" ? __POPUP_WIDTH__ : 360,
    /** 팝업 기본 세로 높이 (빌드 시점 주입) */
    height: typeof __POPUP_HEIGHT__ !== "undefined" ? __POPUP_HEIGHT__ : 480,
    /** 팝업 최소 가로 너비 (빌드 시점 주입) */
    minWidth: typeof __POPUP_MIN_WIDTH__ !== "undefined" ? __POPUP_MIN_WIDTH__ : 320,
    /** 팝업 최소 세로 높이 (빌드 시점 주입) */
    minHeight: typeof __POPUP_MIN_HEIGHT__ !== "undefined" ? __POPUP_MIN_HEIGHT__ : 420,
    /** 팝업 최대 가로 너비 (빌드 시점 주입) */
    maxWidth: typeof __POPUP_MAX_WIDTH__ !== "undefined" ? __POPUP_MAX_WIDTH__ : 600,
    /** 팝업 최대 세로 높이 (빌드 시점 주입) */
    maxHeight: typeof __POPUP_MAX_HEIGHT__ !== "undefined" ? __POPUP_MAX_HEIGHT__ : 700,
  },
} as const;

/**
 * 설정된 호스트와 포트로 오프스크린 웹소켓 접속 URL을 생성합니다.
 *
 * @param clientId - 수집 노드 고유 UUID
 * @returns 웹소켓 접속 URL (예: ws://localhost:9600?clientId=...&clientType=plugin)
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

## plugins/basic-plugin/src/services/backgroundScraper.ts

```typescript
// plugins/basic-plugin/src/services/backgroundScraper.ts

/** 백그라운드 스크래핑 결과 구조체 */
export interface ScrapedPageResult {
  /** 수집 대상 URL */
  url: string;
  /** 페이지 타이틀 */
  title: string;
  /** CSS 셀렉터로 추출된 텍스트 항목 배열 */
  items: string[];
  /** 수집 시점 타임스탬프 */
  timestamp: number;
}

/**
 * 유저의 탭 화면을 이동시키지 않고 백그라운드에서 순수 HTML만 fetch로 인출하여
 * DOMParser로 파싱 및 CSS 셀렉터 기반 요소를 추출합니다.
 * ADR-003: 백그라운드 페치 스크래핑 규격 준수
 *
 * @param targetUrl - 수집 대상 타깃 URL
 * @param selector - 수집할 요소를 지정하는 CSS 셀렉터
 * @returns 인출 정제 결과 객체
 */
export async function scrapePageInBackground(
  targetUrl: string,
  selector: string
): Promise<ScrapedPageResult> {
  // 유저 저장 쿠키 세션을 자동 동봉하여 인증이 필요한 페이지도 수집 가능
  const response = await fetch(targetUrl, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP 요청 에러 발생: status ${response.status}`);
  }

  const htmlText = await response.text();

  // 가상 DOMParser 인스턴스 기동 (화면 렌더링 미발생 - 백그라운드 전용)
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");

  // CSS 셀렉터로 요소 추출 후 텍스트 정제
  const items = Array.from(doc.querySelectorAll(selector))
    .map((el) => el.textContent?.trim() || "")
    .filter((text) => text.length > 0);

  return {
    url: targetUrl,
    title: doc.title || "제목 없음",
    items,
    timestamp: Date.now(),
  };
}
```

---

## plugins/basic-plugin/src/services/chromeService.ts

```typescript
// plugins/basic-plugin/src/services/chromeService.ts

import { BrowserInfo, ProcessorInfo, SocketStatusResponse } from "../types/index.js";

/**
 * 오프스크린 소켓 연결 가동 상태를 백그라운드로 질의합니다.
 *
 * @returns 소켓 연결 상태 응답 객체
 */
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

/**
 * 현재 활성화된 탭의 URL을 인출합니다.
 *
 * @returns 활성 탭 URL 문자열
 */
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

/**
 * 현재 활성 탭으로 전체 DOM 수집 지시(COLLECT_FULL_DOM)를 송출합니다.
 * 콘텐츠 스크립트가 미연결된 경우 안내 메시지를 반환합니다.
 *
 * @returns 수집 처리 결과 객체
 */
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
            // 콘텐츠 스크립트 미연결 상태 안내
            resolve({
              success: false,
              message: "페이지 스크립트 미연결 (페이지 새로고침 후 재시도)",
            });
            return;
          }

          if (response && response.success) {
            resolve({
              success: true,
              message: "페이지 DOM을 성공적으로 전송했습니다.",
            });
          } else {
            resolve({ success: true, message: "DOM 수집 처리 완료" });
          }
        }
      );
    });
  });
}

/**
 * 디버그 커스텀 메시지를 오프스크린 소켓을 거쳐 서버로 송출합니다.
 * SEND_SOCKET_PACKET 메시지 타입으로 백그라운드에 중계합니다.
 *
 * @param parsedJson - 서버로 전송할 JSON 직렬화 가능 데이터
 * @returns 전송 처리 결과 객체
 */
export function sendDebugMessage(
  parsedJson: unknown
): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        type: "SEND_SOCKET_PACKET",
        packet: {
          action: "CRAWL_LOG",
          payloadType: "json",
          payload: { debugMessage: parsedJson },
          meta: { timestamp: Date.now() },
        },
      },
      (res) => {
        if (chrome.runtime.lastError) {
          resolve({
            success: false,
            message: "전송 실패: 백그라운드 엔진 오프라인",
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
      }
    );
  });
}

/**
 * 브라우저 플랫폼 및 시스템 스펙 정보를 추출합니다.
 *
 * @returns 브라우저 스펙 정보 객체
 */
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

/**
 * 브라우저 프로세서 및 디바이스 성능 스펙 정보를 추출합니다.
 *
 * @returns 프로세서 성능 정보 객체
 */
export function extractProcessorInfo(): ProcessorInfo {
  // deviceMemory는 비표준 속성으로 타입 캐스팅 처리
  const nav = navigator as Navigator & { deviceMemory?: number };
  return {
    hardwareConcurrency: navigator.hardwareConcurrency || 1,
    deviceMemory: nav.deviceMemory,
    maxTouchPoints: navigator.maxTouchPoints || 0,
  };
}
```

---

## plugins/basic-plugin/src/services/githubService.ts

```typescript
// plugins/basic-plugin/src/services/githubService.ts

/** GitHub 파일 커밋 옵션 구조체 */
export interface CommitFileOptions {
  /** GitHub Personal Access Token (PAT) */
  token: string;
  /** GitHub 계정 또는 조직명 */
  owner: string;
  /** 타깃 저장소 이름 */
  repo: string;
  /** 저장소 내 파일 상대 경로 (예: "crawled/data.json") */
  filePath: string;
  /** 텍스트/JSON 파일 내용 */
  content: string;
  /** 커밋 메시지 */
  commitMessage: string;
}

/** GitHub 파일 커밋 실행 결과 구조체 */
export interface CommitFileResult {
  /** 실행 성공 여부 */
  success: boolean;
  /** 성공 시 커밋 SHA */
  commitSha?: string;
  /** 성공 시 파일 HTML URL */
  contentUrl?: string;
  /** 실패 시 오류 메시지 */
  errorMessage?: string;
}

/**
 * 수집된 데이터를 GitHub REST API를 통해 지정 저장소로 자동 커밋/푸시합니다.
 * 기존 파일이 있을 경우 SHA를 취득하여 업데이트(PUT)하고, 없을 경우 신규 생성합니다.
 * ADR-003: 백그라운드 페치 스크래핑 및 깃허브 동기화 규격 준수
 *
 * @param options - 커밋 옵션 객체
 * @returns 커밋 실행 결과
 */
export async function commitFileToGithub({
  token,
  owner,
  repo,
  filePath,
  content,
  commitMessage,
}: CommitFileOptions): Promise<CommitFileResult> {
  try {
    // 텍스트 콘텐츠를 Base64로 인코딩 (GitHub API 요구사항)
    const base64Content = btoa(unescape(encodeURIComponent(content)));
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    // 기존 파일 존재 여부 확인 (sha 취득 - 업데이트 시 필요)
    let existingSha: string | undefined = undefined;
    try {
      const getRes = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      if (getRes.ok) {
        const getJson = await getRes.json();
        existingSha = getJson.sha;
      }
    } catch {
      // 신규 파일 처리 (sha 취득 실패 무시)
    }

    // PUT 요청 바디 구성 (기존 파일 있을 경우 sha 포함)
    const bodyPayload: Record<string, unknown> = {
      message: commitMessage,
      content: base64Content,
    };
    if (existingSha) {
      bodyPayload.sha = existingSha;
    }

    // GitHub API PUT 요청 단행
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify(bodyPayload),
    });

    const json = await response.json();

    if (response.ok) {
      return {
        success: true,
        commitSha: json.commit?.sha,
        contentUrl: json.content?.html_url,
      };
    } else {
      return {
        success: false,
        errorMessage: json.message || "GitHub API 오류 발생",
      };
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "네트워크 예외";
    return { success: false, errorMessage: msg };
  }
}

/**
 * GitHub Actions 워크플로를 원격으로 실행(dispatch)합니다.
 *
 * @param token - GitHub PAT
 * @param owner - 계정명
 * @param repo - 저장소명
 * @param workflowId - 워크플로 파일명 또는 ID
 * @param ref - 브랜치명 (기본값: "main")
 * @returns 실행 트리거 성공 여부
 */
export async function triggerGithubWorkflow(
  token: string,
  owner: string,
  repo: string,
  workflowId: string,
  ref: string = "main"
): Promise<boolean> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({ ref }),
    });
    return response.ok;
  } catch {
    return false;
  }
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

## plugins/basic-plugin/src/types/index.ts

```typescript
// plugins/basic-plugin/src/types/index.ts

/** 패킷 페이로드 물리 데이터 포맷 구별자 */
export type PayloadType = "json" | "binary_base64" | "raw_text" | "chunk_stream";

/** 파일 및 바이너리 자원 송수신 메타데이터 인터페이스 */
export interface FileMetadata {
  /** 원본 파일명 */
  fileName?: string;
  /** 파일 MIME 타입 */
  mimeType?: string;
  /** 파일 크기 (Bytes) */
  fileSize?: number;
  /** 대용량 파일 분할 조각 인덱스 */
  chunkIndex?: number;
  /** 전체 분할 조각 수 */
  totalChunks?: number;
}

/** 패킷 확장 메타데이터 인터페이스 */
export interface PacketMetadata {
  /** 패킷 생성 시점 타임스탬프 */
  timestamp: number;
  /** 요청 추적 고유 ID */
  traceId?: string;
  /** 첨부 파일 메타데이터 */
  fileMeta?: FileMetadata;
  /** 동적 확장 파라미터 맵 */
  extraParams?: Record<string, unknown>;
}

/**
 * 표준 확장형 웹소켓 통신 패킷 봉투 규격 (ADR-002)
 * senderId, targetId, action, payloadType, payload, meta 구조를 준수합니다.
 */
export interface WebSocketPacket<T = unknown> {
  /** 송신 수집 노드 고유 UUID (clientId) */
  senderId: string;
  /** 수신 타깃 식별자 (ALL, SERVER, 또는 특정 UUID) */
  targetId?: string | "ALL" | "SERVER";
  /** 지시 액션 명령 문자열 */
  action: string;
  /** 페이로드 물리 포맷 */
  payloadType: PayloadType;
  /** 실질 데이터 바디 */
  payload: T;
  /** 확장 메타데이터 객체 */
  meta: PacketMetadata;
}

/** 사이드바 대시보드 탭 구분 타입 */
export type TabType = "basic" | "info" | "debug";

/** 웹소켓 연결 상태 응답 객체 */
export interface SocketStatusResponse {
  /** 소켓 연결 여부 */
  connected: boolean;
  /** 클라이언트 고유 UUID */
  clientId?: string;
  /** 서버 포트 번호 */
  port?: number;
}

/** 브라우저 스펙 정보 객체 */
export interface BrowserInfo {
  /** 유저 에이전트 문자열 */
  userAgent: string;
  /** 브라우저 언어 설정 */
  language: string;
  /** 운영체제 플랫폼 */
  platform: string;
  /** 브라우저 벤더 */
  vendor: string;
  /** 쿠키 활성화 여부 */
  cookieEnabled: boolean;
  /** 네트워크 연결 상태 */
  onlineStatus: boolean;
}

/** 브라우저 프로세서 성능 정보 객체 */
export interface ProcessorInfo {
  /** CPU 논리 코어 수 */
  hardwareConcurrency: number;
  /** 디바이스 메모리 (GB, 선택) */
  deviceMemory?: number;
  /** 최대 터치 포인트 수 */
  maxTouchPoints: number;
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
    <div className="h-12 bg-[#161C27] border-b border-slate-800 px-5 flex items-center justify-between text-sm text-slate-200 shadow-sm">
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
    <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
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
    <div className="flex items-center gap-2">
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
    <div className="relative">
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
    <header className="h-14 bg-[#0F172A] text-white flex items-center justify-between px-4 shadow-sm z-50">
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
// admin/src/components/layout/Sidebar/Sidebar.tsx

import { ActiveTab } from '../../../types/index.js';

/** 사이드바 컴포넌트 Props */
interface SidebarProps {
  /** 사이드바 접힘 여부 */
  isCollapsed: boolean;
  /** 사이드바 접기/펼치기 토글 콜백 */
  onToggleCollapse: () => void;
  /** 현재 활성화된 메인 탭 */
  activeTab: ActiveTab;
  /** 탭 선택 콜백 */
  onSelectTab: (tab: ActiveTab) => void;
  /** 수집 노드 클라이언트 수 (배지용) */
  clientCount: number;
}

/**
 * 좌측 네비게이션 사이드바 컴포넌트입니다.
 * 수집 노드 관리, 워커 & DB 매니저, 원격 지시 콘솔, 수집 로그 탭을 제공합니다.
 * 접기/펼치기 기능으로 화면 공간을 효율적으로 활용합니다.
 * Material Symbols Outlined 아이콘 및 GCP 다크 테마를 준수합니다.
 */
export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  activeTab,
  onSelectTab,
  clientCount
}: SidebarProps) {
  return (
    <aside
      className={`bg-[#111827] border-r border-slate-800 flex flex-col justify-between transition-all duration-200 shadow-sm ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col py-4">

        {/* [1] 수집 노드 관리 탭 */}
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
              {/* 클라이언트 수 배지 */}
              <span className="bg-slate-900/70 text-slate-300 text-[10px] px-2 py-0.5 rounded-full border border-slate-800">
                {clientCount}
              </span>
            </div>
          )}
        </button>

        {/* [2] 워커 & DB 매니저 탭 */}
        <button
          onClick={() => onSelectTab('workers')}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${
            activeTab === 'workers'
              ? 'bg-slate-800 text-[#1A73E8] border-l-4 border-[#1A73E8]'
              : 'text-slate-300 hover:bg-slate-900'
          }`}
        >
          <span className="material-symbols-outlined">precision_manufacturing</span>
          {!isCollapsed && <span>워커 &amp; DB 매니저</span>}
        </button>

        {/* [3] 원격 지시 콘솔 탭 */}
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

        {/* [4] 수집 로그 탭 */}
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

      {/* 사이드바 접기/펼치기 토글 버튼 */}
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

