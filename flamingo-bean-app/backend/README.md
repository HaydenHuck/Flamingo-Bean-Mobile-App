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
```

Use Sandbox credentials only. Square secrets belong in the backend `.env` file and must not be placed in the mobile app.

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

Admin orders:

```bash
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

The Square webhook route is a placeholder. It does not verify signatures or mark orders as paid yet.

Production Square checkout, webhook payment confirmation, and authentication are intentionally not included yet.
