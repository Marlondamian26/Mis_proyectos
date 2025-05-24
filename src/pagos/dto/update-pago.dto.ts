// src/pagos/dto/update-pago.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from "@nestjs/mapped-types";
import { CreatePagoDto } from "./create-pago.dto";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class UpdatePagoDto extends PartialType(CreatePagoDto) {
  @ApiProperty({
    enum: ['pendiente', 'confirmado', 'fallido'],
    description: 'Estado actual del pago',
    example: 'confirmado',
    required: false
  })
  @IsOptional()
  @IsEnum(['pendiente', 'confirmado', 'fallido'])
  estado?: 'pendiente' | 'confirmado' | 'fallido';

  @ApiProperty({
    example: 'PAY-2024-001',
    description: 'Referencia externa del pago (ej: número de transacción bancaria)',
    required: false
  })
  @IsOptional()
  @IsString()
  referencia_externa?: string;
}