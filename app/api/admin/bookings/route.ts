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
  const format = url.searchParams.get("format");
  const limit = Number(url.searchParams.get("limit") || 100);

  try {
    const bookings = await listBookings({ status, date, limit });

    if (format === "csv") {
      return new NextResponse(bookingsToCsv(bookings), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="appointment-bookings.csv"`,
        },
      });
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Failed to list bookings", error);
    return NextResponse.json({ error: "读取预约失败，请稍后再试" }, { status: 500 });
  }
}
