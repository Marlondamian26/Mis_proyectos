// src/tarifas/tarifas.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarifasService } from './tarifas.service';
import { TarifasController } from './tarifas.controller';
import { Tarifa } from './entities/tarifa.entity';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tarifa]),
    AuditoriaModule
  ],
  controllers: [TarifasController],
  providers: [TarifasService],
  exports: [TarifasService]
})
export class TarifasModule {}
