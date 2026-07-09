import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ locals, request, redirect }) => {
  const form = await request.formData()
  const email = form.get('email')?.toString()

  if (!email) {
    return new Response('Email is required', { status: 400 })
  }

  const { error } = await locals.supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${new URL(request.url).origin}/api/auth/callback`,
    },
  })

  if (error) {
    return new Response(error.message, { status: 400 })
  }

  return redirect('/login?sent=true')
}
