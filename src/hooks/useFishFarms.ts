import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import {
  listFishFarms,
  getFishFarm,
  getFishFarmsMap,
  createFishFarm,
  updateFishFarm,
  updateFishFarmPicture,
  deleteFishFarm,
  deleteFishFarmPicture,
} from '../api/fishFarms';
import type { ListFishFarmsParams } from '../api/fishFarms';
import type { FishFarmMapParams } from '../types';
import type { CreateFishFarmBody, UpdateFishFarmBody } from '../types';

export const fishFarmKeys = {
  all: ['fishFarms'] as const,
  lists: () => [...fishFarmKeys.all, 'list'] as const,
  list: (params: ListFishFarmsParams) =>
    [...fishFarmKeys.lists(), params] as const,
  details: () => [...fishFarmKeys.all, 'detail'] as const,
  detail: (id: string) => [...fishFarmKeys.details(), id] as const,
  map: (params: FishFarmMapParams) => [...fishFarmKeys.all, 'map', params] as const,
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


export function useAllFishFarms(
  baseParams: Omit<ListFishFarmsParams, 'pageNumber' | 'pageSize'> = {},
) {
  const PAGE_SIZE = 50; 

  return useQuery({
    queryKey: [...fishFarmKeys.lists(), '__all__', baseParams] as const,
    queryFn: async () => {
      
      const first = await listFishFarms({ ...baseParams, pageNumber: 1, pageSize: PAGE_SIZE });

      if (first.totalPages <= 1) return first.items;

     
      const remaining = await Promise.all(
        Array.from({ length: first.totalPages - 1 }, (_, i) =>
          listFishFarms({ ...baseParams, pageNumber: i + 2, pageSize: PAGE_SIZE }),
        ),
      );

      return [...first.items, ...remaining.flatMap((p) => p.items)];
    },
    staleTime: 60_000,
  });
}

export function useFishFarmsMap(params: FishFarmMapParams = {}) {
  return useQuery({
    queryKey: fishFarmKeys.map(params),
    queryFn: () => getFishFarmsMap(params),
    staleTime: 60_000,
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
