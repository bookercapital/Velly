# Discipline — Personal Tracker

> Drop this at the repo root. If `create-next-app` generated an `AGENTS.md`
> alongside a `CLAUDE.md`, keep the AGENTS.md (it has up-to-date Next.js 16
> framework rules) and let this file live alongside it. Reference AGENTS.md
> with `@AGENTS.md` when framework-specific guidance is needed.

## What this is

A mobile-first PWA for a single user (me). Tracks three domains:
1. **Workouts** — sessions, exercises, sets, reps, weight, progression
2. **Peptides** — protocols, cycles, individual doses, side effects
3. **Reading** — books, daily reading sessions, pages/time

Plus a **dashboard** that ties them together with streaks and weekly AI-generated
insights. Not for the App Store. Installs to iPhone home screen as a PWA.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + TypeScript + React 19
- **Tailwind CSS v4** + **shadcn/ui** for components
- **Supabase** — Postgres + Auth (magic-link) + Realtime
- **Anthropic SDK** (`@anthropic-ai/sdk`) for weekly insights
- **Vercel** for deploy
- PWA via `next-pwa` or hand-rolled service worker + web manifest

Package manager: **pnpm**. Use `pnpm`, not `npm` or `yarn`.

## Core principles (read before every change)

1. **Friction kills adherence.** Any log entry must be ≤ 3 taps from app open.
   Always offer a "repeat last" shortcut.
2. **Thumb-first UI.** One-handed iPhone use. Tap targets ≥ 44px. Primary
   actions live in the bottom third of the screen.
3. **Optimistic writes.** UI updates instantly; Supabase sync runs in the
   background. Rollback only on hard error.
4. **Works offline.** App shell + last 30 days of data cached. Mutations
   queued when offline, flushed on reconnect.
5. **No engagement dark patterns.** No guilt-streaks, no notification spam,
   no fake urgency. This is a tool, not a slot machine.

## Architecture

```
app/
  (tabs)/           # main tab routes with shared layout
    dashboard/
    workouts/
    peptides/
    reading/
  api/
    insights/       # Anthropic-powered weekly summary
  auth/             # magic-link callback
  layout.tsx
  globals.css
components/
  ui/               # shadcn components (don't hand-edit)
  workouts/
  peptides/
  reading/
  dashboard/
lib/
  supabase/
    server.ts       # server client factory
    client.ts       # browser client factory
  anthropic.ts      # Anthropic client + prompt helpers
  types.ts          # shared types (ideally generated from supabase)
  streaks.ts        # streak calculation utilities
supabase/
  schema.sql        # full schema with RLS (source of truth)
  migrations/       # follow-up migrations after initial schema
public/
  manifest.webmanifest
  icons/
```

## Data model (summary — full schema in `supabase/schema.sql`)

- `exercises` → user's exercise library
- `workout_sessions` — a workout; has many `sets`
- `sets` — one set; weight/reps/rpe, references exercise + session
- `peptides` → user's peptide library (name, default dose)
- `peptide_cycles` — a protocol run (start/end, dose, frequency)
- `peptide_doses` — individual logged dose (time, amount, notes)
- `books` → reading library (status, total pages)
- `reading_sessions` — daily reading log (pages, duration)
- `daily_activity` view — derived per-day rollup for streak calculations

**RLS is ON for every table.** Every row has `user_id` and policies restrict
reads/writes to `auth.uid()`. Never disable RLS even for dev convenience.

## Code conventions

- **TypeScript strict.** No `any` — use `unknown` and narrow. Zero `@ts-ignore`.
- **Server Components by default.** Add `'use client'` only when interaction
  or browser APIs are required.
- **Server Actions for mutations.** Wrap them in a try/catch that returns
  `{ ok: true } | { ok: false, error }` — never throw across the boundary.
- **Supabase types:** generate with `supabase gen types typescript` and
  import from `lib/types.ts`. Do not duplicate types by hand.
- **Tailwind only** for styling — no CSS modules, no styled-components.
  Use `cn()` (tailwind-merge + clsx) helper for conditional classes.
- **shadcn/ui** for base components. Wrap them in domain components rather
  than passing shadcn components across the whole app.
- **Dates:** store as `timestamptz` in Postgres, handle as ISO strings at
  the API boundary, convert to `Date` only at the edge of rendering.
- **No comments on obvious code.** If the code needs a comment to explain
  *what* it does, rename things. Comments should only explain *why*.

## Do not

- Do not add social / sharing / leaderboard features. Single-user app.
- Do not add push notifications in v1.
- Do not introduce Redux / Zustand / Jotai / MobX. React state + Supabase
  queries is enough.
- Do not write unit tests for UI components in v1. Schema / streak utilities
  / date helpers are worth testing; buttons are not.
- Do not edit files in `components/ui/` by hand — those are shadcn-generated.
  If you need variation, wrap them in a domain component.
- Do not auto-install new dependencies without pausing to justify them.
- Do not send full user data to the Anthropic API. Summaries only. See
  `lib/anthropic.ts` for the sanitization helper.

## Build priority order

1. **Phase 0:** scaffold, auth, PWA shell, bottom-tab layout
2. **Phase 1:** dashboard + workouts (highest daily usage)
3. **Phase 2:** peptides (cycles + dose logging + schedule view)
4. **Phase 3:** reading
5. **Phase 4:** `/api/insights` weekly AI summary

Finish each phase before starting the next. No jumping ahead to polish UI
on a feature that isn't wired up end-to-end.

## Useful commands

```bash
pnpm dev                          # local dev (turbopack)
pnpm build && pnpm start          # prod build locally
pnpm lint                         # eslint
pnpm typecheck                    # tsc --noEmit

# Supabase (requires supabase CLI)
supabase start                    # local Postgres + Studio
supabase db reset                 # wipe + reapply schema.sql
supabase gen types typescript --local > lib/database.types.ts
```

## When in doubt

Optimize for **speed of daily logging** over feature breadth. A tracker I
actually use beats a feature-rich tracker I abandon after two weeks.
