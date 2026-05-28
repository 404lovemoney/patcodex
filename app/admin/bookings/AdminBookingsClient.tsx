"use client";

import { FormEvent, useMemo, useState } from "react";
import { bookingStatuses, type BookingStatus } from "../../config/booking-statuses";
import { getBookingTimeSlotLabel } from "../../config/bookings";
import type { AdminBooking } from "../../lib/booking-admin";

const statusLabels: Record<BookingStatus, string> = {
  new: "待处理",
  confirmed: "已确认",
  cancelled: "已取消",
  completed: "已完成",
};

export function AdminBookingsClient() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (status) {
      params.set("status", status);
    }
    if (date) {
      params.set("date", date);
    }

    return params.toString();
  }, [date, status]);

  const loadBookings = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setIsLoading(true);
    setMessage("");
    const adminToken = token.trim();

    try {
      const response = await fetch(`/api/admin/bookings${queryString ? `?${queryString}` : ""}`, {
        headers: {
          "x-admin-token": adminToken,
        },
      });
      const result = (await response.json()) as { bookings?: AdminBooking[]; error?: string };

      if (!response.ok) {
        throw new Error(result.error || "读取预约失败");
      }

      setBookings(result.bookings || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "读取预约失败");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, nextStatus: BookingStatus) => {
    setMessage("");
    const adminToken = token.trim();

    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = (await response.json()) as { booking?: AdminBooking; error?: string };

      if (!response.ok || !result.booking) {
        throw new Error(result.error || "更新预约失败");
      }

      setBookings((current) => current.map((booking) => (booking.id === id ? result.booking! : booking)));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "更新预约失败");
    }
  };

  const exportCsv = async () => {
    setMessage("");
    const adminToken = token.trim();

    try {
      const response = await fetch(`/api/admin/bookings?${queryString ? `${queryString}&` : ""}format=csv`, {
        headers: {
          "x-admin-token": adminToken,
        },
      });

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

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <div className="admin-head">
          <div>
            <p className="eyebrow">预约后台</p>
            <h1>预约管理</h1>
          </div>
          <a className="btn" href="/">
            返回首页
          </a>
        </div>

        <form className="admin-toolbar" onSubmit={loadBookings}>
          <label>
            管理令牌
            <input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="BOOKING_ADMIN_TOKEN"
              required
            />
          </label>
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
          <button className="btn secondary" type="submit" disabled={isLoading}>
            {isLoading ? "读取中..." : "查看预约"}
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
          {bookings.map((booking) => (
            <article className="admin-booking" key={booking.id}>
              <div>
                <span className={`admin-status is-${booking.status}`}>{statusLabels[booking.status]}</span>
                <h2>{booking.customerName}</h2>
                <p>
                  {booking.appointmentDate || "未选日期"} {getBookingTimeSlotLabel(booking.appointmentTime)}
                </p>
              </div>
              <div className="admin-booking-grid">
                <span>电话：{booking.phone}</span>
                <span>邮箱：{booking.email || "未填写"}</span>
                <span>宠物：{booking.petType || "未填写"}</span>
                <span>服务：{booking.serviceType || "未填写"}</span>
              </div>
              {booking.notes ? <p className="admin-notes">{booking.notes}</p> : null}
              <div className="admin-actions">
                {bookingStatuses.map((bookingStatus) => (
                  <button
                    className={booking.status === bookingStatus ? "is-active" : undefined}
                    type="button"
                    key={bookingStatus}
                    onClick={() => updateStatus(booking.id, bookingStatus)}
                  >
                    {statusLabels[bookingStatus]}
                  </button>
                ))}
              </div>
            </article>
          ))}
          {!bookings.length ? <p className="admin-empty">输入管理令牌后查看预约。</p> : null}
        </div>
      </section>
    </main>
  );
}
