/* eslint-disable no-console */
import { createGoogleCalendarEvent } from "../../config/googleCalendar";
import { convertTo24Hour } from "../../helpers/convertTo24Hour";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { sendEmail } from "../../utils/sendEmail";
import { searchableFields } from "./inspection.constant";
import { IInspection } from "./inspection.interface";
import { Inspection } from "./inspection.model";

const createInspection = async (payload: IInspection) => {
    // 1. Save to the database
    const result = await Inspection.create(payload);

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
    sendEmail({
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

    // 5. Send notification email to Admin
    const adminEmailSubject = `New Inspection Scheduled - ${payload.firstName} ${payload.lastName} - ${serviceName}`;
    sendEmail({
        to: "marketing@txprecisionroofs.com",
        subject: adminEmailSubject,
        templateName: "adminInspectionNotification",
        templateData: {
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
            phone: payload.phone,
            address: `${payload.address}, ${payload.city}, ${payload.state} ${payload.zip}`,
            service: serviceName,
            formattedDate: formattedDate,
            time: payload.scheduledTime,
            notes: payload.notes || "None",
            sender: payload.sender
        }
    }).catch(error => {
        console.error("Failed to send admin notification email:", error);
    });

    // Prepare ISO timestamps for Google Calendar
    // const startDateTime = new Date(`${payload.scheduledDate}T${convertTo24Hour(payload.scheduledTime)}:00`);
    // const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    // // Add to Google Calendar in the background
    // createGoogleCalendarEvent({
    //     summary: `Roofing Inspection: ${payload.firstName} ${payload.lastName}`,
    //     location: `${payload.address}, ${payload.city}, ${payload.state} ${payload.zip}`,
    //     description: `Customer Phone: ${payload.phone}\nNotes: ${payload.notes || 'None'}`,
    //     startTime: startDateTime.toISOString(),
    //     endTime: endDateTime.toISOString()
    // }).catch(err => console.error("Google Calendar Sync Error:", err));

    return result;
};

const getAllInspections = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(Inspection.find(), query)
        .search(searchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        queryBuilder.build(),
        queryBuilder.getMeta()
    ]);

    return { data, meta };
};

const getSingleInspection = async (id: string) => {
    const result = await Inspection.findById(id);
    if (!result) throw new Error("Inspection record not found.");
    return result;
};

const updateInspection = async (id: string, payload: Partial<IInspection>) => {
    const result = await Inspection.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true
    });
    if (!result) throw new Error("Inspection record not found.");
    return result;
};

const getBookedSlots = async (date?: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (date && date < today) {
        return [];
    }

    const query: Record<string, any> = {
        status: { $ne: 'Cancelled' },
        scheduledDate: { $gte: today }
    };
    if (date) {
        query.scheduledDate = date;
    }
    const result = await Inspection.find(query).select('scheduledDate scheduledTime');
    return result;
};

const deleteInspection = async (id: string) => {
    const result = await Inspection.findByIdAndDelete(id);
    if (!result) throw new Error("Inspection record not found.");
    return null;
};

export const InspectionService = {
    createInspection,
    getAllInspections,
    getSingleInspection,
    updateInspection,
    deleteInspection,
    getBookedSlots
};