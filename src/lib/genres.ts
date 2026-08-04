export const GENRE_COLORS: Record<string, string> = {
  SOUL:       '#ff5d99',
  POP:        '#4dd6e8',
  FOLK:       '#b48cf0',
  ROCK:       '#f0a94d',
  GRUNGE:     '#7ee08a',
  'TRIP-HOP': '#5ec9c9',
  SHOEGAZE:   '#8c93ff',
  JAZZ:       '#e8c860',
  'R&B':      '#c66bff',
  RAP:        '#ff9d5c',
  'HIP-HOP':  '#ff9d5c',
  ELECTRONIC: '#4dd6e8',
  COUNTRY:    '#d98a5f',
  FUNK:       '#e558c7',
  METAL:      '#9b96ab',
  'NEW-WAVE': '#4de8c2',
  PUNK:       '#ff4d4d',
  REGGAE:     '#a8e04d',
}

const FALLBACK_COLOR = '#9b96ab'

export function getTapeColor(genres: string[]): string {
  return GENRE_COLORS[genres[0]] ?? FALLBACK_COLOR
}
