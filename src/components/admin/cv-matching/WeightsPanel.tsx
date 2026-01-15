import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  Settings2, 
  Zap, 
  MapPin, 
  Clock, 
  TrendingUp,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WeightSlider } from "./WeightSlider";
import { MatchWeights, DEFAULT_WEIGHTS, WEIGHT_PRESETS } from "./types";

interface WeightsPanelProps {
  weights: MatchWeights;
  onWeightsChange: (weights: MatchWeights) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WeightsPanel({ weights, onWeightsChange, isOpen, onOpenChange }: WeightsPanelProps) {
  const totalWeight = weights.skills + weights.experience + weights.seniority + weights.location;
  const isValid = totalWeight === 100;

  const handleWeightChange = (key: keyof MatchWeights, value: number) => {
    const newWeights = { ...weights, [key]: value };
    onWeightsChange(newWeights);
  };

  const handlePresetClick = (presetKey: string) => {
    const preset = WEIGHT_PRESETS[presetKey];
    if (preset) {
      onWeightsChange(preset.weights);
    }
  };

  const handleReset = () => {
    onWeightsChange(DEFAULT_WEIGHTS);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full text-left hover:bg-muted/50 rounded-lg px-3 py-2 transition-colors border">
        <Settings2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Advanced Matching Weights</span>
        <Badge 
          variant={isValid ? "secondary" : "destructive"} 
          className="ml-auto mr-2 text-xs"
        >
          {totalWeight}%
        </Badge>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      
      <CollapsibleContent className="pt-4 space-y-4">
        {/* Weight Validation */}
        {!isValid && (
          <div className={cn(
            "text-sm px-3 py-2 rounded-lg",
            totalWeight > 100 
              ? "bg-destructive/10 text-destructive" 
              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
          )}>
            {totalWeight > 100 
              ? `⚠️ Total exceeds 100% by ${totalWeight - 100}%` 
              : `⚠️ Need ${100 - totalWeight}% more to reach 100%`}
          </div>
        )}

        {/* Weight Sliders */}
        <div className="space-y-4">
          <WeightSlider
            label="Skills Match"
            value={weights.skills}
            onChange={(v) => handleWeightChange("skills", v)}
            icon={<Zap className="h-4 w-4" />}
            description="How well candidate skills match requirements"
          />
          
          <WeightSlider
            label="Experience"
            value={weights.experience}
            onChange={(v) => handleWeightChange("experience", v)}
            icon={<Clock className="h-4 w-4" />}
            description="Years of relevant experience"
          />
          
          <WeightSlider
            label="Seniority Level"
            value={weights.seniority}
            onChange={(v) => handleWeightChange("seniority", v)}
            icon={<TrendingUp className="h-4 w-4" />}
            description="Career level alignment"
          />
          
          <WeightSlider
            label="Location"
            value={weights.location}
            onChange={(v) => handleWeightChange("location", v)}
            icon={<MapPin className="h-4 w-4" />}
            description="Geographic proximity (0 for remote roles)"
          />
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Quick Presets</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(WEIGHT_PRESETS).map(([key, preset]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handlePresetClick(key)}
                title={preset.description}
              >
                {preset.name}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={handleReset}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
