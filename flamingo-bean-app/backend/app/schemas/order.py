from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    product_id: int
    name: str
    price: float = Field(ge=0)
    quantity: int = Field(gt=0)
    size: str


class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    fulfillment_type: str
    items: list[OrderItemCreate]


class OrderItemResponse(BaseModel):
    product_id: int
    name: str
    price: float
    quantity: int
    size: str


class OrderConfirmation(BaseModel):
    order_id: str
    status: str
    customer_name: str
    customer_email: str
    fulfillment_type: str
    items: list[OrderItemResponse]
    subtotal: float
    tax: float
    total: float
    created_at: str

