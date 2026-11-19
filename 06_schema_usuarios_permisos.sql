-- =========================================================================
-- CASA ALCATRAZ - 06_schema_usuarios_permisos.sql
-- Módulos del Sistema y Control Dinámico de Permisos por Usuario
-- Compatible con Microsoft SQL Server 2008 R2 / 2012+
-- =========================================================================

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
