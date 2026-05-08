import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const albumsPath = path.join(root, "data", "albums.json");
const progressPath = path.join(root, "data", "progress.json");

const PERSONAL_FIELDS = ["status", "rating", "favorite", "listenedAt", "notes", "standoutTracks", "spotifyLink"];

if (!fs.existsSync(albumsPath)) {
  console.error("Missing data/albums.json.");
  process.exit(1);
}

if (fs.existsSync(progressPath)) {
  console.error("data/progress.json already exists. Remove it first if you want to re-migrate.");
  process.exit(1);
}

const albums = JSON.parse(fs.readFileSync(albumsPath, "utf-8"));
const progress = {};

const cleanAlbums = albums.map((album) => {
  const entry = {};
  for (const field of PERSONAL_FIELDS) {
    if (field in album) entry[field] = album[field];
  }

  const isNonDefault =
    entry.status !== "queue" ||
    entry.rating !== null ||
    entry.favorite === true ||
    entry.listenedAt !== null ||
    (entry.notes && entry.notes !== "") ||
    (entry.standoutTracks && entry.standoutTracks.length > 0) ||
    entry.spotifyLink;

  if (isNonDefault) progress[album.id] = entry;

  const meta = { ...album };
  for (const field of PERSONAL_FIELDS) delete meta[field];
  return meta;
});

fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2) + "\n", "utf-8");
fs.writeFileSync(albumsPath, JSON.stringify(cleanAlbums, null, 2) + "\n", "utf-8");

const count = Object.keys(progress).length;
console.log(`Migrated ${count} album(s) with personal data to data/progress.json`);
console.log(`Rewrote data/albums.json (metadata only)`);
