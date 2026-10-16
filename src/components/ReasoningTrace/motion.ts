import type { TargetAndTransition, Transition } from 'framer-motion';
import { motion as tokens } from '../../motion/tokens';

export function traceTransition(options?: { reduceMotion?: boolean; calm?: boolean }): Transition {
  if (options?.reduceMotion) {
    return { duration: tokens.duration.instant };
  }
  return {
    duration: options?.calm ? tokens.duration.enterCalm : tokens.duration.enter,
    ease: tokens.ease.enter,
  };
}

export function accordionTransition(
  reduceMotion?: boolean,
  calm?: boolean,
  settle?: boolean,
): Transition {
  if (reduceMotion) return { duration: tokens.duration.instant };
  if (settle) {
    return { duration: tokens.duration.settle, ease: tokens.ease.settle };
  }
  return {
    duration: calm ? tokens.duration.toggleCalm : tokens.duration.toggle,
    ease: tokens.ease.standard,
  };
}

export function microTransition(reduceMotion?: boolean): Transition {
  return {
    duration: reduceMotion ? tokens.duration.instant : tokens.duration.micro,
    ease: tokens.ease.standard,
  };
}

export function popoverTransition(reduceMotion?: boolean): Transition {
  return {
    duration: reduceMotion ? tokens.duration.instant : tokens.duration.popover,
    ease: tokens.ease.enter,
  };
}

/** Avoid opacity:0 stuck when reduced motion is active. */
export function skipInitial(
  reduceMotion?: boolean,
  initial?: TargetAndTransition,
): false | TargetAndTransition {
  return reduceMotion ? false : (initial ?? { opacity: 0 });
}

export function verticalEnter(reduceMotion?: boolean, offset = -4): number {
  return reduceMotion ? 0 : offset;
}

export function scaleEnter(reduceMotion?: boolean, scale = 0.98): number {
  return reduceMotion ? 1 : scale;
}
