"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Honour the visitor's reduced-motion setting everywhere: transform/layout
 * animations jump straight to their end state while opacity fades remain.
 * Using this instead of branching on useReducedMotion() keeps server and
 * client markup identical (no hydration mismatch).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
