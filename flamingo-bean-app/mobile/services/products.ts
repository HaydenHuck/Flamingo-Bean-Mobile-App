import type { Product } from "../types/product";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products`);

  if (!response.ok) {
    throw new Error("Unable to load products.");
  }

  return response.json() as Promise<Product[]>;
}
