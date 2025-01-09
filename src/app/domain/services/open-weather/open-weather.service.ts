import { inject, Injectable, signal } from '@angular/core';
import { OpenWeatherAPIService } from '../open-weather-api/open-weather-api.service';
import {
  catchError,
  EMPTY,
  finalize,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { ICityWeather, ICityWeatherRawData } from '../../models/weather.model';
import { transformRawData } from './utils';
import { IGeolocationRaw } from '../../models/geolocation.models';

const INITIAL_PAGE_NUMBER = 1;
export const MAX_PAGE_NUMBER = 5;

@Injectable({
  providedIn: 'root',
})
export class OpenWeatherService {
  private readonly openWeatherAPIService = inject(OpenWeatherAPIService);

  readonly isLoading = signal<boolean>(false);
  readonly currentCity = signal<IGeolocationRaw | null>(null);
  readonly currentWeather = signal<ICityWeather | null>(null);
  readonly currentPage = signal<number>(INITIAL_PAGE_NUMBER);

  public loadCityWeather(city: string) {
    if (city.trim() === '') {
      this.setData(null);
      return EMPTY;
    }

    this.isLoading.set(true);

    return this.openWeatherAPIService.getCityCoordinates(city).pipe(
      tap((cityCoordinates) => this.setData(cityCoordinates[0])),
      switchMap((cityCoordinates) => {
        const cityGeolocation = cityCoordinates[0];

        if (cityGeolocation == null) {
          return EMPTY;
        }

        return this.openWeatherAPIService.getWeatherByCoordinates(
          cityGeolocation
        );
      }),
      this.upsertWeatherData(),
      finalize(() => this.isLoading.set(false))
    );
  }

  public loadMore() {
    const currentWeather = this.currentWeather();
    const currentCity = this.currentCity();

    if (
      !currentWeather ||
      !currentCity ||
      MAX_PAGE_NUMBER === this.currentPage()
    ) {
      return EMPTY;
    }

    this.isLoading.set(true);
    this.currentPage.update((prev) => prev + 1);

    return this.openWeatherAPIService
      .getWeatherByCoordinates(currentCity, this.currentPage())
      .pipe(
        this.upsertWeatherData(),
        finalize(() => this.isLoading.set(false))
      );
  }

  private setData(cityData: IGeolocationRaw | null) {
    this.currentCity.set(cityData);
    this.currentWeather.set(null);
    this.currentPage.set(INITIAL_PAGE_NUMBER);
  }

  private upsertWeatherData() {
    return (source: Observable<ICityWeatherRawData | null>) =>
      source.pipe(
        map((data) => transformRawData(data)),
        tap((transformedData) => this.currentWeather.set(transformedData)),
        catchError((error) => {
          console.error('Error processing weather data', error);
          throw error;
        })
      );
  }
}
