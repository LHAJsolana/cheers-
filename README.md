# Cheers

Cheers is a funny, social, responsible nightlife MVP. The public landing page is an early-access waitlist for people who want to log drinks, track spending, estimate calories, build sober streaks, react with friends, and get weekly recaps.

## Safety

BAC and sobriety statuses are estimates only. Cheers always displays: "Do not drive after drinking. This is only an estimate and is not legal or medical advice."

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL for deployed and local testing
- Simple email/password auth with signed HTTP-only cookie sessions
- Zod validation

## Local Install And Run

```bash
npm install
copy .env.example .env
```

Set `DATABASE_URL`, `DIRECT_URL`, and `SESSION_SECRET` in `.env` for the app backend. To enable waitlist submissions, also add your Formspree endpoint:

```env
NEXT_PUBLIC_FORMSPREE_ENDPOINT="https://formspree.io/f/YOUR_FORM_ID"
```

Then run:

```bash
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

Open `http://localhost:3000`.

On macOS/Linux, use `cp .env.example .env` instead of `copy`.

## Demo Accounts

After `npm run seed`:

- `taha@cheers.local` / `password123`
- `maya@cheers.local` / `password123`
- `sam@cheers.local` / `password123`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run seed
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

`npm run build` runs `prisma generate` before `next build`, which keeps Vercel and fresh installs happy.

## Environment Variables

Create `.env` locally:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
SESSION_SECRET="replace-with-a-long-random-string"
NEXT_PUBLIC_FORMSPREE_ENDPOINT="https://formspree.io/f/YOUR_FORM_ID"
```

`SESSION_SECRET` signs the MVP session cookie. Use a long random value outside local development.

`NEXT_PUBLIC_FORMSPREE_ENDPOINT` powers the landing page waitlist form. If it is missing, the page shows a clear error instead of pretending the signup worked.

## Vercel Deploy Instructions

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Import the project in Vercel.
3. Use these settings:

- Install command: `npm install`
- Build command: `npx prisma migrate deploy && npm run build`

4. Add these Vercel environment variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
SESSION_SECRET="your-long-random-secret"
NEXT_PUBLIC_FORMSPREE_ENDPOINT="https://formspree.io/f/YOUR_FORM_ID"
```

5. Deploy.

Run `npm run seed` locally against the same hosted database when you want demo users and starter feed data. For a public beta, use a separate production database from any throwaway local test database.

## Mobile App

An Expo mobile client lives in `mobile/`.

Quick start:

```bash
cd mobile
npm install
copy .env.example .env
npm run start
```

Set `mobile/.env` to your backend API URL:

```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000/api/mobile
```

Use your computer LAN IP for Expo Go on a real phone. `localhost` points to the phone, not your laptop.

For the deployed backend, use:

```env
EXPO_PUBLIC_API_URL=https://YOUR_VERCEL_APP.vercel.app/api/mobile
```

See `mobile/README.md` for Expo Go, EAS Build, App Store, and Google Play notes.

## Features

- Drink logging with calories, alcohol grams, spending, location, notes, visibility, and optional check-in.
- Night sessions that start on the first drink and close after 3 inactive hours.
- Feed posts for drinks, check-ins, completed sessions, and achievement unlocks.
- Funny reactions: Cheers, Legendary, Chaos, RIP Tomorrow, Respect.
- Achievements like First Round, Financial Mistake, Bar Hopper, and Responsible Human.
- Weekly recap with drinks, spending, calories, favorite drink, favorite location, and copyable recap text.
- Stats for weekly patterns, alcohol-free days, most logged drink type, and most visited location.
- Mobile-first bottom navigation.

## Project Structure

```text
prisma/
  migrations/
  schema.prisma
  seed.ts
scripts/
src/
  app/
    actions.ts
    dashboard/
    log-drink/
    activity/
    friends/
    stats/
    profile/
    onboarding/
  components/
  lib/
```

## MVP Notes

- Auth is intentionally simple for local MVP development.
- Friend requests are created and listed; approval workflow can be added later.
- Comments are modeled in Prisma and shown as a placeholder in the feed.
- Drink and BAC calculations are rough estimates for personal awareness, not medical or legal advice.
- No maps, geolocation, payments, ads, messaging, AI, or serious medical features.
