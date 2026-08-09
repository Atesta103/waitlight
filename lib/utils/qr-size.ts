
/**
 * Fixed chrome around the QR canvas inside QRCodeDisplay's card: header,
 * countdown, camera hint, footer buttons, all paddings/gaps, plus the QR
 * block's ~38px overhang beyond `size` (see QRCodeDisplay's viewSize). The
 * card fills its container's height, so the canvas gets containerHeight − this.
 * Deterministic (all these parts have fixed heights), tuned by eye — see spec
 * docs/superpowers/specs/2026-08-06-responsive-app-wide-design.md.
 */
export const QR_CARD_CHROME_PX = 366
export const QR_SIZE_MIN = 120
export const QR_SIZE_MAX = 240

/**
 * Canvas pixel size for the QR so its card fits `containerHeight` without
 * scrolling, clamped to [min, max]. Returns min for an unmeasured (0 / NaN)
 * container so first paint shows a sane size before ResizeObserver fires.
 */
export function computeQrSize(
    containerHeight: number,
    chrome = QR_CARD_CHROME_PX,
    min = QR_SIZE_MIN,
    max = QR_SIZE_MAX,
): number {
    if (!Number.isFinite(containerHeight) || containerHeight <= 0) return min
    const available = Math.round(containerHeight - chrome)
    return Math.max(min, Math.min(max, available))
}
