import { NextResponse } from "next/server";
import { getAdminAuthError } from "../../../../lib/admin-auth";
import { updateBookingStatus } from "../../../../lib/booking-admin";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const authError = getAdminAuthError(request);
  if (authError) {
    return authError;
  }

  let payload: { status?: string };

  try {
    const json = await request.json();
    if (typeof json !== "object" || json === null || Array.isArray(json)) {
      return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
    }

    payload = json;
  } catch {
    return NextResponse.json({ error: "请求格式不正确" }, { status: 400 });
  }

  const { id } = await context.params;
  const result = await updateBookingStatus(id, payload.status || "");

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ booking: result.booking });
}
