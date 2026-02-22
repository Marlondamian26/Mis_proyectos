// filter-invoices.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class FilterFacturasDto {
  @ApiProperty({ required: false, description: 'Fecha inicial del rango' })
  startDate?: Date;
  
  @ApiProperty({ required: false, description: 'Fecha final del rango' })
  endDate?: Date;
  
  @ApiProperty({ required: false, description: 'Monto mínimo', example: 50 })
  minAmount?: number;
  
  @ApiProperty({ required: false, description: 'Monto máximo', example: 1000 })
  maxAmount?: number;
  
  @ApiProperty({ required: false, description: 'ID del conductor', example: 'd3b4f5e6-7a8b-9c0d-1e2f-3a4b5c6d7e8f' })
  driverId?: string;
  
  @ApiProperty({ enum: ['active', 'annulled'], required: false })
  status?: string;
}