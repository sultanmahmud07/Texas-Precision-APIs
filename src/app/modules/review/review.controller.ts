
import httpStatus from "http-status-codes";
import { ReviewService } from "./review.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";

export const ReviewController = {

      createReview: catchAsync(async (req, res) => {
            const user = req.user as JwtPayload;
            const result = await ReviewService.createReview(req.body, user.userId);

            sendResponse(res, {
                  success: true,
                  statusCode: httpStatus.CREATED,
                  message: "Review created successfully",
                  data: result.data,
            });
      }),

      getReviewsByTour: catchAsync(async (req, res) => {
            const query = req.query;
            const result = await ReviewService.getReviewsByTour(
                  req.params.tourId,
                  query as Record<string, string>
            );

            sendResponse(res, {
                  success: true,
                  statusCode: httpStatus.OK,
                  message: "Reviews retrieved successfully",
                  data: result.data,
                  meta: result.meta,
            });
      }),
      getAllReviews: catchAsync(async (req, res) => {
            const query = req.query;
            const result = await ReviewService.getAllReviews(
                  query as Record<string, string>
            );

            sendResponse(res, {
                  success: true,
                  statusCode: httpStatus.OK,
                  message: "Reviews all retrieved successfully",
                  data: result.data,
                  meta: result.meta,
            });
      }),

      getReviewsByGuide: catchAsync(async (req, res) => {
            const query = req.query;
            const result = await ReviewService.getReviewsByGuide(
                  req.params.guideId,
                  query as Record<string, string>
            );

            sendResponse(res, {
                  success: true,
                  statusCode: httpStatus.OK,
                  message: "Guide reviews retrieved successfully",
                  data: result.data,
                  meta: result.meta,
            });
      }),
      getReviewsByTourist: catchAsync(async (req, res) => {
            const query = req.query;
            const result = await ReviewService.getReviewsByTourist(
                  req.params.touristId,
                  query as Record<string, string>
            );

            sendResponse(res, {
                  success: true,
                  statusCode: httpStatus.OK,
                  message: "Tourist reviews retrieved successfully",
                  data: result.data,
                  meta: result.meta,
            });
      }),

      getMyReviews: catchAsync(async (req, res) => {
            const query = req.query;
            const decodeToken = req.user as JwtPayload

            const result = await ReviewService.getMyReviews(
                  decodeToken._id,
                  query as Record<string, string>
            );

            sendResponse(res, {
                  success: true,
                  statusCode: httpStatus.OK,
                  message: "My reviews retrieved successfully",
                  data: result.data,
                  meta: result.meta,
            });
      }),

      updateReview: catchAsync(async (req, res) => {
              const decodeToken = req.user as JwtPayload
            const result = await ReviewService.updateReview(
                  req.params.id,
                  decodeToken._id,
                  req.body
            );

            sendResponse(res, {
                  success: true,
                  statusCode: httpStatus.OK,
                  message: "Review updated successfully",
                  data: result.data,
            });
      }),

      deleteReview: catchAsync(async (req, res) => {
              const decodeToken = req.user as JwtPayload
            await ReviewService.deleteReview(req.params.id, decodeToken._id);

            sendResponse(res, {
                  success: true,
                  statusCode: httpStatus.OK,
                  message: "Review deleted successfully",
                  data: null,
            });
      }),
};
