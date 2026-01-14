import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        {Icon && (
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-muted">
              <Icon className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
        )}
        {title && (
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        )}
        <p className="text-muted-foreground mb-4">{description}</p>
        {action}
      </CardContent>
    </Card>
  );
}
