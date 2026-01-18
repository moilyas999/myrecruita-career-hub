/**
 * Interactions Tab Component
 * Displays and logs client interactions/activity timeline
 */
import { useState } from 'react';
import { Plus, Phone, Mail, Video, MessageSquare, FileText, Linkedin, Clock, User } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useClientInteractions } from '@/hooks/useClients';
import InteractionLogDialog from './InteractionLogDialog';
import type { ClientInteraction, InteractionType } from '@/types/client';

interface InteractionsTabProps {
  clientId: string;
  canUpdate: boolean;
}

const INTERACTION_ICONS: Record<InteractionType, React.ElementType> = {
  call: Phone,
  email: Mail,
  meeting: Video,
  linkedin: Linkedin,
  note: MessageSquare,
  proposal: FileText,
};

const INTERACTION_LABELS: Record<InteractionType, string> = {
  call: 'Phone Call',
  email: 'Email',
  meeting: 'Meeting',
  linkedin: 'LinkedIn',
  note: 'Note',
  proposal: 'Proposal',
};

const INTERACTION_COLORS: Record<InteractionType, string> = {
  call: 'bg-green-500/10 text-green-600 border-green-500/30',
  email: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  meeting: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  linkedin: 'bg-sky-500/10 text-sky-600 border-sky-500/30',
  note: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  proposal: 'bg-primary/10 text-primary border-primary/30',
};

export default function InteractionsTab({ clientId, canUpdate }: InteractionsTabProps) {
  const { data: interactions, isLoading } = useClientInteractions(clientId);
  const [showLogDialog, setShowLogDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Activity Timeline ({interactions?.length || 0})
        </h3>
        {canUpdate && (
          <Button onClick={() => setShowLogDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Log Interaction
          </Button>
        )}
      </div>

      {/* Empty State */}
      {!interactions || interactions.length === 0 ? (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No activity yet</h3>
            <p className="text-muted-foreground mb-4">
              Log your first interaction with this client
            </p>
            {canUpdate && (
              <Button onClick={() => setShowLogDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Log Interaction
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

          {/* Timeline items */}
          <div className="space-y-4">
            {interactions.map((interaction, index) => (
              <InteractionCard 
                key={interaction.id} 
                interaction={interaction} 
                isLast={index === interactions.length - 1}
              />
            ))}
          </div>
        </div>
      )}

      {/* Log Dialog */}
      <InteractionLogDialog
        open={showLogDialog}
        onOpenChange={setShowLogDialog}
        clientId={clientId}
      />
    </div>
  );
}

interface InteractionCardProps {
  interaction: ClientInteraction;
  isLast: boolean;
}

function InteractionCard({ interaction, isLast }: InteractionCardProps) {
  const Icon = INTERACTION_ICONS[interaction.interaction_type];
  const colorClass = INTERACTION_COLORS[interaction.interaction_type];

  return (
    <div className="relative pl-14">
      {/* Icon bubble */}
      <div className={`absolute left-3 top-2 w-6 h-6 rounded-full flex items-center justify-center border ${colorClass}`}>
        <Icon className="w-3 h-3" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-xs ${colorClass}`}>
                {INTERACTION_LABELS[interaction.interaction_type]}
              </Badge>
              {interaction.direction && (
                <Badge variant="outline" className="text-xs capitalize">
                  {interaction.direction}
                </Badge>
              )}
              {interaction.follow_up_required && (
                <Badge variant="destructive" className="text-xs">
                  Follow-up Required
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(interaction.created_at), { addSuffix: true })}
            </span>
          </div>

          {interaction.subject && (
            <h4 className="font-medium mb-1">{interaction.subject}</h4>
          )}

          {interaction.summary && (
            <p className="text-sm text-muted-foreground mb-2">{interaction.summary}</p>
          )}

          {interaction.outcome && (
            <div className="text-sm mb-2">
              <span className="text-muted-foreground">Outcome: </span>
              <span>{interaction.outcome}</span>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 pt-2 border-t">
            {interaction.contact && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {interaction.contact.name}
              </div>
            )}
            {interaction.duration_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {interaction.duration_minutes} min
              </div>
            )}
            {interaction.follow_up_date && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Follow-up: {format(new Date(interaction.follow_up_date), 'dd MMM yyyy')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
