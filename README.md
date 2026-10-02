# Evira React

A responsive implementation of the Evira shopping screen board. The monochrome styling, rounded cards, product choices, bottom navigation and shopping/account workflows are adapted to phones, tablets and desktop browsers.

## Run locally

Use Node.js 22.12 or later (Node 24 LTS recommended) and npm. Unzip the project, open a terminal in its folder, then:

```sh
npm install
npm run dev
```

Open http://localhost:4173. No cloud account or environment secrets are required. Prisma Client is generated automatically during installation. The development server starts a local Cloudflare Worker runtime, applies database migrations and seeds 24 products. Each new session gets an isolated demo account with a sample address, saved demo card, sample orders and wallet credit. Sign up to turn that guest into an email/password account without losing its shopping data.

`npm ci` installs exactly the supplied lockfile. Dependencies are pinned to stable versions verified against npm on October 1, 2026; prereleases are excluded even when a package's latest tag points to one. All Prisma packages share version 7.10.0. Neither `--force` nor `--legacy-peer-deps` is required. See DEPENDENCIES.json for the resolved versions. This deliberately provides reproducible installs: updating to future versions should include updating the lockfile and running the checks below.

## Checks and build

```sh
npm run typecheck
npm test
npm run build
```

The test suite exercises the actual API and Prisma/D1 runtime using disposable databases, including guest isolation, variants, ownership checks, quotes, checkout, duplicate protection, refunds, wallet PINs, reviews, settings, conversations, registration, reset and concurrent inventory checks. The production build creates `dist/client` and `dist/server/index.js`, plus the external Prisma WebAssembly compiler. The backend must be hosted as a Worker with `DB` (D1), `BUCKET` (R2), and `ASSETS` bindings; the frontend alone is insufficient for shopping operations.

## Implemented workflows

- Onboarding, email signup/login/logout, remember-me, password visibility and reset with an explicitly displayed demo verification code.
- The Evira logo opens `/story`: a full-screen local fashion film, GSAP scroll storytelling, an interactive Three.js letter E, and cursor sparkles. Reduced-motion preferences keep the narrative readable without animated scrolling, autoplay or particles; the film has a manual playback control. The film and 3D rendering pause when they leave the viewport.
- First visitors see the welcome tour before the shop. Completing or skipping it opens signup, with visible skip controls on both signup and login. Returning visitors retain tour completion on their device.
- Home offers rotate automatically with manual controls; New Arrivals, Most Popular and Discounts each have a horizontal product row capped at ten. The full product catalog uses a persistent sidebar, category icons, price/rating/sold filters, sorting and URL-backed pagination. Search, favorites, multiple-image galleries, hover zoom, cart toasts, sizes/colors, quantities, related products and delivered-purchase reviews are included.
- Persistent cart variants, quantity edits, remove confirmation, saved addresses, shipping choices, coupon validation, payment selection, order notes and checkout confirmation.
- Active/completed/cancelled orders, details, simulated delivery timeline, cancellation before shipping, wallet refunds, restocking, buy-again, barcode receipts and browser print/save-as-PDF.
- Wallet balance, simulated top-up, transaction search/filtering, transaction detail and PIN verification.
- Profile editing/photo upload, addresses/default address, demo card metadata, notification preferences, language selection, dark mode, password/PIN changes, passkey setup, invite selections, privacy/data export, help/FAQ, saved support and courier conversations.
- Responsive navigation, keyboard-accessible dialogs, loading/error/empty states and retry controls. Device preferences and checkout drafts use Zustand's persistence middleware with guarded native localStorage. Account records use the server database; passwords and session tokens are never put in localStorage.

## Demo boundaries

Payments, wallet money, shipping, courier calls, support replies, invitations and social-provider sign-in are simulations. No real charge, shipment, provider account, email or SMS is accessed. Cards store demo labels and last-four-digit metadata only. Reset verification is intentionally visible in this demonstration; replace it with a real delivery provider before using real customer accounts.

Email/password authentication, salted password/PIN hashes, HTTP-only session cookies, ownership enforcement, authoritative server totals, stock checks, idempotent order/top-up handling and database persistence are implemented. Critical multi-write operations use atomic D1 batches and database constraints alongside Prisma, because interactive Prisma transactions are unavailable with the D1 adapter. Monetary values are integer cents.

Passkeys use the browser's WebAuthn API and server-side verification. They require a registered account, a compatible browser/authenticator and HTTPS (localhost is allowed). Device biometric prompts belong to the operating system; the application does not receive fingerprint data. Sound/vibration are best-effort browser feedback for in-app notices, subject to browser support and user activation. There are no background push notifications. English, Khmer and Chinese translate common navigation and action controls; catalog copy and help articles remain English.

The attached board is a very low-resolution composite, so individual icons, copy and imagery are reconstructed rather than a pixel-perfect reproduction. Sample catalog imagery is local, with source attribution in ASSET-SOURCES.json. Review the recorded product-image reuse terms before commercial distribution. The offer portrait and introduction film are from Pexels. The social preview is generated specifically for Evira. Maps use Leaflet and optional OpenStreetMap tiles; location is requested only when the user chooses it.

## Project structure

- `src/pages`: shopping, checkout, orders, wallet, account and help views.
- `src/components/ui`: vendored shadcn/Radix UI primitives, styled with Tailwind 4 and the Evira theme.
- `src/lib`: typed API client, Zustand persistence, translations and optional WebMCP shopping tools.
- `server`: Hono API, demo catalog, Prisma/D1 access and authentication helpers.
- `prisma/schema.prisma`: authoritative relational schema.
- `drizzle`: generated SQL migrations and deployment migration metadata (Prisma owns the schema; Drizzle ORM is not used).
- `scripts`: local runtime, migrations and Worker compilation.
- `tests`: API integration checks.
- `public/images`: local product and fashion assets.

Local data lives in `.sites-data`; it survives development-server restarts. To reset your local demonstration, stop the server and remove that directory. Never delete a production database to reset local data. `npm run db:migrate` applies pending local migrations; `npm run db:generate` regenerates Prisma Client.

Maps use the standard OpenStreetMap tile service with visible attribution and normal browser caching. Set `VITE_MAP_TILE_URL` before building to use a different compatible tile provider; preserve its attribution and usage terms. The demo includes no tile prefetching or offline map download. Provider policy: https://operations.osmfoundation.org/policies/tiles/.
