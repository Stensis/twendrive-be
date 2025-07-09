// src/constants/roles.ts
export const USER_ROLES = ["admin", "car_owner", "car_renter"] as const;
export type UserRole = (typeof USER_ROLES)[number];
