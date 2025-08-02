import { useSelector } from "react-redux"
import type { RootState, AppDispatch } from "../app/store"
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getAllPlans } from "../features/plan";
import PlanCard from "../components/plan/PlanCard";
import { Link } from "react-router";


const ManageYourPlan = () => {
  const dispatch = useDispatch<AppDispatch>();
   useEffect(() => {
      dispatch(getAllPlans());
    }, [dispatch]);
  const { plan } = useSelector((state: RootState) => state.plan);
 // console.log(plan);
  return (
    <div className="w-full min-h-screen bg-gray-200">
      <div className="w-full p-4 bg-gray-300">
        <Link to="/" className="text-3xl">Map</Link>
      </div>
      <div className="p-8">

        <h2 className="text-3xl text-gray-800 mb-6 text-left">Manage your Plan</h2>
        {/* first section */}
        {/* plane name, destinations and routes */}

        <div className="w-full space-y-4">
          {
            plan.map(p => (
              <PlanCard key={p.id} plan={p}/>
            ))
          }
        </div>
        
        {/* second section */}
        {/* suggest baed on current locations */}
      </div>
    </div>
  )
}

export default ManageYourPlan
