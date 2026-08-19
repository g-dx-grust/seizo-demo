import { ReactNode } from 'react';
import type { Tone } from '../data/mock';

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface rounded-[14px] border border-line shadow-[0_2px_8px_rgba(15,23,42,0.05)] p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, right, className = '' }: { children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <h3 className="text-[14px] font-bold text-t1">{children}</h3>
      {right}
    </div>
  );
}

const pillTones: Record<Tone, string> = {
  blue: 'text-blue bg-blue-l',
  green: 'text-green bg-green-l',
  amber: 'text-amber bg-amber-l',
  red: 'text-red bg-red-l',
  purple: 'text-purple bg-purple-l',
  gray: 'text-t2 bg-track',
};

export function Pill({ tone = 'gray', children, className = '' }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[11px] font-medium leading-none whitespace-nowrap ${pillTones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

const subTones: Record<string, string> = {
  green: 'text-green',
  red: 'text-red',
  amber: 'text-amber',
  blue: 'text-blue',
  gray: 'text-t3',
};

export function KpiCard({
  label,
  value,
  sub,
  subTone = 'gray',
  valueClass = 'text-t1',
  right,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  subTone?: string;
  valueClass?: string;
  right?: ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-medium text-t3">{label}</div>
        {right}
      </div>
      <div className={`mt-1.5 text-[21px] font-black leading-tight ${valueClass}`}>{value}</div>
      {sub && <div className={`mt-1 text-[11px] font-medium ${subTones[subTone] ?? 'text-t3'}`}>{sub}</div>}
    </Card>
  );
}

export function Bar({ value, color = 'bg-blue', className = 'h-1.5' }: { value: number; color?: string; className?: string }) {
  return (
    <div className={`w-full rounded-full bg-track overflow-hidden ${className}`}>
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Donut({
  data,
  size = 168,
  thickness = 24,
  center,
}: {
  data: { value: number; color: string }[];
  size?: number;
  thickness?: number;
  center?: ReactNode;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-track)" strokeWidth={thickness} />
        {data.map((d, i) => {
          const len = (d.value / total) * C;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{center}</div>
    </div>
  );
}

export function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`relative w-10 h-[22px] rounded-full transition-colors duration-150 ${on ? 'bg-blue' : 'bg-plan'}`}
    >
      <span
        className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition-all duration-150 ${on ? 'left-[21px]' : 'left-[3px]'}`}
      />
    </button>
  );
}
