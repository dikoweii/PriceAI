import { spawnSync } from "node:child_process";
import { join } from "node:path";
import {
  CLOUDFLARE_BUILD_REQUIRED_ENV,
  assertRequiredEnv,
  loadCloudflareLocalEnv,
} from "./cloudflare-env.mjs";

loadCloudflareLocalEnv();
assertRequiredEnv(CLOUDFLARE_BUILD_REQUIRED_ENV, "Cloudflare build env");

run("OpenNext Cloudflare build", localBin("opennextjs-cloudflare"), ["build"]);
run("OpenNext cache validation", process.execPath, ["scripts/verify-cloudflare-build-cache.mjs"]);
run("OpenNext env sanitization", process.execPath, ["scripts/sanitize-opennext-env.mjs"]);

function run(label, command, args) {
  console.log(`\n> ${label}`);
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) {
    console.error(`${label} failed: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function localBin(name) {
  const suffix = process.platform === "win32" ? ".cmd" : "";
  return join(process.cwd(), "node_modules", ".bin", `${name}${suffix}`);
}
