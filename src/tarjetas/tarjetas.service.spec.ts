import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { TarjetasService } from './tarjetas.service';
import { TarjetaRFID } from './entities/tarjeta.entity';
import { CreateTarjetaDto } from './dto/create-tarjeta.dto';
import { UpdateTarjetaDto } from './dto/update-tarjeta.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { ConductoresService } from '../conductores/conductores.service';

describe('TarjetasService', () => {
  let service: TarjetasService;
  let repository: Repository<TarjetaRFID>;
  let auditoriaService: AuditoriaService;
  let conductoresService: ConductoresService;

  const mockConductor = {
    id: '1',
    nombre: 'Test Conductor',
    email: 'test@example.com',
  };

  const mockTarjeta = {
    id: 'TEMP-123',
    estado: 'activa',
    fecha_emision: new Date(),
    fecha_expiracion: new Date('2025-12-31'),
    es_temporal: true,
    conductor_id: '1',
    conductor: mockConductor,
  };

  const mockRepository = {
    create: jest.fn().mockImplementation((data) => ({ ...mockTarjeta, ...data })),
    save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    find: jest.fn().mockResolvedValue([mockTarjeta]),
    findOne: jest.fn().mockImplementation((options) => {
      if (options?.where?.id === 'TEMP-123') {
        return Promise.resolve({ ...mockTarjeta });
      }
      return Promise.resolve(null);
    }),
    findOneBy: jest.fn().mockImplementation((criteria) => {
      if (criteria.id === 'TEMP-123') {
        return Promise.resolve({ ...mockTarjeta });
      }
      return Promise.resolve(null);
    }),
    update: jest.fn(),
    softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockTarjeta]),
    })),
  };

  const mockAuditoriaService = {
    crearRegistro: jest.fn().mockResolvedValue(undefined),
  };

  const mockConductoresService = {
    findOne: jest.fn().mockImplementation((id) => {
      if (id === '1') {
        return Promise.resolve(mockConductor);
      }
      return Promise.resolve(null);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TarjetasService,
        {
          provide: getRepositoryToken(TarjetaRFID),
          useValue: mockRepository,
        },
        {
          provide: AuditoriaService,
          useValue: mockAuditoriaService,
        },
        {
          provide: ConductoresService,
          useValue: mockConductoresService,
        },
      ],
    }).compile();

    service = module.get<TarjetasService>(TarjetasService);
    repository = module.get<Repository<TarjetaRFID>>(getRepositoryToken(TarjetaRFID));
    auditoriaService = module.get<AuditoriaService>(AuditoriaService);
    conductoresService = module.get<ConductoresService>(ConductoresService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a tarjeta successfully', async () => {
      const createDto: CreateTarjetaDto = {
        id: 'TEMP-123',
        fecha_expiracion: new Date('2025-12-31'),
        conductor_id: '1',
      };

      const usuario = 'test@example.com';
      const expectedTarjeta = {
        ...mockTarjeta,
        ...createDto,
      };

      // Mock conductor exists
      mockConductoresService.findOne.mockResolvedValueOnce(mockConductor);
      mockRepository.create.mockReturnValue(expectedTarjeta);
      mockRepository.save.mockResolvedValue(expectedTarjeta);

      const result = await service.create(createDto, usuario);
      
      expect(result).toEqual(expectedTarjeta);
      expect(conductoresService.findOne).toHaveBeenCalledWith('1');
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining(createDto));
      expect(repository.save).toHaveBeenCalledWith(expectedTarjeta);
      expect(auditoriaService.crearRegistro).toHaveBeenCalledWith({
        tablaAfectada: 'tarjetas',
        operacion: 'CREATE',
        datosViejos: {},
        datosNuevos: expectedTarjeta,
        usuario
      });
    });

    it('should create a temporal tarjeta when no conductor is provided', async () => {
      const createDto: CreateTarjetaDto = {
        id: 'TEMP-123',
        fecha_expiracion: new Date('2025-12-31'),
      };

      const usuario = 'test@example.com';
      const expectedTarjeta = {
        ...mockTarjeta,
        ...createDto,
        es_temporal: true,
      };

      mockRepository.create.mockReturnValue(expectedTarjeta);
      mockRepository.save.mockResolvedValue(expectedTarjeta);

      const result = await service.create(createDto, usuario);
      
      expect(result).toEqual(expectedTarjeta);
      expect(result.es_temporal).toBe(true);
      expect(conductoresService.findOne).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if tarjeta ID already exists', async () => {
      const createDto: CreateTarjetaDto = {
        id: 'TEMP-123',
        fecha_expiracion: new Date('2025-12-31'),
        conductor_id: '1',
      };

      // Mock conductor exists
      mockConductoresService.findOne.mockResolvedValueOnce(mockConductor);
      mockRepository.save.mockRejectedValueOnce(new Error('Duplicate entry'));

      await expect(service.create(createDto, 'test@example.com'))
        .rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if conductor does not exist', async () => {
      const createDto: CreateTarjetaDto = {
        id: 'TEMP-123',
        fecha_expiracion: new Date('2025-12-31'),
        conductor_id: 'nonexistent',
      };

      await expect(service.create(createDto, 'test@example.com'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updateEstado', () => {
    it('should update tarjeta estado successfully', async () => {
      const updateDto: UpdateTarjetaDto = {
        estado: 'inactiva',
        motivo: 'Tarjeta perdida',
      };

      const usuario = 'test@example.com';
      const updatedTarjeta = {
        ...mockTarjeta,
        estado: 'inactiva',
        motivo_inactivacion: 'Tarjeta perdida',
      };

      mockRepository.save.mockResolvedValue(updatedTarjeta);

      const result = await service.updateEstado('TEMP-123', updateDto, usuario);

      expect(result).toEqual(updatedTarjeta);
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
        estado: 'inactiva',
        motivo_inactivacion: 'Tarjeta perdida',
      }));
      expect(auditoriaService.crearRegistro).toHaveBeenCalledWith({
        tablaAfectada: 'tarjetas',
        operacion: 'UPDATE',
        datosViejos: mockTarjeta,
        datosNuevos: updatedTarjeta,
        usuario,
      });
    });

    it('should update fecha_expiracion successfully', async () => {
      const updateDto: UpdateTarjetaDto = {
        fecha_expiracion: new Date('2026-12-31'),
      };

      const usuario = 'test@example.com';
      const updatedTarjeta = {
        ...mockTarjeta,
        fecha_expiracion: new Date('2026-12-31'),
      };

      mockRepository.save.mockResolvedValue(updatedTarjeta);

      const result = await service.updateEstado('TEMP-123', updateDto, usuario);

      expect(result).toEqual(updatedTarjeta);
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
        fecha_expiracion: new Date('2026-12-31'),
      }));
    });

    it('should throw NotFoundException when tarjeta not found', async () => {
      const updateDto: UpdateTarjetaDto = {
        estado: 'inactiva',
      };

      await expect(service.updateEstado('nonexistent', updateDto, 'test@example.com'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findByFilters', () => {
    it('should find tarjetas with all filters', async () => {
      const fechaExpiracion = new Date('2025-12-31');
      const filters = {
        estado: 'activa',
        es_temporal: true,
        conductor_id: '1',
        fecha_expiracion: fechaExpiracion,
      };

      const result = await service.findByFilters(filters);

      expect(result).toEqual([mockTarjeta]);
      expect(repository.find).toHaveBeenCalledWith({
        where: {
          ...filters,
          fecha_expiracion: MoreThanOrEqual(fechaExpiracion),
        },
        relations: ['conductor'],
      });
    });

    it('should find tarjetas with partial filters', async () => {
      const filters = {
        estado: 'activa',
      };

      const result = await service.findByFilters(filters);

      expect(result).toEqual([mockTarjeta]);
      expect(repository.find).toHaveBeenCalledWith({
        where: filters,
        relations: ['conductor'],
      });
    });

    it('should find tarjetas with fecha_expiracion filter', async () => {
      const fechaExpiracion = new Date('2025-12-31');
      const filters = {
        fecha_expiracion: fechaExpiracion,
      };

      const result = await service.findByFilters(filters);

      expect(result).toEqual([mockTarjeta]);
      expect(repository.find).toHaveBeenCalledWith({
        where: {
          fecha_expiracion: MoreThanOrEqual(fechaExpiracion),
        },
        relations: ['conductor'],
      });
    });
  });

  describe('findAll', () => {
    it('should return all tarjetas with filters', async () => {
      const filters = {
        estado: 'activa',
      };

      const result = await service.findAll(filters);

      expect(result).toEqual([mockTarjeta]);
      expect(repository.find).toHaveBeenCalledWith({
        where: filters,
        relations: ['conductor'],
      });
    });
  });

  describe('remove', () => {
    it('should remove tarjeta successfully', async () => {
      const usuario = 'test@example.com';
      const motivo = 'Tarjeta perdida';

      await service.remove('TEMP-123', motivo, usuario);

      expect(repository.softDelete).toHaveBeenCalledWith('TEMP-123');
      expect(auditoriaService.crearRegistro).toHaveBeenCalledWith({
        tablaAfectada: 'tarjetas',
        operacion: 'DELETE',
        datosViejos: mockTarjeta,
        datosNuevos: { motivo },
        usuario,
      });
    });

    it('should throw NotFoundException when tarjeta not found', async () => {
      await expect(service.remove('nonexistent', 'motivo', 'test@example.com'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should find a tarjeta with relations', async () => {
      const mockTarjetaWithRelations = {
        ...mockTarjeta,
        auditorias: [
          {
            id: 1,
            operacion: 'CREATE',
            fecha: new Date(),
          }
        ]
      };

      mockRepository.findOne.mockResolvedValueOnce(mockTarjetaWithRelations);

      const result = await service.findOne('TEMP-123');

      expect(result).toEqual(mockTarjetaWithRelations);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'TEMP-123' },
        relations: ['conductor', 'auditorias']
      });
    });

    it('should throw NotFoundException when tarjeta not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne('nonexistent'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update tarjeta successfully', async () => {
      const updateDto: UpdateTarjetaDto = {
        estado: 'inactiva',
        motivo: 'Tarjeta perdida',
        fecha_expiracion: new Date('2026-12-31')
      };

      const usuario = 'test@example.com';
      const updatedTarjeta = {
        ...mockTarjeta,
        ...updateDto
      };

      mockRepository.findOne.mockResolvedValueOnce(mockTarjeta);
      mockRepository.save.mockResolvedValueOnce(updatedTarjeta);

      const result = await service.update('TEMP-123', updateDto, usuario);

      expect(result).toEqual(updatedTarjeta);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'TEMP-123' },
        relations: ['conductor', 'auditorias']
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockTarjeta,
        ...updateDto
      });
    });

    it('should throw NotFoundException when tarjeta not found during update', async () => {
      const updateDto: UpdateTarjetaDto = {
        estado: 'inactiva'
      };

      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.update('nonexistent', updateDto, 'test@example.com'))
        .rejects.toThrow(NotFoundException);
    });

    it('should update tarjeta with partial data', async () => {
      const updateDto: UpdateTarjetaDto = {
        estado: 'inactiva'
      };

      const usuario = 'test@example.com';
      const updatedTarjeta = {
        ...mockTarjeta,
        estado: 'inactiva'
      };

      mockRepository.findOne.mockResolvedValueOnce(mockTarjeta);
      mockRepository.save.mockResolvedValueOnce(updatedTarjeta);

      const result = await service.update('TEMP-123', updateDto, usuario);

      expect(result).toEqual(updatedTarjeta);
      expect(repository.save).toHaveBeenCalledWith({
        ...mockTarjeta,
        estado: 'inactiva'
      });
    });
  });
}); 