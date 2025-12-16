import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Upload, FileText, Loader2, Check, X, AlertCircle, Brain, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ParsedCV {
  id: string;
  fileName: string;
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

export default function CVBulkImport({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const [files, setFiles] = useState<ParsedCV[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);

  const generateId = () => Math.random().toString(36).substring(2, 9);

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
            experience_summary: ''
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
        const response = await supabase.functions.invoke('parse-cv', {
          body: { fileUrl: file.fileUrl, fileName: file.fileName }
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
                  experience_summary: extractedData.experience_summary || ''
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

  const updateFileData = (fileId: string, field: keyof ParsedCV['data'], value: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, data: { ...f.data, [field]: value } } 
        : f
    ));
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
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
      
      const entry = {
        name: file.data.name,
        email: file.data.email,
        phone: file.data.phone || null,
        job_title: file.data.job_title || null,
        sector: file.data.sector || null,
        location: file.data.location || null,
        cv_file_url: file.fileUrl,
        admin_notes: file.data.skills 
          ? `Skills: ${file.data.skills}\n\n${file.data.experience_summary || ''}` 
          : file.data.experience_summary || null,
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
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const parsedCount = files.filter(f => f.status === 'parsed').length;
  const errorCount = files.filter(f => f.status === 'error').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Smart CV Parser
        </CardTitle>
        <CardDescription>
          Drag & drop PDF or Word documents. AI will automatically extract candidate information.
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

            <div className="border rounded-lg overflow-auto max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">File</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="w-[80px]">Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate max-w-[100px]" title={file.fileName}>
                            {file.fileName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={file.data.name}
                          onChange={(e) => updateFileData(file.id, 'name', e.target.value)}
                          className="h-8 text-xs"
                          placeholder="Full name"
                          disabled={file.status === 'parsing'}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={file.data.email}
                          onChange={(e) => updateFileData(file.id, 'email', e.target.value)}
                          className="h-8 text-xs"
                          placeholder="Email"
                          type="email"
                          disabled={file.status === 'parsing'}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={file.data.phone}
                          onChange={(e) => updateFileData(file.id, 'phone', e.target.value)}
                          className="h-8 text-xs"
                          placeholder="Phone"
                          disabled={file.status === 'parsing'}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={file.data.job_title}
                          onChange={(e) => updateFileData(file.id, 'job_title', e.target.value)}
                          className="h-8 text-xs"
                          placeholder="Job title"
                          disabled={file.status === 'parsing'}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={file.data.sector}
                          onChange={(e) => updateFileData(file.id, 'sector', e.target.value)}
                          className="h-8 text-xs"
                          placeholder="Sector"
                          list={`sectors-${file.id}`}
                          disabled={file.status === 'parsing'}
                        />
                        <datalist id={`sectors-${file.id}`}>
                          {SECTORS.map(s => <option key={s} value={s} />)}
                        </datalist>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={file.data.location}
                          onChange={(e) => updateFileData(file.id, 'location', e.target.value)}
                          className="h-8 text-xs"
                          placeholder="Location"
                          disabled={file.status === 'parsing'}
                        />
                      </TableCell>
                      <TableCell>
                        {file.status === 'pending' && (
                          <span className="text-xs text-muted-foreground">Pending</span>
                        )}
                        {file.status === 'parsing' && (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        )}
                        {file.status === 'parsed' && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                        {file.status === 'error' && (
                          <span title={file.error}>
                            <AlertCircle className="w-4 h-4 text-destructive cursor-help" />
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeFile(file.id)}
                          disabled={file.status === 'parsing'}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Import Progress */}
        {isImporting && (
          <div className="space-y-2">
            <Progress value={importProgress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              Importing... {importProgress}%
            </p>
          </div>
        )}

        {/* Results */}
        {importResults && (
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-4 h-4" />
              <span>{importResults.success} imported</span>
            </div>
            {importResults.failed > 0 && (
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span>{importResults.failed} failed</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {files.length > 0 && (
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={clearAll} disabled={isParsing || isImporting}>
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
            <Button 
              onClick={importAllParsed} 
              disabled={parsedCount === 0 || isImporting || isParsing}
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import {parsedCount} Candidates
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
