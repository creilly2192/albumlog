import type { SupabaseClient } from '@supabase/supabase-js'

export type Album = {
  id: string
  title: string
  artist: string
  year: number | null
  label: string | null
  genres: string[]
  rank_rs: number | null
  rank_apple: number | null
  canonical_rank: number | null
}

export type Log = {
  rating: 'loved' | 'liked' | 'interesting' | 'not_for_me' | null
  notes: string | null
  favorite: boolean
  date_listened: string | null
  mood: string[]
  standout_tracks: string[]
  favorite_tracks: { track_name: string; note: string }[]
}

export type AlbumWithLog = Album & { log: Log | null }

export async function getAlbumsWithLogs(supabase: SupabaseClient): Promise<AlbumWithLog[]> {
  const [{ data: albums, error: albumsError }, { data: logs, error: logsError }] =
    await Promise.all([
      supabase.from('albums').select('*').order('canonical_rank'),
      supabase.from('logs').select('*'),
    ])

  if (albumsError) throw new Error(albumsError.message)
  if (logsError) throw new Error(logsError.message)

  const logsByAlbumId = new Map((logs ?? []).map((l: any) => [l.album_id, l]))

  return (albums ?? []).map((a: any) => {
    const l = logsByAlbumId.get(a.id) ?? null
    return {
      id: a.id,
      title: a.title,
      artist: a.artist,
      year: a.year,
      label: a.label,
      genres: a.genres ?? [],
      rank_rs: a.rank_rs,
      rank_apple: a.rank_apple,
      canonical_rank: a.canonical_rank,
      log: l
        ? {
            rating: l.rating,
            notes: l.notes,
            favorite: l.favorite ?? false,
            date_listened: l.date_listened,
            mood: l.mood ?? [],
            standout_tracks: l.standout_tracks ?? [],
            favorite_tracks: l.favorite_tracks ?? [],
          }
        : null,
    }
  })
}

export async function getUnheardPage(
  supabase: SupabaseClient,
  userId: string,
  page: number,
  pageSize: number
): Promise<{ albums: Album[]; totalUnheard: number; totalHeard: number }> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data: heardLogs } = await supabase
    .from('logs')
    .select('album_id')
    .eq('user_id', userId)
    .not('date_listened', 'is', null)

  const heardIds = (heardLogs ?? []).map((l: any) => l.album_id as string)
  const totalHeard = heardIds.length

  let albumQuery = supabase
    .from('albums')
    .select('*', { count: 'exact' })
    .order('canonical_rank', { ascending: true })
    .range(from, to)

  if (heardIds.length > 0) {
    albumQuery = albumQuery.not('id', 'in', `(${heardIds.join(',')})`)
  }

  const { data: albums, count } = await albumQuery

  return {
    albums: (albums ?? []).map((a: any) => ({
      id: a.id,
      title: a.title,
      artist: a.artist,
      year: a.year,
      label: a.label,
      genres: a.genres ?? [],
      rank_rs: a.rank_rs,
      rank_apple: a.rank_apple,
      canonical_rank: a.canonical_rank,
    })),
    totalUnheard: count ?? 0,
    totalHeard,
  }
}

export async function getNowPlayingAlbum(
  supabase: SupabaseClient
): Promise<AlbumWithLog | null> {
  const ownerId = import.meta.env.PUBLIC_OWNER_USER_ID
  if (!ownerId) return null

  const { data: np, error: npError } = await supabase
    .from('now_playing')
    .select('album_id')
    .eq('user_id', ownerId)
    .single()

  if (npError || !np) return null

  const [{ data: album, error: albumError }, { data: log }] = await Promise.all([
    supabase.from('albums').select('*').eq('id', np.album_id).single(),
    supabase.from('logs').select('*').eq('album_id', np.album_id).maybeSingle(),
  ])

  if (albumError || !album) return null

  return {
    id: album.id,
    title: album.title,
    artist: album.artist,
    year: album.year,
    label: album.label,
    genres: album.genres ?? [],
    rank_rs: album.rank_rs,
    rank_apple: album.rank_apple,
    canonical_rank: album.canonical_rank,
    log: log
      ? {
          rating: log.rating,
          notes: log.notes,
          favorite: log.favorite ?? false,
          date_listened: log.date_listened,
          mood: log.mood ?? [],
          standout_tracks: log.standout_tracks ?? [],
          favorite_tracks: log.favorite_tracks ?? [],
        }
      : null,
  }
}
