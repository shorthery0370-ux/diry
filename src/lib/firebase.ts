import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  Firestore,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { DiaryEntry } from '../types/diary';

// User-provided Firebase Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDPN59Yv-h_btPu3bhxtmjeRdxE5hkWJIs",
  authDomain: "agagag-56118.firebaseapp.com",
  projectId: "agagag-56118",
  storageBucket: "agagag-56118.firebasestorage.app",
  messagingSenderId: "715966508148",
  appId: "1:715966508148:web:bc06cd272869ecde2af521"
};

let app: FirebaseApp;
let db: Firestore | null = null;
let isFirebaseConnected = false;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  isFirebaseConnected = true;

  // Attempt anonymous authentication silently if enabled
  try {
    const auth = getAuth(app);
    signInAnonymously(auth).catch(() => {
      // Anonymous auth might not be enabled in Firebase console, safe to ignore
    });
  } catch {
    // Auth optional
  }
} catch (err) {
  console.warn('[Firebase] Initializing fallback local storage mode:', err);
  db = null;
  isFirebaseConnected = false;
}

const LOCAL_STORAGE_KEY = 'warm_diary_entries_v1';

function getLocalEntries(): DiaryEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalEntries(entries: DiaryEntry[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

/**
 * Save diary entry to Firebase Firestore with localStorage fallback
 */
export async function saveDiaryEntry(entry: Omit<DiaryEntry, 'id' | 'createdAt'> & { id?: string }): Promise<DiaryEntry> {
  const newEntry: DiaryEntry = {
    ...entry,
    id: entry.id || `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now(),
  };

  // Always update local cache first for instant responsiveness
  const locals = getLocalEntries();
  const updatedLocals = [newEntry, ...locals.filter(e => e.id !== newEntry.id)];
  saveLocalEntries(updatedLocals);

  // Sync to Firestore if available
  if (db) {
    try {
      const colRef = collection(db, 'diaries');
      const docRef = await addDoc(colRef, {
        title: entry.title || '',
        content: entry.content,
        emotion: entry.emotion,
        date: entry.date,
        aiResponse: entry.aiResponse || null,
        favorite: !!entry.favorite,
        createdAt: serverTimestamp(),
      });
      // Update with firestore generated ID
      newEntry.id = docRef.id;
      const reUpdated = updatedLocals.map(e => e.createdAt === newEntry.createdAt ? newEntry : e);
      saveLocalEntries(reUpdated);
    } catch (err) {
      console.warn('[Firebase Firestore] Cloud sync skipped/failed, preserved in local storage:', err);
    }
  }

  return newEntry;
}

/**
 * Fetch all diary entries from Firestore or localStorage
 */
export async function fetchDiaryEntries(): Promise<DiaryEntry[]> {
  const localEntries = getLocalEntries();

  if (!db) {
    return localEntries;
  }

  try {
    const colRef = collection(db, 'diaries');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const remoteEntries: DiaryEntry[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        let createdAt = Date.now();
        if (data.createdAt?.toMillis) {
          createdAt = data.createdAt.toMillis();
        } else if (typeof data.createdAt === 'number') {
          createdAt = data.createdAt;
        }

        return {
          id: docSnap.id,
          title: data.title || '',
          content: data.content || '',
          emotion: data.emotion || '기쁨',
          date: data.date || new Date().toISOString().split('T')[0],
          createdAt,
          aiResponse: data.aiResponse || undefined,
          favorite: !!data.favorite,
        };
      });

      // Merge remote with any un-synced local
      const remoteIds = new Set(remoteEntries.map(r => r.id));
      const unsyncedLocal = localEntries.filter(l => !remoteIds.has(l.id) && l.id.startsWith('local_'));
      const combined = [...remoteEntries, ...unsyncedLocal];
      combined.sort((a, b) => b.createdAt - a.createdAt);
      saveLocalEntries(combined);
      return combined;
    }
  } catch (err) {
    console.warn('[Firebase Firestore] Failed to fetch remote diaries, using local entries:', err);
  }

  return localEntries;
}

/**
 * Delete a diary entry
 */
export async function deleteDiaryEntry(id: string): Promise<void> {
  const locals = getLocalEntries().filter(e => e.id !== id);
  saveLocalEntries(locals);

  if (db && !id.startsWith('local_')) {
    try {
      const docRef = doc(db, 'diaries', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('[Firebase Firestore] Error deleting document:', err);
    }
  }
}

/**
 * Toggle favorite on a diary entry
 */
export async function toggleFavoriteEntry(id: string, currentFav: boolean): Promise<void> {
  const locals = getLocalEntries().map(e => e.id === id ? { ...e, favorite: !currentFav } : e);
  saveLocalEntries(locals);

  if (db && !id.startsWith('local_')) {
    try {
      const docRef = doc(db, 'diaries', id);
      await updateDoc(docRef, { favorite: !currentFav });
    } catch (err) {
      console.warn('[Firebase Firestore] Error updating favorite:', err);
    }
  }
}

export { db, isFirebaseConnected };
