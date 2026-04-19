import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { InspectionService } from "./inspection.service";

const createInspection = catchAsync(async (req: Request, res: Response) => {
    const result = await InspectionService.createInspection(req.body);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Inspection scheduled successfully",
        data: result,
    });
});

const getAllInspections = catchAsync(async (req: Request, res: Response) => {
    const result = await InspectionService.getAllInspections(req.query as Record<string, string>);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Inspections retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getSingleInspection = catchAsync(async (req: Request, res: Response) => {
    const result = await InspectionService.getSingleInspection(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Inspection retrieved successfully",
        data: result,
    });
});

const updateInspection = catchAsync(async (req: Request, res: Response) => {
    const result = await InspectionService.updateInspection(req.params.id, req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Inspection updated successfully",
        data: result,
    });
});

const deleteInspection = catchAsync(async (req: Request, res: Response) => {
    const result = await InspectionService.deleteInspection(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Inspection deleted successfully",
        data: result,
    });
});

export const InspectionController = {
    createInspection,
    getAllInspections,
    getSingleInspection,
    updateInspection,
    deleteInspection
};