export interface User {
  id: number;
  username: string;
  password: string;
  roleId: number;
  isActive: boolean;
  borrar: boolean;
}

export interface IUserRepository {
  findByUsername(username: string): Promise<User | null>;
}
