# AirDelivery

AirDelivery is a voice-first concierge delivery portal. The customer opens the
website on WiFi, taps **Talk to Aira**, and says what they need. Aira finds it,
reads back the total, waits for a yes, and tracks the order. There is no app,
no product catalogue, and no phone network involved.

## Status

Phase 1 (foundation) is in progress. Built so far:

- Next.js 16 + TypeScript + Tailwind CSS 4 app shell
- Design tokens and the Talk-to-Aira landing page
- Order-only intent router (the guardrail), with tests
- Browser speech input where supported, typed input everywhere
- Supabase schema for customers, addresses, orders, items and an order audit log

Not built yet: live Aira voice (OpenAI Realtime over WebRTC), real product
search, vendor integrations, the agent command centre, and payments.

## Design direction

- **Subject:** concierge ordering for people who do not want to install apps.
- **Core idea:** the hero is the conversation itself, not stock imagery.
- **Palette:** chalk paper, ink navy, marigold voice colour, signal teal for status.
- **Type:** Bricolage Grotesque for display, Hanken Grotesk for body.
- **Layout:** asymmetric hero with the working console on the right. The four
  steps are numbered because they really are a sequence.
- **Avoided on purpose:** cream-and-terracotta palettes, dark-with-neon accents,
  identical rounded card grids, all-caps eyebrow labels, gradient washes.

## Rules the product must keep

- Aira is order-only. Anything else gets the guardrail reply.
- No invented prices or availability. Prices show as "pending" until a real check.
- No purchase without customer confirmation.
- Every order status change is written to `order_events`.
- Voice recordings are not retained by default.

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm test
npm run build
```

Environment variables go in `.env.local` (never committed). See `.gitignore`.

## Repository layout

```
app/                  Next.js routes and global styles
components/           UI components (client components where interactive)
lib/aira/             Intent router, speech helpers, guardrail copy
supabase/migrations/  Postgres schema, applied in order
```

## Roadmap

Follows the phases in the project brief: foundation, Aira voice engine, order
intelligence, operations command centre, procurement and delivery,
intelligence and automation, production readiness. Nothing is deployed to
production until the product is complete and approved.
