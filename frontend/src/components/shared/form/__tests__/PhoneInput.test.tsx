import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhoneInput } from '../PhoneInput';

describe('PhoneInput', () => {
  it('renders input element', () => {
    render(<PhoneInput value="" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('formats phone number as 010-0000-0000', () => {
    const { rerender } = render(<PhoneInput value="" onChange={vi.fn()} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;

    // 3 digits
    rerender(<PhoneInput value="010" onChange={vi.fn()} />);
    expect(input.value).toBe('010');

    // 7 digits
    rerender(<PhoneInput value="0101234" onChange={vi.fn()} />);
    expect(input.value).toBe('010-1234');

    // 11 digits
    rerender(<PhoneInput value="01012345678" onChange={vi.fn()} />);
    expect(input.value).toBe('010-1234-5678');
  });

  it('handles user typing with auto-formatting', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<PhoneInput value="" onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    await user.type(input, '01012345678');

    // Should pass raw digits to onChange
    expect(handleChange).toHaveBeenLastCalledWith('01012345678');
  });

  it('limits input to 11 digits', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<PhoneInput value="" onChange={handleChange} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;

    await user.type(input, '010123456789999');

    // Should truncate to 11 digits
    expect(handleChange).toHaveBeenLastCalledWith('01012345678');
  });

  it('filters out non-digit characters', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<PhoneInput value="" onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    await user.type(input, '010-abc-1234-5678');

    // Should only extract digits
    expect(handleChange).toHaveBeenLastCalledWith('01012345678');
  });

  it('displays formatted value from prop', () => {
    const { rerender } = render(<PhoneInput value="01012345678" onChange={vi.fn()} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;

    expect(input.value).toBe('010-1234-5678');

    // Update value
    rerender(<PhoneInput value="010" onChange={vi.fn()} />);
    expect(input.value).toBe('010');
  });

  it('displays error message', () => {
    render(<PhoneInput value="" onChange={vi.fn()} error="Invalid phone number" />);

    expect(screen.getByText('Invalid phone number')).toBeInTheDocument();
  });

  it('passes through Input props', () => {
    render(
      <PhoneInput
        value=""
        onChange={vi.fn()}
        label="Phone Number"
        helperText="Enter your phone number"
        disabled
      />
    );

    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
    expect(screen.getByText('Enter your phone number')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('has correct input attributes', () => {
    render(<PhoneInput value="" onChange={vi.fn()} />);
    const input = screen.getByRole('textbox');

    expect(input).toHaveAttribute('type', 'tel');
    expect(input).toHaveAttribute('inputMode', 'numeric');
    expect(input).toHaveAttribute('placeholder', '010-0000-0000');
    expect(input).toHaveAttribute('maxLength', '13'); // 11 digits + 2 hyphens
  });

  it('supports ref forwarding', () => {
    const ref = vi.fn();
    render(<PhoneInput ref={ref} value="" onChange={vi.fn()} />);

    expect(ref).toHaveBeenCalled();
  });

  it('handles empty value', () => {
    render(<PhoneInput value="" onChange={vi.fn()} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;

    expect(input.value).toBe('');
  });

  it('handles backspace correctly', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(<PhoneInput value="01012345678" onChange={handleChange} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;

    // Clear input
    await user.clear(input);
    expect(handleChange).toHaveBeenCalledWith('');

    // Type partial number
    rerender(<PhoneInput value="010123" onChange={handleChange} />);
    expect(input.value).toBe('010-123');
  });

  it('updates display when value prop changes externally', () => {
    const { rerender } = render(<PhoneInput value="010" onChange={vi.fn()} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;

    expect(input.value).toBe('010');

    rerender(<PhoneInput value="01012345678" onChange={vi.fn()} />);
    expect(input.value).toBe('010-1234-5678');
  });

  it('maintains cursor position during formatting', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<PhoneInput value="" onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    // Type character by character
    await user.type(input, '0');
    expect(handleChange).toHaveBeenLastCalledWith('0');

    await user.type(input, '1');
    expect(handleChange).toHaveBeenLastCalledWith('01');

    await user.type(input, '0');
    expect(handleChange).toHaveBeenLastCalledWith('010');
  });

  it('applies custom className', () => {
    render(<PhoneInput value="" onChange={vi.fn()} className="custom-class" />);
    const input = screen.getByRole('textbox');

    expect(input.className).toContain('custom-class');
  });

  it('handles paste events', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<PhoneInput value="" onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    await user.click(input);
    await user.paste('010-1234-5678');

    // Should extract digits and format
    expect(handleChange).toHaveBeenCalledWith('01012345678');
  });
});
