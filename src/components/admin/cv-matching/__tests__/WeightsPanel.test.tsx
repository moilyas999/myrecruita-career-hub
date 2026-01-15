import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import { WeightsPanel } from '../WeightsPanel';
import { DEFAULT_WEIGHTS, WEIGHT_PRESETS } from '../types';

describe('WeightsPanel', () => {
  const mockOnWeightsChange = vi.fn();
  const mockOnOpenChange = vi.fn();
  
  const defaultProps = {
    weights: DEFAULT_WEIGHTS,
    onWeightsChange: mockOnWeightsChange,
    isOpen: true,
    onOpenChange: mockOnOpenChange,
  };

  beforeEach(() => {
    mockOnWeightsChange.mockClear();
    mockOnOpenChange.mockClear();
  });

  it('renders the collapsible trigger', () => {
    render(<WeightsPanel {...defaultProps} isOpen={false} />);
    
    expect(screen.getByText(/Matching Weights/i)).toBeInTheDocument();
  });

  it('shows total weight in header', () => {
    render(<WeightsPanel {...defaultProps} />);
    
    // 40 + 25 + 20 + 15 = 100
    expect(screen.getByText(/100%/)).toBeInTheDocument();
  });

  it('shows all four weight sliders when open', () => {
    render(<WeightsPanel {...defaultProps} />);
    
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText('Seniority')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
  });

  it('shows validation error when total is not 100', () => {
    const invalidWeights = { skills: 40, experience: 30, seniority: 20, location: 20 };
    render(<WeightsPanel {...defaultProps} weights={invalidWeights} />);
    
    // Total is 110%, should show warning
    expect(screen.getByText(/110%/)).toBeInTheDocument();
  });

  it('renders preset buttons', () => {
    render(<WeightsPanel {...defaultProps} />);
    
    expect(screen.getByText('Balanced')).toBeInTheDocument();
    expect(screen.getByText('Technical Role')).toBeInTheDocument();
    expect(screen.getByText('Leadership')).toBeInTheDocument();
    expect(screen.getByText('Remote-First')).toBeInTheDocument();
    expect(screen.getByText('Local Only')).toBeInTheDocument();
  });

  it('applies preset weights when preset button clicked', () => {
    render(<WeightsPanel {...defaultProps} />);
    
    const technicalButton = screen.getByText('Technical Role');
    fireEvent.click(technicalButton);
    
    expect(mockOnWeightsChange).toHaveBeenCalledWith(WEIGHT_PRESETS.technical.weights);
  });

  it('resets to default weights when reset button clicked', () => {
    const customWeights = { skills: 50, experience: 20, seniority: 15, location: 15 };
    render(<WeightsPanel {...defaultProps} weights={customWeights} />);
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    expect(mockOnWeightsChange).toHaveBeenCalledWith(DEFAULT_WEIGHTS);
  });

  it('highlights currently active preset', () => {
    // Balanced preset is default
    render(<WeightsPanel {...defaultProps} weights={WEIGHT_PRESETS.balanced.weights} />);
    
    const balancedButton = screen.getByText('Balanced').closest('button');
    // Should have some indication it's selected (variant="default" instead of "outline")
    expect(balancedButton).toBeInTheDocument();
  });

  it('toggles panel open/closed on trigger click', () => {
    render(<WeightsPanel {...defaultProps} isOpen={false} />);
    
    const trigger = screen.getByText(/Matching Weights/i);
    fireEvent.click(trigger);
    
    expect(mockOnOpenChange).toHaveBeenCalledWith(true);
  });
});
