// ============================================================
//  BLUSH WEATHER - app.js
//  STEP 2 + 4: Real API + 5-Day Forecast integration
// ============================================================

// -------------------------------------------------------------------
//  🔑 API CONFIGURATION
//
//  BASE_URL  → The address of OpenWeatherMap's server
//  API_KEY   → Your personal key so the server knows who you are
//  UNITS     → "metric" gives us Celsius. "imperial" = Fahrenheit.
//
//  ⚠️  IMPORTANT FOR LATER: Never commit a real API key to GitHub
//     in a production app. For now this is fine for learning!
// -------------------------------------------------------------------
const API_KEY       = "e98d1d0b5a8a846931c639619623630e";
const BASE_URL      = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL  = "https://api.openweathermap.org/data/2.5/forecast"; // ← NEW endpoint
const UNITS         = "metric";
//
//  Notice: BASE_URL and FORECAST_URL are almost identical!
//  Only the last word differs: "weather" vs "forecast"
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
const forecastRow  = document.getElementById("forecastRow");  // ← NEW

// -------------------------------------------------------------------
//  STATE MANAGEMENT - controls what's visible on screen
// -------------------------------------------------------------------
function showState(state) {
  // Hide all states first
  weatherDisplay.classList.add("hidden");
  loadingState.classList.add("hidden");
  errorState.classList.add("hidden");
  emptyState.classList.add("hidden");

  // Show the requested state
  if (state === "weather")  weatherDisplay.classList.remove("hidden");
  if (state === "loading")  loadingState.classList.remove("hidden");
  if (state === "error")    errorState.classList.remove("hidden");
  if (state === "empty")    emptyState.classList.remove("hidden");
}

// -------------------------------------------------------------------
//  HELPER: Format Unix Timestamp → "HH:MM AM/PM"
//  (Unix time = seconds since Jan 1, 1970)
// -------------------------------------------------------------------
function formatUnixTime(unixSeconds, timezoneOffset) {
  // Convert to milliseconds, add timezone offset
  const localMs = (unixSeconds + timezoneOffset) * 1000;
  const date = new Date(localMs);
  // Use UTC methods because we manually applied the offset
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
//  This function takes a data object and fills in the HTML elements.
//  When we connect the real API, we will pass the REAL response here.
// -------------------------------------------------------------------
function displayWeatherData(data) {
  const tz = data.timezone; // timezone offset from UTC in seconds

  cityNameEl.textContent    = data.name;
  countryNameEl.textContent = data.sys.country;
  localDateEl.textContent   = getCurrentDateString();

  // Weather icon from OpenWeatherMap CDN
  // Icon URL format: https://openweathermap.org/img/wn/{icon}@2x.png
  weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  weatherIconEl.alt = data.weather[0].description;
  weatherDescEl.textContent = data.weather[0].description;

  temperatureEl.textContent = Math.round(data.main.temp);
  feelsLikeEl.textContent   = Math.round(data.main.feels_like);

  humidityEl.textContent  = `${data.main.humidity}%`;
  windSpeedEl.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`; // m/s → km/h
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
//  🌐 REAL API CALL — GET request using fetch()
//
//  HOW A GET REQUEST WORKS:
//  1. We build a URL with query parameters (?q=city&appid=key&units=metric)
//  2. fetch() sends an HTTP GET request to that URL
//  3. The server responds with a JSON object (just like our mock data!)
//  4. We check the HTTP status: 200 = OK, 404 = city not found, 401 = bad key
//  5. We parse the JSON and pass it to displayWeatherData()
//
//  async/await: JavaScript is "asynchronous" — fetch() takes time (network trip).
//  Using `async` + `await` lets us WAIT for the response before moving on,
//  instead of the code running past it immediately.
// -------------------------------------------------------------------
async function getWeatherData(city) {
  // 1. Show the loading spinner
  showState("loading");

  // 2. Build the full URL with query parameters
  //    This is what a GET request looks like — data travels IN the URL
  //    ?q=London       ← the city name
  //    &appid=...      ← your API key
  //    &units=metric   ← temperature in Celsius
  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${UNITS}`;

  // 3. Open your browser's DevTools (F12) → Network tab
  //    You'll see this exact URL being requested when you search!
  console.log("📡 GET Request sent to:", url);

  try {
    // 4. fetch() sends the GET request — we AWAIT the response
    const response = await fetch(url);

    // 5. Check the HTTP status code
    //    Every response has a status number:
    //      200 = OK (success!)
    //      401 = Unauthorized (bad or inactive API key)
    //      404 = Not Found (city doesn't exist)
    //      429 = Too Many Requests (rate limit hit)
    console.log("📬 Response status:", response.status, response.statusText);

    if (!response.ok) {
      // response.ok is false for any status outside 200-299
      if (response.status === 401) {
        throw new Error("Invalid API key. Check your key or wait 10 min for activation.");
      } else if (response.status === 404) {
        throw new Error(`City "${city}" not found. Try a different name.`);
      } else {
        throw new Error(`Something went wrong (Status: ${response.status})`);
      }
    }

    // 6. Parse the JSON body — this turns the raw text into a JS object
    //    Open DevTools → Network → click the request → "Response" tab
    //    to see the full JSON the server sent back!
    const data = await response.json();
    console.log("✅ Weather data received:", data);

    // 7. Pass the real data to our display function
    //    Notice: the real API data has the SAME structure as our mock!
    displayWeatherData(data);

    // 8. Also fetch the 5-day forecast for this city (Step 4!)
    //    We call it here so both fetches happen after a successful weather load
    getForecastData(city);

  } catch (error) {
    // catch() runs if fetch() fails (no internet) OR if we threw an error above
    console.error("❌ Error:", error.message);
    errorMessage.textContent = error.message;
    showState("error");
  }
}

// -------------------------------------------------------------------
//  📅 FETCH 5-DAY FORECAST — a second GET request, different endpoint
//
//  KEY LEARNING: This uses the SAME pattern as getWeatherData:
//    fetch() → check status → .json() → use the data
//
//  But now we use data.list (an array of 40 objects, every 3 hours)
//  We pick 1 item per day using index: 0, 8, 16, 24, 32
//  Because 8 forecasts × 3 hours = 24 hours = 1 day
// -------------------------------------------------------------------
async function getForecastData(city) {
  // Build the URL — same as before, just FORECAST_URL instead of BASE_URL
  const url = `${FORECAST_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${UNITS}`;
  console.log("📅 Forecast GET Request:", url);

  try {
    const response = await fetch(url);
    if (!response.ok) return; // silently skip if forecast fails

    const data = await response.json();
    console.log("📅 Forecast data received:", data);
    // data.list = array of 40 forecast objects
    // data.city = object with city name, country, timezone, sunrise, sunset

    displayForecast(data.list);

  } catch (error) {
    console.error("❌ Forecast error:", error.message);
    // Don’t show error UI — forecast is a bonus feature
  }
}

// -------------------------------------------------------------------
//  BUILD FORECAST CARDS from data.list
//
//  data.list has 40 items (every 3 hours for 5 days)
//  We pick index 0, 8, 16, 24, 32 → one reading per day (noon-ish)
//  For each, we create a <div class="forecast-card"> and inject it into the DOM
// -------------------------------------------------------------------
function displayForecast(list) {
  // Clear any old forecast cards first
  forecastRow.innerHTML = "";

  // Pick 1 item per day: indices 0, 8, 16, 24, 32
  //  list[0]  = today
  //  list[8]  = tomorrow (8 × 3hrs = 24hrs later)
  //  list[16] = day after tomorrow
  //  etc.
  const dailyIndices = [0, 8, 16, 24, 32];

  dailyIndices.forEach((index) => {
    const item = list[index]; // grab the forecast object at this index
    if (!item) return;        // safety check: skip if index doesn’t exist

    // item.dt = Unix timestamp (seconds) for this forecast time
    // item.main.temp_max / temp_min = temperature range
    // item.weather[0].icon / description = condition (same as current weather!)

    // Format the date: "Mon", "Tue", etc.
    const date = new Date(item.dt * 1000); // × 1000 converts seconds → milliseconds
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    // Build the HTML for one forecast card using a template literal
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

    // Append the card to the forecast row in the DOM
    forecastRow.appendChild(card);
  });
}

// -------------------------------------------------------------------
//  EVENT LISTENERS
// -------------------------------------------------------------------

// Search button click
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    cityInput.focus();
    return;
  }
  getWeatherData(city);
});

// Press Enter in the input
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

// Quick-search hint chips
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
