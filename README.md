# DriveHub — Company A Dealership Application

DriveHub is an assumed working product name, not Company A’s official brand name. See [TDD.md](./TDD.md) for the architecture, data relationships, and documented assumptions.

A phased full-stack dealership application for Company A in Lucknow, Uttar Pradesh. The app is being built with Next.js App Router, JavaScript, Tailwind CSS, PostgreSQL, Prisma, Auth.js, Gemini, Vitest, and Vercel.

## Current implementation phase

The app includes the public showroom and inventory screens, enquiry and test-drive submission, consultant lead access, consent preference capture, and a read-only admin preview. PostgreSQL/Prisma, Auth.js credentials login, roles, server-side actions, and protected lead endpoints form the backend foundation. Gemini generation and persistent admin-form wiring are not implemented yet.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`. Set `DATABASE_URL` to a development PostgreSQL database you control, generate a private `AUTH_SECRET`, and set a private `DEMO_ACCOUNT_PASSWORD` (12 to 72 UTF-8 bytes). Never commit `.env`.
3. Generate the Prisma client with `npm run db:generate`.
4. Apply the schema with `npm run db:migrate -- --name backend_foundation`.
5. Seed official inventory and labeled development-only demo data with `npm run db:seed`.
6. Start the app with `npm run dev`; use `/login` to sign in or `/register` to create a buyer account.

`npm run db:push` is available for a disposable local database when you do not need migration history. Use migrations for shared environments.

The current environment has no configured PostgreSQL connection. Prisma schema/client checks can run locally, but the migration and database-seed verification must be completed after a development database is configured.

## Official inventory seed

The seed in `prisma/seed-data.mjs` contains exactly these supplied records:

| Stock ID | Type | Model / variant | Fuel | Year | Kilometres | Price | Basis | Status |
|---|---|---|---|---:|---:|---:|---|---|
| `NEW-H-02` | New | Model H / ZX Automatic | Petrol | 2026 | 0 | ₹12,45,000 | Ex-showroom | Available |
| `UC-1182` | Used | Model C / VX | Diesel | 2022 | 41,200 | ₹8,45,000 | Listing price | Available |
| `UC-1190` | Used | Model S / LX | Petrol | 2021 | 58,600 | ₹5,12,000 | Listing price | Booked |

The seed is repeatable and upserts these three stock IDs without changing their supplied attributes. It does not create vehicle registration numbers, showroom addresses, or city tax/fee rates.

## Assumed development accounts and demo data

The seed creates three showrooms in Lucknow, two demo cars and future test-drive slots, three consultants assigned one per showroom, two buyers, one administrator, and two illustrative assigned leads. Their names, identities, demo vehicles, slots, lead details, and zero-only phone placeholders are assumed test data, not Company A business facts. Email addresses use the reserved `.invalid` domain. Every seeded account gets the password from `DEMO_ACCOUNT_PASSWORD`; it is hashed with bcrypt before storage and is never printed. Do not reuse this development password in a deployed environment.

The sample account email addresses are `admin@drivehub.example.invalid`, `consultant.one@drivehub.example.invalid` through `consultant.three@drivehub.example.invalid`, and `buyer.one@drivehub.example.invalid` / `buyer.two@drivehub.example.invalid`.

No CityPrice records are seeded because road-tax, registration, insurance, and fee inputs were not supplied. `UC-1190` remains BOOKED and is excluded from all demo-car slots.

## Assumptions and outstanding client inputs

- Lucknow, Uttar Pradesh, India and the three-showroom count are supplied by the brief. The three showroom names seeded are assumptions; addresses are blank.
- The client stated there are two service workshops and one certified used-car yard, but did not provide names or addresses. These locations are not invented or seeded.
- No on-road pricing rates are seeded. Admin pricing must be configured from client-approved tax, registration, insurance, and fee inputs before showing an estimate.
- Seeded consultant and buyer accounts, demo cars, and booking slots are assumed, fictional development data. Production staff accounts and notification-provider settings need client approval.
- Lead assignment is immediate, least-loaded by current lead count, and scoped to the requested showroom when one is selected. There is no email/SMS notification integration; the five-minute response requirement is a business target, not a notification guarantee.
- Gemini output is not connected. Consultants can save and approve manual drafts, but approval never sends a message.

## Backend and authorization

- Auth.js uses an email/password Credentials provider with JWT sessions. Passwords are bcrypt-hashed; buyer registration can create only BUYER accounts. Admins create consultant credentials.
- Authorization re-reads the active user and role from PostgreSQL. Consultant lead reads and updates are constrained to that consultant's current assignments; admins can access all leads. Every action performs its own role/record checks.
- Public route: `GET /api/vehicles` returns non-demo inventory with a restricted vehicle DTO.
- Public route: `GET /api/prices?cityId=...&variantId=...` calculates an itemized on-road estimate only when the related approved inputs exist.
- Protected routes: `GET /api/consultant/leads` and `GET /api/consultant/leads/:id` require consultant/admin access; consultants only receive assigned leads.
- Server Actions cover buyer registration, enquiry/test-drive requests, consent updates, consultant status/draft/reassignment operations, and admin inventory, city pricing, showroom, and consultant operations.
- An enquiry records contact consent, assigns an active consultant immediately, and writes a LeadAssignment history record. A test-drive request additionally reserves an open slot in a transaction. The slot must belong to an active showroom and an available demo vehicle, so the booked official used unit cannot be booked.
- Demo account passwords are shared for convenient local testing only. Configure `.env` privately and do not commit secrets.

## Checks

- `npm run lint`
- `npm test`
- `npm run db:generate`
- `npm run db:migrate -- --name backend_foundation` (requires a reachable PostgreSQL database)
