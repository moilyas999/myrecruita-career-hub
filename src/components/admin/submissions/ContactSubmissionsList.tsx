import { Mail } from 'lucide-react';
import { SubmissionCard } from '../shared/SubmissionCard';
import { SubmissionsSkeleton } from '../shared/SubmissionsSkeleton';
import { EmptyState } from '../shared/EmptyState';
import type { ContactSubmission } from './types';

interface ContactSubmissionsListProps {
  submissions: ContactSubmission[];
  isLoading: boolean;
}

export function ContactSubmissionsList({ submissions, isLoading }: ContactSubmissionsListProps) {
  if (isLoading) {
    return <SubmissionsSkeleton />;
  }

  if (submissions.length === 0) {
    return (
      <EmptyState
        icon={Mail}
        description="No contact form submissions yet."
      />
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <SubmissionCard
          key={submission.id}
          title={submission.name}
          titleIcon={<Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" aria-hidden="true" />}
          subtitle={`Subject: ${submission.subject}`}
          badges={[
            { label: submission.inquiry_type }
          ]}
          contactInfo={{
            email: submission.email,
            phone: submission.phone,
          }}
          createdAt={submission.created_at}
          message={submission.message}
        >
          {submission.company && (
            <div className="flex items-start gap-2 text-sm">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground mb-1">Company:</p>
                <p className="break-words">{submission.company}</p>
              </div>
            </div>
          )}
        </SubmissionCard>
      ))}
    </div>
  );
}
