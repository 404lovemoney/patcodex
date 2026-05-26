"use client";

import { FormEvent, useState } from "react";
import { bookingLimits, bookingOptions, businessHours } from "../config/bookings";
import { submitBookingRequest } from "../lib/bookings";
import { getCurrentTimeValue, getTodayDateValue } from "../lib/date-time";

export function BookingForm() {
  const [bookingStatus, setBookingStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [bookingMessage, setBookingMessage] = useState("");
  const [defaultAppointmentDate] = useState(getTodayDateValue);
  const [defaultAppointmentTime] = useState(() => {
    const currentTime = getCurrentTimeValue();

    return currentTime >= businessHours.opensAt && currentTime <= businessHours.closesAt
      ? currentTime
      : businessHours.opensAt;
  });

  const submitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setBookingStatus("submitting");
    setBookingMessage("");

    try {
      await submitBookingRequest(formData);

      form.reset();
      setBookingStatus("success");
      setBookingMessage("预约已提交，门店会尽快联系您确认到店时间。");
    } catch (error) {
      setBookingStatus("error");
      setBookingMessage(error instanceof Error ? error.message : "预约提交失败，请稍后再试");
    }
  };

  return (
    <form className="booking-form" onSubmit={submitBooking}>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="honeypot-field"
      />
      <div className="field">
        <label htmlFor="name">您的称呼</label>
        <input id="name" name="name" type="text" placeholder="例如：林小姐" maxLength={bookingLimits.name} required />
      </div>
      <div className="field">
        <label htmlFor="phone">联系电话</label>
        <input id="phone" name="phone" type="tel" placeholder="用于确认预约" maxLength={bookingLimits.phone} required />
      </div>
      <div className="field">
        <label htmlFor="email">电子邮箱</label>
        <input id="email" name="email" type="email" placeholder="可选，用于接收确认信息" maxLength={bookingLimits.email} />
      </div>
      <div className="field">
        <label htmlFor="pet">宠物类型</label>
        <select id="pet" name="pet">
          {bookingOptions.petTypes.map((petType) => (
            <option key={petType}>{petType}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="service">预约服务</label>
        <select id="service" name="service">
          {bookingOptions.services.map((service) => (
            <option key={service}>{service}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="appointmentDate">期望日期</label>
        <input
          id="appointmentDate"
          name="appointmentDate"
          type="date"
          defaultValue={defaultAppointmentDate}
          min={defaultAppointmentDate}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="appointmentTime">期望时间</label>
        <input
          id="appointmentTime"
          name="appointmentTime"
          type="time"
          defaultValue={defaultAppointmentTime}
          min={businessHours.opensAt}
          max={businessHours.closesAt}
          required
        />
      </div>
      <div className="field full">
        <label htmlFor="message">宠物情况</label>
        <textarea
          id="message"
          name="message"
          placeholder="例如：泰迪，5kg，有轻微打结，比较怕吹风"
          maxLength={bookingLimits.message}
        />
      </div>
      <div className="field full">
        <button className="btn secondary" type="submit" disabled={bookingStatus === "submitting"}>
          {bookingStatus === "submitting" ? "提交中..." : "提交预约"}
        </button>
        {bookingMessage ? (
          <p className={`form-message ${bookingStatus === "error" ? "is-error" : "is-success"}`} role="status">
            {bookingMessage}
          </p>
        ) : null}
      </div>
    </form>
  );
}
