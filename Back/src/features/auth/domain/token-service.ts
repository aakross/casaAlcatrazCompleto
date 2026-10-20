export interface ITokenService {
  generateToken(payload: {
    id: number;
    username: string;
    roleId: number;
  }): string;
}
