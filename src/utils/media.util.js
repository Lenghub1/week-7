import utils from "./utils.js";
import APIError from "./APIError.js";
import { uploadFile, deleteFile, getFileSignedUrl } from "@/config/s3.js";

const MediaUtil = {
  async cleanup(files) {
    if (files.length > 0) {
      await Promise.all(files.map((file) => deleteFile(file.name)));
    }
  },

  async processMediaFiles(mediaFiles) {
    const mediaNames = await Promise.all(
      mediaFiles.map(async (each) => {
        const eachName = utils.generateFileName(
          `${Model.modelName}/media`,
          each.originalname,
          each.mimetype
        );

        await uploadFile(each.buffer, eachName, each.mimetype);
        return eachName;
      })
    );
    return mediaNames;
  },

  async getMediaUrls(mediaFiles) {
    const mediaUrls = await Promise.all(
      mediaFiles.map((file) => getFileSignedUrl(file))
    );
    return mediaUrls;
  },

  async deleteUnusedMediaFiles(filesToDelete) {
    if (filesToDelete.length > 0) {
      await Promise.all(filesToDelete.map((file) => deleteFile(file)));
    }
  },
};

export default MediaUtil;
