import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})

const albums = JSON.parse(
  readFileSync(join(__dirname, '../data/albums.json'), 'utf8')
)

const rows = albums.map((a) => ({
  id: a.id,
  title: a.title,
  artist: a.artist,
  year: a.year,
  label: a.label ?? null,
  genres: a.genres ?? [],
  rank_rs: a.ranks?.rollingstone ?? null,
  rank_apple: a.ranks?.apple ?? null,
  canonical_rank: a.canonicalRank ?? null,
}))

const { error } = await supabase
  .from('albums')
  .upsert(rows, { onConflict: 'id' })

if (error) {
  console.error('Seed failed:', error.message)
  process.exit(1)
}

console.log(`Seeded ${rows.length} albums.`)
