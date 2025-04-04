import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setLoading, setError } from "../redux/user/userslice.js";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading());

    try {
      const response = await fetch("/backend/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Sign-in failed");
      }
      console.log("formdfata",data)

      dispatch(setUser(data));
      console.log("User set in Redux:", data);

      // Redirect based on user type
      if (data.user.userType === "restaurant") {
        navigate("/dashboard/restaurant");
      } else if (data.user.userType === "ngo") {
        navigate("/dashboard/ngo");
      }
      
    } catch (err) {
      dispatch(setError(err.message));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-pink-500">Sign In</h1>
      <form className="bg-white p-8 rounded-lg shadow-md w-96 mt-6" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-2 mb-4 rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border p-2 mb-4 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-pink-500 text-white py-3 rounded-lg"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <p className="text-sm text-gray-500">
  <Link to="/forgot-password" className="text-blue-500 hover:underline ">
    Forgot Password?
  </Link>
</p>
      </form>
    </div>
  );
};

export default SignIn;
