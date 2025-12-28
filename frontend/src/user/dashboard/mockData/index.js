// src/pages/user/dashboard/mockData.js

export const userData = {
  profile: {
    name: "Asima Motana",
    email: "asima@example.com",
    contact: "+91 9876543210",
  },
  bookings: [
    {
      pgName: "Sunrise PG",
      roomType: "Single Sharing",
      status: "Confirmed",
      checkIn: "2025-12-30",
      checkOut: "2026-01-30",
      amountPaid: "₹4500",
    },
    {
      pgName: "Sunset Hostel",
      roomType: "Double Sharing",
      status: "Pending",
      checkIn: "2026-01-05",
      checkOut: "2026-02-05",
      amountPaid: "₹3500",
    },
  ],
  payments: [
    {
      pgName: "Sunrise PG",
      amount: "₹4500",
      date: "2025-12-28",
      status: "Paid",
    },
    {
      pgName: "Sunset Hostel",
      amount: "₹3500",
      date: "2025-12-25",
      status: "Pending",
    },
  ],
};
