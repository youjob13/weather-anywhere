import {
  DestroyRef,
  inject,
  Injectable,
  Injector,
  signal,
} from '@angular/core';
import { OpenWeatherAPIService } from '../open-weather-api/open-weather-api.service';
import {
  catchError,
  EMPTY,
  finalize,
  first,
  map,
  Observable,
  of,
  skip,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { ICityWeather, ICityWeatherRawData } from '../../models/weather.model';
import { transformRawData } from './utils';
import { IGeolocationRaw } from '../../models/geolocation.models';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

const INITIAL_PAGE_NUMBER = 1;
export const MAX_PAGE_NUMBER = 5;

@Injectable({
  providedIn: 'root',
})
export class OpenWeatherService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly openWeatherAPIService = inject(OpenWeatherAPIService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly searchValue = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly currentCity = signal<IGeolocationRaw | null>(null);
  readonly currentWeather = signal<ICityWeather | null>(null);
  readonly currentPage = signal<number>(INITIAL_PAGE_NUMBER);

  public init() {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef), skip(1))
      .subscribe((data) =>
        this.loadCityWeather(data['city'] ?? '', data['page']).subscribe()
      );
  }

  public searchCity(city: string) {
    this.updateRoute(INITIAL_PAGE_NUMBER, city);
  }

  public loadMore() {
    const searchValue = this.searchValue();

    if (!searchValue || MAX_PAGE_NUMBER === this.currentPage()) {
      return;
    }

    this.currentPage.update((prev) => prev + 1);
    this.updateRoute(this.currentPage(), searchValue);
  }

  private loadCityWeather(city: string, page = 1) {
    const searchValue = city.trim();
    this.searchValue.set(searchValue);

    if (searchValue === '') {
      return this.resetData();
    }

    this.isLoading.set(true);

    const currentCity = this.currentCity();
    const isLookingForTheSameCity =
      currentCity?.name.toLowerCase() === city.toLowerCase();

    const city$ = isLookingForTheSameCity
      ? toObservable(this.currentCity, {
          injector: this.injector,
        })
      : this.loadCityData(city);

    return city$.pipe(
      take(1),
      tap((cityCoordinates) => this.currentCity.set(cityCoordinates)),
      switchMap((cityCoordinates) => {
        const cityGeolocation = cityCoordinates;

        if (cityGeolocation == null) {
          return this.resetData();
        }

        return this.openWeatherAPIService
          .getWeatherByCoordinates(cityGeolocation, page)
          .pipe(take(1));
      }),
      map((data) => transformRawData(data)),
      tap((transformedData) => this.currentWeather.set(transformedData)),
      // Use the tap instead of the finalize RxJS operator because this.route.queryParams will never complete
      // until the service will be destroyed
      tap({
        next: () => this.isLoading.set(false),
        finalize: () => this.isLoading.set(false),
      })
    );
  }

  private loadCityData(city: string) {
    this.currentPage.set(INITIAL_PAGE_NUMBER);
    return this.openWeatherAPIService.getCityCoordinates(city);
  }

  private updateRoute(currentPage: number, searchValue: string) {
    this.router.navigate([''], {
      queryParams: { page: currentPage, city: searchValue },
    });
  }

  private resetData() {
    this.currentCity.set(null);
    this.currentWeather.set(null);
    this.currentPage.set(INITIAL_PAGE_NUMBER);
    return EMPTY;
  }
}
