import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateConductorDto } from './create-conductor.dto';

export class UpdateConductorDto extends PartialType(CreateConductorDto) {
  @ApiProperty({
    example: 'Pedro',
    description: 'Nuevo nombre del conductor',
    required: false
  })
  nombre?: string;

  // Repetir para otros campos con required: false
}