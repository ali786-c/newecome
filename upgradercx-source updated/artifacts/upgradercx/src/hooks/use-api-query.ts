import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from '@tanstack/react-query';

/**
 * Wrapper around useQuery with standardised defaults.
 * Provides typed loading / error / data with zero boilerplate.
 */
export function useApiQuery<T>(
  key: QueryKey,
  fn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T, Error, T, QueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<T, Error, T, QueryKey>({
    queryKey: key,
    queryFn: fn,
    retry: 1,
    staleTime: 30_000, // 30 s
    ...options,
  });
}

/**
 * Wrapper around useMutation with standardised error shape.
 */
export function useApiMutation<TData, TVariables = void>(
  fn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>,
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: fn,
    ...options,
  });
}
