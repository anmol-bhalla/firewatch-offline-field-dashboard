# FireWatch

FireWatch is an offline-first field operations dashboard for wildfire observations. Redux Toolkit coordinates the UI state and asynchronous actions; a Dexie repository persists observation changes in IndexedDB before Redux is updated. Preview observations are seeded only the first time the database is created.

## Run locally

Requires Node.js 20 or newer and npm.

```sh
npm install
cp .env.example .env
# Set VITE_MAPBOX_ACCESS_TOKEN in .env to a public Mapbox token
npm run dev
```

To verify the production build and its PWA shell, build and serve it over localhost:

```sh
npm run build
npm run preview
```

The service worker and installable app manifest are generated for production builds. Load the preview once while online, then try disconnecting the browser to verify that the application shell launches from cache. Browser developer tools can also clear the service worker and site data when retesting first install.

Useful checks:

```sh
npm run build
npm run lint
npm test
```

## Project structure

```text
src/
  app/                         # Store setup, typed hooks, app composition, browser status
  features/
    dashboard/                  # Dashboard page and reusable dashboard components
    observations/               # Model, Redux reducers/thunks/selectors, forms, preview fixtures
  services/
    db/                         # Dexie schema and observation repository
  styles/                       # Global styles and Tailwind entry point
public/icons/                   # FireWatch app icon
```

## Offline and synchronization behavior

Observations and their `Pending`/`Simulated` status persist locally in IndexedDB. The “Run demo sync” action only changes pending local records to `Simulated` (shown as “Demo complete”); it does not contact a server or upload data. The online/offline indicator reflects the browser's connection hint.

The PWA service worker precaches the built application shell and static assets. It does not cache Mapbox tiles or observation records. Mapbox requires an internet connection and may be blank/unavailable offline; observation management remains available from the cached application shell and IndexedDB. The app uses no backend. Local hard deletion currently removes an observation directly; a future server sync will need a deletion outbox/tombstone design.

If the Mapbox token is missing, the map panel explains how to configure it and observations can still be managed using coordinates.
