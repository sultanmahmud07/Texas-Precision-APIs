import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { createTourZodSchema, updateTourZodSchema } from "./tour.validation";
import { TourController } from "./tour.controller";
import { multerUpload } from "../../config/multer.config";

const router = Router();

// Public
router.get("/", TourController.getAllTours);
router.get("/search", TourController.getSearchTours);
router.get("/:slug", TourController.getTourBySlug);

// Authenticated routes
router.get("/guide/all", checkAuth(Role.GUIDE), TourController.getToursByGuide);
// router.patch("/:id", checkAuth(Role.GUIDE, Role.ADMIN, Role.SUPER_ADMIN), TourController.updateTour);

// Create Tour (GUIDE, ADMIN)
router.post(
  "/create",
  checkAuth(Role.GUIDE, Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.array("files"),
  validateRequest(createTourZodSchema),
  TourController.createTour
);

router.patch(
  "/update/:id",
  checkAuth(Role.GUIDE, Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.array("files"),
  validateRequest(updateTourZodSchema),
  TourController.updateTour
);

router.delete("/:id", checkAuth(Role.GUIDE, Role.ADMIN, Role.SUPER_ADMIN), TourController.deleteTour);



export const TourRoutes = router;
