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
      CONSTRAINT [AAC_Alcatraz_rol_usuario_pkey] PRIMARY KEY(id)
    )
  END;

  -- 2. Crear tabla de Usuarios si no existe
  IF OBJECT_ID('dbo.AAC_Alcatraz_usuarios', 'U') IS NULL
  BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_usuarios](
      id int IDENTITY NOT NULL,
      [user] varchar(50) NOT NULL,
      password varchar(100) NOT NULL,
      rol_id smallint NOT NULL,
      activo bit NOT NULL,
      created_at date NOT NULL,
      updated_at date DEFAULT NULL,
      user_create varchar(50) NOT NULL,
      user_update varchar(50) DEFAULT NULL,
      origen varchar(20) NOT NULL DEFAULT 'SISTEMA',
      CONSTRAINT [AAC_Alcatrz_usuarios_pkey] PRIMARY KEY(id)
    )
  END;

  -- 2.1 Asegurar que las columnas borrar y origen existan
  IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.AAC_Alcatraz_usuarios') 
      AND name = 'borrar'
  )
  BEGIN
    ALTER TABLE [dbo].[AAC_Alcatraz_usuarios] ADD [borrar] bit NOT NULL DEFAULT 0;
  END;

  IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.AAC_Alcatraz_usuarios') 
      AND name = 'origen'
  )
  BEGIN
    ALTER TABLE [dbo].[AAC_Alcatraz_usuarios] ADD [origen] varchar(20) NOT NULL DEFAULT 'SISTEMA';
  END;

  IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.AAC_Alcatraz_usuarios') 
      AND name = 'debe_cambiar_password'
  )
  BEGIN
    ALTER TABLE [dbo].[AAC_Alcatraz_usuarios] ADD [debe_cambiar_password] bit NOT NULL DEFAULT 0;
  END;

  -- 2.2 Longitudes seguras
  IF COL_LENGTH('dbo.AAC_Alcatraz_usuarios', 'user') < 50
  BEGIN
    ALTER TABLE dbo.AAC_Alcatraz_usuarios ALTER COLUMN [user] varchar(50) NOT NULL;
  END;

  IF COL_LENGTH('dbo.AAC_Alcatraz_usuarios', 'password') < 100
  BEGIN
    ALTER TABLE dbo.AAC_Alcatraz_usuarios ALTER COLUMN [password] varchar(100) NOT NULL;
  END;

  -- 3. Crear Llave Foránea solo si no existe
  IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_usuarios_fkey')
  BEGIN
    ALTER TABLE [dbo].[AAC_Alcatraz_usuarios]
    ADD CONSTRAINT [AAC_Alcatraz_usuarios_fkey]
    FOREIGN KEY (rol_id) REFERENCES [dbo].[AAC_Alcatraz_rol_usuario] (id)
  END;

  -- 4. Crear tabla de Catálogo de Módulos
  IF OBJECT_ID('dbo.AAC_Alcatraz_modulos', 'U') IS NULL
  BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_modulos] (
      id int IDENTITY(1,1) NOT NULL,
      clave varchar(50) NOT NULL,
      nombre varchar(100) NOT NULL,
      ruta varchar(100) NOT NULL,
      icono varchar(50) NOT NULL,
      orden int NOT NULL DEFAULT 1,
      activo bit NOT NULL DEFAULT 1,
      CONSTRAINT [PK_AAC_Alcatraz_modulos] PRIMARY KEY (id),
      CONSTRAINT [UQ_AAC_Alcatraz_modulos_clave] UNIQUE (clave)
    );
  END;

  -- 5. Crear tabla de Permisos por Usuario
  IF OBJECT_ID('dbo.AAC_Alcatraz_permisos_usuario', 'U') IS NULL
  BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_permisos_usuario] (
      id int IDENTITY(1,1) NOT NULL,
      usuario_id int NOT NULL,
      modulo_clave varchar(50) NOT NULL,
      permitido bit NOT NULL DEFAULT 1,
      fecha_asignacion datetime NOT NULL DEFAULT GETDATE(),
      usuario_asigno_id int NULL,
      CONSTRAINT [PK_AAC_Alcatraz_permisos_usuario] PRIMARY KEY (id),
      CONSTRAINT [UQ_AAC_usuario_modulo] UNIQUE (usuario_id, modulo_clave),
      CONSTRAINT [FK_AAC_permisos_usuario] FOREIGN KEY (usuario_id) REFERENCES [dbo].[AAC_Alcatraz_usuarios](id)
    );
  END;

  -- 6. Inserts Iniciales Idempotentes (No se duplican al reiniciar el servidor)
  
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
      ([user], password, rol_id, activo, created_at, updated_at, user_create, user_update, origen)
    VALUES 
      ('sistemas', '1', 1, 1, GETDATE(), NULL, 'sistemas', NULL, 'SISTEMA');
  END;
`;
