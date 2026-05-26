export const submitBookingRequest = async (formData: FormData) => {
  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      pet: formData.get("pet"),
      service: formData.get("service"),
      appointmentDate: formData.get("appointmentDate"),
      appointmentTime: formData.get("appointmentTime"),
      message: formData.get("message"),
    }),
  });

  const result = (await response.json()) as { error?: string };

  if (!response.ok) {
    throw new Error(result.error || "预约提交失败，请稍后再试");
  }
};
