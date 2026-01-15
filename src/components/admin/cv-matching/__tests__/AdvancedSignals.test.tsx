import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { AdvancedSignals } from '../AdvancedSignals';

describe('AdvancedSignals', () => {
  it('renders all signal badges', () => {
    render(
      <AdvancedSignals
        overqualificationRisk="low"
        careerTrajectoryFit="good"
        salaryExpectationFit="within"
      />
    );
    
    expect(screen.getByText(/Low Risk/i)).toBeInTheDocument();
    expect(screen.getByText(/Good/i)).toBeInTheDocument();
    expect(screen.getByText(/Within Range/i)).toBeInTheDocument();
  });

  it('displays correct indicator for no overqualification risk', () => {
    render(
      <AdvancedSignals
        overqualificationRisk="none"
        careerTrajectoryFit="excellent"
        salaryExpectationFit="within"
      />
    );
    
    expect(screen.getByText(/No Risk/i)).toBeInTheDocument();
  });

  it('displays warning for high overqualification risk', () => {
    render(
      <AdvancedSignals
        overqualificationRisk="high"
        careerTrajectoryFit="moderate"
        salaryExpectationFit="above"
      />
    );
    
    expect(screen.getByText(/High Risk/i)).toBeInTheDocument();
  });

  it('displays correct career trajectory fit levels', () => {
    const { rerender } = render(
      <AdvancedSignals
        overqualificationRisk="none"
        careerTrajectoryFit="excellent"
        salaryExpectationFit="within"
      />
    );
    
    expect(screen.getByText(/Excellent/i)).toBeInTheDocument();
    
    rerender(
      <AdvancedSignals
        overqualificationRisk="none"
        careerTrajectoryFit="poor"
        salaryExpectationFit="within"
      />
    );
    
    expect(screen.getByText(/Poor/i)).toBeInTheDocument();
  });

  it('displays correct salary fit levels', () => {
    const { rerender } = render(
      <AdvancedSignals
        overqualificationRisk="none"
        careerTrajectoryFit="good"
        salaryExpectationFit="below"
      />
    );
    
    expect(screen.getByText(/Below Range/i)).toBeInTheDocument();
    
    rerender(
      <AdvancedSignals
        overqualificationRisk="none"
        careerTrajectoryFit="good"
        salaryExpectationFit="unknown"
      />
    );
    
    expect(screen.getByText(/Unknown/i)).toBeInTheDocument();
  });
});
