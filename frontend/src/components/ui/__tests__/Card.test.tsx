import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from '../Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <h2>Card Title</h2>
        <p>Card content</p>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    render(<Card data-testid="card">Default Card</Card>);
    const card = screen.getByTestId('card');

    expect(card).toHaveClass('shadow-kkookk-md');
  });

  it('renders with bordered variant', () => {
    render(<Card variant="bordered" data-testid="card">Bordered</Card>);
    const card = screen.getByTestId('card');

    expect(card).toHaveClass('border');
    expect(card).toHaveClass('border-kkookk-steel-100');
  });

  it('renders with elevated variant', () => {
    render(<Card variant="elevated" data-testid="card">Elevated</Card>);
    const card = screen.getByTestId('card');

    expect(card).toHaveClass('shadow-kkookk-lg');
    expect(card).toHaveClass('hover:shadow-kkookk-lg');
    expect(card).toHaveClass('hover:-translate-y-1');
  });

  it('renders with no padding', () => {
    render(<Card padding="none" data-testid="card">No Padding</Card>);
    const card = screen.getByTestId('card');

    expect(card.className).not.toContain('p-');
  });

  it('renders with small padding', () => {
    render(<Card padding="sm" data-testid="card">Small Padding</Card>);
    const card = screen.getByTestId('card');

    expect(card).toHaveClass('p-4');
  });

  it('renders with medium padding by default', () => {
    render(<Card data-testid="card">Medium Padding</Card>);
    const card = screen.getByTestId('card');

    expect(card).toHaveClass('p-6');
  });

  it('renders with large padding', () => {
    render(<Card padding="lg" data-testid="card">Large Padding</Card>);
    const card = screen.getByTestId('card');

    expect(card).toHaveClass('p-8');
  });

  it('applies custom className', () => {
    render(<Card className="custom-class" data-testid="card">Custom</Card>);
    const card = screen.getByTestId('card');

    expect(card).toHaveClass('custom-class');
  });

  it('has bg-white and rounded-2xl classes', () => {
    render(<Card data-testid="card">Styled Card</Card>);
    const card = screen.getByTestId('card');

    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('rounded-2xl');
  });

  it('handles click events when onClick is provided', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Card onClick={handleClick} data-testid="card">
        Clickable Card
      </Card>
    );

    await user.click(screen.getByTestId('card'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports additional HTML attributes', () => {
    render(
      <Card data-testid="card" id="my-card" role="region" aria-label="Content card">
        Content
      </Card>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('id', 'my-card');
    expect(card).toHaveAttribute('role', 'region');
    expect(card).toHaveAttribute('aria-label', 'Content card');
  });

  it('has transition-all class for smooth animations', () => {
    render(<Card data-testid="card">Animated</Card>);
    const card = screen.getByTestId('card');

    expect(card).toHaveClass('transition-all');
  });
});
