# Kwenta — Offline Money Tracker

Offline-first installable PWA for Filipino users. Next.js 14 App Router + TypeScript + Tailwind v3 + Dexie (IndexedDB). No backend, no login in v1.

## Setup
```bash
npm install
```

## Run
```bash
npm run dev
# open http://localhost:3000
npm test        # vitest: money conversion tests
npm run build   # production build (bundles Serwist SW)
npm start       # serve production on http://localhost:3000
```

## Test each feature
1. **DB + money**: Home shows "DB ready", format test `₱1,234.56`. `npm test` → 5/5.
2. **Add flow**: `/add` → amount → category → Save. Date defaults to today (Asia/Manila), note optional.
3. **Home**: month ‹ › nav, balance/income/spent, budget strip, recent with edit ✏️ + delete 🗑️ + Undo (5s).
4. **Wallets/Cats**: `/me` → add/rename/delete wallets (live balances), add/delete categories.
5. **Stats**: `/stats` → Recharts donut by category + daily groups.
6. **Budgets**: `/budgets` → monthly limit per category, gentle "under budget 🌱", coral only when over.
7. **Utang**: `/debts` (linked from Me) → owes-me / i-owe totals, add, mark Paid.
8. **CSV**: `/me` → Export downloads backup; Import merges by id (newer updatedAt wins).
9. **PWA + PIN**: manifest + Serwist SW (fully offline), icons in `public/icons`. PIN in `/me` (PBKDF2-SHA256, 5 tries → 30s cooldown).

## Data model (all centavos, sync-ready)
- Base: `id` UUID, `createdAt/updatedAt`, `deletedAt` soft-delete.
- `wallets(id,name,kind,icon,color,sortOrder)`, `categories(id,name,kind,icon,color)`,
  `transactions(id,type,amountCentavos,categoryId,walletId,note,date,timestamp,month,currency)`,
  `budgets(id,categoryId,month,limitCentavos)`, `debts(id,direction,person,amountCentavos,date,isPaid)`, `settings(key,value)`.

## Azure static hosting (optional, manual)
V1 needs no backend, so this is just static hosting when you want a shareable link:
1. `az login`, pick subscription, then create a Static Web App pointing at this repo (build: `npm run build`, output `.next` — or switch to `output: export` for pure static).
2. No `azure.yaml`/`azd` is used in this repo; deploy via portal/CLI and paste the preview URL here for the deploy gate.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
