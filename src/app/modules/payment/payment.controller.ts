import { Request, Response } from "express";
import { envVars } from "../../config/env";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { PaymentService } from "./payment.service";
import { JwtPayload } from "jsonwebtoken";

const initPayment = catchAsync(async (req: Request, res: Response) => {
    const bookingId = req.params.bookingId;
    const result = await PaymentService.initPayment(bookingId as string)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Payment done successfully",
        data: result,
    });
});
const successPayment = catchAsync(async (req: Request, res: Response) => {
    const query = req.query
    const result = await PaymentService.successPayment(query as Record<string, string>)

    if (result.success) {
        res.redirect(`${envVars.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`)
    }
});
const failPayment = catchAsync(async (req: Request, res: Response) => {
    const query = req.query
    const result = await PaymentService.failPayment(query as Record<string, string>)

    if (!result.success) {
        res.redirect(`${envVars.SSL.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`)
    }
});
const cancelPayment = catchAsync(async (req: Request, res: Response) => {
    const query = req.query
    const result = await PaymentService.cancelPayment(query as Record<string, string>)

    if (!result.success) {
        res.redirect(`${envVars.SSL.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`)
    }
});

const getInvoiceDownloadUrl = catchAsync(
    async (req: Request, res: Response) => {
        const { paymentId } = req.params;
        const result = await PaymentService.getInvoiceDownloadUrl(paymentId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Invoice download URL retrieved successfully",
            data: result,
        });
    }
);
const validatePayment = catchAsync(
    async (req: Request, res: Response) => {
        await SSLService.validatePayment(req.body)
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Payment Validated Successfully",
            data: null,
        });
    }
);
const getAllPayment = catchAsync(async (req: Request, res: Response) => {

    const query = req.query
    const result = await PaymentService.getAllPayment(query as Record<string, string>);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Payments retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
});

const getSinglePayment = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id
    const result = await PaymentService.getPaymentById(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Payment retrieved successfully',
        data: result,
    });
});
const updatePayment = catchAsync(async (req: Request, res: Response) => {
    const newStatus = req.body.status;
    const { id } = req.params;
    const decodedToken = req.user as JwtPayload;
    const result = await PaymentService.updatePayment(id, newStatus, decodedToken);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Payment updated successfully',
        data: result,
    });
});
const deletePayment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await PaymentService.deletePayment(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Payment deleted successfully',
        data: result,
    });
});
export const PaymentController = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    getInvoiceDownloadUrl,
    getAllPayment,
    deletePayment,
    getSinglePayment,
    updatePayment,
    validatePayment
};
