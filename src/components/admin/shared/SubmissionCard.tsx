import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar, FileText, Download, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContactInfo {
  email: string;
  phone?: string | null;
  location?: string | null;
}

interface SubmissionCardProps {
  title: string;
  titleIcon: ReactNode;
  subtitle?: string;
  badges?: Array<{ label: string; variant?: 'default' | 'secondary' | 'outline' | 'destructive' }>;
  contactInfo: ContactInfo;
  createdAt: string;
  message?: string | null;
  cvFileUrl?: string | null;
  cvDownloadName?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export function SubmissionCard({
  title,
  titleIcon,
  subtitle,
  badges = [],
  contactInfo,
  createdAt,
  message,
  cvFileUrl,
  cvDownloadName = 'Document',
  actions,
  children,
}: SubmissionCardProps) {
  const handleDownload = async (url: string, name: string) => {
    try {
      if (url.includes('cv-uploads/')) {
        const filePath = url.split('/cv-uploads/')[1];
        const { data, error } = await supabase.storage
          .from('cv-uploads')
          .createSignedUrl(filePath, 3600);
        if (error) {
          toast.error('Failed to generate download link');
          return;
        }
        window.open(data.signedUrl, '_blank');
      } else {
        window.open(url, '_blank');
      }
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            {titleIcon}
            <span className="break-words">{title}</span>
          </CardTitle>
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {badges.map((badge, index) => (
              <Badge key={index} variant={badge.variant || 'outline'} className="text-xs">
                {badge.label}
              </Badge>
            ))}
            {actions}
          </div>
        </div>
        {subtitle && <CardDescription className="break-words">{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-2 text-sm">
            <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground mb-1">Email:</p>
              <a 
                href={`mailto:${contactInfo.email}`} 
                className="text-primary hover:underline break-all"
                aria-label={`Send email to ${contactInfo.email}`}
              >
                {contactInfo.email}
              </a>
            </div>
          </div>
          {contactInfo.phone && (
            <div className="flex items-start gap-2 text-sm">
              <Phone className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground mb-1">Phone:</p>
                <a 
                  href={`tel:${contactInfo.phone}`} 
                  className="text-primary hover:underline break-all"
                  aria-label={`Call ${contactInfo.phone}`}
                >
                  {contactInfo.phone}
                </a>
              </div>
            </div>
          )}
        </div>

        {contactInfo.location && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground mb-1">Location:</p>
              <p>{contactInfo.location}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 text-sm">
          <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground mb-1">Submitted:</p>
            <time dateTime={createdAt}>
              {new Date(createdAt).toLocaleString()}
            </time>
          </div>
        </div>

        {cvFileUrl && (
          <div className="flex items-start gap-2 text-sm">
            <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground mb-1">Attached File:</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(cvFileUrl, cvDownloadName)}
                className="h-8"
                aria-label={`Download ${cvDownloadName}`}
              >
                <Download className="w-3 h-3 mr-1" aria-hidden="true" />
                Download
              </Button>
            </div>
          </div>
        )}

        {children}

        {message && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground mb-2">Message:</p>
            <p className="text-sm break-words bg-muted/50 p-3 rounded-md">{message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
