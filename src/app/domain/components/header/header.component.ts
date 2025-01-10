import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { InputComponent } from '../../../common/components/input.component';
import { OpenWeatherService } from '../../services/open-weather/open-weather.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { skip, skipUntil, skipWhile, tap } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

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

        if (searchValue == null) {
          return;
        }

        if (this.inputControl.value == null) {
          this.inputControl.setValue(searchValue);
        }

        effectRef.destroy();
      },
      { manualCleanup: true }
    );

    this.inputControl.valueChanges
      .pipe(
        takeUntilDestroyed(),
        tap((value) => this.openWeatherService.searchCity(value!))
      )
      .subscribe();
  }
}
