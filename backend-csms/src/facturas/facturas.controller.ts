// facturas.controller.ts
import { Controller, Post, Body, Delete, Param, Get, Query, Patch, UseGuards, HttpCode, Req, UnauthorizedException, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
import { FacturaService } from './facturas.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateFacturaDto } from './dto/create-invoce.dto';
import { FilterFacturasDto } from './dto/filter-invoices.dto';
import { UpdateFacturaDto } from './dto/update-invoce.dto';
import { Factura } from './entities/factura.entity';
import { AuditHistoryDto } from './dto/audit-history.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserInterface } from 'src/auth/interfaces/user.interface';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    role: string;
  };
}

@ApiTags('Facturas')
@ApiBearerAuth()
@Controller('facturas')
@UseGuards(RolesGuard)
export class FacturaController {
  constructor(private readonly facturaService: FacturaService) {}

  @Post()
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Crear nueva factura vinculada a un pago' })
  @ApiBody({ type: CreateFacturaDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Factura creada exitosamente', 
    type: Factura 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acceso denegado. Se requiere rol admin_cpo' 
  })
  async create(@Body() createFacturaDto: CreateFacturaDto) {
    return this.facturaService.create(createFacturaDto);
  }

  @Delete(':id')
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Anular factura' })
  @ApiParam({ name: 'id', description: 'ID de la factura a anular' })
  @ApiResponse({ 
    status: 204, 
    description: 'Factura anulada exitosamente' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acceso denegado. Se requiere rol admin_cpo' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Factura no encontrada' 
  })
  @HttpCode(204)
  async annul(@Param('id') id: string, @Body('motivo') motivo: string) {
    return this.facturaService.annul(id, motivo);
  }

  @Get()
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Filtrar facturas' })
  @ApiQuery({ name: 'filters', required: false, type: FilterFacturasDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Listado de facturas filtradas', 
    type: [Factura] 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acceso denegado. Se requiere rol admin_cpo' 
  })
  async filter(@Query() filter: FilterFacturasDto) {
    return this.facturaService.filter(filter);
  }

  @Get(':id')
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Obtener factura por ID' })
  @ApiParam({ name: 'id', description: 'ID de la factura' })
  @ApiQuery({ 
    name: 'formato', 
    required: false,
    enum: ['json', 'pdf'],
    description: 'Formato de salida de la factura'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Detalles de la factura', 
    type: Factura 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acceso denegado. Se requiere rol admin_cpo' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Factura no encontrada' 
  })
  async findOne(
    @Param('id') id: string,
    @Query('formato') formato: 'json' | 'pdf' = 'json',
    @Req() req: AuthenticatedRequest
  ) {
    return this.facturaService.findOne(id, formato, req.user.sub, req.user.role);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Actualizar factura' })
  @ApiParam({ name: 'id', description: 'ID de la factura' })
  @ApiBody({ type: UpdateFacturaDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Factura actualizada exitosamente', 
    type: Factura 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acceso denegado. Se requiere rol admin_cpo' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Factura no encontrada' 
  })
  async update(
    @Param('id') id: string,
    @Body() updateFacturaDto: UpdateFacturaDto,
    @CurrentUser() user: UserInterface
  ) {
    return this.facturaService.update(id, updateFacturaDto, user.userId);
  }

  @Get(':id/auditoria')
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Obtener historial de auditoría' })
  @ApiParam({ name: 'id', description: 'ID de la factura a consultar' })
  @ApiResponse({ 
    status: 200, 
    description: 'Historial de auditoría', 
    type: [AuditHistoryDto] 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acceso denegado. Se requiere rol admin_cpo' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Factura no encontrada' 
  })
  async getAudit(@Param('id') id: string) {
    return this.facturaService.getAuditHistory(id);
  }
}