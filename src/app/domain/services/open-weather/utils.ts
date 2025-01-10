import { ICityWeatherRawData, ICityWeather } from '../../models/weather.model';

export const transformRawData = (
  data: ICityWeatherRawData | null
): ICityWeather | null => {
  if (!data) {
    return null;
  }

  return {
    city: data.city.name,
    data: data.list.map((value) => ({
      time: value.dt_txt,
      temperature: value.main.temp,
      feelsLike: value.main.feels_like,
      weather: value.weather[0],
      precipitation: value.pop,
      cloudiness: value.clouds.all,
    })),
  };
};
