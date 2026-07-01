import type { RiskLevel } from '../engine/types';

const COLORS: Record<RiskLevel, string> = {
  safe: '#15803d',
  suspicious: '#b45309',
  dangerous: '#b91c1c',
};

interface Props { score: number; level: RiskLevel; }

export function ScoreRing({ score, level }: Props) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, score)) / 100);
  const color = COLORS[level];

  return (
    <svg className="ring" viewBox="0 0 92 92" role="img" aria-label={`Riesgo ${score} de 100`}>
      <circle cx="46" cy="46" r={radius} fill="none" className="ring__track" strokeWidth="7" />
      <circle cx="46" cy="46" r={radius} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 46 46)"
        style={{ transition: 'stroke-dashoffset .5s ease' }} />
      <text x="46" y="44" textAnchor="middle" className="ring__score" fill={color}>{score}</text>
      <text x="46" y="59" textAnchor="middle" className="ring__unit">/ 100</text>
    </svg>
  );
}
