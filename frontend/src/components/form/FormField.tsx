import React from 'react';
import { Controller } from 'react-hook-form';
import type { Control, FieldValues, Path, RegisterOptions } from 'react-hook-form';

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  rules?: RegisterOptions<T>;
  render: (props: {
    field: {
      value: any;
      onChange: (...event: any[]) => void;
      onBlur: () => void;
      name: string;
    };
    fieldState: {
      error?: { message?: string };
    };
  }) => React.ReactElement;
}

export function FormField<T extends FieldValues>({
  name,
  control,
  label,
  rules,
  render,
}: FormFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <div className="w-full">
          {label && (
            <label
              htmlFor={name}
              className="block text-sm font-medium text-kkookk-navy mb-2"
            >
              {label}
            </label>
          )}
          {render({ field, fieldState })}
        </div>
      )}
    />
  );
}
