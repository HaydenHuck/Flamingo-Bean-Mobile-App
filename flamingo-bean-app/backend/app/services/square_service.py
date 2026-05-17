import os
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from uuid import uuid4

import requests

from app.schemas.order import OrderItemCreate

SQUARE_API_VERSION = "2026-01-22"
SQUARE_SANDBOX_BASE_URL = "https://connect.squareupsandbox.com"
USD = "USD"


class SquareConfigurationError(Exception):
    pass


class SquareApiError(Exception):
    pass


@dataclass(frozen=True)
class SquarePaymentLinkResult:
    payment_link_id: str
    square_order_id: str | None
    checkout_url: str


def create_payment_link(
    *,
    order_number: str,
    customer_email: str,
    items: list[OrderItemCreate],
    shipping_fee: Decimal = Decimal("0"),
) -> SquarePaymentLinkResult:
    access_token = get_required_env("SQUARE_ACCESS_TOKEN")
    location_id = get_required_env("SQUARE_LOCATION_ID")
    return_url = get_required_env("MOBILE_APP_RETURN_URL")
    environment = os.getenv("SQUARE_ENVIRONMENT", "sandbox").lower()

    if environment != "sandbox":
        raise SquareConfigurationError("Only Square sandbox mode is supported for this checkout flow.")

    payload = {
        "idempotency_key": str(uuid4()),
        "description": f"Flamingo Bean order {order_number}",
        "order": {
            "location_id": location_id,
            "reference_id": order_number,
            "line_items": [
                *[to_square_line_item(item) for item in items],
                *to_square_shipping_line_items(shipping_fee),
            ],
            "taxes": [
                {
                    "uid": "estimated-tax",
                    "name": "Estimated tax",
                    "percentage": "8.25",
                    "scope": "LINE_ITEM",
                }
            ],
        },
        "checkout_options": {
            "redirect_url": return_url,
        },
        "payment_note": f"Flamingo Bean order {order_number}",
    }

    response = requests.post(
        f"{SQUARE_SANDBOX_BASE_URL}/v2/online-checkout/payment-links",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "Square-Version": SQUARE_API_VERSION,
        },
        json=payload,
        timeout=20,
    )

    if response.status_code >= 400:
        raise SquareApiError(extract_square_error(response))

    data = response.json()
    payment_link = data.get("payment_link") or {}
    checkout_url = payment_link.get("url") or payment_link.get("long_url")
    payment_link_id = payment_link.get("id")

    if not checkout_url or not payment_link_id:
        raise SquareApiError("Square did not return a usable checkout URL.")

    return SquarePaymentLinkResult(
        checkout_url=checkout_url,
        payment_link_id=payment_link_id,
        square_order_id=payment_link.get("order_id"),
    )


def get_required_env(name: str) -> str:
    value = os.getenv(name)

    if not value:
        raise SquareConfigurationError(f"{name} is required for Square sandbox checkout.")

    return value


def to_square_line_item(item: OrderItemCreate) -> dict:
    return {
        "name": item.name,
        "quantity": str(item.quantity),
        "applied_taxes": [{"tax_uid": "estimated-tax"}],
        "base_price_money": {
            "amount": to_cents(Decimal(str(item.price))),
            "currency": USD,
        },
    }


def to_square_shipping_line_items(shipping_fee: Decimal) -> list[dict]:
    if shipping_fee <= 0:
        return []

    return [
        {
            "name": "Flat shipping",
            "quantity": "1",
            "base_price_money": {
                "amount": to_cents(shipping_fee),
                "currency": USD,
            },
        }
    ]


def to_cents(amount: Decimal) -> int:
    return int((amount * 100).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def extract_square_error(response: requests.Response) -> str:
    try:
        data = response.json()
    except ValueError:
        return f"Square returned status {response.status_code}."

    errors = data.get("errors")

    if not errors:
        return f"Square returned status {response.status_code}."

    messages = []
    for error in errors:
        detail = error.get("detail") or error.get("code") or "Unknown Square error"
        messages.append(detail)

    return "; ".join(messages)

