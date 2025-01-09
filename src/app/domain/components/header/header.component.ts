import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { InputComponent } from '../../../common/components/input.component';
import { OpenWeatherService } from '../../services/open-weather/open-weather.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputComponent, ReactiveFormsModule],
})
export class HeaderComponent {
  private readonly openWeatherService = inject(OpenWeatherService);

  readonly inputControl = new FormControl();

  constructor() {
    this.inputControl.valueChanges
      .pipe(
        takeUntilDestroyed(),
        switchMap((value) => this.openWeatherService.loadCityWeather(value))
      )
      .subscribe();
  }
}
