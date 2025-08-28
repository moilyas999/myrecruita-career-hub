import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top immediately and smoothly
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Instant scroll for page changes
    });
    
    // Also ensure document body scrolls to top for edge cases
    if (document.body) {
      document.body.scrollTop = 0;
    }
    
    // For some browsers, also scroll document element
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;