import { useRef, useState } from 'react';
import { FileText, Download, Eye, Printer, BookOpen, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AutomationUserGuide } from '@/components/admin/documents';

interface DocumentCard {
  id: string;
  title: string;
  description: string;
  category: string;
  version: string;
  lastUpdated: string;
  icon: React.ElementType;
  component: React.ComponentType<any>;
}

const DOCUMENTS: DocumentCard[] = [
  {
    id: 'automation-guide',
    title: 'Automation User Guide',
    description: 'Complete guide for using the automation engine, including triggers, actions, tasks, and best practices.',
    category: 'Phase 7',
    version: '2.6',
    lastUpdated: new Date().toLocaleDateString('en-GB'),
    icon: Zap,
    component: AutomationUserGuide,
  },
];

export default function DocumentsPage() {
  const [previewDoc, setPreviewDoc] = useState<DocumentCard | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = (doc: DocumentCard) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups to download the PDF');
      return;
    }

    // Get the document content
    const content = document.getElementById(`doc-content-${doc.id}`);
    if (!content) {
      // If content not loaded, open preview first
      setPreviewDoc(doc);
      setTimeout(() => handlePrint(doc), 500);
      return;
    }

    // Write the print-ready HTML
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${doc.title} - MyRecruita</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #1a1a1a;
              background: white;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 { font-size: 24px; margin-bottom: 8px; }
            h2 { font-size: 18px; margin-top: 24px; margin-bottom: 12px; color: #333; border-bottom: 1px solid #e5e5e5; padding-bottom: 4px; }
            h3 { font-size: 14px; margin-top: 16px; margin-bottom: 8px; }
            h4 { font-size: 13px; margin-top: 12px; margin-bottom: 6px; }
            p { margin-bottom: 8px; font-size: 12px; }
            ul, ol { margin-bottom: 12px; padding-left: 24px; font-size: 12px; }
            li { margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 11px; }
            th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
            th { background: #f5f5f5; }
            code { background: #f0f0f0; padding: 1px 4px; border-radius: 3px; font-size: 11px; }
            .section { margin-bottom: 24px; page-break-inside: avoid; }
            .card { border: 1px solid #e5e5e5; border-radius: 6px; padding: 12px; margin: 8px 0; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
            .text-center { text-align: center; }
            .text-sm { font-size: 11px; }
            .text-muted { color: #666; }
            .border-l { border-left: 3px solid #333; padding-left: 12px; }
            .bg-muted { background: #f9f9f9; padding: 12px; border-radius: 6px; }
            @media print {
              body { padding: 20px; }
              h2 { page-break-after: avoid; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  const handlePreview = (doc: DocumentCard) => {
    setPreviewDoc(doc);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Documents & Guides
          </h1>
          <p className="text-muted-foreground mt-1">
            User guides, documentation, and training materials
          </p>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOCUMENTS.map((doc) => {
          const Icon = doc.icon;
          return (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary">{doc.category}</Badge>
                </div>
                <CardTitle className="text-lg mt-3">{doc.title}</CardTitle>
                <CardDescription className="text-sm">
                  {doc.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>Version {doc.version}</span>
                  <span>Updated: {doc.lastUpdated}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handlePreview(doc)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handlePrint(doc)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {DOCUMENTS.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Documents Available</h3>
            <p className="text-muted-foreground">
              Documentation and guides will appear here as they are created.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between">
              <DialogTitle>{previewDoc?.title}</DialogTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => previewDoc && handlePrint(previewDoc)}
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Print / Save PDF
                </Button>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-80px)]">
            <div className="p-6" id={`doc-content-${previewDoc?.id}`}>
              {previewDoc && <previewDoc.component />}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Hidden content for printing (loaded docs) */}
      <div className="hidden">
        {DOCUMENTS.map((doc) => (
          <div key={doc.id} id={`doc-content-${doc.id}`}>
            <doc.component />
          </div>
        ))}
      </div>
    </div>
  );
}
