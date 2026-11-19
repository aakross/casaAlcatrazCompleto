-- =========================================================================
-- CASA ALCATRAZ - 07_alter_usuarios_debe_cambiar_password.sql
-- Agregar columna debe_cambiar_password para control de primer ingreso
-- Compatible con Microsoft SQL Server 2008 R2 / 2012+
-- =========================================================================

IF COL_LENGTH('dbo.AAC_Alcatraz_usuarios', 'debe_cambiar_password') IS NULL
BEGIN
    ALTER TABLE dbo.AAC_Alcatraz_usuarios 
    ADD debe_cambiar_password BIT NOT NULL CONSTRAINT DF_AAC_usuarios_cambio_pwd DEFAULT 0;
    PRINT 'Columna debe_cambiar_password agregada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La columna debe_cambiar_password ya existia.';
END;
GO
