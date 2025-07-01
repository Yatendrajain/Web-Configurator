This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Drizzle-ORM & Migrations

Drizzle-ORM is used here for type-safe database access, and migrations are managed with \`drizzle-kit\`. Checkpoints are stored in your database under the table \`drizzle.\_\_drizzle_migrations\`.

1. **Generate a new empty migration**

   ```bash
   npm run migrate:generate -- --name=<custom-name>
   ```

   Creates a blank SQL file in your \`drizzle\` migrations folder for manual edits.

2. **Edit the generated SQL**  
   Open the newly created file (e.g. \`drizzle/0003\_<custom-name>.sql\`) and add your SQL statements.

3. **Push (apply) migrations to the database**

   ```bash
   npm run migrate:push
   ```

   Runs all pending migrations in order, recording each one in \`drizzle.\_\_drizzle_migrations\`.

4. **Inspect applied migrations**  
   You can confirm which migrations have run by querying:
   ```sql
   SELECT id, name, executed_at
   FROM drizzle.__drizzle_migrations
   ORDER BY id;
   ```
