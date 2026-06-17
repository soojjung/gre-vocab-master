# Architecture

Internal architecture notes for GRE Vocab Master. Focuses on patterns a contributor (or future me) must respect to avoid regressing previously-fixed production bugs.

For the high-level system diagram and tech stack, see [README.md](./README.md).
For postmortems of past incidents, see [.ai/OPERATIONS_LOG.md](./.ai/OPERATIONS_LOG.md).

---

## 1. System Overview

```
                  ┌──────────────────────┐
                  │   Web (React PWA)    │
                  │   iOS (Capacitor)    │
                  └──────────┬───────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼                             ▼
   ┌────────────────────┐      ┌────────────────────────┐
   │      Supabase      │      │ Vercel Serverless      │
   │  Auth + PostgreSQL │      │ (TTS proxy /api/tts)   │
   └────────────────────┘      └───────────┬────────────┘
                                           ▼
                              ┌────────────────────────┐
                              │ Google Cloud TTS       │
                              │ (Web Speech API fallbk)│
                              └────────────────────────┘
```

The client talks to Supabase and the Vercel serverless function in parallel. The TTS endpoint is a thin proxy so the Google Cloud API key never reaches the browser. When the proxy fails (offline, rate limit), `speakWord()` falls back to the browser's Web Speech API.

Observability: Sentry (`@sentry/react`, `@sentry/capacitor`) reports client exceptions. Mean time-to-detect is bounded by the weekly digest cadence for non-throwing bugs (see §3.1, §3.2).

---

## 2. Data Flow & State

### Context layout

| Context | Owns | Persistence |
|---|---|---|
| `AuthContext` | Supabase user, sign-in/out flows (Google, Apple, Kakao, email) | Supabase session (localStorage `sb-*-auth-token`) |
| `UserDataContext` | progress map, today's session, daily goal, reset hour | Supabase rows + local cache |
| `WordsContext` | the 1,560-word dictionary | Static import, locale-aware |
| `QuizContext` | active quiz state (questions, answers, score) | In-memory only |

### FCP-optimized auth bootstrap (`AuthContext.tsx:54-66`)

The auth provider checks `localStorage` synchronously for a Supabase session token *before* the first render. If there's no token, `loading` starts as `false` and the login screen renders immediately — first-time visitors don't see a spinner. If a token exists, `loading` starts as `true` and the real session check resolves it.

**Why this matters:** without this trick, every cold start would gate behind an async `getSession()` call and visibly flash a spinner even for logged-out users.

---

## 3. Critical Invariants

Rules that, if broken, reintroduce a previously-fixed production bug. Each entry links to the original incident in `OPERATIONS_LOG.md`.

### 3.1 SR session word list must be snapshotted on entry

**Rule:** Do not index a UI off a `useMemo` whose dependencies include a value that the UI's own actions mutate.

**The trap (incident: 2026-05-10):** The SR review screen indexed `<FlashCard word={words[i]} />` off a live `useMemo` filtered by `userData.progress`. Answering a card pushed its `nextReview` into the future, the memo recomputed with that word removed, the index went out of bounds, and the next render passed `undefined` to `FlashCard`, throwing `n.word is undefined`.

**Correct pattern (`src/hooks/useStudySession.ts:45-56`):**
- Compute the live list with `useMemo` for the *count* (e.g. "X words due today" on the home screen).
- On session entry, snapshot it once into state (`srSessionWords`).
- Drive the card-by-card UI off the snapshot, not the live list.
- Reset the snapshot using render-phase `setState` when the entry condition changes (React's "[adjusting state when a prop changes](https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)" pattern). Do *not* use `useEffect` — it cascades renders and violates `react-hooks/set-state-in-effect`.

**Generalization:** any "answer-driven list" in this codebase (today's words, wrong-answer review, etc.) must be snapshot-on-entry if the UI indexes into it.

---

### 3.2 Word-in-sentence matching must be inflection-aware

**Rule:** Never use `\bword\b` alone to find a vocabulary word inside an example sentence. English inflection (`-ed`, `-ing`, `y → ied`, doubled consonants) breaks exact matches.

**The trap (incident: 2026-05-07):** The fill-in-the-blank quiz built the blank regex as `new RegExp(\`\\b${word}\\b\`, 'gi')`. For the word `harrow` against the sentence "The images **harrowed** the viewers," the regex didn't match, the blank wasn't inserted, and the answer appeared verbatim in the question. 319 of 1,560 quiz items (20.5%) were affected.

**Correct pattern (`src/lib/blankSentence.ts`):**
- Always route through `getBlankSentence(example, word)`.
- The helper handles four inflection families: base suffixes (`s`, `es`, `ed`, `ing`, `d`, `er`, `est`, `ly`, `ier`, `iest`, `ation`, `al`, `ally`, `ically`), `y → i` (`fortify → fortified`), `e`-drop (`gouge → gouging`), and consonant doubling (`aver → averred`).
- Coverage: 1,558 / 1,560 sentences (99.9%). The two misses are an abbreviation and an irregular past tense — accepted as data, not regex problems.

**Generalization:** any future feature that matches a dictionary word against natural-English text (highlighting, search, mnemonics) goes through `blankSentence.ts` or a sibling helper built on the same regex builder. Adding new vocabulary requires re-running the coverage simulation.

---

### 3.3 Silent bugs need a non-Sentry detection path

**Rule:** When a bug manifests as "missing UI" rather than a thrown exception, Sentry will not catch it. Plan a separate detection path before shipping.

**Why:** 3.1, 3.2, and 3.4 had different detection lags. The TypeError (3.1) surfaced in the Sentry weekly digest (~7 days). The silent inflection bug (3.2) required a user email — undetected by Sentry by design, because nothing threw. The RLS gap (3.4) was found only by cross-checking docs against live DB.

**Correct pattern:**
- For features whose failure mode is "wrong output" or "no-op" rather than "exception": add a CI-level data simulation (the inflection coverage check is the prototype) or a Playwright assertion.
- The vitest + Playwright adoption tracked in `.ai/TODO.md` is the long-term plan; until then, manual data audits before each App Store submission.

---

### 3.4 Every client CRUD path must have a matching RLS policy

**Rule:** PostgreSQL RLS is default-deny. A `.from(table).delete()` (or insert/update) call without a corresponding policy succeeds with `0 rows affected` and no error — the client thinks the call worked.

**The trap (incident: 2026-06-18):** `AuthContext.deleteAccount()` called `supabase.from("user_data").delete().eq("user_id", userId)` to enforce a "code + CASCADE" double safety net. But `user_data` and `profiles` had only SELECT/INSERT/UPDATE policies. The delete was a silent no-op; the actual cleanup happened only via the subsequent `rpc("delete_user")` triggering `ON DELETE CASCADE` from `auth.users`. The double safety net was a single-path illusion.

**Correct pattern:**
- For every `from(t).{delete,insert,update}()` in the codebase, confirm a policy exists with `cmd = 'DELETE' | 'INSERT' | 'UPDATE'` on `t`.
- Verification query (run against live DB, not just migration files — they can drift):
  ```sql
  SELECT tablename, cmd FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, cmd;
  ```
- When adding a new table or a new mutation in code, the policy is part of the same change — not a follow-up.

**Generalization:** RLS gaps are a §3.3 specific case — silent by design, evade Sentry. Treat the live `pg_policies` table as ground truth; migration files are an intent, not a guarantee.

---

## 4. Platform Boundaries

Single codebase, two targets: web (Vercel) and iOS (Capacitor).

### Branching by platform

- Use `Capacitor.isNativePlatform()` for runtime checks, not user-agent sniffing.
- Web-only APIs (e.g. Web Speech API in `tts.ts:21`) are fine as fallbacks — they no-op cleanly on iOS because the proxy succeeds first.
- Native-only flows (Apple Sign-In in `AuthContext.tsx`) gate behind `Capacitor.isNativePlatform()` checks; web equivalents use OAuth redirects via `Browser.open()`.

### iOS-specific guarantees

- App ID: `com.sooya.grevocab`
- Scheme: `capacitor` (iOS) vs `https` (Android, currently unused)
- After `npm run build` + `npx cap sync ios`, always open `ios/App/App.xcworkspace` to verify Xcode picks up changes before archiving. (See user memory rule.)

---

## 5. External Services

| Service | Surface | Notes |
|---|---|---|
| **Supabase Auth** | `src/lib/supabase.ts`, `AuthContext` | Persists session in localStorage; auto-refreshes tokens; detects URL session for OAuth callback. |
| **Supabase Postgres** | Tables defined in `.ai/DATABASE_SCHEMA.md`; migrations in `supabase-migration-*.sql` | RLS enabled on all 4 tables (`profiles`, `user_data`, `word_lists`, `custom_words`); all policies gate on `auth.uid() = user_id` (or `= id` for `profiles`). Account deletion goes through client-side `.delete()` per table *plus* `rpc("delete_user")` triggering `ON DELETE CASCADE` from `auth.users` — a double safety net (see §3.4 for the silent-bug history that motivated this invariant). |
| **Vercel Serverless** | `api/tts.ts` (single endpoint) | Proxies Google Cloud TTS. CORS-open by design (audio is non-sensitive). 1-year cache on response. |
| **Google Cloud TTS** | Called server-side only | Voice: `en-US-Standard-D`, rate 0.9. API key in `GOOGLE_TTS_API_KEY` (Vercel env var, never client-exposed). |
| **Sentry** | `@sentry/react` (web) + `@sentry/capacitor` (iOS) | Setup: `.ai/SENTRY_SETUP.md`. Detection cadence: weekly digest by default. |
| **Vercel Analytics** | `@vercel/analytics` | Page-view tracking only. |

---

## 6. Related Documents

| Topic | Document |
|---|---|
| Database tables, RLS | [.ai/DATABASE_SCHEMA.md](./.ai/DATABASE_SCHEMA.md) |
| Supabase migrations | [.ai/SUPABASE_MIGRATION.md](./.ai/SUPABASE_MIGRATION.md) |
| iOS deployment | [.ai/IOS_DEPLOYMENT.md](./.ai/IOS_DEPLOYMENT.md) |
| App Store metadata | [.ai/APP_STORE_METADATA.md](./.ai/APP_STORE_METADATA.md) |
| i18n active track | [.ai/I18N_PLAN.md](./.ai/I18N_PLAN.md) |
| Performance work | [.ai/PERFORMANCE_OPTIMIZATION.md](./.ai/PERFORMANCE_OPTIMIZATION.md) |
| Production incidents | [.ai/OPERATIONS_LOG.md](./.ai/OPERATIONS_LOG.md) |
| Coding conventions | [.ai/CODING_STANDARDS.ts](./.ai/CODING_STANDARDS.ts) |
