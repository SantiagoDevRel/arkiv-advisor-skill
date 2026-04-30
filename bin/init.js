#!/usr/bin/env node
// arkiv-advisor-skill CLI — installs the Arkiv co-pilot skill stack into Claude Code.
// Default: installs all 3 (official arkiv-best-practices + arkiv-ethlisbon-skill + arkiv-advisor-skill).

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SKILL_SRC = path.join(__dirname, "..", "SKILL.md");
const SKILL_FOLDER_NAME = "arkiv-advisor";
const PKG_NAME = "@santiagodevrel/arkiv-advisor-skill";
const ETHLISBON_PKG = "@santiagodevrel/arkiv-ethlisbon-skill";

const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

const step = (m) => console.log(`${cyan("▸")} ${m}`);
const ok = (m) => console.log(`${green("✓")} ${m}`);
const warn = (m) => console.log(`${yellow("!")} ${m}`);
const err = (m) => console.log(`${red("✗")} ${m}`);

function printHelp() {
  console.log(`
${bold("Arkiv Advisor Skill")} — full Arkiv co-pilot installer for Claude Code.

${bold("Usage:")}
  npx ${PKG_NAME} init [flags]

${bold("Flags:")}
  --project           Install into ./.claude/skills (project-local) instead
                      of ~/.claude/skills (user-global, default).
  --skip-official     Skip the official arkiv-best-practices install.
  --skip-ethlisbon    Skip the arkiv-ethlisbon-skill install (templates + pitfalls).
  --minimal           Equivalent to --skip-official --skip-ethlisbon
                      (installs only this advisor skill).
  --dry-run           Print actions without writing files.

${bold("What it installs by default (full stack):")}
  1. ${bold("arkiv-best-practices")} — official Arkiv engineering skill (CRUD, best practices)
  2. ${bold("arkiv-ethlisbon-skill")} — ETHLisbon-specific templates + 6 common pitfalls
  3. ${bold("arkiv-advisor-skill")} — this skill: architecture brainstorming + ideation + sponsor combos

${dim("Repo: https://github.com/SantiagoDevRel/arkiv-advisor-skill")}
`);
}

function runCommand(cmd, args, dryRun, label) {
  return new Promise((resolve) => {
    if (dryRun) {
      ok(`(dry-run) would: ${cmd} ${args.join(" ")}`);
      return resolve(true);
    }
    const child = spawn(cmd, args, { stdio: "inherit", shell: true });
    child.on("exit", (code) => resolve(code === 0));
    child.on("error", (e) => {
      err(`${label} failed: ${e.message}`);
      resolve(false);
    });
  });
}

function copyAdvisorSkill(scope, dryRun) {
  const baseDir = scope === "project"
    ? path.join(process.cwd(), ".claude", "skills")
    : path.join(os.homedir(), ".claude", "skills");
  // Claude Code expects subfolder format: ~/.claude/skills/<name>/SKILL.md
  const skillDir = path.join(baseDir, SKILL_FOLDER_NAME);
  const dest = path.join(skillDir, "SKILL.md");
  if (dryRun) {
    ok(`(dry-run) would: copy SKILL.md → ${dest}`);
    return dest;
  }
  if (!fs.existsSync(SKILL_SRC)) {
    throw new Error(`Source SKILL.md not found at ${SKILL_SRC}`);
  }
  fs.mkdirSync(skillDir, { recursive: true });
  fs.copyFileSync(SKILL_SRC, dest);
  return dest;
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (!cmd || cmd === "help" || cmd === "-h" || cmd === "--help") {
    printHelp();
    process.exit(cmd ? 0 : 1);
  }
  if (cmd !== "init") {
    err(`Unknown command: ${cmd}`);
    printHelp();
    process.exit(1);
  }

  const isProject = args.includes("--project");
  const minimal = args.includes("--minimal");
  const skipOfficial = minimal || args.includes("--skip-official");
  const skipEthlisbon = minimal || args.includes("--skip-ethlisbon");
  const dryRun = args.includes("--dry-run");

  console.log();
  console.log(bold("Arkiv Advisor Skill installer") + (dryRun ? dim(" (dry-run)") : ""));
  console.log();

  // Step 1 — official skill
  if (!skipOfficial) {
    step("Installing official arkiv-best-practices skill...");
    const success = await runCommand(
      "npx",
      ["skills", "add", "https://github.com/Arkiv-Network/skills", "--skill", "arkiv-best-practices"],
      dryRun,
      "Official skill install"
    );
    if (success) ok("Official skill installed.");
    else warn("Could not auto-install official skill. Run manually:\n      npx skills add https://github.com/Arkiv-Network/skills --skill arkiv-best-practices");
  } else {
    warn("Skipping official skill install.");
  }

  // Step 2 — ETHLisbon layer
  if (!skipEthlisbon) {
    step("Installing arkiv-ethlisbon-skill (templates + pitfalls)...");
    const ethlisbonArgs = ["--yes", ETHLISBON_PKG, "init", "--skip-official"];
    if (isProject) ethlisbonArgs.push("--project");
    if (dryRun) ethlisbonArgs.push("--dry-run");
    const success = await runCommand("npx", ethlisbonArgs, false /* let it actually run */, "ETHLisbon skill install");
    if (success) ok("ETHLisbon skill installed.");
    else warn(`Could not auto-install. Run manually: npx ${ETHLISBON_PKG} init --skip-official`);
  } else {
    warn("Skipping ETHLisbon skill install.");
  }

  // Step 3 — advisor skill (this one)
  step(`Installing advisor skill to ${isProject ? "./.claude/skills/" : "~/.claude/skills/"}...`);
  try {
    const dest = copyAdvisorSkill(isProject ? "project" : "user", dryRun);
    ok(`Advisor skill installed at: ${dest}`);
  } catch (e) {
    err(`Failed to install advisor skill: ${e.message}`);
    process.exit(1);
  }

  console.log();
  console.log(green("Done.") + " Restart Claude Code (or open a fresh session) to load the skills.");
  console.log(dim("  Verify with: ls ~/.claude/skills/"));
  console.log();
}

main().catch((e) => {
  err(e.stack || e.message);
  process.exit(1);
});
