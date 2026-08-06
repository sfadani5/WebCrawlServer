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
 * 미발급 상태일 경우 신규 UUID를 생성하여 저장합니다.
 *
 * @returns 클라이언트 고유 UUID 문자열
 */
async function getOrCreateClientId(): Promise<string> {
  const result = await chrome.storage.local.get(["clientId"]);
  if (result && typeof result.clientId === "string") return result.clientId;
  // 신규 UUID 생성 및 영구 저장
  const generatedId = crypto.randomUUID();
  await chrome.storage.local.set({ clientId: generatedId });
  return generatedId;
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
  // 이미 연결 중이거나 접속 시도 중일 경우 중복 시도 방지
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;

  const clientId = await getOrCreateClientId();
  const wsUrl = getWebSocketUrl(clientId);
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    // 연결 성공 시 초기 안착 패킷 전송
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

      // 1. 서버 푸시 인증 토큰 갱신 수용 (ADR-003 깃허브 토큰 동기화)
      if (packet.action === "UPDATE_AUTH_TOKEN" && packet.payload) {
        const { tokenType, token } = packet.payload as { tokenType: string; token: string };
        await chrome.storage.local.set({ [tokenType]: token });
      }

      // 2. 수신 패킷 크롬 내부 중계 (catch() 예외 가드: 사이드바 미오픈 시 유실 방어)
      chrome.runtime.sendMessage({ type: "SOCKET_PACKET_RECEIVED", packet }).catch(() => {
        // 사이드바 미오픈 상태에서의 sendMessage 실패는 정상 동작 - 무시
      });
    } catch {
      // 패킷 파싱 예외 가드
    }
  };

  socket.onclose = () => {
    socket = null;
    // 3초 주기 자동 재연결
    setTimeout(connectOffscreenSocket, 3000);
  };

  socket.onerror = () => {
    socket = null;
  };
}

/**
 * 크롬 포트 연결 기반 사이드바 창 닫힘 100% 감지 리스너
 * sidepanel.tsx에서 chrome.runtime.connect({ name: "sidepanel-port" })로 연결
 */
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "sidepanel-port") {
    // 사이드바 열림 알림
    sendSidebarStatusToServer(true);

    // 포트 연결 끊김(창 닫힘) 시 닫힘 알림
    port.onDisconnect.addListener(() => {
      sendSidebarStatusToServer(false);
    });
  }
});

/**
 * 크롬 내부 메시지 수신기 (백그라운드 및 사이드바로부터의 요청 처리)
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // [1] 소켓 연결 상태 질의
  if (message.type === "GET_SOCKET_STATUS") {
    getOrCreateClientId().then((clientId) => {
      try {
        sendResponse({
          connected: socket !== null && socket.readyState === WebSocket.OPEN,
          clientId,
          port: PLUGIN_CONFIG.server.port,
        });
      } catch {
        // 수신 채널 이미 파괴된 경우 방어
      }
    });
    return true; // 비동기 응답을 위해 true 반환
  }

  // [2] 패킷 송출 요청 (사이드바/콘텐츠 스크립트 → 오프스크린 → 서버)
  if (message.type === "SEND_SOCKET_PACKET" && message.packet) {
    getOrCreateClientId().then((clientId) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        // 완전한 패킷 봉투 구조로 조립
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
          // 채널 닫힘 방어
        }
      } else {
        // 소켓 미연결 시 재연결 시도 후 실패 응답
        connectOffscreenSocket();
        try {
          sendResponse({ success: false, reason: "SOCKET_OFFLINE" });
        } catch {
          // 채널 닫힘 방어
        }
      }
    });
    return true; // 비동기 응답을 위해 true 반환
  }

  return false;
});

// 오프스크린 문서 로드 즉시 소켓 연결 초기화
connectOffscreenSocket();
