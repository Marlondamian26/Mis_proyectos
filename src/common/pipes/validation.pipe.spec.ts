import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { ValidationPipe } from './validation.pipe';
import { IsString, IsInt, MinLength, Min } from 'class-validator';

class TestDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsInt()
  @Min(0)
  age: number;
}

describe('ValidationPipe', () => {
  let pipe: ValidationPipe;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidationPipe],
    }).compile();

    pipe = module.get<ValidationPipe>(ValidationPipe);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should pass validation for valid DTO', async () => {
    const value = { name: 'Test', age: 25 };
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: TestDto,
      data: '',
    };

    const result = await pipe.transform(value, metadata);
    expect(result).toEqual(value);
  });

  it('should throw BadRequestException for invalid DTO', async () => {
    const value = { name: '', age: -1 };
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: TestDto,
      data: '',
    };

    await expect(pipe.transform(value, metadata)).rejects.toThrow(BadRequestException);
  });

  it('should return value when no metatype is provided', async () => {
    const value = { name: 'Test', age: 25 };
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: undefined,
      data: '',
    };

    const result = await pipe.transform(value, metadata);
    expect(result).toEqual(value);
  });

  it('should return value for primitive types', async () => {
    const value = 'test';
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: String,
      data: '',
    };

    const result = await pipe.transform(value, metadata);
    expect(result).toEqual(value);
  });
}); 