import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface SupabaseQueryOptions<T> extends Omit<UseQueryOptions<T, PostgrestError>, 'queryKey' | 'queryFn'> {
  table: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  single?: boolean;
}

interface SupabaseMutationOptions<T, V> extends Omit<UseMutationOptions<T, PostgrestError, V>, 'mutationFn'> {
  table: string;
  operation: 'insert' | 'update' | 'delete' | 'upsert';
  returning?: string;
  onConflict?: string;
}

// Universal query hook for Supabase
export function useSupabaseQuery<T = any>(
  queryKey: any[],
  options: SupabaseQueryOptions<T>
) {
  return useQuery<T, PostgrestError>({
    queryKey,
    queryFn: async () => {
      let query = supabase.from(options.table).select(options.select || '*');

      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (typeof value === 'object' && value.op) {
              // Advanced filters like { op: 'gte', value: 10 }
              switch (value.op) {
                case 'gte':
                  query = query.gte(key, value.value);
                  break;
                case 'lte':
                  query = query.lte(key, value.value);
                  break;
                case 'like':
                  query = query.like(key, value.value);
                  break;
                case 'ilike':
                  query = query.ilike(key, value.value);
                  break;
                case 'is':
                  query = query.is(key, value.value);
                  break;
                default:
                  query = query.eq(key, value);
              }
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      // Single or multiple results
      if (options.single) {
        const { data, error } = await query.single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await query;
        if (error) throw error;
        return data;
      }
    },
    ...options,
  });
}

// Universal mutation hook for Supabase
export function useSupabaseMutation<T = any, V = any>(
  options: SupabaseMutationOptions<T, V>
) {
  const queryClient = useQueryClient();

  return useMutation<T, PostgrestError, V>({
    mutationFn: async (variables: V) => {
      let query;

      switch (options.operation) {
        case 'insert':
          query = supabase
            .from(options.table)
            .insert(variables as any)
            .select(options.returning || '*');
          break;

        case 'update':
          const { id, ...updateData } = variables as any;
          query = supabase
            .from(options.table)
            .update(updateData)
            .eq('id', id)
            .select(options.returning || '*');
          break;

        case 'delete':
          query = supabase
            .from(options.table)
            .delete()
            .eq('id', (variables as any).id);
          break;

        case 'upsert':
          query = supabase
            .from(options.table)
            .upsert(variables as any, {
              onConflict: options.onConflict,
            })
            .select(options.returning || '*');
          break;
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [options.table] });
      
      // Show success message
      const messages = {
        insert: 'Created successfully',
        update: 'Updated successfully',
        delete: 'Deleted successfully',
        upsert: 'Saved successfully',
      };
      toast.success(messages[options.operation]);

      // Call original onSuccess if provided
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Show error message
      toast.error(error.message || `Failed to ${options.operation}`);

      // Call original onError if provided
      options.onError?.(error, variables, context);
    },
    ...options,
  });
}

// Real-time subscription hook
export function useSupabaseSubscription<T = any>(
  table: string,
  callback: (payload: T) => void,
  filters?: Record<string, any>
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase.channel(`${table}_changes`);

    if (filters) {
      Object.entries(filters).forEach(([column, value]) => {
        channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter: `${column}=eq.${value}`,
          },
          (payload) => {
            callback(payload as T);
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: [table] });
          }
        );
      });
    } else {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
        },
        (payload) => {
          callback(payload as T);
          // Invalidate related queries
          queryClient.invalidateQueries({ queryKey: [table] });
        }
      );
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filters, callback, queryClient]);
}

// RPC call hook
export function useSupabaseRPC<T = any, V = any>(
  functionName: string,
  options?: UseMutationOptions<T, PostgrestError, V>
) {
  return useMutation<T, PostgrestError, V>({
    mutationFn: async (args: V) => {
      const { data, error } = await supabase.rpc(functionName, args);
      if (error) throw error;
      return data;
    },
    ...options,
  });
}

// Storage upload hook
export function useSupabaseUpload(
  bucket: string,
  options?: UseMutationOptions<string, Error, File>
) {
  return useMutation<string, Error, File>({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return data.publicUrl;
    },
    onSuccess: (data, variables, context) => {
      toast.success('File uploaded successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error('Failed to upload file');
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
}