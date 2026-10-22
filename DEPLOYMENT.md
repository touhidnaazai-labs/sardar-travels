# Deployment (Vercel + Neon)

## Environment variables
| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Neon pooled connection string (added automatically by the Vercel–Neon integration) |
| `DATABASE_SSL` | `true` |
| `DATABASE_PREPARE` | `false` (Neon's pooler does not support prepared statements) |
| `APP_SECRET` | Long random string used to hash visitor IPs for rate limiting |
| `NEXT_PUBLIC_SITE_URL` | Public address, e.g. `https://sardar-travels.vercel.app` (sitemap, canonical links, share images) |
| `NEXT_PUBLIC_GA_ID` | Optional Google Analytics 4 ID. Empty = no analytics and no cookie banner. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE`, `MAIL_FROM`, `STAFF_NOTIFY_EMAILS` | Optional. When set, new enquiries are also emailed to the staff addresses (and a confirmation to customers who gave an email). WhatsApp works without them. |

## First deploy
1. Create the Vercel project and add a Neon database (Vercel → Storage / Marketplace).
2. Add the variables above.
3. From a machine with the database URL (use the *unpooled* URL, with `DATABASE_SSL=true`, `DATABASE_PREPARE=false`): `npm run db:migrate && npm run db:seed`.
4. `vercel deploy --prod`.

## Updating
- **Code or content change:** edit, commit, `vercel deploy --prod`.
- **Schema change:** `npm run db:generate`, commit the new migration, run `npm run db:migrate` against Neon **before** deploying code that needs it.

## Enquiries
Each submission is saved in the `enquiries` table (reference, details, timestamp) and opens a prefilled WhatsApp message to the business number set in `src/lib/settings.ts` (`contact.whatsapp`). The WhatsApp message is sent by the customer, so an enquiry saved in the database but not sent on WhatsApp will not reach staff unless email alerts are configured. To read the saved enquiries, query the table (for example in the Neon console).

## Security
Security headers are set in `next.config.ts`. Forms are validated on the server, rate limited (8 per 10 minutes per visitor) and protected by a honeypot and a minimum fill time. No secrets are exposed to the browser.
