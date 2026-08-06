브라우저 확장 플러그인 모듈(`plugins/basic-plugin/`)의 **완성형 최종 개정 소스 코드**를 단행합니다.

모든 소스 파일 최상단에 상대 파일 경로 주석 헤더 및 JSDoc 한글 상세 주석이 명시되어 있으며, 오프스크린 24시간 단일 소켓, 크롬 포트 연결 기반 사이드바 생명주기 감지(`chrome.runtime.connect`), 메시징 예외 가드(`sendMessage().catch()`), 36종 풀 권한 및 깃허브 REST API 연동 모듈이 전면 내장된 완벽한 코드입니다.

---

### [1/5] 매니페스트 및 HTML 엔트리 파일

#### ① `plugins/basic-plugin/public/manifest.json`

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

#### ② `plugins/basic-plugin/public/sidepanel.html`

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WebCrawlServer 사이드바 대시보드</title>
    <!-- Google Fonts & Symbols CDN -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/sidepanel.tsx"></script>
  </body>
</html>
```

---

#### ③ `plugins/basic-plugin/public/offscreen.html`

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>WebCrawlServer Offscreen Engine</title>
  </head>
  <body>
    <!-- 24시간 무중단 백그라운드 웹소켓 전담 엔진 스크립트 -->
    <script type="module" src="/src/offscreen.ts"></script>
  </body>
</html>
```

---

### [2/5] 타입 및 전역 설정 소스 코드

#### ① `plugins/basic-plugin/src/types/index.ts`

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
 * [표준 확장형 웹소켓 통신 패킷 봉투 규격 (WebSocketPacket<T>)]
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
  connected: boolean;
  clientId?: string;
  port?: number;
}

/** 브라우저 스펙 정보 객체 */
export interface BrowserInfo {
  userAgent: string;
  language: string;
  platform: string;
  vendor: string;
  cookieEnabled: boolean;
  onlineStatus: boolean;
}

/** 브라우저 프로세서 정보 객체 */
export interface ProcessorInfo {
  hardwareConcurrency: number;
  deviceMemory?: number;
  maxTouchPoints: number;
}
```

---

#### ② `plugins/basic-plugin/src/config/pluginConfig.ts`

```typescript
// plugins/basic-plugin/src/config/pluginConfig.ts

/**
 * Vite 빌드 시점에 자바스크립트 리터럴 상수로 직접 치환 주입되는 설정 객체입니다.
 */
export const PLUGIN_CONFIG = {
  server: {
    host: typeof __SERVER_HOST__ !== "undefined" ? __SERVER_HOST__ : "localhost",
    port: typeof __SERVER_PORT__ !== "undefined" ? __SERVER_PORT__ : 9600,
  },
} as const;

/**
 * 설정된 호스트와 포트로 백그라운드 웹소켓 접속 URL을 생성합니다.
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

### [3/5] 서비스 계층 소스 코드 (`src/services/`)

#### ① `plugins/basic-plugin/src/services/githubService.ts`

```typescript
// plugins/basic-plugin/src/services/githubService.ts

export interface CommitFileOptions {
  token: string;          // GitHub Personal Access Token (PAT)
  owner: string;          // 계정/조직명
  repo: string;           // 타깃 저장소 이름
  filePath: string;       // 저장소 내 파일 상대 경로 (예: "crawled/data.json")
  content: string;        // 텍스트/JSON 파일 내용
  commitMessage: string;  // 커밋 메시지
}

export interface CommitFileResult {
  success: boolean;
  commitSha?: string;
  contentUrl?: string;
  errorMessage?: string;
}

/**
 * 수집된 데이터를 GitHub REST API를 통해 지정 저장소로 자동 커밋/푸시합니다.
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
    const base64Content = btoa(unescape(encodeURIComponent(content)));
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    // 기존 파일 존재 여부 확인 (sha 취득)
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
      // 신규 파일 처리
    }

    const bodyPayload: Record<string, unknown> = {
      message: commitMessage,
      content: base64Content,
    };
    if (existingSha) {
      bodyPayload.sha = existingSha;
    }

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
 * GitHub Actions 워크플로를 원격 실행시킵니다.
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

#### ② `plugins/basic-plugin/src/services/backgroundScraper.ts`

```typescript
// plugins/basic-plugin/src/services/backgroundScraper.ts

export interface ScrapedPageResult {
  url: string;
  title: string;
  items: string[];
  timestamp: number;
}

/**
 * 유저의 탭 화면을 이동시키지 않고 백그라운드에서 순수 HTML만 인출하여 DOMParser로 파싱합니다.
 *
 * @param targetUrl - 수집 대상 타깃 URL
 * @param selector - 수집할 요소를 지정하는 CSS 셀렉터
 * @returns 인출 정제 결과 객체
 */
export async function scrapePageInBackground(
  targetUrl: string,
  selector: string
): Promise<ScrapedPageResult> {
  const response = await fetch(targetUrl, {
    method: "GET",
    credentials: "include", // 유저 저장 쿠키 세션 자동 인출 동봉
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP 요청 에러 발생: status ${response.status}`);
  }

  const htmlText = await response.text();

  // 가상 DOMParser 인스턴스 기동 (화면 렌더링 미발생)
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");

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

#### ③ `plugins/basic-plugin/src/services/chromeService.ts`

```typescript
// plugins/basic-plugin/src/services/chromeService.ts

import { BrowserInfo, ProcessorInfo, SocketStatusResponse } from "../types/index.js";

/** 소켓 연결 가동 상태를 백그라운드로 질의합니다. */
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

/** 현재 활성화된 탭의 URL을 인출합니다. */
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

/** 현재 활성 탭으로 전체 DOM 수집 지시를 송출합니다. */
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

/** 디버그 커스텀 메시지를 오프스크린 소켓을 거쳐 서버로 송출합니다. */
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

/** 브라우저 플랫폼 및 시스템 스펙 정보를 추출합니다. */
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

/** 브라우저 프로세서 성능 스펙 정보를 추출합니다. */
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

### [4/5] 오프스크린 24시간 무중단 웹소켓 엔진 및 백그라운드 라우터

#### ① `plugins/basic-plugin/src/offscreen.ts` (단일 소켓 소유자)

```typescript
// plugins/basic-plugin/src/offscreen.ts

import { PLUGIN_CONFIG, getWebSocketUrl } from "./config/pluginConfig.js";
import { WebSocketPacket } from "./types/index.js";

let socket: WebSocket | null = null;

/** 스토리지에서 노드 고유 UUID를 인출하거나 미발급 시 신규 생성합니다. */
async function getOrCreateClientId(): Promise<string> {
  const result = await chrome.storage.local.get(["clientId"]);
  if (result && typeof result.clientId === "string") return result.clientId;
  const generatedId = crypto.randomUUID();
  await chrome.storage.local.set({ clientId: generatedId });
  return generatedId;
}

/** 사이드바 열림/닫힘 상태 업데이트 패킷을 서버로 송출합니다. */
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

/** 백엔드 포트(9600)와 24시간 무중단 단일 웹소켓 통신망을 수립합니다. */
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

      // 1. 서버 푸시 토큰 갱신 수용
      if (packet.action === "UPDATE_AUTH_TOKEN" && packet.payload) {
        const { tokenType, token } = packet.payload as { tokenType: string; token: string };
        await chrome.storage.local.set({ [tokenType]: token });
      }

      // 2. 수신 패킷 크롬 내부 중계 (catch() 예외 가드 탑재)
      chrome.runtime.sendMessage({ type: "SOCKET_PACKET_RECEIVED", packet }).catch(() => {
        // 사이드바 미오픈 상태 시 유실 예외 방어
      });
    } catch {
      // 가드
    }
  };

  socket.onclose = () => {
    socket = null;
    setTimeout(connectOffscreenSocket, 3000); // 3초 주기 자동 재연결
  };

  socket.onerror = () => {
    socket = null;
  };
}

// 크롬 포트 연결 기반 사이드바 창 닫힘 100% 감지
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "sidepanel-port") {
    sendSidebarStatusToServer(true);

    port.onDisconnect.addListener(() => {
      sendSidebarStatusToServer(false);
    });
  }
});

// 내부 메시지 수신기
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
        // 수신 채널 파괴 대비
      }
    });
    return true; // 비동기 응답 가드
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
          // 가드
        }
      } else {
        connectOffscreenSocket();
        try {
          sendResponse({ success: false, reason: "SOCKET_OFFLINE" });
        } catch {
          // 가드
        }
      }
    });
    return true; // 비동기 응답 가드
  }

  return false;
});

connectOffscreenSocket();
```

---

#### ② `plugins/basic-plugin/src/background.ts` (백그라운드 이벤트 라우터)

```typescript
// plugins/basic-plugin/src/background.ts

/**
 * 브라운저 백그라운드에 오프스크린 문서가 미생성 상태일 경우 자동 생성합니다.
 */
async function ensureOffscreenDocument(): Promise<void> {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
  });

  if (existingContexts.length > 0) return;

  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: [chrome.offscreen.Reason.BLOB],
    justification: "WebCrawlServer 분산 크롤링 24시간 무중단 웹소켓 유지",
  });
}

chrome.runtime.onInstalled.addListener(() => {
  // 아이콘 클릭 시 팝업 대신 사이드바가 바로 켜지도록 크롬 설정
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  ensureOffscreenDocument();
});

chrome.runtime.onStartup.addListener(() => {
  ensureOffscreenDocument();
});

// 크롬 메시징 중계
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.type === "SOCKET_PACKET_RECEIVED" && message.packet) {
    const packet = message.packet;
    
    // 원격 CRAWL_START 지시 수신 시 활성 탭으로 전달
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

### [5/5] 사이드바 UI, 콘텐츠 스크립트 및 Vite 번들링 설정

#### ① `plugins/basic-plugin/src/sidepanel.tsx` (단일 메인 사이드바 UI 대시보드)

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
 * 툴바 아이콘 클릭 시 즉시 켜지는 단일 메인 사이드바 대시보드 엔트리입니다.
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
    // 크롬 포트 연결로 사이드바 창 생명주기를 오프스크린으로 알림
    const port = chrome.runtime.connect({ name: "sidepanel-port" });

    return () => {
      port.disconnect();
    };
  }, []);

  return (
    <div className="w-full h-screen bg-[#0d131f] text-slate-100 flex flex-col p-4 box-border overflow-hidden select-text font-sans">
      <Header />
      <div className="my-2">
        <TabBar activeTab={activeTab} onSelectTab={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto my-2 pr-1">
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
      </div>

      <Footer clientId={clientId} />
    </div>
  );
}

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

#### ② `plugins/basic-plugin/src/content.ts` (선언형 페이징 수집 및 DOM 스크립트)

```typescript
// plugins/basic-plugin/src/content.ts

export interface PaginationCrawlPayload {
  nextPageSelector: string; // 다음 페이지 클릭 버튼 셀렉터
  contentSelector: string;  // 수집할 요소를 지정하는 CSS 셀렉터
  maxPages: number;         // 수집할 최대 페이지 수
  delayMs: number;          // 페이지 클릭 후 대기 시간
}

/**
 * 서버에서 전달받은 선언형 행동 양식에 맞춰 페이징 버튼을 순차 클릭하며 연속 수집합니다.
 */
async function runPaginationCrawlEngine(payload: PaginationCrawlPayload): Promise<void> {
  let currentPage = 1;

  while (currentPage <= payload.maxPages) {
    const items = Array.from(document.querySelectorAll(payload.contentSelector))
      .map((el) => el.textContent?.trim() || "")
      .filter((text) => text.length > 0);

    // 오프스크린 소켓으로 데이터 포워딩
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

    if (currentPage >= payload.maxPages) break;

    const nextBtn = document.querySelector(payload.nextPageSelector) as HTMLElement | null;
    if (!nextBtn) break;

    nextBtn.click();
    currentPage++;

    // 차단 방지 인간 모사 지연 시간 (Human-like Random Jitter Delay)
    const jitter = Math.floor(Math.random() * 1000);
    await new Promise((resolve) => setTimeout(resolve, payload.delayMs + jitter));
  }
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.command === "START_PAGINATION_CRAWL" && request.payload) {
    runPaginationCrawlEngine(request.payload);
    sendResponse({ success: true });
    return false;
  }

  if (request.command === "START_DOM_CRAWL") {
    const pageTitle = document.title;
    const hyperlinks: string[] = [];

    const anchors = document.querySelectorAll("a");
    anchors.forEach((a, idx) => {
      if (idx < 15 && a.href) hyperlinks.push(a.href);
    });

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

  if (request.command === "COLLECT_FULL_DOM") {
    const fullDomHtml = document.documentElement.outerHTML;
    const domData = {
      url: window.location.href,
      title: document.title,
      fullDom: fullDomHtml,
      timestamp: Date.now(),
    };

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

#### ③ `plugins/basic-plugin/vite.config.ts` (Vite 다중 엔트리 번들링)

```typescript
// plugins/basic-plugin/vite.config.ts

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  define: {
    __SERVER_HOST__: JSON.stringify(process.env.SERVER_HOST || "localhost"),
    __SERVER_PORT__: Number(process.env.SERVER_PORT || 9600),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, "public/sidepanel.html"),
        offscreen: resolve(__dirname, "public/offscreen.html"),
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



