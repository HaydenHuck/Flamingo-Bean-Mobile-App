from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.order import Order
from app.schemas.order import (
    AdminOrderDetail,
    AdminOrderItem,
    AdminOrderSummary,
    OrderStatusUpdate,
)

router = APIRouter(prefix="/admin", tags=["admin"])

ALLOWED_ORDER_STATUSES = {"received", "preparing", "ready", "completed", "canceled"}


@router.get("/orders", response_model=list[AdminOrderSummary])
def get_admin_orders(db: Session = Depends(get_db)) -> list[AdminOrderSummary]:
    orders = db.query(Order).order_by(Order.created_at.desc(), Order.id.desc()).all()

    return [to_admin_order_summary(order) for order in orders]


@router.get("/orders/{order_id}", response_model=AdminOrderDetail)
def get_admin_order(order_id: str, db: Session = Depends(get_db)) -> AdminOrderDetail:
    order = get_order_by_number(db, order_id)

    return to_admin_order_detail(order)


@router.put("/orders/{order_id}/status", response_model=AdminOrderDetail)
def update_admin_order_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
) -> AdminOrderDetail:
    if status_update.status not in ALLOWED_ORDER_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid order status.")

    order = get_order_by_number(db, order_id)

    setattr(order, "status", status_update.status)

    db.commit()
    db.refresh(order)

    return to_admin_order_detail(order)


def get_order_by_number(db: Session, order_number: str) -> Order:
    order = db.query(Order).filter(Order.order_number == order_number).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    return order


def to_admin_order_summary(order: Order):
    return AdminOrderSummary(
        order_id=str(order.order_number),
        customer_name=str(order.customer_name),
        customer_email=str(order.customer_email),
        fulfillment_type=str(order.fulfillment_type),
        status=str(order.status),
        subtotal=float(str(order.subtotal)),
        tax=float(str(order.tax)),
        total=float(str(order.total)),
        created_at=order.created_at.isoformat(),
    )


def to_admin_order_detail(order: Order) -> AdminOrderDetail:
    summary = to_admin_order_summary(order)

    return AdminOrderDetail(
        **summary.model_dump(),
        items=[
            AdminOrderItem(
                product_id=item.product_id,
                name=item.product_name_snapshot,
                price=float(item.unit_price),
                quantity=item.quantity,
                size=item.size,
                line_total=float(item.line_total),
            )
            for item in order.items
        ],
    )

