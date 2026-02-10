import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const albumsPath = path.join(root, "data", "albums.json");
const nowPath = path.join(root, "data", "now.json");

const force = process.argv.includes("--force");

if (!fs.existsSync(albumsPath)) {
  console.error("Missing data/albums.json. Run: npm run albums:build");
  process.exit(1);
}

if (fs.existsSync(nowPath) && !force) {
  console.log(
    "data/now.json exists. Use --force (or npm run repick:album) to overwrite.",
  );
  process.exit(0);
}

const albums = JSON.parse(fs.readFileSync(albumsPath, "utf-8"));
const queue = albums.filter((a) => a.status === "queue");

if (!queue.length) {
  console.error("No queued albums (status === 'queue').");
  process.exit(1);
}

const pick = queue[Math.floor(Math.random() * queue.length)];
fs.writeFileSync(
  nowPath,
  JSON.stringify({ id: pick.id }, null, 2) + "\n",
  "utf-8",
);

console.log(`Picked: ${pick.artist} — ${pick.title} (${pick.year})`);
