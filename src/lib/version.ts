// Build version for cache busting and version tracking
// This timestamp updates on each build/reload
export const BUILD_VERSION = import.meta.env.DEV 
  ? `dev-${Date.now()}` 
  : `v${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')}`;

export const BUILD_TIMESTAMP = new Date().toISOString();

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
