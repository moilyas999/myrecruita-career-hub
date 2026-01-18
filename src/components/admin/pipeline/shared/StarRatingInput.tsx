import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface StarRatingInputProps {
  value: number | null;
  onChange: (value: number) => void;
  label?: string;
  maxStars?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  id?: string;
}

const RATING_LABELS = ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'];

export function StarRatingInput({
  value,
  onChange,
  label,
  maxStars = 5,
  disabled = false,
  size = 'md',
  showLabels = false,
  id,
}: StarRatingInputProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleKeyDown = (e: React.KeyboardEvent, starValue: number) => {
    if (disabled) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(starValue);
    } else if (e.key === 'ArrowRight' && value !== null && value < maxStars) {
      e.preventDefault();
      onChange(value + 1);
    } else if (e.key === 'ArrowLeft' && value !== null && value > 1) {
      e.preventDefault();
      onChange(value - 1);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </Label>
      )}
      <div 
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label={label || 'Star rating'}
      >
        {Array.from({ length: maxStars }, (_, i) => i + 1).map((starValue) => {
          const isFilled = value !== null && starValue <= value;
          
          return (
            <button
              key={starValue}
              type="button"
              id={starValue === 1 ? id : undefined}
              role="radio"
              aria-checked={value === starValue}
              aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
              disabled={disabled}
              onClick={() => onChange(starValue)}
              onKeyDown={(e) => handleKeyDown(e, starValue)}
              className={cn(
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm transition-all',
                disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  'transition-colors',
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-transparent text-muted-foreground hover:text-amber-400'
                )}
              />
            </button>
          );
        })}
        {showLabels && value !== null && (
          <span className="ml-2 text-sm text-muted-foreground">
            {RATING_LABELS[value - 1]}
          </span>
        )}
      </div>
    </div>
  );
}

export default StarRatingInput;
