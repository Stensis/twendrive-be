export enum CarStatus {
  AVAILABLE = "available",
  UNAVAILABLE = "unavailable",
  DELETED = "deleted",
}

export const CAR_STATUSES = Object.values(CarStatus);

export const ALLOWED_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

export const AVAILABILITY_STATUSES = ["available", "occupied", "canceled"];
