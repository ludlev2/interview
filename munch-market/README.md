# Munch Market

Munch Market is an online shop for shelf-stable and short-dated groceries, sold at a
discount and shipped from a single warehouse in Hungary. Prices are in HUF.

Customers browse the catalogue, fill a cart and pay through a hosted payment page.
Warehouse staff work from a picking list of paid orders. Admins import supplier
deliveries (stock batches with best-before dates) and maintain prices.

Shipping options:

| Carrier                   | Delivery          | Fee       |
| ------------------------- | ----------------- | --------- |
| GLS home delivery         | 1–2 working days  | 1,990 HUF |
| Magyar Posta pickup point | 2–5 working days  | 990 HUF   |

## Running it locally

Requirements: Node 24, pnpm 10, Docker.

```bash
pnpm install
docker compose up -d      # Postgres 17 on localhost:55431
pnpm db:migrate
pnpm db:seed              # resets all data; best-before dates are relative to today
pnpm dev                  # API on http://localhost:3101, web on http://localhost:5181
```

Open http://localhost:5181.

Other commands:

```bash
pnpm test        # API unit tests (Jest)
pnpm test:e2e    # API end-to-end tests (needs the database running)
pnpm lint
pnpm typecheck
pnpm build
```

Configuration is read from environment variables, with defaults that match
`docker-compose.yml`. To override them, copy `apps/api/.env.example` to
`apps/api/.env` (and `apps/web/.env.example` to `apps/web/.env` for the web app).
If your shell already exports `DATABASE_URL` for another project, unset it first.

### Seeded accounts

All passwords are `munch123`.

| Email                | Role            |
| -------------------- | --------------- |
| anna@example.com     | customer        |
| bence@example.com    | customer        |
| raktar@example.com   | warehouse staff |
| admin@example.com    | admin           |

The seed creates 6 categories, 120 products with one to three stock batches each, and
a few historical orders for Anna and Bence.

## Architecture

```
apps/
  api/   NestJS 11 + TypeORM + PostgreSQL, REST/JSON
  web/   React 19 + Vite + TanStack Query + React Router + Tailwind CSS 4
```

### API modules (`apps/api/src`)

| Module        | Responsibility                                                            |
| ------------- | ------------------------------------------------------------------------- |
| `auth`        | Email/password login (bcrypt), JWT bearer tokens, `@Roles()` guard         |
| `products`    | Categories, products and stock batches; public catalogue endpoints        |
| `orders`      | Checkout, order history, carrier fees and delivery estimates               |
| `payments`    | Client for the payment provider and the `/webhooks/psp` endpoint           |
| `fulfilment`  | Picking tasks for the warehouse                                            |
| `admin`       | Stock import (CSV) and product maintenance                                 |
| `fake-psp`    | Simulated third-party payment provider (see below)                         |

Database schema changes are TypeORM migrations in `apps/api/src/migrations`
(`synchronize` is off). The seed script is `apps/api/src/seed/seed.ts`.

### Main endpoints

| Method | Path                               | Who            |
| ------ | ---------------------------------- | -------------- |
| POST   | `/auth/login`, GET `/auth/me`      | anyone / user  |
| GET    | `/categories`, `/products`, `/products/:id` | public |
| GET    | `/orders/delivery-options`         | user           |
| POST   | `/orders`                          | user           |
| GET    | `/orders`, `/orders/:id`           | user           |
| GET    | `/fulfilment/tasks`                | staff, admin   |
| POST   | `/fulfilment/tasks/:id/picked`, `/shipped` | staff, admin |
| GET    | `/admin/products`                  | admin          |
| PATCH  | `/admin/products/:id`              | admin          |
| POST   | `/admin/stock-imports`             | admin          |
| POST   | `/webhooks/psp`                    | payment provider |
| GET    | `/health`                          | public         |

### Checkout and payment flow

1. The web app posts the cart to `POST /orders`. The API reserves stock, stores the
   order as `pending_payment` and creates a payment intent with the provider.
2. The browser is redirected to the provider's hosted checkout
   (`/fake-checkout/:intentId` in the web app) and the customer pays or declines.
3. The provider redirects back to the order page and, asynchronously, sends a signed
   `payment.succeeded` webhook to `POST /webhooks/psp`.
4. The webhook marks the order `paid` and opens a fulfilment task, which appears on
   the warehouse picking list. Staff mark it picked, then shipped.

Order statuses: `pending_payment` → `paid` → `picking` → `shipped` (or `cancelled`
after a refund).

### Fake payment provider

`apps/api/src/fake-psp` stands in for a real provider such as Stripe and should be
treated as third-party code. It keeps its state in memory (restarting the API forgets
open intents) and signs webhooks with HMAC-SHA256 over the request body, sent in the
`x-psp-signature` header.

| Method | Path                                     |                                          |
| ------ | ---------------------------------------- | ---------------------------------------- |
| POST   | `/fake-psp/intents`                      | create an intent, returns `checkoutUrl`  |
| GET    | `/fake-psp/intents/:id`                  | intent details for the hosted page        |
| POST   | `/fake-psp/intents/:id/confirm`          | pay → `payment.succeeded` webhook         |
| POST   | `/fake-psp/intents/:id/decline`          | decline → `payment.failed` webhook        |
| POST   | `/fake-psp/refunds`                      | `{ paymentIntentId, amount? }` → `refund.succeeded` webhook |
| POST   | `/fake-psp/intents/:id/resend-webhook`   | dev only: re-deliver the last webhook (real providers retry) |

Refunds are issued from the provider side (there is no refund button in the app yet).

### Stock import format

Admins paste CSV with a header row:

```csv
sku,batchCode,bestBefore,quantity
SNK-001,L2611A,2027-03-31,48
```

Each row records a received batch and adds its quantity to the product's stock.
