import { ShieldX, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PermissionType } from "@/lib/permissions";

interface AccessDeniedProps {
  /** Custom message to display */
  message?: string;
  /** The permission that was required */
  requiredPermission?: PermissionType;
  /** Optional description with more context */
  description?: string;
  /** URL to redirect to (defaults to /admin) */
  redirectUrl?: string;
  /** Label for the redirect button */
  redirectLabel?: string;
  /** Whether to show the redirect button */
  showRedirect?: boolean;
}

/**
 * Reusable Access Denied component for permission-denied states.
 * Provides consistent UI across the admin panel when users lack required permissions.
 */
export function AccessDenied({ 
  message = "You don't have permission to access this feature.",
  requiredPermission,
  description,
  redirectUrl = "/admin",
  redirectLabel = "Go to Dashboard",
  showRedirect = true,
}: AccessDeniedProps) {
  return (
    <Card className="border-destructive/20 bg-destructive/5 max-w-md mx-auto">
      <CardHeader className="text-center">
        <div 
          className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center"
          role="img"
          aria-label="Access denied icon"
        >
          <ShieldX className="h-6 w-6 text-destructive" aria-hidden="true" />
        </div>
        <CardTitle className="text-destructive">Access Denied</CardTitle>
        <CardDescription className="text-base">{message}</CardDescription>
        {description && (
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        )}
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {requiredPermission && (
          <p className="text-xs text-muted-foreground">
            Required permission: <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{requiredPermission}</code>
          </p>
        )}
        {showRedirect && (
          <Button asChild variant="outline" size="sm">
            <Link to={redirectUrl}>
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              {redirectLabel}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
