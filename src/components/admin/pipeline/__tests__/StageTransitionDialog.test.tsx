import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { StageTransitionDialog } from '../StageTransitionDialog';
import { mockPipelineEntry, createMockPipelineEntry } from '@/test/mocks/pipelineData';
import type { PipelineStage } from '@/types/pipeline';

// Mock permissions
const mockHasPermission = vi.fn(() => true);
vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: mockHasPermission,
    isLoading: false,
  }),
}));

// Mock pipeline hook
const mockUpdateStageMutation = vi.fn();
vi.mock('@/hooks/usePipeline', () => ({
  useUpdatePipelineStage: () => ({
    mutateAsync: mockUpdateStageMutation,
    isPending: false,
  }),
}));

// Mock scorecard hook
vi.mock('@/hooks/useInterviewScorecard', () => ({
  useScorecards: () => ({
    data: [],
    isLoading: false,
  }),
}));

describe('StageTransitionDialog', () => {
  const defaultProps = {
    entry: mockPipelineEntry,
    targetStage: 'screening' as PipelineStage,
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockHasPermission.mockReturnValue(true);
  });

  it('renders dialog with correct title for stage transition', () => {
    render(<StageTransitionDialog {...defaultProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Move to Screening/i)).toBeInTheDocument();
  });

  it('shows candidate name and current stage', () => {
    render(<StageTransitionDialog {...defaultProps} />);
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('requires notes field for most transitions', () => {
    render(<StageTransitionDialog {...defaultProps} />);
    
    const notesField = screen.getByLabelText(/notes/i);
    expect(notesField).toBeInTheDocument();
  });

  it('shows rejection reason field when target is rejected', () => {
    render(
      <StageTransitionDialog 
        {...defaultProps} 
        targetStage="rejected"
      />
    );
    
    expect(screen.getByLabelText(/rejection reason/i)).toBeInTheDocument();
  });

  it('shows salary confirmation for offer stage', () => {
    const entryAtFinal = createMockPipelineEntry({ stage: 'final_interview' });
    
    render(
      <StageTransitionDialog 
        {...defaultProps} 
        entry={entryAtFinal}
        targetStage="offer"
      />
    );
    
    // Should have salary field for offer stage
    expect(screen.getByLabelText(/salary/i)).toBeInTheDocument();
  });

  it('shows interview scheduling for interview stages', () => {
    const entryAtSubmitted = createMockPipelineEntry({ stage: 'submitted' });
    
    render(
      <StageTransitionDialog 
        {...defaultProps} 
        entry={entryAtSubmitted}
        targetStage="interview_1"
      />
    );
    
    expect(screen.getByLabelText(/interview date/i)).toBeInTheDocument();
  });

  it('calls onSuccess after successful transition', async () => {
    mockUpdateStageMutation.mockResolvedValueOnce({});
    
    render(<StageTransitionDialog {...defaultProps} />);
    
    // Fill required fields
    const notesField = screen.getByLabelText(/notes/i);
    fireEvent.change(notesField, { target: { value: 'Test notes' } });
    
    // Submit form
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockUpdateStageMutation).toHaveBeenCalled();
      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });
  });

  it('closes dialog when cancel is clicked', () => {
    render(<StageTransitionDialog {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows access denied when user lacks permission', () => {
    mockHasPermission.mockReturnValue(false);
    
    render(<StageTransitionDialog {...defaultProps} />);
    
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });

  it('shows warning for backward stage transitions', () => {
    const entryAtInterview = createMockPipelineEntry({ stage: 'interview_1' });
    
    render(
      <StageTransitionDialog 
        {...defaultProps} 
        entry={entryAtInterview}
        targetStage="qualified"
      />
    );
    
    expect(screen.getByText(/moving backward/i)).toBeInTheDocument();
  });

  it('validates mandatory fields before submission', async () => {
    // Entry at interview_1 going to interview_2 requires scorecard
    const entryAtInterview = createMockPipelineEntry({ stage: 'interview_1' });
    
    render(
      <StageTransitionDialog 
        {...defaultProps} 
        entry={entryAtInterview}
        targetStage="interview_2"
      />
    );
    
    // Try to submit without required fields
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);
    
    // Should show validation error or prevent submission
    await waitFor(() => {
      // The form should not have called the mutation without required fields
      expect(mockUpdateStageMutation).not.toHaveBeenCalled();
    });
  });

  it('handles placed stage by opening PlacementForm', () => {
    const entryAtAccepted = createMockPipelineEntry({ stage: 'accepted' });
    
    render(
      <StageTransitionDialog 
        {...defaultProps} 
        entry={entryAtAccepted}
        targetStage="placed"
      />
    );
    
    // Should show placement information or redirect to PlacementForm
    expect(screen.getByText(/placement/i)).toBeInTheDocument();
  });
});
