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
├── components/             # React components
│   ├── ProfilePicker.tsx  # Profile selection screen
│   └── Dashboard.tsx      # Balance and transactions UI
├── lib/
│   ├── supabase.ts       # Supabase client
│   └── database.ts       # Database & localStorage operations
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
- Displays recent transactions (real-time updates via Supabase)
- Provides payment buttons to add $5 credits/debits
- **Local-first Persistence**: Transactions are saved to `localStorage` if the internet is down.
- **Sync Logic**: Automatically pushes local transactions to Supabase once a connection is detected (via `syncLocalStorageToSupabase`).
- **Data Integrity**: Includes UUID validation to prevent syncing transactions with legacy/fallback profile IDs ("1" and "2").
- Includes profile switching functionality

---

## Key Dependencies

- **next**: ^14.2.35 - React framework
- **react**: 18.2.0 - UI library
- **react-dom**: 18.2.0 - DOM bindings for React
- **@supabase/supabase-js**: 2.48.0 - Supabase client
- **next-pwa**: 5.6.0 - Progressive Web App support
- **tailwindcss**: 3.4.0 - Styling
- **typescript**: 5.3.0 - TypeScript support

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://Yzdtnlfkyklfgcvyjigcs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## Database Schema

- **profiles** table: id (uuid), name, emoji, color, created_at
- **transactions** table: id (uuid), from_profile_id (uuid), to_profile_id (uuid), amount (numeric), created_at


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

---

## Data Flows

### Profile Selection & Persistence
- Entry: `app/page.tsx` renders `ProfilePicker.tsx`
- Action: User taps a profile card
- Flow: `handleSelectProfile` -> `localStorage.setItem` -> `router.push('/dashboard')`
- Auth: Local session only (no password required)

### Transaction Creation (Hybrid Local/Cloud)
- Entry: `Dashboard.tsx` via Give/Receive buttons
- Flow: `handlePay` -> `createTransaction(lib/database.ts)`
- Logic: `supabase.insert` with `localStorage` fallback on failure

### Local-to-Cloud Syncing
- Entry: `Dashboard.tsx` on connection detect or `Sync Now` tap
- Flow: `syncLocalStorageToSupabase` -> `isValidUuid` check -> batch `supabase.insert`
- Logic: Filters out fallback IDs ("1", "2") to prevent Supabase `22P02` errors
- Final: `localStorage.removeItem` on success

### Real-time Balance Calculation
- Entry: `Dashboard.tsx` component mount
- Flow: `supabase.channel` subscription -> `postgres_changes` on `transactions`
- Logic: `loadData` -> `calculateBalance` vs `currentProfile`
- Display: Reactive update of balance label (Owe/Owed) via state change