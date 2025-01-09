import { InjectionToken } from '@angular/core';

export const APP_CONFIG = new InjectionToken('app.config', {
  providedIn: 'root',
  factory: () => {
    return {
      openWeatherEndpoint: 'http://api.openweathermap.org',
      apiKey: '010721642521f31b0fbc8c3831d45951',
    };
  },
});
