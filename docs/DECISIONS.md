# AirDelivery: confirmed decisions

Agreed with the product owner on 2026-11-24. Change this file when a decision changes.

## Product

- Voice-first concierge delivery portal. Customer opens the website on WiFi, talks to **Aira**, Aira finds the items, reads the total, waits for a yes, and tracks the order.
- No app, no SIM or phone number, no product catalogue to browse.
- Aira is order-only. Off-topic requests get one fixed reply: "I can only help with orders. What do you want to order today?"

## Design

| Decision | Choice |
| --- | --- |
| Visual direction | **Chalk & Marigold**: chalk paper `#F3F5F2`, ink navy `#0F1B2D`, marigold `#E8A317` for Aira's voice, signal teal `#0E7C6B` for status |
| Type | Bricolage Grotesque (display), Hanken Grotesk (body) |
| Talk screen on phones | **Full-screen call style**: pulsing voice orb, live captions, order card slides up, Mute and End controls |
| Desktop landing | Headline left, Talk panel right (current build) |
| Language | **Auto-detect Hinglish**: Aira replies in the mix the customer uses (Hindi, English, Hinglish) |
| Website copy | English plus full Hindi and Hinglish versions |

Avoid: cream and terracotta palettes, dark-with-neon accents, identical card grids, gradients, all-caps labels, emoji as interface icons.

## Technology

| Layer | Choice |
| --- | --- |
| Frontend | Next.js 16, TypeScript, Tailwind CSS 4 |
| Voice | **Sarvam Voice Agents (Samvaad) over WebRTC**. Web SDK runs real-time voice sessions in the browser with microphone capture; backend proxy holds the API key (never exposed to client) |
| Database | Supabase Postgres. Built against local migrations first; a hosted project is connected later |
| Payments | Pay on delivery (cash or UPI), plus a UPI payment link after delivery |

## Build order

1. Live Aira voice (OpenAI Realtime, call-style screen, tools: `searchProduct`, `createOrder`, `getOrderStatus`)
2. Order tracker (Confirmed, Shopping, Out for delivery, Delivered), readable by Aira
3. Agent command centre (live orders, status board, human takeover)
4. Supabase backend (orders, customers, audit log, access rules)
5. Vendor and product search (partner shops, price and stock, sourced orders)
6. UPI payments
7. Rider app (accept, pickup, out for delivery, proof of delivery)
8. Hindi and Hinglish website copy

## Rules that do not change

- No invented prices or availability. Prices stay "pending" until a real check.
- No purchase without explicit customer confirmation.
- Every order status change is written to the audit log.
- Voice recordings are not kept unless the customer consents.
- Hard cases go to a human operator.
- Nothing goes to production until the product is complete and approved.

## Workflow

- `main` holds approved work. Each piece of work goes on a branch and a draft pull request.
- Every change passes typecheck, tests and a production build before it is pushed.
