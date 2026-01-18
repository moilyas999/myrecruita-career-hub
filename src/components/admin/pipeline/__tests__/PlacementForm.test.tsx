import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { PlacementForm } from '../PlacementForm';
import { mockPipelineEntry, createMockPipelineEntry } from '@/test/mocks/pipelineData';

// Mock permissions
const mockHasPermission = vi.fn(() => true);
vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: mockHasPermission,
    isLoading: false,
  }),
}));

// Mock placement hooks
const mockCreatePlacement = vi.fn();
const mockUpdatePlacement = vi.fn();
vi.mock('@/hooks/usePlacement', () => ({
  useCreatePlacement: () => ({
    mutateAsync: mockCreatePlacement,
    isPending: false,
  }),
  useUpdatePlacement: () => ({
    mutateAsync: mockUpdatePlacement,
    isPending: false,
  }),
  usePlacement: () => ({
    data: null,
    isLoading: false,
  }),
}));

// Mock pipeline hook
const mockUpdateStage = vi.fn();
vi.mock('@/hooks/usePipeline', () => ({
  useUpdatePipelineStage: () => ({
    mutateAsync: mockUpdateStage,
    isPending: false,
  }),
}));

// Mock supabase for team member query
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        data: [
          { user_id: 'user-1', display_name: 'John Recruiter' },
          { user_id: 'user-2', display_name: 'Jane Manager' },
        ],
        error: null,
      }),
    }),
  },
}));

describe('PlacementForm', () => {
  const pipelineEntry = createMockPipelineEntry({ stage: 'accepted' });
  
  const defaultProps = {
    pipelineEntry,
    onSuccess: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockHasPermission.mockReturnValue(true);
  });

  it('renders basic placement fields', () => {
    render(<PlacementForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job type/i)).toBeInTheDocument();
  });

  it('shows salary field for permanent positions', async () => {
    render(<PlacementForm {...defaultProps} />);
    
    // Select permanent job type
    const jobTypeSelect = screen.getByLabelText(/job type/i);
    fireEvent.click(jobTypeSelect);
    
    await waitFor(() => {
      const permanentOption = screen.getByText('Permanent');
      fireEvent.click(permanentOption);
    });
    
    expect(screen.getByLabelText(/salary/i)).toBeInTheDocument();
  });

  it('shows day rate field for contract positions', async () => {
    render(<PlacementForm {...defaultProps} />);
    
    // Select contract job type
    const jobTypeSelect = screen.getByLabelText(/job type/i);
    fireEvent.click(jobTypeSelect);
    
    await waitFor(() => {
      const contractOption = screen.getByText('Contract');
      fireEvent.click(contractOption);
    });
    
    expect(screen.getByLabelText(/day rate/i)).toBeInTheDocument();
  });

  it('calculates fee value automatically', async () => {
    render(<PlacementForm {...defaultProps} />);
    
    // Select permanent and enter salary
    const jobTypeSelect = screen.getByLabelText(/job type/i);
    fireEvent.click(jobTypeSelect);
    
    await waitFor(() => {
      const permanentOption = screen.getByText('Permanent');
      fireEvent.click(permanentOption);
    });
    
    const salaryField = screen.getByLabelText(/salary/i);
    fireEvent.change(salaryField, { target: { value: '100000' } });
    
    const feePercentageField = screen.getByLabelText(/fee percentage/i);
    fireEvent.change(feePercentageField, { target: { value: '20' } });
    
    // Fee value should be calculated
    await waitFor(() => {
      const feeValueDisplay = screen.getByText(/£20,000/);
      expect(feeValueDisplay).toBeInTheDocument();
    });
  });

  it('calculates guarantee expiry date', async () => {
    render(<PlacementForm {...defaultProps} />);
    
    // Select a start date
    const startDateButton = screen.getByLabelText(/start date/i);
    fireEvent.click(startDateButton);
    
    // Select today's date (or first available)
    await waitFor(() => {
      const todayButton = screen.getByRole('gridcell', { selected: false });
      fireEvent.click(todayButton);
    });
    
    // Select 90 day guarantee
    const guaranteeSelect = screen.getByLabelText(/guarantee period/i);
    fireEvent.click(guaranteeSelect);
    
    await waitFor(() => {
      const ninetyDays = screen.getByText(/90 days/);
      fireEvent.click(ninetyDays);
    });
    
    // Should show guarantee expiry
    expect(screen.getByText(/guarantee expires/i)).toBeInTheDocument();
  });

  it('validates salary is required for permanent roles', async () => {
    mockCreatePlacement.mockRejectedValueOnce(new Error('Validation failed'));
    
    render(<PlacementForm {...defaultProps} />);
    
    // Select permanent but don't enter salary
    const jobTypeSelect = screen.getByLabelText(/job type/i);
    fireEvent.click(jobTypeSelect);
    
    await waitFor(() => {
      const permanentOption = screen.getByText('Permanent');
      fireEvent.click(permanentOption);
    });
    
    // Fill start date
    const startDateButton = screen.getByLabelText(/start date/i);
    fireEvent.click(startDateButton);
    
    await waitFor(() => {
      const todayButton = screen.getByRole('gridcell', { selected: false });
      fireEvent.click(todayButton);
    });
    
    // Try to submit
    const saveButton = screen.getByRole('button', { name: /save|create/i });
    fireEvent.click(saveButton);
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/salary/i)).toBeInTheDocument();
    });
  });

  it('submits placement and updates stage', async () => {
    mockCreatePlacement.mockResolvedValueOnce({});
    mockUpdateStage.mockResolvedValueOnce({});
    
    render(<PlacementForm {...defaultProps} />);
    
    // Fill required fields
    // Select permanent job type
    const jobTypeSelect = screen.getByLabelText(/job type/i);
    fireEvent.click(jobTypeSelect);
    
    await waitFor(() => {
      const permanentOption = screen.getByText('Permanent');
      fireEvent.click(permanentOption);
    });
    
    // Enter salary
    const salaryField = screen.getByLabelText(/salary/i);
    fireEvent.change(salaryField, { target: { value: '75000' } });
    
    // Fill start date
    const startDateButton = screen.getByLabelText(/start date/i);
    fireEvent.click(startDateButton);
    
    await waitFor(() => {
      const todayButton = screen.getByRole('gridcell', { selected: false });
      fireEvent.click(todayButton);
    });
    
    // Submit
    const saveButton = screen.getByRole('button', { name: /save|create/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockCreatePlacement).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button clicked', () => {
    render(<PlacementForm {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('shows team member dropdowns for ownership', () => {
    render(<PlacementForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/placed by/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sourced by/i)).toBeInTheDocument();
  });

  it('shows split percentage field when split_with is selected', async () => {
    render(<PlacementForm {...defaultProps} />);
    
    // Select a split with team member
    const splitWithSelect = screen.getByLabelText(/split with/i);
    fireEvent.click(splitWithSelect);
    
    await waitFor(() => {
      const teamMember = screen.getByText('John Recruiter');
      fireEvent.click(teamMember);
    });
    
    // Should now show split percentage
    expect(screen.getByLabelText(/split percentage/i)).toBeInTheDocument();
  });

  it('disables form submission when user lacks permission', () => {
    mockHasPermission.mockReturnValue(false);
    
    render(<PlacementForm {...defaultProps} />);
    
    const saveButton = screen.queryByRole('button', { name: /save|create/i });
    expect(saveButton).toBeDisabled();
  });

  it('shows notes field', () => {
    render(<PlacementForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });
});
