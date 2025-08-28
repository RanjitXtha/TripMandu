import { Navigate } from "react-router"
import { useSelector } from "react-redux"
import type { RootState } from "../app/store"
import type { JSX } from "react"

type Props = {
    children: JSX.Element
}
const ProtectedRoute: React.FC<Props> = ({children}) => {

    const user = useSelector((state: RootState) => state.user.id);
  const token = localStorage.getItem("token");
   if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute
