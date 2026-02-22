// tarjeta.entity.ts
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Conductor } from '../../conductores/entities/conductor.entity';
import { Auditoria } from '../../auditoria/entities/auditoria.entity';

@Entity()
export class TarjetaRFID {
  @PrimaryColumn({ length: 20 })
  id: string; // Formato: TEMP-123 o PERM-123

  @Column({ 
    type: 'enum',
    enum: ['activa', 'inactiva', 'expirada'],
    default: 'activa'
  })
  estado: string;

  @Column({ type: 'date' })
  fecha_emision: Date;

  @Column({ type: 'date' })
  fecha_expiracion: Date;

  @Column({ default: false })
  es_temporal: boolean;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ nullable: true })
  motivo_inactivacion?: string;

  @ManyToOne(() => Conductor, { nullable: true })
  @JoinColumn({ name: 'conductor_id' })
  conductor?: Conductor;

  @Column({ nullable: true })
  conductor_id?: string;

  auditorias?: Auditoria[];
}