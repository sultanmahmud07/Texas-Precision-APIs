import { google } from 'googleapis';
import { envVars } from '../config/env';

const oauth2Client = new google.auth.OAuth2(
  envVars.GOOGLE_CLIENT_ID,
  envVars.GOOGLE_CLIENT_SECRET,
  envVars.GOOGLE_CALLBACK_URL
);

// Set the refresh token globally
oauth2Client.setCredentials({ refresh_token: envVars.GOOGLE_REFRESH_TOKEN });

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

export const createGoogleCalendarEvent = async (data: {
  summary: string;
  location: string;
  description: string;
  startTime: string; // ISO format
  endTime: string;   // ISO format
}) => {
  const event = {
    summary: data.summary,
    location: data.location,
    description: data.description,
    start: {
      dateTime: data.startTime,
      timeZone: 'America/Chicago', // Match your local business timezone
    },
    end: {
      dateTime: data.endTime,
      timeZone: 'America/Chicago',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });

  return response.data;
};