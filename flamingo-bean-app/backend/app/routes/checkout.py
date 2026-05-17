from decimal import Decimal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.firebase_auth import FirebaseUser, get_optional_current_customer
from app.database import get_db
from app.models.order import Order, OrderItem
from app.schemas.checkout import CheckoutCreate, CheckoutCreateResponse
from app.services.square_service import SquareApiError, SquareConfigurationError, create_payment_link
from app.routes.orders import (
    PICKUP_FULFILLMENT,
    SHIPPING_FULFILLMENT,
    TAX_RATE,
    clean_optional_text,
    get_shipping_fee,
    money,
    validate_fulfillment_details,
)

router = APIRouter(tags=["checkout"])


@router.post("/checkout/create", response_model=CheckoutCreateResponse, status_code=201)
def create_checkout(
    checkout: CheckoutCreate,
    db: Session = Depends(get_db),
    current_customer: FirebaseUser | None = Depends(get_optional_current_customer),
) -> CheckoutCreateResponse:
    if not checkout.items:
        raise HTTPException(status_code=400, detail="Checkout must include at least one item.")

    validate_fulfillment_details(checkout)
    db_order = create_pending_order(checkout, db, current_customer)

    try:
        square_payment_link = create_payment_link(
            customer_email=checkout.customer_email,
            items=checkout.items,
            order_number=str(db_order.order_number),
            shipping_fee=Decimal(str(db_order.shipping_fee)),
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


def create_pending_order(
    checkout: CheckoutCreate,
    db: Session,
    current_customer: FirebaseUser | None = None,
) -> Order:
    subtotal = money(sum(Decimal(str(item.price)) * item.quantity for item in checkout.items))
    tax = money(subtotal * TAX_RATE)
    shipping_fee = get_shipping_fee(checkout.fulfillment_type)
    total = money(subtotal + tax + shipping_fee)
    order_number = f"FB-{uuid4().hex[:8].upper()}"
    is_shipping = checkout.fulfillment_type == SHIPPING_FULFILLMENT

    db_order = Order(
        order_number=order_number,
        status="pending_payment",
        payment_status="pending_payment",
        customer_name=checkout.customer_name,
        customer_email=checkout.customer_email,
        customer_firebase_uid=current_customer.uid if current_customer else None,
        customer_account_email=current_customer.email if current_customer else None,
        guest_email=None if current_customer else checkout.customer_email.strip().lower(),
        fulfillment_type=checkout.fulfillment_type,
        pickup_time=clean_optional_text(checkout.pickup_time)
        if checkout.fulfillment_type == PICKUP_FULFILLMENT
        else None,
        shipping_name=clean_optional_text(checkout.shipping_name) if is_shipping else None,
        shipping_address_line1=clean_optional_text(checkout.shipping_address_line1) if is_shipping else None,
        shipping_address_line2=clean_optional_text(checkout.shipping_address_line2) if is_shipping else None,
        shipping_city=clean_optional_text(checkout.shipping_city) if is_shipping else None,
        shipping_state=clean_optional_text(checkout.shipping_state) if is_shipping else None,
        shipping_zip=clean_optional_text(checkout.shipping_zip) if is_shipping else None,
        shipping_country=clean_optional_text(checkout.shipping_country) if is_shipping else None,
        subtotal=subtotal,
        tax=tax,
        shipping_fee=shipping_fee,
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

