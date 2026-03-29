export function formatAlbumRanks(ranks?: {
    rollingstone?: number | null;
    apple?: number | null;
}) {
    if (!ranks) return [];

    const result: string[] = [];

    if (ranks.rollingstone) {
        result.push(`Rolling Stone: #${ranks.rollingstone}/500`);
    }

    if (ranks.apple) {
        result.push(`Apple: #${ranks.apple}/100`);
    }

    return result;
}