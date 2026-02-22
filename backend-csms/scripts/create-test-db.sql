-- Eliminar la base de datos si existe
DROP DATABASE IF EXISTS test_db;

-- Crear la base de datos
CREATE DATABASE test_db;

-- Conectar a la base de datos
\c test_db;

-- Crear el esquema
CREATE SCHEMA IF NOT EXISTS public;

-- Dar privilegios
GRANT ALL PRIVILEGES ON DATABASE test_db TO test;
GRANT ALL PRIVILEGES ON SCHEMA public TO test; 