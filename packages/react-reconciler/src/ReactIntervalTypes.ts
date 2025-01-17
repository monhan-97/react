import type { ReactContext, RefObject } from 'shared/ReactTypes';

import type { Flags } from './ReactFiberFlags';
import type { Lanes } from './ReactFiberLane';
import type { TypeOfMode } from './ReactTypeOfMode';
import type { WorkTag } from './ReactWorkTags';

export type ContextDependency<C> = {
  context: ReactContext<C>;
  next: ContextDependency<unknown> | ContextDependencyWithSelect<unknown> | null;
  memoizedValue: C;
};

export type ContextDependencyWithSelect<C> = {
  context: ReactContext<C>;
  next: ContextDependency<unknown> | ContextDependencyWithSelect<unknown> | null;
  memoizedValue: C;
  select: () => unknown[];
  lastSelectedValue?: unknown[];
};

export type Dependencies = {
  lanes: Lanes;
  firstContext: ContextDependency<unknown> | ContextDependencyWithSelect<unknown> | null;
};

// A Fiber is work on a Component that needs to be done or was done. There can
// be more than one per component.
export type Fiber = {
  // These first fields are conceptually members of an Instance. This used to
  // be split into a separate type and intersected with the other Fiber fields,
  // but until Flow fixes its intersection bugs, we've merged them into a
  // single type.

  // An Instance is shared between all versions of a component. We can easily
  // break this out into a separate object to avoid copying so much to the
  // alternate versions of the tree. We put this on a single object for now to
  // minimize the number of objects created during the initial render.

  // Tag identifying the type of fiber.
  tag: WorkTag;

  // Unique identifier of this child.
  key: null | string;

  // The value of element.type which is used to preserve the identity during
  // reconciliation of this child.
  elementType: any;

  // The resolved function/class/ associated with this fiber.
  type: any;

  // The local state associated with this fiber.
  stateNode: any;

  // Conceptual aliases
  // parent : Instance -> return The parent happens to be the same as the
  // return fiber since we've merged the fiber and instance.

  // Remaining fields belong to Fiber

  // The Fiber to return to after finishing processing this one.
  // This is effectively the parent, but there can be multiple parents (two)
  // so this is only the parent of the thing we're currently processing.
  // It is conceptually the same as the return address of a stack frame.
  return: Fiber | null;

  // Singly Linked List Tree Structure.
  child: Fiber | null;
  sibling: Fiber | null;
  index: number;

  // The ref last used to attach this node.
  // I'll avoid adding an owner field for prod and model that as functions.
  ref: null | ((() => void) & { _stringRef?: string }) | RefObject;

  refCleanup: null | (() => void);

  // Input is the data coming into process this fiber. Arguments. Props.
  pendingProps: any; // This type will be more specific once we overload the tag.
  memoizedProps: any; // The props used to create the output.

  // A queue of state updates and callbacks.
  updateQueue: unknown;

  // The state used to create the output
  memoizedState: any;

  // Dependencies (contexts, events) for this fiber, if it has any
  dependencies: Dependencies | null;

  // Bitfield that describes properties about the fiber and its subtree. E.g.
  // the ConcurrentMode flag indicates whether the subtree should be async-by-
  // default. When a fiber is created, it inherits the mode of its
  // parent. Additional flags can be set at creation time, but after that the
  // value should remain unchanged throughout the fiber's lifetime, particularly
  // before its child fibers are created.
  mode: TypeOfMode;

  // Effect
  flags: Flags;
  subtreeFlags: Flags;
  deletions: Array<Fiber> | null;

  lanes: Lanes;
  childLanes: Lanes;

  // This is a pooled version of a Fiber. Every fiber that gets updated will
  // eventually have a pair. There are cases when we can clean up pairs to save
  // memory if we need to.
  alternate: Fiber | null;
};
