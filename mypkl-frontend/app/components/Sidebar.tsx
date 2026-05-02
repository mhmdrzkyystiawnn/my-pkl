'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Folder,
  BarChart3,
  Settings,
  CheckCircle2,
  AlertCircle,
  Images,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const colors = {
  primary: '#222831',
  secondary: '#393E46',
  accent: '#948979',
  light: '#DFD0B8',
};

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  desc: string;
  needsBadge?: boolean;
}

const getNavItems = (hasTodayEntry: boolean): NavItem[] => [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, desc: 'Ringkasan PKL' },
  { href: '/logbook', label: 'Logbook', icon: BookOpen, desc: 'Catatan harian', needsBadge: !hasTodayEntry },
  { href: '/documents', label: 'Documents', icon: Folder, desc: 'Arsip berkas' },
  { href: '/memories', label: 'Memories', icon: Images, desc: 'Foto kenangan' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, desc: 'Grafik & data' },
  { href: '/settings', label: 'Settings', icon: Settings, desc: 'Konfigurasi' },
];

type ToastState = { message: string; type: 'success' | 'error' } | null;

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [toast, setToast] = useState<ToastState>(null);
  const [hasToday, setHasToday] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .sidebar-root {
          font-family: 'DM Sans', sans-serif;
        }
        .display-font { font-family: 'Playfair Display', serif; }

        /* Subtle vertical noise stripe */
        .sidebar-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.4;
        }

        /* Nav item */
        .nav-item {
          position: relative;
          transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .nav-item:hover {
          transform: translateX(4px);
        }
        .nav-item .nav-indicator {
          position: absolute;
          left: 0; top: 50%;
          transform: translateY(-50%) scaleY(0);
          width: 3px; height: 60%;
          border-radius: 0 3px 3px 0;
          background: linear-gradient(180deg, #DFD0B8, #948979);
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .nav-item.active .nav-indicator,
        .nav-item:hover .nav-indicator {
          transform: translateY(-50%) scaleY(1);
        }

        /* Icon wrap */
        .nav-icon-wrap {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          border-radius: 10px;
          padding: 8px;
        }
        .nav-item:hover .nav-icon-wrap,
        .nav-item.active .nav-icon-wrap {
          transform: scale(1.1) rotate(-4deg);
        }

        /* Action buttons */
        .action-btn {
          position: relative;
          overflow: hidden;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.2s ease;
        }
        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        .action-btn:active {
          transform: scale(0.96);
        }
        .action-btn .btn-ripple {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.08), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .action-btn:hover .btn-ripple { opacity: 1; }

        /* Spin animation for loading */
        @keyframes spinOnce {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin { animation: spinOnce 0.7s linear infinite; }

        /* Logo underline */
        .logo-underline {
          height: 1px;
          background: linear-gradient(90deg, rgba(148,137,121,0.6), transparent);
          margin-top: 12px;
        }

        /* Slide-in for sidebar items */
        .sidebar-slide {
          animation: sidebarSlide 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes sidebarSlide {
          from { opacity: 0; transform: translateX(-16px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* Toast */
        .toast {
          animation: toastIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .toast-exit {
          animation: toastOut 0.3s ease both;
        }
        @keyframes toastOut {
          to { opacity: 0; transform: translateY(6px); }
        }

        /* Divider */
        .soft-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(148,137,121,0.2), transparent);
        }

        /* Version badge */
        .version-badge {
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          opacity: 0.45;
        }

        /* Decorative dot grid */
        .dot-pattern {
          position: absolute;
          bottom: 80px;
          right: 12px;
          width: 48px;
          height: 48px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 4px;
          opacity: 0.12;
          pointer-events: none;
        }
        .dot-pattern span {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #948979;
        }

        /* Floating label for active item */
        .active-label {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 9px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          opacity: 0.5;
        }
      `}</style>

      <aside
        className="sidebar-root w-64 min-h-screen flex flex-col relative"
        style={{
          backgroundColor: colors.primary,
          borderRight: '1px solid rgba(148,137,121,0.1)',
          boxShadow: '4px 0 32px rgba(0,0,0,0.2)',
        }}
      >
        {/* Dot decoration */}
        <div className="dot-pattern">
          {[...Array(16)].map((_, i) => <span key={i} />)}
        </div>

        {/* Top ambient glow */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '200px',
          background: 'radial-gradient(ellipse at 30% 0%, rgba(148,137,121,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="relative z-10 flex flex-col h-full p-5">

          {/* Logo */}
          <div className="sidebar-slide mb-8" style={{ animationDelay: '0s' }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="version-badge mb-1" style={{ color: colors.accent }}>
                  Personal Tracker
                </div>
                <h1 className="display-font text-2xl font-bold leading-tight" style={{ color: colors.light }}>
                  MyPKL
                  <span style={{ color: colors.accent }}> Notes</span>
                </h1>
              </div>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent}, #7a6e62)`,
                  boxShadow: '0 4px 12px rgba(148,137,121,0.35)',
                }}
              >
                <span className="display-font text-xs font-bold" style={{ color: colors.primary }}>P</span>
              </div>
            </div>
            <div className="logo-underline" />
          </div>

{/* Navigation */}
          <nav className="flex-1 space-y-1">
            {getNavItems(hasToday).map((item, i) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <div
                  key={item.href}
                  className="sidebar-slide"
                  style={{ animationDelay: `${0.05 + i * 0.07}s` }}
                >
                  <Link href={item.href}>
                    <div
                      className={`nav-item ${isActive ? 'active' : ''} flex items-center gap-3 px-3 py-2.5 rounded-xl`}
                      style={{
                        backgroundColor: isActive
                          ? 'rgba(148,137,121,0.14)'
                          : 'transparent',
                        border: isActive
                          ? '1px solid rgba(148,137,121,0.22)'
                          : '1px solid transparent',
                      }}
                    >
                      {/* Active indicator bar */}
                      <div className="nav-indicator" />

                      {/* Icon */}
                      <div
                        className="nav-icon-wrap"
                        style={{
                          backgroundColor: isActive
                            ? 'rgba(148,137,121,0.2)'
                            : 'rgba(57,62,70,0.6)',
                        }}
                      >
                        <Icon
                          size={17}
                          style={{ color: isActive ? colors.light : colors.accent }}
                        />
                      </div>

                      {/* Label + desc */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-medium leading-none mb-0.5"
                          style={{ color: isActive ? colors.light : colors.accent }}
                        >
                          {item.label}
                        </div>
                        <div
                          className="text-xs leading-none truncate"
                          style={{ color: isActive ? 'rgba(223,208,184,0.45)' : 'rgba(148,137,121,0.45)' }}
                        >
                          {item.desc}
                        </div>
                      </div>

{/* Active dot / Reminder badge */}
                      {isActive ? (
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: colors.light,
                            boxShadow: `0 0 6px ${colors.light}`,
                          }}
                        />
                      ) : item.needsBadge ? (
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
                          style={{
                            backgroundColor: '#c47070',
                            boxShadow: '0 0 6px #c47070',
                          }}
                        />
                      ) : null}
                    </div>
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div
            className="sidebar-slide mt-4"
            style={{ animationDelay: '0.45s' }}
          >
            <div className="soft-divider mb-4" />

            {/* User Info */}
            {user && (
              <div className="mb-4 px-3 py-3 rounded-xl" style={{ backgroundColor: 'rgba(57,62,70,0.4)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.accent }}
                  >
                    <User size={16} style={{ color: colors.primary }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: colors.light }}>
                      {user.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="action-btn w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: 'rgba(180,70,70,0.2)',
                    color: '#c47070',
                    border: '1px solid rgba(180,70,70,0.3)',
                  }}
                >
                  <LogOut size={13} />
                  <span>Logout</span>
                </button>
              </div>
            )}

            {/* Section Label */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <div
                className="w-3 h-px"
                style={{ backgroundColor: colors.accent, opacity: 0.5 }}
              />
              <p
                className="text-xs tracking-widest uppercase"
                style={{ color: colors.accent, opacity: 0.6 }}
              >
                Data
              </p>
            </div>

            {/* Toast */}
            {toast && (
              <div
                className="toast mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs"
                style={{
                  backgroundColor: toast.type === 'success'
                    ? 'rgba(148,137,121,0.18)'
                    : 'rgba(180,70,70,0.18)',
                  border: `1px solid ${toast.type === 'success' ? 'rgba(148,137,121,0.3)' : 'rgba(180,70,70,0.3)'}`,
                  color: colors.light,
                }}
              >
                {toast.type === 'success'
                  ? <CheckCircle2 size={13} style={{ color: colors.accent, flexShrink: 0 }} />
                  : <AlertCircle size={13} style={{ color: '#c47070', flexShrink: 0 }} />
                }
                <span>{toast.message}</span>
              </div>
            )}

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between px-1">
              <span className="version-badge" style={{ color: colors.accent }}>v1.0.0</span>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: 4, height: 4,
                      backgroundColor: colors.accent,
                      opacity: 0.2 + i * 0.15,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}