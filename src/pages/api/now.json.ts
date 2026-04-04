import type { APIRoute } from "astro";
import { readAlbums, readNowId } from "../../lib/data";

// Static endpoint — generated at build time.
// Returns the currently selected album so external sites can consume it.
export const GET: APIRoute = () => {
  const nowId = readNowId();
  const albums = readAlbums();

  const album = nowId ? albums.find((a: { id: string }) => a.id === nowId) : null;

  if (!album) {
    return new Response(JSON.stringify({ album: null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Only expose the fields needed by consumers — no internal metadata
  const payload = {
    album: {
      title: album.title as string,
      artist: album.artist as string,
      year: album.year as number,
      notes: album.notes as string | null,
    },
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
