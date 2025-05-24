import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConductoresModule } from './conductores/conductores.module';
import { TarifasModule } from './tarifas/tarifas.module';
import { PagosModule } from './pagos/pagos.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarjetasModule } from './tarjetas/tarjetas.module';
import { FacturasModule } from './facturas/facturas.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
      PrometheusModule.register(),
      
      // Configuración de variables de entorno
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: ['.env', `.env.${process.env.NODE_ENV || 'development'}`],
        cache: true,
        expandVariables: true,
      }),
      
      // Configuración de caché
      CacheModule.register({
          isGlobal: true,
        ttl: 60000, // 1 minuto
        max: 100, // máximo de items en caché
      }),

      // Configuración optimizada de TypeORM
        TypeOrmModule.forRootAsync({ 
          imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('NODE_ENV') !== 'production',
          autoLoadEntities: true,
          logging: configService.get('NODE_ENV') !== 'production',
          // Optimizaciones de conexión
            extra: {
            poolSize: 20,
            connectionTimeoutMillis: 5000,
            idleTimeoutMillis: 30000,
          },
          // Caché de consultas
          cache: {
            duration: 60000 // 1 minuto
          },
          // Índices y optimizaciones
          ssl: configService.get('NODE_ENV') === 'production' ? {
            rejectUnauthorized: false
          } : false,
        }),
        inject: [ConfigService],
        }),
    
    ConductoresModule, 
    TarifasModule, 
    PagosModule, 
    AuditoriaModule,
    TarjetasModule,
    FacturasModule,
    AuthModule,
  
  ],

  controllers: [AppController],
  providers: [
    AppService
  ],
  exports: [TypeOrmModule],
})

export class AppModule {}
