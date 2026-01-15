import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface WeightSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
  description?: string;
}

export function WeightSlider({ label, value, onChange, icon, description }: WeightSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span 
          className={cn(
            "text-sm font-bold tabular-nums min-w-[3rem] text-right",
            value === 0 ? "text-muted-foreground" : "text-foreground"
          )}
        >
          {value}%
        </span>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={0}
        max={60}
        step={5}
        className="w-full"
        aria-label={`${label} weight`}
      />
    </div>
  );
}
