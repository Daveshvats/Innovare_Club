/**
 * Cache clearing utilities to force fresh data
 */

// Clear all browser caches
export const clearAllCaches = async () => {
  try {
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Service worker caches cleared');
    }

    // Clear localStorage (optional - be careful with this)
    // localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Force reload to ensure fresh data
    window.location.reload();
  } catch (error) {
    console.error('Failed to clear caches:', error);
  }
};

// Clear only API-related caches
export const clearApiCaches = async () => {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(async (cacheName) => {
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();
          
          // Remove only API-related requests
          const apiRequests = requests.filter(request => 
            request.url.includes('/api/')
          );
          
          await Promise.all(
            apiRequests.map(request => cache.delete(request))
          );
        })
      );
      console.log('API caches cleared');
    }
  } catch (error) {
    console.error('Failed to clear API caches:', error);
  }
};

// Force refresh all React Query data
export const forceRefreshAllData = async (queryClient: any) => {
  try {
    await queryClient.refetchQueries();
    console.log('All React Query data refreshed');
  } catch (error) {
    console.error('Failed to refresh React Query data:', error);
  }
};

// Nuclear option - clear everything and reload
export const nuclearCacheClear = async () => {
  try {
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }

    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();

    // Unregister service worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
    }

    // Force reload
    window.location.reload();
  } catch (error) {
    console.error('Nuclear cache clear failed:', error);
  }
};
