import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AddressService } from "./address.service";

const createAddress = catchAsync(async (req: Request, res: Response) => {
    const result = await AddressService.createAddress(req.body);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Address created successfully",
        data: result,
    });
});

const getAllAddresses = catchAsync(async (req: Request, res: Response) => {
    const result = await AddressService.getAllAddresses(req.query as Record<string, string>);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Addresses retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getSingleAddress = catchAsync(async (req: Request, res: Response) => {
    const result = await AddressService.getSingleAddress(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Address retrieved successfully",
        data: result,
    });
});

const updateAddress = catchAsync(async (req: Request, res: Response) => {
    const result = await AddressService.updateAddress(req.params.id, req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Address updated successfully",
        data: result,
    });
});

const deleteAddress = catchAsync(async (req: Request, res: Response) => {
    const result = await AddressService.deleteAddress(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Address deleted successfully",
        data: result,
    });
});

export const AddressController = {
    createAddress,
    getAllAddresses,
    getSingleAddress,
    updateAddress,
    deleteAddress
};