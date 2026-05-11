from fastapi import FastAPI

from app.routes.products import router as products_router

app = FastAPI(title="Flamingo Bean API")

app.include_router(products_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
