/**
 * Export Utilities
 * 
 * Generic utility functions for exporting data to CSV format.
 * Used by reports and other data export features.
 */

export interface ExportColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => string | number | null | undefined);
}

/**
 * Format a value for CSV - handles escaping and special characters
 */
function formatCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // If the value contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Convert data array to CSV string
 */
export function toCSV<T>(data: T[], columns: ExportColumn<T>[]): string {
  // Header row
  const headerRow = columns.map(col => formatCSVValue(col.header)).join(',');
  
  // Data rows
  const dataRows = data.map(row => {
    return columns.map(col => {
      const value = typeof col.accessor === 'function' 
        ? col.accessor(row) 
        : row[col.accessor];
      return formatCSVValue(value);
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Trigger a file download in the browser
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV and trigger download
 */
export function exportToCSV<T>(
  data: T[], 
  columns: ExportColumn<T>[], 
  filename: string
): void {
  const csv = toCSV(data, columns);
  const filenameWithExtension = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  downloadFile(csv, filenameWithExtension);
}

/**
 * Format currency for export (no symbols, just numbers)
 */
export function formatCurrencyForExport(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return value.toFixed(2);
}

/**
 * Format date for export (ISO format)
 */
export function formatDateForExport(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().split('T')[0];
}

/**
 * Format percentage for export
 */
export function formatPercentageForExport(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return `${value.toFixed(1)}%`;
}

// ============================================================================
// Pre-configured Export Functions for Common Report Types
// ============================================================================

import type { 
  RevenueForecastData, 
  RevenueMetrics, 
  PlacementByClient, 
  InvoiceItem, 
  RecruiterPerformance 
} from '@/types/report';

/**
 * Export revenue forecast data
 */
export function exportRevenueForecast(data: RevenueForecastData[], dateRange?: string): void {
  const columns: ExportColumn<RevenueForecastData>[] = [
    { header: 'Period', accessor: 'periodLabel' },
    { header: 'Confirmed Revenue', accessor: (row) => formatCurrencyForExport(row.confirmed) },
    { header: 'Pending Revenue', accessor: (row) => formatCurrencyForExport(row.pending) },
    { header: 'Projected Total', accessor: (row) => formatCurrencyForExport(row.projected) },
    { header: 'Placements Count', accessor: 'placementsCount' },
  ];
  
  const filename = `revenue-forecast${dateRange ? `-${dateRange}` : ''}-${formatDateForExport(new Date())}`;
  exportToCSV(data, columns, filename);
}

/**
 * Export placements by client data
 */
export function exportPlacementsByClient(data: PlacementByClient[]): void {
  const columns: ExportColumn<PlacementByClient>[] = [
    { header: 'Client Name', accessor: 'clientName' },
    { header: 'Placements', accessor: 'placementsCount' },
    { header: 'Total Revenue', accessor: (row) => formatCurrencyForExport(row.totalRevenue) },
    { header: 'Average Fee', accessor: (row) => formatCurrencyForExport(row.avgFee) },
  ];
  
  const filename = `placements-by-client-${formatDateForExport(new Date())}`;
  exportToCSV(data, columns, filename);
}

/**
 * Export invoice data
 */
export function exportInvoices(data: InvoiceItem[]): void {
  const columns: ExportColumn<InvoiceItem>[] = [
    { header: 'Invoice Number', accessor: (row) => row.invoiceNumber || 'N/A' },
    { header: 'Candidate', accessor: 'candidateName' },
    { header: 'Job Title', accessor: 'jobTitle' },
    { header: 'Company', accessor: 'companyName' },
    { header: 'Fee Value', accessor: (row) => formatCurrencyForExport(row.feeValue) },
    { header: 'Invoice Date', accessor: (row) => formatDateForExport(row.invoiceDate) },
    { header: 'Start Date', accessor: (row) => formatDateForExport(row.startDate) },
    { header: 'Invoice Raised', accessor: (row) => row.invoiceRaised ? 'Yes' : 'No' },
    { header: 'Invoice Paid', accessor: (row) => row.invoicePaid ? 'Yes' : 'No' },
    { header: 'Status', accessor: 'status' },
  ];
  
  const filename = `invoices-${formatDateForExport(new Date())}`;
  exportToCSV(data, columns, filename);
}

/**
 * Export recruiter performance data
 */
export function exportRecruiterPerformance(data: RecruiterPerformance[]): void {
  const columns: ExportColumn<RecruiterPerformance>[] = [
    { header: 'Name', accessor: 'displayName' },
    { header: 'Email', accessor: 'email' },
    { header: 'CVs Added', accessor: 'cvsAdded' },
    { header: 'Interviews Scheduled', accessor: 'interviewsScheduled' },
    { header: 'Placements Made', accessor: 'placementsMade' },
    { header: 'Revenue Generated', accessor: (row) => formatCurrencyForExport(row.revenueGenerated) },
    { header: 'Avg Time to Fill (days)', accessor: (row) => row.avgTimeToFill?.toFixed(1) || 'N/A' },
    { header: 'Conversion Rate', accessor: (row) => formatPercentageForExport(row.conversionRate) },
    { header: 'Activity Count', accessor: 'activityCount' },
  ];
  
  const filename = `recruiter-performance-${formatDateForExport(new Date())}`;
  exportToCSV(data, columns, filename);
}

/**
 * Export combined revenue report (metrics + forecast + invoices)
 */
export function exportRevenueReport(
  metrics: RevenueMetrics | null,
  forecast: RevenueForecastData[],
  clientPlacements: PlacementByClient[],
  invoices: InvoiceItem[]
): void {
  // Create a summary section
  const summaryLines = [
    'Revenue Report Summary',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    'Key Metrics',
    `Confirmed Revenue,${formatCurrencyForExport(metrics?.totalConfirmed || 0)}`,
    `Pending Revenue,${formatCurrencyForExport(metrics?.totalPending || 0)}`,
    `Projected Total,${formatCurrencyForExport(metrics?.totalProjected || 0)}`,
    `Invoiced Value,${formatCurrencyForExport(metrics?.invoicedValue || 0)}`,
    `Paid Value,${formatCurrencyForExport(metrics?.paidValue || 0)}`,
    `Outstanding Value,${formatCurrencyForExport(metrics?.outstandingValue || 0)}`,
    `Conversion Rate,${formatPercentageForExport(metrics?.conversionRate || 0)}`,
    `Total Placements,${metrics?.placementsCount || 0}`,
    `Average Fee,${formatCurrencyForExport(metrics?.avgFee || 0)}`,
    '',
  ];
  
  // Add forecast data
  const forecastColumns: ExportColumn<RevenueForecastData>[] = [
    { header: 'Period', accessor: 'periodLabel' },
    { header: 'Confirmed', accessor: (row) => formatCurrencyForExport(row.confirmed) },
    { header: 'Pending', accessor: (row) => formatCurrencyForExport(row.pending) },
    { header: 'Projected', accessor: (row) => formatCurrencyForExport(row.projected) },
    { header: 'Placements', accessor: 'placementsCount' },
  ];
  
  summaryLines.push('Revenue Forecast by Period');
  summaryLines.push(toCSV(forecast, forecastColumns));
  summaryLines.push('');
  
  // Add placements by client
  const clientColumns: ExportColumn<PlacementByClient>[] = [
    { header: 'Client', accessor: 'clientName' },
    { header: 'Placements', accessor: 'placementsCount' },
    { header: 'Total Revenue', accessor: (row) => formatCurrencyForExport(row.totalRevenue) },
    { header: 'Avg Fee', accessor: (row) => formatCurrencyForExport(row.avgFee) },
  ];
  
  summaryLines.push('Placements by Client');
  summaryLines.push(toCSV(clientPlacements, clientColumns));
  summaryLines.push('');
  
  // Add invoices
  const invoiceColumns: ExportColumn<InvoiceItem>[] = [
    { header: 'Invoice #', accessor: (row) => row.invoiceNumber || 'N/A' },
    { header: 'Candidate', accessor: 'candidateName' },
    { header: 'Company', accessor: 'companyName' },
    { header: 'Fee', accessor: (row) => formatCurrencyForExport(row.feeValue) },
    { header: 'Status', accessor: 'status' },
    { header: 'Raised', accessor: (row) => row.invoiceRaised ? 'Yes' : 'No' },
    { header: 'Paid', accessor: (row) => row.invoicePaid ? 'Yes' : 'No' },
  ];
  
  summaryLines.push('Invoice Status');
  summaryLines.push(toCSV(invoices, invoiceColumns));
  
  const content = summaryLines.join('\n');
  const filename = `revenue-report-${formatDateForExport(new Date())}.csv`;
  downloadFile(content, filename);
}
