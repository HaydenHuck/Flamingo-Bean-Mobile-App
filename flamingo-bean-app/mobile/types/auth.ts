export interface AdminUser {
  id: number;
  email: string;
  role: string;
  active: boolean;
}

export interface AdminLoginResponse {
  access_token: string;
  token_type: string;
  admin: AdminUser;
}
