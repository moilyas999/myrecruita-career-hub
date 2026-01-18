import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building2, Users, Award, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useClients } from '@/hooks/useClients';
import { usePermissions } from '@/hooks/usePermissions';
import { AccessDenied } from '@/components/admin/shared';
import type { Client, ClientStatus, PSLStatus, ClientFilters } from '@/types/client';
import ClientCard from './ClientCard';
import ClientFormDialog from './ClientFormDialog';

const STATUS_OPTIONS: { value: ClientStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'do_not_contact', label: 'Do Not Contact' },
];

const PSL_STATUS_OPTIONS: { value: PSLStatus; label: string }[] = [
  { value: 'target', label: 'Target' },
  { value: 'applied', label: 'Applied' },
  { value: 'approved', label: 'Approved' },
  { value: 'active', label: 'Active PSL' },
  { value: 'lapsed', label: 'Lapsed' },
  { value: 'declined', label: 'Declined' },
];

function ClientsManagement() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [filters, setFilters] = useState<ClientFilters>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const canView = hasPermission('clients.view');
  const canCreate = hasPermission('clients.create');

  const { data: clients, isLoading, refetch, isRefetching } = useClients(filters);

  // Calculate summary stats
  const stats = useMemo(() => {
    if (!clients) return { total: 0, active: 0, activePSL: 0, prospects: 0 };
    return {
      total: clients.length,
      active: clients.filter(c => c.status === 'active').length,
      activePSL: clients.filter(c => c.psl_status === 'active').length,
      prospects: clients.filter(c => c.status === 'prospect').length,
    };
  }, [clients]);

  if (!canView) {
    return <AccessDenied message="You don't have permission to view clients." />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '-' : stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{isLoading ? '-' : stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active PSL</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{isLoading ? '-' : stats.activePSL}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prospects</CardTitle>
            <Building2 className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{isLoading ? '-' : stats.prospects}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            className="pl-10"
            value={filters.search || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => setFilters(prev => ({ 
            ...prev, 
            status: value === 'all' ? undefined : value as ClientStatus 
          }))}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.psl_status || 'all'}
          onValueChange={(value) => setFilters(prev => ({ 
            ...prev, 
            psl_status: value === 'all' ? undefined : value as PSLStatus 
          }))}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="PSL Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All PSL</SelectItem>
            {PSL_STATUS_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
        </Button>
        {canCreate && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        )}
      </div>

      {/* Client List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : !clients || clients.length === 0 ? (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No clients found</h3>
            <p className="text-muted-foreground mb-4">
              {Object.keys(filters).length > 0 
                ? 'Try adjusting your filters'
                : 'Get started by adding your first client'}
            </p>
            {canCreate && Object.keys(filters).length === 0 && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={() => navigate(`/admin/client/${client.id}`)}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <ClientFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}

export default ClientsManagement;
