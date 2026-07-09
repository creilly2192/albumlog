import type { APIRoute } from 'astro'

const VALID_RATINGS = new Set(['loved', 'liked', 'interesting', 'not_for_me'])
const VALID_MOODS = new Set([
  'energetic', 'danceable', 'euphoric', 'chill', 'atmospheric',
  'nostalgic', 'melancholy', 'introspective', 'intense', 'raw',
  'experimental', 'romantic',
])

export const POST: APIRoute = async ({ locals, request, redirect }) => {
  if (!locals.session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const form = await request.formData()

  const albumId = form.get('album_id')?.toString()
  if (!albumId) return new Response('album_id is required', { status: 400 })

  const rating = form.get('rating')?.toString() || null
  if (rating && !VALID_RATINGS.has(rating)) {
    return new Response('Invalid rating', { status: 400 })
  }

  const mood = form.getAll('mood').map(String).filter((m) => VALID_MOODS.has(m))
  const standoutTracks = form.getAll('standout_tracks').map(String).filter(Boolean)

  let favoriteTracks: { track_name: string; note: string }[] = []
  try {
    const raw = form.get('favorite_tracks')?.toString() ?? '[]'
    favoriteTracks = JSON.parse(raw)
  } catch {
    return new Response('Invalid favorite_tracks JSON', { status: 400 })
  }

  const notes = form.get('notes')?.toString() || null

  const rawDate = form.get('date_listened')?.toString()
  const dateListen = rawDate || new Date().toISOString().split('T')[0]

  const { error } = await locals.supabase.from('logs').upsert(
    {
      user_id: locals.session.user.id,
      album_id: albumId,
      rating,
      notes,
      date_listened: dateListen,
      mood,
      standout_tracks: standoutTracks,
      favorite_tracks: favoriteTracks,
    },
    { onConflict: 'user_id,album_id' }
  )

  if (error) return new Response(error.message, { status: 500 })

  await locals.supabase
    .from('now_playing')
    .delete()
    .eq('user_id', locals.session.user.id)

  return redirect('/pick-next')
}
