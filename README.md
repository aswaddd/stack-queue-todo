# Stack & queue todo

Personal study board: a **stack** (current thread / subtasks) and a **queue** (waiting work), side by side. Built with Next.js so it can live on Vercel’s free plan.

## Local

```bash
npm install
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Default password is `study` (from `.env`). Change `AUTH_PASSWORD` and `AUTH_SECRET` before you share or deploy it.

SQLite is stored in `prisma/dev.db` for local use.

## Free online database (Turso)

Vercel’s filesystem is ephemeral, so production needs a hosted DB. [Turso](https://turso.tech) is a free SQLite cloud that matches this schema.

1. Create a free Turso account and a database, e.g. `stack-queue-todo`.
2. Copy the `libsql://…` URL and an auth token.
3. Apply the schema once:

```bash
turso db shell stack-queue-todo < prisma/init.sql
```

Or, with the Turso CLI installed, paste the SQL from `prisma/init.sql` into the Turso dashboard SQL editor.

## Deploy on Vercel

1. Push this repo to GitHub and import it in Vercel (Hobby / free).
2. Set environment variables:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | `file:./prisma/dev.db` (needed by Prisma generate; unused in prod if Turso is set) |
| `TURSO_DATABASE_URL` | `libsql://your-db.turso.io` |
| `TURSO_AUTH_TOKEN` | Turso token |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_PASSWORD` | your login password |

3. Deploy. Login page is `/`; the board is `/board`.

## How to use it while studying

- **Stack:** push the thing you just dove into. Pop when you finish or surface again.
- **Queue:** enqueue work that should wait. Dequeue when you are ready for the next item.
- Click any card to edit or remove it. Drag to change order when a subtask needs to jump.
