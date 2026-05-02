/**
 * SettingsPage.tsx
 * Halaman untuk mengatur tanggal PKL dan preferensi
 */

'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Calendar, Save, AlertCircle } from 'lucide-react';
import { saveSettings, getSettings, calculateProgress } from '../lib/storageHelper';

// Define types locally
interface Settings {
  startDate: string;
  endDate: string;
  companyName?: string;
  supervisorName?: string;
}

interface Progress {
  day: number;
  total: number;
  percentage: number;
  isActive: boolean;
  remaining: number;
}

// Theme Colors
const colors = {
  primary: '#222831',      // Primary Dark (background)
  secondary: '#393E46',    // Secondary Dark (cards, borders)
  accent: '#948979',       // Accent (muted brown)
  light: '#DFD0B8',        // Light (text, highlights)
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    startDate: '',
    endDate: '',
    companyName: '',
    supervisorName: ''
  });
  const [isMounted, setIsMounted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [progress, setProgress] = useState<Progress>({ day: 0, total: 0, percentage: 0, isActive: false, remaining: 0 });

  useEffect(() => {
    setIsMounted(true);
    const savedSettings = getSettings() as Settings | null;
    if (savedSettings) {
      setSettings({
        startDate: savedSettings.startDate || '',
        endDate: savedSettings.endDate || '',
        companyName: savedSettings.companyName || '',
        supervisorName: savedSettings.supervisorName || ''
      });
    }
    // Load progress after settings
    setProgress(calculateProgress() as Progress);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!settings.startDate || !settings.endDate) {
      alert('Mohon isi tanggal mulai dan selesai PKL');
      return;
    }

    const start = new Date(settings.startDate);
    const end = new Date(settings.endDate);
    
    if (end < start) {
      alert('Tanggal selesai harus lebih besar dari tanggal mulai');
      return;
    }

    saveSettings(settings);
    setSaved(true);
    // Update progress after saving
    setProgress(calculateProgress() as Progress);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (field: keyof Settings, value: string) => {
    setSettings({ ...settings, [field]: value });
  };

  if (!isMounted) {
    return <div className="p-6" style={{ color: colors.light }}>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: colors.light }}>Settings</h1>
        <p style={{ color: colors.accent }}>Atur informasi dan preferensi PKL-mu</p>
      </div>

      {/* Settings Form */}
      <div className="rounded-xl shadow-sm p-6" style={{ backgroundColor: colors.secondary, border: `1px solid ${colors.primary}` }}>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.light }}>
          <Calendar size={20} style={{ color: colors.accent }} />
          Tanggal PKL
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.light }}>
                Tanggal Mulai PKL
              </label>
              <input
                type="date"
                value={settings.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="w-full px-4 py-2 rounded-lg"
                style={{ 
                  backgroundColor: colors.primary, 
                  color: colors.light,
                  border: `1px solid ${colors.secondary}`
                }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.light }}>
                Tanggal Selesai PKL
              </label>
              <input
                type="date"
                value={settings.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="w-full px-4 py-2 rounded-lg"
                style={{ 
                  backgroundColor: colors.primary, 
                  color: colors.light,
                  border: `1px solid ${colors.secondary}`
                }}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.light }}>
                Nama Perusahaan (Opsional)
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full px-4 py-2 rounded-lg"
                style={{ 
                  backgroundColor: colors.primary, 
                  color: colors.light,
                  border: `1px solid ${colors.secondary}`
                }}
                placeholder="PT Contoh Indonesia"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.light }}>
                Nama Pembimbing (Opsional)
              </label>
              <input
                type="text"
                value={settings.supervisorName}
                onChange={(e) => handleChange('supervisorName', e.target.value)}
                className="w-full px-4 py-2 rounded-lg"
                style={{ 
                  backgroundColor: colors.primary, 
                  color: colors.light,
                  border: `1px solid ${colors.secondary}`
                }}
                placeholder="Budi Santoso"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: colors.accent, color: colors.primary }}
            >
              <Save size={18} />
              Simpan Pengaturan
            </button>
            {saved && (
              <span style={{ color: colors.accent }}>✓ Tersimpan!</span>
            )}
          </div>
        </form>
      </div>

      {/* Current Progress Preview */}
      {settings.startDate && settings.endDate && (
        <div className="rounded-xl shadow-sm p-6" style={{ backgroundColor: colors.secondary, border: `1px solid ${colors.primary}` }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: colors.light }}>Preview Progress</h2>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: colors.light }}>Progress: Hari ke-{progress.day} dari {progress.total}</span>
              <span className="font-semibold" style={{ color: colors.accent }}>{progress.percentage}%</span>
            </div>
            <div className="w-full rounded-full h-4 overflow-hidden" style={{ backgroundColor: colors.primary }}>
              <div 
                className="h-full rounded-full"
                style={{ 
                  width: `${progress.percentage}%`,
                  backgroundColor: colors.accent
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm" style={{ color: colors.accent }}>
            <AlertCircle size={16} />
            <span>Progress akan otomatis terupdate setiap hari</span>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div 
        className="rounded-xl p-4" 
        style={{ backgroundColor: colors.secondary, border: `1px solid ${colors.accent}` }}
      >
        <h3 className="font-semibold mb-2" style={{ color: colors.light }}>💡 Tips</h3>
        <ul className="text-sm space-y-1" style={{ color: colors.light }}>
          <li>• Atur tanggal PKL dengan benar untuk tracking progress yang akurat</li>
          <li>• Gunakan fitur Export/Import untuk backup data kamu</li>
          <li>• Data tersimpan secara lokal di browser kamu</li>
        </ul>
      </div>
    </div>
  );
}
