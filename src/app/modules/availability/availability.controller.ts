import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AvailabilityService } from "./availability.service";

const createAvailability = catchAsync(async (req: Request, res: Response) => {
    const result = await AvailabilityService.createOrUpdateAvailability(req.body);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Availability created successfully",
        data: result,
    });
});

const getAllAvailable = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await AvailabilityService.getAllAvailability(query as Record<string, string>);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Available dates retrieved",
        data: result.data,
        meta: result.meta
    });
});
const getAvailableDates = catchAsync(async (req: Request, res: Response) => {
    // Expecting query params like ?startDate=2026-04-01&endDate=2026-04-30
    const { startDate, endDate } = req.query;

    const result = await AvailabilityService.getAvailableDates(startDate as string, endDate as string);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Available dates retrieved",
        data: result, // Returns: ["2026-04-24", "2026-04-25"]
    });
});

const getSingleDateAvailability = catchAsync(async (req: Request, res: Response) => {
    const { date } = req.params; // e.g., 2026-04-24
    const result = await AvailabilityService.getAvailabilityByDate(date);

    // This matches your exact required JSON output!
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Slots retrieved successfully",
        data: result,
    });
});

export const AvailabilityController = {
    createAvailability,
    getAvailableDates,
    getAllAvailable,
    getSingleDateAvailability
};