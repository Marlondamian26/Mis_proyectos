import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Controller, Post, Body, Get, Query, Patch, Param, Delete, UseGuards, NotFoundException, Put } from '@nestjs/common';
import { ConductoresService } from './conductores.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Conductor } from './entities/conductor.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateConductorDto } from './dto/update-conductor.dto';
import { CreateConductorDto } from './dto/create-conductor.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserInterface } from '../auth/interfaces/user.interface';

@ApiTags('Conductores')
@ApiBearerAuth()
@Controller('conductores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConductoresController {
  constructor(private readonly conductoresService: ConductoresService) {}

  @Post()
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Crear nuevo conductor' })
  @ApiBody({ type: CreateConductorDto })
  @ApiResponse({ status: 201, description: 'Conductor creado exitosamente', type: Conductor })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requiere rol admin_cpo' })
  create(
    @Body() createConductorDto: CreateConductorDto,
    @CurrentUser() user: UserInterface
  ) {
    return this.conductoresService.create(createConductorDto, user.userId);
  }

  @Get()
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Obtener todos los conductores' })
  @ApiResponse({ status: 200, description: 'Lista de conductores', type: [Conductor] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requiere rol admin_cpo' })
  findAll(@Query() filters: Partial<Conductor>) {
    return this.conductoresService.findAll(filters);
  }

  @Get(':email')
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Obtener conductor' })
  @ApiParam({ name: 'email', description: 'Email del conductor' })
  @ApiResponse({ status: 200, description: 'Detalles del conductor', type: Conductor })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requiere rol admin_cpo' })
  @ApiResponse({ status: 404, description: 'Conductor no encontrado' })
  async findOne(@Param('email') email: string) {
    const conductor = await this.conductoresService.findOne(email);
    if (!conductor) {
      throw new NotFoundException('Conductor no encontrado');
    }
    return conductor;
  }

  @Get('filtrar')
  @Roles('admin_cpo')
  @ApiOperation({
    summary: 'Filtrar conductores por atributos',
    description: 'Búsqueda dinámica por nombre, apellido o email (excluye contraseña). Solo para administradores CPO.'
  })
  @ApiQuery({ name: 'nombre', required: false, description: 'Filtrar por nombre (búsqueda parcial)' })
  @ApiQuery({ name: 'apellido', required: false, description: 'Filtrar por apellido (búsqueda parcial)' })
  @ApiQuery({ name: 'email', required: false, description: 'Filtrar por email exacto' })
  @ApiResponse({ status: 200, description: 'Lista de conductores filtrados' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async filtrarConductores(
    @Query('nombre') nombre?: string,
    @Query('apellido') apellido?: string,
    @Query('email') email?: string,
  ) {
    return this.conductoresService.filtrarConductores({
      nombre,
      apellido,
      email
    });
  }

  @Put(':email')
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Actualizar conductor' })
  @ApiParam({ name: 'email', description: 'Email del conductor' })
  @ApiBody({ type: UpdateConductorDto })
  @ApiResponse({ status: 200, description: 'Conductor actualizado exitosamente', type: Conductor })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requiere rol admin_cpo' })
  @ApiResponse({ status: 404, description: 'Conductor no encontrado' })
  update(
    @Param('email') email: string,
    @Body() updateConductorDto: UpdateConductorDto,
    @CurrentUser() user: UserInterface
  ) {
    return this.conductoresService.update(email, updateConductorDto, user.userId);
  }

  @Delete(':email')
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Eliminar conductor' })
  @ApiParam({ name: 'email', description: 'Email del conductor' })
  @ApiResponse({ status: 200, description: 'Conductor eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Se requiere rol admin_cpo' })
  @ApiResponse({ status: 404, description: 'Conductor no encontrado' })
  remove(
    @Param('email') email: string,
    @CurrentUser() user: UserInterface
  ) {
    return this.conductoresService.remove(email, user.userId);
  }
}