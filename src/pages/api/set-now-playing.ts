import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ locals, request, redirect }) => {
  if (!locals.session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const form = await request.formData()
  const albumId = form.get('album_id')?.toString()
  if (!albumId) return new Response('album_id is required', { status: 400 })

  const { error } = await locals.supabase
    .from('now_playing')
    .upsert(
      { user_id: locals.session.user.id, album_id: albumId, set_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

  if (error) return new Response(error.message, { status: 500 })

  return redirect('/')
}
