export interface IAvailability {
    date: string;         // Format: YYYY-MM-DD
    timezone: string;     // e.g., "America/Chicago" or "Eastern Time (ET)"
    slots: string[];      // Array of times, e.g., ["09:00", "10:30", "12:00"]
    bookingMode: string;  // e.g., "EXACT_TIME"
    serviceType?: string; // Optional: e.g., "Roofing" (from your UI image)
}