from app.schemas.order import OrderCreate
from pydantic import BaseModel


class CheckoutCreate(OrderCreate):
    pass


class CheckoutCreateResponse(BaseModel):
    local_order_id: int
    local_order_number: str
    checkout_url: str
    status: str

