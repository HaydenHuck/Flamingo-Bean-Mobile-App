import { API_BASE_URL, createAuthHeaders, throwApiError } from "./api";
import type { AdminLoginResponse, AdminUser } from "../types/auth";

export async function loginAdmin(email: string, password: string): Promise<AdminLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
    body: JSON.stringify({ email, password }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throwApiError(response, "Invalid admin email or password.");
  }

  return response.json() as Promise<AdminLoginResponse>;
}

export async function fetchCurrentAdmin(accessToken: string): Promise<AdminUser> {
  const response = await fetch(`${API_BASE_URL}/admin/auth/me`, {
    headers: createAuthHeaders(accessToken),
  });

  if (!response.ok) {
    throwApiError(response, "Unable to load admin session.");
  }

  return response.json() as Promise<AdminUser>;
}
