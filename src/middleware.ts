import { defineMiddleware } from 'astro:middleware'
import { createSupabaseServerClient } from './lib/supabase'

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerClient(context)
  const { data: { user } } = await supabase.auth.getUser()

  context.locals.supabase = supabase
  context.locals.session = user ? { user } : null

  return next()
})
