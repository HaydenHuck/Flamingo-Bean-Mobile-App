# Flamingo Bean Mobile

Expo React Native app for the Flamingo Bean mobile ordering experience.

## Setup

Install dependencies:

```bash
npm install
```

Start the backend from `../backend`:

```bash
uvicorn app.main:app --reload
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

The products service currently calls:

```text
http://127.0.0.1:8000/products
```

That usually works for web previews and some local simulator setups. When running on a real phone through Expo Go, `127.0.0.1` points to the phone itself, not your computer. In that case, update `services/products.ts` to use your computer's local network IP address, for example:

```text
http://192.168.1.25:8000/products
```

The phone and computer must be on the same network.

