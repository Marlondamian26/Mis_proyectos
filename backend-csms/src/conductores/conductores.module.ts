import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConductoresController } from './conductores.controller';
import { ConductoresService } from './conductores.service';
import { Conductor } from './entities/conductor.entity';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conductor]),
    AuditoriaModule, // Importar módulo de auditoría
  ],
  controllers: [ConductoresController],
  providers: [ConductoresService],
  exports: [ConductoresService], // ¡Esta línea es crucial!
})
export class ConductoresModule {}
