import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { InspectionController } from "./inspection.controller";
import { createInspectionSchema, updateInspectionSchema } from "./inspection.validation";

const router = Router();

// PUBLIC: Customer submitting the booking form
router.post(
    "/create",
    validateRequest(createInspectionSchema),
    InspectionController.createInspection
);

// ADMIN ONLY: Managing the booked inspections
router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), InspectionController.getAllInspections);
router.get("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), InspectionController.getSingleInspection);

router.patch(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(updateInspectionSchema),
    InspectionController.updateInspection
);

router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), InspectionController.deleteInspection);

export const InspectionRoutes = router;