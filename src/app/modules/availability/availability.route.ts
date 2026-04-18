import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { createAvailabilitySchema } from "./availability.validation";
import { AvailabilityController } from "./availability.controller";

const router = Router();

// ADMIN: Set availability for a date
router.post(
    "/create",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(createAvailabilitySchema),
    AvailabilityController.createAvailability
);

// PUBLIC: Get all available dates
router.get("/", AvailabilityController.getAllAvailable);

// PUBLIC: Get active dates for the calendar month view
router.get("/dates", AvailabilityController.getAvailableDates);


// PUBLIC: Get exact slots for a clicked date
router.get("/:date", AvailabilityController.getSingleDateAvailability);

export const AvailabilityRoutes = router;