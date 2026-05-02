'use client';

import { useState, useCallback } from 'react';
import { apiClient, ApiError } from '../lib/apiClient';

export interface AttendanceRecord {
  id: string;
  date: string;
  check_in_time: string;
  check_out_time?: string;
  total_hours: number;
  created_at: string;
}

export function useAttendance() {
  const [attendanceAll, setAttendanceAll] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getAttendanceAll();
      setAttendanceAll(data);
      return data;
    } catch (err) {
      const apiErr = err as ApiError;
      const message = typeof apiErr.detail === 'string'
        ? apiErr.detail
        : 'Failed to fetch attendance records';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchToday = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getAttendanceToday();
      setTodayRecord(data);
      return data;
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status !== 404) {
        const message = typeof apiErr.detail === 'string'
          ? apiErr.detail
          : 'Failed to fetch today attendance';
        setError(message);
      }
      setTodayRecord(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkIn = useCallback(
    async (date: string, checkInTime: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.postAttendance(
          date,
          checkInTime,
          undefined,
          0
        );
        setTodayRecord(data);
        return data;
      } catch (err) {
        const apiErr = err as ApiError;
        const message = typeof apiErr.detail === 'string'
          ? apiErr.detail
          : 'Check-in failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const checkOut = useCallback(
    async (date: string, checkInTime: string, checkOutTime: string) => {
      setLoading(true);
      setError(null);
      try {
        const start = new Date(checkInTime).getTime();
        const end = new Date(checkOutTime).getTime();
        const totalHours = Math.round(
          ((end - start) / (1000 * 60 * 60)) * 10
        ) / 10;

        const data = await apiClient.postAttendance(
          date,
          checkInTime,
          checkOutTime,
          totalHours
        );
        setTodayRecord(data);
        return data;
      } catch (err) {
        const apiErr = err as ApiError;
        const message = typeof apiErr.detail === 'string'
          ? apiErr.detail
          : 'Check-out failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    attendanceAll,
    todayRecord,
    loading,
    error,
    fetchAll,
    fetchToday,
    checkIn,
    checkOut,
  };
}
