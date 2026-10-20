export const createReservasTable = `
  -- =========================================================================
  -- 1. TABLAS MAESTRAS (CATÁLOGOS INDEPENDIENTES)
  -- =========================================================================

  -- Tabla: Clientes
  IF OBJECT_ID('dbo.AAC_Alcatraz_clientes', 'U') IS NULL
  BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_clientes](
      id int IDENTITY NOT NULL,
      nombre varchar(50) NOT NULL,
      apellido varchar(50) NOT NULL,
      telefono varchar(20),
      email varchar(100),
      user_create_id smallint NOT NULL,
      user_updated_id smallint,
      created_at date NOT NULL,
      updated_at date,
      CONSTRAINT [AAC_Alcatraz_clientes_pkey] PRIMARY KEY(id)
    )
  END;

  -- Tabla: Origen Dinero
  IF OBJECT_ID('dbo.AAC_Alcatraz_origen_dinero', 'U') IS NULL
  BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_origen_dinero](
      id int IDENTITY NOT NULL,
      nombre char(20) NOT NULL,
      descripcion char(50) NOT NULL,
      created_at date NOT NULL,
      updated_at date,
      user_create_id smallint NOT NULL,
      user_updated_id smallint,
      CONSTRAINT [AAC_Alcatraz_origen_dinero_pkey] PRIMARY KEY(id)
    )
  END;

  -- Tabla: Concepto Pago
  IF OBJECT_ID('dbo.AAC_Alcatraz_concepto_pago', 'U') IS NULL
  BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_concepto_pago](
      id smallint IDENTITY NOT NULL,
      descripcion char(50) NOT NULL,
      created_at date NOT NULL,
      user_create_id smallint NOT NULL,
      user_updated_id smallint,
      CONSTRAINT [AAC_Alcatraz_concepto_pago_pkey] PRIMARY KEY(id)
    )
  END;

  -- Tabla: Origen Reserva
  IF OBJECT_ID('dbo.AAC_Alcatraz_origen_reserva', 'U') IS NULL
  BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_origen_reserva](
      id int IDENTITY NOT NULL,
      nombre char(20) NOT NULL,
      descripcion char(50) NOT NULL,
      created_at date NOT NULL,
      updated_at date,
      user_create_id smallint NOT NULL,
      user_updated_id smallint,
      CONSTRAINT [AAC_Alcatraz_origen_reserva_pkey] PRIMARY KEY(id)
    )
  END;

  -- Tabla: Estado Reservación (Corregido 'descripcion' a varchar)
  IF OBJECT_ID('dbo.AAC_Alcatraz_estado_reservacion', 'U') IS NULL
  BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_estado_reservacion](
      id int IDENTITY NOT NULL,
      descripcion varchar(50) NOT NULL, -- Corrección técnica: de INT a VARCHAR
      user_create int NOT NULL,
      created_at date NOT NULL,
      user_update int DEFAULT NULL,
      updated_at date DEFAULT NULL,
      CONSTRAINT [AAC_Alcatraz_estado_reservacion_pkey] PRIMARY KEY(id)
    )
  END;


  -- =========================================================================
  -- 2. TABLAS PRINCIPALES (CON DEPENDENCIAS)
  -- =========================================================================

  -- Tabla: Reservaciones
  IF OBJECT_ID('dbo.AAC_Alcatraz_reservaciones', 'U') IS NULL
  BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_reservaciones](
      id int IDENTITY NOT NULL,
      cliente_id int NOT NULL,
      estado_reservacion_id int NOT NULL,
      origen_reserva_id int NOT NULL,
      fecha_inicio date NOT NULL,
      fecha_fin date NOT NULL,
      total_dias_reservados int NOT NULL,
      monto_total money NOT NULL,
      personas_hospedadas tinyint DEFAULT 1,
      user_create int NOT NULL,
      created_at date NOT NULL,
      user_update int DEFAULT NULL,
      updated_at date DEFAULT NULL,
      CONSTRAINT [AAC_Alcatraz_reservaciones_pkey] PRIMARY KEY(id)
    )
  END;

  -- Tabla: Pagos Cliente (Nota: se corrigió tipo de origen_dinero_id a INT para emparejar llave primaria)
  IF OBJECT_ID('dbo.AAC_Alcatraz_pagos_cliente', 'U') IS NULL
  BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_pagos_cliente](
      id int IDENTITY NOT NULL,
      origen_dinero_id int NOT NULL, -- Cambiado de tinyint a int para coincidir con origen_dinero.id
      reservacion_id int NOT NULL,
      concepto_pago_id smallint  NOT NULL, -- Cambiado de smallint a int para coincidir con concepto_pago.id
      monto_bruto money NOT NULL,
      aplica_comision bit NOT NULL,
      monto_comision money NOT NULL,
      monto_neto AS ([monto_bruto]-[monto_comision]),
      user_create int NOT NULL,
      created_at date NOT NULL,
      user_update int DEFAULT NULL,
      updated_at date DEFAULT NULL,
      CONSTRAINT [AAC_Alcatraz_pagos_cliente_pkey] PRIMARY KEY(id)
    )
  END;

  IF OBJECT_ID('dbo.AAC_Alcatraz_reservacion_extras', 'U') IS NULL
  BEGIN
    CREATE TABLE [dbo].[AAC_Alcatraz_reservacion_extras](
      id int IDENTITY NOT NULL,
      reservacion_id int NOT NULL,
      concepto varchar(100) NOT NULL,
      monto money NOT NULL,
      user_create int NOT NULL,
      created_at date NOT NULL,
      CONSTRAINT [AAC_Alcatraz_reservacion_extras_pkey] PRIMARY KEY(id)
    )
  END;


  -- =========================================================================
  -- 3. VALIDACIÓN E INYECCIÓN DE LLAVES FORÁNEAS (FK)
  -- =========================================================================

  -- Llaves para Reservaciones
  IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_reservaciones_fkey')
    ALTER TABLE [dbo].[AAC_Alcatraz_reservaciones] ADD CONSTRAINT [AAC_Alcatraz_reservaciones_fkey] FOREIGN KEY (estado_reservacion_id) REFERENCES [dbo].[AAC_Alcatraz_estado_reservacion] (id);

  IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_reservaciones_fkey1')
    ALTER TABLE [dbo].[AAC_Alcatraz_reservaciones] ADD CONSTRAINT [AAC_Alcatraz_reservaciones_fkey1] FOREIGN KEY (cliente_id) REFERENCES [dbo].[AAC_Alcatraz_clientes] (id);

  IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_reservaciones_fkey2')
    ALTER TABLE [dbo].[AAC_Alcatraz_reservaciones] ADD CONSTRAINT [AAC_Alcatraz_reservaciones_fkey2] FOREIGN KEY (origen_reserva_id) REFERENCES [dbo].[AAC_Alcatraz_origen_reserva] (id);

  -- Llaves para Pagos Cliente
  IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_pagos_cliente_fkey')
    ALTER TABLE [dbo].[AAC_Alcatraz_pagos_cliente] ADD CONSTRAINT [AAC_Alcatraz_pagos_cliente_fkey] FOREIGN KEY (origen_dinero_id) REFERENCES [dbo].[AAC_Alcatraz_origen_dinero] (id);

  IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_pagos_cliente_fkey1')
    ALTER TABLE [dbo].[AAC_Alcatraz_pagos_cliente] ADD CONSTRAINT [AAC_Alcatraz_pagos_cliente_fkey1] FOREIGN KEY (reservacion_id) REFERENCES [dbo].[AAC_Alcatraz_reservaciones] (id);

  IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_pagos_cliente_fkey2')
    ALTER TABLE [dbo].[AAC_Alcatraz_pagos_cliente] ADD CONSTRAINT [AAC_Alcatraz_pagos_cliente_fkey2] FOREIGN KEY (concepto_pago_id) REFERENCES [dbo].[AAC_Alcatraz_concepto_pago] (id);

   IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'AAC_Alcatraz_reservacion_extras_fkey')
  ALTER TABLE [dbo].[AAC_Alcatraz_reservacion_extras] ADD CONSTRAINT [AAC_Alcatraz_reservacion_extras_fkey] FOREIGN KEY (reservacion_id) REFERENCES [dbo].[AAC_Alcatraz_reservaciones] (id);

  -- =========================================================================
  -- 4. SEEDS INICIALES (DATOS POR DEFECTO IDEMPOTENTES)
  -- =========================================================================

  -- Seeds para Origen Dinero
  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_origen_dinero] WHERE nombre = 'Efectivo')
    INSERT INTO [dbo].[AAC_Alcatraz_origen_dinero] (nombre, descripcion, created_at, user_create_id) VALUES ('Efectivo', 'Pago directo en caja', GETDATE(), 1);

  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_origen_dinero] WHERE nombre = 'Transferencia')
    INSERT INTO [dbo].[AAC_Alcatraz_origen_dinero] (nombre, descripcion, created_at, user_create_id) VALUES ('Transferencia', 'Transferencia interbancaria SPEI', GETDATE(), 1);

  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_origen_dinero] WHERE nombre = 'Tarjeta')
    INSERT INTO [dbo].[AAC_Alcatraz_origen_dinero] (nombre, descripcion, created_at, user_create_id) VALUES ('Tarjeta', 'Terminal de crédito o débito', GETDATE(), 1);

  -- Seeds para Concepto Pago
  IF NOT EXISTS (SELECT top 1 * FROM [dbo].[AAC_Alcatraz_concepto_pago] WHERE descripcion = 'Abono')
    INSERT INTO [dbo].[AAC_Alcatraz_concepto_pago] (descripcion, created_at, user_create_id) VALUES ('Abono', GETDATE(), 1);

  IF NOT EXISTS (SELECT top 1 * FROM [dbo].[AAC_Alcatraz_concepto_pago] WHERE descripcion = 'Anticipo')
    INSERT INTO [dbo].[AAC_Alcatraz_concepto_pago] (descripcion, created_at, user_create_id) VALUES ('Anticipo', GETDATE(), 1);

   IF NOT EXISTS (SELECT top 1 * FROM [dbo].[AAC_Alcatraz_concepto_pago] WHERE descripcion = 'Liquidacion total de cuenta')
    INSERT INTO [dbo].[AAC_Alcatraz_concepto_pago] (descripcion, created_at, user_create_id) VALUES ('Liquidación total de cuenta', GETDATE(), 1);

  IF NOT EXISTS (SELECT top 1 * FROM [dbo].[AAC_Alcatraz_concepto_pago] WHERE descripcion = 'Descuento o ajuste')
    INSERT INTO [dbo].[AAC_Alcatraz_concepto_pago] (descripcion, created_at, user_create_id) VALUES ('Descuento o ajuste', GETDATE(), 1);

  -- Seeds para Origen Reserva
  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_origen_reserva] WHERE nombre = 'OhSunny')
    INSERT INTO [dbo].[AAC_Alcatraz_origen_reserva] (nombre, descripcion, created_at, user_create_id) VALUES ('OhSunny', 'Plataforma externa similar a Airbnb', GETDATE(), 1);

  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_origen_reserva] WHERE nombre = 'Web')
    INSERT INTO [dbo].[AAC_Alcatraz_origen_reserva] (nombre, descripcion, created_at, user_create_id) VALUES ('Web', 'Reservación directo del sitio oficial', GETDATE(), 1);

  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_origen_reserva] WHERE nombre = 'WhatsApp')
    INSERT INTO [dbo].[AAC_Alcatraz_origen_reserva] (nombre, descripcion, created_at, user_create_id) VALUES ('WhatsApp', 'Atención directa por mensajería', GETDATE(), 1);

  -- Seeds para Estado Reservación
  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_estado_reservacion] WHERE descripcion = 'Pendiente')
    INSERT INTO [dbo].[AAC_Alcatraz_estado_reservacion] (descripcion, user_create, created_at) VALUES ('Pendiente', 1, GETDATE());

  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_estado_reservacion] WHERE descripcion = 'Finalizado')
    INSERT INTO [dbo].[AAC_Alcatraz_estado_reservacion] (descripcion, user_create, created_at) VALUES ('Finalizado', 1, GETDATE());

  IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_estado_reservacion] WHERE descripcion = 'Cancelado')
    INSERT INTO [dbo].[AAC_Alcatraz_estado_reservacion] (descripcion, user_create, created_at) VALUES ('Cancelado', 1, GETDATE());
`;
