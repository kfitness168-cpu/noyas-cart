noyas-cart

## Orders admin
- `/admin.html`: kitchen view for orders (password protected).
- Orders are saved by Cloudflare Pages Functions in `functions/api/` to the KV namespace bound as `ORDERS`.
- Dish ingredients (shown to customers and on the kitchen ticket) are in the `ING` list in `index.html`.
