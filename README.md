# Life Assistant AI

A personal AI assistant for daily planning, task management, and reminders — built with Next.js and Claude.

![Life Assistant AI](https://img.shields.io/badge/Powered%20by-Claude%20AI-c8a96e?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)

## Features

- **Daily Planning** — Ask for a structured plan for your day
- **Task Management** — Add, view, update, and delete tasks
- **Reminders** — Set one-time or recurring reminders
- **Life Advice** — Get productivity tips and habit guidance
- **Streaming responses** — Real-time AI replies via Server-Sent Events

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React, TypeScript |
| Styling | Custom CSS (dark theme) |
| AI | Anthropic Claude (claude-sonnet-4-6) |
| Database | Supabase (PostgreSQL) |
| Fonts | DM Serif Display, DM Sans |

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/life-assistant-ai.git
cd life-assistant-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example file and fill in your keys:

```bash
cp .env.local.example .env.local
```

| Variable | Where to get it |
|----------|----------------|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings |

### 4. Set up Supabase tables

Run the following SQL in your Supabase SQL editor:

```sql
-- Tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text,
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  status text check (status in ('pending', 'in_progress', 'done')) default 'pending',
  due_date date,
  created_at timestamptz default now()
);

-- Reminders
create table reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  remind_at timestamptz not null,
  recurring text check (recurring in ('daily', 'weekly')),
  done boolean default false,
  created_at timestamptz default now()
);
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/chat/route.ts   # Claude API + tool execution
│   ├── globals.css         # Dark theme styles
│   ├── layout.tsx          # Root layout with fonts
│   └── page.tsx            # Entry point
├── components/
│   └── ChatWindow.tsx      # Full UI (sidebar + chat)
├── lib/
│   ├── supabase.ts         # Database helpers
│   └── tools.ts            # Claude tool definitions
└── types/
    └── index.ts            # Shared TypeScript types
```

## License

MIT
