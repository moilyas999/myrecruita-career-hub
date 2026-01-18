/**
 * Candidate Profile Page
 * Full-page view of a candidate's complete profile
 * 
 * Permissions:
 * - cv.view: Required to access this page
 * - cv.update: Required to edit candidate data
 * - cv.delete: Required to anonymise or delete
 */
import { useParams, useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useCandidateProfile } from '@/hooks/useCandidateProfile';
import { usePermissions } from '@/hooks/usePermissions';
import { calculateGDPRStatus } from '@/types/candidate';
import ProfileHeader from '@/components/admin/candidate/ProfileHeader';
import WorkAuthorizationCard from '@/components/admin/candidate/WorkAuthorizationCard';
import CompensationCard from '@/components/admin/candidate/CompensationCard';
import QualificationsCard from '@/components/admin/candidate/QualificationsCard';
import EmploymentHistoryCard from '@/components/admin/candidate/EmploymentHistoryCard';
import PipelineHistoryCard from '@/components/admin/candidate/PipelineHistoryCard';
import GDPRComplianceCard from '@/components/admin/candidate/GDPRComplianceCard';
import { AccessDenied } from '@/components/admin/shared';
import { toast } from 'sonner';

export default function CandidateProfilePage() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  
  // Permission checks
  const canView = hasPermission('cv.view');
  const canUpdate = hasPermission('cv.update');
  const canDelete = hasPermission('cv.delete');
  
  const { data: candidate, isLoading, error } = useCandidateProfile(candidateId ?? null);

  // Calculate GDPR status from last contact date
  const gdprStatus = candidate ? calculateGDPRStatus(candidate.last_contact_date) : null;

  const handleAnonymise = () => {
    if (!canDelete) {
      toast.error('You do not have permission to anonymise candidates');
      return;
    }
    toast.info('Use the GDPR Compliance card to anonymise candidate data');
  };

  const handleDelete = () => {
    if (!canDelete) {
      toast.error('You do not have permission to delete candidates');
      return;
    }
    toast.info('Use the GDPR Compliance card to delete candidate');
  };

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
          message="You don't have permission to view candidate profiles."
          requiredPermission="cv.view"
          description="Contact your administrator if you need access to this feature."
          redirectUrl="/admin"
          redirectLabel="Back to Dashboard"
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

  if (error || !candidate) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" aria-hidden="true" />
          <h2 className="text-xl font-semibold mb-2">Candidate Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The candidate you're looking for doesn't exist or has been removed.
          </p>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Back to Dashboard
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
        Back to Talent Pool
      </Button>

      {/* Profile Header - Handlers only passed if user has permission */}
      <ProfileHeader
        candidate={candidate}
        gdprStatus={gdprStatus}
        onAnonymise={canDelete ? handleAnonymise : undefined}
        onDelete={canDelete ? handleDelete : undefined}
      />

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Employment History</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline History</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR & Compliance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Experience Summary */}
              {candidate.experience_summary && (
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Professional Summary
                  </h3>
                  <p className="text-sm leading-relaxed">{candidate.experience_summary}</p>
                </div>
              )}

              {/* Skills */}
              {candidate.skills && (
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Skills & Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.split(',').map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Qualifications */}
              <QualificationsCard candidate={candidate} />
            </div>

            {/* Right Column - Cards */}
            <div className="space-y-6">
              <CompensationCard candidate={candidate} />
              <WorkAuthorizationCard candidate={candidate} />
            </div>
          </div>
        </TabsContent>

        {/* Employment History Tab */}
        <TabsContent value="history" className="space-y-6">
          <EmploymentHistoryCard candidate={candidate} />
        </TabsContent>

        {/* Pipeline History Tab */}
        <TabsContent value="pipeline" className="space-y-6">
          <PipelineHistoryCard candidateId={candidate.id} />
        </TabsContent>

        {/* GDPR Tab */}
        <TabsContent value="gdpr" className="space-y-6">
          <GDPRComplianceCard
            candidate={candidate}
            gdprStatus={gdprStatus}
            onDelete={canDelete ? handleDelete : undefined}
          />
          
          {/* Admin Notes */}
          {candidate.admin_notes && (
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Admin Notes
              </h3>
              <p className="text-sm whitespace-pre-wrap">{candidate.admin_notes}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}