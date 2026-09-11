import { defineMiddleware } from 'astro:middleware'
import { createSupabaseServerClient } from './lib/supabase'

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerClient(context)
  const { data: { user } } = await supabase.auth.getUser()

  context.locals.supabase = supabase
  context.locals.session = user ? { user } : null

  if (!context.locals.session && import.meta.env.DEV && import.meta.env.DEV_BYPASS_AUTH === 'true') {
    context.locals.session = {
      user: { id: import.meta.env.PUBLIC_OWNER_USER_ID } as import('@supabase/supabase-js').User,
    }
  }

  return next()
})
