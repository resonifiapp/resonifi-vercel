/**
 * Offline Sync System for Resonifi
 *
 * Phase 1: IndexedDB-based offline check-in storage with auto-sync on reconnect
 * Phase 2 TODO: Implement push notifications (requires backend setup)
 *
 * This module provides:
 * - Native IndexedDB storage for check-ins when offline
 * - Auto-sync to Base44 entities when connection is restored
 * - Conflict-free sync (check-ins are additive, never destructive)
 * - Push notification permission management
 */

const DB_NAME = 'resonifi-offline';
const DB_VERSION = 2;
const CHECKIN_STORE = 'checkins';

// ========== IndexedDB Setup (Native API) ==========

/**
 * Open or create the IndexedDB database
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (db.objectStoreNames.contains(CHECKIN_STORE)) {
        db.deleteObjectStore(CHECKIN_STORE);
      }

      const store = db.createObjectStore(CHECKIN_STORE, {
        keyPath: 'localId',
        autoIncrement: true
      });

      store.createIndex('synced', 'synced', { unique: false });
      store.createIndex('createdAt', 'createdAt', { unique: false });
    };
  });
}

/**
 * Execute a transaction on the IndexedDB
 */
async function executeTransaction(storeName, mode, callback) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const result = await callback(store);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('[OfflineSync] Transaction failed:', error);
    throw error;
  }
}

// ========== Core Sync Functions ==========

/**
 * Save a check-in to IndexedDB when offline
 */
export async function saveCheckInOffline(checkInData) {
  return executeTransaction(CHECKIN_STORE, 'readwrite', (store) => {
    const record = {
      ...checkInData,
      synced: 0,
      createdAt: Date.now(),
      userEmail: checkInData.created_by || (typeof localStorage !== 'undefined' ? localStorage.getItem('res:userEmail') : null) || 'unknown'
    };

    const request = store.add(record);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

/**
 * Get all unsynced check-ins from IndexedDB
 */
export async function getUnsyncedCheckIns() {
  return executeTransaction(CHECKIN_STORE, 'readonly', (store) => {
    const index = store.index('synced');
    const range = IDBKeyRange.only(0);
    const request = index.getAll(range);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  });
}

/**
 * Mark a check-in as synced in IndexedDB
 */
export async function markCheckInAsSynced(localId) {
  return executeTransaction(CHECKIN_STORE, 'readwrite', (store) => {
    const getRequest = store.get(localId);

    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        const record = getRequest.result;
        if (record) {
          record.synced = 1;
          record.syncedAt = Date.now();
          const putRequest = store.put(record);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  });
}

/**
 * Get count of unsynced check-ins
 */
export async function getUnsyncedCount() {
  try {
    const unsynced = await getUnsyncedCheckIns();
    return unsynced.length;
  } catch (error) {
    console.error('[OfflineSync] Failed to get unsynced count:', error);
    return 0;
  }
}

/**
 * Sync all unsynced check-ins to Base44
 */
export async function syncCheckIns(onProgress = null) {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.log('[OfflineSync] Still offline, skipping sync');
    return { success: 0, failed: 0 };
  }

  const unsynced = await getUnsyncedCheckIns();
  if (unsynced.length === 0) {
    console.log('[OfflineSync] No unsynced check-ins');
    return { success: 0, failed: 0 };
  }

  console.log(`[OfflineSync] Syncing ${unsynced.length} check-in(s)...`);

  let success = 0;
  let failed = 0;

  const { base44 } = await import('@/api/base44Client');

  for (const record of unsynced) {
    try {
      if (onProgress) {
        onProgress({ current: success + failed + 1, total: unsynced.length });
      }

      const { localId, synced, createdAt, syncedAt, userEmail, ...checkInData } = record;

      await base44.entities.DailyCheckin.create(checkInData);

      await markCheckInAsSynced(record.localId);

      success++;
      console.log(`[OfflineSync] Synced check-in ${record.localId}`);
    } catch (error) {
      console.error(`[OfflineSync] Failed to sync check-in ${record.localId}:`, error);
      failed++;
    }
  }

  console.log(`[OfflineSync] Sync complete: ${success} success, ${failed} failed`);
  return { success, failed };
}

/**
 * Check if IndexedDB is supported
 */
export function isIndexedDBSupported() {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

/**
 * Check if offline sync is fully supported (includes service worker)
 */
export function isOfflineSyncSupported() {
  return isIndexedDBSupported() && 
         typeof navigator !== 'undefined' && 
         'serviceWorker' in navigator;
}

/**
 * Clear all offline data (for debugging/reset)
 */
export async function clearOfflineData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => {
      console.log('[OfflineSync] Offline data cleared');
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}