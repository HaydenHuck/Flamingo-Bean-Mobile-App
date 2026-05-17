export interface OrderItemRequest {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  size: string;
}

export interface OrderItemResponse extends OrderItemRequest {
  line_total: number;
}

export interface CreateOrderRequest {
  customer_name: string;
  customer_email: string;
  fulfillment_type: string;
  items: OrderItemRequest[];
}

export type OrderStatus =
  | "received"
  | "pending_payment"
  | "paid"
  | "payment_failed"
  | "preparing"
  | "ready"
  | "completed"
  | "canceled";
export type PaymentStatus = "pending_payment" | "paid" | "payment_failed" | "canceled";

export interface OrderConfirmation {
  id: number;
  order_id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  customer_name: string;
  fulfillment_type: string;
  items: OrderItemResponse[];
  subtotal: number;
  tax: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface CheckoutSession {
  local_order_id: number;
  local_order_number: string;
  checkout_url: string;
  status: string;
}

export interface CreateCheckoutResponse extends CheckoutSession {}
