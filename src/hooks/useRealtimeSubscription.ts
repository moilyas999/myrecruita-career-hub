import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { RealtimeChannel } from '@supabase/supabase-js';

type PostgresChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface ChangePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, any>;
  old: Record<string, any>;
}

interface RealtimeSubscriptionConfig {
  table: string;
  schema?: string;
  event?: PostgresChangeEvent;
  queryKeys: (readonly string[] | string[])[];
  showToasts?: boolean;
  toastMessages?: {
    insert?: (payload: any) => string;
    update?: (payload: any) => string;
    delete?: (payload: any) => string;
  };
  onInsert?: (payload: ChangePayload) => void;
  onUpdate?: (payload: ChangePayload) => void;
  onDelete?: (payload: ChangePayload) => void;
}

export function useRealtimeSubscription(config: RealtimeSubscriptionConfig) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  
  const {
    table,
    schema = 'public',
    event = '*',
    queryKeys,
    showToasts = false,
    toastMessages,
    onInsert,
    onUpdate,
    onDelete,
  } = config;

  useEffect(() => {
    const channelName = `realtime-${table}-${Date.now()}`;
    
    const handleChange = (payload: ChangePayload) => {
      // Invalidate all related queries
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [...key] });
      });

      // Handle specific events
      switch (payload.eventType) {
        case 'INSERT':
          onInsert?.(payload);
          if (showToasts && toastMessages?.insert) {
            toast.success(toastMessages.insert(payload.new));
          }
          break;
        case 'UPDATE':
          onUpdate?.(payload);
          if (showToasts && toastMessages?.update) {
            toast.info(toastMessages.update(payload.new));
          }
          break;
        case 'DELETE':
          onDelete?.(payload);
          if (showToasts && toastMessages?.delete) {
            toast.info(toastMessages.delete(payload.old));
          }
          break;
      }
    };

    channelRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event,
          schema,
          table,
        },
        handleChange as any
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [table, schema, event, queryClient, showToasts]);

  return channelRef.current;
}

// Helper hook to subscribe to multiple tables at once
export function useMultiTableRealtimeSubscription(
  tables: string[],
  queryKeys: (readonly string[] | string[])[],
  options?: {
    showToasts?: boolean;
    schema?: string;
  }
) {
  const queryClient = useQueryClient();
  const channelsRef = useRef<RealtimeChannel[]>([]);

  useEffect(() => {
    const { showToasts = false, schema = 'public' } = options || {};

    // Clean up existing channels
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];

    // Create a channel for each table
    tables.forEach(table => {
      const channelName = `multi-realtime-${table}-${Date.now()}`;
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes' as any,
          {
            event: '*',
            schema,
            table,
          },
          (payload: any) => {
            // Invalidate all related queries
            queryKeys.forEach(key => {
              queryClient.invalidateQueries({ queryKey: [...key] });
            });

            // Show toast for new data
            if (showToasts && payload.eventType === 'INSERT') {
              toast.success(`New ${table.replace(/_/g, ' ')} received`);
            }
          }
        )
        .subscribe();

      channelsRef.current.push(channel);
    });

    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
    };
  }, [tables.join(','), queryClient]);

  return channelsRef.current;
}