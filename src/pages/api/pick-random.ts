import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ locals, redirect }) => {
  const session = locals.session
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: nowPlaying } = await locals.supabase
    .from('now_playing')
    .select('album_id')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (nowPlaying?.album_id) {
    const { data: existingLog } = await locals.supabase
      .from('logs')
      .select('date_listened')
      .eq('user_id', session.user.id)
      .eq('album_id', nowPlaying.album_id)
      .maybeSingle()

    if (!existingLog?.date_listened) {
      return redirect('/pick-next?must-log=true')
    }
  }

  const [{ data: allAlbums, error: albumsError }, { data: heardLogs, error: logsError }] =
    await Promise.all([
      locals.supabase.from('albums').select('id'),
      locals.supabase
        .from('logs')
        .select('album_id')
        .eq('user_id', session.user.id)
        .not('date_listened', 'is', null),
    ])

  if (albumsError) return new Response(albumsError.message, { status: 500 })
  if (logsError) return new Response(logsError.message, { status: 500 })

  const heardIds = new Set((heardLogs ?? []).map((l: any) => l.album_id))
  const unheard = (allAlbums ?? []).filter((a: any) => !heardIds.has(a.id))

  if (unheard.length === 0) {
    return redirect('/pick-next?empty=true')
  }

  const picked = unheard[Math.floor(Math.random() * unheard.length)]

  const { error: upsertError } = await locals.supabase
    .from('now_playing')
    .upsert({ user_id: session.user.id, album_id: picked.id }, { onConflict: 'user_id' })

  if (upsertError) return new Response(upsertError.message, { status: 500 })

  return redirect('/')
}
