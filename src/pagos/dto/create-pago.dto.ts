// src/pagos/dto/create-pago.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePagoDto {
  @ApiProperty({
    example: 150.50,
    description: 'Monto del pago',
    type: Number
  })
  @IsDecimal()
  monto: number;

  @ApiProperty({
    enum: ['tarjeta', 'efectivo'],
    description: 'Método de pago utilizado',
    example: 'tarjeta'
  })
  @IsEnum(['tarjeta', 'efectivo'])
  metodo_pago: 'tarjeta' | 'efectivo';

  @ApiProperty({
    example: 'Banco Popular',
    description: 'Nombre del banco (solo para pagos con tarjeta)',
    required: false
  })
  @IsOptional()
  @IsString()
  banco?: string;

  @ApiProperty({
    example: '1234',
    description: 'Últimos 4 dígitos de la tarjeta (solo para pagos con tarjeta)',
    required: false
  })
  @IsOptional()
  @IsString()
  ultimos_digitos?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del conductor que realiza el pago'
  })
  @IsNotEmpty()
  conductor_id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID de la tarifa aplicada'
  })
  @IsNotEmpty()
  tarifa_id: string;
}