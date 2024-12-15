'use strict';

import { createRequire } from 'node:module';

import { rimrafSync } from 'rimraf';
import { rollup } from 'rollup';
import typescript from 'rollup-plugin-typescript2';

import { getBundleOutputPath, getPackageName, prepareNpmPackages } from './packaging.js';
import { getDependencies, getImportSideEffects, getPeerGlobals } from './modules.js';
import Bundles, { getFilename } from './bundles.js';

const { NODE_DEV, NODE_PROD } = Bundles.bundleTypes;
const require = createRequire(import.meta.url);

function getFormat(bundleType) {
  switch (bundleType) {
    case NODE_DEV:
    case NODE_PROD:
      return `cjs`;
  }
}
function getPlugins() {
  return [typescript()];
}

const getRollupInteropValue = () => {
  return 'esModule';
};

function shouldSkipBundle(bundle, bundleType) {
  const shouldSkipBundleType = bundle.bundleTypes.indexOf(bundleType) === -1;
  if (shouldSkipBundleType) {
    return true;
  }
  return false;
}

function resolveEntryFork(resolvedEntry) {
  return resolvedEntry;
}

function isProductionBundleType(bundleType) {
  switch (bundleType) {
    case NODE_DEV:
      return false;
    case NODE_PROD:
      return true;
    default:
      throw new Error(`Unknown type: ${bundleType}`);
  }
}

async function createBundle(bundle, bundleType) {
  const filename = getFilename(bundle, bundleType);

  const format = getFormat(bundleType);

  const packageName = getPackageName(bundle.entry);

  let resolvedEntry = resolveEntryFork(require.resolve(bundle.entry));

  const peerGlobals = getPeerGlobals(bundle.externals, bundleType);
  let externals = Object.keys(peerGlobals);

  const deps = getDependencies(bundleType, bundle.entry);
  externals = externals.concat(deps);

  const importSideEffects = getImportSideEffects();
  const pureExternalModules = Object.keys(importSideEffects).filter(
    module => !importSideEffects[module],
  );

  /**
   * @type {import("rollup").RollupOptions}
   */
  const rollupConfig = {
    input: resolvedEntry,
    treeshake: {
      treeshake: {
        moduleSideEffects: (id, external) => !(external && pureExternalModules.includes(id)),
        propertyReadSideEffects: false,
      },
    },
    external(id) {
      const containsThisModule = pkg => id === pkg || id.startsWith(pkg + '/');
      const isProvidedByDependency = externals.some(containsThisModule);
      if (isProvidedByDependency) {
        if (id.indexOf('/src/') !== -1) {
          throw Error(
            'You are trying to import ' +
              id +
              ' but ' +
              externals.find(containsThisModule) +
              ' is one of npm dependencies, ' +
              'so it will not contain that source file. You probably want ' +
              'to create a new bundle entry point for it instead.',
          );
        }
        return true;
      }
      return !!peerGlobals[id];
    },
    plugins: getPlugins(),
    onwarn: handleRollupWarning,
    output: {
      externalLiveBindings: false,
      freeze: false,
      interop: getRollupInteropValue,
      esModule: false,
    },
  };

  const mainOutputPath = getBundleOutputPath(bundleType, filename, packageName);

  const rollupOutputOptions = getRollupOutputOptions(
    mainOutputPath,
    format,
    peerGlobals,
    bundle.global,
    bundleType,
  );

  try {
    const result = await rollup(rollupConfig);
    await result.write(rollupOutputOptions);
  } catch (error) {
    handleRollupError(error);
  }
}

function getRollupOutputOptions(outputPath, format, globals, globalName, bundleType) {
  const isProduction = isProductionBundleType(bundleType);
  /**
   * @return  {import("rollup").RollupOutput}
   */
  return {
    file: outputPath,
    format,
    globals,
    freeze: !isProduction,
    interop: getRollupInteropValue,
    name: globalName,
    sourcemap: false,
    esModule: false,
    exports: 'auto',
  };
}

async function buildEverything() {
  rimrafSync('build');

  let bundles = [];
  for (const bundle of Bundles.bundles) {
    bundles.push([bundle, NODE_DEV], [bundle, NODE_PROD]);
  }

  bundles = bundles.filter(([bundle, bundleType]) => {
    return !shouldSkipBundle(bundle, bundleType);
  });

  for (const [bundle, bundleType] of bundles) {
    await createBundle(bundle, bundleType);
  }

  await prepareNpmPackages();
}

function handleRollupWarning(warning) {
  if (warning.code === 'UNUSED_EXTERNAL_IMPORT') {
    const match = warning.message.match(/external module '([^']+)'/);
    if (!match || typeof match[1] !== 'string') {
      throw new Error('Could not parse a Rollup warning. ' + 'Fix this method.');
    }
    const importSideEffects = getImportSideEffects();
    const externalModule = match[1];
    if (typeof importSideEffects[externalModule] !== 'boolean') {
      throw new Error(
        'An external module "' +
          externalModule +
          '" is used in a DEV-only code path ' +
          'but we do not know if it is safe to omit an unused require() to it in production. ' +
          'Please add it to the `importSideEffects` list in `scripts/rollup/modules.js`.',
      );
    }
    // Don't warn. We will remove side effectless require() in a later pass.
    return;
  }

  if (warning.code === 'CIRCULAR_DEPENDENCY') {
    // Ignored
  } else if (typeof warning.code === 'string') {
    // This is a warning coming from Rollup itself.
    // These tend to be important (e.g. clashes in namespaced exports)
    // so we'll fail the build on any of them.
    console.error();
    console.error(warning.message || warning);
    console.error();
    process.exit(1);
  } else {
    // The warning is from one of the plugins.
    // Maybe it's not important, so just print it.
    console.warn(warning.message || warning);
  }
}

function handleRollupError(error) {
  if (!error.code) {
    console.error(error);
    return;
  }
  console.error(`\x1b[31m-- ${error.code}${error.plugin ? ` (${error.plugin})` : ''} --`);
  console.error(error.stack);
  if (error.codeFrame) {
    // This looks like an error from a plugin (e.g. Babel).
    // In this case we'll resort to displaying the provided code frame
    // because we can't be sure the reported location is accurate.
    console.error(error.codeFrame);
  }
}

buildEverything();
