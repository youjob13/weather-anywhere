import { Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, Subject, tap } from 'rxjs';

interface INotification {
  id: string;
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
        map((error) => {
          const notificationId = self.crypto.randomUUID();
          this.allNotifications.update((notifications) => [
            {
              id: notificationId,
              type: 'error',
              data: { code: error.code, message: error.message },
            },
            ...notifications,
          ]);
          return notificationId;
        }),
        tap((notificationId) => {
          setTimeout(() => {
            this.allNotifications.update((notifications) =>
              notifications.filter(
                (notification) => notification.id !== notificationId
              )
            );
          }, TIME_TO_DISPLAY_NOTIFICATION);
        })
      )
      .subscribe();
  }
}
