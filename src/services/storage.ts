/**
 * Persistenz-Schicht mit IndexedDB und OPFS-Fallback für Offline-Podcast-Speicherung
 */

import { PodcastItem, ExtractedDocument } from '../types/podcast';

const DB_NAME = 'docucast_db';
const DB_VERSION = 2;
const STORE_PODCASTS = 'podcasts';
const STORE_AUDIO = 'audio_blobs';
const STORE_DOCUMENTS = 'documents';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_PODCASTS)) {
        const podcastStore = db.createObjectStore(STORE_PODCASTS, { keyPath: 'id' });
        podcastStore.createIndex('createdAt', 'createdAt', { unique: false });
        podcastStore.createIndex('isFavorite', 'isFavorite', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_AUDIO)) {
        db.createObjectStore(STORE_AUDIO, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_DOCUMENTS)) {
        const docStore = db.createObjectStore(STORE_DOCUMENTS, { keyPath: 'id' });
        docStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// OPFS (Origin Private File System) Helper for high-performance audio storage
async function saveToOPFS(filename: string, blob: Blob): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && 'storage' in navigator && 'getDirectory' in navigator.storage) {
      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    }
  } catch (err) {
    console.warn('OPFS not supported or failed, falling back to IndexedDB:', err);
  }
  return false;
}

async function getFromOPFS(filename: string): Promise<Blob | null> {
  try {
    if (typeof navigator !== 'undefined' && 'storage' in navigator && 'getDirectory' in navigator.storage) {
      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle(filename);
      const file = await fileHandle.getFile();
      return file;
    }
  } catch {
    // File not found or OPFS not available
  }
  return null;
}

// Public API
export async function savePodcast(podcast: PodcastItem): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PODCASTS, 'readwrite');
    const store = tx.objectStore(STORE_PODCASTS);
    const request = store.put(podcast);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllPodcasts(): Promise<PodcastItem[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PODCASTS, 'readonly');
    const store = tx.objectStore(STORE_PODCASTS);
    const index = store.index('createdAt');
    const request = index.getAll();
    request.onsuccess = () => {
      // Sort newest first
      const results = (request.result || []).reverse();
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getPodcastById(id: string): Promise<PodcastItem | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PODCASTS, 'readonly');
    const store = tx.objectStore(STORE_PODCASTS);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function deletePodcast(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_PODCASTS, STORE_AUDIO], 'readwrite');
    tx.objectStore(STORE_PODCASTS).delete(id);
    tx.objectStore(STORE_AUDIO).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function toggleFavoritePodcast(id: string): Promise<boolean> {
  const item = await getPodcastById(id);
  if (!item) return false;
  item.isFavorite = !item.isFavorite;
  await savePodcast(item);
  return item.isFavorite;
}

// Audio storage (OPFS preferred, IndexedDB fallback)
export async function saveAudioBlob(podcastId: string, blob: Blob): Promise<void> {
  const opfsSaved = await saveToOPFS(`podcast_${podcastId}.wav`, blob);
  
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_AUDIO, 'readwrite');
    const store = tx.objectStore(STORE_AUDIO);
    const request = store.put({
      id: podcastId,
      blob: blob,
      opfs: opfsSaved,
      updatedAt: Date.now()
    });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAudioBlob(podcastId: string): Promise<Blob | null> {
  // Check OPFS first
  const opfsBlob = await getFromOPFS(`podcast_${podcastId}.wav`);
  if (opfsBlob) return opfsBlob;

  // Fallback to IndexedDB
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_AUDIO, 'readonly');
    const store = tx.objectStore(STORE_AUDIO);
    const request = store.get(podcastId);
    request.onsuccess = () => {
      if (request.result && request.result.blob) {
        resolve(request.result.blob);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

// Recent documents storage
export async function saveDocument(doc: ExtractedDocument): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DOCUMENTS, 'readwrite');
    const store = tx.objectStore(STORE_DOCUMENTS);
    const request = store.put(doc);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getRecentDocuments(): Promise<ExtractedDocument[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DOCUMENTS, 'readonly');
    const store = tx.objectStore(STORE_DOCUMENTS);
    const request = store.getAll();
    request.onsuccess = () => {
      const docs = (request.result || []).sort((a, b) => b.createdAt - a.createdAt);
      resolve(docs.slice(0, 5)); // Keep last 5
    };
    request.onerror = () => reject(request.error);
  });
}
