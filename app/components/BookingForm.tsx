"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { bookingLimits, bookingOptions } from "../config/bookings";
import { submitBookingRequest } from "../lib/bookings";
import { getCurrentTimeValue, getTodayDateValue } from "../lib/date-time";

const getDefaultTimeSlot = () => {
  const currentTime = getCurrentTimeValue();
  const nextSlot =
    bookingOptions.timeSlots.find((slot) => slot.value >= currentTime) ||
    bookingOptions.timeSlots[bookingOptions.timeSlots.length - 1];

  return nextSlot.value;
};

export function BookingForm() {
  const [bookingStatus, setBookingStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [bookingMessage, setBookingMessage] = useState("");
  const statusMessageRef = useRef<HTMLParagraphElement>(null);
  const [defaultAppointmentDate] = useState(getTodayDateValue);
  const [defaultAppointmentTime] = useState(getDefaultTimeSlot);

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

  useEffect(() => {
    if (bookingMessage) {
      statusMessageRef.current?.focus();
    }
  }, [bookingMessage]);

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
        <label htmlFor="appointmentTime">期望时间段</label>
        <select id="appointmentTime" name="appointmentTime" defaultValue={defaultAppointmentTime} required>
          {bookingOptions.timeSlots.map((slot) => (
            <option value={slot.value} key={slot.value}>
              {slot.label}
            </option>
          ))}
        </select>
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
          <p
            ref={statusMessageRef}
            className={`form-message ${bookingStatus === "error" ? "is-error" : "is-success"}`}
            role="status"
            tabIndex={-1}
          >
            {bookingMessage}
          </p>
        ) : null}
      </div>
    </form>
  );
}
