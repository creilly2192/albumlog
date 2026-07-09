import type { AstroGlobal } from 'astro'

export function requireAuth(Astro: AstroGlobal) {
  if (!Astro.locals.session) {
    return Astro.redirect('/login')
  }
  return null
}

export function isAuthenticated(Astro: AstroGlobal): boolean {
  return !!Astro.locals.session
}
