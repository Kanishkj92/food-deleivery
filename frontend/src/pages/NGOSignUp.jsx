import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setLoading, setError } from "../redux/user/userSlice";
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

  // Get email & password from SignUp page
  useEffect(() => {
    if (location.state) {
      console.log("Received data from SignUp page:", location.state);
      setFormData((prev) => ({
        ...prev,
        email: location.state.email,
        password: location.state.password,
      }));
    } else {
      console.log("No data received from SignUp page");
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-pink-500">Sign Up as NGO</h1>
      <form className="bg-white p-8 rounded-lg shadow-md w-96 mt-6" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          className="w-full border p-2 mb-4 rounded"
          disabled
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          className="w-full border p-2 mb-4 rounded"
          disabled
        />
        <input
          type="text"
          name="name"
          placeholder="NGO Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-2 mb-4 rounded"
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="NGO Phone No."
          value={formData.phone}
          onChange={handleChange}
          className="w-full border p-2 mb-4 rounded"
          required
        />
        <input
          type="text"
          name="darpanId"
          placeholder="Enter Your DARPAN ID"
          value={formData.darpanId}
          onChange={handleChange}
          className="w-full border p-2 mb-4 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-pink-500 text-white py-3 rounded-lg"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default NgoSignUp;
