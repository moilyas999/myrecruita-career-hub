import { vi } from 'vitest';
import type { PipelineEntryWithDetails, PipelineActivity } from '@/types/pipeline';

// Mock CV submission for pipeline
export const mockCVSubmission = {
  id: 'cv-123',
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  phone: '+44 7700 900123',
  job_title: 'Senior Accountant',
  cv_score: 78,
  cv_file_url: 'https://example.com/cv/jane-smith.pdf',
  location: 'Manchester',
  years_experience: 5,
  right_to_work: 'British Citizen',
  requires_sponsorship: false,
  current_salary: '£55,000',
  notice_period: '1 month',
};

export const mockCVSubmissionNoCV = {
  ...mockCVSubmission,
  id: 'cv-456',
  name: 'John Doe',
  email: 'john.doe@example.com',
  cv_file_url: null,
};

// Mock job for pipeline
export const mockJob = {
  id: 'job-123',
  title: 'Financial Controller',
  reference_id: 'FC-2024-001',
  location: 'London',
  sector: 'Accounting & Finance',
};

export const mockJob2 = {
  id: 'job-456',
  title: 'Senior Analyst',
  reference_id: 'SA-2024-002',
  location: 'Birmingham',
  sector: 'Banking',
};

// Mock pipeline entries
export const mockPipelineEntry: PipelineEntryWithDetails = {
  id: 'pipeline-123',
  cv_submission_id: 'cv-123',
  job_id: 'job-123',
  stage: 'qualified',
  notes: 'Great candidate',
  priority: 1,
  assigned_to: null,
  rejection_reason: null,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-16T14:30:00Z',
  stage_entered_at: '2024-01-16T14:30:00Z',
  interview_feedback: null,
  salary_confirmed: null,
  interview_scheduled_at: null,
  offer_details: null,
  stage_requirements_met: null,
  cv_submission: mockCVSubmission,
  job: mockJob,
};

export const mockPipelineEntrySourced: PipelineEntryWithDetails = {
  ...mockPipelineEntry,
  id: 'pipeline-456',
  cv_submission_id: 'cv-456',
  stage: 'sourced',
  priority: 0,
  cv_submission: mockCVSubmissionNoCV,
  job: mockJob2,
};

export const mockPipelineEntryPlaced: PipelineEntryWithDetails = {
  ...mockPipelineEntry,
  id: 'pipeline-789',
  stage: 'placed',
  priority: 2,
};

// Mock activity log
export const mockPipelineActivity: PipelineActivity[] = [
  {
    id: 'activity-1',
    pipeline_id: 'pipeline-123',
    action: 'created',
    from_stage: null,
    to_stage: 'sourced',
    note: null,
    created_by: 'user-123',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'activity-2',
    pipeline_id: 'pipeline-123',
    action: 'stage_change',
    from_stage: 'sourced',
    to_stage: 'screening',
    note: 'Moved to screening after initial review',
    created_by: 'user-123',
    created_at: '2024-01-16T14:30:00Z',
  },
];

// Helper to create mock pipeline entries
export function createMockPipelineEntry(overrides: Partial<PipelineEntryWithDetails> = {}): PipelineEntryWithDetails {
  return {
    ...mockPipelineEntry,
    ...overrides,
  };
}

// Mock pipeline data array
export const mockPipelineData: PipelineEntryWithDetails[] = [
  mockPipelineEntry,
  mockPipelineEntrySourced,
  mockPipelineEntryPlaced,
];

// Mock jobs list for dropdown
export const mockJobsList = [mockJob, mockJob2];

// Search results mock
export const mockSearchResults = [
  mockCVSubmission,
  mockCVSubmissionNoCV,
  {
    id: 'cv-789',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+44 7700 900456',
    job_title: 'Finance Manager',
    cv_score: 85,
    cv_file_url: 'https://example.com/cv/alice.pdf',
    location: 'Leeds',
    sector: 'Banking',
  },
];
