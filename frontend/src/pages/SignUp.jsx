import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl shadow-lg w-96">
        <h2 className="text-3xl font-bold mb-6 text-center text-pink-600">Sign Up</h2>
        <input
          type="email"
          name="email"
          placeholder="Write your email"
          required
          onChange={handleChange}
          className="border p-3 w-full rounded mb-4"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          onChange={handleChange}
          className="border p-3 w-full rounded mb-4"
        />
        <select
          name="userType"
          required
          onChange={handleChange}
          className="border p-3 w-full rounded mb-6"
        >
          <option value="">--Select Your Type--</option>
          <option value="restaurant">Restaurant</option>
          <option value="ngo">NGO</option>
        </select>
        <button type="submit" className="bg-pink-500 text-white py-3 w-full rounded hover:bg-pink-600">
          Next →
        </button>
      </form>
    </div>
  );
};

export default SignUp;
