import { API_BASE_URL, createAuthHeaders, throwApiError } from "./api";
import type { AdminProductPayload, Product } from "../types/product";

export async function fetchAdminProducts(accessToken: string): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/admin/products`, {
    headers: createAuthHeaders(accessToken),
  });

  if (!response.ok) {
    throwApiError(response, "Unable to load admin products.");
  }

  return response.json() as Promise<Product[]>;
}

export async function createAdminProduct(payload: AdminProductPayload, accessToken: string): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/admin/products`, {
    body: JSON.stringify(payload),
    headers: createAuthHeaders(accessToken, {
      "Content-Type": "application/json",
    }),
    method: "POST",
  });

  if (!response.ok) {
    throwApiError(response, "Unable to create product.");
  }

  return response.json() as Promise<Product>;
}

export async function updateAdminProduct(
  productId: number,
  payload: AdminProductPayload,
  accessToken: string,
): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
    body: JSON.stringify(payload),
    headers: createAuthHeaders(accessToken, {
      "Content-Type": "application/json",
    }),
    method: "PUT",
  });

  if (!response.ok) {
    throwApiError(response, "Unable to update product.");
  }

  return response.json() as Promise<Product>;
}

export async function updateAdminProductActive(
  productId: number,
  active: boolean,
  accessToken: string,
): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/active`, {
    body: JSON.stringify({ active }),
    headers: createAuthHeaders(accessToken, {
      "Content-Type": "application/json",
    }),
    method: "PATCH",
  });

  if (!response.ok) {
    throwApiError(response, "Unable to update product availability.");
  }

  return response.json() as Promise<Product>;
}

