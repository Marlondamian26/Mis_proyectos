// update-invoice.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFacturaDto {
  @ApiProperty({ required: false, description: 'Notas adicionales', example: 'Pago realizado con retraso' })
  notes?: string;
  
  @ApiProperty({ required: false, description: 'Referencia de pago externa', example: 'PAY-2023-001' })
  paymentReference?: string;
}