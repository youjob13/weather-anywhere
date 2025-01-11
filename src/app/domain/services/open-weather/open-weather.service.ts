import { effect, inject, Injectable, signal, untracked } from '@angular/core';
import { OpenWeatherAPIService } from '../open-weather-api/open-weather-api.service';
import {
  BehaviorSubject,
  EMPTY,
  filter,
  finalize,
  map,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { ICityWeather } from '../../models/weather.model';
import { transformRawData } from './utils';
import { IGeolocationRaw } from '../../models/geolocation.models';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface ILoadWeatherParams {
  city: string;
  page?: number;
}

const INITIAL_PAGE_NUMBER = 1;
export const MAX_PAGE_NUMBER = 5;

@Injectable({
  providedIn: 'root',
})
export class OpenWeatherService {
  private readonly openWeatherAPIService = inject(OpenWeatherAPIService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly searchValue = signal<string>('');
  readonly currentPage = signal<number>(INITIAL_PAGE_NUMBER);
  readonly isLoading = signal<boolean>(false);
  readonly currentCity = signal<IGeolocationRaw | null>(null);
  readonly currentWeather = signal<ICityWeather | null>(null);

  readonly loadMore$$ = new Subject();
  readonly loadWeather$$ = new BehaviorSubject<ILoadWeatherParams>({
    city: '',
    page: INITIAL_PAGE_NUMBER,
  });

  constructor() {
    this.loadWeather$$
      .pipe(
        takeUntilDestroyed(),
        filter(
          ({ city }) => this.searchValue().toLowerCase() !== city.toLowerCase()
        ),
        switchMap(({ city, page }) => this.loadCityWeather(city, page))
      )
      .subscribe();

    this.loadMore$$
      .pipe(
        takeUntilDestroyed(),
        switchMap(() => {
          const currentPage = this.currentPage();
          const currentCity = this.currentCity();

          if (!currentCity || MAX_PAGE_NUMBER === currentPage) {
            return of(undefined);
          }

          this.isLoading.set(true);

          return this.loadWeather(currentCity, currentPage + 1).pipe(
            finalize(() => this.isLoading.set(false))
          );
        })
      )
      .subscribe();

    effect(() => {
      const city = this.searchValue();
      const page = this.currentPage();

      if (!city) {
        this.router.navigate([]);
        return;
      }

      this.updateRoute(page ?? INITIAL_PAGE_NUMBER, city);
    });
  }

  private loadCityWeather(city: string, page = INITIAL_PAGE_NUMBER) {
    const searchValue = city.trim();
    this.searchValue.set(searchValue);

    if (!searchValue) {
      return this.resetData();
    }

    this.isLoading.set(true);

    return this.openWeatherAPIService.getCityCoordinates(city).pipe(
      tap((cityCoordinates) => this.currentCity.set(cityCoordinates)),
      switchMap((cityCoordinates) =>
        cityCoordinates == null
          ? this.resetData()
          : this.loadWeather(cityCoordinates, page)
      ),
      finalize(() => this.isLoading.set(false))
    );
  }

  private loadWeather(cityGeolocation: IGeolocationRaw, page: number) {
    return this.openWeatherAPIService
      .getWeatherByCoordinates(cityGeolocation, page)
      .pipe(
        map((data) => transformRawData(data)),
        tap((transformedData) => this.currentWeather.set(transformedData)),
        tap(() => this.currentPage.set(page))
      );
  }

  private updateRoute(currentPage: number, searchValue: string) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: currentPage, city: searchValue },
      queryParamsHandling: 'merge',
    });
  }

  private resetData() {
    this.currentCity.set(null);
    this.currentWeather.set(null);
    this.currentPage.set(INITIAL_PAGE_NUMBER);
    return EMPTY;
  }
}
