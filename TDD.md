# DriveHub Frontend Technical Design

## Product name

**DriveHub** is an assumed working name for the internship application. It is not the client's official brand name. The client is Company A, an authorized Brand X dealer in Lucknow, Uttar Pradesh. The Company A name is retained for dealership context; Brand X remains the supplied manufacturer placeholder.

## Frontend scope

This phase builds the Next.js App Router screens and reusable presentation components. It does not connect forms, lead assignment, inventory edits, city pricing, test-drive slots, authentication, or Gemini to backend services. Demo interactions are local-only and labeled as such.

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
- **`ListingExplorer`** — Local browser-only filtering and empty state. Filters do not query or change inventory.
- **`CarGallery`** — Local selection between illustrative photos; no real per-vehicle gallery was supplied.
- **`CityPricePanel`** — Shows the supplied new-car ex-showroom price and missing on-road cost inputs. It intentionally does not calculate an unsupported total.
- **`TestDriveForm` / `EnquiryForm`** — Responsive form layout. Submit actions are disabled because no server action or API exists yet. Showrooms and time choices are clearly marked assumptions.
- **`LeadTable`** — Local search/status filtering over fictional demo leads; assignment and response timer are not live.
- **`AiLeadPanel`** — Illustrative summary/reply; textarea edits and approval badge remain local to the browser and do not call Gemini, persist, or send messages.
- **`AdminTabs`** — Read-only views of supplied inventory and model/variant relationships plus explicit missing-data states for prices, showroom details, and staff.
- **`app/loading.js`, `app/error.js`, `app/not-found.js`** — Shared loading, retryable error, and missing-vehicle experiences.

## Data policy

The temporary frontend inventory is derived from `prisma/seed-data.mjs`, the single source of the three exact records from the brief:

- `NEW-H-02`: New / Model H / ZX Automatic / Petrol / 2026 / 0 km / ₹12,45,000 ex-showroom / Available.
- `UC-1182`: Used / Model C / VX / Diesel / 2022 / 41,200 km / ₹8,45,000 listing price / Available.
- `UC-1190`: Used / Model S / LX / Petrol / 2021 / 58,600 km / ₹5,12,000 listing price / Booked.

UC-1190 is not offered in the test-drive vehicle selector. Prices are formatted in INR. NEW-H-02 is never labeled as on-road. No registration numbers are present; none have been fabricated. If real registration values are added later, the UI/data contract must expose only masked values. Owner counts and inspection reports were not provided and therefore show as unavailable.

## Explicit assumptions and unavailable inputs

- The only known city is Lucknow. No tax/registration/insurance schedules were supplied, so the new-car on-road estimate is intentionally unavailable.
- Three showroom placeholders mirror the client-provided count only; their names and addresses are unconfirmed.
- Demo time slots are layout assumptions, not availability. The form cannot create a booking.
- Lead records are fictional and use `.invalid` email addresses. They do not represent real buyers or staff.
- AI summary and reply text are illustrative static examples, not Gemini output.
- Admin tabs are navigable but read-only. Staff, showroom addresses, city rates, and edit/save functions require confirmed data and backend authorization.

## Styling and accessibility

Tailwind CSS supplies responsive layouts and spacing. Shared Radix Tabs primitives provide keyboard-accessible admin tabs. Form labels, button names, visible focus styles, status text, empty states, and mobile layouts are included. Reduced-motion preferences are respected in global CSS.
