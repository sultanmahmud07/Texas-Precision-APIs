import { QueryBuilder } from "../../utils/QueryBuilder";
import { IAvailability } from "./availability.interface";
import { Availability } from "./availability.model";


// For Admin: Create or Update a date's availability
const createOrUpdateAvailability = async (payloads: IAvailability[]) => {
    // Map through the array and perform an "upsert" for each date
    const results = await Promise.all(
        payloads.map(async (payload) => {
            return await Availability.findOneAndUpdate(
                { date: payload.date }, // Find by this date
                payload,                // Update with this data
                { new: true, upsert: true, runValidators: true } // Upsert options
            );
        })
    );

    return results;
};

const getAllAvailability = async (query: Record<string, string>) => {
    // You can search by date or service type
    const searchableFields = ['date', 'serviceType', 'timezone'];

    const queryBuilder = new QueryBuilder(Availability.find(), query)
        .search(searchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        queryBuilder.build(), // executes the query
        queryBuilder.getMeta() // gets pagination details
    ]);

    return {
        data,
        meta
    };
};
const getAvailableDates = async (startDate: string, endDate: string) => {
    const dates = await Availability.find({
        date: { $gte: startDate, $lte: endDate },
        $expr: { $gt: [{ $size: "$slots" }, 0] } // Only return dates that actually have slots left
    }).select("date -_id"); // Return only the date string

    return dates.map(d => d.date); // Returns array like: ["2026-04-20", "2026-04-24"]
};

// For Frontend Time Selection: Get slots for a specific date
const getAvailabilityByDate = async (date: string) => {
    const availability = await Availability.findOne({ date }).select('-_id date timezone slots bookingMode');

    if (!availability) {
        throw new Error("No available slots for this date");
    }

    return availability;
};

export const AvailabilityService = {
    createOrUpdateAvailability,
    getAvailableDates,
    getAllAvailability,
    getAvailabilityByDate
};