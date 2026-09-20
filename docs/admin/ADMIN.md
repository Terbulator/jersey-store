# Admin Panel

Location: `/admin/*`. Access: `ADMIN` only.

## Pages

- **Dashboard** (`/admin`) — stats, recent activity.
- **Users** — list users, change roles.
- **Owners** — list vendors, approve/suspend.
- **Workers** — global worker list.
- **Products** — full product table + CRUD (create/edit via inline dialog).
- **Orders** — all orders, update status/payment status.
- **Categories** — category CRUD.
- **Audit** — searchable audit log.
- **Settings** — site configuration (key/value).

## API

All under `/api/admin/*`, guarded by `getAdminUser()` from `src/lib/admin-guard.ts`.
Mutations write to the audit log.

## Notes

- Product create/edit is done from the products list page dialog (there are no separate
  `new` / `[id]` pages). Edit sends `PATCH /api/admin/products/[id]`; create sends `POST /api/admin/products`.
- Order status updates go through `PATCH /api/admin/orders` with `orderId` in the body.
