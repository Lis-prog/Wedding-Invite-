# Wedding Invite

Interactive wedding invitation inspired by your reference style.  
Built with Next.js and ready to deploy on Vercel.

## Features

- Styled invite flow with intro, 4 questions, and final verdict screen
- Custom invite links per guest category:
  - `single`
  - `couple`
  - `family` (with kids count)
- Easy sharing by link in WhatsApp, SMS, Viber, Facebook Messenger
- RSVP submit to Supabase (`/api/rsvp`)
- Admin page at `/admin` to load responses with password

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env.local` in project root (or copy from `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_or_publishable_key
SUPABASE_SERVICE_ROLE_KEY=optional_but_recommended_for_admin_reads
ADMIN_PASSWORD=choose-a-strong-password
```

`SUPABASE_SERVICE_ROLE_KEY` is strongly recommended for secure admin reads.

## Supabase Setup

Run SQL from `supabase-schema.sql` in Supabase SQL Editor.

This creates a `responses` table and allows public `insert` for RSVP submissions.
Admin reads happen through server route (`/api/admin/responses`) protected by `ADMIN_PASSWORD`.

## Personal Link Format

Use query params to personalize each invite:

```text
/?name=Arta&type=single
/?name=Luan&type=couple&partner=Era
/?name=Blerim%20Family&type=family&children=2
/?invite=INV-0001&name=Arta&type=single
```

## Auto-Generate Guest Links

1. Edit `guests.example.json` with your real guests.
2. Run:

```bash
npm run generate:links
```

This generates `guest-links.txt` with ready-to-send links.

Optional: set production domain while generating links:

```bash
INVITE_BASE_URL=https://your-domain.com npm run generate:links
```

PowerShell variant:

```powershell
$env:INVITE_BASE_URL="https://your-domain.com"; npm run generate:links
```

## Admin

Open `/admin`, enter `ADMIN_PASSWORD`, then click `Load responses`.

## Deploy to Vercel

1. Push project to GitHub (or import folder directly to Vercel).
2. In Vercel, import the project.
3. Add environment variables from `.env.local` in Vercel Project Settings.
4. Deploy with default Next.js settings.
5. Use your Vercel URL (or custom domain) as `INVITE_BASE_URL`.
