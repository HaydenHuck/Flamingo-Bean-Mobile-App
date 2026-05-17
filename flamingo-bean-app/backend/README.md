# Flamingo Bean Backend

FastAPI backend for the Flamingo Bean mobile ordering system.

## Development

Create the MySQL database:

```sql
CREATE DATABASE flamingo_bean CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a local environment file:

```bash
cp .env.example .env
```

Update `DATABASE_URL` in `.env` with your MySQL username and password:

```text
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/flamingo_bean
```

For Square sandbox checkout, also set:

```text
SQUARE_ACCESS_TOKEN=your_square_sandbox_access_token_here
SQUARE_LOCATION_ID=your_square_sandbox_location_id_here
SQUARE_ENVIRONMENT=sandbox
MOBILE_APP_RETURN_URL=flamingobean://checkout/complete
SQUARE_WEBHOOK_SIGNATURE_KEY=your_square_webhook_signature_key_here
SQUARE_WEBHOOK_NOTIFICATION_URL=https://your-public-tunnel.example.com/webhooks/square
```

Use Sandbox credentials only. Square secrets belong in the backend `.env` file and must not be placed in the mobile app.

For admin login, set:

```text
JWT_SECRET_KEY=replace_me_with_a_secure_secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_me_for_local_dev_only
```

Create or update a local admin user:

```bash
python scripts/create_admin.py
```

For optional customer accounts, configure Firebase Admin:

1. Create a Firebase project.
2. In Firebase Authentication, enable Email/Password sign-in.
3. Generate a Firebase service account JSON file from Project settings.
4. Save it locally, for example `backend/firebase-service-account.json`.
5. Set these values in `backend/.env`:

```text
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CREDENTIALS_PATH=./firebase-service-account.json
```

Do not commit the service account JSON file. It is ignored by Git and must never be placed in the mobile app.

Run the API locally:

```bash
python -m uvicorn app.main:app --reload
```

On startup, the backend creates the current SQLAlchemy tables and seeds the initial Flamingo Bean products if the `products` table is empty.

Health check:

```bash
GET /health
```

Products:

```bash
GET /products
```

Orders:

```bash
POST /orders
GET /orders/{order_id}
```

Checkout:

```bash
POST /checkout/create
```

If the mobile app sends `Authorization: Bearer <firebase_id_token>` to checkout, the backend verifies the Firebase ID token and links the order to that Firebase UID. If no token is provided, checkout continues as a guest order.

Customer account orders:

```bash
GET /customer/orders
GET /customer/orders/{order_id}
POST /customer/link-guest-orders
```

Customer account routes require Firebase Authentication. Public order tracking still uses:

```bash
GET /orders/{order_id}
```

Admin orders:

```bash
POST /admin/auth/login
GET /admin/auth/me
GET /admin/orders
GET /admin/orders/{order_id}
PUT /admin/orders/{order_id}/status
```

Admin products:

```bash
GET /admin/products
POST /admin/products
PUT /admin/products/{product_id}
PATCH /admin/products/{product_id}/active
```

Webhooks:

```bash
POST /webhooks/square
```

Square webhooks validate the Square signature before updating local payment status.

Production Square credentials, password reset, and social sign-in are intentionally not included yet.
