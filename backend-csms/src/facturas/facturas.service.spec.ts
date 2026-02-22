import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacturaService } from './facturas.service';
import { Factura } from './entities/factura.entity';
import { CreateFacturaDto } from './dto/create-invoce.dto';
import { UpdateFacturaDto } from './dto/update-invoce.dto';
import { Pago } from '../pagos/entities/pago.entity';
import { Conductor } from '../conductores/entities/conductor.entity';
import { Tarifa } from '../tarifas/entities/tarifa.entity';
import { AuditService } from '../audit/audit.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

// Mock PDFKit
jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => ({
    fontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    moveDown: jest.fn().mockReturnThis(),
    end: jest.fn(),
    on: jest.fn(),
  }));
});

describe('FacturaService', () => {
  let service: FacturaService;
  let mockFacturaRepository: Repository<Factura>;
  let mockPagoRepository: Repository<Pago>;
  let mockConductorRepository: Repository<Conductor>;
  let mockTarifaRepository: Repository<Tarifa>;
  let mockAuditService: AuditService;

  const mockConductor: Conductor = {
    id: '1',
    nombre: 'Test',
    apellido: 'Driver',
    email: 'test@example.com',
    password: 'hashedPassword',
    deletedAt: undefined
  };

  const mockTarifa: Tarifa = {
    id: '1',
    tipo_conector: 'CCS2',
    precio_kwh: 2,
    hora_inicio: '08:00',
    hora_fin: '18:00',
    moneda: 'CUP',
    deletedAt: undefined
  };

  const mockPago: Pago = {
    id: '1',
    monto: 100,
    metodo_pago: 'tarjeta',
    estado: 'pendiente',
    fecha_hora: new Date(),
    conductor: mockConductor,
    tarifa: mockTarifa,
    enlace_pago: undefined,
    qr_data: undefined,
    qr_expiracion: undefined,
    banco: undefined,
    ultimos_digitos: undefined,
    referencia_externa: undefined
  };

  const mockFactura: Factura = {
    id: '1',
    monto: 100,
    moneda: 'CUP',
    consumo_kwh: 50,
    iva: 10,
    status: 'active',
    auditLogs: [],
    fecha_emision: new Date(),
    pago: mockPago,
    conductor: mockConductor,
    tarifa: mockTarifa
  };

  const mockRepositoryImpl = {
    create: jest.fn().mockImplementation((data) => ({ ...mockFactura, ...data })),
    save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    findOneBy: jest.fn().mockImplementation((criteria) => {
      if (criteria.id === '1') {
        return Promise.resolve({ ...mockFactura });
      }
      return Promise.resolve(null);
    }),
    findOne: jest.fn().mockImplementation((options) => {
      if (options.where.id === '1') {
        if (options.relations?.includes('tarifa')) {
          return Promise.resolve({ ...mockPago, tarifa: mockTarifa });
        }
        return Promise.resolve({ ...mockFactura });
      }
      return Promise.resolve(null);
    }),
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockFactura])
    })
  };

  const mockAuditServiceImpl = {
    log: jest.fn().mockResolvedValue(undefined)
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturaService,
        {
          provide: getRepositoryToken(Factura),
          useValue: mockRepositoryImpl
        },
        {
          provide: getRepositoryToken(Pago),
          useValue: {
            ...mockRepositoryImpl,
            findOne: jest.fn().mockImplementation((options) => {
              if (options.where.id === '1') {
                const pagoWithTarifa = {
                  ...mockPago,
                  monto: 100,
                  tarifa: {
                    ...mockTarifa,
                    precio_kwh: 2
                  }
                };
                return Promise.resolve(pagoWithTarifa);
              }
              return Promise.resolve(null);
            })
          }
        },
        {
          provide: getRepositoryToken(Conductor),
          useValue: mockRepositoryImpl
        },
        {
          provide: getRepositoryToken(Tarifa),
          useValue: {
            ...mockRepositoryImpl,
            findOneBy: jest.fn().mockImplementation((criteria) => {
              if (criteria.id === '1') {
                return Promise.resolve({
                  ...mockTarifa,
                  precio_kwh: 2
                });
              }
              return Promise.resolve(null);
            })
          }
        },
        {
          provide: AuditService,
          useValue: mockAuditServiceImpl
        }
      ],
    }).compile();

    service = module.get<FacturaService>(FacturaService);
    mockFacturaRepository = module.get<Repository<Factura>>(getRepositoryToken(Factura));
    mockPagoRepository = module.get<Repository<Pago>>(getRepositoryToken(Pago));
    mockConductorRepository = module.get<Repository<Conductor>>(getRepositoryToken(Conductor));
    mockTarifaRepository = module.get<Repository<Tarifa>>(getRepositoryToken(Tarifa));
    mockAuditService = module.get<AuditService>(AuditService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a factura successfully', async () => {
      const createDto: CreateFacturaDto = {
        amount: 100,
        currency: 'CUP',
        driverId: '1',
        paymentMethod: 'Tarjeta',
        kWh: 50,
        tariff: 0.85,
        iva: 10,
        pagoId: '1',
        tarifaId: '1'
      };

      const result = await service.create(createDto);

      expect(result).toMatchObject({
        monto: 100,
        moneda: 'CUP',
        consumo_kwh: 50,
        iva: 10,
        status: 'active'
      });

      expect(result.fecha_emision).toBeInstanceOf(Date);
      expect(mockRepositoryImpl.create).toHaveBeenCalled();
      expect(mockRepositoryImpl.save).toHaveBeenCalled();
      expect(mockAuditServiceImpl.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException when related resources are not found', async () => {
      const createDto: CreateFacturaDto = {
        amount: 100,
        currency: 'CUP',
        driverId: '999',
        paymentMethod: 'Tarjeta',
        kWh: 50,
        tariff: 0.85,
        iva: 10,
        pagoId: '1',
        tarifaId: '1'
      };

      mockRepositoryImpl.findOneBy.mockResolvedValueOnce(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a factura successfully', async () => {
      const updateDto: UpdateFacturaDto = {
        notes: 'Test note',
        paymentReference: 'PAY-123'
      };

      const updatedFactura = {
        ...mockFactura,
        notas: updateDto.notes,
        referencia_pago: updateDto.paymentReference
      };

      mockRepositoryImpl.findOne.mockResolvedValueOnce(mockFactura);
      mockRepositoryImpl.save.mockResolvedValueOnce(updatedFactura);

      const result = await service.update('1', updateDto, 'test@example.com');

      expect(result).toEqual(updatedFactura);
      expect(mockRepositoryImpl.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(mockRepositoryImpl.save).toHaveBeenCalled();
      expect(mockAuditServiceImpl.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException when factura is not found', async () => {
      const updateDto: UpdateFacturaDto = {
        notes: 'Test note'
      };

      await expect(service.update('999', updateDto, 'test@example.com'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('filter', () => {
    it('should filter facturas successfully', async () => {
      const filterDto = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        minAmount: 50,
        maxAmount: 1000,
        driverId: '1',
        status: 'active'
      };

      const result = await service.filter(filterDto);

      expect(result).toEqual([mockFactura]);
      expect(mockRepositoryImpl.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('annul', () => {
    it('should annul invoice', async () => {
      mockRepositoryImpl.findOneBy.mockResolvedValue(mockFactura);
      mockRepositoryImpl.save.mockResolvedValue({ ...mockFactura, status: 'annulled' });

      await service.annul('1', 'test reason');
      expect(mockRepositoryImpl.save).toHaveBeenCalledWith(expect.objectContaining({
        status: 'annulled',
      }));
    });

    it('should throw NotFoundException when invoice not found', async () => {
      mockRepositoryImpl.findOneBy.mockResolvedValue(null);

      await expect(service.annul('1', 'test reason')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return invoice by id', async () => {
      mockRepositoryImpl.findOne.mockResolvedValue(mockFactura);

      const result = await service.findOne('1', 'json', '1', 'admin_cpo');
      expect(result).toEqual(mockFactura);
    });

    it('should return PDF when format is pdf', async () => {
      mockRepositoryImpl.findOne.mockResolvedValue(mockFactura);

      const result = await service.findOne('1', 'pdf', '1', 'admin_cpo');
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should throw ForbiddenException when user is not admin and not the driver', async () => {
      mockRepositoryImpl.findOne.mockResolvedValue(mockFactura);

      await expect(service.findOne('1', 'json', '2', 'user'))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when invoice not found', async () => {
      mockRepositoryImpl.findOne.mockResolvedValue(null);

      await expect(service.findOne('1', 'json', '1', 'admin_cpo'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getAuditHistory', () => {
    it('should return audit history', async () => {
      mockRepositoryImpl.findOneBy.mockResolvedValue(mockFactura);

      const result = await service.getAuditHistory('1');
      expect(result).toEqual(mockFactura.auditLogs);
    });

    it('should throw NotFoundException when invoice not found', async () => {
      mockRepositoryImpl.findOneBy.mockResolvedValue(null);

      await expect(service.getAuditHistory('1')).rejects.toThrow(NotFoundException);
    });
  });
}); 