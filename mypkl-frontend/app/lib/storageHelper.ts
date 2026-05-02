/**
 * storageHelper.ts
 * Utility untuk menangani Export/Import data dari LocalStorage
 * Tanpa database server - solusi "database tanpa server"
 */

const STORAGE_KEYS = {
  LOGBOOK: 'mypkl_logbook',
  DOCUMENTS: 'mypkl_documents',
  SETTINGS: 'mypkl_settings',
  MOODS: 'mypkl_moods',
  ATTENDANCE: 'mypkl_attendance'
};

export interface LogbookEntry {
  id: string;
  title: string;
  description?: string;
  content?: string;
  date?: string;
  mood?: string;
  image?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  title?: string;
  name?: string;
  type: string;
  link?: string;
  notes?: string;
  image?: string;
  addedAt: string;
}

export interface Settings {
  startDate: string;
  endDate: string;
  companyName?: string;
  supervisorName?: string;
}

export interface Progress {
  day: number;
  total: number;
  percentage: number;
  isActive: boolean;
  remaining: number;
}

export interface AppData {
  logbook: LogbookEntry[];
  documents: Document[];
  settings: Settings | null;
  moods: string[];
  attendance: AttendanceRecord[];
  exportedAt: string;
  version: string;
}

// ==========================================
// ATTENDANCE TYPES & FUNCTIONS
// ==========================================

export interface AttendanceRecord {
  id: string;
  date: string;           // ISO date string (YYYY-MM-DD)
  checkInTime: string;   // ISO datetime string
  checkOutTime?: string; // ISO datetime string (optional if not checked out yet)
  totalHours: number;    // Calculated hours worked
  createdAt: string;
}

/**
 * Calculate hours between two datetime strings
 */
const calculateHours = (checkIn: string, checkOut?: string): number => {
  if (!checkOut) return 0;
  const start = new Date(checkIn).getTime();
  const end = new Date(checkOut).getTime();
  return Math.round(((end - start) / (1000 * 60 * 60)) * 10) / 10; // Round to 1 decimal
};

/**
 * Save attendance record (check-in or check-out)
 * @param checkInTime - ISO datetime string for check-in
 * @param checkOutTime - Optional ISO datetime string for check-out
 * @param date - Date string (YYYY-MM-DD)
 * @returns The saved attendance record
 */
export const saveAttendanceRecord = (
  checkInTime: string,
  checkOutTime: string | undefined,
  date: string
): AttendanceRecord => {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]') as AttendanceRecord[];
  
  // Check if record for today already exists
  const todayIndex = existing.findIndex(r => r.date === date);
  
  const totalHours = calculateHours(checkInTime, checkOutTime);
  
  if (todayIndex >= 0) {
    // Update existing record
    existing[todayIndex] = {
      ...existing[todayIndex],
      checkOutTime,
      totalHours
    };
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(existing));
    return existing[todayIndex];
  }
  
  // Create new record
  const newRecord: AttendanceRecord = {
    id: Date.now().toString(),
    date,
    checkInTime,
    checkOutTime,
    totalHours,
    createdAt: new Date().toISOString()
  };
  
  existing.unshift(newRecord);
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(existing));
  return newRecord;
};

/**
 * Get today's attendance record
 * @returns Today's attendance record or null if not checked in
 */
export const getTodayAttendance = (): AttendanceRecord | null => {
  if (typeof window === 'undefined') return null;
  
  const records = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]') as AttendanceRecord[];
  const today = new Date().toISOString().split('T')[0];
  
  return records.find(r => r.date === today) || null;
};

/**
 * Get all attendance records
 * @returns Array of all attendance records
 */
export const getAllAttendance = (): AttendanceRecord[] => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
};

/**
 * Calculate total work hours from all attendance records
 * @returns Total hours worked
 */
export const calculateTotalWorkHours = (): number => {
  const records = getAllAttendance();
  const total = records.reduce((sum, r) => sum + (r.totalHours || 0), 0);
  return Math.round(total * 10) / 10;
};

/**
 * Calculate average checkout time
 * @returns Average hour in decimal (e.g., 17.5 for 5:30 PM) or null if no data
 */
export const calculateAverageCheckOut = (): number | null => {
  const records = getAllAttendance();
  const withCheckout = records.filter(r => r.checkOutTime);
  
  if (withCheckout.length === 0) return null;
  
  let totalHour = 0;
  withCheckout.forEach(r => {
    const checkoutDate = new Date(r.checkOutTime!);
    totalHour += checkoutDate.getHours() + (checkoutDate.getMinutes() / 60);
  });
  
  return Math.round((totalHour / withCheckout.length) * 10) / 10;
};

/**
 * Get attendance statistics
 */
export const getAttendanceStats = (): {
  totalDays: number;
  totalHours: number;
  averageCheckOut: number | null;
  averageHours: number;
} => {
  const records = getAllAttendance();
  const totalDays = records.length;
  const totalHours = calculateTotalWorkHours();
  const averageCheckOut = calculateAverageCheckOut();
  
  const withHours = records.filter(r => r.totalHours > 0);
  const averageHours = withHours.length > 0
    ? Math.round((withHours.reduce((sum, r) => sum + r.totalHours, 0) / withHours.length) * 10) / 10
    : 0;
  
  return { totalDays, totalHours, averageCheckOut, averageHours };
};

/**
 * Mengambil semua data dari LocalStorage
 * @returns Semua data dalam satu objek
 */
export const getAllData = (): AppData | null => {
  if (typeof window === 'undefined') return null;
  
  return {
    logbook: JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGBOOK) || '[]'),
    documents: JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]'),
    settings: JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || 'null'),
    moods: JSON.parse(localStorage.getItem(STORAGE_KEYS.MOODS) || '[]'),
    attendance: JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]'),
    exportedAt: new Date().toISOString(),
    version: '1.0.0'
  };
};

/**
 * Mengekspor semua data ke file JSON
 * Mengunduh file data-pkl.json
 */
export const exportData = (): boolean => {
  const data = getAllData();
  if (!data) {
    console.error('Cannot export: LocalStorage not available');
    return false;
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `data-pkl-${new Date().toISOString().split('T')[0]}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
  return true;
};

/**
 * Mengimpor data dari file JSON
 * Menimpa semua data di LocalStorage
 * @param file - File JSON yang diupload
 * @returns Berhasil atau tidak
 */
export const importData = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const rawData = e.target?.result as string;
        
        // Validasi JSON dasar
        let data: any;
        try {
          data = JSON.parse(rawData);
        } catch {
          throw new Error('File JSON tidak valid');
        }
        
        // Validasi struktur data必须有 version dan exportedAt
        if (!data || typeof data !== 'object') {
          throw new Error('Format data tidak valid');
        }
        
        if (!data.version || !data.exportedAt) {
          throw new Error('Format file bukan dari MyPKL Notes');
        }
        
        // Import data ke LocalStorage dengan validasi
        if (data.logbook && Array.isArray(data.logbook)) {
          localStorage.setItem(STORAGE_KEYS.LOGBOOK, JSON.stringify(data.logbook));
        }
        if (data.documents && Array.isArray(data.documents)) {
          localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(data.documents));
        }
        if (data.settings && typeof data.settings === 'object') {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
        }
        if (data.moods && Array.isArray(data.moods)) {
          localStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(data.moods));
        }
        
        resolve(true);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsText(file);
  });
};

/**
 * Menyimpan data logbook
 * @param entry - Entri logbook baru
 */
export const saveLogbookEntry = (entry: Omit<LogbookEntry, 'id' | 'createdAt'>): LogbookEntry => {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGBOOK) || '[]') as LogbookEntry[];
  const newEntry: LogbookEntry = {
    ...entry,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  existing.unshift(newEntry);
  localStorage.setItem(STORAGE_KEYS.LOGBOOK, JSON.stringify(existing));
  return newEntry;
};

/**
 * Menghapus entri logbook
 * @param id - ID entri yang akan dihapus
 */
export const deleteLogbookEntry = (id: string): void => {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGBOOK) || '[]') as LogbookEntry[];
  const filtered = existing.filter(entry => entry.id !== id);
  localStorage.setItem(STORAGE_KEYS.LOGBOOK, JSON.stringify(filtered));
};

/**
 * Menyimpan dokumen
 * @param doc - Dokumen baru
 */
export const saveDocument = (doc: Omit<Document, 'id' | 'addedAt'>): Document => {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]') as Document[];
  const newDoc: Document = {
    ...doc,
    id: Date.now().toString(),
    addedAt: new Date().toISOString()
  };
  existing.unshift(newDoc);
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(existing));
  return newDoc;
};

/**
 * Menghapus dokumen
 * @param id - ID dokumen yang akan dihapus
 */
export const deleteDocument = (id: string): void => {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]') as Document[];
  const filtered = existing.filter(doc => doc.id !== id);
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(filtered));
};

/**
 * Menyimpan pengaturan PKL
 * @param settings - Pengaturan PKL
 */
export const saveSettings = (settings: Settings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

/**
 * Mengambil pengaturan PKL
 * @returns Pengaturan PKL
 */
export const getSettings = (): Settings | null => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || 'null');
};

/**
 * Menghitung progress PKL
 * @returns Progress information
 */
export const calculateProgress = (): Progress => {
  const settings = getSettings();
  if (!settings || !settings.startDate || !settings.endDate) {
    return { day: 0, total: 0, percentage: 0, isActive: false, remaining: 0 };
  }
  
  const start = new Date(settings.startDate);
  const end = new Date(settings.endDate);
  const now = new Date();
  
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const currentDay = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const percentage = Math.min(100, Math.max(0, (currentDay / totalDays) * 100));
  
  return {
    day: Math.max(0, Math.min(currentDay, totalDays)),
    total: totalDays,
    percentage: Math.round(percentage),
    isActive: now >= start && now <= end,
    remaining: Math.max(0, totalDays - currentDay)
  };
};

/**
 * Mengecek apakah entri logbook hari ini sudah ada
 * @returns true jika sudah ada entri hari ini
 */
export const hasTodayEntry = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const entries = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGBOOK) || '[]') as LogbookEntry[];
  const today = new Date().toDateString();
  
  return entries.some(entry => 
    entry.createdAt && new Date(entry.createdAt).toDateString() === today
  );
};

/**
 * Mengambil semua foto dari logbook dan dokumen
 * @returns Array URLs foto
 */
export const getAllPhotos = (): { src: string; source: string; date: string }[] => {
  if (typeof window === 'undefined') return [];
  
  const photos: { src: string; source: string; date: string }[] = [];
  
  // Ambil foto dari logbook
  const logbooks = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGBOOK) || '[]') as LogbookEntry[];
  logbooks.forEach((entry: LogbookEntry) => {
    if (entry.image) {
      photos.push({
        src: entry.image,
        source: 'Logbook',
        date: entry.createdAt || ''
      });
    }
  });
  
  // Ambil foto dari dokumen (dari link jika berupa gambar)
  const documents = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '[]') as Document[];
  documents.forEach((doc: Document) => {
    if (doc.link && (doc.link.match(/\.(jpeg|jpg|gif|png|webp)$/i) || doc.link.includes('image'))) {
      photos.push({
        src: doc.link,
        source: 'Documents',
        date: doc.addedAt || ''
      });
    }
  });
  
  return photos;
};

/**
 * Kompres gambar ke format WebP dengan kualitas lebih kecil
 * @param base64Image - Gambar dalam format base64
 * @param quality - Kualitas (0-1), default 0.6
 * @returns Promise dengan gambar yang sudah dikompres
 */
export const compressImage = async (base64Image: string, quality: number = 0.6): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxSize = 800;
      let { width, height } = img;
      
      // Resize jika terlalu besar
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Kompres ke WebP dengan kualitas 0.6
      resolve(canvas.toDataURL('image/webp', quality));
    };
    img.onerror = () => reject(new Error('Gagal memuat gambar'));
    img.src = base64Image;
  });
};

/**
 * Mengecek apakah perlu reminder backup
 * @returns true jika perlu reminder
 */
export const shouldShowBackupReminder = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const entries = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGBOOK) || '[]') as LogbookEntry[];
  const lastReminder = localStorage.getItem('mypkl_lastBackupReminder');
  
  // Jangan tampilkan jika belum ada 20 entri baru
  if (entries.length < 20) return false;
  
  // Jika pernah tampilkan reminder, cek apakah sudah 7 hari
  if (lastReminder) {
    const lastDate = new Date(lastReminder);
    const now = new Date();
    const daysPassed = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysPassed >= 7;
  }
  
  return true;
};

/**
 * Update flag last backup reminder
 */
export const updateLastBackupReminder = (): void => {
  localStorage.setItem('mypkl_lastBackupReminder', new Date().toISOString());
};

export { STORAGE_KEYS };
