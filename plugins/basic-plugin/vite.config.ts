// plugins/basic-plugin/vite.config.ts

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  // 빌드 타임에 전역 상수를 자바스크립트 문자열/숫자 리터럴로 직접 치환 주입
  define: {
    __POPUP_WIDTH__: Number(process.env.POPUP_WIDTH || 360),
    __POPUP_HEIGHT__: Number(process.env.POPUP_HEIGHT || 480),
    __POPUP_MIN_WIDTH__: Number(process.env.POPUP_MIN_WIDTH || 320),
    __POPUP_MIN_HEIGHT__: Number(process.env.POPUP_MIN_HEIGHT || 420),
    __POPUP_MAX_WIDTH__: Number(process.env.POPUP_MAX_WIDTH || 600),
    __POPUP_MAX_HEIGHT__: Number(process.env.POPUP_MAX_HEIGHT || 700),
    __SERVER_HOST__: JSON.stringify(process.env.SERVER_HOST || "localhost"),
    __SERVER_PORT__: Number(process.env.SERVER_PORT || 9600),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
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
