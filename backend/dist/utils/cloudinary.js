//image uploade
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME || "",
    api_key: process.env.CLOUD_API_KAY || "",
    api_secret: process.env.CLOUD_API_SECRET || ""
});
export const uploadeCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath)
            return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "tripMandu"
        });
        console.log("Image uplaode successfully: ", response?.url);
        fs.unlinkSync(localFilePath);
        return response;
    }
    catch (error) {
        fs.unlinkSync(localFilePath);
        console.error("Error on uploading image to cloudinary:", error?.message);
        return null;
    }
};
