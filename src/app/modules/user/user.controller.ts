
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserServices } from "./user.service";
import { IUser } from "./user.interface";

const createUser = catchAsync(async (req: Request, res: Response) => {
    const user = await UserServices.createUser(req.body)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Created Successfully",
        data: user,
    })
})

const updateUser = catchAsync(async (req: Request, res: Response) => {
    const verifiedToken = req.user;
       const file = req.file as Express.MulterS3.File;
                const payload: IUser = {
                    ...req.body,
                    picture: file?.location
                }
    const user = await UserServices.updateUser(payload, verifiedToken as JwtPayload)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Updated Successfully",
        data: user,
    })
})
const updateUserByAdmin = catchAsync(async (req: Request, res: Response) => {
    const verifiedToken = req.user;
    const userId = req.params.id;
    const payload = req.body
    const user = await UserServices.updateUserByAdmin(userId, payload, verifiedToken as JwtPayload)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Updated Successfully",
        data: user,
    })
})

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await UserServices.getAllUsers(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "All Users Retrieved Successfully",
        data: result.data,
        meta: result.meta
    })
})
const getAllAdmin = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await UserServices.getAllAdmin(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "All Admin Retrieved Successfully",
        data: result.data,
        meta: result.meta
    })
})
const getFeaturedGuide = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await UserServices.getFeaturedGuide(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "All Admin Retrieved Successfully",
        data: result.data,
        meta: result.meta
    })
})
const getFeaturedTourist = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await UserServices.getFeaturedTourist(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Tourist Retrieved Successfully",
        data: result.data,
        meta: result.meta
    })
})
const getSearchGuide = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await UserServices.getSearchGuide(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "All Guide Retrieved Successfully",
        data: result.data,
        meta: result.meta
    })
})
const getAllDeletedUsers = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await UserServices.getAllDeletedUsers(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "All Deleted Retrieved Successfully",
        data: result.data,
        meta: result.meta
    })
})
const getAllUnauthorizedUsers = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await UserServices.getAllUnauthorizedUsers(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "All Unauthorized Retrieved Successfully",
        data: result.data,
        meta: result.meta
    })
})
const getMe = catchAsync(async (req: Request, res: Response) => {
    const decodedToken = req.user as JwtPayload
    const result = await UserServices.getMe(decodedToken.userId);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Your profile Retrieved Successfully",
        data: result.data
    })
})
const getSingleUser = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await UserServices.getSingleUser(id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Retrieved Successfully",
        data: result.data
    })
})
const getGuideDetails = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await UserServices.getGuideDetails(id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Guide Retrieved Successfully",
        data: result.data
    })
})
const deleteUser = catchAsync(async (req: Request, res: Response) => {
    const targetUserId = req.params.id;
    const authUser = req.user as JwtPayload;

    const result = await UserServices.deleteUser(
        targetUserId,
        authUser
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User deleted successfully",
        data: result.data,
    });
});
export const UserControllers = {
    createUser,
    getAllUsers,
    getAllAdmin,
    getAllDeletedUsers,
    getAllUnauthorizedUsers,
    updateUser,
    updateUserByAdmin,
    getMe,
    getSingleUser,
    getGuideDetails,
    getFeaturedGuide,
    getSearchGuide,
    getFeaturedTourist,
    deleteUser
}
