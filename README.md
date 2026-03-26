# Travel Nest

Travel Nest is an AI context-aware travel companion for business and leisure travelers. This first scaffold sets up the workspace package structure, a polished dark-mode React entry experience, and the backend route architecture for schedule extraction, POI discovery, and itinerary optimization.

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
- `@google/genai` for Gemini integration
- `axios` for Overpass and routing requests

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
- `/business-setup` -> future `BusinessSetupPage`
- `/leisure-setup` -> future `LeisureSetupPage`
- `/itinerary` -> future `ItineraryDashboardPage`

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
            `-- PlaceholderPage
```

## Backend API Shape

`POST /api/extract-schedule`
- Accepts a PDF file in the `schedulePdf` field
- Intended flow: parse text, send context to Gemini, extract meetings and preferences, compute free time slots

`GET /api/fetch-pois`
- Accepts `lat`, `lng`, and optional `freeMinutes`
- Intended flow: call Overpass API, normalize nearby POIs, and return the candidate pool

`POST /api/optimize-itinerary`
- Accepts location, free time, traveler mode, and interests
- Intended flow: apply cultural priority filtering, route feasibility checks, clustering, and Gemini JSON synthesis

## Current Status

- Landing page and mode selection page are implemented in React
- Tailwind-ready styling is configured for the client
- Backend routes and services are scaffolded with placeholder responses for the next implementation phase
