# IT-Fix — IT Support Ticketing Platform

A modern, mobile-first IT support ticketing extranet built with Next.js 14, TailwindCSS, and Supabase.

## ✨ Features

- 🔐 Supabase Authentication (email/password)
- 🎫 Create, view, and track IT support tickets
- 👨‍🔧 Browse technician profiles with availability
- 📱 Mobile-first responsive design with bottom navbar
- 🖼️ Screenshot uploads via Supabase Storage
- 🏷️ Status badges (Pending / In Progress / Resolved)
- ⚡ Loading skeletons + toast notifications

## 🚀 Getting Started

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. This creates all tables, RLS policies, storage bucket, and seeds 5 technicians

### 2. Configure Environment Variables

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find these in your Supabase dashboard → **Settings → API**.

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
it-fix/
├── app/
│   ├── login/          # Login page
│   ├── signup/         # Sign up page
│   ├── dashboard/      # Ticket list + stats
│   ├── create-ticket/  # New ticket form
│   ├── technicians/    # Technician directory
│   ├── profile/        # User profile
│   └── tickets/[id]/   # Ticket detail
├── components/
│   ├── ui/             # Button, Input, Card, StatusBadge, Skeleton, EmptyState
│   ├── layout/         # Sidebar, MobileNav, Topbar
│   ├── TicketCard.tsx
│   └── TechnicianCard.tsx
├── lib/
│   ├── supabase.ts     # Supabase client + types
│   ├── hooks.ts        # useUser hook
│   └── utils.ts        # Helpers + config maps
└── supabase/
    └── schema.sql      # Full DB schema + RLS

project url https://rlguiklvjdxyzywnpjwx.supabase.co
anon key eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsZ3Vpa2x2amR4eXp5d25wand4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMjk4NTIsImV4cCI6MjA5MTcwNTg1Mn0.LYjAVfvevb9G1QN6eencYodSGczwItRjTlZmCgUAIjY
```

## 🚢 Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel environment variables.
