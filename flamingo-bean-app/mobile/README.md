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

## Customer Accounts

Customer accounts are optional and use Firebase Authentication. Guest checkout still works without logging in.

This app includes the Flamingo Bean Firebase web app config in `services/firebase.ts`. To use a different Firebase project, override it with Expo public environment values:

1. Create a Firebase project.
2. Enable Email/Password sign-in in Firebase Authentication.
3. Add a Firebase web app in the Firebase console.
4. Add the public web config values to your local Expo environment:

```text
EXPO_PUBLIC_FIREBASE_API_KEY=your_public_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Only public Firebase web config values belong in the mobile app. Do not add Firebase service account JSON, Square secrets, database credentials, JWT secrets, or webhook secrets to the mobile app.

When a customer is signed in, checkout sends the Firebase ID token to the FastAPI backend. The backend verifies it and links the MySQL order to the Firebase UID. Orders and payments remain in MySQL and Square.

## Staff Dashboard

Staff order and product management now lives in the separate React web app in `../admin`. The mobile app is the customer ordering experience.
