import { User } from 'lucide-react';
import { SubmissionCard } from '../shared/SubmissionCard';
import { SubmissionsSkeleton } from '../shared/SubmissionsSkeleton';
import { EmptyState } from '../shared/EmptyState';
import type { CareerPartnerRequest } from './types';

interface CareerRequestsListProps {
  requests: CareerPartnerRequest[];
  isLoading: boolean;
}

export function CareerRequestsList({ requests, isLoading }: CareerRequestsListProps) {
  if (isLoading) {
    return <SubmissionsSkeleton />;
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={User}
        description="No career partner requests yet."
      />
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <SubmissionCard
          key={request.id}
          title={request.name}
          titleIcon={<User className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" aria-hidden="true" />}
          subtitle="Career Partner Request"
          badges={[
            { label: request.service_type }
          ]}
          contactInfo={{
            email: request.email,
            phone: request.phone,
          }}
          createdAt={request.created_at}
          message={request.message}
        />
      ))}
    </div>
  );
}
