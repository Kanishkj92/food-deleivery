import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import SignUp from "./pages/SignUp";
import RestaurantSignUp from "./pages/RestaurantSignUp";
import NgoSignUp from "./pages/NGOSignUp";
import SignIn from "./pages/SignIn";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import NgoDashboard from "./pages/NGODashboard";
import { useEffect } from "react";
//import NgoDashboard from "./pages/NgoDashboard";

const App = () => {
  // Fetch the current user from Redux store
  const user = useSelector((state) => state.user.user);
  console.log(user)
  useEffect(() => {
    console.log('User state:', user); 
   // Log the user state on each render
  }, [user]);


  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<SignUp />} />
        <Route path="/signup/restaurant" element={<RestaurantSignUp />} />
        <Route path="/signup/ngo" element={<NgoSignUp />} />
        <Route path="/signin" element={<SignIn />} />

        <Route path="/dashboard/restaurant" element={
        user && user.user.userType
      ? user.user.userType === "restaurant"
        ? <RestaurantDashboard />
        : <Navigate to="/signin" />
      : <div>Loading...</div>
  }
/>
<Route path="/dashboard/ngo" element={
        user && user.user.userType
      ? user.user.userType === "ngo"
        ? <NgoDashboard />
        : <Navigate to="/signin" />
      : <div>Loading...</div>
  }
/>

        {/* Redirect to SignIn if route not found */}
   
      </Routes>
    </Router>
  );
};

export default App;
