# Deployment

The app is a standard Next.js 16 Node.js application backed by PostgreSQL. It runs on Vercel, Render, Railway, Fly.io or any VPS with Node 20.9+.

## 1. Database

Any PostgreSQL 14+ works. Options include Supabase, Neon, AWS RDS or self-hosted.

| Provider | `DATABASE_URL` | Extra settings |
| --- | --- | --- |
| Supabase (direct, port 5432) | connection string from *Project settings → Database* | `DATABASE_SSL=true` |
| Supabase pooler (port 6543) / PgBouncer | pooler connection string | `DATABASE_SSL=true`, `DATABASE_PREPARE=false` |
| Neon | pooled connection string | `DATABASE_SSL=true`, `DATABASE_PREPARE=false` |
| Self-hosted | `postgres://user:pass@host:5432/db` | — |

The app uses its own authentication and authorisation, so Supabase Auth and Row-Level Security are not required. Only the server ever connects to the database, and the connection string is never exposed to browsers. If you use Supabase, keep the database password secret, and don't expose these tables through the Supabase Data API: either disable the API for the `public` schema or enable RLS with no policies.

## 2. Environment variables

Set these on the host. See `.env.example` for the full list.

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | see above |
| `DATABASE_SSL`, `DATABASE_PREPARE` | provider-specific | see above |
| `NEXT_PUBLIC_SITE_URL` | yes | e.g. `https://www.sardartravels.in` — used for canonical URLs, sitemap, Open Graph and email links |
| `APP_SECRET` | yes | 32+ random characters (`openssl rand -hex 32`); used to hash visitor IPs for rate limiting |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | first seed only | creates the first administrator; remove `ADMIN_PASSWORD` afterwards |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE`, `MAIL_FROM` | optional | enables automatic emails (see below) |
| `STAFF_NOTIFY_EMAILS` | optional | comma-separated addresses that receive new-enquiry alerts |

## 3. First deploy

```bash
npm ci
npm run db:migrate      # create tables
npm run db:seed         # load brochure catalogue, photos, settings and the first admin
npm run build           # needs DATABASE_URL: public pages are prerendered from the database
npm start
```

On Vercel, run `npm run db:migrate && npm run db:seed` once from your machine (or a CI job) against the production database, then deploy. The default build command works.

Migrations are plain SQL in `db/migrations`. To apply future schema changes, run `npm run db:migrate` before (or as part of) each deploy.

## 4. After going live

1. Sign in at `/admin/login` and change the password under **My account**.
2. **Site settings:** enter the verified phone, WhatsApp, email, address and hours, and upload the logo.
3. Work through every tour marked **Needs verification** (see `CONTENT-VERIFICATION.md`), then clear its verification notes.
4. Set prices only where the business has confirmed them. Otherwise tours show "Request a quote".
5. Publish the **About** page once it contains the company's real story (it is seeded as a draft).
6. Add team members under **Team**. Staff accounts can manage enquiries only.
7. Turn on the **Intercity bus module** (Services) only if the business confirms it arranges those bookings.
8. Submit `https://<domain>/sitemap.xml` in Google Search Console.

## Integrations that need credentials

| Feature | Without credentials (works today) | To enable |
| --- | --- | --- |
| Customer acknowledgement and quote emails | Enquiries and quotes are saved. Customers see their reference immediately and can view and accept quotes at `/enquiry/track`. Staff get one-click WhatsApp and email buttons with the quote pre-filled. | Set the `SMTP_*` and `MAIL_FROM` variables (any SMTP provider: Google Workspace, Zoho, Amazon SES, Postmark, Resend SMTP…). |
| New-enquiry alerts to staff | The dashboard overview and enquiry list show new enquiries. | Set `STAFF_NOTIFY_EMAILS` (plus SMTP). |
| Online payments | Not offered. Payment terms are agreed with the quote. | Add a gateway (Razorpay, Stripe…) on the "Awaiting confirmation" step; the status model already separates acceptance from confirmation. |
| Live bus booking | Route enquiry form only, with no schedules, fares or seat counts. | Requires an authorised operator or aggregator API agreement. |
| Hotel availability | Reservation enquiry form only. | Requires a hotel inventory / channel-manager API. |

## Operations

- **Backups:** the database holds everything, including images. Enable your provider's daily backups or point-in-time recovery.
- **Scaling:** image responses are served with immutable caching (`/media/<id>?v=<version>`), and `next/image` caches the optimised variants. Behind a CDN, database load from images is minimal.
- **Multiple instances:** cached public pages are invalidated per instance by `updateTag`. On Vercel this is handled by the platform. For self-hosted setups with more than one instance, configure a shared cache handler (see the Next.js `cacheHandlers` docs) or run a single instance.
- **Security:** sessions are random 256-bit tokens, stored hashed. Login and public forms are rate-limited in Postgres. Every admin action re-checks the session and role on the server. Uploaded images are re-encoded and stripped of metadata. Security headers are set in `next.config.ts`.
