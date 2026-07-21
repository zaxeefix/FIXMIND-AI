import { z } from "zod";

export const bookingSchema = z.object({
  customerEmail: z.string().trim().email(),
  customerName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(24),
  deviceCategory: z.enum(["Smartphone", "Tablet", "Laptop", "Smartwatch"]),
  brand: z.string().trim().min(2).max(40),
  deviceModel: z.string().trim().min(2).max(80),
  service: z.string().trim().min(2).max(100),
  fulfillmentMethod: z.enum(["Walk-in", "Pickup"]),
  location: z.string().trim().min(2).max(120),
  address: z.string().trim().max(200).optional(),
  appointmentAt: z.coerce.date().refine((date) => date.getTime() > Date.now(), "Choose a future appointment."),
  notes: z.string().trim().max(1000).optional(),
}).superRefine((value, context) => { if (value.fulfillmentMethod === "Pickup" && (!value.address || value.address.length < 5)) context.addIssue({ code: "custom", path: ["address"], message: "Enter a pickup address." }); });

export type BookingInput = z.infer<typeof bookingSchema>;
