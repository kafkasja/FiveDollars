# FiveDollars Project Codebase Index

## Overview
This is a web application called "Family App" for tracking small debts and credits between family members using a $5 step system. The app uses **Next.js** for the web interface, **Tailwind CSS** for styling, and **Supabase** for backend storage.

---

## Project Structure (Root Directory - Next.js)

```
.                           # Root directory (Next.js web app)
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
├── postcss.config.js     # PostCSS configuration
├── next.config.js        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
├── .env.local           # Environment variables
└── vercel.json           # Vercel deployment config
```

### Legacy React Native Expo Files (app/, src/, lib/, types/)

The original React Native Expo version files still exist in the root directory but are no longer actively maintained. They may conflict with the new Next.js structure. The Next.js app uses `app/`, `lib/`, and `types/` directories at the root.

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
- Includes profile switching functionality

---

## Key Dependencies

- **next**: 14.2.x - React framework
- **react**: 18.2.0 - UI library
- **react-dom**: 18.2.0 - DOM bindings for React
- **@supabase/supabase-js**: 2.48.0 - Supabase client
- **tailwindcss**: 3.4.0 - Styling
- **typescript**: 5.3.0 - TypeScript support

## Environment Variables

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