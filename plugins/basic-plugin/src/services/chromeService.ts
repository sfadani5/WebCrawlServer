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
