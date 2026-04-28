// Advisor skill integrity + CLI tests. node:test built-in, zero deps.
// Run: node --test (from repo root) or npm test

import { test } from "node:test";
import { strict as assert } from "node:assert";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), "..");
const SKILL_PATH = path.join(root, "SKILL.md");
const CLI_PATH = path.join(root, "bin", "init.js");

const skillContent = fs.readFileSync(SKILL_PATH, "utf8");

test("SKILL.md exists and is substantial", () => {
  assert.ok(fs.existsSync(SKILL_PATH));
  assert.ok(skillContent.length > 15000, `skill is too short: ${skillContent.length} chars`);
});

test("SKILL.md has valid Claude Code frontmatter", () => {
  const fm = skillContent.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(fm, "missing frontmatter");
  assert.match(fm[1], /^name: arkiv-advisor\b/m);
  assert.match(fm[1], /^description: /m);
});

test("SKILL.md has balanced code fences", () => {
  const fences = (skillContent.match(/^```/gm) || []).length;
  assert.equal(fences % 2, 0, `unbalanced fences: ${fences}`);
});

test("SKILL.md contains all 10 main sections", () => {
  const requiredSections = [
    "Why on-chain queryable data matters",
    "L1 / L2 / L3",
    "How Arkiv differs",
    "Architecture Brainstorming Walkthrough",
    "Winning Arkiv-shaped patterns",
    "Anti-ideas",
    "ETHLisbon Sponsor Combo Patterns",
    "Concrete Idea Seeds",
    "Business Model Patterns",
    "Decision-support prompts",
  ];
  for (const s of requiredSections) {
    assert.ok(skillContent.includes(s), `missing section keyword: "${s}"`);
  }
});

test("SKILL.md mentions ETHLisbon sponsors from 2023 and 2025", () => {
  const sponsors2023 = ["Polygon", "Gnosis", "Fuel", "Aleo", "iExec", "Safe", "WalletConnect", "Near"];
  const sponsors2025 = ["Olas", "Kusama", "Rootstock", "Filecoin", "Wormhole"];
  for (const s of [...sponsors2023, ...sponsors2025]) {
    assert.ok(skillContent.includes(s), `missing ETHLisbon sponsor: "${s}"`);
  }
});

test("SKILL.md covers competitor orientation (not recommendation)", () => {
  for (const competitor of ["Ceramic", "Tableland", "IPFS", "Lit Protocol", "Arweave"]) {
    assert.ok(skillContent.includes(competitor), `missing competitor orientation: "${competitor}"`);
  }
  for (const phrase of ["Where Arkiv differs", "combine"]) {
    assert.ok(skillContent.includes(phrase), `missing pro-Arkiv framing keyword: "${phrase}"`);
  }
});

test("SKILL.md references both companion skills", () => {
  assert.ok(skillContent.includes("arkiv-best-practices"), "must reference official skill");
  assert.ok(skillContent.includes("arkiv-ethlisbon-skill"), "must reference companion ETHLisbon skill");
});

test("SKILL.md has an architecture walkthrough with all 7 steps", () => {
  for (let i = 1; i <= 7; i++) {
    assert.ok(skillContent.includes(`Step ${i}`), `missing walkthrough step: "Step ${i}"`);
  }
});

test("SKILL.md includes 30+ idea seeds (numbered list)", () => {
  const numberedItems = skillContent.match(/^\d+\.\s+\*\*/gm) || [];
  assert.ok(numberedItems.length >= 30, `expected 30+ numbered items, got ${numberedItems.length}`);
});

test("SKILL.md analyzes real Arkiv use cases", () => {
  for (const useCase of ["WebDB", "FileDB", "ImageDB", "DrawIODB", "UmamiDB", "CopyPal"]) {
    assert.ok(skillContent.includes(useCase), `missing use case: "${useCase}"`);
  }
});

test("CLI prints help when run with no args", () => {
  let output = "";
  try {
    execSync(`node "${CLI_PATH}"`, { encoding: "utf8" });
  } catch (e) {
    output = (e.stdout || "") + (e.stderr || "");
  }
  assert.match(output, /Arkiv Advisor Skill/);
  assert.match(output, /Usage:/);
  assert.match(output, /init/);
});

test("CLI rejects unknown commands", () => {
  let exitCode = 0;
  try {
    execSync(`node "${CLI_PATH}" totally-invalid`, { encoding: "utf8" });
  } catch (e) {
    exitCode = e.status;
  }
  assert.equal(exitCode, 1, "expected exit 1 for unknown command");
});

test("CLI dry-run minimal does not write files", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "arkiv-advisor-test-"));
  try {
    const output = execSync(
      `node "${CLI_PATH}" init --dry-run --minimal --project`,
      { encoding: "utf8", cwd: tmp }
    );
    assert.match(output, /dry-run/);
    assert.match(output, /would: copy/);
    assert.ok(
      !fs.existsSync(path.join(tmp, ".claude")),
      "dry-run must NOT create .claude/ directory"
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("CLI real install (minimal) copies SKILL.md byte-for-byte", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "arkiv-advisor-test-"));
  try {
    execSync(
      `node "${CLI_PATH}" init --minimal --project`,
      { encoding: "utf8", cwd: tmp }
    );
    const installed = path.join(tmp, ".claude", "skills", "arkiv-advisor.md");
    assert.ok(fs.existsSync(installed), "installed file missing");
    const installedContent = fs.readFileSync(installed, "utf8");
    assert.equal(installedContent, skillContent, "installed skill does not match source");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("package.json has valid bin entry pointing to existing file", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.ok(pkg.bin && pkg.bin["arkiv-advisor-skill"], "missing bin entry");
  const binPath = path.join(root, pkg.bin["arkiv-advisor-skill"]);
  assert.ok(fs.existsSync(binPath), `bin file does not exist: ${binPath}`);
});
