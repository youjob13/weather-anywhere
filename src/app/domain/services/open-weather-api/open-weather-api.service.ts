import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IGeolocationRaw } from '../../models/geolocation.models';
import { map, Observable } from 'rxjs';
import { ICityWeatherRawData } from '../../models/weather.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OpenWeatherAPIService {
  private readonly httpClient = inject(HttpClient);
  private readonly openWeatherEndpoint = environment.openWeatherEndpoint;
  private readonly apiKey = environment.apiKey;

  public getCityCoordinates(
    city: string,
    limit = 1
  ): Observable<IGeolocationRaw | null> {
    console.log(this.openWeatherEndpoint);
    const url = `${this.openWeatherEndpoint}/geo/1.0/direct?q=${city}&limit=${limit}&appid=${this.apiKey}`;
    return this.httpClient
      .get<IGeolocationRaw[]>(url)
      .pipe(map((response) => response[0] ?? null));
  }

  public getWeatherByCoordinates(
    {
      lat,
      lon,
    }: {
      lat: number;
      lon: number;
    },
    pageNumber = 1,
    count = 8
  ): Observable<ICityWeatherRawData> {
    const timestampsCountToReturn = pageNumber * count;
    const url = `${this.openWeatherEndpoint}/data/2.5/forecast?lat=${lat}&lon=${lon}&exclude=hourly,daily&units=metric&appid=${this.apiKey}&cnt=${timestampsCountToReturn}`;
    return this.httpClient.get<ICityWeatherRawData>(url);
  }
}
