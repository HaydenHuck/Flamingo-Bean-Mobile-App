import { API_BASE_URL } from "./config";
import type {
  AdminOrderDetail,
  AdminOrderSummary,
  AdminUser,
  LoginResponse,
  Product,
  ProductPayload,
  StaffOrderStatus,
} from "./types";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function loginAdmin(email: string, password: string) {
  return apiRequest<LoginResponse>("/admin/auth/login", {
    body: JSON.stringify({ email, password }),
    method: "POST",
  });
}

export async function fetchCurrentAdmin(token: string) {
  return apiRequest<AdminUser>("/admin/auth/me", {}, token);
}

export async function fetchAdminOrders(token: string) {
  return apiRequest<AdminOrderSummary[]>("/admin/orders", {}, token);
}

export async function fetchAdminOrder(orderId: string, token: string) {
  return apiRequest<AdminOrderDetail>(`/admin/orders/${encodeURIComponent(orderId)}`, {}, token);
}

export async function updateAdminOrderStatus(orderId: string, status: StaffOrderStatus, token: string) {
  return apiRequest<AdminOrderDetail>(
    `/admin/orders/${encodeURIComponent(orderId)}/status`,
    {
      body: JSON.stringify({ status }),
      method: "PUT",
    },
    token,
  );
}

export async function fetchAdminProducts(token: string) {
  return apiRequest<Product[]>("/admin/products", {}, token);
}

export async function createAdminProduct(payload: ProductPayload, token: string) {
  return apiRequest<Product>(
    "/admin/products",
    {
      body: JSON.stringify(payload),
      method: "POST",
    },
    token,
  );
}

export async function updateAdminProduct(productId: number, payload: ProductPayload, token: string) {
  return apiRequest<Product>(
    `/admin/products/${productId}`,
    {
      body: JSON.stringify(payload),
      method: "PUT",
    },
    token,
  );
}

export async function updateAdminProductActive(productId: number, active: boolean, token: string) {
  return apiRequest<Product>(
    `/admin/products/${productId}/active`,
    {
      body: JSON.stringify({ active }),
      method: "PATCH",
    },
    token,
  );
}

async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new ApiError(await getErrorMessage(response), response.status);
  }

  return response.json() as Promise<T>;
}

async function getErrorMessage(response: Response) {
  try {
    const data = await response.json();
    return data.detail || "The admin API request failed.";
  } catch {
    return "The admin API request failed.";
  }
}
