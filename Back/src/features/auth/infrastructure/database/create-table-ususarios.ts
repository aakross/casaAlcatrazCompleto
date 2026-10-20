export const createUsuariosTable = `
  -- 1. Crear tabla de Roles si no existe
  IF OBJECT_ID('dbo.AAC_Alcatraz_rol_usuario', 'U') IS NULL
  BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_rol_usuario](
      id smallint IDENTITY NOT NULL,
      descripcion varchar(50) NOT NULL,
      user_id_create varchar(20) NOT NULL,
      created_at date NOT NULL,
      user_updated varchar(20),
      updated_at date,
      CONSTRAINT [AAC_Alcatraz_rol_usuario_pkey] PRIMARY KEY(id) -- CORREGIDO: Nombre único para Luna Modeler
    )
  END;

  -- 2. Crear tabla de Usuarios si no existe
  IF OBJECT_ID('dbo.AAC_Alcatraz_usuarios', 'U') IS NULL
  BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_usuarios](
      id int IDENTITY NOT NULL,
      [user] varchar(20) NOT NULL,
      password varchar(50) NOT NULL,
      rol_id smallint NOT NULL,
      activo bit NOT NULL,
      created_at date NOT NULL,
      updated_at date DEFAULT NULL,
      user_create varchar(50) NOT NULL,
      user_update varchar(50) DEFAULT NULL,
      CONSTRAINT [AAC_Alcatrz_usuarios_pkey] PRIMARY KEY(id)
    )
  END;

  -- 2.1 Asegurar que la columna borrar exista
  IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.AAC_Alcatraz_usuarios') 
      AND name = 'borrar'
  )
  BEGIN
    ALTER TABLE [dbo].[AAC_Alcatraz_usuarios] ADD [borrar] bit NOT NULL DEFAULT 0;
  END;

  -- 3. Crear Llave Foránea solo si no existe
  IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_usuarios_fkey')
  BEGIN
    ALTER TABLE [dbo].[AAC_Alcatraz_usuarios]
    ADD CONSTRAINT [AAC_Alcatraz_usuarios_fkey]
    FOREIGN KEY (rol_id) REFERENCES [dbo].[AAC_Alcatraz_rol_usuario] (id)
  END;

  -- 4. Inserts Iniciales Idempotentes (No se duplican al reiniciar el servidor)
  
  -- Insertar Rol Direccion (Tomará id = 1 de forma automática)
  IF NOT EXISTS (SELECT TOP 1 * FROM [dbo].[AAC_Alcatraz_rol_usuario] WHERE [descripcion] = 'Usuario de Direccion')
  BEGIN
    INSERT INTO [dbo].[AAC_Alcatraz_rol_usuario] 
      (descripcion, user_id_create, created_at, user_updated, updated_at)
    VALUES 
      ('Usuario de Direccion', 'sistemas', GETDATE(), NULL, NULL);
  END;

  -- Insertar Usuario Sistemas (Apunta al rol_id = 1)
  IF NOT EXISTS (SELECT TOP 1 * FROM [dbo].[AAC_Alcatraz_usuarios] WHERE [user] = 'sistemas')
  BEGIN
    INSERT INTO [dbo].[AAC_Alcatraz_usuarios] 
      ([user], password, rol_id, activo, created_at, updated_at, user_create, user_update)
    VALUES 
      ('sistemas', '1', 1, 1, GETDATE(), NULL, 'sistemas', NULL);
  END;
`;
