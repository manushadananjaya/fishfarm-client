import { apiClient } from './client';
import type {
  PaginatedResult,
  FishFarmSummary,
  FishFarm,
  CreateFishFarmBody,
  UpdateFishFarmBody,
  CreateIdResponse,
  UpdatePictureResponse,
} from '../types';

export interface ListFishFarmsParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  hasBarge?: boolean;
  minCages?: number;
  maxCages?: number;
}

export async function listFishFarms(
  params: ListFishFarmsParams = {},
): Promise<PaginatedResult<FishFarmSummary>> {
  const { data } = await apiClient.get<PaginatedResult<FishFarmSummary>>(
    '/api/fishfarms',
    { params },
  );
  return data;
}

export async function getFishFarm(id: string): Promise<FishFarm> {
  const { data } = await apiClient.get<FishFarm>(`/api/fishfarms/${id}`);
  return data;
}

export async function createFishFarm(
  body: CreateFishFarmBody,
): Promise<CreateIdResponse> {
  const form = new FormData();
  form.append('Name', body.name);
  form.append('GpsLatitude', String(body.gpsLatitude));
  form.append('GpsLongitude', String(body.gpsLongitude));
  form.append('NumberOfCages', String(body.numberOfCages));
  form.append('HasBarge', String(body.hasBarge));
  if (body.picture) form.append('Picture', body.picture);

  const { data } = await apiClient.post<CreateIdResponse>(
    '/api/fishfarms',
    form,
  );
  return data;
}

export async function updateFishFarm(
  id: string,
  body: UpdateFishFarmBody,
): Promise<void> {
  await apiClient.put(`/api/fishfarms/${id}`, body);
}

export async function updateFishFarmPicture(
  id: string,
  picture: File,
): Promise<UpdatePictureResponse> {
  const form = new FormData();
  form.append('Picture', picture);
  const { data } = await apiClient.patch<UpdatePictureResponse>(
    `/api/fishfarms/${id}/picture`,
    form,
  );
  return data;
}

export async function deleteFishFarm(id: string): Promise<void> {
  await apiClient.delete(`/api/fishfarms/${id}`);
}

export async function deleteFishFarmPicture(id: string): Promise<void> {
  await apiClient.delete(`/api/fishfarms/${id}/picture`);
}
