import type { APIRoute } from 'astro'

const signout: APIRoute = async ({ locals, redirect }) => {
  await locals.supabase.auth.signOut()
  return redirect('/')
}

export const GET = signout
export const POST = signout
