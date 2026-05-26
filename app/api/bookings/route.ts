import { NextResponse } from "next/server";
import { notifyBookingSubmitted } from "../../lib/booking-notifications";
import { getPool } from "../../lib/db";
import { checkBookingRateLimit, normalizeBookingPayload } from "../../lib/booking-validation";

export const runtime = "nodejs";

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

const isBookingPayload = (value: unknown): value is BookingPayload =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export async function POST(request: Request) {
  let payload: BookingPayload;

  try {
    const json = await request.json();
    if (!isBookingPayload(json)) {
      return NextResponse.json({ error: "预约信息格式不正确" }, { status: 400 });
    }

    payload = json;
  } catch {
    return NextResponse.json({ error: "预约信息格式不正确" }, { status: 400 });
  }

  if (!checkBookingRateLimit(request)) {
    return NextResponse.json({ error: "提交太频繁，请稍后再试" }, { status: 429 });
  }

  const normalized = normalizeBookingPayload(payload);

  if (normalized.kind === "honeypot") {
    return NextResponse.json({ ok: true });
  }

  if (normalized.kind === "error") {
    return NextResponse.json({ error: normalized.message }, { status: 400 });
  }

  const { booking, formPayload } = normalized;

  try {
    const db = await getPool();
    const result = await db.query<{ id: string }>(
      `insert into public.appointment_bookings (
        customer_name,
        phone,
        email,
        pet_type,
        appointment_date,
        appointment_time,
        service_type,
        notes,
        form_payload
      ) values ($1, $2, nullif($3, ''), nullif($4, ''), $5::date, $6::time, nullif($7, ''), nullif($8, ''), $9::jsonb)
      returning id`,
      [
        booking.name,
        booking.phone,
        booking.email,
        booking.pet,
        booking.appointmentDate,
        booking.appointmentTime,
        booking.service,
        booking.message,
        JSON.stringify(formPayload),
      ],
    );

    const id = result.rows[0].id;

    await notifyBookingSubmitted({
      id,
      ...booking,
    });

    return NextResponse.json({ id });
  } catch (error) {
    console.error("Failed to create booking", error);
    return NextResponse.json({ error: "预约提交失败，请稍后再试" }, { status: 500 });
  }
}
