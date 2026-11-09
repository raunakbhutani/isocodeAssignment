# DriveHub Technical Design

## Product name

**DriveHub** is an assumed working name for the internship application. It is not the client's official brand name. The client is Company A, an authorized Brand X dealer in Lucknow, Uttar Pradesh. The Company A name is retained for dealership context; Brand X remains the supplied manufacturer placeholder.

## Current implementation scope

The Next.js App Router uses PostgreSQL/Prisma for public inventory/details, buyer registration, enquiry/test-drive requests, consultant lead access, consent records, and draft/status actions. Admin-only server actions and forms manage inventory, models/variants, images, city pricing, showrooms, and consultants. Gemini generates a structured buyer summary and first-reply draft on the server. No messaging provider is connected.

## Route map

| Screen | Route | Main components |
|---|---|---|
| Homepage | `/` | `SiteHeader`, `VehicleCard`, `DemoNotice`, showroom section, `SiteFooter` |
| New cars | `/new-cars` | `ListingExplorer` with model, fuel, and variant filters |
| Used cars | `/used-cars` | `ListingExplorer` with model, fuel, year, and maximum-price filters; inspection information |
| Car details | `/cars/[slug]` | `CarGallery`, specifications, `CityPricePanel`, enquiry and test-drive links |
| Test-drive request | `/book-test-drive` | `TestDriveForm` |
| Enquiry | `/enquiry` | `EnquiryForm` |
| Consultant dashboard | `/consultant/leads` | `LeadTable`, response-target summary |
| Lead details | `/consultant/leads/[id]` | Buyer/enquiry card and `AiLeadPanel` |
| Admin dashboard | `/admin` | Radix Tabs for inventory, models/variants, city pricing, showrooms, and consultants |

## Component responsibilities

- **`SiteHeader` / `SiteFooter`** — Shared responsive navigation and product/dealership identity. DriveHub is presented as the working product name, not a client brand.
- **`Container`, `Eyebrow`, `ButtonLink`, `DemoNotice`, `InfoNotice`, `SectionTitle`** — Small shared layout and message components.
- **`components/ui/primitives.jsx`** — Reusable Tailwind button, card, badge, and Radix UI Tabs primitives, following the shadcn/ui composition style.
- **`CarPhoto`** — Optimized Next.js remote image sizing. All photography in this preview is placeholder imagery and does not show the listed stock units.
- **`VehicleCard`** — Consistent stock ID, variant, exact price basis, fuel, kilometres, status, and placeholder-photo label.
- **`ListingExplorer`** — Local browser-only filtering over the current database inventory and a useful empty state.
- **`CarGallery`** — Shows admin-managed placeholder images when configured, otherwise uses clearly identified illustrative photos.
- **`CityPricePanel`** — Requests a city/variant estimate from the server and displays the dated, itemized component breakup and assumed-price warning.
- **`TestDriveForm`** — Loads active showrooms, available demo vehicles, and future open slots from PostgreSQL; server validation and a transaction reserve a slot.
- **`EnquiryForm`** — Captures buyer details and explicit contact consent, then sends a validated server action that creates and assigns a lead.
- **`LeadTable`** — Search, status, and showroom filtering over records available to the signed-in consultant/admin; admins can also filter the unassigned queue.
- **`AiLeadPanel`** — Displays the validated structured summary or a clear unavailable/manual state, lets consultants edit and save a summary/reply, and records explicit approval. Approval does not send anything.
- **`AdminTabs`** — Protected forms for editing inventory, models/variants, assumed-or-verified city pricing, showroom/consultant records, and placeholder image details.
- **`app/loading.js`, `app/error.js`, `app/not-found.js`** — Shared loading, retryable error, and missing-vehicle experiences.

## Data policy

The temporary frontend inventory is derived from `prisma/seed-data.mjs`, the single source of the three exact records from the brief:

- `NEW-H-02`: New / Model H / ZX Automatic / Petrol / 2026 / 0 km / ₹12,45,000 ex-showroom / Available.
- `UC-1182`: Used / Model C / VX / Diesel / 2022 / 41,200 km / ₹8,45,000 listing price / Available.
- `UC-1190`: Used / Model S / LX / Petrol / 2021 / 58,600 km / ₹5,12,000 listing price / Booked.

UC-1190 is not offered in the test-drive vehicle selector. Prices are formatted in INR. NEW-H-02 is never labeled as on-road. No registration numbers are present; none have been fabricated. If real registration values are added later, the UI/data contract must expose only masked values. Owner counts and inspection summaries are clearly marked assumed demo data.

## Explicit assumptions and unavailable inputs

- The only known city is Lucknow. No tax/registration/insurance schedules were supplied, so a single Lucknow price record is explicitly marked as assumed demonstration data and is not an official Company A quote. Its sample components are ₹12,45,000 ex-showroom, 800 basis points (8%) road tax, ₹10,000 registration, ₹25,000 insurance, ₹15,000 accessories, and ₹0 other charges, effective 1 January–31 December 2026.
- Three showroom names, three consultant accounts, two buyer accounts, one admin, two demo vehicles, and sample time slots are assumed development data. They are marked in seed data and use reserved `.invalid` email addresses.
- Two illustrative leads are also seeded for consultant inbox testing. Their names/emails are fictional, and the zero-only phone is a non-contactable placeholder.
- The seed requires a private `DEMO_ACCOUNT_PASSWORD` environment value, stores only bcrypt hashes, and uses the same password for these development accounts. Never reuse that password in production.
- The live booking form only displays future, open slot records. The seeded demo slots are assumptions, not client-confirmed availability.
- Admin forms are protected by server-side role checks. Inventory edits can update official records by deliberate admin action, while rerunning the seed does not overwrite official vehicle or sample city-price rows.
- Vehicle gallery URLs are restricted to HTTPS `images.unsplash.com` and marked as assumed placeholders. There is no actual file upload integration.
- Migration/seed execution requires a configured PostgreSQL database. The current development environment has no `DATABASE_URL`, so migration and persisted seed verification remain outstanding.

## Database models and relationships

The Prisma schema uses one table per main business concept:

- **User** stores credentials, active state, and the BUYER/CONSULTANT/ADMIN role. Auth.js Account/Session/VerificationToken models are present for adapter compatibility; the Credentials provider uses JWT sessions.
- **CarModel** belongs to a manufacturer name and has many CarVariants.
- **CarVariant** belongs to a CarModel and has a fuel type. It can be referenced by many VehicleInventory rows, CityPrices, and Leads.
- **VehicleInventory** is the stock-level record keyed by stock ID. It links to one variant and optionally one showroom. `priceType` distinguishes `EX_SHOWROOM` from `LISTING_PRICE`; used-only owner/inspection information has an assumption flag. Demo cars may have no sales price. Official seed records are not demos.
- **City** owns showrooms, city-price records, and leads. City name/state/country is unique.
- **CityPrice** links one city and one variant to the ex-showroom price, road-tax basis points, registration, insurance, accessories, and other charges for a validity period. `isAssumed` prevents demonstration amounts from being mistaken for client-approved prices.
- **VehicleImage** links a secure image URL, description, display order, and assumption flag to a stock record.
- **Showroom** belongs to a city and has consultant, demo inventory, test-drive slot, and lead relations. Seeded showroom names are explicitly marked assumed.
- **Consultant** is a one-to-one profile for a CONSULTANT User and belongs to a showroom. Leads point to the profile, not to an arbitrary user ID.
- **ConsultantModel** is the join table that records which car models each consultant can handle. A consultant is only auto-assigned when both the selected showroom and model match.
- **Lead** stores enquiry/contact data, optional buyer, interested vehicle/variant, city/showroom, current consultant assignment, status, and timestamps.
- **LeadAssignment** is assignment history. A lead has many assignment records, each for a consultant and optionally the actor who made the assignment; the showroom and model are retained for audit context.
- **LeadAssignmentCursor** persists the next position in each showroom/model round-robin queue, so assignment distribution is stable across server restarts.
- **LeadNotification** stores an internal acknowledgement for an assigned lead or a notice that an admin needs to assign it. It is not an email, SMS, or WhatsApp delivery record.
- **TestDriveBooking** belongs to a lead and a unique TestDriveSlot; slots point to an assumed demo VehicleInventory row and a showroom. The database enforces at most one booking per slot.
- **ConsentRecord** stores dated granted/revoked choices for a user or lead. Contact and optional marketing consent are separate.
- **LeadActivity**, **LeadAiDraft**, and **TestDriveSlot** support status/audit history, consultant-reviewed AI drafts, and time-slot availability. Lead statuses are New, Contacted, Test Drive Scheduled, Negotiation, Converted, and Lost.
- **LeadAiDraft** also stores a structured JSON summary, provider/manual/unavailable state, a safe status message, reply text, and consultant review time.

## Authentication and authorization

- Auth.js Credentials checks normalized email and bcrypt password hashes. Password hashes use bcrypt cost 12; plaintext passwords are never stored.
- Gemini API access uses the server-only `GEMINI_API_KEY` environment variable. `.env.local` is ignored by Git; `.env.example` contains only a placeholder.
- A new public account can only receive the BUYER role. Admin-only actions create CONSULTANT users and profiles. Role values from browser forms are never trusted.
- Sessions use JWTs, but authorization helpers re-read the user from the database so a deactivated account or changed role does not keep its old access.
- Consultant pages/actions/API handlers require the CONSULTANT or ADMIN role. Lead reads/mutations additionally scope the lead to the current consultant profile. Reassignment is allowed to admins, or to the assigned consultant choosing an active consultant eligible for the same showroom and interested model.
- Admin actions require ADMIN server-side. The official sample records are created exactly by the seed, which uses empty updates for official rows to preserve admin changes on later seed runs.
- Every Server Action validates untrusted form data. Protected Route Handlers return 401 for unauthenticated callers and 403 for wrong roles.

### Important authentication functions

- **`authorize()` in `auth.js`** — Auth.js calls this for email/password sign-in. It validates the submitted values, finds the normalized email, checks the bcrypt hash, rejects inactive users, and returns only safe identity/role fields.
- **`jwt` and `session` callbacks in `auth.js`** — Copy the user ID and role into the encrypted Auth.js JWT/session so the app can identify the signed-in user. Data mutations still look the user up in PostgreSQL before granting access.
- **`getCurrentUser()` in `lib/authz.js`** — Reads the Auth.js session and then reloads the active user and current role from the database.
- **`requireRole()` in `lib/authz.js`** — Stops a server action unless a signed-in active user has one of the allowed roles.
- **`requirePageRole()` in `lib/authz.js`** — Applies the same current-role check to a page and redirects unauthenticated/incorrect-role visitors.
- **`requireLeadAccess()` in `lib/authz.js`** — Checks that a consultant is currently assigned to the requested lead; admins may access any lead.
- **`registerBuyer()` in `app/actions/auth.js`** — Validates and hashes a new password, and always creates a BUYER so a public form cannot create an admin or consultant.

## Backend routes and actions

| Surface | Responsibility |
|---|---|
| `GET /api/vehicles` | Return public non-demo inventory and only the fields needed for display |
| `GET /api/prices?cityId=...&variantId=...` | Select a valid city/variant price record and calculate its itemized on-road total on the server |
| `GET /api/consultant/leads` | Return leads assigned to the signed-in consultant, or all leads for admin |
| `GET /api/consultant/leads/:id` | Return details only when assigned to caller or caller is admin |
| Auth.js `/api/auth/[...nextauth]` | Credentials sign-in/out/session endpoints |
| Buyer registration action | Validate name/email/password, hash password, create only a BUYER |
| Enquiry action | Validate details and mandatory contact consent; create lead, consent record, assignment history |
| Enquiry/test-drive actions | After the lead and any booking are committed, request Gemini assistance and persist the result separately so AI failures do not undo the lead |
| Consent action | Append the buyer's optional marketing preference without conflating it with service contact consent |
| Consultant actions | Read assigned leads; update status/first-response time; save/approve drafts; permitted reassignment |
| Admin actions | Create/update inventory, models/variants, assumed placeholder images, dated city pricing, showrooms, and consultants |

## Important business logic

- **Lead assignment:** At submission, active consultants are filtered to those assigned to both the selected showroom and interested model. Their IDs are ordered consistently; a persisted showroom/model cursor advances to the next consultant for each lead. Assignment history, the assigned timestamp, and an internal acknowledgement are written in the same serializable transaction as the lead. If no eligible consultant exists, the lead is created with no assignee and an internal unassigned acknowledgement for the admin queue. Reassignment requires an admin, or the currently assigned consultant choosing an active consultant who remains eligible for that showroom/model.
- **Five-minute response target:** Automatic assignment is attempted synchronously during lead creation, rather than queued for a later job. The dashboard counts from lead receipt and marks the five-minute response target. This is not a guaranteed SLA: there are no working-hour/capacity rules, external alert delivery, or scheduled escalation. Internal acknowledgement records do not send email, SMS, or WhatsApp.
- **Round-robin limitations:** The cursor is scoped only by showroom/model and distributes assignments evenly by assignment count, not workload or staff availability. Serializable transaction conflicts are retried up to three times. If that still fails, the request returns an error rather than falsely reporting success. Consultants must have explicit model eligibility; unmatched leads stay in the admin queue until an eligible consultant or specialty is configured.
- **Test-drive safety:** The buyer selects an available non-demo inventory vehicle of interest separately from an available demo vehicle. A request must reference an open, future slot at the selected active showroom. A conditional slot update and unique booking constraint prevent two confirmed bookings for the same slot; the booking and lead are created atomically. `NEW-H-02` is not presumed to be a demo car, and `UC-1190` is BOOKED, not a demo vehicle, and cannot be booked.
- **Price separation:** New inventory stores an ex-showroom price; used inventory stores a listing price. Neither is represented as an on-road price. A valid city/variant pricing row is selected by current date, then the server calculates `ex-showroom + round(ex-showroom × roadTaxBasisPoints / 10,000) + registration + insurance + accessories + other charges`. Invalid, incomplete, or expired records do not produce totals. The buyer sees the breakup, validity dates, change notice, and assumption flag.
- **Gemini workflow:** Once the lead transaction succeeds, a server-only service sends Gemini only the interested model/variant, buyer-provided budget, purchase timeline, preferred showroom, and enquiry message. Buyer name, email, and phone are not sent; email/phone patterns in free-text messages are redacted before the API request. The prompt treats buyer text as untrusted and forbids discounts, price quotes, and invented promises. Gemini returns JSON for customer requirements, important questions/concerns, a concise summary, and a first reply. Model, budget, timeline, and showroom in the stored summary are populated from trusted database values rather than generated values. The API key is read from `GEMINI_API_KEY` on the server and must never be embedded in client code or committed.
- **AI validation and fallback:** Response shape and lengths are checked before storing or displaying. Replies that mention prices, quotes, currency amounts, or discounts are rejected. A missing key, timeout, API limit, invalid/empty response, or service error creates an AI-unavailable status after the original lead is saved. The consultant can then manually write and save a summary and reply. AI output is a draft, not business advice or a price source.
- **Human review and sending:** Consultants can edit and explicitly approve drafts; changed text must be saved before approval. Approval is only a review marker. There is no send action or messaging integration, and nothing is sent automatically.
- **AI scope:** Gemini does not calculate new-car on-road pricing or used-car prices. Historical-sales-based used-car price suggestions are a possible future enhancement only after Company A provides an appropriate historical dataset and approves its use.
- **Consent:** Contact permission is required for an enquiry/test-drive request. The optional marketing choice (including a refusal) is separately recorded; buyer settings append future preference changes.

## Styling and accessibility

Tailwind CSS supplies responsive layouts and spacing. Shared Radix Tabs primitives provide keyboard-accessible admin tabs. Form labels, button names, visible focus styles, status text, empty states, and mobile layouts are included. Reduced-motion preferences are respected in global CSS.
