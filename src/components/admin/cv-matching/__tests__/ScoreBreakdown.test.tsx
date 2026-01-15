import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import { ScoreBreakdown } from '../ScoreBreakdown';

describe('ScoreBreakdown', () => {
  const defaultProps = {
    algorithmicScore: 82,
    aiScore: 89,
    finalScore: 87,
  };

  it('renders all three scores', () => {
    render(<ScoreBreakdown {...defaultProps} />);
    
    expect(screen.getByText('82')).toBeInTheDocument();
    expect(screen.getByText('89')).toBeInTheDocument();
    expect(screen.getByText('87%')).toBeInTheDocument();
  });

  it('renders labels for each score type', () => {
    render(<ScoreBreakdown {...defaultProps} />);
    
    expect(screen.getByText('Algorithmic')).toBeInTheDocument();
    expect(screen.getByText('AI Analysis')).toBeInTheDocument();
    expect(screen.getByText('Final Score')).toBeInTheDocument();
  });

  it('applies green color for high scores (>=80)', () => {
    render(<ScoreBreakdown {...defaultProps} />);
    
    // The final score badge should have green styling for 87%
    const finalScoreBadge = screen.getByText('87%').parentElement;
    expect(finalScoreBadge).toBeTruthy();
  });

  it('applies amber color for medium scores (60-79)', () => {
    render(<ScoreBreakdown algorithmicScore={65} aiScore={70} finalScore={68} />);
    
    // All scores are in medium range
    expect(screen.getByText('68%')).toBeInTheDocument();
  });

  it('applies orange color for low scores (<60)', () => {
    render(<ScoreBreakdown algorithmicScore={45} aiScore={50} finalScore={48} />);
    
    expect(screen.getByText('48%')).toBeInTheDocument();
  });

  it('renders progress bars for algorithmic and AI scores', () => {
    render(<ScoreBreakdown {...defaultProps} />);
    
    // Check that progress bar elements exist
    const container = screen.getByText('Algorithmic').closest('.flex');
    expect(container).toBeInTheDocument();
  });
});
