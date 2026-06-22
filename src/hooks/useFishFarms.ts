import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import {
  listFishFarms,
  getFishFarm,
  createFishFarm,
  updateFishFarm,
  updateFishFarmPicture,
  deleteFishFarm,
  deleteFishFarmPicture,
} from '../api/fishFarms';
import type { ListFishFarmsParams } from '../api/fishFarms';
import type { CreateFishFarmBody, UpdateFishFarmBody } from '../types';

export const fishFarmKeys = {
  all: ['fishFarms'] as const,
  lists: () => [...fishFarmKeys.all, 'list'] as const,
  list: (params: ListFishFarmsParams) =>
    [...fishFarmKeys.lists(), params] as const,
  details: () => [...fishFarmKeys.all, 'detail'] as const,
  detail: (id: string) => [...fishFarmKeys.details(), id] as const,
};

export function useFishFarms(params: ListFishFarmsParams = {}) {
  return useQuery({
    queryKey: fishFarmKeys.list(params),
    queryFn: () => listFishFarms(params),
    placeholderData: keepPreviousData,
  });
}

export function useFishFarm(id: string) {
  return useQuery({
    queryKey: fishFarmKeys.detail(id),
    queryFn: () => getFishFarm(id),
    enabled: Boolean(id),
  });
}

export function useCreateFishFarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateFishFarmBody) => createFishFarm(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fishFarmKeys.lists() });
    },
  });
}

export function useUpdateFishFarm(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateFishFarmBody) => updateFishFarm(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fishFarmKeys.lists() });
      queryClient.invalidateQueries({ queryKey: fishFarmKeys.detail(id) });
    },
  });
}

export function useUpdateFishFarmPicture(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (picture: File) => updateFishFarmPicture(id, picture),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fishFarmKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: fishFarmKeys.lists() });
    },
  });
}

export function useDeleteFishFarmPicture(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteFishFarmPicture(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fishFarmKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: fishFarmKeys.lists() });
    },
  });
}

export function useDeleteFishFarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFishFarm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fishFarmKeys.lists() });
    },
  });
}
