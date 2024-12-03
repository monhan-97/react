import { existsSync, readdirSync } from 'node:fs';

import Bundles from './bundles.js';
import { asyncCopyTo } from './utils.js';

const { NODE_DEV, NODE_PROD } = Bundles.bundleTypes;

export function getPackageName(name) {
  if (name.indexOf('/') !== -1) {
    return name.split('/')[0];
  }
  return name;
}

export function getBundleOutputPath(bundleType, filename, packageName) {
  switch (bundleType) {
    case NODE_DEV:
    case NODE_PROD:
      return `build/node_modules/${packageName}/cjs/${filename}`;
  }
}

async function prepareNpmPackage(name) {
  await Promise.all([
    asyncCopyTo('LICENSE', `build/node_modules/${name}/LICENSE`),
    asyncCopyTo(`packages/${name}/package.json`, `build/node_modules/${name}/package.json`),
    asyncCopyTo(`packages/${name}/README.md`, `build/node_modules/${name}/README.md`),
    asyncCopyTo(`packages/${name}/npm`, `build/node_modules/${name}`),
  ]);
}

export async function prepareNpmPackages() {
  if (!existsSync('build/node_modules')) {
    // We didn't build any npm packages.
    return;
  }
  const builtPackageFolders = readdirSync('build/node_modules').filter(
    dir => dir.charAt(0) !== '.',
  );
  await Promise.all(builtPackageFolders.map(prepareNpmPackage));
}
