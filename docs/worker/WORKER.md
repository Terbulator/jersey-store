# Worker Panel

Location: `/worker/*`. Access: `WORKER` only.

## Pages

- **Dashboard** (`/worker`) — task summary (pending / in-progress / completed).
- **Tasks** — assigned tasks.
- **Task detail** (`/worker/tasks/[id]`) — update status, add notes.

## API

All under `/api/worker/*`, guarded by `getWorkerUser()` from `src/lib/worker-guard.ts`.

## Data scoping

- Tasks: `WHERE workerId = <their worker profile id>`.
- Orders: only orders related to their assigned tasks.

Workers cannot manage products, other workers, or access admin/owner functions.
