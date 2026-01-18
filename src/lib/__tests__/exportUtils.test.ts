import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  toCSV, 
  exportToCSV, 
  formatCurrencyForExport, 
  formatDateForExport,
  formatPercentageForExport,
  type ExportColumn 
} from '../exportUtils';

// Mock document methods for download testing
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();
const mockRevokeObjectURL = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  
  // Reset URL mock
  global.URL.createObjectURL = vi.fn(() => 'blob:test-url');
  global.URL.revokeObjectURL = mockRevokeObjectURL;
  
  // Reset document mock
  const mockLink = {
    setAttribute: vi.fn(),
    style: {},
    click: mockClick,
  };
  mockCreateElement.mockReturnValue(mockLink);
  document.createElement = mockCreateElement;
  document.body.appendChild = mockAppendChild;
  document.body.removeChild = mockRemoveChild;
});

describe('toCSV', () => {
  it('converts simple data to CSV format', () => {
    const data = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ];
    
    const columns: ExportColumn<typeof data[0]>[] = [
      { header: 'Name', accessor: 'name' },
      { header: 'Age', accessor: 'age' },
    ];
    
    const result = toCSV(data, columns);
    
    expect(result).toBe('Name,Age\nJohn,30\nJane,25');
  });
  
  it('handles values with commas by wrapping in quotes', () => {
    const data = [
      { description: 'Hello, World' },
    ];
    
    const columns: ExportColumn<typeof data[0]>[] = [
      { header: 'Description', accessor: 'description' },
    ];
    
    const result = toCSV(data, columns);
    
    expect(result).toBe('Description\n"Hello, World"');
  });
  
  it('handles values with quotes by escaping them', () => {
    const data = [
      { quote: 'He said "hello"' },
    ];
    
    const columns: ExportColumn<typeof data[0]>[] = [
      { header: 'Quote', accessor: 'quote' },
    ];
    
    const result = toCSV(data, columns);
    
    expect(result).toBe('Quote\n"He said ""hello"""');
  });
  
  it('handles null and undefined values', () => {
    const data = [
      { name: null, value: undefined },
    ] as any[];
    
    const columns: ExportColumn<typeof data[0]>[] = [
      { header: 'Name', accessor: 'name' },
      { header: 'Value', accessor: 'value' },
    ];
    
    const result = toCSV(data, columns);
    
    expect(result).toBe('Name,Value\n,');
  });
  
  it('supports function accessors', () => {
    const data = [
      { firstName: 'John', lastName: 'Doe' },
    ];
    
    const columns: ExportColumn<typeof data[0]>[] = [
      { header: 'Full Name', accessor: (row) => `${row.firstName} ${row.lastName}` },
    ];
    
    const result = toCSV(data, columns);
    
    expect(result).toBe('Full Name\nJohn Doe');
  });
  
  it('handles empty data array', () => {
    const data: { name: string }[] = [];
    
    const columns: ExportColumn<typeof data[0]>[] = [
      { header: 'Name', accessor: 'name' },
    ];
    
    const result = toCSV(data, columns);
    
    expect(result).toBe('Name');
  });
});

describe('formatCurrencyForExport', () => {
  it('formats positive numbers with 2 decimal places', () => {
    expect(formatCurrencyForExport(1234.5)).toBe('1234.50');
    expect(formatCurrencyForExport(0)).toBe('0.00');
    expect(formatCurrencyForExport(100)).toBe('100.00');
  });
  
  it('handles null and undefined', () => {
    expect(formatCurrencyForExport(null)).toBe('');
    expect(formatCurrencyForExport(undefined)).toBe('');
  });
});

describe('formatDateForExport', () => {
  it('formats date strings to ISO date format', () => {
    expect(formatDateForExport('2024-01-15T10:30:00Z')).toBe('2024-01-15');
  });
  
  it('formats Date objects to ISO date format', () => {
    const date = new Date('2024-01-15');
    expect(formatDateForExport(date)).toBe('2024-01-15');
  });
  
  it('handles null and undefined', () => {
    expect(formatDateForExport(null)).toBe('');
    expect(formatDateForExport(undefined)).toBe('');
  });
});

describe('formatPercentageForExport', () => {
  it('formats numbers as percentages with 1 decimal place', () => {
    expect(formatPercentageForExport(75.5)).toBe('75.5%');
    expect(formatPercentageForExport(100)).toBe('100.0%');
    expect(formatPercentageForExport(0)).toBe('0.0%');
  });
  
  it('handles null and undefined', () => {
    expect(formatPercentageForExport(null)).toBe('');
    expect(formatPercentageForExport(undefined)).toBe('');
  });
});

describe('exportToCSV', () => {
  it('creates and triggers download with correct filename', () => {
    const data = [{ name: 'Test' }];
    const columns: ExportColumn<typeof data[0]>[] = [
      { header: 'Name', accessor: 'name' },
    ];
    
    exportToCSV(data, columns, 'test-export');
    
    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockClick).toHaveBeenCalled();
  });
  
  it('appends .csv extension if not present', () => {
    const data = [{ name: 'Test' }];
    const columns: ExportColumn<typeof data[0]>[] = [
      { header: 'Name', accessor: 'name' },
    ];
    
    exportToCSV(data, columns, 'test-export');
    
    const mockLink = mockCreateElement.mock.results[0].value;
    expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'test-export.csv');
  });
  
  it('does not double-append .csv extension', () => {
    const data = [{ name: 'Test' }];
    const columns: ExportColumn<typeof data[0]>[] = [
      { header: 'Name', accessor: 'name' },
    ];
    
    exportToCSV(data, columns, 'test-export.csv');
    
    const mockLink = mockCreateElement.mock.results[0].value;
    expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'test-export.csv');
  });
});
