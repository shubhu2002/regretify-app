# Regretify

Track every terrible financial decision — beautifully.

Regretify is a full-stack expense tracker and personal ledger that helps you log regrets, track who owes you (and who you owe), visualize your spending despair, and export your financial trauma as a polished PDF.

## Features

- **Live Charts & Trends** — Gradient line/area charts that update in real-time as you log expenses
- **App Lock / Passcode** — Protect your data with a 4 or 6-digit numerical passcode
- **Export to PDF** — Generate color-coded PDF reports with financial summaries
- **Built-in Calculator** — Type expressions like `120+50` directly in the amount field
- **Personal Ledger** — Track money given and received per person with running balances
- **Give & Take Tracking** — Log every transaction with amounts, dates, and descriptions
- **Dark & Light Mode** — Polished theme toggle with system-aware defaults
- **Exact Timestamps** — Every transaction saved down to the second
- **Instant Sync** — TanStack Query keeps everything blazing fast across the app

## Tech Stack

- **Framework** — Next.js (App Router)
- **Auth** — NextAuth.js (Google OAuth + Credentials) with 7-day session expiration
- **Database** — Supabase (PostgreSQL)
- **Styling** — Tailwind CSS with violet/fuchsia theme
- **Charts** — Chart.js + react-chartjs-2
- **Animations** — Framer Motion
- **State** — TanStack React Query
- **Security** — bcryptjs for password & passcode hashing

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Setup

1. Clone the repo:

   ```bash
   git clone https://github.com/shubhu2002/regretify-app.git
   cd regretify-app
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create your `.env` file from the example:

   ```bash
   cp .env.example .env
   ```

4. Fill in your environment variables in `.env`:

   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. Run the development server:

   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
  app/              # Next.js App Router pages & API routes
  components/       # UI components (landing page, regrets, profile, etc.)
  constants/        # App-wide constants (categories, features, etc.)
  hooks/            # Custom React hooks
  lib/              # Auth config, utilities
  providers/        # Context providers (theme, session, app lock)
  supabase/         # Supabase client setup
  types/            # TypeScript types
  utils/            # Helper functions
```

## Deployment

Deploy on [Vercel](https://vercel.com) — add all environment variables from `.env.example` to your Vercel project settings.

## Author

Designed & developed by **Shubhanshu Saxena**

## License

This project is open source and available under the [MIT License](LICENSE).
