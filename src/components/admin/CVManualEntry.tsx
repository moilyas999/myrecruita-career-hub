import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAutoSave } from '@/hooks/useAutoSave';
import { toast } from 'sonner';
import { Save, Loader2, Check, AlertCircle, Upload, Plus, X } from 'lucide-react';
import { logActivity } from '@/services/activityLogger';

interface CVFormData {
  name: string;
  email: string;
  phone: string;
  job_title: string;
  sector: string;
  location: string;
  message: string;
  admin_notes: string;
}

const initialFormData: CVFormData = {
  name: '',
  email: '',
  phone: '',
  job_title: '',
  sector: '',
  location: '',
  message: '',
  admin_notes: '',
};

const SECTORS = [
  'Finance & Accounting',
  'Technology & IT',
  'Healthcare',
  'Legal',
  'Marketing',
  'Human Resources',
  'Engineering',
  'Sales',
  'Operations',
  'Other',
];

const LOCAL_STORAGE_KEY = 'cv_manual_entry_draft';

export default function CVManualEntry({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CVFormData>(initialFormData);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed.formData || initialFormData);
        setDraftId(parsed.draftId || null);
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, []);

  // Auto-save to localStorage
  const saveToLocalStorage = async (data: CVFormData) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      formData: data,
      draftId,
      savedAt: new Date().toISOString(),
    }));
  };

  const { status: autoSaveStatus, lastSaved } = useAutoSave(
    formData,
    saveToLocalStorage,
    1500,
    formData.name.length > 0 || formData.email.length > 0
  );

  const handleInputChange = (field: keyof CVFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setCvFile(file);
    }
  };

  const uploadCV = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `admin-upload-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `admin-uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('cv-uploads')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    return filePath;
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required');
      return;
    }

    setIsSubmitting(true);

    try {
      let cvFileUrl = null;
      if (cvFile) {
        cvFileUrl = await uploadCV(cvFile);
        if (!cvFileUrl) {
          toast.error('Failed to upload CV file');
          setIsSubmitting(false);
          return;
        }
      }

      const { data: newCV, error } = await supabase.from('cv_submissions').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        message: formData.message || null,
        cv_file_url: cvFileUrl,
        source: 'admin_manual',
        job_title: formData.job_title || null,
        sector: formData.sector || null,
        location: formData.location || null,
        admin_notes: formData.admin_notes || null,
        added_by: user?.id || null,
      }).select().single();

      if (error) throw error;

      // Log activity
      logActivity({
        action: 'cv_created',
        resourceType: 'cv',
        resourceId: newCV.id,
        details: { name: formData.name, email: formData.email, source: 'admin_manual' },
      });

      toast.success('CV entry added successfully');
      
      // Clear form and localStorage
      setFormData(initialFormData);
      setCvFile(null);
      setDraftId(null);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      
      onSuccess?.();
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Failed to add CV entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearDraft = () => {
    setFormData(initialFormData);
    setCvFile(null);
    setDraftId(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    toast.success('Draft cleared');
  };

  const renderAutoSaveStatus = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            Saving draft...
          </span>
        );
      case 'saved':
        return (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <Check className="w-3 h-3" />
            Draft saved
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="w-3 h-3" />
            Save failed
          </span>
        );
      default:
        return lastSaved ? (
          <span className="text-xs text-muted-foreground">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        ) : null;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Single CV
        </CardTitle>
        <div className="flex items-center gap-4">
          {renderAutoSaveStatus()}
          {(formData.name || formData.email) && (
            <Button variant="ghost" size="sm" onClick={clearDraft}>
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+44 7XXX XXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="job_title">Job Title / Role</Label>
            <Input
              id="job_title"
              value={formData.job_title}
              onChange={(e) => handleInputChange('job_title', e.target.value)}
              placeholder="e.g., Senior Accountant"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sector">Sector</Label>
            <Select value={formData.sector} onValueChange={(value) => handleInputChange('sector', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., London, UK"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cv_file">CV File</Label>
          <div className="flex items-center gap-4">
            <Input
              id="cv_file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="flex-1"
            />
            {cvFile && (
              <span className="text-sm text-muted-foreground">
                {cvFile.name}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Candidate Notes</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder="Any notes about the candidate..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin_notes">Internal Admin Notes</Label>
          <Textarea
            id="admin_notes"
            value={formData.admin_notes}
            onChange={(e) => handleInputChange('admin_notes', e.target.value)}
            placeholder="Internal notes (not visible to candidate)..."
            rows={2}
            className="border-dashed"
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save CV Entry
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
