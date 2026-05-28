export const bookingOptions = {
  petTypes: ["小型犬", "中大型犬", "猫咪", "其他宠物"],
  services: ["精致全护", "轻盈洗护", "造型养护", "到店评估"],
  timeSlots: [
    { value: "10:00", label: "10:00 - 11:00" },
    { value: "11:00", label: "11:00 - 12:00" },
    { value: "12:00", label: "12:00 - 13:00" },
    { value: "13:00", label: "13:00 - 14:00" },
    { value: "14:00", label: "14:00 - 15:00" },
    { value: "15:00", label: "15:00 - 16:00" },
    { value: "16:00", label: "16:00 - 17:00" },
    { value: "17:00", label: "17:00 - 18:00" },
    { value: "18:00", label: "18:00 - 19:00" },
    { value: "19:00", label: "19:00 - 20:00" },
    { value: "20:00", label: "20:00 - 21:00" },
  ],
} as const;

export const bookingTimeSlotValues = bookingOptions.timeSlots.map((slot) => slot.value);

export const normalizeBookingTimeValue = (value: string | null | undefined) => value?.slice(0, 5) || "";

export const getBookingTimeSlotLabel = (value: string | null | undefined) => {
  const normalizedValue = normalizeBookingTimeValue(value);
  const slot = bookingOptions.timeSlots.find((timeSlot) => timeSlot.value === normalizedValue);

  return slot?.label || normalizedValue;
};

export const bookingLimits = {
  name: 40,
  phone: 32,
  email: 120,
  pet: 20,
  service: 20,
  message: 500,
} as const;

export const businessHours = {
  opensAt: "10:00",
  closesAt: "21:00",
} as const;

export const bookingRateLimit = {
  windowMs: 10 * 60 * 1000,
  maxRequests: 5,
} as const;
