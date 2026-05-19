// ============================================================
//  BLUSH WEATHER - server.js (Node.js + Express Backend)
//  STEP 5: A simple proxy server that:
//    1. Hides your API key from the browser
//    2. Handles CORS so any frontend can call it
//    3. Forwards requests to OpenWeatherMap
// ============================================================

// -------------------------------------------------------------------
//  IMPORTS — "require" is Node.js way of importing packages
//  (In modern JS you'd use "import", but require is the classic way)
//
//  express    → web framework to create a server and define routes
//  fetch      → same as browser fetch(), but for Node.js
//  cors       → middleware that adds CORS headers to every response
// -------------------------------------------------------------------
const express  = require("express");
const fetch    = require("node-fetch");
const cors     = require("cors");

// -------------------------------------------------------------------
//  CONFIGURATION — API key lives HERE on the server, not in the browser!
//  The browser never sees this file. This is the key security benefit.
// -------------------------------------------------------------------
const API_KEY      = "e98d1d0b5a8a846931c639619623630e";
const BASE_URL     = "https://api.openweathermap.org/data/2.5";
const PORT         = 3000; // the port our server will listen on

// -------------------------------------------------------------------
//  CREATE THE EXPRESS APP
//  Think of "app" as your server. You attach routes and middleware to it.
// -------------------------------------------------------------------
const app = express();

// -------------------------------------------------------------------
//  MIDDLEWARE: cors()
//
//  Middleware = a function that runs on EVERY request before your route handler.
//  cors() automatically adds this header to every response:
//    Access-Control-Allow-Origin: *
//  This tells browsers: "Yes, any webpage can call this server."
//
//  Without this line, your browser app would get a CORS error
//  when calling http://localhost:3000!
// -------------------------------------------------------------------
app.use(cors());

// -------------------------------------------------------------------
//  ROUTE 1: GET /api/weather?city=London
//
//  This is a GET endpoint. When the browser calls:
//    GET http://localhost:3000/api/weather?city=Indore
//
//  This function runs. It:
//    1. Reads the "city" from the query string (req.query.city)
//    2. Calls OpenWeatherMap from the SERVER (no CORS issue server-to-server!)
//    3. Sends the data back to the browser (res.json)
//
//  req = request  (what the browser sent TO us)
//  res = response (what we send BACK to the browser)
// -------------------------------------------------------------------
app.get("/api/weather", async (req, res) => {
  // 1. Read the city from query parameters
  //    Browser sends: GET /api/weather?city=Indore
  //    We read:       req.query.city  → "Indore"
  const city = req.query.city;

  if (!city) {
    // If no city was provided, send a 400 Bad Request error
    // POST note: 400 = "you sent a bad request" (client's fault)
    return res.status(400).json({ error: "City is required" });
  }

  try {
    // 2. Call OpenWeatherMap FROM the server
    //    This is a server-to-server request → no CORS rules apply!
    //    The API key is used here on the server — browser never sees it
    const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    console.log(`[SERVER] Fetching weather for: ${city}`);

    const apiResponse = await fetch(url);
    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      // Forward the same error status the API gave us
      return res.status(apiResponse.status).json({ error: data.message });
    }

    // 3. Send the data back to the browser
    //    res.json() converts the JS object to JSON and sends it
    //    It also sets Content-Type: application/json automatically
    console.log(`[SERVER] Sending weather data for: ${data.name}`);
    res.json(data);

  } catch (error) {
    // 500 = Internal Server Error (our fault, not the browser's)
    console.error("[SERVER] Error:", error.message);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// -------------------------------------------------------------------
//  ROUTE 2: GET /api/forecast?city=London
//
//  Same pattern as above — just a different OpenWeatherMap endpoint.
//  This shows how easy it is to add more routes to a backend!
// -------------------------------------------------------------------
app.get("/api/forecast", async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: "City is required" });
  }

  try {
    const url = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    console.log(`[SERVER] Fetching forecast for: ${city}`);

    const apiResponse = await fetch(url);
    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({ error: data.message });
    }

    console.log(`[SERVER] Sending forecast data (${data.cnt} items)`);
    res.json(data);

  } catch (error) {
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// -------------------------------------------------------------------
//  START THE SERVER
//  app.listen() starts the server on the given PORT.
//  The callback runs once the server is ready.
// -------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`
  🌸 Blush Weather Backend running!
  ➜ Local: http://localhost:${PORT}
  
  Available endpoints:
  GET http://localhost:${PORT}/api/weather?city=London
  GET http://localhost:${PORT}/api/forecast?city=London
  `);
});
