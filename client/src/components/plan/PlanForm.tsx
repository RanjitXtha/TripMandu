import { useEffect, useState } from "react";

// overlay for plan form

interface PlanFormProps {
    mode: "edit" | "create";
    isOpen: boolean;
    onSubmit: (data: string) => void;
    planeName?: string;//when editing get the initial title
    onClose: ()=> void
}


const PlanFormCard: React.FC<PlanFormProps> = ({mode="create", isOpen, onSubmit, planeName, onClose}) => {
    const [planName, setPlanName] = useState<string>('');
   // console.log("Hello from plan form");


    useEffect(() => {
        if(planeName && mode === "edit") {
            setPlanName(planeName);
        }
        else {
            setPlanName('');
        }
    }, [planeName]);

    if(!isOpen) return null;

    const handleSubmit = (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        onSubmit(planName);
        onClose();
    }

  return (
    <div className="absolute inset-0 w-full min-h-screen flex items-center justify-center z-50 bg-transparent">
        <div className="p-6 w-[500px] bg-gradient-to-l from-gray-400 to-gray-200 space-y-4 relative rounded-md">
            <button className="absolute top-2 right-2" onClick={() => onClose()}>X</button>
            <h2 className="text-2xl font-bold text-gray-700 text-center">{mode === "create" ? "Create Plan" : "Edit Plan"}</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <label htmlFor="title">Title of the plan</label>
                    <input type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full py-2 px-3 rounded-md bg-white"
                    required />
                </div>
                <button className="w-full py-2 px-3 text-center bg-blue-500 hover:bg-blue-600 transition-colors">{mode==="create" ? "Create Plan": "Update Plan"}</button>
            </form>
        </div>
    </div>
  )
}

export default PlanFormCard;
