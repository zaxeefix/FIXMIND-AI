"use server";

import { redirect } from "next/navigation";
import { bookingSchema } from "@/lib/booking";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type BookingState = { error: string; fields?: Record<string, string[]> };

export async function createBooking(_: BookingState, form: FormData): Promise<BookingState> {
  const session = await requireSession("customer");
  const parsed = bookingSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return { error: "Please review the booking details.", fields: parsed.error.flatten().fieldErrors };
  }
  if (!process.env.DATABASE_URL) {
    return { error: "Booking storage is not configured. Please contact support." };
  }

  let bookingId: string;
  try {
    const { address, fulfillmentMethod, notes, customerEmail: _submittedEmail, ...bookingData } = parsed.data;
    void _submittedEmail;
    const location = fulfillmentMethod === "Pickup" ? "Customer pickup" : bookingData.location;
    const customerNotes = [address ? `[Customer address: ${address}]` : "", notes || ""].filter(Boolean).join("\n");
    const booking = await prisma.booking.create({ data: { ...bookingData, customerEmail: session.email, location, notes: customerNotes || undefined, estimatedTotalCents: 9900 } });
    bookingId = booking.id;
  } catch (error) {
    console.warn("Booking failed", error instanceof Error ? error.message : error);
    return { error: "We could not save your booking. Your details remain on this page—please try again." };
  }
  redirect(`/book/confirmation/${bookingId}`);
}
