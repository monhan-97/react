import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// For any external that is used in a DEV-only condition, explicitly
// specify whether it has side effects during import or not. This lets
// us know whether we can safely omit them when they are unused.
const HAS_NO_SIDE_EFFECTS_ON_IMPORT = false;
// const HAS_SIDE_EFFECTS_ON_IMPORT = true;
const importSideEffects = Object.freeze({
  react: HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  'react/jsx-dev-runtime': HAS_NO_SIDE_EFFECTS_ON_IMPORT,
});

// Bundles exporting globals that other modules rely on.
const knownGlobals = Object.freeze({
  react: 'React',
});

// Determines node_modules packages that are safe to assume will exist.
export function getDependencies(bundleType, entry) {
  // Replaces any part of the entry that follow the package name (like
  // "/server" in "react-dom/server") by the path to the package settings
  const packageJson = require(entry.replace(/(\/.*)?$/, '/package.json'));
  // Both deps and peerDeps are assumed as accessible.
  return Array.from(
    new Set([
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.peerDependencies || {}),
    ]),
  );
}

export function getPeerGlobals(externals) {
  const peerGlobals = {};
  if (Array.isArray(externals)) {
    externals.forEach(name => {
      peerGlobals[name] = knownGlobals[name];
    });
  }

  return peerGlobals;
}

export function getImportSideEffects() {
  return importSideEffects;
}
