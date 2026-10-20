import mssql from "mssql";
import { IUserRepository, User } from "../../domain/user.repository";
import { dbConfig } from "../../../../config/database";

export class UserRepository implements IUserRepository {
  async findByUsername(username: string): Promise<User | null> {
    let pool;

    try {
      pool = await mssql.connect(dbConfig);

      let result;
      try {
        result = await pool
          .request()
          .input("user", mssql.VarChar, username)
          .query(
            "SELECT id, [user], password, rol_id, activo, borrar FROM AAC_Alcatraz_usuarios WHERE [user] = @user",
          );
      } catch {
        // Fallback en caso de que la columna borrar aún no exista en producción
        result = await pool
          .request()
          .input("user", mssql.VarChar, username)
          .query(
            "SELECT id, [user], password, rol_id, activo FROM AAC_Alcatraz_usuarios WHERE [user] = @user",
          );
      }

      if (result.recordset.length === 0) {
        return null;
      }

      const row = result.recordset[0];
      return {
        id: row.id,
        username: row.user,
        password: row.password,
        roleId: row.rol_id,
        isActive: row.activo,
        borrar: row.borrar === true || row.borrar === 1 || false, 
      };
    } catch (error) {
      console.error("❌ Error en UserRepository.findByUsername:", error);
    }

    return null;
  }
}
