# getalawyer-fr

Nuxt 4 client app for [getalawyer.ng](https://getalawyer.ng). Talks to the Law-Backend API (`api.getalawyer.ng`).

## Setup

```bash
bun install
cp .env.example .env
```

## Development

```bash
bun run dev
```

Runs at `http://localhost:3000` and expects the API at `http://localhost:3001`.

## Production

```bash
bun run build
bun run start
```

Set on the host:

```env
NUXT_PUBLIC_API_URL=https://api.getalawyer.ng
NUXT_PUBLIC_BETTER_AUTH_URL=https://api.getalawyer.ng/api/auth
NUXT_SITE_URL=https://getalawyer.ng
```

## Tests

```bash
bun run test:run
```
