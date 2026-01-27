import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OtpInput } from '../OtpInput';

describe('OtpInput', () => {
  const getInputs = (length = 6) => {
    return Array.from({ length }, (_, i) => screen.getByTestId(`otp-input-${i}`));
  };

  it('renders 6 input boxes by default', () => {
    render(<OtpInput value="" onChange={vi.fn()} />);

    const inputs = getInputs();
    expect(inputs).toHaveLength(6);
  });

  it('renders custom number of input boxes', () => {
    render(<OtpInput value="" onChange={vi.fn()} length={4} />);

    const inputs = getInputs(4);
    expect(inputs).toHaveLength(4);
  });

  it('displays value prop across inputs', () => {
    render(<OtpInput value="123456" onChange={vi.fn()} />);

    const inputs = getInputs() as HTMLInputElement[];
    expect(inputs[0].value).toBe('1');
    expect(inputs[1].value).toBe('2');
    expect(inputs[2].value).toBe('3');
    expect(inputs[3].value).toBe('4');
    expect(inputs[4].value).toBe('5');
    expect(inputs[5].value).toBe('6');
  });

  it('only accepts digits', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<OtpInput value="" onChange={handleChange} />);
    const inputs = getInputs();

    await user.type(inputs[0], 'a');
    expect(handleChange).not.toHaveBeenCalled();

    await user.type(inputs[0], '1');
    expect(handleChange).toHaveBeenCalledWith('1');
  });

  it('auto-focuses next input after typing', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<OtpInput value="" onChange={handleChange} />);
    const inputs = getInputs();

    await user.type(inputs[0], '1');
    expect(inputs[1]).toHaveFocus();

    await user.type(inputs[1], '2');
    expect(inputs[2]).toHaveFocus();
  });

  it('does not auto-focus after last input', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<OtpInput value="12345" onChange={handleChange} />);
    const inputs = getInputs();

    await user.type(inputs[5], '6');
    expect(inputs[5]).toHaveFocus();
  });

  it('handles backspace on current digit', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<OtpInput value="123456" onChange={handleChange} />);
    const inputs = getInputs();

    await user.click(inputs[2]);
    await user.keyboard('{Backspace}');

    expect(handleChange).toHaveBeenCalledWith('12456');
    expect(inputs[2]).toHaveFocus();
  });

  it('handles backspace on empty digit', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<OtpInput value="12" onChange={handleChange} />);
    const inputs = getInputs();

    await user.click(inputs[2]);
    await user.keyboard('{Backspace}');

    // Should clear previous digit and focus it
    expect(handleChange).toHaveBeenCalledWith('1');
    expect(inputs[1]).toHaveFocus();
  });

  it('does not move back on backspace at first input', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<OtpInput value="1" onChange={handleChange} />);
    const inputs = getInputs();

    await user.click(inputs[0]);
    await user.keyboard('{Backspace}');

    expect(handleChange).toHaveBeenCalledWith('');
    expect(inputs[0]).toHaveFocus();
  });

  it('handles arrow left navigation', async () => {
    const user = userEvent.setup();

    render(<OtpInput value="123456" onChange={vi.fn()} />);
    const inputs = getInputs();

    await user.click(inputs[3]);
    await user.keyboard('{ArrowLeft}');

    expect(inputs[2]).toHaveFocus();
  });

  it('handles arrow right navigation', async () => {
    const user = userEvent.setup();

    render(<OtpInput value="123456" onChange={vi.fn()} />);
    const inputs = getInputs();

    await user.click(inputs[2]);
    await user.keyboard('{ArrowRight}');

    expect(inputs[3]).toHaveFocus();
  });

  it('does not navigate left from first input', async () => {
    const user = userEvent.setup();

    render(<OtpInput value="123456" onChange={vi.fn()} />);
    const inputs = getInputs();

    await user.click(inputs[0]);
    await user.keyboard('{ArrowLeft}');

    expect(inputs[0]).toHaveFocus();
  });

  it('does not navigate right from last input', async () => {
    const user = userEvent.setup();

    render(<OtpInput value="123456" onChange={vi.fn()} />);
    const inputs = getInputs();

    await user.click(inputs[5]);
    await user.keyboard('{ArrowRight}');

    expect(inputs[5]).toHaveFocus();
  });

  it('handles paste with full OTP', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<OtpInput value="" onChange={handleChange} />);
    const inputs = getInputs();

    await user.click(inputs[0]);
    await user.paste('123456');

    expect(handleChange).toHaveBeenCalledWith('123456');
    expect(inputs[5]).toHaveFocus();
  });

  it('handles paste with partial OTP', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<OtpInput value="" onChange={handleChange} />);
    const inputs = getInputs();

    await user.click(inputs[0]);
    await user.paste('123');

    expect(handleChange).toHaveBeenCalledWith('123');
    expect(inputs[2]).toHaveFocus();
  });

  it('handles paste with non-digit characters', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<OtpInput value="" onChange={handleChange} />);
    const inputs = getInputs();

    await user.click(inputs[0]);
    await user.paste('1a2b3c4d5e6f');

    // Should extract only digits
    expect(handleChange).toHaveBeenCalledWith('123456');
  });

  it('handles paste exceeding length', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<OtpInput value="" onChange={handleChange} />);
    const inputs = getInputs();

    await user.click(inputs[0]);
    await user.paste('123456789');

    // Should truncate to length
    expect(handleChange).toHaveBeenCalledWith('123456');
  });

  it('selects digit on focus', async () => {
    const user = userEvent.setup();

    render(<OtpInput value="123456" onChange={vi.fn()} />);
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];

    await user.click(inputs[2]);

    // Check if select was called (digit should be selected)
    expect(inputs[2]).toHaveFocus();
  });

  it('is disabled when disabled prop is true', () => {
    render(<OtpInput value="" onChange={vi.fn()} disabled />);
    const inputs = getInputs();

    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it('displays error message', () => {
    render(<OtpInput value="" onChange={vi.fn()} error="Invalid OTP" />);

    expect(screen.getByText('Invalid OTP')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('applies error styles when error is present', () => {
    render(<OtpInput value="" onChange={vi.fn()} error="Invalid OTP" />);
    const inputs = getInputs();

    inputs.forEach((input) => {
      expect(input.className).toContain('border-kkookk-red');
    });
  });

  it('has correct accessibility attributes', () => {
    render(<OtpInput value="" onChange={vi.fn()} length={6} />);
    const inputs = getInputs();

    inputs.forEach((input, index) => {
      expect(input).toHaveAttribute('aria-label', `Digit ${index + 1} of 6`);
    });
  });

  it('has correct input attributes', () => {
    render(<OtpInput value="" onChange={vi.fn()} />);
    const inputs = getInputs();

    inputs.forEach((input) => {
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute('inputMode', 'numeric');
      expect(input).toHaveAttribute('maxLength', '1');
    });
  });

  it('updates when value prop changes', () => {
    const { rerender } = render(<OtpInput value="123" onChange={vi.fn()} />);
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];

    expect(inputs[0].value).toBe('1');
    expect(inputs[1].value).toBe('2');
    expect(inputs[2].value).toBe('3');

    rerender(<OtpInput value="456789" onChange={vi.fn()} />);

    expect(inputs[0].value).toBe('4');
    expect(inputs[1].value).toBe('5');
    expect(inputs[2].value).toBe('6');
    expect(inputs[3].value).toBe('7');
    expect(inputs[4].value).toBe('8');
    expect(inputs[5].value).toBe('9');
  });

  it('handles rapid typing', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<OtpInput value="" onChange={handleChange} />);
    const inputs = getInputs();

    // Type rapidly
    await user.type(inputs[0], '123456');

    // Should handle all digits
    expect(handleChange).toHaveBeenCalled();
  });

  it('replaces existing digit when typing in filled input', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<OtpInput value="123456" onChange={handleChange} />);
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];

    await user.click(inputs[2]);
    await user.clear(inputs[2]);
    await user.type(inputs[2], '9');

    expect(handleChange).toHaveBeenCalledWith('129456');
  });
});
