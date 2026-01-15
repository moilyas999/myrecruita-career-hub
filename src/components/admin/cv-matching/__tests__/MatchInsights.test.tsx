import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { MatchInsights } from '../MatchInsights';

describe('MatchInsights', () => {
  const mockWriteText = vi.fn().mockResolvedValue(undefined);
  
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: mockWriteText },
    });
    mockWriteText.mockClear();
  });

  it('renders nothing when all arrays are empty', () => {
    const { container } = render(
      <MatchInsights
        strengths={[]}
        fitConcerns={[]}
        interviewQuestions={[]}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders strengths section when strengths exist', () => {
    render(
      <MatchInsights
        strengths={['10 years experience', 'CPA certified']}
        fitConcerns={[]}
        interviewQuestions={[]}
      />
    );
    
    expect(screen.getByText(/Strengths \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText('10 years experience')).toBeInTheDocument();
    expect(screen.getByText('CPA certified')).toBeInTheDocument();
  });

  it('renders fit concerns section when concerns exist', () => {
    render(
      <MatchInsights
        strengths={[]}
        fitConcerns={['May be overqualified', 'Salary expectations high']}
        interviewQuestions={[]}
      />
    );
    
    expect(screen.getByText(/Fit Concerns \(2\)/i)).toBeInTheDocument();
  });

  it('renders interview questions section when questions exist', () => {
    render(
      <MatchInsights
        strengths={[]}
        fitConcerns={[]}
        interviewQuestions={['Why this role?', 'Career goals?']}
      />
    );
    
    expect(screen.getByText(/Interview Questions \(2\)/i)).toBeInTheDocument();
  });

  it('expands and collapses sections on click', async () => {
    render(
      <MatchInsights
        strengths={['Test strength']}
        fitConcerns={['Test concern']}
        interviewQuestions={['Test question']}
      />
    );
    
    // Fit concerns should be collapsed by default
    const concernsTrigger = screen.getByText(/Fit Concerns/i);
    fireEvent.click(concernsTrigger);
    
    // After click, content should be visible
    await waitFor(() => {
      expect(screen.getByText('Test concern')).toBeVisible();
    });
  });

  it('copies interview questions to clipboard when copy button clicked', async () => {
    render(
      <MatchInsights
        strengths={[]}
        fitConcerns={[]}
        interviewQuestions={['Question 1', 'Question 2']}
      />
    );
    
    // Expand the questions section
    const questionsTrigger = screen.getByText(/Interview Questions/i);
    fireEvent.click(questionsTrigger);
    
    // Click copy button
    const copyButton = screen.getByText(/Copy All Questions/i);
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('1. Question 1\n2. Question 2');
    });
  });

  it('shows copied confirmation after copying', async () => {
    render(
      <MatchInsights
        strengths={[]}
        fitConcerns={[]}
        interviewQuestions={['Question 1']}
      />
    );
    
    const questionsTrigger = screen.getByText(/Interview Questions/i);
    fireEvent.click(questionsTrigger);
    
    const copyButton = screen.getByText(/Copy All Questions/i);
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Copied!/i)).toBeInTheDocument();
    });
  });
});
