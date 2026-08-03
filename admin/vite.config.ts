import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // 빌드 최종 출력물 적재 폴더를 백엔드의 정적 리소스 서빙 영역인 server/public 폴더로 강제 우회
    outDir: "../server/public",
    // 컴파일 시점에 기존 퍼블릭 서빙 영역에 존재하던 구형 찌꺼기 파일 전량 강제 소거 일괄 정제
    emptyOutDir: true,
  },
});
