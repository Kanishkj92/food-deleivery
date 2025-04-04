import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {logout} from '../redux/user/userslice.js'

const NgoDashboard = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [bookedOrders, setBookedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch=useDispatch()
  const user = useSelector((state) => state.user.user);
  const token = user?.token;

  const handleLogout = () => {
      dispatch(logout());
      navigate("/signin");
    };

  useEffect(() => {
    fetchFoodItems();
    fetchBookedOrders();
    const interval = setInterval(() => {
      fetchFoodItems();
      fetchBookedOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchFoodItems = async () => {
    try {
      const response = await fetch("/backend/food/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setFoodItems(data);
    } catch (error) {
      setError("Error fetching food items.");
    }
  };

  const fetchBookedOrders = async () => {
    try {
      const response = await fetch(`/backend/food/orders/${user.user._id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setBookedOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (error) {
      setError("Error fetching booked orders.");
    }
  };

  const bookFood = async (foodId) => {
    if (!user || !user.token) {
      setError("User not authenticated. Please log in.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/backend/food/book/${foodId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          foodId,
          ngoId: user.user._id,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Booking failed");

      alert("Food booked successfully!");
      fetchFoodItems();
      fetchBookedOrders();
    } catch (error) {
      setError(error.message || "Error booking food.");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (foodId) => {
    try {
      const response = await fetch(`/backend/food/cancel/${foodId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Cancel failed");
      alert("Order cancelled successfully");
      fetchFoodItems();
      fetchBookedOrders();
    } catch (error) {
      setError(error.message || "Error cancelling order.");
    }
  };

  const canCancel = (orderTime) => {
    if (!orderTime) return false;

    const now = new Date();
    const createdAt = new Date(orderTime);
    const diffInSeconds = (now - createdAt) / 1000;

    return diffInSeconds <= 60;
  };

  const getPickupTime = (createdAt) => {
    const pickup = new Date(createdAt);
    pickup.setHours(pickup.getHours() + 1);
    return pickup.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-green-600 mb-6">NGO Dashboard</h1>
      <div className="flex justify-between mt-5">
        <span onClick={handleLogout} className='text-red-700 cursor-pointer'>Sign Out</span>
      </div>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Available Food Section */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Food</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {foodItems.length > 0 ? (
          foodItems.map((food) => (
            <div key={food._id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-800">{food.name}</h2>
              <p className="text-gray-600"><b>Ingredients:</b> {food.ingredients}</p>
              <p className="text-gray-600"><b>Type:</b> {food.type}</p>
              <p className="text-gray-600"><b>Quantity:</b> {food.quantity}</p>

              <button 
                onClick={() => bookFood(food._id)}
                disabled={loading}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 w-full"
              >
                {loading ? "Booking..." : "Book Now"}
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-3">No available food items.</p>
        )}
      </div>

      {/* Booked Orders Section */}
      <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">Your Booked Orders</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(bookedOrders) && bookedOrders.length > 0 ? (
          bookedOrders.map((orders, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-800">{orders?.name || "No Name Available"}</h2>
              <p className="text-gray-600"><b>Restaurant:</b> {orders?.restaurant?.name || "N/A"}</p>
              <p className="text-gray-600"><b>Ingredients:</b> {orders?.ingredients || "N/A"}</p>
              <p className="text-gray-600"><b>Type:</b> {orders?.type || "N/A"}</p>
              <p className="text-gray-600"><b>Quantity:</b> {orders?.quantity || "N/A"}</p>
              <p className="text-gray-600"><b>Status:</b> {orders?.status || "N/A"}</p>
              <p className="text-gray-600"><b>Pickup By:</b> {getPickupTime(orders?.updatedAt)}</p>

              {canCancel(orders.updatedAt) && (
                <button 
                  onClick={() => cancelBooking(orders._id)}
                  className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 w-full"
                >
                  Cancel Order
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-3">No booked orders found.</p>
        )}
      </div>
    </div>
  );
};

export default NgoDashboard;
