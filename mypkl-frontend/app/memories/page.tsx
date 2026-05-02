'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, ChevronLeft, ChevronRight, Images, Calendar, FileText } from 'lucide-react';
import { getAllPhotos } from '../lib/storageHelper';

const colors = {
  primary: '#222831',
  secondary: '#393E46',
  accent: '#948979',
  light: '#DFD0B8',
};

type Photo = {
  src: string;
  source: string;
  date: string;
};

export default function MemoriesPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'Logbook' | 'Documents'>('all');

  useEffect(() => {
    setIsMounted(true);
    setPhotos(getAllPhotos());
  }, []);

  const filteredPhotos = photos.filter(p => filter === 'all' || p.source === filter);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const nextPhoto = () => {
    if (selectedIndex !== null && selectedIndex < filteredPhotos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'Escape') closeLightbox();
    };
    if (selectedIndex !== null) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedIndex]);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full" style={{ backgroundColor: colors.secondary }} />
          <div className="mt-4 h-4 w-32 rounded" style={{ backgroundColor: colors.secondary }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} style={{ color: colors.accent, opacity: 0.7 }} />
            <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: colors.accent, opacity: 0.6 }}>
              My PKL
            </span>
          </div>
          <h1 className="display-font text-4xl font-bold" style={{ color: colors.light }}>
            Photo <span style={{ color: colors.accent }}>Memories</span>
          </h1>
          <p style={{ color: colors.accent, fontSize: 14, marginTop: 4, fontWeight: 300 }}>
            Koleksi foto kegiatan PKL-mu
          </p>
        </div>

        {photos.length > 0 && (
          <div className="flex items-center gap-2">
            <span style={{ color: colors.accent, fontSize: 13 }}>
              {filteredPhotos.length} foto
            </span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-3 py-1.5 rounded-lg text-sm"
              style={{ backgroundColor: colors.secondary, color: colors.light, border: '1px solid rgba(148,137,121,0.2)' }}
            >
              <option value="all">Semua</option>
              <option value="Logbook">Logbook</option>
              <option value="Documents">Dokumen</option>
            </select>
          </div>
        )}
      </div>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl"
          style={{
            backgroundColor: colors.secondary,
            border: '1px dashed rgba(148,137,121,0.25)',
          }}
        >
          <Images className="mx-auto h-16 w-16 mb-4" style={{ color: colors.accent, opacity: 0.5 }} />
          <p className="display-font text-xl" style={{ color: colors.light }}>Belum ada foto</p>
          <p style={{ color: colors.accent, fontSize: 14, marginTop: 4 }}>
            Upload foto di Logbook atau Documents untuk tampil di sini
          </p>
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl"
          style={{
            backgroundColor: colors.secondary,
            border: '1px dashed rgba(148,137,121,0.25)',
          }}
        >
          <Images className="mx-auto h-16 w-16 mb-4" style={{ color: colors.accent, opacity: 0.5 }} />
          <p className="display-font text-xl" style={{ color: colors.light }}>Tidak ada foto</p>
          <p style={{ color: colors.accent, fontSize: 14, marginTop: 4 }}>
            Coba filter yang berbeda
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo, index) => (
            <div
              key={index}
              onClick={() => openLightbox(index)}
              className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
              style={{
                backgroundColor: colors.secondary,
                border: '1px solid rgba(148,137,121,0.15)',
              }}
            >
              <img
                src={photo.src}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {/* Overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
                }}
              >
<div className="absolute bottom-2 left-2 right-2">
                  <div className="flex items-center gap-2 text-xs" style={{ color: colors.light }}>
                    <FileText size={12} />
                    <span>{photo.source}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedIndex !== null && filteredPhotos[selectedIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full transition-colors hover:bg-white/10"
            style={{ color: colors.light }}
          >
            <X size={24} />
          </button>

          {/* Navigation */}
          {selectedIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
              className="absolute left-4 p-2 rounded-full transition-colors hover:bg-white/10"
              style={{ color: colors.light }}
            >
              <ChevronLeft size={32} />
            </button>
          )}
          {selectedIndex < filteredPhotos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
              className="absolute right-4 p-2 rounded-full transition-colors hover:bg-white/10"
              style={{ color: colors.light }}
            >
              <ChevronRight size={32} />
            </button>
          )}

          {/* Image */}
          <img
            src={filteredPhotos[selectedIndex].src}
            alt={`Photo ${selectedIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Info */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 rounded-full"
            style={{ backgroundColor: 'rgba(34,40,49,0.9)', border: '1px solid rgba(148,137,121,0.2)' }}
          >
            <span className="text-sm" style={{ color: colors.light }}>
              {selectedIndex + 1} / {filteredPhotos.length}
            </span>
<div className="flex items-center gap-1 text-xs" style={{ color: colors.accent }}>
              <FileText size={12} />
              <span>{filteredPhotos[selectedIndex].source}</span>
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: colors.accent }}>
              <Calendar size={12} />
              <span>
                {filteredPhotos[selectedIndex].date
                  ? new Date(filteredPhotos[selectedIndex].date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '-'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
