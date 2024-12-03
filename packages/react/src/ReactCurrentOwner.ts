import type { Fiber } from 'react-reconciler/src/ReactInternalTypes';

/**
 * 追踪当前的组件。
 *
 * The current owner is the component who should own any components that are
 * currently being constructed.
 */
const ReactCurrentOwner = {
  /**
   * @internal
   * @type {Fiber | null}
   */
  current: null as Fiber | null,
};

export default ReactCurrentOwner;
