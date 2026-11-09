import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const started = Date.now();
    const body =
      request.body && Object.keys(request.body).length > 0
        ? ` ${JSON.stringify(request.body)}`
        : '';

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<Response>();
          this.logger.log(
            `${request.method} ${request.originalUrl} ${response.statusCode} ${Date.now() - started}ms${body}`,
          );
        },
        error: (err: Error) => {
          this.logger.warn(
            `${request.method} ${request.originalUrl} failed after ${Date.now() - started}ms: ${err.message}${body}`,
          );
        },
      }),
    );
  }
}
