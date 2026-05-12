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

Square checkout, authentication, and admin tooling are intentionally not included yet.
