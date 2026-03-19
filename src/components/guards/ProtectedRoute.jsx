import { Navigate } from "react-router-dom";
import userService from "../../services/userService";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = userService.getCurrentUser();
  console.log("User role: ", user?.role);

  if (!user) return <Navigate to='/login' />;

  const isAuthorized = allowedRoles.includes(user.role);

  if (!isAuthorized) return <Navigate to='/not-authorized' />;

  return children;
};

export default ProtectedRoute;
