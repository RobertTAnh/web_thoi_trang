/**
 * Migrate Postgres: Railway → Neon
 *
 * Requires: pg_dump, pg_restore on PATH
 * Env:
 *   RAILWAY_DATABASE_URL  (source)
 *   DIRECT_URL | DATABASE_URL_UNPOOLED  (Neon direct)
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const source = process.env.RAILWAY_DATABASE_URL;
const target =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.NEON_DIRECT_URL;
const dumpFile = path.join(process.cwd(), "railway.dump");

function run(cmd: string) {
  console.log(">", cmd.replace(/postgresql:\/\/[^@]+@/g, "postgresql://***:***@"));
  execSync(cmd, { stdio: "inherit", env: process.env });
}

function main() {
  if (!source) {
    console.error("Missing RAILWAY_DATABASE_URL");
    process.exit(1);
  }
  if (!target) {
    console.error("Missing DIRECT_URL or DATABASE_URL_UNPOOLED (Neon direct)");
    process.exit(1);
  }

  console.log("1) Dump Railway…");
  run(`pg_dump "${source}" -Fc -f "${dumpFile}"`);

  console.log("2) Restore Neon…");
  run(
    `pg_restore --clean --if-exists --no-owner --no-acl -d "${target}" "${dumpFile}"`,
  );

  console.log("3) Done. Optional: delete", dumpFile);
  if (process.env.KEEP_DUMP !== "1" && fs.existsSync(dumpFile)) {
    fs.unlinkSync(dumpFile);
    console.log("Removed temporary dump file.");
  }
}

main();
