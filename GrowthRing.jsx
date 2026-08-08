// Signature visual element: the Green Score rendered as concentric "growth rings"
// (like a tree cross-section) instead of a generic circular progress bar —
// ties the score directly to the "small actions, big impact" growth metaphor.
export default function GrowthRing({ score, level, size = 168 }) {
  const ringsCount = Math.min(5, Math.max(1, level));
  const center = size / 2;
  const maxR = size / 2 - 8;
  const progressInLevel = ((score % 250) / 250) * 100;

  const rings = Array.from({ length: ringsCount }, (_, i) => {
    const r = maxR - i * (maxR / 6);
    return r;
  });

  const circumference = 2 * Math.PI * maxR;
  const dashOffset = circumference - (progressInLevel / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {rings.map((r, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke="var(--color-moss-dark)"
            strokeOpacity={0.18 + i * 0.05}
            strokeWidth={1.5}
          />
        ))}
        <circle
          cx={center}
          cy={center}
          r={maxR}
          fill="none"
          stroke="var(--color-moss-dark)"
          strokeOpacity={0.15}
          strokeWidth={9}
        />
        <circle
          cx={center}
          cy={center}
          r={maxR}
          fill="none"
          stroke="var(--color-lichen)"
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-bold text-canopy leading-none">{score}</span>
        <span className="text-[11px] uppercase tracking-wider text-moss-dark mt-1">Green Score</span>
        <span className="mt-1 text-[11px] bg-moss text-white rounded-full px-2 py-0.5">Lvl {level}</span>
      </div>
    </div>
  );
}
