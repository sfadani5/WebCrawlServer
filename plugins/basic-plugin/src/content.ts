// 백그라운드 워커의 지시를 수신하여 현재 로드된 타깃 웹페이지의 제목과 하이퍼링크 리스트를 긁어 전달
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (messageCommandIsStart(request)) {
    const pageTitle = document.title;
    const hyperlinks: string[] = [];

    const anchors = document.querySelectorAll("a");
    anchors.forEach((a, idx) => {
      if (idx < 15 && a.href) hyperlinks.push(a.href); // 경량 노트북 연산 부하 방지를 위해 15개 제한 검사
    });

    // 획득한 원천 데이터를 백그라운드 브릿지 파이프라인으로 릴레이 이송
    chrome.runtime.sendMessage({
      type: "RAW_DOM_DATA",
      data: {
        url: window.location.href,
        title: pageTitle,
        links: hyperlinks,
        timestamp: Date.now(),
      },
    });
  } else if (isContentMessage(request) && request.command === "COLLECT_FULL_DOM") {
    // 페이지 전체 DOM (outerHTML) 수집 단행
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

    sendResponse({ success: true, data: domData });
  }
  return true;
});

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
