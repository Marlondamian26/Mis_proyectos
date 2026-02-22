import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'conductor@example.com',
    description: 'Email del conductor'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del conductor'
  })
  @IsString()
  @MinLength(6)
  password: string;
} 