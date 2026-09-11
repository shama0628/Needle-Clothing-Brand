import fs from "fs";
import path from "path";

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== "admin" && e.name !== "node_modules") {
        scanDir(full);
      }
    } else if (/\.(tsx|ts|jsx|js)$/.test(e.name)) {
      const content = fs.readFileSync(full, "utf8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        if (/text-(black|gray-[7-9]00|neutral-[7-9]00|zinc-[7-9]00|slate-[7-9]00|plum)|bg-(white|gray-100|plum|beige)|border-(gray-200|plum|beige)/.test(line)) {
          const rel = path.relative(process.cwd(), full);
          console.log(`${rel}:${idx + 1}: ${line.trim()}`);
        }
      });
    }
  }
}
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, "../src");
scanDir(srcDir);