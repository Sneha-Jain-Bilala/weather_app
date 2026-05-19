// ============================================================
//  BLUSH WEATHER - app.js
//  STEP 5: Frontend now talks to OUR backend, not OpenWeatherMap directly
//  The API key is gone from this file!
// ============================================================

// -------------------------------------------------------------------
//  ✅ API KEY IS GONE! The browser no longer knows the key.
//  We now call OUR backend server at localhost:3000.
//  The backend forwards the request to OpenWeatherMap with the key.
//
//  Before (Step 2):
//    const BASE_URL = "https://api.openweathermap.org/data/2.5/weather"
//    const API_KEY  = "e98d1d0b5a8a846931c639619623630e"   ← visible to anyone!
//
//  After (Step 5):
//    const BASE_URL = "http://localhost:3000/api/weather"   ← our own server
//    No API key needed here at all!
// -------------------------------------------------------------------
const BASE_URL      = "http://localhost:3000/api/weather";
const FORECAST_URL  = "http://localhost:3000/api/forecast";
//
//  Same API key works for both — just a different "route" on the same server.


// -------------------------------------------------------------------
//  DOM REFERENCES - grabbing all the HTML elements we need to update
// -------------------------------------------------------------------
const cityInput   = document.getElementById("cityInput");
const searchBtn   = document.getElementById("searchBtn");
const weatherDisplay = document.getElementById("weatherDisplay");
const loadingState   = document.getElementById("loadingState");
const errorState     = document.getElementById("errorState");
const errorMessage   = document.getElementById("errorMessage");
const emptyState     = document.getElementById("emptyState");

// Weather display fields
const cityNameEl   = document.getElementById("cityName");
const countryNameEl = document.getElementById("countryName");
const localDateEl  = document.getElementById("localDate");
const weatherIconEl = document.getElementById("weatherIcon");
const weatherDescEl = document.getElementById("weatherDesc");
const temperatureEl = document.getElementById("temperature");
const feelsLikeEl  = document.getElementById("feelsLike");
const humidityEl   = document.getElementById("humidity");
const windSpeedEl  = document.getElementById("windSpeed");
const visibilityEl = document.getElementById("visibility");
const pressureEl   = document.getElementById("pressure");
const sunriseEl    = document.getElementById("sunrise");
const sunsetEl     = document.getElementById("sunset");
const tempMaxEl    = document.getElementById("tempMax");
const tempMinEl    = document.getElementById("tempMin");
const cloudinessEl = document.getElementById("cloudiness");
const forecastRow  = document.getElementById("forecastRow");

// -------------------------------------------------------------------
//  STATE MANAGEMENT - controls what's visible on screen
// -------------------------------------------------------------------
function showState(state) {
  weatherDisplay.classList.add("hidden");
  loadingState.classList.add("hidden");
  errorState.classList.add("hidden");
  emptyState.classList.add("hidden");

  if (state === "weather")  weatherDisplay.classList.remove("hidden");
  if (state === "loading")  loadingState.classList.remove("hidden");
  if (state === "error")    errorState.classList.remove("hidden");
  if (state === "empty")    emptyState.classList.remove("hidden");
}

// -------------------------------------------------------------------
//  HELPER: Format Unix Timestamp → "HH:MM AM/PM"
// -------------------------------------------------------------------
function formatUnixTime(unixSeconds, timezoneOffset) {
  const localMs = (unixSeconds + timezoneOffset) * 1000;
  const date = new Date(localMs);
  const hours   = date.getUTCHours();
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const period  = hours >= 12 ? "PM" : "AM";
  const displayHour = (hours % 12 || 12);
  return `${displayHour}:${minutes} ${period}`;
}

// -------------------------------------------------------------------
//  HELPER: Format current date string
// -------------------------------------------------------------------
function getCurrentDateString() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// -------------------------------------------------------------------
//  POPULATE UI with weather data
// -------------------------------------------------------------------
function displayWeatherData(data) {
  const tz = data.timezone;

  cityNameEl.textContent    = data.name;
  countryNameEl.textContent = data.sys.country;
  localDateEl.textContent   = getCurrentDateString();

  weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  weatherIconEl.alt = data.weather[0].description;
  weatherDescEl.textContent = data.weather[0].description;

  temperatureEl.textContent = Math.round(data.main.temp);
  feelsLikeEl.textContent   = Math.round(data.main.feels_like);

  humidityEl.textContent  = `${data.main.humidity}%`;
  windSpeedEl.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
  visibilityEl.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
  pressureEl.textContent  = `${data.main.pressure} hPa`;

  sunriseEl.textContent = formatUnixTime(data.sys.sunrise, tz);
  sunsetEl.textContent  = formatUnixTime(data.sys.sunset, tz);

  tempMaxEl.textContent  = `${Math.round(data.main.temp_max)}°C`;
  tempMinEl.textContent  = `${Math.round(data.main.temp_min)}°C`;
  cloudinessEl.textContent = `${data.clouds.all}%`;

  showState("weather");
}

// -------------------------------------------------------------------
//  🌐 REAL API CALL — now calling OUR backend, not OpenWeatherMap!
//
//  Notice: the fetch URL changed, but EVERYTHING ELSE is identical.
//  This is the beauty of a proxy server — the frontend doesn't need
//  to know where the data ultimately comes from.
//
//  Before: fetch("https://api.openweathermap.org/data/2.5/weather?q=...")
//  After:  fetch("http://localhost:3000/api/weather?city=...")
//
//  Difference in query params:
//    Before: ?q=city&appid=KEY&units=metric   (OpenWeatherMap format)
//    After:  ?city=city                        (our own simple format!)
//  Our backend handles adding the API key and units internally.
// -------------------------------------------------------------------
async function getWeatherData(city) {
  showState("loading");

  // ✅ No API key in the URL! Clean and secure.
  const url = `${BASE_URL}?city=${encodeURIComponent(city)}`;
  console.log("📡 GET Request to OUR server:", url);

  try {
    const response = await fetch(url);
    console.log("📬 Response status:", response.status);

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || `Error ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Weather data received:", data);

    displayWeatherData(data);
    getForecastData(city);

  } catch (error) {
    console.error("❌ Error:", error.message);
    errorMessage.textContent = error.message;
    showState("error");
  }
}

// -------------------------------------------------------------------
//  📅 FETCH 5-DAY FORECAST — also now going through our backend
// -------------------------------------------------------------------
async function getForecastData(city) {
  const url = `${FORECAST_URL}?city=${encodeURIComponent(city)}`;
  console.log("📅 Forecast GET Request to OUR server:", url);

  try {
    const response = await fetch(url);
    if (!response.ok) return;

    const data = await response.json();
    displayForecast(data.list);

  } catch (error) {
    console.error("❌ Forecast error:", error.message);
  }
}

// -------------------------------------------------------------------
//  BUILD FORECAST CARDS from data.list
// -------------------------------------------------------------------
function displayForecast(list) {
  forecastRow.innerHTML = "";

  const dailyIndices = [0, 8, 16, 24, 32];

  dailyIndices.forEach((index) => {
    const item = list[index];
    if (!item) return;

    const date = new Date(item.dt * 1000);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <p class="forecast-day">${dayName}<br><small>${dayDate}</small></p>
      <img
        class="forecast-icon"
        src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png"
        alt="${item.weather[0].description}"
      />
      <p class="forecast-desc">${item.weather[0].description}</p>
      <div class="forecast-temps">
        <span class="forecast-high">${Math.round(item.main.temp_max)}°</span>
        <span class="forecast-low">${Math.round(item.main.temp_min)}°</span>
      </div>
    `;

    forecastRow.appendChild(card);
  });
}

// -------------------------------------------------------------------
//  EVENT LISTENERS
// -------------------------------------------------------------------
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) { cityInput.focus(); return; }
  getWeatherData(city);
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

document.querySelectorAll(".hint-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const city = chip.dataset.city;
    cityInput.value = city;
    getWeatherData(city);
  });
});

// -------------------------------------------------------------------
//  INITIAL STATE
// -------------------------------------------------------------------
showState("empty");
