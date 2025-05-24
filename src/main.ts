import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationError, ValidationPipe } from '@nestjs/common';
import { ValidationException } from './common/exceptions/base.exception';
import { Reflector } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { APP_GUARD } from '@nestjs/core';
import compression from 'compression';
import cluster from 'cluster';
import * as os from 'os';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Configuración de producción
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug', 'verbose'],
    abortOnError: false,
  });

  // Configuración de seguridad y optimización
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : false) // En producción, solo permitir el dominio del frontend si está definido
      : ['http://localhost:3000', 'http://localhost:4200'], // En desarrollo, permitir localhost
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 3600, // 1 hora
  };

  app.enableCors(corsOptions);
  
  app.use(compression());
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors: ValidationError[]) => new ValidationException(errors.toString()),
  }));

  // Configuración de archivos estáticos
  app.useStaticAssets('public', {
    maxAge: '1d',
    immutable: true
  });

  // 4. Configurar microservicio
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3001,
    },
  });

  // 5. Configuración de Swagger (mejorada)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Phase Platform API')
    .setDescription('API para gestión de reservaciones, conductores y pagos')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Ingresar token JWT',
    })
    .addServer(process.env.API_URL || 'http://localhost:3000') // Especificar entorno
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document); // Mejor ruta: /docs

  // 7. Iniciar servicios
  await app.startAllMicroservices();
  // Filtro global de excepciones
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configuración del puerto
  const port = process.env.PORT || 3000;
  if (process.env.NODE_ENV === 'production') {
    app.enableShutdownHooks();
  }

  await app.listen(port);
  console.log(`🚀 Servicio HTTP en http://localhost:${port}`);
  console.log(`📚 Documentación API en http://localhost:${port}/docs`);
}

// Implementación de clustering
if (process.env.NODE_ENV === 'production') {
  if (cluster.isPrimary) {
    const numCPUs = os.cpus().length;
    console.log(`Primary ${process.pid} is running`);
    console.log(`Forking for ${numCPUs} CPUs`);

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died`);
      cluster.fork();
    });
  } else {
    bootstrap();
  }
} else {
  bootstrap();
}


