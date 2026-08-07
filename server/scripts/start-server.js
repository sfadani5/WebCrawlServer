// server/scripts/start-server.js
// Cross-platform detached server starter. Creates ../logs, starts dist/index.js
import fs from "fs";
import path from "path";
import net from "net";
import { spawn } from "child_process";

const projectRoot = path.resolve(process.cwd(), "..");
const logsDir = path.join(projectRoot, "logs");
try {
  fs.mkdirSync(logsDir, { recursive: true });
} catch (e) {
  // ignore
}

const logFile = path.join(logsDir, "server.log");
const out = fs.openSync(logFile, "a");
const err = fs.openSync(logFile, "a");

const nodeBin = process.execPath; // path to node
const scriptPath = path.join(process.cwd(), "dist", "index.js");

async function getAvailablePort(startPort) {
  return await new Promise((resolve) => {
    const tester = net.createServer();
    tester.once("error", (error) => {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "EADDRINUSE"
      ) {
        resolve(getAvailablePort(startPort + 1));
      } else {
        resolve(startPort);
      }
    });
    tester.once("listening", () => {
      const address = tester.address();
      const port =
        typeof address === "object" && address ? address.port : startPort;
      tester.close(() => resolve(port));
    });
    tester.listen(startPort, "127.0.0.1");
  });
}

const preferredPort = Number(process.env.SERVER_PORT || 9700);
const serverPort = await getAvailablePort(preferredPort);

const child = spawn(nodeBin, [scriptPath], {
  detached: false,
  stdio: "inherit",
  env: {
    ...process.env,
    SERVER_PORT: String(serverPort),
  },
});

console.log(`server-started on port ${serverPort}`);
