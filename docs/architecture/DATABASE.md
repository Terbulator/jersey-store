# Database

PostgreSQL managed through Prisma. Schema lives in `prisma/schema.prisma`.

## Core models

- **User** — global account with `role` (`CUSTOMER | OWNER | WORKER | ADMIN`).
- **Vendor** — a store owned by a `User` (the OWNER). Products reference `vendorId`.
- **Category** — self-referencing product categories.
- **Product / ProductImage / ProductVariant** — catalog, images, SKU-level stock/price.
- **Order / OrderItem** — purchases. Items link to product, variant, and vendor.
- **Worker** — an OWNER's employee; links a `User` (worker account) to an `ownerId`.
- **Task** — work item optionally assigned to a Worker and linked to an Order.
- **AuditLog** — immutable audit trail with actor, action, old/new values, IP.
- **Notification** — in-app notifications per user.
- **Setting** — key/value JSON store.

## Role-based data isolation

- ADMIN: everything.
- OWNER: only rows where `vendorId = their vendor.id` / `ownerId = their user.id`.
- WORKER: only tasks assigned to them + related orders.
- CUSTOMER: only their own orders / wishlist.

## Applying changes

```bash
npm run db:push   # applies schema to the dev DB
npm run db:seed   # seeds demo users (owner@example.com / worker@example.com / admin)
```
