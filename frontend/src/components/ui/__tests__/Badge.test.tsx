import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../badge';

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');

    expect(badge).toHaveClass('bg-kkookk-steel-100');
    expect(badge).toHaveClass('text-kkookk-steel-400');
  });

  it('renders with success variant', () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText('Success');

    expect(badge).toHaveClass('bg-kkookk-green-50');
    expect(badge).toHaveClass('text-kkookk-green-500');
  });

  it('renders with warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText('Warning');

    expect(badge).toHaveClass('bg-kkookk-amber-50');
    expect(badge).toHaveClass('text-kkookk-amber-500');
  });

  it('renders with danger variant', () => {
    render(<Badge variant="danger">Danger</Badge>);
    const badge = screen.getByText('Danger');

    expect(badge).toHaveClass('bg-kkookk-red-50');
    expect(badge).toHaveClass('text-kkookk-red-500');
  });

  it('renders with info variant', () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText('Info');

    expect(badge).toHaveClass('bg-kkookk-indigo-50');
    expect(badge).toHaveClass('text-kkookk-indigo');
  });

  it('renders with small size', () => {
    render(<Badge size="sm">Small</Badge>);
    const badge = screen.getByText('Small');

    expect(badge).toHaveClass('text-xs');
  });

  it('renders with medium size by default', () => {
    render(<Badge>Medium</Badge>);
    const badge = screen.getByText('Medium');

    expect(badge).toHaveClass('text-sm');
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>);
    const badge = screen.getByText('Custom');

    expect(badge).toHaveClass('custom-class');
  });

  it('has rounded-full class', () => {
    render(<Badge>Rounded</Badge>);
    const badge = screen.getByText('Rounded');

    expect(badge).toHaveClass('rounded-full');
  });

  it('is an inline-flex element', () => {
    render(<Badge>Inline</Badge>);
    const badge = screen.getByText('Inline');

    expect(badge).toHaveClass('inline-flex');
  });
});
