'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Search } from 'lucide-react';
import { apiClient, LogbookEntry } from '../lib/apiClient';
import ProtectedRoute from '../components/ProtectedRoute';

const colors = {
  primary: '#222831',
  secondary: '#393E46',
  accent: '#948979',
  light: '#DFD0B8',
};

const MOODS = ['😊', '😃', '😐', '😕', '😢'];

export default function LogbookPage() {
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
const [formData, setFormData] = useState({
    title: '',
    description: '',
    mood: '😊',
    image: '',
  });
  
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsMounted(true);
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getLogbook();
      // Pastikan response.data adalah array agar tidak error 2345
      setEntries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load entries:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    try {
const response = await apiClient.createLogbookEntry({
        title: formData.title,
        description: formData.description,
        mood: formData.mood,
        image: formData.image || undefined
      });

      if (response.data) {
        // Karena apiClient sudah menggunakan Generics, response.data otomatis bertipe LogbookEntry
        setEntries([response.data, ...entries]);
        setFormData({ title: '', description: '', mood: '😊', image: '' });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Failed to create entry:', error);
    }
  };

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isMounted) {
    return (
      <ProtectedRoute>
        <div style={{ backgroundColor: colors.primary, minHeight: '100vh' }} />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div style={{ backgroundColor: colors.primary, minHeight: '100vh' }}>
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: colors.light }}>
                Logbook
              </h1>
              <p style={{ color: colors.accent }}>
                Catat aktivitas dan pembelajaran harian Anda
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
              style={{ backgroundColor: colors.accent, color: colors.primary }}
            >
              <Plus size={18} />
              Tambah Entry
            </button>
          </div>

          {/* Search */}
          {entries.length > 0 && (
            <div className="mb-6 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.accent }} />
              <input
                type="text"
                placeholder="Cari entri..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
                style={{
                  backgroundColor: colors.secondary,
                  color: colors.light,
                  border: `1px solid ${colors.accent}40`,
                  outline: 'none'
                }}
              />
            </div>
          )}

          {/* Form Create */}
          {showForm && (
            <div 
              className="rounded-lg p-6 mb-8"
              style={{ backgroundColor: colors.secondary, border: `1px solid ${colors.accent}30` }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold" style={{ color: colors.light }}>Entry Baru</h2>
                <button onClick={() => setShowForm(false)} style={{ color: colors.accent }}>
                  <X size={18} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium" style={{ color: colors.accent }}>Judul</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full mt-1 px-4 py-2 rounded-lg"
                    style={{ backgroundColor: colors.primary, color: colors.light, border: `1px solid ${colors.accent}40`, outline: 'none' }}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium" style={{ color: colors.accent }}>Deskripsi</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full mt-1 px-4 py-2 rounded-lg"
                    style={{ backgroundColor: colors.primary, color: colors.light, border: `1px solid ${colors.accent}40`, outline: 'none' }}
                  />
                </div>

<div>
                  <label className="text-sm font-medium block mb-2" style={{ color: colors.accent }}>Mood</label>
                  <div className="flex gap-2">
                    {MOODS.map((mood) => (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => setFormData({ ...formData, mood })}
                        className="text-2xl p-2 rounded transition-all"
                        style={{
                          boxShadow: formData.mood === mood ? `0 0 0 2px ${colors.accent}` : 'none',
                          backgroundColor: formData.mood === mood ? `${colors.accent}20` : 'transparent',
                        }}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium" style={{ color: colors.accent }}>Gambar (URL)</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full mt-1 px-4 py-2 rounded-lg"
                    style={{ backgroundColor: colors.primary, color: colors.light, border: `1px solid ${colors.accent}40`, outline: 'none' }}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={!formData.title.trim()}
                    className="px-6 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: colors.accent, color: colors.primary, opacity: !formData.title.trim() ? 0.5 : 1 }}
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 rounded-lg"
                    style={{ backgroundColor: colors.secondary, color: colors.light, border: `1px solid ${colors.accent}40` }}
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List Entries */}
          {loading ? (
            <div style={{ color: colors.accent }}>Memuat...</div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-16 rounded-lg" style={{ backgroundColor: colors.secondary, border: `1px solid ${colors.accent}30` }}>
              <p style={{ color: colors.accent }}>
                {entries.length === 0 ? 'Belum ada entry' : 'Tidak ada hasil pencarian'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg p-6"
                  style={{ backgroundColor: colors.secondary, border: `1px solid ${colors.accent}30` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold" style={{ color: colors.light }}>
                        {entry.mood} {entry.title}
                      </h3>
                      <p className="text-xs mt-1" style={{ color: colors.accent }}>
                        {new Date(entry.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
{entry.description && (
                    <p style={{ color: colors.accent }} className="whitespace-pre-wrap">{entry.description}</p>
                  )}
                  {entry.image && (
                    <img 
                      src={entry.image} 
                      alt={entry.title} 
                      className="mt-3 rounded-lg max-w-full h-auto"
                      style={{ maxHeight: '300px' }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}