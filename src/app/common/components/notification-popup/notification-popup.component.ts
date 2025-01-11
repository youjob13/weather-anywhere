import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationsService } from '../../services/notification/notification.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-notification-popup',
  templateUrl: './notification-popup.component.html',
  styleUrl: './notification-popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TitleCasePipe],
})
export class NotificationPopupComponent {
  readonly notificationsService = inject(NotificationsService);
}
