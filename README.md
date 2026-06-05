# Order Automation Tool

Local MVP order creation assistant for customer service.

## Run locally

```bash
npm run dev
```

Open:

- Assistant: http://localhost:3000
- Admin orders: http://localhost:3000/admin/orders

If port 3000 is already in use, the local server automatically tries the next available port from 3001 to 3010.

## Build check

```bash
npm run build
```

The build check validates inline browser scripts, DOM ids, and Node server scripts.

## Local data

Submitted orders are stored in `data/orders.json` during local development. The file is ignored by Git and can later be replaced by a PostgreSQL-backed store behind `lib/orderStore.js`.
