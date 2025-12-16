import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CSVRow {
  [key: string]: string;
}

interface FieldMapping {
  name: string;
  email: string;
  phone: string;
  job_title: string;
  sector: string;
  location: string;
  message: string;
}

const REQUIRED_FIELDS = ['name', 'email'];
const OPTIONAL_FIELDS = ['phone', 'job_title', 'sector', 'location', 'message'];

export default function CVBulkImport({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Partial<FieldMapping>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);

  const parseCSV = (text: string): { headers: string[]; rows: CSVRow[] } => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return { headers: [], rows: [] };

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: CSVRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }

    return { headers, rows };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { headers, rows } = parseCSV(text);
      
      if (headers.length === 0) {
        toast.error('Invalid CSV format');
        return;
      }

      setCsvHeaders(headers);
      setCsvData(rows);
      
      // Auto-map fields with matching names
      const autoMapping: Partial<FieldMapping> = {};
      [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS].forEach(field => {
        const match = headers.find(h => 
          h.toLowerCase().includes(field.toLowerCase()) ||
          field.toLowerCase().includes(h.toLowerCase())
        );
        if (match) {
          autoMapping[field as keyof FieldMapping] = match;
        }
      });
      setFieldMapping(autoMapping);
      
      toast.success(`Loaded ${rows.length} rows from CSV`);
    };
    reader.readAsText(file);
  };

  const handleMappingChange = (field: keyof FieldMapping, value: string) => {
    setFieldMapping(prev => ({ ...prev, [field]: value === 'none' ? undefined : value }));
  };

  const validateMapping = (): boolean => {
    for (const field of REQUIRED_FIELDS) {
      if (!fieldMapping[field as keyof FieldMapping]) {
        toast.error(`Please map the required field: ${field}`);
        return false;
      }
    }
    return true;
  };

  const handleImport = async () => {
    if (!validateMapping()) return;

    setIsUploading(true);
    setUploadProgress(0);
    setImportResults(null);

    let success = 0;
    let failed = 0;

    try {
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        
        const entry = {
          name: row[fieldMapping.name!] || '',
          email: row[fieldMapping.email!] || '',
          phone: fieldMapping.phone ? row[fieldMapping.phone] || null : null,
          job_title: fieldMapping.job_title ? row[fieldMapping.job_title] || null : null,
          sector: fieldMapping.sector ? row[fieldMapping.sector] || null : null,
          location: fieldMapping.location ? row[fieldMapping.location] || null : null,
          message: fieldMapping.message ? row[fieldMapping.message] || null : null,
          source: 'admin_bulk',
          added_by: user?.id || null,
        };

        // Skip rows without required fields
        if (!entry.name || !entry.email) {
          failed++;
          continue;
        }

        const { error } = await supabase.from('cv_submissions').insert(entry);
        
        if (error) {
          console.error('Insert error:', error);
          failed++;
        } else {
          success++;
        }

        setUploadProgress(Math.round(((i + 1) / csvData.length) * 100));
      }

      setImportResults({ success, failed });
      
      if (success > 0) {
        toast.success(`Successfully imported ${success} CV entries`);
        onSuccess?.();
      }
      
      if (failed > 0) {
        toast.warning(`${failed} entries failed to import`);
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error('Import failed: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const clearData = () => {
    setCsvData([]);
    setCsvHeaders([]);
    setFieldMapping({});
    setImportResults(null);
    setUploadProgress(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Bulk CSV Import
        </CardTitle>
        <CardDescription>
          Upload a CSV file with candidate data. Map fields and import multiple entries at once.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {csvData.length === 0 ? (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <Label htmlFor="csv_upload" className="cursor-pointer">
              <span className="text-primary font-medium">Click to upload CSV</span>
              <span className="text-muted-foreground"> or drag and drop</span>
            </Label>
            <Input
              id="csv_upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground mt-2">
              CSV with columns: name, email, phone, job_title, sector, location
            </p>
          </div>
        ) : (
          <>
            {/* Field Mapping */}
            <div className="space-y-4">
              <h4 className="font-medium">Map CSV Columns to Fields</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...REQUIRED_FIELDS, ...OPTIONAL_FIELDS].map((field) => (
                  <div key={field} className="space-y-1">
                    <Label className="text-xs">
                      {field.replace('_', ' ')}{' '}
                      {REQUIRED_FIELDS.includes(field) && <span className="text-destructive">*</span>}
                    </Label>
                    <Select
                      value={fieldMapping[field as keyof FieldMapping] || 'none'}
                      onValueChange={(value) => handleMappingChange(field as keyof FieldMapping, value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Not mapped --</SelectItem>
                        {csvHeaders.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Table */}
            <div className="space-y-2">
              <h4 className="font-medium">Preview (first 5 rows)</h4>
              <div className="border rounded-lg overflow-auto max-h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {csvHeaders.map((header) => (
                        <TableHead key={header} className="text-xs whitespace-nowrap">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(0, 5).map((row, index) => (
                      <TableRow key={index}>
                        {csvHeaders.map((header) => (
                          <TableCell key={header} className="text-xs">
                            {row[header] || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground">
                Total rows: {csvData.length}
              </p>
            </div>

            {/* Progress */}
            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  Importing... {uploadProgress}%
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
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={clearData}>
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button onClick={handleImport} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import {csvData.length} Entries
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
