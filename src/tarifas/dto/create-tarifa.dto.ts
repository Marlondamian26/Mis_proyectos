import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsIn, IsNotEmpty, Matches, Max, Min } from 'class-validator';

export class CreateTarifaDto {
  @ApiProperty({
    example: 'CCS2',
    description: 'Tipo de conector eléctrico'
  })
  @IsNotEmpty()
  tipo_conector: string;

  @ApiProperty({
    example: 0.85,
    description: 'Precio por kWh (entre 0.1 y 1.5)'
  })
  @IsDecimal({ decimal_digits: '2' })
  @Min(0.1)
  @Max(1.5)
  precio_kwh: number;

  @ApiProperty({
    example: '08:00',
    description: 'Hora de inicio en formato HH:mm'
  })
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/)
  hora_inicio: string;

  @ApiProperty({
    example: '18:00',
    description: 'Hora de fin en formato HH:mm'
  })
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/)
  hora_fin: string;

  @ApiProperty({
    example: 'CUP',
    description: 'Moneda de la tarifa',
    enum: ['CUP', 'USD']
  })
  @IsIn(['CUP', 'USD'])
  moneda: 'CUP' | 'USD';
}