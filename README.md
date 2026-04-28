# Arkiv Advisor Skill

The **WHAT/WHY layer** of the Arkiv co-pilot stack — architecture brainstorming, idea generation, ETHLisbon sponsor combos, and business model patterns. Pairs with the official `arkiv-best-practices` (engineering) and `arkiv-ethlisbon-skill` (templates) for a full Claude Code co-pilot.

## Install — one command, full stack

```bash
npx @santiagodevrel/arkiv-advisor-skill init
```

This installs **3 skills** in one shot:
1. **`arkiv-best-practices`** (Arkiv official) — SDK reference, CRUD, 14 best practices
2. **`arkiv-ethlisbon-skill`** — 6 common pitfalls + 3 starter templates + demo prep checklist
3. **`arkiv-advisor-skill`** (this) — architecture brainstorming + 30+ ideas + sponsor combos

Open a fresh Claude Code session — all three auto-load when Arkiv context is detected.

> ⚠️ **`npm i` does NOT install the skills.** This package is a CLI. Use `npx ... init` to install the skill files into `.claude/skills/`.

## The 3-skill co-pilot stack

| Skill | What it covers | When Claude uses it |
|---|---|---|
| `arkiv-best-practices` (official) | SDK setup, CRUD, 14 best practices, mental model | When you write Arkiv code |
| `arkiv-ethlisbon-skill` | 6 common pitfalls, 3 starter templates, demo prep, prompting patterns | When you build / debug ETHLisbon-style apps |
| `arkiv-advisor-skill` (this) | Architecture brainstorming, 30+ idea seeds, sponsor combos, business models | When you decide WHAT to build / WHY |

Loaded together → Claude becomes a full Arkiv co-pilot: architecture, code, ideation, and strategy.

## What this skill adds (the WHAT/WHY layer)

The advisor skill teaches Claude to help with strategic decisions, not just code.

### Architecture brainstorming walkthrough
A 7-step checklist Claude walks through with you:
1. Mutability shape — append-only or mutable?
2. Lifetime profile — TTL choice
3. Ownership model — `$owner` mutable vs `$creator` immutable
4. Wallet model — frontend (MetaMask) vs backend (server wallet)
5. Read/write ratio
6. Relationships — one-to-many via shared attributes
7. Batch sizing for `mutateEntities`

Plus 5 pre-armed architecture templates (read-heavy public app, write-heavy backend, MetaMask user-owned, event-sourced indexer, time-bounded coordination).

### Pro-Arkiv competitive orientation
Brief paragraphs on Ceramic, Tableland, IPFS+OrbitDB, Lit Protocol, Arweave, ComposeDB. **Never recommends leaving Arkiv** — instead identifies when to combine (e.g., "Arkiv + Lit for encrypted queryable data", "Arkiv + IPFS for hybrid blob storage").

### ETHLisbon sponsor combos
12 high-leverage Arkiv + sponsor patterns based on documented ETHLisbon 2023 and 2025 editions:
- Arkiv + **Olas** → agent memory layer for autonomous Mechs
- Arkiv + **Kusama** → cross-chain coordination indexer
- Arkiv + **Gnosis Pay × Aave** → private spend tracker
- Arkiv + **Filecoin Foundation** → hybrid video archive
- Arkiv + **Lit Protocol** → encrypted private journal with queryable tags
- Arkiv + **WalletConnect** → multi-device user data
- Arkiv + **Wormhole** → cross-chain message archive
- Arkiv + **Rootstock** → Bitcoin-anchored bounty board
- Arkiv + **Fuel** → fast L2 + Arkiv-indexed history
- Arkiv + **iExec** → privacy-preserving compute + queryable archive
- Arkiv + **ENS** → portable Linktree owned by user
- Arkiv + **Gnosis Chain / Safe** → DAO proposal threads

Each combo: use case + why powerful + 36-hour feasibility.

### 30+ concrete idea seeds
Categorized by Arkiv pattern:
- Agent memory & AI (5 ideas)
- User-owned content (5 ideas)
- Decentralized indexing (5 ideas)
- Time-bounded coordination (5 ideas)
- Verifiable activity logs (5 ideas)
- Content + ownership transfer (5 ideas)
- Sponsor combos (7 ideas)

Each idea: one-line description + Arkiv primitive used + 36h feasibility (yes/maybe).

### Business model patterns
Analyzed from real Arkiv-built apps (WebDB, FileDB, ImageDB, DrawIODB, UmamiDB, CopyPal). The common pattern: **freemium + TTL pricing**. Free tier = short TTL guest mode. Paid = wallet-mode with extended retention.

### Decision-support prompts
7 prompts that work well when this skill is loaded:
- *"Walk me through the architecture for [app idea]"*
- *"Critique my idea for Arkiv-fit"*
- *"Generate 5 ideas combining Arkiv with [sponsor]"*
- *"What's the business model for [app]?"*
- *"Help me decide between idea A and idea B"*
- *"Make my idea more Arkiv-shaped"*
- *"Stack 3 sponsors for my hackathon idea"*

## CLI flags

```bash
npx @santiagodevrel/arkiv-advisor-skill init [flags]

  --project           Install into ./.claude/skills (project-local)
  --skip-official     Skip arkiv-best-practices install
  --skip-ethlisbon    Skip arkiv-ethlisbon-skill install
  --minimal           Equivalent to both --skip-* (advisor only)
  --dry-run           Print actions without writing
```

## Manual install (each skill independently)

```bash
# 1. Official engineering skill
npx skills add https://github.com/Arkiv-Network/skills --skill arkiv-best-practices

# 2. ETHLisbon templates + pitfalls
npx @santiagodevrel/arkiv-ethlisbon-skill init --skip-official

# 3. This advisor skill
curl -L https://raw.githubusercontent.com/SantiagoDevRel/arkiv-advisor-skill/main/SKILL.md \
  -o ~/.claude/skills/arkiv-advisor.md
```

## Verify it loaded

After install + Claude Code restart, ask Claude:

> "Walk me through the architecture for a Telegram tutor bot that remembers user history."

Expected: Claude walks through the 7-step framework (entity shape, TTL choice, ownership, wallet model, etc.) and recommends a template shape, citing the agent memory pattern.

## Acknowledgments

Built on top of the [`arkiv-best-practices`](https://github.com/Arkiv-Network/skills) skill from the Arkiv team and complements [`arkiv-ethlisbon-skill`](https://github.com/SantiagoDevRel/arkiv-ethlisbon-skill).

Built for the **ETHLisbon** hackathon community — sponsors mix patterns reflect the documented 2023 and 2025 editions.

## License

MIT — see [LICENSE](./LICENSE).
