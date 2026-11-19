-- =============================================================================
-- INSTALACIÓN COMPLETA Y DEFINITIVA DE BASE DE DATOS: CASA ALCATRAZ + RENTAS
-- Motor compatible: Microsoft SQL Server 2008 R2 / 2012 / 2016 / 2017 / 2019 / 2022
-- =============================================================================
-- Este archivo maestro instala en orden estricto de dependencias:
-- 1. Tablas principales de Casa Alcatraz (16 tablas)
-- 2. Llaves foráneas e integridad referencial
-- 3. Stored Procedures oficiales (7 procedimientos)
-- 4. Triggers de auditoría y bitácora (3 triggers)
-- 5. Módulo independiente de Control de Rentas (6 tablas e índices)
-- 6. Datos semilla y catálogos iniciales requeridos
-- =============================================================================
SET NOCOUNT ON;
GO


-- =============================================================================
-- PARTE 1: TABLAS PRINCIPALES Y LLAVES FORÁNEAS
-- =============================================================================
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


-- =============================================================================
-- PARTE 2: STORED PROCEDURES OFICIALES
-- =============================================================================
-- =============================================================================
-- STORED PROCEDURES OFICIALES: CASA ALCATRAZ
-- Motor compatible: SQL Server 2008 R2 / 2012 / 2016 / 2019 / 2022
-- =============================================================================
SET NOCOUNT ON;
GO

-- =============================================================================
-- STORED PROCEDURE: [dbo].[AAC_Alcatraz_Actualizar_Reservacion]
-- =============================================================================
IF OBJECT_ID('[dbo].[AAC_Alcatraz_Actualizar_Reservacion]', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE [dbo].[AAC_Alcatraz_Actualizar_Reservacion];
END;
GO

CREATE PROCEDURE [dbo].[AAC_Alcatraz_Actualizar_Reservacion]
	@ReservacionId INT,
	@FechaInicio DATETIME,
	@FechaFin DATETIME,
	@TotalDiasReservados INT,
	@PrecioNoche MONEY,
	@MontoTotal MONEY,
	@PersonasHospedadas TINYINT,
	@IdUsuario INT,
	@NombreCliente VARCHAR(100) = NULL,
	@ApellidoCliente VARCHAR(100) = NULL,
	@Telefono VARCHAR(20) = NULL,
	@OrigenReservaId INT = NULL,
	@ExtrasXml XML = NULL
AS
BEGIN
	SET XACT_ABORT ON;
	SET NOCOUNT ON;
	DECLARE @PorcentajeComision DECIMAL(5,2);
	DECLARE @MontoComision MONEY;
	DECLARE @TotalExtras MONEY = 0;
	DECLARE @ClienteId INT;
	
	SET @FechaInicio = DATEADD(HOUR, 15, DATEADD(DAY, DATEDIFF(DAY, 0, @FechaInicio), 0));
	SET @FechaFin = DATEADD(HOUR, 12, DATEADD(DAY, DATEDIFF(DAY, 0, @FechaFin), 0));
	
	IF EXISTS (
			SELECT 1 
			FROM AAC_Alcatraz_reservaciones
			WHERE id <> @ReservacionId
			  AND estado_reservacion_id <> 3 -- Excluir las reservaciones canceladas
			  AND @FechaInicio < fecha_fin   -- La nueva entrada intenta pisar una estancia activa
			  AND @FechaFin > fecha_inicio   -- La nueva salida se extiende sobre otra reservación
		)
		BEGIN
			RAISERROR('La propiedad no se encuentra disponible para el rango de fechas seleccionado en la actualización.', 16, 1);
			RETURN;
		END

	BEGIN TRY
	
		DECLARE @UserContext VARBINARY(128);
		SET @UserContext = CAST(@IdUsuario AS VARBINARY(128));
		SET CONTEXT_INFO @UserContext;
	
		BEGIN TRANSACTION;
		
		-- A. Recuperar el ID del cliente de manera independiente
		SELECT @ClienteId = cliente_id 
		FROM AAC_Alcatraz_reservaciones 
		WHERE id = @ReservacionId;

		-- B. Recuperar el % de comisión original blindándolo contra nulos históricos 
		SELECT @PorcentajeComision = ISNULL(porcentaje_comision, 0.00) 
		FROM AAC_Alcatraz_reservaciones 
		WHERE id = @ReservacionId;
		
		-- C. Actualizar los datos del cliente de manera segura si las variables existen
		IF @ClienteId IS NOT NULL AND @NombreCliente IS NOT NULL
		BEGIN
			UPDATE AAC_Alcatraz_clientes
			SET 
				nombre = @NombreCliente,
				apellido = @ApellidoCliente,
				telefono = @Telefono,
				user_updated_id = @IdUsuario,
				updated_at = GETDATE()
			WHERE id = @ClienteId;
		END
		
		-- Limpieza e inserción atómica de extras
		DELETE FROM AAC_Alcatraz_reservacion_extras WHERE reservacion_id = @ReservacionId;
		
		IF @ExtrasXml IS NOT NULL
		BEGIN
			INSERT INTO AAC_Alcatraz_reservacion_extras (
				reservacion_id, concepto, cantidad, dias, precio_unitario_noche, monto, user_create, created_at,porcentaje_comision, monto_comision, tipo_evento
			)
			SELECT 
				@ReservacionId,
				T.Item.value('(concepto)[1]', 'VARCHAR(100)'),
				T.Item.value('(cantidad)[1]', 'INT'),
				T.Item.value('(dias)[1]', 'INT'),
				T.Item.value('(precioUnitarioNoche)[1]', 'MONEY'),
				T.Item.value('(monto)[1]', 'MONEY'), 
				@IdUsuario,
				GETDATE(),
				T.Item.value('(porcentajeComision)[1]', 'DECIMAL(5,2)'),
				T.Item.value('(montoComision)[1]', 'MONEY'),
				T.Item.value('(tipoEvento)[1]', 'VARCHAR(100)')
			FROM @ExtrasXml.nodes('/extras/item') AS T(Item);
		END

		SELECT @TotalExtras = ISNULL(SUM(monto), 0)
		FROM AAC_Alcatraz_reservacion_extras WHERE reservacion_id = @ReservacionId;

		-- 2. Recalcular la comisión sobre el nuevo monto base de hospedaje
		SET @MontoComision = @MontoTotal * (@PorcentajeComision / 100.0);

		-- 3. Actualizar la cabecera con los nuevos datos y el nuevo neto consolidado
		UPDATE AAC_Alcatraz_reservaciones
		SET 
			fecha_inicio = @FechaInicio,
			fecha_fin = @FechaFin,
			total_dias_reservados = @TotalDiasReservados,
			precio_noche = @PrecioNoche,
			monto_total = @MontoTotal,
			monto_comision = @MontoComision,
			monto_neto = (@MontoTotal + @TotalExtras) - @MontoComision,
			personas_hospedadas = @PersonasHospedadas,
			origen_reserva_id = ISNULL(@OrigenReservaId, origen_reserva_id),
			user_update = @IdUsuario,
			updated_at = GETDATE()
		WHERE id = @ReservacionId;

		COMMIT TRANSACTION;
		SET CONTEXT_INFO 0x0;
		SELECT 'Éxito' AS Estado;
	END TRY
	BEGIN CATCH
		IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
		SET CONTEXT_INFO 0x0;
		DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
		RAISERROR(@ErrorMessage, 16, 1);
	END CATCH
END
GO

-- =============================================================================
-- STORED PROCEDURE: [dbo].[AAC_Alcatraz_Agregar_Extra_Reserva]
-- =============================================================================
IF OBJECT_ID('[dbo].[AAC_Alcatraz_Agregar_Extra_Reserva]', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE [dbo].[AAC_Alcatraz_Agregar_Extra_Reserva];
END;
GO

CREATE PROCEDURE [dbo].[AAC_Alcatraz_Agregar_Extra_Reserva]
	@ReservacionId INT,
	@Concepto VARCHAR(100),
	@Cantidad INT,
	@Dias INT,
	@PrecioUnitario MONEY,
	@IdUsuario INT
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @MontoCalculado MONEY = @Cantidad * @Dias * @PrecioUnitario;
	DECLARE @TotalExtras MONEY = 0;
	DECLARE @MontoTotalHospedaje MONEY = 0;
	DECLARE @MontoComision MONEY = 0;

	BEGIN TRY
		BEGIN TRANSACTION;

		-- 1. Insertar el extra contratado de última hora
		INSERT INTO AAC_Alcatraz_reservacion_extras (
			reservacion_id, concepto, cantidad, dias, precio_unitario_noche, monto, user_create, created_at
		)
		VALUES (@ReservacionId, @Concepto, @Cantidad, @Dias, @PrecioUnitario, @MontoCalculado, @IdUsuario, GETDATE());

		-- 2. Obtener los datos base actuales de la reserva para el recalculo
		SELECT 
			@MontoTotalHospedaje = monto_total,
			@MontoComision = monto_comision
		FROM AAC_Alcatraz_reservaciones WHERE id = @ReservacionId;

		-- 3. Sumar TODOS los extras que ya tiene acumulados (incluyendo el nuevo)
		SELECT @TotalExtras = ISNULL(SUM(monto), 0)
		FROM AAC_Alcatraz_reservacion_extras WHERE reservacion_id = @ReservacionId;

		-- 4. Actualizar el monto_neto global de la reservación
		UPDATE AAC_Alcatraz_reservaciones 
		SET monto_neto = (@MontoTotalHospedaje + @TotalExtras) - @MontoComision
		WHERE id = @ReservacionId;

		COMMIT TRANSACTION;
		SELECT 'Éxito' AS Estado, @MontoCalculado AS MontoExtra;
	END TRY
	BEGIN CATCH
		IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
		DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
		RAISERROR(@ErrorMessage, 16, 1);
	END CATCH
END
GO

-- =============================================================================
-- STORED PROCEDURE: [dbo].[AAC_Alcatraz_AgregarPagoYFinalizarReserva]
-- =============================================================================
IF OBJECT_ID('[dbo].[AAC_Alcatraz_AgregarPagoYFinalizarReserva]', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE [dbo].[AAC_Alcatraz_AgregarPagoYFinalizarReserva];
END;
GO

CREATE PROCEDURE [dbo].[AAC_Alcatraz_AgregarPagoYFinalizarReserva]
    @origen_dinero_id INT,
    @reservacion_id INT,
    @concepto_pago_id SMALLINT,
    @monto_bruto MONEY,
    @aplica_comision BIT,
    @monto_comision MONEY,
    @user_create INT,
    @fecha_deposito DATE = NULL
AS
BEGIN
	SET XACT_ABORT ON;
    SET NOCOUNT ON;

    -- 1. Declarar variables para el control
    DECLARE @monto_total_reserva MONEY;
    DECLARE @total_pagado_historico MONEY;
    DECLARE @nuevo_total_pagado MONEY;
    DECLARE @id_estado_finalizado INT;
    DECLARE @total_comisiones MONEY;
    DECLARE @total_extras MONEY;
    DECLARE @gran_total_liquidar MONEY;

    
    SET @id_estado_finalizado = 2; 

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 2. Obtener el costo total de la reservación
        SELECT 
            @monto_total_reserva = monto_total,
            @total_comisiones = ISNULL(monto_comision, 0) -- Evitamos nulos para la matemática
        FROM AAC_Alcatraz_reservaciones 
        WHERE id = @reservacion_id;
        
        SELECT @total_extras = ISNULL(SUM(monto), 0)
        FROM AAC_Alcatraz_reservacion_extras
        WHERE reservacion_id = @reservacion_id;
        
        SET @gran_total_liquidar = @monto_total_reserva - @total_comisiones + @total_extras;

        -- 3. Sumar todos los pagos que ya se le habían hecho a esta reservación
        SELECT @total_pagado_historico = ISNULL(SUM(monto_bruto), 0) 
        FROM AAC_Alcatraz_pagos_cliente 
        WHERE reservacion_id = @reservacion_id;

        -- 4. Calcular el dinero acumulado con el pago actual
        SET @nuevo_total_pagado = @total_pagado_historico + @monto_bruto;

        -- 5. Insertar el nuevo pago en la tabla
        INSERT INTO AAC_Alcatraz_pagos_cliente (
            origen_dinero_id, reservacion_id, concepto_pago_id, monto_bruto, 
            aplica_comision, monto_comision, user_create, created_at, fecha_deposito
        )
        VALUES (
            @origen_dinero_id, @reservacion_id, @concepto_pago_id, @monto_bruto, 
            @aplica_comision, @monto_comision, @user_create, GETDATE(), ISNULL(@fecha_deposito, GETDATE())
        );

        -- 6. Si lo pagado es igual o mayor al total, actualizar el estatus de la reserva
        IF @nuevo_total_pagado >= @gran_total_liquidar
        BEGIN
            UPDATE AAC_Alcatraz_reservaciones
            SET estado_reservacion_id = @id_estado_finalizado,
                user_update = @user_create,
                updated_at = GETDATE()
            WHERE id = @reservacion_id;
        END

        -- Guardar los cambios si todo salió bien
        COMMIT TRANSACTION;
        PRINT 'Pago registrado correctamente y estatus verificado.';

    END TRY
    BEGIN CATCH
        -- Si hay un error, deshacer los cambios para no dejar datos corruptos
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- Mostrar el error ocurrido
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

-- =============================================================================
-- STORED PROCEDURE: [dbo].[AAC_Alcatraz_Crear_Reservacion]
-- =============================================================================
IF OBJECT_ID('[dbo].[AAC_Alcatraz_Crear_Reservacion]', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE [dbo].[AAC_Alcatraz_Crear_Reservacion];
END;
GO

CREATE PROCEDURE [dbo].[AAC_Alcatraz_Crear_Reservacion]
	@IdUsuario INT,
	@NombreCliente VARCHAR(50),
	@ApellidoCliente VARCHAR(50),
	@Telefono VARCHAR(20),
	@Email VARCHAR(20),
	@FechaInicio DATETIME,
	@FechaFin DATETIME,
	@TotalDiasReservados INT,
	@MontoTotal MONEY,
	@PorcentajeComision DECIMAL(5,2),
	@PrecioNoche MONEY,
	@MontoGarantia MONEY,
	@OrigenReservaId INT,
	@NuevoOrigenNombre VARCHAR(20) = NULL,
	@PersonasHospedadas TINYINT,
	@ExtrasXml XML = NULL
	
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @IdClienteInsertado INT;
	DECLARE @IdReservacionInsertada INT;
	
	-- 👈 NUEVOS: Variables locales para almacenar los cálculos de la comisión
	DECLARE @MontoComision MONEY;
	DECLARE @MontoNeto MONEY;
	DECLARE @TotalExtras MONEY;
	SET @TotalExtras = 0;
	
	SET @FechaInicio = DATEADD(HOUR, 15, DATEADD(DAY, DATEDIFF(DAY, 0, @FechaInicio), 0));
	SET @FechaFin = DATEADD(HOUR, 12, DATEADD(DAY, DATEDIFF(DAY, 0, @FechaFin), 0));

	BEGIN TRY
		BEGIN TRANSACTION;
		
		IF EXISTS (
			SELECT 1 
			FROM AAC_Alcatraz_reservaciones
			WHERE estado_reservacion_id <> 3 -- Revisa si el ID 3 es cancelado en tu sistema
			  AND @FechaInicio < fecha_fin   -- La nueva entrada es antes de que salga el anterior
			  AND @FechaFin > fecha_inicio   -- La nueva salida es después de que entre el siguiente
		)
		BEGIN
			-- Lanza un error personalizado que capturará el backend
			RAISERROR('La propiedad no se encuentra disponible para el rango de fechas y horas seleccionado.', 16, 1);
		END
		
		-- 👈 NUEVO: Cálculo matemático de la comisión y monto neto
		SET @MontoComision = @MontoTotal * (@PorcentajeComision / 100.0);
		--SET @MontoNeto = @MontoTotal - @MontoComision;

		-------------------------------------------------------------- Validar Origen Reserva
		IF @NuevoOrigenNombre IS NOT NULL AND LTRIM(RTRIM(@NuevoOrigenNombre)) <> '' AND @NuevoOrigenNombre <> 'OTRO'
			BEGIN
				SELECT TOP 1 @OrigenReservaId = id 
				FROM AAC_Alcatraz_origen_reserva 
				WHERE LOWER(LTRIM(RTRIM(nombre))) = LOWER(LTRIM(RTRIM(@NuevoOrigenNombre)));

				IF @OrigenReservaId IS NULL OR @OrigenReservaId <= 0
				BEGIN
					INSERT INTO AAC_Alcatraz_origen_reserva (nombre, descripcion, created_at, user_create_id)
					VALUES (LTRIM(RTRIM(@NuevoOrigenNombre)), LTRIM(RTRIM(@NuevoOrigenNombre)), GETDATE(), @IdUsuario);
					
					SET @OrigenReservaId = SCOPE_IDENTITY();
				END
			END
		-------------------------------------------------------------- Insertar Cliente
		INSERT INTO AAC_Alcatraz_clientes (nombre, apellido, telefono, email, user_create_id, created_at)
		VALUES (@NombreCliente, @ApellidoCliente, @Telefono, @Email, @IdUsuario, GETDATE());
    
		SET @IdClienteInsertado = SCOPE_IDENTITY();
    
		-------------------------------------------------------------- Insertar Reservación
		INSERT INTO AAC_Alcatraz_reservaciones (
			cliente_id, 
			estado_reservacion_id, 
			origen_reserva_id, 
			fecha_inicio, 
			fecha_fin, 
			total_dias_reservados, 
			precio_noche,
			monto_total,
			porcentaje_comision, 
			monto_comision,      
			monto_neto,          
			monto_garantia,
			personas_hospedadas,
			user_create,
			created_at
		)
		VALUES(
			@IdClienteInsertado,
			1,
			@OrigenReservaId,
			@FechaInicio,
			@FechaFin,
			@TotalDiasReservados,
			@PrecioNoche,
			@MontoTotal,
			@PorcentajeComision, 
			@MontoComision,      
			--@MontoNeto,          
			0,
			@MontoGarantia,
			@PersonasHospedadas,
			@IdUsuario,
			GETDATE()
		)
			
		SET @IdReservacionInsertada = SCOPE_IDENTITY();
			
		-------------------------------------------------------------- Insertar Extras XML
		IF @ExtrasXml IS NOT NULL
		BEGIN
		
			SELECT @TotalExtras = ISNULL(SUM(T.Item.value('(monto)[1]', 'MONEY')), 0)
			FROM @ExtrasXml.nodes('/extras/item') AS T(Item);
			
			INSERT INTO AAC_Alcatraz_reservacion_extras (reservacion_id, concepto, cantidad, dias, precio_unitario_noche, monto, user_create, created_at, porcentaje_comision, monto_comision, tipo_evento)
			SELECT 
				@IdReservacionInsertada,
				T.Item.value('(concepto)[1]', 'VARCHAR(100)'),
				T.Item.value('(cantidad)[1]', 'INT'),
				T.Item.value('(dias)[1]', 'INT'),
				T.Item.value('(precioUnitarioNoche)[1]', 'MONEY'),
				T.Item.value('(monto)[1]', 'MONEY'),
				@IdUsuario,
				GETDATE(),
				T.Item.value('(porcentajeComision)[1]', 'DECIMAL(5,2)'),
				T.Item.value('(montoComision)[1]', 'MONEY'),
				T.Item.value('(tipoEvento)[1]', 'VARCHAR(100)')
			FROM @ExtrasXml.nodes('/extras/item') AS T(Item);
		END

			SET @MontoNeto = (@MontoTotal + @TotalExtras) - @MontoComision;
			UPDATE AAC_Alcatraz_reservaciones 
			SET monto_neto = @MontoNeto 
			WHERE id = @IdReservacionInsertada;
			
		COMMIT TRANSACTION
		SELECT @IdClienteInsertado AS IdClienteNuevo, 'Éxito' AS Estado;
	END TRY
	BEGIN CATCH
		IF @@TRANCOUNT > 0
		BEGIN
			ROLLBACK TRANSACTION
		END
		DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
		RAISERROR(@ErrorMessage, 16, 1);
	END CATCH
END
GO

-- =============================================================================
-- STORED PROCEDURE: [dbo].[AAC_Alcatraz_Eliminar_Pago_Cliente]
-- =============================================================================
IF OBJECT_ID('[dbo].[AAC_Alcatraz_Eliminar_Pago_Cliente]', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE [dbo].[AAC_Alcatraz_Eliminar_Pago_Cliente];
END;
GO

Create PROCEDURE [dbo].[AAC_Alcatraz_Eliminar_Pago_Cliente]
    @PagoId INT,
    @IdUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @EsAdmin BIT;

    -- 1. Validar si el usuario tiene permisos de borrado
    SELECT @EsAdmin = borrar 
    FROM AAC_Alcatraz_usuarios 
    WHERE id = @IdUsuario;

    IF @EsAdmin IS NULL OR @EsAdmin = 0
    BEGIN
        RAISERROR('Acceso denegado: Solo los usuarios autorizados pueden eliminar abonos de caja.', 16, 1);
        RETURN;
    END

    -- 2. Validar que el pago exista antes de borrar
    IF NOT EXISTS (SELECT 1 FROM AAC_Alcatraz_pagos_cliente WHERE id = @PagoId)
    BEGIN
        RAISERROR('El registro de abono especificado no existe.', 16, 1);
        RETURN;
    END

    BEGIN TRY
    
		DECLARE @UserContext VARBINARY(128);
        SET @UserContext = CAST(@IdUsuario AS VARBINARY(128));
        SET CONTEXT_INFO @UserContext;
    
        BEGIN TRANSACTION;

        -- Eliminar el abono de forma física y atómica
        DELETE FROM AAC_Alcatraz_pagos_cliente 
        WHERE id = @PagoId;

        COMMIT TRANSACTION;
        SELECT 'Éxito' AS Estado, 'El pago fue purgado correctamente.' AS Detalle;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SET CONTEXT_INFO 0x0;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

-- =============================================================================
-- STORED PROCEDURE: [dbo].[AAC_Alcatraz_Eliminar_Reservacion_Verificada]
-- =============================================================================
IF OBJECT_ID('[dbo].[AAC_Alcatraz_Eliminar_Reservacion_Verificada]', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE [dbo].[AAC_Alcatraz_Eliminar_Reservacion_Verificada];
END;
GO

CREATE PROCEDURE [dbo].[AAC_Alcatraz_Eliminar_Reservacion_Verificada]
    @ReservacionId INT,
    @IdUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @ClienteId INT;
    DECLARE @EsAdmin BIT;

    -- 1. Validar si el usuario existe y si es administrador
    SELECT @EsAdmin = borrar 
    FROM AAC_Alcatraz_usuarios 
    WHERE id = @IdUsuario;

    IF @EsAdmin IS NULL OR @EsAdmin = 0
    BEGIN
        RAISERROR('Acceso denegado: Solo los usuarios administradores pueden eliminar reservaciones.', 16, 1);
        RETURN;
    END

    -- 2. Recuperar el ID del cliente antes de borrar la reservación
    SELECT @ClienteId = cliente_id 
    FROM AAC_Alcatraz_reservaciones 
    WHERE id = @ReservacionId;

    IF @ClienteId IS NULL
    BEGIN
        RAISERROR('La reservación especificada no existe en el sistema.', 16, 1);
        RETURN;
    END

    BEGIN TRY
    
		DECLARE @UserContext VARBINARY(128);
        SET @UserContext = CAST(@IdUsuario AS VARBINARY(128));
        SET CONTEXT_INFO @UserContext;
        
        BEGIN TRANSACTION;

        -- A. Eliminar los pagos asociados a la reservación
        DELETE FROM AAC_Alcatraz_pagos_cliente 
        WHERE reservacion_id = @ReservacionId;

        -- B. Eliminar los extras vinculados
        DELETE FROM AAC_Alcatraz_reservacion_extras 
        WHERE reservacion_id = @ReservacionId;

        -- C. Eliminar la reservación principal
        DELETE FROM AAC_Alcatraz_reservaciones 
        WHERE id = @ReservacionId;

        -- D. Si el cliente ya no tiene ninguna otra reserva, lo eliminamos para no dejar huérfanos
        IF NOT EXISTS (SELECT 1 FROM AAC_Alcatraz_reservaciones WHERE cliente_id = @ClienteId)
        BEGIN
            DELETE FROM AAC_Alcatraz_clientes 
            WHERE id = @ClienteId;
        END

        COMMIT TRANSACTION;
        
        SET CONTEXT_INFO 0x0;
        
        SELECT 'Éxito' AS Estado, 'La reservación y sus registros asociados fueron eliminados.' AS Detalle;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION;
        END
        SET CONTEXT_INFO 0x0;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

-- =============================================================================
-- STORED PROCEDURE: [dbo].[AAC_Alcatraz_Reporte_General_Reservaciones]
-- =============================================================================
IF OBJECT_ID('[dbo].[AAC_Alcatraz_Reporte_General_Reservaciones]', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE [dbo].[AAC_Alcatraz_Reporte_General_Reservaciones];
END;
GO

Create PROCEDURE [dbo].[AAC_Alcatraz_Reporte_General_Reservaciones]
    @FechaDesde DATE = NULL,
    @FechaHasta DATE = NULL,
    @EstatusId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        r.id AS numeroReserva,
        RTRIM(ISNULL(c.nombre, '')) + ' ' + RTRIM(ISNULL(c.apellido, '')) AS cliente,
        r.fecha_inicio AS fechaInicio,
        r.fecha_fin AS fechaFin,
        r.personas_hospedadas AS numeroHuespedes,
        r.total_dias_reservados AS totalNoches,
        RTRIM(ISNULL(o.nombre, 'No Especificado')) AS plataforma,
        r.precio_noche AS costoPorNoche,
        r.monto_total AS costoTotalReservacion,
        ISNULL(ex.total_extras, 0) AS serviciosExtras,
        
        (
            SELECT 
                ext.id AS [id],
                RTRIM(ext.concepto) AS [concepto],
                RTRIM(ext.tipo_evento) AS [tipoEvento],
                ext.cantidad AS [cantidad],
                ext.dias AS [dias],
                ext.precio_unitario_noche AS [precioUnitarioNoche],
                ext.monto AS [monto],
                ext.porcentaje_comision AS [porcentajeComision], 
                ext.monto_comision AS [montoComision]
            FROM AAC_Alcatraz_reservacion_extras ext
            WHERE ext.reservacion_id = r.id
            FOR XML PATH('extra'), ROOT('extras'), ELEMENTS
        ) AS desglosesXml,

        (r.monto_total - ISNULL(r.monto_comision, 0) + ISNULL(ex.total_extras, 0)) AS totalEstancia,
        ISNULL(r.monto_comision, 0) AS montoComisionPlataforma,
        ISNULL(pg.total_pagado, 0) AS pagosRecibidos,
        ((r.monto_total - ISNULL(r.monto_comision, 0) + ISNULL(ex.total_extras, 0)) - ISNULL(pg.total_pagado, 0)) AS montoPendientePago,
        ISNULL(r.monto_garantia, 0) AS depositoGarantia,
        er.descripcion AS estatus
    FROM AAC_Alcatraz_reservaciones r
    INNER JOIN AAC_Alcatraz_clientes c ON r.cliente_id = c.id
    INNER JOIN AAC_Alcatraz_estado_reservacion er ON r.estado_reservacion_id = er.id
    LEFT JOIN AAC_Alcatraz_origen_reserva o ON r.origen_reserva_id = o.id
    OUTER APPLY (
        SELECT SUM(monto) AS total_extras 
        FROM AAC_Alcatraz_reservacion_extras 
        WHERE reservacion_id = r.id
    ) ex
    OUTER APPLY (
        SELECT SUM(monto_bruto) AS total_pagado 
        FROM AAC_Alcatraz_pagos_cliente 
        WHERE reservacion_id = r.id
    ) pg
    WHERE 
        (@FechaDesde IS NULL OR r.fecha_inicio >= @FechaDesde)
        AND (@FechaHasta IS NULL OR r.fecha_inicio <= @FechaHasta)
        AND (@EstatusId IS NULL OR r.estado_reservacion_id = @EstatusId)
    ORDER BY r.id DESC;
END;
GO


-- =============================================================================
-- PARTE 3: TRIGGERS OFICIALES
-- =============================================================================
-- =============================================================================
-- TRIGGERS OFICIALES DE AUDITORÍA Y BITÁCORA: CASA ALCATRAZ
-- Motor compatible: SQL Server 2008 R2 / 2012 / 2016 / 2019 / 2022
-- =============================================================================
SET NOCOUNT ON;
GO

-- =============================================================================
-- TRIGGER: [dbo].[tg_AAC_Alcatraz_pagos_cliente_borrado]
-- =============================================================================
IF OBJECT_ID('[dbo].[tg_AAC_Alcatraz_pagos_cliente_borrado]', 'TR') IS NOT NULL
BEGIN
    DROP TRIGGER [dbo].[tg_AAC_Alcatraz_pagos_cliente_borrado];
END;
GO

CREATE TRIGGER [dbo].[tg_AAC_Alcatraz_pagos_cliente_borrado]
ON [dbo].[AAC_Alcatraz_pagos_cliente]
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @AppUsuarioId INT;
    SET @AppUsuarioId = CAST(SUBSTRING(CONTEXT_INFO(), 1, 4) AS INT);

    INSERT INTO [AAC_Alcatraz_bitacora_borrado] 
        (tabla_afectada, registro_id, datos_eliminados, usuario_id)
    SELECT 
        'AAC_Alcatraz_pagos_cliente',
        d.id,
        (SELECT d.* FOR XML PATH('registro'), ELEMENTS),
        ISNULL(NULLIF(@AppUsuarioId, 0), d.user_create)
    FROM deleted d;
END
GO

-- =============================================================================
-- TRIGGER: [dbo].[tg_AAC_Alcatraz_reservaciones_actualizado]
-- =============================================================================
IF OBJECT_ID('[dbo].[tg_AAC_Alcatraz_reservaciones_actualizado]', 'TR') IS NOT NULL
BEGIN
    DROP TRIGGER [dbo].[tg_AAC_Alcatraz_reservaciones_actualizado];
END;
GO

CREATE TRIGGER [dbo].[tg_AAC_Alcatraz_reservaciones_actualizado]
ON [dbo].[AAC_Alcatraz_reservaciones]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Recuperar el ID del usuario desde CONTEXT_INFO (establecido por el SP)
    DECLARE @AppUsuarioId INT;
    SET @AppUsuarioId = CAST(SUBSTRING(CONTEXT_INFO(), 1, 4) AS INT);

    -- 2. Insertar el estado ANTES de la modificación en la bitácora
    INSERT INTO [AAC_Alcatraz_bitacora_borrado] 
        (tabla_afectada, registro_id, datos_eliminados, usuario_id, accion)
    SELECT 
        'AAC_Alcatraz_reservaciones',
        d.id,
        (
            SELECT 
                d.*,
                (SELECT c.nombre FROM AAC_Alcatraz_clientes c WHERE c.id = d.cliente_id) AS [cliente_nombre],
                (
                    -- Capturamos los extras originales que estaban antes de que el SP los borrara/actualizara
                    SELECT ex.id, ex.concepto, ex.monto, ex.cantidad, ex.dias, ex.precio_unitario_noche
                    FROM AAC_Alcatraz_reservacion_extras ex 
                    WHERE ex.reservacion_id = d.id
                    FOR XML PATH('extra'), TYPE
                ) AS [extras_solicitados]
            FOR XML PATH('registro'), ELEMENTS
        ), 
        ISNULL(NULLIF(@AppUsuarioId, 0), d.user_update),
        'ACTUALIZACION' -- 🚀 Especificamos que fue una edición
    FROM deleted d;
END
GO

-- =============================================================================
-- TRIGGER: [dbo].[tg_AAC_Alcatraz_reservaciones_borrado]
-- =============================================================================
IF OBJECT_ID('[dbo].[tg_AAC_Alcatraz_reservaciones_borrado]', 'TR') IS NOT NULL
BEGIN
    DROP TRIGGER [dbo].[tg_AAC_Alcatraz_reservaciones_borrado];
END;
GO

CREATE TRIGGER [dbo].[tg_AAC_Alcatraz_reservaciones_borrado]
ON [dbo].[AAC_Alcatraz_reservaciones]
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Recuperamos el ID del usuario de la sesión de forma exacta
    DECLARE @AppUsuarioId INT;
    SET @AppUsuarioId = CAST(SUBSTRING(CONTEXT_INFO(), 1, 4) AS INT);

    -- 2. CORREGIDO: Declaramos explícitamente la columna 'accion'
    INSERT INTO [AAC_Alcatraz_bitacora_borrado] 
        (tabla_afectada, registro_id, datos_eliminados, usuario_id, accion) 
    SELECT 
        'AAC_Alcatraz_reservaciones',
        d.id,
        (
            SELECT 
                d.*,
                -- A. Extraemos el nombre del cliente desde la tabla original
                (SELECT c.nombre FROM AAC_Alcatraz_clientes c WHERE c.id = d.cliente_id) AS [cliente_nombre],
                
                -- B. OPTIMIZACIÓN CLAVE: Buscamos en la tabla física de extras de forma directa.
                -- Como el SP ejecuta dentro de la misma transacción (TRANSACTION), el trigger 
                -- lee el estado justo al momento del disparo atómico.
                (
                    SELECT 
                        ex.id, 
                        ex.concepto,      
                        ex.monto,         
                        ex.cantidad, 
                        ex.dias, 
                        ex.precio_unitario_noche
                    FROM AAC_Alcatraz_reservacion_extras ex 
                    WHERE ex.reservacion_id = d.id
                    FOR XML PATH('extra'), TYPE
                ) AS [extras_solicitados]
            FOR XML PATH('registro'), ELEMENTS
        ), 
        ISNULL(NULLIF(@AppUsuarioId, 0), d.user_create),
        'BORRADO' -- 🚀 CORREGIDO: Enviamos el string 'BORRADO' para rellenar la columna obligatoria
    FROM deleted d;
END
GO


-- =============================================================================
-- PARTE 4: MÓDULO DE CONTROL DE RENTAS COMERCIALES
-- =============================================================================
-- =============================================================================
-- ESQUEMA COMPLETO: MÓDULO DE CONTROL DE RENTAS COMERCIALES
-- Motor compatible: Microsoft SQL Server 2008 R2 / 2012 / 2016 / 2019 / 2022
-- =============================================================================
-- REGLAS DE ARQUITECTURA:
-- 1. No modifica ni altera tablas existentes del hotel.
-- 2. Trazabilidad obligatoria: usuario_creo_id, fecha_creacion, usuario_modifico_id, fecha_modificacion.
-- 3. Bajas lógicas con campo 'activo' (BIT).
-- 4. Auditoría histórica antifraude en pagos (rentas_log_auditoria_pagos).
-- =============================================================================
SET NOCOUNT ON;
GO

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
GO

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
GO

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
GO

-- 4. TABLA: CONTRATOS DE ARRENDAMIENTO
IF OBJECT_ID('dbo.rentas_contratos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.rentas_contratos (
        id INT IDENTITY(1,1) NOT NULL,
        local_id INT NOT NULL,
        nombre_comercial VARCHAR(150) NULL,
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
ELSE
BEGIN
    IF COL_LENGTH('dbo.rentas_contratos', 'nombre_comercial') IS NULL
    BEGIN
        ALTER TABLE dbo.rentas_contratos ADD nombre_comercial VARCHAR(150) NULL;
    END;
END;
GO

-- 5. TABLA: PAGOS DE RENTA
IF OBJECT_ID('dbo.rentas_pagos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.rentas_pagos (
        id INT IDENTITY(1,1) NOT NULL,
        contrato_id INT NOT NULL,
        monto DECIMAL(12, 2) NOT NULL,
        meses_cubiertos DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
        periodo_cubierto VARCHAR(150) NULL,
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
ELSE
BEGIN
    IF COL_LENGTH('dbo.rentas_pagos', 'periodo_cubierto') IS NULL
    BEGIN
        ALTER TABLE dbo.rentas_pagos ADD periodo_cubierto VARCHAR(150) NULL;
    END;
END;
GO

-- 6. TABLA: LOG DE AUDITORÍA DE PAGOS (Antifraude e Historial de Modificaciones)
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
GO

-- ÍNDICES DE RENDIMIENTO PARA REPORTES Y ADEUDOS
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_rentas_pagos_contrato_activo')
BEGIN
    CREATE NONCLUSTERED INDEX IX_rentas_pagos_contrato_activo 
        ON dbo.rentas_pagos(contrato_id, activo, fecha_abono_real);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_rentas_contratos_local_vigente')
BEGIN
    CREATE NONCLUSTERED INDEX IX_rentas_contratos_local_vigente 
        ON dbo.rentas_contratos(local_id, vigente, activo);
END;
GO

-- =============================================================================
-- PARTE 5: DATOS SEMILLA (SEEDS) Y CATÁLOGOS INICIALES
-- =============================================================================
-- =============================================================================
-- DATOS SEMILLA (SEEDS) INICIALES E IDEMPOTENTES: CASA ALCATRAZ
-- Motor compatible: Microsoft SQL Server 2008 R2 / 2012 / 2016 / 2019 / 2022
-- =============================================================================
SET NOCOUNT ON;
GO

-- 1. ROLES DE USUARIO
SET IDENTITY_INSERT [dbo].[AAC_Alcatraz_rol_usuario] ON;
IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_rol_usuario] WHERE id = 1)
    INSERT INTO [dbo].[AAC_Alcatraz_rol_usuario] (id, descripcion, user_id_create, created_at)
    VALUES (1, 'Usuario de Direccion', 'sistemas', GETDATE());

IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_rol_usuario] WHERE id = 2)
    INSERT INTO [dbo].[AAC_Alcatraz_rol_usuario] (id, descripcion, user_id_create, created_at)
    VALUES (2, 'Recepcion', 'sistemas', GETDATE());

IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_rol_usuario] WHERE id = 3)
    INSERT INTO [dbo].[AAC_Alcatraz_rol_usuario] (id, descripcion, user_id_create, created_at)
    VALUES (3, 'Contabilidad', 'sistemas', GETDATE());
SET IDENTITY_INSERT [dbo].[AAC_Alcatraz_rol_usuario] OFF;
GO

-- 2. USUARIO ADMINISTRADOR INICIAL
SET IDENTITY_INSERT [dbo].[AAC_Alcatraz_usuarios] ON;
IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_usuarios] WHERE [user] = 'sistemas')
    INSERT INTO [dbo].[AAC_Alcatraz_usuarios] (id, [user], password, rol_id, activo, borrar, created_at, user_create)
    VALUES (1, 'sistemas', '10', 1, 1, 1, GETDATE(), 'sistemas');
SET IDENTITY_INSERT [dbo].[AAC_Alcatraz_usuarios] OFF;
GO

-- 3. ESTADOS DE RESERVACIÓN
SET IDENTITY_INSERT [dbo].[AAC_Alcatraz_estado_reservacion] ON;
IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_estado_reservacion] WHERE id = 1)
    INSERT INTO [dbo].[AAC_Alcatraz_estado_reservacion] (id, descripcion, user_create, created_at)
    VALUES (1, 'Pendiente', 1, GETDATE());

IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_estado_reservacion] WHERE id = 2)
    INSERT INTO [dbo].[AAC_Alcatraz_estado_reservacion] (id, descripcion, user_create, created_at)
    VALUES (2, 'Finalizado', 1, GETDATE());

IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_estado_reservacion] WHERE id = 3)
    INSERT INTO [dbo].[AAC_Alcatraz_estado_reservacion] (id, descripcion, user_create, created_at)
    VALUES (3, 'Cancelado', 1, GETDATE());
SET IDENTITY_INSERT [dbo].[AAC_Alcatraz_estado_reservacion] OFF;
GO

-- 4. ORÍGENES DE RESERVA
SET IDENTITY_INSERT [dbo].[AAC_Alcatraz_origen_reserva] ON;
IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_origen_reserva] WHERE id = 1)
    INSERT INTO [dbo].[AAC_Alcatraz_origen_reserva] (id, nombre, descripcion, created_at, user_create_id)
    VALUES (1, 'OhSunny', 'Plataforma externa similar a Airbnb', GETDATE(), 1);

IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_origen_reserva] WHERE id = 2)
    INSERT INTO [dbo].[AAC_Alcatraz_origen_reserva] (id, nombre, descripcion, created_at, user_create_id)
    VALUES (2, 'Web', 'Reservación directo del sitio oficial', GETDATE(), 1);

IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_origen_reserva] WHERE id = 3)
    INSERT INTO [dbo].[AAC_Alcatraz_origen_reserva] (id, nombre, descripcion, created_at, user_create_id)
    VALUES (3, 'WhatsApp', 'Atención directa por mensajería', GETDATE(), 1);

IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_origen_reserva] WHERE id = 4)
    INSERT INTO [dbo].[AAC_Alcatraz_origen_reserva] (id, nombre, descripcion, created_at, user_create_id)
    VALUES (4, 'Rodolfo Chef', 'Recomendación Rodolfo chef', GETDATE(), 1);

IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_origen_reserva] WHERE id = 5)
    INSERT INTO [dbo].[AAC_Alcatraz_origen_reserva] (id, nombre, descripcion, created_at, user_create_id)
    VALUES (5, 'Airbnb', 'Plataforma Airbnb', GETDATE(), 1);

IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_origen_reserva] WHERE id = 7)
    INSERT INTO [dbo].[AAC_Alcatraz_origen_reserva] (id, nombre, descripcion, created_at, user_create_id)
    VALUES (7, 'NINGUNO', 'Sin plataforma específica', GETDATE(), 1);
SET IDENTITY_INSERT [dbo].[AAC_Alcatraz_origen_reserva] OFF;
GO

-- 5. ORÍGENES DE DINERO / MÉTODOS DE PAGO
SET IDENTITY_INSERT [dbo].[AAC_Alcatraz_origen_dinero] ON;
IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_origen_dinero] WHERE id = 1)
    INSERT INTO [dbo].[AAC_Alcatraz_origen_dinero] (id, nombre, descripcion, created_at, user_create_id)
    VALUES (1, 'Efectivo', 'Pago directo en caja', GETDATE(), 1);

IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_origen_dinero] WHERE id = 2)
    INSERT INTO [dbo].[AAC_Alcatraz_origen_dinero] (id, nombre, descripcion, created_at, user_create_id)
    VALUES (2, 'Transferencia', 'Transferencia interbancaria SPEI', GETDATE(), 1);

IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_origen_dinero] WHERE id = 3)
    INSERT INTO [dbo].[AAC_Alcatraz_origen_dinero] (id, nombre, descripcion, created_at, user_create_id)
    VALUES (3, 'Tarjeta', 'Terminal de crédito o débito', GETDATE(), 1);
SET IDENTITY_INSERT [dbo].[AAC_Alcatraz_origen_dinero] OFF;
GO

-- 6. CONCEPTOS DE PAGO
SET IDENTITY_INSERT [dbo].[AAC_Alcatraz_concepto_pago] ON;
IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_concepto_pago] WHERE id = 1)
    INSERT INTO [dbo].[AAC_Alcatraz_concepto_pago] (id, descripcion, created_at, user_create_id)
    VALUES (1, 'Abono', GETDATE(), 1);

IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_concepto_pago] WHERE id = 2)
    INSERT INTO [dbo].[AAC_Alcatraz_concepto_pago] (id, descripcion, created_at, user_create_id)
    VALUES (2, 'Anticipo', GETDATE(), 1);

IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_concepto_pago] WHERE id = 3)
    INSERT INTO [dbo].[AAC_Alcatraz_concepto_pago] (id, descripcion, created_at, user_create_id)
    VALUES (3, 'Liquidación total de cuenta', GETDATE(), 1);

IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_concepto_pago] WHERE id = 4)
    INSERT INTO [dbo].[AAC_Alcatraz_concepto_pago] (id, descripcion, created_at, user_create_id)
    VALUES (4, 'Descuento o ajuste', GETDATE(), 1);
SET IDENTITY_INSERT [dbo].[AAC_Alcatraz_concepto_pago] OFF;
GO

-- 7. CATEGORÍAS DE EGRESOS (ESTADO DE RESULTADOS)
IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_egreso_categorias] WHERE clave = 'VENTA')
    INSERT INTO [dbo].[AAC_Alcatraz_egreso_categorias] (id, clave, nombre, orden, activo, created_at)
    VALUES (1, 'VENTA', 'Gastos de Venta', 1, 1, GETDATE());

IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_egreso_categorias] WHERE clave = 'ADMINISTRACION')
    INSERT INTO [dbo].[AAC_Alcatraz_egreso_categorias] (id, clave, nombre, orden, activo, created_at)
    VALUES (2, 'ADMINISTRACION', 'Gastos de Administración', 2, 1, GETDATE());

IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_egreso_categorias] WHERE clave = 'FINANCIEROS')
    INSERT INTO [dbo].[AAC_Alcatraz_egreso_categorias] (id, clave, nombre, orden, activo, created_at)
    VALUES (3, 'FINANCIEROS', 'Gastos Financieros', 3, 1, GETDATE());

IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_egreso_categorias] WHERE clave = 'SUELDOS_SALARIOS')
    INSERT INTO [dbo].[AAC_Alcatraz_egreso_categorias] (id, clave, nombre, orden, activo, created_at)
    VALUES (4, 'SUELDOS_SALARIOS', 'Gastos por sueldos y salarios', 4, 1, GETDATE());
GO

-- =============================================================================
-- PARTE 6: MÓDULOS DEL SISTEMA Y GESTIÓN DE PERMISOS (06)
-- Compatible con Microsoft SQL Server 2008 R2 / 2012+
-- =============================================================================

-- 1. Asegurar campos en tabla de Usuarios
IF COL_LENGTH('dbo.AAC_Alcatraz_usuarios', 'origen') IS NULL
BEGIN
    ALTER TABLE dbo.AAC_Alcatraz_usuarios ADD origen VARCHAR(20) NOT NULL DEFAULT 'SISTEMA';
END;
GO

IF COL_LENGTH('dbo.AAC_Alcatraz_usuarios', 'user') < 50
BEGIN
    ALTER TABLE dbo.AAC_Alcatraz_usuarios ALTER COLUMN [user] VARCHAR(50) NOT NULL;
END;
GO

IF COL_LENGTH('dbo.AAC_Alcatraz_usuarios', 'password') < 100
BEGIN
    ALTER TABLE dbo.AAC_Alcatraz_usuarios ALTER COLUMN [password] VARCHAR(100) NOT NULL;
END;
GO

-- 2. Tabla de Catálogo de Módulos
IF OBJECT_ID('dbo.AAC_Alcatraz_modulos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.AAC_Alcatraz_modulos (
        id INT IDENTITY(1,1) NOT NULL,
        clave VARCHAR(50) NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        ruta VARCHAR(100) NOT NULL,
        icono VARCHAR(50) NOT NULL,
        orden INT NOT NULL DEFAULT 1,
        activo BIT NOT NULL DEFAULT 1,
        CONSTRAINT PK_AAC_Alcatraz_modulos PRIMARY KEY (id),
        CONSTRAINT UQ_AAC_Alcatraz_modulos_clave UNIQUE (clave)
    );
END;
GO

-- 3. Tabla de Permisos de Usuario
IF OBJECT_ID('dbo.AAC_Alcatraz_permisos_usuario', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.AAC_Alcatraz_permisos_usuario (
        id INT IDENTITY(1,1) NOT NULL,
        usuario_id INT NOT NULL,
        modulo_clave VARCHAR(50) NOT NULL,
        permitido BIT NOT NULL DEFAULT 1,
        fecha_asignacion DATETIME NOT NULL DEFAULT GETDATE(),
        usuario_asigno_id INT NULL,
        CONSTRAINT PK_AAC_Alcatraz_permisos_usuario PRIMARY KEY (id),
        CONSTRAINT UQ_AAC_usuario_modulo UNIQUE (usuario_id, modulo_clave),
        CONSTRAINT FK_AAC_permisos_usuario FOREIGN KEY (usuario_id) REFERENCES dbo.AAC_Alcatraz_usuarios(id)
    );
END;
GO

-- 4. Sembrado de Módulos Base
MERGE INTO dbo.AAC_Alcatraz_modulos AS target
USING (
    SELECT 'RESERVAS' AS clave, 'Reservas' AS nombre, '/reservas' AS ruta, 'Calendar' AS icono, 1 AS orden UNION ALL
    SELECT 'PAGOS', 'Pagos', '/pagos', 'HandCoins', 2 UNION ALL
    SELECT 'CORTES', 'Cortes', '/cortes', 'ReceiptText', 3 UNION ALL
    SELECT 'ESTADO_RESULTADOS', 'Estado de Resultados', '/estado-resultados', 'BarChart3', 4 UNION ALL
    SELECT 'RENTAS', 'Control de Rentas', '/rentas', 'Building2', 5 UNION ALL
    SELECT 'REPORTES', 'Reportes', '/reporteador', 'ClipboardMinus', 6 UNION ALL
    SELECT 'PERMISOS', 'Gestión de Permisos', '/permisos', 'ShieldCheck', 7
) AS source
ON (target.clave = source.clave)
WHEN MATCHED THEN
    UPDATE SET 
        target.nombre = source.nombre,
        target.ruta = source.ruta,
        target.icono = source.icono,
        target.orden = source.orden,
        target.activo = 1
WHEN NOT MATCHED THEN
    INSERT (clave, nombre, ruta, icono, orden, activo)
    VALUES (source.clave, source.nombre, source.ruta, source.icono, source.orden, 1);
GO

-- =============================================================================
-- PARTE 7: CONTROL DE PRIMER INGRESO - CAMBIO DE CONTRASEÑA (07)
-- Compatible con Microsoft SQL Server 2008 R2 / 2012+
-- =============================================================================

IF COL_LENGTH('dbo.AAC_Alcatraz_usuarios', 'debe_cambiar_password') IS NULL
BEGIN
    ALTER TABLE dbo.AAC_Alcatraz_usuarios 
    ADD debe_cambiar_password BIT NOT NULL CONSTRAINT DF_AAC_usuarios_cambio_pwd DEFAULT 0;
END;
GO
