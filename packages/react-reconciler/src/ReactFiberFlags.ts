export type Flags = number;

// Don't change these values. They're used by React Dev Tools.
export const NoFlags = /*                      */ 0b0000000000000000000000000000;

// These are not really side effects, but we still reuse this field.
export const Incomplete = /*                   */ 0b0000000000001000000000000000;
