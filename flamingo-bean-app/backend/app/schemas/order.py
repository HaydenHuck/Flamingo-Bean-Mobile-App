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
    pickup_time: str | None = None
    shipping_name: str | None = None
    shipping_address_line1: str | None = None
    shipping_address_line2: str | None = None
    shipping_city: str | None = None
    shipping_state: str | None = None
    shipping_zip: str | None = None
    shipping_country: str | None = None
    items: list[OrderItemCreate]


class OrderItemResponse(BaseModel):
    product_id: int
    name: str
    price: float
    quantity: int
    size: str
    line_total: float


class OrderConfirmation(BaseModel):
    id: int
    order_id: str
    order_number: str
    status: str
    payment_status: str
    customer_name: str
    fulfillment_type: str
    pickup_time: str | None = None
    shipping_name: str | None = None
    shipping_address_line1: str | None = None
    shipping_address_line2: str | None = None
    shipping_city: str | None = None
    shipping_state: str | None = None
    shipping_zip: str | None = None
    shipping_country: str | None = None
    items: list[OrderItemResponse]
    subtotal: float
    tax: float
    shipping_fee: float
    total: float
    created_at: str
    updated_at: str


class AdminOrderSummary(BaseModel):
    order_id: str
    customer_name: str
    customer_email: str
    fulfillment_type: str
    pickup_time: str | None = None
    shipping_name: str | None = None
    shipping_address_line1: str | None = None
    shipping_address_line2: str | None = None
    shipping_city: str | None = None
    shipping_state: str | None = None
    shipping_zip: str | None = None
    shipping_country: str | None = None
    status: str
    payment_status: str
    subtotal: float
    tax: float
    shipping_fee: float
    total: float
    created_at: str


class AdminOrderItem(BaseModel):
    product_id: int
    name: str
    price: float
    quantity: int
    size: str
    line_total: float


class AdminOrderDetail(AdminOrderSummary):
    items: list[AdminOrderItem]


class OrderStatusUpdate(BaseModel):
    status: str
