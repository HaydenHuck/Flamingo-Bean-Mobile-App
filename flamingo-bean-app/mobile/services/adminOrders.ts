import { API_BASE_URL, createAuthHeaders, throwApiError } from "./api";
import type { AdminOrderDetail, AdminOrderSummary, OrderStatus } from "../types/order";

export async function fetchAdminOrders(accessToken: string): Promise<AdminOrderSummary[]> {
  const response = await fetch(`${API_BASE_URL}/admin/orders`, {
    headers: createAuthHeaders(accessToken),
  });

  if (!response.ok) {
    throwApiError(response, "Unable to load admin orders.");
  }

  return response.json() as Promise<AdminOrderSummary[]>;
}

export async function fetchAdminOrder(orderId: string, accessToken: string): Promise<AdminOrderDetail> {
  const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
    headers: createAuthHeaders(accessToken),
  });

  if (!response.ok) {
    throwApiError(response, "Unable to load order details.");
  }

  return response.json() as Promise<AdminOrderDetail>;
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: OrderStatus,
  accessToken: string,
): Promise<AdminOrderDetail> {
  const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
    body: JSON.stringify({ status }),
    headers: createAuthHeaders(accessToken, {
      "Content-Type": "application/json",
    }),
    method: "PUT",
  });

  if (!response.ok) {
    throwApiError(response, "Unable to update order status.");
  }

  return response.json() as Promise<AdminOrderDetail>;
}

