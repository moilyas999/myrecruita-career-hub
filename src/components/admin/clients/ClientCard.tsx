import { Building2, MapPin, Award, Phone, Mail, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import type { Client, PSLStatus, ClientStatus } from '@/types/client';

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
}

const PSL_STATUS_COLORS: Record<PSLStatus, string> = {
  target: 'bg-slate-100 text-slate-700',
  applied: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  active: 'bg-primary/10 text-primary',
  lapsed: 'bg-amber-100 text-amber-700',
  declined: 'bg-red-100 text-red-700',
};

const STATUS_COLORS: Record<ClientStatus, string> = {
  active: 'bg-green-100 text-green-700',
  prospect: 'bg-blue-100 text-blue-700',
  inactive: 'bg-slate-100 text-slate-700',
  do_not_contact: 'bg-red-100 text-red-700',
};

export default function ClientCard({ client, onClick }: ClientCardProps) {
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              {client.logo_url ? (
                <img 
                  src={client.logo_url} 
                  alt={client.company_name} 
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <Building2 className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                {client.company_name}
              </h3>
              {client.industry && (
                <p className="text-sm text-muted-foreground truncate">{client.industry}</p>
              )}
            </div>
          </div>
          <Badge variant="secondary" className={PSL_STATUS_COLORS[client.psl_status]}>
            <Award className="h-3 w-3 mr-1" />
            {client.psl_status === 'active' ? 'PSL' : client.psl_status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Location */}
        {(client.city || client.country) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {[client.city, client.country].filter(Boolean).join(', ')}
            </span>
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="font-medium">{client.total_placements}</span>
            <span className="text-muted-foreground">placements</span>
          </div>
          {client.lifetime_revenue > 0 && (
            <span className="text-green-600 font-medium">
              £{(client.lifetime_revenue / 1000).toFixed(0)}k
            </span>
          )}
        </div>

        {/* Contact Info */}
        {client.account_manager && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="truncate">
              Managed by: {client.account_manager.display_name || client.account_manager.email}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Badge variant="secondary" className={STATUS_COLORS[client.status]}>
            {client.status.replace('_', ' ')}
          </Badge>
          {client.last_contact_at && (
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(client.last_contact_at), { addSuffix: true })}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
