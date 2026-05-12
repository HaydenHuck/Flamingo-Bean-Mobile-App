export const API_BASE_URL = "http://127.0.0.1:8000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function createAuthHeaders(accessToken: string, extraHeaders: Record<string, string> = {}) {
  return {
    Authorization: `Bearer ${accessToken}`,
    ...extraHeaders,
  };
}

export function throwApiError(response: Response, message: string): never {
  throw new ApiError(message, response.status);
}

export function isAuthError(error: unknown) {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}
