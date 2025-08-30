import { Navigate } from "react-router"
import type { JSX } from "react"

type Props = {
    children: JSX.Element
}
const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute
