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
// src/constants/roles.ts
export const USER_ROLES = ["admin", "car_owner", "car_renter"] as const;
export type UserRole = (typeof USER_ROLES)[number];
