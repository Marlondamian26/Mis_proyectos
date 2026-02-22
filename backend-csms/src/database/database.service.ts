// src/database/database.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  private isHealthy = true;

  constructor(
    @InjectDataSource() private dataSource: DataSource
  ) {}

  // Método para verificar la salud de la base de datos
  async checkHealth(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      this.isHealthy = true;
      return true;
    } catch (error) {
      this.isHealthy = false;
      this.logger.error('Error de conexión a la base de datos:', error);
      return false;
    }
  }

  // Método para ejecutar operaciones en transacción
  async executeInTransaction<T>(
    operation: (queryRunner: QueryRunner) => Promise<T>
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await operation(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error en transacción:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Monitoreo periódico de la base de datos
  @Cron(CronExpression.EVERY_MINUTE)
  async monitorDatabase() {
    const isHealthy = await this.checkHealth();
    if (!isHealthy) {
      this.logger.warn('La base de datos no está respondiendo correctamente');
      // Aquí podrías implementar notificaciones (email, Slack, etc.)
    }
  }

  // Método para verificar el estado actual
  getHealthStatus(): boolean {
    return this.isHealthy;
  }

  // Método para obtener estadísticas de la base de datos
  async getDatabaseStats() {
    try {
      const stats = await this.dataSource.query(`
        SELECT 
          datname as database,
          numbackends as active_connections,
          xact_commit as transactions_committed,
          xact_rollback as transactions_rollback,
          blks_read as blocks_read,
          blks_hit as blocks_hit
        FROM pg_stat_database 
        WHERE datname = 'phase_platform'
      `);
      return stats[0];
    } catch (error) {
      this.logger.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
}