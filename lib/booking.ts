import { z } from "zod";

export const bookingSchema = z.object({
  customerEmail: z.string().trim().email(),
  customerName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(24),
  deviceCategory: z.enum(["Smartphone", "Tablet", "Laptop", "Smartwatch"]),
  brand: z.string().trim().min(2).max(40),
  deviceModel: z.string().trim().min(2).max(80),
  service: z.string().trim().min(2).max(100),
  location: z.string().trim().min(2).max(120),
  appointmentAt: z.coerce.date().refine((date) => date.getTime() > Date.now(), "Choose a future appointment."),
  notes: z.string().trim().max(1000).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
