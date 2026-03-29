export function formatReleaseText(album: {
    year?: number | null;
    label?: string | null;
}) {
    if (!album?.year) return null;

    return `Released ${album.year}${album.label ? `, ${album.label}` : ""}`;
}

export function formatListenedAt(listenedAt?: string | null) {
    if (!listenedAt) return null;

    const date = new Date(listenedAt);
    if (Number.isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
    }).format(date);
}