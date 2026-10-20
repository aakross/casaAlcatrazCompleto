export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  id: number;
  username: string;
  roleId: number;
  isActive: boolean;
  token: string;
  borrar: number | boolean;
}
