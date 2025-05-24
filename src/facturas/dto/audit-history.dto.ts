// audit-history.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class AuditHistoryDto {
  @ApiProperty({ enum: ['CREATED', 'UPDATED', 'ANNULLED'] })
  action: string;
  
  @ApiProperty({ type: Date })
  timestamp: Date;
  
  @ApiProperty({ description: 'ID del usuario que realizó la acción' })
  userId: string;
  
  @ApiProperty({ type: Object })
  changedFields: Record<string, any>;
}