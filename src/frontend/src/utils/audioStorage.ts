interface AudioMetadata {
  id: string;
  filename: string;
  format: string;
  playlist: string;
  timestamp: number;
}

const DB_NAME = 'FocusGuardAudio';
const DB_VERSION = 1;
const STORE_NAME = 'audioFiles';

let db: IDBDatabase | null = null;

export async function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveAudioFile(file: File, playlist: string): Promise<string> {
  if (!db) await initDB();

  const id = `${playlist}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const metadata: AudioMetadata = {
    id,
    filename: file.name,
    format: file.type,
    playlist,
    timestamp: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const reader = new FileReader();
    reader.onload = () => {
      const data = {
        ...metadata,
        blob: reader.result,
      };

      const request = store.add(data);
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

export async function getAudioFile(id: string): Promise<Blob | null> {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      if (request.result) {
        const blob = new Blob([request.result.blob], { type: request.result.format });
        resolve(blob);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteAudioFile(id: string): Promise<void> {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function listPlaylistFiles(playlist: string): Promise<AudioMetadata[]> {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const files = request.result
        .filter((item: any) => item.playlist === playlist)
        .map((item: any) => ({
          id: item.id,
          filename: item.filename,
          format: item.format,
          playlist: item.playlist,
          timestamp: item.timestamp,
        }));
      resolve(files);
    };
    request.onerror = () => reject(request.error);
  });
}
