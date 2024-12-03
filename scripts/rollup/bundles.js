const bundleTypes = {
  NODE_DEV: 'NODE_DEV',
  NODE_PROD: 'NODE_PROD',
};

const { NODE_DEV, NODE_PROD } = bundleTypes;

const bundles = [
  /******* Isomorphic *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    entry: 'react',
    global: 'React',
  },

  /******* React JSX Runtime *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    entry: 'react/jsx-runtime',
    global: 'JSXRuntime',
    externals: ['react'],
  },

  /******* React JSX DEV Runtime *******/
  {
    bundleTypes: [NODE_DEV, NODE_PROD],
    entry: 'react/jsx-dev-runtime',
    global: 'JSXDEVRuntime',
    externals: ['react'],
  },
];

export function getFilename(bundle, bundleType) {
  let name = bundle.entry;
  // we do this to replace / to -, for react-dom/server
  name = name.replace('/index.', '.').replace('/', '-');
  switch (bundleType) {
    case NODE_DEV:
      return `${name}.development.js`;
    case NODE_PROD:
      return `${name}.production.js`;
  }
}

export default {
  bundles,
  bundleTypes,
};
