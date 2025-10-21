
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from '../utils/axiosInstance';

import type { PlanResponse, Plan, PlanForm, FormCUResponse} from "../types/plan.type";
const TOKEN = localStorage.getItem("token");

interface InitialPlan {
  plan: Plan[];
  isLoading: boolean;
}


const initialPlan: InitialPlan = {
  plan: [],
  isLoading: false,
};



export const getAllPlans = createAsyncThunk<PlanResponse, void>(
  "plan/getAllPlans",
  async () => {
    const response = await api.get<PlanResponse>("/plan/getAllPlan", {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    return response.data;
  }
);

export const createPlan = createAsyncThunk<FormCUResponse, PlanForm>(
  "plan/createPlan",
  async (formData, thunkAPI) => {
    try {
      const res = await api.post<FormCUResponse>("/plan/createPlan", formData,
        {
            headers: {
                "Authorization": `Bearer ${TOKEN}`
            }
        }
      );
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to create plan");
    }
  }
);

export const updatePlan = createAsyncThunk<FormCUResponse, { formData: PlanForm, id: string }>(
  "plan/updatePlan",
  async ({formData, id}, thunkAPI) => {
    try {
      //console.log(formData);
      console.log("Id:", id);
      const res = await api.put<FormCUResponse>(
        `/plan/updateRouteById?id=${id}`,
        formData,
        {
          headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
        }
      );
      return res.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update plan"
      );
    }
  }
);

export const deltePlanById = createAsyncThunk<string, string>(
  "plan/deltePlanById",
  async (id, thunkAPI) => {
    try {
      console.log("deleting id: ", id)
      await api.delete(`/plan/deltePlanById?id=${id}`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });
      

      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete plan"
      );
    }
  }
);

const planSlice = createSlice({
    name: "plan",
    initialState: initialPlan,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllPlans.pending,  (state) => {
                state.isLoading = true;
            })
            .addCase(getAllPlans.fulfilled, (state, action) => {
                state.isLoading = false;
               // console.log(action.payload.data);
                state.plan = action.payload.data;
            })
            .addCase(createPlan.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createPlan.fulfilled, (state, action) => {
                state.isLoading = false;
                console.log("Payload", action.payload);
                 const plan = action.payload.data;
                 console.log("plan", plan);
                state.plan.push(plan);
                console.log("created plane: ", plan);
                
            })
            .addCase(updatePlan.pending, (state) => {
                state.isLoading = true;
                
            })
            .addCase(updatePlan.fulfilled, (state, action) => {
                state.isLoading = false;
                const updatePlan = action.payload.data;
                const index = state.plan.findIndex(p =>p.id === updatePlan.id);
                if (index !== -1) {
                    state.plan[index] = updatePlan;
                }
            })
            .addCase(deltePlanById.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deltePlanById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.plan = state.plan.filter(p => p.id !== action.payload)
            })
    ;}
})


export default planSlice.reducer;