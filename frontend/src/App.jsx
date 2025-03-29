import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import SignUp from "./pages/SignUp";
import RestaurantSignUp from "./pages/RestaurantSignUp";
import NgoSignUp from "./pages/NgoSignUp";
import SignIn from "./pages/SignIn";
import RestaurantDashboard from "./pages/RestaurantDashboard";
//import NgoDashboard from "./pages/NgoDashboard";

const App = () => {
  // Fetch the current user from Redux store
  const user = useSelector((state) => state.user.currentUser);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<SignUp />} />
        <Route path="/signup/restaurant" element={<RestaurantSignUp />} />
        <Route path="/signup/ngo" element={<NgoSignUp />} />
        <Route path="/signin" element={<SignIn />} />

        {/* Role-Based Private Routes */}
        <Route
          path="/dashboard/restaurant"
          element={user && user.userType === "restaurant" ? <RestaurantDashboard /> : <Navigate to="/signin" />}
        />
       

        {/* Redirect to SignIn if route not found */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
