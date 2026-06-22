import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import {
  listWorkers,
  getWorker,
  createWorker,
  updateWorker,
  updateWorkerPicture,
  deleteWorker,
  deleteWorkerPicture,
} from '../api/workers';
import type { ListWorkersParams } from '../api/workers';
import { fishFarmKeys } from './useFishFarms';
import type { CreateWorkerBody, UpdateWorkerBody } from '../types';

export const workerKeys = {
  all: ['workers'] as const,
  lists: () => [...workerKeys.all, 'list'] as const,
  list: (farmId: string, params: ListWorkersParams) =>
    [...workerKeys.lists(), farmId, params] as const,
  details: () => [...workerKeys.all, 'detail'] as const,
  detail: (farmId: string, workerId: string) =>
    [...workerKeys.details(), farmId, workerId] as const,
};

export function useWorkers(farmId: string, params: ListWorkersParams = {}) {
  return useQuery({
    queryKey: workerKeys.list(farmId, params),
    queryFn: () => listWorkers(farmId, params),
    enabled: Boolean(farmId),
    placeholderData: keepPreviousData,
  });
}

export function useWorker(farmId: string, workerId: string) {
  return useQuery({
    queryKey: workerKeys.detail(farmId, workerId),
    queryFn: () => getWorker(farmId, workerId),
    enabled: Boolean(farmId) && Boolean(workerId),
  });
}

export function useCreateWorker(farmId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWorkerBody) => createWorker(farmId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: fishFarmKeys.detail(farmId) });
      queryClient.invalidateQueries({ queryKey: fishFarmKeys.lists() });
    },
  });
}

export function useUpdateWorker(farmId: string, workerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateWorkerBody) =>
      updateWorker(farmId, workerId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workerKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: workerKeys.detail(farmId, workerId),
      });
      queryClient.invalidateQueries({ queryKey: fishFarmKeys.detail(farmId) });
    },
  });
}

export function useUpdateWorkerPicture(farmId: string, workerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (picture: File) =>
      updateWorkerPicture(farmId, workerId, picture),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fishFarmKeys.detail(farmId) });
      queryClient.invalidateQueries({
        queryKey: workerKeys.detail(farmId, workerId),
      });
    },
  });
}

export function useDeleteWorkerPicture(farmId: string, workerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteWorkerPicture(farmId, workerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fishFarmKeys.detail(farmId) });
      queryClient.invalidateQueries({
        queryKey: workerKeys.detail(farmId, workerId),
      });
    },
  });
}

export function useDeleteWorker(farmId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workerId: string) => deleteWorker(farmId, workerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: fishFarmKeys.detail(farmId) });
      queryClient.invalidateQueries({ queryKey: fishFarmKeys.lists() });
    },
  });
}
