"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const adminTokenStorageKey = "booking_admin_token";

type LoginResponse = {
  code?: number;
  message?: string;
  data?: {
    token?: string;
  };
};

export function AdminLoginClient() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(adminTokenStorageKey)?.trim()) {
      router.replace("/admin/bookings");
    }
  }, [router]);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });
      const result = (await response.json()) as LoginResponse;

      if (!response.ok || !result.data?.token) {
        throw new Error(result.message || "登录失败");
      }

      window.localStorage.setItem(adminTokenStorageKey, result.data.token);
      router.replace("/admin/bookings");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "登录失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="admin-page admin-login-page">
      <section className="admin-login-shell">
        <div className="admin-login-card">
          <div>
            <p className="eyebrow">预约后台</p>
            <h1>管理员登录</h1>
          </div>

          <form className="admin-login-form" onSubmit={login}>
            <label>
              管理员账号
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
              />
            </label>
            <label>
              管理员密码
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            <button className="btn secondary" type="submit" disabled={isLoading}>
              {isLoading ? "登录中..." : "登录"}
            </button>
          </form>

          {message ? (
            <p className="form-message is-error" role="status">
              {message}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
