import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({
    example: 10,
    description: 'Cantidad máxima de resultados',
    required: false
  })
  limit?: number;

  @ApiProperty({
    example: 0,
    description: 'Desplazamiento para paginación',
    required: false
  })
  offset?: number;
}