import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import {
  listFarmWorkers,
  getFarmWorker,
  assignPersonToFarm,
  updateFarmWorkerRole,
  removeFarmWorker,
} from '../api/workers';
import type { ListFarmWorkersParams } from '../api/workers';
import { fishFarmKeys } from './useFishFarms';
import { personKeys } from './usePeople';
import type { AssignPersonToFarmRequest, UpdateFarmWorkerRequest } from '../types';

export const farmWorkerKeys = {
  all: ['farmWorkers'] as const,
  lists: () => [...farmWorkerKeys.all, 'list'] as const,
  list: (farmId: string, params: ListFarmWorkersParams) =>
    [...farmWorkerKeys.lists(), farmId, params] as const,
  details: () => [...farmWorkerKeys.all, 'detail'] as const,
  detail: (farmId: string, farmWorkerId: string) =>
    [...farmWorkerKeys.details(), farmId, farmWorkerId] as const,
};

export function useFarmWorkers(
  farmId: string,
  params: ListFarmWorkersParams = {},
) {
  return useQuery({
    queryKey: farmWorkerKeys.list(farmId, params),
    queryFn: () => listFarmWorkers(farmId, params),
    enabled: Boolean(farmId),
    placeholderData: keepPreviousData,
  });
}

export function useFarmWorker(farmId: string, farmWorkerId: string) {
  return useQuery({
    queryKey: farmWorkerKeys.detail(farmId, farmWorkerId),
    queryFn: () => getFarmWorker(farmId, farmWorkerId),
    enabled: Boolean(farmId) && Boolean(farmWorkerId),
  });
}

export function useAssignPersonToFarm(farmId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AssignPersonToFarmRequest) =>
      assignPersonToFarm(farmId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmWorkerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: fishFarmKeys.detail(farmId) });
      queryClient.invalidateQueries({ queryKey: fishFarmKeys.lists() });
      queryClient.invalidateQueries({ queryKey: personKeys.all });
    },
  });
}

export function useUpdateFarmWorkerRole(
  farmId: string,
  farmWorkerId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateFarmWorkerRequest) =>
      updateFarmWorkerRole(farmId, farmWorkerId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmWorkerKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: farmWorkerKeys.detail(farmId, farmWorkerId),
      });
      queryClient.invalidateQueries({ queryKey: fishFarmKeys.detail(farmId) });
    },
  });
}

export function useRemoveFarmWorker(farmId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (farmWorkerId: string) => removeFarmWorker(farmId, farmWorkerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmWorkerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: fishFarmKeys.detail(farmId) });
      queryClient.invalidateQueries({ queryKey: fishFarmKeys.lists() });
      queryClient.invalidateQueries({ queryKey: personKeys.all });
    },
  });
}
