import os
from collections.abc import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import Session, declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required. Copy .env.example to .env and set your MySQL connection URL.")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from app.models import Order, OrderItem, Product  # noqa: F401

    Base.metadata.create_all(bind=engine)
    ensure_order_checkout_columns()


def ensure_order_checkout_columns() -> None:
    inspector = inspect(engine)

    if "orders" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("orders")}
    column_definitions = {
        "payment_status": "VARCHAR(40) NOT NULL DEFAULT 'paid'",
        "square_payment_link_id": "VARCHAR(120) NULL",
        "square_order_id": "VARCHAR(120) NULL",
        "square_checkout_url": "VARCHAR(500) NULL",
    }

    with engine.begin() as connection:
        for column_name, column_definition in column_definitions.items():
            if column_name not in existing_columns:
                connection.execute(text(f"ALTER TABLE orders ADD COLUMN {column_name} {column_definition}"))
