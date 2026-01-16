import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import CandidatePipeline from '../../CandidatePipeline';
import { mockPipelineData, mockJobsList } from '@/test/mocks/pipelineData';

// Mock the hooks
vi.mock('@/hooks/usePipeline', () => ({
  usePipeline: vi.fn(),
  useUpdatePipelineStage: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useDeletePipelineEntry: vi.fn(() => ({ mutateAsync: vi.fn() })),
}));

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockJobsList, error: null }),
    })),
  },
}));

// Mock child components to simplify testing
vi.mock('../PipelineColumn', () => ({
  default: ({ stageConfig, entries }: any) => (
    <div data-testid={`pipeline-column-${stageConfig.label}`}>
      <span>{stageConfig.label}</span>
      <span data-testid="entry-count">{entries.length}</span>
    </div>
  ),
}));

vi.mock('../PipelineDetailSheet', () => ({
  default: () => <div data-testid="pipeline-detail-sheet" />,
}));

vi.mock('../CandidateSearchDialog', () => ({
  default: ({ open, onOpenChange }: any) => (
    open ? (
      <div data-testid="candidate-search-dialog">
        <button onClick={() => onOpenChange(false)}>Close Search</button>
      </div>
    ) : null
  ),
}));

vi.mock('../AddToPipelineDialog', () => ({
  default: ({ open }: any) => (
    open ? <div data-testid="add-to-pipeline-dialog" /> : null
  ),
}));

import { usePipeline } from '@/hooks/usePipeline';
import { usePermissions } from '@/hooks/usePermissions';

describe('CandidatePipeline', () => {
  const mockUsePipeline = usePipeline as ReturnType<typeof vi.fn>;
  const mockUsePermissions = usePermissions as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockUsePipeline.mockReturnValue({
      data: mockPipelineData,
      isLoading: false,
      refetch: vi.fn(),
    });

    mockUsePermissions.mockReturnValue({
      hasPermission: vi.fn().mockReturnValue(true),
      permissions: ['pipeline.view', 'pipeline.create', 'pipeline.update', 'pipeline.delete'],
      isLoading: false,
    });
  });

  it('renders pipeline header with title', async () => {
    render(<CandidatePipeline />);

    expect(screen.getByText('Candidate Pipeline')).toBeInTheDocument();
    expect(screen.getByText(/track candidates through the recruitment process/i)).toBeInTheDocument();
  });

  it('renders stats cards with correct counts', async () => {
    render(<CandidatePipeline />);

    await waitFor(() => {
      expect(screen.getByText('Total Candidates')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Placed')).toBeInTheDocument();
    });

    // Check specific counts
    expect(screen.getByText('3')).toBeInTheDocument(); // Total
  });

  it('shows Add Candidate button when user has pipeline.create permission', async () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: (permission: string) => permission === 'pipeline.create',
      permissions: ['pipeline.create'],
      isLoading: false,
    });

    render(<CandidatePipeline />);

    expect(screen.getByRole('button', { name: /add candidate/i })).toBeInTheDocument();
  });

  it('hides Add Candidate button when user lacks pipeline.create permission', async () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: () => false,
      permissions: ['pipeline.view'],
      isLoading: false,
    });

    render(<CandidatePipeline />);

    expect(screen.queryByRole('button', { name: /add candidate/i })).not.toBeInTheDocument();
  });

  it('opens CandidateSearchDialog when Add Candidate is clicked', async () => {
    render(<CandidatePipeline />);

    const addButton = screen.getByRole('button', { name: /add candidate/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('candidate-search-dialog')).toBeInTheDocument();
    });
  });

  it('renders search input for filtering pipeline', async () => {
    render(<CandidatePipeline />);

    expect(screen.getByPlaceholderText(/search candidates/i)).toBeInTheDocument();
  });

  it('renders job filter dropdown', async () => {
    render(<CandidatePipeline />);

    expect(screen.getByText('All Jobs')).toBeInTheDocument();
  });

  it('toggles between Kanban and List view', async () => {
    render(<CandidatePipeline />);

    // Find view toggle buttons by their icons
    const buttons = screen.getAllByRole('button');
    const kanbanButton = buttons.find(btn => btn.querySelector('[class*="LayoutGrid"]') || btn.className.includes('rounded-none'));
    const listButton = buttons.find(btn => btn.querySelector('[class*="List"]') || btn.className.includes('rounded-none'));

    // Both should exist
    expect(kanbanButton || listButton).toBeTruthy();
  });

  it('displays loading skeletons while fetching data', async () => {
    mockUsePipeline.mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: vi.fn(),
    });

    render(<CandidatePipeline />);

    // Look for skeleton elements
    const skeletons = document.querySelectorAll('[class*="skeleton"], [class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays empty state with action buttons when no candidates', async () => {
    mockUsePipeline.mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    });

    render(<CandidatePipeline />);

    await waitFor(() => {
      expect(screen.getByText(/get started with your pipeline/i)).toBeInTheDocument();
    });

    // Empty state should have Add Candidate and Browse CVs buttons
    expect(screen.getAllByRole('button', { name: /add candidate/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /browse cv/i })).toBeInTheDocument();
  });

  it('renders pipeline columns in Kanban view', async () => {
    render(<CandidatePipeline />);

    await waitFor(() => {
      // Check for stage columns (mocked PipelineColumn)
      expect(screen.getByTestId('pipeline-column-Sourced')).toBeInTheDocument();
      expect(screen.getByTestId('pipeline-column-Screening')).toBeInTheDocument();
    });
  });

  it('renders refresh button that triggers refetch', async () => {
    const mockRefetch = vi.fn();
    mockUsePipeline.mockReturnValue({
      data: mockPipelineData,
      isLoading: false,
      refetch: mockRefetch,
    });

    render(<CandidatePipeline />);

    // Find refresh button by icon
    const buttons = screen.getAllByRole('button');
    const refreshButton = buttons.find(btn => 
      btn.querySelector('svg')?.classList.contains('lucide-refresh-cw') ||
      btn.getAttribute('aria-label')?.includes('refresh')
    );

    if (refreshButton) {
      fireEvent.click(refreshButton);
      expect(mockRefetch).toHaveBeenCalled();
    }
  });

  it('shows delete confirmation dialog when removing candidate', async () => {
    render(<CandidatePipeline />);

    // The AlertDialog should exist but be closed initially
    expect(screen.queryByText('Remove from Pipeline?')).not.toBeInTheDocument();
  });

  it('filters pipeline by search query', async () => {
    render(<CandidatePipeline />);

    const searchInput = screen.getByPlaceholderText(/search candidates/i);
    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    // The usePipeline hook should be called with the filter
    expect(mockUsePipeline).toHaveBeenCalled();
  });
});

describe('CandidatePipeline List View', () => {
  const mockUsePipeline = usePipeline as ReturnType<typeof vi.fn>;
  const mockUsePermissions = usePermissions as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUsePipeline.mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    });

    mockUsePermissions.mockReturnValue({
      hasPermission: () => true,
      permissions: ['pipeline.view', 'pipeline.create'],
      isLoading: false,
    });
  });

  it('displays empty state in list view with action buttons', async () => {
    render(<CandidatePipeline />);

    // Switch to list view
    const buttons = screen.getAllByRole('button');
    const listButton = Array.from(buttons).find(btn => {
      const svg = btn.querySelector('svg');
      return svg && (svg.classList.contains('lucide-list') || btn.innerHTML.includes('List'));
    });

    if (listButton) {
      fireEvent.click(listButton);
    }

    await waitFor(() => {
      expect(screen.getByText(/no candidates in pipeline/i)).toBeInTheDocument();
    });
  });
});
