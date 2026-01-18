/**
 * Client Profile Header Component
 * Shows company info, PSL badge, status, and quick stats
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Globe, 
  Mail, 
  Edit2, 
  Trash2, 
  Award, 
  TrendingUp, 
  Briefcase,
  Clock,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteClient } from '@/hooks/useClients';
import ClientFormDialog from './ClientFormDialog';
import type { Client, PSLStatus, ClientStatus } from '@/types/client';
import { formatDistanceToNow } from 'date-fns';

interface ClientHeaderProps {
  client: Client;
  canUpdate: boolean;
  canDelete: boolean;
}

const PSL_STATUS_CONFIG: Record<PSLStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  target: { label: 'Target', variant: 'outline' },
  applied: { label: 'Applied', variant: 'secondary' },
  approved: { label: 'Approved', variant: 'secondary' },
  active: { label: 'Active PSL', variant: 'default' },
  lapsed: { label: 'Lapsed', variant: 'outline' },
  declined: { label: 'Declined', variant: 'destructive' },
};

const STATUS_CONFIG: Record<ClientStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-green-500/10 text-green-600 border-green-500/30' },
  prospect: { label: 'Prospect', className: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  inactive: { label: 'Inactive', className: 'bg-muted text-muted-foreground' },
  do_not_contact: { label: 'Do Not Contact', className: 'bg-red-500/10 text-red-600 border-red-500/30' },
};

export default function ClientHeader({ client, canUpdate, canDelete }: ClientHeaderProps) {
  const navigate = useNavigate();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteClient = useDeleteClient();

  const pslConfig = PSL_STATUS_CONFIG[client.psl_status];
  const statusConfig = STATUS_CONFIG[client.status];

  const handleDelete = async () => {
    try {
      await deleteClient.mutateAsync(client.id);
      navigate('/admin?tab=clients');
    } catch (error) {
      // Error handled in mutation
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Company Info */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                {client.logo_url ? (
                  <img src={client.logo_url} alt={client.company_name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Building2 className="w-8 h-8 text-primary" />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold">{client.company_name}</h1>
                  <Badge variant={pslConfig.variant} className="gap-1">
                    <Award className="w-3 h-3" />
                    {pslConfig.label}
                  </Badge>
                  <Badge className={statusConfig.className}>
                    {statusConfig.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  {client.industry && (
                    <span>{client.industry}</span>
                  )}
                  {client.website && (
                    <a
                      href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Globe className="w-3 h-3" />
                      Website
                    </a>
                  )}
                  {client.billing_email && (
                    <a
                      href={`mailto:${client.billing_email}`}
                      className="flex items-center gap-1 hover:text-foreground"
                    >
                      <Mail className="w-3 h-3" />
                      {client.billing_email}
                    </a>
                  )}
                </div>
                {client.account_manager && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Account Manager:</span>
                    <span>{client.account_manager.display_name || client.account_manager.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {(canUpdate || canDelete) && (
              <div className="flex items-center gap-2">
                {canUpdate && (
                  <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                <Briefcase className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Placements</span>
              </div>
              <span className="text-2xl font-bold">{client.total_placements}</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Revenue</span>
              </div>
              <span className="text-2xl font-bold">{formatCurrency(client.lifetime_revenue)}</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Last Contact</span>
              </div>
              <span className="text-lg font-medium">
                {client.last_contact_at 
                  ? formatDistanceToNow(new Date(client.last_contact_at), { addSuffix: true })
                  : 'Never'}
              </span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                <Award className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Last Placement</span>
              </div>
              <span className="text-lg font-medium">
                {client.last_placement_at 
                  ? formatDistanceToNow(new Date(client.last_placement_at), { addSuffix: true })
                  : 'None yet'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <ClientFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        client={client}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {client.company_name}? This action cannot be undone.
              All contacts, terms, and interactions will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
