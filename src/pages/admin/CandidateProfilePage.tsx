/**
 * Candidate Profile Page
 * Full-page view of a candidate's complete profile
 */
import { useParams, useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useCandidateProfile } from '@/hooks/useCandidateProfile';
import { calculateGDPRStatus } from '@/types/candidate';
import AdminLayout from '@/layouts/AdminLayout';
import ProfileHeader from '@/components/admin/candidate/ProfileHeader';
import WorkAuthorizationCard from '@/components/admin/candidate/WorkAuthorizationCard';
import CompensationCard from '@/components/admin/candidate/CompensationCard';
import QualificationsCard from '@/components/admin/candidate/QualificationsCard';
import EmploymentHistoryCard from '@/components/admin/candidate/EmploymentHistoryCard';
import PipelineHistoryCard from '@/components/admin/candidate/PipelineHistoryCard';
import GDPRComplianceCard from '@/components/admin/candidate/GDPRComplianceCard';
import { toast } from 'sonner';

export default function CandidateProfilePage() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  
  const { data: candidate, isLoading, error } = useCandidateProfile(candidateId ?? null);

  // Calculate GDPR status from last contact date
  const gdprStatus = candidate ? calculateGDPRStatus(candidate.last_contact_date) : null;

  const handleAnonymise = () => {
    // This triggers the dialog in GDPRComplianceCard
    toast.info('Use the GDPR Compliance card to anonymise candidate data');
  };

  const handleDelete = () => {
    // This triggers the dialog in GDPRComplianceCard
    toast.info('Use the GDPR Compliance card to delete candidate');
  };

  if (isLoading) {
    return (
      <AdminLayout title="Candidate Profile" description="Loading candidate information...">
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 w-full lg:col-span-2" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !candidate) {
    return (
      <AdminLayout title="Candidate Not Found">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Candidate Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The candidate you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="-ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Talent Pool
        </Button>

        {/* Profile Header */}
        <ProfileHeader
          candidate={candidate}
          gdprStatus={gdprStatus}
          onAnonymise={handleAnonymise}
          onDelete={handleDelete}
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
              onDelete={handleDelete}
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
    </AdminLayout>
  );
}