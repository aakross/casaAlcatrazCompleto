// =========================================================================
// MÓDULO AISLADO DE CONTROL DE RENTAS COMERCIALES - CASA ALCATRAZ / SISTEMA
// COMPATIBLE CON: SQL SERVER 2008 R2 / 2012+ (IDEMPOTENTE Y SIN 'GO')
// =========================================================================

export const createRentasTable = `
  -- 1. TABLA: REGIONES
  IF OBJECT_ID('dbo.rentas_regiones', 'U') IS NULL
  BEGIN
    CREATE TABLE dbo.rentas_regiones (
      id INT IDENTITY(1,1) NOT NULL,
      nombre VARCHAR(100) NOT NULL,
      descripcion VARCHAR(255) NULL,
      activo BIT NOT NULL DEFAULT 1,
      usuario_creo_id INT NOT NULL,
      fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
      usuario_modifico_id INT NULL,
      fecha_modificacion DATETIME NULL,
      CONSTRAINT PK_rentas_regiones PRIMARY KEY (id)
    );
  END;

  -- 2. TABLA: LUGARES / COMPLEJOS
  IF OBJECT_ID('dbo.rentas_lugares', 'U') IS NULL
  BEGIN
    CREATE TABLE dbo.rentas_lugares (
      id INT IDENTITY(1,1) NOT NULL,
      region_id INT NOT NULL,
      nombre VARCHAR(150) NOT NULL,
      direccion VARCHAR(255) NULL,
      activo BIT NOT NULL DEFAULT 1,
      usuario_creo_id INT NOT NULL,
      fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
      usuario_modifico_id INT NULL,
      fecha_modificacion DATETIME NULL,
      CONSTRAINT PK_rentas_lugares PRIMARY KEY (id),
      CONSTRAINT FK_rentas_lugares_region FOREIGN KEY (region_id) REFERENCES dbo.rentas_regiones(id)
    );
  END;

  -- 3. TABLA: LOCALES / CASETAS
  IF OBJECT_ID('dbo.rentas_locales', 'U') IS NULL
  BEGIN
    CREATE TABLE dbo.rentas_locales (
      id INT IDENTITY(1,1) NOT NULL,
      lugar_id INT NOT NULL,
      numero_fisico VARCHAR(50) NOT NULL,
      nickname VARCHAR(100) NOT NULL,
      monto_renta_sugerido DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      descripcion VARCHAR(255) NULL,
      activo BIT NOT NULL DEFAULT 1,
      usuario_creo_id INT NOT NULL,
      fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
      usuario_modifico_id INT NULL,
      fecha_modificacion DATETIME NULL,
      CONSTRAINT PK_rentas_locales PRIMARY KEY (id),
      CONSTRAINT FK_rentas_locales_lugar FOREIGN KEY (lugar_id) REFERENCES dbo.rentas_lugares(id)
    );
  END;

  -- 4. TABLA: CONTRATOS DE ARRENDAMIENTO
  IF OBJECT_ID('dbo.rentas_contratos', 'U') IS NULL
  BEGIN
    CREATE TABLE dbo.rentas_contratos (
      id INT IDENTITY(1,1) NOT NULL,
      local_id INT NOT NULL,
      arrendatario_nombre VARCHAR(150) NOT NULL,
      arrendatario_telefono VARCHAR(30) NULL,
      arrendatario_email VARCHAR(100) NULL,
      fecha_inicio DATE NOT NULL,
      fecha_fin DATE NULL,
      monto_renta_mensual DECIMAL(12, 2) NOT NULL,
      dia_corte INT NOT NULL DEFAULT 1,
      vigente BIT NOT NULL DEFAULT 1,
      activo BIT NOT NULL DEFAULT 1,
      usuario_creo_id INT NOT NULL,
      fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
      usuario_modifico_id INT NULL,
      fecha_modificacion DATETIME NULL,
      CONSTRAINT PK_rentas_contratos PRIMARY KEY (id),
      CONSTRAINT FK_rentas_contratos_local FOREIGN KEY (local_id) REFERENCES dbo.rentas_locales(id)
    );
  END;

  -- 5. TABLA: PAGOS DE RENTA
  IF OBJECT_ID('dbo.rentas_pagos', 'U') IS NULL
  BEGIN
    CREATE TABLE dbo.rentas_pagos (
      id INT IDENTITY(1,1) NOT NULL,
      contrato_id INT NOT NULL,
      monto DECIMAL(12, 2) NOT NULL,
      meses_cubiertos DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
      fecha_abono_real DATE NOT NULL,
      fecha_captura DATETIME NOT NULL DEFAULT GETDATE(),
      metodo_pago VARCHAR(50) NOT NULL DEFAULT 'Efectivo',
      referencia_bancaria VARCHAR(100) NULL,
      nota VARCHAR(500) NULL,
      activo BIT NOT NULL DEFAULT 1,
      usuario_creo_id INT NOT NULL,
      fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
      usuario_modifico_id INT NULL,
      fecha_modificacion DATETIME NULL,
      CONSTRAINT PK_rentas_pagos PRIMARY KEY (id),
      CONSTRAINT FK_rentas_pagos_contrato FOREIGN KEY (contrato_id) REFERENCES dbo.rentas_contratos(id)
    );
  END;

  -- 6. TABLA: LOG DE AUDITORÍA DE PAGOS
  IF OBJECT_ID('dbo.rentas_log_auditoria_pagos', 'U') IS NULL
  BEGIN
    CREATE TABLE dbo.rentas_log_auditoria_pagos (
      id INT IDENTITY(1,1) NOT NULL,
      pago_id INT NOT NULL,
      accion VARCHAR(30) NOT NULL,
      monto_anterior DECIMAL(12, 2) NOT NULL,
      monto_nuevo DECIMAL(12, 2) NOT NULL,
      fecha_abono_anterior DATE NOT NULL,
      fecha_abono_nuevo DATE NOT NULL,
      meses_cubiertos_anterior DECIMAL(5, 2) NOT NULL,
      meses_cubiertos_nuevo DECIMAL(5, 2) NOT NULL,
      motivo_cambio VARCHAR(255) NOT NULL,
      usuario_id INT NOT NULL,
      fecha_evento DATETIME NOT NULL DEFAULT GETDATE(),
      CONSTRAINT PK_rentas_log_auditoria_pagos PRIMARY KEY (id),
      CONSTRAINT FK_rentas_log_pago FOREIGN KEY (pago_id) REFERENCES dbo.rentas_pagos(id)
    );
  END;

  -- ÍNDICES DE CONSULTA
  IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_rentas_pagos_contrato_activo')
  BEGIN
    CREATE NONCLUSTERED INDEX IX_rentas_pagos_contrato_activo 
      ON dbo.rentas_pagos(contrato_id, activo, fecha_abono_real);
  END;

  IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_rentas_contratos_local_vigente')
  BEGIN
    CREATE NONCLUSTERED INDEX IX_rentas_contratos_local_vigente 
      ON dbo.rentas_contratos(local_id, vigente, activo);
  END;
`;
