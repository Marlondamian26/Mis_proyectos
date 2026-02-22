import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true when no roles are required', () => {
    const context = createMockContext();
    jest.spyOn(reflector, 'get').mockReturnValue(null);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return true when user has required role', () => {
    const context = createMockContext({
      user: { roles: ['admin'] },
    });
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return false when user does not have required role', () => {
    const context = createMockContext({
      user: { roles: ['user'] },
    });
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should return false when user has no roles', () => {
    const context = createMockContext({
      user: {},
    });
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);

    expect(guard.canActivate(context)).toBe(false);
  });
});

function createMockContext(request: any = {}) {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
  } as ExecutionContext;
} 