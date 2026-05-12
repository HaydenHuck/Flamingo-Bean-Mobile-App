from decimal import Decimal, ROUND_HALF_UP
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.order import Order, OrderItem
from app.schemas.order import OrderConfirmation, OrderCreate, OrderItemResponse

router = APIRouter(tags=["orders"])

TAX_RATE = Decimal("0.0825")
MONEY_QUANTIZER = Decimal("0.01")


@router.post("/orders", response_model=OrderConfirmation, status_code=201)
def create_order(order: OrderCreate, db: Session = Depends(get_db)) -> OrderConfirmation:
    if not order.items:
        raise HTTPException(status_code=400, detail="Order must include at least one item.")

    subtotal = money(sum(Decimal(str(item.price)) * item.quantity for item in order.items))
    tax = money(subtotal * TAX_RATE)
    total = money(subtotal + tax)
    order_number = f"FB-{uuid4().hex[:8].upper()}"

    db_order = Order(
        order_number=order_number,
        status="received",
        payment_status="paid",
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        fulfillment_type=order.fulfillment_type,
        subtotal=subtotal,
        tax=tax,
        total=total,
    )

    db.add(db_order)
    db.flush()

    for item in order.items:
        unit_price = money(Decimal(str(item.price)))
        line_total = money(unit_price * item.quantity)
        db.add(
            OrderItem(
                order_id=db_order.id,
                product_id=item.product_id,
                product_name_snapshot=item.name,
                quantity=item.quantity,
                unit_price=unit_price,
                line_total=line_total,
                size=item.size,
            )
        )

    db.commit()

    saved_order = get_order_by_number(db, order_number)
    return to_order_confirmation(saved_order)


@router.get("/orders/{order_id}", response_model=OrderConfirmation)
def get_order(order_id: str, db: Session = Depends(get_db)) -> OrderConfirmation:
    order = get_order_by_public_identifier(db, order_id)

    return to_order_confirmation(order)


def get_order_by_public_identifier(db: Session, order_id: str) -> Order:
    if order_id.isdigit():
        order = db.query(Order).filter(Order.id == int(order_id)).first()

        if order:
            return order

    return get_order_by_number(db, order_id)


def get_order_by_number(db: Session, order_number: str) -> Order:
    order = db.query(Order).filter(Order.order_number == order_number).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    return order


def to_order_confirmation(order: Order) -> OrderConfirmation:
    return OrderConfirmation(
        id=order.id,
        order_id=order.order_number,
        order_number=order.order_number,
        status=order.status,
        payment_status=order.payment_status,
        customer_name=order.customer_name,
        fulfillment_type=order.fulfillment_type,
        items=[
            OrderItemResponse(
                product_id=item.product_id,
                name=item.product_name_snapshot,
                price=float(item.unit_price),
                quantity=item.quantity,
                size=item.size,
                line_total=float(item.line_total),
            )
            for item in order.items
        ],
        subtotal=float(order.subtotal),
        tax=float(order.tax),
        total=float(order.total),
        created_at=order.created_at.isoformat(),
        updated_at=order.updated_at.isoformat(),
    )


def money(value: Decimal) -> Decimal:
    return value.quantize(MONEY_QUANTIZER, rounding=ROUND_HALF_UP)
