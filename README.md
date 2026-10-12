# Sacred India — Temple Heritage & Pilgrimage Guide

A public temple discovery portal built with Next.js, Node.js, Tailwind CSS, and MongoDB. Visitors can browse and search without creating an account or receiving email. A password-protected admin desk manages temple content and anonymous portal KPIs.

## Run locally

1. Install Node.js 20.9 or newer.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Set `MONGODB_URI` to your MongoDB connection string, using the `india_temple_heritage` database name, and set a unique `ADMIN_PASSWORD` of at least 16 characters.
5. Start the app with `npm run dev`, then open [http://localhost:3000](http://localhost:3000).
6. Add the example temple guides to MongoDB with `npm run seed` (safe to re-run; existing records are not overwritten).
7. Open `/admin` and sign in with `ADMIN_PASSWORD` to add, edit, feature, or remove temple guides.

The development `.env.local` is git-ignored. In Vercel, configure `MONGODB_URI` and `ADMIN_PASSWORD` in project environment-variable settings; never commit real credentials.

## Portal features

- Search temple names, cities, states, deities, and festivals; browse by state or city.
- Temple detail guides for history, deities, rituals, festivals, darshan, and visitor guidance.
- Browser-local saved places and native share / copy-link actions; no visitor accounts.
- Single-password admin access with an HTTP-only session cookie; no email API or user registration.
- Anonymous, browser-based monthly active visitors, search success, engagement, and satisfaction metrics at `/admin`.
- Starter sample data for six well-known temples. Schedules and visitor requirements are described as subject to change; verify details with temple authorities before travelling.

## Data and privacy

Temple records are stored in MongoDB. Saved places remain in the visitor's browser. Anonymous metrics use a random browser identifier kept in local storage; no email, account, or IP-based identity is collected. Metrics can be removed from MongoDB's `metrics` collection.

## Checks

```bash
npm run lint
npm run build
```
