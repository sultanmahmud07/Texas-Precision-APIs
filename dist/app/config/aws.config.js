"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFileFromS3 = exports.uploadBufferToS3 = exports.s3Client = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const client_s3_1 = require("@aws-sdk/client-s3");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const env_1 = require("./env");
// Initialize S3 Client
exports.s3Client = new client_s3_1.S3Client({
    region: env_1.envVars.AWS_DEFAULT_REGION,
    credentials: {
        accessKeyId: env_1.envVars.AWS_ACCESS_KEY_ID,
        secretAccessKey: env_1.envVars.AWS_SECRET_ACCESS_KEY
    }
});
const uploadBufferToS3 = (buffer_1, fileName_1, ...args_1) => __awaiter(void 0, [buffer_1, fileName_1, ...args_1], void 0, function* (buffer, fileName, 
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
contentType = "application/pdf") {
    try {
        const uniqueFileName = `pdf/${fileName}-${Date.now()}.pdf`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: env_1.envVars.S3_BUCKET_NAME,
            Key: uniqueFileName,
            Body: buffer,
            ContentType: contentType,
        });
        yield exports.s3Client.send(command);
        // Return the constructed public URL and the Key
        return {
            url: `https://${env_1.envVars.S3_BUCKET_NAME}.s3.${env_1.envVars.AWS_DEFAULT_REGION}.amazonaws.com/${uniqueFileName}`,
            key: uniqueFileName
        };
    }
    catch (error) {
        console.log(error);
        throw new AppError_1.default(401, `Error uploading file: ${error.message}`);
    }
});
exports.uploadBufferToS3 = uploadBufferToS3;
const deleteFileFromS3 = (fileKeyOrUrl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract the S3 Key whether a full URL or just the Key is passed
        let key = fileKeyOrUrl;
        if (fileKeyOrUrl.startsWith("http")) {
            const url = new URL(fileKeyOrUrl);
            key = url.pathname.substring(1); // Removes the leading '/'
        }
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: env_1.envVars.S3_BUCKET_NAME,
            Key: key,
        });
        yield exports.s3Client.send(command);
        // eslint-disable-next-line no-console
        console.log(`File ${key} is deleted from S3`);
    }
    catch (error) {
        throw new AppError_1.default(401, "S3 file deletion failed", error.message);
    }
});
exports.deleteFileFromS3 = deleteFileFromS3;
