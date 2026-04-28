/* eslint-disable no-console */
// import { createGoogleCalendarEvent } from "../../config/googleCalendar";
// import { convertTo24Hour } from "../../helpers/convertTo24Hour";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { sendEmail } from "../../utils/sendEmail";
import { searchableFields } from "./inspection.constant";
import { IInspection } from "./inspection.interface";
import { Inspection } from "./inspection.model";

const createInspection = async (payload: IInspection) => {
    // 1. Save to the database
    const result = await Inspection.create(payload);

    // 2. Format the date beautifully (e.g., from "2026-04-28" to "Tuesday, April 28, 2026")
    // Note: Adjust the timezone if necessary, but UTC works well for standard YYYY-MM-DD strings
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
    // We do NOT use 'await' here so the API responds to the user instantly, 
    // and the email sends silently in the background!
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
        // Log the error but don't crash the user's booking experience
        console.error("Failed to send confirmation email:", error);
    });
    // 1. Prepare ISO timestamps for Google Calendar
    // Assuming appointments are 60 minutes as per your UI
    // const startDateTime = new Date(`${payload.scheduledDate}T${convertTo24Hour(payload.scheduledTime)}:00`);
    // const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    // // 2. Add to Google Calendar in the background
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
    deleteInspection
};