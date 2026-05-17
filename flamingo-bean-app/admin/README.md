# Flamingo Bean Admin Dashboard

React + TypeScript staff dashboard for managing Flamingo Bean orders and menu products.

## Setup

Install dependencies:

```bash
npm install
```

Run the FastAPI backend from `../backend` first, then start the admin app:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

## API URL

The dashboard reads the backend URL from:

```text
VITE_API_BASE_URL
```

If unset, it defaults to:

```text
http://127.0.0.1:8000
```

For a different backend, create `admin/.env.local`:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Do not put Square credentials, JWT secrets, database credentials, or backend secrets in this app.

## Login

Create a local admin user from the backend folder:

```bash
python scripts/create_admin.py
```

The script uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `backend/.env`.

Then sign in with that admin account. The JWT is stored in browser `localStorage` for local development.

## Staff Workflows

- Dashboard: quick links and simple order/product summary cards.
- Orders: view protected admin orders and open order details.
- Order detail: review customer info, items, totals, payment status, and update fulfillment status.
- Products: view active and inactive products, add products, edit products, and enable or disable items.
