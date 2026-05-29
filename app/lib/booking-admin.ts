import { getPool } from "./db";
import { bookingStatuses, type BookingStatus } from "../config/booking-statuses";

export type AdminBooking = {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  petName: string | null;
  petType: string | null;
  appointmentDate: string | null;
  appointmentTime: string | null;
  serviceType: string | null;
  notes: string | null;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
};

const isBookingStatus = (value: string): value is BookingStatus =>
  bookingStatuses.includes(value as BookingStatus);

const normalizeBookingStatus = (value: string) => (value === "pending" ? "new" : value);

const mapBookingRow = (row: {
  id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  pet_type: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  service_type: string | null;
  notes: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}): AdminBooking => ({
  id: row.id,
  customerName: row.customer_name,
  phone: row.phone,
  email: row.email,
  petName: null,
  petType: row.pet_type,
  appointmentDate: row.appointment_date,
  appointmentTime: row.appointment_time,
  serviceType: row.service_type,
  notes: row.notes,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const listBookings = async (filters: {
  status?: string;
  date?: string;
  q?: string;
  limit?: number;
  offset?: number;
}) => {
  const where: string[] = [];
  const values: Array<string | number> = [];

  if (filters.status && isBookingStatus(normalizeBookingStatus(filters.status))) {
    values.push(normalizeBookingStatus(filters.status));
    where.push(`status = $${values.length}`);
  }

  if (filters.date && /^\d{4}-\d{2}-\d{2}$/.test(filters.date)) {
    values.push(filters.date);
    where.push(`appointment_date = $${values.length}::date`);
  }

  if (filters.q?.trim()) {
    values.push(`%${filters.q.trim()}%`);
    where.push(`(customer_name ilike $${values.length} or phone ilike $${values.length})`);
  }

  const whereClause = where.length ? `where ${where.join(" and ")}` : "";
  const limit = Math.min(Math.max(filters.limit ?? 100, 1), 500);
  const offset = Math.max(filters.offset ?? 0, 0);

  const listValues = [...values, limit, offset];

  const db = await getPool();
  const [countResult, result] = await Promise.all([
    db.query<{ total: string }>(
      `select count(*)::text as total
      from public.appointment_bookings
      ${whereClause}`,
      values,
    ),
    db.query(
    `select
      id,
      customer_name,
      phone,
      email,
      pet_type,
      appointment_date::text as appointment_date,
      appointment_time::text as appointment_time,
      service_type,
      notes,
      status,
      created_at::text as created_at,
      updated_at::text as updated_at
    from public.appointment_bookings
    ${whereClause}
    order by appointment_date nulls last, appointment_time nulls last, created_at desc
    limit $${values.length + 1}
    offset $${values.length + 2}`,
      listValues,
    ),
  ]);

  return {
    bookings: result.rows.map(mapBookingRow),
    total: Number(countResult.rows[0]?.total || 0),
  };
};

export const updateBookingStatus = async (id: string, status: string) => {
  const nextStatus = normalizeBookingStatus(status);

  if (!isBookingStatus(nextStatus)) {
    return { error: "预约状态不正确" };
  }

  const db = await getPool();
  const result = await db.query(
    `update public.appointment_bookings
    set status = $2
    where id = $1
    returning
      id,
      customer_name,
      phone,
      email,
      pet_type,
      appointment_date::text as appointment_date,
      appointment_time::text as appointment_time,
      service_type,
      notes,
      status,
      created_at::text as created_at,
      updated_at::text as updated_at`,
    [id, nextStatus],
  );

  if (!result.rows[0]) {
    return { error: "预约不存在" };
  }

  return { booking: mapBookingRow(result.rows[0]) };
};

const escapeCsvCell = (value: string | null) => {
  const cell = value ?? "";

  return /[",\n\r]/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell;
};

const csvStatusLabels: Record<BookingStatus, string> = {
  new: "待确认",
  confirmed: "已确认",
  completed: "已完成",
  cancelled: "已取消",
};

export const bookingsToCsv = (bookings: AdminBooking[]) => {
  const headers = [
    "预约时间",
    "客户姓名",
    "手机号",
    "宠物类型",
    "预约服务",
    "预约状态",
    "备注",
    "提交时间",
  ];

  const rows = bookings.map((booking) =>
    [
      `${booking.appointmentDate || "未选日期"} ${booking.appointmentTime || ""}`.trim(),
      booking.customerName,
      `\t${booking.phone}`,
      booking.petType,
      booking.serviceType,
      csvStatusLabels[booking.status],
      booking.notes,
      booking.createdAt,
    ]
      .map(escapeCsvCell)
      .join(","),
  );

  return [headers.join(","), ...rows].join("\r\n");
};
