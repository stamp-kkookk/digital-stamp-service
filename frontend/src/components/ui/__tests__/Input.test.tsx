import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../Input';

describe('Input', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('handles value changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message', () => {
    render(<Input label="Name" error="Name is required" />);

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('displays helper text', () => {
    render(<Input label="Username" helperText="Must be unique" />);

    expect(screen.getByText('Must be unique')).toBeInTheDocument();
  });

  it('prioritizes error over helper text', () => {
    render(<Input label="Field" error="Error message" helperText="Helper text" />);

    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders with left icon', () => {
    const LeftIcon = () => <span data-testid="left-icon">🔍</span>;

    render(<Input leftIcon={<LeftIcon />} />);

    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders with right icon', () => {
    const RightIcon = () => <span data-testid="right-icon">✓</span>;

    render(<Input rightIcon={<RightIcon />} />);

    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    render(<Input data-testid="input-wrapper" />);
    const input = screen.getByRole('textbox');

    expect(input).toHaveClass('bg-white');
  });

  it('renders with filled variant', () => {
    render(<Input variant="filled" />);
    const input = screen.getByRole('textbox');

    expect(input).toHaveClass('bg-kkookk-navy-50');
  });

  it('renders with small size', () => {
    render(<Input inputSize="sm" />);
    const input = screen.getByRole('textbox');

    expect(input).toHaveClass('h-10');
  });

  it('renders with medium size by default', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');

    expect(input).toHaveClass('h-14');
  });

  it('shows character count when showCharCount is true', () => {
    render(<Input value="Hello" maxLength={10} showCharCount />);

    expect(screen.getByText('5/10')).toBeInTheDocument();
  });

  it('updates character count on input change', async () => {
    const user = userEvent.setup();
    const TestComponent = () => {
      const [value, setValue] = React.useState('');

      return (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={10}
          showCharCount
        />
      );
    };

    render(<TestComponent />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    expect(screen.getByText('4/10')).toBeInTheDocument();
  });

  it('respects maxLength attribute', async () => {
    const user = userEvent.setup();

    render(<Input maxLength={5} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, '1234567890');

    expect(input.value.length).toBeLessThanOrEqual(5);
  });

  it('has proper aria attributes when error is present', () => {
    render(<Input label="Email" error="Invalid email" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
  });

  it('has proper aria attributes when helper text is present', () => {
    render(<Input label="Password" helperText="At least 8 characters" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby');
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);
    const input = screen.getByRole('textbox');

    expect(input.className).toContain('custom-class');
  });

  it('supports all standard input types', () => {
    const { rerender } = render(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password');

    rerender(<Input type="number" />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
  });

  it('generates id from label when id is not provided', () => {
    render(<Input label="Email Address" />);

    const input = screen.getByLabelText('Email Address');
    expect(input).toHaveAttribute('id', 'email-address');
  });

  it('uses provided id over generated one', () => {
    render(<Input label="Email" id="custom-id" />);

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('id', 'custom-id');
  });
});
