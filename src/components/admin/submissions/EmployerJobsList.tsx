import { Briefcase } from 'lucide-react';
import { SubmissionCard } from '../shared/SubmissionCard';
import { SubmissionsSkeleton } from '../shared/SubmissionsSkeleton';
import { EmptyState } from '../shared/EmptyState';
import type { EmployerJobSubmission } from './types';

interface EmployerJobsListProps {
  submissions: EmployerJobSubmission[];
  isLoading: boolean;
}

export function EmployerJobsList({ submissions, isLoading }: EmployerJobsListProps) {
  if (isLoading) {
    return <SubmissionsSkeleton />;
  }

  if (submissions.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        description="No employer job submissions yet."
      />
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <SubmissionCard
          key={submission.id}
          title={submission.job_title}
          titleIcon={<Briefcase className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" aria-hidden="true" />}
          subtitle={`${submission.company_name} - ${submission.contact_name}`}
          badges={[
            { label: submission.sector }
          ]}
          contactInfo={{
            email: submission.email,
            phone: submission.phone,
            location: submission.location,
          }}
          createdAt={submission.created_at}
          cvFileUrl={submission.job_spec_file_url}
          cvDownloadName={`${submission.company_name}-${submission.job_title}`}
        >
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground mb-2">Job Description:</p>
            <p className="text-sm break-words bg-muted/50 p-3 rounded-md">{submission.job_description}</p>
          </div>
        </SubmissionCard>
      ))}
    </div>
  );
}
