// Build version for cache busting and version tracking
// VITE_BUILD_TIMESTAMP is injected at BUILD time via vite.config.ts
// This ensures the version is consistent across all page loads until a new build is deployed
export const BUILD_VERSION = import.meta.env.VITE_BUILD_TIMESTAMP as string || 'dev';

export const BUILD_TIMESTAMP = import.meta.env.VITE_BUILD_TIMESTAMP as string || new Date().toISOString();

// Force a hard refresh clearing all caches
export const forceRefresh = () => {
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear caches if available
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
      });
    });
  }
  
  // Force hard reload bypassing cache
  window.location.reload();
};
