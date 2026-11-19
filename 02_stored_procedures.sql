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

