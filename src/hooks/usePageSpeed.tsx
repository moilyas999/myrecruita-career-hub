import { useEffect, useState } from 'react';

interface PageSpeedMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay  
  cls: number; // Cumulative Layout Shift
}

export const usePageSpeed = () => {
  const [metrics, setMetrics] = useState<Partial<PageSpeedMetrics>>({});
  const [coreWebVitals, setCoreWebVitals] = useState<Partial<CoreWebVitals>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const measurePerformance = () => {
      // Basic performance metrics
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (perfData) {
        setMetrics({
          loadTime: perfData.loadEventEnd - perfData.loadEventStart,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        });
      }

      // Core Web Vitals using Performance Observer (if supported)
      if ('PerformanceObserver' in window) {
        try {
          // Largest Contentful Paint
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            setCoreWebVitals(prev => ({ ...prev, lcp: lastEntry.startTime }));
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

          // First Input Delay
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              setCoreWebVitals(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
            });
          });
          fidObserver.observe({ entryTypes: ['first-input'] });

          // Cumulative Layout Shift
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            setCoreWebVitals(prev => ({ ...prev, cls: clsValue }));
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });

        } catch (error) {
          console.warn('Performance Observer not fully supported:', error);
        }
      }

      setLoading(false);
    };

    // Wait for page to load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  const getPerformanceGrade = (): 'excellent' | 'good' | 'needs-improvement' | 'poor' => {
    const { lcp, fid, cls } = coreWebVitals;
    
    if (!lcp || !fid || cls === undefined) return 'needs-improvement';
    
    // Google's Core Web Vitals thresholds
    const lcpGood = lcp <= 2500;
    const fidGood = fid <= 100;
    const clsGood = cls <= 0.1;
    
    const goodCount = [lcpGood, fidGood, clsGood].filter(Boolean).length;
    
    if (goodCount === 3) return 'excellent';
    if (goodCount === 2) return 'good';
    if (goodCount === 1) return 'needs-improvement';
    return 'poor';
  };

  const getOptimizationSuggestions = (): string[] => {
    const suggestions: string[] = [];
    const { lcp, fid, cls } = coreWebVitals;
    
    if (lcp && lcp > 2500) {
      suggestions.push('Optimize Largest Contentful Paint by compressing images and reducing server response times');
    }
    
    if (fid && fid > 100) {
      suggestions.push('Improve First Input Delay by reducing JavaScript execution time and using code splitting');
    }
    
    if (cls !== undefined && cls > 0.1) {
      suggestions.push('Reduce Cumulative Layout Shift by setting dimensions for images and avoiding dynamic content insertion');
    }
    
    if (metrics.loadTime && metrics.loadTime > 3000) {
      suggestions.push('Page load time is slow - consider lazy loading, image optimization, and CDN usage');
    }
    
    return suggestions;
  };

  return {
    metrics,
    coreWebVitals,
    loading,
    performanceGrade: getPerformanceGrade(),
    optimizationSuggestions: getOptimizationSuggestions(),
  };
};

// Hook for monitoring resource loading
export const useResourceMetrics = () => {
  const [resources, setResources] = useState<{
    images: number;
    scripts: number;
    stylesheets: number;
    fonts: number;
    totalSize: number;
  }>({
    images: 0,
    scripts: 0,
    stylesheets: 0,
    fonts: 0,
    totalSize: 0,
  });

  useEffect(() => {
    const analyzeResources = () => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      let images = 0;
      let scripts = 0;
      let stylesheets = 0;
      let fonts = 0;
      let totalSize = 0;
      
      entries.forEach((entry) => {
        const size = entry.transferSize || entry.encodedBodySize || 0;
        totalSize += size;
        
        if (entry.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          images++;
        } else if (entry.name.match(/\.js$/i) || entry.initiatorType === 'script') {
          scripts++;
        } else if (entry.name.match(/\.css$/i) || entry.initiatorType === 'link') {
          stylesheets++;
        } else if (entry.name.match(/\.(woff|woff2|ttf|otf)$/i)) {
          fonts++;
        }
      });
      
      setResources({ images, scripts, stylesheets, fonts, totalSize });
    };

    // Analyze after page load
    if (document.readyState === 'complete') {
      analyzeResources();
    } else {
      window.addEventListener('load', analyzeResources);
      return () => window.removeEventListener('load', analyzeResources);
    }
  }, []);

  return resources;
};

// Hook for image optimization tracking
export const useImageOptimization = () => {
  const [imageMetrics, setImageMetrics] = useState<{
    totalImages: number;
    optimizedImages: number;
    lazyLoadedImages: number;
    missingAltText: number;
  }>({
    totalImages: 0,
    optimizedImages: 0,
    lazyLoadedImages: 0,
    missingAltText: 0,
  });

  useEffect(() => {
    const analyzeImages = () => {
      const images = document.querySelectorAll('img');
      let optimizedImages = 0;
      let lazyLoadedImages = 0;
      let missingAltText = 0;
      
      images.forEach((img) => {
        // Check if image is optimized (WebP, proper size)
        if (img.src.includes('.webp') || img.hasAttribute('srcset')) {
          optimizedImages++;
        }
        
        // Check if lazy loaded
        if (img.hasAttribute('loading') || img.hasAttribute('data-src')) {
          lazyLoadedImages++;
        }
        
        // Check alt text
        if (!img.alt || img.alt.trim() === '') {
          missingAltText++;
        }
      });
      
      setImageMetrics({
        totalImages: images.length,
        optimizedImages,
        lazyLoadedImages,
        missingAltText,
      });
    };

    // Run analysis after images load
    setTimeout(analyzeImages, 1000);
  }, []);

  return imageMetrics;
};