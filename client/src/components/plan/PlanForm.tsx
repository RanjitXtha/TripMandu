import { useEffect, useState } from "react";
import type { PlanForm } from "../../types/plan.type";

// overlay for plan form

interface PlanFormProps {
    mode: "edit" | "create";
    isOpen: boolean;
    onSubmit: (data: string) => void;
    initialvalue?: PlanForm;//when editing get the initial title
    onClose: ()=> void
}


const PlanFormCard: React.FC<PlanFormProps> = ({mode="create", isOpen, onSubmit, initialvalue, onClose}) => {
    const [planName, setPlanName] = useState<string>('');
   // console.log("Hello from plan form");


    useEffect(() => {
        if(initialvalue && mode === "edit") {
            setPlanName(initialvalue.planName);
        }
        else {
            setPlanName('');
        }
    }, [initialvalue]);

    if(!isOpen) return null;

    const handleSubmit = (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        onSubmit(planName);
        onClose();
    }

  return (
    <div className="absolute inset-0 w-full min-h-screen flex items-center justify-center z-50 bg-transparent">
        <div className="p-6 w-[500px] bg-white space-y-4">
            <h2 className="text-2xl font-bold text-gray-700 text-center">{mode === "create" ? "Create Plan" : "Edit Plan"}</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Title of the plan</label>
                    <input type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full py-2 px-3 rounded-md"
                    required />
                </div>
                <button className="w-full py-2 px-3 text-center bg-blue-500 hover:bg-blue-600 transition-colors">{mode==="create" ? "Create Plan": "Update Plan"}</button>
            </form>
        </div>
    </div>
  )
}

export default PlanFormCard;
