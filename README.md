# SpinList

Multi-user web to-do app where tasks render as slices of a spinning wheel. Slice arc size = `urgency × importance`. Spin → fair-random landing → that's your next task. Confetti on win.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 4
- Supabase (auth + Postgres with row-level security)
- Framer Motion for the spin animation, canvas-confetti for the celebration

## Local development

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

You'll need a `.env.local` with two values from your Supabase project (Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-anon-or-publishable-key
```

The database schema is in `../Backend/schema.sql` — run it once in the Supabase SQL editor.

## Deploy (Vercel)

1. Push this repo to GitHub
2. Import on [vercel.com](https://vercel.com) → it auto-detects Next.js
3. Add the same two env vars in Vercel project settings
4. In your Supabase project → Authentication → URL Configuration, add the deployed URL to **Site URL** and **Redirect URLs**

## Architecture notes

See `../CLAUDE.md` at the repo root for full architecture (auth flow, Supabase client roles, wheel landing math, layout viewport coupling).
