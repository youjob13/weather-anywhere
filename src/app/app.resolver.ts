import { inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { OpenWeatherService } from './domain/services/open-weather/open-weather.service';

export const appResolver = (route: ActivatedRouteSnapshot) => {
  const page = Number(route.queryParamMap.get('page') || 1);
  const city = route.queryParamMap.get('city');

  if (!city) {
    return of(undefined);
  }

  return inject(OpenWeatherService).loadWeather$$.next({ city, page });
};
