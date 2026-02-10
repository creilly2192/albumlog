import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";

const root = process.cwd();

const rsPath = path.join(root, "data", "sources", "RollingStone.csv");
const applePath = path.join(root, "data", "sources", "apple-100best.csv");
const outPath = path.join(root, "data", "albums.json");

function slug(s) {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\u2018\u2019']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function clean(s) {
  return String(s ?? "")
    .normalize("NFKD")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
}

function cleanTitle(s) {
  if (!s) return "";

  return (
    String(s)
      .normalize("NFKD")
      // remove zero-width + BOM chars FIRST
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .trim()
      // then strip wrapping quotes (smart or straight)
      .replace(/^[‘’'"“”]+/, "")
      .replace(/[‘’'"“”]+$/, "")
      .trim()
  );
}

function makeId(artist, title, year) {
  return `${slug(artist)}-${slug(title)}-${year}`;
}

function readCsv(p) {
  return parse(fs.readFileSync(p, "utf-8"), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

function main() {
  const albums = [];
  const index = new Map(); // artist|title → album

  // Rolling Stone = canonical
  for (const r of readCsv(rsPath)) {
    const rsRank = Number(r.Rank);
    const label = clean(r.Label);
    const year = Number(r.Year);
    const artist = clean(r.Artist);
    const title = cleanTitle(r.Album);

    const album = {
      id: makeId(artist, title, year),
      title,
      artist,
      year,
      label,

      status: "queue",
      rating: null,
      favorite: false,
      listenedAt: null,
      notes: "",

      ranks: {
        rollingstone: Number.isFinite(rsRank) ? rsRank : null,
        apple: null,
      },
      canonicalRank: Number.isFinite(rsRank) ? rsRank : null,
    };

    albums.push(album);
    index.set(`${slug(artist)}|${slug(title)}`, album);
  }

  // Apple = merge rank
  for (const r of readCsv(applePath)) {
    const appleRank = Number(r["goldtext"]);
    const artist = clean(r["album__details__artist-name"]);
    const title = cleanTitle(r["album__details__name"]);

    const key = `${slug(artist)}|${slug(title)}`;
    const match = index.get(key);
    if (match && Number.isFinite(appleRank)) {
      match.ranks.apple = appleRank;
      match.canonicalRank = Math.min(
        match.ranks.rollingstone ?? appleRank,
        appleRank,
      );
    }
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(albums, null, 2));
  console.log(`Wrote ${albums.length} albums to data/albums.json`);
}

main();
