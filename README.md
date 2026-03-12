# Daily Coach Mini App

Telegram Mini App MVP для ежедневных отчетов по питанию, воде, активности и короткой AI-обратной связи. Проект рассчитан на быстрый запуск для одного пользователя, но структура уже поддерживает multi-user сценарий через Telegram identity и профиль в Supabase.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Postgres + RLS
- Telegram Bot API + Mini App init data
- OpenAI Responses API
- Zod + React Hook Form

## Project structure

```text
app/
  api/
    analyze-report/route.ts
    auth/telegram/route.ts
    bot/webhook/route.ts
    cron/reminders/route.ts
    profile/route.ts
    reports/route.ts
    weights/route.ts
  history/page.tsx
  profile/page.tsx
  report/page.tsx
  weight/page.tsx
components/
  forms/tag-picker.tsx
  layout/
  ui/
lib/
  ai/analyze.ts
  schemas.ts
  server-auth.ts
  supabase/
  telegram/
supabase/
  migrations/20260311163000_init_daily_coach.sql
```

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy envs:

```bash
cp .env.example .env.local
```

3. Fill required values in `.env.local`.

Required for real integration:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_BOT_USERNAME`
- `TELEGRAM_WEBAPP_URL`
- `APP_BASE_URL`

Optional:
- `NEXT_PUBLIC_MOCK_TELEGRAM=true`
- `TELEGRAM_INIT_DATA_VALIDATION_SECRET`

4. Apply SQL migration in Supabase SQL editor or via Supabase CLI:

```bash
supabase db push
```

5. Start local app:

```bash
npm run dev
```

## Telegram setup

1. Create a bot with BotFather.
2. Set the Mini App URL in BotFather menu button.
3. Configure webhook to:

```text
https://YOUR_DOMAIN/api/bot/webhook
```

Production note: this URL must be public HTTPS and point to the deployed Next.js app.

The `/start` handler:
- upserts a profile in Supabase
- sends a welcome message
- sends an inline button to open the Mini App

## Reminder job

Use any trusted scheduler or Supabase cron to call:

```text
POST https://YOUR_DOMAIN/api/cron/reminders
Authorization: Bearer YOUR_TELEGRAM_INIT_DATA_VALIDATION_SECRET
```

Production note: keep the bearer secret server-to-server only.

Behavior:
- checks all profiles
- compares local time against `reminder_time`
- skips users who already submitted a report for the local date
- skips users who already received a reminder for that date
- sends `Пора заполнить отчет за день`

For production, schedule it every 5-10 minutes.

## OpenAI analysis flow

When `/api/analyze-report` is called:

1. Validate Telegram identity from `x-telegram-init-data`
2. Upsert report in `daily_reports`
3. Pull latest weight on or before `report_date`
4. Pull previous 3 reports
5. Call OpenAI Responses API with JSON schema request
6. Validate response with Zod
7. Save result in `ai_feedback`
8. Return analysis to the Mini App

If `OPENAI_API_KEY` is missing or OpenAI fails, the app falls back to a deterministic mock coach response so local development stays usable.

## Security notes

- Telegram identity is validated server-side in `lib/telegram/server.ts`
- The client never directly chooses `profile_id`
- Supabase service role key is used only on the server
- RLS is enabled on all core tables
- Inputs are validated with Zod before persistence

## Deployment

Recommended:
- Vercel for Next.js
- Supabase for DB
- Telegram webhook pointed at deployed app

Checklist:
- add all env vars in hosting
- run SQL migration
- configure BotFather menu button to `TELEGRAM_WEBAPP_URL`
- configure webhook to `/api/bot/webhook`
- configure scheduler for `/api/cron/reminders`

## Nice-to-have extensions

- streak counter on dashboard
- weekly summary page
- weight trend chart
- editable reminder settings
- dark mode

## Notes

- UI copy is localized in Russian.
- Current MVP is mobile-first and optimized for Telegram in-app browser width.
- `NEXT_PUBLIC_MOCK_TELEGRAM=true` enables local fallback when Telegram WebApp context is unavailable.
