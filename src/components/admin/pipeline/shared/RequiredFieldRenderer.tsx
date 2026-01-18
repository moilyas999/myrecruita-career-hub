import { Controller, Control } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { RequiredField } from '@/types/pipeline';

interface RequiredFieldRendererProps {
  field: RequiredField;
  control: Control<Record<string, unknown>>;
  errors: Record<string, { message?: string }>;
  disabled?: boolean;
}

export function RequiredFieldRenderer({
  field,
  control,
  errors,
  disabled = false,
}: RequiredFieldRendererProps) {
  const error = errors[field.field];
  const fieldId = `field-${field.field}`;

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Controller
            name={field.field}
            control={control}
            rules={{ required: field.required ? `${field.label} is required` : false }}
            render={({ field: formField }) => (
              <Input
                id={fieldId}
                placeholder={field.placeholder}
                disabled={disabled}
                {...formField}
                value={(formField.value as string) || ''}
                aria-invalid={!!error}
                aria-describedby={error ? `${fieldId}-error` : field.helpText ? `${fieldId}-help` : undefined}
                className={cn(error && 'border-destructive')}
              />
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={field.field}
            control={control}
            rules={{ required: field.required ? `${field.label} is required` : false }}
            render={({ field: formField }) => (
              <Textarea
                id={fieldId}
                placeholder={field.placeholder}
                disabled={disabled}
                rows={4}
                {...formField}
                value={(formField.value as string) || ''}
                aria-invalid={!!error}
                aria-describedby={error ? `${fieldId}-error` : field.helpText ? `${fieldId}-help` : undefined}
                className={cn(error && 'border-destructive')}
              />
            )}
          />
        );

      case 'number':
        return (
          <Controller
            name={field.field}
            control={control}
            rules={{ 
              required: field.required ? `${field.label} is required` : false,
              min: { value: 0, message: `${field.label} must be positive` },
            }}
            render={({ field: formField }) => (
              <Input
                id={fieldId}
                type="number"
                placeholder={field.placeholder}
                disabled={disabled}
                {...formField}
                value={(formField.value as number) ?? ''}
                onChange={(e) => formField.onChange(e.target.value ? Number(e.target.value) : null)}
                aria-invalid={!!error}
                aria-describedby={error ? `${fieldId}-error` : field.helpText ? `${fieldId}-help` : undefined}
                className={cn(error && 'border-destructive')}
              />
            )}
          />
        );

      case 'date':
        return (
          <Controller
            name={field.field}
            control={control}
            rules={{ required: field.required ? `${field.label} is required` : false }}
            render={({ field: formField }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id={fieldId}
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formField.value && 'text-muted-foreground',
                      error && 'border-destructive'
                    )}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${fieldId}-error` : field.helpText ? `${fieldId}-help` : undefined}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formField.value 
                      ? format(new Date(formField.value as string), 'PPP')
                      : 'Pick a date'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formField.value ? new Date(formField.value as string) : undefined}
                    onSelect={(date) => formField.onChange(date ? format(date, 'yyyy-MM-dd') : null)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            )}
          />
        );

      case 'datetime':
        return (
          <Controller
            name={field.field}
            control={control}
            rules={{ required: field.required ? `${field.label} is required` : false }}
            render={({ field: formField }) => (
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={disabled}
                      className={cn(
                        'flex-1 justify-start text-left font-normal',
                        !formField.value && 'text-muted-foreground',
                        error && 'border-destructive'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formField.value 
                        ? format(new Date(formField.value as string), 'PPP')
                        : 'Pick a date'
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formField.value ? new Date(formField.value as string) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          // Preserve existing time or default to current time
                          const existing = formField.value ? new Date(formField.value as string) : new Date();
                          date.setHours(existing.getHours(), existing.getMinutes());
                          formField.onChange(date.toISOString());
                        }
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  disabled={disabled}
                  value={formField.value ? format(new Date(formField.value as string), 'HH:mm') : ''}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    const date = formField.value ? new Date(formField.value as string) : new Date();
                    date.setHours(hours, minutes);
                    formField.onChange(date.toISOString());
                  }}
                  className={cn('w-28', error && 'border-destructive')}
                  aria-label="Time"
                />
              </div>
            )}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.field}
            control={control}
            rules={{ required: field.required ? `${field.label} is required` : false }}
            render={({ field: formField }) => (
              <Select
                value={(formField.value as string) || ''}
                onValueChange={formField.onChange}
                disabled={disabled}
              >
                <SelectTrigger
                  id={fieldId}
                  className={cn(error && 'border-destructive')}
                  aria-invalid={!!error}
                  aria-describedby={error ? `${fieldId}-error` : field.helpText ? `${fieldId}-help` : undefined}
                >
                  <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        );

      case 'checkbox':
        return (
          <Controller
            name={field.field}
            control={control}
            rules={{ 
              required: field.required 
                ? { value: true, message: `${field.label} must be confirmed` } 
                : false 
            }}
            render={({ field: formField }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={fieldId}
                  checked={!!formField.value}
                  onCheckedChange={formField.onChange}
                  disabled={disabled}
                  aria-invalid={!!error}
                  aria-describedby={error ? `${fieldId}-error` : field.helpText ? `${fieldId}-help` : undefined}
                />
                <label
                  htmlFor={fieldId}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {field.label}
                </label>
              </div>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {field.type !== 'checkbox' && (
        <Label htmlFor={fieldId} className="flex items-center gap-1">
          {field.label}
          {field.required && <span className="text-destructive">*</span>}
        </Label>
      )}
      {renderField()}
      {field.helpText && !error && (
        <p id={`${fieldId}-help`} className="text-sm text-muted-foreground">
          {field.helpText}
        </p>
      )}
      {error?.message && (
        <p id={`${fieldId}-error`} className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

export default RequiredFieldRenderer;
