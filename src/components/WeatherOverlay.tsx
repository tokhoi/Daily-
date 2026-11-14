import React, { useMemo } from 'react';

export type WeatherMode = 'sakura' | 'rain' | 'sparkle' | 'off';

interface WeatherOverlayProps {
  mode: WeatherMode;
}

export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ mode }) => {
  const petals = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: `${(i * 7.3 + (i % 3) * 4) % 96}%`,
        size: 10 + (i % 4) * 3,
        dur: `${7.5 + (i % 5) * 1.6}s`,
        delay: `-${(i * 1.3) % 8}s`,
        sway: `${(i % 2 === 0 ? 1 : -1) * (18 + (i % 4) * 8)}px`,
      })),
    []
  );

  const raindrops = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: `${(i * 4.3 + (i % 3) * 2) % 100}%`,
        height: `${14 + (i % 4) * 6}px`,
        dur: `${0.9 + (i % 5) * 0.22}s`,
        delay: `-${(i * 0.37) % 2}s`,
      })),
    []
  );

  const sparkles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: `${8 + ((i * 8.1) % 84)}%`,
        top: `${10 + ((i * 13.7) % 75)}%`,
        size: 5 + (i % 3) * 3,
        dur: `${3 + (i % 4) * 0.8}s`,
        delay: `-${(i * 0.7) % 3}s`,
      })),
    []
  );

  if (mode === 'off') return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
      aria-hidden="true"
    >
      {mode === 'sakura' &&
        petals.map((p) => (
          <svg
            key={p.id}
            viewBox="0 0 24 24"
            width={p.size}
            height={p.size}
            className="weather-petal"
            style={
              {
                left: p.left,
                '--dur': p.dur,
                '--delay': p.delay,
                '--sway': p.sway,
              } as React.CSSProperties
            }
          >
            <path
              d="M12 2C9.5 6 7 9.5 7 13.5C7 17 9.2 20 12 21C14.8 20 17 17 17 13.5C17 9.5 14.5 6 12 2Z"
              fill={p.id % 3 === 0 ? '#F9A8D4' : '#FBCFE8'}
              opacity="0.85"
            />
          </svg>
        ))}

      {mode === 'rain' &&
        raindrops.map((r) => (
          <div
            key={r.id}
            className="weather-raindrop"
            style={
              {
                left: r.left,
                height: r.height,
                '--dur': r.dur,
                '--delay': r.delay,
              } as React.CSSProperties
            }
          />
        ))}

      {mode === 'sparkle' &&
        sparkles.map((s) => (
          <div
            key={s.id}
            className="weather-sparkle"
            style={
              {
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                backgroundColor: s.id % 2 === 0 ? '#F9A8D4' : '#93C5FD',
                '--dur': s.dur,
                '--delay': s.delay,
              } as React.CSSProperties
            }
          />
        ))}
    </div>
  );
};
