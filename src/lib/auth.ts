import type { AstroGlobal } from 'astro'

function isOwner(Astro: AstroGlobal): boolean {
  return Astro.locals.session?.user?.id === import.meta.env.PUBLIC_OWNER_USER_ID
}

export function requireAuth(Astro: AstroGlobal) {
  if (!isOwner(Astro)) {
    return Astro.redirect('/login')
  }
  return null
}

export function isAuthenticated(Astro: AstroGlobal): boolean {
  return isOwner(Astro)
}
