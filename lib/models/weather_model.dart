class WeatherModel {
  final String cityName;
  final double temperature;
  final double feelsLike;
  final int humidity;
  final String condition;
  final double windSpeed;
  final int visibility;

    WeatherModel({
    required this.cityName,
    required this.temperature,
    required this.feelsLike,
    required this.humidity,
    required this.condition,
    required this.windSpeed,
    required this.visibility,
  });

   factory WeatherModel.fromJson(Map<String, dynamic> json) {
    return WeatherModel(
      cityName:    json['name'],
      temperature: (json['main']['temp'] as num).toDouble(),
      feelsLike:   (json['main']['feels_like'] as num).toDouble(),
      humidity:    json['main']['humidity'],
      condition:   json['weather'][0]['main'],
      windSpeed:   (json['wind']['speed'] as num).toDouble(),
      visibility:  json['visibility'],
    );
  }

}
