import { Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, tap } from 'rxjs';

interface INotification {
  id: number;
  type: 'error' | 'info' | 'warn';
  data: {
    code: number;
    message: string;
    additionalData?: object;
  };
}

const TIME_TO_DISPLAY_NOTIFICATION = 3000;

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  readonly errors = signal<Error[]>([]);
  readonly allNotifications = signal<INotification[]>([]);

  readonly pushError$$ = new Subject<INotification['data']>();

  constructor() {
    this.pushError$$
      .pipe(
        takeUntilDestroyed(),
        tap((error) => {
          this.allNotifications.update((notifications) => [
            {
              id: 123,
              type: 'error',
              data: { code: error.code, message: error.message },
            },
            ...notifications,
          ]);
        }),
        tap(() => {
          setTimeout(() => {
            this.allNotifications.update((notifications) =>
              notifications.slice(0, -1)
            );
          }, TIME_TO_DISPLAY_NOTIFICATION);
        })
      )
      .subscribe();
  }
}
