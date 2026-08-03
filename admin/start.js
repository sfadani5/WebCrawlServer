import { spawn } from "node:child_process";

// 가상 파이프 스트림(stdout/stderr)에 명시적 리스너를 바인딩하여 부모 프로세스 이벤트 루프를 강제 유지
const child = spawn("npm", ["run", "dev"], {
  shell: true,
  cwd: "admin",
  windowsHide: true, // 윈도우의 가상 콘솔창 번쩍임 깜빡임 원천 제거
  stdio: "pipe", // 가상 입출력 파이프 스트림 장착
});

// 자식 프로세스의 출력 데이터를 부모 콘솔 스트림으로 중계 전달하여 이벤트 루프 생존 확립
child.stdout.on("data", (data) => {
  process.stdout.write(data);
});

child.stderr.on("data", (data) => {
  process.stderr.write(data);
});

// 자식 프로세스가 최종 소멸 시 부모도 함께 종료 처리
child.on("exit", (code) => {
  process.exit(code || 0);
});
