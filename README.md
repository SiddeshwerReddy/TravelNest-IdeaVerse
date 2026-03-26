# Travel Nest

Travel Nest is an AI context-aware travel companion for business and leisure travelers. The app now includes the routed frontend experience, business and leisure setup flows, an itinerary dashboard with a live Leaflet map, and a backend pipeline for schedule extraction, POI discovery, routing checks, and itinerary synthesis.

## Package Setup

Root `package.json`
- Uses npm workspaces for `client` and `server`
- Adds `concurrently` so both apps can run together with `npm run dev`

Client `package.json`
- React 19 + Vite 8
- Tailwind CSS with `@tailwindcss/vite`
- React Router for app navigation
- `lucide-react` for UI icons
- `leaflet` and `react-leaflet` for the future itinerary map
- `axios` for API calls

Server `package.json`
- Express 5 API server
- MongoDB with Mongoose
- `multer` for PDF uploads
- `pdf-parse` for schedule text extraction
- `axios` for Gemini REST calls, Overpass, OSRM, and Nominatim

## Free API Stack

- Gemini API free tier for schedule understanding and itinerary refinement
- Overpass API for nearby POIs
- OSRM public API for route feasibility
- Nominatim for free geocoding
- Browser Geolocation API for leisure mode

Google Maps, Google Places, and Google Distance Matrix are not required for this build.

## Environment Setup

Use [server/.env.example](server/.env.example) as the source of truth. I also created a local `server/.env` with safe placeholders so you can paste real values there.

Required
- `MONGO_URI`
- `GEMINI_API_KEY`

No key required
- `OVERPASS_API_URL`
- `OSRM_API_URL`
- `NOMINATIM_USER_AGENT`

## Recommended Folder Structure

```text
travel-nest/
+-- package.json
+-- client/
|   +-- package.json
|   +-- public/
|   `-- src/
|       +-- App.jsx
|       +-- index.css
|       +-- components/
|       |   +-- map/
|       |   +-- timeline/
|       |   `-- ui/
|       +-- hooks/
|       +-- lib/
|       |   +-- api.js
|       |   `-- constants.js
|       +-- pages/
|       |   +-- LandingPage.jsx
|       |   +-- ModeSelectionPage.jsx
|       |   +-- BusinessSetupPage.jsx
|       |   +-- LeisureSetupPage.jsx
|       |   `-- ItineraryDashboardPage.jsx
|       `-- store/
|           `-- itineraryStore.js
`-- server/
    +-- package.json
    +-- server.js
    +-- config/
    |   `-- db.js
    +-- controllers/
    |   +-- scheduleController.js
    |   +-- poiController.js
    |   `-- itineraryController.js
    +-- middlewares/
    |   `-- uploadMiddleware.js
    +-- models/
    |   `-- Trip.js
    +-- routes/
    |   +-- scheduleRoutes.js
    |   +-- poiRoutes.js
    |   `-- itineraryRoutes.js
    +-- services/
    |   +-- geminiService.js
    |   +-- overpassService.js
    |   +-- routingService.js
    |   `-- itineraryService.js
    `-- utils/
        +-- scoring.js
        `-- timeSlots.js
```

## Frontend Routing and Component Tree

Routes
- `/` -> `LandingPage`
- `/mode` -> `ModeSelectionPage`
- `/business-setup` -> `BusinessSetupPage`
- `/leisure-setup` -> `LeisureSetupPage`
- `/itinerary` -> `ItineraryDashboardPage`

Component tree
```text
App
`-- BrowserRouter
    `-- AppShell
        +-- Header / Navigation
        `-- Routes
            +-- LandingPage
            |   +-- Hero copy
            |   +-- CTA actions
            |   +-- Benefit cards
            |   `-- AI itinerary preview card
            +-- ModeSelectionPage
            |   +-- Intro section
            |   +-- Business traveler card
            |   +-- Leisure traveler card
            |   `-- Capabilities summary
            +-- BusinessSetupPage
            +-- LeisureSetupPage
            `-- ItineraryDashboardPage
```

## Backend API Shape

`POST /api/extract-schedule`
- Accepts a PDF file in the `schedulePdf` field
- Parses PDF text, asks Gemini for structured meeting extraction, geocodes the best location anchor, and computes free time slots

`GET /api/fetch-pois`
- Accepts `lat`, `lng`, and optional `freeMinutes`
- Calls Overpass and returns a normalized nearby POI pool

`POST /api/optimize-itinerary`
- Accepts location, free time, traveler mode, and interests
- Applies cultural weighting, route feasibility checks with OSRM, clustering, deterministic scheduling, and Gemini itinerary refinement

## Current Status

- Landing, mode selection, business setup, leisure setup, and itinerary dashboard are implemented
- The itinerary dashboard renders a timeline plus a live OpenStreetMap/Leaflet map
- The backend endpoints are implemented with free-API integrations and fallbacks
