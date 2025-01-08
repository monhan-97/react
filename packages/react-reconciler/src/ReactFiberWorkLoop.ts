import { beginWork } from './ReactFiberBeginWork';
import { type Lanes, NoLanes } from './ReactFiberLane';
import type { Fiber } from './ReactIntervalTypes';

/**
 * 根节点退出状态
 */
type RootExitStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * 表示渲染过程仍在进行中，根节点的渲染尚未完成。
 */
const RootInProgress: RootExitStatus = 0;
/**
 * 渲染过程中发生了致命错误，导致渲染无法完成。
 */
const RootFatalErrored: RootExitStatus = 1;
/**
 * 表示根节点的渲染过程中出现了错误，渲染没有成功完成。
 */
const RootErrored: RootExitStatus = 2;

/**
 * 表示渲染过程因为某些异步操作（如数据加载）而挂起，等待外部条件完成后继续。
 */
const RootSuspended: RootExitStatus = 3;
/**
 * 渲染过程挂起，并且存在延迟。也就是说，渲染等待外部条件的完成，但这可能会有时间延迟。
 */
const RootSuspendedWithDelay: RootExitStatus = 4;
/**
 * 表示根节点的渲染已成功完成，所有的更新都已经处理完毕。
 */
const RootCompleted: RootExitStatus = 5;
/**
 * 根节点的渲染未能完成，可能是由于各种原因。
 */
const RootDidNotComplete: RootExitStatus = 6;

// 当前进行中的Fiber
let workInProgress: Fiber | null = null;

// Whether to root completed, errored, suspended, etc.
let workInProgressRootExitStatus: RootExitStatus = RootInProgress;

// Most things in the work loop should deal with workInProgressRootRenderLanes.
// Most things in begin/complete phases should deal with entangledRenderLanes.
export let entangledRenderLanes: Lanes = NoLanes;

// The work loop is an extremely hot path. Tell Closure not to inline it.
/** @noinline */
function workLoopSync() {
  // Perform work without checking if we need to yield between fiber.
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork: Fiber): void {
  // The current, flushed, state of this fiber is the alternate. Ideally
  // nothing should rely on this, but relying on it here means that we don't
  // need an additional field on the work in progress.
  const current = unitOfWork.alternate;
  let next = beginWork(current, unitOfWork, entangledRenderLanes);
  unitOfWork.memoizedProps = unitOfWork.pendingProps;

  if (next === null) {
    // If this doesn't spawn new work, complete the current work.
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }
}

function completeUnitOfWork(unitOfWork: Fiber) {
  // Attempt to complete the current unit of work, then move to the next
  // sibling. If there are no more siblings, return to the parent fiber.
  let completedWork: Fiber = unitOfWork;
  do {
    // The current, flushed, state of this fiber is the alternate. Ideally
    // nothing should rely on this, but relying on it here means that we don't
    // need an additional field on the work in progress.
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;

    let next = completeWork(current, completedWork, entangledRenderLanes);

    if (next !== null) {
      // Completing this fiber spawned new work. Work on that next.
      workInProgress = next;
      return;
    }

    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      // If there is more work to do in this returnFiber, do that next.
      workInProgress = siblingFiber;
      return;
    }
    // Otherwise, return to the parent
    // $FlowFixMe[incompatible-type] we bail out when we get a null
    completedWork = returnFiber;

    // Update the next thing we're working on in case something throws.
    workInProgress = completedWork;
  } while (completedWork !== null);

  // We've reached the root.
  if (workInProgressRootExitStatus === RootInProgress) {
    workInProgressRootExitStatus = RootCompleted;
  }
}
