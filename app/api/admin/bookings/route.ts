import { NextResponse } from "next/server";
import { getAdminAuthError } from "../../../lib/admin-auth";
import { bookingsToCsv, listBookings } from "../../../lib/booking-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authError = getAdminAuthError(request);
  if (authError) {
    return authError;
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || undefined;
  const date = url.searchParams.get("date") || undefined;
  const q = url.searchParams.get("q") || undefined;
  const format = url.searchParams.get("format");
  const page = Math.max(Number(url.searchParams.get("page") || 1), 1);
  const pageSize = Math.min(Math.max(Number(url.searchParams.get("pageSize") || 10), 1), 100);
  const limit = format === "csv" ? 500 : pageSize;
  const offset = format === "csv" ? 0 : (page - 1) * pageSize;

  try {
    const { bookings, total } = await listBookings({ status, date, q, limit, offset });

    if (format === "csv") {
      return new NextResponse(bookingsToCsv(bookings), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="appointment-bookings.csv"`,
        },
      });
    }

    return NextResponse.json({ bookings, total, page, pageSize });
  } catch (error) {
    console.error("Failed to list bookings", error);
    return NextResponse.json({ error: "读取预约失败，请稍后再试" }, { status: 500 });
  }
}
