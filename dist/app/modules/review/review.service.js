"use strict";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
exports.ReviewService = void 0;
const review_model_1 = require("./review.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const QueryBuilder_1 = require("../../utils/QueryBuilder");
exports.ReviewService = {
    // async createReview(payload: any, userId: string) {
    //   const booking = await Booking.findById(payload.booking);
    //   if (!booking) {
    //     throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    //   }
    //   if (booking.user._id.toString() !== userId) {
    //     throw new AppError(
    //       httpStatus.FORBIDDEN,
    //       "You cannot review this booking"
    //     );
    //   }
    //   if (booking.status !== BOOKING_STATUS.COMPLETED) {
    //     throw new AppError(
    //       httpStatus.BAD_REQUEST,
    //       "You can only review completed tours"
    //     );
    //   }
    //   const review = await Review.create({
    //     ...payload,
    //     user: userId,
    //   });
    //   return { data: review };
    // },
    createReview(payload, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return { data: null };
        });
    },
    // Get all reviews for a tour (with filter, sort, pagination)
    getReviewsByTour(tourId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const baseQuery = review_model_1.Review.find({ tour: tourId })
                .populate("user", "name email picture")
                .populate("guide", "name email picture");
            const queryBuilder = new QueryBuilder_1.QueryBuilder(baseQuery, query);
            const reviewsQuery = yield queryBuilder.search(["comment"]).filter().sort().paginate();
            const [data, meta] = yield Promise.all([
                reviewsQuery.build(),
                queryBuilder.getMeta(),
            ]);
            return { data, meta };
        });
    },
    getAllReviews(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const baseQuery = review_model_1.Review.find()
                .populate("tour")
                .populate("user", "name email picture")
                .populate("guide", "name email picture");
            const queryBuilder = new QueryBuilder_1.QueryBuilder(baseQuery, query);
            const reviewsQuery = yield queryBuilder.search(["comment"]).filter().sort().paginate();
            const [data, meta] = yield Promise.all([
                reviewsQuery.build(),
                queryBuilder.getMeta(),
            ]);
            return { data, meta };
        });
    },
    // Get reviews for a guide
    getReviewsByGuide(guideId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const baseQuery = review_model_1.Review.find({ guide: guideId })
                .populate("user", "name picture email")
                .populate("tour", "title");
            const queryBuilder = new QueryBuilder_1.QueryBuilder(baseQuery, query);
            const reviewsQuery = yield queryBuilder.search(["comment"]).filter().sort().paginate();
            const [data, meta] = yield Promise.all([
                reviewsQuery.build(),
                queryBuilder.getMeta(),
            ]);
            return { data, meta };
        });
    },
    getReviewsByTourist(id, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const baseQuery = review_model_1.Review.find({ user: id })
                .populate("user", "name picture email")
                .populate("guide", "name picture email")
                .populate("tour", "title slug description images fee");
            const queryBuilder = new QueryBuilder_1.QueryBuilder(baseQuery, query);
            const reviewsQuery = yield queryBuilder.search(["comment"]).filter().sort().paginate();
            const [data, meta] = yield Promise.all([
                reviewsQuery.build(),
                queryBuilder.getMeta(),
            ]);
            return { data, meta };
        });
    },
    // Get logged-in user's reviews
    //   async getAllReviews(query: Record<string, string>) {
    //     const baseQuery = Review.find()
    //       .populate("tour", "title")
    //       .populate("guide", "name");
    //     const queryBuilder = new QueryBuilder(baseQuery, query);
    //     const reviewsQuery = await queryBuilder.search(["comment"]).filter().sort().paginate();
    //     const [data, meta] = await Promise.all([
    //       reviewsQuery.build(),
    //       queryBuilder.getMeta(),
    //     ]);
    //     return { data, meta };
    //   },
    // Get logged-in user's reviews
    getMyReviews(userId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const baseQuery = review_model_1.Review.find({ user: userId })
                .populate("tour")
                .populate("user", "name email")
                .populate("guide", "name email picture");
            const queryBuilder = new QueryBuilder_1.QueryBuilder(baseQuery, query);
            const reviewsQuery = yield queryBuilder.search(["comment"]).filter().sort().paginate();
            const [data, meta] = yield Promise.all([
                reviewsQuery.build(),
                queryBuilder.getMeta(),
            ]);
            return { data, meta };
        });
    },
    // Update review
    updateReview(id, userId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const review = yield review_model_1.Review.findById(id);
            if (!review)
                throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Review not found");
            if (review.user.toString() !== userId.toString()) {
                throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You cannot modify this review");
            }
            Object.assign(review, payload);
            yield review.save();
            return { data: review };
        });
    },
    // Delete review
    deleteReview(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const review = yield review_model_1.Review.findById(id);
            if (!review)
                throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Review not found");
            if (review.user.toString() !== userId.toString()) {
                throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You cannot delete another user's review");
            }
            yield review_model_1.Review.findByIdAndDelete(id);
            return { data: null };
        });
    },
};
