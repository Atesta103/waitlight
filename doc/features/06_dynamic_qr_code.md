# Feature 06: Dynamic QR Code

* **Type**: Usage evolution (Evolution)
* **Dependencies**: [Feature 02: Settings (Slug availability)](./02_merchant_settings.md)

**Description**: Provide a screen within the merchant space that generates a permanent QR Code scannable by the customer, directing them to the queue subscription URL.

## Integration sub-tasks

### Backend (Supabase)
- [ ] No significant DB impact. The target URL will be statically computed based on the merchant slug (e.g., `https://wait-light.app/[slug]/join`).

### Frontend (Next.js)
- [ ] Add a `/(dashboard)/qr-display` view in the main sidebar.
- [ ] Integrate the `react-qr-code` or `qrcode.react` NPM package (forcing SVG rendering).
- [ ] Add an action bar above the code with a button to "Print Flyer" and "Download Image".
- [ ] Integrate the `react-to-print` hook to directly print the QR code without browser chrome.

## Identified additional tasks

### Quality & robustness
- [ ] **SVG format**: Ensure the QR code is generated as an SVG, not a raster PNG, so it prints with absolute crispness regardless of flyer size.
- [ ] **Regeneration Warning**: Bind logic ensuring the merchant understands that if they change their vanity `slug` in Settings, physical printouts will become invalid. 

### UX & accessibility
- [ ] **WakeLock API**: Setup the **WakeLock** Browser API for the `qr-display` route. If the merchant places an iPad facing the customer line for self-scanning, the tablet screen must not go to sleep after 30 seconds.
- [ ] **Print CSS**: Include a `@media print` CSS block that actively hides the dashboard navigation layout, centers the QR code on an A4 sheet, and adds the "Scan to join the queue!" subtitle. 

### Security
- [ ] **Data Minimization**: The QR code strictly encodes an unauthenticated public route (`/join`). No secret session keys or tokens should ever be embedded in this static asset.

## Architecture Notes
- By calculating the QR Code heavily **client-side** (in the DOM context) based on the database `slug` string, we avoid storing persistent image blobs in Supabase Storage. This saves significant bandwidth, database size, and avoids synchronization mismatches entirely.
