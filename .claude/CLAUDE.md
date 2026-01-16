# Claude Project Guide (Root)

> This is the **thin** project-level Claude guide.
> Keep this file short. Put detailed rules into `.claude/rules/**`.

## 1) Project scope

This repository contains:
- `client/`: React + Tailwind web app (customer + owner/backoffice views)
- `server/`: Spring Boot API (Java 17, MySQL)

Product: **KKOOKK** (digital stamp / reward SaaS).

## 2) Single source of truth

- PRD: `docs/prd.md`
- Conventions:
  - `docs/conventions/git-convention.md`
  - `docs/conventions/commit-convention.md`
  - `docs/conventions/ai-convention.md`
  - `docs/conventions/be-code-convention.md`

## 3) Repo layout

```
repo-root/
├─ .claude/
│  ├─ CLAUDE.md
│  ├─ rules/
│  │  ├─ general/
│  │  ├─ frontend/
│  │  └─ backend/
│  └─ commands/
├─ client/
│  └─ CLAUDE.md
├─ server/
│  └─ CLAUDE.md
├─ docs/
│  ├─ prd.md
│  └─ conventions/
└─ .github/
   └─ pull_request_template.md
```

## 4) Mandatory AI workflow (Design → Review → Implement → Test)

**Never jump straight into code.**

1) Propose **2–3 design options**
2) Compare trade-offs + risks
3) Recommend **1 option** (team chooses)
4) Implement as **file-by-file diff**
5) Provide **tests + verification checklist**

Tip: split big tasks into phases and reset context between phases (e.g., `/clear`).

## 5) Rule updates

- Rule changes must go through a PR on the `docs` branch.
- PR must include: **summary**, **impact**, and **example**.

## 6) Definition of Done

A task is done when:
- `lint` and `test` pass
- no TODO left in changed files
- error handling exists for expected failures
- API contracts are documented (DTO + status codes)

## 7) Useful command prompts

See `.claude/commands/*` for reusable prompt templates.