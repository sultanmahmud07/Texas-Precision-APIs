import express from "express";
import { createReviewZodSchema, updateReviewZodSchema } from "./review.validation";
import { ReviewController } from "./review.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";

const router = express.Router();

router.get( "/", 
  ReviewController.getAllReviews);
router.post(
  "/create",
  checkAuth(Role.TOURIST),
  validateRequest(createReviewZodSchema),
  ReviewController.createReview
);

router.get("/tour/:tourId", ReviewController.getReviewsByTour);
router.get("/guide/:guideId", ReviewController.getReviewsByGuide);
router.get("/tourist/:touristId", ReviewController.getReviewsByTourist);

router.get(
  "/me",
  checkAuth(Role.TOURIST),
  ReviewController.getMyReviews
);

router.patch(
  "/:id",
  checkAuth(Role.TOURIST),
  validateRequest(updateReviewZodSchema),
  ReviewController.updateReview
);

router.delete(
  "/:id",
  checkAuth(Role.TOURIST),
  ReviewController.deleteReview
);

export const ReviewRoutes = router;
