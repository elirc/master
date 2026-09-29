import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const cwd = process.cwd();

const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
};

const prismaCliPath = fileURLToPath(new URL("../node_modules/prisma/build/index.js", import.meta.url));
const result = spawnSync(process.execPath, [prismaCliPath, "db", "push", "--skip-generate", "--schema", "prisma/schema.prisma"], {
  stdio: "inherit",
  env,
  cwd,
});

if (typeof result.status === "number" && result.status !== 0) {
  process.exit(result.status);
}
