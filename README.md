# Company A Dealership Application

A phased full-stack dealership application for Company A in Lucknow, Uttar Pradesh. The app is being built with Next.js App Router, JavaScript, Tailwind CSS, PostgreSQL, Prisma, Auth.js, Gemini, Vitest, and Vercel.

## Current implementation phase

Phase 1 establishes the data model and official inventory seed. Customer, consultant, and admin workflows are not yet connected to the database. The previous visual prototype is not a source of official inventory, prices, or dealership information.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to a PostgreSQL database you control. Set `AUTH_SECRET` before enabling authentication.
3. Generate the Prisma client with `npm run db:generate`.
4. Apply the schema to a local development database with `npm run db:migrate -- --name init`.
5. Seed the fixed official records with `npm run db:seed`.
6. Start the app with `npm run dev`.

`npm run db:push` is available for a disposable local database when you do not need migration history. Use migrations for shared environments.

## Official inventory seed

The seed in `prisma/seed-data.mjs` contains exactly these supplied records:

| Stock ID | Type | Model / variant | Fuel | Year | Kilometres | Price | Basis | Status |
|---|---|---|---|---:|---:|---:|---|---|
| `NEW-H-02` | New | Model H / ZX Automatic | Petrol | 2026 | 0 | ₹12,45,000 | Ex-showroom | Available |
| `UC-1182` | Used | Model C / VX | Diesel | 2022 | 41,200 | ₹8,45,000 | Listing price | Available |
| `UC-1190` | Used | Model S / LX | Petrol | 2021 | 58,600 | ₹5,12,000 | Listing price | Booked |

The seed is repeatable and upserts only these stock IDs. It does not create vehicle registration numbers, showroom addresses, tax rates, or demonstration slots.

## Assumptions and outstanding client inputs

- Lucknow, Uttar Pradesh, India is supplied by the brief. No other city or showroom address is seeded.
- The client stated there are three showrooms, two service workshops, and one certified used-car yard, but did not provide names or addresses.
- No on-road pricing rates are seeded. Admin pricing must be configured from client-approved tax, registration, insurance, and fee inputs before showing an estimate.
- Consultant accounts, staff rosters, demo cars, booking slots, and notification-provider settings still need client-approved details.
- Gemini output will be a consultant-reviewed draft, never an automatically sent reply or a source of price/assignment decisions.

## Checks

- `npm run lint`
- `npm test`
- `npm run db:generate`
- `npm run db:migrate -- --name init` (requires a reachable PostgreSQL database)
