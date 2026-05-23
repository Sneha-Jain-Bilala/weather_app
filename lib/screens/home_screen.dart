import 'package:flutter/material.dart';
import 'package:weather_app/services/weather_services.dart';
import 'package:weather_app/models/weather_model.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final WeatherServices _weatherService = WeatherServices();

  bool isLoading = false;
  String? errorMssg = null;
  WeatherModel? _weather;

  // ── Static / fake data (replaced by real API data in a later step) ──
  String cityName = 'Mumbai';
  String temperature = '32';
  String condition = 'Sunny';
  String humidity = '65%';
  String windSpeed = '12 km/h';
  String feelsLike = '34°C';
  String highTemp = '35°C';
  String lowTemp = '28°C';
  String visibility = '10 km';

  final TextEditingController _searchController = TextEditingController();

  // Fake 5-day forecast
  final List<Map<String, String>> forecast = [
    {'day': 'Mon', 'icon': 'sunny', 'high': '35°', 'low': '28°'},
    {'day': 'Tue', 'icon': 'cloudy', 'high': '30°', 'low': '25°'},
    {'day': 'Wed', 'icon': 'rainy', 'high': '27°', 'low': '22°'},
    {'day': 'Thu', 'icon': 'sunny', 'high': '33°', 'low': '27°'},
    {'day': 'Fri', 'icon': 'cloudy', 'high': '31°', 'low': '26°'},
  ];

  IconData _getWeatherIcon(String cond) {
    switch (cond.toLowerCase()) {
      case 'sunny':
        return Icons.wb_sunny_rounded;
      case 'cloudy':
        return Icons.cloud_rounded;
      case 'rainy':
        return Icons.grain_rounded;
      case 'stormy':
        return Icons.thunderstorm_rounded;
      default:
        return Icons.wb_sunny_rounded;
    }
  }

  String _getCurrentDate() {
    final now = DateTime.now();
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return '${days[now.weekday - 1]}, ${now.day} ${months[now.month - 1]}';
  }

  void searchWeather() async {
    String search = _searchController.text.trim();
    if (search.isEmpty) search = "Mumbai";

    setState(() {
      isLoading = true; // show loading spinner
      errorMssg = null; // clear any old error
    });

    try {
      WeatherModel data = await _weatherService.fetchWeather(search);
      setState(() {
        _weather = data;

        // Update all UI variables with real data
        cityName = data.cityName;
        temperature = data.temperature.toStringAsFixed(0); // 32.5 → "32"
        condition = data.condition;
        humidity = '${data.humidity}%'; // 65 → "65%"
        windSpeed =
            '${data.windSpeed.toStringAsFixed(1)} m/s'; // 3.5 → "3.5 m/s"
        feelsLike = '${data.feelsLike.toStringAsFixed(1)}°C'; // 34.1 → "34.1°C"
        visibility =
            '${(data.visibility / 1000).toStringAsFixed(0)} km'; // 10000 → "10 km"
      });
    } catch (e) {
      setState(() {
        errorMssg = "City not found. Please try again."; // show error
      });
    } finally {
      setState(() {
        isLoading = false; // ALWAYS stop loading — success or fail
      });
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    // TODO: implement initState
    super.initState();

    searchWeather();
  }

  // ─────────────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFFAD1457), // deep rose
              Color(0xFFE91E8C), // hot pink
              Color(0xFFFF80AB), // soft pink
              Color(0xFFFFCDD2), // blush
            ],
            stops: [0.0, 0.35, 0.70, 1.0],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  _buildSearchBar(),
                  const SizedBox(height: 16),

                  // Show spinner while loading
                  if (isLoading)
                    const CircularProgressIndicator(color: Colors.white),

                  // Show error if something went wrong
                  if (errorMssg != null)
                    Text(
                      errorMssg!,
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                    ),

                  const SizedBox(height: 12),
                  _buildMainWeatherCard(),
                  const SizedBox(height: 20),
                  _buildDetailsRow(),
                  const SizedBox(height: 16),
                  _buildExtraInfoRow(),
                  const SizedBox(height: 20),
                  _buildForecastSection(),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  // ── Search Bar ────────────────────────────────────────────────────────────
  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.25),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: Colors.white.withOpacity(0.5), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFAD1457).withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: TextField(
        controller: _searchController,
        style: const TextStyle(color: Colors.white, fontSize: 16),
        onSubmitted: (_) => searchWeather(), // pressing Enter triggers search
        decoration: InputDecoration(
          hintText: 'Search city...',
          hintStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
          prefixIcon: Icon(
            Icons.location_on_rounded,
            color: Colors.white.withOpacity(0.85),
          ),
          suffixIcon: IconButton(
            icon: const Icon(Icons.search_rounded, color: Colors.white),
            onPressed: searchWeather, // tapping the icon triggers search
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            vertical: 16,
            horizontal: 20,
          ),
        ),
      ),
    );
  }

  // ── Main Weather Card ─────────────────────────────────────────────────────
  Widget _buildMainWeatherCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.18),
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: Colors.white.withOpacity(0.4), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFAD1457).withOpacity(0.25),
            blurRadius: 30,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          // City name
          Text(
            cityName,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Today · ${_getCurrentDate()}',
            style: TextStyle(
              color: Colors.white.withOpacity(0.75),
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 22),

          // Big weather icon inside a glassy circle
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              shape: BoxShape.circle,
              border: Border.all(
                color: Colors.white.withOpacity(0.35),
                width: 1.5,
              ),
            ),
            child: Icon(
              _getWeatherIcon(condition),
              size: 80,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 22),

          // Temperature hero number
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                temperature,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 90,
                  fontWeight: FontWeight.w300,
                  height: 1.0,
                ),
              ),
              const Padding(
                padding: EdgeInsets.only(top: 16),
                child: Text(
                  '°C',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 30,
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),

          // Condition label
          Text(
            condition,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w500,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 14),

          // High / Low badges
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _tempBadge('H: $highTemp', Icons.arrow_upward_rounded),
              const SizedBox(width: 14),
              _tempBadge('L: $lowTemp', Icons.arrow_downward_rounded),
            ],
          ),
        ],
      ),
    );
  }

  Widget _tempBadge(String label, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.white, size: 14),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(color: Colors.white, fontSize: 13),
          ),
        ],
      ),
    );
  }

  // ── Details Row ───────────────────────────────────────────────────────────
  Widget _buildDetailsRow() {
    return Row(
      children: [
        _detailCard(
          Icons.water_drop_rounded,
          'Humidity',
          humidity,
          Colors.blue,
        ),
        const SizedBox(width: 12),
        _detailCard(Icons.air_rounded, 'Wind', windSpeed, Colors.purple),
        const SizedBox(width: 12),
        _detailCard(
          Icons.thermostat_rounded,
          'Feels Like',
          feelsLike,
          Colors.orange,
        ),
      ],
    );
  }

  Widget _detailCard(
    IconData icon,
    String label,
    String value,
    Color iconColor,
  ) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 10),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.18),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.35), width: 1),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.25),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: Colors.white, size: 22),
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 15,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                color: Colors.white.withOpacity(0.7),
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Extra Info Row (Visibility / Sunrise / Sunset) ────────────────────────
  Widget _buildExtraInfoRow() {
    return Row(
      children: [
        _infoTile(Icons.visibility_rounded, 'Visibility', visibility),
        const SizedBox(width: 12),
        _infoTile(Icons.wb_twilight_rounded, 'Sunrise', '6:12 AM'),
        const SizedBox(width: 12),
        _infoTile(Icons.nights_stay_rounded, 'Sunset', '7:45 PM'),
      ],
    );
  }

  Widget _infoTile(IconData icon, String label, String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.13),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: Colors.white.withOpacity(0.25), width: 1),
        ),
        child: Column(
          children: [
            Icon(icon, color: Colors.white.withOpacity(0.9), size: 20),
            const SizedBox(height: 6),
            Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                color: Colors.white.withOpacity(0.6),
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── 5-Day Forecast ────────────────────────────────────────────────────────
  Widget _buildForecastSection() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.18),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.white.withOpacity(0.35), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.calendar_month_rounded,
                color: Colors.white.withOpacity(0.85),
                size: 18,
              ),
              const SizedBox(width: 8),
              Text(
                '5-DAY FORECAST',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.85),
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.8,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: forecast.map(_forecastDay).toList(),
          ),
        ],
      ),
    );
  }

  Widget _forecastDay(Map<String, String> day) {
    return Column(
      children: [
        Text(
          day['day']!,
          style: TextStyle(
            color: Colors.white.withOpacity(0.8),
            fontSize: 13,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 8),
        Icon(_getWeatherIcon(day['icon']!), color: Colors.white, size: 24),
        const SizedBox(height: 8),
        Text(
          day['high']!,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
        ),
        Text(
          day['low']!,
          style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 12),
        ),
      ],
    );
  }
}
