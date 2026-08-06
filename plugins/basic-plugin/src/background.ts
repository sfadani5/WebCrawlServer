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
