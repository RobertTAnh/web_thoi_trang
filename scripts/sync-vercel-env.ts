/**
 * Push required env vars to Vercel from .env.local (Neon) + generated AUTH_*.
 * Does not print secret values.
 */
import { execSync } from "child_process";
import { randomBytes } from "crypto";
import fs from "fs";
import path from "path";

function parseEnv(file: string) {
  if (!fs.existsSync(file)) return {} as Record<string, string>;
  const out: Record<string, string> = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

function setEnv(key: string, value: string, environments: string[]) {
  const tmp = path.join(process.cwd(), `.tmp-env-${key}.txt`);
  fs.writeFileSync(tmp, value, "utf8");
  try {
    for (const envName of environments) {
      try {
        execSync(`npx vercel env rm ${key} ${envName} --yes`, {
          stdio: "pipe",
          cwd: process.cwd(),
        });
      } catch {
        /* may not exist */
      }
      // Pipe file into vercel env add (Windows-safe)
      execSync(`cmd /c "type \".tmp-env-${key}.txt\" | npx vercel env add ${key} ${envName}"`, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
      console.log(`set ${key} → ${envName}`);
    }
  } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }
}

const local = parseEnv(path.join(process.cwd(), ".env.local"));
const databaseUrl =
  local.DATABASE_URL || local.POSTGRES_PRISMA_URL || local.POSTGRES_URL;
const directUrl =
  local.DATABASE_URL_UNPOOLED ||
  local.POSTGRES_URL_NON_POOLING ||
  local.DATABASE_URL;

if (!databaseUrl || !directUrl) {
  console.error("Missing DATABASE_URL / UNPOOLED in .env.local");
  process.exit(1);
}

const authSecret = local.AUTH_SECRET || randomBytes(32).toString("base64");
const authUrl = local.AUTH_URL || "https://tisora-fashion.vercel.app";
const envs = ["production", "preview", "development"];

setEnv("DATABASE_URL", databaseUrl, envs);
setEnv("DIRECT_URL", directUrl, envs);
setEnv("AUTH_SECRET", authSecret, envs);
setEnv("AUTH_URL", authUrl, envs);
setEnv("AUTH_TRUST_HOST", "true", envs);
setEnv("NEXT_PUBLIC_BRAND_NAME", local.NEXT_PUBLIC_BRAND_NAME || "Tisora", envs);
setEnv("NEXT_PUBLIC_HOTLINE", local.NEXT_PUBLIC_HOTLINE || "19006750", envs);

let content = fs.readFileSync(".env.local", "utf8");
if (!/^DIRECT_URL=/m.test(content)) {
  content += `\nDIRECT_URL="${directUrl}"\n`;
  if (!/^AUTH_SECRET=/m.test(content)) {
    content += `AUTH_SECRET="${authSecret}"\n`;
  }
  if (!/^AUTH_URL=/m.test(content)) {
    content += `AUTH_URL="${authUrl}"\n`;
  }
  if (!/^AUTH_TRUST_HOST=/m.test(content)) {
    content += `AUTH_TRUST_HOST="true"\n`;
  }
  fs.writeFileSync(".env.local", content);
  console.log("Updated .env.local with DIRECT_URL / AUTH_*");
}

console.log("Done. AUTH_URL:", authUrl);
