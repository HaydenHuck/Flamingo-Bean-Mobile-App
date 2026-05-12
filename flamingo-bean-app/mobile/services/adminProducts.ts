import { API_BASE_URL } from "./api";
import type { AdminProductPayload, Product } from "../types/product";

export async function fetchAdminProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/admin/products`);

  if (!response.ok) {
    throw new Error("Unable to load admin products.");
  }

  return response.json() as Promise<Product[]>;
}

export async function createAdminProduct(payload: AdminProductPayload): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/admin/products`, {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Unable to create product.");
  }

  return response.json() as Promise<Product>;
}

export async function updateAdminProduct(productId: number, payload: AdminProductPayload): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error("Unable to update product.");
  }

  return response.json() as Promise<Product>;
}

export async function updateAdminProductActive(productId: number, active: boolean): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/active`, {
    body: JSON.stringify({ active }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error("Unable to update product availability.");
  }

  return response.json() as Promise<Product>;
}

