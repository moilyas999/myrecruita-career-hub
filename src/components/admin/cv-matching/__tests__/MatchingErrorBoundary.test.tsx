import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import { MatchingErrorBoundary } from '../MatchingErrorBoundary';

// Component that throws an error
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Normal content</div>;
}

describe('MatchingErrorBoundary', () => {
  // Suppress console.error for expected errors
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it('renders children when no error occurs', () => {
    render(
      <MatchingErrorBoundary>
        <div>Test child content</div>
      </MatchingErrorBoundary>
    );
    
    expect(screen.getByText('Test child content')).toBeInTheDocument();
  });

  it('renders error UI when child throws', () => {
    render(
      <MatchingErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </MatchingErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <MatchingErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingComponent shouldThrow={true} />
      </MatchingErrorBoundary>
    );
    
    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });

  it('calls onRetry callback when retry button clicked', () => {
    const onRetry = vi.fn();
    
    render(
      <MatchingErrorBoundary onRetry={onRetry}>
        <ThrowingComponent shouldThrow={true} />
      </MatchingErrorBoundary>
    );
    
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('shows generic message when error has no message', () => {
    // Create a component that throws an error without a message
    function ThrowsEmptyError() {
      throw new Error();
    }
    
    render(
      <MatchingErrorBoundary>
        <ThrowsEmptyError />
      </MatchingErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
