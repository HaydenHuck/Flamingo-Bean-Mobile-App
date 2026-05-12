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
  customer_name: string;
  customer_email: string;
  fulfillment_type: string;
  items: OrderItemRequest[];
  subtotal: number;
  tax: number;
  total: number;
  created_at: string;
}

