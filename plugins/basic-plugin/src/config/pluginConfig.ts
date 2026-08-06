// plugins/basic-plugin/src/config/pluginConfig.ts

/**
 * 빌드 시점에 자바스크립트 리터럴로 직접 치환되는 플러그인 설정 상수 객체입니다.
 */
export const PLUGIN_CONFIG = {
  popup: {
    width: typeof __POPUP_WIDTH__ !== "undefined" ? __POPUP_WIDTH__ : 360,
    height: typeof __POPUP_HEIGHT__ !== "undefined" ? __POPUP_HEIGHT__ : 480,
    minWidth:
      typeof __POPUP_MIN_WIDTH__ !== "undefined" ? __POPUP_MIN_WIDTH__ : 320,
    minHeight:
      typeof __POPUP_MIN_HEIGHT__ !== "undefined" ? __POPUP_MIN_HEIGHT__ : 420,
    maxWidth:
      typeof __POPUP_MAX_WIDTH__ !== "undefined" ? __POPUP_MAX_WIDTH__ : 600,
    maxHeight:
      typeof __POPUP_MAX_HEIGHT__ !== "undefined" ? __POPUP_MAX_HEIGHT__ : 700,
  },
  server: {
    host:
      typeof __SERVER_HOST__ !== "undefined" ? __SERVER_HOST__ : "localhost",
    port: typeof __SERVER_PORT__ !== "undefined" ? __SERVER_PORT__ : 9600,
  },
} as const;

/**
 * 설정된 호스트와 포트로 WebSocket 접속 URL을 생성합니다.
 */
export function getWebSocketUrl(clientId: string): string {
  const { host, port } = PLUGIN_CONFIG.server;
  return `ws://${host}:${port}?clientId=${clientId}&clientType=plugin`;
}
