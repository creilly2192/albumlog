# Albumlog

Albumlog is a small Astro site for tracking a personal "greatest albums" listening project. It shows the current album pick, a listening log, a favorites page, and a static detail page for every album in the dataset.

The site is driven by local JSON data generated from source CSV files in `data/sources/`.

## What The Site Includes

- `/` shows the currently pinned "Now Listening" album from `data/now.json`
- `/log` shows albums marked as listened, grouped by month
- `/favorites` shows albums marked as favorites
- `/listening/[id]` builds a detail page for every album, with personal data merged from `data/progress.json`

Each album record combines:

- Basic metadata: `id`, `title`, `artist`, `year`, `label`
- Listening state: `status`, `listenedAt`, `favorite`, `rating`
- Notes and extras: `notes`, `standoutTracks`, `spotifyLink`
- Source rankings: `ranks.rollingstone`, `ranks.apple`, `canonicalRank`

Current rating labels in the UI are:

- `loved`
- `interesting`
- `not_for_me`

## Project Structure

```text
/
├── data/
│   ├── albums.json        ← album metadata (generated from CSVs)
│   ├── progress.json      ← personal listening data (status, notes, ratings)
│   ├── now.json
│   └── sources/
│       ├── RollingStone.csv
│       ├── RollingStone150-1.csv
│       └── apple-100best.csv
├── public/
├── scripts/
│   ├── build-albums-json.mjs
│   ├── migrate-progress.mjs
│   └── pick-album.mjs
├── src/
│   ├── components/
│   ├── layouts/
│   ├── lib/
│   ├── pages/
│   └── styles/
├── astro.config.mjs
└── package.json
```

## Getting Started

1. Install dependencies:

```sh
npm install
```

2. Build the canonical album dataset from the source CSVs:

```sh
npm run albums:build
```

3. Generate a current album pick if `data/now.json` does not exist yet:

```sh
npm run pick:album
```

4. Start the local dev server:

```sh
npm run dev
```

The app will be available at `http://localhost:4321`.

## Available Scripts

| Command | What it does |
| :-- | :-- |
| `npm run dev` | Starts the Astro dev server |
| `npm run build` | Builds the site for production |
| `npm run preview` | Serves the production build locally |
| `npm run albums:build` | Rebuilds `data/albums.json` from the source CSV files |
| `npm run pick:album` | Picks a random album with `status === "queue"` and writes it to `data/now.json` |
| `npm run repick:album` | Same as `pick:album` but overwrites `data/now.json` even if it already exists |
| `npm run astro -- --help` | Shows Astro CLI help |

## Data Workflow

Album data is split across two files:

- **`data/albums.json`** — metadata only (title, artist, year, label, ranks). Generated from CSVs by `albums:build` and safe to regenerate at any time.
- **`data/progress.json`** — your personal listening data, keyed by album ID. Never overwritten by `albums:build`.

`scripts/build-albums-json.mjs` treats the Rolling Stone list as the canonical base dataset, then merges Apple ranking data where an artist/title match is found.

To record a listen, add an entry to `data/progress.json`:

```json
{
  "artist-title-year": {
    "status": "listened",
    "listenedAt": "2026-02-09",
    "rating": "loved",
    "favorite": true,
    "notes": "...",
    "standoutTracks": ["Track Name"],
    "spotifyLink": "https://open.spotify.com/album/..."
  }
}
```

Albums not present in `progress.json` default to `status: "queue"`.

### Forking this project

To use this as a blank slate, delete `data/progress.json` and `data/now.json`. Your own listening data will never be mixed into the album metadata.

## Picking The Current Album

`npm run pick:album` selects a random album from the records where `status === "queue"` and writes its `id` into `data/now.json`.

If `data/now.json` already exists, the script exits without overwriting it. To repick, run:

```sh
npm run repick:album
```

## Build Notes

- The detail pages under `/listening/[id]` are generated statically, with album metadata from `data/albums.json` merged with personal data from `data/progress.json`
- If `data/now.json` points to an ID that no longer exists, the home page shows a recovery message
- The site reads album data directly from the filesystem at build/runtime, so the JSON files in `data/` are part of the app's source of truth
