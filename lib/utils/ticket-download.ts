/**
 * @module utils/ticket-download
 * @category Utils
 *
 * Pure helpers for the downloadable queue ticket: formatting the arrival
 * time shown on the ticket, and building/parsing the recovery URL encoded
 * in its QR code. Building and parsing live together so the two query
 * param names can only ever go out of sync in one place.
 */

/** Query param names for the pre-filled /retrouver link. */
export const RECOVER_NAME_PARAM = "name"
export const RECOVER_CODE_PARAM = "code"

/**
 * Formats an ISO timestamp as a short local time, e.g. "14:32". Uses the
 * runtime's local timezone (correct for a client-rendered ticket — the
 * runtime is the customer's own device) and the French locale to match the
 * rest of the app's copy.
 */
export function formatArrivalTime(isoString: string): string {
    return new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(isoString))
}

/**
 * Builds the /{slug}/retrouver URL pre-filled with the customer's name and
 * recovery code, encoded into the ticket's QR code. Scanning it opens the
 * existing recovery form already filled in — the customer still has to
 * confirm and submit; nothing here auto-submits on their behalf.
 */
export function buildRecoverUrl(params: {
    baseUrl: string
    slug: string
    customerName: string
    code: string
}): string {
    const query = new URLSearchParams({
        [RECOVER_NAME_PARAM]: params.customerName,
        [RECOVER_CODE_PARAM]: params.code,
    })
    return `${params.baseUrl}/${params.slug}/retrouver?${query.toString()}`
}

/**
 * Reads the pre-fill values a scanned ticket QR code may have put in the
 * URL. Missing params come back as empty strings, matching the recovery
 * form's own empty-input default.
 */
export function parseRecoverParams(searchParams: URLSearchParams): {
    name: string
    code: string
} {
    return {
        name: searchParams.get(RECOVER_NAME_PARAM) ?? "",
        code: searchParams.get(RECOVER_CODE_PARAM) ?? "",
    }
}
