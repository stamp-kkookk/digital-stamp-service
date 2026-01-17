# Claude Project Guide (Root)

> This is the **thin** project-level Claude guide.
> Keep this file short. Put detailed rules into `.claude/rules/**`.

## 1) Project scope

This repository contains:
- `frontend/`: React + Tailwind web app (customer + owner/backoffice views)
- `server/`: Spring Boot API (Java 17, MySQL)

Product: **KKOOKK** (digital stamp / reward SaaS).
- **No POS integration**: approval-based system (owner terminal confirms)
- **3 User Types**: Customer (wallet), Owner (backoffice), Terminal (approval screen)
- **Key Flows**:
  - Issuance: Customer request → Terminal approval → Polling completion
  - Redeem: OTP step-up → 2-step confirm modal → TTL expiry
  - Migration: Paper stamp photo → Manual approval → Stamp reflection



## 2) Repo layout

```
repo-root/
├─ .claude/
│  ├─ CLAUDE.md
│  ├─ rules/
│  │  ├─ general/
│  │  ├─ frontend/
│  │  └─ backend/
│  └─ commands/
├─ frontend/
│  └─ CLAUDE.md
├─ server/
│  └─ CLAUDE.md
└─ .github/
   └─ pull_request_template.md
```

## 3) Mandatory AI workflow (Design → Review → Implement → Test)

**Never jump straight into code.**

1) Propose **2–3 design options**
2) Compare trade-offs + risks
3) Recommend **1 option** (team chooses)
4) Implement as **file-by-file diff**
5) Provide **tests + verification checklist**

Tip: split big tasks into phases and reset context between phases (e.g., `/clear`).


## 4) Definition of Done (Checklist)

- [ ] lint passes
- [ ] test passes
- [ ] No TODO in changed files
- [ ] Error handling for expected failures exists
- [ ] API contracts documented (DTO + status codes)
- [ ] No breaking changes in existing APIs (unless explicitly stated)
- [ ] Update related docs when behavior changes (docs/ or README)


## 5) Useful command prompts

See `.claude/commands/*` for reusable prompt templates.