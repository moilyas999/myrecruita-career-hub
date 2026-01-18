/**
 * Client Profile Page
 * Full-page view of a client's complete profile with tabs
 * 
 * Permissions:
 * - clients.view: Required to access this page
 * - clients.update: Required to edit client data
 * - clients.delete: Required to delete client
 */
import { useParams, useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useClient } from '@/hooks/useClients';
import { usePermissions } from '@/hooks/usePermissions';
import { AccessDenied } from '@/components/admin/shared';
import ClientHeader from '@/components/admin/clients/ClientHeader';
import ContactsTab from '@/components/admin/clients/ContactsTab';
import TermsTab from '@/components/admin/clients/TermsTab';
import InteractionsTab from '@/components/admin/clients/InteractionsTab';
import JobsTab from '@/components/admin/clients/JobsTab';

export default function ClientProfilePage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  
  // Permission checks
  const canView = hasPermission('clients.view');
  const canUpdate = hasPermission('clients.update');
  const canDelete = hasPermission('clients.delete');
  
  const { data: client, isLoading, error } = useClient(clientId);

  // Loading state for permissions
  if (permissionsLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  // Permission check
  if (!canView) {
    return (
      <div className="p-6">
        <AccessDenied
          message="You don't have permission to view client profiles."
          requiredPermission="clients.view"
          description="Contact your administrator if you need access to this feature."
          redirectUrl="/admin?tab=clients"
          redirectLabel="Back to Clients"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full lg:col-span-2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" aria-hidden="true" />
          <h2 className="text-xl font-semibold mb-2">Client Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The client you're looking for doesn't exist or has been removed.
          </p>
          <Button variant="outline" onClick={() => navigate('/admin?tab=clients')}>
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate(-1)} className="-ml-2">
        <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
        Back to Clients
      </Button>

      {/* Client Header */}
      <ClientHeader client={client} canUpdate={canUpdate} canDelete={canDelete} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="terms">Terms & Fees</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Details */}
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Company Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block">Website</span>
                  {client.website ? (
                    <a 
                      href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {client.website}
                    </a>
                  ) : (
                    <span className="text-muted-foreground/60">Not provided</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block">Industry</span>
                  <span>{client.industry || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Company Size</span>
                  <span className="capitalize">{client.company_size || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Source</span>
                  <span>{client.source || 'Not specified'}</span>
                </div>
              </div>
              {client.address && (
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground block text-sm">Address</span>
                  <span className="text-sm">
                    {[client.address, client.city, client.postcode, client.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Billing Details */}
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Billing Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block">Billing Contact</span>
                  <span>{client.billing_contact_name || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Billing Email</span>
                  {client.billing_email ? (
                    <a href={`mailto:${client.billing_email}`} className="text-primary hover:underline">
                      {client.billing_email}
                    </a>
                  ) : (
                    <span className="text-muted-foreground/60">Not provided</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block">VAT Number</span>
                  <span>{client.vat_number || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {client.notes && (
              <div className="bg-card border rounded-lg p-6 lg:col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Notes
                </h3>
                <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-6">
          <ContactsTab clientId={client.id} canUpdate={canUpdate} />
        </TabsContent>

        {/* Terms Tab */}
        <TabsContent value="terms" className="space-y-6">
          <TermsTab clientId={client.id} canUpdate={canUpdate} />
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-6">
          <JobsTab clientId={client.id} />
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <InteractionsTab clientId={client.id} canUpdate={canUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
