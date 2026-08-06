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
