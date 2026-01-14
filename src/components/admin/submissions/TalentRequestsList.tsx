import { Briefcase } from 'lucide-react';
import { SubmissionCard } from '../shared/SubmissionCard';
import { SubmissionsSkeleton } from '../shared/SubmissionsSkeleton';
import { EmptyState } from '../shared/EmptyState';
import type { TalentRequest } from './types';

interface TalentRequestsListProps {
  requests: TalentRequest[];
  isLoading: boolean;
}

export function TalentRequestsList({ requests, isLoading }: TalentRequestsListProps) {
  if (isLoading) {
    return <SubmissionsSkeleton />;
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        description="No talent requests yet."
      />
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <SubmissionCard
          key={request.id}
          title={`${request.contact_name} (${request.company_name})`}
          titleIcon={<Briefcase className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" aria-hidden="true" />}
          subtitle={`Interested in: ${request.talent_profiles?.role || 'Unknown Role'}`}
          badges={[
            { label: request.talent_profiles?.reference_id || 'N/A', variant: 'secondary' }
          ]}
          contactInfo={{
            email: request.email,
          }}
          createdAt={request.created_at}
          message={request.message}
        />
      ))}
    </div>
  );
}
