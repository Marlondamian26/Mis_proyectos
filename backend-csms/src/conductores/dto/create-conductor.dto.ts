import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateConductorDto {
  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del conductor'
  })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del conductor'
  })
  @IsNotEmpty()
  @IsString()
  apellido: string;

  @ApiProperty({
    example: 'juan.perez@example.com',
    description: 'Email único del conductor'
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Contraseña con mínimo 8 caracteres',
    minLength: 8
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
