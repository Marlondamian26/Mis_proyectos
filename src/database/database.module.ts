import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseService } from './database.service';
import { DatabaseController } from './database.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'phase_platform',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      autoLoadEntities: true,
      logging: true,
      ssl: process.env.DB_SSL === 'true',
      extra: {
        connectionLimit: 10,
        max: 20, // máximo de conexiones en el pool
        idleTimeoutMillis: 30000, // tiempo máximo de inactividad
        connectionTimeoutMillis: 2000, // timeout de conexión
      }
    }),
    ScheduleModule.forRoot(), // Para el monitoreo periódico
  ],
  controllers: [DatabaseController],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {} 