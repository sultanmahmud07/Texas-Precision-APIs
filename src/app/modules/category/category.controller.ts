import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ICategory } from "./category.interface";
import { CategoryService } from "./category.service";

const createCategory = catchAsync(async (req: Request, res: Response) => {
    const file = req.file as Express.MulterS3.File;
    const payload: ICategory = {
        ...req.body,
        thumbnail: file?.location
    }
    //  console.log("Body data: ", payload)
    const result = await CategoryService.createCategory(payload);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Category created",
        data: result,
    });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await CategoryService.getAllCategory(query as Record<string, string>);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Category retrieved",
        data: result.data,
        meta: result.meta,
    });
});
const getSingleCategory = catchAsync(async (req: Request, res: Response) => {
    const slug = req.params.slug
    const result = await CategoryService.getSingleCategory(slug);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Category retrieved",
        data: result.data,
    });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
      const file = req.file as Express.MulterS3.File;
    const payload: ICategory = {
        ...req.body,
        thumbnail: file?.location
    }
    const result = await CategoryService.updateCategory(id, payload);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Category updated",
        data: result,
    });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryService.deleteCategory(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Category deleted",
        data: result,
    });
});

export const CategoryController = {
    createCategory,
    getAllCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory,
};
