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
