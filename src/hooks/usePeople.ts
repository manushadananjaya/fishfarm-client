import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import {
  listPeople,
  getPerson,
  createPerson,
  updatePerson,
  deletePerson,
  updatePersonPicture,
  deletePersonPicture,
} from '../api/people';
import type { ListPeopleParams } from '../api/people';
import type { CreatePersonRequest, UpdatePersonRequest } from '../types';

export const personKeys = {
  all: ['people'] as const,
  lists: () => [...personKeys.all, 'list'] as const,
  list: (params: ListPeopleParams) => [...personKeys.lists(), params] as const,
  details: () => [...personKeys.all, 'detail'] as const,
  detail: (id: string) => [...personKeys.details(), id] as const,
};

export function usePeople(params: ListPeopleParams = {}) {
  return useQuery({
    queryKey: personKeys.list(params),
    queryFn: () => listPeople(params),
    placeholderData: keepPreviousData,
  });
}

export function usePerson(personId: string) {
  return useQuery({
    queryKey: personKeys.detail(personId),
    queryFn: () => getPerson(personId),
    enabled: Boolean(personId),
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePersonRequest) => createPerson(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personKeys.lists() });
    },
  });
}

export function useUpdatePerson(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdatePersonRequest) => updatePerson(personId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personKeys.detail(personId) });
      queryClient.invalidateQueries({ queryKey: personKeys.lists() });
    },
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (personId: string) => deletePerson(personId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personKeys.lists() });
    },
  });
}

export function useUpdatePersonPicture(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (picture: File) => updatePersonPicture(personId, picture),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personKeys.detail(personId) });
      queryClient.invalidateQueries({ queryKey: personKeys.lists() });
    },
  });
}

export function useDeletePersonPicture(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deletePersonPicture(personId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personKeys.detail(personId) });
      queryClient.invalidateQueries({ queryKey: personKeys.lists() });
    },
  });
}
