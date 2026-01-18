import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import type { InvoiceItem } from '@/types/report';

interface InvoiceStatusTableProps {
  data: InvoiceItem[];
  isLoading?: boolean;
}

const formatCurrency = (value: number | null) => {
  if (value === null) return '-';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function InvoiceStatusTable({ data, isLoading }: InvoiceStatusTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (item: InvoiceItem) => {
    if (item.invoicePaid) {
      return <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">Paid</Badge>;
    }
    if (item.invoiceRaised) {
      return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">Invoiced</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Status</CardTitle>
        <CardDescription>
          Track invoice status for all placements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job / Company</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No placements found
                  </TableCell>
                </TableRow>
              ) : (
                data.slice(0, 10).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.candidateName || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{item.jobTitle || '-'}</span>
                        <span className="text-xs text-muted-foreground">{item.companyName || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(parseISO(item.startDate), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(item.feeValue)}
                    </TableCell>
                    <TableCell>
                      {item.invoiceNumber || '-'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
