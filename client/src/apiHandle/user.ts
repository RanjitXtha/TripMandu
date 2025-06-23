import type { LoginFrom } from "../types/user";
import { api } from "../utils/axiosInstance";

export const registerFormData = async (formData: FormData) => {
  try {
    const response = await api.post("/user/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error while registering:", error);
    throw error;
  }
};

export const LoginFromData = async( data: LoginFrom)=> {
  try {
    const response = await api.post("/user/signIn", data);
    return response.data;
  } catch (error:any) {
    console.error(error?.message || "login error");
  }
}