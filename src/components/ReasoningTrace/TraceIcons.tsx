import type { MotionValue } from 'framer-motion';
import { motion } from 'framer-motion';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { useSmoothedSpin } from '../../hooks/useSmoothedSpin';
import type { SpinCycle } from '../../motion/spinCycle';
import AlertCircleIcon from '@hugeicons/core-free-icons/AlertCircleIcon';
import ArrowUpRight01Icon from '@hugeicons/core-free-icons/ArrowUpRight01Icon';
import CheckmarkCircle02Icon from '@hugeicons/core-free-icons/CheckmarkCircle02Icon';
import ChevronDownIcon from '@hugeicons/core-free-icons/ChevronDownIcon';
import Clock01Icon from '@hugeicons/core-free-icons/Clock01Icon';
import File02Icon from '@hugeicons/core-free-icons/File02Icon';
import Loading03Icon from '@hugeicons/core-free-icons/Loading03Icon';
import SquareLock01Icon from '@hugeicons/core-free-icons/SquareLock01Icon';
import ZapIcon from '@hugeicons/core-free-icons/ZapIcon';

interface IconProps {
  className?: string;
}

function TraceIcon({
  icon,
  className,
  size = 20,
}: {
  icon: IconSvgElement;
  className?: string;
  size?: number;
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={1.5}
      color="currentColor"
      className={`shrink-0 ${className ?? ''}`}
      aria-hidden
    />
  );
}

export function CheckCircleIcon({ className = 'size-5' }: IconProps) {
  return <TraceIcon icon={CheckmarkCircle02Icon} className={className} size={20} />;
}

export function ChevronIcon({ className = 'size-4' }: IconProps) {
  return <TraceIcon icon={ChevronDownIcon} className={className} size={16} />;
}

export { WoltersKluwerCorpusIcon } from './WoltersKluwerCorpusIcon';

interface ThinkingSpinnerIconProps extends IconProps {
  /** Discrete cycle token currently driving the spin (`spin.deep` | `spin.moderate` | `spin.intense`). */
  cycle?: SpinCycle;
  /** Shared rotation so remounting a step row does not reset angle or velocity. */
  rotate?: MotionValue<number>;
  reduceMotion?: boolean;
}

export function ThinkingSpinnerIcon({
  className = 'size-4',
  cycle = 'moderate',
  rotate,
  reduceMotion,
}: ThinkingSpinnerIconProps) {
  const localRotate = useSmoothedSpin(cycle, reduceMotion, Boolean(rotate));
  const appliedRotate = rotate ?? localRotate;

  return (
    <motion.span
      className={`inline-flex origin-center ${className ?? ''}`}
      style={{ rotate: reduceMotion ? 0 : appliedRotate }}
      data-spin={cycle}
      aria-hidden
    >
      <TraceIcon icon={Loading03Icon} className="size-full" size={16} />
    </motion.span>
  );
}

export function SourceFileIcon({ className = 'size-3.5' }: IconProps) {
  return <TraceIcon icon={File02Icon} className={className} size={14} />;
}

export function SourceAlertIcon({ className = 'size-3.5' }: IconProps) {
  return <TraceIcon icon={AlertCircleIcon} className={className} size={14} />;
}

export function SourceLockIcon({ className = 'size-3.5' }: IconProps) {
  return <TraceIcon icon={SquareLock01Icon} className={className} size={14} />;
}

export function OpenSourceIcon({ className = 'size-3.5' }: IconProps) {
  return <TraceIcon icon={ArrowUpRight01Icon} className={className} size={14} />;
}

export function QuickScenarioIcon({ className = 'size-3.5' }: IconProps) {
  return <TraceIcon icon={ZapIcon} className={className} size={14} />;
}

export function DenseScenarioIcon({ className = 'size-3.5' }: IconProps) {
  return <TraceIcon icon={Clock01Icon} className={className} size={14} />;
}

export function BlockedScenarioIcon({ className = 'size-3.5' }: IconProps) {
  return <TraceIcon icon={SquareLock01Icon} className={className} size={14} />;
}
