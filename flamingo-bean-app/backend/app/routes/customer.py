from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.firebase_auth import FirebaseUser, get_current_customer
from app.database import get_db
from app.models.order import Order
from app.routes.orders import (
    get_order_by_public_identifier,
    to_customer_order_summary,
    to_order_confirmation,
)
from app.schemas.order import CustomerOrderSummary, LinkGuestOrdersResponse, OrderConfirmation

router = APIRouter(prefix="/customer", tags=["customer"])


@router.get("/orders", response_model=list[CustomerOrderSummary])
def get_customer_orders(
    current_customer: FirebaseUser = Depends(get_current_customer),
    db: Session = Depends(get_db),
) -> list[CustomerOrderSummary]:
    orders = (
        db.query(Order)
        .filter(Order.customer_firebase_uid == current_customer.uid)
        .order_by(Order.created_at.desc(), Order.id.desc())
        .all()
    )

    return [to_customer_order_summary(order) for order in orders]


@router.get("/orders/{order_id}", response_model=OrderConfirmation)
def get_customer_order(
    order_id: str,
    current_customer: FirebaseUser = Depends(get_current_customer),
    db: Session = Depends(get_db),
) -> OrderConfirmation:
    order = get_order_by_public_identifier(db, order_id)

    if order.customer_firebase_uid != current_customer.uid:
        raise HTTPException(status_code=404, detail="Order not found.")

    return to_order_confirmation(order)


@router.post("/link-guest-orders", response_model=LinkGuestOrdersResponse)
def link_guest_orders(
    current_customer: FirebaseUser = Depends(get_current_customer),
    db: Session = Depends(get_db),
) -> LinkGuestOrdersResponse:
    if not current_customer.email or not current_customer.email_verified:
        return LinkGuestOrdersResponse(
            linked_count=0,
            message="Verify your email before linking previous guest orders.",
        )

    normalized_email = current_customer.email.strip().lower()
    guest_orders = (
        db.query(Order)
        .filter(Order.customer_firebase_uid.is_(None))
        .filter(
            or_(
                func.lower(Order.guest_email) == normalized_email,
                func.lower(Order.customer_email) == normalized_email,
            )
        )
        .all()
    )

    for order in guest_orders:
        order.customer_firebase_uid = current_customer.uid
        order.customer_account_email = normalized_email

    db.commit()

    return LinkGuestOrdersResponse(
        linked_count=len(guest_orders),
        message=f"Linked {len(guest_orders)} previous guest order(s).",
    )
