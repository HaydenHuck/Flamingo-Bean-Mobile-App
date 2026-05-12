from decimal import Decimal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.order import Order, OrderItem
from app.schemas.checkout import CheckoutCreate, CheckoutCreateResponse
from app.services.square_service import SquareApiError, SquareConfigurationError, create_payment_link
from app.routes.orders import money

router = APIRouter(tags=["checkout"])


@router.post("/checkout/create", response_model=CheckoutCreateResponse, status_code=201)
def create_checkout(checkout: CheckoutCreate, db: Session = Depends(get_db)) -> CheckoutCreateResponse:
    if not checkout.items:
        raise HTTPException(status_code=400, detail="Checkout must include at least one item.")

    db_order = create_pending_order(checkout, db)

    try:
        square_payment_link = create_payment_link(
            customer_email=checkout.customer_email,
            items=checkout.items,
            order_number=str(db_order.order_number),
        )
    except SquareConfigurationError as exc:
        mark_payment_failed(db_order, db)
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except SquareApiError as exc:
        mark_payment_failed(db_order, db)
        raise HTTPException(status_code=502, detail=f"Square checkout error: {exc}") from exc

    db_order.square_payment_link_id = square_payment_link.payment_link_id
    db_order.square_order_id = square_payment_link.square_order_id
    db_order.square_checkout_url = square_payment_link.checkout_url

    db.commit()
    db.refresh(db_order)

    return CheckoutCreateResponse(
        checkout_url=str(db_order.square_checkout_url),
        local_order_id=int(db_order.id),
        local_order_number=str(db_order.order_number),
        status=str(db_order.status),
    )


def create_pending_order(checkout: CheckoutCreate, db: Session) -> Order:
    subtotal = money(sum(Decimal(str(item.price)) * item.quantity for item in checkout.items))
    tax = money(subtotal * Decimal("0.0825"))
    total = money(subtotal + tax)
    order_number = f"FB-{uuid4().hex[:8].upper()}"

    db_order = Order(
        order_number=order_number,
        status="pending_payment",
        payment_status="pending_payment",
        customer_name=checkout.customer_name,
        customer_email=checkout.customer_email,
        fulfillment_type=checkout.fulfillment_type,
        subtotal=subtotal,
        tax=tax,
        total=total,
    )

    db.add(db_order)
    db.flush()

    for item in checkout.items:
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
    db.refresh(db_order)

    return db_order


def mark_payment_failed(order: Order, db: Session) -> None:
    order.status = "payment_failed"
    order.payment_status = "payment_failed"
    db.commit()

