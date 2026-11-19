export interface User {
  id: number;
  username: string;
  password: string;
  roleId: number;
  isActive: boolean;
  borrar: boolean;
  permisos: string[];
  debeCambiarPassword?: boolean;
}

export interface IUserRepository {
  findByUsername(username: string): Promise<User | null>;
  validateAndSyncUser(username: string, password: string): Promise<User | null>;
}
