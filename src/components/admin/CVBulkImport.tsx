import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Upload, FileText, Loader2, Check, X, AlertCircle, Brain, Trash2, ChevronDown, ChevronUp, Award, Briefcase, GraduationCap, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import CVScoreBadge, { CVScoreBreakdown, CVScoreBreakdownCard } from './CVScoreBadge';

interface AIProfile {
  hard_skills: string[];
  soft_skills: string[];
  certifications: string[];
  industries: string[];
  experience_years: number;
  seniority: string;
  education: {
    level: string;
    field: string;
    institution: string;
  };
  key_achievements: string[];
  career_progression: string;
  ideal_roles: string[];
  summary_for_matching: string;
}

interface ParsedCV {
  id: string;
  fileName: string;
  filePath: string;
  fileUrl: string;
  status: 'pending' | 'parsing' | 'parsed' | 'error';
  error?: string;
  data: {
    name: string;
    email: string;
    phone: string;
    job_title: string;
    sector: string;
    location: string;
    skills: string;
    experience_summary: string;
    years_experience: number | null;
    education_level: string;
    seniority_level: string;
    ai_profile: AIProfile | null;
    cv_score: number | null;
    cv_score_breakdown: CVScoreBreakdown | null;
  };
}

const SECTORS = [
  'Accountancy & Finance',
  'Technology',
  'Healthcare',
  'Legal',
  'Engineering',
  'Marketing',
  'Sales',
  'HR',
  'Operations',
  'Other'
];

const SENIORITY_LEVELS = [
  'Entry',
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead',
  'Manager',
  'Director',
  'Executive',
  'C-Level'
];

export default function CVBulkImport({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const [files, setFiles] = useState<ParsedCV[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);
  const [expandedProfiles, setExpandedProfiles] = useState<Set<string>>(new Set());

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const toggleProfileExpand = (fileId: string) => {
    setExpandedProfiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.name.toLowerCase().endsWith('.pdf') || 
              file.name.toLowerCase().endsWith('.docx') ||
              file.name.toLowerCase().endsWith('.doc')
    );
    
    if (droppedFiles.length === 0) {
      toast.error('Please drop PDF or Word documents only');
      return;
    }
    
    await uploadFiles(droppedFiles);
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(
      file => file.name.toLowerCase().endsWith('.pdf') || 
              file.name.toLowerCase().endsWith('.docx') ||
              file.name.toLowerCase().endsWith('.doc')
    );
    
    if (selectedFiles.length === 0) {
      toast.error('Please select PDF or Word documents only');
      return;
    }
    
    await uploadFiles(selectedFiles);
    e.target.value = ''; // Reset input
  };

  const uploadFiles = async (filesToUpload: File[]) => {
    setIsUploading(true);
    
    const newFiles: ParsedCV[] = [];
    
    for (const file of filesToUpload) {
      const id = generateId();
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `bulk-imports/${timestamp}-${sanitizedName}`;
      
      try {
        const { data, error } = await supabase.storage
          .from('cv-uploads')
          .upload(filePath, file);
        
        if (error) throw error;
        
        const { data: urlData } = supabase.storage
          .from('cv-uploads')
          .getPublicUrl(filePath);
        
        newFiles.push({
          id,
          fileName: file.name,
          filePath: filePath,
          fileUrl: urlData.publicUrl,
          status: 'pending',
          data: {
            name: '',
            email: '',
            phone: '',
            job_title: '',
            sector: '',
            location: '',
            skills: '',
            experience_summary: '',
            years_experience: null,
            education_level: '',
            seniority_level: '',
            ai_profile: null,
            cv_score: null,
            cv_score_breakdown: null
          }
        });
      } catch (error: any) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
      }
    }
    
    setFiles(prev => [...prev, ...newFiles]);
    setIsUploading(false);
    
    if (newFiles.length > 0) {
      toast.success(`Uploaded ${newFiles.length} file(s). Click "Parse with AI" to extract data.`);
    }
  };

  const getStoragePathFromUrl = (url: string) => {
    const marker = '/cv-uploads/';
    const idx = url.indexOf(marker);
    if (idx === -1) return '';
    return decodeURIComponent(url.slice(idx + marker.length));
  };

  const parseAllFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'error');
    
    if (pendingFiles.length === 0) {
      toast.info('No files to parse');
      return;
    }
    
    setIsParsing(true);
    
    for (const file of pendingFiles) {
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'parsing' } : f
      ));
      
      try {
        const filePathToSend = file.filePath || (file.fileUrl ? getStoragePathFromUrl(file.fileUrl) : '');

        const response = await supabase.functions.invoke('parse-cv', {
          body: { filePath: filePathToSend, fileName: file.fileName },
        });
        
        if (response.error) {
          throw new Error(response.error.message || 'Parse failed');
        }
        
        if (response.data?.error) {
          throw new Error(response.data.error);
        }
        
        const extractedData = response.data?.data || {};
        
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { 
                ...f, 
                status: 'parsed',
                data: {
                  name: extractedData.name || '',
                  email: extractedData.email || '',
                  phone: extractedData.phone || '',
                  job_title: extractedData.job_title || '',
                  sector: extractedData.sector || '',
                  location: extractedData.location || '',
                  skills: extractedData.skills || '',
                  experience_summary: extractedData.experience_summary || '',
                  years_experience: extractedData.years_experience || null,
                  education_level: extractedData.education_level || '',
                  seniority_level: extractedData.seniority_level || '',
                  ai_profile: extractedData.ai_profile || null,
                  cv_score: extractedData.cv_score || null,
                  cv_score_breakdown: extractedData.cv_score_breakdown || null
                }
              } 
            : f
        ));
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error: any) {
        console.error('Parse error:', error);
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, status: 'error', error: error.message } 
            : f
        ));
      }
    }
    
    setIsParsing(false);
    toast.success('Parsing complete! Review and edit the extracted data before importing.');
  };

  const updateFileData = (fileId: string, field: keyof ParsedCV['data'], value: any) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, data: { ...f.data, [field]: value } } 
        : f
    ));
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setExpandedProfiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(fileId);
      return newSet;
    });
  };

  const importAllParsed = async () => {
    const parsedFiles = files.filter(f => f.status === 'parsed' && f.data.name && f.data.email);
    
    if (parsedFiles.length === 0) {
      toast.error('No valid parsed CVs to import. Ensure name and email are filled.');
      return;
    }
    
    setIsImporting(true);
    setImportProgress(0);
    setImportResults(null);
    
    let success = 0;
    let failed = 0;
    
    for (let i = 0; i < parsedFiles.length; i++) {
      const file = parsedFiles[i];
      
      const entry: any = {
        name: file.data.name,
        email: file.data.email,
        phone: file.data.phone || null,
        job_title: file.data.job_title || null,
        sector: file.data.sector || null,
        location: file.data.location || null,
        cv_file_url: file.fileUrl,
        skills: file.data.skills || null,
        experience_summary: file.data.experience_summary || null,
        years_experience: file.data.years_experience || null,
        education_level: file.data.education_level || null,
        seniority_level: file.data.seniority_level || null,
        ai_profile: file.data.ai_profile || null,
        cv_score: file.data.cv_score || null,
        cv_score_breakdown: file.data.cv_score_breakdown || null,
        scored_at: file.data.cv_score ? new Date().toISOString() : null,
        admin_notes: null,
        source: 'admin_bulk_parsed',
        added_by: user?.id || null,
      };
      
      const { error } = await supabase.from('cv_submissions').insert(entry);
      
      if (error) {
        console.error('Insert error:', error);
        failed++;
      } else {
        success++;
      }
      
      setImportProgress(Math.round(((i + 1) / parsedFiles.length) * 100));
    }
    
    setImportResults({ success, failed });
    setIsImporting(false);
    
    if (success > 0) {
      toast.success(`Successfully imported ${success} CV entries`);
      // Remove imported files from list
      setFiles(prev => prev.filter(f => !parsedFiles.find(p => p.id === f.id)));
      onSuccess?.();
    }
    
    if (failed > 0) {
      toast.warning(`${failed} entries failed to import`);
    }
  };

  const clearAll = () => {
    setFiles([]);
    setImportResults(null);
    setImportProgress(0);
    setExpandedProfiles(new Set());
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const parsedCount = files.filter(f => f.status === 'parsed').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  const getSeniorityColor = (seniority: string) => {
    const colors: Record<string, string> = {
      'Entry': 'bg-slate-100 text-slate-700',
      'Junior': 'bg-blue-100 text-blue-700',
      'Mid-Level': 'bg-green-100 text-green-700',
      'Senior': 'bg-purple-100 text-purple-700',
      'Lead': 'bg-orange-100 text-orange-700',
      'Manager': 'bg-pink-100 text-pink-700',
      'Director': 'bg-red-100 text-red-700',
      'Executive': 'bg-amber-100 text-amber-700',
      'C-Level': 'bg-yellow-100 text-yellow-800'
    };
    return colors[seniority] || 'bg-muted text-muted-foreground';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Smart CV Parser
        </CardTitle>
        <CardDescription>
          Drag & drop PDF or Word documents. AI will automatically extract candidate information and create a rich profile for job matching.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
          <label htmlFor="cv_files" className="cursor-pointer">
            <span className="text-primary font-medium">Click to select files</span>
            <span className="text-muted-foreground"> or drag and drop</span>
          </label>
          <Input
            id="cv_files"
            type="file"
            accept=".pdf,.docx,.doc"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <p className="text-xs text-muted-foreground mt-2">
            PDF, DOCX, or DOC files (max 5MB each)
          </p>
          {isUploading && (
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading files...
            </div>
          )}
        </div>

        {/* File Status Summary */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="px-3 py-1 bg-muted rounded-full">
              {files.length} file(s)
            </span>
            {pendingCount > 0 && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                {pendingCount} pending
              </span>
            )}
            {parsedCount > 0 && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                {parsedCount} parsed
              </span>
            )}
            {errorCount > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full">
                {errorCount} errors
              </span>
            )}
          </div>
        )}

        {/* Files List */}
        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Uploaded Files</h4>
              <div className="flex gap-2">
                {pendingCount > 0 && (
                  <Button 
                    onClick={parseAllFiles} 
                    disabled={isParsing}
                    size="sm"
                  >
                    {isParsing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Parsing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Parse with AI
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Enhanced File Cards */}
            <div className="space-y-4">
              {files.map((file) => (
                <Card key={file.id} className="overflow-hidden">
                  <div className="p-4">
                    {/* File Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium truncate max-w-[200px]" title={file.fileName}>
                          {file.fileName}
                        </span>
                        {file.status === 'pending' && (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                        {file.status === 'parsing' && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Parsing
                          </Badge>
                        )}
                        {file.status === 'parsed' && (
                          <Badge className="bg-green-100 text-green-800">
                            <Check className="w-3 h-3 mr-1" />
                            Parsed
                          </Badge>
                        )}
                        {file.status === 'error' && (
                          <Badge variant="destructive">
                            <X className="w-3 h-3 mr-1" />
                            Error
                          </Badge>
                        )}
                        {file.data.seniority_level && (
                          <Badge className={getSeniorityColor(file.data.seniority_level)}>
                            {file.data.seniority_level}
                          </Badge>
                        )}
                        {file.status === 'parsed' && (
                          <CVScoreBadge 
                            score={file.data.cv_score} 
                            breakdown={file.data.cv_score_breakdown}
                            size="sm"
                          />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(file.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {file.status === 'error' && file.error && (
                      <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {file.error}
                      </div>
                    )}

                    {/* Basic Fields Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                      <div>
                        <label className="text-xs text-muted-foreground">Name</label>
                        <Input
                          value={file.data.name}
                          onChange={(e) => updateFileData(file.id, 'name', e.target.value)}
                          className="h-8 text-sm"
                          placeholder="Full name"
                          disabled={file.status === 'parsing'}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Email</label>
                        <Input
                          value={file.data.email}
                          onChange={(e) => updateFileData(file.id, 'email', e.target.value)}
                          className="h-8 text-sm"
                          placeholder="Email"
                          type="email"
                          disabled={file.status === 'parsing'}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Phone</label>
                        <Input
                          value={file.data.phone}
                          onChange={(e) => updateFileData(file.id, 'phone', e.target.value)}
                          className="h-8 text-sm"
                          placeholder="Phone"
                          disabled={file.status === 'parsing'}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Job Title</label>
                        <Input
                          value={file.data.job_title}
                          onChange={(e) => updateFileData(file.id, 'job_title', e.target.value)}
                          className="h-8 text-sm"
                          placeholder="Job title"
                          disabled={file.status === 'parsing'}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Sector</label>
                        <Input
                          value={file.data.sector}
                          onChange={(e) => updateFileData(file.id, 'sector', e.target.value)}
                          className="h-8 text-sm"
                          placeholder="Sector"
                          list={`sectors-${file.id}`}
                          disabled={file.status === 'parsing'}
                        />
                        <datalist id={`sectors-${file.id}`}>
                          {SECTORS.map(s => <option key={s} value={s} />)}
                        </datalist>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Location</label>
                        <Input
                          value={file.data.location}
                          onChange={(e) => updateFileData(file.id, 'location', e.target.value)}
                          className="h-8 text-sm"
                          placeholder="Location"
                          disabled={file.status === 'parsing'}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Years Exp.</label>
                        <Input
                          value={file.data.years_experience || ''}
                          onChange={(e) => updateFileData(file.id, 'years_experience', e.target.value ? parseInt(e.target.value) : null)}
                          className="h-8 text-sm"
                          placeholder="Years"
                          type="number"
                          disabled={file.status === 'parsing'}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Seniority</label>
                        <Input
                          value={file.data.seniority_level}
                          onChange={(e) => updateFileData(file.id, 'seniority_level', e.target.value)}
                          className="h-8 text-sm"
                          placeholder="Seniority"
                          list={`seniority-${file.id}`}
                          disabled={file.status === 'parsing'}
                        />
                        <datalist id={`seniority-${file.id}`}>
                          {SENIORITY_LEVELS.map(s => <option key={s} value={s} />)}
                        </datalist>
                      </div>
                    </div>

                    {/* AI Profile Expandable Section */}
                    {file.data.ai_profile && (
                      <Collapsible 
                        open={expandedProfiles.has(file.id)}
                        onOpenChange={() => toggleProfileExpand(file.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full justify-between">
                            <span className="flex items-center gap-2">
                              <Brain className="w-4 h-4" />
                              AI Profile for Job Matching
                            </span>
                            {expandedProfiles.has(file.id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-4 space-y-4">
                          {/* CV Score Breakdown */}
                          {file.data.cv_score !== null && file.data.cv_score_breakdown && (
                            <CVScoreBreakdownCard 
                              score={file.data.cv_score} 
                              breakdown={file.data.cv_score_breakdown}
                            />
                          )}

                          {/* Summary for Matching */}
                          {file.data.ai_profile.summary_for_matching && (
                            <div className="p-3 bg-muted rounded-lg">
                              <h5 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                Matching Summary
                              </h5>
                              <p className="text-sm">{file.data.ai_profile.summary_for_matching}</p>
                            </div>
                          )}

                          {/* Skills */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {file.data.ai_profile.hard_skills?.length > 0 && (
                              <div>
                                <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                  <Briefcase className="w-3 h-3" />
                                  Hard Skills
                                </h5>
                                <div className="flex flex-wrap gap-1">
                                  {file.data.ai_profile.hard_skills.map((skill, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {file.data.ai_profile.soft_skills?.length > 0 && (
                              <div>
                                <h5 className="text-xs font-medium text-muted-foreground mb-2">Soft Skills</h5>
                                <div className="flex flex-wrap gap-1">
                                  {file.data.ai_profile.soft_skills.map((skill, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Certifications & Industries */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {file.data.ai_profile.certifications?.length > 0 && (
                              <div>
                                <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                  <Award className="w-3 h-3" />
                                  Certifications
                                </h5>
                                <div className="flex flex-wrap gap-1">
                                  {file.data.ai_profile.certifications.map((cert, idx) => (
                                    <Badge key={idx} className="text-xs bg-amber-100 text-amber-800">
                                      {cert}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {file.data.ai_profile.industries?.length > 0 && (
                              <div>
                                <h5 className="text-xs font-medium text-muted-foreground mb-2">Industries</h5>
                                <div className="flex flex-wrap gap-1">
                                  {file.data.ai_profile.industries.map((industry, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {industry}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Education & Career */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {file.data.ai_profile.education && (
                              <div>
                                <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                  <GraduationCap className="w-3 h-3" />
                                  Education
                                </h5>
                                <p className="text-sm">
                                  {file.data.ai_profile.education.level}
                                  {file.data.ai_profile.education.field && ` in ${file.data.ai_profile.education.field}`}
                                  {file.data.ai_profile.education.institution && ` - ${file.data.ai_profile.education.institution}`}
                                </p>
                              </div>
                            )}
                            {file.data.ai_profile.career_progression && (
                              <div>
                                <h5 className="text-xs font-medium text-muted-foreground mb-2">Career Progression</h5>
                                <Badge variant="outline">{file.data.ai_profile.career_progression}</Badge>
                              </div>
                            )}
                          </div>

                          {/* Key Achievements */}
                          {file.data.ai_profile.key_achievements?.length > 0 && (
                            <div>
                              <h5 className="text-xs font-medium text-muted-foreground mb-2">Key Achievements</h5>
                              <ul className="text-sm space-y-1">
                                {file.data.ai_profile.key_achievements.map((achievement, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <Check className="w-3 h-3 text-green-600 mt-1 flex-shrink-0" />
                                    {achievement}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Ideal Roles */}
                          {file.data.ai_profile.ideal_roles?.length > 0 && (
                            <div>
                              <h5 className="text-xs font-medium text-muted-foreground mb-2">Ideal Roles</h5>
                              <div className="flex flex-wrap gap-1">
                                {file.data.ai_profile.ideal_roles.map((role, idx) => (
                                  <Badge key={idx} className="text-xs bg-primary/10 text-primary">
                                    {role}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              {parsedCount > 0 && (
                <Button 
                  onClick={importAllParsed} 
                  disabled={isImporting}
                  className="flex-1 sm:flex-none"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Import {parsedCount} CV(s) to Database
                    </>
                  )}
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={clearAll}
                disabled={isImporting || isParsing}
              >
                Clear All
              </Button>
            </div>

            {/* Import Progress */}
            {isImporting && (
              <div className="space-y-2">
                <Progress value={importProgress} />
                <p className="text-sm text-muted-foreground text-center">
                  Importing... {importProgress}%
                </p>
              </div>
            )}

            {/* Import Results */}
            {importResults && (
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="font-medium">
                  Import Complete: {importResults.success} successful, {importResults.failed} failed
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
