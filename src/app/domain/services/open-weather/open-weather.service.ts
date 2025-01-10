import {
  DestroyRef,
  inject,
  Injectable,
  Injector,
  signal,
} from '@angular/core';
import { OpenWeatherAPIService } from '../open-weather-api/open-weather-api.service';
import { EMPTY, finalize, map, skip, switchMap, take, tap } from 'rxjs';
import { ICityWeather } from '../../models/weather.model';
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
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        skip(1),
        switchMap((data) => {
          const newCurrentPage = Number(data['page'] ?? INITIAL_PAGE_NUMBER);
          return this.loadCityWeather(data['city'], newCurrentPage);
        })
      )
      .subscribe();
  }

  public searchCity(city: string) {
    if (this.searchValue()?.toLowerCase() === city.toLowerCase()) {
      return;
    }
    this.updateRoute(INITIAL_PAGE_NUMBER, city);
  }

  public loadMore() {
    const searchValue = this.searchValue();
    const currentPage = this.currentPage();

    if (!searchValue || MAX_PAGE_NUMBER === currentPage) {
      return;
    }

    this.updateRoute(currentPage + 1, searchValue);
  }

  private loadCityWeather(city = '', page = INITIAL_PAGE_NUMBER) {
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
      : this.openWeatherAPIService.getCityCoordinates(city);

    return city$.pipe(
      take(1),
      tap((cityCoordinates) => this.currentCity.set(cityCoordinates)),
      switchMap((cityCoordinates) => {
        const cityGeolocation = cityCoordinates;

        if (cityGeolocation == null) {
          return this.resetData();
        }

        return this.openWeatherAPIService.getWeatherByCoordinates(
          cityGeolocation,
          page
        );
      }),
      map((data) => transformRawData(data)),
      tap((transformedData) => this.currentWeather.set(transformedData)),
      tap(() => this.currentPage.set(page)),
      finalize(() => this.isLoading.set(false))
    );
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
