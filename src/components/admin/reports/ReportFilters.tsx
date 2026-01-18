import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, Download, RefreshCw } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ReportPeriod, ReportDateRange } from '@/types/report';
import { PERIOD_CONFIG } from '@/types/report';

interface ReportFiltersProps {
  period: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
  dateRange?: ReportDateRange;
  onDateRangeChange?: (range: ReportDateRange | undefined) => void;
  onExport?: () => void;
  onRefresh?: () => void;
  isExporting?: boolean;
  showExport?: boolean;
}

export function ReportFilters({
  period,
  onPeriodChange,
  dateRange,
  onDateRangeChange,
  onExport,
  onRefresh,
  isExporting,
  showExport = true,
}: ReportFiltersProps) {
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const presetRanges = [
    { label: 'Last 30 days', from: subMonths(new Date(), 1), to: new Date() },
    { label: 'Last 3 months', from: subMonths(new Date(), 3), to: new Date() },
    { label: 'Last 6 months', from: subMonths(new Date(), 6), to: new Date() },
    { label: 'This year', from: startOfMonth(new Date(new Date().getFullYear(), 0, 1)), to: new Date() },
    { label: 'Last year', from: new Date(new Date().getFullYear() - 1, 0, 1), to: new Date(new Date().getFullYear() - 1, 11, 31) },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Period:</span>
        <Select value={period} onValueChange={(v) => onPeriodChange(v as ReportPeriod)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PERIOD_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {onDateRangeChange && (
        <>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">From:</span>
            <Popover open={fromOpen} onOpenChange={setFromOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-36 justify-start text-left font-normal',
                    !dateRange?.from && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? format(new Date(dateRange.from), 'PP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange?.from ? new Date(dateRange.from) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      onDateRangeChange({
                        from: format(date, 'yyyy-MM-dd'),
                        to: dateRange?.to || format(new Date(), 'yyyy-MM-dd'),
                      });
                    }
                    setFromOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">To:</span>
            <Popover open={toOpen} onOpenChange={setToOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-36 justify-start text-left font-normal',
                    !dateRange?.to && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.to ? format(new Date(dateRange.to), 'PP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange?.to ? new Date(dateRange.to) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      onDateRangeChange({
                        from: dateRange?.from || format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
                        to: format(date, 'yyyy-MM-dd'),
                      });
                    }
                    setToOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Select
            value=""
            onValueChange={(value) => {
              const preset = presetRanges.find(p => p.label === value);
              if (preset) {
                onDateRangeChange({
                  from: format(preset.from, 'yyyy-MM-dd'),
                  to: format(preset.to, 'yyyy-MM-dd'),
                });
              }
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Quick select" />
            </SelectTrigger>
            <SelectContent>
              {presetRanges.map((preset) => (
                <SelectItem key={preset.label} value={preset.label}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
        {showExport && onExport && (
          <Button variant="outline" size="sm" onClick={onExport} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        )}
      </div>
    </div>
  );
}
