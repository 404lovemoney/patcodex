export const bookingOptions = {
  petTypes: ["小型犬", "中大型犬", "猫咪", "其他宠物"],
  services: ["精致全护", "轻盈洗护", "造型养护", "到店评估"],
} as const;

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
