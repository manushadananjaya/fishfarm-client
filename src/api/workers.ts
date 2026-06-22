import { apiClient } from './client';
import type {
  PaginatedResult,
  Worker,
  CreateWorkerBody,
  UpdateWorkerBody,
  CreateIdResponse,
  UpdatePictureResponse,
} from '../types';

export interface ListWorkersParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  position?: 'CEO' | 'Worker' | 'Captain';
  certExpired?: boolean;
}

export async function listWorkers(
  fishFarmId: string,
  params: ListWorkersParams = {},
): Promise<PaginatedResult<Worker>> {
  const { data } = await apiClient.get<PaginatedResult<Worker>>(
    `/api/fishfarms/${fishFarmId}/workers`,
    { params },
  );
  return data;
}

export async function getWorker(
  fishFarmId: string,
  workerId: string,
): Promise<Worker> {
  const { data } = await apiClient.get<Worker>(
    `/api/fishfarms/${fishFarmId}/workers/${workerId}`,
  );
  return data;
}

export async function createWorker(
  fishFarmId: string,
  body: CreateWorkerBody,
): Promise<CreateIdResponse> {
  const form = new FormData();
  form.append('Name', body.name);
  form.append('Age', String(body.age));
  form.append('Email', body.email);
  form.append('Position', body.position);
  form.append('CertifiedUntil', body.certifiedUntil);
  if (body.picture) form.append('Picture', body.picture);

  const { data } = await apiClient.post<CreateIdResponse>(
    `/api/fishfarms/${fishFarmId}/workers`,
    form,
  );
  return data;
}

export async function updateWorker(
  fishFarmId: string,
  workerId: string,
  body: UpdateWorkerBody,
): Promise<void> {
  await apiClient.put(`/api/fishfarms/${fishFarmId}/workers/${workerId}`, body);
}

export async function updateWorkerPicture(
  fishFarmId: string,
  workerId: string,
  picture: File,
): Promise<UpdatePictureResponse> {
  const form = new FormData();
  form.append('Picture', picture);
  const { data } = await apiClient.patch<UpdatePictureResponse>(
    `/api/fishfarms/${fishFarmId}/workers/${workerId}/picture`,
    form,
  );
  return data;
}

export async function deleteWorker(
  fishFarmId: string,
  workerId: string,
): Promise<void> {
  await apiClient.delete(`/api/fishfarms/${fishFarmId}/workers/${workerId}`);
}

export async function deleteWorkerPicture(
  fishFarmId: string,
  workerId: string,
): Promise<void> {
  await apiClient.delete(
    `/api/fishfarms/${fishFarmId}/workers/${workerId}/picture`,
  );
}
