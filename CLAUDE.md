# Album Log — CLAUDE.md

## What this project is
A personal music log that tracks listening progress through the greatest albums of all time (Rolling Stone 500 + Apple 100 Best). Currently being rewritten as v3.

## v3 rewrite status
Migrating from a static JSON-driven Astro site to a database-backed hybrid app with Supabase.

**Completed:**
- Supabase project created, schema running, auth user created
- `.env` in project root with Supabase keys (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PUBLIC_OWNER_USER_ID`)
- Packages installed: `@astrojs/netlify`, `@supabase/supabase-js`, `@supabase/ssr`
- `astro.config.mjs` updated to `output: 'server'` with Netlify adapter
- `netlify.toml` created
- `src/lib/supabase.ts` — browser + server client factories (using `getAll`/`setAll` cookie pattern)
- `src/env.d.ts` — `App.Locals` types with inline imports (no top-level import)
- `src/middleware.ts` — attaches `supabase` + `session` to `locals` on every request via `getUser()`
- `src/lib/genres.ts` — `GENRE_COLORS` map (all 17 genres) + `getTapeColor(genres)`
- `src/lib/db.ts` — `getAlbumsWithLogs()` and `getNowPlayingAlbum()` replacing `data.ts`
- `src/lib/auth.ts` — `requireAuth()` and `isAuthenticated()` helpers
- `src/pages/login.astro` — magic link email form with sent confirmation state
- `src/pages/api/auth/signin.ts` — calls `signInWithOtp`, redirects to `/login?sent=true`
- `src/pages/api/auth/callback.ts` — exchanges code for session, redirects to `/`
- `src/pages/api/auth/signout.ts` — signs out, redirects to `/`
- `src/pages/index.astro` — converted to read from DB via `getNowPlayingAlbum()`
- `src/pages/log.astro` — converted to read from DB via `getAlbumsWithLogs()`
- `src/pages/pick-next.astro` — auth-gated, unheard queue, shows LOG CURRENT TAPE or PICK FOR ME based on log status
- `src/pages/api/pick-random.ts` — picks random unheard album, guards against picking before logging current
- `src/components/Header.astro` — Pick Next nav item hidden from logged-out visitors
- `src/components/AlbumListItem.astro` — updated to use DB field names
- `scripts/seed-albums.mjs` + `scripts/seed-logs.mjs` — one-time data migration scripts (already run)
- `data/now.json` — can be deleted (now_playing table is seeded)
- `data/progress.json` — can be deleted (logs table is seeded)

**Still to do:**
- `src/pages/pick-next.astro` — wire `+ LOG` row buttons to open `LogTapeModal` with the row's `album_id` + import `LogTapeModal` component
- `src/pages/api/set-now-playing.ts` — set a specific album as now playing (for manually picking from the pick-next list, separate from 🎲 random)
- `src/pages/pick-next.astro` — add a "SET AS NOW PLAYING" action per row so user can manually pick without using 🎲 (calls `api/set-now-playing`)
- `src/pages/listening/[id].astro` — redesign with two-column layout (cassette + info), show log data (rating, date, notes, favorite tracks)
- Cleanup: delete `src/lib/data.ts`, `data/progress.json`, `data/now.json`, `scripts/pick-album.mjs`, `scripts/migrate-progress.mjs`

**Now Playing empty state** (design: `public/design/Screenshot 2026-07-09 at 3.33.30 PM.png`):
- Triggers after logging — `api/log-tape.ts` deletes the `now_playing` row on success
- HTML in place: `now-playing__empty`, `now-playing__empty-cassette`, `now-playing__empty-label`, `now-playing__empty-btn`
- Needs CSS in `global.css`: greyed cassette outline, "NO TAPE LOADED" monospace label, pink gradient "PICK A TAPE" button

## Tech stack
- **Framework:** Astro 7, `output: 'server'`, deployed on Netlify
- **Database + Auth:** Supabase (Postgres + magic link auth)
- **Fonts:** Space Grotesk (headings), Space Mono (monospace/labels), Source Serif 4 (album titles)
- **Icons:** `@lucide/astro`

## Design
Dark theme (`#211f2a` background). Cassette tape aesthetic — every album is represented as a cassette whose color is derived from its primary genre. Screenshots of all four views are in `/public/`.

**Genre → tape color map:**
- SOUL → `#ff5d99`, POP → `#4dd6e8`, FOLK → `#b48cf0`, ROCK → `#f0a94d`
- GRUNGE → `#7ee08a`, TRIP-HOP → `#5ec9c9`, SHOEGAZE → `#8c93ff`
- COUNTRY → `#c9915a`, ELECTRONIC → `#4d8dff`, FUNK → `#e558c7`
- HIP-HOP → `#ffc247`, JAZZ → `#e8c860`, METAL → `#9aa3b8`
- NEW-WAVE → `#4de8c2`, PUNK → `#ff4d4d`, R&B → `#c66bff`, REGGAE → `#a8e04d`
- Fallback → `#9b96ab`

## Pages
| Route | Auth | Description |
|---|---|---|
| `/` | Public | Now Playing — current album, LOG TAPE button for owner |
| `/log` | Public | Heard albums grouped by month |
| `/pick-next` | Auth required | Unheard queue, 🎲 PICK FOR ME (or LOG CURRENT TAPE if unlogged) |
| `/listening/[id]` | Public | Album detail — two-column layout, log entry form for owner |
| `/login` | — | Magic link login form |

## Database schema (Supabase)
**`albums`** — static catalog seeded from `data/albums.json`. Fields: `id, title, artist, year, label, genres text[], rank_rs, rank_apple, canonical_rank`. Genres live here, not on logs.

**`logs`** — user activity. Fields: `id, user_id, album_id, rating (enum: loved/liked/interesting/not_for_me), notes, favorite, date_listened, mood text[], standout_tracks text[], favorite_tracks jsonb [{track_name, note}], created_at, updated_at`. Unique on `(user_id, album_id)`. "Heard" is derived — an album is heard when `date_listened IS NOT NULL`.

**`now_playing`** — one row per user: `user_id (PK), album_id, set_at`. Public page reads the row for `PUBLIC_OWNER_USER_ID`.

## Key decisions
- `tape_color` is NOT stored — derived at display time from `albums.genres[0]` via `GENRE_COLORS` map in `src/lib/genres.ts`
- `mood` is `text[]` of predefined IDs from `data/moods.json`, validated at API level
- `genres` belong to the album (static catalog), not the log entry
- Nav labels: "NOW PLAYING", "PICK NEXT", "LOG" — never "Collection"
- `listening/[id].astro` stays statically generated (`export const prerender = true`) with `getStaticPaths()` reading `data/albums.json` at build time
- `PUBLIC_OWNER_USER_ID` env var used to show the right now_playing row to public visitors
- "Heard" = `date_listened IS NOT NULL` — no separate `heard` boolean column
- Auth session shape: `{ user: User }` — access via `locals.session?.user`
- Middleware uses `getUser()` not `getSession()` for security (re-validates against Auth server)

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
- `data/albums.json` — still used by `getStaticPaths()` in `[id].astro` at build time
- `data/moods.json` — source of valid mood options for UI + API validation
