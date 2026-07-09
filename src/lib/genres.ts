export const GENRE_COLORS: Record<string, string> = {
  SOUL: '#ff5d99',
  POP: '#4dd6e8',
  FOLK: '#b48cf0',
  ROCK: '#f0a94d',
  GRUNGE: '#7ee08a',
  'TRIP-HOP': '#5ec9c9',
  SHOEGAZE: '#8c93ff',
  COUNTRY: '#c9915a',
  ELECTRONIC: '#4d8dff',
  FUNK: '#e558c7',
  'HIP-HOP': '#ffc247',
  JAZZ: '#e8c860',
  METAL: '#9aa3b8',
  'NEW-WAVE': '#4de8c2',
  PUNK: '#ff4d4d',
  'R&B': '#c66bff',
  REGGAE: '#a8e04d',
}

const FALLBACK_COLOR = '#9b96ab'

export function getTapeColor(genres: string[]): string {
  return GENRE_COLORS[genres[0]] ?? FALLBACK_COLOR
}
