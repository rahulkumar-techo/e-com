// utils/normalize.ts
export const normalizeHeader = (value: string | string[] | undefined, fallback = ""): string => {
    if (!value) return fallback;
    return Array.isArray(value) ? value.join(",") : value;
};
