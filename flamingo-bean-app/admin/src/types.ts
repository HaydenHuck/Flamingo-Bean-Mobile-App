export interface AdminUser {
  id: number;
  email: string;
  role: string;
  active: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  admin: AdminUser;
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

export type StaffOrderStatus = "received" | "preparing" | "ready" | "completed" | "canceled";

export type PaymentStatus = "pending_payment" | "paid" | "payment_failed" | "canceled";

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

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  roast_level: string;
  origin: string;
  size: string;
  active: boolean;
}

export interface ProductPayload {
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  roast_level: string;
  origin: string;
  size: string;
  active: boolean;
}
