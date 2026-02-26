<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# ⚡ CSMS - Sistema de Gestión de Estaciones de Carga (Backend)

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-red.svg)](https://nestjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue.svg)](https://postgresql.org)
[![JWT](https://img.shields.io/badge/JWT-Auth-orange.svg)](https://jwt.io)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Descripción General

Backend desarrollado para gestionar el proceso de facturación como parte del **Sistema de Gestión de Estaciones de Carga (CSMS)** como parte del proyecto nacional **"Phase"**, una iniciativa del centro **VERTEX** de la Universidad de Ciencias Informáticas (UCI), La Habana, Cuba.

Este sistema constituye la columna vertebral tecnológica para la gestión de la monetización y pago por sesiones de carga de vehículos eléctricos en estaciones de carga del país, permitiendo la administración eficiente del proceso de facturación.

## 🏗️ Arquitectura
┌─────────────────────────────────────┐
│ Clientes (Apps/Frontend) │
└───────────────┬─────────────────────┘
│
┌───────────────▼─────────────────────┐
│ API Gateway / Load Balancer │
└───────────────┬─────────────────────┘
│
┌───────────────▼─────────────────────┐
│ CSMS - Backend Core │
│ ┌─────────────────────────────┐ │
│ │ Módulo de Conductores │ │
│ │ Módulo de Facturas │ │
│ │ Módulo de Tarifas │ │
│ │ Módulo de Tarjetas │ │
│ │ Módulo de Pagos │ │
│ └─────────────────────────────┘ │
└───────────────┬─────────────────────┘
│
┌───────────────▼─────────────────────┐
│ PostgreSQL Database │
└─────────────────────────────────────┘

Claro, aquí tienes un esquema de la estructura de archivos del proyecto `backend-csms` basado en la información que proporcionaste. Está organizado para ser claro y útil en el README, destacando las carpetas principales y los archivos más relevantes.

### Estructura de archivos del proyecto:
backend-csms/
├── 📁 src/                          # Código fuente principal
│   ├── 📁 auth/                     # Autenticación (JWT, guards, estrategias)
│   ├── 📁 auditoria/                # Registro de auditoría
│   ├── 📁 common/                    # Utilidades compartidas (decoradores, pipes, filtros)
│   ├── 📁 config/                    # Configuración (base de datos, etc.)
│   ├── 📁 database/                  # Módulo de base de datos
│   ├── 📁 health/                    # Health check
│   ├── 📁 migrations/                # Migraciones de BD (ej. 1745642445014-InitialSchema.ts)
│   ├── 📁 modules/                   # Módulos de negocio
│   │   ├── 📁 conductores/            # Gestión de conductores
│   │   ├── 📁 facturas/               # Facturación
│   │   ├── 📁 pagos/                  # Pagos
│   │   ├── 📁 tarifas/                # Tarifas
│   │   └── 📁 tarjetas/               # Tarjetas de pago
│   ├── 📁 audit/                     # (posiblemente relativo a auditoría)
│   ├── 📁 exceptions/                 # Excepciones personalizadas
│   ├── 📁 interfaces/                 # Interfaces TypeScript
│   ├── 📁 dto/                        # Data Transfer Objects globales
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
│
├── 📁 test/                          # Pruebas end-to-end y configuración
│   ├── 📁 jmeter/                    # Pruebas de carga con JMeter
│   ├── app.e2e-spec.ts
│   ├── conductores.e2e-spec.ts
│   ├── facturas.e2e-spec.ts
│   ├── pagos.e2e-spec.ts
│   ├── tarifas.e2e-spec.ts
│   ├── tarjetas.e2e-spec.ts
│   ├── jest-e2e.json
│   └── setup.ts
│
├── 📁 docs/                          # Documentación y recursos
│   ├── 📁 Diagramas/                  # Diagramas PlantUML (clases, componentes, BD)
│   ├── 📁 postman/                    # Colecciones y entornos de Postman
│   ├── 📁 reports/                    # Reportes de pruebas (HTML, CSS, JS)
│   │   ├── 📁 content/                 # Recursos de reportes
│   │   └── security-report.html
│   ├── 📁 scripts/                    # Scripts de utilidad (backup, seed, pruebas)
│   │   ├── backup.ps1
│   │   ├── backup.sh
│   │   ├── clean-test-db.js
│   │   ├── create-test-db.sh
│   │   ├── create-test-db.sql
│   │   ├── run-security-tests.ps1
│   │   └── seed-test-db.js
│   └── 📁 jmeter/                     # Configuración y resultados de JMeter
│       ├── http_request.jmx
│       └── results/
│
├── 📁 resultados/                     # (Carpeta de resultados, posiblemente de pruebas)
├── .gitignore
├── .prettierrc
├── clean-jmeter-results.ps1
├── comandos-git.md                    # Guía de comandos Git
├── eslint.config.mjs
├── jest.config.js
├── nest-cli.json
├── package-lock.json
├── package.json
├── run-tests.ps1
├── test.env
├── tsconfig.build.json
└── tsconfig.json
```

### 📌 Notas sobre la estructura:
- **src/modules**: Contiene los módulos funcionales del negocio, cada uno con sus DTOs, entidades, controladores y servicios.
- **docs**: Agrupa toda la documentación técnica, diagramas, colecciones de Postman y reportes de pruebas.
- **test**: Pruebas e2e organizadas por módulo.
- **scripts**: Utilidades para tareas como backup, seed de BD y pruebas de seguridad.


## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 18.x | Entorno de ejecución |
| **NestJS** | 10.x | Framework principal |
| **TypeScript** | 5.x | Lenguaje de programación |
| **PostgreSQL** | 15.x | Base de datos relacional |
| **TypeORM** | 0.3.x | ORM para base de datos |
| **JWT** | - | Autenticación |
| **Jest** | 29.x | Testing unitario |
| **Docker** | - | Contenerización |


## ⚙️ Instalación y Configuración

### Prerrequisitos
- Node.js 18.x o superior
- PostgreSQL 15.x
- npm o yarn

### Pasos de instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/Marlondamian26/Mis_proyectos.git
cd Mis_proyectos/backend-csms

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Crear base de datos en PostgreSQL
# (usando pgAdmin o línea de comandos, a continuación se muestran algunos comandos a tener presente)
CREATE USER phase_user WITH PASSWORD 'm';                       <---- crear usuario de la base de datos
CREATE DATABASE phase_platform OWNER phase_user;                <----- crear la base de datos

psql --version    <---- Verificar versión de Postgre
psql -U postgres  <---- entrar en postgre
postgres=# \q     <---- salir de postgre

psql -h localhost -U phase_user -p 5432 -d phase_platform       <---- acceder a la base de datos
\dt   o    \l                                                   <----- comprobar tablas en base de datos
\d+ nombre_tabla                                                <---- comprobar atributos de una tabla

psql -U phase_user -d phase_platform -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"   <----- borrar todas las tablas de la base de datos

psql -U phase_user -d phase_platform -c "
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO phase_user;
GRANT ALL ON SCHEMA public TO public;
COMMENT ON SCHEMA public IS 'standard public schema';"       <----- borrar toda la información de la base de datos

pg_dump -U phase_user -d phase_platform -Fc -f "phase_backup_$(Get-Date -Format 'yyyyMMdd').dump"     <----- hacer copia de seguridad de la base de datos

# Desde el terminal integrado de VSCode (Ctrl+`)
pg_dump -h localhost -U phase_user -d phase_platform -F c -b -v -f "backup_$(Get-Date -Format 'yyyy-MM-dd_HHmmss').dump"     <----- hacer copia de seguridad de la base de datos con fecha y hora

Get-ChildItem -Path . -Filter "phase_backup_*.dump" | Sort-Object LastWriteTime -Descending | Select-Object -First 1      <----- encontrar copia de seguridad de la base de datos


# 5. Ejecutar migraciones
npm run migration:run

# 6. Iniciar el servidor
npm run start:dev
Variables de Entorno (.env)
env
# Servidor
PORT=3000
NODE_ENV=development


#env configuración:
# Entorno
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=phase_user
DB_PASSWORD=m
DB_DATABASE=phase_platform

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=1d

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Cache
CACHE_TTL=60000
CACHE_MAX=100

# SSL (solo para producción)
SSL_ENABLED=false


# Configuración de CORS
FRONTEND_URL=http://localhost:4200  # En desarrollo
# FRONTEND_URL=https://tu-dominio.com  # En producción


🧪 Pruebas
bash
# Pruebas unitarias
npm run test

# Pruebas e2e
npm run test:e2e

Usar Redis para caché de sesiones
REDIS_URL=redis://localhost:6379/1


👥 Contribuciones
Este proyecto forma parte del ecosistema Phase. Las contribuciones deben seguir las guías de estilo establecidas y pasar todas las pruebas.

📄 Licencia
MIT © Marlon Damián

📞 Contacto
Autor: Marlon Damián Monterrey Morejón

Email: [monterreymorejonm@gmail.com]

Portafolio: https://Marlondamian26.github.io/Mi_portafolio

Proyecto desarrollado para el centro Vertex de la Facultad de Tecnologías interactivas de la Universidad de Ciencias Informáticas de la Habana, Cuba. Forma parte del portafolio personal de Marlon Damián.
"Soluciones tecnológicas para la electromovilidad en Cuba" ⚡