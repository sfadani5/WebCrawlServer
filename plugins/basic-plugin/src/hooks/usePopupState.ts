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
