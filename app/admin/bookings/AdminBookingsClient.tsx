"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { bookingStatuses, type BookingStatus } from "../../config/booking-statuses";
import { getBookingTimeSlotLabel } from "../../config/bookings";
import type { AdminBooking } from "../../lib/booking-admin";

const adminTokenStorageKey = "booking_admin_token";
const pageSize = 10;

const statusLabels: Record<BookingStatus, string> = {
  new: "待确认",
  confirmed: "已确认",
  cancelled: "已取消",
  completed: "已完成",
};

const statusClassNames: Record<BookingStatus, string> = {
  new: "pending",
  confirmed: "confirmed",
  cancelled: "cancelled",
  completed: "completed",
};

export function AdminBookingsClient() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const buildQueryString = (options?: {
    status?: string;
    date?: string;
    search?: string;
    page?: number;
    includePagination?: boolean;
  }) => {
    const params = new URLSearchParams();
    const nextStatus = options?.status ?? status;
    const nextDate = options?.date ?? date;
    const nextSearch = options?.search ?? search;
    const nextPage = options?.page ?? page;

    if (nextStatus) {
      params.set("status", nextStatus);
    }
    if (nextDate) {
      params.set("date", nextDate);
    }
    if (nextSearch.trim()) {
      params.set("q", nextSearch.trim());
    }
    if (options?.includePagination !== false) {
      params.set("page", String(nextPage));
      params.set("pageSize", String(pageSize));
    }

    return params.toString();
  };

  const getStoredAdminToken = () => window.localStorage.getItem(adminTokenStorageKey)?.trim() || token.trim();

  const redirectToLogin = () => {
    window.localStorage.removeItem(adminTokenStorageKey);
    setToken("");
    router.replace("/admin/login");
  };

  const handleUnauthorized = (response: Response) => {
    if (response.status !== 401) {
      return false;
    }

    redirectToLogin();
    return true;
  };

  const formatAppointmentTime = (booking: AdminBooking) =>
    `${booking.appointmentDate || "未选日期"} ${getBookingTimeSlotLabel(booking.appointmentTime)}`;

  const getStatusClassName = (bookingStatus: BookingStatus) => `admin-status is-${statusClassNames[bookingStatus]}`;

  const formatDateTime = (value: string | null) => {
    if (!value) {
      return "未记录";
    }

    const dateTime = new Date(value);

    if (Number.isNaN(dateTime.getTime())) {
      return value;
    }

    return dateTime.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const loadBookingsWithToken = async (
    adminToken: string,
    options?: {
      status?: string;
      date?: string;
      search?: string;
      page?: number;
    },
  ) => {
    const nextPage = options?.page ?? page;
    setIsLoading(true);
    setMessage("");

    try {
      const queryString = buildQueryString({ ...options, page: nextPage });
      const response = await fetch(`/api/admin/bookings${queryString ? `?${queryString}` : ""}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (handleUnauthorized(response)) {
        return;
      }

      const result = (await response.json()) as { bookings?: AdminBooking[]; total?: number; error?: string };

      if (!response.ok) {
        throw new Error(result.error || "读取预约失败");
      }

      setBookings(result.bookings || []);
      setTotal(result.total || 0);
      setPage(nextPage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "读取预约失败");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = window.localStorage.getItem(adminTokenStorageKey)?.trim();

    if (!storedToken) {
      router.replace("/admin/login");
      return;
    }

    setToken(storedToken);
    void loadBookingsWithToken(storedToken, { page: 1 });
  }, [router]);

  const loadBookings = async (event?: FormEvent<HTMLFormElement>, nextPage = 1) => {
    event?.preventDefault();
    const adminToken = getStoredAdminToken();

    if (!adminToken) {
      redirectToLogin();
      return;
    }

    await loadBookingsWithToken(adminToken, { page: nextPage });
  };

  const resetFilters = async () => {
    const adminToken = getStoredAdminToken();

    setStatus("");
    setDate("");
    setSearch("");

    if (!adminToken) {
      redirectToLogin();
      return;
    }

    await loadBookingsWithToken(adminToken, {
      status: "",
      date: "",
      search: "",
      page: 1,
    });
  };

  const updateStatus = async (id: string, nextStatus: BookingStatus) => {
    setMessage("");
    const adminToken = getStoredAdminToken();

    if (!adminToken) {
      redirectToLogin();
      return;
    }

    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (handleUnauthorized(response)) {
        return;
      }

      const result = (await response.json()) as { booking?: AdminBooking; error?: string };

      if (!response.ok || !result.booking) {
        throw new Error(result.error || "更新预约失败");
      }

      await loadBookings(undefined, page);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "更新预约失败");
    }
  };

  const exportCsv = async () => {
    setMessage("");
    const adminToken = getStoredAdminToken();

    if (!adminToken) {
      redirectToLogin();
      return;
    }

    try {
      const queryString = buildQueryString({ includePagination: false });
      const response = await fetch(`/api/admin/bookings?${queryString ? `${queryString}&` : ""}format=csv`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (handleUnauthorized(response)) {
        return;
      }

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error || "导出失败");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "appointment-bookings.csv";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "导出失败");
    }
  };

  const logout = () => {
    redirectToLogin();
  };

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <div className="admin-head">
          <div>
            <p className="eyebrow">预约后台</p>
            <h1>预约管理</h1>
          </div>
          <div className="admin-head-actions">
            <button className="btn secondary" type="button" onClick={logout}>
              退出登录
            </button>
            <a className="btn" href="/">
              返回首页
            </a>
          </div>
        </div>

        <form className="admin-toolbar" onSubmit={loadBookings}>
          <label>
            状态
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">全部</option>
              {bookingStatuses.map((bookingStatus) => (
                <option value={bookingStatus} key={bookingStatus}>
                  {statusLabels[bookingStatus]}
                </option>
              ))}
            </select>
          </label>
          <label>
            日期
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label className="admin-search-field">
            客户姓名/手机号
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="输入姓名或手机号"
            />
          </label>
          <button className="btn secondary" type="submit" disabled={isLoading}>
            {isLoading ? "查询中..." : "查询"}
          </button>
          <button className="btn" type="button" onClick={resetFilters} disabled={isLoading}>
            重置
          </button>
          <button className="btn" type="button" onClick={exportCsv} disabled={!token.trim()}>
            导出 CSV
          </button>
        </form>

        {message ? (
          <p className="form-message is-error" role="status">
            {message}
          </p>
        ) : null}

        <div className="admin-bookings">
          {bookings.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>预约时间</th>
                    <th>客户姓名</th>
                    <th>手机号</th>
                    <th>宠物类型</th>
                    <th>预约服务</th>
                    <th>预约状态</th>
                    <th>备注</th>
                    <th>提交时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{formatAppointmentTime(booking)}</td>
                      <td>{booking.customerName}</td>
                      <td>{booking.phone}</td>
                      <td>{booking.petType || "未填写"}</td>
                      <td>{booking.serviceType || "未填写"}</td>
                      <td>
                        <span className={getStatusClassName(booking.status)}>{statusLabels[booking.status]}</span>
                      </td>
                      <td className="admin-table-notes">{booking.notes || "未填写"}</td>
                      <td>{formatDateTime(booking.createdAt)}</td>
                      <td>
                        <div className="admin-table-actions">
                          <button type="button" onClick={() => setSelectedBooking(booking)}>
                            查看详情
                          </button>
                          <button type="button" onClick={() => updateStatus(booking.id, "confirmed")}>
                            确认预约
                          </button>
                          <button type="button" onClick={() => updateStatus(booking.id, "cancelled")}>
                            取消预约
                          </button>
                          <button type="button" onClick={() => updateStatus(booking.id, "completed")}>
                            标记完成
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="admin-empty">{isLoading ? "正在读取预约..." : "暂无预约记录。"}</p>
          )}
        </div>

        <div className="admin-pagination">
          <span>
            共 {total} 条，第 {page} / {totalPages} 页
          </span>
          <div>
            <button type="button" onClick={() => loadBookings(undefined, page - 1)} disabled={isLoading || page <= 1}>
              上一页
            </button>
            <button
              type="button"
              onClick={() => loadBookings(undefined, page + 1)}
              disabled={isLoading || page >= totalPages}
            >
              下一页
            </button>
          </div>
        </div>
      </section>

      {selectedBooking ? (
        <div className="admin-modal" role="dialog" aria-modal="true" aria-label="预约详情">
          <button className="admin-modal-backdrop" type="button" onClick={() => setSelectedBooking(null)} />
          <div className="admin-modal-panel">
            <div className="admin-modal-head">
              <div>
                <p className="eyebrow">预约详情</p>
                <h2>{selectedBooking.customerName}</h2>
              </div>
              <button type="button" onClick={() => setSelectedBooking(null)}>
                关闭
              </button>
            </div>
            <dl className="admin-detail-list">
              <div>
                <dt>预约时间</dt>
                <dd>{formatAppointmentTime(selectedBooking)}</dd>
              </div>
              <div>
                <dt>手机号</dt>
                <dd>{selectedBooking.phone}</dd>
              </div>
              <div>
                <dt>邮箱</dt>
                <dd>{selectedBooking.email || "未填写"}</dd>
              </div>
              <div>
                <dt>宠物类型</dt>
                <dd>{selectedBooking.petType || "未填写"}</dd>
              </div>
              <div>
                <dt>服务项目</dt>
                <dd>{selectedBooking.serviceType || "未填写"}</dd>
              </div>
              <div>
                <dt>预约状态</dt>
                <dd>{statusLabels[selectedBooking.status]}</dd>
              </div>
              <div>
                <dt>提交时间</dt>
                <dd>{formatDateTime(selectedBooking.createdAt)}</dd>
              </div>
              <div className="is-wide">
                <dt>备注</dt>
                <dd>{selectedBooking.notes || "未填写"}</dd>
              </div>
            </dl>
          </div>
        </div>
      ) : null}
    </main>
  );
}
