import express from "express";

import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { BookingController } from "./booking.controller";
import { createBookingZodSchema, updateBookingStatusZodSchema } from "./booking.validation";

const router = express.Router();

router.post("/",
    checkAuth(...Object.values(Role)),
    validateRequest(createBookingZodSchema),
    BookingController.createBooking
);

router.get("/",
    checkAuth(...Object.values(Role)),
    BookingController.getAllBookings
);
router.get("/reserved/:authorId",
    BookingController.getReservedData
);

router.get("/:bookingId",
    checkAuth(...Object.values(Role)),
    BookingController.getSingleBooking
);

router.patch("/status/:bookingId",
    checkAuth(...Object.values(Role)),
    validateRequest(updateBookingStatusZodSchema),
    BookingController.updateBookingStatus
);
router.patch("/cancel/:id",
    checkAuth(...Object.values(Role)),
    BookingController.cancelBooking
);

export const BookingRoutes = router;
