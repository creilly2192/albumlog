import * as fs from "fs";
import * as path from "path";

function readProgress(): Record<string, any> {
  const p = path.join(process.cwd(), "data", "progress.json");
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return {};
  }
}

export function readAlbums() {
  const albums = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data", "albums.json"), "utf-8"),
  );
  const progress = readProgress();

  return albums.map((album: any) => {
    const p = progress[album.id] ?? {};
    return {
      ...album,
      status: p.status ?? "queue",
      rating: p.rating ?? null,
      favorite: p.favorite ?? false,
      listenedAt: p.listenedAt ?? null,
      notes: p.notes ?? "",
      ...(p.standoutTracks !== undefined && { standoutTracks: p.standoutTracks }),
      ...(p.spotifyLink !== undefined && { spotifyLink: p.spotifyLink }),
    };
  });
}

export function readNowId(): string | null {
  const p = path.join(process.cwd(), "data", "now.json");
  if (!fs.existsSync(p)) return null;
  try {
    const id = JSON.parse(fs.readFileSync(p, "utf-8"))?.id;
    return typeof id === "string" ? id : null;
  } catch {
    return null;
  }
}
