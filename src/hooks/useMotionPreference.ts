import { useReducedMotion } from 'framer-motion';

/**
 * Demo toolbar override OR system `prefers-reduced-motion` (via Framer Motion).
 */
export function useMotionPreference(forceReducedMotion: boolean): boolean {
  const systemPrefersReducedMotion = useReducedMotion();
  return forceReducedMotion || systemPrefersReducedMotion === true;
}
