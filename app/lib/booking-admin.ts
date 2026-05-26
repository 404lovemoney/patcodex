import { getPool } from "./db";
import { bookingStatuses, type BookingStatus } from "../config/booking-statuses";

export type AdminBooking = {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
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
  limit?: number;
}) => {
  const where: string[] = [];
  const values: Array<string | number> = [];

  if (filters.status && isBookingStatus(filters.status)) {
    values.push(filters.status);
    where.push(`status = $${values.length}`);
  }

  if (filters.date && /^\d{4}-\d{2}-\d{2}$/.test(filters.date)) {
    values.push(filters.date);
    where.push(`appointment_date = $${values.length}::date`);
  }

  values.push(Math.min(Math.max(filters.limit ?? 100, 1), 500));

  const db = await getPool();
  const result = await db.query(
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
    ${where.length ? `where ${where.join(" and ")}` : ""}
    order by appointment_date nulls last, appointment_time nulls last, created_at desc
    limit $${values.length}`,
    values,
  );

  return result.rows.map(mapBookingRow);
};

export const updateBookingStatus = async (id: string, status: string) => {
  if (!isBookingStatus(status)) {
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
    [id, status],
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

export const bookingsToCsv = (bookings: AdminBooking[]) => {
  const headers = [
    "id",
    "customerName",
    "phone",
    "email",
    "petType",
    "serviceType",
    "appointmentDate",
    "appointmentTime",
    "status",
    "notes",
    "createdAt",
    "updatedAt",
  ];

  const rows = bookings.map((booking) =>
    [
      booking.id,
      booking.customerName,
      booking.phone,
      booking.email,
      booking.petType,
      booking.serviceType,
      booking.appointmentDate,
      booking.appointmentTime,
      booking.status,
      booking.notes,
      booking.createdAt,
      booking.updatedAt,
    ]
      .map(escapeCsvCell)
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
};
