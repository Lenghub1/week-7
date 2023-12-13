import catchAsync from "@/utils/catchAsync.js";
import sharp from "sharp";

export const resizeProductImage = catchAsync(async (req, res, next) => {
  const resizePromises = [];

  for (const fieldName in req.files) {
    const files = req.files[fieldName];

    files.map(async (fileObj) => {
      const { width, height } = await sharp(fileObj.buffer).metadata();
      const aspectRatio = 4 / 3;

      let newWidth, newHeight;

      if (width / height > aspectRatio) {
        newWidth = width;
        newHeight = Math.round(newWidth / aspectRatio);
      } else {
        newHeight = height;
        newWidth = Math.round(newHeight * aspectRatio);
      }

      const buffer = await sharp(fileObj.buffer)
        .resize({
          width: newWidth,
          height: newHeight,
          fit: "cover",
        })
        .toBuffer();

      fileObj.buffer = buffer;
    });

    resizePromises.push(...files);
  }
  await Promise.all(resizePromises);

  return next();
});
