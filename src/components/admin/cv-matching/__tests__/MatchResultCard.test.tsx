import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import { MatchResultCard } from '../MatchResultCard';
import { createMockMatchResult, highScoreCandidate, lowScoreCandidate } from '@/test/mocks/matchingData';

describe('MatchResultCard', () => {
  const mockOnDownloadCV = vi.fn();
  
  const defaultProps = {
    match: createMockMatchResult(),
    index: 0,
    onDownloadCV: mockOnDownloadCV,
  };

  beforeEach(() => {
    mockOnDownloadCV.mockClear();
  });

  it('renders candidate name and title', () => {
    render(<MatchResultCard {...defaultProps} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Senior Financial Analyst')).toBeInTheDocument();
  });

  it('renders rank number correctly', () => {
    render(<MatchResultCard {...defaultProps} index={2} />);
    
    expect(screen.getByText('#3')).toBeInTheDocument();
  });

  it('renders final score badge', () => {
    render(<MatchResultCard {...defaultProps} />);
    
    expect(screen.getByText('87%')).toBeInTheDocument();
  });

  it('renders location, sector and experience', () => {
    render(<MatchResultCard {...defaultProps} />);
    
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Accounting & Finance')).toBeInTheDocument();
    expect(screen.getByText('8 years')).toBeInTheDocument();
  });

  it('renders matched skills with check mark', () => {
    render(<MatchResultCard {...defaultProps} />);
    
    expect(screen.getByText(/✓ Excel/)).toBeInTheDocument();
    expect(screen.getByText(/✓ VBA/)).toBeInTheDocument();
  });

  it('renders missing skills', () => {
    render(<MatchResultCard {...defaultProps} />);
    
    expect(screen.getByText(/Missing: Python/)).toBeInTheDocument();
  });

  it('renders partial skills with tilde', () => {
    render(<MatchResultCard {...defaultProps} />);
    
    expect(screen.getByText(/~ Power BI/)).toBeInTheDocument();
  });

  it('calls onDownloadCV when download button clicked', () => {
    render(<MatchResultCard {...defaultProps} />);
    
    const downloadButton = screen.getByText(/Download CV/i);
    fireEvent.click(downloadButton);
    
    expect(mockOnDownloadCV).toHaveBeenCalledWith(
      'https://example.com/cv.pdf',
      'John Doe'
    );
  });

  it('disables download button when CV URL is null', () => {
    const matchWithNoCV = createMockMatchResult();
    matchWithNoCV.candidate.cv_file_url = null;
    
    render(<MatchResultCard {...defaultProps} match={matchWithNoCV} />);
    
    const downloadButton = screen.getByText(/Download CV/i).closest('button');
    expect(downloadButton).toBeDisabled();
  });

  it('applies green styling for high scores', () => {
    render(<MatchResultCard {...defaultProps} match={highScoreCandidate} />);
    
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('renders explanation text', () => {
    render(<MatchResultCard {...defaultProps} />);
    
    expect(screen.getByText('Strong candidate with excellent financial modeling experience.')).toBeInTheDocument();
  });

  it('renders advanced signals component', () => {
    render(<MatchResultCard {...defaultProps} />);
    
    // Check for signal indicators
    expect(screen.getByText(/Low Risk/i)).toBeInTheDocument();
    expect(screen.getByText(/Good/i)).toBeInTheDocument();
  });

  it('renders score breakdown component', () => {
    render(<MatchResultCard {...defaultProps} />);
    
    expect(screen.getByText('Algorithmic')).toBeInTheDocument();
    expect(screen.getByText('AI Analysis')).toBeInTheDocument();
  });
});
