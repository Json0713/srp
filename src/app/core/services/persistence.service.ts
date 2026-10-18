import { Injectable } from '@angular/core';
import {
  PersistedCodexV1,
  PersistedProfileV1,
  PersistedSessionV1,
  PersistedSettingsV1
} from '../models/game-data.model';

export const SRP_DB_NAME = 'srp_project_parasite_db';
export const SRP_DB_VERSION = 1;

export type SrpStoreName =
  | 'meta_profile'
  | 'codex_records'
  | 'user_settings'
  | 'active_session';

const BACKUP_KEYS: Record<SrpStoreName, string> = {
  meta_profile: 'srp_idb_v1_meta_profile',
  codex_records: 'srp_idb_v1_codex_records',
  user_settings: 'srp_idb_v1_user_settings',
  active_session: 'srp_idb_v1_active_session'
};

@Injectable({ providedIn: 'root' })
export class PersistenceService {
  private dbPromise: Promise<IDBDatabase | null> | null = null;

  constructor() {
    void this.openDatabase();
  }

  openDatabase(): Promise<IDBDatabase | null> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    if (typeof globalThis === 'undefined' || !('indexedDB' in globalThis) || !globalThis.indexedDB) {
      this.dbPromise = Promise.resolve(null);
      return this.dbPromise;
    }

    this.dbPromise = new Promise<IDBDatabase | null>((resolve) => {
      try {
        const request = globalThis.indexedDB.open(SRP_DB_NAME, SRP_DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const stores: SrpStoreName[] = [
            'meta_profile',
            'codex_records',
            'user_settings',
            'active_session'
          ];

          for (const storeName of stores) {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName, { keyPath: 'id' });
            }
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          resolve(null);
        };

        request.onblocked = () => {
          resolve(null);
        };
      } catch {
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  async getRecord<T extends { id: string }>(
    storeName: SrpStoreName,
    id: string
  ): Promise<T | null> {
    const db = await this.openDatabase();
    if (db) {
      const fromIdb = await new Promise<T | null>((resolve) => {
        try {
          const tx = db.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const req = store.get(id);
          req.onsuccess = () => resolve((req.result as T | undefined) ?? null);
          req.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      });

      if (fromIdb) {
        this.writeMirror(storeName, fromIdb);
        return fromIdb;
      }
    }

    return this.readMirror<T>(storeName);
  }

  async putRecord<T extends { id: string }>(
    storeName: SrpStoreName,
    record: T
  ): Promise<boolean> {
    this.writeMirror(storeName, record);

    const db = await this.openDatabase();
    if (!db) {
      return false;
    }

    return new Promise<boolean>((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.put(record);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }

  readMirrorSync<T>(storeName: SrpStoreName): T | null {
    return this.readMirror<T>(storeName);
  }

  async loadProfile(): Promise<PersistedProfileV1 | null> {
    return this.getRecord<PersistedProfileV1>('meta_profile', 'v1_profile');
  }

  async saveProfile(profile: Omit<PersistedProfileV1, 'id' | 'schemaVersion' | 'updatedAt'>): Promise<boolean> {
    const payload: PersistedProfileV1 = {
      id: 'v1_profile',
      schemaVersion: 1,
      ...profile,
      updatedAt: Date.now()
    };
    return this.putRecord('meta_profile', payload);
  }

  async loadCodex(): Promise<PersistedCodexV1 | null> {
    return this.getRecord<PersistedCodexV1>('codex_records', 'v1_codex');
  }

  async saveCodex(unlockedIds: string[]): Promise<boolean> {
    const payload: PersistedCodexV1 = {
      id: 'v1_codex',
      schemaVersion: 1,
      unlockedIds,
      updatedAt: Date.now()
    };
    return this.putRecord('codex_records', payload);
  }

  async loadSettings(): Promise<PersistedSettingsV1 | null> {
    return this.getRecord<PersistedSettingsV1>('user_settings', 'v1_settings');
  }

  async saveSettings(
    settings: Omit<PersistedSettingsV1, 'id' | 'schemaVersion' | 'updatedAt'>
  ): Promise<boolean> {
    const payload: PersistedSettingsV1 = {
      id: 'v1_settings',
      schemaVersion: 1,
      ...settings,
      updatedAt: Date.now()
    };
    return this.putRecord('user_settings', payload);
  }

  async loadSession(): Promise<PersistedSessionV1 | null> {
    return this.getRecord<PersistedSessionV1>('active_session', 'v1_session');
  }

  async saveSession(
    session: Omit<PersistedSessionV1, 'id' | 'schemaVersion' | 'updatedAt'>
  ): Promise<boolean> {
    const payload: PersistedSessionV1 = {
      id: 'v1_session',
      schemaVersion: 1,
      ...session,
      updatedAt: Date.now()
    };
    return this.putRecord('active_session', payload);
  }

  private readMirror<T>(storeName: SrpStoreName): T | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    try {
      const raw = window.localStorage.getItem(BACKUP_KEYS[storeName]);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  private writeMirror<T>(storeName: SrpStoreName, data: T): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      window.localStorage.setItem(BACKUP_KEYS[storeName], JSON.stringify(data));
    } catch {
      // Ignore storage quota errors
    }
  }
}

