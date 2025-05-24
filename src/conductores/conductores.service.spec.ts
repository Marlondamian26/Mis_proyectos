import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConductoresService } from './conductores.service';
import { Conductor } from './entities/conductor.entity';
import { CreateConductorDto } from './dto/create-conductor.dto';
import { UpdateConductorDto } from './dto/update-conductor.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { Auditoria } from '../auditoria/entities/auditoria.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation(() => Promise.resolve('hashedPassword')),
  compare: jest.fn().mockImplementation(() => Promise.resolve(true)),
}));

describe('ConductoresService', () => {
  let service: ConductoresService;
  let repository: Repository<Conductor>;
  let auditoriaService: AuditoriaService;

  const mockConductor = {
    id: '1',
    nombre: 'Test Conductor',
    apellido: 'Test Apellido',
    email: 'test@example.com',
    password: 'hashedPassword',
    telefono: '1234567890',
    estado: 'ACTIVO',
    fechaRegistro: new Date(),
    ultimaSesion: new Date(),
  };

  const mockRepository = {
    create: jest.fn().mockImplementation((data) => ({ ...mockConductor, ...data })),
    save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    find: jest.fn().mockResolvedValue([mockConductor]),
    findOne: jest.fn().mockImplementation((options) => {
      if (options?.where?.email === 'existing@example.com') {
        return Promise.resolve(mockConductor);
      }
      if (options?.where?.email === 'test@example.com') {
        return Promise.resolve({ ...mockConductor });
      }
      return Promise.resolve(null);
    }),
    findOneBy: jest.fn().mockImplementation((criteria) => {
      if (criteria.id === '1') {
        return Promise.resolve({ ...mockConductor });
      }
      return Promise.resolve(null);
    }),
    update: jest.fn(),
    softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockConductor]),
    })),
  };

  const mockAuditoriaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConductoresService,
        {
          provide: getRepositoryToken(Conductor),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Auditoria),
          useValue: mockAuditoriaRepository,
        },
        {
          provide: AuditoriaService,
          useValue: {
            crearRegistro: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<ConductoresService>(ConductoresService);
    repository = module.get<Repository<Conductor>>(getRepositoryToken(Conductor));
    auditoriaService = module.get<AuditoriaService>(AuditoriaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new conductor', async () => {
      const createDto = {
        nombre: 'Test Conductor',
        apellido: 'Test Apellido',
        email: 'new@example.com',
        password: 'password123',
        telefono: '1234567890',
      };

      const result = await service.create(createDto, 'test-user');

      expect(result).toBeDefined();
      expect(result).toEqual(expect.objectContaining({
        ...createDto,
        password: 'hashedPassword',
      }));
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        password: 'hashedPassword',
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(auditoriaService.crearRegistro).toHaveBeenCalledWith({
        tablaAfectada: 'conductores',
        operacion: 'CREATE',
        datosViejos: {},
        datosNuevos: expect.objectContaining({
          ...createDto,
          password: 'hashedPassword',
        }),
        usuario: 'test-user'
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      const createDto = {
        nombre: 'Test Conductor',
        apellido: 'Test Apellido',
        email: 'existing@example.com',
        password: 'password123',
        telefono: '1234567890',
      };

      await expect(service.create(createDto, 'test-user'))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return an array of conductors', async () => {
      mockRepository.find.mockResolvedValue([mockConductor]);

      const result = await service.findAll();
      expect(result).toEqual([mockConductor]);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    beforeEach(() => {
      // Reset findOne mock before each test
      mockRepository.findOne.mockImplementation((options) => {
        if (options?.where?.email === 'test@example.com') {
          return Promise.resolve({ ...mockConductor });
        }
        return Promise.resolve(null);
      });
    });

    it('should return a conductor by email', async () => {
      const result = await service.findOne('test@example.com');
      
      expect(mockRepository.findOne).toHaveBeenCalledWith({ 
        where: { email: 'test@example.com' }
      });
      expect(result).toEqual(expect.objectContaining(mockConductor));
    });

    it('should return null when conductor is not found', async () => {
      const result = await service.findOne('nonexistent@example.com');
      
      expect(mockRepository.findOne).toHaveBeenCalledWith({ 
        where: { email: 'nonexistent@example.com' }
      });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    beforeEach(() => {
      // Reset findOneBy and save mocks before each test
      mockRepository.findOneBy.mockImplementation((criteria) => {
        if (criteria.id === '1') {
          return Promise.resolve({ ...mockConductor });
        }
        return Promise.resolve(null);
      });
      mockRepository.save.mockImplementation((data) => Promise.resolve(data));
    });

    it('should update a conductor', async () => {
      const updateDto = {
        nombre: 'Updated Name',
        telefono: '9876543210',
      };

      const updatedConductor = { ...mockConductor, ...updateDto };
      mockRepository.save.mockResolvedValueOnce(updatedConductor);

      const result = await service.update('1', updateDto, 'test-user');
      
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining(updateDto));
      expect(result).toEqual(expect.objectContaining(updateDto));
      expect(auditoriaService.crearRegistro).toHaveBeenCalledWith({
        tablaAfectada: 'conductores',
        operacion: 'UPDATE',
        datosViejos: expect.objectContaining(mockConductor),
        datosNuevos: expect.objectContaining(updateDto),
        usuario: 'test-user'
      });
    });

    it('should throw NotFoundException when conductor is not found', async () => {
      await expect(service.update('2', {}, 'test-user'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a conductor', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockConductor);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.remove('1', 'test-user');
      
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(mockRepository.softDelete).toHaveBeenCalledWith('1');
      expect(auditoriaService.crearRegistro).toHaveBeenCalledWith({
        tablaAfectada: 'conductores',
        operacion: 'DELETE',
        datosViejos: mockConductor,
        datosNuevos: null,
        usuario: 'test-user'
      });
    });

    it('should throw NotFoundException when conductor is not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove('1', 'test-user'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a conductor by email', async () => {
      mockRepository.findOne.mockResolvedValue(mockConductor);

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockConductor);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('filtrarConductores', () => {
    it('should filter conductors by criteria', async () => {
      const query = {
          nombre: 'Test',
        apellido: 'Conductor',
        email: 'test@example.com'
      };

      const result = await service.filtrarConductores(query);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([mockConductor]);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });
}); 