'use client';

import { useState, useEffect, useRef } from 'react';
import { BookOpen, FileText, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { calculateProgress, getSettings, Progress } from '../lib/storageHelper';
import AttendanceLogger from './AttendanceLogger';

const colors = {
  primary: '#222831',
  secondary: '#393E46',
  accent: '#948979',
  light: '#DFD0B8',
};

// Animated counter hook
function useCountUp(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// Particle burst component
function ParticleBurst({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
      {[...Array(12)].map((_, i) => (
        <span
          key={i}
          className="particle"
          style={{
            '--angle': `${i * 30}deg`,
            '--delay': `${i * 0.04}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

export default function DashboardOverview() {
  const [progress, setProgress] = useState<Progress>({
    day: 0, total: 0, percentage: 0, isActive: false, remaining: 0,
  });
  const [stats, setStats] = useState({ logbookCount: 0, documentCount: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [progressVisible, setProgressVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const animatedDay = useCountUp(progressVisible ? progress.day : 0);
  const animatedRemaining = useCountUp(progressVisible ? progress.remaining : 0);
  const animatedTotal = useCountUp(progressVisible ? progress.total : 0);
  const animatedLogbook = useCountUp(cardsVisible ? stats.logbookCount : 0);
  const animatedDocs = useCountUp(cardsVisible ? stats.documentCount : 0);

  useEffect(() => {
    setIsMounted(true);
    setProgress(calculateProgress());
    if (typeof window !== 'undefined') {
      const logbook = JSON.parse(localStorage.getItem('mypkl_logbook') || '[]');
      const documents = JSON.parse(localStorage.getItem('mypkl_documents') || '[]');
      setStats({ logbookCount: logbook.length, documentCount: documents.length });
    }
    const t1 = setTimeout(() => setProgressVisible(true), 300);
    const t2 = setTimeout(() => setCardsVisible(true), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!isMounted) return <DashboardSkeleton />;

  const settings = getSettings();
  const hasSettings = settings && settings.startDate && settings.endDate;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .dashboard-root {
          font-family: 'DM Sans', sans-serif;
        }
        .display-font {
          font-family: 'Playfair Display', serif;
        }

        /* Grain overlay */
        .grain::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          border-radius: inherit;
          pointer-events: none;
          mix-blend-mode: overlay;
          opacity: 0.35;
        }

        /* Slide-in animations */
        .slide-up {
          animation: slideUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .slide-up-d1 { animation-delay: 0.05s; }
        .slide-up-d2 { animation-delay: 0.15s; }
        .slide-up-d3 { animation-delay: 0.25s; }
        .slide-up-d4 { animation-delay: 0.35s; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Progress bar fill */
        .bar-fill {
          transition: width 1.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Pulsing active badge */
        .badge-pulse {
          animation: badgePulse 2.4s ease-in-out infinite;
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(148,137,121,0.5); }
          50%       { box-shadow: 0 0 0 8px rgba(148,137,121,0); }
        }

        /* Stat card hover */
        .stat-card {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.25s ease;
          cursor: default;
        }
        .stat-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 12px 40px rgba(0,0,0,0.35);
        }

        /* Icon spin on hover */
        .icon-wrap {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .stat-card:hover .icon-wrap {
          transform: rotate(12deg) scale(1.15);
        }

        /* Shimmer on progress bar */
        .bar-shimmer {
          position: relative;
          overflow: hidden;
        }
        .bar-shimmer::after {
          content: '';
          position: absolute;
          top: 0; left: -60%;
          width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          animation: shimmerMove 2.2s ease-in-out infinite 1.4s;
        }
        @keyframes shimmerMove {
          0%   { left: -60%; }
          100% { left: 110%; }
        }

        /* Ring glow on percentage number */
        .pct-ring {
          animation: ringGlow 3s ease-in-out infinite;
        }
        @keyframes ringGlow {
          0%, 100% { text-shadow: 0 0 0px rgba(148,137,121,0); }
          50%       { text-shadow: 0 0 16px rgba(148,137,121,0.6); }
        }

        /* Decorative corner accent */
        .corner-accent {
          position: absolute;
          top: -1px; right: -1px;
          width: 64px; height: 64px;
          border-top: 2px solid rgba(148,137,121,0.4);
          border-right: 2px solid rgba(148,137,121,0.4);
          border-radius: 0 12px 0 0;
          pointer-events: none;
        }

        /* Divider line */
        .soft-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(148,137,121,0.25), transparent);
          margin: 20px 0;
        }

        /* Floating sparkle */
        .float-spark {
          animation: floatSpark 4s ease-in-out infinite;
        }
        @keyframes floatSpark {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
          50%       { transform: translateY(-6px) rotate(15deg); opacity: 1; }
        }

        /* Scale-in for stat numbers */
        .scale-in {
          animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes scaleIn {
          from { transform: scale(0.6); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        /* Glow pill */
        .glow-pill {
          position: relative;
        }
        .glow-pill::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 9999px;
          background: linear-gradient(135deg, rgba(148,137,121,0.4), rgba(223,208,184,0.2));
          z-index: -1;
          filter: blur(4px);
        }
      `}</style>

      <div className="dashboard-root space-y-6 relative">

        {/* Header */}
        <div className="slide-up slide-up-d1 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="float-spark" style={{ color: colors.accent }} />
              <span className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: colors.accent }}>
                My PKL
              </span>
            </div>
            <h1
              className="display-font text-4xl font-bold leading-tight"
              style={{ color: colors.light }}
            >
              Dashboard
            </h1>
            <p className="text-sm mt-1 font-light" style={{ color: colors.accent }}>
              Ringkasan progress PKL-mu hari ini
            </p>
          </div>
          <div
            className="text-right text-xs font-light"
            style={{ color: colors.accent }}
          >
            <div>{new Date().toLocaleDateString('id-ID', { weekday: 'long' })}</div>
            <div className="font-medium text-sm" style={{ color: colors.light }}>
              {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <div
          className="slide-up slide-up-d2 relative rounded-2xl p-6 grain overflow-hidden"
          style={{
            backgroundColor: colors.secondary,
            border: `1px solid rgba(148,137,121,0.2)`,
            boxShadow: '0 4px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(223,208,184,0.06)',
          }}
        >
          <div className="corner-accent" />

          {/* Subtle background radial */}
          <div
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse at 80% 20%, rgba(148,137,121,0.08) 0%, transparent 60%)',
              borderRadius: 'inherit',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <h2
                className="display-font text-xl font-semibold"
                style={{ color: colors.light }}
              >
                Progress PKL
              </h2>
              {progress.isActive && (
                <span
                  className="badge-pulse glow-pill px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase"
                  style={{
                    backgroundColor: 'rgba(148,137,121,0.18)',
                    color: colors.light,
                    border: '1px solid rgba(148,137,121,0.35)',
                  }}
                >
                  ● Aktif
                </span>
              )}
            </div>

            {!hasSettings ? (
              <div className="text-center py-10">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                  style={{ backgroundColor: colors.primary, border: '1px solid rgba(148,137,121,0.2)' }}
                >
                  <Calendar size={28} style={{ color: colors.accent }} />
                </div>
                <p className="text-sm mb-4 font-light" style={{ color: colors.accent }}>
                  Belum ada pengaturan tanggal PKL
                </p>
                
                <a
                  href="/settings"
                  className="inline-block px-5 py-2.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent}, #7a6e62)`,
                    color: colors.primary,
                    boxShadow: '0 4px 16px rgba(148,137,121,0.3)',
                  }}
                >
                  Atur Tanggal PKL
                </a>
              </div>
            ) : (
              <>
                {/* Progress Label */}
                <div className="flex justify-between items-center text-sm mb-3">
                  <span style={{ color: colors.light }}>
                    Hari ke-<strong>{progress.day}</strong> dari {progress.total}
                  </span>
                  <span
                    className="pct-ring text-2xl font-bold display-font"
                    style={{ color: colors.accent }}
                  >
                    {progress.percentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div
                  className="w-full rounded-full h-3 overflow-hidden"
                  style={{ backgroundColor: colors.primary, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}
                >
                  <div
                    ref={barRef}
                    className="bar-fill bar-shimmer h-full rounded-full"
                    style={{
                      width: progressVisible ? `${progress.percentage}%` : '0%',
                      background: `linear-gradient(90deg, #6b6055, ${colors.accent}, ${colors.light})`,
                      boxShadow: `0 0 12px rgba(148,137,121,0.5)`,
                    }}
                  />
                </div>

                <div className="soft-divider" />

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Hari ke-', value: animatedDay },
                    { label: 'Sisa hari', value: animatedRemaining },
                    { label: 'Total hari', value: animatedTotal },
                  ].map((item, i) => (
                    <div
                      key={item.label}
                      className="text-center py-3 px-2 rounded-xl"
                      style={{
                        backgroundColor: 'rgba(34,40,49,0.6)',
                        border: '1px solid rgba(148,137,121,0.12)',
                        animationDelay: `${i * 0.1 + 0.5}s`,
                      }}
                    >
                      <p
                        className="display-font text-3xl font-bold leading-none scale-in"
                        style={{ color: colors.light }}
                      >
                        {item.value}
                      </p>
                      <p className="text-xs mt-1.5 font-light tracking-wide" style={{ color: colors.accent }}>
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

{/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={BookOpen}
            label="Total Logbook"
            value={animatedLogbook}
            delay="0.05s"
            visible={cardsVisible}
          />
          <StatCard
            icon={FileText}
            label="Total Dokumen"
            value={animatedDocs}
            delay="0.15s"
            visible={cardsVisible}
          />
          <StatCard
            icon={TrendingUp}
            label="Mood Rata-rata"
            value="—"
            delay="0.25s"
            visible={cardsVisible}
          />
        </div>

        {/* Attendance Logger */}
        <div className="slide-up slide-up-d4">
          <AttendanceLogger />
        </div>
      </div>
    </>
  );
}

function StatCard({
  icon: Icon, label, value, delay, visible,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  delay: string;
  visible: boolean;
}) {
  return (
    <div
      className="stat-card relative rounded-2xl p-5 grain overflow-hidden slide-up"
      style={{
        backgroundColor: colors.secondary,
        border: '1px solid rgba(148,137,121,0.15)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(223,208,184,0.04)',
        animationDelay: delay,
        opacity: visible ? undefined : 0,
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(148,137,121,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
          borderRadius: 'inherit',
        }}
      />

      <div className="relative z-10 flex items-center gap-4">
        <div
          className="icon-wrap flex-shrink-0 p-3 rounded-xl"
          style={{
            background: `linear-gradient(145deg, ${colors.primary}, rgba(34,40,49,0.8))`,
            border: '1px solid rgba(148,137,121,0.2)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          }}
        >
          <Icon size={22} style={{ color: colors.accent }} />
        </div>
        <div>
          <p
            className="display-font text-3xl font-bold leading-none"
            style={{ color: colors.light }}
          >
            {value}
          </p>
          <p className="text-xs mt-1 font-light tracking-wide" style={{ color: colors.accent }}>
            {label}
          </p>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: '20%', right: '20%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(148,137,121,0.3), transparent)',
        }}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .skel { animation: skeletonPulse 1.6s ease-in-out infinite; }
      `}</style>
      <div className="skel h-10 w-40 rounded-xl" style={{ backgroundColor: colors.accent }} />
      <div className="rounded-2xl p-6" style={{ backgroundColor: colors.secondary }}>
        <div className="skel h-5 w-28 rounded-lg mb-5" style={{ backgroundColor: colors.primary }} />
        <div className="skel h-3 rounded-full mb-3" style={{ backgroundColor: colors.primary }} />
        <div className="skel h-3 w-2/3 rounded-full" style={{ backgroundColor: colors.primary }} />
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skel h-16 rounded-xl" style={{ backgroundColor: colors.primary }} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skel h-20 rounded-2xl" style={{ backgroundColor: colors.secondary }} />
        ))}
      </div>
    </div>
  );
}