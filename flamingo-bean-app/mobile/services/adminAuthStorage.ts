const ADMIN_TOKEN_STORAGE_KEY = "flamingo_bean_admin_token";

let memoryToken: string | null = null;

export async function getStoredAdminToken(): Promise<string | null> {
  const storage = getLocalStorage();
  const storedToken = storage?.getItem(ADMIN_TOKEN_STORAGE_KEY) ?? null;
  memoryToken = storedToken ?? memoryToken;

  return memoryToken;
}

export async function storeAdminToken(token: string): Promise<void> {
  memoryToken = token;
  getLocalStorage()?.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
}

export async function clearStoredAdminToken(): Promise<void> {
  memoryToken = null;
  getLocalStorage()?.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

function getLocalStorage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}
