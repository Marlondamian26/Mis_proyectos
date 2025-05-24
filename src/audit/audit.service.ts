import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ANNULLED = 'ANNULLED',
  SOFT_DELETE = 'SOFT_DELETE'
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(
    userId: string,
    action: AuditAction,
    entityName: string,
    entityId: string,
    oldData?: any,
    newData?: any,
  ): Promise<void> {
    const auditLog = this.auditLogRepository.create({
      userId,
      action,
      entityName,
      entityId,
      oldData: oldData ? JSON.stringify(oldData) : null,
      newData: newData ? JSON.stringify(newData) : null,
      timestamp: new Date(),
    });

    await this.auditLogRepository.save(auditLog);
  }

  async getLogs(
    entityName?: string,
    entityId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AuditLog[]> {
    const query = this.auditLogRepository.createQueryBuilder('audit_log');

    if (entityName) {
      query.andWhere('audit_log.entityName = :entityName', { entityName });
    }

    if (entityId) {
      query.andWhere('audit_log.entityId = :entityId', { entityId });
    }

    if (startDate) {
      query.andWhere('audit_log.timestamp >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('audit_log.timestamp <= :endDate', { endDate });
    }

    return query.orderBy('audit_log.timestamp', 'DESC').getMany();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldLogs() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    await this.auditLogRepository.delete({
      timestamp: LessThan(oneYearAgo),
    });
  }
} 