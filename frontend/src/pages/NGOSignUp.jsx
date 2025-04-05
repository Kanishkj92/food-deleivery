import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setLoading, setError } from "../redux/user/userslice.js";
import { useNavigate, useLocation } from "react-router-dom";

const NgoSignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    darpanId: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (location.state) {
      setFormData((prev) => ({
        ...prev,
        email: location.state.email,
        password: location.state.password,
      }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));

    try {
      const response = await fetch("/backend/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, userType: "ngo" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      dispatch(setUser(data));
      navigate("/signin");
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
          Sign Up as NGO
        </h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          disabled
          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-xl bg-gray-100 text-gray-500"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          disabled
          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-xl bg-gray-100 text-gray-500"
        />

        <input
          type="text"
          name="name"
          placeholder="NGO Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none"
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none"
          required
        />

        <input
          type="text"
          name="darpanId"
          placeholder="DARPAN ID"
          value={formData.darpanId}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-6 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none"
          required
        />

        <button
          type="submit"
          className="w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold py-3 rounded-xl transition duration-300"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </form>
    </div>
  );
};

export default NgoSignUp;
