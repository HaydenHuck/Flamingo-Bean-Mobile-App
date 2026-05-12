export interface OrderItemRequest {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  size: string;
}

export interface CreateOrderRequest {
  customer_name: string;
  customer_email: string;
  fulfillment_type: string;
  items: OrderItemRequest[];
}

export interface OrderConfirmation {
  order_id: string;
  status: string;
  payment_status: string;
  customer_name: string;
  customer_email: string;
  fulfillment_type: string;
  items: OrderItemRequest[];
  subtotal: number;
  tax: number;
  total: number;
  created_at: string;
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

export interface CheckoutSession {
  local_order_id: number;
  local_order_number: string;
  checkout_url: string;
  status: string;
}

export interface CreateCheckoutResponse extends CheckoutSession {}

export interface AdminOrderSummary {
  order_id: string;
  customer_name: string;
  customer_email: string;
  fulfillment_type: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  tax: number;
  total: number;
  created_at: string;
}

export interface AdminOrderItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  size: string;
  line_total: number;
}

export interface AdminOrderDetail extends AdminOrderSummary {
  items: AdminOrderItem[];
}
