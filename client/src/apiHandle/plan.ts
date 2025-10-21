import type { PlanResponseById } from "../types/plan.type";
import { api } from "../utils/axiosInstance";


export const planById = async (id: string): Promise<PlanResponseById> => {
  try {
    const token = localStorage.getItem("token");
    if (!token)  throw new Error("No token");;

    const res = await api.get<PlanResponseById>(
      `/plan/getPlanDestinationById?id=${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};