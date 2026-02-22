import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateTarifaDto } from './create-tarifa.dto';

export class UpdateTarifaDto extends PartialType(CreateTarifaDto) {
  @ApiProperty({
    example: 1.25,
    description: 'Nuevo precio por kWh',
    required: false
  })
  precio_kwh?: number;
  
  // Repetir para otros campos con required: false
}