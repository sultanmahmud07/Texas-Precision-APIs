/* eslint-disable @typescript-eslint/no-explicit-any */
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import AppError from "../errorHelpers/AppError";
import { envVars } from "./env";

// Initialize S3 Client
export const s3Client = new S3Client({
   region: envVars.AWS_DEFAULT_REGION,
    credentials: {
        accessKeyId: envVars.AWS_ACCESS_KEY_ID,
        secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY
    }
});

export const uploadBufferToS3 = async (
    buffer: Buffer, 
    fileName: string, 
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    contentType: string = "application/pdf"
) => {
    try {
        const uniqueFileName = `pdf/${fileName}-${Date.now()}.pdf`;

        const command = new PutObjectCommand({
            Bucket: envVars.S3_BUCKET_NAME,
            Key: uniqueFileName,
            Body: buffer,
            ContentType: contentType,
        });

        await s3Client.send(command);

        // Return the constructed public URL and the Key
        return {
            url: `https://${envVars.S3_BUCKET_NAME}.s3.${envVars.AWS_DEFAULT_REGION}.amazonaws.com/${uniqueFileName}`,
            key: uniqueFileName
        };

    } catch (error: any) {
        // eslint-disable-next-line no-console
        console.log(error);
        throw new AppError(401, `Error uploading file: ${error.message}`);
    }
};

export const deleteFileFromS3 = async (fileKeyOrUrl: string) => {
    try {
        // Extract the S3 Key whether a full URL or just the Key is passed
        let key = fileKeyOrUrl;
        if (fileKeyOrUrl.startsWith("http")) {
            const url = new URL(fileKeyOrUrl);
            key = url.pathname.substring(1); // Removes the leading '/'
        }

        const command = new DeleteObjectCommand({
            Bucket: envVars.S3_BUCKET_NAME,
            Key: key,
        });

        await s3Client.send(command);
        // eslint-disable-next-line no-console
        console.log(`File ${key} is deleted from S3`);
        
    } catch (error: any) {
        throw new AppError(401, "S3 file deletion failed", error.message);
    }
};