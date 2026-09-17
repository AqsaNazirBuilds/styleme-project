# StyleMe — AI-Powered Personal Stylist & Digital Wardrobe

StyleMe is a full-stack web app that helps you organize your closet, build outfits, and get AI-powered styling suggestions based on what you actually own.

## Features

- **Digital Wardrobe** — upload, categorize, search, filter, and sort your clothing items
- **Outfit Builder** — pick items and get a live, rule-based compatibility score (color harmony, style match, occasion match, season match)
- **Style Me** — a guided flow ("Where are you going? → How do you want to look?") that assembles a complete look from your wardrobe and explains the pick with AI
- **AI Stylist Chat** — ask general styling questions and get contextual replies
- **Packing Assistant** — weather-aware packing lists built from your existing wardrobe, so you pack fewer, more reusable items
- **Outfit Planner** — a calendar to schedule outfits to specific dates
- **Style Analytics** — charts and smart insights (color balance, category distribution, style frequency) derived from your real data
- **Admin Dashboard** — user management and platform overview (role-gated)

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui (Base UI) |
| Icons / Motion | Lucide, Motion |
| Database | PostgreSQL (Neon) + Prisma ORM |
| Auth | Auth.js (Credentials provider, JWT sessions) |
| Image storage | Cloudinary |
| AI | Google Gemini |
| Weather | Open-Meteo |
| Charts | Recharts |
| Testing | Playwright (E2E) + Vitest (unit) |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (e.g. a free [Neon](https://neon.tech) project)
- A [Cloudinary](https://cloudinary.com) account (free tier)
- A [Google Gemini](https://ai.google.dev) API key (free tier)

### Setup

1. Clone the repo and install dependencies:
   ```bash
   git clone <repo-url>
   cd styleme-project
   npm install
   ```

2. Copy the environment template and fill in your own values:
   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   |---|---|
   | `DATABASE_URL` | PostgreSQL connection string |
   | `AUTH_SECRET` | Random secret for Auth.js (`npx auth secret`) |
   | `CLOUDINARY_CLOUD_NAME` | From your Cloudinary dashboard |
   | `CLOUDINARY_API_KEY` | From your Cloudinary dashboard |
   | `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard |
   | `GEMINI_API_KEY` | From Google AI Studio |

3. Run the database migrations and generate the Prisma client:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`.

## Testing

```bash
# Unit tests (Vitest) — scoring/compatibility engines
npm test

# End-to-end tests (Playwright) — requires the dev server running separately
npm run dev            # in one terminal
npx playwright test    # in another
```

E2E coverage includes: authentication, wardrobe CRUD, outfit building, Style Me, and the outfit planner.

## Project Structure

```
src/
  app/
    (auth)/          # login, register
    (onboarding)/    # style quiz
    (dashboard)/     # wardrobe, outfits, style-me, ai-stylist, planner, packing, analytics, profile
    admin/           # admin dashboard (role-gated)
    api/             # route handlers
  components/        # shared UI + feature components
  lib/                # Prisma client, auth config, AI clients, scoring engines, validations
tests/
  e2e/               # Playwright specs
  unit/              # Vitest specs
```

## Notes & Known Limitations

- Rate limiting on AI routes is in-memory; this is fine for a single-instance deployment but wouldn't hold up across multiple serverless instances at scale (a Redis-backed limiter like Upstash would be the production fix).
- A couple of `npm audit` findings live in Prisma CLI's unused MySQL-support dependencies (not reachable at runtime, since this project uses PostgreSQL only) — left as-is to avoid downgrading Prisma to a release-candidate version.

## License

This is a personal portfolio project.
