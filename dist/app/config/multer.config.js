"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const aws_config_1 = require("./aws.config");
const env_1 = require("./env");
const storage = (0, multer_s3_1.default)({
    s3: aws_config_1.s3Client,
    bucket: env_1.envVars.S3_BUCKET_NAME,
    contentType: multer_s3_1.default.AUTO_CONTENT_TYPE, // Automatically detects image, pdf, etc.
    key: function (req, file, cb) {
        const originalName = file.originalname.toLowerCase();
        // extract name and extension
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
        const extension = originalName.substring(originalName.lastIndexOf("."));
        // sanitize name
        const safeName = nameWithoutExt
            .replace(/\s+/g, "-") // spaces → dash
            // eslint-disable-next-line no-useless-escape
            .replace(/[^a-z0-9\-]/g, ""); // only keep alphanumeric and -
        const uniqueFileName = 
        // "amkov/" + 
        Math.random().toString(36).substring(2) +
            "-" +
            Date.now() +
            "-" +
            safeName +
            extension; // Re-attach the extension so S3 can serve it correctly
        cb(null, uniqueFileName);
    },
});
exports.multerUpload = (0, multer_1.default)({ storage: storage });
