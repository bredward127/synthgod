# SynthGod: M-VAVE FM-1 store

A one-product store for the M-VAVE FM-1 handheld FM synthesizer. Next.js 14 (App Router), Tailwind and PayPal checkout.

- **Home `/`:** animated hero with a colorway switcher, a feature grid, a playable FM synth in the browser (Web Audio), a color studio, a spec sheet, reviews, guarantees, FAQ and a sticky buy bar.
- **Checkout `/checkout`:** choose color and quantity, then pay with PayPal Smart Buttons (PayPal balance or card). Orders are created and captured **on the server**, and the price always comes from `data/store.ts`, so a buyer can't change it.
- **Pages:** `/checkout/success`, `/shipping`, `/returns`, `/terms`, `/privacy`, `/contact`, a sitemap and robots.txt.
- **Analytics:** consent-gated Google and Vercel analytics. Nothing is sent until the visitor clicks Allow.

## Before you go live

1. **`data/store.ts`:** set the price, shipping cost and times, return window and colors (`available: false` marks a color sold out). Every policy page reads from here.
2. **Policies:** read `/shipping`, `/returns` and `/terms` and change anything you won't honor exactly as written.
3. **`data/reviews.ts`:** add real customer reviews only (with permission). Update or remove `listingRating`.
4. **Photos:** `public/images/fm1-*.webp` are cutouts of the product photos you supplied. Make sure you have the right to use them. Purple has no photo yet: add `public/images/fm1-purple.webp` and set `image` on the purple color.

## PayPal setup

1. Go to https://developer.paypal.com → **Apps & Credentials** → **Sandbox** → *Create App*. Copy the Client ID and Secret.
2. Set `NEXT_PUBLIC_PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_ID` to the Client ID, `PAYPAL_CLIENT_SECRET` to the Secret, and `PAYPAL_ENV=sandbox`.
3. Deploy, then buy with a sandbox *personal* account (Sandbox → Accounts) to test the full flow.
4. Switch to **Live**: create a Live app, swap in its Client ID and Secret, and set `PAYPAL_ENV=live`. You need a PayPal **Business** account.

Shipping addresses come from PayPal. You see every order in your PayPal account, and optionally at `ORDER_WEBHOOK_URL` (see `.env.example`).

## Deploy on Vercel

1. Push this repo to GitHub, then on vercel.com: **Add New → Project → import the repo**. The defaults work.
2. Under **Settings → Environment Variables**, add the values from `.env.example`.
3. Deploy. Add your domain under **Settings → Domains** and set `NEXT_PUBLIC_SITE_URL` to it.
4. Optional: **Analytics → Enable** to turn on Vercel Web Analytics.

## Develop

```bash
npm install
cp .env.example .env.local   # fill in sandbox keys
npm run dev                  # http://localhost:3000
npm test                     # pricing and analytics unit tests
npm run lint && npx tsc --noEmit && npm run build
```

`PAYPAL_API_BASE` (not in `.env.example`) points the server at a different PayPal host. It's only for testing against a mock.
