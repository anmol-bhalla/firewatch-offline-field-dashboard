# FireWatch

FireWatch is a field operations dashboard foundation for wildfire observation workflows. Observation CRUD, filtering, and dashboard metrics are managed in Redux Toolkit. State is held in memory and resets to the preview observations on reload; persistence, maps, and offline behavior are not implemented yet.

## Run locally

Requires Node.js 20 or newer and npm.

```sh
npm install
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

The observation list and summary cards read from Redux. The initial rows live in `src/features/observations/data/mockObservations.ts`. The Mapbox area remains an illustrative placeholder; observations are not persisted and reset to the preview data after reload.
