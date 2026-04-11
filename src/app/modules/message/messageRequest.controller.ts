
import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { JwtPayload } from "jsonwebtoken";
import { MessageRequestService } from './messageRequest.service';

import httpStatus from "http-status-codes";

const createMessageRequest = catchAsync(async (req: Request, res: Response) => {
      const result = await MessageRequestService.createMessageRequest(req.body);

      sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Message request sent successfully",
            data: result.data,
      });
});

const getGuideMessageRequests = catchAsync(async (req: Request, res: Response) => {
      const decodedUser = req.user as JwtPayload;
      const result = await MessageRequestService.getGuideRequests(decodedUser.userId);

      sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Message requests retrieved successfully",
            data: result.data,
      });
});

export const MessageRequestController = {
      createMessageRequest,
      getGuideMessageRequests,
};