
import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { syncCheckIns, getUnsyncedCount, isIndexedDBSupported } from './lib/offlineSync';
import { trackChallengeProgress, awardChallengeBadge } from "./lib/challengeTracker";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';

/**
 * OfflineCheckInManager
 * 
 * Monitors connection status and automatically syncs offline check-ins
 * when the device comes back online.
 */
export default function OfflineCheckInManager() {
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [syncStatus, setSyncStatus] = useState(null); // { success, failed }

  // Check for unsynced data on mount and when coming online
  useEffect(() => {
    if (!isIndexedDBSupported()) {
      console.log('[OfflineManager] IndexedDB not supported');
      return;
    }

    checkUnsyncedData();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      handleAutoSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const checkUnsyncedData = async () => {
    if (!isIndexedDBSupported()) return;

    try {
      const count = await getUnsyncedCount();
      setUnsyncedCount(count);
    } catch (error) {
      console.error('[OfflineManager] Failed to check unsynced count:', error);
    }
  };

  const handleAutoSync = async () => {
    if (!isIndexedDBSupported()) return;
    if (isSyncing) return;

    try {
      setIsSyncing(true);
      setSyncStatus(null);

      const result = await syncCheckIns((progress) => {
        console.log(`[OfflineManager] Syncing: ${progress.current}/${progress.total}`);
      });

      setSyncStatus(result);
      
      if (result.success > 0) {
        // Dispatch event for other components to refresh
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('offline-sync-complete', { detail: result }));
        }

        // Track challenge progress after successful sync
        const challengeResult = trackChallengeProgress(result.success); // Assuming trackChallengeProgress might take the number of successful syncs
        
        // Award badge if challenge just completed
        if (challengeResult.justCompleted) {
          try {
            // NOTE: 'base44' is assumed to be globally available or imported elsewhere
            // in the project context based on the provided outline.
            // If not, it needs to be provided through context, props, or another import.
            await awardChallengeBadge((data) => base44.entities.UserBadge.create(data)); 
            
            // Dispatch event to show completion modal
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('res:challenge-completed'));
            }
          } catch (badgeError) {
            console.error('[Challenge] Badge creation failed:', badgeError);
          }
        }
      }

      await checkUnsyncedData();
    } catch (error) {
      console.error('[OfflineManager] Sync failed:', error);
    } finally {
      setIsSyncing(false);
      
      // Clear status after 5 seconds
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  const handleManualSync = () => {
    handleAutoSync();
  };

  // Don't render if no unsynced data and not currently syncing
  if (unsyncedCount === 0 && !isSyncing && !syncStatus) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:w-80 z-50 animate-in slide-in-from-bottom duration-300">
      <Card className="bg-[#1A2035] border-slate-700/50 shadow-2xl">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Cloud className="w-5 h-5 text-green-400" />
              ) : (
                <CloudOff className="w-5 h-5 text-orange-400" />
              )}
              <span className="font-semibold text-white">
                {isSyncing ? 'Syncing...' : isOnline ? 'Back Online' : 'Offline Mode'}
              </span>
            </div>
            {isSyncing && (
              <RefreshCw className="w-4 h-4 text-[#2DD4BF] animate-spin" />
            )}
          </div>

          {unsyncedCount > 0 && !isSyncing && (
            <div className="text-sm text-gray-300">
              <p className="mb-2">
                {unsyncedCount} check-in{unsyncedCount > 1 ? 's' : ''} saved offline
              </p>
              {isOnline && (
                <Button
                  onClick={handleManualSync}
                  size="sm"
                  className="w-full bg-[#2DD4BF] hover:bg-[#0D9488] text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Now
                </Button>
              )}
              {!isOnline && (
                <p className="text-xs text-gray-400">
                  Will sync automatically when you're back online
                </p>
              )}
            </div>
          )}

          {isSyncing && (
            <div className="text-sm text-gray-300">
              <p>Syncing your offline check-ins...</p>
            </div>
          )}

          {syncStatus && (
            <div className={`text-sm p-2 rounded ${
              syncStatus.failed === 0 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-orange-500/20 text-orange-300'
            }`}>
              {syncStatus.success > 0 && (
                <p>✓ Synced {syncStatus.success} check-in{syncStatus.success > 1 ? 's' : ''}</p>
              )}
              {syncStatus.failed > 0 && (
                <p>⚠ {syncStatus.failed} failed to sync</p>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
