interface ICity {
  coord: { lat: number; lon: number };
  country: string;
  id: number;
  name: string;
  population: number;
  sunrise: number;
  sunset: number;
  timezone: number;
}

interface IWeatherRawData {
  description: string;
  icon: string;
  id: number;
  main: string;
}

interface IListRawData {
  clouds: Record<'all', number>;
  dt: number;
  dt_txt: string;
  main: Record<
    | 'feels_like'
    | 'grnd_level'
    | 'humidity'
    | 'pressure'
    | 'sea_level'
    | 'temp'
    | 'temp_kf'
    | 'temp_max'
    | 'temp_min',
    number
  >;
  pop: number;
  rain: Record<string, number>;
  sys: Record<string, string>;
  visibility: number;
  weather: IWeatherRawData[];
  wind: Record<'speed' | 'deg' | 'gust', number>;
}

export interface ICityWeatherRawData {
  city: ICity;
  cnt: number;
  cod: string;
  list: IListRawData[];
  message: number;
}

export interface ICityWeather {
  city: ICityWeatherRawData['city']['name'];
  data: {
    time: IListRawData['dt_txt'];
    temperature: IListRawData['main']['temp'];
    feelsLike: IListRawData['main']['feels_like'];
    weather: IListRawData['weather'][0];
    precipitation: IListRawData['pop'];
    cloudiness: IListRawData['clouds']['all'];
  }[];
}
