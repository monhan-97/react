import type { RefObject } from 'packages/shared/ReactTypes';

import { NoFlags } from './ReactFiberFlags';
import { NoLanes } from './ReactFiberLane';
import type { Dependencies, Fiber } from './ReactIntervalTypes';
import type { TypeOfMode } from './ReactTypeOfMode';
import type { WorkTag } from './ReactWorkTags';

export class FiberNode implements Fiber {
  tag: WorkTag;
  key: string | null;
  elementType: any;
  type: any;
  stateNode: any;
  return: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  index: number;
  ref: ((() => void) & { _stringRef?: string | undefined }) | RefObject | null;
  refCleanup: (() => void) | null;
  pendingProps: any;
  memoizedProps: any;
  updateQueue: unknown;
  memoizedState: any;
  dependencies: Dependencies | null;
  mode: number;
  flags: number;
  subtreeFlags: number;
  deletions: Fiber[] | null;
  lanes: number;
  childLanes: number;
  alternate: Fiber | null;

  constructor(tag: WorkTag, pendingProps: unknown, key: null | string, mode: TypeOfMode) {
    // Instance
    this.tag = tag;
    this.key = key;
    this.elementType = null;
    this.type = null;
    this.stateNode = null;

    // Fiber
    this.return = null;
    this.child = null;
    this.sibling = null;
    this.index = 0;

    this.ref = null;
    this.refCleanup = null;

    this.pendingProps = pendingProps;
    this.memoizedProps = null;
    this.updateQueue = null;
    this.memoizedState = null;
    this.dependencies = null;

    this.mode = mode;

    // Effects
    this.flags = NoFlags;
    this.subtreeFlags = NoFlags;
    this.deletions = null;

    this.lanes = NoLanes;
    this.childLanes = NoLanes;

    this.alternate = null;
  }
}
