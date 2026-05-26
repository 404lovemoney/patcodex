export const bookingStatuses = ["new", "confirmed", "cancelled", "completed"] as const;

export type BookingStatus = (typeof bookingStatuses)[number];
