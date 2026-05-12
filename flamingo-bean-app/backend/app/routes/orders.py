from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(tags=["orders"])

TAX_RATE = 0.0825
ORDERS: dict[str, "OrderConfirmation"] = {}


class OrderItem(BaseModel):
    product_id: int
    name: str
    price: float = Field(ge=0)
    quantity: int = Field(gt=0)
    size: str


class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    fulfillment_type: str
    items: list[OrderItem]


class OrderConfirmation(BaseModel):
    order_id: str
    status: str
    customer_name: str
    customer_email: str
    fulfillment_type: str
    items: list[OrderItem]
    subtotal: float
    tax: float
    total: float
    created_at: str


@router.post("/orders", response_model=OrderConfirmation, status_code=201)
def create_order(order: OrderCreate) -> OrderConfirmation:
    if not order.items:
        raise HTTPException(status_code=400, detail="Order must include at least one item.")

    subtotal = round(sum(item.price * item.quantity for item in order.items), 2)
    tax = round(subtotal * TAX_RATE, 2)
    total = round(subtotal + tax, 2)
    order_id = f"FB-{uuid4().hex[:8].upper()}"

    confirmation = OrderConfirmation(
        order_id=order_id,
        status="received",
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        fulfillment_type=order.fulfillment_type,
        items=order.items,
        subtotal=subtotal,
        tax=tax,
        total=total,
        created_at=datetime.now(timezone.utc).isoformat(),
    )

    ORDERS[order_id] = confirmation
    return confirmation


@router.get("/orders/{order_id}", response_model=OrderConfirmation)
def get_order(order_id: str) -> OrderConfirmation:
    order = ORDERS.get(order_id)

    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    return order
