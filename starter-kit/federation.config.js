// Native Federation config (micro-frontends). ONLY needed if you split the app into a
// shell (host) + independently deployed remotes. Most apps should stay a modular monolith —
// read the `angular-architecture-at-scale` skill before adopting micro-frontends.
//
// Version pairs with Angular: Native Federation 21.x ↔ Angular 21, 22.x ↔ Angular 22.
// Add to a project with:  ng add @angular-architects/native-federation --project <name>
// Source: https://native-federation.com  ·  github.com/angular-architects/module-federation-plugin

const {
  withNativeFederation,
  shareAll,
} = require('@angular-architects/native-federation/config');

// ============================================================
// REMOTE (a micro-frontend that EXPOSES components/routes)
// ============================================================
module.exports = withNativeFederation({
  name: 'mfe1',

  // What this remote exposes to the shell. Expose components/routes — never the root App.
  exposes: {
    './Routes': './projects/mfe1/src/app/app.routes.ts',
    './Component': './projects/mfe1/src/app/feature/feature.ts',
  },

  // Share singletons so Angular core / RxJS load once across all MFEs.
  // strictVersion:true fails fast on incompatible versions; requiredVersion:'auto'
  // reads the version from your package.json. Share secondary entry points too.
  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    }),
  },

  // Don't bundle things that are never used at runtime in the browser.
  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],
});

// ============================================================
// SHELL / HOST variant — the host has NO `exposes`; it consumes remotes.
// Use the same `shared`/`skip`. List remotes in a manifest, NOT here:
//   public/federation.manifest.json
//   { "mfe1": "http://localhost:4201/remoteEntry.json" }
//
// module.exports = withNativeFederation({
//   shared: { ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }) },
//   skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],
// });
//
// --- Shell bootstrap (src/main.ts) ---
// import { initFederation } from '@angular-architects/native-federation';
// initFederation('/federation.manifest.json')
//   .catch((err) => console.error(err))
//   .then(() => import('./bootstrap'))
//   .catch((err) => console.error(err));
//
// --- Lazy-load a remote in the shell's routes ---
// import { loadRemoteModule } from '@angular-architects/native-federation';
// {
//   path: 'flights',
//   loadChildren: () => loadRemoteModule('mfe1', './Routes').then((m) => m.ROUTES),
// }
