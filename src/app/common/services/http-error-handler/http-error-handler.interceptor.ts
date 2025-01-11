import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationsService } from '../notification/notification.service';

export function httpErrorHandlerInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const notificationService = inject(NotificationsService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      notificationService.pushError$$.next({
        code: error.status,
        message: error.message,
        additionalData: error,
      });
      return throwError(() => new Error(error.message));
    })
  );
}
