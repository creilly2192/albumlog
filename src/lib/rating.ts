export const RATING_CONFIG = {
    loved: {
        color: "var(--accent)",
        label: "Loved",
    },
    liked: {
        color: "var(--color-purple)",
        label: "Liked",
    },
    interesting: {
        color: "var(--accent-interesting)",
        label: "Interesting",
    },
    not_for_me: {
        color: "var(--accent-no)",
        label: "Not for me",
    },
} as const;

type RatingKey = keyof typeof RATING_CONFIG;

export function getRatingMeta(rating: string | null) {
    if (!rating) {
        return {
            color: "var(--color-border-muted)",
            label: "Unrated",
        };
    }

    return (
        RATING_CONFIG[rating as RatingKey] ?? {
            color: "var(--color-border-muted)",
            label: "Unrated",
        }
    );
}