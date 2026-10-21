# Sardar Travels

Website and booking-enquiry platform for Sardar Travels: tours, vehicle hire and hotel reservations across Mysuru, the Nilgiris (Ooty, Coonoor), Kodaikanal and Coorg.

- **Public site:** tour catalogue with search and filters, day-by-day itinerary timelines, destination guides, vehicle hire and hotel enquiry pages, an optional intercity bus module, FAQs and information pages.
- **Booking enquiries:** a multi-step wizard on every tour and service page. Each enquiry is validated on the server, saved with a unique reference (for example `ST-261016-7KQ2`), and shown back to the customer on a confirmation page. Customers can track their enquiry and accept a quote online.
- **Staff dashboard** (`/admin`): manage enquiries, statuses and quotes; edit tours, itineraries, prices, availability, images, destinations, services, homepage sections, FAQs, testimonials, pages, contact details, brand colours, logo and SEO.

An enquiry never becomes a booking automatically. Staff move it through these statuses: New → Reviewing → Quote sent → Awaiting confirmation (the customer accepts) → Confirmed → Completed, or Cancelled.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components, Server Actions), React 19, TypeScript |
| Styling | Tailwind CSS v4, Fraunces + Manrope via `next/font` |
| Motion | `motion` (Motion for React) with CSS keyframes; respects `prefers-reduced-motion` |
| Data | PostgreSQL 14+ through Drizzle ORM (`postgres.js` driver); SQL migrations in `db/migrations` |
| Auth | Self-hosted email and password (bcrypt), database-backed sessions in HttpOnly cookies, `admin` / `staff` roles |
| Images | Stored in Postgres, processed with `sharp` (resized, EXIF/GPS stripped), served by `/media/[id]` and optimised by `next/image` |
| Email | Optional SMTP via Nodemailer |

## Local development

```bash
cp .env.example .env            # then edit values
docker run -d --name sardar-pg -e POSTGRES_USER=sardar -e POSTGRES_PASSWORD=sardar \
  -e POSTGRES_DB=sardar -p 5432:5432 postgres:17-alpine
npm install
npm run db:setup                # runs migrations, then seeds tours, photos and settings, and creates the admin
npm run dev                     # http://localhost:3000, dashboard at /admin
```

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js development, production build, production server |
| `npm run db:migrate` | Applies SQL migrations in `db/migrations` |
| `npm run db:seed` | Idempotent seed: brochure tours, destinations, FAQs, pages, bus routes, licensed photos and default settings. It never overwrites existing records. |
| `npm run db:generate` | Generates a new migration after editing `src/db/schema.ts` |
| `npm run admin:create -- --email you@x.com --name "You" [--role staff]` | Creates an account or resets a password (prompts for the password) |
| `npm run typecheck` / `lint` | TypeScript and ESLint |

## Project layout

```
db/                     migrations, seed data (brochure catalogue), seed photos and credits, CLI scripts
src/db/                 Drizzle schema and client
src/lib/                data access (cached public reads), auth, validation, email, settings defaults
src/app/(site)/         public website
src/app/admin/          staff dashboard (login + panel)
src/app/actions/        server actions: public enquiries and admin mutations
src/components/         site, home, forms and admin components
src/proxy.ts            optimistic redirect to login for /admin
```

## How content updates work

Public pages are prerendered and cached (`'use cache'` with the `content` tag). Every admin save calls `updateTag('content')`, so changes appear on the website immediately without a redeploy.

## Content provenance

Tours, itineraries, terms and conditions and destinations come from the brochure photos in `brochure-reference/`. If a database was seeded before those details were added, run `npm run db:apply-brochure -- --yes` once to bring it up to date. Spelling has been corrected in public copy. Anything uncertain is recorded in each tour's internal **Verification notes** and flagged in the dashboard; see [CONTENT-VERIFICATION.md](CONTENT-VERIFICATION.md).

Nothing has been invented: no prices, phone numbers, addresses, fleet, reviews, ratings or statistics. Prices show "Request a quote" until staff set them. Contact details stay hidden until they are entered in **Site settings**.

Destination photographs are openly licensed images from Wikimedia Commons. Authors and licences are stored with each image and listed on `/credits`. They can be replaced with the business's own photos from the Media library at any time.

See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup.
