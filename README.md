# FireWatch

FireWatch is a field operations dashboard foundation for wildfire observation workflows. Observation CRUD, filtering, and dashboard metrics are managed in Redux Toolkit. State is held in memory and resets to the preview observations on reload; persistence, maps, and offline behavior are not implemented yet.

## Run locally

Requires Node.js 20 or newer and npm.

```sh
npm install
cp .env.example .env
# Set VITE_MAPBOX_ACCESS_TOKEN in .env to a public Mapbox token
npm run dev
```

Vite prints the local development URL in the terminal. To check the production bundle and lint the source:

```sh
npm run build
npm run lint
npm test
```

## Project structure

```text
src/
  app/                         # App composition
  features/
    dashboard/                  # Dashboard page and reusable sections
    observations/               # Observation model, Redux slice, selectors, and form
      components/
      data/                     # Typed initial preview observations
  styles/                       # Global styles and Tailwind entry point
```

The observation list and summary cards read from Redux. The initial rows live in `src/features/observations/data/mockObservations.ts`. The map uses Mapbox GL JS and public hosted styles/tiles; it requires a network connection and does not work offline. Without a token, the map panel explains how to configure one and observations can still be entered with manual coordinates. Observation changes remain in memory and reset to the preview rows after reload.
