/**
 * Client-side storage utilities for offline functionality
 */

export interface StorageItem<T = any> {
  data: T;
  timestamp: number;
  expiry?: number;
}

export class LocalStorage {
  private prefix = 'shopsmart_';

  /**
   * Store data in localStorage with optional expiry
   */
  set<T>(key: string, data: T, expiryHours?: number): void {
    try {
      const item: StorageItem<T> = {
        data,
        timestamp: Date.now(),
        expiry: expiryHours ? Date.now() + (expiryHours * 60 * 60 * 1000) : undefined,
      };

      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to store data:', error);
    }
  }

  /**
   * Retrieve data from localStorage
   */
  get<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(this.prefix + key);
      if (!itemStr) return null;

      const item: StorageItem<T> = JSON.parse(itemStr);
      
      // Check if item has expired
      if (item.expiry && Date.now() > item.expiry) {
        this.remove(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  }

  /**
   * Remove data from localStorage
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Failed to remove data:', error);
    }
  }

  /**
   * Clear all app data from localStorage
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  /**
   * Get all keys with the app prefix
   */
  getAllKeys(): string[] {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('Failed to get keys:', error);
      return [];
    }
  }

  /**
   * Get storage usage statistics
   */
  getStorageStats(): { used: number; available: number; total: number } {
    try {
      let used = 0;
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          const value = localStorage.getItem(key);
          used += key.length + (value?.length || 0);
        }
      });

      // Estimate total localStorage capacity (typically 5-10MB)
      const total = 5 * 1024 * 1024; // 5MB
      const available = total - used;

      return { used, available, total };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return { used: 0, available: 0, total: 0 };
    }
  }
}

/**
 * Cache manager for API responses
 */
export class CacheManager {
  private storage = new LocalStorage();
  private defaultExpiryHours = 24;

  /**
   * Cache API response
   */
  cacheResponse<T>(endpoint: string, data: T, expiryHours?: number): void {
    const cacheKey = `cache_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
    this.storage.set(cacheKey, data, expiryHours || this.defaultExpiryHours);
  }

  /**
   * Get cached response
   */
  getCachedResponse<T>(endpoint: string): T | null {
    const cacheKey = `cache_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return this.storage.get<T>(cacheKey);
  }

  /**
   * Clear cache for specific endpoint
   */
  clearCache(endpoint: string): void {
    const cacheKey = `cache_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
    this.storage.remove(cacheKey);
  }

  /**
   * Clear all cached responses
   */
  clearAllCache(): void {
    const keys = this.storage.getAllKeys();
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        this.storage.remove(key);
      }
    });
  }
}

/**
 * Offline queue manager for pending operations
 */
export class OfflineQueue {
  private storage = new LocalStorage();
  private queueKey = 'offline_queue';

  interface QueueItem {
    id: string;
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    endpoint: string;
    data?: any;
    method: string;
    timestamp: number;
  }

  /**
   * Add operation to offline queue
   */
  addToQueue(type: QueueItem['type'], endpoint: string, data?: any, method: string = 'POST'): void {
    const queue = this.getQueue();
    const item: QueueItem = {
      id: Date.now().toString(),
      type,
      endpoint,
      data,
      method,
      timestamp: Date.now(),
    };

    queue.push(item);
    this.storage.set(this.queueKey, queue);
  }

  /**
   * Get all queued operations
   */
  getQueue(): QueueItem[] {
    return this.storage.get<QueueItem[]>(this.queueKey) || [];
  }

  /**
   * Remove item from queue
   */
  removeFromQueue(itemId: string): void {
    const queue = this.getQueue();
    const updatedQueue = queue.filter(item => item.id !== itemId);
    this.storage.set(this.queueKey, updatedQueue);
  }

  /**
   * Clear entire queue
   */
  clearQueue(): void {
    this.storage.remove(this.queueKey);
  }

  /**
   * Get queue statistics
   */
  getQueueStats(): { total: number; byType: Record<string, number> } {
    const queue = this.getQueue();
    const byType: Record<string, number> = {};
    
    queue.forEach(item => {
      byType[item.type] = (byType[item.type] || 0) + 1;
    });

    return { total: queue.length, byType };
  }
}

/**
 * Offline data synchronizer
 */
export class OfflineSyncManager {
  private storage = new LocalStorage();
  private cache = new CacheManager();
  private queue = new OfflineQueue();
  private syncInProgress = false;

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Save data for offline access
   */
  saveOfflineData<T>(key: string, data: T): void {
    this.storage.set(`offline_${key}`, data);
  }

  /**
   * Get offline data
   */
  getOfflineData<T>(key: string): T | null {
    return this.storage.get<T>(`offline_${key}`);
  }

  /**
   * Sync pending operations when back online
   */
  async syncPendingOperations(): Promise<void> {
    if (this.syncInProgress || !this.isOnline()) {
      return;
    }

    this.syncInProgress = true;
    const queue = this.queue.getQueue();

    try {
      for (const item of queue) {
        try {
          const response = await fetch(item.endpoint, {
            method: item.method,
            headers: item.data ? { 'Content-Type': 'application/json' } : {},
            body: item.data ? JSON.stringify(item.data) : undefined,
            credentials: 'include',
          });

          if (response.ok) {
            this.queue.removeFromQueue(item.id);
          } else {
            console.error(`Failed to sync ${item.type} operation:`, response.statusText);
          }
        } catch (error) {
          console.error(`Error syncing operation ${item.id}:`, error);
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Initialize sync listeners
   */
  initializeSyncListeners(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('Device is back online, syncing...');
      this.syncPendingOperations();
    });

    window.addEventListener('offline', () => {
      console.log('Device is offline, operations will be queued');
    });

    // Periodic sync when online
    setInterval(() => {
      if (this.isOnline() && this.queue.getQueue().length > 0) {
        this.syncPendingOperations();
      }
    }, 30000); // Sync every 30 seconds
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    isOnline: boolean;
    pendingOperations: number;
    lastSyncAttempt?: Date;
    syncInProgress: boolean;
  } {
    return {
      isOnline: this.isOnline(),
      pendingOperations: this.queue.getQueue().length,
      lastSyncAttempt: this.storage.get<Date>('last_sync_attempt'),
      syncInProgress: this.syncInProgress,
    };
  }
}

// Export singleton instances
export const localStorage = new LocalStorage();
export const cacheManager = new CacheManager();
export const offlineQueue = new OfflineQueue();
export const syncManager = new OfflineSyncManager();

// Initialize sync listeners when module loads
if (typeof window !== 'undefined') {
  syncManager.initializeSyncListeners();
}
