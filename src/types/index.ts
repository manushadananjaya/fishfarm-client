export type WorkerPosition = 'CEO' | 'Worker' | 'Captain';

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface FishFarmSummary {
  id: string;
  name: string;
  gpsLatitude: number;
  gpsLongitude: number;
  numberOfCages: number;
  hasBarge: boolean;
  pictureUrl: string | null;
  workerCount: number;
}

export interface FishFarm {
  id: string;
  name: string;
  gpsLatitude: number;
  gpsLongitude: number;
  numberOfCages: number;
  hasBarge: boolean;
  pictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
  workers: Worker[];
}

export interface Worker {
  id: string;
  fishFarmId: string;
  name: string;
  age: number;
  email: string;
  position: WorkerPosition;
  certifiedUntil: string;
  isExpired: boolean;
  pictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFishFarmBody {
  name: string;
  gpsLatitude: number;
  gpsLongitude: number;
  numberOfCages: number;
  hasBarge: boolean;
  picture?: File;
}

export interface UpdateFishFarmBody {
  name: string;
  gpsLatitude: number;
  gpsLongitude: number;
  numberOfCages: number;
  hasBarge: boolean;
}

export interface CreateWorkerBody {
  name: string;
  age: number;
  email: string;
  position: WorkerPosition;
  certifiedUntil: string;
  picture?: File;
}

export interface UpdateWorkerBody {
  name: string;
  age: number;
  email: string;
  position: WorkerPosition;
  certifiedUntil: string;
}

export interface ProblemDetails {
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

export interface CreateIdResponse {
  id: string;
}

export interface UpdatePictureResponse {
  pictureUrl: string;
}
