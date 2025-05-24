import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateTarjetaDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID único de la tarjeta'
  })
  @IsString()
  id: string;

  @ApiProperty({
    example: '2026-12-31',
    description: 'Fecha de expiración (YYYY-MM-DD)'
  })
  @IsDateString()
  fecha_expiracion: Date;

  @ApiProperty({
    example: true,
    description: 'Indica si es una tarjeta temporal',
    required: false
  })
  @IsBoolean()
  @IsOptional()
  es_temporal?: boolean;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del conductor asociado (opcional para tarjetas temporales)',
    required: false
  })
  @IsString()
  @IsOptional()
  conductor_id?: string;
}

