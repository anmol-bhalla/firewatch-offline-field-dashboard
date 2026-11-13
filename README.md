# FireWatch

FireWatch is a field operations dashboard foundation for wildfire observation workflows. This phase provides a responsive React dashboard shell with static preview data; observation management, persistence, maps, and offline behavior are not implemented yet.

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
```

## Project structure

```text
src/
  app/                         # App composition
  features/dashboard/           # Dashboard page, reusable sections, and preview data
    components/
    data/
  styles/                       # Global styles and Tailwind entry point
```

The Mapbox map area is an illustrative placeholder. Summary values and observation rows are static preview data in `src/features/dashboard/data/mockObservations.ts` and dashboard components; controls without an implemented action are disabled or presented as static content.
