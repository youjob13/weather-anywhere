import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { DatePipe } from '@angular/common';
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
  imports: [DatePipe, ReactiveFormsModule],
})
export class TableComponent {
  readonly openWeatherService = inject(OpenWeatherService);
  readonly MAX_PAGE_NUMBER = MAX_PAGE_NUMBER;

  constructor() {
    this.openWeatherService.init();
  }

  loadMore() {
    this.openWeatherService.loadMore();
  }
}
