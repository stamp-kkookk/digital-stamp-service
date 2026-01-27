import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { FormField } from '../FormField';
import { Input } from '@/components/ui/input';

// Test wrapper component
interface TestFormData {
  username: string;
  email: string;
  age: number;
}

const TestFormWrapper = ({
  onSubmit,
  defaultValues,
  fieldName = 'username' as keyof TestFormData,
  rules,
}: {
  onSubmit: (data: TestFormData) => void;
  defaultValues?: Partial<TestFormData>;
  fieldName?: keyof TestFormData;
  rules?: any;
}) => {
  const { control, handleSubmit } = useForm<TestFormData>({
    defaultValues: {
      username: '',
      email: '',
      age: 0,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        name={fieldName}
        control={control}
        label={fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
        rules={rules}
        render={({ field, fieldState }) => (
          <Input {...field} error={fieldState.error?.message} />
        )}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

describe('FormField', () => {
  it('renders label correctly', () => {
    render(<TestFormWrapper onSubmit={vi.fn()} />);

    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('renders input field', () => {
    render(<TestFormWrapper onSubmit={vi.fn()} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('handles user input', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<TestFormWrapper onSubmit={handleSubmit} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'testuser');

    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'testuser' }),
        expect.anything()
      );
    });
  });

  it('displays validation error', async () => {
    const user = userEvent.setup();

    render(
      <TestFormWrapper
        onSubmit={vi.fn()}
        rules={{
          required: 'Username is required',
          minLength: { value: 3, message: 'Minimum 3 characters' },
        }}
      />
    );

    const input = screen.getByRole('textbox');

    // Submit without input
    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
    });

    // Type less than minimum
    await user.type(input, 'ab');
    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText('Minimum 3 characters')).toBeInTheDocument();
    });
  });

  it('clears error when input becomes valid', async () => {
    const user = userEvent.setup();

    render(
      <TestFormWrapper
        onSubmit={vi.fn()}
        rules={{
          required: 'Username is required',
        }}
      />
    );

    const input = screen.getByRole('textbox');

    // Submit without input to show error
    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
    });

    // Type to fix error
    await user.type(input, 'testuser');

    await waitFor(() => {
      expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
    });
  });

  it('passes default values to input', () => {
    render(
      <TestFormWrapper
        onSubmit={vi.fn()}
        defaultValues={{ username: 'defaultuser' }}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('defaultuser');
  });

  it('handles pattern validation', async () => {
    const user = userEvent.setup();

    render(
      <TestFormWrapper
        onSubmit={vi.fn()}
        fieldName="email"
        rules={{
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        }}
      />
    );

    const input = screen.getByRole('textbox');

    await user.type(input, 'notanemail');
    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });

    await user.clear(input);
    await user.type(input, 'valid@email.com');

    await waitFor(() => {
      expect(screen.queryByText('Invalid email address')).not.toBeInTheDocument();
    });
  });

  it('renders without label', () => {
    const TestComp = () => {
      const { control, handleSubmit } = useForm<TestFormData>();

      return (
        <form onSubmit={handleSubmit(vi.fn())}>
          <FormField
            name="username"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </form>
      );
    };

    render(<TestComp />);

    // Label should not be present
    expect(screen.queryByText('Username')).not.toBeInTheDocument();
    // Input should still render
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('supports custom render function', () => {
    const TestComp = () => {
      const { control, handleSubmit } = useForm<TestFormData>();

      return (
        <form onSubmit={handleSubmit(vi.fn())}>
          <FormField
            name="username"
            control={control}
            render={({ field }) => (
              <textarea {...field} data-testid="custom-textarea" />
            )}
          />
        </form>
      );
    };

    render(<TestComp />);

    expect(screen.getByTestId('custom-textarea')).toBeInTheDocument();
  });

  it('passes fieldState to render function', async () => {
    const user = userEvent.setup();

    const TestComp = () => {
      const { control, handleSubmit } = useForm<TestFormData>();

      return (
        <form onSubmit={handleSubmit(vi.fn())}>
          <FormField
            name="username"
            control={control}
            rules={{ required: 'Required' }}
            render={({ field, fieldState }) => (
              <div>
                <Input {...field} />
                {fieldState.error && (
                  <span data-testid="custom-error">{fieldState.error.message}</span>
                )}
              </div>
            )}
          />
          <button type="submit">Submit</button>
        </form>
      );
    };

    render(<TestComp />);

    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByTestId('custom-error')).toHaveTextContent('Required');
    });
  });

  it('handles onBlur event', async () => {
    const handleBlur = vi.fn();
    const user = userEvent.setup();

    const TestComp = () => {
      const { control, handleSubmit } = useForm<TestFormData>();

      return (
        <form onSubmit={handleSubmit(vi.fn())}>
          <FormField
            name="username"
            control={control}
            render={({ field }) => <Input {...field} onBlur={handleBlur} />}
          />
        </form>
      );
    };

    render(<TestComp />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.tab();

    expect(handleBlur).toHaveBeenCalled();
  });

  it('displays error with role="alert"', async () => {
    const user = userEvent.setup();

    render(
      <TestFormWrapper
        onSubmit={vi.fn()}
        rules={{ required: 'This field is required' }}
      />
    );

    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('This field is required');
    });
  });

  it('handles min/max validation', async () => {
    const user = userEvent.setup();

    const TestComp = () => {
      const { control, handleSubmit } = useForm<TestFormData>();

      return (
        <form onSubmit={handleSubmit(vi.fn())}>
          <FormField
            name="age"
            control={control}
            rules={{
              min: { value: 18, message: 'Must be at least 18' },
              max: { value: 100, message: 'Must be at most 100' },
            }}
            render={({ field, fieldState }) => (
              <Input {...field} type="number" error={fieldState.error?.message} />
            )}
          />
          <button type="submit">Submit</button>
        </form>
      );
    };

    render(<TestComp />);

    const input = screen.getByRole('spinbutton');

    await user.type(input, '10');
    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText('Must be at least 18')).toBeInTheDocument();
    });

    await user.clear(input);
    await user.type(input, '150');
    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText('Must be at most 100')).toBeInTheDocument();
    });
  });

  it('supports custom validation function', async () => {
    const user = userEvent.setup();

    render(
      <TestFormWrapper
        onSubmit={vi.fn()}
        rules={{
          validate: (value: string) =>
            value.toLowerCase().includes('admin') ? 'Username cannot contain "admin"' : true,
        }}
      />
    );

    const input = screen.getByRole('textbox');

    await user.type(input, 'admin123');
    await user.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText('Username cannot contain "admin"')).toBeInTheDocument();
    });
  });

  it('has correct label-input association', () => {
    const TestComp = () => {
      const { control, handleSubmit } = useForm<TestFormData>();

      return (
        <form onSubmit={handleSubmit(vi.fn())}>
          <FormField
            name="username"
            control={control}
            label="Username"
            render={({ field }) => <Input {...field} label="Username" />}
          />
        </form>
      );
    };

    render(<TestComp />);

    const label = screen.getAllByText('Username')[0]; // First one is from FormField
    const input = screen.getByRole('textbox');

    expect(label).toHaveAttribute('for', 'username');
    expect(input).toHaveAttribute('id', 'username');
  });
});
