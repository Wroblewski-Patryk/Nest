This is the Nest web client.

## Getting Started

Install dependencies from this app directory or from the repository root using
`pnpm --dir apps/web install`.

Run the development server:

```bash
pnpm dev
```

The Nest web client runs on [http://localhost:9001](http://localhost:9001).

For the full local stack you also need the API running on `http://127.0.0.1:9000`.

Typical local flow:

1. `composer install --working-dir ../api`
2. prepare `../api/.env`
3. `php artisan migrate --seed` from `../api`
4. `php artisan serve --host=127.0.0.1 --port=9000` from `../api`
5. `pnpm dev` from `apps/web`

Key web commands:

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test:unit`
- `pnpm build`

## Learn More

Primary repository docs:

- `../../README.md`
- `../../docs/engineering/development_and_deployment.md`
- `../../docs/architecture/frontend_strategy.md`

For framework-specific details:

- [Next.js Documentation](https://nextjs.org/docs)

## Local Auth Seed

After `php artisan migrate --seed` in `apps/api`:

- email: `admin@admin.com`
- password: `password`
