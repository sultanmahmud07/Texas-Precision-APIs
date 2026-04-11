import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { TourService } from "./tour.service";
import { JwtPayload } from "jsonwebtoken";
import { ITour } from "./tour.interface";

const createTour = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const payload: ITour = {
    ...req.body,
    author: user.userId,
    images: (req.files as Express.Multer.File[])?.map(file => file.path),
  };
  const result = await TourService.createTour(payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Tour created successfully",
    data: result.data
  });
});

const updateTour = catchAsync(async (req: Request, res: Response) => {
    const parsedData = req.body?.data ? JSON.parse(req.body.data) : req.body;
    const tourId = req.params.id
      const payload = {
        ...parsedData,
         images: (req.files as Express.Multer.File[])?.map(file => file.path)
    }
// console.log("Payload:", req.body)
    const tour = await TourService.updateTour(tourId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tour updated successfully",
    data: tour
  });
});

const getAllTours = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await TourService.getAllTours(query as Record<string, string>);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Tour Retrieved Successfully!",
    data: result.data,
    meta: result.meta
  })
})
const getSearchTours = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await TourService.getSearchTours(query as Record<string, string>);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Tour Retrieved Successfully!",
    data: result.data,
    meta: result.meta
  })
})

const getTourBySlug = catchAsync(async (req: Request, res: Response) => {
  const slug = req.params.slug;
  const result = await TourService.getSingleTour(slug);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Tour retrieved successfully",
    data: result.data,
  });
});

const getToursByGuide = catchAsync(async (req: Request, res: Response) => {
  const decoded = req.user as JwtPayload;
  const userId = decoded.userId || decoded._id; // depending on token shape
  const query = req.query;

  const result = await TourService.getToursByGuide(String(userId), query as Record<string, string>);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Guide tours retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});
const deleteTour = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await TourService.deleteTour(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Tour deleted successfully',
        data: result,
    });
});
export const TourController = {
  createTour,
  updateTour,
  getAllTours,
  getTourBySlug,
  getToursByGuide,
  getSearchTours,
  deleteTour
};
