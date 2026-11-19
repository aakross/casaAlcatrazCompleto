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

