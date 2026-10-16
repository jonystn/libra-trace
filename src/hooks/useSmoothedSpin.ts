import { useLayoutEffect, useRef } from 'react';
import { useAnimationFrame, useMotionValue, type MotionValue } from 'framer-motion';
import {
  readSpinAttackMs,
  readSpinPeriodMs,
  readSpinReleaseMs,
  SPIN_ATTACK_MS,
  SPIN_PERIOD_MS,
  SPIN_RELEASE_MS,
  type SpinCycle,
} from '../motion/spinCycle';

/**
 * Continuous rotation whose angular velocity eases between discrete cycle tokens.
 * Speeding up attacks quickly; slowing down releases slowly so a heavy file
 * reads as winding into thought, not a jump.
 */
export function useSmoothedSpin(
  cycle: SpinCycle,
  reduceMotion?: boolean,
  paused?: boolean,
): MotionValue<number> {
  const rotate = useMotionValue(0);
  const periodRef = useRef<number>(SPIN_PERIOD_MS[cycle]);
  const attackRef = useRef(SPIN_ATTACK_MS);
  const releaseRef = useRef(SPIN_RELEASE_MS);
  const velocityDegPerMs = useRef(360 / SPIN_PERIOD_MS[cycle]);

  useLayoutEffect(() => {
    periodRef.current = readSpinPeriodMs(cycle);
    attackRef.current = readSpinAttackMs();
    releaseRef.current = readSpinReleaseMs();
  }, [cycle]);

  useAnimationFrame((_, delta) => {
    if (reduceMotion || paused || delta <= 0) return;
    const target = 360 / periodRef.current;
    const speedingUp = target > velocityDegPerMs.current;
    const tau = Math.max(1, speedingUp ? attackRef.current : releaseRef.current);
    const blend = 1 - Math.exp(-delta / tau);
    velocityDegPerMs.current += (target - velocityDegPerMs.current) * blend;
    rotate.set((rotate.get() + velocityDegPerMs.current * delta) % 360);
  });

  return rotate;
}
