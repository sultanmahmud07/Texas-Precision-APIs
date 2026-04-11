import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatsService } from "./stats.service";
import { JwtPayload } from "jsonwebtoken";

const getTouristStats = catchAsync(async (req: Request, res: Response) => {
    const decodeToken = req.user as JwtPayload
    const stats = await StatsService.getTouristStats(decodeToken.userId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Sender stats fetched successfully",
        data: stats,
    });
});
const getGuideStats = catchAsync(async (req: Request, res: Response) => {
    const decodeToken = req.user as JwtPayload
    const stats = await StatsService.getGuideStats(decodeToken.userId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Receiver stats fetched successfully",
        data: stats,
    });
});



const getAdminStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await StatsService.getAdminStats();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Admin stats fetched successfully",
        data: stats,
    });
});


export const StatsController = {
    getTouristStats,
    getGuideStats,
    getAdminStats,
};
