# DriveHub — Company A Dealership Application

DriveHub is an assumed working product name, not Company A’s official brand name. See [TDD.md](./TDD.md) for the architecture, data relationships, and documented assumptions.

A phased full-stack dealership application for Company A in Lucknow, Uttar Pradesh. The app is being built with Next.js App Router, JavaScript, Tailwind CSS, PostgreSQL, Prisma, Auth.js, Gemini, Vitest, and Vercel.

## Current implementation phase

The app includes database-backed public inventory and vehicle details, enquiry and test-drive submission, showroom/model-based consultant lead assignment, an internal lead acknowledgement, consultant lead access, consent preference capture, an admin inventory/model/variant/image editor, and city-specific on-road pricing. Gemini generation, external messaging, and real image uploads are not implemented.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`. Set `DATABASE_URL` to a development PostgreSQL database you control, generate a private `AUTH_SECRET`, and set a private `DEMO_ACCOUNT_PASSWORD` (12 to 72 UTF-8 bytes). Never commit `.env`.
3. Generate the Prisma client with `npm run db:generate`.
4. Apply the checked-in migrations with `npm run db:migrate`.
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

The seed creates three showrooms in Lucknow, two demo cars and future test-drive slots, four consultants across the three showrooms, two buyers, one administrator, and two illustrative assigned leads. Two consultants share the first showroom and Model H eligibility so the round-robin behavior can be exercised. Stable slot IDs prevent repeated seeds from adding more slots or reopening already reserved slots. Their names, identities, demo vehicles, slots, lead details, and zero-only phone placeholders are assumed test data, not Company A business facts. Email addresses use the reserved `.invalid` domain. Every seeded account gets the password from `DEMO_ACCOUNT_PASSWORD`; it is hashed with bcrypt before storage and is never printed. Do not reuse this development password in a deployed environment.

The sample account email addresses are `admin@drivehub.example.invalid`, `consultant.one@drivehub.example.invalid` through `consultant.four@drivehub.example.invalid`, and `buyer.one@drivehub.example.invalid` / `buyer.two@drivehub.example.invalid`.

One clearly marked assumed CityPrice is seeded for NEW-H-02 in Lucknow so the pricing flow can be demonstrated. `UC-1190` remains BOOKED and is excluded from all demo-car slots. Official inventory upserts create the supplied records once and do not overwrite later admin edits on repeated seeds.

## City-wise on-road pricing

The server selects a `CityPrice` for the requested city and variant whose effective dates include the current date. It calculates:

`On-road estimate = ex-showroom + round(ex-showroom × road-tax basis points / 10,000) + registration + insurance + accessories + other applicable charges`

Each component is stored separately, and the buyer sees the itemized result and validity dates. The endpoint does not return an estimate when a record is missing, invalid, or expired. Prices include a notice that they can change and should be confirmed with Company A.

The seeded Lucknow example is **assumed demonstration data, not an official Company A quote**: ₹12,45,000 ex-showroom, 8% road tax (800 basis points), ₹10,000 registration, ₹25,000 insurance, ₹15,000 accessories, and ₹0 other charges; valid through 31 December 2026. Its illustrative total is ₹13,94,600. Admins can edit the record or mark other entries as assumed; there are no client-approved city rates in the brief.

Admin-managed vehicle images accept HTTPS `images.unsplash.com` URLs only and are always flagged as assumed placeholders. Upload/storage integration is not included. Used-car owner counts and inspection summaries in the seed are also assumed, explicitly marked, and replaceable in the admin inventory editor.

## Assumptions and outstanding client inputs

- Lucknow, Uttar Pradesh, India and the three-showroom count are supplied by the brief. The three showroom names seeded are assumptions; addresses are blank.
- The client stated there are two service workshops and one certified used-car yard, but did not provide names or addresses. These locations are not invented or seeded.
- The sample city-price amounts above are assumptions used to exercise the pricing flow. Replace them with client-approved tax, registration, insurance, accessory, and other-charge values before presenting an estimate as actual dealer pricing.
- Previous-owner counts and inspection text on the two official used vehicles are assumed demo details; registration numbers are not created.
- Seeded consultant and buyer accounts, demo cars, and booking slots are assumed, fictional development data. Production staff accounts and notification-provider settings need client approval.
- Lead assignment is attempted immediately using active consultants eligible for both the selected showroom and interested model. A persisted round-robin cursor rotates between eligible consultants. If none qualify, the lead remains unassigned in the admin queue. The five-minute response timer is measured from lead creation; the assignment acknowledgement is internal only. There is no email/SMS/WhatsApp notification integration, so the five-minute target is monitored but not guaranteed.
- Gemini output is not connected. Consultants can save and approve manual drafts, but approval never sends a message.

## Backend and authorization

- Auth.js uses an email/password Credentials provider with JWT sessions. Passwords are bcrypt-hashed; buyer registration can create only BUYER accounts. Admins create consultant credentials.
- Authorization re-reads the active user and role from PostgreSQL. Consultant lead reads and updates are constrained to that consultant's current assignments; admins can access all leads. Every action performs its own role/record checks.
- Public route: `GET /api/vehicles` returns non-demo inventory with a restricted vehicle DTO.
- Public route: `GET /api/prices?cityId=...&variantId=...` calculates an itemized on-road estimate on the server from the currently valid city/variant record and returns whether values are assumed.
- Protected routes: `GET /api/consultant/leads` and `GET /api/consultant/leads/:id` require consultant/admin access; consultants only receive assigned leads.
- Server Actions cover buyer registration, enquiry/test-drive requests, consent updates, consultant status/draft/reassignment operations, and admin inventory, vehicle images, model/variant, city pricing, showroom, and consultant operations.
- An enquiry records contact consent, assigns an eligible consultant immediately when one exists, and writes a LeadAssignment history record. A test-drive request additionally reserves an open slot in a transaction. The buyer's vehicle of interest is separate from the demo vehicle whose time slot is reserved. The slot must belong to an active showroom and an available demo vehicle, so NEW-H-02 is not assumed to be a demo car and the booked official used unit cannot be booked.
- Demo account passwords are shared for convenient local testing only. Configure `.env` privately and do not commit secrets.

## Checks

- `npm run lint`
- `npm test`
- `npm run db:generate`
- `npm run db:migrate` (requires a reachable PostgreSQL database)
