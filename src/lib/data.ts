import * as fs from "fs";
import * as path from "path";

export function readAlbums() {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data", "albums.json"), "utf-8"),
  );
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
