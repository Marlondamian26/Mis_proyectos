import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Controller, Get, Param, Query, UseGuards, Post } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Auditoría')
@ApiBearerAuth()
@Controller('auditoria')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Obtener todos los registros de auditoría' })
  @ApiResponse({ status: 200, description: 'Lista de registros auditados' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.auditoriaService.findAll(paginationDto);
  }

  @Get('tabla/:tabla')
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Filtrar registros por tabla' })
  @ApiParam({ name: 'tabla', description: 'Nombre de la tabla a filtrar' })
  @ApiResponse({ status: 200, description: 'Registros filtrados por tabla' })
  findByTabla(
    @Param('tabla') tabla: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.auditoriaService.findByTabla(tabla, paginationDto);
  }

  @Get('filtros')
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Búsqueda avanzada con múltiples criterios' })
  @ApiQuery({ name: 'tabla', required: false })
  @ApiQuery({ name: 'operacion', required: false })
  @ApiQuery({ name: 'usuario', required: false })
  @ApiQuery({ name: 'fechaInicio', required: false, type: Date })
  @ApiQuery({ name: 'fechaFin', required: false, type: Date })
  @ApiResponse({ status: 200, description: 'Resultados del filtro avanzado' })
  findByCriterios(
    @Query('tabla') tabla?: string,
    @Query('operacion') operacion?: string,
    @Query('usuario') usuario?: string,
    @Query('fechaInicio') fechaInicio?: Date,
    @Query('fechaFin') fechaFin?: Date,
  ) {
    return this.auditoriaService.findByCriterios({
      tabla,
      operacion,
      usuario,
      fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin) : undefined,
    });
  }

  @Post('limpiar-registros')
  @Roles('admin_cpo')
  @ApiOperation({ 
    summary: 'Limpiar registros de auditoría antiguos',
    description: 'Elimina registros de auditoría con más de un año de antigüedad'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Registros antiguos eliminados exitosamente' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'No autorizado. Solo administradores pueden ejecutar esta acción' 
  })
  async limpiarRegistrosAntiguos() {
    return this.auditoriaService.limpiarRegistrosAntiguos();
  }
}