/** Single source for Libra motion. CSS vars are applied from here — do not duplicate numbers. */
export const motion = {
  duration: {
    /** Reduced motion / skip. */
    instant: 0.001,
    /** Chevron, micro UI. */
    micro: 0.15,
    popover: 0.16,
    /** Accordion open/close. */
    toggle: 0.2,
    toggleCalm: 0.28,
    /** Card / state enter. */
    enter: 0.25,
    enterCalm: 0.4,
    /** Handoff active → done. */
    settle: 0.45,
  },
  ease: {
    /** easeOutExpo — enter, popover, insight steps. */
    enter: [0.16, 1, 0.3, 1],
    /** Material standard / Tailwind ease-in-out — accordion, chevron. */
    standard: [0.4, 0, 0.2, 1],
    /** Libra finish ease-out. */
    settle: [0.32, 0.72, 0, 1],
  },
  /** Seconds per revolution (deep/moderate/intense) or smoothing window (attack/release). */
  spin: {
    deep: 2.8,
    moderate: 1.4,
    intense: 0.55,
    attack: 0.18,
    release: 0.72,
  },
} as const;

export type MotionEase = (typeof motion.ease)[keyof typeof motion.ease];

export function cssCubic(ease: MotionEase): string {
  return `cubic-bezier(${ease.join(', ')})`;
}

export function motionCssVars(): Record<string, string> {
  return {
    '--motion-duration-instant': `${motion.duration.instant}s`,
    '--motion-duration-micro': `${motion.duration.micro}s`,
    '--motion-duration-popover': `${motion.duration.popover}s`,
    '--motion-duration-toggle': `${motion.duration.toggle}s`,
    '--motion-duration-toggle-calm': `${motion.duration.toggleCalm}s`,
    '--motion-duration-enter': `${motion.duration.enter}s`,
    '--motion-duration-enter-calm': `${motion.duration.enterCalm}s`,
    '--motion-duration-settle': `${motion.duration.settle}s`,
    '--motion-ease-enter': cssCubic(motion.ease.enter),
    '--motion-ease-standard': cssCubic(motion.ease.standard),
    '--motion-ease-settle': cssCubic(motion.ease.settle),
    '--spin-deep': `${motion.spin.deep}s`,
    '--spin-moderate': `${motion.spin.moderate}s`,
    '--spin-intense': `${motion.spin.intense}s`,
    '--spin-attack': `${motion.spin.attack}s`,
    '--spin-release': `${motion.spin.release}s`,
  };
}

/** Stamp CSS custom properties on `:root` before first paint. */
export function applyMotionCssVars(root: HTMLElement = document.documentElement) {
  const vars = motionCssVars();
  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value);
  }
}
