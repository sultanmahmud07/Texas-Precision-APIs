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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const env_1 = require("../../config/env");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_interface_1 = require("./user.interface");
const user_model_1 = require("./user.model");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const user_constant_1 = require("./user.constant");
const review_model_1 = require("../review/review.model");
const tour_model_1 = require("../tour/tour.model");
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload, rest = __rest(payload, ["email", "password"]);
    const isExist = yield user_model_1.User.findOne({ email });
    if (isExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User already exists");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    const auth = { provider: "credentials", providerId: email };
    const user = yield user_model_1.User.create(Object.assign({ email, password: hashedPassword, auths: [auth] }, rest));
    return user;
});
const updateUser = (payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(decodedToken.userId);
    if (!user)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    if (payload.role) {
        if ([user_interface_1.Role.TOURIST, user_interface_1.Role.GUIDE].includes(decodedToken.role)) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Insufficient role");
        }
        if (payload.role === user_interface_1.Role.SUPER_ADMIN && decodedToken.role === user_interface_1.Role.ADMIN) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only super admin can assign super admin");
        }
    }
    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        if ([user_interface_1.Role.TOURIST, user_interface_1.Role.GUIDE].includes(decodedToken.role)) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Insufficient role");
        }
    }
    if (payload.password) {
        payload.password = yield bcryptjs_1.default.hash(payload.password, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    }
    const updatedUser = yield user_model_1.User.findByIdAndUpdate(decodedToken.userId, payload, {
        new: true,
        runValidators: true
    });
    return updatedUser;
});
const updateUserByAdmin = (userId, payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.role) {
        if ([user_interface_1.Role.TOURIST, user_interface_1.Role.GUIDE].includes(decodedToken.role)) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Insufficient role");
        }
        if (payload.role === user_interface_1.Role.SUPER_ADMIN && decodedToken.role === user_interface_1.Role.ADMIN) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only super admin can assign super admin");
        }
    }
    if (payload.isActive || payload.isDeleted) {
        if ([user_interface_1.Role.TOURIST, user_interface_1.Role.GUIDE].includes(decodedToken.role)) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Insufficient role");
        }
    }
    const updatedUser = yield user_model_1.User.findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true
    });
    return updatedUser;
});
const getAllUsers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(user_model_1.User.find({ isDeleted: false, role: "USER" }), query);
    const users = yield queryBuilder
        .search(user_constant_1.userSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        users.build(),
        queryBuilder.getMeta()
    ]);
    return {
        data,
        meta
    };
});
const getAllAdmin = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(user_model_1.User.find({ role: "ADMIN" }), query);
    const users = yield queryBuilder
        .search(user_constant_1.userSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        users.build(),
        queryBuilder.getMeta()
    ]);
    return {
        data,
        meta
    };
});
// Assuming User and Review models are imported
const getFeaturedGuide = (query) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Initial Find and Pagination (using existing QueryBuilder)
    const initialQuery = { role: "GUIDE" }; // Base query for guides
    const queryBuilder = new QueryBuilder_1.QueryBuilder(user_model_1.User.find(initialQuery), query);
    const usersQuery = yield queryBuilder
        .search(user_constant_1.userSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate(); // Paginate and filter before aggregation
    const [guides, meta] = yield Promise.all([
        usersQuery.build(), // Execute the find query to get the guides
        queryBuilder.getMeta() // Get pagination metadata
    ]);
    // 2. Extract Guide IDs
    const guideIds = guides.map(guide => guide._id);
    // 3. Aggregate Review Data for the fetched Guides
    // Note: This requires the Review model to be imported.
    const reviewStats = yield review_model_1.Review.aggregate([
        // Filter reviews only for the guides currently on the page
        { $match: { guide: { $in: guideIds } } },
        // Group by guide ID to calculate statistics
        {
            $group: {
                _id: "$guide", // Group by the guide ID in the Review document
                review_count: { $sum: 1 }, // Count the number of reviews
                avg_rating: { $avg: "$rating" }, // Calculate the average rating
            }
        },
        // Project to format the output (optional, but good practice)
        {
            $project: {
                _id: 0,
                guideId: "$_id",
                review_count: 1,
                avg_rating: { $round: ["$avg_rating", 2] } // Round to 2 decimal places
            }
        }
    ]);
    // 4. Merge Review Stats back into Guide Data
    const statsMap = new Map(reviewStats.map(stat => [stat.guideId.toString(), stat]));
    const dataWithStats = guides.map(guide => {
        const guideObj = guide.toObject ? guide.toObject() : guide; // Convert Mongoose document to plain object
        const stats = statsMap.get(guideObj._id.toString());
        return Object.assign(Object.assign({}, guideObj), { review_count: stats ? stats.review_count : 0, avg_rating: stats ? stats.avg_rating : 0.0 });
    });
    return {
        data: dataWithStats,
        meta
    };
});
const getFeaturedTourist = (query) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Initial Find and Pagination (using existing QueryBuilder)
    const initialQuery = { role: "TOURIST" }; // Base query for guides
    const queryBuilder = new QueryBuilder_1.QueryBuilder(user_model_1.User.find(initialQuery), query);
    const usersQuery = yield queryBuilder
        .search(user_constant_1.userSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate(); // Paginate and filter before aggregation
    const [guides, meta] = yield Promise.all([
        usersQuery.build(), // Execute the find query to get the guides
        queryBuilder.getMeta() // Get pagination metadata
    ]);
    // 2. Extract Guide IDs
    const guideIds = guides.map(guide => guide._id);
    // 3. Aggregate Review Data for the fetched Guides
    // Note: This requires the Review model to be imported.
    const reviewStats = yield review_model_1.Review.aggregate([
        // Filter reviews only for the guides currently on the page
        { $match: { user: { $in: guideIds } } },
        // Group by guide ID to calculate statistics
        {
            $group: {
                _id: "$user", // Group by the guide ID in the Review document
                review_count: { $sum: 1 }, // Count the number of reviews
                avg_rating: { $avg: "$rating" }, // Calculate the average rating
            }
        },
        // Project to format the output (optional, but good practice)
        {
            $project: {
                _id: 0,
                guideId: "$_id",
                review_count: 1,
                avg_rating: { $round: ["$avg_rating", 2] } // Round to 2 decimal places
            }
        }
    ]);
    // 4. Merge Review Stats back into Guide Data
    const statsMap = new Map(reviewStats.map(stat => [stat.guideId.toString(), stat]));
    const dataWithStats = guides.map(guide => {
        const guideObj = guide.toObject ? guide.toObject() : guide; // Convert Mongoose document to plain object
        const stats = statsMap.get(guideObj._id.toString());
        return Object.assign(Object.assign({}, guideObj), { review_count: stats ? stats.review_count : 0, avg_rating: stats ? stats.avg_rating : 0.0 });
    });
    return {
        data: dataWithStats,
        meta
    };
});
const getSearchGuide = (query) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Initial Find and Pagination (using existing QueryBuilder)
    const initialQuery = { role: "GUIDE" }; // Base query for guides
    const queryBuilder = new QueryBuilder_1.QueryBuilder(user_model_1.User.find(initialQuery), query);
    const usersQuery = yield queryBuilder
        .search(user_constant_1.userSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate(); // Paginate and filter before aggregation
    const [guides, meta] = yield Promise.all([
        usersQuery.build(), // Execute the find query to get the guides
        queryBuilder.getMeta() // Get pagination metadata
    ]);
    // 2. Extract Guide IDs
    const guideIds = guides.map(guide => guide._id);
    // 3. Aggregate Review Data for the fetched Guides
    // Note: This requires the Review model to be imported.
    const reviewStats = yield review_model_1.Review.aggregate([
        // Filter reviews only for the guides currently on the page
        { $match: { guide: { $in: guideIds } } },
        // Group by guide ID to calculate statistics
        {
            $group: {
                _id: "$guide", // Group by the guide ID in the Review document
                review_count: { $sum: 1 }, // Count the number of reviews
                avg_rating: { $avg: "$rating" }, // Calculate the average rating
            }
        },
        // Project to format the output (optional, but good practice)
        {
            $project: {
                _id: 0,
                guideId: "$_id",
                review_count: 1,
                avg_rating: { $round: ["$avg_rating", 2] } // Round to 2 decimal places
            }
        }
    ]);
    // 4. Merge Review Stats back into Guide Data
    const statsMap = new Map(reviewStats.map(stat => [stat.guideId.toString(), stat]));
    const dataWithStats = guides.map(guide => {
        const guideObj = guide.toObject ? guide.toObject() : guide; // Convert Mongoose document to plain object
        const stats = statsMap.get(guideObj._id.toString());
        return Object.assign(Object.assign({}, guideObj), { review_count: stats ? stats.review_count : 0, avg_rating: stats ? stats.avg_rating : 0.0 });
    });
    return {
        data: dataWithStats,
        meta
    };
});
const getAllDeletedUsers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(user_model_1.User.find({ isDeleted: true }), query);
    const users = yield queryBuilder
        .search(user_constant_1.userSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        users.build(),
        queryBuilder.getMeta()
    ]);
    return {
        data,
        meta
    };
});
const getAllUnauthorizedUsers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(user_model_1.User.find({ isVerified: false }), query);
    const users = yield queryBuilder
        .search(user_constant_1.userSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        users.build(),
        queryBuilder.getMeta()
    ]);
    return {
        data,
        meta
    };
});
const getSingleUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id).select("-password");
    return {
        data: user
    };
});
const getGuideDetails = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Fetch the Guide's basic profile
    const user = yield user_model_1.User.findById(id).select("-password");
    if (!user || user.role !== 'GUIDE') {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Guide not found.");
    }
    // 2. Get Aggregated Review Statistics
    const reviewStats = yield review_model_1.Review.aggregate([
        // Filter reviews only for this guide
        { $match: { guide: user._id } },
        // Group by guide ID to calculate statistics
        {
            $group: {
                _id: "$guide",
                review_count: { $sum: 1 },
                avg_rating: { $avg: "$rating" },
            }
        },
        // Project to format the output
        {
            $project: {
                _id: 0,
                review_count: 1,
                avg_rating: { $round: ["$avg_rating", 2] }
            }
        }
    ]);
    // Fetch all Tours authored by this Guide
    const guideTours = yield tour_model_1.Tour.find({ author: user._id }).lean(); // Use .lean() for easier modification
    // 3. Prepare Stats
    const stats = reviewStats[0] || { review_count: 0, avg_rating: 0.0 };
    // 4. Inject Stats into Each Tour's Author Field
    // We map over guideTours and inject the stats into the author field.
    const toursWithStats = guideTours.map(tour => {
        // Create a populated-like author object that includes the aggregated stats
        const authorWithStats = Object.assign(Object.assign({}, user.toObject()), { review_count: stats.review_count, avg_rating: stats.avg_rating });
        return Object.assign(Object.assign({}, tour), { author: authorWithStats });
    });
    // 5. Merge Data for the Guide Profile
    const guideData = user.toObject(); // Convert Mongoose document to plain object
    return {
        data: Object.assign(Object.assign({}, guideData), { review_count: stats.review_count, avg_rating: stats.avg_rating, tours: toursWithStats })
    };
});
const getMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select("-password");
    return {
        data: user
    };
});
const deleteUser = (targetUserId, authUser) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(targetUserId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    // Super-admin can delete anyone
    if (authUser.role === "SUPER_ADMIN" || authUser.role === "ADMIN") {
        yield user_model_1.User.findByIdAndDelete(targetUserId);
        return { data: targetUserId };
    }
    else {
        throw new Error("Your are not authorized to delete this user.");
    }
});
exports.UserServices = {
    createUser,
    getAllUsers,
    getAllAdmin,
    getAllDeletedUsers,
    getAllUnauthorizedUsers,
    updateUser,
    getMe,
    getSingleUser,
    getGuideDetails,
    getFeaturedTourist,
    getFeaturedGuide,
    getSearchGuide,
    deleteUser,
    updateUserByAdmin
};
