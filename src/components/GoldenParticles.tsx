import { useMemo, type CSSProperties } from 'react';

type ThemeMode = 'light' | 'dark';

type Mote = {
  left: number;
  bottom: number;
  size: number;
  opacity: number;
  duration: number;
  drift: number;
  delay: number;
  hue: number;
};

type Firefly = {
  left: number;
  top: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
};

export default function GoldenParticles({ theme }: { theme: ThemeMode }) {
  const motes = useMemo<Mote[]>(() => {
    const count = theme === 'dark' ? 18 : 10;
    return Array.from({ length: count }, () => ({
      left: Math.random() * 100,
      bottom: -12 - Math.random() * 12,
      size: 2 + Math.random() * 4,
      opacity: theme === 'dark' ? 0.35 + Math.random() * 0.5 : 0.15 + Math.random() * 0.15,
      duration: 8 + Math.random() * 10,
      drift: (Math.random() - 0.5) * 40,
      delay: -Math.random() * 12,
      hue: 38 + Math.random() * 10,
    }));
  }, [theme]);

  const fireflies = useMemo<Firefly[]>(() => {
    const count = theme === 'dark' ? 8 : 4;
    return Array.from({ length: count }, () => ({
      left: 8 + Math.random() * 84,
      top: 8 + Math.random() * 72,
      size: 2 + Math.random() * 2,
      opacity: theme === 'dark' ? 0.35 + Math.random() * 0.5 : 0.18 + Math.random() * 0.2,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 5,
    }));
  }, [theme]);

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        {motes.map((mote, index) => (
          <span
            key={`mote-${index}`}
            className="golden-particle"
            style={{
              position: 'absolute',
              left: `${mote.left}%`,
              bottom: `${mote.bottom}px`,
              width: `${mote.size}px`,
              height: `${mote.size}px`,
              opacity: mote.opacity,
              borderRadius: '9999px',
              background: `radial-gradient(circle, rgba(255, 220, 140, 0.95), rgba(217, 164, 65, 0.55) 60%, transparent 100%)`,
              boxShadow: '0 0 8px 2px rgba(217,164,65,0.35)',
              animation: `particle-rise ${mote.duration}s linear infinite, particle-breathe ${3 + (index % 4)}s ease-in-out infinite alternate`,
              animationDelay: `${mote.delay}s`,
              filter: 'blur(0.2px)',
              '--drift': `${mote.drift}px`,
            } as CSSProperties}
          />
        ))}

        {fireflies.map((firefly, index) => (
          <span
            key={`firefly-${index}`}
            className="golden-firefly"
            style={{
              position: 'absolute',
              left: `${firefly.left}%`,
              top: `${firefly.top}%`,
              width: `${firefly.size}px`,
              height: `${firefly.size}px`,
              borderRadius: '9999px',
              opacity: firefly.opacity,
              background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(245, 212, 130, 0.9) 55%, rgba(217,164,65,0.35) 100%)',
              boxShadow: '0 0 10px rgba(255,224,150,0.8)',
              animation: `particle-twinkle ${firefly.duration}s ease-in-out infinite`,
              animationDelay: `${firefly.delay}s`,
            } as CSSProperties}
          />
        ))}
      </div>
    </>
  );
}
