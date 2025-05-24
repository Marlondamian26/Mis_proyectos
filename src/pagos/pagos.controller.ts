import { 
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody 
} from '@nestjs/swagger';
import { Controller, Post, Body, Patch, Param, Get, Query, UseGuards, Res, BadRequestException } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Pago } from './entities/pago.entity';
import { Response } from 'express';

@ApiTags('Pagos')
@ApiBearerAuth()
@Controller('pagos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook para notificaciones de pago' })
  @ApiResponse({ status: 200, description: 'Pago procesado' })
  async handlePaymentWebhook(@Body() payload: any) {
    const pago = await this.pagosService.findByExternalReference(payload.id);
    if (!pago) throw new Error('Pago no encontrado');
    
    return this.pagosService.updateEstado(pago.id, {
      estado: payload.status === 'approved' ? 'confirmado' : 'fallido',
      referencia_externa: payload.id
    });
  }

  @Patch(':id/estado')
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Actualizar estado de pago' })
  @ApiParam({ name: 'id', description: 'ID del pago' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  async updateEstado(
    @Param('id') id: string,
    @Body() updatePagoDto: UpdatePagoDto
  ) {
    return this.pagosService.updateEstado(id, updatePagoDto);
  }

  @Post()
  @Roles('admin_cpo', 'conductor')
  @ApiOperation({ 
    summary: 'Crear nuevo pago',
    description: 'Crea un nuevo registro de pago y genera un enlace de pago'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Pago creado exitosamente',
    type: Pago
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de pago inválidos'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acceso denegado. Se requiere rol admin_cpo o conductor'
  })
  async crearPago(@Body() createPagoDto: CreatePagoDto) {
    return this.pagosService.create(createPagoDto);
  }

  @Get('filtrar')
  @Roles('admin_cpo')
  @ApiOperation({ 
    summary: 'Filtrar pagos',
    description: 'Filtra pagos por diferentes criterios'
  })
  @ApiQuery({ 
    name: 'fecha_inicio', 
    required: false,
    description: 'Fecha inicial del rango (YYYY-MM-DD)'
  })
  @ApiQuery({ 
    name: 'fecha_fin', 
    required: false,
    description: 'Fecha final del rango (YYYY-MM-DD)'
  })
  @ApiQuery({ 
    name: 'monto', 
    required: false,
    description: 'Monto específico del pago'
  })
  @ApiQuery({ 
    name: 'metodo_pago', 
    required: false, 
    enum: ['tarjeta', 'efectivo'],
    description: 'Método de pago utilizado'
  })
  @ApiQuery({ 
    name: 'estado', 
    required: false,
    enum: ['pendiente', 'confirmado', 'fallido'],
    description: 'Estado del pago'
  })
  @ApiQuery({ 
    name: 'banco', 
    required: false,
    description: 'Nombre del banco (para pagos con tarjeta)'
  })
  @ApiQuery({ 
    name: 'conductor_nombre', 
    required: false,
    description: 'Nombre del conductor'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de pagos filtrados',
    type: [Pago]
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acceso denegado'
  })
  async filtrarPagos(
    @Query() filters: {
      fecha_inicio?: string;
      fecha_fin?: string;
      monto?: number;
      metodo_pago?: 'tarjeta' | 'efectivo';
      estado?: string;
      banco?: string;
      conductor_nombre?: string;
    }
  ) {
    return this.pagosService.findByFilters({
      ...filters,
      fecha_inicio: filters.fecha_inicio ? new Date(filters.fecha_inicio) : undefined,
      fecha_fin: filters.fecha_fin ? new Date(filters.fecha_fin) : undefined
    });
  }

  @Get(':id/qr')
  @Roles('admin_cpo', 'conductor')
  @ApiOperation({ 
    summary: 'Obtener QR de pago',
    description: 'Genera un código QR para el pago especificado'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del pago',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'QR generado exitosamente',
    schema: {
      type: 'object',
      properties: {
        qrCode: {
          type: 'string',
          description: 'Código QR en formato base64'
        },
        tiempoRestante: {
          type: 'number',
          description: 'Tiempo restante en segundos'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acceso denegado. Se requiere rol admin_cpo o conductor'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Pago no encontrado'
  })
  async obtenerQR(@Param('id') id: string) {
    return this.pagosService.generarQRPago(id);
  }

  @Get('enlace/:id')
  @ApiOperation({ summary: 'Obtener enlace de pago' })
  @ApiParam({ name: 'id', description: 'ID del pago' })
  @ApiResponse({ status: 302, description: 'Redirección a plataforma externa' })
  async redirigirPago(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    const pago = await this.pagosService.findOne(id);
    
    if (!pago.enlace_pago) {
      throw new BadRequestException('Este pago no tiene enlace asociado');
    }
    // Versión correcta
    return res.redirect(302, pago.enlace_pago);
  }

  @Patch(':id')
  @Roles('admin_cpo')
  @ApiOperation({ 
    summary: 'Actualizar estado de pago',
    description: 'Actualiza el estado y detalles de un pago existente'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID del pago',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Pago actualizado exitosamente',
    type: Pago
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Pago no encontrado'
  })
  async update(@Param('id') id: string, @Body() updatePagoDto: UpdatePagoDto) {
    return this.pagosService.update(id, updatePagoDto);
  }
}