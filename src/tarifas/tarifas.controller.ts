import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam, 
  ApiBody 
} from '@nestjs/swagger';
import { Controller, Post, Body, Patch, Param, Delete, Get, UseGuards } from '@nestjs/common';
import { TarifasService } from './tarifas.service';
import { CreateTarifaDto } from './dto/create-tarifa.dto';
import { UpdateTarifaDto } from './dto/update-tarifa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { UserInterface } from '../auth/interfaces/user.interface';

@ApiTags('Tarifas')
@ApiBearerAuth()
@Controller('tarifas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TarifasController {
  constructor(private readonly tarifasService: TarifasService) {}

  @Post()
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Crear nueva tarifa' })
  @ApiBody({ type: CreateTarifaDto })
  @ApiResponse({ status: 201, description: 'Tarifa creada exitosamente' })
  create(
    @Body() createTarifaDto: CreateTarifaDto,
    @CurrentUser() user: UserInterface
  ) {
    return this.tarifasService.create(createTarifaDto, user.userId);
  }

  @Patch(':id')
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Actualizar tarifa' })
  @ApiParam({ name: 'id', description: 'ID de la tarifa' })
  @ApiBody({ type: UpdateTarifaDto })
  @ApiResponse({ status: 200, description: 'Tarifa actualizada' })
  update(
    @Param('id') id: string,
    @Body() updateTarifaDto: UpdateTarifaDto,
    @CurrentUser() user: UserInterface
  ) {
    return this.tarifasService.update(id, updateTarifaDto, user.userId);
  }

  @Delete(':id')
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Eliminar tarifa' })
  @ApiParam({ name: 'id', description: 'ID de la tarifa' })
  @ApiResponse({ status: 200, description: 'Tarifa eliminada' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: UserInterface
  ) {
    return this.tarifasService.remove(id, user.userId);
  }

  @Get(':id/historial')
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Obtener historial de tarifas' })
  @ApiParam({ name: 'id', description: 'ID de la tarifa' })
  @ApiResponse({ status: 200, description: 'Historial de cambios' })
  getHistorial(@Param('id') id: string) {
    return this.tarifasService.getHistorial(id);
  }
}