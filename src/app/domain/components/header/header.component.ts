import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { InputComponent } from '../../../common/components/input.component';
import { OpenWeatherService } from '../../services/open-weather/open-weather.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { distinctUntilChanged, EMPTY, switchMap, tap } from 'rxjs';
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

  readonly inputControl = new FormControl<string | null>(null);

  constructor() {
    const effectRef = effect(
      () => {
        const searchValue = this.openWeatherService.searchValue();
        if (searchValue) {
          this.inputControl.setValue(searchValue);
        }
      },
      {
        manualCleanup: true,
      }
    );

    this.inputControl.valueChanges
      .pipe(
        takeUntilDestroyed(),
        tap((value) => {
          if (value != null) {
            this.openWeatherService.searchCity(value);
          } else {
            effectRef.destroy();
          }
        })
      )
      .subscribe();
  }
}
