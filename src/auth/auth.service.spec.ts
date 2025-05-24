import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { ConductoresService } from '../conductores/conductores.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Conductor } from '../conductores/entities/conductor.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AuditoriaService } from '../auditoria/auditoria.service';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let conductoresService: ConductoresService;
  let jwtService: JwtService;
  let conductorRepository: Repository<Conductor>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConductoresService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn().mockImplementation((dto, usuarioAuditoria) => Promise.resolve(mockConductor)),
            findOne: jest.fn(),
          },
        },
        {
          provide: AuditoriaService,
          useValue: {
            crearRegistro: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('test-token'),
            verifyAsync: jest.fn().mockResolvedValue({ sub: '1', role: 'admin_cpo' }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              switch (key) {
                case 'JWT_ACCESS_SECRET':
                  return 'access-secret';
                case 'JWT_REFRESH_SECRET':
                  return 'refresh-secret';
                default:
                  return undefined;
              }
            }),
          },
        },
        {
          provide: getRepositoryToken(Conductor),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    conductoresService = module.get<ConductoresService>(ConductoresService);
    jwtService = module.get<JwtService>(JwtService);
    conductorRepository = module.get(getRepositoryToken(Conductor));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user object when credentials are valid', async () => {
      jest.spyOn(conductoresService, 'findByEmail').mockResolvedValue(mockConductor as Conductor);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual({
        id: mockConductor.id,
        email: mockConductor.email,
        nombre: mockConductor.nombre,
        apellido: mockConductor.apellido,
        telefono: mockConductor.telefono,
        estado: mockConductor.estado,
        fechaRegistro: mockConductor.fechaRegistro,
        ultimaSesion: mockConductor.ultimaSesion,
      });
    });

    it('should return null when user is not found', async () => {
      jest.spyOn(conductoresService, 'findByEmail').mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      jest.spyOn(conductoresService, 'findByEmail').mockResolvedValue(mockConductor as Conductor);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens with user info', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: 'admin_cpo',
      };

      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(service, 'generateTokens').mockResolvedValue({
        accessToken: 'test-token',
        refreshToken: 'test-token',
      });

      const result = await service.login(loginDto);
      
      expect(result).toEqual({
        accessToken: 'test-token',
        refreshToken: 'test-token',
        user: mockUser,
      });
      expect(service.generateTokens).toHaveBeenCalledWith(mockUser.id, mockUser.role);
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        nombre: 'New User',
        email: 'new@example.com',
        password: 'password123',
        telefono: '1234567890',
      };

      jest.spyOn(conductoresService, 'findByEmail').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      jest.spyOn(conductoresService, 'create').mockResolvedValue(mockConductor as Conductor);

      const result = await service.register(registerDto);
      expect(result).toEqual({
        id: mockConductor.id,
        email: mockConductor.email,
        nombre: mockConductor.nombre,
        apellido: mockConductor.apellido,
        telefono: mockConductor.telefono,
        estado: mockConductor.estado,
        fechaRegistro: mockConductor.fechaRegistro,
        ultimaSesion: mockConductor.ultimaSesion,
      });
      expect(conductoresService.create).toHaveBeenCalledWith({
        ...registerDto,
        password: 'hashedPassword',
      }, 'system');
    });

    it('should throw error if email already exists', async () => {
      const registerDto = {
        nombre: 'New User',
        email: 'existing@example.com',
        password: 'password123',
        telefono: '1234567890',
      };

      jest.spyOn(conductoresService, 'findByEmail').mockResolvedValue(mockConductor as Conductor);

      await expect(service.register(registerDto)).rejects.toThrow('El email ya está registrado');
    });
  });
}); 