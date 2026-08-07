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

/**
 * 플러그인 팝업 상태 훅을 초기화하고 관리합니다.
 *
 * @returns 팝업 UI와 연동하기 위한 상태와 핸들러들을 포함하는 객체
 */
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

  /**
 * 웹소켓 서버 연결 상태를 확인하고 클라이언트 ID를 업데이트합니다.
 * @returns Promise<void>
 */
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

  /**
 * 전체 DOM을 수집하도록 서버에 요청하고 상태 메시지를 업데이트합니다.
 * @returns Promise<void>
 */
const handleSendFullDom = useCallback(async () => {
    setIsSending(true);
    setStatusMessage("페이지 DOM 수집 중...");

    const res = await requestCollectFullDom();
    setStatusMessage(res.message);
    setIsSending(false);

    await checkSocketStatus();
  }, [checkSocketStatus]);

  /**
 * 현재 시각을 ISO 8601 형식 문자열로 반환합니다.
 * @returns 현재 시각 문자열
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

  /**
 * 사용자가 입력한 디버그 메시지를 JSON으로 파싱해 서버에 전송합니다.
 * 파싱 오류 발생 시 상태를 업데이트합니다.
 * @returns Promise<void>
 */
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
