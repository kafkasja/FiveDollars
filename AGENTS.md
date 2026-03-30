# FiveDollars Project Codebase Index

## Overview
This is a web application called "Family App" for tracking small debts and credits between family members using a $5 step system. The app uses **Next.js** for the web interface, **Tailwind CSS** for styling, and **Supabase** for backend storage.

---

## Project Structure

### web/ - Next.js Web Application (Recommended for Deployment)

```
web/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Profile picker (home page)
│   ├── globals.css       # Global Tailwind styles
│   └── dashboard/        # Dashboard page
│       └── page.tsx      # Main app interface
├── lib/
│   ├── supabase.ts       # Supabase client
│   └── database.ts       # Database operations
├── types/
│   └── index.ts          # TypeScript interfaces
├── package.json          # Dependencies
├── tailwind.config.js    # Tailwind configuration
├── next.config.js        # Next.js configuration
├── vercel.json           # Vercel deployment config
└── .env.local           # Environment variables
```

### Original React Native Expo Code (app/, src/, lib/, types/)

The original React Native Expo version is still in the root directory but is no longer actively maintained. See the `web/` folder for the current web-based version.

---

## Web Application Details

### app/page.tsx (Profile Picker)
- Displays profile cubes for user selection
- Loads profiles from Supabase "profiles" table
- Auto-redirects if profile already selected in localStorage
- Responsive grid layout with animated press effects

### app/dashboard/page.tsx (Dashboard)
- Shows current balance between two profiles
- Displays recent transactions
- Provides payment buttons to add $5 credits/debits
- Real-time updates via Supabase

---

## Key Dependencies (Web)

- **next**: 14.2.0 - React framework
- **react**: 18.2.0 - UI library
- **@supabase/supabase-js**: Supabase client
- **tailwindcss**: 3.4.0 - Styling

## Environment Variables (Web)

```
NEXT_PUBLIC_SUPABASE_URL=https://Yzdtnlfkyklfgcvyjigcs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## Database Schema

- **profiles** table: id, name, emoji, color, created_at
- **transactions** table: id, from_profile_id, to_profile_id, amount, note, created_at

---

## Running the Web Application

### Development
```bash
cd web
npm install
npm run dev
```

Access at http://localhost:3000

### Deploy to Vercel (Free)

1. Push code to GitHub
2. Go to https://vercel.com
3. Import the repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

---

## Why Next.js + Vercel?

- **No app store required**: Works on any phone via browser
- **PWA capable**: Can be added to home screen
- **Free hosting**: Vercel free tier is generous
- **Same backend**: Uses existing Supabase project
- **Simpler**: No Expo Go, no builds, no native code
