import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError, timer } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { LoggerService } from './logger.service';

export const errorRetryInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);

  return next(req).pipe(
    retry({
      count: 2,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        if (shouldRetry(error)) {
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
          logger.warn(`Retrying request (${retryCount}/2) after ${delay}ms`, { url: req.url, error: error.status });
          return timer(delay);
        }
        return throwError(() => error);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      logger.error('HTTP request failed', { 
        url: req.url, 
        status: error.status, 
        message: error.message 
      });
      return throwError(() => error);
    })
  );
};

function shouldRetry(error: HttpErrorResponse): boolean {
  return error.status >= 500 || error.status === 0 || error.status === 408;
}