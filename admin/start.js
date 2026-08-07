// admin/start.js
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const adminDir = resolve(__dirname);
const rootDir = resolve(__dirname, "..");
const logsDir = resolve(rootDir, "logs");

mkdirSync(logsDir, { recursive: true });

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const child = spawn(
  npmCommand,
  ["run", "dev", "--", "--host", "127.0.0.1", "--port", "5173", "--strictPort"],
  {
    cwd: adminDir,
    windowsHide: true,
    stdio: "inherit",
    shell: true,
  },
);

child.on("error", (error) => {
  console.error("admin spawn error:", error);
  process.exit(1);
});

child.on("exit", (code) => {
  console.log(`admin process exited with code ${code ?? 0}`);
  process.exit(code || 0);
});

console.log("admin-started");
