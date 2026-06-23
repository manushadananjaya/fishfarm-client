import { apiClient } from './client';
import type {
  PaginatedResult,
  FarmWorkerDto,
  AssignPersonToFarmRequest,
  UpdateFarmWorkerRequest,
  CreateIdResponse,
} from '../types';

export interface ListFarmWorkersParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  position?: 'CEO' | 'Worker' | 'Captain';
  certExpired?: boolean;
}

export async function listFarmWorkers(
  fishFarmId: string,
  params: ListFarmWorkersParams = {},
): Promise<PaginatedResult<FarmWorkerDto>> {
  const { data } = await apiClient.get<PaginatedResult<FarmWorkerDto>>(
    `/api/fishfarms/${fishFarmId}/workers`,
    { params },
  );
  return data;
}

export async function getFarmWorker(
  fishFarmId: string,
  farmWorkerId: string,
): Promise<FarmWorkerDto> {
  const { data } = await apiClient.get<FarmWorkerDto>(
    `/api/fishfarms/${fishFarmId}/workers/${farmWorkerId}`,
  );
  return data;
}

export async function assignPersonToFarm(
  fishFarmId: string,
  body: AssignPersonToFarmRequest,
): Promise<CreateIdResponse> {
  const { data } = await apiClient.post<CreateIdResponse>(
    `/api/fishfarms/${fishFarmId}/workers`,
    body,
  );
  return data;
}

export async function updateFarmWorkerRole(
  fishFarmId: string,
  farmWorkerId: string,
  body: UpdateFarmWorkerRequest,
): Promise<void> {
  await apiClient.put(
    `/api/fishfarms/${fishFarmId}/workers/${farmWorkerId}`,
    body,
  );
}

export async function removeFarmWorker(
  fishFarmId: string,
  farmWorkerId: string,
): Promise<void> {
  await apiClient.delete(
    `/api/fishfarms/${fishFarmId}/workers/${farmWorkerId}`,
  );
}
