// ── Shared ────────────────────────────────────────────────────────────────

export type WorkerPosition = 'CEO' | 'Worker' | 'Captain';

/** Numeric position used in POST/PUT assignment requests */
export type PositionNumber = 1 | 2 | 3; // 1=CEO  2=Worker  3=Captain

export const POSITION_TO_NUMBER: Record<WorkerPosition, PositionNumber> = {
  CEO: 1, Worker: 2, Captain: 3,
};

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ── Fish Farm ──────────────────────────────────────────────────────────────

export interface FishFarmSummary {
  id: string;
  farmCode: string;
  name: string;
  gpsLatitude: number;
  gpsLongitude: number;
  numberOfCages: number;
  hasBarge: boolean;
  pictureUrl: string | null;
  workerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FishFarm {
  id: string;
  farmCode: string;
  name: string;
  gpsLatitude: number;
  gpsLongitude: number;
  numberOfCages: number;
  hasBarge: boolean;
  pictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
  workers: FarmWorkerDto[];   // ← was Worker[], now FarmWorkerDto[]
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

// ── People (global profiles) ───────────────────────────────────────────────

export interface PersonSummaryDto {
  id: string;
  personCode: string;
  name: string;
  email: string;
  age: number;
  certifiedUntil: string;
  isExpired: boolean;
  pictureUrl: string | null;
  farmCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PersonFarmAssignmentDto {
  farmWorkerId: string;
  fishFarmId: string;
  farmName: string;
  farmCode: string;
  position: WorkerPosition;
}

export interface PersonDto extends PersonSummaryDto {
  assignments: PersonFarmAssignmentDto[];
}

export interface CreatePersonRequest {
  name: string;
  email: string;
  age: number;
  certifiedUntil: string;
  picture?: File;
}

export interface UpdatePersonRequest {
  name: string;
  email: string;
  age: number;
  certifiedUntil: string;
}

// ── Farm Worker Assignments (junction: person ↔ farm + role) ──────────────

export interface FarmWorkerDto {
  id: string;
  fishFarmId: string;
  personId: string;
  personCode: string;
  personName: string;
  personEmail: string;
  personAge: number;
  certifiedUntil: string;
  isExpired: boolean;
  pictureUrl: string | null;
  position: WorkerPosition;
  createdAt: string;
  updatedAt: string;
}

export interface AssignPersonToFarmRequest {
  personId: string;
  position: PositionNumber;
}

export interface UpdateFarmWorkerRequest {
  position: PositionNumber;
}

// ── Map ───────────────────────────────────────────────────────────────────


export interface FishFarmMapDto {
  id: string;
  farmCode: string;
  name: string;
  gpsLatitude: number;
  gpsLongitude: number;
  numberOfCages: number;
  hasBarge: boolean;
  pictureUrl: string | null;
  createdAt: string;    // ISO 8601 UTC
  updatedAt: string;    // ISO 8601 UTC
  workerCount: number;
}

export interface FishFarmMapParams {
  north?: number;
  south?: number;
  east?: number;
  west?: number;
}

// ── Generic responses ─────────────────────────────────────────────────────

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
