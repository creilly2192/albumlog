import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ locals, url, redirect }) => {
  const code = url.searchParams.get('code')

  if (code) {
    await locals.supabase.auth.exchangeCodeForSession(code)
  }

  return redirect('/')
}
