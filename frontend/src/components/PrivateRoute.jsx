import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ allowedRoles }) => {
  const user = useSelector((state) => state.user.currentUser);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (!allowedRoles.includes(user.userType)) {
    return <Navigate to={user.userType === "restaurant" ? "/dashboard/restaurant" : "/dashboard/ngo"} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
