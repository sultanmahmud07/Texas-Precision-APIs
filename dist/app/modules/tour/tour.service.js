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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const tour_model_1 = require("./tour.model");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const cloudinary_config_1 = require("../../config/cloudinary.config");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const tour_constant_1 = require("./tour.constant");
const review_model_1 = require("../review/review.model");
const mongoose_1 = __importDefault(require("mongoose"));
const createTour = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield tour_model_1.Tour.findOne({ slug: data.slug });
    if (exists) {
        throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "A tour with this slug already exists");
    }
    const tour = yield tour_model_1.Tour.create(data);
    return { data: tour };
});
const updateTour = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTour = yield tour_model_1.Tour.findById(id);
    if (!existingTour) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Tour not found.");
    }
    // If slug is being changed, ensure uniqueness
    if (payload.slug && payload.slug !== existingTour.slug) {
        const slugExists = yield tour_model_1.Tour.findOne({ slug: payload.slug, _id: { $ne: id } });
        if (slugExists) {
            throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "Another tour already uses this slug");
        }
    }
    if (payload.images && payload.images.length > 0 && existingTour.images && existingTour.images.length > 0) {
        payload.images = [...payload.images, ...existingTour.images];
    }
    if (payload.deleteImages && payload.deleteImages.length > 0 && existingTour.images && existingTour.images.length > 0) {
        const restDBImages = existingTour.images.filter(imageUrl => { var _a; return !((_a = payload.deleteImages) === null || _a === void 0 ? void 0 : _a.includes(imageUrl)); });
        const updatedPayloadImages = (payload.images || [])
            .filter(imageUrl => { var _a; return !((_a = payload.deleteImages) === null || _a === void 0 ? void 0 : _a.includes(imageUrl)); })
            .filter(imageUrl => !restDBImages.includes(imageUrl));
        payload.images = [...restDBImages, ...updatedPayloadImages];
    }
    // Update doc
    const updatedTour = yield tour_model_1.Tour.findByIdAndUpdate(id, payload, { new: true });
    if (payload.deleteImages && payload.deleteImages.length > 0 && existingTour.images && existingTour.images.length > 0) {
        yield Promise.all(payload.deleteImages.map(url => (0, cloudinary_config_1.deleteImageFromCLoudinary)(url)));
    }
    return { data: updatedTour };
});
// const getAllTours = async (query: Record<string, string>) => {
//   const queryBuilder = new QueryBuilder(Tour.find().populate("author"), query);
//   const tours = await queryBuilder
//     .search(tourSearchableFields)
//     .filter()
//     .sort()
//     .fields()
//     .paginate();
//   const [data, meta] = await Promise.all([tours.build(), queryBuilder.getMeta()]);
//   return {
//     data,
//     meta
//   };
// };
// Assuming Tour, User, and Review models are imported
const getAllTours = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(tour_model_1.Tour.find().populate("author"), query);
    const toursQuery = yield queryBuilder
        .search(tour_constant_1.tourSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [tours, meta] = yield Promise.all([toursQuery.build(), queryBuilder.getMeta()]);
    // 2. Extract unique Author IDs from the fetched tours
    const authorIds = [
        ...new Set(tours
            .map(tour => { var _a, _b; return (_b = (_a = tour.author) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString(); })
            .filter(id => id) // Filter out null/undefined/unpopulated authors
        )
    ];
    // If no tours or no authors found, return early
    if (authorIds.length === 0) {
        return { data: tours, meta };
    }
    // 3. Aggregate Review Data for the fetched Authors
    // Note: This requires the Review model to be imported.
    const reviewStats = yield review_model_1.Review.aggregate([
        // Filter reviews only for the authors currently present in the tours
        { $match: { guide: { $in: authorIds.map(id => new mongoose_1.default.Types.ObjectId(id)) } } },
        // Group by guide ID to calculate statistics
        {
            $group: {
                _id: "$guide", // Group by the guide ID in the Review document
                review_count: { $sum: 1 }, // Count the number of reviews
                avg_rating: { $avg: "$rating" }, // Calculate the average rating
            }
        },
        // Project to format the output
        {
            $project: {
                _id: 0,
                guideId: "$_id",
                review_count: 1,
                avg_rating: { $round: ["$avg_rating", 2] } // Round to 2 decimal places
            }
        }
    ]);
    // 4. Merge Review Stats back into Author Data within the Tour object
    const statsMap = new Map(reviewStats.map(stat => [stat.guideId.toString(), stat]));
    const dataWithStats = tours.map(tour => {
        const tourObj = tour.toObject ? tour.toObject() : tour; // Convert Mongoose document to plain object
        const author = tourObj.author;
        if (author && author._id) {
            const stats = statsMap.get(author._id.toString());
            // Merge stats into the author object
            tourObj.author = Object.assign(Object.assign({}, author), { review_count: stats ? stats.review_count : 0, avg_rating: stats ? stats.avg_rating : 0.0 });
        }
        return tourObj;
    });
    return {
        data: dataWithStats,
        meta
    };
});
const getSearchTours = (query) => __awaiter(void 0, void 0, void 0, function* () {
    // --- 1. Pagination and Sorting Initialization ---
    const page = Math.max(1, Number((query === null || query === void 0 ? void 0 : query.page) || query.p || 1));
    const limit = Math.max(1, Number((query === null || query === void 0 ? void 0 : query.limit) || query.size || 10));
    const skip = (page - 1) * limit;
    // Sorting
    let sortObj = { createdAt: -1 };
    if (query.sort) {
        const s = String(query.sort).trim();
        if (s.startsWith("-"))
            sortObj = { [s.slice(1)]: -1 };
        else if (s.startsWith("+"))
            sortObj = { [s.slice(1)]: 1 };
        else
            sortObj = { [s]: 1 };
    }
    else if (query.sortBy) {
        const order = (query.sortOrder || "desc").toLowerCase() === "asc" ? 1 : -1;
        sortObj = { [query.sortBy]: order };
    }
    // Fields projection (optional)
    let projection = null;
    if (query.fields) {
        const fields = String(query.fields)
            .split(",")
            .map(f => f.trim())
            .filter(Boolean);
        if (fields.length) {
            projection = fields.join(" ");
        }
    }
    // --- 2. Build Mongoose Filters (The 'where' clause) ---
    const filters = {};
    // SEARCH: split terms and require each term to match at least one searchable field
    if (query.search) {
        const raw = String(query.search).trim();
        if (raw.length > 0) {
            const terms = raw.split(/\s+/).map(t => t.trim()).filter(Boolean);
            filters.$and = terms.map(term => {
                const ors = tour_constant_1.tourSearchableFields.map(field => {
                    const obj = {};
                    // Case-insensitive regex for partial match
                    obj[field] = { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
                    return obj;
                });
                return { $or: ors };
            });
        }
    }
    // PRICE RANGE: expects "min-max" or single "min"
    if (query.priceRange || query.price) {
        const range = String(query.priceRange || query.price).trim();
        if (range) {
            const [minRaw, maxRaw] = range.split("-").map(s => s.trim());
            const priceFilter = {};
            if (minRaw !== "" && !Number.isNaN(Number(minRaw)))
                priceFilter.$gte = Number(minRaw);
            if (maxRaw !== undefined && maxRaw !== "" && !Number.isNaN(Number(maxRaw)))
                priceFilter.$lte = Number(maxRaw);
            // if "50" provided without dash, treat as min
            if (!range.includes("-") && !Number.isNaN(Number(range))) {
                priceFilter.$gte = Number(range);
            }
            if (Object.keys(priceFilter).length > 0) {
                filters.fee = priceFilter;
            }
        }
    }
    // CATEGORY: Case-insensitive, flexible match (Corrected)
    if (query.category) {
        const categoryValue = String(query.category).trim();
        if (categoryValue) {
            // If category is a string field, use regex for case-insensitive partial match
            filters.category = { $regex: categoryValue, $options: "i" };
        }
    }
    // LANGUAGE: Case-insensitive, flexible match (Corrected)
    if (query.language) {
        const languageValue = String(query.language).trim();
        if (languageValue) {
            // Assuming tour.language is a string field like "English" or the primary language
            filters.language = { $regex: languageValue, $options: "i" };
            // NOTE: If you wanted to search the Guide's languages (which is an array), 
            // you would need to use aggregation here, but since this is Tour.find(),
            // we assume we are searching the Tour's language field.
        }
    }
    // status/isActive filter
    if (query.status) {
        filters.status = String(query.status).trim();
    }
    if (query.isActive) {
        filters.isActive = String(query.isActive).toLowerCase() === "true";
    }
    // --- 3. Execute Query and Count ---
    // Build initial query
    const baseQuery = tour_model_1.Tour.find(filters);
    if (projection)
        baseQuery.select(projection);
    // populate author so we can merge review stats later
    baseQuery.populate("author");
    // apply sort, skip, limit
    baseQuery.sort(sortObj).skip(skip).limit(limit);
    // execute results and count in parallel
    const [docs, total] = yield Promise.all([
        baseQuery.exec(),
        tour_model_1.Tour.countDocuments(filters).exec() // Count total documents matching filters
    ]);
    // --- 4. Prepare Meta Data ---
    const totalPages = Math.ceil(total / limit) || 1;
    const meta = {
        total,
        page,
        limit,
        totalPages
    };
    // If no docs, return early
    if (!docs || docs.length === 0) {
        return {
            data: [],
            meta
        };
    }
    // --- 5. Aggregate Review Stats for Authors ---
    // Extract unique Author IDs from the fetched tours
    const authorIds = [
        ...new Set(docs
            .map((d) => (d.author && d.author._id ? d.author._id.toString() : null))
            .filter(Boolean))
    ];
    let statsMap = new Map();
    if (authorIds.length > 0) {
        // Aggregation pipeline to calculate stats
        const agg = yield review_model_1.Review.aggregate([
            // Match reviews for authors on the current page
            { $match: { guide: { $in: authorIds.map(id => new mongoose_1.default.Types.ObjectId(id)) } } },
            {
                $group: {
                    _id: "$guide",
                    review_count: { $sum: 1 },
                    avg_rating: { $avg: "$rating" }
                }
            },
            {
                $project: {
                    guideId: "$_id",
                    review_count: 1,
                    avg_rating: { $round: ["$avg_rating", 2] }
                }
            }
        ]).exec();
        statsMap = new Map(agg.map((s) => [s.guideId.toString(), { review_count: s.review_count, avg_rating: s.avg_rating }]));
    }
    // --- 6. Merge Review Stats into each Tour's Author Object ---
    const dataWithStats = docs.map((doc) => {
        // Use .toObject() or spread to convert Mongoose document to a plain object for modification
        const obj = doc.toObject ? doc.toObject() : Object.assign({}, doc);
        const author = obj.author;
        if (author && author._id) {
            const stat = statsMap.get(author._id.toString());
            // Inject review stats into the author object
            obj.author = Object.assign(Object.assign({}, author), { review_count: stat ? stat.review_count : 0, avg_rating: stat ? stat.avg_rating : 0 });
        }
        return obj;
    });
    // --- 7. Return Final Data and Meta ---
    return {
        data: dataWithStats,
        meta
    };
});
const getSingleTour = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Fetch the Tour and populate basic Author details
    const tourQuery = tour_model_1.Tour.findOne({ slug }).populate({
        path: 'author',
        select: 'name email picture bio address guideProfile' // Added guideProfile in case stats are there
    });
    // 2. Execute the query
    const tour = yield tourQuery.lean(); // .lean() for better performance if just reading
    if (!tour) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Tour not found with this slug.");
    }
    // 3. Parallel Fetch: Get Reviews for this Tour AND Author Stats
    const [reviews, authorStats] = yield Promise.all([
        // A. Get all reviews for this specific tour
        review_model_1.Review.find({ tour: tour._id })
            .populate("user", "name picture bio email") // Populate reviewer details
            .sort({ createdAt: -1 }), // Newest reviews first
        // B. Calculate Author's Avg Rating & Review Count (Aggregation)
        review_model_1.Review.aggregate([
            { $match: { guide: new mongoose_1.default.Types.ObjectId(tour.author._id) } },
            {
                $group: {
                    _id: "$guide",
                    avg_rating: { $avg: "$rating" },
                    review_count: { $sum: 1 }
                }
            }
        ])
    ]);
    // 4. Merge Author Stats into the Author object
    const stats = authorStats[0] || { avg_rating: 0, review_count: 0 };
    const tourWithAuthorStats = Object.assign(Object.assign({}, tour), { author: Object.assign(Object.assign({}, tour.author), { avg_rating: parseFloat(stats.avg_rating.toFixed(2)), review_count: stats.review_count }) });
    return {
        data: tourWithAuthorStats,
        reviews: reviews // Return reviews separately or attach to tour object if preferred
    };
});
const getToursByGuide = (guideId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(tour_model_1.Tour.find({ author: guideId }), query);
    const tours = yield queryBuilder
        .search(tour_constant_1.tourSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([tours.build(), queryBuilder.getMeta()]);
    return { data, meta };
});
const deleteTour = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTour = yield tour_model_1.Tour.findById(id);
    if (!existingTour) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Tour not found.");
    }
    // Delete all images (thumbnail + images) from cloudinary if present
    const toDelete = [];
    if (existingTour.thumbnail)
        toDelete.push(existingTour.thumbnail);
    if (Array.isArray(existingTour.images) && existingTour.images.length > 0) {
        toDelete.push(...existingTour.images);
    }
    // Delete DB record
    const deleted = yield tour_model_1.Tour.findByIdAndDelete(id);
    // Attempt cloudinary deletes (best-effort)
    if (toDelete.length > 0) {
        yield Promise.all(toDelete.map((url) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, cloudinary_config_1.deleteImageFromCLoudinary)(url); })));
    }
    return deleted;
});
exports.TourService = {
    createTour,
    getAllTours,
    getSingleTour,
    updateTour,
    deleteTour,
    getToursByGuide,
    getSearchTours
};
