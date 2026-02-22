import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PagosService } from './pagos.service';
import { Pago } from './entities/pago.entity';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { NotFoundException } from '@nestjs/common';
import { Conductor } from '../conductores/entities/conductor.entity';
import { Tarifa } from '../tarifas/entities/tarifa.entity';
import * as QRCode from 'qrcode';

jest.mock('qrcode');

describe('PagosService', () => {
  let service: PagosService;
  let mockRepository: Repository<Pago>;
  let mockConfigService: ConfigService;

  const mockPago: Pago = {
    id: '1',
    monto: 100,
    metodo_pago: 'tarjeta',
    estado: 'pendiente',
    fecha_hora: new Date(),
    conductor: {} as Conductor,
    tarifa: {} as Tarifa,
    enlace_pago: undefined,
    qr_data: undefined,
    qr_expiracion: undefined,
    banco: undefined,
    ultimos_digitos: undefined,
    referencia_externa: undefined
  };

  const mockRepositoryImpl = {
    create: jest.fn().mockImplementation((data) => ({ ...mockPago, ...data })),
    save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    findOneBy: jest.fn().mockImplementation((criteria) => {
      if (criteria.id === '1') {
        return Promise.resolve({ ...mockPago });
      }
      return Promise.resolve(null);
    }),
    findOne: jest.fn().mockImplementation((options) => {
      if (options.where.id === '1') {
        return Promise.resolve({ ...mockPago });
      }
      return Promise.resolve(null);
    }),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  const mockConfigServiceImpl = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'APP_URL') return 'http://localhost:3000';
      return null;
    })
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagosService,
        {
          provide: getRepositoryToken(Pago),
          useValue: mockRepositoryImpl,
        },
        {
          provide: ConfigService,
          useValue: mockConfigServiceImpl,
        }
      ],
    }).compile();

    service = module.get<PagosService>(PagosService);
    mockRepository = module.get<Repository<Pago>>(getRepositoryToken(Pago));
    mockConfigService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a pago successfully', async () => {
      const createDto: CreatePagoDto = {
        monto: 100,
        metodo_pago: 'tarjeta',
        conductor_id: 'cond-1',
        tarifa_id: 'tarifa-1'
      };

      const result = await service.create(createDto);
      
      // Verificar que el objeto tiene las propiedades básicas
      expect(result).toMatchObject({
        monto: 100,
        metodo_pago: 'tarjeta',
        conductor_id: 'cond-1',
        tarifa_id: 'tarifa-1',
        estado: 'pendiente'
      });

      // Verificar que fecha_hora es una fecha válida
      expect(result.fecha_hora).toBeInstanceOf(Date);

      // Verificar que enlace_pago tiene el formato correcto
      expect(result.enlace_pago).toMatch(/^http:\/\/localhost:3000\/pagar\/[a-f0-9-]+$/);

      // Verificar las llamadas al repositorio
      expect(mockRepositoryImpl.create).toHaveBeenCalledWith(expect.objectContaining({
        ...createDto,
        estado: 'pendiente',
        fecha_hora: expect.any(Date)
      }));
      expect(mockRepositoryImpl.save).toHaveBeenCalledTimes(2); // Una vez para crear y otra para actualizar el enlace
      expect(mockConfigServiceImpl.get).toHaveBeenCalledWith('APP_URL');
    });

    it('should throw an error if save fails', async () => {
      const createDto: CreatePagoDto = {
        monto: 100,
        metodo_pago: 'tarjeta',
        conductor_id: 'cond-1',
        tarifa_id: 'tarifa-1'
      };

      mockRepositoryImpl.save.mockRejectedValueOnce(new Error('Save failed'));

      await expect(service.create(createDto)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a pago successfully', async () => {
      const updateDto: UpdatePagoDto = {
        estado: 'confirmado',
        referencia_externa: 'PAY-123'
      };
      
      const updatedPago = {
        ...mockPago,
        ...updateDto
      };

      const result = await service.update('1', updateDto);
      
      expect(result).toEqual(updatedPago);
      expect(mockRepositoryImpl.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['conductor', 'tarifa']
      });
      expect(mockRepositoryImpl.save).toHaveBeenCalledWith(updatedPago);
    });

    it('should throw NotFoundException when updating non-existent pago', async () => {
      const updateDto: UpdatePagoDto = {
        estado: 'confirmado',
        referencia_externa: 'PAY-123'
      };

      await expect(service.update('999', updateDto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('generarEnlacePago', () => {
    it('should generate payment link', async () => {
      mockRepositoryImpl.update.mockResolvedValue({ affected: 1 });
      
      const result = await service.generarEnlacePago('1');
      expect(result).toMatch(/^http:\/\/localhost:3000\/pagar\/[a-f0-9-]+$/);
      expect(mockRepositoryImpl.update).toHaveBeenCalled();
    });
  });

  describe('generarQRPago', () => {
    it('should generate QR code for payment', async () => {
      mockRepositoryImpl.findOneBy.mockResolvedValue(mockPago);
      mockRepositoryImpl.update.mockResolvedValue({ affected: 1 });
      (QRCode.toDataURL as jest.Mock).mockResolvedValue('qr-code-data');

      const result = await service.generarQRPago('1');
      expect(result).toHaveProperty('qr');
      expect(result).toHaveProperty('expiracion');
      expect(result.qr).toBe('qr-code-data');
    });

    it('should throw NotFoundException when payment not found', async () => {
      mockRepositoryImpl.findOneBy.mockResolvedValue(null);

      await expect(service.generarQRPago('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return payment by id', async () => {
      mockRepositoryImpl.findOne.mockResolvedValue(mockPago);

      const result = await service.findOne('1');
      expect(result).toEqual(mockPago);
    });

    it('should throw NotFoundException when payment not found', async () => {
      mockRepositoryImpl.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateEstado', () => {
    it('should update payment status', async () => {
      mockRepositoryImpl.findOneBy.mockResolvedValue(mockPago);
      mockRepositoryImpl.save.mockResolvedValue({ ...mockPago, estado: 'confirmado' });

      const result = await service.updateEstado('1', { estado: 'confirmado' });
      expect(result.estado).toBe('confirmado');
    });

    it('should throw error when payment not found', async () => {
      mockRepositoryImpl.findOneBy.mockResolvedValue(null);

      await expect(service.updateEstado('1', { estado: 'confirmado' }))
        .rejects.toThrow('Pago no encontrado');
    });
  });

  describe('findByFilters', () => {
    it('should return filtered payments', async () => {
      const filters = {
        fecha_inicio: new Date(),
        fecha_fin: new Date(),
        monto: 100,
        metodo_pago: 'tarjeta' as const,
        estado: 'pendiente',
      };

      const result = await service.findByFilters(filters);
      expect(result).toEqual([]);
    });
  });

  describe('findByExternalReference', () => {
    it('should return payment by external reference', async () => {
      mockRepositoryImpl.findOne.mockResolvedValue(mockPago);

      const result = await service.findByExternalReference('ref-123');
      expect(result).toEqual(mockPago);
    });

    it('should throw NotFoundException when payment not found', async () => {
      mockRepositoryImpl.findOne.mockResolvedValue(null);

      await expect(service.findByExternalReference('ref-123'))
        .rejects.toThrow(NotFoundException);
    });
  });
}); 