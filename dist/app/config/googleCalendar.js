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
exports.createGoogleCalendarEvent = void 0;
const googleapis_1 = require("googleapis");
const env_1 = require("../config/env");
const oauth2Client = new googleapis_1.google.auth.OAuth2(env_1.envVars.GOOGLE_CLIENT_ID, env_1.envVars.GOOGLE_CLIENT_SECRET, env_1.envVars.GOOGLE_CALLBACK_URL);
// Set the refresh token globally
oauth2Client.setCredentials({ refresh_token: env_1.envVars.GOOGLE_REFRESH_TOKEN });
const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
const createGoogleCalendarEvent = (data) => __awaiter(void 0, void 0, void 0, function* () {
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
    const response = yield calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
    });
    return response.data;
});
exports.createGoogleCalendarEvent = createGoogleCalendarEvent;
