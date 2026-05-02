'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, Coffee, LogOut, CheckCircle, Timer } from 'lucide-react';
import { apiClient } from '../lib/apiClient';

interface AttendanceRecord {
  id: string;
  date: string;
  check_in_time: string;
  check_out_time?: string;
  total_hours: number;
  created_at: string;
}

const colors = {
  primary: '#222831',
  secondary: '#393E46',
  accent: '#948979',
  light: '#DFD0B8',
  success: '#10b981',
  warning: '#f59e0b',
};

// Format time display (e.g., "08:30")
const formatTime = (timeString: string): string => {
  // If it's already in HH:MM format, return as is
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return timeString;
  }
  // Otherwise, try to parse as ISO string
  const date = new Date(timeString);
  if (isNaN(date.getTime())) {
    return timeString; // Return as is if can't parse
  }
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

// Format hours display (e.g., "8.5 jam")
const formatHours = (hours: number): string => {
  if (hours === 0) return '0 jam';
  if (hours === 1) return '1 jam';
  return `${hours} jam`;
};

// Calculate current session hours (for live tracking)
const calculateCurrentHours = (checkInTime: string): number => {
  let checkInDate: Date;

  if (/^\d{2}:\d{2}$/.test(checkInTime)) {
    // HH:MM format - create date for today
    const today = new Date().toISOString().split('T')[0];
    checkInDate = new Date(`${today}T${checkInTime}`);
  } else {
    // Try to parse as ISO string
    checkInDate = new Date(checkInTime);
  }

  if (isNaN(checkInDate.getTime())) {
    return 0;
  }

  const now = new Date().getTime();
  return Math.round(((now - checkInDate.getTime()) / (1000 * 60 * 60)) * 10) / 10;
};

export default function AttendanceLogger() {
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [currentHours, setCurrentHours] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load today's attendance on mount
  useEffect(() => {
    setIsMounted(true);
    loadTodayRecord();
  }, []);

  // Update current hours every minute if checked in but not checked out
  useEffect(() => {
    if (todayRecord && !todayRecord.check_out_time) {
      const interval = setInterval(() => {
        setCurrentHours(calculateCurrentHours(todayRecord.check_in_time));
      }, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [todayRecord]);

  const loadTodayRecord = async () => {
    try {
      const response = await apiClient.getTodayAttendance();
      if (response.data) {
        setTodayRecord(response.data);
        if (response.data && !response.data.check_out_time) {
          setCurrentHours(calculateCurrentHours(response.data.check_in_time));
        }
      }
    } catch (error) {
      console.error('Failed to load today attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const checkInTime = now.toTimeString().slice(0, 5); // HH:MM format

      const response = await apiClient.createAttendance({
        date: today,
        check_in_time: checkInTime,
        check_out_time: undefined,
        total_hours: 0,
      });

      if (response.data) {
        setTodayRecord(response.data);
      }
    } catch (error) {
      console.error('Failed to check in:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayRecord) return;

    setLoading(true);
    try {
      const now = new Date();
      const checkOutTime = now.toTimeString().slice(0, 5); // HH:MM format

      // Calculate total hours
      const checkInDateTime = new Date(`${todayRecord.date}T${todayRecord.check_in_time}`);
      const checkOutDateTime = now;
      const totalHours = Math.round(((checkOutDateTime.getTime() - checkInDateTime.getTime()) / (1000 * 60 * 60)) * 10) / 10;

      const response = await apiClient.createAttendance({
        date: todayRecord.date,
        check_in_time: todayRecord.check_in_time,
        check_out_time: checkOutTime,
        total_hours: totalHours,
      });

      if (response.data) {
        setTodayRecord(response.data);
      }
    } catch (error) {
      console.error('Failed to check out:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="rounded-2xl p-6" style={{ backgroundColor: colors.secondary }}>
        <div className="animate-pulse h-20 rounded-xl" style={{ backgroundColor: colors.primary }} />
      </div>
    );
  }

  const isCheckedIn = !!todayRecord;
  const isCheckedOut = !!todayRecord?.check_out_time;
  const displayHours = isCheckedOut ? todayRecord?.total_hours || 0 : (isCheckedIn ? currentHours : 0);

  // Get status message
  const getStatusMessage = () => {
    if (!isCheckedIn) return { text: 'Belum Presensi', color: colors.warning };
    if (!isCheckedOut) return { text: 'Sedang Bekerja', color: colors.success };
    return { text: 'Selesai Bekerja', color: colors.accent };
  };

  const status = getStatusMessage();

  return (
    <>
      <style>{`
        .attendance-btn {
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .attendance-btn:hover {
          transform: scale(1.02);
        }
        .attendance-btn:active {
          transform: scale(0.98);
        }
        .pulse-ring {
          animation: pulseRing 2s ease-in-out infinite;
        }
        @keyframes pulseRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
        }
        .slide-up-attendance {
          animation: slideUpAttendance 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes slideUpAttendance {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div 
        className="slide-up-attendance rounded-2xl p-6 relative overflow-hidden"
        style={{ 
          backgroundColor: colors.secondary,
          border: '1px solid rgba(148,137,121,0.15)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
        }}
      >
        {/* Background Accent */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '50%',
            height: '100%',
            background: 'radial-gradient(ellipse at 100% 50%, rgba(148,137,121,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div 
                className="p-2.5 rounded-xl"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.primary}, rgba(34,40,49,0.8))`,
                  border: '1px solid rgba(148,137,121,0.2)'
                }}
              >
                <Clock size={20} style={{ color: colors.accent }} />
              </div>
              <div>
                <h3 
                  className="font-semibold text-lg"
                  style={{ color: colors.light }}
                >
                  Presensi
                </h3>
                <p className="text-xs" style={{ color: colors.accent }}>
                  {new Date().toLocaleDateString('id-ID', { 
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div>
            </div>
            
            {/* Status Badge */}
            <div 
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${!isCheckedOut && isCheckedIn ? 'pulse-ring' : ''}`}
              style={{ 
                backgroundColor: `${status.color}20`,
                color: status.color,
                border: `1px solid ${status.color}40`
              }}
            >
              <span 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: status.color }}
              />
              {status.text}
            </div>
          </div>

          {/* Time Display */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* Check-in Time */}
            <div 
              className="p-3 rounded-xl"
              style={{ 
                backgroundColor: 'rgba(34,40,49,0.6)',
                border: '1px solid rgba(148,137,121,0.12)'
              }}
            >
              <p className="text-xs mb-1" style={{ color: colors.accent }}>Check-in</p>
              <p className="text-xl font-semibold" style={{ color: colors.light }}>
                {todayRecord ? formatTime(todayRecord.check_in_time) : '--:--'}
              </p>
            </div>

            {/* Check-out Time */}
            <div 
              className="p-3 rounded-xl"
              style={{ 
                backgroundColor: 'rgba(34,40,49,0.6)',
                border: '1px solid rgba(148,137,121,0.12)'
              }}
            >
              <p className="text-xs mb-1" style={{ color: colors.accent }}>Check-out</p>
              <p className="text-xl font-semibold" style={{ color: colors.light }}>
                {todayRecord?.check_out_time ? formatTime(todayRecord.check_out_time) : '--:--'}
              </p>
            </div>
          </div>

          {/* Hours Worked */}
          <div 
            className="p-4 rounded-xl mb-5 flex items-center justify-between"
            style={{ 
              background: `linear-gradient(135deg, ${colors.primary}, rgba(34,40,49,0.8))`,
              border: '1px solid rgba(148,137,121,0.2)'
            }}
          >
            <div className="flex items-center gap-3">
              <Timer size={20} style={{ color: colors.accent }} />
              <span className="text-sm" style={{ color: colors.light }}>Jam Kerja Hari Ini</span>
            </div>
            <span 
              className="text-2xl font-bold"
              style={{ color: colors.accent }}
            >
              {formatHours(displayHours)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isCheckedIn ? (
              <button
                onClick={handleCheckIn}
                disabled={loading}
                className="attendance-btn flex-1 py-3.5 px-5 rounded-xl font-medium flex items-center justify-center gap-2"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.success}, #059669)`,
                  color: '#fff',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
                }}
              >
                <MapPin size={18} />
                Check-in
              </button>
            ) : !isCheckedOut ? (
              <button
                onClick={handleCheckOut}
                disabled={loading}
                className="attendance-btn flex-1 py-3.5 px-5 rounded-xl font-medium flex items-center justify-center gap-2"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.accent}, #7a6e62)`,
                  color: colors.primary,
                  boxShadow: '0 4px 16px rgba(148,137,121,0.3)'
                }}
              >
                <LogOut size={18} />
                Check-out
              </button>
            ) : (
              <div 
                className="flex-1 py-3.5 px-5 rounded-xl font-medium flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: colors.primary,
                  color: colors.success,
                  border: '1px solid rgba(16,185,129,0.3)'
                }}
              >
                <CheckCircle size={18} />
                Hari Ini Selesai
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
