import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

// Types pour les options
type SupabaseQueryOptions<TData = unknown> = Omit<
  UseQueryOptions<TData, Error, TData>,
  'queryKey' | 'queryFn'
> & {
  queryFn: (supabase: SupabaseClient) => Promise<TData>;
};

type SupabaseMutationOptions<TData = unknown, TVariables = unknown> = Omit<
  UseMutationOptions<TData, Error, TVariables>,
  'mutationFn'
> & {
  mutationFn: (params: { supabase: SupabaseClient; data: TVariables }) => Promise<TData>;
};

// Hook pour les queries Supabase
export function useSupabaseQuery<TData = unknown>(
  queryKey: any[],
  options: SupabaseQueryOptions<TData>
) {
  const { queryFn, ...queryOptions } = options;

  return useQuery<TData, Error>({
    queryKey,
    queryFn: () => queryFn(supabase),
    ...queryOptions,
  });
}

// Hook pour les mutations Supabase
export function useSupabaseMutation<TData = unknown, TVariables = unknown>(
  options: SupabaseMutationOptions<TData, TVariables>
) {
  const queryClient = useQueryClient();
  const { mutationFn, ...mutationOptions } = options;

  return useMutation<TData, Error, TVariables>({
    mutationFn: (data) => mutationFn({ supabase, data }),
    onSuccess: (data, variables, context) => {
      // Invalider les queries liées
      queryClient.invalidateQueries();
      
      // Appeler le callback onSuccess s'il existe
      if (mutationOptions.onSuccess) {
        mutationOptions.onSuccess(data, variables, context);
      }
    },
    ...mutationOptions,
  });
}