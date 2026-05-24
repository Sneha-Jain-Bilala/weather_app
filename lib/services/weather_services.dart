import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:weather_app/models/weather_model.dart';

class WeatherServices {
  static String get apiKey => dotenv.env['WEATHER_API_KEY'] ?? '';
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
