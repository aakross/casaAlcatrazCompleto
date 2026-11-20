-- =============================================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS: CASA ALCATRAZ
-- Motor compatible: SQL Server 2008 R2 / 2012 / 2016 / 2019 / 2022
-- =============================================================================
SET NOCOUNT ON;
GO

-- -----------------------------------------------------------------------------
-- TABLA: [dbo].[AAC_Alcatraz_rol_usuario]
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AAC_Alcatraz_rol_usuario', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_rol_usuario] (
    [id] SMALLINT IDENTITY(1,1) NOT NULL,
    [descripcion] VARCHAR(50) NOT NULL,
    [user_id_create] VARCHAR(20) NOT NULL,
    [created_at] DATE NOT NULL,
    [user_updated] VARCHAR(20) NULL,
    [updated_at] DATE NULL,
    CONSTRAINT [PK_AAC_Alcatraz_rol_usuario] PRIMARY KEY ([id])
    );
END;
GO

-- -----------------------------------------------------------------------------
-- TABLA: [dbo].[AAC_Alcatraz_usuarios]
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AAC_Alcatraz_usuarios', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_usuarios] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [user] VARCHAR(20) NOT NULL,
    [password] VARCHAR(50) NOT NULL,
    [rol_id] SMALLINT NOT NULL,
    [activo] BIT NOT NULL,
    [created_at] DATE NOT NULL,
    [updated_at] DATE NULL DEFAULT (NULL),
    [user_create] VARCHAR(50) NOT NULL,
    [user_update] VARCHAR(50) NULL DEFAULT (NULL),
    [borrar] BIT NOT NULL DEFAULT ((0)),
    CONSTRAINT [PK_AAC_Alcatraz_usuarios] PRIMARY KEY ([id])
    );
END;
GO

-- -----------------------------------------------------------------------------
-- TABLA: [dbo].[AAC_Alcatraz_clientes]
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AAC_Alcatraz_clientes', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_clientes] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [nombre] VARCHAR(50) NOT NULL,
    [apellido] VARCHAR(50) NOT NULL,
    [telefono] VARCHAR(20) NULL,
    [email] VARCHAR(100) NULL,
    [user_create_id] SMALLINT NOT NULL,
    [user_updated_id] SMALLINT NULL,
    [created_at] DATE NOT NULL,
    [updated_at] DATE NULL,
    CONSTRAINT [PK_AAC_Alcatraz_clientes] PRIMARY KEY ([id])
    );
END;
GO

-- -----------------------------------------------------------------------------
-- TABLA: [dbo].[AAC_Alcatraz_origen_reserva]
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AAC_Alcatraz_origen_reserva', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_origen_reserva] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [nombre] CHAR(20) NOT NULL,
    [descripcion] CHAR(50) NOT NULL,
    [created_at] DATE NOT NULL,
    [updated_at] DATE NULL,
    [user_create_id] SMALLINT NOT NULL,
    [user_updated_id] SMALLINT NULL,
    CONSTRAINT [PK_AAC_Alcatraz_origen_reserva] PRIMARY KEY ([id])
    );
END;
GO

-- -----------------------------------------------------------------------------
-- TABLA: [dbo].[AAC_Alcatraz_origen_dinero]
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AAC_Alcatraz_origen_dinero', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_origen_dinero] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [nombre] CHAR(20) NOT NULL,
    [descripcion] CHAR(50) NOT NULL,
    [created_at] DATE NOT NULL,
    [updated_at] DATE NULL,
    [user_create_id] SMALLINT NOT NULL,
    [user_updated_id] SMALLINT NULL,
    CONSTRAINT [PK_AAC_Alcatraz_origen_dinero] PRIMARY KEY ([id])
    );
END;
GO

-- -----------------------------------------------------------------------------
-- TABLA: [dbo].[AAC_Alcatraz_concepto_pago]
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AAC_Alcatraz_concepto_pago', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_concepto_pago] (
    [id] SMALLINT IDENTITY(1,1) NOT NULL,
    [descripcion] CHAR(50) NOT NULL,
    [created_at] DATE NOT NULL,
    [user_create_id] SMALLINT NOT NULL,
    [user_updated_id] SMALLINT NULL,
    CONSTRAINT [PK_AAC_Alcatraz_concepto_pago] PRIMARY KEY ([id])
    );
END;
GO

-- -----------------------------------------------------------------------------
-- TABLA: [dbo].[AAC_Alcatraz_estado_reservacion]
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AAC_Alcatraz_estado_reservacion', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_estado_reservacion] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [descripcion] VARCHAR(50) NOT NULL,
    [user_create] INT NOT NULL,
    [created_at] DATE NOT NULL,
    [user_update] INT NULL DEFAULT (NULL),
    [updated_at] DATE NULL DEFAULT (NULL),
    CONSTRAINT [PK_AAC_Alcatraz_estado_reservacion] PRIMARY KEY ([id])
    );
END;
GO

-- -----------------------------------------------------------------------------
-- TABLA: [dbo].[AAC_Alcatraz_reservaciones]
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AAC_Alcatraz_reservaciones', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_reservaciones] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [cliente_id] INT NOT NULL,
    [estado_reservacion_id] INT NOT NULL,
    [origen_reserva_id] INT NOT NULL,
    [fecha_inicio] DATETIME NOT NULL,
    [fecha_fin] DATETIME NOT NULL,
    [total_dias_reservados] INT NOT NULL,
    [monto_total] MONEY NOT NULL,
    [personas_hospedadas] TINYINT NULL DEFAULT ((1)),
    [user_create] INT NOT NULL,
    [created_at] DATE NOT NULL,
    [user_update] INT NULL DEFAULT (NULL),
    [updated_at] DATE NULL DEFAULT (NULL),
    [precio_noche] MONEY NULL,
    [porcentaje_comision] DECIMAL(5, 2) NULL,
    [monto_comision] MONEY NULL,
    [monto_neto] MONEY NULL,
    [monto_garantia] MONEY NULL,
    CONSTRAINT [PK_AAC_Alcatraz_reservaciones] PRIMARY KEY ([id])
    );
END;
GO

-- -----------------------------------------------------------------------------
-- TABLA: [dbo].[AAC_Alcatraz_reservacion_extras]
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AAC_Alcatraz_reservacion_extras', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_reservacion_extras] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [reservacion_id] INT NOT NULL,
    [concepto] VARCHAR(100) NOT NULL,
    [monto] MONEY NOT NULL,
    [user_create] INT NOT NULL,
    [created_at] DATE NOT NULL,
    [cantidad] INT NOT NULL DEFAULT ((1)),
    [dias] INT NOT NULL DEFAULT ((1)),
    [precio_unitario_noche] MONEY NOT NULL DEFAULT ((0)),
    [porcentaje_comision] DECIMAL(5, 2) NULL,
    [monto_comision] MONEY NULL,
    [tipo_evento] VARCHAR(100) NULL,
    CONSTRAINT [PK_AAC_Alcatraz_reservacion_extras] PRIMARY KEY ([id])
    );
END;
GO

-- -----------------------------------------------------------------------------
-- TABLA: [dbo].[AAC_Alcatraz_pagos_cliente]
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AAC_Alcatraz_pagos_cliente', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_pagos_cliente] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [origen_dinero_id] INT NOT NULL,
    [reservacion_id] INT NOT NULL,
    [concepto_pago_id] SMALLINT NOT NULL,
    [monto_bruto] MONEY NOT NULL,
    [aplica_comision] BIT NOT NULL,
    [monto_comision] MONEY NOT NULL,
    [monto_neto] MONEY NULL,
    [user_create] INT NOT NULL,
    [created_at] DATE NOT NULL,
    [user_update] INT NULL DEFAULT (NULL),
    [updated_at] DATE NULL DEFAULT (NULL),
    [fecha_deposito] DATE NULL,
    [observaciones] VARCHAR(200) NULL,
    CONSTRAINT [PK_AAC_Alcatraz_pagos_cliente] PRIMARY KEY ([id])
    );
END;
GO

-- -----------------------------------------------------------------------------
-- TABLA: [dbo].[AAC_Alcatraz_bitacora_borrado]
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AAC_Alcatraz_bitacora_borrado', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_bitacora_borrado] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [tabla_afectada] VARCHAR(100) NOT NULL,
    [registro_id] INT NOT NULL,
    [datos_eliminados] TEXT NOT NULL,
    [usuario_id] INT NULL,
    [fecha_borrado] DATETIME NOT NULL DEFAULT (getdate()),
    [accion] VARCHAR(20) NOT NULL DEFAULT ('BORRADO'),
    CONSTRAINT [PK_AAC_Alcatraz_bitacora_borrado] PRIMARY KEY ([id])
    );
END;
GO

-- -----------------------------------------------------------------------------
-- TABLA: [dbo].[AAC_Alcatraz_egreso_categorias]
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AAC_Alcatraz_egreso_categorias', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_egreso_categorias] (
    [id] TINYINT IDENTITY(1,1) NOT NULL,
    [clave] VARCHAR(30) NOT NULL,
    [nombre] VARCHAR(100) NOT NULL,
    [orden] TINYINT NOT NULL,
    [activo] BIT NOT NULL DEFAULT ((1)),
    [created_at] DATETIME NOT NULL DEFAULT (getdate()),
    CONSTRAINT [PK_AAC_Alcatraz_egreso_categorias] PRIMARY KEY ([id])
    );
END;
GO

-- -----------------------------------------------------------------------------
-- TABLA: [dbo].[AAC_Alcatraz_egreso_conceptos]
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AAC_Alcatraz_egreso_conceptos', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_egreso_conceptos] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [categoria_id] TINYINT NOT NULL,
    [nombre] VARCHAR(150) NOT NULL,
    [descripcion] VARCHAR(255) NULL,
    [es_sistema] BIT NOT NULL DEFAULT ((0)),
    [activo] BIT NOT NULL DEFAULT ((1)),
    [user_create_id] INT NOT NULL,
    [created_at] DATETIME NOT NULL DEFAULT (getdate()),
    [updated_at] DATETIME NULL,
    CONSTRAINT [PK_AAC_Alcatraz_egreso_conceptos] PRIMARY KEY ([id])
    );
END;
GO

-- -----------------------------------------------------------------------------
-- TABLA: [dbo].[AAC_Alcatraz_egresos]
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AAC_Alcatraz_egresos', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_egresos] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [concepto_id] INT NOT NULL,
    [monto] MONEY NOT NULL,
    [fecha_gasto] DATE NOT NULL,
    [referencia_comprobante] VARCHAR(100) NULL,
    [descripcion] VARCHAR(500) NULL,
    [origen_dinero_id] INT NULL,
    [user_create_id] INT NOT NULL,
    [created_at] DATETIME NOT NULL DEFAULT (getdate()),
    [user_update_id] INT NULL,
    [updated_at] DATETIME NULL,
    CONSTRAINT [PK_AAC_Alcatraz_egresos] PRIMARY KEY ([id])
    );
END;
GO

-- -----------------------------------------------------------------------------
-- TABLA: [dbo].[AAC_Alcatraz_bitacora_egresos]
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AAC_Alcatraz_bitacora_egresos', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_bitacora_egresos] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [egreso_id] INT NOT NULL,
    [accion] VARCHAR(50) NOT NULL,
    [datos_modificados] VARCHAR(MAX) NOT NULL,
    [usuario_id] INT NOT NULL,
    [usuario_nombre] VARCHAR(100) NOT NULL,
    [fecha_modificacion] DATETIME NOT NULL DEFAULT (getdate()),
    CONSTRAINT [PK_AAC_Alcatraz_bitacora_egresos] PRIMARY KEY ([id])
    );
END;
GO

-- -----------------------------------------------------------------------------
-- TABLA: [dbo].[AAC_Alcatraz_provisiones_isr]
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.AAC_Alcatraz_provisiones_isr', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_provisiones_isr] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [fecha_provision] DATE NOT NULL,
    [ejercicio_ano] SMALLINT NOT NULL,
    [periodo_mes] TINYINT NULL,
    [monto] MONEY NOT NULL,
    [observaciones] VARCHAR(255) NULL,
    [user_create_id] INT NOT NULL,
    [created_at] DATETIME NOT NULL DEFAULT (getdate()),
    [updated_at] DATETIME NULL,
    CONSTRAINT [PK_AAC_Alcatraz_provisiones_isr] PRIMARY KEY ([id])
    );
END;
GO

-- =============================================================================
-- LLAVES FORÁNEAS (FOREIGN KEYS)
-- =============================================================================
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_usuarios_fkey')
BEGIN
    ALTER TABLE [dbo].[AAC_Alcatraz_usuarios]
    ADD CONSTRAINT [AAC_Alcatraz_usuarios_fkey] FOREIGN KEY ([rol_id]) REFERENCES [dbo].[AAC_Alcatraz_rol_usuario] ([id]);
END;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_reservaciones_fkey1')
BEGIN
    ALTER TABLE [dbo].[AAC_Alcatraz_reservaciones]
    ADD CONSTRAINT [AAC_Alcatraz_reservaciones_fkey1] FOREIGN KEY ([cliente_id]) REFERENCES [dbo].[AAC_Alcatraz_clientes] ([id]);
END;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_reservaciones_fkey')
BEGIN
    ALTER TABLE [dbo].[AAC_Alcatraz_reservaciones]
    ADD CONSTRAINT [AAC_Alcatraz_reservaciones_fkey] FOREIGN KEY ([estado_reservacion_id]) REFERENCES [dbo].[AAC_Alcatraz_estado_reservacion] ([id]);
END;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_reservaciones_fkey2')
BEGIN
    ALTER TABLE [dbo].[AAC_Alcatraz_reservaciones]
    ADD CONSTRAINT [AAC_Alcatraz_reservaciones_fkey2] FOREIGN KEY ([origen_reserva_id]) REFERENCES [dbo].[AAC_Alcatraz_origen_reserva] ([id]);
END;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_reservacion_extras_fkey')
BEGIN
    ALTER TABLE [dbo].[AAC_Alcatraz_reservacion_extras]
    ADD CONSTRAINT [AAC_Alcatraz_reservacion_extras_fkey] FOREIGN KEY ([reservacion_id]) REFERENCES [dbo].[AAC_Alcatraz_reservaciones] ([id]);
END;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_pagos_cliente_fkey')
BEGIN
    ALTER TABLE [dbo].[AAC_Alcatraz_pagos_cliente]
    ADD CONSTRAINT [AAC_Alcatraz_pagos_cliente_fkey] FOREIGN KEY ([origen_dinero_id]) REFERENCES [dbo].[AAC_Alcatraz_origen_dinero] ([id]);
END;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_pagos_cliente_fkey1')
BEGIN
    ALTER TABLE [dbo].[AAC_Alcatraz_pagos_cliente]
    ADD CONSTRAINT [AAC_Alcatraz_pagos_cliente_fkey1] FOREIGN KEY ([reservacion_id]) REFERENCES [dbo].[AAC_Alcatraz_reservaciones] ([id]);
END;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_pagos_cliente_fkey2')
BEGIN
    ALTER TABLE [dbo].[AAC_Alcatraz_pagos_cliente]
    ADD CONSTRAINT [AAC_Alcatraz_pagos_cliente_fkey2] FOREIGN KEY ([concepto_pago_id]) REFERENCES [dbo].[AAC_Alcatraz_concepto_pago] ([id]);
END;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_egreso_conceptos_fkey_cat')
BEGIN
    ALTER TABLE [dbo].[AAC_Alcatraz_egreso_conceptos]
    ADD CONSTRAINT [AAC_Alcatraz_egreso_conceptos_fkey_cat] FOREIGN KEY ([categoria_id]) REFERENCES [dbo].[AAC_Alcatraz_egreso_categorias] ([id]);
END;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_egresos_fkey_concepto')
BEGIN
    ALTER TABLE [dbo].[AAC_Alcatraz_egresos]
    ADD CONSTRAINT [AAC_Alcatraz_egresos_fkey_concepto] FOREIGN KEY ([concepto_id]) REFERENCES [dbo].[AAC_Alcatraz_egreso_conceptos] ([id]);
END;
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_egresos_fkey_origen')
BEGIN
    ALTER TABLE [dbo].[AAC_Alcatraz_egresos]
    ADD CONSTRAINT [AAC_Alcatraz_egresos_fkey_origen] FOREIGN KEY ([origen_dinero_id]) REFERENCES [dbo].[AAC_Alcatraz_origen_dinero] ([id]);
END;
GO

