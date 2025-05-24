import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { AuditAction } from '../audit.service';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: ['CREATE', 'UPDATE', 'DELETE', 'READ'], // Aquí defines los valores permitidos
    default: 'READ'
   })
  action: string;

  @Column()
  entityName: string;

  @Column()
  entityId: string;

  @Column({ type: 'jsonb', nullable: true })
  oldData: any;

  @Column({ type: 'jsonb', nullable: true })
  newData: any;

  @CreateDateColumn()
  timestamp: Date;
} 