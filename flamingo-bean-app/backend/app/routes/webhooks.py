import base64
import hashlib
import hmac
import json
import logging
import os
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.order import Order

router = APIRouter(tags=["webhooks"])
logger = logging.getLogger(__name__)

SIGNATURE_HEADER = "x-square-hmacsha256-signature"
PROTECTED_STATUSES = {"preparing", "ready", "completed"}
PAYMENT_COMPLETED_STATUS = "COMPLETED"
PAYMENT_FAILED_STATUSES = {"FAILED", "CANCELED"}


@router.post("/webhooks/square")
async def square_webhook(request: Request, db: Session = Depends(get_db)) -> dict[str, str]:
    logger.info("Square webhook received")
    raw_body = await request.body()
    signature_header = request.headers.get(SIGNATURE_HEADER)

    if not signature_header:
        logger.warning("Square webhook rejected: missing signature header")
        raise HTTPException(status_code=401, detail="Missing Square signature.")

    if not is_valid_square_signature(signature_header, raw_body):
        logger.warning("Square webhook rejected: signature validation failed")
        raise HTTPException(status_code=403, detail="Invalid Square signature.")

    logger.info("Square webhook signature validation succeeded")

    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except json.JSONDecodeError as exc:
        logger.warning("Square webhook rejected: invalid JSON payload")
        raise HTTPException(status_code=400, detail="Invalid webhook payload.") from exc

    event_type = payload.get("type", "unknown")
    logger.info("Square webhook event_type=%s", event_type)

    if event_type in {"payment.created", "payment.updated"}:
        handle_payment_event(payload, db)
    elif event_type == "order.updated":
        handle_order_event(payload, db)
    else:
        logger.info("Square webhook ignored event_type=%s", event_type)

    return {"status": "received"}


def is_valid_square_signature(signature_header: str, raw_body: bytes) -> bool:
    signature_key = os.getenv("SQUARE_WEBHOOK_SIGNATURE_KEY")
    notification_url = os.getenv("SQUARE_WEBHOOK_NOTIFICATION_URL")

    if not signature_key or not notification_url:
        logger.warning("Square webhook signature configuration is missing")
        return False

    message = notification_url.encode("utf-8") + raw_body
    digest = hmac.new(signature_key.encode("utf-8"), message, hashlib.sha256).digest()
    expected_signature = base64.b64encode(digest).decode("utf-8")

    return hmac.compare_digest(expected_signature, signature_header)


def handle_payment_event(payload: dict[str, Any], db: Session) -> None:
    payment = extract_event_object(payload, "payment")

    if not payment:
        logger.info("Square payment webhook had no payment object")
        return

    payment_id = payment.get("id")
    square_order_id = payment.get("order_id")
    payment_status = payment.get("status")
    order = find_local_order_for_payment(payment, db)

    if not order:
        logger.info(
            "Square payment webhook had no local order match square_payment_id=%s square_order_id=%s",
            payment_id,
            square_order_id,
        )
        return

    order.square_payment_id = payment_id or order.square_payment_id
    order.square_order_id = square_order_id or order.square_order_id

    if payment_status == PAYMENT_COMPLETED_STATUS:
        mark_order_paid(order)
    elif payment_status in PAYMENT_FAILED_STATUSES:
        mark_order_payment_failed(order, payment_status)

    db.commit()
    logger.info(
        "Square payment webhook processed event_type=%s square_payment_id=%s square_order_id=%s local_order_id=%s local_order_number=%s payment_status=%s",
        payload.get("type"),
        payment_id,
        square_order_id,
        order.id,
        order.order_number,
        order.payment_status,
    )


def handle_order_event(payload: dict[str, Any], db: Session) -> None:
    square_order = extract_event_object(payload, "order")

    if not square_order:
        logger.info("Square order webhook had no order object")
        return

    square_order_id = square_order.get("id")
    square_reference_id = square_order.get("reference_id")
    order = find_local_order_for_square_order(square_order, db)

    if not order:
        logger.info(
            "Square order webhook had no local order match square_order_id=%s square_reference_id=%s",
            square_order_id,
            square_reference_id,
        )
        return

    order.square_order_id = square_order_id or order.square_order_id

    if square_order.get("state") == "COMPLETED":
        mark_order_paid(order)
        db.commit()

    logger.info(
        "Square order webhook processed square_order_id=%s square_reference_id=%s local_order_id=%s local_order_number=%s payment_status=%s",
        square_order_id,
        square_reference_id,
        order.id,
        order.order_number,
        order.payment_status,
    )


def extract_event_object(payload: dict[str, Any], object_name: str) -> dict[str, Any] | None:
    event_data = payload.get("data") or {}
    event_object = event_data.get("object") or {}
    value = event_object.get(object_name)

    return value if isinstance(value, dict) else None


def find_local_order_for_payment(payment: dict[str, Any], db: Session) -> Order | None:
    payment_id = payment.get("id")
    square_order_id = payment.get("order_id")
    payment_reference_id = payment.get("reference_id")
    note = payment.get("note")

    if payment_id:
        order = db.query(Order).filter(Order.square_payment_id == payment_id).first()
        if order:
            return order

    order = find_local_order_by_square_order_id(square_order_id, db)
    if order:
        return order

    order_number = payment_reference_id or extract_order_number_from_note(note)
    if order_number:
        return find_local_order_by_order_number(order_number, db)

    return None


def find_local_order_for_square_order(square_order: dict[str, Any], db: Session) -> Order | None:
    square_order_id = square_order.get("id")
    square_reference_id = square_order.get("reference_id")

    order = find_local_order_by_square_order_id(square_order_id, db)
    if order:
        return order

    if square_reference_id:
        return find_local_order_by_order_number(square_reference_id, db)

    return None


def find_local_order_by_square_order_id(square_order_id: str | None, db: Session) -> Order | None:
    if not square_order_id:
        return None

    return db.query(Order).filter(Order.square_order_id == square_order_id).first()


def find_local_order_by_order_number(order_number: str, db: Session) -> Order | None:
    return db.query(Order).filter(Order.order_number == order_number).first()


def extract_order_number_from_note(note: str | None) -> str | None:
    if not note:
        return None

    for word in note.split():
        if word.startswith("FB-"):
            return word

    return None


def mark_order_paid(order: Order) -> None:
    order.payment_status = "paid"

    if order.status not in PROTECTED_STATUSES:
        order.status = "received"


def mark_order_payment_failed(order: Order, square_status: str) -> None:
    if square_status == "CANCELED":
        order.payment_status = "canceled"
        if order.status not in PROTECTED_STATUSES:
            order.status = "canceled"
        return

    order.payment_status = "payment_failed"
    if order.status not in PROTECTED_STATUSES:
        order.status = "payment_failed"
