import mssql from "mssql";
import { dbConfig } from "../../../../config/database";
import {
  ModuloSistema,
  UsuarioConPermisos,
  VerificarTcausrResult,
  CrearUsuarioRequest,
} from "../../domain/permisos.types";

export class PermisosRepository {
  async obtenerModulos(): Promise<ModuloSistema[]> {
    const pool = await mssql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT id, clave, nombre, ruta, icono, orden, activo
      FROM dbo.AAC_Alcatraz_modulos
      WHERE activo = 1
      ORDER BY orden ASC;
    `);
    return result.recordset;
  }

  async obtenerUsuariosConPermisos(): Promise<UsuarioConPermisos[]> {
    const pool = await mssql.connect(dbConfig);

    // 1. Obtener todos los usuarios activos
    const resUsuarios = await pool.request().query(`
      SELECT 
        u.id, 
        u.[user] AS username, 
        u.rol_id, 
        COALESCE(r.descripcion, 'Sin Rol') AS rol_nombre,
        u.activo,
        COALESCE(u.origen, 'SISTEMA') AS origen,
        COALESCE(u.debe_cambiar_password, 0) AS debe_cambiar_password
      FROM dbo.AAC_Alcatraz_usuarios u
      LEFT JOIN dbo.AAC_Alcatraz_rol_usuario r ON r.id = u.rol_id
      ORDER BY u.id ASC;
    `);

    // 2. Obtener todos los permisos asignados
    const resPermisos = await pool.request().query(`
      SELECT usuario_id, modulo_clave, permitido
      FROM dbo.AAC_Alcatraz_permisos_usuario
      WHERE permitido = 1;
    `);

    // 3. Obtener todos los módulos activos
    const resModulos = await pool.request().query(`
      SELECT clave FROM dbo.AAC_Alcatraz_modulos WHERE activo = 1;
    `);
    const todosModulos = resModulos.recordset.map((m: any) => m.clave);

    // Mapear permisos por usuario_id
    const permisosMap = new Map<number, Set<string>>();
    for (const row of resPermisos.recordset) {
      if (!permisosMap.has(row.usuario_id)) {
        permisosMap.set(row.usuario_id, new Set<string>());
      }
      permisosMap.get(row.usuario_id)!.add(row.modulo_clave);
    }

    return resUsuarios.recordset.map((u: any) => {
      let userPermisos: string[] = [];

      if (u.rol_id === 1) {
        // Rol 1 (Dirección / Sistemas) siempre tiene todos los módulos
        userPermisos = [...todosModulos];
      } else {
        const setP = permisosMap.get(u.id);
        userPermisos = setP ? Array.from(setP) : [];
      }

      return {
        id: u.id,
        username: u.username,
        rol_id: u.rol_id,
        rol_nombre: u.rol_nombre,
        activo: u.activo === true || u.activo === 1,
        origen: u.origen,
        permisos: userPermisos,
        debe_cambiar_password: u.debe_cambiar_password === true || u.debe_cambiar_password === 1,
      };
    });
  }

  async togglePermiso(
    usuarioId: number,
    moduloClave: string,
    permitido: boolean,
    usuarioAsignoId?: number
  ): Promise<boolean> {
    const pool = await mssql.connect(dbConfig);

    // Validar protección del usuario sistemas o rol dirección
    const resCheck = await pool
      .request()
      .input("usuarioId", mssql.Int, usuarioId)
      .query(`SELECT [user], rol_id FROM dbo.AAC_Alcatraz_usuarios WHERE id = @usuarioId;`);
    if (resCheck.recordset.length > 0) {
      const u = resCheck.recordset[0];
      if (u.user?.toLowerCase() === "sistemas" || u.rol_id === 1) {
        throw new Error("El usuario 'sistemas' cuenta con todos los permisos por defecto y está protegido.");
      }
    }

    const result = await pool
      .request()
      .input("usuarioId", mssql.Int, usuarioId)
      .input("moduloClave", mssql.VarChar(50), moduloClave)
      .input("permitido", mssql.Bit, permitido ? 1 : 0)
      .input("usuarioAsignoId", mssql.Int, usuarioAsignoId || null)
      .query(`
        IF EXISTS (SELECT 1 FROM dbo.AAC_Alcatraz_permisos_usuario WHERE usuario_id = @usuarioId AND modulo_clave = @moduloClave)
        BEGIN
          UPDATE dbo.AAC_Alcatraz_permisos_usuario
          SET permitido = @permitido,
              fecha_asignacion = GETDATE(),
              usuario_asigno_id = @usuarioAsignoId
          WHERE usuario_id = @usuarioId AND modulo_clave = @moduloClave;
        END
        ELSE
        BEGIN
          INSERT INTO dbo.AAC_Alcatraz_permisos_usuario (
            usuario_id, modulo_clave, permitido, fecha_asignacion, usuario_asigno_id
          )
          VALUES (
            @usuarioId, @moduloClave, @permitido, GETDATE(), @usuarioAsignoId
          );
        END;
      `);

    return (result.rowsAffected[0] ?? 0) > 0;
  }

  async toggleEstadoUsuario(
    usuarioId: number,
    activo: boolean,
    usuarioModifico?: string
  ): Promise<boolean> {
    const pool = await mssql.connect(dbConfig);

    // Validar que no se intente desactivar al usuario sistemas o id 1
    const resCheck = await pool
      .request()
      .input("usuarioId", mssql.Int, usuarioId)
      .query(`
        SELECT id, [user], rol_id 
        FROM dbo.AAC_Alcatraz_usuarios 
        WHERE id = @usuarioId;
      `);

    if (resCheck.recordset.length === 0) {
      throw new Error("El usuario especificado no existe.");
    }

    const usuario = resCheck.recordset[0];
    if (usuario.user?.toLowerCase() === "sistemas" || usuario.id === 1) {
      throw new Error("El usuario 'sistemas' está protegido y no puede ser inactivado.");
    }

    const result = await pool
      .request()
      .input("usuarioId", mssql.Int, usuarioId)
      .input("activo", mssql.Bit, activo ? 1 : 0)
      .input("usuarioModifico", mssql.VarChar(50), usuarioModifico || "ADMIN")
      .query(`
        UPDATE dbo.AAC_Alcatraz_usuarios
        SET activo = @activo, updated_at = GETDATE(), user_update = @usuarioModifico
        WHERE id = @usuarioId;
      `);

    return (result.rowsAffected[0] ?? 0) > 0;
  }

  async asignarPermisosUsuario(
    usuarioId: number,
    modulosClaves: string[],
    usuarioAsignoId?: number
  ): Promise<boolean> {
    const pool = await mssql.connect(dbConfig);
    const transaction = new mssql.Transaction(pool);

    try {
      await transaction.begin();

      // Desactivar todos los permisos actuales
      const reqReset = new mssql.Request(transaction);
      await reqReset
        .input("usuarioId", mssql.Int, usuarioId)
        .query(`UPDATE dbo.AAC_Alcatraz_permisos_usuario SET permitido = 0 WHERE usuario_id = @usuarioId;`);

      // Activar los seleccionados
      for (const clave of modulosClaves) {
        const reqUp = new mssql.Request(transaction);
        await reqUp
          .input("usuarioId", mssql.Int, usuarioId)
          .input("moduloClave", mssql.VarChar(50), clave)
          .input("usuarioAsignoId", mssql.Int, usuarioAsignoId || null)
          .query(`
            IF EXISTS (SELECT 1 FROM dbo.AAC_Alcatraz_permisos_usuario WHERE usuario_id = @usuarioId AND modulo_clave = @moduloClave)
            BEGIN
              UPDATE dbo.AAC_Alcatraz_permisos_usuario
              SET permitido = 1, fecha_asignacion = GETDATE(), usuario_asigno_id = @usuarioAsignoId
              WHERE usuario_id = @usuarioId AND modulo_clave = @moduloClave;
            END
            ELSE
            BEGIN
              INSERT INTO dbo.AAC_Alcatraz_permisos_usuario (usuario_id, modulo_clave, permitido, fecha_asignacion, usuario_asigno_id)
              VALUES (@usuarioId, @moduloClave, 1, GETDATE(), @usuarioAsignoId);
            END;
          `);
      }

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async verificarUsuarioTcausr(username: string): Promise<VerificarTcausrResult> {
    const cleanUser = username.trim();
    const pool = await mssql.connect(dbConfig);

    // 1. Verificar si ya está registrado en AAC_Alcatraz_usuarios
    const resAac = await pool
      .request()
      .input("user", mssql.VarChar(50), cleanUser)
      .query(`SELECT id, [user] FROM dbo.AAC_Alcatraz_usuarios WHERE UPPER(RTRIM([user])) = UPPER(@user);`);

    const yaRegistrado = resAac.recordset.length > 0;

    // 2. Verificar en dbo.tcausr
    let existeEnTcausr = false;
    let datosTcausr: { nombre: string; nombreCompleto: string; puesto: string } | undefined = undefined;

    try {
      const resTca = await pool
        .request()
        .input("user", mssql.VarChar(50), cleanUser)
        .query(`
          SELECT TOP 1 
            RTRIM(nombre) AS nombre, 
            RTRIM(nombre_lar) AS nombre_lar, 
            RTRIM(puesto) AS puesto
          FROM dbo.tcausr
          WHERE UPPER(RTRIM(nombre)) = UPPER(@user);
        `);

      if (resTca.recordset.length > 0) {
        existeEnTcausr = true;
        const row = resTca.recordset[0];
        datosTcausr = {
          nombre: row.nombre,
          nombreCompleto: row.nombre_lar || row.nombre,
          puesto: row.puesto || "",
        };
      }
    } catch (errTca) {
      console.warn("Error al consultar dbo.tcausr:", errTca);
    }

    return {
      existeEnTcausr,
      yaRegistrado,
      datosTcausr,
    };
  }

  async crearUsuarioConPermisos(
    data: CrearUsuarioRequest
  ): Promise<{ id: number; username: string }> {
    const cleanUser = data.username.trim();
    const pool = await mssql.connect(dbConfig);

    // Validar si ya existe
    const resExist = await pool
      .request()
      .input("user", mssql.VarChar(50), cleanUser)
      .query(`SELECT id FROM dbo.AAC_Alcatraz_usuarios WHERE UPPER(RTRIM([user])) = UPPER(@user);`);

    if (resExist.recordset.length > 0) {
      throw new Error(`El usuario "${cleanUser}" ya se encuentra registrado en el sistema.`);
    }

    let passwordFinal = "";
    let origen = "SISTEMA";
    let debeCambiarPassword = 0;

    if (data.esDeTcausr) {
      // Buscar la contraseña en tcausr
      const resTca = await pool
        .request()
        .input("user", mssql.VarChar(50), cleanUser)
        .query(`SELECT TOP 1 RTRIM(pwd) AS pwd FROM dbo.tcausr WHERE UPPER(RTRIM(nombre)) = UPPER(@user);`);

      if (resTca.recordset.length === 0) {
        throw new Error(`El usuario "${cleanUser}" no fue encontrado en la tabla tcausr.`);
      }

      passwordFinal = resTca.recordset[0].pwd;
      origen = "TCAUSR";
      debeCambiarPassword = 0;
    } else {
      if (!data.passwordTemporal || data.passwordTemporal.trim().length < 4) {
        throw new Error("Debe proporcionar una contraseña temporal válida de al menos 4 caracteres.");
      }
      passwordFinal = data.passwordTemporal.trim();
      origen = "SISTEMA";
      debeCambiarPassword = 1;
    }

    const transaction = new mssql.Transaction(pool);
    try {
      await transaction.begin();

      // 1. Insertar el usuario
      const reqUser = new mssql.Request(transaction);
      const resInsert = await reqUser
        .input("user", mssql.VarChar(50), cleanUser)
        .input("password", mssql.VarChar(100), passwordFinal)
        .input("rol_id", mssql.SmallInt, data.rol_id)
        .input("origen", mssql.VarChar(20), origen)
        .input("debeCambiar", mssql.Bit, debeCambiarPassword)
        .input("usuarioCreo", mssql.VarChar(50), data.usuarioCreo || "ADMIN")
        .query(`
          INSERT INTO dbo.AAC_Alcatraz_usuarios (
            [user], password, rol_id, activo, borrar, origen, debe_cambiar_password, created_at, user_create
          )
          VALUES (
            @user, @password, @rol_id, 1, 0, @origen, @debeCambiar, GETDATE(), @usuarioCreo
          );
          SELECT SCOPE_IDENTITY() AS id;
        `);

      const nuevoId = resInsert.recordset[0].id;

      // 2. Insertar permisos
      if (data.modulos && data.modulos.length > 0) {
        for (const clave of data.modulos) {
          const reqPerm = new mssql.Request(transaction);
          await reqPerm
            .input("usuarioId", mssql.Int, nuevoId)
            .input("moduloClave", mssql.VarChar(50), clave)
            .query(`
              INSERT INTO dbo.AAC_Alcatraz_permisos_usuario (
                usuario_id, modulo_clave, permitido, fecha_asignacion
              )
              VALUES (
                @usuarioId, @moduloClave, 1, GETDATE()
              );
            `);
        }
      }

      await transaction.commit();
      return { id: nuevoId, username: cleanUser };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async cambiarPasswordPrimerIngreso(usuarioId: number, nuevoPassword: string): Promise<boolean> {
    const pool = await mssql.connect(dbConfig);
    const result = await pool
      .request()
      .input("id", mssql.Int, usuarioId)
      .input("pwd", mssql.VarChar(100), nuevoPassword.trim())
      .query(`
        UPDATE dbo.AAC_Alcatraz_usuarios
        SET password = @pwd, debe_cambiar_password = 0, updated_at = GETDATE(), user_update = 'FIRST_LOGIN'
        WHERE id = @id;
      `);
    return (result.rowsAffected[0] ?? 0) > 0;
  }
}
