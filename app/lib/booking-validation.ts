import { bookingLimits, bookingOptions, bookingRateLimit, bookingTimeSlotValues } from "../config/bookings";

type BookingPayload = {
  name?: string;
  phone?: string;
  email?: string;
  pet?: string;
  service?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  message?: string;
  website?: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

const cleanText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const parseOptionalDate = (value: string) => {
  if (!value) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const isValidDate =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;

  return isValidDate ? value : undefined;
};

const parseOptionalTime = (value: string) => {
  if (!value) {
    return null;
  }

  if (!/^\d{2}:\d{2}$/.test(value)) {
    return undefined;
  }

  const [hours, minutes] = value.split(":").map(Number);

  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 ? value : undefined;
};

const getShanghaiDateValue = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
};

const isAllowedValue = <T extends readonly string[]>(value: string, allowedValues: T): value is T[number] =>
  allowedValues.includes(value as T[number]);

const isAllowedBookingTimeSlot = (value: string) => bookingTimeSlotValues.some((timeSlot) => timeSlot === value);

const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const netlifyIp = request.headers.get("x-nf-client-connection-ip");
  const realIp = request.headers.get("x-real-ip");

  return forwardedFor?.split(",")[0]?.trim() || netlifyIp || realIp || "unknown";
};

export const checkBookingRateLimit = (request: Request) => {
  const now = Date.now();
  const clientIp = getClientIp(request);
  const current = rateLimitStore.get(clientIp);

  if (rateLimitStore.size > 1000) {
    for (const [ip, entry] of rateLimitStore) {
      if (entry.resetAt <= now) {
        rateLimitStore.delete(ip);
      }
    }
  }

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(clientIp, { count: 1, resetAt: now + bookingRateLimit.windowMs });
    return true;
  }

  if (current.count >= bookingRateLimit.maxRequests) {
    return false;
  }

  current.count += 1;
  return true;
};

export const normalizeBookingPayload = (payload: BookingPayload) => {
  const name = cleanText(payload.name);
  const phone = cleanText(payload.phone);
  const email = cleanText(payload.email);
  const pet = cleanText(payload.pet);
  const service = cleanText(payload.service);
  const appointmentDate = cleanText(payload.appointmentDate);
  const appointmentTime = cleanText(payload.appointmentTime);
  const message = cleanText(payload.message);
  const website = cleanText(payload.website);
  const parsedDate = parseOptionalDate(appointmentDate);
  const parsedTime = parseOptionalTime(appointmentTime);

  if (website) {
    return { kind: "honeypot" as const };
  }

  if (!name || !phone) {
    return { kind: "error" as const, message: "请填写您的称呼和联系电话" };
  }

  if (name.length > bookingLimits.name) {
    return { kind: "error" as const, message: `称呼不能超过 ${bookingLimits.name} 个字符` };
  }

  if (phone.length < 6 || phone.length > bookingLimits.phone || !/^[\d\s()+-]+$/.test(phone)) {
    return { kind: "error" as const, message: "联系电话格式不正确" };
  }

  if (email.length > bookingLimits.email) {
    return { kind: "error" as const, message: `电子邮箱不能超过 ${bookingLimits.email} 个字符` };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { kind: "error" as const, message: "电子邮箱格式不正确" };
  }

  if (pet.length > bookingLimits.pet || !isAllowedValue(pet, bookingOptions.petTypes)) {
    return { kind: "error" as const, message: "请选择有效的宠物类型" };
  }

  if (service.length > bookingLimits.service || !isAllowedValue(service, bookingOptions.services)) {
    return { kind: "error" as const, message: "请选择有效的预约服务" };
  }

  if (message.length > bookingLimits.message) {
    return { kind: "error" as const, message: `宠物情况不能超过 ${bookingLimits.message} 个字符` };
  }

  if (parsedDate === undefined || parsedTime === undefined) {
    return { kind: "error" as const, message: "预约日期或时间格式不正确" };
  }

  if (!parsedDate || !parsedTime) {
    return { kind: "error" as const, message: "请选择预约日期和时间" };
  }

  if (parsedDate && parsedDate < getShanghaiDateValue()) {
    return { kind: "error" as const, message: "预约日期不能早于今天" };
  }

  if (parsedTime && !isAllowedBookingTimeSlot(parsedTime)) {
    return { kind: "error" as const, message: "请选择有效的预约时间段" };
  }

  return {
    kind: "ok" as const,
    booking: {
      name,
      phone,
      email,
      pet,
      service,
      appointmentDate: parsedDate,
      appointmentTime: parsedTime,
      message,
    },
    formPayload: {
      pet,
      service,
      appointmentDate: parsedDate,
      appointmentTime: parsedTime,
      hasEmail: Boolean(email),
      messageLength: message.length,
      source: "website",
      submittedAt: new Date().toISOString(),
      piiPolicy: "PII is stored only in dedicated booking columns; form_payload excludes name, phone, email, and notes.",
    },
  };
};
