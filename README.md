noyas-cart

## Orders admin
- `/admin.html`: kitchen view for orders (password protected).
- Orders are saved by Cloudflare Pages Functions in `functions/api/` to the KV namespace bound as `ORDERS`.
- Dish ingredients (shown to customers and on the kitchen ticket) are in the `ING` list in `index.html`.

## Menu (Nov 2026, home-prep version)
- Menu items are the `M` list in `index.html`. Sandwiches pick bread (לחמנייה / פיתה) via the `BREAD` group; בייגל טוסט is its own dish.
- Daily sandwich cap: `CAP` in `index.html` (30). Counted server-side in KV key `cap:YYYY-MM-DD` (`functions/api/cap.js`); deleting an order in the admin frees its sandwiches.
- No grams on customer-facing text, only unit counts.
