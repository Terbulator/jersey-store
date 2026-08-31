# Owner Panel

Location: `/owner/*`. Access: `OWNER` only (a user with an approved `Vendor`).

## Pages

- **Dashboard** (`/owner`) — own-store stats.
- **Products** — their products + CRUD (create/edit via inline dialog).
- **Orders** — orders containing their products.
- **Workers** — manage their employees.
- **Tasks** — create/manage tasks for workers.
- **Settings** — store profile.

## API

All under `/api/owner/*`, guarded by `getOwnerUser()` from `src/lib/owner-guard.ts`.

## Data scoping

Every OWNER query is filtered by the owner's vendor:

- Products: `WHERE vendorId = <their vendor>`
- Workers: `WHERE ownerId = <their user id>`
- Orders: only orders whose items include their products

Owners can never see another owner's data or the admin settings.
