// src/tarjetas/tarjetas.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarjetasService } from './tarjetas.service';
import { TarjetasController } from './tarjetas.controller';
import { TarjetaRFID } from './entities/tarjeta.entity';
import { ConductoresModule } from '../conductores/conductores.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TarjetaRFID]),
    ConductoresModule,
    AuditoriaModule
  ],
  controllers: [TarjetasController],
  providers: [TarjetasService],
  exports: [TarjetasService]
})
export class TarjetasModule {}