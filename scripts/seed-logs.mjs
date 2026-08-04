import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const userId = process.env.SEED_USER_ID

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
if (!userId) {
  console.error('Missing SEED_USER_ID — get it from Supabase dashboard → Authentication → Users')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})

const progress = JSON.parse(
  readFileSync(join(__dirname, '../data/progress.json'), 'utf8')
)

const rows = Object.entries(progress)
  .filter(([, entry]) => entry.status === 'listened')
  .map(([albumId, entry]) => ({
    user_id: userId,
    album_id: albumId,
    rating: entry.rating ?? null,
    notes: entry.notes || null,
    favorite: entry.favorite ?? false,
    date_listened: entry.listenedAt ?? null,
    mood: entry.mood ?? [],
    standout_tracks: entry.standoutTracks ?? [],
    favorite_tracks: (entry.favoriteTracks ?? []).map((track) => ({
      track_name: track,
      note: '',
    })),
  }))

const { error } = await supabase
  .from('logs')
  .upsert(rows, { onConflict: 'user_id,album_id' })

if (error) {
  console.error('Seed failed:', error.message)
  process.exit(1)
}

console.log(`Seeded ${rows.length} log entries.`)
