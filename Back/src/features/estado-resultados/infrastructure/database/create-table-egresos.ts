// =========================================================================
// MÓDULO: ESTADO DE RESULTADOS Y EGRESOS - CASA ALCATRAZ
// COMPATIBLE CON: SQL SERVER 2008 R2 / 2012+ (SIN SENTENCIAS 'GO')
// =========================================================================

export const createEgresosTable = `
  -- 1. TABLA: CATEGORÍAS DE EGRESOS (4 CATEGORÍAS BASE)
  IF OBJECT_ID('dbo.AAC_Alcatraz_egreso_categorias', 'U') IS NULL
  BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_egreso_categorias](
      [id] TINYINT IDENTITY(1,1) NOT NULL,
      [clave] VARCHAR(30) NOT NULL,
      [nombre] VARCHAR(100) NOT NULL,
      [orden] TINYINT NOT NULL,
      [activo] BIT NOT NULL DEFAULT 1,
      [created_at] DATETIME NOT NULL DEFAULT GETDATE(),
      CONSTRAINT [AAC_Alcatraz_egreso_categorias_pkey] PRIMARY KEY ([id]),
      CONSTRAINT [AAC_Alcatraz_egreso_categorias_clave_unique] UNIQUE ([clave])
    );
  END;

  -- 2. TABLA: CONCEPTOS DE EGRESOS (CATÁLOGO DINÁMICO)
  IF OBJECT_ID('dbo.AAC_Alcatraz_egreso_conceptos', 'U') IS NULL
  BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_egreso_conceptos](
      [id] INT IDENTITY(1,1) NOT NULL,
      [categoria_id] TINYINT NOT NULL,
      [nombre] VARCHAR(150) NOT NULL,
      [descripcion] VARCHAR(255) NULL,
      [es_sistema] BIT NOT NULL DEFAULT 0,
      [activo] BIT NOT NULL DEFAULT 1,
      [user_create_id] INT NOT NULL,
      [created_at] DATETIME NOT NULL DEFAULT GETDATE(),
      [updated_at] DATETIME NULL,
      CONSTRAINT [AAC_Alcatraz_egreso_conceptos_pkey] PRIMARY KEY ([id])
    );
  END;

  -- Constraint unique compuesto para evitar conceptos duplicados dentro de la misma categoría
  IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_AAC_Alcatraz_concepto_cat_nombre')
  BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UQ_AAC_Alcatraz_concepto_cat_nombre]
      ON [dbo].[AAC_Alcatraz_egreso_conceptos] ([categoria_id], [nombre]);
  END;

  -- 3. TABLA: TRANSACCIONES DE EGRESOS
  IF OBJECT_ID('dbo.AAC_Alcatraz_egresos', 'U') IS NULL
  BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_egresos](
      [id] INT IDENTITY(1,1) NOT NULL,
      [concepto_id] INT NOT NULL,
      [monto] MONEY NOT NULL,
      [fecha_gasto] DATE NOT NULL,
      [referencia_comprobante] VARCHAR(100) NULL,
      [descripcion] VARCHAR(500) NULL,
      [origen_dinero_id] INT NULL,
      [user_create_id] INT NOT NULL,
      [created_at] DATETIME NOT NULL DEFAULT GETDATE(),
      [user_update_id] INT NULL,
      [updated_at] DATETIME NULL,
      CONSTRAINT [AAC_Alcatraz_egresos_pkey] PRIMARY KEY ([id]),
      CONSTRAINT [AAC_Alcatraz_egresos_chk_monto] CHECK ([monto] > 0)
    );
  END
  ELSE
  BEGIN
    -- Migración idempotente: Si existe observaciones y no descripcion, renombrar
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'AAC_Alcatraz_egresos' AND COLUMN_NAME = 'descripcion')
    BEGIN
      IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'AAC_Alcatraz_egresos' AND COLUMN_NAME = 'observaciones')
      BEGIN
        EXEC sp_rename 'dbo.AAC_Alcatraz_egresos.observaciones', 'descripcion', 'COLUMN';
      END
      ELSE
      BEGIN
        ALTER TABLE [dbo].[AAC_Alcatraz_egresos] ADD [descripcion] VARCHAR(500) NULL;
      END
    END
  END;

  -- Índice para acelerar consultas por rango de fechas (optimización Estado de Resultados)
  IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AAC_Alcatraz_egresos_fecha')
  BEGIN
    CREATE NONCLUSTERED INDEX [IX_AAC_Alcatraz_egresos_fecha] 
      ON [dbo].[AAC_Alcatraz_egresos] ([fecha_gasto]) 
      INCLUDE ([concepto_id], [monto]);
  END;

  -- 4. TABLA: PROVISIONES DE ISR
  IF OBJECT_ID('dbo.AAC_Alcatraz_provisiones_isr', 'U') IS NULL
  BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_provisiones_isr](
      [id] INT IDENTITY(1,1) NOT NULL,
      [fecha_provision] DATE NOT NULL,
      [ejercicio_ano] SMALLINT NOT NULL,
      [periodo_mes] TINYINT NULL,
      [monto] MONEY NOT NULL,
      [observaciones] VARCHAR(255) NULL,
      [user_create_id] INT NOT NULL,
      [created_at] DATETIME NOT NULL DEFAULT GETDATE(),
      [updated_at] DATETIME NULL,
      CONSTRAINT [AAC_Alcatraz_provisiones_isr_pkey] PRIMARY KEY ([id]),
      CONSTRAINT [AAC_Alcatraz_provisiones_isr_chk_monto] CHECK ([monto] >= 0)
    );
  END;

  IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AAC_Alcatraz_provisiones_isr_fecha')
  BEGIN
    CREATE NONCLUSTERED INDEX [IX_AAC_Alcatraz_provisiones_isr_fecha] 
      ON [dbo].[AAC_Alcatraz_provisiones_isr] ([fecha_provision]);
  END;

  -- -------------------------------------------------------------------------
  -- VALIDACIÓN DE LLAVES FORÁNEAS (FK)
  -- -------------------------------------------------------------------------
  IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_egreso_conceptos_fkey_cat')
  BEGIN
    ALTER TABLE [dbo].[AAC_Alcatraz_egreso_conceptos] 
      ADD CONSTRAINT [AAC_Alcatraz_egreso_conceptos_fkey_cat] 
      FOREIGN KEY ([categoria_id]) REFERENCES [dbo].[AAC_Alcatraz_egreso_categorias]([id]);
  END;

  IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_egresos_fkey_concepto')
  BEGIN
    ALTER TABLE [dbo].[AAC_Alcatraz_egresos] 
      ADD CONSTRAINT [AAC_Alcatraz_egresos_fkey_concepto] 
      FOREIGN KEY ([concepto_id]) REFERENCES [dbo].[AAC_Alcatraz_egreso_conceptos]([id]);
  END;

  IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_egresos_fkey_origen')
  BEGIN
    ALTER TABLE [dbo].[AAC_Alcatraz_egresos] 
      ADD CONSTRAINT [AAC_Alcatraz_egresos_fkey_origen] 
      FOREIGN KEY ([origen_dinero_id]) REFERENCES [dbo].[AAC_Alcatraz_origen_dinero]([id]);
  END;

  -- -------------------------------------------------------------------------
  -- SEEDS INICIALES SEGUROS (4 CATEGORÍAS BASE)
  -- -------------------------------------------------------------------------
  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_egreso_categorias] WHERE [clave] = 'VENTA')
    INSERT INTO [dbo].[AAC_Alcatraz_egreso_categorias] ([clave], [nombre], [orden]) VALUES ('VENTA', 'Gastos de Venta', 1);

  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_egreso_categorias] WHERE [clave] = 'ADMINISTRACION')
    INSERT INTO [dbo].[AAC_Alcatraz_egreso_categorias] ([clave], [nombre], [orden]) VALUES ('ADMINISTRACION', 'Gastos de Administración', 2);

  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_egreso_categorias] WHERE [clave] = 'FINANCIEROS')
    INSERT INTO [dbo].[AAC_Alcatraz_egreso_categorias] ([clave], [nombre], [orden]) VALUES ('FINANCIEROS', 'Gastos Financieros', 3);

  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_egreso_categorias] WHERE [clave] = 'SUELDOS_SALARIOS')
    INSERT INTO [dbo].[AAC_Alcatraz_egreso_categorias] ([clave], [nombre], [orden]) VALUES ('SUELDOS_SALARIOS', 'Gastos por sueldos y salarios', 4);

  -- -------------------------------------------------------------------------
  -- SEEDS INICIALES SEGUROS (CONCEPTOS PRECARGADOS)
  -- -------------------------------------------------------------------------
  -- Categoría: Gastos de Venta
  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_egreso_conceptos] WHERE [nombre] = 'Energia Electrica')
    INSERT INTO [dbo].[AAC_Alcatraz_egreso_conceptos] ([categoria_id], [nombre], [es_sistema], [user_create_id])
    SELECT id, 'Energia Electrica', 1, 1 FROM [dbo].[AAC_Alcatraz_egreso_categorias] WHERE clave = 'VENTA';

  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_egreso_conceptos] WHERE [nombre] = 'Telefono')
    INSERT INTO [dbo].[AAC_Alcatraz_egreso_conceptos] ([categoria_id], [nombre], [es_sistema], [user_create_id])
    SELECT id, 'Telefono', 1, 1 FROM [dbo].[AAC_Alcatraz_egreso_categorias] WHERE clave = 'VENTA';

  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_egreso_conceptos] WHERE [nombre] = 'Agua')
    INSERT INTO [dbo].[AAC_Alcatraz_egreso_conceptos] ([categoria_id], [nombre], [es_sistema], [user_create_id])
    SELECT id, 'Agua', 1, 1 FROM [dbo].[AAC_Alcatraz_egreso_categorias] WHERE clave = 'VENTA';

  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_egreso_conceptos] WHERE [nombre] = 'Comisión plataformas')
    INSERT INTO [dbo].[AAC_Alcatraz_egreso_conceptos] ([categoria_id], [nombre], [es_sistema], [user_create_id])
    SELECT id, 'Comisión plataformas', 1, 1 FROM [dbo].[AAC_Alcatraz_egreso_categorias] WHERE clave = 'VENTA';

  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_egreso_conceptos] WHERE [nombre] = 'Comisión Jardin')
    INSERT INTO [dbo].[AAC_Alcatraz_egreso_conceptos] ([categoria_id], [nombre], [es_sistema], [user_create_id])
    SELECT id, 'Comisión Jardin', 1, 1 FROM [dbo].[AAC_Alcatraz_egreso_categorias] WHERE clave = 'VENTA';

  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_egreso_conceptos] WHERE [nombre] = 'Mantenimientos y conservación')
    INSERT INTO [dbo].[AAC_Alcatraz_egreso_conceptos] ([categoria_id], [nombre], [es_sistema], [user_create_id])
    SELECT id, 'Mantenimientos y conservación', 1, 1 FROM [dbo].[AAC_Alcatraz_egreso_categorias] WHERE clave = 'VENTA';

  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_egreso_conceptos] WHERE [nombre] = 'Fumigación y control de plagas')
    INSERT INTO [dbo].[AAC_Alcatraz_egreso_conceptos] ([categoria_id], [nombre], [es_sistema], [user_create_id])
    SELECT id, 'Fumigación y control de plagas', 1, 1 FROM [dbo].[AAC_Alcatraz_egreso_categorias] WHERE clave = 'VENTA';

  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_egreso_conceptos] WHERE [nombre] = 'Articulos de limpieza')
    INSERT INTO [dbo].[AAC_Alcatraz_egreso_conceptos] ([categoria_id], [nombre], [es_sistema], [user_create_id])
    SELECT id, 'Articulos de limpieza', 1, 1 FROM [dbo].[AAC_Alcatraz_egreso_categorias] WHERE clave = 'VENTA';

  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_egreso_conceptos] WHERE [nombre] = 'Permisos')
    INSERT INTO [dbo].[AAC_Alcatraz_egreso_conceptos] ([categoria_id], [nombre], [es_sistema], [user_create_id])
    SELECT id, 'Permisos', 1, 1 FROM [dbo].[AAC_Alcatraz_egreso_categorias] WHERE clave = 'VENTA';

  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_egreso_conceptos] WHERE [nombre] = 'Publicidad')
    INSERT INTO [dbo].[AAC_Alcatraz_egreso_conceptos] ([categoria_id], [nombre], [es_sistema], [user_create_id])
    SELECT id, 'Publicidad', 1, 1 FROM [dbo].[AAC_Alcatraz_egreso_categorias] WHERE clave = 'VENTA';

  -- Categoría: Gastos de Administración
  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_egreso_conceptos] WHERE [nombre] = 'Papeleria')
    INSERT INTO [dbo].[AAC_Alcatraz_egreso_conceptos] ([categoria_id], [nombre], [es_sistema], [user_create_id])
    SELECT id, 'Papeleria', 1, 1 FROM [dbo].[AAC_Alcatraz_egreso_categorias] WHERE clave = 'ADMINISTRACION';

  -- Categoría: Gastos Financieros
  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_egreso_conceptos] WHERE [nombre] = 'Comisiones Bancarias')
    INSERT INTO [dbo].[AAC_Alcatraz_egreso_conceptos] ([categoria_id], [nombre], [es_sistema], [user_create_id])
    SELECT id, 'Comisiones Bancarias', 1, 1 FROM [dbo].[AAC_Alcatraz_egreso_categorias] WHERE clave = 'FINANCIEROS';

  -- Categoría: Gastos por Sueldos y Salarios
  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_egreso_conceptos] WHERE [nombre] = 'Sueldos y salarios')
    INSERT INTO [dbo].[AAC_Alcatraz_egreso_conceptos] ([categoria_id], [nombre], [es_sistema], [user_create_id])
    SELECT id, 'Sueldos y salarios', 1, 1 FROM [dbo].[AAC_Alcatraz_egreso_categorias] WHERE clave = 'SUELDOS_SALARIOS';

  -- 5. TABLA: BITÁCORA DE EDICIONES DE EGRESOS (AUDITORÍA COMPATIBLE CON SQL SERVER 2008 R2)
  IF OBJECT_ID('dbo.AAC_Alcatraz_bitacora_egresos', 'U') IS NULL
  BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_bitacora_egresos](
      [id] INT IDENTITY(1,1) NOT NULL,
      [egreso_id] INT NOT NULL,
      [accion] VARCHAR(50) NOT NULL,
      [datos_modificados] VARCHAR(MAX) NOT NULL,
      [usuario_id] INT NOT NULL,
      [usuario_nombre] VARCHAR(100) NOT NULL,
      [fecha_modificacion] DATETIME NOT NULL DEFAULT GETDATE(),
      CONSTRAINT [AAC_Alcatraz_bitacora_egresos_pkey] PRIMARY KEY ([id])
    );
  END;

  IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AAC_Alcatraz_bitacora_egresos_egreso_id')
  BEGIN
    CREATE NONCLUSTERED INDEX [IX_AAC_Alcatraz_bitacora_egresos_egreso_id]
      ON [dbo].[AAC_Alcatraz_bitacora_egresos] ([egreso_id]);
  END;
`;
