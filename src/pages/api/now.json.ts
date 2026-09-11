import type { APIRoute } from "astro";
import { getNowPlayingAlbum } from "../../lib/db";

export const prerender = false;

// Public endpoint — external sites (e.g. personal site) can poll this
// to show the currently playing album.
export const GET: APIRoute = async ({ locals }) => {
  const album = await getNowPlayingAlbum(locals.supabase);

  if (!album) {
    return new Response(JSON.stringify({ album: null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Only expose the fields needed by consumers — no internal ids/log data
  const payload = {
    album: {
      title: album.title,
      artist: album.artist,
      year: album.year,
      label: album.label,
      genres: album.genres,
      rank_rs: album.rank_rs,
      rank_apple: album.rank_apple,
    },
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
