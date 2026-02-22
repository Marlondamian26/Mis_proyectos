import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam, 
  ApiBody, 
  ApiQuery 
} from '@nestjs/swagger';
import { Controller, Post, Body, Patch, Param, Delete, Get, Query, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { TarjetasService } from './tarjetas.service';
import { CreateTarjetaDto } from './dto/create-tarjeta.dto';
import { UpdateTarjetaDto } from './dto/update-tarjeta.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { UserInterface } from '../auth/interfaces/user.interface';

@ApiTags('Tarjetas')
@ApiBearerAuth()
@Controller('tarjetas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TarjetasController {
  constructor(private readonly tarjetasService: TarjetasService) {}

  @Post()
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Crear nueva tarjeta' })
  @ApiBody({ type: CreateTarjetaDto })
  @ApiResponse({ status: 201, description: 'Tarjeta creada exitosamente', type: CreateTarjetaDto })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requiere rol admin_cpo' })
  create(
    @Body() createDto: CreateTarjetaDto,
    @CurrentUser() user: UserInterface
  ) {
    return this.tarjetasService.create(createDto, user.userId);
  }

  @Get()
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Obtener todas las tarjetas' })
  @ApiQuery({ name: 'filters', required: false, type: 'object' })
  @ApiResponse({ status: 200, description: 'Lista de tarjetas', type: [CreateTarjetaDto] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requiere rol admin_cpo' })
  findAll(@Query() filters: any) {
    return this.tarjetasService.findAll(filters);
  }

  @Get(':id')
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Obtener tarjeta por ID' })
  @ApiParam({ name: 'id', description: 'ID de la tarjeta' })
  @ApiResponse({ status: 200, description: 'Detalles de la tarjeta', type: CreateTarjetaDto })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requiere rol admin_cpo' })
  @ApiResponse({ status: 404, description: 'Tarjeta no encontrada' })
  findOne(@Param('id') id: string) {
    return this.tarjetasService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Actualizar tarjeta' })
  @ApiParam({ name: 'id', description: 'ID de la tarjeta' })
  @ApiBody({ type: UpdateTarjetaDto })
  @ApiResponse({ status: 200, description: 'Tarjeta actualizada exitosamente', type: CreateTarjetaDto })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requiere rol admin_cpo' })
  @ApiResponse({ status: 404, description: 'Tarjeta no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTarjetaDto,
    @CurrentUser() user: UserInterface
  ) {
    return this.tarjetasService.update(id, updateDto, user.userId);
  }

  @Delete(':id')
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Eliminar tarjeta' })
  @ApiParam({ name: 'id', description: 'ID de la tarjeta' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        motivo: {
          type: 'string',
          description: 'Motivo de la eliminación de la tarjeta'
        }
      },
      required: ['motivo']
    }
  })
  @ApiResponse({ status: 200, description: 'Tarjeta eliminada exitosamente' })
  @ApiResponse({ status: 400, description: 'Motivo de eliminación requerido' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requiere rol admin_cpo' })
  @ApiResponse({ status: 404, description: 'Tarjeta no encontrada' })
  remove(
    @Param('id') id: string,
    @Body('motivo') motivo: string,
    @CurrentUser() user: UserInterface
  ) {
    if (!motivo) {
      throw new BadRequestException('El motivo de eliminación es requerido');
    }
    return this.tarjetasService.remove(id, motivo, user.userId);
  }

  @Get()
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Filtrar tarjetas' })
  @ApiQuery({ name: 'estado', required: false })
  @ApiQuery({ name: 'es_temporal', required: false, type: Boolean })
  @ApiQuery({ name: 'conductor_id', required: false })
  @ApiQuery({ name: 'fecha_expiracion', required: false, type: Date })
  @ApiResponse({ status: 200, description: 'Lista de tarjetas filtradas' })
  filtrar(@Query() filters: {
    estado?: string;
    es_temporal?: boolean;
    conductor_id?: string;
    fecha_expiracion?: Date;
  }) {
    return this.tarjetasService.findByFilters(filters);
  }
}