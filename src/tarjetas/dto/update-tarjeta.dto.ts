import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateTarjetaDto } from './create-tarjeta.dto';
import { IsOptional } from 'class-validator';

export class UpdateTarjetaDto extends PartialType(CreateTarjetaDto) {
  @ApiProperty({
    example: 'activa',
    description: 'Nuevo estado de la tarjeta',
    enum: ['activa', 'inactiva'],
    required: false
  })
  @IsOptional()
  estado?: 'activa' | 'inactiva';

  @ApiProperty({
    example: 'Pérdida de la tarjeta física',
    description: 'Motivo del cambio de estado',
    required: false
  })
  @IsOptional()
  motivo?: string;
}