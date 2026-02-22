import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

// Mock de AuthGuard
const mockCanActivate = jest.fn();

jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn().mockImplementation(() => {
    return class MockAuthGuard {
      canActivate(context: ExecutionContext) {
        return mockCanActivate(context);
      }
    };
  }),
}));

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException when no token is provided', async () => {
    const context = createMockContext({});
    mockCanActivate.mockRejectedValueOnce(new UnauthorizedException('No token provided'));
    
    await expect(guard.canActivate(context)).rejects.toThrow('No token provided');
    expect(mockCanActivate).toHaveBeenCalledWith(context);
  });

  it('should throw UnauthorizedException when invalid token is provided', async () => {
    const context = createMockContext({
      headers: {
        authorization: 'Bearer invalid-token',
      },
    });
    mockCanActivate.mockRejectedValueOnce(new UnauthorizedException('Invalid token'));
    
    await expect(guard.canActivate(context)).rejects.toThrow('Invalid token');
    expect(mockCanActivate).toHaveBeenCalledWith(context);
  });

  it('should return true when valid token is provided', async () => {
    const context = createMockContext({
      headers: {
        authorization: 'Bearer valid-token',
      },
    });
    mockCanActivate.mockResolvedValueOnce(true);
    
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(mockCanActivate).toHaveBeenCalledWith(context);
  });
});

function createMockContext(request: any = {}) {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      }),
    }),
    getClass: () => ({}),
    getHandler: () => ({}),
  } as ExecutionContext;
} 