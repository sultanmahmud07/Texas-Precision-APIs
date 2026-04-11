/* eslint-disable @typescript-eslint/no-explicit-any */

import { Review } from "./review.model";
import { Booking } from "../booking/booking.model";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { BOOKING_STATUS } from "../booking/booking.interface";
import mongoose from "mongoose";

export const ReviewService = {
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
  async createReview(payload: any, userId: string) {
    // 1. Start Mongoose Transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    // Fetch Booking
    const booking = await Booking.findById(payload.booking).session(session);

    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    }

    // Authorization and Status Checks
    if (booking.user._id.toString() !== userId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You cannot review this booking"
      );
    }

    if (booking.status !== BOOKING_STATUS.COMPLETED) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You can only review completed tours"
      );
    }

    // --- IMPORTANT: Check for existing review (prevent double review) ---
    if (booking.review) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "A review for this booking already exists."
      );
    }

    // 2. Create the Review document within the transaction
    const reviewArray = await Review.create([{
      ...payload,
      user: userId,
      // Ensure you attach guide and tour IDs if they are not in the payload but needed on the Review model
      guide: booking.guide,
      tour: booking.tour,
    }], { session });

    const review = reviewArray[0];


    // 3. Update the Booking document to link the new review ID
    await Booking.findByIdAndUpdate(
      booking._id,
      { review: review._id }, // Add the review ID to the booking document
      { new: true, runValidators: true, session }
    );


    // 4. (Optional but recommended) Update Tour Model average rating/count here


    // 5. Commit Transaction
    await session.commitTransaction();
    session.endSession();

    return { data: review };
  },

  // Get all reviews for a tour (with filter, sort, pagination)
  async getReviewsByTour(tourId: string, query: Record<string, string>) {
    const baseQuery = Review.find({ tour: tourId })
      .populate("user", "name email picture")
      .populate("guide", "name email picture");

    const queryBuilder = new QueryBuilder(baseQuery, query);

    const reviewsQuery = await queryBuilder.search(["comment"]).filter().sort().paginate();

    const [data, meta] = await Promise.all([
      reviewsQuery.build(),
      queryBuilder.getMeta(),
    ]);

    return { data, meta };
  },
  async getAllReviews(query: Record<string, string>) {
    const baseQuery = Review.find()
      .populate("tour")
      .populate("user", "name email picture")
      .populate("guide", "name email picture");

    const queryBuilder = new QueryBuilder(baseQuery, query);

    const reviewsQuery = await queryBuilder.search(["comment"]).filter().sort().paginate();

    const [data, meta] = await Promise.all([
      reviewsQuery.build(),
      queryBuilder.getMeta(),
    ]);

    return { data, meta };
  },

  // Get reviews for a guide
  async getReviewsByGuide(guideId: string, query: Record<string, string>) {
    const baseQuery = Review.find({ guide: guideId })
      .populate("user", "name picture email")
      .populate("tour", "title");

    const queryBuilder = new QueryBuilder(baseQuery, query);

    const reviewsQuery = await queryBuilder.search(["comment"]).filter().sort().paginate();

    const [data, meta] = await Promise.all([
      reviewsQuery.build(),
      queryBuilder.getMeta(),
    ]);

    return { data, meta };
  },
  async getReviewsByTourist(id: string, query: Record<string, string>) {
    const baseQuery = Review.find({ user: id })
      .populate("user", "name picture email")
      .populate("guide", "name picture email")
      .populate("tour", "title slug description images fee");

    const queryBuilder = new QueryBuilder(baseQuery, query);

    const reviewsQuery = await queryBuilder.search(["comment"]).filter().sort().paginate();

    const [data, meta] = await Promise.all([
      reviewsQuery.build(),
      queryBuilder.getMeta(),
    ]);

    return { data, meta };
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
  async getMyReviews(userId: string, query: Record<string, string>) {
    const baseQuery = Review.find({ user: userId })
      .populate("tour")
      .populate("user", "name email")
      .populate("guide", "name email picture");

    const queryBuilder = new QueryBuilder(baseQuery, query);

    const reviewsQuery = await queryBuilder.search(["comment"]).filter().sort().paginate();

    const [data, meta] = await Promise.all([
      reviewsQuery.build(),
      queryBuilder.getMeta(),
    ]);

    return { data, meta };
  },

  // Update review
  async updateReview(id: string, userId: string, payload: any) {
    const review = await Review.findById(id);

    if (!review) throw new AppError(httpStatus.NOT_FOUND, "Review not found");
    if (review.user.toString() !== userId.toString()) {
      throw new AppError(httpStatus.FORBIDDEN, "You cannot modify this review");
    }

    Object.assign(review, payload);
    await review.save();

    return { data: review };
  },

  // Delete review
  async deleteReview(id: string, userId: string) {
    const review = await Review.findById(id);

    if (!review) throw new AppError(httpStatus.NOT_FOUND, "Review not found");

    if (review.user.toString() !== userId.toString()) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You cannot delete another user's review"
      );
    }

    await Review.findByIdAndDelete(id);

    return { data: null };
  },
};
