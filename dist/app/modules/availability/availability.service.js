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
exports.AvailabilityService = void 0;
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const availability_model_1 = require("./availability.model");
// For Admin: Create or Update a date's availability
const createOrUpdateAvailability = (payloads) => __awaiter(void 0, void 0, void 0, function* () {
    // Map through the array and perform an "upsert" for each date
    const results = yield Promise.all(payloads.map((payload) => __awaiter(void 0, void 0, void 0, function* () {
        return yield availability_model_1.Availability.findOneAndUpdate({ date: payload.date }, // Find by this date
        payload, // Update with this data
        { new: true, upsert: true, runValidators: true } // Upsert options
        );
    })));
    return results;
});
const getAllAvailability = (query) => __awaiter(void 0, void 0, void 0, function* () {
    // You can search by date or service type
    const searchableFields = ['date', 'serviceType', 'timezone'];
    const queryBuilder = new QueryBuilder_1.QueryBuilder(availability_model_1.Availability.find(), query)
        .search(searchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        queryBuilder.build(), // executes the query
        queryBuilder.getMeta() // gets pagination details
    ]);
    return {
        data,
        meta
    };
});
const getAvailableDates = (startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    const dates = yield availability_model_1.Availability.find({
        date: { $gte: startDate, $lte: endDate },
        $expr: { $gt: [{ $size: "$slots" }, 0] } // Only return dates that actually have slots left
    }).select("date -_id"); // Return only the date string
    return dates.map(d => d.date); // Returns array like: ["2026-04-20", "2026-04-24"]
});
// For Frontend Time Selection: Get slots for a specific date
const getAvailabilityByDate = (date) => __awaiter(void 0, void 0, void 0, function* () {
    const availability = yield availability_model_1.Availability.findOne({ date }).select('-_id date timezone slots bookingMode');
    if (!availability) {
        throw new Error("No available slots for this date");
    }
    return availability;
});
exports.AvailabilityService = {
    createOrUpdateAvailability,
    getAvailableDates,
    getAllAvailability,
    getAvailabilityByDate
};
