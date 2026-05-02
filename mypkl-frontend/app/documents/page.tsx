'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, FileText, Link as LinkIcon,
  ExternalLink, Award, Mail, ClipboardList,
  Camera, MoreHorizontal, X, FolderOpen, Sparkles,
} from 'lucide-react';
import { saveDocument, deleteDocument } from '../lib/storageHelper';

const colors = {
  primary: '#222831',
  secondary: '#393E46',
  accent: '#948979',
  light: '#DFD0B8',
};

const DOC_TYPES = [
  { value: 'sertifikat', label: 'Sertifikat', icon: Award, color: 'rgba(212,175,120,0.15)', iconColor: '#d4af78' },
  { value: 'surat', label: 'Surat Pengantar', icon: Mail, color: 'rgba(120,160,212,0.12)', iconColor: '#78a0d4' },
  { value: 'laporan', label: 'Laporan PKL', icon: ClipboardList, color: 'rgba(148,137,121,0.15)', iconColor: '#948979' },
  { value: 'foto', label: 'Foto Kegiatan', icon: Camera, color: 'rgba(172,212,120,0.12)', iconColor: '#a0c878' },
  { value: 'lainnya', label: 'Lainnya', icon: MoreHorizontal, color: 'rgba(223,208,184,0.1)', iconColor: '#DFD0B8' },
];

type Doc = {
  id?: string;
  name?: string;
  type?: string;
  link?: string;
  notes?: string;
  addedAt?: string;
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', type: 'sertifikat', link: '', notes: '' });
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => { setIsMounted(true); loadDocuments(); }, []);

  const loadDocuments = () => {
    if (typeof window !== 'undefined') {
      setDocuments(JSON.parse(localStorage.getItem('mypkl_documents') || '[]'));
    }
  };

  const openForm = () => { setShowForm(true); setTimeout(() => setFormVisible(true), 10); };
  const closeForm = () => {
    setFormVisible(false);
    setTimeout(() => { setShowForm(false); setFormData({ name: '', type: 'sertifikat', link: '', notes: '' }); }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    saveDocument(formData);
    closeForm();
    setTimeout(loadDocuments, 320);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      deleteDocument(id);
      loadDocuments();
      setDeletingId(null);
    }, 380);
  };

  if (!isMounted) return <DocumentsSkeleton />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .docs-root { font-family: 'DM Sans', sans-serif; }
        .display-font { font-family: 'Playfair Display', serif; }

        /* Slide-up stagger */
        .slide-up {
          animation: slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Form slide-down */
        .form-panel {
          overflow: hidden;
          transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .form-panel.hidden-form { opacity: 0; transform: translateY(-12px); pointer-events: none; }
        .form-panel.shown-form  { opacity: 1; transform: translateY(0); }

        /* Card hover */
        .doc-card {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.25s ease,
                      opacity 0.35s ease;
          cursor: default;
        }
        .doc-card:hover { transform: translateY(-5px) scale(1.01); box-shadow: 0 16px 48px rgba(0,0,0,0.35); }
        .doc-card.deleting { opacity: 0; transform: scale(0.9) translateY(8px); }

        /* Icon bounce */
        .icon-bounce {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .doc-card:hover .icon-bounce { transform: scale(1.15) rotate(-6deg); }

        /* Delete btn */
        .del-btn {
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), color 0.15s ease;
        }
        .del-btn:hover { transform: scale(1.2) rotate(8deg); color: #c47070; }

        /* Add button glow */
        .add-btn {
          position: relative;
          overflow: hidden;
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
        }
        .add-btn:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 8px 24px rgba(148,137,121,0.4); }
        .add-btn:active { transform: scale(0.97); }
        .add-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .add-btn:hover::after { opacity: 1; }

        /* Input styles */
        .styled-input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          background-color: #222831;
          color: #DFD0B8;
          border: 1px solid rgba(148,137,121,0.25);
        }
        .styled-input::placeholder { color: rgba(148,137,121,0.45); }
        .styled-input:focus {
          border-color: rgba(148,137,121,0.6);
          box-shadow: 0 0 0 3px rgba(148,137,121,0.12);
        }
        .styled-input option { background: #222831; color: #DFD0B8; }

        /* Link button */
        .link-btn {
          transition: gap 0.2s ease, color 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .link-btn:hover { gap: 8px; }

        /* Empty state float */
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .float-icon { animation: floatIcon 3s ease-in-out infinite; }

        /* Type chip */
        .type-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.04em;
        }

        /* Soft divider */
        .soft-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(148,137,121,0.2), transparent);
        }

        /* Grain on cards */
        .grain-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          border-radius: inherit;
          pointer-events: none;
          mix-blend-mode: overlay;
          opacity: 0.3;
        }

        /* Shimmer skeleton */
        @keyframes skelPulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.65; }
        }
        .skel { animation: skelPulse 1.6s ease-in-out infinite; border-radius: 10px; }

        /* Submit btn */
        .submit-btn {
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
        }
        .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(148,137,121,0.35); }
        .submit-btn:active { transform: scale(0.97); }

        /* Cancel btn */
        .cancel-btn {
          transition: background-color 0.15s ease, transform 0.2s ease;
        }
        .cancel-btn:hover { background-color: rgba(148,137,121,0.1); transform: translateY(-1px); }
      `}</style>

      <div className="docs-root space-y-6">

        {/* Header */}
        <div className="slide-up flex items-end justify-between" style={{ animationDelay: '0s' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} style={{ color: colors.accent, opacity: 0.7 }} />
              <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: colors.accent, opacity: 0.6 }}>
                My PKL
              </span>
            </div>
            <h1 className="display-font text-4xl font-bold" style={{ color: colors.light }}>
              Document <span style={{ color: colors.accent }}>Vault</span>
            </h1>
            <p style={{ color: colors.accent, fontSize: 14, marginTop: 4, fontWeight: 300 }}>
              Kelola semua dokumen PKL-mu di satu tempat
            </p>
          </div>

          <div className="flex items-center gap-3">
            {documents.length > 0 && (
              <div
                className="px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{
                  backgroundColor: 'rgba(148,137,121,0.12)',
                  border: '1px solid rgba(148,137,121,0.2)',
                  color: colors.accent,
                }}
              >
                {documents.length} dokumen
              </div>
            )}
            <button
              onClick={showForm ? closeForm : openForm}
              className="add-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{
                background: showForm
                  ? `rgba(148,137,121,0.15)`
                  : `linear-gradient(135deg, ${colors.accent}, #7a6e62)`,
                color: showForm ? colors.accent : colors.primary,
                border: showForm ? `1px solid rgba(148,137,121,0.3)` : 'none',
                boxShadow: showForm ? 'none' : '0 4px 16px rgba(148,137,121,0.3)',
              }}
            >
              {showForm
                ? <><X size={16} /> Tutup</>
                : <><Plus size={16} /> Tambah Dokumen</>
              }
            </button>
          </div>
        </div>

        {/* Form Panel */}
        {showForm && (
          <div
            className={`form-panel slide-up grain-card relative rounded-2xl p-6 overflow-hidden ${formVisible ? 'shown-form' : 'hidden-form'}`}
            style={{
              backgroundColor: colors.secondary,
              border: '1px solid rgba(148,137,121,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(223,208,184,0.05)',
            }}
          >
            {/* Ambient */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit',
              background: 'radial-gradient(ellipse at 90% 10%, rgba(148,137,121,0.07) 0%, transparent 60%)',
            }} />

            <h2 className="display-font text-xl font-semibold mb-5 relative z-10" style={{ color: colors.light }}>
              Dokumen Baru
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: colors.accent, marginBottom: 6 }}>
                    Nama Dokumen
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="styled-input"
                    placeholder="Contoh: Sertifikat PKL"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: colors.accent, marginBottom: 6 }}>
                    Jenis Dokumen
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="styled-input"
                  >
                    {DOC_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: colors.accent, marginBottom: 6 }}>
                  Link <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(opsional)</span>
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="styled-input"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: colors.accent, marginBottom: 6 }}>
                  Catatan
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="styled-input"
                  rows={2}
                  placeholder="Tambahkan catatan jika perlu..."
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="submit-btn px-6 py-2.5 rounded-xl text-sm font-medium"
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent}, #7a6e62)`,
                    color: colors.primary,
                    boxShadow: '0 4px 16px rgba(148,137,121,0.3)',
                  }}
                >
                  Simpan Dokumen
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="cancel-btn px-6 py-2.5 rounded-xl text-sm font-medium"
                  style={{
                    color: colors.accent,
                    border: '1px solid rgba(148,137,121,0.25)',
                  }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Documents Grid */}
        {documents.length === 0 ? (
          <div
            className="slide-up col-span-full flex flex-col items-center justify-center py-20 rounded-2xl"
            style={{
              backgroundColor: colors.secondary,
              border: '1px dashed rgba(148,137,121,0.25)',
              animationDelay: '0.1s',
            }}
          >
            <div
              className="float-icon w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{
                backgroundColor: 'rgba(148,137,121,0.1)',
                border: '1px solid rgba(148,137,121,0.2)',
              }}
            >
              <FolderOpen size={30} style={{ color: colors.accent }} />
            </div>
            <p className="display-font text-lg" style={{ color: colors.light }}>Vault kosong</p>
            <p style={{ color: colors.accent, fontSize: 13, fontWeight: 300, marginTop: 4 }}>
              Klik "Tambah Dokumen" untuk mulai mengarsipkan
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc, i) => {
              const docType = DOC_TYPES.find(t => t.value === doc.type) || DOC_TYPES[4];
              const TypeIcon = docType.icon;
              const isDeleting = deletingId === doc.id;

              return (
                <div
                  key={doc.id}
                  className={`doc-card grain-card slide-up relative rounded-2xl p-5 overflow-hidden ${isDeleting ? 'deleting' : ''}`}
                  style={{
                    backgroundColor: colors.secondary,
                    border: '1px solid rgba(148,137,121,0.15)',
                    boxShadow: '0 2px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(223,208,184,0.04)',
                    animationDelay: `${i * 0.06}s`,
                  }}
                >
                  {/* Ambient radial */}
                  <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 'inherit',
                    background: `radial-gradient(ellipse at 10% 10%, ${docType.color} 0%, transparent 60%)`,
                  }} />

                  <div className="relative z-10">
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="icon-bounce w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor: docType.color,
                          border: `1px solid ${docType.iconColor}25`,
                        }}
                      >
                        <TypeIcon size={20} style={{ color: docType.iconColor }} />
                      </div>
                      <button
                        onClick={() => doc.id && handleDelete(doc.id)}
                        className="del-btn p-1.5 rounded-lg"
                        style={{
                          color: 'rgba(148,137,121,0.45)',
                          backgroundColor: 'rgba(34,40,49,0.5)',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Name */}
                    <h3
                      className="display-font font-semibold mb-2 leading-tight"
                      style={{ color: colors.light, fontSize: 16 }}
                    >
                      {doc.name}
                    </h3>

                    {/* Type chip */}
                    <span
                      className="type-chip mb-3"
                      style={{
                        backgroundColor: docType.color,
                        color: docType.iconColor,
                        border: `1px solid ${docType.iconColor}30`,
                      }}
                    >
                      <TypeIcon size={10} />
                      {docType.label}
                    </span>

                    {/* Notes */}
                    {doc.notes && (
                      <>
                        <div className="soft-divider my-3" />
                        <p style={{ fontSize: 13, color: colors.accent, fontWeight: 300, lineHeight: 1.5 }}>
                          {doc.notes}
                        </p>
                      </>
                    )}

                    {/* Link */}
                    {doc.link && (
                      <button
                        onClick={() => doc.link && window.open(doc.link, '_blank')}
                        className="link-btn mt-3"
                        style={{ color: docType.iconColor, fontSize: 13 }}
                      >
                        <LinkIcon size={13} />
                        Buka Link
                        <ExternalLink size={11} style={{ opacity: 0.7 }} />
                      </button>
                    )}

                    {/* Date */}
                    <div
                      className="mt-4 pt-3"
                      style={{ borderTop: '1px solid rgba(148,137,121,0.1)' }}
                    >
                      <p style={{ fontSize: 11, color: 'rgba(148,137,121,0.45)', letterSpacing: '0.04em' }}>
                        Ditambahkan {doc.addedAt ? new Date(doc.addedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function DocumentsSkeleton() {
  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }} className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="skel h-10 w-48" style={{ backgroundColor: '#393E46' }} />
          <div className="skel h-4 w-64" style={{ backgroundColor: '#393E46' }} />
        </div>
        <div className="skel h-10 w-36" style={{ backgroundColor: '#393E46' }} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skel h-44" style={{ backgroundColor: '#393E46', animationDelay: `${i * 0.08}s` }} />
        ))}
      </div>
    </div>
  );
}