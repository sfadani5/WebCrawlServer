// plugins/basic-plugin/vite.config.ts

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/**
 * 브라우저 확장 플러그인 Vite 번들링 설정입니다.
 * HTML 엔트리 포인트(sidepanel, offscreen)를 루트로 이관하여 Vite가 TSX/TS 파일을 JS로 정상 치환하도록 합니다.
 */
export default defineConfig({
  plugins: [react()],
  define: {
    // 서버 호스트/포트 빌드 타임 리터럴 상수 주입
    __SERVER_HOST__: JSON.stringify(process.env.SERVER_HOST || "localhost"),
    __SERVER_PORT__: Number(process.env.SERVER_PORT || 9700),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // 프로젝트 루트의 HTML 엔트리 지정 (Vite HTML 번들링 변환 단행)
        sidepanel: resolve(__dirname, "sidepanel.html"),
        offscreen: resolve(__dirname, "offscreen.html"),
        background: resolve(__dirname, "src/background.ts"),
        content: resolve(__dirname, "src/content.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
      },
    },
  },
});
