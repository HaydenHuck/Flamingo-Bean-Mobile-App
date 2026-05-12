import { API_BASE_URL } from "./api";
import type { AdminOrderDetail, AdminOrderSummary, OrderStatus } from "../types/order";

export async function fetchAdminOrders(): Promise<AdminOrderSummary[]> {
  const response = await fetch(`${API_BASE_URL}/admin/orders`);

  if (!response.ok) {
    throw new Error("Unable to load admin orders.");
  }

  return response.json() as Promise<AdminOrderSummary[]>;
}

export async function fetchAdminOrder(orderId: string): Promise<AdminOrderDetail> {
  const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`);

  if (!response.ok) {
    throw new Error("Unable to load order details.");
  }

  return response.json() as Promise<AdminOrderDetail>;
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<AdminOrderDetail> {
  const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
    body: JSON.stringify({ status }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error("Unable to update order status.");
  }

  return response.json() as Promise<AdminOrderDetail>;
}

