import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { StarRatingInput } from './shared/StarRatingInput';
import { useCreateScorecard, useUpdateScorecard } from '@/hooks/useInterviewScorecard';
import { usePermissions } from '@/hooks/usePermissions';
import type { 
  InterviewScorecard, 
  CreateScorecardData, 
  PipelineStage, 
  ScorecardRecommendation,
  InterviewType,
  RECOMMENDATION_CONFIG,
} from '@/types/pipeline';

interface InterviewScorecardFormProps {
  pipelineId: string;
  stage: PipelineStage;
  existingScorecard?: InterviewScorecard | null;
  isClientFeedback?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  readonly?: boolean;
}

interface ScorecardFormData {
  interviewer_name: string;
  interviewer_role: string;
  interview_date: string;
  interview_type: InterviewType;
  technical_skills: number | null;
  communication: number | null;
  cultural_fit: number | null;
  motivation: number | null;
  experience_relevance: number | null;
  overall_impression: number | null;
  strengths: string;
  concerns: string;
  notes: string;
  questions_asked: string;
  candidate_questions: string;
  recommendation: ScorecardRecommendation | '';
  next_steps: string;
  is_client_feedback: boolean;
}

const INTERVIEW_TYPES = [
  { value: 'phone', label: 'Phone' },
  { value: 'video', label: 'Video Call' },
  { value: 'in_person', label: 'In Person' },
  { value: 'assessment', label: 'Assessment' },
];

const RECOMMENDATIONS = [
  { value: 'strong_hire', label: 'Strong Hire', color: 'text-green-700' },
  { value: 'hire', label: 'Hire', color: 'text-emerald-700' },
  { value: 'maybe', label: 'Maybe', color: 'text-amber-700' },
  { value: 'no_hire', label: 'No Hire', color: 'text-orange-700' },
  { value: 'strong_no_hire', label: 'Strong No Hire', color: 'text-red-700' },
];

const SCORING_CATEGORIES = [
  { key: 'technical_skills', label: 'Technical Skills', description: 'Relevant technical knowledge and abilities' },
  { key: 'communication', label: 'Communication', description: 'Verbal and written communication skills' },
  { key: 'cultural_fit', label: 'Cultural Fit', description: 'Alignment with company values and team dynamics' },
  { key: 'motivation', label: 'Motivation', description: 'Enthusiasm and drive for the role' },
  { key: 'experience_relevance', label: 'Experience Relevance', description: 'How well past experience matches role needs' },
  { key: 'overall_impression', label: 'Overall Impression', description: 'General assessment of the candidate' },
];

export function InterviewScorecardForm({
  pipelineId,
  stage,
  existingScorecard,
  isClientFeedback = false,
  onSuccess,
  onCancel,
  readonly = false,
}: InterviewScorecardFormProps) {
  const { hasPermission } = usePermissions();
  const createScorecard = useCreateScorecard();
  const updateScorecard = useUpdateScorecard();

  const canEdit = hasPermission('pipeline.update') || hasPermission('pipeline.create');
  const isEditing = !!existingScorecard;

  const defaultValues: ScorecardFormData = {
    interviewer_name: existingScorecard?.interviewer_name || '',
    interviewer_role: existingScorecard?.interviewer_role || '',
    interview_date: existingScorecard?.interview_date || new Date().toISOString(),
    interview_type: existingScorecard?.interview_type || 'video',
    technical_skills: existingScorecard?.technical_skills || null,
    communication: existingScorecard?.communication || null,
    cultural_fit: existingScorecard?.cultural_fit || null,
    motivation: existingScorecard?.motivation || null,
    experience_relevance: existingScorecard?.experience_relevance || null,
    overall_impression: existingScorecard?.overall_impression || null,
    strengths: existingScorecard?.strengths || '',
    concerns: existingScorecard?.concerns || '',
    notes: existingScorecard?.notes || '',
    questions_asked: existingScorecard?.questions_asked || '',
    candidate_questions: existingScorecard?.candidate_questions || '',
    recommendation: existingScorecard?.recommendation || '',
    next_steps: existingScorecard?.next_steps || '',
    is_client_feedback: existingScorecard?.is_client_feedback || isClientFeedback,
  };

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<ScorecardFormData>({ defaultValues });

  const watchedRecommendation = watch('recommendation');

  const onSubmit = async (data: ScorecardFormData) => {
    if (readonly || !canEdit) return;

    const scorecardData: CreateScorecardData = {
      pipeline_id: pipelineId,
      stage,
      interviewer_name: data.interviewer_name || undefined,
      interviewer_role: data.interviewer_role || undefined,
      interview_date: data.interview_date || undefined,
      interview_type: data.interview_type,
      technical_skills: data.technical_skills ?? undefined,
      communication: data.communication ?? undefined,
      cultural_fit: data.cultural_fit ?? undefined,
      motivation: data.motivation ?? undefined,
      experience_relevance: data.experience_relevance ?? undefined,
      overall_impression: data.overall_impression ?? undefined,
      strengths: data.strengths || undefined,
      concerns: data.concerns || undefined,
      notes: data.notes || undefined,
      questions_asked: data.questions_asked || undefined,
      candidate_questions: data.candidate_questions || undefined,
      recommendation: data.recommendation || undefined,
      next_steps: data.next_steps || undefined,
      is_client_feedback: data.is_client_feedback,
    };

    if (isEditing && existingScorecard) {
      await updateScorecard.mutateAsync({ 
        id: existingScorecard.id, 
        data: scorecardData,
      });
    } else {
      await createScorecard.mutateAsync(scorecardData);
    }

    onSuccess?.();
  };

  const isSubmitting = createScorecard.isPending || updateScorecard.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Interview Details */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Interview Details</CardTitle>
          <CardDescription>Basic information about the interview</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="interviewer_name">Interviewer Name</Label>
            <Controller
              name="interviewer_name"
              control={control}
              render={({ field }) => (
                <Input
                  id="interviewer_name"
                  placeholder="John Smith"
                  disabled={readonly}
                  {...field}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interviewer_role">Interviewer Role</Label>
            <Controller
              name="interviewer_role"
              control={control}
              render={({ field }) => (
                <Input
                  id="interviewer_role"
                  placeholder="Hiring Manager"
                  disabled={readonly}
                  {...field}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interview_date">Interview Date</Label>
            <Controller
              name="interview_date"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="interview_date"
                      variant="outline"
                      disabled={readonly}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(new Date(field.value), 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date?.toISOString() || '')}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interview_type">Interview Type</Label>
            <Controller
              name="interview_type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={readonly}>
                  <SelectTrigger id="interview_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERVIEW_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <Controller
              name="is_client_feedback"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_client_feedback"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={readonly}
                  />
                  <label
                    htmlFor="is_client_feedback"
                    className="text-sm font-medium leading-none"
                  >
                    This is client feedback (not internal interview)
                  </label>
                </div>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Scoring */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Candidate Scoring</CardTitle>
          <CardDescription>Rate the candidate on each category (1-5 stars)</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SCORING_CATEGORIES.map((category) => (
            <Controller
              key={category.key}
              name={category.key as keyof ScorecardFormData}
              control={control}
              render={({ field }) => (
                <div className="space-y-1">
                  <StarRatingInput
                    value={field.value as number | null}
                    onChange={(value) => field.onChange(value)}
                    label={category.label}
                    disabled={readonly}
                    showLabels
                    id={`score-${category.key}`}
                  />
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </div>
              )}
            />
          ))}
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Interview Feedback</CardTitle>
          <CardDescription>Detailed observations and notes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="strengths">Key Strengths</Label>
              <Controller
                name="strengths"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="strengths"
                    placeholder="What impressed you about this candidate?"
                    rows={4}
                    disabled={readonly}
                    {...field}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="concerns">Concerns / Areas for Development</Label>
              <Controller
                name="concerns"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="concerns"
                    placeholder="Any concerns or areas needing development?"
                    rows={4}
                    disabled={readonly}
                    {...field}
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">General Notes</Label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="notes"
                  placeholder="Additional observations or context..."
                  rows={3}
                  disabled={readonly}
                  {...field}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="questions_asked">Questions Asked</Label>
              <Controller
                name="questions_asked"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="questions_asked"
                    placeholder="Key questions asked during the interview..."
                    rows={3}
                    disabled={readonly}
                    {...field}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="candidate_questions">Candidate's Questions</Label>
              <Controller
                name="candidate_questions"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="candidate_questions"
                    placeholder="Questions the candidate asked..."
                    rows={3}
                    disabled={readonly}
                    {...field}
                  />
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Recommendation</CardTitle>
          <CardDescription>Your overall recommendation for this candidate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recommendation">Hiring Recommendation</Label>
            <Controller
              name="recommendation"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={readonly}>
                  <SelectTrigger id="recommendation" className="w-full md:w-64">
                    <SelectValue placeholder="Select recommendation" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECOMMENDATIONS.map((rec) => (
                      <SelectItem key={rec.value} value={rec.value}>
                        <span className={rec.color}>{rec.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="next_steps">Suggested Next Steps</Label>
            <Controller
              name="next_steps"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="next_steps"
                  placeholder="What should happen next with this candidate?"
                  rows={2}
                  disabled={readonly}
                  {...field}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {!readonly && canEdit && (
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || (!isDirty && isEditing)}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? 'Update Scorecard' : 'Save Scorecard'}
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
}

export default InterviewScorecardForm;
