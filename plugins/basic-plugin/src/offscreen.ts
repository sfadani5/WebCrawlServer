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
 * 백엔드 포트(9700)와 24시간 무중단 단일 웹소켓 통신망을 수립합니다.
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