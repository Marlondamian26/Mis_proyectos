import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { DataSource, QueryRunner } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let dataSource: DataSource;
  let loggerSpy: jest.SpyInstance;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    // Agregamos las propiedades requeridas por QueryRunner
    connection: {} as any,
    manager: {} as any,
    isReleased: false,
    isTransactionActive: false,
    query: jest.fn(),
    execute: jest.fn(),
    getQuery: jest.fn(),
    getRawQuery: jest.fn(),
    getParameters: jest.fn(),
    getSql: jest.fn(),
    getRawSql: jest.fn(),
    getQueryAndParameters: jest.fn(),
    getRawQueryAndParameters: jest.fn(),
    getSqlAndParameters: jest.fn(),
    getRawSqlAndParameters: jest.fn(),
    getQueryBuilder: jest.fn(),
    getRawQueryBuilder: jest.fn(),
    getSqlQueryBuilder: jest.fn(),
    getRawSqlQueryBuilder: jest.fn(),
    getQueryAndParametersQueryBuilder: jest.fn(),
    getRawQueryAndParametersQueryBuilder: jest.fn(),
    getSqlAndParametersQueryBuilder: jest.fn(),
    getRawSqlAndParametersQueryBuilder: jest.fn(),
    getQueryAndParametersSqlQueryBuilder: jest.fn(),
    getRawQueryAndParametersSqlQueryBuilder: jest.fn(),
    getSqlAndParametersSqlQueryBuilder: jest.fn(),
    getRawSqlAndParametersSqlQueryBuilder: jest.fn(),
  } as unknown as QueryRunner;

  const mockDataSource = {
    query: jest.fn(),
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  } as unknown as DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
    dataSource = module.get<DataSource>(getDataSourceToken());
    
    // Configuramos el spy del logger para evitar logs en consola
    loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    loggerSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return true when database is healthy', async () => {
      (mockDataSource.query as jest.Mock).mockResolvedValueOnce([{ '?column?': 1 }]);

      const result = await service.checkHealth();

      expect(result).toBe(true);
      expect(mockDataSource.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('should return false when database is unhealthy', async () => {
      (mockDataSource.query as jest.Mock).mockRejectedValueOnce(new Error('Connection failed'));

      const result = await service.checkHealth();

      expect(result).toBe(false);
      expect(mockDataSource.query).toHaveBeenCalledWith('SELECT 1');
    });
  });

  describe('executeInTransaction', () => {
    it('should execute operation and commit transaction successfully', async () => {
      const mockOperation = jest.fn().mockResolvedValueOnce('success');
      
      const result = await service.executeInTransaction(mockOperation);

      expect(result).toBe('success');
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
    });

    it('should rollback transaction when operation fails', async () => {
      const mockError = new Error('Operation failed');
      const mockOperation = jest.fn().mockRejectedValueOnce(mockError);

      await expect(service.executeInTransaction(mockOperation))
        .rejects.toThrow(mockError);

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
    });

    it('should release queryRunner even if operation fails', async () => {
      const mockOperation = jest.fn().mockRejectedValueOnce(new Error('Operation failed'));

      await expect(service.executeInTransaction(mockOperation))
        .rejects.toThrow();

      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('monitorDatabase', () => {
    it('should log warning when database is unhealthy', async () => {
      const loggerSpy = jest.spyOn(service['logger'], 'warn');
      (mockDataSource.query as jest.Mock).mockRejectedValueOnce(new Error('Connection failed'));

      await service.monitorDatabase();

      expect(loggerSpy).toHaveBeenCalledWith('La base de datos no está respondiendo correctamente');
    });

    it('should not log warning when database is healthy', async () => {
      const loggerSpy = jest.spyOn(service['logger'], 'warn');
      (mockDataSource.query as jest.Mock).mockResolvedValueOnce([{ '?column?': 1 }]);

      await service.monitorDatabase();

      expect(loggerSpy).not.toHaveBeenCalled();
    });
  });

  describe('getHealthStatus', () => {
    it('should return current health status', () => {
      const status = service.getHealthStatus();
      expect(typeof status).toBe('boolean');
    });
  });

  describe('getDatabaseStats', () => {
    it('should return database statistics', async () => {
      const mockStats = {
        database: 'phase_platform',
        active_connections: 5,
        transactions_committed: 100,
        transactions_rollback: 2,
        blocks_read: 1000,
        blocks_hit: 5000,
      };

      (mockDataSource.query as jest.Mock).mockResolvedValueOnce([mockStats]);

      const result = await service.getDatabaseStats();

      expect(result).toEqual(mockStats);
      expect(mockDataSource.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
    });

    it('should throw error when stats query fails', async () => {
      const mockError = new Error('Stats query failed');
      (mockDataSource.query as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(service.getDatabaseStats())
        .rejects.toThrow(mockError);
    });
  });
}); 