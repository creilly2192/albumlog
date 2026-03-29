export const RATING_CONFIG = {
    loved: {
        color: "var(--color-coral)",
        label: "Loved",
    },
    interesting: {
        color: "var(--color-purple)",
        label: "Interesting",
    },
    not_for_me: {
        color: "var(--color-blue)",
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