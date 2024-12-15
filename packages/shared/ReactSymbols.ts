import { renameElementSymbol } from 'shared/ReactFeatureFlag';

export const REACT_LEGACY_ELEMENT_TYPE = Symbol.for('react.element');

// The Symbol used to tag the ReactElement-like types.
export const REACT_ELEMENT_TYPE = renameElementSymbol
  ? Symbol.for('react.transitional.element')
  : REACT_LEGACY_ELEMENT_TYPE;
