import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.userType === 'restaurant') {
      navigate('/signup/restaurant', { state: { email: formData.email, password: formData.password } });
    } else if (formData.userType === 'ngo') {
      navigate('/signup/ngo', { state: { email: formData.email, password: formData.password } });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-white to-blue-200 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-3xl shadow-lg p-10 border border-gray-200"
      >
        <h2 className="text-4xl font-extrabold text-center text-pink-500 mb-8">Sign Up</h2>

        <label className="block text-gray-700 font-medium mb-1">Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          required
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none"
        />

        <label className="block text-gray-700 font-medium mb-1">Password</label>
        <input
          type="password"
          name="password"
          placeholder="Create a password"
          required
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none"
        />

        <label className="block text-gray-700 font-medium mb-1">Select Role</label>
        <select
          name="userType"
          required
          onChange={handleChange}
          className="w-full px-4 py-3 mb-6 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-300 outline-none"
        >
          <option value="">--Select Your Type--</option>
          <option value="restaurant">Restaurant</option>
          <option value="ngo">NGO</option>
        </select>

        <button
          type="submit"
          className="w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold py-3 rounded-xl transition duration-300"
        >
          Next →
        </button>

        <div className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/signin" className="text-blue-600 font-medium hover:underline">
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
