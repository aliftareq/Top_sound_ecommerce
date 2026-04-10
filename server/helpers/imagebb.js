import axios from "axios";

export const imageUploadUtil = async (
  base64Image,
  fileName = "uploaded-image",
) => {
  try {
    if (!base64Image) {
      throw new Error("No image data provided");
    }

    if (!process.env.IMGBB_API_KEY) {
      throw new Error("IMGBB_API_KEY is missing in environment variables");
    }

    const formData = new URLSearchParams();
    formData.append("image", base64Image);
    formData.append("name", fileName);

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    return response.data.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.error?.message ||
        error.message ||
        "ImgBB upload failed",
    );
  }
};
