import { NextResponse } from "next/server";

export const getAdminAuthError = (request: Request) => {
  const adminToken = process.env.BOOKING_ADMIN_TOKEN;

  if (!adminToken) {
    return NextResponse.json({ error: "后台访问令牌未配置" }, { status: 503 });
  }

  const requestToken = request.headers.get("x-admin-token");

  if (requestToken !== adminToken) {
    return NextResponse.json({ error: "无权访问预约后台" }, { status: 401 });
  }

  return null;
};
