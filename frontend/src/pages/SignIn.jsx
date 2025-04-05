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

      dispatch(setUser(data));

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-white to-blue-200 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-3xl shadow-lg p-10 border border-gray-200"
      >
        <h2 className="text-3xl font-extrabold text-center text-pink-500 mb-8">
          Sign In
        </h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none"
          required
        />

        <button
          type="submit"
          className="w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold py-3 rounded-xl transition duration-300"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        <div className="mt-4 text-center">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-500 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
