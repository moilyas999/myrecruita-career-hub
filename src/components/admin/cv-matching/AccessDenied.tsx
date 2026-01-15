import { ShieldX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AccessDeniedProps {
  message?: string;
  requiredPermission?: string;
}

export function AccessDenied({ 
  message = "You don't have permission to access this feature.",
  requiredPermission 
}: AccessDeniedProps) {
  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldX className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-destructive">Access Denied</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      {requiredPermission && (
        <CardContent className="text-center">
          <p className="text-xs text-muted-foreground">
            Required permission: <code className="bg-muted px-1 py-0.5 rounded">{requiredPermission}</code>
          </p>
        </CardContent>
      )}
    </Card>
  );
}
