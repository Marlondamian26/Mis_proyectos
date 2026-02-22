// factura.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Pago } from '../../pagos/entities/pago.entity';
import { Conductor } from '../../conductores/entities/conductor.entity';
import { Tarifa } from '../../tarifas/entities/tarifa.entity';
import { AuditHistoryDto } from '../dto/audit-history.dto';

@Entity()
export class Factura {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Column({ length: 3 })
  moneda: 'CUP' | 'USD';

  @Column('float')
  consumo_kwh: number;

  @Column('float')
  iva: number;

  @Column({ default: 'active' })
  status: 'active' | 'annulled';

  @Column({ type: 'jsonb' })
  auditLogs: AuditHistoryDto[];

  @Column({ type: 'timestamptz' })
  fecha_emision: Date;

  @Column({ nullable: true })
  notas?: string;

  @Column({ nullable: true })
  referencia_pago?: string;

  // Relaciones con entidades existentes
  @OneToOne(() => Pago)
  @JoinColumn()
  pago: Pago;

  @ManyToOne(() => Conductor)
  @JoinColumn()
  conductor: Conductor;

  @ManyToOne(() => Tarifa)
  @JoinColumn()
  tarifa: Tarifa;
}