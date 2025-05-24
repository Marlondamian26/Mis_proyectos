// create-invoce.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsIn, IsNotEmpty } from 'class-validator';

export class CreateFacturaDto {
  @ApiProperty({ description: 'Monto total de la factura', example: 150.50 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ enum: ['CUP', 'USD'], description: 'Moneda de pago' })
  @IsIn(['CUP', 'USD'])
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ description: 'ID del conductor asociado', example: 'd3b4f5e6-7a8b-9c0d-1e2f-3a4b5c6d7e8f' })
  @IsString()
  @IsNotEmpty()
  driverId: string;

  @ApiProperty({ enum: ['Transfermóvil', 'Efectivo', 'Tarjeta'], description: 'Método de pago utilizado' })
  @IsIn(['Transfermóvil', 'Efectivo', 'Tarjeta'])
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiProperty({ description: 'Consumo en kWh', example: 45.8 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  kWh: number;

  @ApiProperty({ description: 'Tarifa aplicada por kWh', example: 0.25 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsNotEmpty()
  tariff: number;

  @ApiProperty({ description: 'IVA aplicado', example: 10.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  iva: number;

  @ApiProperty({ description: 'ID del pago asociado', example: 'd3b4f5e6-7a8b-9c0d-1e2f-3a4b5c6d7e8f' })
  @IsString()
  @IsNotEmpty()
  pagoId: string;

  @ApiProperty({ description: 'ID de la tarifa aplicada', example: 'd3b4f5e6-7a8b-9c0d-1e2f-3a4b5c6d7e8f' })
  @IsString()
  @IsNotEmpty()
  tarifaId: string;
}





