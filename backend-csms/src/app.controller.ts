import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@ApiTags('Inicio')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar estado del servicio' })
  @ApiResponse({ 
    status: 200, 
    description: 'Mensaje de bienvenida',
    schema: { example: '¡Bienvenido a Phase Platform API!' } 
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
