import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const adminUsername = process.env.ADMIN_USERNAME?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  const adminToken = process.env.ADMIN_TOKEN?.trim();

  if (!adminUsername || !adminPassword || !adminToken) {
    return NextResponse.json({ code: 503, message: "后台登录配置未完成" }, { status: 503 });
  }

  let payload: { username?: unknown; password?: unknown };

  try {
    const json = await request.json();
    if (typeof json !== "object" || json === null || Array.isArray(json)) {
      return NextResponse.json({ code: 400, message: "请求格式不正确" }, { status: 400 });
    }

    payload = json;
  } catch {
    return NextResponse.json({ code: 400, message: "请求格式不正确" }, { status: 400 });
  }

  if (payload.username !== adminUsername || payload.password !== adminPassword) {
    return NextResponse.json({ code: 401, message: "账号或密码错误" }, { status: 401 });
  }

  return NextResponse.json({
    code: 200,
    message: "登录成功",
    data: {
      token: adminToken,
    },
  });
}
