# Feature Ideas

- **Automatic Preparation Time Adjustment**: The merchant defines a baseline preparation time for an item (e.g., a burger). The application measures the actual time taken to prepare this item. If, after a certain number of orders (e.g., 50 times), the application notices that the average preparation time is consistently longer or shorter, it automatically updates the estimated preparation time for this item.
  - **How to integrate it?**: Record the exact start and end timestamps of each preparation in Supabase. A database trigger (or a cron job/Edge Function) calculates the rolling average of the last 50 orders of the item, then automatically updates the `estimated_time` field of the `articles` table if the deviation is too significant compared to the current defined time.

- **Order / Inventory Forecasting**: The application analyzes past orders and current orders to predict the number of upcoming orders. This allows the merchant to forecast stock needs and prepare items accordingly.
  - **How to integrate it?**: Create an Analytics dashboard querying the sales history (SQL by day of the week and hour). Apply a simple statistical algorithm to make an average stock suggestion (e.g., "plan for 40 burger buns tonight").

- **Mobile Display of Merchant QR Code**: The merchant can log into their space from their smartphone to generate and present a QR Code to their customers. This allows them to scan the code to order, thus eliminating the need for the merchant to invest in a dedicated display screen.
  - **How to integrate it?**: Add a dedicated "Generate a QR Code" view on the merchant interface, formatted for mobile display. Use a library like `react-qr-code` or `qrcode.react` that embeds the URL or identifier of the current shop/table page.

- **Third-Party Authentication for Merchants (SSO)**: Provide merchants with the ability to create an account and log in simply and securely using their Google or Apple credentials.
  - **How to integrate it?**: Enable the Google and Apple providers in the Supabase Auth administration interface. In the frontend, use the `supabase.auth.signInWithOAuth()` method associating it with "Continue with Google/Apple" buttons.

- **Customer Order Details**: On the merchant / customer side, the interface clearly displays all information related to an ongoing order (order number, customer identity, details and quantity of items, total amount, etc.). **(How to retrieve information without the merchant having to rewrite everything?)**
  - **How to integrate it?**: Since the customer orders directly at the counter, here are the solutions to avoid double entry for the merchant:
    1. **API Connection with the POS**: This is the ideal solution. The application (or the Supabase server) connects via an API to the merchant's POS software (e.g., Square, Zettle, Lightspeed). As soon as the payment is validated on the POS, it automatically sends the order details to Waitlight (via Webhooks).
    2. **Shortcut Catalog (Visual Buttons)**: If the POS is not connectable, the merchant interface offers a grid of large buttons corresponding to the products. The merchant "taps" the items to build the ticket in 2 seconds, without ever using their keyboard.
    3. **Smart Scan (Receipt OCR)**: (more experimental) The merchant uses their smartphone camera to scan one of their outgoing receipts, and the app automatically extracts items and amounts.

## Discarded Ideas (Out of Scope)

It is important to keep focus on the main value proposition of the application. Here are ideas that deviate too far from the initial concept or that would require disproportionate efforts compared to their current usefulness:

- **Direct Customer Ordering via the App**: Removed. The current concept relies on orders being placed and paid for directly at the counter with the merchant. The application solely serves to display the progress status of this order to the customer (notably via QR code/Virtual Queue). Integrating customer-side ordering into the app would transform the product into a full Click & Collect/Online Payment tool, which is highly complex (currency management, Stripe fees, accounting integrations, risks of unpaid bills, refunds).
