import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import { WeightSlider } from '../WeightSlider';
import { Briefcase } from 'lucide-react';

describe('WeightSlider', () => {
  const defaultProps = {
    label: 'Skills',
    value: 40,
    onChange: vi.fn(),
    icon: <Briefcase data-testid="icon" />,
  };

  it('renders correctly with all props', () => {
    render(<WeightSlider {...defaultProps} />);
    
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<WeightSlider {...defaultProps} description="Matches technical skills" />);
    
    expect(screen.getByText('Matches technical skills')).toBeInTheDocument();
  });

  it('displays muted style when value is 0', () => {
    render(<WeightSlider {...defaultProps} value={0} />);
    
    const percentText = screen.getByText('0%');
    expect(percentText).toHaveClass('text-muted-foreground');
  });

  it('displays foreground style when value is greater than 0', () => {
    render(<WeightSlider {...defaultProps} value={25} />);
    
    const percentText = screen.getByText('25%');
    expect(percentText).toHaveClass('text-foreground');
  });

  it('has correct accessibility attributes', () => {
    render(<WeightSlider {...defaultProps} />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '60');
    expect(slider).toHaveAttribute('aria-valuenow', '40');
  });

  it('includes description in aria-describedby when provided', () => {
    render(<WeightSlider {...defaultProps} description="Test description" />);
    
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-describedby');
  });

  it('has live region for value updates', () => {
    render(<WeightSlider {...defaultProps} />);
    
    const valueDisplay = screen.getByText('40%');
    expect(valueDisplay).toHaveAttribute('aria-live', 'polite');
    expect(valueDisplay).toHaveAttribute('aria-atomic', 'true');
  });
});
