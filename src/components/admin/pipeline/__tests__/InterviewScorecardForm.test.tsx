import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { InterviewScorecardForm } from '../InterviewScorecardForm';
import type { PipelineStage } from '@/types/pipeline';

// Mock permissions
const mockHasPermission = vi.fn(() => true);
vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({
    hasPermission: mockHasPermission,
    isLoading: false,
  }),
}));

// Mock scorecard hooks
const mockCreateScorecard = vi.fn();
const mockUpdateScorecard = vi.fn();
vi.mock('@/hooks/useInterviewScorecard', () => ({
  useCreateScorecard: () => ({
    mutateAsync: mockCreateScorecard,
    isPending: false,
  }),
  useUpdateScorecard: () => ({
    mutateAsync: mockUpdateScorecard,
    isPending: false,
  }),
}));

describe('InterviewScorecardForm', () => {
  const defaultProps = {
    pipelineId: 'pipeline-123',
    stage: 'interview_1' as PipelineStage,
    onSuccess: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockHasPermission.mockReturnValue(true);
  });

  it('renders all scoring categories', () => {
    render(<InterviewScorecardForm {...defaultProps} />);
    
    expect(screen.getByText(/technical skills/i)).toBeInTheDocument();
    expect(screen.getByText(/communication/i)).toBeInTheDocument();
    expect(screen.getByText(/cultural fit/i)).toBeInTheDocument();
    expect(screen.getByText(/motivation/i)).toBeInTheDocument();
    expect(screen.getByText(/experience relevance/i)).toBeInTheDocument();
    expect(screen.getByText(/overall impression/i)).toBeInTheDocument();
  });

  it('renders interview details section', () => {
    render(<InterviewScorecardForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/interviewer name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/interviewer role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/interview date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/interview type/i)).toBeInTheDocument();
  });

  it('renders feedback section', () => {
    render(<InterviewScorecardForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/key strengths/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/concerns/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/general notes/i)).toBeInTheDocument();
  });

  it('renders recommendation dropdown', () => {
    render(<InterviewScorecardForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/hiring recommendation/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    mockCreateScorecard.mockResolvedValueOnce({});
    
    render(<InterviewScorecardForm {...defaultProps} />);
    
    // Fill in interviewer name
    const nameField = screen.getByLabelText(/interviewer name/i);
    fireEvent.change(nameField, { target: { value: 'John Manager' } });
    
    // Fill in role
    const roleField = screen.getByLabelText(/interviewer role/i);
    fireEvent.change(roleField, { target: { value: 'Hiring Manager' } });
    
    // Submit form
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockCreateScorecard).toHaveBeenCalledWith(
        expect.objectContaining({
          pipeline_id: 'pipeline-123',
          stage: 'interview_1',
          interviewer_name: 'John Manager',
          interviewer_role: 'Hiring Manager',
        })
      );
    });
  });

  it('calls onSuccess after successful submission', async () => {
    mockCreateScorecard.mockResolvedValueOnce({});
    
    render(<InterviewScorecardForm {...defaultProps} />);
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button clicked', () => {
    render(<InterviewScorecardForm {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('renders in readonly mode correctly', () => {
    render(<InterviewScorecardForm {...defaultProps} readonly />);
    
    const nameField = screen.getByLabelText(/interviewer name/i);
    expect(nameField).toBeDisabled();
    
    // Save button should not be present in readonly mode
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });

  it('handles client feedback checkbox', () => {
    render(<InterviewScorecardForm {...defaultProps} isClientFeedback />);
    
    const checkbox = screen.getByLabelText(/client feedback/i);
    expect(checkbox).toBeChecked();
  });

  it('populates form with existing scorecard data', () => {
    const existingScorecard = {
      id: 'scorecard-123',
      pipeline_id: 'pipeline-123',
      stage: 'interview_1' as PipelineStage,
      interviewer_name: 'Existing Interviewer',
      interviewer_role: 'CEO',
      interview_date: '2024-01-20T10:00:00Z',
      interview_type: 'video' as const,
      technical_skills: 4,
      communication: 5,
      cultural_fit: 4,
      motivation: 5,
      experience_relevance: 3,
      overall_impression: 4,
      strengths: 'Great communication',
      concerns: 'Needs more technical depth',
      notes: 'Overall positive',
      questions_asked: 'Q1, Q2',
      candidate_questions: 'About culture',
      recommendation: 'hire' as const,
      next_steps: 'Second interview',
      is_client_feedback: false,
      created_at: '2024-01-20T10:00:00Z',
      updated_at: '2024-01-20T10:00:00Z',
      created_by: 'user-123',
    };
    
    render(
      <InterviewScorecardForm 
        {...defaultProps} 
        existingScorecard={existingScorecard}
      />
    );
    
    expect(screen.getByDisplayValue('Existing Interviewer')).toBeInTheDocument();
    expect(screen.getByDisplayValue('CEO')).toBeInTheDocument();
  });

  it('calls update mutation for existing scorecard', async () => {
    mockUpdateScorecard.mockResolvedValueOnce({});
    
    const existingScorecard = {
      id: 'scorecard-123',
      pipeline_id: 'pipeline-123',
      stage: 'interview_1' as PipelineStage,
      interviewer_name: 'Existing Interviewer',
      interviewer_role: 'CEO',
      interview_date: '2024-01-20T10:00:00Z',
      interview_type: 'video' as const,
      technical_skills: 4,
      communication: 5,
      cultural_fit: null,
      motivation: null,
      experience_relevance: null,
      overall_impression: null,
      strengths: null,
      concerns: null,
      notes: null,
      questions_asked: null,
      candidate_questions: null,
      recommendation: null,
      next_steps: null,
      is_client_feedback: false,
      created_at: '2024-01-20T10:00:00Z',
      updated_at: '2024-01-20T10:00:00Z',
      created_by: 'user-123',
    };
    
    render(
      <InterviewScorecardForm 
        {...defaultProps} 
        existingScorecard={existingScorecard}
      />
    );
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdateScorecard).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'scorecard-123',
        })
      );
    });
  });

  it('disables form when user lacks permission', () => {
    mockHasPermission.mockReturnValue(false);
    
    render(<InterviewScorecardForm {...defaultProps} />);
    
    // Save button should not be present
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });
});
