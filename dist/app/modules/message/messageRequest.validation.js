"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRequestSchema = void 0;
const zod_1 = require("zod");
exports.messageRequestSchema = zod_1.z.object({
    tourDate: zod_1.z.string().min(1, "Tour date is required"),
    meetingTime: zod_1.z.string().min(1, "Meeting time is required"),
    guests: zod_1.z.string().min(1, "Guest range required"),
    hotelAccommodation: zod_1.z.string().optional(),
    interestedTour: zod_1.z.string().min(1),
    message: zod_1.z.string().min(1, "Message is required"),
    guide: zod_1.z.string().min(1, "Guide ID required"),
    area: zod_1.z.string().optional(),
});
