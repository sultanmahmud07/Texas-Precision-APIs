/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import httpStatus from "http-status-codes";
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { ContactService } from './contact.service';
// import { JwtPayload } from 'jsonwebtoken';
// import { Types } from 'mongoose';

export const createContact = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const contactData = req.body;
  const contact = await ContactService.createContact(contactData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Inquiry submitted successfully',
    data: contact,
  });
})

const getContactByAdmin = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await ContactService.getContact(query as Record<string, string>);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Contact Retrieved Successfully By Admin",
    data: result.data,
    meta: result.meta
  })
})
const getSingleContact = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id
    const result = await ContactService.getSingleContact(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Contact retrieved",
        data: result.data,
    });
});
const deleteContact = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const contactId = req.params.id;
  const result = await ContactService.deleteContact(contactId);


  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Contact deleted successfully",
    data: result.data
  })
})
export const ContactController = {
  createContact,
  getContactByAdmin,
  getSingleContact,
  deleteContact
}