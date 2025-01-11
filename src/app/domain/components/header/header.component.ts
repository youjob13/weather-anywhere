import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { InputComponent } from '../../../common/components/input/input.component';
import { OpenWeatherService } from '../../services/open-weather/open-weather.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputComponent, ReactiveFormsModule],
})
export class HeaderComponent implements OnChanges {
  initialSearchValue = input<string>('');

  private readonly openWeatherService = inject(OpenWeatherService);

  readonly inputControl = new FormControl<string>('', { nonNullable: true });

  constructor() {
    this.inputControl.valueChanges
      .pipe(
        takeUntilDestroyed(),
        tap((value) =>
          this.openWeatherService.loadWeather$$.next({ city: value })
        )
      )
      .subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialSearchValue'].firstChange) {
      this.inputControl.setValue(this.initialSearchValue());
    }
  }
}
