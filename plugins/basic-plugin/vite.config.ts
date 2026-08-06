// plugins/basic-plugin/vite.config.ts

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/**
 * 브라우저 확장 플러그인 Vite 번들링 설정입니다.
 * 다중 엔트리 포인트(sidepanel, offscreen, background, content)를 개별 JS 파일로 번들링합니다.
 * R-00450: Vite define 기반 빌드 타임 상수 주입 및 다중 엔트리 지침 준수
 */
export default defineConfig({
  plugins: [react()],
  define: {
    // 서버 호스트/포트 빌드 타임 리터럴 상수 주입
    __SERVER_HOST__: JSON.stringify(process.env.SERVER_HOST || "localhost"),
    __SERVER_PORT__: Number(process.env.SERVER_PORT || 9600),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // 사이드바 UI 엔트리 (사용자 대화 화면)
        sidepanel: resolve(__dirname, "public/sidepanel.html"),
        // 오프스크린 24시간 무중단 웹소켓 엔진 엔트리
        offscreen: resolve(__dirname, "public/offscreen.html"),
        // 백그라운드 서비스 워커 엔트리
        background: resolve(__dirname, "src/background.ts"),
        // 콘텐츠 스크립트 엔트리 (DOM 수집 및 지시 수신)
        content: resolve(__dirname, "src/content.ts"),
      },
      output: {
        // 청크 파일명 포맷 규칙 (크롬 확장 manifest.json 참조 일치)
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
});
