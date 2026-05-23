import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:weather_app/models/weather_model.dart';

class WeatherServices {
  static const String apiKey = "e98d1d0b5a8a846931c639619623630e";
  static const String baseUrl =
      "https://api.openweathermap.org/data/2.5/weather";

  Future<WeatherModel> fetchWeather(String cityName) async {
    String apiUrl = "$baseUrl?q=$cityName&appid=$apiKey&units=metric";

    http.Response response = await http.get(Uri.parse(apiUrl));

  

    if (response.statusCode == 200) {
      return WeatherModel.fromJson(jsonDecode(response.body));
    } else {
      throw ("failed to load wather");
    }
  }
}
