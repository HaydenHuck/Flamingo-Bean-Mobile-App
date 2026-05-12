from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import SessionLocal, init_db
from app.routes.admin import router as admin_router
from app.routes.admin_auth import router as admin_auth_router
from app.routes.checkout import router as checkout_router
from app.routes.orders import router as orders_router
from app.routes.products import router as products_router
from app.routes.webhooks import router as webhooks_router
from app.services.seed import seed_products


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()

    db = SessionLocal()
    try:
        seed_products(db)
    finally:
        db.close()

    yield


app = FastAPI(title="Flamingo Bean API", lifespan=lifespan)

allowed_origins = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:19006",
    "http://127.0.0.1:19006",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products_router)
app.include_router(orders_router)
app.include_router(admin_auth_router)
app.include_router(admin_router)
app.include_router(checkout_router)
app.include_router(webhooks_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
