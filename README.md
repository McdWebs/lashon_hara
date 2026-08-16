# לשון הרע לא מדבר אליי — אתר חדש

Phase 1 foundation: React frontend + Express BFF, catalog from existing WooCommerce, forms into Mongo when configured.

## Local

```bash
# backend
cd backend
cp .env.example .env   # set MONGODB_URI and CONTACT_INBOX when you have them
npm install
npm run dev

# frontend
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173  
API: http://localhost:3001/health  

Without `MONGODB_URI`, the catalog still works; form POSTs return 503 until Atlas is set.

Checkout, cart, donate payment, and wholesale remain on https://lashonhara.co.il until payment is unblocked.

## Stack

- Frontend: React, Vite, TypeScript, MUI, React Router, TanStack Query
- Backend: Node, Express, TypeScript, MongoDB/Mongoose, Zod
- Commerce: WooCommerce Store API (Kinsta) — do not rebuild
