import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Conductor } from '../../conductores/entities/conductor.entity';

@Entity()
export class Auditoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tablaAfectada: string;

  @Column()
  operacion: 'CREATE' | 'UPDATE' | 'DELETE';

  @Column('jsonb')
  datosViejos: any;

  @Column('jsonb')
  datosNuevos: any;

  @Column()
  usuario: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

}