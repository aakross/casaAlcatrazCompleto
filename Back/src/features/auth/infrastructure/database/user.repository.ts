import mssql from "mssql";
import { IUserRepository, User } from "../../domain/user.repository";
import { dbConfig } from "../../../../config/database";

export class UserRepository implements IUserRepository {
  private async cargarPermisos(pool: mssql.ConnectionPool, userId: number, roleId: number): Promise<string[]> {
    try {
      const resPermisos = await pool
        .request()
        .input("userId", mssql.Int, userId)
        .query(`
          SELECT modulo_clave
          FROM dbo.AAC_Alcatraz_permisos_usuario
          WHERE usuario_id = @userId AND permitido = 1;
        `);

      let permisos = resPermisos.recordset.map((r: any) => r.modulo_clave);

      // Si el rol es 1 (Dirección / Sistemas / SuperAdmin), conceder acceso a todos los módulos activos
      if (roleId === 1 || permisos.includes("PERMISOS")) {
        const resTodosModulos = await pool.request().query(`
          SELECT clave FROM dbo.AAC_Alcatraz_modulos WHERE activo = 1;
        `);
        const todos = resTodosModulos.recordset.map((r: any) => r.clave);
        // Mezclar sin duplicados
        permisos = Array.from(new Set([...permisos, ...todos]));
      }

      return permisos;
    } catch (err) {
      console.error("Error al cargar permisos de usuario:", err);
      // Fallback si la tabla no estuviera disponible aún
      return roleId === 1
        ? ["RESERVAS", "PAGOS", "CORTES", "ESTADO_RESULTADOS", "RENTAS", "REPORTES", "PERMISOS"]
        : ["RESERVAS", "PAGOS", "CORTES", "REPORTES"];
    }
  }

  async validateAndSyncUser(usernameInput: string, passwordInput: string): Promise<User | null> {
    const userClean = usernameInput.trim();
    const pwdClean = passwordInput.trim();

    let pool: mssql.ConnectionPool;
    try {
      pool = await mssql.connect(dbConfig);
    } catch (err) {
      console.error("❌ Error de conexión en validateAndSyncUser:", err);
      return null;
    }

    try {
      let matchedUserRow: any = null;
      let isFromTcausr = false;

      // 1. Paso 1: Buscar si coincide en dbo.tcausr (RTRIM)
      try {
        const resTca = await pool
          .request()
          .input("user", mssql.VarChar(50), userClean)
          .input("pwd", mssql.VarChar(50), pwdClean)
          .query(`
            SELECT TOP 1 RTRIM(nombre) AS nombre, RTRIM(pwd) AS pwd, RTRIM(nombre_lar) AS nombre_lar
            FROM dbo.tcausr
            WHERE RTRIM(nombre) = @user AND RTRIM(pwd) = @pwd;
          `);

        if (resTca.recordset.length > 0) {
          isFromTcausr = true;
          console.log(`✅ Usuario encontrado en dbo.tcausr: ${userClean}`);
        }
      } catch (errTca) {
        console.warn("⚠️ No se pudo consultar dbo.tcausr (continuando con AAC_Alcatraz_usuarios):", errTca);
      }

      // 2. Paso 2: Si coincidió en tcausr, sincronizar / insertar automáticamente en AAC_Alcatraz_usuarios
      if (isFromTcausr) {
        const resAacExistente = await pool
          .request()
          .input("user", mssql.VarChar(50), userClean)
          .query(`
            SELECT id, [user], password, rol_id, activo, borrar, COALESCE(debe_cambiar_password, 0) AS debe_cambiar_password
            FROM dbo.AAC_Alcatraz_usuarios
            WHERE [user] = @user;
          `);

        if (resAacExistente.recordset.length > 0) {
          matchedUserRow = resAacExistente.recordset[0];
          // Sincronizar contraseña si cambió en tcausr
          if (matchedUserRow.password !== pwdClean) {
            await pool
              .request()
              .input("id", mssql.Int, matchedUserRow.id)
              .input("pwd", mssql.VarChar(100), pwdClean)
              .query(`
                UPDATE dbo.AAC_Alcatraz_usuarios
                SET password = @pwd, updated_at = GETDATE(), user_update = 'SYNC_TCAUSR'
                WHERE id = @id;
              `);
            matchedUserRow.password = pwdClean;
          }
        } else {
          // No existía en AAC_Alcatraz_usuarios: Auto-migración
          console.log(`🚀 Migrando automáticamente usuario '${userClean}' de tcausr a AAC_Alcatraz_usuarios...`);
          const resInsert = await pool
            .request()
            .input("user", mssql.VarChar(50), userClean)
            .input("pwd", mssql.VarChar(100), pwdClean)
            .query(`
              INSERT INTO dbo.AAC_Alcatraz_usuarios (
                [user], password, rol_id, activo, borrar, created_at, user_create, origen
              )
              OUTPUT INSERTED.id, INSERTED.[user], INSERTED.password, INSERTED.rol_id, INSERTED.activo, INSERTED.borrar
              VALUES (
                @user, @pwd, 2, 1, 0, GETDATE(), 'MIGRACION_TCAUSR', 'TCAUSR'
              );
            `);

          matchedUserRow = resInsert.recordset[0];

          // Asignar permisos base por defecto al nuevo usuario migrado
          const modulosDefecto = ["RESERVAS", "PAGOS", "CORTES", "REPORTES"];
          for (const modClave of modulosDefecto) {
            await pool
              .request()
              .input("usrId", mssql.Int, matchedUserRow.id)
              .input("modClave", mssql.VarChar(50), modClave)
              .query(`
                IF NOT EXISTS (SELECT 1 FROM dbo.AAC_Alcatraz_permisos_usuario WHERE usuario_id = @usrId AND modulo_clave = @modClave)
                BEGIN
                  INSERT INTO dbo.AAC_Alcatraz_permisos_usuario (usuario_id, modulo_clave, permitido, fecha_asignacion)
                  VALUES (@usrId, @modClave, 1, GETDATE());
                END;
              `);
          }
        }
      } else {
        // 3. Paso 3: No estaba en tcausr, buscar directamente en dbo.AAC_Alcatraz_usuarios
        const resAac = await pool
          .request()
          .input("user", mssql.VarChar(50), userClean)
          .query(`
            SELECT id, [user], password, rol_id, activo, borrar, COALESCE(debe_cambiar_password, 0) AS debe_cambiar_password
            FROM dbo.AAC_Alcatraz_usuarios
            WHERE [user] = @user;
          `);

        if (resAac.recordset.length === 0) {
          return null;
        }

        const candidato = resAac.recordset[0];
        if (candidato.password !== pwdClean) {
          return null; // Contraseña incorrecta
        }

        matchedUserRow = candidato;
      }

      if (!matchedUserRow) {
        return null;
      }

      // 4. Paso 4: Cargar permisos correspondientes
      const permisos = await this.cargarPermisos(pool, matchedUserRow.id, matchedUserRow.rol_id);

      return {
        id: matchedUserRow.id,
        username: matchedUserRow.user,
        password: matchedUserRow.password,
        roleId: matchedUserRow.rol_id,
        isActive: matchedUserRow.activo === true || matchedUserRow.activo === 1,
        borrar: matchedUserRow.borrar === true || matchedUserRow.borrar === 1,
        permisos,
        debeCambiarPassword:
          matchedUserRow.debe_cambiar_password === true || matchedUserRow.debe_cambiar_password === 1,
      };
    } catch (error) {
      console.error("❌ Error en UserRepository.validateAndSyncUser:", error);
      return null;
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    let pool;
    try {
      pool = await mssql.connect(dbConfig);
      const result = await pool
        .request()
        .input("user", mssql.VarChar, username.trim())
        .query(`
          SELECT id, [user], password, rol_id, activo, borrar
          FROM dbo.AAC_Alcatraz_usuarios
          WHERE [user] = @user;
        `);

      if (result.recordset.length === 0) {
        return null;
      }

      const row = result.recordset[0];
      const permisos = await this.cargarPermisos(pool, row.id, row.rol_id);

      return {
        id: row.id,
        username: row.user,
        password: row.password,
        roleId: row.rol_id,
        isActive: row.activo === true || row.activo === 1,
        borrar: row.borrar === true || row.borrar === 1,
        permisos,
      };
    } catch (error) {
      console.error("❌ Error en UserRepository.findByUsername:", error);
      return null;
    }
  }
}
