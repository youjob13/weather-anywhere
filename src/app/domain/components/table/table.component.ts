import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe, PercentPipe } from '@angular/common';
import {
  MAX_PAGE_NUMBER,
  OpenWeatherService,
} from '../../services/open-weather/open-weather.service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, PercentPipe, ReactiveFormsModule],
})
export class TableComponent {
  readonly openWeatherService = inject(OpenWeatherService);
  readonly MAX_PAGE_NUMBER = MAX_PAGE_NUMBER;

  loadMore() {
    this.openWeatherService.loadMore$$.next(undefined);
  }
}
