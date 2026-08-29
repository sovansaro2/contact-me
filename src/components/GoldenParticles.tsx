import { useMemo } from 'react';

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
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      <style>{`
        @keyframes rise {
          0% {
            transform: translate3d(0, 0, 0) scale(0.8);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          100% {
            transform: translate3d(var(--drift), -105vh, 0) scale(1.15);
            opacity: 0;
          }
        }

        @keyframes breathe {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.6);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0.6);
          }
          50% {
            opacity: 0.9;
            transform: scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .golden-particle,
          .golden-firefly {
            animation: none !important;
          }
        }
      `}</style>

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
              animation: prefersReducedMotion
                ? undefined
                : `rise ${mote.duration}s linear infinite, breathe ${3 + (index % 4)}s ease-in-out infinite alternate`,
              animationDelay: `${mote.delay}s`,
              filter: 'blur(0.2px)',
              ['--drift' as any]: `${mote.drift}px`,
            }}
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
              animation: prefersReducedMotion
                ? undefined
                : `twinkle ${firefly.duration}s ease-in-out infinite`,
              animationDelay: `${firefly.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}
