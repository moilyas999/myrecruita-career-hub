import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  Lightbulb, 
  AlertTriangle, 
  HelpCircle, 
  Copy, 
  Check 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MatchInsightsProps {
  strengths: string[];
  fitConcerns: string[];
  interviewQuestions: string[];
}

export function MatchInsights({ strengths, fitConcerns, interviewQuestions }: MatchInsightsProps) {
  const [copiedQuestions, setCopiedQuestions] = useState(false);

  const handleCopyQuestions = () => {
    if (interviewQuestions.length === 0) return;
    
    const text = interviewQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopiedQuestions(true);
    toast.success("Interview questions copied to clipboard");
    setTimeout(() => setCopiedQuestions(false), 2000);
  };

  const hasStrengths = strengths.length > 0;
  const hasConcerns = fitConcerns.length > 0;
  const hasQuestions = interviewQuestions.length > 0;

  if (!hasStrengths && !hasConcerns && !hasQuestions) {
    return null;
  }

  return (
    <div className="space-y-2 pt-2 border-t">
      {/* Strengths */}
      {hasStrengths && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center gap-2 w-full text-left hover:bg-muted/50 rounded px-2 py-1 transition-colors">
            <Lightbulb className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Strengths ({strengths.length})
            </span>
            <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-6 pr-2 py-1">
            <ul className="space-y-1">
              {strengths.map((strength, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Fit Concerns */}
      {hasConcerns && (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 w-full text-left hover:bg-muted/50 rounded px-2 py-1 transition-colors">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Fit Concerns ({fitConcerns.length})
            </span>
            <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-6 pr-2 py-1">
            <ul className="space-y-1">
              {fitConcerns.map((concern, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  {concern}
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Interview Questions */}
      {hasQuestions && (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 w-full text-left hover:bg-muted/50 rounded px-2 py-1 transition-colors">
            <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Interview Questions ({interviewQuestions.length})
            </span>
            <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-6 pr-2 py-1">
            <ul className="space-y-2">
              {interviewQuestions.map((question, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-blue-500 font-medium">{i + 1}.</span>
                  {question}
                </li>
              ))}
            </ul>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs"
              onClick={handleCopyQuestions}
            >
              {copiedQuestions ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy All Questions
                </>
              )}
            </Button>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
