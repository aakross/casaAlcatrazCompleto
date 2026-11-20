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

IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_origen_dinero] WHERE id = 4)
    INSERT INTO [dbo].[AAC_Alcatraz_origen_dinero] (id, nombre, descripcion, created_at, user_create_id)
    VALUES (4, 'Otro Cargo', 'Deducción operativa o publicidad', GETDATE(), 1);
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

IF NOT EXISTS (SELECT 1 FROM [dbo].[AAC_Alcatraz_concepto_pago] WHERE id = 5)
    INSERT INTO [dbo].[AAC_Alcatraz_concepto_pago] (id, descripcion, created_at, user_create_id)
    VALUES (5, 'Otro Gasto / Publicidad', GETDATE(), 1);
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
