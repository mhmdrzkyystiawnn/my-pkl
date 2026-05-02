'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, Smile, Calendar, Sparkles, BarChart2, Clock } from 'lucide-react';
import { getAttendanceStats } from '../lib/storageHelper';

const colors = {
  primary: '#222831',
  secondary: '#393E46',
  accent: '#948979',
  light: '#DFD0B8',
  chartGreen: '#10b981',
};

const MOOD_VALUES: Record<string, number> = {
  happy: 5, excited: 4, neutral: 3, tired: 2, stressed: 1
};

const MOOD_LABELS: Record<string, string> = {
  happy: 'Happy', excited: 'Excited', neutral: 'Neutral', tired: 'Tired', stressed: 'Stressed'
};

const PIE_COLORS = ['#948979', '#DFD0B8', '#5C5449', '#393E46', '#222831'];

// Hook untuk animasi angka
function useCountUp(target: number, duration: number = 1000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    if (target === 0) return;
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

export default function AnalyticsPage() {
  const [logbookData, setLogbookData] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
const [stats, setStats] = useState({
    totalEntries: 0,
    averageMood: 0,
    currentStreak: 0,
    bestMood: '-'
  });
  
const [attendanceStats, setAttendanceStats] = useState<{
    totalDays: number;
    totalHours: number;
    averageCheckOut: number | null;
    averageHours: number;
  }>({
    totalDays: 0,
    totalHours: 0,
    averageCheckOut: null,
    averageHours: 0
  });

  useEffect(() => {
    setIsMounted(true);
    const data = JSON.parse(localStorage.getItem('mypkl_logbook') || '[]');
    setLogbookData(data);
    
    // Calculate Stats
    const totalEntries = data.length;
    let moodSum = 0;
    let moodCounts: Record<string, number> = {};
    
    // Load attendance stats
    const attStats = getAttendanceStats();
    setAttendanceStats(attStats);

    data.forEach((entry: any) => {
      if (entry.mood && MOOD_VALUES[entry.mood]) {
        moodSum += MOOD_VALUES[entry.mood];
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      }
    });

    const averageMood = totalEntries > 0 ? (moodSum / totalEntries) : 0;
    let bestMood = '-';
    let maxCount = 0;
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        bestMood = MOOD_LABELS[mood];
      }
    });

    setStats({
      totalEntries,
      averageMood,
      currentStreak: calculateStreak(data),
      bestMood
    });
  }, []);

  const calculateStreak = (data: any[]) => {
    if (data.length === 0) return 0;
    const dates = [...new Set(data.map(entry => 
      new Date(entry.createdAt || Date.now()).toLocaleDateString('id-ID')
    ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 1;
    for (let i = 0; i < dates.length - 1; i++) {
      const diff = Math.floor((new Date(dates[i]).getTime() - new Date(dates[i+1]).getTime()) / (86400000));
      if (diff === 1) streak++; else break;
    }
    return streak;
  };

const animatedTotal = useCountUp(stats.totalEntries);
  const animatedStreak = useCountUp(stats.currentStreak);
  const animatedHours = useCountUp(attendanceStats.totalHours);

  if (!isMounted) return <div className="p-10 text-cream">Loading...</div>;

  return (
    <div className="dashboard-root space-y-8 pb-10">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');
        .dashboard-root { font-family: 'DM Sans', sans-serif; }
        .display-font { font-family: 'Playfair Display', serif; }
        .grain::after {
          content: ''; position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          border-radius: inherit; pointer-events: none; mix-blend-mode: overlay; opacity: 0.35;
        }
        .slide-up { animation: slideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chart-container .recharts-cartesian-grid-horizontal line,
        .chart-container .recharts-cartesian-grid-vertical line { stroke: rgba(148,137,121,0.1); }
      `}</style>

      {/* Header */}
      <div className="slide-up">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-accent animate-pulse" style={{ color: colors.accent }} />
          <span className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: colors.accent }}>Visualisasi Data</span>
        </div>
        <h1 className="display-font text-4xl font-bold" style={{ color: colors.light }}>Analytics</h1>
        <p className="text-sm font-light mt-1" style={{ color: colors.accent }}>Analisis mendalam aktivitas dan mood PKL-mu</p>
      </div>

{/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 slide-up" style={{ animationDelay: '0.1s' }}>
        <MiniStatCard icon={Calendar} label="Total Entri" value={animatedTotal} />
        <MiniStatCard icon={TrendingUp} label="Rata Mood" value={stats.averageMood > 0 ? `${stats.averageMood.toFixed(1)}/5` : '-'} />
        <MiniStatCard icon={BarChart2} label="Streak" value={`${animatedStreak} Hari`} />
        <MiniStatCard icon={Smile} label="Dominan" value={stats.bestMood} />
      </div>

      {/* Attendance Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 slide-up" style={{ animationDelay: '0.15s' }}>
        <MiniStatCard icon={Clock} label="Total Jam Kerja" value={animatedHours} />
        <MiniStatCard icon={Calendar} label="Hari Presensi" value={attendanceStats.totalDays} />
        <MiniStatCard icon={Clock} label="Rata Jam/Hari" value={attendanceStats.averageHours > 0 ? attendanceStats.averageHours.toFixed(1) : '-'} />
        <MiniStatCard icon={Clock} label="Rata Pulang" value={attendanceStats.averageCheckOut ? formatTime(attendanceStats.averageCheckOut) : '-'} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 slide-up" style={{ animationDelay: '0.2s' }}>
        
        {/* Trend Line Chart */}
        <ChartWrapper title="Tren Mood Mingguan">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={getMoodTrend(logbookData)}>
              <XAxis dataKey="name" stroke={colors.accent} fontSize={10} tickLine={false} axisLine={false} />
              <YAxis domain={[1, 5]} hide />
              <Tooltip 
                contentStyle={{ backgroundColor: colors.primary, border: `1px solid ${colors.accent}`, borderRadius: '10px', color: colors.light }}
                itemStyle={{ color: colors.accent }}
              />
              <Line type="monotone" dataKey="mood" stroke={colors.accent} strokeWidth={3} dot={{ r: 4, fill: colors.light }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Mood Distribution */}
        <ChartWrapper title="Distribusi Mood">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={getMoodDist(logbookData)}
                innerRadius={60} outerRadius={80} paddingAngle={8}
                dataKey="value"
              >
                {getMoodDist(logbookData).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* Bar Activity */}
      <div className="slide-up" style={{ animationDelay: '0.3s' }}>
        <ChartWrapper title="Intensitas Aktivitas">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={getMoodTrend(logbookData)}>
              <XAxis dataKey="name" stroke={colors.accent} fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: colors.primary, border: 'none' }} />
              <Bar dataKey="entries" fill={colors.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>
    </div>
  );
}

// Sub-components
function MiniStatCard({ icon: Icon, label, value }: any) {
  return (
    <div className="relative rounded-2xl p-4 grain overflow-hidden" style={{ backgroundColor: colors.secondary, border: '1px solid rgba(148,137,121,0.15)' }}>
      <div className="relative z-10">
        <Icon size={18} className="mb-2" style={{ color: colors.accent }} />
        <p className="display-font text-2xl font-bold" style={{ color: colors.light }}>{value}</p>
        <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: colors.accent }}>{label}</p>
      </div>
    </div>
  );
}

function ChartWrapper({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl p-6 grain overflow-hidden chart-container" style={{ backgroundColor: colors.secondary, border: '1px solid rgba(148,137,121,0.15)' }}>
      <h3 className="display-font text-lg mb-6" style={{ color: colors.light }}>{title}</h3>
      {children}
    </div>
  );
}

// Data Helpers
function getMoodTrend(data: any[]) {
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayEntries = data.filter(e => new Date(e.createdAt).toDateString() === d.toDateString());
    const avg = dayEntries.length ? dayEntries.reduce((s, e) => s + (MOOD_VALUES[e.mood] || 3), 0) / dayEntries.length : 0;
    return { name: days[d.getDay()], mood: parseFloat(avg.toFixed(1)), entries: dayEntries.length };
  });
}

function getMoodDist(data: any[]) {
  const counts: Record<string, number> = {};
  data.forEach(e => { if(e.mood) counts[MOOD_LABELS[e.mood]] = (counts[MOOD_LABELS[e.mood]] || 0) + 1; });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

// Helper to format decimal hours to time string (e.g., 17.5 -> 17:30)
function formatTime(decimalHours: number): string {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
