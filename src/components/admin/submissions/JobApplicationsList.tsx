import { Briefcase } from 'lucide-react';
import { SubmissionCard } from '../shared/SubmissionCard';
import { SubmissionsSkeleton } from '../shared/SubmissionsSkeleton';
import { EmptyState } from '../shared/EmptyState';
import type { JobApplication } from './types';

interface JobApplicationsListProps {
  applications: JobApplication[];
  isLoading: boolean;
}

export function JobApplicationsList({ applications, isLoading }: JobApplicationsListProps) {
  if (isLoading) {
    return <SubmissionsSkeleton />;
  }

  if (applications.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        description="No job applications yet."
      />
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <SubmissionCard
          key={app.id}
          title={app.name}
          titleIcon={<Briefcase className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" aria-hidden="true" />}
          subtitle={`Applied for: ${app.jobs?.title || 'Unknown Job'}`}
          badges={[
            { label: app.jobs?.reference_id || 'N/A', variant: 'secondary' }
          ]}
          contactInfo={{
            email: app.email,
            phone: app.phone,
          }}
          createdAt={app.created_at}
          message={app.message}
          cvFileUrl={app.cv_file_url}
          cvDownloadName={app.name}
        />
      ))}
    </div>
  );
}
