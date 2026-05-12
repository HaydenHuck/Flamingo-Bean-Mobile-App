from fastapi import APIRouter, Request

router = APIRouter(tags=["webhooks"])


@router.post("/webhooks/square")
async def square_webhook_placeholder(request: Request) -> dict[str, str]:
    await request.body()

    return {
        "status": "received",
        "message": "TODO: verify Square webhook signatures and update local payment status.",
    }

