from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.products import router as products_router

app = FastAPI(title="Flamingo Bean API")

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


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
