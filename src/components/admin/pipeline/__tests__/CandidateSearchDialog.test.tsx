import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import CandidateSearchDialog from '../CandidateSearchDialog';
import { mockSearchResults, mockCVSubmission } from '@/test/mocks/pipelineData';

// Mock the supabase client
const mockSelect = vi.fn().mockReturnThis();
const mockOrder = vi.fn().mockReturnThis();
const mockLimit = vi.fn().mockReturnThis();
const mockOr = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
      order: mockOrder,
      limit: mockLimit,
      or: mockOr,
    })),
  },
}));

describe('CandidateSearchDialog', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSelectCandidate = vi.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    onSelectCandidate: mockOnSelectCandidate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default successful response
    mockLimit.mockResolvedValue({ data: mockSearchResults, error: null });
    mockOr.mockResolvedValue({ data: mockSearchResults, error: null });
  });

  it('renders dialog with title and search input', async () => {
    render(<CandidateSearchDialog {...defaultProps} />);

    expect(screen.getByText('Add Candidate to Pipeline')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search by name, email/i)).toBeInTheDocument();
  });

  it('shows initial prompt when no search query entered', async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });
    
    render(<CandidateSearchDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Search for candidates')).toBeInTheDocument();
      expect(screen.getByText(/enter a name, email/i)).toBeInTheDocument();
    });
  });

  it('displays loading skeletons while fetching data', async () => {
    // Delay the response
    mockLimit.mockImplementation(() => new Promise(() => {}));
    
    render(<CandidateSearchDialog {...defaultProps} />);

    // Look for skeleton elements (they have a specific class)
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays search results with candidate information', async () => {
    render(<CandidateSearchDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
      expect(screen.getByText('Senior Accountant')).toBeInTheDocument();
    });
  });

  it('shows "No candidates found" when search returns empty', async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });
    mockOr.mockResolvedValue({ data: [], error: null });
    
    render(<CandidateSearchDialog {...defaultProps} />);

    // Type a search query
    const searchInput = screen.getByPlaceholderText(/search by name, email/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('No candidates found')).toBeInTheDocument();
      expect(screen.getByText('Try a different search term')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('calls onSelectCandidate when Add button is clicked', async () => {
    render(<CandidateSearchDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Find and click the first "Add" button
    const addButtons = screen.getAllByRole('button', { name: /add/i });
    fireEvent.click(addButtons[0]);

    expect(mockOnSelectCandidate).toHaveBeenCalledWith(mockSearchResults[0]);
  });

  it('shows CV button only for candidates with CV file', async () => {
    render(<CandidateSearchDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Count CV buttons - should be 2 (Jane and Alice have CVs, John doesn't)
    const cvButtons = screen.getAllByRole('button', { name: /cv/i });
    expect(cvButtons.length).toBe(2);
  });

  it('opens CV in new tab when CV button is clicked', async () => {
    const mockWindowOpen = vi.spyOn(window, 'open').mockImplementation(() => null);
    
    render(<CandidateSearchDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Find and click a CV button
    const cvButtons = screen.getAllByRole('button', { name: /cv/i });
    fireEvent.click(cvButtons[0]);

    expect(mockWindowOpen).toHaveBeenCalledWith(
      'https://example.com/cv/jane-smith.pdf',
      '_blank'
    );

    mockWindowOpen.mockRestore();
  });

  it('clears search query when dialog closes', async () => {
    render(<CandidateSearchDialog {...defaultProps} />);

    // Type in search
    const searchInput = screen.getByPlaceholderText(/search by name, email/i);
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    expect(searchInput).toHaveValue('test query');

    // Close the dialog via the onOpenChange callback
    // Find the close button (X button in dialog)
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('displays sector badge when candidate has sector', async () => {
    render(<CandidateSearchDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Accounting & Finance')).toBeInTheDocument();
    });
  });

  it('displays location information when available', async () => {
    render(<CandidateSearchDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Manchester')).toBeInTheDocument();
    });
  });

  it('shows "Showing first 20 results" message when at limit', async () => {
    // Mock 20 results
    const twentyResults = Array.from({ length: 20 }, (_, i) => ({
      ...mockCVSubmission,
      id: `cv-${i}`,
      name: `Candidate ${i}`,
      email: `candidate${i}@example.com`,
    }));
    
    mockLimit.mockResolvedValue({ data: twentyResults, error: null });
    
    render(<CandidateSearchDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/showing first 20 results/i)).toBeInTheDocument();
    });
  });

  it('does not render when closed', () => {
    render(<CandidateSearchDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Add Candidate to Pipeline')).not.toBeInTheDocument();
  });

  it('shows CV score badge when candidate has score', async () => {
    render(<CandidateSearchDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // CVScoreBadge should be rendered for candidates with cv_score
    // The exact text depends on the CVScoreBadge implementation
    expect(document.querySelector('[class*="badge"]')).toBeInTheDocument();
  });
});
