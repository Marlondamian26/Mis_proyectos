import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseException extends HttpException {
  constructor(
    message: string,
    status: number,
    error?: string,
    details?: any
  ) {
    super(
      {
        message,
        error: error || 'Error',
        details,
        timestamp: new Date().toISOString(),
      },
      status
    );
  }
}

// Ejemplos de excepciones específicas
export class ValidationException extends BaseException {
  constructor(message: string, details?: any) {
    super(message, HttpStatus.BAD_REQUEST, undefined, details);
  }
}

export class NotFoundException extends BaseException {
  constructor(message: string, details?: any) {
    super(message, HttpStatus.NOT_FOUND, undefined, details);
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message: string = 'Unauthorized', details?: any) {
    super(message, HttpStatus.UNAUTHORIZED, undefined, details);
  }
}

export class ForbiddenException extends BaseException {
  constructor(message: string = 'Forbidden', details?: any) {
    super(message, HttpStatus.FORBIDDEN, undefined, details);
  }
} 