// Dynamically load Progressier script and manifest
// Only call this for authenticated admin users

let isLoaded = false;
let isLoading = false;

const PROGRESSIER_ID = '6mHt7BQftT5AUXWAoID5';

export async function loadProgressier(): Promise<boolean> {
  if (isLoaded) return true;
  if (isLoading) return false;
  
  // Check if already loaded by some other means
  if (typeof window !== 'undefined' && window.progressier) {
    isLoaded = true;
    return true;
  }
  
  isLoading = true;
  
  try {
    // Add manifest link
    const existingManifest = document.querySelector('link[rel="manifest"]');
    if (!existingManifest) {
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = `https://progressier.app/${PROGRESSIER_ID}/progressier.json`;
      document.head.appendChild(manifestLink);
    }
    
    // Load script dynamically
    await new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector(`script[src*="progressier.app/${PROGRESSIER_ID}"]`);
      if (existingScript) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://progressier.app/${PROGRESSIER_ID}/script.js`;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Progressier'));
      document.head.appendChild(script);
    });
    
    // Wait for Progressier to initialize
    await new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        if (window.progressier) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 5000);
    });
    
    isLoaded = true;
    console.log('[Progressier] Successfully loaded for admin user');
    return true;
  } catch (error) {
    console.error('[Progressier] Load error:', error);
    isLoading = false;
    return false;
  }
}

export function isProgressierLoaded(): boolean {
  return isLoaded && typeof window !== 'undefined' && !!window.progressier;
}

export function isProgressierAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.progressier;
}
