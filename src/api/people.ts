import { apiClient } from './client';
import type {
  PaginatedResult,
  PersonSummaryDto,
  PersonDto,
  CreatePersonRequest,
  UpdatePersonRequest,
  CreateIdResponse,
  UpdatePictureResponse,
} from '../types';

export interface ListPeopleParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  certExpired?: boolean;
}

export async function listPeople(
  params: ListPeopleParams = {},
): Promise<PaginatedResult<PersonSummaryDto>> {
  const { data } = await apiClient.get<PaginatedResult<PersonSummaryDto>>(
    '/api/people',
    { params },
  );
  return data;
}

export async function getPerson(personId: string): Promise<PersonDto> {
  const { data } = await apiClient.get<PersonDto>(`/api/people/${personId}`);
  return data;
}

export async function createPerson(
  body: CreatePersonRequest,
): Promise<CreateIdResponse> {
  const form = new FormData();
  form.append('Name', body.name);
  form.append('Email', body.email);
  form.append('Age', String(body.age));
  form.append('CertifiedUntil', body.certifiedUntil);
  if (body.picture) form.append('Picture', body.picture);

  const { data } = await apiClient.post<CreateIdResponse>('/api/people', form);
  return data;
}

export async function updatePerson(
  personId: string,
  body: UpdatePersonRequest,
): Promise<void> {
  await apiClient.put(`/api/people/${personId}`, body);
}

export async function deletePerson(personId: string): Promise<void> {
  await apiClient.delete(`/api/people/${personId}`);
}

export async function updatePersonPicture(
  personId: string,
  picture: File,
): Promise<UpdatePictureResponse> {
  const form = new FormData();
  form.append('Picture', picture);
  const { data } = await apiClient.patch<UpdatePictureResponse>(
    `/api/people/${personId}/picture`,
    form,
  );
  return data;
}

export async function deletePersonPicture(personId: string): Promise<void> {
  await apiClient.delete(`/api/people/${personId}/picture`);
}
