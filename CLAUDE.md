# Album Log — CLAUDE.md

## What this project is
A personal music log that tracks listening progress through the greatest albums of all time (Rolling Stone 500 + Apple 100 Best). Currently being rewritten as v3.

## v3 rewrite status
Migrating from a static JSON-driven Astro site to a database-backed hybrid app with Supabase.

**Completed:**
- Supabase project created, schema running, auth user created
- `.env` in project root with Supabase keys
- Packages installed: `@astrojs/netlify`, `@supabase/supabase-js`, `@supabase/ssr`
- `astro.config.mjs` updated to `output: 'server'` with Netlify adapter
- `netlify.toml` created
- `src/lib/supabase.ts` created (browser + server client factories)
- `src/env.d.ts` created (App.Locals types)

**Still to do:** See plan file at `/Users/christina/.claude/plans/help-me-plan-and-vivid-lake.md`

## Tech stack
- **Framework:** Astro 7, `output: 'server'`, deployed on Netlify
- **Database + Auth:** Supabase (Postgres + magic link auth)
- **Fonts:** Space Grotesk (headings), Space Mono (monospace/labels), Source Serif 4 (album titles)
- **Icons:** `@lucide/astro`

## Design
Dark theme (`#211f2a` background). Cassette tape aesthetic — every album is represented as a cassette whose color is derived from its primary genre. Screenshots of all four views are in `/public/`.

**Genre → tape color map:**
- SOUL → `#ff5d99` (pink)
- POP → `#4dd6e8` (teal)
- FOLK → `#b48cf0` (purple)
- ROCK → `#f0a94d` (orange)
- GRUNGE → `#7ee08a` (green)
- TRIP-HOP → `#5ec9c9` (teal-green)
- SHOEGAZE → `#8c93ff` (periwinkle)

## Pages
| Route | Auth | Description |
|---|---|---|
| `/` | Public | Now Playing — current album as animated cassette SVG |
| `/log` | Public | Heard albums grouped by month, card grid with mini cassettes |
| `/pick-next` | Auth required | Unheard queue, search, RS/APPLE filter, 🎲 PICK FOR ME |
| `/listening/[id]` | Public | Album detail — two-column cassette + info, favorite tracks |
| `/login` | — | Magic link login form |

## Database schema (Supabase)
**`albums`** — static catalog seeded from `data/albums.json`. Fields: `id, title, artist, year, label, genres text[], rank_rs, rank_apple, canonical_rank`. Genres live here, not on logs.

**`logs`** — user activity. Fields: `id, user_id, album_id, rating (enum: loved/liked/interesting/not_for_me), notes, heard, favorite, date_listened, mood text[], standout_tracks text[], favorite_tracks jsonb [{track_name, note}], created_at, updated_at`. Unique on `(user_id, album_id)`.

**`now_playing`** — one row per user: `user_id (PK), album_id, set_at`. Public page reads the row for `PUBLIC_OWNER_USER_ID`.

## Key decisions
- `tape_color` is NOT stored — derived at display time from `albums.genres[0]` via `GENRE_COLORS` map in `src/lib/genres.ts`
- `mood` is `text[]` of predefined IDs from `data/moods.json`, validated at API level
- `genres` belong to the album (static catalog), not the log entry
- Nav labels: "NOW PLAYING", "PICK NEXT", "LOG" — never "Collection"
- `listening/[id].astro` stays statically generated (`export const prerender = true`) with `getStaticPaths()` reading `data/albums.json` at build time
- `PUBLIC_OWNER_USER_ID` env var used to show the right now_playing row to public visitors

## Env vars required
```
PUBLIC_SUPABASE_URL
PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   # server/scripts only, never in src/
PUBLIC_OWNER_USER_ID
```

## Files to keep unchanged
`src/lib/rating.ts`, `src/lib/releasedYear.ts`, `src/lib/rankLabels.ts` — pure functions, no I/O.

## Data still in JSON (do not delete yet)
- `data/albums.json` — used by `getStaticPaths()` in `[id].astro` at build time
- `data/moods.json` — source of valid mood options for UI + API validation
- `data/progress.json` — not yet seeded to DB; needed for `scripts/seed-logs.mjs`
- `data/now.json` — not yet migrated; delete after `now_playing` table is seeded
