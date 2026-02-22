//tarifa.entity.ts
import { Auditoria } from 'src/auditoria/entities/auditoria.entity';
import { Entity, Column, PrimaryGeneratedColumn, DeleteDateColumn } from 'typeorm';

@Entity()
export class Tarifa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  tipo_conector: string; // Mock temporal hasta integración con otro microservicio

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  precio_kwh: number;

  @Column({ type: 'time' })
  hora_inicio: string;

  @Column({ type: 'time' })
  hora_fin: string;

  @Column({ type: 'varchar', length: 3 })
  moneda: 'CUP' | 'USD';

  @DeleteDateColumn()
  deletedAt?: Date;

  // Campo calculado virtual (no se persiste)
  precio_equivalente?: number;

  auditorias?: Auditoria[];
}