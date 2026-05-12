# Flamingo Bean Mobile

Expo React Native app for the Flamingo Bean mobile ordering experience.

## Setup

Install dependencies:

```bash
npm install
```

Start the backend from `../backend`:

```bash
python -m uvicorn app.main:app --reload
```

Start the mobile app:

```bash
npm start
```

Run on a specific target:

```bash
npm run ios
npm run android
npm run web
```

## API URL

Backend services use:

```text
http://127.0.0.1:8000
```

That usually works for web previews and some local simulator setups. When running on a real phone through Expo Go, `127.0.0.1` points to the phone itself, not your computer. In that case, update `services/api.ts` to use your computer's local network IP address, for example:

```text
http://192.168.1.25:8000
```

The phone and computer must be on the same network.

## Square Checkout

The mobile checkout flow calls the backend `POST /checkout/create` endpoint. The backend creates a local pending order and returns a Square-hosted sandbox checkout URL.

The app opens that URL with the platform browser and shows a pending payment screen. Square payment confirmation is handled by the backend webhook.

## Admin Login

Admin Orders and Admin Products require a backend admin account. Create one from the backend folder with:

```bash
python scripts/create_admin.py
```

The admin token is stored through a small storage abstraction: web uses `localStorage`, and native Expo currently keeps the token in memory for the session.
