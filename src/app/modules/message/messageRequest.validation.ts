
import { z } from "zod";

export const messageRequestSchema = z.object({
  tourDate: z.string().min(1, "Tour date is required"),
  meetingTime: z.string().min(1, "Meeting time is required"),
  guests: z.string().min(1, "Guest range required"),
  hotelAccommodation: z.string().optional(),
  interestedTour: z.string().min(1),
  message: z.string().min(1, "Message is required"),
  guide: z.string().min(1, "Guide ID required"),
  area: z.string().optional(),
});
