// src/pagos/pagos.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { Pago } from './entities/pago.entity';
import { ConductoresModule } from '../conductores/conductores.module';
import { TarifasModule } from '../tarifas/tarifas.module'; // Asegurar importación

@Module({
  imports: [
    TypeOrmModule.forFeature([Pago]),
    ConfigModule,
    ConductoresModule,
    TarifasModule // Añadir esto
  ],
  controllers: [PagosController],
  providers: [PagosService],
  exports: [PagosService]
})
export class PagosModule {}
