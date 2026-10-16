import { useId } from 'react';

interface WoltersKluwerCorpusIconProps {
  className?: string;
}

const CIRCLE =
  'M7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14Z';

const LAYERS: Array<{ d: string; fill: string }> = [
  { d: 'M2.05908 2.05908H11.9415V11.9415H2.05908V2.05908Z', fill: '#85BC20' },
  { d: 'M0 5.35284H14V8.64715H0V5.35284Z', fill: '#A6D1EA' },
  { d: 'M5.35284 5.35284H14V8.64715H5.35284V5.35284Z', fill: '#409BD2' },
  { d: 'M5.35284 0H8.64715V14H5.35284V0Z', fill: '#A6D1EA' },
  { d: 'M5.35284 5.35284H8.64715V14H5.35284V5.35284Z', fill: '#409BD2' },
  { d: 'M5.35284 5.35284H11.9409V11.9409H5.35284V5.35284Z', fill: '#A4CD58' },
  { d: 'M2.05908 2.05908H8.64716V8.64716H2.05908V2.05908Z', fill: '#D4E8B1' },
  { d: 'M0 0H5.35285V5.35285H0V0Z', fill: '#409BD2' },
  { d: 'M5.35284 5.35284H8.64715V8.64715H5.35284V5.35284Z', fill: '#E5202E' },
  { d: 'M2.05908 2.05908H5.35339V5.35339H2.05908V2.05908Z', fill: '#A4CD58' },
  { d: 'M8.64716 8.64716H11.9415V11.9415H8.64716V8.64716Z', fill: '#85BC20' },
];

/** Internal Libra / Wolters Kluwer corpus mark (14×14 in product UI). */
export function WoltersKluwerCorpusIcon({ className = 'size-3.5 shrink-0' }: WoltersKluwerCorpusIconProps) {
  const uid = useId().replace(/:/g, '');
  const clipId = `wk-clip-${uid}`;
  const maskId = (n: number) => `wk-mask-${n}-${uid}`;

  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <g clipPath={`url(#${clipId})`}>
        <path d={CIRCLE} fill="#007AC3" />
        {LAYERS.map(({ d, fill }, index) => (
          <g key={index}>
            <mask
              id={maskId(index)}
              style={{ maskType: 'luminance' }}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="14"
              height="14"
            >
              <path d={CIRCLE} fill="white" />
            </mask>
            <g mask={`url(#${maskId(index)})`}>
              <path fillRule="evenodd" clipRule="evenodd" d={d} fill={fill} />
            </g>
          </g>
        ))}
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width="14" height="14" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
