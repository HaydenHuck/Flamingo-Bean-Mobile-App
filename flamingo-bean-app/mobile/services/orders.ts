import { API_BASE_URL } from "./api";
import type { CartItem } from "../contexts/CartContext";
import type { CreateOrderRequest, OrderConfirmation, OrderItemRequest } from "../types/order";

interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  fulfillmentType: string;
  items: CartItem[];
}

export async function createOrder(input: CreateOrderInput): Promise<OrderConfirmation> {
  const payload: CreateOrderRequest = {
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    fulfillment_type: input.fulfillmentType,
    items: input.items.map(toOrderItemRequest),
  };

  const response = await fetch(`${API_BASE_URL}/orders`, {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Unable to create order.");
  }

  return response.json() as Promise<OrderConfirmation>;
}

function toOrderItemRequest(item: CartItem): OrderItemRequest {
  return {
    product_id: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    size: item.size,
  };
}

