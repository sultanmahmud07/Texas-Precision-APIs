import { Request, Response } from "express";
// import catchAsync from "../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { BookingService } from "./booking.service";

const createBooking = catchAsync(async (req: Request, res: Response) => {
    const decodeToken = req.user as JwtPayload
    const booking = await BookingService.createBooking(req.body, decodeToken.userId);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: booking,
    });
});

const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    const decodeToken = req.user as JwtPayload;

    const booking = await BookingService.getBookingById(bookingId, decodeToken);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Booking retrieved successfully",
        data: booking,
    });
});


const getAllBookings = catchAsync(async (req: Request, res: Response) => {

    const decodeToken = req.user as JwtPayload;
    const result = await BookingService.getAllBookings(decodeToken, req.query as Record<string, string>);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Bookings retrieved successfully",
        data: result.data,
        meta: result.meta,

    });
}
);
const getReservedData = catchAsync(async (req: Request, res: Response) => {
const authorId = req.params.authorId
    const result = await BookingService.getReservedData(authorId)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Reserved data retrieved successfully",
        data: { data: result }

    });
}
);

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;

    const result = await BookingService.cancelBooking(
        req.params.id,
        user.userId
    );

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Bookings Cancel successfully",
        data: result,
    });
}
);

const updateBookingStatus = catchAsync(
    async (req: Request, res: Response) => {
        const newStatus = req.body.status;
        const { bookingId } = req.params;
        const decodedToken = req.user as JwtPayload;

        const result = await BookingService.updateBookingStatus(bookingId, newStatus, decodedToken);


        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Booking Status Updated Successfully",
            data: result,
        });
    }
);


export const BookingController = {
    createBooking,
    getAllBookings,
    getSingleBooking,
    updateBookingStatus,
    getReservedData,
    cancelBooking
}