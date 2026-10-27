import type { GiftStatus } from "../types/giftlog.ts";

// Case-insensitive lookup, so "mamma" finds "Mamma"
export function findByName<T extends { name: string }>(items: T[], name: string) {
    const wanted = name.trim().toLocaleLowerCase("nb");
    return items.find((item) => item.name.trim().toLocaleLowerCase("nb") === wanted);
}

// Local date as YYYY-MM-DD
export function todayIso() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
}

// Uses the API's { error } text when there is one
export function apiErrorMessage(err: unknown) {
    const body = (err as { body?: { error?: unknown } })?.body;
    if (typeof body?.error === "string") {
        return body.error;
    }
    return (err as Error)?.message ?? "Unknown error";
}

// From idea to given
export const STATUS_ORDER: GiftStatus[] = ["idea", "bought", "sent", "given"];

export const STATUS_LABELS: Record<GiftStatus, string> = {
    idea: "Idé",
    bought: "Kjøpt",
    sent: "Sendt",
    given: "Gitt",
};

// Bootstrap icon class for an occasion, matched on its name
export function occasionIcon(name: string) {
    const lower = name.toLocaleLowerCase("nb");
    if (lower.includes("jul")) {
        return "bi-snow2";
    }
    if (lower.includes("bursdag") || lower.includes("fødselsdag")) {
        return "bi-cake2";
    }
    return "bi-gift";
}

// Whole kroner with Norwegian thousands separator, e.g. "1 200 kr"
export const formatKr = (amount: number) => `${amount.toLocaleString("nb-NO")} kr`;
