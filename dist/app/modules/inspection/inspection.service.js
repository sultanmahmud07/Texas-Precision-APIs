"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectionService = void 0;
/* eslint-disable no-console */
const googleCalendar_1 = require("../../config/googleCalendar");
const convertTo24Hour_1 = require("../../helpers/convertTo24Hour");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const sendEmail_1 = require("../../utils/sendEmail");
const inspection_constant_1 = require("./inspection.constant");
const inspection_model_1 = require("./inspection.model");
const createInspection = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Save to the database
    const result = yield inspection_model_1.Inspection.create(payload);
    // 2. Format the date beautifully (e.g., from "2026-04-28" to "Tuesday, April 28, 2026")
    const dateObj = new Date(payload.scheduledDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    });
    // 3. Construct the dynamic subject line
    const serviceName = payload.serviceType || "Roofing";
    const emailSubject = `Appointment Confirmed - ${serviceName} - ${formattedDate} at ${payload.scheduledTime}`;
    // 4. Send the confirmation email
    (0, sendEmail_1.sendEmail)({
        to: payload.email,
        subject: emailSubject,
        templateName: "appointmentConfirmed",
        templateData: {
            firstName: payload.firstName,
            formattedDate: formattedDate,
            time: payload.scheduledTime,
            service: serviceName
        }
    }).catch(error => {
        console.error("Failed to send confirmation email:", error);
    });
    // 1. Prepare ISO timestamps for Google Calendar
    const startDateTime = new Date(`${payload.scheduledDate}T${(0, convertTo24Hour_1.convertTo24Hour)(payload.scheduledTime)}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
    // 2. Add to Google Calendar in the background
    (0, googleCalendar_1.createGoogleCalendarEvent)({
        summary: `Roofing Inspection: ${payload.firstName} ${payload.lastName}`,
        location: `${payload.address}, ${payload.city}, ${payload.state} ${payload.zip}`,
        description: `Customer Phone: ${payload.phone}\nNotes: ${payload.notes || 'None'}`,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
    }).catch(err => console.error("Google Calendar Sync Error:", err));
    return result;
});
const getAllInspections = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(inspection_model_1.Inspection.find(), query)
        .search(inspection_constant_1.searchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        queryBuilder.build(),
        queryBuilder.getMeta()
    ]);
    return { data, meta };
});
const getSingleInspection = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield inspection_model_1.Inspection.findById(id);
    if (!result)
        throw new Error("Inspection record not found.");
    return result;
});
const updateInspection = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield inspection_model_1.Inspection.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true
    });
    if (!result)
        throw new Error("Inspection record not found.");
    return result;
});
const deleteInspection = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield inspection_model_1.Inspection.findByIdAndDelete(id);
    if (!result)
        throw new Error("Inspection record not found.");
    return null;
});
exports.InspectionService = {
    createInspection,
    getAllInspections,
    getSingleInspection,
    updateInspection,
    deleteInspection
};
