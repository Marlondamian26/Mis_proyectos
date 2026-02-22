import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarifasService } from './tarifas.service';
import { Tarifa } from './entities/tarifa.entity';
import { CreateTarifaDto } from './dto/create-tarifa.dto';
import { UpdateTarifaDto } from './dto/update-tarifa.dto';
import { NotFoundException } from '@nestjs/common';
import { AuditoriaService } from '../auditoria/auditoria.service';

describe('TarifasService', () => {
  let service: TarifasService;
  let repository: Repository<Tarifa>;
  let auditoriaService: AuditoriaService;

  const mockTarifa: Tarifa = {
    id: '1',
    tipo_conector: 'CCS',
    precio_kwh: 0.50,
    hora_inicio: '08:00',
    hora_fin: '18:00',
    moneda: 'USD' as const,
    deletedAt: undefined,
  };

  const mockRepository = {
    create: jest.fn().mockImplementation((data) => ({ ...mockTarifa, ...data })),
    save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    findOneBy: jest.fn().mockImplementation((criteria) => {
      if (criteria.id === '1') {
        return Promise.resolve({ ...mockTarifa });
      }
      return Promise.resolve(null);
    }),
    merge: jest.fn().mockImplementation((entity, dto) => ({ ...entity, ...dto })),
    softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockAuditoriaService = {
    crearRegistro: jest.fn().mockResolvedValue(undefined),
    findByTablaAndId: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TarifasService,
        {
          provide: getRepositoryToken(Tarifa),
          useValue: mockRepository,
        },
        {
          provide: AuditoriaService,
          useValue: mockAuditoriaService,
        },
      ],
    }).compile();

    service = module.get<TarifasService>(TarifasService);
    repository = module.get<Repository<Tarifa>>(getRepositoryToken(Tarifa));
    auditoriaService = module.get<AuditoriaService>(AuditoriaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('convertirMoneda', () => {
    it('should convert CUP to USD', () => {
      const tarifa: Tarifa = {
        ...mockTarifa,
        moneda: 'CUP' as const,
        precio_kwh: 24,
      };

      const result = service.convertirMoneda(tarifa);
      
      expect(result.precio_equivalente).toBe(1); // 24 CUP / 24 = 1 USD
    });

    it('should convert USD to CUP', () => {
      const tarifa: Tarifa = {
        ...mockTarifa,
        moneda: 'USD' as const,
        precio_kwh: 1,
      };

      const result = service.convertirMoneda(tarifa);
      
      expect(result.precio_equivalente).toBe(24); // 1 USD * 24 = 24 CUP
    });
  });

  describe('create', () => {
    it('should create a tarifa successfully', async () => {
      const createDto: CreateTarifaDto = {
        tipo_conector: 'CCS',
        precio_kwh: 0.50,
        hora_inicio: '08:00',
        hora_fin: '18:00',
        moneda: 'USD',
      };
      const usuario = 'test@example.com';

      const expectedTarifa = {
        ...mockTarifa,
        ...createDto,
      };

      const result = await service.create(createDto, usuario);

      expect(result).toEqual(expectedTarifa);
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining(createDto));
      expect(repository.save).toHaveBeenCalledWith(expectedTarifa);
      expect(auditoriaService.crearRegistro).toHaveBeenCalledWith({
        tablaAfectada: 'tarifas',
        operacion: 'CREATE',
        datosViejos: {},
        datosNuevos: expectedTarifa,
        usuario
    });
  });

    it('should throw an error if save fails', async () => {
      const createDto: CreateTarifaDto = {
        tipo_conector: 'CCS',
        precio_kwh: 0.50,
        hora_inicio: '08:00',
        hora_fin: '18:00',
        moneda: 'USD',
      };

      mockRepository.save.mockRejectedValueOnce(new Error('Save failed'));

      await expect(service.create(createDto, 'test@example.com')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a tarifa successfully', async () => {
      const updateDto: UpdateTarifaDto = {
        precio_kwh: 0.60,
      };
      const usuario = 'test@example.com';
      
      const updatedTarifa = {
        ...mockTarifa,
        ...updateDto,
      };

      const result = await service.update('1', updateDto, usuario);
      
      expect(result).toEqual(updatedTarifa);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(repository.merge).toHaveBeenCalledWith(expect.any(Object), updateDto);
      expect(repository.save).toHaveBeenCalledWith(updatedTarifa);
      expect(auditoriaService.crearRegistro).toHaveBeenCalledWith({
        tablaAfectada: 'tarifas',
        operacion: 'UPDATE',
        datosViejos: mockTarifa,
        datosNuevos: updatedTarifa,
        usuario
      });
    });

    it('should throw NotFoundException when updating non-existent tarifa', async () => {
      await expect(service.update('999', { precio_kwh: 0.60 }, 'test@example.com'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a tarifa', async () => {
      const id = '1';
      const usuario = 'test-user';

      await service.remove(id, usuario);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id });
      expect(mockRepository.softDelete).toHaveBeenCalledWith(id);
      expect(mockAuditoriaService.crearRegistro).toHaveBeenCalledWith({
        tablaAfectada: 'tarifas',
        operacion: 'DELETE',
        datosViejos: mockTarifa,
        datosNuevos: null,
        usuario
      });
    });

    it('should throw NotFoundException when tarifa does not exist', async () => {
      const id = 'non-existent';
      const usuario = 'test-user';

      mockRepository.findOneBy.mockImplementationOnce(() => Promise.resolve(null));

      await expect(service.remove(id, usuario)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id });
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
      expect(mockAuditoriaService.crearRegistro).not.toHaveBeenCalled();
    });
  });

  describe('getHistorial', () => {
    it('should return tarifa history', async () => {
      const expectedHistory = [
        {
          id: '1',
          operacion: 'CREATE',
          datosViejos: {},
          datosNuevos: mockTarifa,
          usuario: 'test@example.com',
          fecha: new Date(),
        },
      ];

      mockAuditoriaService.findByTablaAndId.mockResolvedValueOnce(expectedHistory);

      const result = await service.getHistorial('1');
      
      expect(result).toEqual(expectedHistory);
      expect(auditoriaService.findByTablaAndId).toHaveBeenCalledWith('tarifas', '1');
    });

    it('should return empty array when no history found', async () => {
      mockAuditoriaService.findByTablaAndId.mockResolvedValueOnce([]);

      const result = await service.getHistorial('999');
      
      expect(result).toEqual([]);
      expect(auditoriaService.findByTablaAndId).toHaveBeenCalledWith('tarifas', '999');
    });
  });
}); 