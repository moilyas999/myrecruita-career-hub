import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  AlertTriangle, 
  Check, 
  Info, 
  TrendingUp, 
  DollarSign, 
  Target 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdvancedSignalsProps {
  overqualificationRisk: string;
  careerTrajectoryFit: string;
  salaryExpectationFit: string;
}

export function AdvancedSignals({ 
  overqualificationRisk, 
  careerTrajectoryFit, 
  salaryExpectationFit 
}: AdvancedSignalsProps) {
  const getOverqualificationDisplay = (risk: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      none: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: <Check className="h-3 w-3" />, label: "No Risk" },
      low: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: <Info className="h-3 w-3" />, label: "Low Risk" },
      medium: { color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", icon: <AlertTriangle className="h-3 w-3" />, label: "Medium" },
      high: { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: <AlertCircle className="h-3 w-3" />, label: "High Risk" },
    };
    return config[risk] || config.low;
  };

  const getCareerFitDisplay = (fit: string) => {
    const config: Record<string, { color: string; label: string }> = {
      excellent: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", label: "Excellent" },
      good: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", label: "Good" },
      moderate: { color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", label: "Moderate" },
      poor: { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", label: "Poor" },
    };
    return config[fit] || config.moderate;
  };

  const getSalaryFitDisplay = (fit: string) => {
    const config: Record<string, { color: string; label: string }> = {
      within: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", label: "Within Range" },
      below: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", label: "Below Range" },
      above: { color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", label: "Above Range" },
      unknown: { color: "bg-muted text-muted-foreground", label: "Unknown" },
    };
    return config[fit] || config.unknown;
  };

  const overqual = getOverqualificationDisplay(overqualificationRisk);
  const career = getCareerFitDisplay(careerTrajectoryFit);
  const salary = getSalaryFitDisplay(salaryExpectationFit);

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      <Badge variant="outline" className={cn("gap-1 text-xs", overqual.color)}>
        <Target className="h-3 w-3" />
        Overqual: {overqual.label}
      </Badge>
      
      <Badge variant="outline" className={cn("gap-1 text-xs", career.color)}>
        <TrendingUp className="h-3 w-3" />
        Career: {career.label}
      </Badge>
      
      <Badge variant="outline" className={cn("gap-1 text-xs", salary.color)}>
        <DollarSign className="h-3 w-3" />
        Salary: {salary.label}
      </Badge>
    </div>
  );
}
