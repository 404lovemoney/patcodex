type BookingNotification = {
  id: string;
  name: string;
  phone: string;
  email: string;
  pet: string;
  service: string;
  appointmentDate: string | null;
  appointmentTime: string | null;
  message: string;
};

export const notifyBookingSubmitted = async (booking: BookingNotification) => {
  const webhookUrl = process.env.BOOKING_NOTIFICATION_WEBHOOK_URL;

  if (!webhookUrl) {
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: "booking.created",
        booking,
      }),
    });

    if (!response.ok) {
      console.error("Booking notification failed", response.status);
    }
  } catch (error) {
    console.error("Booking notification failed", error);
  }
};
