import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturaService } from './facturas.service';
import { FacturaController } from './facturas.controller';
import { Factura } from './entities/factura.entity';
import { Pago } from '../pagos/entities/pago.entity';
import { Conductor } from '../conductores/entities/conductor.entity';
import { Tarifa } from '../tarifas/entities/tarifa.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Factura, Pago, Conductor, Tarifa]),
    AuditModule
  ],
  controllers: [FacturaController],
  providers: [FacturaService],
  exports: [FacturaService]
})
export class FacturasModule {}