import { Controller, Post, Body, UseGuards, Get, Request, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { User } from './interfaces/user.interface';
import { Request as ExpressRequest } from 'express';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ 
    summary: 'Iniciar sesión',
    description: 'Autentica un usuario y devuelve tokens de acceso y refresco'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'Token de acceso JWT (expira en 30 minutos)'
        },
        refreshToken: {
          type: 'string',
          description: 'Token de refresco JWT (expira en 7 días)'
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['admin_cpo', 'conductor'] }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Credenciales inválidas'
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Renovar token de acceso',
    description: 'Genera un nuevo par de tokens usando el token de refresco'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token renovado exitosamente',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'Nuevo token de acceso JWT'
        },
        refreshToken: {
          type: 'string',
          description: 'Nuevo token de refresco JWT'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token de refresco inválido o expirado'
  })
  async refresh(@Req() req: ExpressRequest) {
    const refreshToken = req.headers['refresh-token'] as string;
    return this.authService.refreshTokens(refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_cpo', 'conductor')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Obtener perfil del usuario',
    description: 'Devuelve la información del usuario autenticado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil del usuario',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string', enum: ['admin_cpo', 'conductor'] },
        nombre: { type: 'string' },
        apellido: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acceso denegado'
  })
  getProfile(@Request() req: { user: User }) {
    return req.user;
  }
} 