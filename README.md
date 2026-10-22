# Sardar Travels

Website for Sardar Travels (Mysuru): tours, national and international packages, and enquiry-based train, flight, visa, vehicle-hire and hotel services.

**Enquiries go to WhatsApp.** When a visitor submits any form, the details are saved (for a reference number and as a backup) and a ready-to-send WhatsApp message is opened to the business number. There is no admin dashboard or login.

## Stack
Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4, PostgreSQL with Drizzle ORM, Motion, Zod. Deployed on Vercel with a Neon PostgreSQL database.

## Run locally
```bash
cp .env.example .env            # set DATABASE_URL and APP_SECRET
docker run -d --name sardar-pg -e POSTGRES_USER=sardar -e POSTGRES_PASSWORD=sardar -e POSTGRES_DB=sardar -p 5432:5432 postgres:17-alpine
npm install
npm run db:setup                # migrations + tours, photos, settings
npm run dev                     # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:seed` | Add tours, destinations, photos and default settings. Never overwrites existing rows. |
| `npm run db:apply-brochure -- --yes` | One-off: overwrite tour content with the versions in `db/seed-data.ts` |
| `npm run typecheck`, `npm run lint`, `npm run build` | Checks |

## Where things are
```
src/app/(site)/        public pages (home, tours, destinations, services, enquiry confirmation)
src/app/actions/       the enquiry server action (validation, rate limiting, WhatsApp message)
src/components/        site, home and form components
src/lib/               data access, settings, validation, email, security helpers
src/db/                schema; db/ has migrations, seed data, seed photos and CLI scripts
brand/                 logo files for print and social media
```

## Content
Tours, destinations and the contact details live in the database and are loaded from `db/seed-data.ts` and `src/lib/settings.ts`. With no dashboard, changes are made by editing those files (or the database) and deploying. Uncertain details are listed in [CONTENT-VERIFICATION.md](CONTENT-VERIFICATION.md). Deployment steps are in [DEPLOYMENT.md](DEPLOYMENT.md).
