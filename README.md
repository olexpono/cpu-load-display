# Nuxt3 CPU Load display

To productionize:

- Figure out typing for DataSet to use real types with visjs, or switch to another visualization library, to fix the usages of any types
- useCpuMonitor() would currently create additional backend requests, it should have a singleton place keeping the CPU data so multiple charts/components could listen to the same data
- Change the visjs import to use the next js distribution rather than the standalone to avoid
 including its version of moment
- Centralize & test date & time utilities, using something other than moment


## Setup

Make sure to install the dependencies:

```bash
# npm
npm install
```

## Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

## Tests

```bash
npm run test
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Checkout the [deployment documentation](https://v3.nuxtjs.org/guide/deploy/presets) for more information.
