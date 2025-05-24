import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from '@nestjs/common';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MetricsInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        this.logger.log({
          method,
          url,
          responseTime,
          timestamp: new Date().toISOString(),
        });

        // Alertar si el tiempo de respuesta excede los límites
        if (method === 'GET' && responseTime > 800) {
          this.logger.warn(`GET request exceeded 800ms: ${url} (${responseTime}ms)`);
        } else if (['POST', 'PUT', 'DELETE'].includes(method) && responseTime > 1500) {
          this.logger.warn(`CRUD operation exceeded 1.5s: ${url} (${responseTime}ms)`);
        }
      }),
    );
  }
} 