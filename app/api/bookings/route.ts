import { NextResponse } from "next/server";
import { getPool } from "../../lib/db";

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
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseOptionalDate(value: string) {
  if (!value) {
    return null;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

function parseOptionalTime(value: string) {
  if (!value) {
    return null;
  }

  return /^\d{2}:\d{2}$/.test(value) ? value : undefined;
}

export async function POST(request: Request) {
  let payload: BookingPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "预约信息格式不正确" }, { status: 400 });
  }

  const name = cleanText(payload.name);
  const phone = cleanText(payload.phone);
  const email = cleanText(payload.email);
  const pet = cleanText(payload.pet);
  const service = cleanText(payload.service);
  const appointmentDate = cleanText(payload.appointmentDate);
  const appointmentTime = cleanText(payload.appointmentTime);
  const message = cleanText(payload.message);
  const parsedDate = parseOptionalDate(appointmentDate);
  const parsedTime = parseOptionalTime(appointmentTime);

  if (!name || !phone) {
    return NextResponse.json({ error: "请填写您的称呼和联系电话" }, { status: 400 });
  }

  if (phone.length < 6 || phone.length > 32) {
    return NextResponse.json({ error: "联系电话格式不正确" }, { status: 400 });
  }

  if (parsedDate === undefined || parsedTime === undefined) {
    return NextResponse.json({ error: "预约日期或时间格式不正确" }, { status: 400 });
  }

  const formPayload = {
    ...payload,
    name,
    phone,
    email,
    pet,
    service,
    appointmentDate,
    appointmentTime,
    message,
  };

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
        name,
        phone,
        email,
        pet,
        parsedDate,
        parsedTime,
        service,
        message,
        JSON.stringify(formPayload),
      ],
    );

    return NextResponse.json({ id: result.rows[0].id });
  } catch (error) {
    console.error("Failed to create booking", error);
    return NextResponse.json({ error: "预约提交失败，请稍后再试" }, { status: 500 });
  }
}
