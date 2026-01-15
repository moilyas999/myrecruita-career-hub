import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { AccessDenied } from '../AccessDenied';

describe('AccessDenied', () => {
  it('renders default message when no props provided', () => {
    render(<AccessDenied />);
    
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText("You don't have permission to access this feature.")).toBeInTheDocument();
  });

  it('renders custom message when provided', () => {
    render(<AccessDenied message="Custom access denied message" />);
    
    expect(screen.getByText('Custom access denied message')).toBeInTheDocument();
  });

  it('renders required permission when provided', () => {
    render(<AccessDenied requiredPermission="matching.view" />);
    
    expect(screen.getByText('Required permission:')).toBeInTheDocument();
    expect(screen.getByText('matching.view')).toBeInTheDocument();
  });

  it('does not render permission section when not provided', () => {
    render(<AccessDenied />);
    
    expect(screen.queryByText('Required permission:')).not.toBeInTheDocument();
  });
});
