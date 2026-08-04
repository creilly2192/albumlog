import { createBrowserClient, createServerClient, parseCookieHeader } from '@supabase/ssr'
import type { MiddlewareHandler } from 'astro'
import type { SerializeOptions } from 'cookie'

export function createClient() {
  return createBrowserClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  )
}

export function createSupabaseServerClient(context: Parameters<MiddlewareHandler>[0]) {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(context.request.headers.get('Cookie') ?? '').map(
            ({ name, value }) => ({ name, value: value ?? '' })
          )
        },
        setAll(cookiesToSet: { name: string; value: string; options?: SerializeOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            context.cookies.set(name, value, options)
          )
        },
      },
    }
  )
}
