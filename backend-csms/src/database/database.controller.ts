import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DatabaseService } from './database.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@ApiTags('Database')
@ApiBearerAuth()
@Controller('database')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('health')
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Verificar salud de la base de datos' })
  @ApiResponse({ status: 200, description: 'Estado de la base de datos' })
  async checkHealth() {
    const isHealthy = await this.databaseService.checkHealth();
    const stats = await this.databaseService.getDatabaseStats();
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      stats
    };
  }

  @Post('backup')
  @Roles('admin_cpo')
  @ApiOperation({ summary: 'Ejecutar backup manual de la base de datos' })
  @ApiResponse({ status: 200, description: 'Backup iniciado exitosamente' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  async executeBackup() {
    try {
      const scriptPath = process.platform === 'win32' 
        ? 'C:\\ruta\\completa\\a\\backup.ps1'
        : '/ruta/a/backup.sh';
      
      const command = process.platform === 'win32'
        ? `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`
        : `bash ${scriptPath}`;

      await execAsync(command);
      return { message: 'Backup iniciado exitosamente' };
    } catch (error) {
      throw new Error(`Error al ejecutar backup: ${error.message}`);
    }
  }
} 