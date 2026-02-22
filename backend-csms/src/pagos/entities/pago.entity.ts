//pago.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Conductor } from '../../conductores/entities/conductor.entity';
import { Tarifa } from '../../tarifas/entities/tarifa.entity';


@Entity()
export class Pago {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  monto: number;

  @Column()
  metodo_pago: 'tarjeta' | 'efectivo';

  @Column()
  estado: 'pendiente' | 'confirmado' | 'fallido';

  @Column({ type: 'timestamptz' })
  fecha_hora: Date;

  @Column({ nullable: true })
  enlace_pago?: string; // URL único para redirección

  @Column({ nullable: true })
  qr_data?: string; // Datos cifrados para el QR

  @Column({ type: 'timestamptz', nullable: true })
  qr_expiracion?: Date; // Tiempo de expiración del QR

  // Campos para pagos con tarjeta
  @Column({ nullable: true })
  banco?: string;

  @Column({ nullable: true })
  ultimos_digitos?: string;

  // Relación con conductor
  @ManyToOne(() => Conductor)
  @JoinColumn({ name: 'conductor_id' })
  conductor: Conductor;

  // Relación con tarifa aplicada
  @ManyToOne(() => Tarifa, { eager: true }) // Carga automática de la relación
  @JoinColumn({ name: 'tarifa_id' })
  tarifa: Tarifa;

  @Column({ nullable: true })
  referencia_externa?: string; // ID de transacción del gateway
}