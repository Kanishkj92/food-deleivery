import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/user/userslice.js";

const RestaurantDashboard = () => {
  const currentUser = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = currentUser?.token;
  const restaurantId = currentUser.user._id;

  const [formData, setFormData] = useState({
    name: "",
    ingredients: "",
    type: "Vegetarian",
    quantity: 1,
  });

  const [orders, setOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [listings, setListings] = useState([]);
const [showListings, setShowListings] = useState(false);


  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantOrders();
      const interval = setInterval(fetchRestaurantOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [restaurantId]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/signin");
  };
  const fetchListings = async () => {
    try {
      const res = await fetch(`/backend/food/listings/${restaurantId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch listings");
      setListings(data);
    } catch (err) {
      alert(err.message);
    }
  };
  const deleteListing = async (foodId) => {
    try {
      const res = await fetch(`/backend/food/delete/${foodId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete listing");
      }
  
      // Update state to remove deleted listing
      setListings((prevListings) => prevListings.filter((item) => item._id !== foodId));
  
      alert("Listing deleted successfully");
    } catch (err) {
      alert(err.message);
    }
  };
  

  const fetchRestaurantOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/backend/food/history/${restaurantId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch orders");

      const now = new Date();
      const current = [];
      const past = [];

      data.forEach((order) => {
        const createdTime = new Date(order.updatedAt);
        const pickupDeadline = new Date(createdTime.getTime() + 60 * 60 * 1000);
        if (pickupDeadline > now) current.push(order);
        else past.push(order);
      });

      setOrders(current);
      setPastOrders(past);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleQuantityChange = (amount) =>
    setFormData((prev) => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + amount),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/backend/food/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, restaurantId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add food");
      alert("Food item added successfully!");
      fetchRestaurantOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const getPickupTime = (createdAt) => {
    const pickup = new Date(new Date(createdAt).getTime() + 60 * 60 * 1000);
    return pickup.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-blue-100 p-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between mb-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-pink-600">
          {currentUser.user?.name}'s Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="mt-4 sm:mt-0 bg-red-500 text-white px-6 py-2 rounded-xl hover:bg-red-600 transition"
        >
          Sign Out
        </button>
      </div>

      {/* Add Food Form */}
      <div className="bg-white p-6 rounded-3xl shadow-lg max-w-3xl mx-auto mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add Food Item</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Food Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full mb-4 p-3 border rounded-xl focus:ring-2 focus:ring-pink-300"
            required
          />
          <input
            type="text"
            name="ingredients"
            placeholder="Ingredients"
            value={formData.ingredients}
            onChange={handleChange}
            className="w-full mb-4 p-3 border rounded-xl focus:ring-2 focus:ring-pink-300"
            required
          />
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full mb-4 p-3 border rounded-xl"
          >
            <option value="Vegetarian">Vegetarian</option>
            <option value="Non-Vegetarian">Non-Vegetarian</option>
          </select>
          <div className="flex items-center mb-4">
            <span className="mr-3 text-gray-600">Quantity:</span>
            <button
              type="button"
              onClick={() => handleQuantityChange(-1)}
              className="bg-gray-300 px-4 py-1 rounded-l-xl"
            >
              -
            </button>
            <span className="px-6 py-1 bg-gray-100">{formData.quantity}</span>
            <button
              type="button"
              onClick={() => handleQuantityChange(1)}
              className="bg-gray-300 px-4 py-1 rounded-r-xl"
            >
              +
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-pink-500 text-white font-semibold py-3 rounded-xl hover:bg-pink-600 transition"
          >
            Add Food
          </button>
          <button
  onClick={() => {
    setShowListings(!showListings);
    if (!showListings) fetchListings();
  }}
  className="w-full bg-purple-500 text-white font-semibold py-3 rounded-xl hover:bg-purple-600 transition mt-4"
>
  {showListings ? "Hide Listings" : "View Your Listings"}
</button>
        </form>
      </div>
      {showListings && (
  <div className="mt-6 bg-white p-6 rounded-3xl shadow-lg max-w-6xl mx-auto">
    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Listings</h2>
    {listings.length ? (
      <ul className="space-y-4">
        {listings.map((item) => (
          <li key={item._id} className="p-4 border rounded-xl bg-gray-50">
            <h3 className="text-lg font-bold text-pink-600">{item.name}</h3>
            <p>Ingredients: {item.ingredients}</p>
            <p>Type: {item.type}</p>
            <p>Quantity: {item.quantity}</p>
            <p>Status: {item.status}</p>
            <p>Created At: {new Date(item.createdAt).toLocaleString()}</p>
            <button
      onClick={() => deleteListing(item._id)}
      className="mt-2 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
    >
      Delete
    </button>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500">No listings found.</p>
    )}
  </div>
)}


      {/* Current Orders */}
      <div className="bg-white p-6 rounded-3xl shadow-lg max-w-6xl mx-auto mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Current Orders</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : orders.length ? (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order._id} className="p-4 border rounded-xl bg-gray-50">
                <h3 className="text-lg font-bold text-pink-600">{order.name}</h3>
                <p>Quantity: {order.quantity}</p>
                <p>Ordered by: {order.ngo?.name || "Unknown"}</p>
                <p>Pickup Time: {getPickupTime(order.updatedAt)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No current orders.</p>
        )}
      </div>

      {/* Past Orders */}
      <div className="bg-white p-6 rounded-3xl shadow-lg max-w-6xl mx-auto mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Past Orders</h2>
        {pastOrders.length ? (
          <ul className="space-y-4">
            {pastOrders.map((order) => (
              <li key={order._id} className="p-4 border rounded-xl bg-gray-100">
                <h3 className="text-lg font-bold text-gray-800">{order.name}</h3>
                <p>Quantity: {order.quantity}</p>
                <p>Ordered by: {order.ngo?.name || "Unknown"}</p>
                <p>Picked At: {getPickupTime(order.updatedAt)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No past orders.</p>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;
