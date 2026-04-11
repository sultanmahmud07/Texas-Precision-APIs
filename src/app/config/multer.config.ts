import multer from "multer";
import multerS3 from "multer-s3";
import { s3Client } from "./aws.config";
import { envVars } from "./env";

const storage = multerS3({
  s3: s3Client,
  bucket: envVars.S3_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically detects image, pdf, etc.
  key: function (req, file, cb) {
    const originalName = file.originalname.toLowerCase();

    // extract name and extension
    const nameWithoutExt =
      originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
    const extension = originalName.substring(originalName.lastIndexOf("."));

    // sanitize name
    const safeName = nameWithoutExt
      .replace(/\s+/g, "-") // spaces → dash
      // eslint-disable-next-line no-useless-escape
      .replace(/[^a-z0-9\-]/g, ""); // only keep alphanumeric and -

    const uniqueFileName =
      // "texas-precision/" + 
      Math.random().toString(36).substring(2) +
      "-" +
      Date.now() +
      "-" +
      safeName + 
      extension; // Re-attach the extension so S3 can serve it correctly

    cb(null, uniqueFileName);
  },
});

export const multerUpload = multer({ storage: storage });