import { API_BASE_URL } from "./api";
import type { CartItem } from "../contexts/CartContext";
import type { CreateCheckoutResponse, CreateOrderRequest, OrderItemRequest } from "../types/order";

interface CreateCheckoutInput {
  customerName: string;
  customerEmail: string;
  fulfillmentType: string;
  items: CartItem[];
}

export async function createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResponse> {
  const payload: CreateOrderRequest = {
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    fulfillment_type: input.fulfillmentType,
    items: input.items.map(toOrderItemRequest),
  };

  const response = await fetch(`${API_BASE_URL}/checkout/create`, {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Unable to start Square checkout.");
  }

  return response.json() as Promise<CreateCheckoutResponse>;
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

